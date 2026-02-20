'use client';

import React, { useRef, useCallback } from 'react';
import { useSpecContext } from '@/components/spec/hooks/use-spec-context';
import type { SpecLabelProps } from '@/components/spec/types/spec.types';

/** position 값을 Tailwind 클래스로 변환 */
const POSITION_CLASSES: Record<NonNullable<SpecLabelProps['position']>, string> = {
  'top-left': '-top-3 -left-3',
  'top-right': '-top-3 -right-3',
  'bottom-left': '-bottom-3 -left-3',
  'bottom-right': '-bottom-3 -right-3',
};

/**
 * UI 요소를 래핑하여 Spec 모드에서 번호 라벨을 표시하는 컴포넌트.
 * mode='normal'일 때는 children만 렌더링하여 오버헤드 0.
 */
export function SpecLabel({
  uiId,
  position = 'top-right',
  children,
}: SpecLabelProps) {
  const ctx = useSpecContext();
  const labelRef = useRef<HTMLSpanElement>(null);

  // 모든 훅은 조건문 이전에 호출 (Rules of Hooks 준수)
  const handleLabelClick = useCallback(
    (e: React.MouseEvent) => {
      if (!ctx || ctx.mode !== 'spec') return;
      e.stopPropagation();
      ctx.setActiveItemId(uiId);
      ctx.setPanelOpen(true);
    },
    [ctx, uiId]
  );

  // normal 모드이거나 컨텍스트 없음 → children만 반환
  if (!ctx || ctx.mode === 'normal') {
    return <>{children}</>;
  }

  const { mode, screenData } = ctx;

  // screenData가 없으면 (매니페스트에 없는 페이지) 라벨 미표시
  if (!screenData) {
    return <>{children}</>;
  }

  // 현재 uiId에 해당하는 SpecItem 탐색
  const item = screenData.items.find((i) => i.id === uiId);
  const labelNumber = item?.labelNumber ?? '?';

  const positionClass = POSITION_CLASSES[position];

  return (
    <div className="relative">
      {children}

      {/* 원형 번호 라벨 */}
      <span
        ref={labelRef}
        className={[
          'absolute z-50',
          positionClass,
          'w-6 h-6 bg-blue-600 text-white rounded-full',
          'text-xs font-bold flex items-center justify-center',
          'select-none',
          mode === 'spec'
            ? 'cursor-pointer hover:bg-blue-700 transition-colors'
            : 'cursor-default pointer-events-none',
        ].join(' ')}
        onClick={handleLabelClick}
        title={mode === 'spec' ? `${uiId}: ${item?.name ?? ''}` : undefined}
        aria-label={`UI 요소 ${uiId}`}
      >
        {labelNumber}
      </span>
    </div>
  );
}
