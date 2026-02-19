---
id: "<% tp.file.cursor(1) %>"
title: "<% tp.file.cursor(2) %>"
type: "permission-matrix"
status: "draft"
version: "0.1.0"
created: "<% tp.date.now('YYYY-MM-DD') %>"
updated: "<% tp.date.now('YYYY-MM-DD') %>"
author: "<% tp.file.cursor(3) %>"
reviewer: ""
approver: ""
tags: [개발, 권한매트릭스]
related: []
priority: "medium"
phase: ""
permission_scope: ""
---

# <% tp.file.cursor(2) %> 권한 매트릭스

## 1. 역할 정의

| 역할 | 설명 | 상위 역할 | 기본 부여 |
|------|------|----------|----------|
| SUPER_ADMIN | 슈퍼 관리자 (전체 시스템 관리) | - | 수동 |
| ADMIN | 관리자 (서비스 운영 관리) | SUPER_ADMIN | 수동 |
| MANAGER | 매니저 (팀/부서 단위 관리) | ADMIN | 수동 |
| USER | 일반 사용자 (기본 기능 사용) | MANAGER | 회원가입 시 |
| GUEST | 게스트 (비로그인 / 제한적 열람) | USER | 기본 |

### 역할 계층도
```
SUPER_ADMIN
  └── ADMIN
        └── MANAGER
              └── USER
                    └── GUEST
```

> 상위 역할은 하위 역할의 모든 권한을 포함합니다.

---

## 2. 기능별 권한

| 기능 | SUPER_ADMIN | ADMIN | MANAGER | USER | GUEST |
|------|:-----------:|:-----:|:-------:|:----:|:-----:|
| **사용자 관리** | | | | | |
| 사용자 목록 조회 | CRUD | CRU | R | - | - |
| 사용자 역할 변경 | O | O | - | - | - |
| 사용자 계정 정지 | O | O | - | - | - |
| **콘텐츠 관리** | | | | | |
| 콘텐츠 생성 | O | O | O | O | - |
| 콘텐츠 수정 (본인) | O | O | O | O | - |
| 콘텐츠 수정 (타인) | O | O | O | - | - |
| 콘텐츠 삭제 | O | O | O | 본인만 | - |
| 콘텐츠 열람 | O | O | O | O | 공개만 |
| **시스템 설정** | | | | | |
| 시스템 설정 변경 | O | - | - | - | - |
| 로그 조회 | O | O | - | - | - |

> **범례**: O = 가능, - = 불가, CRUD = 생성/조회/수정/삭제, R = 조회만

---

## 3. 화면별 접근 권한

| 화면 | SUPER_ADMIN | ADMIN | MANAGER | USER | GUEST |
|------|:-----------:|:-----:|:-------:|:----:|:-----:|
| 홈 / 랜딩 | O | O | O | O | O |
| 로그인 | O | O | O | O | O |
| 대시보드 | O | O | O | O | - |
| 프로필 설정 | O | O | O | O | - |
| 사용자 관리 | O | O | △ | - | - |
| 콘텐츠 관리 | O | O | O | O | - |
| 시스템 설정 | O | - | - | - | - |
| 통계/리포트 | O | O | O | - | - |

> **범례**: O = 접근 가능, - = 접근 불가, △ = 조건부 접근 (본인 팀만)

---

## 4. API별 접근 권한

| API 엔드포인트 | 메서드 | 필요 역할 | 추가 조건 |
|---------------|--------|----------|----------|
| /api/v1/auth/login | POST | GUEST+ | - |
| /api/v1/auth/logout | POST | USER+ | - |
| /api/v1/users | GET | MANAGER+ | 본인 팀 범위 |
| /api/v1/users/:id | GET | USER+ | 본인 또는 MANAGER+ |
| /api/v1/users/:id | PUT | USER+ | 본인 또는 ADMIN+ |
| /api/v1/users/:id | DELETE | ADMIN+ | - |
| /api/v1/contents | GET | GUEST+ | 공개 데이터만 (GUEST) |
| /api/v1/contents | POST | USER+ | - |
| /api/v1/contents/:id | PUT | USER+ | 본인 또는 MANAGER+ |
| /api/v1/contents/:id | DELETE | USER+ | 본인 또는 ADMIN+ |
| /api/v1/admin/settings | GET | SUPER_ADMIN | - |
| /api/v1/admin/settings | PUT | SUPER_ADMIN | - |

---

## 5. 데이터 범위 제한

| 역할 | 데이터 접근 범위 | 필터 조건 |
|------|----------------|----------|
| SUPER_ADMIN | 전체 데이터 | 제한 없음 |
| ADMIN | 전체 데이터 | 제한 없음 |
| MANAGER | 소속 팀/부서 데이터 | `team_id = user.team_id` |
| USER | 본인 데이터 | `user_id = current_user.id` |
| GUEST | 공개 데이터만 | `visibility = 'public'` |

---

## 6. 특수 권한 규칙

### 조건부 접근
| 조건 | 규칙 | 적용 대상 |
|------|------|----------|
| 본인 데이터 | 작성자와 현재 사용자가 동일 | 수정/삭제 |
| 팀 데이터 | 동일 팀 소속 확인 | MANAGER의 조회 |
| 시간 제한 | 생성 후 24시간 이내만 가능 | USER의 삭제 |
| IP 제한 | 사내 네트워크에서만 접근 | 관리자 기능 |

### 임시 권한
| 시나리오 | 부여 권한 | 유효 기간 | 부여 조건 |
|----------|----------|----------|----------|
| 게스트 초대 | USER (읽기전용) | 7일 | 관리자 초대 링크 |
| 외부 감사 | ADMIN (읽기전용) | 30일 | SUPER_ADMIN 승인 |

---

## 7. 권한 상속 규칙

1. 상위 역할은 하위 역할의 모든 권한을 자동으로 상속합니다.
2. 명시적으로 제한된 권한은 상속되지 않습니다 (예: 시스템 설정은 SUPER_ADMIN만).
3. 역할 변경 시 이전 역할의 권한은 즉시 회수됩니다.
4. 다중 역할 할당은 허용하지 않으며, 하나의 최고 역할만 적용됩니다.

---

## 8. 비고

<!-- 추가 권한 규칙, 향후 확장 계획 등 -->
