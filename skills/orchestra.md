# 프로젝트 오케스트레이터

## 개요
새 프로젝트의 전체 개발 라이프사이클을 지휘하는 마스터 스킬.
기획 → 디자인 → 퍼블 → 프론트앱 → TC까지 단계별로 자동 진행한다.

## 명령어
```
/orchestra init [project-name]    ← 새 프로젝트 초기화 + 폴더 구조 생성
/orchestra scan                   ← 기존 프로젝트 분석 → ORCHESTRA.md 자동 생성
/orchestra status                 ← 전체 진행 상태 확인
/orchestra next                   ← 다음 미완료 단계 자동 실행
/orchestra next 3                 ← 다음 3개 단계 연속 실행
/orchestra phase [phase-id]       ← 특정 단계 실행 (예: 1a, 2b)
/orchestra sync                   ← 전체 산출물 싱크 체크
```

---

## 1. 개발 파이프라인

```
Phase 1: 기획 (Planning)
  ├── 1a. 자료 수집/분석 ─── plandata/ 폴더 분석 or 인터랙티브 Q&A
  ├── 1b. SRS 생성 ───────── docs/srs/
  ├── 1c. 기능명세서 ─────── docs/functional-spec/
  └── 1d. 화면설계 md ────── docs/screen-design/
           ↓
Phase 2: 디자인 (Design)
  ├── 2a. 디자인 토큰 ────── docs/screen-design/01-디자인-토큰.md
  ├── 2b. 공통 컴포넌트 ──── docs/screen-design/03-공통-컴포넌트.md
  └── 2c. 화면설계서 pen ─── pen/ (pencil-spec-doc loop)
           ↓
Phase 3: 퍼블리싱 (Publishing)
  ├── 3a. 프로젝트 세팅 ──── package.json, tailwind, prisma
  ├── 3b. DB 스키마 ───────── prisma/schema.prisma
  ├── 3c. 공통 레이아웃 ──── components/layout/
  ├── 3d. UI 컴포넌트 ────── components/ui/
  └── 3e. 페이지 퍼블 ────── app/(admin)/, app/(auth)/
           ↓
Phase 4: 프론트앱 (Frontend App)
  ├── 4a. API 라우트 ─────── app/api/
  ├── 4b. 상태관리 ────────── stores/, hooks/
  ├── 4c. API 연동 ────────── 페이지 ↔ API 연결
  ├── 4d. 비즈니스 로직 ──── lib/
  └── 4e. 외부 연동 ───────── lib/integrations/
           ↓
Phase 5: TC (Test Cases)
  ├── 5a. TC 리스트 생성 ─── tests/tc-list/
  ├── 5b. 단위 테스트 ────── tests/unit/
  └── 5c. E2E 테스트 ─────── tests/e2e/
           ↓
Phase 6: Living Spec (Vault ↔ Code 동기화)
  ├── 6a. Spec JSON Export ─── spec-data/ (vault-export)
  ├── 6b. SpecLabel 적용 ──── 페이지에 라벨 래핑 (publish)
  ├── 6c. Doc JSON Export ──── spec-data/docs/ (FNC/API → JSON)
  ├── 6d. 매핑 감사 ────────── audit-spec-mapping 리포트
  └── 6e. 정합성 검증 ─────── vault-check 리포트
```

---

## 2. 기존 프로젝트 분석 (`/orchestra scan`)

이미 개발이 진행된 프로젝트에서 현재 상태를 자동 감지하고 ORCHESTRA.md를 생성한다.

### 실행 로직

**Step 1: 프로젝트 스캔 (서브에이전트 3개 병렬)**

Agent A: 문서 상태 스캔 (subagent_type: Explore)
```
1. plandata/ 폴더 존재 + 내용물 확인 → 1a 상태 판단
2. docs/srs/ 존재 + 파일 수 + 완성도 → 1b 상태 판단
3. docs/functional-spec/ 존재 + 파일 수 → 1c 상태 판단
4. docs/client-spec/ 존재 + 파일 수 → 1c 보조
5. docs/screen-design/ 존재 + 파일 수 → 1d 상태 판단
6. docs/tc/ 존재 + 파일 수 → 5a 상태 판단

결과: 각 문서 Phase의 완료/미완료 + 파일 목록
```

