# Vault 기획 스킬

## 개요
옵시디언 Vault 기반 서비스 기획 스킬. LLM과 대화하며 기획하고, 구조화된 문서를 Vault에 자동 생성한다.
GitHub Template Repository `pluck-dev/obsidian-service-planning` 기반.

## 명령어
```
/vault-plan [기능명/프로젝트명]    ← 기획 시작 (모드 선택 질문)
/vault-plan interview [기능명]     ← A. 인터뷰 모드 직접 진입
/vault-plan prd [프로젝트명]       ← B. PRD-First 폭포수 모드
/vault-plan team [프로젝트명]      ← C. 멀티에이전트 동시 기획
/vault-plan sync                   ← D. 양방향 싱크 체크
/vault-plan progressive [기능명]   ← E. 점진적 상세화 모드
/vault-plan status                 ← 현재 Vault 문서 현황
/vault-plan next-id [PREFIX]       ← 다음 사용 가능 ID 확인
/vault-plan publish [screenId]     ← F. Living Spec 퍼블리시
/vault-plan publish all            ← F. 전체 화면 퍼블리시
```

---

## 0. Vault 경로 탐지

스킬 실행 시 가장 먼저 Vault 경로를 결정한다:

```
1. 현재 디렉토리(cwd)에 00-HOME.md가 있으면 → cwd가 Vault
2. 없으면 → 사용자에게 Vault 경로를 질문
   - "Vault 경로를 입력해주세요 (예: ~/Documents/my-project-vault)"
3. Vault 경로가 결정되면 이하 모든 파일 작업은 해당 경로 기준
```

**VAULT_ROOT** = 탐지된 Vault 경로 (이하 모든 경로는 이 기준)

---

## 1. 모드 선택 (인자 없이 `/vault-plan` 실행 시)

AskUserQuestion으로 모드를 먼저 물어본다:

```
질문: "어떤 방식으로 기획할까요?"

옵션:
A. 인터뷰 기반 - Claude가 항목별로 질문하며 문서 완성 (신규 기능 상세 기획)
B. PRD-First - PRD 하나 작성 후 나머지 문서 자동 파생 (전체 시스템 빠른 초안)
C. 멀티에이전트 - PM/디자인/개발/QA 에이전트가 동시에 문서 생성 (대규모 킥오프)
D. 싱크 체크 - 기존 문서 간 불일치 탐지 + 자동 업데이트 (유지보수)
E. 점진적 상세화 - 러프한 아이디어부터 세션별로 점점 상세화 (초기 아이디어)
F. Living Spec 퍼블리시 - SCR → JSON → SpecLabel → 스크린샷 → Vault 임베드 (화면 공개)
```

---

## 2. 공통 규칙

### 2.1 문서 ID 체계

| Prefix | 문서 타입 | 폴더 |
|--------|----------|------|
| `PRD` | PRD | `01-공통/PRD/` |
| `UST` | 유저 스토리 | `01-공통/유저스토리/` |
| `PRS` | 유저 페르소나 | `01-공통/유저페르소나/` |
| `FLW` | 화면 흐름도 | `01-공통/화면흐름도/` |
| `GLO` | 용어 사전 | `01-공통/용어사전/` |
| `MTG` | 회의록 | `01-공통/회의록/` |
| `CHG` | 변경 이력 | `01-공통/변경이력/` |
| `SVC` | 서비스 컨셉 | `02-기획-디자인/서비스컨셉/` |
| `IA` | 정보 구조 | `02-기획-디자인/IA/` |
| `SCR` | 화면설계서 | `02-기획-디자인/화면설계서/` |
| `SCN` | 유저 시나리오 | `02-기획-디자인/유저시나리오/` |
| `STS` | 상태별 화면 정의 | `02-기획-디자인/상태화면정의/` |
| `DTK` | 디자인 토큰 | `02-기획-디자인/디자인토큰/` |
| `FNC` | 기능명세서 | `03-개발/기능명세서/` |
| `API` | API 명세서 | `03-개발/API명세서/` |
| `DAT` | 데이터 정의서 | `03-개발/데이터정의서/` |
| `ERR` | 에러 코드 정의서 | `03-개발/에러코드정의서/` |
| `PRM` | 권한 매트릭스 | `03-개발/권한매트릭스/` |
| `STT` | 상태 전이도 | `03-개발/상태전이도/` |
| `TC` | 테스트 케이스 | `04-QA/TC/` |
| `CKL` | 체크리스트 | `04-QA/체크리스트/` |

