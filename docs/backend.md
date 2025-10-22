# 일일호프 백엔드 구현 계획

> 최종 업데이트: 2025-10-22 (User 기반 설계로 전환)
> SSOT 문서 기반 백엔드 API 및 데이터베이스 설계

---

## 📋 목차

1. [데이터베이스 스키마](#데이터베이스-스키마)
2. [API 스키마](#api-스키마)
3. [페이즈별 구현 계획](#페이즈별-구현-계획)
4. [보안 및 인증](#보안-및-인증)

---

## 데이터베이스 스키마

### 1. users (사용자)

일반 신청자와 관리자를 포함한 모든 사용자 계정

```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role ENUM('APPLICANT', 'ADMIN', 'SUPER_ADMIN') DEFAULT 'APPLICANT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_email (email),
  INDEX idx_role (role)
);
```

**필드 설명:**

- `id`: UUID 기본 키
- `email`: 이메일 (중복 불가)
- `role`: 사용자 역할
  - `APPLICANT`: 일반 신청자 (기본값)
  - `ADMIN`: 관리자
  - `SUPER_ADMIN`: 최고 관리자

### 2. registrations (신청 정보)

신청의 기본 정보를 저장하는 메인 테이블

```sql
CREATE TABLE registrations (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  school ENUM('CNU', 'KAIST') NOT NULL,
  gender ENUM('MALE', 'FEMALE') NOT NULL,
  seat_type ENUM('MEETING', 'GENERAL') NOT NULL,
  time_slot ENUM('TIME_1', 'TIME_2') NOT NULL,
  status ENUM('PENDING', 'PAYMENT_CONFIRMED', 'CANCELLED') DEFAULT 'PENDING',
  seat_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_seat_type_time (seat_type, time_slot),
  INDEX idx_school_gender_time (school, gender, time_slot)
);
```

**필드 설명:**

- `id`: UUID 기본 키
- `user_id`: 사용자 ID (FK to users)
- `school`: 학교 (CNU/KAIST)
- `gender`: 성별 (MALE/FEMALE)
- `seat_type`: 좌석 유형 (MEETING/GENERAL)
- `time_slot`: 타임 (TIME_1/TIME_2)
- `status`: 신청 상태
- `seat_id`: 자유석인 경우 좌석 ID (FK)

**비즈니스 규칙:**

- 한 사용자(email)당 하나의 PENDING/PAYMENT_CONFIRMED 신청만 가능

### 3. registration_members (신청자 정보)

신청자와 동반인의 개인정보를 저장

```sql
CREATE TABLE registration_members (
  id VARCHAR(36) PRIMARY KEY,
  registration_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NULL,
  `order` INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  student_id VARCHAR(20) NOT NULL,
  birth_year INT NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY uk_registration_order (registration_id, `order`),
  INDEX idx_registration (registration_id),
  INDEX idx_user (user_id)
);
```

**필드 설명:**

- `order`: 1 = 신청자, 2 = 동반인
- `user_id`: 사용자 ID (nullable)
  - 신청자(order=1): `registration.user_id`와 동일 (필수)
  - 동반인(order=2): NULL (기본값, 나중에 연결 가능)
- `department`: 학과
- `student_id`: 학번 (KAIST: 8자리, 충남대: 9자리)
- `birth_year`: 출생년도 (4자리)
- `phone_number`: 전화번호

### 4. seats (좌석 마스터)

좌석 정보를 관리하는 마스터 테이블

```sql
CREATE TABLE seats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seat_number VARCHAR(10) UNIQUE NOT NULL,
  table_size INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_active (is_active)
);
```

**필드 설명:**

- `seat_number`: 좌석 번호 (T1, T2, T3, ...)
- `table_size`: 테이블 인원 (4 or 6)
- `is_active`: 활성화 여부

**초기 데이터:**

- 4인석: 8개 (총 32석)
- 6인석: 4개 (총 24석)
- **총 56석** (타임당 남/녀 각 28명)

### 5. email_verifications (이메일 인증)

이메일 인증 코드 관리 (신청, 로그인 모두 사용)

```sql
CREATE TABLE email_verifications (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  purpose ENUM('REGISTRATION', 'LOGIN', 'ADMIN_LOGIN') NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_email_code (email, code, is_verified),
  INDEX idx_expires (expires_at)
);
```

**필드 설명:**

- `code`: 6자리 인증 코드
- `purpose`: 인증 목적
  - `REGISTRATION`: 신청 시 이메일 인증
  - `LOGIN`: 일반 사용자 로그인
  - `ADMIN_LOGIN`: 관리자 로그인
- `is_verified`: 인증 완료 여부
- `is_used`: 사용 완료 여부 (신청 완료 등)
- `expires_at`: 만료 시간 (10분)

### 6. refresh_tokens (리프레시 토큰)

사용자 리프레시 토큰 관리 (일반 사용자 + 관리자)

```sql
CREATE TABLE refresh_tokens (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_user (user_id),
  INDEX idx_revoked_expires (is_revoked, expires_at)
);
```

**필드 설명:**

- `token`: JWT 리프레시 토큰
- `expires_at`: 만료 시간 (30일)
- `is_revoked`: 취소 여부 (로그아웃 시 true)

---

## API 스키마

### Public API (인증 불필요)

#### 1. 신청용 이메일 인증 코드 발송

```http
POST /api/registrations/send-verification-code
```

**Request:**

```typescript
{
  email: string;
}
```

**Response:**

```typescript
// 성공
{
  success: true,
  message: "인증 코드가 발송되었습니다. (유효시간: 10분)"
}

// 중복 신청
{
  success: false,
  error: "DUPLICATE_REGISTRATION",
  message: "이미 신청한 이메일입니다. 로그인하여 신청 내역을 확인하세요."
}
```

#### 2. 이메일 인증 코드 검증

```http
POST /api/registrations/verify-email
```

**Request:**

```typescript
{
  email: string,
  code: string
}
```

**Response:**

```typescript
// 성공
{
  success: true,
  message: "이메일 인증이 완료되었습니다."
}

// 실패
{
  success: false,
  error: "INVALID_CODE",
  message: "인증 코드가 올바르지 않습니다."
}
```

#### 3. 신청 가능 여부 조회

```http
GET /api/registrations/availability
```

**Query Parameters:**

| 파라미터    | 타입    | 필수 | 설명             |
| ----------- | ------- | ---- | ---------------- |
| isMeeting   | boolean | ✅   | 미팅석 여부      |
| school      | string  | ✅   | 'CNU' \| 'KAIST' |
| gender      | string  | ✅   | 'M' \| 'F'       |
| time        | number  | ✅   | 1 \| 2           |
| memberCount | number  | ✅   | 1 \| 2           |

**Response:**

```typescript
{
  isAvailable: boolean;
}
```

#### 4. 일반석 좌석 조회

```http
GET /api/seats/general?time=1
```

**Response:**

```typescript
{
  seats: [
    {
      seatId: number,
      availableCount: number,
      femaleCount: number,
      maleCount: number,
    },
  ];
}
```

#### 5. 신청하기

```http
POST /api/registrations
```

**Request:**

```typescript
{
  email: string,                // 검증된 이메일
  school: "CNU" | "KAIST",
  gender: "M" | "F",
  seatType: "MEETING" | "GENERAL",
  timeSlot: 1 | 2,
  seatId?: number,              // 자유석만
  members: [
    {
      name: string,
      department: string,
      studentId: string,
      birthYear: number,
      phoneNumber: string
    }
  ]
}
```

**비즈니스 로직:**

1. 최근 검증된 `email_verifications` 확인 (30분 이내)
2. `email`로 `users` 테이블에서 User 조회/생성 (role: APPLICANT)
3. 중복 신청 확인
4. `Registration` 생성 (`user_id` 연결)
5. `RegistrationMember` 생성
   - 신청자(order=1): `user_id` 연결
   - 동반인(order=2): `user_id = null`
6. 신청 완료 이메일 발송

**Response:**

```typescript
// 성공
{
  registrationId: string,
  message: "신청이 완료되었습니다."
}

// 좌석 선점 실패
422 {
  message: "이미 선점된 좌석입니다"
}

// 이메일 인증 만료
400 {
  message: "이메일 인증이 만료되었습니다. 다시 인증해주세요."
}
```

---

### Auth API

#### 6. 로그인용 인증 코드 발송

```http
POST /api/auth/send-code
```

**Request:**

```typescript
{
  email: string;
}
```

**Response:**

```typescript
{
  success: true,
  message: "인증 코드가 발송되었습니다."
}
```

#### 7. 로그인 (코드 검증)

```http
POST /api/auth/verify-code
```

**Request:**

```typescript
{
  email: string,
  code: string
}
```

**Response:**

```typescript
{
  accessToken: string,   // 15분
  refreshToken: string,  // 30일
  user: {
    id: string,
    email: string,
    role: "APPLICANT" | "ADMIN" | "SUPER_ADMIN"
  }
}
```

#### 8. Access Token 갱신

```http
POST /api/auth/refresh
```

**Request:**

```typescript
{
  refreshToken: string;
}
```

**Response:**

```typescript
{
  accessToken: string,    // 새 Access Token
  refreshToken: string    // 새 Refresh Token (Rotation)
}
```

#### 9. 로그아웃

```http
POST /api/auth/logout
Authorization: Bearer {accessToken}
```

**Response:**

```typescript
{
  success: boolean;
}
```

---

### My API (로그인 필수 - APPLICANT)

#### 10. 내 신청 목록 조회

```http
GET /api/my/registrations
Authorization: Bearer {accessToken}
```

**Response:**

```typescript
{
  myRegistrations: [
    {
      id: string,
      role: "APPLICANT",
      school: string,
      gender: string,
      seatType: string,
      timeSlot: string,
      status: "PENDING" | "PAYMENT_CONFIRMED" | "CANCELLED",
      seat: { seatNumber: string, tableSize: number } | null,
      members: [
        {
          order: number,
          name: string,
          department: string,
          studentId: string,
          birthYear: number,
          phoneNumber: string
        }
      ],
      createdAt: string
    }
  ],
  companionRegistrations: [  // 내가 동반인으로 참여한 신청
    {
      id: string,
      role: "COMPANION",
      applicantName: string,
      ...
    }
  ]
}
```

#### 11. 신청 수정

```http
PATCH /api/my/registrations/:id
Authorization: Bearer {accessToken}
```

**Request:**

```typescript
{
  seatId?: number,  // 좌석 변경 (자유석만)
  members?: [...]   // 개인정보 수정
}
```

#### 12. 신청 취소

```http
DELETE /api/my/registrations/:id
Authorization: Bearer {accessToken}
```

---

### Admin API (로그인 필수 - ADMIN, SUPER_ADMIN)

#### 13. 전체 신청 목록 조회

```http
GET /api/admin/registrations
Authorization: Bearer {accessToken}
@Roles('ADMIN', 'SUPER_ADMIN')
```

**Query Parameters:**

| 파라미터 | 타입   | 필수 | 설명                                            |
| -------- | ------ | ---- | ----------------------------------------------- |
| page     | number | ❌   | 페이지 번호 (기본값: 1)                         |
| limit    | number | ❌   | 페이지당 개수 (기본값: 20)                      |
| status   | string | ❌   | 'PENDING' \| 'PAYMENT_CONFIRMED' \| 'CANCELLED' |
| seatType | string | ❌   | 'MEETING' \| 'GENERAL'                          |
| timeSlot | string | ❌   | 'TIME_1' \| 'TIME_2'                            |
| school   | string | ❌   | 'CNU' \| 'KAIST'                                |

#### 14. 입금 확인 (상태 변경)

```http
PATCH /api/admin/registrations/:id/status
Authorization: Bearer {accessToken}
@Roles('ADMIN', 'SUPER_ADMIN')
```

**Request:**

```typescript
{
  status: 'PENDING' | 'PAYMENT_CONFIRMED' | 'CANCELLED';
}
```

#### 15. 통계 조회

```http
GET /api/admin/statistics
Authorization: Bearer {accessToken}
@Roles('ADMIN', 'SUPER_ADMIN')
```

**Response:**

```typescript
{
  total: number,
  byStatus: {
    pending: number,
    paymentConfirmed: number,
    cancelled: number
  },
  bySeatType: {
    meeting: number,
    general: number
  },
  byTime: {
    time1: {
      total: number,
      meeting: {
        kaistMale: number,
        kaistFemale: number,
        cnuMale: number,
        cnuFemale: number
      },
      general: {
        male: number,
        female: number
      }
    },
    time2: { /* 동일 구조 */ }
  }
}
```

---

## 페이즈별 구현 계획

### Phase 1: 데이터베이스 및 엔티티 ✅ **완료**

#### 작업 내역

1. ✅ Enum 타입 정의 (7개)
   - `UserRole` (APPLICANT, ADMIN, SUPER_ADMIN)
   - `EmailVerificationPurpose` (REGISTRATION, LOGIN, ADMIN_LOGIN)
   - School, Gender, SeatType, TimeSlot, RegistrationStatus

2. ✅ 엔티티 생성 (6개)
   - `User` (users)
   - `RefreshToken` (refresh_tokens)
   - `EmailVerification` (email_verifications)
   - `Registration` (registrations)
   - `RegistrationMember` (registration_members)
   - `Seat` (seats)

3. ✅ 모듈 구조 생성
   - `user/` 모듈
   - `auth/` 모듈
   - `registration/` 모듈
   - `seat/` 모듈

4. ✅ 시드 데이터
   - 좌석 56석 (4인석 8개 + 6인석 4개 테이블)
   - 관리자 계정 1개

---

### Phase 2: 마이그레이션 및 DB 설정 ✅ **완료**

#### 목표

기존 테이블 제거 및 새로운 스키마 적용

#### 작업 내역

1. ✅ 마이그레이션 생성
   - `1761137256895-InitUserBasedSystem.ts`

2. ✅ 마이그레이션 실행
   - 6개 테이블 생성 완료

3. ✅ 시드 실행
   - 좌석 56석, 관리자 계정 1개

4. ✅ DB 검증
   - 모든 테이블 생성 확인
   - 외래 키 제약조건 확인
   - 인덱스 생성 확인

---

### Phase 3: DTO 및 검증 ✅ **완료** - Zod + nestjs-zod

#### 목표

Zod 스키마를 사용한 타입 정의 및 검증 설정

- Single Source of Truth: 스키마와 타입을 한 곳에서 관리
- 런타임 검증 + 컴파일 타임 타입 체크
- 프론트엔드와 백엔드 간 스키마 공유

#### 작업 내역

1. ✅ packages/interface Zod 스키마
   - `schemas/common/` (response, token)
   - `schemas/auth/` (request)
   - `schemas/registration/` (member, request, response)

2. ✅ apps/api nestjs-zod DTOs
   - Registration DTOs (4개)
   - Auth DTOs (3개)
   - Common DTOs (1개)

3. ✅ Validation Pipes
   - 전역 ZodValidationPipe 설정
   - Query parameter 변환 처리

---

### Phase 4: Auth 모듈 구현 (예정)

#### 목표

이메일 인증 기반 로그인 시스템 구현

#### 현재 구조

```
src/modules/user/
├── entities/
│   ├── user.entity.ts ✅
│   ├── refresh-token.entity.ts ✅
│   └── index.ts ✅
└── user.module.ts ✅

src/modules/auth/
├── entities/
│   ├── email-verification.entity.ts ✅
│   └── index.ts ✅
├── dto/
│   ├── send-code.dto.ts ✅
│   ├── verify-code.dto.ts ✅
│   ├── refresh-token.dto.ts ✅
│   └── index.ts ✅
├── strategies/
│   └── jwt.strategy.ts
├── auth.service.ts
├── auth.controller.ts
└── auth.module.ts
```

#### 작업 내역

1. [ ] EmailService (공통 서비스)
   - `src/common/services/email.service.ts`
   - 인증 코드 발송
   - 이메일 템플릿 (신청 완료, 인증 코드 등)
   - SMTP 설정 (nodemailer)

2. [ ] AuthService
   - `src/modules/auth/auth.service.ts`
   - `sendVerificationCode()` - 이메일로 6자리 코드 발송
   - `verifyCode()` - 코드 검증 및 JWT 토큰 발급
   - `refreshAccessToken()` - Refresh Token으로 Access Token 갱신
   - `logout()` - Refresh Token 무효화

3. [ ] Guards (공통)
   - `src/common/guards/jwt-auth.guard.ts` - JWT 인증 검증
   - `src/common/guards/roles.guard.ts` - 역할 기반 권한 검증

4. [ ] Decorators (공통)
   - `src/common/decorators/current-user.decorator.ts` - 현재 사용자 정보 주입
   - `src/common/decorators/roles.decorator.ts` - 역할 메타데이터 설정

5. [ ] AuthController
   - `src/modules/auth/auth.controller.ts`
   - POST `/api/auth/send-code` - 로그인용 인증 코드 발송
   - POST `/api/auth/verify-code` - 코드 검증 및 로그인
   - POST `/api/auth/refresh` - Access Token 갱신
   - POST `/api/auth/logout` - 로그아웃

6. [ ] JWT Strategy
   - `src/modules/auth/strategies/jwt.strategy.ts`
   - Passport JWT 전략 구성

---

### Phase 5: Registration 모듈 구현 (예정)

#### 목표

신청 관련 Public API 구현

#### 현재 구조

```
src/modules/registration/
├── entities/
│   ├── registration.entity.ts ✅
│   ├── registration-member.entity.ts ✅
│   └── index.ts ✅
├── dto/
│   ├── send-verification-code.dto.ts ✅
│   ├── verify-email.dto.ts ✅
│   ├── check-availability.dto.ts ✅
│   ├── create-registration.dto.ts ✅
│   └── index.ts ✅
├── registration.service.ts
├── registration.controller.ts
└── registration.module.ts

src/modules/seat/
├── entities/
│   ├── seat.entity.ts ✅
│   └── index.ts ✅
├── seat.service.ts
└── seat.module.ts
```

#### 작업 내역

1. [ ] RegistrationService
   - `src/modules/registration/registration.service.ts`
   - `sendVerificationCode()` - 신청용 이메일 인증 코드 발송
   - `verifyEmail()` - 이메일 코드 검증 (중복 신청 확인 포함)
   - `checkAvailability()` - 신청 가능 여부 조회
   - `createRegistration()` - 신청 생성 (트랜잭션)

2. [ ] SeatService
   - `src/modules/seat/seat.service.ts`
   - `getGeneralSeats()` - 일반석 목록 및 가용 좌석 조회
   - 좌석 점유율 계산

3. [ ] RegistrationController
   - `src/modules/registration/registration.controller.ts`
   - POST `/api/registrations/send-verification-code` - 이메일 인증 요청
   - POST `/api/registrations/verify-email` - 이메일 인증 확인
   - GET `/api/registrations/availability` - 신청 가능 여부 조회
   - GET `/api/seats/general` - 일반석 조회
   - POST `/api/registrations` - 신청 생성

4. [ ] 비즈니스 로직
   - 이메일 중복 확인 (활성 신청 기준)
   - 인원 제한 확인 (학교/성별/타임별)
   - 좌석 중복 방지 (Pessimistic Write Lock)
   - User 자동 생성/조회 (APPLICANT 역할)
   - 신청 완료 이메일 발송 (로그인 링크 포함)

---

### Phase 6: My 모듈 구현 (예정)

#### 목표

로그인 사용자의 신청 관리 API 구현

#### 구조

```
src/modules/my/
├── my-registration.controller.ts
├── my-registration.service.ts
└── my.module.ts
```

#### 작업 내역

1. [ ] MyRegistrationService
   - `src/modules/my/my-registration.service.ts`
   - `getMyRegistrations()` - 내 신청 목록 조회 (신청자 + 동반인)
   - `updateMyRegistration()` - 신청 정보 수정 (좌석 변경, 개인정보 수정)
   - `cancelMyRegistration()` - 신청 취소

2. [ ] MyRegistrationController
   - `src/modules/my/my-registration.controller.ts`
   - GET `/api/my/registrations` - 내 신청 목록 (JwtAuthGuard)
   - PATCH `/api/my/registrations/:id` - 신청 수정 (JwtAuthGuard)
   - DELETE `/api/my/registrations/:id` - 신청 취소 (JwtAuthGuard)

3. [ ] 권한 검증
   - 본인 신청만 수정/취소 가능 (user.id === registration.userId)
   - APPLICANT 역할 전용

---

### Phase 7: Admin 모듈 구현 (예정)

#### 목표

관리자 대시보드 API 구현

#### 구조

```
src/modules/admin/
├── admin-registration.controller.ts
├── admin-registration.service.ts
├── admin-statistics.controller.ts
├── admin-statistics.service.ts
└── admin.module.ts
```

#### 작업 내역

1. [ ] AdminRegistrationService
   - `src/modules/admin/admin-registration.service.ts`
   - `getAllRegistrations()` - 전체 신청 목록 (페이지네이션, 필터)
   - `getRegistrationById()` - 특정 신청 상세 조회
   - `updateStatus()` - 신청 상태 변경 (입금 확인 등)
   - `deleteRegistration()` - 신청 삭제

2. [ ] AdminStatisticsService
   - `src/modules/admin/admin-statistics.service.ts`
   - `getStatistics()` - 통계 데이터 집계

3. [ ] AdminRegistrationController
   - `src/modules/admin/admin-registration.controller.ts`
   - GET `/api/admin/registrations` - 전체 신청 목록
   - GET `/api/admin/registrations/:id` - 신청 상세
   - PATCH `/api/admin/registrations/:id/status` - 상태 변경
   - DELETE `/api/admin/registrations/:id` - 신청 삭제

4. [ ] AdminStatisticsController
   - `src/modules/admin/admin-statistics.controller.ts`
   - GET `/api/admin/statistics` - 통계 조회

5. [ ] 권한 적용
   - `@Roles('ADMIN', 'SUPER_ADMIN')` 데코레이터 사용
   - RolesGuard로 역할 검증

---

### Phase 8: 테스트 및 최적화 (예정)

#### 목표

전체 시스템 테스트 및 성능 최적화

#### 작업 내역

1. [ ] 단위 테스트
   - Service 메서드
   - DTO 검증

2. [ ] E2E 테스트
   - 신청 플로우
   - 로그인 플로우
   - 수정/취소 플로우

3. [ ] 동시성 테스트
   - 좌석 동시 선택
   - Race condition 확인

4. [ ] 성능 최적화
   - 쿼리 최적화
   - 인덱스 튜닝
   - N+1 문제 해결

5. [ ] Rate Limiting
   - 인증 코드 발송: 이메일당 3회/시간
   - 코드 검증: IP당 5회/10분
   - 신청 API: IP당 10회/시간

6. [ ] Swagger 문서
   - API 문서 자동 생성
   - DTO 예시 추가

---

## 보안 및 인증

### JWT 토큰 전략

#### Access Token

- **유효기간**: 15분
- **용도**: API 요청 인증
- **저장 위치**: 메모리 (프론트엔드)
- **페이로드**:
  ```typescript
  {
    type: 'ACCESS',
    userId: string,
    email: string,
    role: UserRole,
    exp: 15분
  }
  ```

#### Refresh Token

- **유효기간**: 30일
- **용도**: Access Token 갱신
- **저장 위치**: HttpOnly Cookie 또는 Secure Storage
- **Rotation**: 갱신 시 새로운 Refresh Token 발급
- **페이로드**:
  ```typescript
  {
    type: 'REFRESH',
    userId: string,
    tokenId: string,
    exp: 30일
  }
  ```

### 이메일 인증 플로우

#### 신청 시

1. 이메일 입력
2. 인증 코드 발송 (purpose: REGISTRATION)
3. 코드 검증 → `isVerified = true`
4. 30분 이내 신청 완료
5. User 자동 생성 (role: APPLICANT)
6. Registration 생성

#### 로그인 시

1. 이메일 입력
2. 인증 코드 발송 (purpose: LOGIN)
3. 코드 검증 → Access Token + Refresh Token 발급
4. 내 신청 조회/수정/취소 가능

### 보안 기능

1. **Refresh Token Rotation**
   - Access Token 갱신 시 Refresh Token도 새로 발급
   - 기존 Refresh Token 즉시 무효화
   - 재사용 공격 방지

2. **Rate Limiting**
   - 인증 코드 발송: 이메일당 3회/시간
   - 인증 코드 확인: IP당 5회/10분
   - 신청 API: IP당 10회/시간

3. **입력 검증**
   - class-validator로 DTO 검증
   - 학번 포맷 검증 (KAIST: 8자리, CNU: 9자리)
   - 이메일 형식 검증
   - SQL Injection 방지 (TypeORM 자동)

4. **동시성 제어**
   - Pessimistic Write Lock (좌석 선택)
   - 트랜잭션 격리 수준: READ COMMITTED

5. **민감정보 보호**
   - 로그에서 개인정보 제외
   - HTTPS 필수

---

## 환경 변수

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=onedaypub

# JWT
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=30d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
SMTP_FROM=noreply@one-day-pub.site

# Admin
ADMIN_EMAIL=admin@one-day-pub.site

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

---

## 필요한 패키지

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/throttler": "^5.0.0",
    "typeorm": "^0.3.0",
    "mysql2": "^3.0.0",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0",
    "nodemailer": "^6.9.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@nestjs/testing": "^10.0.0",
    "@types/nodemailer": "^6.4.0",
    "@types/passport-jwt": "^3.0.0"
  }
}
```

---

## 변경 이력

| 날짜       | 항목                    | 변경 내용                               |
| ---------- | ----------------------- | --------------------------------------- |
| 2025-10-22 | User 기반 설계로 전환   | Admin + Applicant를 users 테이블로 통합 |
| 2025-10-22 | 이메일 인증 플로우 추가 | 신청 전 이메일 인증 필수화              |
| 2025-10-22 | 로그인 시스템 추가      | 일반 사용자도 로그인하여 신청 관리 가능 |
| 2025-10-22 | registration_members    | userId 추가, email 제거                 |
| 2025-10-22 | email_verifications     | isUsed, updatedAt 추가, purpose 확장    |

---

_이 문서는 SSOT 기반으로 작성되었으며, 실제 구현 시 참고 문서로 사용됩니다._
