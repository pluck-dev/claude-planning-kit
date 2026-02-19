'use client';

import { useState, useEffect } from 'react';
import type { ScreenSpecData } from '@/components/spec/types/spec.types';

interface UseSpecDataResult {
  data: ScreenSpecData | null;
  isLoading: boolean;
  error: string | null;
}

/** screenId로 JSON 파일을 dynamic import하여 화면 스펙 데이터를 로딩하는 훅 */
export function useSpecData(screenId: string | null): UseSpecDataResult {
  const [data, setData] = useState<ScreenSpecData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // screenId가 없으면 초기화 후 종료
    if (!screenId) {
      setData(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
        // src/spec-data/{screenId}.json 동적 로딩
        const module = await import(`@/spec-data/${screenId}.json`);
        if (!cancelled) {
          setData(module.default as ScreenSpecData);
        }
      } catch {
        if (!cancelled) {
          setError(`스펙 데이터를 불러올 수 없습니다: ${screenId}.json`);
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    // 클린업: 다음 effect 실행 전 이전 요청 무효화
    return () => {
      cancelled = true;
    };
  }, [screenId]);

  return { data, isLoading, error };
}
