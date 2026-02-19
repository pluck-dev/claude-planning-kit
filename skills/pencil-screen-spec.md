# 화면설계서 생성 스킬 (Pencil.dev)

## 개요
Pencil MCP를 사용하여 **코드 기반 화면설계서**를 생성한다.
- 왼쪽: 실제 코드를 참고한 정확한 와이어프레임 + 번호 라벨
- 오른쪽: **기획자/PM용 기능 설명 Description** (기능, 요구사항, 비즈니스 로직)
- md 문서 ↔ 코드 ↔ pen 설계서 3자 싱크 보장

## 호출
```
/pencil-spec-doc [screenId] [screenName]
```

---

## 1. 핵심 원칙

### 와이어프레임 = 실제 코드 반영
```
절대 와이어프레임을 "상상"으로 그리지 않는다.
반드시 코드를 먼저 읽고, 실제 UI 구조를 반영한다.
와이어프레임 자체에 스타일 디테일은 불필요 (회색 톤 와이어프레임).
```

### Description = 기획/기능 설명 (스타일 금지!)
```
★ 절대 금지: Tailwind 클래스, CSS 속성, px 값, 색상 코드
★ 반드시 포함:
  - 이 영역이 무엇인지 (기능 설명 1~2줄)
  - 사용자 동작 (클릭, 입력, 선택 시 무슨 일이 일어나는지)
  - 비즈니스 규칙 (조건, 제약, 권한)
  - 데이터 출처 및 표시 규칙
  - 화면 이동 경로 (어디로 이동하는지)
  - 상태별 동작 (데이터 없을 때, 에러 시)
```

### Description 작성 예시 (참고 이미지 기반)
```
❌ 잘못된 예 (스타일 중심):
"• 라벨: 이메일 (text-sm, font-medium, gray-700)
 • 입력필드: h-10 (40px), rounded-md, border gray-300
 • 포커스: ring-2 blue-500, border-blue-500"

✅ 올바른 예 (기능/기획 중심):
"검색 키워드 입력
 - 회원명, 전화번호, 이메일 등의 정보 입력을 통해 검색 가능
 - Enter 키 또는 검색 버튼 클릭 시 검색 실행
 - 검색어 2자 이상 입력 시 자동완성 제공"

✅ 올바른 예2:
"가맹점 상태 정보
 - 가맹점 상태를 확인/수정할 수 있는 드롭다운 버튼
 - '변경' 버튼을 클릭하면 상태를 변경시킴
 - 상태별 필수 정보 입력이 되어야 변경 가능"
```

### 3자 싱크
```
docs/screen-design/*.md  ←→  코드(src/app)  ←→  pen/*.pen
어느 하나가 변경되면 나머지도 함께 업데이트
```

---

## 2. 파일/폴더 구조

### pen/ 디렉토리
```
pen/
├── PROGRESS.md              ← 진행사항 추적 (자동 업데이트)
├── 01-auth.pen              ← 화면별 개별 파일
├── 02-dashboard.pen
├── 03-members.pen
├── 04-products.pen
├── ...
└── layout.pen               ← 공통 레이아웃 (있으면 참조)
```

### 파일 네이밍 규칙
```
[순번]-[영문키워드].pen
- 순번: 01~99 (PROGRESS.md 번호와 일치)
- 영문키워드: 화면 도메인을 영문 소문자로 (auth, dashboard, members 등)
- 한 화면 도메인의 서브 화면은 같은 파일에 포함 (예: 회원 목록 + 상세 + 등록 → 03-members.pen)
```

### 파일 저장 필수!
```
★ Pencil MCP로 pen 파일 생성 후 반드시 디스크에 저장되어야 한다.
1. open_document로 기존 .pen 파일을 열거나 새 파일 생성
2. batch_design으로 내용 추가
3. Pencil 앱에서 Cmd+S 또는 자동 저장으로 디스크에 반영 확인
4. ls pen/*.pen 으로 파일 존재 확인
```

