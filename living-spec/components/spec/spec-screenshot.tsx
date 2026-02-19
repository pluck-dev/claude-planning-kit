'use client';

import React, { useEffect } from 'react';
import { useSpecContext } from '@/components/spec/hooks/use-spec-context';

/**
 * Screenshot 모드일 때 UI를 스크린샷 캡처에 최적화하는 컴포넌트.
 * 실제 캡처는 CLI(vault-import)에서 Playwright로 처리하며,
 * 이 컴포넌트는 screenshot 모드 진입 시 DOM을 조정하는 역할만 담당.
 *
 * - 배경색을 순백(#ffffff)으로 변경
 * - SpecToggle, SpecPanel 등 불필요한 UI 요소 숨김
 * - 라벨만 표시 (클릭 이벤트 제거는 SpecLabel에서 처리)
 */
export function SpecScreenshot({ children }: { children?: React.ReactNode }) {
  const ctx = useSpecContext();
  const isScreenshot = ctx?.mode === 'screenshot';

  useEffect(() => {
    if (!isScreenshot) return;

    // screenshot 모드 진입 시 body에 클래스 추가
    document.body.classList.add('spec-screenshot-mode');
    document.documentElement.style.setProperty('--spec-screenshot-bg', '#ffffff');

    return () => {
      // 모드 해제 시 복원
      document.body.classList.remove('spec-screenshot-mode');
      document.documentElement.style.removeProperty('--spec-screenshot-bg');
    };
  }, [isScreenshot]);

  // screenshot 모드가 아니면 children 그대로 반환
  if (!isScreenshot) {
    return <>{children}</>;
  }

  return (
    <div
      className="spec-screenshot-wrapper"
      data-spec-screenshot="true"
      style={{ backgroundColor: '#ffffff' }}
    >
      {children}
    </div>
  );
}
