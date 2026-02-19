#!/bin/bash
#
# Claude Planning Kit - 완전 설치 스크립트
# 기획 → 디자인 → 퍼블 → 앱 → TC → Living Spec 전체 워크플로우
#
# 사용법:
#   git clone 후:  ./install.sh
#   부분 설치:     ./install.sh --claude-only    (Claude 설정만)
#                  ./install.sh --vault-only     (Obsidian Vault만)
#                  ./install.sh --spec-only      (Living Spec만)
#

set -e

# 색상
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Claude Planning Kit - Full Installer      ║${NC}"
echo -e "${BLUE}║  기획 → 디자인 → 퍼블 → 앱 → TC → Spec   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# 인자 파싱
INSTALL_CLAUDE=true
INSTALL_VAULT=true
INSTALL_SPEC=true

case "${1:-}" in
    --claude-only) INSTALL_VAULT=false; INSTALL_SPEC=false ;;
    --vault-only)  INSTALL_CLAUDE=false; INSTALL_SPEC=false ;;
    --spec-only)   INSTALL_CLAUDE=false; INSTALL_VAULT=false ;;
esac

# 스크립트 위치 감지
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}" 2>/dev/null)" && pwd 2>/dev/null)" || SCRIPT_DIR=""

# 공통 함수
backup_if_exists() {
    local file="$1"
    if [ -f "$file" ]; then
        local backup="${file}.backup.$(date +%Y%m%d_%H%M%S)"
        cp "$file" "$backup"
        echo -e "  ${YELLOW}[백업]${NC} $(basename "$file")"
    fi
}

