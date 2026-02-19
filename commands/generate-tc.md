# /generate-tc - TC(테스트 케이스) 문서 생성

기능명세서 + 화면설계서를 기반으로 체계적인 테스트 케이스 문서를 생성한다.

## 참조 스킬
반드시 `~/.claude/skills/generate-tc.md`를 읽고 전체 적용합니다.

## 사용법
```
/generate-tc                       ← 전체 TC 생성 (미착수 순차)
/generate-tc SC-012                ← 특정 화면의 TC
/generate-tc 회원관리              ← 특정 기능의 TC
/generate-tc loop 3                ← 미착수 3개만 처리
```

## 수행 절차

### 1. 스킬 파일 로드
`~/.claude/skills/generate-tc.md`를 읽어 전체 규칙을 적용한다.

### 2. 정보 수집 (서브에이전트 병렬)
- Agent A: 기능명세서 분석 (API, 비즈니스 로직, 권한, 에러 케이스)
- Agent B: 화면설계서 분석 (UI 요소, 인터랙션, 상태 전환)
- Agent C: 코드 확인 (실제 구현 + 명세서 불일치 여부)

### 3. TC 문서 생성
- TC ID: TC-[기능번호]-[순번] 형식
- 레벨: L1(Smoke) ~ L4(Edge Case) 분류
- 각 TC: 전제조건 + 테스트 단계 + 기대 결과 + API 검증 + 에러 케이스
- 자동화 가능 여부 태그

### 4. 진행사항 업데이트
- docs/tc/PROGRESS.md 상태 업데이트

## 핵심 원칙
- 기능명세서에 없는 기능의 TC를 작성하지 않는다
- 각 TC에 레벨(L1~L4) 반드시 표기
- API TC에는 요청/응답 예시 필수
- E2E 자동화 가능 여부 태그 표시