### PROGRESS.md 자동 업데이트
작업 시작/완료 시 반드시 pen/PROGRESS.md를 업데이트한다:
- `[ ]` → `[~]` (착수)
- `[~]` → `[x]` (완료)
- `[x]` → `[!]` (코드와 불일치 발견)
- 마지막 업데이트 날짜 갱신

---

## 3. 작업 워크플로우 (서브에이전트 병렬 처리)

### Step 0: 정보 수집 (병렬 - Task 서브에이전트 사용)

동시에 2개 서브에이전트를 실행한다:

**Agent A: 코드 + UI 분석** (subagent_type: Explore)
```
대상 페이지의 실제 코드를 읽고 분석:
1. 페이지 컴포넌트 구조 (JSX 레이아웃)
2. 사용된 UI 컴포넌트 (DataTable, Form, Tabs 등)
3. API 호출 패턴과 데이터 구조
4. 비즈니스 로직 (필터, 정렬, 검증, 권한)
5. 사용자 인터랙션 (클릭, 입력, 이동 경로)

결과: 와이어프레임 구조 + 기능별 동작 설명
```

**Agent B: 기획/문서 분석** (subagent_type: Explore)
```
관련 문서를 읽고 분석:
1. docs/screen-design/*.md → 화면 설계 스펙
2. docs/functional-spec/*.md → 기능 명세
3. Prisma schema → 데이터 모델
4. 기존 pen 파일 + PROGRESS.md 진행 상황

결과: Description에 넣을 기능/요구사항 정보 + 파일 경로
```

### Step 1: 와이어프레임 설계
Agent A 결과를 기반으로 스크린 내부 구조를 결정한다:
- 실제 코드의 레이아웃 구조 그대로 반영
- 테이블 컬럼은 코드의 실제 DataTable 컬럼과 일치
- 폼 필드는 코드의 실제 폼 구성과 일치
- 와이어프레임은 단순한 회색 톤 (디테일한 스타일 불필요)

### Step 2: Description 작성 (★ 기능/기획 중심)
Agent A+B 결과를 기반으로 각 영역의 Description을 작성한다:

```
[번호] [영역 제목]
  - 이 영역이 무엇인지 (1줄 설명)
  - 사용자가 할 수 있는 동작
  - 비즈니스 규칙/제약 조건
  - 데이터 표시 규칙
  - 클릭 시 이동 경로

[번호-1] [하위 요소 제목]
  - 하위 요소의 기능 설명
  - 동작 조건
```

**Description 번호 체계:**
- 메인 영역: 1, 2, 3, 4, ...
- 하위 요소: 1-1, 1-2, 3-1, 3-2, ...
- 와이어프레임의 배지 번호와 1:1 매칭

### Step 3: pen 파일 생성 (Pencil MCP)
위에서 결정된 구조로 batch_design 호출

### Step 4: 검증 + 저장 + 진행사항 업데이트
- get_screenshot으로 시각 검증
- 파일이 디스크에 저장되었는지 확인
- PROGRESS.md 업데이트

---

## 4. Description 작성 가이드 (상세)

### 영역별 Description 템플릿

**목록 화면:**
```
1  페이지 헤더
   - [화면명] 페이지의 메인 타이틀
   - Breadcrumb으로 현재 위치 표시

2  검색/필터 영역
   - [검색 대상 필드들]을 통해 검색 가능
   - [필터 조건들] 드롭다운으로 필터링
   - 초기화 버튼으로 모든 필터 해제

3  데이터 테이블
   - [표시 데이터 설명]
   - 컬럼: [주요 컬럼 나열]
   - 정렬: [정렬 가능한 컬럼]
   - 페이지네이션: [페이지당 건수]

3-1  상태 배지
   - [상태값]별 시각적 구분
   - [상태 전환 규칙 설명]

3-2  액션 버튼
   - 클릭 시 [이동 경로] 또는 [동작]
```