Agent B: 코드 상태 스캔 (subagent_type: Explore)
```
1. package.json 존재 + 의존성 분석 → 3a 상태 판단 + 기술스택 감지
2. prisma/schema.prisma 존재 + 모델 수 → 3b 상태 판단
3. src/components/layout/ → 3c 상태 판단
4. src/components/ui/ → 3d 상태 판단 (컴포넌트 수)
5. src/app/(admin)/ or src/app/ 페이지 수 → 3e 상태 판단
6. src/app/api/ 라우트 수 → 4a 상태 판단
7. stores/, hooks/ → 4b 상태 판단
8. lib/ → 4d 상태 판단
9. lib/integrations/ → 4e 상태 판단
10. tests/ → 5b, 5c 상태 판단

결과: 각 코드 Phase의 완료/미완료 + 통계
```

Agent C: 디자인 상태 스캔 (subagent_type: Explore)
```
1. pen/ 폴더 존재 + .pen 파일 수 → 2c 상태 판단
2. pen/PROGRESS.md 존재 + 진행률 → 2c 상세
3. docs/screen-design/01-디자인-토큰.md → 2a 상태 판단
4. docs/screen-design/03-공통-컴포넌트.md → 2b 상태 판단
5. design/ 폴더 → 기타 디자인 자산

결과: 디자인 Phase 완료/미완료 + 진행률
```

**Step 2: 상태 자동 판정 규칙**

| Phase | 완료 [x] 조건 | 부분 [~] 조건 | 미착수 [ ] 조건 |
|-------|---------------|---------------|-----------------|
| 1a | plandata/ANALYSIS.md 존재 | plandata/에 파일 있지만 분석 안됨 | plandata/ 없거나 비어있음 |
| 1b | docs/srs/ 에 5개 이상 md | docs/srs/ 에 1~4개 md | docs/srs/ 없음 |
| 1c | docs/functional-spec/ 에 5개 이상 md | 1~4개 md | 없음 |
| 1d | docs/screen-design/ 에 10번대 파일 3개 이상 | 1~2개 | 없음 |
| 2a | 01-디자인-토큰.md 존재 + 3KB 이상 | 존재하지만 미완성 | 없음 |
| 2b | 03-공통-컴포넌트.md 존재 + 10KB 이상 | 존재하지만 미완성 | 없음 |
| 2c | pen/PROGRESS.md 기준 80% 이상 [x] | 1개 이상 [x] | 0개 |
| 3a | package.json + prisma + tailwind 설정 존재 | 일부만 존재 | 없음 |
| 3b | prisma/schema.prisma 존재 + 모델 5개 이상 | 모델 1~4개 | 없음 |
| 3c | layout 컴포넌트 3개 이상 | 1~2개 | 없음 |
| 3d | UI 컴포넌트 10개 이상 | 1~9개 | 없음 |
| 3e | 페이지 파일 전체의 80% 이상 | 1개 이상 | 없음 |
| 4a | API 라우트 전체의 80% 이상 | 1개 이상 | 없음 |
| 4b | stores/ or hooks/ 에 파일 존재 | - | 없음 |
| 4c | 페이지에서 API 호출 코드 있음 (fetch/tanstack) | 일부만 | 없음 |
| 4d | lib/ 에 비즈니스 로직 파일 존재 | - | 없음 |
| 4e | lib/integrations/ 존재 + PG/SMS 등 | 일부만 | 없음 |
| 5a | docs/tc/ 에 TC 문서 5개 이상 | 1~4개 | 없음 |
| 5b | tests/unit/ 에 테스트 파일 존재 | - | 없음 |
| 5c | tests/e2e/ 에 테스트 파일 존재 | - | 없음 |
| 6a | spec-data/ 에 JSON 5개 이상 | 1~4개 | 없음 |
| 6b | SpecLabel import 있는 페이지 80% 이상 | 1개 이상 | 없음 |
| 6c | spec-data/docs/ 에 JSON 1개 이상 | - | 없음 |
| 6d | audit-spec-mapping 리포트 MISMATCH 0개 | MISMATCH 존재 | 실행 안 됨 |
| 6e | vault-check Critical 0개 | Warning만 존재 | 실행 안 됨 |