### 2.2 다음 ID 자동 계산

문서 생성 전, 해당 폴더를 스캔해서 다음 번호를 자동 결정:

```bash
# 예: 03-개발/기능명세서/ 에 FNC-001.md, FNC-002.md가 있으면
# 다음 ID = FNC-003
ls ${VAULT_ROOT}/{폴더}/ | grep -oP '{PREFIX}-\d+' | sort -t- -k2 -n | tail -1
```

없으면 `{PREFIX}-001`부터 시작.

### 2.3 Frontmatter 규칙

모든 문서는 아래 frontmatter를 포함:

```yaml
---
id: "{PREFIX}-{NNN}"
title: "{문서 제목}"
type: "{document_type}"     # prd, functional-spec, screen-design, api-spec, test-case 등
status: "draft"             # draft | in-review | approved | revision-needed | deprecated
version: "0.1.0"
created: "{오늘 날짜 YYYY-MM-DD}"
updated: "{오늘 날짜 YYYY-MM-DD}"
author: ""
reviewer: ""
approver: ""
tags: [{카테고리 태그}]
related: []                 # 관련 문서 위키링크 ["[[FNC-001]]", "[[SCR-001]]"]
priority: "medium"          # critical | high | medium | low
phase: ""
---
```

### 2.4 Cross-Reference 자동 연결

문서 생성 시, 관련 문서의 `related` 필드도 함께 업데이트:
- FNC-001 생성 시 → SCR-001의 related에 `[[FNC-001]]` 추가
- TC-001 생성 시 → FNC-001, SCR-001의 related에 `[[TC-001]]` 추가

### 2.5 Templater 변수 vs 직접 작성

- **옵시디언에서 수동 생성**: Templater 변수(`<% tp.file.cursor() %>`)가 동작
- **Claude가 자동 생성**: Templater 변수 대신 실제 값을 채워서 작성
  - `<% tp.file.cursor(1) %>` → 실제 ID (예: "FNC-003")
  - `<% tp.date.now('YYYY-MM-DD') %>` → 실제 날짜 (예: "2026-02-19")

---

## 3. 모드별 실행 로직

### A. 인터뷰 모드 (`/vault-plan interview [기능명]`)

Claude가 기획 문서의 각 섹션별로 구조화된 질문을 던져 빠뜨림 없이 문서를 완성한다.

**Phase 1: 기본 정보 수집**
```
질문 흐름:
1. "이 기능의 한 줄 설명은?" → 기능 개요
2. "주요 사용자는 누구?" → 페르소나/권한
3. "어떤 플랫폼? (웹/앱/둘 다)" → platform 필드
4. "우선순위는? (Critical/High/Medium/Low)" → priority 필드
5. "관련 기존 문서가 있나요?" → related 필드
```

**Phase 2: 기능 상세 (FNC 생성용)**
```
질문 흐름:
1. "핵심 기능 요구사항을 나열해주세요" → FR 항목
2. "비즈니스 규칙이 있나요? (예: 5회 실패 시 잠금)" → BR 항목
3. "입력 데이터와 유효성 검증 규칙은?" → Validation 섹션
4. "에러 상황과 처리 방법은?" → 에러 처리 섹션
5. "상태 변경이 있나요? (예: ACTIVE → LOCKED)" → 상태 전이
```

**Phase 3: 화면 상세 (SCR 생성용)**
```
질문 흐름:
1. "화면에 어떤 UI 요소가 필요해요?" → UI 구성요소 표
2. "각 상태별 화면은? (로딩/빈값/에러/성공)" → 상태별 화면 정의
3. "주요 인터랙션은? (클릭/스와이프/스크롤)" → 인터랙션 정의
4. "반응형 대응은? (Desktop/Tablet/Mobile)" → 반응형 섹션
```

