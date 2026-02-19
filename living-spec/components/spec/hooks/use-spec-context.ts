'use client';

import { useContext } from 'react';
import { SpecContext } from '@/components/spec/spec-provider';
import type { SpecContextValue } from '@/components/spec/types/spec.types';

/**
 * SpecContext에서 값을 꺼내는 훅.
 * 컨텍스트 외부에서 호출하면 에러를 던짐.
 * mode가 'normal'이고 컨텍스트가 없는 환경에서는 null 반환 가능.
 */
export function useSpecContext(): SpecContextValue | null {
  const context = useContext(SpecContext);

  // 컨텍스트가 없고 mode가 'normal'인 경우: spec 기능 비활성 상태이므로 null 반환
  if (!context) {
    return null;
  }

  return context;
}

/**
 * SpecContext가 반드시 존재해야 하는 곳에서 사용하는 훅.
 * 컨텍스트 외부에서 호출 시 에러를 던짐.
 */
export function useSpecContextRequired(): SpecContextValue {
  const context = useContext(SpecContext);

  if (!context) {
    throw new Error(
      'useSpecContextRequired는 SpecProvider 내부에서만 사용할 수 있습니다.'
    );
  }

  return context;
}
