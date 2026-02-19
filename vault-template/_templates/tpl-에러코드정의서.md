---
id: "<% tp.file.cursor(1) %>"
title: "<% tp.file.cursor(2) %>"
type: "error-code"
status: "draft"
version: "0.1.0"
created: "<% tp.date.now('YYYY-MM-DD') %>"
updated: "<% tp.date.now('YYYY-MM-DD') %>"
author: "<% tp.file.cursor(3) %>"
reviewer: ""
approver: ""
tags: [개발, 에러코드정의서]
related: []
priority: "medium"
phase: ""
error_module: ""
---

# <% tp.file.cursor(2) %> 에러 코드 정의서

## 1. 에러 코드 체계

### 코드 구조
```
E{모듈코드}{번호}
```

| 구성 | 설명 | 예시 |
|------|------|------|
| E | 에러 접두사 | E |
| 모듈코드 | 모듈 식별자 (3~5자) | AUTH, USER, DATA |
| 번호 | 순차 번호 (3자리) | 001, 002, ... |

**예시**: `EAUTH001` = 인증 모듈의 첫 번째 에러

### 모듈 코드 목록
| 모듈 코드 | 모듈명 | 설명 |
|-----------|--------|------|
| AUTH | 인증/인가 | 로그인, 토큰, 권한 |
| USER | 사용자 | 회원가입, 프로필 |
| DATA | 데이터 | CRUD, 검증 |
| FILE | 파일 | 업로드, 다운로드 |
| EXT | 외부연동 | 외부 API, 결제 |
| SYS | 시스템 | 서버, 인프라 |

---

## 2. HTTP 상태 코드 매핑

| HTTP 상태 | 의미 | 사용 시점 |
|-----------|------|----------|
| 200 | OK | 정상 처리 |
| 201 | Created | 리소스 생성 성공 |
| 204 | No Content | 삭제 성공 |
| 400 | Bad Request | 요청 파라미터 오류 |
| 401 | Unauthorized | 인증 필요/실패 |
| 403 | Forbidden | 권한 부족 |
| 404 | Not Found | 리소스 미존재 |
| 409 | Conflict | 중복/충돌 |
| 422 | Unprocessable Entity | 비즈니스 규칙 위반 |
| 429 | Too Many Requests | Rate Limit 초과 |
| 500 | Internal Server Error | 서버 내부 오류 |
| 502 | Bad Gateway | 외부 서비스 오류 |
| 503 | Service Unavailable | 서비스 점검 중 |

---

## 3. 공통 에러

| 에러 코드 | HTTP 상태 | 메시지 (한) | 메시지 (영) | 원인 | 해결 방법 |
|-----------|----------|-----------|-----------|------|----------|
| ESYS001 | 500 | 서버 오류가 발생했습니다. | Internal server error | 처리되지 않은 예외 | 로그 확인 |
| ESYS002 | 503 | 서비스 점검 중입니다. | Service under maintenance | 점검 모드 | 점검 종료 대기 |
| ESYS003 | 429 | 요청이 너무 많습니다. | Too many requests | Rate limit 초과 | 잠시 후 재시도 |
| EDATA001 | 400 | 필수 항목이 누락되었습니다. | Required field missing | 필수 필드 미입력 | 요청 body 확인 |
| EDATA002 | 400 | 유효하지 않은 형식입니다. | Invalid format | 타입/형식 불일치 | 필드 형식 확인 |
| EDATA003 | 404 | 데이터를 찾을 수 없습니다. | Resource not found | ID 미존재 | ID 값 확인 |
| EDATA004 | 409 | 이미 존재하는 데이터입니다. | Duplicate resource | 중복 키 | 기존 데이터 확인 |

---

## 4. 모듈별 에러

### 인증/인가 (AUTH)
| 에러 코드 | HTTP 상태 | 메시지 (한) | 메시지 (영) | 원인 | 해결 방법 |
|-----------|----------|-----------|-----------|------|----------|
| EAUTH001 | 401 | 로그인이 필요합니다. | Authentication required | 토큰 없음 | 로그인 |
| EAUTH002 | 401 | 인증이 만료되었습니다. | Token expired | 토큰 만료 | 토큰 재발급 |
| EAUTH003 | 403 | 접근 권한이 없습니다. | Access denied | 권한 부족 | 관리자 문의 |
| EAUTH004 | 401 | 잘못된 인증 정보입니다. | Invalid credentials | ID/PW 불일치 | 정보 확인 |
| EAUTH005 | 403 | 계정이 잠금 상태입니다. | Account locked | 로그인 시도 초과 | 관리자 문의 |
| EAUTH006 | 401 | 유효하지 않은 토큰입니다. | Invalid token | 토큰 변조/오류 | 재로그인 |

