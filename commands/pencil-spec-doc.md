# /pencil-spec-doc - 코드 기반 화면설계서 생성 (Pencil.dev)

실제 코드를 분석하여 정확한 와이어프레임 + 백엔드 개발자용 상세 Description을 pen 파일로 생성한다.

## 참조 스킬
반드시 `~/.claude/skills/pencil-screen-spec.md`를 읽고 전체 적용합니다.

## 사용법
```
/pencil-spec-doc SC-012 회원관리    ← 특정 화면
/pencil-spec-doc loop              ← 미착수 항목 순차 처리
/pencil-spec-doc loop 3            ← 미착수 항목 3개만 처리
```

## 수행 절차

### 1. 스킬 파일 로드
`~/.claude/skills/pencil-screen-spec.md`를 읽어 전체 규칙을 적용한다.

### 2. 정보 수집 (서브에이전트 병렬)
- Agent A (코드 분석): 페이지 컴포넌트, UI 구조, Tailwind 스타일, API 호출
- Agent B (문서 분석): md 문서, 기능 명세, Prisma 스키마
- Agent C (진행 확인): PROGRESS.md, 기존 pen 파일, 배치 좌표

### 3. pen 파일 생성
- 왼쪽: 코드 기반 와이어프레임 + 번호 배지
- 오른쪽: API/데이터/상태 포함 상세 Description
- batch_design으로 Pencil MCP 호출

### 4. 검증 + 진행사항 업데이트
- get_screenshot으로 시각 검증
- pen/PROGRESS.md 상태 업데이트

## 핵심 원칙
- 와이어프레임은 반드시 실제 코드를 읽고 반영 (상상 금지)
- Description은 백엔드 개발자가 API 구현 가능한 수준으로 상세하게
- md 문서 ↔ 코드 ↔ pen 설계서 3자 싱크 보장
