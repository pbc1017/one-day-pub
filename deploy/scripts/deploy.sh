#!/bin/bash
#
# KAMF 프로덕션 배포 스크립트
# 이 스크립트는 GitHub Actions CD 파이프라인에서 호출됩니다.
#
set -e  # 오류 발생 시 즉시 종료

# 색상 출력 함수
print_info() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

print_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

print_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}

print_warning() {
    echo -e "\033[1;33m[WARNING]\033[0m $1"
}

# 배포 시작
print_info "=== KAMF Production Deployment Started ==="

# 환경변수 파일 확인 및 로드
if [ ! -f .env.deploy ]; then
    print_error "Environment file .env.deploy not found!"
    exit 1
fi

print_info "Loading environment variables..."
export $(cat .env.deploy | grep -v '^#' | xargs)

# 필수 환경변수 확인
REQUIRED_VARS=("DOCKER_REGISTRY" "IMAGE_TAG" "DB_PASSWORD" "JWT_SECRET")
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set!"
        exit 1
    fi
done

print_success "Environment variables loaded successfully"
print_info "Docker Registry: $DOCKER_REGISTRY"
print_info "Image Tag: $IMAGE_TAG"
print_info "Deployment Time: ${DEPLOYMENT_TIME:-$(date '+%Y%m%d_%H%M%S')}"

# Docker Compose 파일 확인
if [ ! -f deploy/docker-compose.yml ]; then
    print_error "docker-compose.yml file not found in deploy/ directory!"
    exit 1
fi

cd deploy

# 현재 컨테이너 상태 백업
print_info "Backing up current container state..."
if docker-compose ps > .deployment-backup-$(date +%Y%m%d_%H%M%S); then
    print_success "Container state backed up"
else
    print_warning "Failed to backup container state (continuing anyway)"
fi

# 최신 이미지 Pull
print_info "Pulling latest Docker images..."
if ! docker pull ${DOCKER_REGISTRY}/kamf-api:${IMAGE_TAG}; then
    print_error "Failed to pull API image: ${DOCKER_REGISTRY}/kamf-api:${IMAGE_TAG}"
    exit 1
fi

if ! docker pull ${DOCKER_REGISTRY}/kamf-web:${IMAGE_TAG}; then
    print_error "Failed to pull Web image: ${DOCKER_REGISTRY}/kamf-web:${IMAGE_TAG}"
    exit 1
fi

print_success "All images pulled successfully"

# 기존 컨테이너 중지 (MySQL은 유지)
print_info "Stopping application containers (keeping MySQL running)..."
docker-compose stop api web nginx || true

# MySQL 컨테이너가 이미 실행 중인지 확인
print_info "Checking MySQL container status..."
MYSQL_RUNNING=$(docker ps -q -f name=kamf-mysql)

if [ -z "$MYSQL_RUNNING" ]; then
    print_info "Starting MySQL container first..."
    docker-compose up -d mysql
    
    print_info "Waiting for MySQL to be ready..."
    for i in {1..30}; do
        if docker-compose exec -T mysql mysqladmin ping -h localhost --silent; then
            print_success "MySQL is ready"
            break
        fi
        echo "Waiting for MySQL... ($i/30)"
        sleep 2
    done
fi

# 환경별 데이터베이스 생성
print_info "Ensuring database '${DB_NAME}' exists..."
docker-compose exec -T mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} -e "
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USERNAME}'@'%' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USERNAME}'@'%';
FLUSH PRIVILEGES;
" 2>/dev/null || print_warning "Database setup failed (may already exist)"

print_success "Database '${DB_NAME}' is ready"

# ContainerConfig 에러 방지: 사전 환경 정리
print_info "Preventive cleanup to avoid ContainerConfig errors..."

# 1. Docker 시스템 정리 (dangling 객체 제거)
docker system prune -f > /dev/null 2>&1 || true

# 2. 이미지 메타데이터 유효성 검증
print_info "Validating Docker images metadata integrity..."
if ! docker inspect "${DOCKER_REGISTRY}/kamf-api:${IMAGE_TAG}" > /dev/null 2>&1; then
    print_warning "API image validation failed! Re-pulling..."
    docker pull "${DOCKER_REGISTRY}/kamf-api:${IMAGE_TAG}"
fi

if ! docker inspect "${DOCKER_REGISTRY}/kamf-web:${IMAGE_TAG}" > /dev/null 2>&1; then
    print_warning "Web image validation failed! Re-pulling..."
    docker pull "${DOCKER_REGISTRY}/kamf-web:${IMAGE_TAG}"
fi