**Phase 4: API 상세 (API 생성용)**
```
질문 흐름:
1. "필요한 API 엔드포인트를 나열해주세요" → 엔드포인트 목록
2. "각 API의 요청/응답 필드는?" → Request/Response 스키마
3. "인증 방식은? (JWT/세션/API키)" → 인증 섹션
```

**Phase 5: 문서 생성**
```
수집된 답변을 기반으로 다음 문서를 자동 생성:
1. FNC-{NNN}.md → ${VAULT_ROOT}/03-개발/기능명세서/
2. SCR-{NNN}.md → ${VAULT_ROOT}/02-기획-디자인/화면설계서/
3. API-{NNN}.md → ${VAULT_ROOT}/03-개발/API명세서/ (API가 있는 경우)
4. TC-{NNN}.md → ${VAULT_ROOT}/04-QA/TC/

+ 모든 문서 간 related 필드 자동 연결
```

**질문 규칙:**
- AskUserQuestion 사용 (선택지가 있는 경우)
- 자유 입력이 필요한 경우 일반 대화로 질문
- Phase별로 2~5개 질문, 총 10~15개 이내
- 사용자가 "모르겠다" / "나중에" 하면 해당 섹션 빈칸으로 두고 TODO 마킹

---

### B. PRD-First 폭포수 모드 (`/vault-plan prd [프로젝트명]`)

PRD 하나를 대화로 완성한 뒤, 나머지 문서를 자동 파생한다.

**Step 1: PRD 대화**
```
사용자와 자유 대화로 PRD 내용을 구체화:
- 배경/목적
- 타겟 유저
- 핵심 기능 목록
- 비기능 요구사항
- 우선순위/마일스톤
```

**Step 2: PRD 생성**
```
PRD-{NNN}.md → ${VAULT_ROOT}/01-공통/PRD/
```

**Step 3: 기능 분해 (자동)**
```
PRD의 "핵심 기능 목록"에서 자동 추출:
- 기능 1 → FNC-001
- 기능 2 → FNC-002
- 기능 3 → FNC-003
...

각 FNC에서 파생:
- FNC-001 → SCR-001 (화면설계서)
- FNC-001 → API-001 (API명세서)
- FNC-001 → TC-001 (테스트케이스)
```

**Step 4: 일괄 생성**
```
서브에이전트 병렬 실행:
Agent 1: FNC-001~N 생성 (oh-my-claudecode:executor)
Agent 2: SCR-001~N 생성 (oh-my-claudecode:executor)
Agent 3: API-001~N 생성 (oh-my-claudecode:executor)
Agent 4: TC-001~N 생성 (oh-my-claudecode:executor)

모든 문서 간 related 자동 연결
```

**Step 5: 결과 요약**
```
생성된 문서 목록 + ID 매핑 표 출력:
| 기능 | FNC | SCR | API | TC |
|------|-----|-----|-----|-----|
| 로그인 | FNC-001 | SCR-001 | API-001 | TC-001 |
| 회원가입 | FNC-002 | SCR-002 | API-002 | TC-002 |
...
```

---

### C. 멀티에이전트 동시 기획 (`/vault-plan team [프로젝트명]`)

OMC team을 사용해 4개 역할의 에이전트가 동시에 문서를 생성한다.

**Step 1: 기획 브리프 수집**
```
사용자에게 짧은 프로젝트 브리프를 받는다:
- 프로젝트명
- 핵심 기능 3~5개 (한 줄씩)
- 타겟 유저
- 기술 스택 (있으면)
```

**Step 2: Team 구성**
```
TeamCreate로 4개 에이전트 생성:

pm-agent (oh-my-claudecode:executor):
  → PRD-001, UST-001~N, PRS-001 생성
  → ${VAULT_ROOT}/01-공통/ 하위

design-agent (oh-my-claudecode:executor):
  → SVC-001, IA-001, SCR-001~N, SCN-001~N, STS-001 생성
  → ${VAULT_ROOT}/02-기획-디자인/ 하위

dev-agent (oh-my-claudecode:executor):
  → FNC-001~N, API-001~N, DAT-001, ERR-001, PRM-001 생성
  → ${VAULT_ROOT}/03-개발/ 하위

qa-agent (oh-my-claudecode:executor):
  → TC-001~N, CKL-001 생성
  → ${VAULT_ROOT}/04-QA/ 하위
```