**상세/등록 화면:**
```
1  기본 정보 영역
   - [엔티티]의 핵심 정보 표시
   - 수정 가능 여부: [조건]

2  탭 메뉴
   - 현재 선택된 탭은 컬러로 표시
   - 탭 이동 시 수정중인 자료는 저장되지 않음
   - 수정 중인 자료가 있는 상태로 탭 이동 시 경고 메시지 표시

3  컨텐츠 영역
   - [각 탭의 컨텐츠 설명]

4  저장/취소 버튼
   - 수정한 내용을 저장하거나 취소하는 버튼
   - 필수 입력값 미입력 시 저장 불가 + 에러 표시
```

### Description에 절대 넣지 않는 것
```
금지 목록:
- Tailwind 클래스 (text-sm, bg-gray-50, rounded-lg 등)
- CSS 속성 (fontSize, fontWeight, padding 등)
- 색상 코드 (#FFFFFF, #374151, blue-600 등)
- 픽셀값 (h-10, 40px, gap-4, 16px 등)
- 컴포넌트 기술 명칭 (useState, useEffect, TanStack Query 등)
```

---

## 5. 와이어프레임 스타일

### 와이어프레임은 단순하게
```
- 회색 톤 중심의 로우파이 와이어프레임
- 코드의 레이아웃 구조만 정확하게 반영
- 텍스트는 실제 라벨/플레이스홀더 사용
- 아이콘은 icon_font (lucide) 사용
- 과도한 디테일 불필요 (그림자, 그라데이션 등 생략 가능)
```

### screenType별 설정