**Step 3: ORCHESTRA.md 생성**
스캔 결과를 기반으로 ORCHESTRA.md를 자동 생성한다.
- 이미 완료된 단계: [x] + 감지된 산출물 경로
- 진행 중인 단계: [~] + 현재 상태 메모
- 미착수 단계: [ ]

**Step 4: 다음 단계 제안**
```
ORCHESTRA.md 기반으로:
1. 완료 현황 요약 (예: "Phase 1~4 완료, Phase 5 미착수")
2. 다음 실행 가능한 단계 제안 (의존성 체크 완료된 것만)
3. 불일치/누락 경고 (예: "기능명세서 14개 중 TC는 0개")
```

---

## 3. 프로젝트 초기화 (`/orchestra init`)

### 폴더 구조 생성
```
[project-root]/
├── plandata/                ← 기획 자료 업로드 (PDF, Excel, 이미지 등)
├── docs/
│   ├── srs/                ← Phase 1b: 요구사항 명세서
│   ├── client-spec/        ← Phase 1b: 고객용 명세서
│   ├── functional-spec/    ← Phase 1c: 기능명세서
│   └── screen-design/      ← Phase 1d: 화면설계 md
├── pen/                    ← Phase 2c: Pencil 화면설계서
│   └── PROGRESS.md
├── design/                 ← 기타 디자인 파일
├── src/                    ← Phase 3~4: 소스 코드
├── tests/
│   ├── tc-list/            ← Phase 5a: TC 리스트 (md)
│   ├── unit/               ← Phase 5b: 단위 테스트
│   └── e2e/                ← Phase 5c: E2E 테스트
├── ORCHESTRA.md            ← 오케스트레이션 마스터 진행표
└── CLAUDE.md               ← 프로젝트별 규칙
```

### ORCHESTRA.md 생성
```markdown
# [프로젝트명] 오케스트레이션

## 프로젝트 정보
- 이름: [name]
- 유형: [web/mobile/fullstack]
- 생성일: [date]
- 기술스택: [자동 결정 or 사용자 지정]

## 진행 현황

### Phase 1: 기획
| ID | 단계 | 상태 | 산출물 | 비고 |
|----|------|------|--------|------|
| 1a | 자료 수집/분석 | [ ] | plandata/ 분석 결과 | |
| 1b | SRS 생성 | [ ] | docs/srs/ | |
| 1c | 기능명세서 | [ ] | docs/functional-spec/ | |
| 1d | 화면설계 md | [ ] | docs/screen-design/ | |

### Phase 2: 디자인
| ID | 단계 | 상태 | 산출물 | 비고 |
|----|------|------|--------|------|
| 2a | 디자인 토큰 | [ ] | docs/screen-design/01-디자인-토큰.md | |
| 2b | 공통 컴포넌트 스펙 | [ ] | docs/screen-design/03-공통-컴포넌트.md | |
| 2c | 화면설계서 pen | [ ] | pen/*.pen | |

### Phase 3: 퍼블리싱
... (이하 동일 패턴)

### Phase 5: TC
...

### Phase 6: Living Spec
| ID | 단계 | 상태 | 산출물 | 비고 |
|----|------|------|--------|------|
| 6a | Spec JSON Export | [ ] | spec-data/*.json | |
| 6b | SpecLabel 적용 | [ ] | 페이지 SpecLabel 래핑 | |
| 6c | Doc JSON Export | [ ] | spec-data/docs/*.json | |
| 6d | 매핑 감사 | [ ] | audit-spec-mapping 리포트 | |
| 6e | 정합성 검증 | [ ] | vault-check 리포트 | |

## 변경 이력
- [date]: 프로젝트 초기화
```