**Step 3: 에이전트 프롬프트 규칙**

각 에이전트에게 전달하는 프롬프트에 반드시 포함:
```
1. VAULT_ROOT 경로
2. 브리프 전문
3. 담당 문서 ID 범위 (충돌 방지)
4. frontmatter 규칙 (섹션 2.3)
5. 참조할 _templates/ 경로
6. related 필드에 넣을 다른 에이전트 담당 문서 ID
```

**Step 4: Cross-Reference 정합성 체크**
```
모든 에이전트 완료 후:
1. 전체 문서의 related 필드 스캔
2. 양방향 링크 누락 탐지 → 자동 추가
3. 결과 리포트 출력
```

---

### D. 싱크 체크 모드 (`/vault-plan sync`)

기존 Vault 문서 간 불일치를 탐지하고 자동 업데이트한다.

**체크 항목:**

```
1. Cross-Reference 정합성
   - FNC-001이 SCR-001을 참조 → SCR-001도 FNC-001을 참조하는지?
   - 양방향 링크 누락 탐지 → 자동 추가 제안

2. 상태 일관성
   - FNC-001이 approved인데 관련 SCR-001이 아직 draft → 경고
   - TC가 없는 FNC → "TC 누락" 경고

3. ID 연속성
   - FNC-001, FNC-003 (FNC-002 누락) → 경고

4. Frontmatter 필수 필드
   - id, title, type, status, version 누락 → 경고

5. 고립 문서
   - related가 비어있는 문서 → "연결 필요" 경고

6. 버전 불일치
   - FNC가 v1.2.0인데 관련 SCR이 v0.1.0 → "업데이트 필요" 경고
```

**출력 형식:**
```markdown
## Vault 싱크 리포트

### 🔴 Critical (즉시 수정 필요)
- [ ] SCR-003: related에 FNC-003 누락

### 🟡 Warning (확인 필요)
- [ ] FNC-002: 관련 TC 문서 없음
- [ ] API-005: 고립 문서 (related 비어있음)

### 🟢 Info
- 총 문서: 24개
- 연결된 쌍: 18개
- 평균 연결 수: 2.3개/문서
```

**자동 수정:**
사용자 확인 후, Critical 항목은 자동으로 related 필드 업데이트.

---

### E. 점진적 상세화 모드 (`/vault-plan progressive [기능명]`)

세션을 나눠서 점진적으로 문서를 상세화한다. Vault가 세션 간 메모리 역할.

**세션 1: 아이디어 → 러프 PRD**
```
1. 자유 대화로 아이디어 구체화
2. PRD-{NNN}.md 초안 생성 (v0.1.0, status: draft)
   - 빈 섹션은 "TODO: 다음 세션에서 구체화" 표기
3. 세션 종료 시 PROGRESS.md에 기록:
   "PRD-001 초안 완성, 다음: 기능 분해 필요"
```

**세션 2: PRD 보강 + FNC 초안**
```
1. PRD-{NNN}.md 읽기 → TODO 항목 확인
2. 대화로 빈 섹션 채우기 → PRD v0.2.0 업데이트
3. 기능 분해 → FNC-001~N 초안 생성 (v0.1.0)
4. PROGRESS.md 업데이트
```

**세션 3: FNC 확정 + SCR/API 생성**
```
1. FNC-001~N 읽기 → 누락 항목 확인
2. 대화로 FNC 보강 → v0.2.0 업데이트
3. 각 FNC에서 SCR, API 자동 파생
4. PROGRESS.md 업데이트
```

**세션 4: 전체 리뷰 + TC**
```
1. 전체 문서 읽기 → 불일치/누락 탐지
2. TC-001~N 생성
3. /vault-plan sync 실행 → 정합성 확인
4. 모든 문서 status: in-review로 변경
5. PROGRESS.md 최종 업데이트
```

**세션 감지:**
```
기존 문서가 있으면 자동으로 현재 세션 단계를 판단:
- PRD만 있음 → 세션 2부터
- PRD + FNC 있음 → 세션 3부터
- PRD + FNC + SCR/API 있음 → 세션 4부터
```

---

