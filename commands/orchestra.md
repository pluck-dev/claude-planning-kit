# /orchestra - 프로젝트 개발 라이프사이클 오케스트레이터

기획 → 디자인 → 퍼블리싱 → 프론트앱 → TC까지 전체 개발 과정을 지휘한다.

## 참조 스킬
반드시 `~/.claude/skills/orchestra.md`를 읽고 전체 적용합니다.

## 사용법
```
/orchestra init [project-name]     ← 새 프로젝트 초기화
/orchestra scan                    ← 기존 프로젝트 분석 → ORCHESTRA.md 자동 생성 + 다음 단계 제안
/orchestra status                  ← 전체 진행 현황
/orchestra next                    ← 다음 미완료 단계 실행
/orchestra phase [phase-id]        ← 특정 단계 실행 (예: 1a, 2b, 3a)
/orchestra sync                    ← 코드 ↔ 문서 ↔ 설계서 동기화 체크
```

## 5단계 라이프사이클

### /orchestra scan (기존 프로젝트)
- 서브에이전트 3개로 문서/코드/디자인 상태 병렬 스캔
- Phase별 완료 여부 자동 판정 (산출물 존재 + 파일 수 + 크기 기반)
- ORCHESTRA.md 자동 생성 (이미 완료된 단계는 [x])
- 다음 실행 가능한 단계 제안

### Phase 1: 기획
- plandata/ 자료 분석 (PDF, Excel, 이미지) 또는 인터랙티브 Q&A
- SRS 생성 → 기능명세서 → 화면설계 문서

### Phase 2: 디자인
- 화면설계서 pen 파일 생성 (pencil-spec-doc 연동)
- 디자인 시스템 초기화

### Phase 3: 퍼블리싱
- HTML/CSS 퍼블리싱 코드 생성

### Phase 4: 프론트앱
- 프론트엔드 앱 개발

### Phase 5: TC (Test Cases)
- 테스트 케이스 생성 및 실행

## 핵심 원칙
- 모든 단계에 진행사항 기록 (ORCHESTRA.md)
- 서브에이전트 병렬 처리로 효율 극대화
- 이전 단계 산출물을 다음 단계 입력으로 활용
