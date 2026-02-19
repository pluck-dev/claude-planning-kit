# Pencil.dev 디자인 시스템 스킬

## 개요
Pencil + Claude Code(MCP)로 디자인 작업할 때 Claude Code가 따라야 하는 규칙.
페이지를 먼저 디자인하고 → 컴포넌트로 분리/정리하는 흐름에서
**빠진 상태, 엣지케이스, 반응형을 놓치지 않도록** 한다.

---

## 1. 디자인 워크플로우

```
[Phase 1] 페이지 디자인 — Pencil 캔버스에 대시보드 등 전체 페이지를 먼저 그린다
    ↓
[Phase 2] 컴포넌트 식별 — 반복되는 패턴, 독립 영역을 찾아낸다
    ↓
[Phase 3] 컴포넌트 분리 — 각 컴포넌트를 별도 .pen으로 분리하고 상태를 보강한다
    ↓
[Phase 4] 상태 보강 — 빠진 상태(empty, error, loading 등)를 채운다
    ↓
[Phase 5] 코드 전환 — 완성된 디자인을 기반으로 코드를 생성한다
```

---

## 2. Phase 1: 페이지 디자인 시 규칙

페이지를 처음 그릴 때는 자유롭게 그리되, Claude Code는 다음을 **항상 리마인드**한다:

### 페이지 레벨 체크
- [ ] 이 페이지에 데이터가 없으면 어떻게 보이나? (Empty State)
- [ ] 데이터 로딩 중에는? (Loading / Skeleton)
- [ ] 에러나면? (Error State)
- [ ] 로그인 안 한 상태로 접근하면? (Unauthenticated)
- [ ] 권한 없으면? (403 Forbidden)
- [ ] 모바일에서는? (Responsive)

### 디자인 시 메모 습관
Pencil Note를 활용해서 각 영역에 메모를 남긴다:
```
📌 이 영역: 데이터 API → /api/users
   - empty: "아직 등록된 사용자가 없습니다" + CTA
   - loading: 스켈레톤 3행
   - error: 재시도 버튼
```

---

## 3. Phase 2-3: 컴포넌트 식별 & 분리 기준

### 컴포넌트로 분리해야 하는 것
- **2번 이상 반복**되는 UI 패턴 (카드, 리스트 아이템 등)
- **독립적 상태**를 가지는 영역 (폼, 모달, 드롭다운)
- **데이터 소스가 다른** 영역 (사이드바 vs 메인 컨텐츠)
- **공통 UI** (버튼, 인풋, 배지, 아바타 등)

### 분리 후 .pen 파일 구조
```
design/
  _system/
    primitives/    ← 버튼, 인풋 등 원자 단위
    composites/    ← 카드, 모달 등 조합 단위
  pages/
    dashboard.pen  ← 원본 페이지 디자인
    settings.pen
```

### 컴포넌트 .pen 파일 배치 규칙
한 캔버스 안에서 가로로 상태를 나열한다:

```
┌──────────────────────────────────────────────────┐
│ 📌 Note: "UserCard"                              │
│ Tailwind: flex, rounded-lg, shadow-sm, p-4       │
│ Code: src/components/UserCard.tsx                 │
│                                                  │
│ [Default]  [Hover]  [Selected]  [Disabled]       │
│                                                  │
│ ── Data States ──                                │
│ [With Data]  [Empty]  [Loading]  [Error]         │
│                                                  │
│ ── Responsive ──                                 │
│ [Desktop]  [Tablet]  [Mobile]                    │
└──────────────────────────────────────────────────┘
```

---

## 4. Phase 4: 상태 보강 체크리스트

### Claude Code는 컴포넌트를 분리할 때 반드시 아래를 체크한다.

### 4-1. 인터랙션 상태 (클릭/탭 가능한 요소)

| 상태 | Tailwind | 필수 |
|------|----------|------|
| Default | 기본 클래스 | ✅ |
| Hover | `hover:` | ✅ |
| Active | `active:` | ✅ |
| Focus | `focus-visible:` | ✅ |
| Disabled | `disabled: opacity-50 cursor-not-allowed` | ✅ |
| Loading | 스피너 / 스켈레톤 | ⭐ 자주 빠뜨림 |

### 4-2. 데이터 상태 (API 데이터를 표시하는 모든 영역)

