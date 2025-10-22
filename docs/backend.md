# 일일호프 백엔드 구현 계획

> 최종 업데이트: 2025-10-22  
> SSOT 문서 기반 백엔드 API 및 데이터베이스 설계

---

## 📋 목차

1. [데이터베이스 스키마](#데이터베이스-스키마)
2. [API 스키마](#api-스키마)
3. [페이즈별 구현 계획](#페이즈별-구현-계획)
4. [보안 및 인증](#보안-및-인증)

---

## 데이터베이스 스키마

### 1. registrations (신청 정보)

신청의 기본 정보를 저장하는 메인 테이블

```sql
CREATE TABLE registrations (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  school ENUM('CNU', 'KAIST') NOT NULL,
  gender ENUM('MALE', 'FEMALE') NOT NULL,
  seat_type ENUM('MEETING', 'GENERAL') NOT NULL,
  time_slot ENUM('TIME_1', 'TIME_2') NOT NULL,
  status ENUM('PENDING', 'PAYMENT_CONFIRMED', 'CANCELLED') DEFAULT 'PENDING',
  seat_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_seat_type_time (seat_type, time_slot),
  INDEX idx_school_gender_time (school, gender, time_slot)
);
```

**필드 설명:**

- `id`: UUID 기본 키
- `email`: 신청 대표 이메일 (중복 불가)
- `school`: 학교 (CNU/KAIST)
- `gender`: 성별 (MALE/FEMALE)
- `seat_type`: 좌석 유형 (MEETING/GENERAL)
- `time_slot`: 타임 (TIME_1/TIME_2)
- `status`: 신청 상태
- `seat_id`: 자유석인 경우 좌석 ID (FK)

### 2. registration_members (신청자 정보)

신청자와 동반인의 개인정보를 저장

```sql
CREATE TABLE registration_members (
  id VARCHAR(36) PRIMARY KEY,
  registration_id VARCHAR(36) NOT NULL,
  `order` INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  student_id VARCHAR(20) NOT NULL,
  birth_year INT NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
  UNIQUE KEY uk_registration_order (registration_id, `order`),
  INDEX idx_registration (registration_id)
);
```

**필드 설명:**

- `order`: 1 = 신청자, 2 = 동반인
- `email`: 신청자(order=1)의 이메일 (동반인은 NULL)
- `department`: 학과
- `student_id`: 학번 (KAIST: 8자리, 충남대: 9자리)
- `birth_year`: 출생년도 (4자리)
- `phone_number`: 전화번호

### 3. seats (좌석 마스터)

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

### 4. admin_users (관리자)

관리자 계정 정보

```sql
CREATE TABLE admin_users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role ENUM('SUPER_ADMIN', 'ADMIN') DEFAULT 'ADMIN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**필드 설명:**

- `email`: 관리자 이메일 (비밀번호 없음, 이메일 인증 사용)
- `role`: 관리자 권한 레벨

### 5. email_verifications (이메일 인증)

관리자 로그인을 위한 이메일 인증 코드

```sql
CREATE TABLE email_verifications (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  purpose ENUM('ADMIN_LOGIN') NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_email_code (email, code, is_verified),
  INDEX idx_expires (expires_at)
);
```

**필드 설명:**

- `code`: 6자리 인증 코드
- `purpose`: 인증 목적 (관리자 로그인)
- `is_verified`: 인증 완료 여부
- `expires_at`: 만료 시간 (10분)

### 6. admin_refresh_tokens (리프레시 토큰)

관리자 리프레시 토큰 관리

```sql
CREATE TABLE admin_refresh_tokens (
  id VARCHAR(36) PRIMARY KEY,
  admin_user_id VARCHAR(36) NOT NULL,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_admin_user (admin_user_id),
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

#### 1. 신청 가능 여부 조회

미팅석 또는 일반석의 신청 가능 여부를 확인

```http
GET /api/registrations/availability
```

**Query Parameters:**

| 파라미터    | 타입    | 필수 | 설명                      |
| ----------- | ------- | ---- | ------------------------- |
| isMeeting   | boolean | ✅   | 미팅석 여부               |
| school      | string  | ✅   | 'CNU' \| 'KAIST'          |
| gender      | string  | ✅   | 'M' \| 'F'                |
| time        | number  | ⚠️   | 1 \| 2 (미팅석일 때 필수) |
| memberCount | number  | ✅   | 1 \| 2                    |

**Response:**

```typescript
{
  isAvailable: boolean;
}
```

**비즈니스 로직:**

미팅석인 경우:

- KAIST 남성: 10명 제한
- KAIST 여성: 8명 제한
- CNU 남성: 8명 제한
- CNU 여성: 10명 제한

일반석인 경우:

- 타임당 남성: 28명 제한
- 타임당 여성: 28명 제한

#### 2. 일반석 좌석 조회

특정 타임의 일반석 좌석별 현황 조회

```http
GET /api/seats/general
```

**Query Parameters:**

| 파라미터 | 타입   | 필수 | 설명   |
| -------- | ------ | ---- | ------ |
| time     | number | ✅   | 1 \| 2 |

**Response:**

```typescript
{
  seats: [
    {
      seatId: number, // 좌석 ID
      availableCount: number, // 잔여 인원
      femaleCount: number, // 현재 여성 인원
      maleCount: number, // 현재 남성 인원
    },
  ];
}
```

#### 3. 신청하기

일일호프 신청 생성

```http
POST /api/registrations
```

**Request Body:**

```typescript
{
  isMeeting: boolean,           // 미팅석 여부
  email: string,                // 대표 이메일
  gender: 'M' | 'F',           // 성별
  school: 'CNU' | 'KAIST',     // 학교
  time: 1 | 2,                  // 타임
  seatId?: number,              // 좌석 ID (일반석일 때 필수)
  members: [
    {
      name: string,             // 이름
      department: string,       // 학과
      studentId: string,        // 학번
      birthYear: number,        // 출생년도
      phoneNumber: string,      // 전화번호
      email?: string            // 이메일 (신청자만)
    }
  ]
}
```

**검증 규칙:**

미팅석:

- `members` 배열 길이 = 2 (필수)
- `time` 필수
- `members[0].email` 필수

일반석:

- `members` 배열 길이 = 1 (필수)
- `seatId` 필수
- `members[0].email` 필수

**Response:**

```typescript
// 성공
200 OK

// 좌석 선점 실패
422 Unprocessable Entity
{
  message: "이미 선점된 좌석입니다"
}

// 기타 검증 실패
400 Bad Request
{
  message: string
}
```

---

### Admin API (JWT 인증 필요)

#### 관리자 인증

##### 1. 인증 코드 발송

관리자 이메일로 6자리 인증 코드 발송

```http
POST /api/admin/auth/send-code
```

**Request Body:**

```typescript
{
  email: string;
}
```

**Response:**

```typescript
{
  success: boolean;
}
```

##### 2. 인증 코드 확인 및 로그인

인증 코드 확인 후 Access Token + Refresh Token 발급

```http
POST /api/admin/auth/verify-code
```

**Request Body:**

```typescript
{
  email: string,
  code: string  // 6자리
}
```

**Response:**

```typescript
{
  accessToken: string,   // 15분 유효
  refreshToken: string   // 30일 유효
}
```

##### 3. Access Token 갱신

Refresh Token으로 새로운 Access Token 발급

```http
POST /api/admin/auth/refresh
```

**Request Body:**

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

##### 4. 로그아웃

Refresh Token 무효화

```http
POST /api/admin/auth/logout
```

**Headers:**

```
Authorization: Bearer {refreshToken}
```

**Response:**

```typescript
{
  success: boolean;
}
```

#### 관리자 기능

##### 1. 신청 목록 조회

```http
GET /api/admin/registrations
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

**Response:**

```typescript
{
  data: [
    {
      id: string,
      email: string,
      school: string,
      gender: string,
      seatType: string,
      timeSlot: string,
      status: string,
      seatId: number | null,
      createdAt: string,
      members: [
        {
          order: number,
          name: string,
          department: string,
          studentId: string,
          birthYear: number,
          phoneNumber: string,
          email: string | null
        }
      ]
    }
  ],
  total: number,
  page: number,
  limit: number
}
```

##### 2. 신청 상세 조회

```http
GET /api/admin/registrations/:id
```

**Response:**

```typescript
{
  id: string,
  email: string,
  school: string,
  gender: string,
  seatType: string,
  timeSlot: string,
  status: string,
  seatId: number | null,
  createdAt: string,
  updatedAt: string,
  members: [
    {
      id: string,
      order: number,
      name: string,
      department: string,
      studentId: string,
      birthYear: number,
      phoneNumber: string,
      email: string | null
    }
  ]
}
```

##### 3. 신청 상태 변경

입금 확인 등의 상태 변경

```http
PATCH /api/admin/registrations/:id/status
```

**Request Body:**

```typescript
{
  status: 'PENDING' | 'PAYMENT_CONFIRMED' | 'CANCELLED';
}
```

**Response:**

```typescript
{
  success: boolean;
}
```

##### 4. 신청 삭제

```http
DELETE /api/admin/registrations/:id
```

**Response:**

```typescript
{
  success: boolean;
}
```

##### 5. 통계 조회

```http
GET /api/admin/statistics
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
    time2: {
      // 동일 구조
    }
  }
}
```

---

## 페이즈별 구현 계획

### Phase 1: 데이터베이스 및 엔티티 (1일)

#### 목표

기존 테이블 제거 및 새로운 스키마 구축

#### 작업 내역

1. **기존 코드 정리**
   - [ ] 기존 엔티티 파일 삭제
     - `user.entity.ts`
     - `role.entity.ts`
     - `booth.entity.ts`
     - `stage.entity.ts`
     - `safety-count.entity.ts`
     - `safety-minute-stats.entity.ts`
     - `visitor-analytics.entity.ts`
   - [ ] 기존 모듈 삭제
     - `UsersModule`
     - `BoothModule`
     - `StageModule`
     - `SafetyModule`
     - `AnalyticsModule`
   - [ ] 기존 마이그레이션 파일 백업/삭제

2. **Enum 타입 정의**
   - [ ] `src/common/enums/` 디렉토리 생성
   - [ ] `school.enum.ts` (CNU, KAIST)
   - [ ] `gender.enum.ts` (MALE, FEMALE)
   - [ ] `seat-type.enum.ts` (MEETING, GENERAL)
   - [ ] `time-slot.enum.ts` (TIME_1, TIME_2)
   - [ ] `registration-status.enum.ts` (PENDING, PAYMENT_CONFIRMED, CANCELLED)
   - [ ] `admin-role.enum.ts` (SUPER_ADMIN, ADMIN)
   - [ ] `email-verification-purpose.enum.ts` (ADMIN_LOGIN)

3. **엔티티 생성**
   - [ ] `registration.entity.ts`
   - [ ] `registration-member.entity.ts`
   - [ ] `seat.entity.ts`
   - [ ] `admin-user.entity.ts`
   - [ ] `email-verification.entity.ts`
   - [ ] `admin-refresh-token.entity.ts`

4. **마이그레이션 생성**
   - [ ] `npm run migration:generate -- -n InitialSchema`
   - [ ] 마이그레이션 파일 검토
   - [ ] 인덱스 확인

5. **시드 데이터 작성**
   - [ ] `src/database/seeds/` 디렉토리 생성
   - [ ] `seat.seed.ts`: 좌석 데이터 (4인석 8개, 6인석 4개)
   - [ ] `admin-user.seed.ts`: 관리자 계정 1개

6. **실행 및 검증**
   - [ ] `npm run migration:run`
   - [ ] `npm run seed:run`
   - [ ] DB 테이블 구조 확인
   - [ ] 시드 데이터 확인

**완료 기준:**

- 모든 테이블이 생성됨
- 좌석 56개가 삽입됨
- 관리자 계정 1개 생성됨

---

### Phase 2: DTO 및 공통 모듈 (0.5일)

#### 목표

API 요청/응답 타입 정의 및 검증 설정

#### 작업 내역

1. **DTO 디렉토리 구조**

   ```
   src/
     modules/
       registration/
         dto/
           check-availability.dto.ts
           create-registration.dto.ts
           get-general-seats.dto.ts
       admin/
         dto/
           admin-login.dto.ts
           admin-refresh.dto.ts
           registration-query.dto.ts
           update-status.dto.ts
   ```

2. **Registration DTOs**
   - [ ] `CheckAvailabilityDto`
     - isMeeting, school, gender, time, memberCount
     - class-validator 데코레이터 추가
   - [ ] `CreateRegistrationDto`
     - isMeeting, email, gender, school, time, seatId, members
     - 커스텀 검증: 미팅석 2명, 일반석 1명
   - [ ] `MemberDto`
     - name, department, studentId, birthYear, phoneNumber, email

3. **Admin DTOs**
   - [ ] `AdminSendCodeDto`
   - [ ] `AdminVerifyCodeDto`
   - [ ] `RefreshTokenDto`
   - [ ] `RegistrationQueryDto` (페이지네이션)
   - [ ] `UpdateStatusDto`

4. **Response DTOs**
   - [ ] `AvailabilityResponseDto`
   - [ ] `GeneralSeatsResponseDto`
   - [ ] `TokenResponseDto`
   - [ ] `PaginatedResponseDto<T>`

5. **Validation Pipes 설정**
   - [ ] `main.ts`에 전역 ValidationPipe 설정
   - [ ] 커스텀 ValidationPipe (whitelist, transform 옵션)

6. **Exception Filters**
   - [ ] `HttpExceptionFilter` 생성
   - [ ] 에러 응답 포맷 통일

**완료 기준:**

- 모든 DTO가 정의됨
- class-validator 검증이 작동함
- 에러 응답이 일관된 포맷으로 반환됨

---

### Phase 3: 관리자 인증 (1일)

#### 목표

이메일 인증 기반 관리자 로그인 및 JWT 토큰 시스템 구현

#### 작업 내역

1. **JWT 모듈 설정**
   - [ ] `@nestjs/jwt` 설치
   - [ ] `.env`에 JWT_SECRET 추가
   - [ ] JwtModule.register() 설정

2. **EmailService 구현**
   - [ ] `src/common/services/email.service.ts` 생성
   - [ ] nodemailer 설정
   - [ ] 인증 코드 발송 메서드
   - [ ] 이메일 템플릿 작성

3. **AdminAuthService 구현**
   - [ ] `sendVerificationCode()`
     - 관리자 이메일 확인
     - 6자리 코드 생성
     - DB 저장 (10분 유효)
     - 이메일 발송
   - [ ] `verifyCodeAndGenerateTokens()`
     - 코드 검증
     - Access Token 생성 (15분)
     - Refresh Token 생성 (30일)
     - DB 저장
   - [ ] `refreshAccessToken()`
     - Refresh Token 검증
     - 새 Access Token 발급
     - Refresh Token Rotation
   - [ ] `logout()`
     - Refresh Token 무효화

4. **Guards 구현**
   - [ ] `JwtAuthGuard` (passport-jwt 기반)
   - [ ] `@CurrentAdmin()` 데코레이터

5. **API 엔드포인트**
   - [ ] `POST /api/admin/auth/send-code`
   - [ ] `POST /api/admin/auth/verify-code`
   - [ ] `POST /api/admin/auth/refresh`
   - [ ] `POST /api/admin/auth/logout`

6. **테스트**
   - [ ] 인증 코드 발송 테스트
   - [ ] 로그인 플로우 테스트
   - [ ] Token Rotation 테스트
   - [ ] 만료 토큰 처리 테스트

**완료 기준:**

- 관리자 로그인이 작동함
- Access Token으로 보호된 엔드포인트 접근 가능
- Refresh Token으로 갱신 가능
- 로그아웃 시 토큰 무효화됨

---

### Phase 4: 신청 기능 (1.5일)

#### 목표

일일호프 신청 관련 Public API 3개 구현

#### 작업 내역

1. **RegistrationModule 생성**
   - [ ] `src/modules/registration/` 디렉토리 생성
   - [ ] RegistrationController
   - [ ] RegistrationService
   - [ ] TypeOrmModule.forFeature([Registration, RegistrationMember, Seat])

2. **GET /api/registrations/availability**
   - [ ] `checkAvailability()` 메서드 구현
   - [ ] 미팅석 인원 제한 로직
     - KAIST 남: 10, KAIST 여: 8, CNU 남: 8, CNU 여: 10
   - [ ] 일반석 인원 제한 로직
     - 타임당 남/녀 각 28명
   - [ ] memberCount 고려 (2명 신청 시)

3. **GET /api/seats/general**
   - [ ] `getGeneralSeats()` 메서드 구현
   - [ ] 좌석별 현재 인원 집계
   - [ ] availableCount, femaleCount, maleCount 계산

4. **POST /api/registrations**
   - [ ] `createRegistration()` 메서드 구현
   - [ ] 트랜잭션 처리
   - [ ] 검증 로직
     - 이메일 중복 체크
     - 미팅석: 2명 필수, 타임 필수
     - 일반석: 1명 필수, 좌석 선택 필수
   - [ ] 좌석 중복 방지 (Pessimistic Lock)
   - [ ] Registration + RegistrationMember 저장
   - [ ] 에러 처리
     - 422: "이미 선점된 좌석입니다"
     - 400: 기타 검증 오류

5. **동시성 처리**
   - [ ] 좌석 선택 시 Pessimistic Write Lock
   - [ ] 트랜잭션 격리 수준 설정

6. **테스트**
   - [ ] 신청 가능 여부 조회 테스트
   - [ ] 좌석 조회 테스트
   - [ ] 신청 생성 테스트
   - [ ] 동시 신청 시나리오 테스트
   - [ ] 인원 제한 테스트

**완료 기준:**

- 3개 Public API가 모두 작동함
- 동시에 같은 좌석 선택 시 1명만 성공
- 인원 제한이 정확히 작동함

---

### Phase 5: 관리자 기능 (1일)

#### 목표

관리자 대시보드를 위한 CRUD API 구현

#### 작업 내역

1. **AdminModule 생성**
   - [ ] `src/modules/admin/` 디렉토리 생성
   - [ ] AdminController
   - [ ] AdminService

2. **GET /api/admin/registrations**
   - [ ] 페이지네이션 구현
   - [ ] 필터링 (status, seatType, timeSlot, school)
   - [ ] 정렬 (createdAt desc)
   - [ ] members 조인

3. **GET /api/admin/registrations/:id**
   - [ ] 신청 상세 조회
   - [ ] members 포함

4. **PATCH /api/admin/registrations/:id/status**
   - [ ] 상태 변경 (입금 확인 등)
   - [ ] 검증: CANCELLED 상태는 변경 불가

5. **DELETE /api/admin/registrations/:id**
   - [ ] Soft Delete 또는 상태 변경
   - [ ] Cascade로 members도 삭제

6. **GET /api/admin/statistics**
   - [ ] 전체 통계 집계
   - [ ] 상태별, 좌석유형별, 타임별 카운트
   - [ ] 미팅석: 학교/성별 세부 카운트
   - [ ] 일반석: 성별 카운트

7. **권한 확인**
   - [ ] JwtAuthGuard 적용
   - [ ] Role-based access (필요 시)

8. **테스트**
   - [ ] 목록 조회 테스트
   - [ ] 상세 조회 테스트
   - [ ] 상태 변경 테스트
   - [ ] 통계 집계 테스트

**완료 기준:**

- 관리자 API 5개가 모두 작동함
- 통계가 정확하게 집계됨
- JWT 인증이 적용됨

---

### Phase 6: 테스트 및 최적화 (1일)

#### 목표

전체 시스템 테스트 및 성능 최적화

#### 작업 내역

1. **단위 테스트**
   - [ ] RegistrationService 테스트
   - [ ] AdminAuthService 테스트
   - [ ] 각 메서드별 테스트 케이스

2. **E2E 테스트**
   - [ ] 신청 플로우 E2E 테스트
   - [ ] 관리자 로그인 플로우 테스트
   - [ ] API 시나리오 테스트

3. **동시성 테스트**
   - [ ] 좌석 동시 선택 시나리오
   - [ ] Race Condition 테스트
   - [ ] Lock 동작 확인

4. **성능 최적화**
   - [ ] 쿼리 분석 (EXPLAIN)
   - [ ] N+1 쿼리 해결
   - [ ] 인덱스 최적화
   - [ ] 불필요한 조인 제거

5. **Rate Limiting**
   - [ ] `@nestjs/throttler` 설치
   - [ ] 인증 코드 발송: 이메일당 3회/시간
   - [ ] 신청 API: IP당 10회/시간

6. **로깅**
   - [ ] Winston 또는 Pino 설정
   - [ ] 에러 로깅
   - [ ] 민감정보 마스킹

7. **문서화**
   - [ ] Swagger 설정
   - [ ] API 문서 자동 생성
   - [ ] DTO 예시 추가

**완료 기준:**

- 모든 테스트 통과
- 동시성 이슈 없음
- Rate Limiting 적용됨
- Swagger 문서 완성됨

---

## 보안 및 인증

### JWT 토큰 전략

#### Access Token

- **유효기간**: 15분
- **용도**: API 요청 인증
- **저장 위치**: 메모리 (프론트엔드)

#### Refresh Token

- **유효기간**: 30일
- **용도**: Access Token 갱신
- **저장 위치**: HttpOnly Cookie 또는 Secure Storage
- **Rotation**: 갱신 시 새로운 Refresh Token 발급

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
   - 전화번호 암호화 (선택)
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

## 총 소요 시간: 6일

| Phase    | 소요 시간 | 주요 작업                       |
| -------- | --------- | ------------------------------- |
| Phase 1  | 1일       | DB 스키마, 엔티티, 마이그레이션 |
| Phase 2  | 0.5일     | DTO, 검증, 공통 모듈            |
| Phase 3  | 1일       | 관리자 인증 (이메일 + JWT)      |
| Phase 4  | 1.5일     | 신청 API 3개                    |
| Phase 5  | 1일       | 관리자 API 5개                  |
| Phase 6  | 1일       | 테스트, 최적화, 문서화          |
| **합계** | **6일**   |                                 |

---

_이 문서는 SSOT 기반으로 작성되었으며, 실제 구현 시 참고 문서로 사용됩니다._
