# One Day Pub 작업 완료 시 체크리스트

## 📋 코드 작성 완료 후 필수 단계

### 1. 코드 품질 검사

```bash
# 린트 검사 및 자동 수정
pnpm lint:fix

# 코드 포매팅
pnpm format

# 타입 검사 (빌드를 통해 확인)
pnpm build
```

### 2. 테스트 실행 (해당하는 경우)

```bash
# API 변경사항이 있는 경우
pnpm --filter @one-day-pub/api test

# E2E 테스트 (중요한 기능 변경 시)
pnpm --filter @one-day-pub/api test:e2e
```

### 3. 데이터베이스 마이그레이션 (필요한 경우)

```bash
# 엔티티 변경 시 마이그레이션 생성
pnpm migration:generate -- src/migrations/YourChangeDescription

# 마이그레이션 적용
pnpm migration:run
```

### 4. 개발 서버 테스트

```bash
# 전체 앱 실행하여 동작 확인
pnpm dev

# 각 서비스별 확인
# - 웹: http://localhost:3000
# - API: http://localhost:3001/api (Swagger)
```

### 5. 빌드 검증

```bash
# 프로덕션 빌드 테스트
pnpm build

# 빌드된 앱 실행 테스트
pnpm start
```

## 🚨 오류 해결 가이드

### 린트 오류 해결

```bash
# 자동 수정 가능한 오류들
pnpm lint:fix

# ESLint 규칙별 해결
# - import/order: import 순서 정렬
# - @typescript-eslint/no-unused-vars: 미사용 변수 제거 또는 _ prefix 추가
# - @typescript-eslint/no-explicit-any: any 타입 대신 구체적 타입 사용
```

### 타입 오류 해결

```bash
# interface 패키지 빌드
pnpm --filter @one-day-pub/interface build

# 타입 정의 업데이트 후 의존 패키지 재시작
pnpm dev
```

### 데이터베이스 오류 해결

```bash
# 데이터베이스 재시작
pnpm db:restart

# 연결 확인
pnpm db:status

# 마이그레이션 상태 확인
pnpm migration:show
```

## 📝 커밋 전 최종 점검

### Git Hook 자동 검사 (Husky + lint-staged)

- 커밋 시 자동으로 실행됨
- 변경된 파일에 대해 ESLint + Prettier 적용
- 통과하지 못하면 커밋 실패

### 수동 최종 점검

```bash
# 1. 모든 변경사항 스테이징
git add .

# 2. 커밋 메시지 작성 (영어)
git commit -m "feat: add user authentication system"

# 3. 빌드 및 테스트 최종 확인
pnpm build
pnpm lint
pnpm --filter @one-day-pub/api test
```

## 🔄 PR/MR 제출 전 체크리스트

### 필수 확인 사항

- [ ] 린트 검사 통과 (`pnpm lint`)
- [ ] 포맷 검사 통과 (`pnpm format:check`)
- [ ] 빌드 성공 (`pnpm build`)
- [ ] 개발 서버 정상 동작 (`pnpm dev`)
- [ ] 관련 테스트 통과 (해당하는 경우)
- [ ] 마이그레이션 정상 적용 (DB 변경 시)
- [ ] API 문서 업데이트 (API 변경 시)

### 선택적 확인 사항

- [ ] 성능 테스트 (대용량 데이터 처리 시)
- [ ] 크로스 브라우저 테스트 (UI 변경 시)
- [ ] 모바일 반응형 테스트 (프론트엔드 변경 시)
- [ ] 보안 검토 (인증/권한 관련 변경 시)
