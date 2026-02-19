# /pencil-spec - 컴포넌트 상태 매트릭스 + 디자인 스펙 생성

페이지에서 분리한 컴포넌트의 전체 상태를 정리하고, .pen용 Note와 코드를 생성한다.

## 참조 스킬
`~/.claude/skills/pencil-design-system.md` 전체 적용.

## 사용법
```
/pencil-spec Button
/pencil-spec UserCard
/pencil-spec SearchInput
```

## 수행 절차

### 1. 기존 코드 확인
프로젝트에 해당 컴포넌트가 이미 있으면 → 현재 구현된 상태를 먼저 파악

### 2. 타입 판별 & 상태 매트릭스 출력
```
📋 UserCard 상태 매트릭스

[인터랙션] Default ✅ | Hover ✅ | Active | Focus | Disabled
[데이터]   With Data ✅ | Empty ⭐ | Loading ⭐ | Error ⭐ | Overflow ⭐
[반응형]   Mobile | Tablet | Desktop ✅

⭐ = 필수인데 빠짐
```

### 3. Pencil Note 텍스트 생성
캔버스에 붙일 수 있는 Note:
```
📌 UserCard
Code: src/components/UserCard.tsx
Tailwind: flex gap-4 p-4 rounded-lg shadow-sm bg-white
States: Default, Hover, Empty, Loading, Error
Responsive: Mobile, Desktop
```

### 4. 코드 생성
- cva 기반 variant 정의
- 모든 상태 처리 포함
- Tailwind 우선, CSS 필요 시 별도 파일