---

## 3. Phase별 상세 실행 로직

### Phase 1a: 자료 수집/분석

**plandata/ 폴더에 자료가 있는 경우:**
```
1. plandata/ 폴더 스캔 (서브에이전트 병렬)
   - PDF → Read 도구로 분석
   - Excel/CSV → 구조 파악
   - 이미지 → 화면 캡처/와이어프레임 분석
   - 텍스트/md → 직접 읽기

2. 자료 종합 분석 결과 생성
   - 프로젝트 목적/배경
   - 핵심 기능 리스트
   - 사용자 역할/권한
   - 화면 목록 (추정)
   - 데이터 모델 (추정)
   - 외부 연동 (있으면)

3. 분석 결과를 plandata/ANALYSIS.md로 저장
4. 사용자에게 분석 결과 확인 요청
```

**plandata/ 폴더가 비어있는 경우:**
```
1. 인터랙티브 Q&A 시작 (AskUserQuestion 사용)

   Q1. 프로젝트 유형
   - 어드민 대시보드 / SaaS / 이커머스 / 커뮤니티 / 기타

   Q2. 핵심 기능 (복수 선택)
   - 회원관리 / 상품관리 / 결제 / 게시판 / 채팅 / 예약 / 통계 ...

   Q3. 사용자 역할
   - 관리자 / 일반 사용자 / 기타 역할

   Q4. 기술 스택 선호
   - Next.js / React / Vue / 기타
   - DB: PostgreSQL / MySQL / MongoDB

   Q5. 외부 연동
   - 결제(PG) / SMS / 이메일 / 소셜로그인 / 기타

   Q6. 특별 요구사항
   - 자유 텍스트 입력

2. 답변 기반으로 plandata/ANALYSIS.md 생성
3. 추가 질문이 필요하면 반복
```

### Phase 1b: SRS 생성
```
1. ANALYSIS.md 기반으로 /generate-srs 스킬 호출
2. docs/srs/ 에 12개 문서 생성
3. 사용자 리뷰 요청
```

### Phase 1c: 기능명세서 생성
```
1. SRS 기반으로 /generate-spec 스킬 호출
2. docs/functional-spec/ 에 기능별 문서 생성
3. docs/client-spec/ 에 고객용 문서 생성
```

### Phase 1d: 화면설계 md
```
1. 기능명세서 기반으로 화면 목록 도출
2. docs/screen-design/ 에 화면별 md 생성
   - 00-개요.md (네비게이션 구조, 화면 목록)
   - 01-디자인-토큰.md (Phase 2a와 연결)
   - 10~19번: 각 페이지 화면설계
3. pen/PROGRESS.md 초기 생성
```

### Phase 2a~2b: 디자인 토큰 + 공통 컴포넌트
```
1. 기술스택/프로젝트 유형에 맞는 디자인 토큰 결정
2. 공통 컴포넌트 목록 + 상태 매트릭스 정의
3. /pencil-init 스킬로 디자인 시스템 초기화
```

### Phase 2c: 화면설계서 pen
```
1. /pencil-spec-doc loop 실행
   - pen/PROGRESS.md 기반으로 미착수 항목 순차 처리
   - 서브에이전트 병렬 처리 (코드 분석 + 문서 분석)
2. 모든 화면 완료까지 반복
```

### Phase 3a~3e: 퍼블리싱
```
1. 프로젝트 세팅 (/project-init 또는 수동)
   - package.json, tsconfig, tailwind, prisma 설정
2. DB 스키마 생성 (SRS + 기능명세 기반)
3. 공통 레이아웃 (Sidebar, Header, etc.)
4. UI 컴포넌트 라이브러리 (Button, Input, Table, etc.)
5. 페이지별 퍼블리싱
   - pen 화면설계서 참조하여 코드 생성
   - docs/screen-design/ md 참조하여 구조 확인
```