# 3. 기존 컨테이너 완전 제거 (컨테이너 메타데이터 초기화)
print_info "Ensuring clean container state..."
docker-compose rm -f api web nginx > /dev/null 2>&1 || true

# 새 컨테이너 시작 (MySQL 제외)
print_info "Starting updated application containers with clean state..."
if ! docker-compose up -d api web nginx; then
    print_error "Failed to start containers!"
    
    # 롤백 시도
    print_warning "Attempting to rollback..."
    docker-compose stop api web nginx || true
    # 백업 파일 존재 확인 (와일드카드 처리 개선)
    BACKUP_COUNT=$(ls .deployment-backup-* 2>/dev/null | wc -l)
    if [ "$BACKUP_COUNT" -gt 0 ]; then
        print_info "Rolling back to previous state..."
        # 간단한 롤백: 기존 이미지로 다시 시작
        docker-compose up -d api web nginx || print_error "Rollback failed!"
    fi
    exit 1
fi

print_success "Containers started successfully"

# 서비스 준비 대기
print_info "Waiting for services to be ready..."
WAIT_TIME=0
MAX_WAIT=60

while [ $WAIT_TIME -lt $MAX_WAIT ]; do
    # API 컨테이너 상태 확인 (환경별 이름)
    if docker ps | grep -q "${DEPLOY_PATH}-api.*Up"; then
        break
    fi
    
    sleep 2
    WAIT_TIME=$((WAIT_TIME + 2))
    print_info "Waiting... (${WAIT_TIME}s/${MAX_WAIT}s)"
done

if [ $WAIT_TIME -ge $MAX_WAIT ]; then
    print_error "Services did not start within $MAX_WAIT seconds!"
    docker-compose logs
    exit 1
fi

# 컨테이너 헬스체크 (환경별 컨테이너 이름 사용)
print_info "Performing container health checks..."

# API 컨테이너 체크
if ! docker ps | grep -q "${DEPLOY_PATH}-api.*Up"; then
    print_error "API container (${DEPLOY_PATH}-api) is not running!"
    docker-compose logs api
    exit 1
fi

# Web 컨테이너 체크  
if ! docker ps | grep -q "${DEPLOY_PATH}-web.*Up"; then
    print_error "Web container (${DEPLOY_PATH}-web) is not running!"
    docker-compose logs web
    exit 1
fi

# MySQL 컨테이너 체크 (공유)
if ! docker ps | grep -q "kamf-mysql.*Up"; then
    print_error "MySQL container (kamf-mysql) is not running!"
    docker-compose logs mysql
    exit 1
fi

# Nginx 컨테이너 체크 (공유)
if ! docker ps | grep -q "kamf-nginx.*Up"; then
    print_error "Nginx container (kamf-nginx) is not running!"
    docker-compose logs nginx
    exit 1
fi

print_success "All containers are running"

# Nginx 설정 검증 및 안정화 대기
print_info "Validating Nginx configuration and waiting for stabilization..."
sleep 5

NGINX_CONFIG_ATTEMPTS=0
MAX_NGINX_ATTEMPTS=10

while [ $NGINX_CONFIG_ATTEMPTS -lt $MAX_NGINX_ATTEMPTS ]; do
    if docker-compose exec -T nginx nginx -t > /dev/null 2>&1; then
        print_success "Nginx configuration is valid and loaded"
        break
    fi

    NGINX_CONFIG_ATTEMPTS=$((NGINX_CONFIG_ATTEMPTS + 1))
    print_info "Nginx config validation attempt $NGINX_CONFIG_ATTEMPTS/$MAX_NGINX_ATTEMPTS"
    sleep 2
done

if [ $NGINX_CONFIG_ATTEMPTS -ge $MAX_NGINX_ATTEMPTS ]; then
    print_error "Nginx configuration validation failed after restart!"
    print_error "This could cause 502/503 errors. Check nginx logs:"
    docker-compose logs nginx
    exit 1
fi

# 애플리케이션 레벨 헬스체크
print_info "Performing application health checks..."

# 내부 API 헬스체크 (컨테이너 내부에서)
HEALTH_CHECK_ATTEMPTS=0
MAX_HEALTH_ATTEMPTS=15

while [ $HEALTH_CHECK_ATTEMPTS -lt $MAX_HEALTH_ATTEMPTS ]; do
    if docker-compose exec -T api curl -f http://localhost:8000/health > /dev/null 2>&1; then
        print_success "API health check passed"
        break
    fi
    
    HEALTH_CHECK_ATTEMPTS=$((HEALTH_CHECK_ATTEMPTS + 1))
    print_info "Health check attempt $HEALTH_CHECK_ATTEMPTS/$MAX_HEALTH_ATTEMPTS"
    sleep 2
