---
id: "<% tp.file.cursor(1) %>"
title: "<% tp.file.cursor(2) %>"
type: "design-token"
status: "draft"
version: "0.1.0"
created: "<% tp.date.now('YYYY-MM-DD') %>"
updated: "<% tp.date.now('YYYY-MM-DD') %>"
author: "<% tp.file.cursor(3) %>"
reviewer: ""
approver: ""
tags: [디자인, 디자인토큰]
related: []
priority: "medium"
phase: ""
---

# <% tp.file.cursor(2) %> 디자인 토큰

## 1. 색상 시스템

### Primary
| 토큰명 | 값 | 용도 |
|--------|-----|------|
| --color-primary-50 | #EFF6FF | 배경 (hover) |
| --color-primary-100 | #DBEAFE | 배경 (active) |
| --color-primary-500 | #3B82F6 | 기본 |
| --color-primary-600 | #2563EB | hover |
| --color-primary-700 | #1D4ED8 | active/pressed |

### Secondary
| 토큰명 | 값 | 용도 |
|--------|-----|------|
| --color-secondary-50 | | 배경 |
| --color-secondary-500 | | 기본 |
| --color-secondary-700 | | active |

### Neutral (Gray)
| 토큰명 | 값 | 용도 |
|--------|-----|------|
| --color-neutral-50 | #F8FAFC | 페이지 배경 |
| --color-neutral-100 | #F1F5F9 | 카드 배경 |
| --color-neutral-200 | #E2E8F0 | 구분선, 테두리 |
| --color-neutral-400 | #94A3B8 | Placeholder 텍스트 |
| --color-neutral-500 | #64748B | 보조 텍스트 |
| --color-neutral-700 | #334155 | 본문 텍스트 |
| --color-neutral-900 | #0F172A | 제목 텍스트 |

### Semantic
| 토큰명 | 값 | 용도 |
|--------|-----|------|
| --color-success | #10B981 | 성공, 완료 |
| --color-warning | #F59E0B | 경고, 주의 |
| --color-error | #EF4444 | 에러, 실패 |
| --color-info | #3B82F6 | 정보, 안내 |

---

## 2. 타이포그래피

| 토큰명 | font-size | line-height | font-weight | 용도 |
|--------|-----------|-------------|-------------|------|
| --text-display | 36px (2.25rem) | 1.2 | 700 (Bold) | 히어로 타이틀 |
| --text-h1 | 30px (1.875rem) | 1.3 | 700 (Bold) | 페이지 제목 |
| --text-h2 | 24px (1.5rem) | 1.3 | 600 (SemiBold) | 섹션 제목 |
| --text-h3 | 20px (1.25rem) | 1.4 | 600 (SemiBold) | 서브 섹션 |
| --text-h4 | 18px (1.125rem) | 1.4 | 500 (Medium) | 카드 제목 |
| --text-body-lg | 16px (1rem) | 1.5 | 400 (Regular) | 본문 (대) |
| --text-body | 14px (0.875rem) | 1.5 | 400 (Regular) | 본문 (기본) |
| --text-body-sm | 13px (0.8125rem) | 1.5 | 400 (Regular) | 본문 (소) |
| --text-caption | 12px (0.75rem) | 1.4 | 400 (Regular) | 캡션, 라벨 |
| --text-overline | 11px (0.6875rem) | 1.4 | 500 (Medium) | 오버라인 |

### 폰트 패밀리
| 용도 | 폰트 |
|------|------|
| 한글 본문 | Pretendard |
| 영문 본문 | Inter |
| 코드 | JetBrains Mono |

---

## 3. 간격 시스템