### Phase 4a~4e: 프론트앱
```
1. API 라우트 생성 (기능명세 기반)
2. 상태관리 셋업 (Zustand, TanStack Query)
3. 페이지 ↔ API 연동
4. 비즈니스 로직 구현
5. 외부 연동 모듈 구현
```

### Phase 5a~5c: TC
```
1. TC 리스트 생성
   - 기능명세서 기반으로 테스트 케이스 도출
   - tests/tc-list/[기능명].md 형식
   - 각 TC: ID, 제목, 사전조건, 입력, 기대결과, 우선순위

2. 단위 테스트 코드 생성
3. E2E 테스트 코드 생성 (Playwright 기반)
```

### Phase 6a: Spec JSON Export
```
1. `npm run spec:export` 실행
2. vault 화면설계서 → spec-data/*.json 변환
3. _manifest.json 업데이트
4. 변경 리포트 확인
```

### Phase 6b: SpecLabel 적용
```
1. /vault-plan publish all 실행
2. 각 페이지에 SpecLabel 래핑
3. dev 서버에서 시각 확인
4. 스크린샷 캡처 → vault 임베드
```

### Phase 6c: Doc JSON Export
```
1. `node scripts/generate-doc-json.js --vault ${VAULT_PATH}` 실행
2. Vault FNC/API 마크다운 → spec-data/docs/ JSON 변환
3. Doc Viewer에서 FNC/API 문서 내용 확인 가능
```

### Phase 6d: 매핑 감사
```
1. `node scripts/audit-spec-mapping.js` 실행
2. 모든 페이지의 SpecLabel uiId ↔ SCR JSON 대조
3. OK/MISMATCH/NO_SCR 분류 리포트
4. MISMATCH 항목은 수동 확인 후 수정
```

### Phase 6e: 정합성 검증
```
1. `npm run spec:check` 실행
2. Critical/Warning/Info 리포트 확인
3. 불일치 항목 수정
4. 최종 리포트 ORCHESTRA.md에 기록
```

---

## 4. 서브에이전트 활용 전략

### 정보 수집 단계 (항상 병렬)
| Agent | 역할 | 입력 | 출력 |
|-------|------|------|------|
| A | plandata/ 분석 | PDF, Excel, 이미지 | 분석 결과 |
| B | 기존 문서 확인 | docs/ 폴더 | 현재 문서 상태 |
| C | 기존 코드 확인 | src/ 폴더 | 현재 코드 상태 |

### 생성 단계 (순차, 검증은 병렬)
```
생성 → [검증 Agent A: 문서 싱크] + [검증 Agent B: 코드 싱크] → 결과 통합
```

### 컨텍스트 절약 전략
```
1. 큰 파일은 서브에이전트에게 분석 위임 (요약본만 받기)
2. 관련 없는 Phase 정보는 서브에이전트에 보내지 않기
3. pen 파일 생성은 반드시 메인에서 (Pencil MCP 직접 호출)
4. ORCHESTRA.md 읽기 → 현재 Phase만 집중
```

---

## 5. ORCHESTRA.md 자동 업데이트 규칙

```
작업 시작: [ ] → [~] + 시작 시간
작업 완료: [~] → [x] + 완료 시간 + 산출물 경로
오류 발생: [~] → [!] + 오류 내용
싱크 불일치: [x] → [!] + 불일치 내용

변경 이력에 모든 상태 변경 기록
```

---

## 6. `/orchestra next` 실행 로직

```python
# 의사 코드
def orchestra_next(count=1):
    orchestra = read("ORCHESTRA.md")

    for i in range(count):
        # 1. 미완료 단계 중 첫 번째 찾기
        next_phase = find_first(orchestra, status=["[ ]"])

        if not next_phase:
            print("모든 단계 완료!")
            return

        # 2. 의존성 체크 (이전 단계가 완료되었는지)
        deps = get_dependencies(next_phase)
        if any(dep.status != "[x]" for dep in deps):
            print(f"선행 단계 미완료: {deps}")
            return

        # 3. 상태 업데이트: [~] 진행중
        update_orchestra(next_phase, "[~]")

        # 4. 해당 단계 실행 (Phase별 로직)
        execute_phase(next_phase)

        # 5. 상태 업데이트: [x] 완료
        update_orchestra(next_phase, "[x]")

        # 6. 싱크 체크
        check_sync()
```