### F. Living Spec 퍼블리시 모드 (`/vault-plan publish [screenId|all]`)

화면설계서(SCR) → spec JSON → Next.js 화면에 SpecLabel 적용 → 스크린샷 캡처 → Vault 임베드까지 전체 파이프라인을 실행한다.

**Step 1: SCR 확인 + spec JSON 생성**
```
1. vault 02-기획-디자인/화면설계서/ 에서 대상 SCR 확인
2. `npm run spec:export` 실행 (vault-export.ts)
3. src/spec-data/{screenId}.json 생성 확인
4. _manifest.json 업데이트 확인
```

**Step 2: SpecLabel 래핑 코드 제안**
```
1. manifest에서 대상 화면의 filePath 확인
2. 해당 페이지 파일 읽기
3. SCR JSON의 items를 기반으로 SpecLabel 래핑 코드 생성
4. 사용자에게 코드 제안 (적용 여부 확인)
   - 각 UI 요소에 <SpecLabel uiId="UI-001"> 래핑
```

**Step 3: 스크린샷 캡처**
```
1. dev 서버 실행 확인 (npm run dev)
2. `npm run spec:import` 실행 (vault-import.ts)
3. spec-mode=screenshot으로 캡처
4. vault _assets/screenshots/{screenId}-labeled.png 저장
```

**Step 4: SCR 문서 업데이트**
```
1. SCR 문서에 "2.5 퍼블리시된 UI" 섹션 추가/업데이트
2. 스크린샷 이미지 임베드
3. 라벨 매핑 테이블 삽입
4. frontmatter의 last_published, spec_json 필드 업데이트
```

**Step 5: 결과 리포트**
```
`npm run spec:check` 실행 → 전체 정합성 확인
결과: 퍼블리시 성공 화면 수, 누락 항목, 다음 액션 제안
```

**전체 퍼블리시 (`/vault-plan publish all`):**
```
manifest의 모든 화면에 대해 Step 1~5를 순차 실행.
중간에 오류 발생 시 해당 화면을 건너뛰고 계속 진행.
최종 리포트에 성공/실패 화면 목록 표시.
```

---

## 4. `/vault-plan status` 실행 로직

Vault의 현재 문서 현황을 빠르게 보여준다:

```
1. 각 폴더별 문서 수 카운트
2. 상태별 분포 집계
3. 최근 수정 문서 5개

출력:
## Vault 현황

| 카테고리 | 문서 수 | draft | in-review | approved |
|---------|---------|-------|-----------|----------|
| 공통 | 3 | 1 | 1 | 1 |
| 기획/디자인 | 5 | 2 | 2 | 1 |
| 개발 | 8 | 3 | 3 | 2 |
| QA | 4 | 2 | 1 | 1 |

최근 수정: FNC-003 (2분 전), SCR-005 (1시간 전), ...
```

---

## 5. `/vault-plan next-id [PREFIX]` 실행 로직

```
1. 해당 PREFIX의 폴더에서 기존 파일 스캔
2. 가장 높은 번호 + 1 반환

예: /vault-plan next-id FNC
→ "다음 사용 가능 ID: FNC-004"
```

---

## 6. 문서 생성 시 체크리스트

문서를 생성할 때마다 확인:

```
✅ ID 중복 없는지 확인
✅ frontmatter 필수 필드 모두 채움
✅ related 필드에 관련 문서 위키링크 추가
✅ 관련 문서의 related 필드도 역방향 업데이트
✅ 올바른 폴더에 파일 생성
✅ tags에 카테고리 태그 포함 (공통/디자인/개발/QA)
✅ Templater 변수 대신 실제 값 채움
✅ 빈 섹션은 템플릿 구조 유지 (삭제하지 않음)
```

---

## 7. 에러 처리

| 상황 | 처리 |
|------|------|
| Vault 경로 못 찾음 | 사용자에게 경로 질문 |
| ID 충돌 | 다음 번호로 자동 증가 |
| 관련 문서 없음 | related 빈 배열로 두고 경고 출력 |
| 폴더 없음 | 자동 생성 (mkdir -p) |
| 템플릿 없음 | 템플릿 없이 frontmatter + 기본 구조로 생성 |
