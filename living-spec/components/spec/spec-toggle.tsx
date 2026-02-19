'use client';

import React, { useEffect } from 'react';
import { Eye, Camera, EyeOff } from 'lucide-react';
import { useSpecContext } from '@/components/spec/hooks/use-spec-context';
import type { SpecMode } from '@/components/spec/types/spec.types';

/** 모드별 아이콘, 텍스트, 스타일 설정 */
const MODE_CONFIG: Record<
  SpecMode,
  { icon: React.ReactNode; label: string; className: string }
> = {
  normal: {
    icon: <EyeOff size={18} />,
    label: 'Spec',
    className:
      'bg-white text-gray-400 border border-gray-200 opacity-40 hover:opacity-80',
  },
  spec: {
    icon: <Eye size={18} />,
    label: 'Spec ON',
    className:
      'bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700',
  },
  screenshot: {
    icon: <Camera size={18} />,
    label: 'Screenshot',
    className:
      'bg-red-600 text-white shadow-lg shadow-red-500/30 hover:bg-red-700',
  },
};

/**
 * 우하단 고정 FAB — Spec 모드를 순환하는 토글 버튼.
 * Ctrl+Shift+S 키보드 단축키 지원.
 * production 환경에서는 렌더링하지 않음.
 */
export function SpecToggle({ devOnly = true }: { devOnly?: boolean }) {
  // production에서 devOnly=true이면 미렌더링
  if (devOnly && process.env.NODE_ENV === 'production') {
    return null;
  }

  return <SpecToggleInner />;
}

function SpecToggleInner() {
  const ctx = useSpecContext();

  // Ctrl+Shift+S 단축키로 모드 순환
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        ctx?.cycleMode();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [ctx]);

  if (!ctx) return null;

  const { mode, cycleMode } = ctx;
  const config = MODE_CONFIG[mode];

  return (
    <button
      onClick={cycleMode}
      className={[
        'fixed bottom-6 right-6 z-[9999]',
        'flex items-center gap-2 px-4 py-2.5 rounded-full',
        'text-sm font-semibold transition-all duration-200',
        config.className,
      ].join(' ')}
      title={`Spec 모드: ${mode} (Ctrl+Shift+S로 전환)`}
      aria-label={`현재 모드: ${mode}. 클릭하여 모드 전환`}
    >
      {config.icon}
      <span>{config.label}</span>
    </button>
  );
}
