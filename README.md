# Claude Planning Kit

Claude Code 기반 **기획 → 디자인 → 퍼블리싱 → 개발 → 테스트 → Living Spec** 전체 개발 라이프사이클을 자동화하는 통합 도구 모음.

아이디어 하나로 시작해서 SRS, 기능명세서, 화면설계서, 코드, 테스트케이스, Living Spec까지 Claude Code가 단계별로 자동 생성합니다.

## 한눈에 보기

```
아이디어 → /orchestra init → SRS → 기능명세서 → 화면설계 md
                                                      ↓
        Living Spec ← TC/E2E ← 프론트앱 ← 퍼블리싱 ← 화면설계서 pen
```

---

## 목차

- [설치](#설치)
- [빠른 시작: 새 프로젝트 기획](#빠른-시작-새-프로젝트-기획)
- [6단계 파이프라인](#6단계-파이프라인)
- [명령어 레퍼런스](#명령어-레퍼런스)
- [Obsidian Vault 기획](#obsidian-vault-기획)
- [Living Spec 시스템](#living-spec-시스템)
- [포함된 파일 목록 (68개)](#포함된-파일-목록-68개)
- [요구사항](#요구사항)
- [부분 설치](#부분-설치)

---

## 설치

```bash
git clone https://github.com/pluck-dev/claude-planning-kit.git
cd claude-planning-kit
./install.sh
```

설치 스크립트가 3가지를 설정합니다:

| 파트 | 설치 위치 | 내용 |
|------|-----------|------|
| Claude 설정 | `~/.claude/` | 스킬 6개 + 커맨드 10개 + 에이전트 3개 + HUD |
| Obsidian Vault | 사용자 지정 경로 | 23개 폴더 + 21개 Templater 템플릿 |
| Living Spec | 프로젝트 `src/` | React 컴포넌트 11개 + Vault CLI 스크립트 10개 |

---

## 빠른 시작: 새 프로젝트 기획

### 시나리오 1: 아이디어만 있을 때 (코드 없음)

```bash
# 1. 프로젝트 폴더 생성
mkdir ~/my-project && cd ~/my-project

# 2. 오케스트레이터로 초기화
claude "/orchestra init my-project"
```

Claude가 다음을 수행합니다:
1. 표준 폴더 구조 생성 (`plandata/`, `docs/`, `pen/`, `src/`, `tests/`)
2. `ORCHESTRA.md` 마스터 진행표 생성
3. 인터랙티브 Q&A 시작 — 프로젝트 유형, 핵심 기능, 사용자 역할, 기술 스택을 질문

```bash
# 3. Q&A 답변 후 자동으로 Phase 1 진행
#    SRS → 기능명세서 → 화면설계 md 순서로 생성됩니다

# 4. 다음 단계로 넘어가기
claude "/orchestra next"

# 5. 현재 진행 상태 확인
claude "/orchestra status"
```

### 시나리오 2: 기획 자료가 있을 때 (PDF, Excel, 이미지)

```bash
mkdir ~/my-project && cd ~/my-project
claude "/orchestra init my-project"

# 기획 자료를 plandata/ 에 넣기
cp 기획서.pdf 요구사항.xlsx 화면캡처.png plandata/

# Phase 1a 실행 - 자료 자동 분석
claude "/orchestra phase 1a"
# → PDF/Excel/이미지를 읽고 분석 결과를 plandata/ANALYSIS.md로 저장

# 이후 단계 자동 진행
claude "/orchestra next"
```

### 시나리오 3: 이미 개발 중인 프로젝트

```bash
cd ~/existing-project

# 현재 상태 자동 스캔
claude "/orchestra scan"
# → 코드/문서/디자인 3개 병렬 에이전트가 프로젝트를 분석
# → ORCHESTRA.md 자동 생성 (완료된 단계는 [x], 미완료는 [ ])
# → 다음 단계 제안

# 제안된 다음 단계 실행
claude "/orchestra next"
```

### 시나리오 4: Obsidian Vault로 구조화 기획

```bash
# Vault 기반 기획 시작 (6가지 모드 선택)
claude "/vault-plan my-feature"

# 또는 특정 모드로 바로 진입
claude "/vault-plan interview 로그인"        # 인터뷰 기반 상세 기획
claude "/vault-plan prd my-project"          # PRD 하나 → 나머지 자동 파생
claude "/vault-plan team my-project"         # 4개 에이전트 동시 기획
claude "/vault-plan progressive my-feature"  # 세션별 점진적 상세화
```

### 시나리오 5: 기능명세서만 빠르게 생성

```bash
cd ~/my-project

# 인터랙티브 기능명세서 생성
claude "/generate-spec"
# → 코드 분석 + 5단계 인터뷰
# → docs/client-spec/ (고객 미팅용) + docs/functional-spec/ (개발용) 생성

# 또는 SRS부터 시작
claude "/generate-srs"
# → 4라운드 인터뷰 후 docs/srs/ 에 12개 문서 생성
```

---

## 6단계 파이프라인

오케스트레이터(`/orchestra`)가 관리하는 전체 개발 파이프라인입니다.

```
Phase 1: 기획 (Planning)
  ├── 1a. 자료 수집/분석 ─── plandata/ 분석 or 인터랙티브 Q&A
  ├── 1b. SRS 생성 ───────── docs/srs/ (12개 문서)
  ├── 1c. 기능명세서 ─────── docs/functional-spec/ + docs/client-spec/
  └── 1d. 화면설계 md ────── docs/screen-design/
           ↓
Phase 2: 디자인 (Design)
  ├── 2a. 디자인 토큰 ────── docs/screen-design/01-디자인-토큰.md
  ├── 2b. 공통 컴포넌트 ──── docs/screen-design/03-공통-컴포넌트.md
  └── 2c. 화면설계서 pen ─── pen/*.pen (Pencil.dev 와이어프레임)
           ↓
Phase 3: 퍼블리싱 (Publishing)
  ├── 3a. 프로젝트 세팅 ──── package.json, tailwind, prisma
  ├── 3b. DB 스키마 ───────── prisma/schema.prisma
  ├── 3c. 공통 레이아웃 ──── components/layout/
  ├── 3d. UI 컴포넌트 ────── components/ui/
  └── 3e. 페이지 퍼블 ────── app/ (HTML/CSS 구현)
           ↓
Phase 4: 프론트앱 (Frontend App)
  ├── 4a. API 라우트 ─────── app/api/
  ├── 4b. 상태관리 ────────── stores/, hooks/
  ├── 4c. API 연동 ────────── 페이지 ↔ API 연결
  ├── 4d. 비즈니스 로직 ──── lib/
  └── 4e. 외부 연동 ───────── lib/integrations/ (PG, SMS 등)
           ↓
Phase 5: TC (Test Cases)
  ├── 5a. TC 리스트 생성 ─── tests/tc-list/
  ├── 5b. 단위 테스트 ────── tests/unit/
  └── 5c. E2E 테스트 ─────── tests/e2e/ (Playwright)
           ↓
Phase 6: Living Spec (문서 ↔ 코드 동기화)
  ├── 6a. Spec JSON Export ─ spec-data/*.json
  ├── 6b. SpecLabel 적용 ── 화면에 번호 라벨 래핑
  ├── 6c. Doc JSON Export ── spec-data/docs/ (FNC/API 문서 뷰어)
  ├── 6d. 매핑 감사 ─────── audit-spec-mapping 리포트
  └── 6e. 정합성 검증 ───── vault-check 리포트
```

### 의존성 맵

```
1a → 1b → 1c → 1d → 2a → 2b → 2c → 3a → 3b → 3c → 3d → 3e
                                                              ↓
                                      4a → 4b → 4c → 4d → 4e
                                                              ↓
                                                    5a → 5b → 5c
                                                                ↓
                                                      6a → 6b → 6c → 6d → 6e
```

각 단계는 이전 단계가 `[x]` 완료 상태여야 실행 가능합니다. `ORCHESTRA.md`가 Single Source of Truth입니다.

### 진행 상태 표기

| 표기 | 의미 |
|------|------|
| `[ ]` | 미착수 |
| `[~]` | 진행중 |
| `[x]` | 완료 |
| `[!]` | 오류/불일치 |

---

## 명령어 레퍼런스

### 오케스트레이터

| 명령어 | 설명 |
|--------|------|
| `/orchestra init [name]` | 새 프로젝트 초기화 — 폴더 구조 + ORCHESTRA.md 생성 |
| `/orchestra scan` | 기존 프로젝트 분석 — 3개 병렬 에이전트가 문서/코드/디자인 스캔 → ORCHESTRA.md 자동 생성 |
| `/orchestra status` | 전체 진행 상태 확인 (ORCHESTRA.md 기반) |
| `/orchestra next` | 다음 미완료 단계 자동 실행 (의존성 체크 포함) |
| `/orchestra next N` | N개 단계 연속 실행 |
| `/orchestra phase [id]` | 특정 단계만 실행 (예: `1a`, `2c`, `5a`) |
| `/orchestra sync` | 전체 산출물 3자 싱크 체크 (문서 ↔ 코드 ↔ pen) |

**사용 예시:**
```bash
# 새 프로젝트 시작부터 Phase 2까지 한번에
claude "/orchestra init my-saas"
# (Q&A 완료 후)
claude "/orchestra next 8"

# 특정 단계만 다시 실행
claude "/orchestra phase 2c"

# 전체 싱크 체크
claude "/orchestra sync"
```

### 기획/문서 생성

| 명령어 | 설명 |
|--------|------|
| `/generate-srs` | 요구사항 명세서(SRS) 생성 — 4라운드 인터뷰 → `docs/srs/` 12개 문서 |
| `/generate-spec` | 기능명세서 생성 — 코드 분석 + 5단계 인터뷰 → 고객용 + 개발용 2벌 |
| `/sync-docs` | 코드 ↔ 문서 동기화 — 코드 기준으로 기능명세서 자동 업데이트 |
| `/sync-docs [범위]` | 특정 범위만 동기화 (예: `/sync-docs contract`) |

**`/generate-srs`가 생성하는 문서:**
```
docs/srs/
├── 00-표지.md              # 프로젝트명, 버전, 고객사
├── 01-개요.md              # 배경, 목적, 범위, 용어 정의
├── 02-이해관계자.md         # 사용자 역할, 페르소나
├── 03-기능-요구사항.md      # FR-001~N (필수/권장/선택)
├── 04-비기능-요구사항.md    # NFR-001~N (성능, 보안, 호환성)
├── 05-시스템-아키텍처.md    # 기술 스택, 구성도 (Mermaid)
├── 06-데이터-요구사항.md    # 핵심 엔티티, ERD
├── 07-외부-연동.md          # 결제, SMS, 이메일 등
├── 08-화면-목록.md          # 페이지별 기능 매핑
├── 09-일정-마일스톤.md      # Phase별 범위/일정
├── 10-제약사항-리스크.md    # 리스크, 완화 방안
└── 11-부록.md              # 참고 자료, 변경 이력
```

**`/generate-spec`이 생성하는 문서:**
```
docs/client-spec/           # 고객 미팅용 (비기술자 대상)
├── 시스템 개요, 주요 기능, 업무 흐름도 (Mermaid)

docs/functional-spec/       # 개발용
├── 00-목차.md
├── 01-시스템-개요.md       # 기술 스택, 아키텍처
├── 02-역할별-권한.md       # 권한 매트릭스
├── 03-인증-시스템.md       # JWT, 세션
├── 04~N-도메인별.md        # 데이터 모델, API, 비즈니스 로직
```

### 디자인 (Pencil.dev)

| 명령어 | 설명 |
|--------|------|
| `/pencil-init` | 디자인 시스템 폴더 구조 초기화 |
| `/pencil-spec [컴포넌트명]` | 컴포넌트 스펙 + 상태 매트릭스 + 코드 스캐폴딩 |
| `/pencil-spec-doc [id] [name]` | 코드 기반 화면설계서 pen 생성 (와이어프레임 + Description) |
| `/pencil-spec-doc loop` | 미착수 화면설계서 순차 처리 |
| `/pencil-spec-doc loop N` | 미착수 N개만 처리 |
| `/pencil-check` | 컴포넌트/화면의 빠진 상태 체크 (hover, disabled, empty, error, loading) |

**`/pencil-spec-doc`이 생성하는 pen 파일:**
- 왼쪽: 실제 코드 기반 와이어프레임 + 번호 배지
- 오른쪽: API, 데이터 모델, 상태 전이 포함 상세 Description
- 3개 병렬 에이전트: 코드 분석 / 문서 분석 / 진행 확인

### 테스트

| 명령어 | 설명 |
|--------|------|
| `/generate-tc` | TC(테스트 케이스) 문서 생성 — 기능명세서 + 화면설계서 기반, L1~L4 레벨 |
| `/e2e init` | Playwright 설치 + 프로젝트 설정 |
| `/e2e generate [대상]` | TC 기반 E2E 테스트 코드 생성 (POM 패턴) |
| `/e2e run [대상]` | E2E 테스트 실행 |

### Living Spec (프로젝트 로컬)

| 명령어 | 설명 |
|--------|------|
| `/living-spec status` | Spec 시스템 상태 확인 |
| `/living-spec export` | Vault SCR.md → spec-data JSON 변환 |
| `/living-spec import` | 스크린샷 캡처 → Vault 임베드 |
| `/living-spec check` | Vault ↔ JSON 정합성 검증 (5가지 체크) |
| `/living-spec label [screenId]` | 특정 화면에 SpecLabel 래핑 코드 제안 |
| `/living-spec audit` | Spec 매핑 전체 감사 — SpecLabel uiId ↔ SCR JSON 대조 |
| `/living-spec doc-export` | Vault FNC/API 마크다운 → spec-data/docs/ JSON 변환 |

### Vault 기획 (6가지 모드)

| 명령어 | 모드 | 용도 |
|--------|------|------|
| `/vault-plan interview [기능명]` | 인터뷰 | Claude가 항목별 질문하며 문서 완성 (신규 기능 상세 기획) |
| `/vault-plan prd [프로젝트명]` | PRD-First | PRD 하나 작성 → FNC, SCR, API, TC 자동 파생 |
| `/vault-plan team [프로젝트명]` | 멀티에이전트 | PM/디자인/개발/QA 4개 에이전트 동시 기획 |
| `/vault-plan sync` | 싱크 체크 | 기존 문서 간 불일치 탐지 + 자동 업데이트 |
| `/vault-plan progressive [기능명]` | 점진적 상세화 | 세션별로 아이디어 → PRD → FNC → SCR 발전 |
| `/vault-plan publish [screenId\|all]` | Living Spec | SCR → JSON → SpecLabel → 스크린샷 → Vault 임베드 |

---

## Obsidian Vault 기획

### Vault 구조

`install.sh`가 생성하는 Obsidian Vault 폴더 구조:

```
planning-vault/
├── 00-HOME.md                    # Vault 루트 마커 (자동 감지용)
├── PROGRESS.md                   # 전체 진행 추적
├── _templates/                   # Templater 템플릿 (21개)
│   ├── tpl-prd.md               # PRD
│   ├── tpl-기능명세서.md          # FNC
│   ├── tpl-화면설계서.md          # SCR
│   ├── tpl-API명세서.md          # API
│   ├── tpl-TC.md                # 테스트 케이스
│   ├── tpl-IA.md                # 정보 구조
│   ├── tpl-유저스토리.md          # UST
│   ├── tpl-유저페르소나.md        # PRS
│   ├── tpl-유저시나리오.md        # SCN
│   ├── tpl-서비스컨셉.md          # SVC
│   ├── tpl-데이터정의서.md        # DAT
│   ├── tpl-에러코드정의서.md      # ERR
│   ├── tpl-권한매트릭스.md        # PRM
│   ├── tpl-상태전이도.md          # STT
│   ├── tpl-상태화면정의.md        # STS
│   ├── tpl-디자인토큰.md          # DTK
│   ├── tpl-화면흐름도.md          # FLW
│   ├── tpl-용어사전.md           # GLO
│   ├── tpl-회의록.md             # MTG
│   ├── tpl-변경이력.md           # CHG
│   └── tpl-체크리스트.md          # CKL
│
├── 01-공통/
│   ├── PRD/                     # 제품 요구사항 문서
│   ├── 유저스토리/
│   ├── 유저페르소나/
│   ├── 화면흐름도/
│   ├── 용어사전/
│   ├── 회의록/
│   └── 변경이력/
│
├── 02-기획-디자인/
│   ├── 서비스컨셉/
│   ├── IA/                      # 정보 구조
│   ├── 화면설계서/               # SCR 문서
│   ├── 유저시나리오/
│   ├── 상태화면정의/
│   └── 디자인토큰/
│
├── 03-개발/
│   ├── 기능명세서/               # FNC 문서
│   ├── API명세서/
│   ├── 데이터정의서/
│   ├── 에러코드정의서/
│   ├── 권한매트릭스/
│   └── 상태전이도/
│
├── 04-QA/
│   ├── TC/                      # 테스트 케이스
│   └── 체크리스트/
│
├── 05-대시보드/
└── 06-아카이브/
```

### 문서 ID 체계

모든 문서는 `{PREFIX}-{NNN}` 형식의 고유 ID를 가집니다:

| Prefix | 문서 타입 | 폴더 |
|--------|----------|------|
| `PRD` | PRD | 01-공통/PRD/ |
| `UST` | 유저 스토리 | 01-공통/유저스토리/ |
| `PRS` | 유저 페르소나 | 01-공통/유저페르소나/ |
| `FLW` | 화면 흐름도 | 01-공통/화면흐름도/ |
| `GLO` | 용어 사전 | 01-공통/용어사전/ |
| `SVC` | 서비스 컨셉 | 02-기획-디자인/서비스컨셉/ |
| `IA` | 정보 구조 | 02-기획-디자인/IA/ |
| `SCR` | 화면설계서 | 02-기획-디자인/화면설계서/ |
| `FNC` | 기능명세서 | 03-개발/기능명세서/ |
| `API` | API 명세서 | 03-개발/API명세서/ |
| `DAT` | 데이터 정의서 | 03-개발/데이터정의서/ |
| `ERR` | 에러 코드 정의서 | 03-개발/에러코드정의서/ |
| `PRM` | 권한 매트릭스 | 03-개발/권한매트릭스/ |
| `TC` | 테스트 케이스 | 04-QA/TC/ |

문서 간 자동 Cross-Reference: FNC-001 생성 시 관련 SCR-001의 `related` 필드에 `[[FNC-001]]` 자동 추가.

### Vault 기획 모드 상세

#### A. 인터뷰 모드 — 신규 기능 상세 기획

```bash
claude "/vault-plan interview 로그인"
```

Claude가 5개 Phase로 구조화 질문:
1. **기본 정보** — 기능 개요, 사용자, 플랫폼, 우선순위
2. **기능 상세** — 요구사항, 비즈니스 규칙, 유효성 검증, 에러 처리
3. **화면 상세** — UI 구성요소, 상태별 화면, 인터랙션, 반응형
4. **API 상세** — 엔드포인트, 요청/응답, 인증
5. **문서 생성** — FNC + SCR + API + TC 자동 생성 + Cross-Reference 연결

#### B. PRD-First 모드 — 전체 시스템 빠른 초안

```bash
claude "/vault-plan prd my-project"
```

1. 자유 대화로 PRD 작성
2. PRD에서 기능 목록 자동 추출
3. 4개 병렬 에이전트가 FNC, SCR, API, TC 일괄 생성
4. ID 매핑 표 출력

#### C. 멀티에이전트 모드 — 대규모 킥오프

```bash
claude "/vault-plan team my-project"
```

4개 에이전트가 동시 작업:
- **PM 에이전트** → PRD, 유저스토리, 페르소나
- **디자인 에이전트** → 서비스컨셉, IA, 화면설계서, 시나리오
- **개발 에이전트** → 기능명세서, API명세서, 데이터정의서, 에러코드, 권한매트릭스
- **QA 에이전트** → TC, 체크리스트

완료 후 Cross-Reference 정합성 자동 체크.

#### D. 점진적 상세화 모드 — 초기 아이디어

```bash
claude "/vault-plan progressive my-feature"
```

세션별 점진적 발전:
- **세션 1**: 아이디어 → 러프 PRD (v0.1.0)
- **세션 2**: PRD 보강 → FNC 초안
- **세션 3**: FNC 확정 → SCR/API 파생
- **세션 4**: 전체 리뷰 → TC 생성

Vault가 세션 간 메모리 역할. 기존 문서 상태로 현재 세션 자동 감지.

---

## Living Spec 시스템

퍼블리시된 Next.js 화면 위에 번호 라벨(1)(2)(3)이 표시되고, 클릭하면 Vault의 UI 디스크립션이 팝업으로 뜨는 인터랙티브 문서 시스템.

### 동작 흐름

```
Vault SCR.md ──→ vault-export.ts ──→ spec-data/*.json
                                            ↓
                                     SpecLabel 컴포넌트
                                     (번호 라벨 래핑)
                                            ↓
                                     스크린샷 캡처
                                            ↓
                                     Vault에 임베드
```

### 3가지 모드

| 모드 | 동작 | 용도 |
|------|------|------|
| `normal` | 라벨 완전 숨김 | 프로덕션과 동일 |
| `spec` | 번호 라벨 + 클릭 팝업 + 사이드 패널 | 개발/리뷰 |
| `screenshot` | 흰 배경 + 라벨만 표시 | 캡처용 |

키보드: `Ctrl+Shift+S`로 모드 순환

### Doc Viewer (관련문서 뷰어)

spec 모드에서 SpecPanel의 "관련문서" 탭에서 FNC/API 배지를 클릭하면 문서 내용을 직접 확인할 수 있습니다.

| 기능 | 설명 |
|------|------|
| 배지 클릭 | FNC-001, API-001 등 배지를 클릭하면 문서 로딩 |
| 아코디언 | 문서 섹션별 펼침/접기 |
| 마크다운 렌더링 | 테이블, 코드 블록, 리스트 자동 렌더링 |
| 뒤로가기 | 문서 뷰어에서 배지 목록으로 복귀 |

Doc Viewer를 사용하려면 `spec-data/docs/` 에 JSON 파일이 필요합니다:
```bash
# Vault에서 FNC/API 문서 JSON 생성
node scripts/generate-doc-json.js --vault /path/to/vault
```

### 프로젝트에 설치

```bash
# Living Spec만 설치
./install.sh --spec-only
```

#### Peer Dependencies

Living Spec 컴포넌트는 대상 프로젝트에 다음 의존성이 필요합니다:

| 패키지 | 최소 버전 | 용도 |
|--------|----------|------|
| `react` | ^18.0.0 | 컴포넌트 렌더링 |
| `react-dom` | ^18.0.0 | DOM 렌더링 |
| `next` | ^14.0.0 | App Router 기반 데이터 로딩 (선택) |
| `tsx` | ^4.0.0 | Vault CLI 스크립트 실행 (devDependency) |

> Next.js 없이 사용할 경우 `use-spec-data.ts`의 데이터 로딩 로직을 fetch 기반으로 수정하세요.

설치 후 `package.json`에 스크립트 추가:
```json
{
  "scripts": {
    "spec:export": "tsx scripts/vault-export.ts",
    "spec:import": "tsx scripts/vault-import.ts",
    "spec:check": "tsx scripts/vault-check.ts"
  }
}
```

```bash
npm install -D tsx
```

### 컴포넌트 구조

```
src/components/spec/
├── spec-provider.tsx          # Context + 모드 + 데이터 로딩
├── spec-label.tsx             # 번호 라벨 래핑 컴포넌트
├── spec-tooltip.tsx           # 클릭 시 디스크립션 팝업
├── spec-panel.tsx             # 우측 사이드 전체 스펙 패널
├── spec-toggle.tsx            # FAB 토글 (Ctrl+Shift+S)
├── spec-screenshot.tsx        # 스크린샷 캡처 모드
├── index.ts                   # 배럴 export
├── hooks/
│   ├── use-spec-mode.ts       # 모드 상태 관리
│   ├── use-spec-data.ts       # JSON 데이터 로딩
│   └── use-spec-context.ts    # Provider context 접근
└── types/
    └── spec.types.ts          # 공유 타입 (런타임 + CLI)
```

```
src/spec-data/                ← Vault에서 export된 JSON
  _manifest.json              ← 화면 목록 + 경로 매핑
  SCR-001.json                ← 화면별 스펙 데이터
  docs/                       ← FNC/API 문서 JSON (Doc Viewer용)
    FNC-001.json
    API-001.json
```

---

## 자동 에이전트

설치되는 3개 에이전트는 Claude Code가 자동으로 활용합니다:

| 에이전트 | 동작 |
|---------|------|
| `doc-writer` | 코드 변경 시 기능명세서 자동 동기화. 스키마/API/서비스 변경 감지 → 관련 문서 업데이트 |
| `code-reviewer` | PR 전 보안/버그/성능 코드 리뷰 |
| `project-init` | 새 프로젝트 초기 구조 세팅 |

---

## 포함된 파일 목록 (68개)

### Claude 설정 (20개)

**스킬** (`~/.claude/skills/`):
| 파일 | 설명 |
|------|------|
| `orchestra.md` | 마스터 오케스트레이터 — 6단계 파이프라인, 의존성 맵, 서브에이전트 전략 |
| `pencil-screen-spec.md` | 화면설계서 pen 생성 규칙 — 코드 기반 와이어프레임 + Description |
| `pencil-design-system.md` | 디자인 시스템 — 상태 체크리스트 (empty/loading/error/hover/disabled) |
| `generate-tc.md` | TC 문서 생성 규칙 — L1~L4 레벨, 기능명세 기반 |
| `e2e.md` | Playwright E2E 코드 생성 — POM 패턴, TC 기반 |
| `vault-plan.md` | Vault 기획 — 6가지 모드, 문서 ID 체계, Cross-Reference |

**커맨드** (`~/.claude/commands/`):
| 파일 | 명령어 | 스킬 참조 |
|------|--------|-----------|
| `orchestra.md` | `/orchestra` | orchestra.md |
| `generate-spec.md` | `/generate-spec` | 자체 포함 |
| `generate-srs.md` | `/generate-srs` | 자체 포함 |
| `generate-tc.md` | `/generate-tc` | generate-tc.md |
| `sync-docs.md` | `/sync-docs` | 자체 포함 |
| `pencil-spec-doc.md` | `/pencil-spec-doc` | pencil-screen-spec.md |
| `pencil-spec.md` | `/pencil-spec` | pencil-design-system.md |
| `pencil-check.md` | `/pencil-check` | pencil-design-system.md |
| `pencil-init.md` | `/pencil-init` | pencil-design-system.md |
| `e2e.md` | `/e2e` | e2e.md |

**에이전트** (`~/.claude/agents/`):
| 파일 | 설명 |
|------|------|
| `doc-writer.md` | 코드 → 문서 자동 동기화 |
| `code-reviewer.md` | 보안/버그/성능 리뷰 |
| `project-init.md` | 프로젝트 초기 세팅 |

**기타**:
| 파일 | 설명 |
|------|------|
| `claude/hud/omc-hud.mjs` | oh-my-claudecode 상태바 HUD |

### Obsidian Vault 템플릿 (23개)

`00-HOME.md`, `PROGRESS.md`, `_templates/tpl-*.md` x 21

### Living Spec (21개)

React 컴포넌트 11개 + Vault CLI 스크립트 9개 + tsconfig.json

### 프로젝트 로컬 (1개)

`commands-local/living-spec.md` → 프로젝트의 `.claude/commands/`에 설치

### 기타 (3개)

`install.sh`, `README.md`, `.gitignore`

---

## 요구사항

### 필수
- [Claude Code](https://claude.ai/claude-code) (CLI)

### 선택
- [Pencil.dev](https://pencil.dev) — 화면설계서 pen 파일 생성 (Phase 2c)
- [Obsidian](https://obsidian.md) + [Templater 플러그인](https://github.com/SilentVoid13/Templater) — Vault 기획
- [oh-my-claudecode](https://github.com/anthropics/oh-my-claudecode) — 멀티에이전트 병렬 실행
- [tsx](https://github.com/privatenumber/tsx) — Living Spec CLI 스크립트 실행

---

## 부분 설치

```bash
# Claude 설정만 (스킬 + 커맨드 + 에이전트)
./install.sh --claude-only

# Obsidian Vault 템플릿만
./install.sh --vault-only

# Living Spec만 (프로젝트에 컴포넌트 + CLI 복사)
./install.sh --spec-only
```

---

## 전체 워크플로우 예시

```bash
# 1. 설치
git clone https://github.com/pluck-dev/claude-planning-kit.git
cd claude-planning-kit && ./install.sh

# 2. 새 프로젝트 시작
mkdir ~/my-saas && cd ~/my-saas
claude "/orchestra init my-saas"

# 3. (Q&A 완료 후) 기획 Phase 전체 실행
claude "/orchestra next 4"
# → 1a: 자료 분석
# → 1b: SRS 12개 문서
# → 1c: 기능명세서 (고객용 + 개발용)
# → 1d: 화면설계 md

# 4. 디자인 Phase
claude "/orchestra next 3"
# → 2a: 디자인 토큰
# → 2b: 공통 컴포넌트 스펙
# → 2c: 화면설계서 pen (Pencil.dev)

# 5. 퍼블리싱 Phase
claude "/orchestra next 5"
# → 3a~3e: 프로젝트 세팅 → DB → 레이아웃 → UI → 페이지

# 6. 프론트앱 Phase
claude "/orchestra next 5"
# → 4a~4e: API → 상태관리 → 연동 → 비즈니스 로직 → 외부 연동

# 7. TC Phase
claude "/orchestra next 3"
# → 5a: TC 리스트
# → 5b: 단위 테스트
# → 5c: E2E 테스트

# 8. Living Spec Phase
claude "/orchestra next 3"
# → 6a: JSON Export
# → 6b: SpecLabel 적용
# → 6c: 정합성 검증

# 9. 최종 싱크 체크
claude "/orchestra sync"
```

---

## License

MIT
