# One Day Pub - Modern ESM Monorepo

pnpm과 TypeScript를 사용한 현대적인 ESM 기반 모노레포입니다.

## 📦 프로젝트 구조

```
one-day-pub/
├── apps/
│   ├── web/                    # Next.js 14 프론트엔드 앱
│   └── api/                    # NestJS 백엔드 API 서버
├── packages/
│   └── interface/              # 공유 타입 및 인터페이스
├── package.json                # 루트 워크스페이스 설정
├── pnpm-workspace.yaml        # pnpm 워크스페이스 정의
├── .eslintrc.json             # ESLint 설정
├── .prettierrc.json           # Prettier 설정
└── tsconfig.json              # TypeScript 베이스 설정
```

## 🚀 시작하기

### 사전 요구사항

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 설치

```bash
# 의존성 설치
pnpm install

# 전체 빌드
pnpm build
```

## 📝 사용 가능한 스크립트

### 루트 레벨 스크립트

```bash
# 개발 서버 실행 (모든 앱)
pnpm dev

# 전체 빌드
pnpm build

# 전체 시작
pnpm start

# 린트 검사
pnpm lint

# 린트 자동 수정
pnpm lint:fix

# 코드 포매팅
pnpm format

# 포맷 검사
pnpm format:check

# 캐시 정리
pnpm clean
```

### 특정 패키지 스크립트

```bash
# 웹 앱만 개발 서버 실행
pnpm --filter @one-day-pub/web dev

# API 서버만 개발 서버 실행
pnpm --filter @one-day-pub/api dev

# 인터페이스 패키지만 빌드
pnpm --filter @one-day-pub/interface build
```

## 🏗️ 패키지 상세

### `apps/web` - Next.js Frontend

- **프레임워크**: Next.js 14 (App Router)
- **스타일링**: Tailwind CSS
- **포트**: 3000 (기본값)
- **기능**:
  - 현대적인 React 18 기반
  - 타입 안전한 API 호출
  - `@one-day-pub/interface` 패키지 사용

### `apps/api` - NestJS Backend

- **프레임워크**: NestJS
- **포트**: 3001 (기본값)
- **API 문서**: http://localhost:3001/api (Swagger)
- **기능**:
  - RESTful API
  - 사용자 관리 (Users)
  - 인증 (Auth)
  - `@one-day-pub/interface` 패키지 사용

### `packages/interface` - Shared Types

- **역할**: 공통 타입 및 인터페이스 정의
- **빌드**: TypeScript로 컴파일
- **포함**:
  - User 관련 타입
  - API 응답 타입
  - 공통 유틸리티 타입

## 🔧 개발 환경 설정

### 환경 변수

각 앱의 `env.example` 파일을 참고하여 환경 변수를 설정하세요:

```bash
# Web App
cp apps/web/env.example apps/web/.env.local

# Server
cp apps/server/env.example apps/server/.env
```

### 개발 서버 실행

```bash
# 모든 앱 동시 실행
pnpm dev

# 또는 개별 실행
pnpm --filter @one-day-pub/web dev     # 웹: http://localhost:3000
pnpm --filter @one-day-pub/api dev     # API: http://localhost:3001
```

## 📚 API 문서

서버가 실행 중일 때 Swagger 문서를 확인할 수 있습니다:
- URL: http://localhost:3001/api
- 사용자 관리 API
- 인증 API

## 🛠️ 코드 품질

### ESLint 및 Prettier

- **ESLint**: 코드 품질 및 스타일 검사
- **Prettier**: 일관된 코드 포맷팅
- **설정**: 루트에서 모든 패키지에 적용

### TypeScript

- **엄격한 타입 검사**
- **공유 타입**: `@one-day-pub/interface` 패키지 통해 타입 안전성 보장
- **Path Mapping**: 절대 경로 import 지원

## 🏃‍♂️ 배포

### 빌드

```bash
# 전체 빌드
pnpm build

# 개별 빌드
pnpm --filter @one-day-pub/web build
pnpm --filter @one-day-pub/api build
```

### 프로덕션 시작

```bash
# 전체 시작
pnpm start

# 개별 시작  
pnpm --filter @one-day-pub/web start
pnpm --filter @one-day-pub/api start
```

## 🤝 기여하기

1. 코드 작성
2. `pnpm lint` 실행하여 린트 검사
3. `pnpm format` 실행하여 코드 포매팅
4. `pnpm build` 실행하여 빌드 테스트

## 📄 라이선스

MIT License