### 사용자 (USER)
| 에러 코드 | HTTP 상태 | 메시지 (한) | 메시지 (영) | 원인 | 해결 방법 |
|-----------|----------|-----------|-----------|------|----------|
| EUSER001 | 409 | 이미 가입된 이메일입니다. | Email already registered | 이메일 중복 | 다른 이메일 사용 |
| EUSER002 | 400 | 비밀번호 형식이 올바르지 않습니다. | Invalid password format | 규칙 미충족 | 비밀번호 규칙 확인 |
| EUSER003 | 404 | 사용자를 찾을 수 없습니다. | User not found | 탈퇴/미존재 | 사용자 확인 |
| EUSER004 | 422 | 탈퇴 처리 중인 계정입니다. | Account being deactivated | 탈퇴 진행 중 | 탈퇴 완료 대기 |

### 데이터 (DATA)
| 에러 코드 | HTTP 상태 | 메시지 (한) | 메시지 (영) | 원인 | 해결 방법 |
|-----------|----------|-----------|-----------|------|----------|
| EDATA005 | 422 | 비즈니스 규칙에 위배됩니다. | Business rule violation | 규칙 위반 | 규칙 확인 |
| EDATA006 | 400 | 허용되지 않는 값입니다. | Value not allowed | 범위 초과 | 허용 범위 확인 |
| EDATA007 | 409 | 다른 사용자가 수정 중입니다. | Concurrent modification | 동시 수정 | 새로고침 후 재시도 |

### 외부연동 (EXT)
| 에러 코드 | HTTP 상태 | 메시지 (한) | 메시지 (영) | 원인 | 해결 방법 |
|-----------|----------|-----------|-----------|------|----------|
| EEXT001 | 502 | 외부 서비스 연결에 실패했습니다. | External service unavailable | 외부 API 장애 | 잠시 후 재시도 |
| EEXT002 | 502 | 결제 처리에 실패했습니다. | Payment processing failed | PG사 오류 | PG사 상태 확인 |
| EEXT003 | 504 | 외부 서비스 응답 시간이 초과되었습니다. | External service timeout | 타임아웃 | 잠시 후 재시도 |

---

## 5. 에러 응답 형식

### 기본 에러 응답
```json
{
  "success": false,
  "error": {
    "code": "EAUTH001",
    "message": "로그인이 필요합니다.",
    "timestamp": "2026-01-01T00:00:00.000Z"
  }
}
```

### 유효성 검증 에러 응답
```json
{
  "success": false,
  "error": {
    "code": "EDATA001",
    "message": "필수 항목이 누락되었습니다.",
    "details": [
      { "field": "name", "message": "이름은 필수 입력입니다." },
      { "field": "email", "message": "이메일 형식이 올바르지 않습니다." }
    ],
    "timestamp": "2026-01-01T00:00:00.000Z"
  }
}
```

---

## 6. 클라이언트 에러 처리 가이드

| 에러 타입 | UI 처리 방법 | 사용자 액션 |
|-----------|------------|------------|
| 401 (인증) | 로그인 페이지 리다이렉트 | 재로그인 |
| 403 (권한) | 접근 불가 화면 표시 | 이전으로/홈으로 |
| 404 (미존재) | 404 화면 표시 | 홈으로 |
| 400/422 (입력) | 인라인 에러 메시지 | 입력값 수정 |
| 409 (충돌) | 토스트 알림 | 새로고침 |
| 429 (과다요청) | 토스트 알림 + 재시도 타이머 | 대기 |
| 500 (서버) | 에러 화면 + 재시도 버튼 | 재시도/홈으로 |
| 502/503 (외부) | 에러 화면 + 재시도 버튼 | 잠시 후 재시도 |

---

## 7. 비고

<!-- 추가 에러 코드, 모듈별 확장 계획 등 -->