| 토큰명 | 값 (px) | 값 (rem) | 용도 |
|--------|---------|----------|------|
| --space-0 | 0px | 0 | 없음 |
| --space-1 | 4px | 0.25rem | 아이콘-텍스트 간격 |
| --space-2 | 8px | 0.5rem | 인라인 요소 간격 |
| --space-3 | 12px | 0.75rem | 컴팩트 패딩 |
| --space-4 | 16px | 1rem | 기본 패딩 |
| --space-5 | 20px | 1.25rem | 카드 패딩 |
| --space-6 | 24px | 1.5rem | 섹션 내부 간격 |
| --space-8 | 32px | 2rem | 섹션 간 간격 |
| --space-10 | 40px | 2.5rem | 큰 섹션 간격 |
| --space-12 | 48px | 3rem | 페이지 여백 |
| --space-16 | 64px | 4rem | 대형 여백 |

---

## 4. 그림자

| 토큰명 | 값 | 용도 |
|--------|-----|------|
| --shadow-xs | 0 1px 2px rgba(0,0,0,0.05) | 미세 구분 |
| --shadow-sm | 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06) | 카드 기본 |
| --shadow-md | 0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06) | 카드 hover |
| --shadow-lg | 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05) | 드롭다운, 팝오버 |
| --shadow-xl | 0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04) | 모달 |
| --shadow-inner | inset 0 2px 4px rgba(0,0,0,0.06) | 인풋 필드 (focus) |

---

## 5. 테두리

### Border Radius
| 토큰명 | 값 | 용도 |
|--------|-----|------|
| --radius-none | 0 | 직각 |
| --radius-sm | 4px | 버튼 (소) |
| --radius-md | 8px | 카드, 인풋 |
| --radius-lg | 12px | 모달, 시트 |
| --radius-xl | 16px | 대형 카드 |
| --radius-full | 9999px | 뱃지, 아바타 |

### Border Width
| 토큰명 | 값 | 용도 |
|--------|-----|------|
| --border-thin | 1px | 기본 테두리 |
| --border-medium | 2px | 강조 테두리, 포커스 |
| --border-thick | 4px | 액티브 탭 |

### Border Color
| 토큰명 | 값 | 용도 |
|--------|-----|------|
| --border-default | var(--color-neutral-200) | 기본 |
| --border-hover | var(--color-neutral-400) | hover |
| --border-focus | var(--color-primary-500) | focus |
| --border-error | var(--color-error) | 에러 |

---

## 6. 애니메이션

### Duration
| 토큰명 | 값 | 용도 |
|--------|-----|------|
| --duration-fast | 150ms | hover, 토글 |
| --duration-normal | 300ms | 모달, 전환 |
| --duration-slow | 500ms | 페이지 전환 |

### Easing
| 토큰명 | 값 | 용도 |
|--------|-----|------|
| --ease-default | cubic-bezier(0.4, 0, 0.2, 1) | 기본 전환 |
| --ease-in | cubic-bezier(0.4, 0, 1, 1) | 요소 진입 |
| --ease-out | cubic-bezier(0, 0, 0.2, 1) | 요소 퇴장 |
| --ease-bounce | cubic-bezier(0.68, -0.55, 0.265, 1.55) | 강조 효과 |

---

## 7. 반응형 Breakpoint

| 이름 | 최소 너비 | 최대 너비 | 용도 |
|------|----------|----------|------|
| xs | 0 | 479px | 소형 모바일 |
| sm | 480px | 767px | 모바일 |
| md | 768px | 1023px | 태블릿 |
| lg | 1024px | 1279px | 소형 데스크톱 |
| xl | 1280px | 1535px | 데스크톱 |
| 2xl | 1536px | ∞ | 대형 모니터 |

---

## 8. z-index 체계

| 토큰명 | 값 | 용도 |
|--------|-----|------|
| --z-base | 0 | 기본 |
| --z-dropdown | 100 | 드롭다운 메뉴 |
| --z-sticky | 200 | 고정 헤더 |
| --z-overlay | 300 | 오버레이 배경 |
| --z-modal | 400 | 모달 |
| --z-popover | 500 | 팝오버, 툴팁 |
| --z-toast | 600 | 토스트 알림 |
| --z-max | 9999 | 최상위 (로딩 스피너 등) |

---

## 9. 비고

<!-- 디자인 시스템 변경 이력, 참고 사항 등 -->
