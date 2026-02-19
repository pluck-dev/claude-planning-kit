# Claude Planning Kit

Claude Code용 기획 → 디자인 → 개발 → 테스트 전체 라이프사이클 스킬 모음.

## 설치

```bash
git clone https://github.com/USER/claude-planning-kit.git
cd claude-planning-kit
chmod +x install.sh
./install.sh
```

## 포함된 스킬

| 스킬 | 명령어 | 설명 |
|------|--------|------|
| 오케스트레이터 | `/orchestra` | 전체 개발 파이프라인 지휘 (6단계) |
| 화면설계서 | `/pencil-spec-doc` | 코드 기반 와이어프레임 + 기능 Description |
| 디자인 시스템 | `/pencil-check` | 컴포넌트 상태 누락 체크 |
| TC 생성 | `/generate-tc` | 기능명세서 기반 테스트 케이스 |
| E2E 테스트 | `/e2e` | Playwright E2E 코드 생성/실행 |
| Vault 기획 | `/vault-plan` | 옵시디언 Vault 기반 구조화 기획 |

## 포함된 에이전트

| 에이전트 | 설명 |
|---------|------|
| doc-writer | 코드 변경 시 기능명세서 자동 동기화 |
| code-reviewer | 보안/버그/성능 코드 리뷰 |
| project-init | 새 프로젝트 초기 구조 세팅 |

## 빠른 시작

```bash
# 새 프로젝트 기획 시작
cd ~/my-project
claude "/orchestra init my-project"

# 기존 프로젝트 분석
claude "/orchestra scan"

# 다음 단계 자동 실행
claude "/orchestra next"
```

## 파이프라인 (6단계)

```
Phase 1: 기획     → SRS, 기능명세서, 화면설계 md
Phase 2: 디자인   → 디자인 토큰, 공통 컴포넌트, pen 화면설계서
Phase 3: 퍼블리싱 → DB, 레이아웃, UI 컴포넌트, 페이지
Phase 4: 프론트앱 → API, 상태관리, 비즈니스 로직
Phase 5: TC       → 테스트 케이스, 단위 테스트, E2E
Phase 6: Living Spec → JSON Export, SpecLabel, 정합성 검증
```

## 요구사항

- [Claude Code](https://claude.ai/claude-code) 설치
- (선택) [Pencil.dev](https://pencil.dev) — 화면설계서 pen 생성용
- (선택) [oh-my-claudecode](https://github.com/anthropics/oh-my-claudecode) — 멀티에이전트 실행용
