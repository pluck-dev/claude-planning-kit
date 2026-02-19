'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SpecMode } from '@/components/spec/types/spec.types';

const STORAGE_KEY = 'fitgenie-spec-mode';
const MODE_CYCLE: SpecMode[] = ['normal', 'spec', 'screenshot'];

/** localStorage 기반 Spec 모드 상태 관리 훅 */
export function useSpecMode() {
  // SSR 안전: 초기값은 항상 'normal'로 시작
  const [mode, setModeState] = useState<SpecMode>('normal');

  // 클라이언트 마운트 후 localStorage에서 복원
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(STORAGE_KEY) as SpecMode | null;
    if (saved && MODE_CYCLE.includes(saved)) {
      setModeState(saved);
    }
  }, []);

  // 모드 변경 시 localStorage 동기화
  const setMode = useCallback((newMode: SpecMode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newMode);
    }
    setModeState(newMode);
  }, []);

  // normal → spec → screenshot → normal 순환
  const cycleMode = useCallback(() => {
    setModeState((prev) => {
      const currentIndex = MODE_CYCLE.indexOf(prev);
      const nextIndex = (currentIndex + 1) % MODE_CYCLE.length;
      const next = MODE_CYCLE[nextIndex];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, next);
      }
      return next;
    });
  }, []);

  return { mode, setMode, cycleMode };
}