| 속성 | mobile | web |
|------|--------|-----|
| 스크린 너비 | 280px | 720px |
| 스크린 높이 | 560px | 480~520px |
| cornerRadius | 16 | 8 |
| 첫 스크린 테두리 | 파란색(#3B82F6) 2px | 파란색(#3B82F6) 2px |
| 나머지 테두리 | 회색(#CCCCCC) 1px | 회색(#CCCCCC) 1px |

---

## 6. 생성 구조

```
Page Frame (layout: vertical, fill: #FFFFFF)
├── Header Bar (fill: #1E1E1E, height: 48)
│   ├── Screen ID (white, bold)
│   └── Screen Name (white, normal)
└── Content Area (horizontal, gap: 32, padding: 32)
    ├── Screens Area
    │   └── Screen Wrapper
    │       ├── Screen Frame (layout: none, clip: true)
    │       │   ├── [코드 기반 와이어프레임]
    │       │   └── Badge N (빨간 원형, 절대 위치)
    │       └── Label
    └── Description Area (왼쪽 border)
        ├── "DESCRIPTION" Title (빨간 배경 가능)
        └── Section N (배지 + 제목 + 기능 설명 본문)
```

---

## 7. batch_design 호출 순서

### Step 0: 파일 준비
```
1. pen/ 폴더 확인 (ls pen/*.pen)
2. PROGRESS.md에서 대상 화면의 pen 파일명 확인 (예: 03-members.pen)
3. 해당 .pen 파일이 있으면 open_document로 열기
4. 없으면 open_document("new")로 새 파일 생성 → pen/[순번]-[키워드].pen 으로 저장
5. 같은 도메인의 서브 화면은 같은 파일에 추가 (예: 회원 목록+상세+등록 → 03-members.pen)
6. Pencil 앱이 실행 중이어야 함 (open -a Pencil)
7. PROGRESS.md 상태를 [~]로 업데이트
```

### Step 1~7:
- Step 1: placeholder 프레임 생성
- Step 2: 헤더 + 콘텐츠 컨테이너
- Step 3: 스크린 프레임
- Step 4: **코드 기반** 와이어프레임 내용 (로우파이)
- Step 5: 번호 배지 (하위 번호 포함: 1, 1-1, 2, 3, 3-1 등)
- Step 6: **기능/기획 중심** Description
- Step 7: placeholder 해제 + 스크린샷 + PROGRESS.md [x] 업데이트

### Step 8: 파일 저장 확인
```
1. ls pen/*.pen 으로 파일 존재 확인
2. 없으면 사용자에게 Pencil 앱에서 Cmd+S 요청
```

---

## 8. 스타일 규칙 (Pencil 프레임용)

### 색상
| 용도 | 색상 |
|------|------|
| 헤더 배경 | #1E1E1E |
| 헤더 텍스트 | #FFFFFF |
| 페이지 배경 | #FFFFFF |
| 번호 배지 | #EF4444 |
| 첫 스크린 테두리 | #3B82F6 |
| 나머지 테두리 | #CCCCCC |
| 구분선 | #E5E7EB |
| Description 보더 | #E0E0E0 |
| 본문 텍스트 | #444444 |
| 제목 텍스트 | #000000 |

### 타이포그래피 (fontFamily: Inter)
| 용도 | fontSize | fontWeight |
|------|----------|------------|
| 헤더 ID | 16 | 700 |
| 헤더 이름 | 16 | 400 |
| Description 타이틀 | 20 | 700 |
| 섹션 제목 | 16 | 700 |
| 섹션 본문 | 12 | 400 |
| 배지 숫자 | 12 | 700 |
| 스크린 라벨 | 12 | 500 |

### 간격
| 용도 | 값 |
|------|-----|
| 콘텐츠 패딩 | 32 |
| 스크린 간 gap | 24 |
| 스크린-Description gap | 32 |
| 섹션 간 gap | 20 |
| 화면설계서 프레임 간 gap | 80 |

---

## 9. Loop 실행 지원

이 스킬은 반복 실행을 지원한다:

```
1. pen/PROGRESS.md 읽기
2. 상태가 [ ] (미착수)인 항목 중 가장 첫 번째 찾기
3. 해당 화면의 코드 + 문서 분석 (서브에이전트 병렬)
4. pen 파일 생성/업데이트
5. PROGRESS.md 업데이트
6. 다음 미착수 항목으로 반복
```

### Loop 시작 명령
```
/pencil-spec-doc loop        ← 미착수 항목 순차 처리
/pencil-spec-doc loop 3      ← 미착수 항목 3개만 처리
/pencil-spec-doc SC-012      ← 특정 화면만 처리
```

---

## 10. 프로젝트별 참조 경로

### FitGenie (스포짐)
```
코드:
  관리자: fitgenie/src/app/(admin)/[page]/page.tsx
  회원앱: fitgenie/src/app/member-app/[page]/page.tsx
  API:    fitgenie/src/app/api/[endpoint]/route.ts
  UI:     fitgenie/src/components/ui/
  레이아웃: fitgenie/src/components/layout/
  타입:   fitgenie/src/types/
  스키마: fitgenie/prisma/schema.prisma

문서:
  화면설계: docs/screen-design/[번호]-[이름].md
  기능명세: docs/functional-spec/[번호]-[이름].md
  SRS:     docs/srs/

디자인:
  pen:     pen/
```

---

## 11. 주의사항

- batch_design 최대 25 operation/call
- 와이어프레임은 반드시 코드 분석 후 그린다 (상상 금지)
- **Description은 기능/요구사항/기획 중심 (CSS/스타일 절대 금지!)**
- 코드에 없는 기능을 설계서에 넣지 않는다 (있는 것만 정확하게)
- 코드와 문서가 불일치하면 PROGRESS.md에 [!] 표시 후 사용자에게 알림
- 서브에이전트는 코드/문서 분석에만 사용 (pen 파일 생성은 메인에서)
- 생성 후 반드시 get_screenshot으로 시각 검증
- PROGRESS.md는 작업 시작/완료 시 반드시 업데이트
- **pen 파일이 디스크에 저장되었는지 반드시 확인 (ls pen/*.pen)**
- Pencil 앱이 실행 중이어야 MCP 도구가 작동함
