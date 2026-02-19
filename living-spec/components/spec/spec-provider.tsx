'use client';

import React, { createContext, useState, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSpecMode } from '@/components/spec/hooks/use-spec-mode';
import { useSpecData } from '@/components/spec/hooks/use-spec-data';
import type { SpecContextValue } from '@/components/spec/types/spec.types';
import type { SpecManifest, ManifestEntry } from '@/components/spec/types/spec.types';

/** SpecContext — 하위 컴포넌트에서 useSpecContext()로 접근 */
export const SpecContext = createContext<SpecContextValue | null>(null);

interface SpecProviderProps {
  /** 화면 ID를 직접 지정할 때 (예: "SCR-001"). 없으면 pathname으로 자동 결정. */
  screenId?: string;
  /** true이면 production 환경에서 spec 기능을 완전히 비활성화 (기본값: true) */
  devOnly?: boolean;
  children: React.ReactNode;
}

/**
 * Living Spec 시스템의 루트 Provider.
 * devOnly=true이고 production이면 children만 반환하여 번들 크기에 영향 없음.
 */
export function SpecProvider({
  screenId: screenIdProp,
  devOnly = true,
  children,
}: SpecProviderProps) {
  // production 환경에서 devOnly=true이면 spec 기능 전체 비활성화
  if (devOnly && process.env.NODE_ENV === 'production') {
    return <>{children}</>;
  }

  return (
    <SpecProviderInner screenId={screenIdProp} devOnly={devOnly}>
      {children}
    </SpecProviderInner>
  );
}

/** 실제 상태를 관리하는 내부 컴포넌트 (조건부 훅 호출 방지용 분리) */
function SpecProviderInner({
  screenId: screenIdProp,
  children,
}: {
  screenId?: string;
  devOnly?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // pathname 기반으로 매니페스트에서 screenId 자동 결정
  const [resolvedScreenId, setResolvedScreenId] = useState<string | null>(
    screenIdProp ?? null
  );

  useEffect(() => {
    // screenId가 prop으로 직접 주어진 경우 그대로 사용
    if (screenIdProp) {
      setResolvedScreenId(screenIdProp);
      return;
    }

    // 매니페스트에서 pathname과 일치하는 항목 탐색
    async function resolveFromManifest() {
      try {
        const manifest = (await import('@/spec-data/_manifest.json')) as {
          default: SpecManifest;
        };
        const screens: ManifestEntry[] = manifest.default.screens;

        // 정확히 일치하는 항목 먼저 탐색
        let matched = screens.find((s) => s.pagePath === pathname);

        // 없으면 동적 경로 패턴으로 매칭 (예: "/members/[id]" → "/members/123")
        if (!matched) {
          matched = screens.find((s) => {
            const pattern = s.pagePath.replace(/\[.*?\]/g, '[^/]+');
            return new RegExp(`^${pattern}$`).test(pathname ?? '');
          });
        }

        setResolvedScreenId(matched?.screenId ?? null);
      } catch {
        setResolvedScreenId(null);
      }
    }

    resolveFromManifest();
  }, [pathname, screenIdProp]);

  const { mode, setMode, cycleMode } = useSpecMode();
  const { data: screenData, isLoading } = useSpecData(resolvedScreenId);

  // 활성 UI 요소 ID (SpecLabel 클릭 시 설정)
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  // 우측 패널 열림 상태
  const [isPanelOpen, setPanelOpen] = useState(false);

  // mode가 'normal'로 돌아오면 패널과 activeItem 초기화
  useEffect(() => {
    if (mode === 'normal') {
      setActiveItemId(null);
      setPanelOpen(false);
    }
  }, [mode]);

  // 안정적인 콜백 (컨텍스트 값으로 전달)
  const handleSetActiveItemId = useCallback(
    (id: string | null) => setActiveItemId(id),
    []
  );
  const handleSetPanelOpen = useCallback(
    (open: boolean) => setPanelOpen(open),
    []
  );

  const contextValue: SpecContextValue = {
    mode,
    setMode,
    cycleMode,
    screenData: screenData ?? null,
    isLoading,
    screenId: resolvedScreenId,
    activeItemId,
    setActiveItemId: handleSetActiveItemId,
    isPanelOpen,
    setPanelOpen: handleSetPanelOpen,
  };

  return (
    <SpecContext.Provider value={contextValue}>
      {children}
    </SpecContext.Provider>
  );
}
