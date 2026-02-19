// Living Spec System — 배럴 export
// 모든 컴포넌트와 훅, 타입을 re-export

// 타입
export type {
  SpecMode,
  SpecElementType,
  SpecItem,
  SpecScreenState,
  SpecInteraction,
  SpecResponsive,
  SpecOverview,
  SpecRelatedDocs,
  ScreenSpecData,
  ManifestEntry,
  SpecManifest,
  SpecContextValue,
  SpecLabelProps,
  SpecTooltipProps,
  SpecPanelTab,
} from '@/components/spec/types/spec.types';

// 훅
export { useSpecMode } from '@/components/spec/hooks/use-spec-mode';
export { useSpecData } from '@/components/spec/hooks/use-spec-data';
export {
  useSpecContext,
  useSpecContextRequired,
} from '@/components/spec/hooks/use-spec-context';

// Provider (컨텍스트 포함)
export { SpecProvider, SpecContext } from '@/components/spec/spec-provider';

// 컴포넌트
export { SpecLabel } from '@/components/spec/spec-label';
export { SpecTooltip } from '@/components/spec/spec-tooltip';
export { SpecPanel } from '@/components/spec/spec-panel';
export { SpecToggle } from '@/components/spec/spec-toggle';
export { SpecScreenshot } from '@/components/spec/spec-screenshot';