---

## 7. 의존성 맵

```
1a ──→ 1b ──→ 1c ──→ 1d
                       ↓
              2a ──→ 2b ──→ 2c
                              ↓
                     3a ──→ 3b ──→ 3c ──→ 3d ──→ 3e
                                                    ↓
                                           4a ──→ 4b ──→ 4c ──→ 4d ──→ 4e
                                                                          ↓
                                                                 5a ──→ 5b ──→ 5c
                                                                                  ↓
                                                                        6a ──→ 6b ──→ 6c ──→ 6d ──→ 6e
```

각 단계는 **이전 단계가 [x] 완료** 상태여야 실행 가능.
단, 같은 Phase 내에서 독립적인 단계는 병렬 실행 가능:
- 3c + 3d 동시 가능 (레이아웃과 UI 컴포넌트는 독립)
- 5b + 5c는 5a 완료 후 동시 가능

---

## 8. 싱크 체크 (`/orchestra sync`)

```
체크 항목:
1. docs/functional-spec/ ↔ docs/screen-design/ (화면 목록 일치?)
2. docs/screen-design/ ↔ pen/*.pen (설계서 pen 파일 존재?)
3. docs/screen-design/ ↔ src/app/ (코드 페이지 존재?)
4. pen/PROGRESS.md ↔ pen/*.pen (진행상태 정확?)
5. src/app/api/ ↔ docs/functional-spec/ (API 일치?)
6. tests/tc-list/ ↔ docs/functional-spec/ (TC 커버리지?)

결과: ORCHESTRA.md 하단에 싱크 리포트 추가
```

---

## 9. Phase별 사용하는 기존 스킬

| Phase | 스킬 | 설명 |
|-------|------|------|
| 1b | `/generate-srs` | SRS 문서 생성 |
| 1c | `/generate-spec` | 기능명세서 생성 |
| 1d | - | 화면설계 md 직접 생성 |
| 2a-2b | `/pencil-init` | 디자인 시스템 초기화 |
| 2c | `/pencil-spec-doc loop` | 화면설계서 pen 생성 |
| 2c | `/pencil-check` | 디자인 상태 누락 체크 |
| 전체 | `/sync-docs` | 문서 싱크 체크 |
| 6a-6e | `/vault-plan publish` | Living Spec 퍼블리시 |
| 6c | `/living-spec doc-export` | FNC/API 문서 JSON 생성 |
| 6d | `/living-spec audit` | 매핑 정합성 감사 |

---

## 10. 터미널 실행 예시

```bash
# 새 프로젝트 시작
claude "/orchestra init my-saas-project"

# 기획 자료 넣고 분석
cp 기획서.pdf plandata/
claude "/orchestra phase 1a"

# 다음 단계 자동 실행
claude "/orchestra next"

# 상태 확인
claude "/orchestra status"

# Phase 2까지 한번에
claude "/orchestra next 8"

# 특정 단계만
claude "/orchestra phase 2c"

# 전체 싱크 체크
claude "/orchestra sync"
```

---

## 11. 주의사항

- 각 Phase 완료 후 사용자 확인을 받는다 (자동으로 다음 Phase 넘어가지 않음)
- 단, `/orchestra next N` 으로 N개 연속은 가능
- plandata/ 에 자료가 추가되면 1a부터 재분석 필요 (사용자 판단)
- 코드 생성(Phase 3~4)은 반드시 설계(Phase 1~2) 완료 후
- ORCHESTRA.md는 단일 진실 소스(Single Source of Truth)
- 모든 산출물은 상대 경로로 ORCHESTRA.md에서 참조 가능