copy_file() {
    local src="$1"
    local dest="$2"
    if [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/$src" ]; then
        cp "$SCRIPT_DIR/$src" "$dest"
    else
        echo -e "  ${RED}[SKIP]${NC} $src 파일을 찾을 수 없음"
        return 1
    fi
}

copy_dir() {
    local src="$1"
    local dest="$2"
    if [ -n "$SCRIPT_DIR" ] && [ -d "$SCRIPT_DIR/$src" ]; then
        cp -r "$SCRIPT_DIR/$src"/* "$dest/" 2>/dev/null || true
    fi
}

# ═══════════════════════════════════════════
# PART 1: Claude Code 설정 (~/.claude/)
# ═══════════════════════════════════════════
if [ "$INSTALL_CLAUDE" = true ]; then

    # Claude Code 설치 확인
    if ! command -v claude &> /dev/null; then
        echo -e "${RED}[ERROR] Claude Code가 설치되어 있지 않습니다.${NC}"
        echo "  npm install -g @anthropic-ai/claude-code"
        exit 1
    fi

    CLAUDE_DIR="$HOME/.claude"
    SKILLS_DIR="$CLAUDE_DIR/skills"
    COMMANDS_DIR="$CLAUDE_DIR/commands"
    AGENTS_DIR="$CLAUDE_DIR/agents"
    HUD_DIR="$CLAUDE_DIR/hud"

    mkdir -p "$SKILLS_DIR" "$COMMANDS_DIR" "$AGENTS_DIR" "$HUD_DIR"

    # ── 1/5: 스킬 (6개) ──
    echo -e "${CYAN}[1/5] 스킬 설치 (6개)${NC}"

    SKILLS=(
        "skills/orchestra.md|마스터 오케스트레이터 (6단계 파이프라인)"
        "skills/pencil-screen-spec.md|화면설계서 pen 생성 규칙"
        "skills/pencil-design-system.md|디자인 시스템 + 상태 체크리스트"
        "skills/generate-tc.md|TC 문서 생성 규칙 (L1~L4)"
        "skills/e2e.md|Playwright E2E 코드 생성 규칙"
        "skills/vault-plan.md|Vault 기획 (6가지 모드)"
    )

    for entry in "${SKILLS[@]}"; do
        IFS='|' read -r src desc <<< "$entry"
        file=$(basename "$src")
        backup_if_exists "$SKILLS_DIR/$file"
        copy_file "$src" "$SKILLS_DIR/$file" && echo -e "  ${GREEN}[OK]${NC} $file — $desc"
    done

    # ── 2/5: 커맨드 (10개) ──
    echo ""
    echo -e "${CYAN}[2/5] 커맨드 설치 (10개)${NC}"

    COMMANDS=(
        "commands/orchestra.md|/orchestra — 오케스트레이터"
        "commands/generate-spec.md|/generate-spec — 기능명세서"
        "commands/generate-srs.md|/generate-srs — SRS"
        "commands/generate-tc.md|/generate-tc — TC 문서"
        "commands/sync-docs.md|/sync-docs — 문서 동기화"
        "commands/pencil-spec-doc.md|/pencil-spec-doc — 화면설계서 pen"
        "commands/pencil-spec.md|/pencil-spec — 상태 매트릭스"
        "commands/pencil-check.md|/pencil-check — 상태 누락 체크"
        "commands/pencil-init.md|/pencil-init — 디자인 초기화"
        "commands/e2e.md|/e2e — E2E 테스트"
    )

    for entry in "${COMMANDS[@]}"; do
        IFS='|' read -r src desc <<< "$entry"
        file=$(basename "$src")
        backup_if_exists "$COMMANDS_DIR/$file"
        copy_file "$src" "$COMMANDS_DIR/$file" && echo -e "  ${GREEN}[OK]${NC} $file — $desc"
    done

    # ── 3/5: 에이전트 (3개) ──
    echo ""
    echo -e "${CYAN}[3/5] 에이전트 설치 (3개)${NC}"

    AGENTS=(
        "agents/doc-writer.md|코드→문서 자동 동기화"
        "agents/code-reviewer.md|보안/버그/성능 리뷰"
        "agents/project-init.md|프로젝트 초기 세팅"
    )

    for entry in "${AGENTS[@]}"; do
        IFS='|' read -r src desc <<< "$entry"
        file=$(basename "$src")
        backup_if_exists "$AGENTS_DIR/$file"
        copy_file "$src" "$AGENTS_DIR/$file" && echo -e "  ${GREEN}[OK]${NC} $file — $desc"
    done

    # ── 4/5: HUD ──
    echo ""
    echo -e "${CYAN}[4/5] HUD 설치${NC}"
    backup_if_exists "$HUD_DIR/omc-hud.mjs"
    copy_file "claude/hud/omc-hud.mjs" "$HUD_DIR/omc-hud.mjs" && echo -e "  ${GREEN}[OK]${NC} omc-hud.mjs — 상태바 HUD"

    # ── 5/5: CLAUDE.md 규칙 ──
    echo ""
    echo -e "${CYAN}[5/5] CLAUDE.md 규칙 추가${NC}"

    CLAUDE_MD="$CLAUDE_DIR/CLAUDE.md"
    PLANNING_MARKER="<!-- PLANNING-KIT:START -->"
    PLANNING_END="<!-- PLANNING-KIT:END -->"

    PLANNING_RULES=$(cat <<'RULES'
<!-- PLANNING-KIT:START -->
# Planning Kit 규칙

## 언어
- 사용자와의 대화는 한국어로 합니다.
- 코드 주석과 커밋 메시지는 한국어로 작성합니다.
- 기술 용어(API, DB, JWT, CRUD 등)는 영문 그대로 사용합니다.

## 디자인 시스템 (Pencil.dev)
- Pencil.dev 기반 디자인 작업 시 반드시 `~/.claude/skills/pencil-design-system.md` 스킬을 참조합니다.
- 컴포넌트를 만들 때 **모든 상태(hover, disabled, empty, error, loading 등)**를 빠뜨리지 않고 구현합니다.
- `/pencil-check`: 컴포넌트/화면의 빠진 상태 체크
- `/pencil-init`: 디자인 시스템 폴더 구조 초기화
- `/pencil-spec [컴포넌트명]`: 컴포넌트 스펙 + 상태 매트릭스 + 코드 스캐폴딩 생성
- `/pencil-spec-doc [screenId] [screenName]`: 화면설계서 생성 (모바일/웹 지원)

## 기능명세서 관리
- 프로젝트에 `docs/functional-spec/` 또는 `docs/client-spec/` 디렉토리가 있으면, 코드 변경 시 관련 문서도 함께 업데이트합니다.
- `/generate-srs`: 요구사항 명세서(SRS) 생성
- `/generate-spec`: 새 프로젝트의 기능명세서를 인터랙티브하게 생성 (고객용 + 개발용)
- `/sync-docs`: 코드와 문서의 불일치를 확인하고 동기화

## 테스트
- `/generate-tc`: TC(테스트 케이스) 문서 생성 — 기능명세서 + 화면설계서 기반
- `/e2e init`: Playwright 설치 + 프로젝트 설정
- `/e2e generate [대상]`: TC 기반 E2E 테스트 코드 생성
- `/e2e run [대상]`: E2E 테스트 실행

## 프로젝트 오케스트레이터
- 전체 개발 라이프사이클 지휘: 기획 → 디자인 → 퍼블 → 프론트앱 → TC → Living Spec
- `/orchestra init [name]`: 새 프로젝트 초기화 + 폴더 구조 생성
- `/orchestra scan`: 기존 프로젝트 분석 → ORCHESTRA.md 자동 생성
- `/orchestra status`: 전체 진행 상태 확인
- `/orchestra next`: 다음 미완료 단계 자동 실행
- `/orchestra phase [id]`: 특정 단계 실행 (예: 1a, 2c)
- `/orchestra sync`: 전체 산출물 싱크 체크

## Living Spec
- Vault SCR 문서 → spec JSON → SpecLabel 래핑 → 스크린샷 → Vault 임베드
- `/vault-plan publish [screenId|all]`: Living Spec 퍼블리시
- 프로젝트에 Living Spec을 추가하려면: `./install.sh --spec-only` (프로젝트 루트에서)
<!-- PLANNING-KIT:END -->
RULES
)

    if [ -f "$CLAUDE_MD" ]; then
        if grep -q "$PLANNING_MARKER" "$CLAUDE_MD"; then
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "/$PLANNING_MARKER/,/$PLANNING_END/d" "$CLAUDE_MD"
            else
                sed -i "/$PLANNING_MARKER/,/$PLANNING_END/d" "$CLAUDE_MD"
            fi
            echo "$PLANNING_RULES" >> "$CLAUDE_MD"
            echo -e "  ${GREEN}[OK]${NC} CLAUDE.md 규칙 업데이트"
        else
            echo "" >> "$CLAUDE_MD"
            echo "$PLANNING_RULES" >> "$CLAUDE_MD"
            echo -e "  ${GREEN}[OK]${NC} CLAUDE.md에 규칙 추가"
        fi
    else
        echo "$PLANNING_RULES" > "$CLAUDE_MD"
        echo -e "  ${GREEN}[OK]${NC} CLAUDE.md 신규 생성"
    fi

    # doc-sync hook 안내
    echo ""
    echo -e "  ${YELLOW}[INFO]${NC} doc-sync hook은 settings.json에 수동 추가가 필요합니다:"
    echo -e "  ${YELLOW}       ${NC}claude \"/oh-my-claudecode:omc-setup\" 실행 후 자동 설정됩니다."

fi

# ═══════════════════════════════════════════
# PART 2: Obsidian Vault 템플릿
# ═══════════════════════════════════════════
if [ "$INSTALL_VAULT" = true ]; then

    echo ""
    echo -e "${BLUE}══════════════════════════════════════════${NC}"
    echo -e "${CYAN}Obsidian Vault 템플릿 설치${NC}"
    echo ""

    # Vault 경로 질문
    read -p "Vault 생성 경로 (기본: ~/Documents/planning-vault): " VAULT_PATH
    VAULT_PATH="${VAULT_PATH:-$HOME/Documents/planning-vault}"

    # 이미 있는지 확인
    if [ -d "$VAULT_PATH" ] && [ -f "$VAULT_PATH/00-HOME.md" ]; then
        echo -e "  ${YELLOW}[SKIP]${NC} Vault가 이미 존재합니다: $VAULT_PATH"
    else
        mkdir -p "$VAULT_PATH"

        # 폴더 구조 생성
        VAULT_DIRS=(
            "_templates"
            "01-공통/PRD" "01-공통/유저스토리" "01-공통/유저페르소나"
            "01-공통/화면흐름도" "01-공통/용어사전" "01-공통/회의록" "01-공통/변경이력"
            "02-기획-디자인/서비스컨셉" "02-기획-디자인/IA" "02-기획-디자인/화면설계서"
            "02-기획-디자인/유저시나리오" "02-기획-디자인/상태화면정의" "02-기획-디자인/디자인토큰"
            "03-개발/기능명세서" "03-개발/API명세서" "03-개발/데이터정의서"
            "03-개발/에러코드정의서" "03-개발/권한매트릭스" "03-개발/상태전이도"
            "04-QA/TC" "04-QA/체크리스트"
            "05-대시보드" "06-아카이브"
        )

        for dir in "${VAULT_DIRS[@]}"; do
            mkdir -p "$VAULT_PATH/$dir"
        done

        # 템플릿 + HOME 복사
        copy_file "vault-template/00-HOME.md" "$VAULT_PATH/00-HOME.md"
        copy_file "vault-template/PROGRESS.md" "$VAULT_PATH/PROGRESS.md"

        # 템플릿 파일 복사
        TPL_COUNT=0
        if [ -d "$SCRIPT_DIR/vault-template/_templates" ]; then
            for tpl in "$SCRIPT_DIR/vault-template/_templates/"*.md; do
                cp "$tpl" "$VAULT_PATH/_templates/"
                TPL_COUNT=$((TPL_COUNT + 1))
            done
        fi

        echo -e "  ${GREEN}[OK]${NC} Vault 생성: $VAULT_PATH"
        echo -e "  ${GREEN}[OK]${NC} 폴더 구조: ${#VAULT_DIRS[@]}개 디렉토리"
        echo -e "  ${GREEN}[OK]${NC} 템플릿: ${TPL_COUNT}개 (Templater 플러그인 필요)"
        echo -e "  ${GREEN}[OK]${NC} 00-HOME.md + PROGRESS.md"
    fi

fi

# ═══════════════════════════════════════════
# PART 3: Living Spec (프로젝트에 복사)
# ═══════════════════════════════════════════
if [ "$INSTALL_SPEC" = true ]; then

    echo ""
    echo -e "${BLUE}══════════════════════════════════════════${NC}"
    echo -e "${CYAN}Living Spec 컴포넌트 + Vault CLI 설치${NC}"
    echo ""

    # 프로젝트 경로 질문
    read -p "프로젝트 루트 경로 (기본: 현재 디렉토리): " PROJECT_PATH
    PROJECT_PATH="${PROJECT_PATH:-.}"

    # src/ 존재 확인
    if [ ! -d "$PROJECT_PATH/src" ]; then
        echo -e "  ${YELLOW}[WARN]${NC} $PROJECT_PATH/src 가 없습니다. 생성합니다."
        mkdir -p "$PROJECT_PATH/src"
    fi

    # Living Spec 컴포넌트 복사
    SPEC_DEST="$PROJECT_PATH/src/components/spec"
    mkdir -p "$SPEC_DEST/hooks" "$SPEC_DEST/types"

    SPEC_FILES=(
        "living-spec/components/spec/spec-provider.tsx"
        "living-spec/components/spec/spec-label.tsx"
        "living-spec/components/spec/spec-tooltip.tsx"
        "living-spec/components/spec/spec-panel.tsx"
        "living-spec/components/spec/spec-toggle.tsx"
        "living-spec/components/spec/spec-screenshot.tsx"
        "living-spec/components/spec/index.ts"
        "living-spec/components/spec/hooks/use-spec-mode.ts"
        "living-spec/components/spec/hooks/use-spec-data.ts"
        "living-spec/components/spec/hooks/use-spec-context.ts"
        "living-spec/components/spec/types/spec.types.ts"
    )

    SPEC_COUNT=0
    for src in "${SPEC_FILES[@]}"; do
        file="${src#living-spec/components/spec/}"
        dest="$SPEC_DEST/$file"
        mkdir -p "$(dirname "$dest")"
        copy_file "$src" "$dest" && SPEC_COUNT=$((SPEC_COUNT + 1))
    done
    echo -e "  ${GREEN}[OK]${NC} Living Spec 컴포넌트: ${SPEC_COUNT}개 → $SPEC_DEST"

    # Vault CLI 스크립트 복사
    SCRIPTS_DEST="$PROJECT_PATH/scripts"
    mkdir -p "$SCRIPTS_DEST/vault-utils"

    SCRIPT_FILES=(
        "living-spec/scripts/vault-export.ts"
        "living-spec/scripts/vault-import.ts"
        "living-spec/scripts/vault-check.ts"
        "living-spec/scripts/tsconfig.json"
        "living-spec/scripts/vault-utils/md-parser.ts"
        "living-spec/scripts/vault-utils/manifest.ts"
        "living-spec/scripts/vault-utils/diff.ts"
        "living-spec/scripts/vault-utils/reporter.ts"
    )

    SCRIPT_COUNT=0
    for src in "${SCRIPT_FILES[@]}"; do
        file="${src#living-spec/scripts/}"
        dest="$SCRIPTS_DEST/$file"
        mkdir -p "$(dirname "$dest")"
        copy_file "$src" "$dest" && SCRIPT_COUNT=$((SCRIPT_COUNT + 1))
    done
    echo -e "  ${GREEN}[OK]${NC} Vault CLI 스크립트: ${SCRIPT_COUNT}개 → $SCRIPTS_DEST"

    # spec-data 디렉토리 생성
    mkdir -p "$PROJECT_PATH/src/spec-data"
    echo '{"screens":{}}' > "$PROJECT_PATH/src/spec-data/_manifest.json"
    echo -e "  ${GREEN}[OK]${NC} spec-data/_manifest.json 생성"

    # 로컬 커맨드 복사
    LOCAL_CMD_DIR="$PROJECT_PATH/.claude/commands"
    mkdir -p "$LOCAL_CMD_DIR"
    copy_file "commands-local/living-spec.md" "$LOCAL_CMD_DIR/living-spec.md" \
        && echo -e "  ${GREEN}[OK]${NC} .claude/commands/living-spec.md (프로젝트 로컬)"

    # package.json 스크립트 안내
    echo ""
    echo -e "  ${YELLOW}[TODO]${NC} package.json에 스크립트 추가가 필요합니다:"
    echo '    "spec:export": "tsx scripts/vault-export.ts"'
    echo '    "spec:import": "tsx scripts/vault-import.ts"'
    echo '    "spec:check":  "tsx scripts/vault-check.ts"'
    echo ""
    echo -e "  ${YELLOW}[TODO]${NC} 의존성 설치: npm install -D tsx"

fi

# ═══════════════════════════════════════════
# 완료 리포트
# ═══════════════════════════════════════════
echo ""
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${GREEN}설치 완료!${NC}"
echo ""

if [ "$INSTALL_CLAUDE" = true ]; then
    echo -e "${CYAN}Claude Code 설정:${NC}"
    echo "  스킬 6개 + 커맨드 10개 + 에이전트 3개 + HUD"
    echo ""
    echo "  사용 가능한 명령어:"
    echo "    /orchestra init [name]     새 프로젝트 기획 시작"
    echo "    /orchestra scan            기존 프로젝트 분석"
    echo "    /orchestra next            다음 단계 자동 실행"
    echo "    /generate-spec             기능명세서 생성"
    echo "    /generate-srs              요구사항 명세서 생성"
    echo "    /generate-tc               TC 문서 생성"
    echo "    /sync-docs                 코드↔문서 동기화"
    echo "    /pencil-spec-doc           화면설계서 pen 생성"
    echo "    /pencil-spec               컴포넌트 상태 매트릭스"
    echo "    /pencil-check              상태 누락 체크"
    echo "    /pencil-init               디자인 시스템 초기화"
    echo "    /e2e                       E2E 테스트"
    echo "    /vault-plan                Vault 기획 (6모드)"
    echo ""
fi

if [ "$INSTALL_VAULT" = true ]; then
    echo -e "${CYAN}Obsidian Vault:${NC}"
    echo "  Obsidian으로 열기: $VAULT_PATH"
    echo "  Templater 플러그인 설치 필요"
    echo ""
fi

if [ "$INSTALL_SPEC" = true ]; then
    echo -e "${CYAN}Living Spec:${NC}"
    echo "  컴포넌트: $PROJECT_PATH/src/components/spec/"
    echo "  스크립트: $PROJECT_PATH/scripts/vault-*"
    echo "  커맨드:   /living-spec export|import|check|label"
    echo ""
fi

echo -e "시작하기:"
echo -e "  ${YELLOW}cd ~/my-project && claude \"/orchestra init my-project\"${NC}"
echo ""
