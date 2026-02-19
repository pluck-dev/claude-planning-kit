---
id: "<% tp.file.cursor(1) %>"
title: "<% tp.file.cursor(2) %>"
type: "api-spec"
status: "draft"
version: "0.1.0"
created: "<% tp.date.now('YYYY-MM-DD') %>"
updated: "<% tp.date.now('YYYY-MM-DD') %>"
author: "<% tp.file.cursor(3) %>"
reviewer: ""
approver: ""
tags: [개발, API명세서]
related: []
priority: "medium"
phase: ""
api_id: "API-xxx"
method: ""
endpoint: ""
auth_required: true
---

# <% tp.file.cursor(2) %> API 명세서

## 1. API 개요

| 항목 | 내용 |
|------|------|
| API명 | |
| API ID | API-xxx |
| 엔드포인트 | |
| 메서드 | GET / POST / PUT / PATCH / DELETE |
| 인증 | Bearer Token |
| 권한 | |
| Rate Limit | |

> API에 대한 간략한 설명을 작성합니다.

---

## 2. 요청 (Request)

### Headers
| 헤더명 | 필수 | 타입 | 설명 | 예시 |
|--------|------|------|------|------|
| Authorization | Y | string | Bearer 토큰 | `Bearer eyJhbG...` |
| Content-Type | Y | string | 요청 본문 타입 | `application/json` |
| X-Request-ID | N | string | 요청 추적 ID | `uuid-v4` |

### Path Parameters
| 파라미터 | 필수 | 타입 | 설명 | 예시 |
|----------|------|------|------|------|
| id | Y | number | 리소스 ID | `123` |

### Query Parameters
| 파라미터 | 필수 | 타입 | 설명 | 기본값 | 예시 |
|----------|------|------|------|--------|------|
| page | N | number | 페이지 번호 | 1 | `1` |
| limit | N | number | 페이지당 항목 수 | 20 | `20` |
| sort | N | string | 정렬 기준 | `createdAt` | `createdAt` |
| order | N | string | 정렬 방향 | `desc` | `asc` |
| search | N | string | 검색어 | | `키워드` |

### Request Body
```json
{
  "field1": "string",
  "field2": 0,
  "field3": true,
  "nested": {
    "subField1": "string"
  }
}
```

| 필드 | 타입 | 필수 | 설명 | 제약 조건 |
|------|------|------|------|----------|
| field1 | string | Y | | 최대 255자 |
| field2 | number | N | | 0 이상 |
| field3 | boolean | N | | |
| nested.subField1 | string | N | | |

---

## 3. 응답 (Response)

### 성공 응답 (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "field1": "string",
    "field2": 0,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| success | boolean | 요청 성공 여부 |
| data | object | 응답 데이터 |
| data.id | number | 리소스 ID |
| meta | object | 페이지네이션 메타 |
| meta.total | number | 전체 항목 수 |

### 성공 응답 (201 Created)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "message": "리소스가 생성되었습니다."
  }
}
```

### 에러 응답 (4xx)
```json
{
  "success": false,
  "error": {
    "code": "E400001",
    "message": "필수 입력 항목을 확인해주세요.",
    "details": [
      {
        "field": "field1",
        "message": "필수 입력 항목입니다."
      }
    ]
  }
}
```

### 에러 응답 (5xx)
```json
{
  "success": false,
  "error": {
    "code": "E500001",
    "message": "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
  }
}
```

---

## 4. 에러 코드

| 에러 코드 | HTTP 상태 | 메시지 | 원인 | 해결 방법 |
|-----------|----------|--------|------|----------|
| E400001 | 400 | 필수 입력 항목을 확인해주세요. | 필수 필드 누락 | 요청 body 확인 |
| E400002 | 400 | 유효하지 않은 형식입니다. | 타입/형식 불일치 | 필드 타입 확인 |
| E401001 | 401 | 인증이 필요합니다. | 토큰 없음/만료 | 토큰 재발급 |
| E403001 | 403 | 접근 권한이 없습니다. | 권한 부족 | 역할 확인 |
| E404001 | 404 | 요청한 리소스를 찾을 수 없습니다. | ID 미존재 | ID 확인 |
| E409001 | 409 | 이미 존재하는 데이터입니다. | 중복 | 기존 데이터 확인 |
| E429001 | 429 | 요청이 너무 많습니다. | Rate limit 초과 | 잠시 후 재시도 |
| E500001 | 500 | 서버 오류가 발생했습니다. | 서버 내부 오류 | 관리자 문의 |

---

## 5. 비즈니스 규칙

| 규칙 | 설명 |
|------|------|
| | |
| | |

---

## 6. Rate Limiting

| 항목 | 제한 |
|------|------|
| 요청 수 제한 | requests/minute |
| 인증 사용자 | /min |
| 비인증 사용자 | /min |
| Burst 허용 | |

---

## 7. 요청/응답 예시

### cURL
```bash
# 목록 조회
curl -X GET "https://api.example.com/api/v1/resource?page=1&limit=20" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"

# 생성
curl -X POST "https://api.example.com/api/v1/resource" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "field1": "value",
    "field2": 123
  }'

# 수정
curl -X PUT "https://api.example.com/api/v1/resource/1" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "field1": "updated value"
  }'

# 삭제
curl -X DELETE "https://api.example.com/api/v1/resource/1" \
  -H "Authorization: Bearer {token}"
```

---

## 8. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 0.1.0 | <% tp.date.now('YYYY-MM-DD') %> | 최초 작성 |

---

## 9. 관련 문서

- 기능명세서: [[FNC-]]
- 데이터 정의서: [[DAT-]]
- 에러 코드 정의서: [[ERR-]]
