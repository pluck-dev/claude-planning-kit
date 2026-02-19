# /e2e - Playwright E2E 테스트 코드 생성/실행

TC 문서를 기반으로 Playwright E2E 테스트 코드를 생성하고 실행한다.

## 참조 스킬
반드시 `~/.claude/skills/e2e.md`를 읽고 전체 적용합니다.

## 사용법
```
/e2e init                          ← Playwright 설치 + 프로젝트 설정
/e2e generate SC-012               ← 특정 화면의 E2E 코드 생성
/e2e generate 회원관리             ← 특정 기능의 E2E 코드 생성
/e2e generate loop                 ← TC 기반 순차 생성
/e2e run                           ← 전체 E2E 테스트 실행
/e2e run 회원관리                  ← 특정 기능만 실행
```

## 수행 절차

### /e2e init
1. Playwright 설치 (npm install -D @playwright/test)
2. playwright.config.ts 생성
3. 폴더 구조 생성 (tests/e2e, tests/pages, tests/fixtures)
4. Base Page Object + Auth Fixture 생성
5. package.json 스크립트 추가

### /e2e generate
1. TC 문서 확인 (없으면 /generate-tc 안내)
2. 서브에이전트로 TC + 코드 병렬 분석
3. Page Object Model 생성/업데이트
4. TC → Playwright 테스트 코드 변환
5. lint 확인

### /e2e run
1. 개발 서버 실행 확인
2. Playwright 테스트 실행
3. 결과 리포트

## 핵심 원칙
- TC 문서 없이 테스트 코드를 생성하지 않는다
- Page Object Model 패턴 필수 적용
- data-testid 기반 셀렉터 사용
- 테스트 간 상태 격리 (독립 실행 가능)
- 하드코딩 대기시간(sleep) 사용 금지