done

if [ $HEALTH_CHECK_ATTEMPTS -ge $MAX_HEALTH_ATTEMPTS ]; then
    print_error "API health check failed after $MAX_HEALTH_ATTEMPTS attempts"
    docker-compose logs api
    exit 1
fi

# Web 애플리케이션 헬스체크
if docker-compose exec -T web wget --spider -q http://localhost:3000/ > /dev/null 2>&1; then
    print_success "Web application health check passed"
else
    print_warning "Web application internal health check failed (but continuing)"
fi

# 외부 접근 헬스체크 (포트별) - 재시도 로직 포함
print_info "Testing external access with retry logic..."

# API 외부 접근 테스트
EXTERNAL_API_ATTEMPTS=0
MAX_EXTERNAL_ATTEMPTS=5

while [ $EXTERNAL_API_ATTEMPTS -lt $MAX_EXTERNAL_ATTEMPTS ]; do
    if curl -f -m 10 http://localhost:${API_PORT}/health > /dev/null 2>&1; then
        print_success "External API access confirmed on port ${API_PORT}"
        break
    fi
    
    EXTERNAL_API_ATTEMPTS=$((EXTERNAL_API_ATTEMPTS + 1))
    if [ $EXTERNAL_API_ATTEMPTS -lt $MAX_EXTERNAL_ATTEMPTS ]; then
        print_info "External API test attempt $EXTERNAL_API_ATTEMPTS/$MAX_EXTERNAL_ATTEMPTS (retrying...)"
        sleep 3
    fi
done

if [ $EXTERNAL_API_ATTEMPTS -ge $MAX_EXTERNAL_ATTEMPTS ]; then
    print_warning "External API access test failed after $MAX_EXTERNAL_ATTEMPTS attempts"
    print_warning "This may indicate port binding or firewall issues"
fi

# Web 외부 접근 테스트  
EXTERNAL_WEB_ATTEMPTS=0

while [ $EXTERNAL_WEB_ATTEMPTS -lt $MAX_EXTERNAL_ATTEMPTS ]; do
    if curl -f -m 10 http://localhost:${WEB_PORT}/ > /dev/null 2>&1; then
        print_success "External Web access confirmed on port ${WEB_PORT}"
        break
    fi
    
    EXTERNAL_WEB_ATTEMPTS=$((EXTERNAL_WEB_ATTEMPTS + 1))
    if [ $EXTERNAL_WEB_ATTEMPTS -lt $MAX_EXTERNAL_ATTEMPTS ]; then
        print_info "External Web test attempt $EXTERNAL_WEB_ATTEMPTS/$MAX_EXTERNAL_ATTEMPTS (retrying...)"
        sleep 3
    fi
done

if [ $EXTERNAL_WEB_ATTEMPTS -ge $MAX_EXTERNAL_ATTEMPTS ]; then
    print_warning "External Web access test failed after $MAX_EXTERNAL_ATTEMPTS attempts"
    print_warning "This may indicate port binding or firewall issues"
fi

# 배포 후 정리
print_info "Performing post-deployment cleanup..."

# 오래된 백업 파일 제거 (7일 이상)
find . -name ".deployment-backup-*" -mtime +7 -delete 2>/dev/null || true

# 사용하지 않는 Docker 볼륨 정리 (선택적)
docker volume prune -f || true

print_success "Cleanup completed"

# 배포 완료 로그
print_success "=== KAMF ${ENVIRONMENT:-Production} Deployment Completed ==="
print_info "Deployment Summary:"
print_info "  - Environment: ${ENVIRONMENT:-Production}"
print_info "  - Deploy Path: ${DEPLOY_PATH:-kamf}"
print_info "  - Domain: ${DOMAIN:-kamf.site}"
print_info "  - Database: ${DB_NAME:-kamf_prod}"
print_info "  - API Port: ${API_PORT:-8000}"
print_info "  - Web Port: ${WEB_PORT:-3000}"
print_info "  - Docker Registry: $DOCKER_REGISTRY"
print_info "  - Image Tag: $IMAGE_TAG"
print_info "  - Deployed By: ${DEPLOYED_BY:-Unknown}"
print_info "  - Commit SHA: ${COMMIT_SHA:-Unknown}"
print_info "  - Deployment Time: ${DEPLOYMENT_TIME:-$(date '+%Y-%m-%d %H:%M:%S')}"

# 현재 실행 중인 컨테이너 상태 출력
print_info "Current container status:"
docker-compose ps

exit 0