| 상태 | 설명 | 필수 |
|------|------|------|
| **With Data** | 정상 | ✅ |
| **Empty** | 데이터 0건 — 일러스트 + 안내 문구 + CTA | ⭐ 가장 많이 빠뜨림 |
| **Loading** | 스켈레톤 UI (실제 레이아웃과 동일한 형태) | ✅ |
| **Error** | 에러 메시지 + 재시도 버튼 | ✅ |
| **Partial** | 일부만 로드됨 / 더보기 | 선택 |
| **Overflow** | 텍스트 말줄임, 페이지네이션 | ⭐ 자주 빠뜨림 |
| **First Time** | 최초 사용 (온보딩 안내) | 선택 |
| **Refreshing** | 데이터 있는 상태에서 갱신 중 | 선택 |

### 4-3. 폼/입력 상태

| 상태 | 필수 |
|------|------|
| Empty + Placeholder | ✅ |
| Filled | ✅ |
| Focus | ✅ |
| Valid (성공) | ✅ |
| Invalid + Error Message | ✅ |
| Disabled | ✅ |
| Read-only | 선택 |
| Helper Text | 선택 |
| Character Count (글자 수 제한) | 선택 |

### 4-4. 리스트/테이블

| 상태 | 필수 |
|------|------|
| With Items | ✅ |
| Empty (0건) | ⭐ 필수 |
| Single Item (1건 — 레이아웃 깨지는지) | ⭐ 자주 빠뜨림 |
| Many Items (스크롤/페이지네이션) | ✅ |
| Loading (스켈레톤 행) | ✅ |
| Loading More (infinite scroll) | 선택 |
| Search No Results | ⭐ 필수 |
| Filter 적용 후 Empty | ⭐ 자주 빠뜨림 |
| Error | ✅ |

### 4-5. 페이지/뷰 레벨

| 상태 | 필수 |
|------|------|
| 정상 (Authenticated) | ✅ |
| Logged Out (미인증) | ✅ |
| 403 Forbidden (권한 없음) | ✅ |
| 404 Not Found | ✅ |
| 500 Server Error | 선택 |
| Offline (네트워크 끊김) | 선택 |

### 4-6. 반응형

| Breakpoint | Tailwind | 체크 |
|-----------|----------|------|
| Mobile | 기본 (mobile-first) | ✅ |
| Tablet | `md:` | ✅ |
| Desktop | `lg:` | ✅ |
| Wide | `xl:` | 선택 |

---

## 5. Tailwind + CSS 판단 기준

### Tailwind (기본, 대부분):
- 레이아웃: flex, grid, gap, padding, margin
- 색상, 타이포그래피, border, shadow, radius
- 반응형: sm:, md:, lg:
- 상태: hover:, focus:, active:, disabled:
- 간단한 트랜지션: transition-colors duration-200

### CSS (예외적으로):
- 복잡한 @keyframes 애니메이션
- ::before, ::after 가상 요소
- 스크롤바 커스텀
- backdrop-filter 조합
- 3rd party 라이브러리 오버라이드
- 복잡한 clip-path, mask

---

## 6. 디자인 → 코드 전환 시 규칙

### 컴포넌트 코드 패턴 (cva 기반)
```tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const componentVariants = cva(
  'base-classes', // Tailwind 기본 클래스
  {
    variants: {
      variant: { primary: '...', secondary: '...' },
      size: { sm: '...', md: '...', lg: '...' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)
```

### 데이터 상태 처리 패턴
데이터를 표시하는 모든 컴포넌트는 이 상태들을 처리해야 한다:
```tsx
if (isLoading) return <Skeleton />
if (error) return <ErrorView onRetry={refetch} />
if (!data || data.length === 0) return <EmptyState />
return <실제UI data={data} />
```

---

## 7. Claude Code 행동 규칙

### Pencil MCP로 디자인 대화할 때:
1. 페이지를 그리면 → **"이 영역에 empty state도 필요합니다"** 같은 리마인드를 한다
2. 컴포넌트를 분리하면 → **상태 매트릭스를 자동으로 제시**한다
3. 코드로 전환하면 → **빠진 상태를 포함한 전체 코드**를 생성한다

### 절대 빠뜨리면 안 되는 것 (⭐):
- Empty State (데이터 0건)
- Loading State (스켈레톤)
- Error State (재시도)
- Overflow (텍스트 말줄임, 긴 리스트)
- Search/Filter No Results
- Single Item 레이아웃 확인
- 반응형 (최소 Mobile + Desktop)

### 리마인드 타이밍:
- 새 페이지 디자인 시작할 때
- 컴포넌트 분리할 때
- 코드 생성할 때
- `/pencil-check` 실행할 때
