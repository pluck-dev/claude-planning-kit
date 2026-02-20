// Living Spec System - 타입 정의

/** UI 요소 타입 */
export type SpecElementType =
  | 'Input'
  | 'TextArea'
  | 'Select'
  | 'Checkbox'
  | 'Radio'
  | 'Toggle'
  | 'Button'
  | 'Link'
  | 'Table'
  | 'Card'
  | 'Modal'
  | 'Tab'
  | 'Badge'
  | 'Tag'
  | 'DatePicker'
  | 'TimePicker'
  | 'FileUpload'
  | 'Search'
  | 'Pagination'
  | 'Chart'
  | 'Stat'
  | 'Avatar'
  | 'Image'
  | 'Text'
  | 'Label'
  | 'Icon'
  | 'Tooltip'
  | 'Toast'
  | 'Skeleton'
  | 'EmptyState'
  | 'Other';

/** UI 요소 1개 = Vault SCR 문서의 UI 구성요소 테이블 1행 */
export interface SpecItem {
  id: string;              // "UI-001"
  name: string;            // "이메일 입력"
  type: SpecElementType;
  required: boolean;
  defaultValue: string;
  validation: string;
  description: string;     // 상세 설명 (UI-001 서브섹션)
  placeholder?: string;
  maxLength?: number;
  errorMessage?: string;
  relatedFnc?: string;     // "FNC-001"
  relatedApi?: string;     // "API-001"
  labelNumber: number;     // 자동 할당 (1부터)
}

/** 상태별 화면 정의 */
export interface SpecScreenState {
  state: string;           // "Loading" | "Empty" | "Error" | "Success" 등
  condition: string;
  display: string;
  action: string;
}

/** 인터랙션 정의 */
export interface SpecInteraction {
  trigger: string;
  action: string;
  result: string;
  animation?: string;
}

/** 반응형 대응 */
export interface SpecResponsive {
  desktop: string;
  tablet: string;
  mobile: string;
}

/** 화면 개요 */
export interface SpecOverview {
  category: string;
  accessPath: string;
  accessRole: string;
  url: string;
  description: string;
}

/** 관련 문서 ID 배열 */
export interface SpecRelatedDocs {
  fnc: string[];
  api: string[];
  tc: string[];
  sts: string[];
  scn: string[];
}

/** 화면 1개 = SCR-NNN.json */
export interface ScreenSpecData {
  screenId: string;        // "SCR-001"
  screenName: string;
  status: string;
  version: string;
  updatedAt: string;
  platform: 'web' | 'mobile' | 'both';
  overview: SpecOverview;
  items: SpecItem[];
  states: SpecScreenState[];
  interactions: SpecInteraction[];
  responsive: SpecResponsive;
  accessibility: Record<string, string>;
  relatedDocs: SpecRelatedDocs;
  lastSyncedAt?: string;
}

/** 매니페스트 항목 (간소화: 실전 검증 버전) */
export interface ManifestEntry {
  screenId: string;
  name: string;            // 화면명
  path: string;            // URL 경로 (예: "/member/list")
  pagePath: string;        // 파일 경로 (예: "src/app/(admin)/member/list/page.tsx")
}

/** 매니페스트 전체 */
export interface SpecManifest {
  project: string;
  version: string;
  lastExportedAt: string;
  screens: ManifestEntry[];
}

/** Spec 모드 */
export type SpecMode = 'normal' | 'spec' | 'screenshot';

/** SpecProvider 컨텍스트 값 */
export interface SpecContextValue {
  mode: SpecMode;
  setMode: (mode: SpecMode) => void;
  cycleMode: () => void;
  screenData: ScreenSpecData | null;
  isLoading: boolean;
  screenId: string | null;
  activeItemId: string | null;
  setActiveItemId: (id: string | null) => void;
  isPanelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
}

/** SpecLabel props */
export interface SpecLabelProps {
  uiId: string;            // "UI-001"
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  children: React.ReactNode;
}

/** SpecTooltip props */
export interface SpecTooltipProps {
  item: SpecItem;
  onClose: () => void;
  anchorRect?: DOMRect;
}

/** Doc Viewer - 문서 섹션 */
export interface DocSection {
  title: string;
  content: string;
}

/** Doc Viewer - 문서 데이터 (FNC/API JSON) */
export interface DocData {
  docId: string;
  title: string;
  type: string;
  status: string;
  version: string;
  updated: string;
  related: string[];
  sections: DocSection[];
  module?: string;
}

/** SpecPanel 탭 */
export type SpecPanelTab = 'items' | 'states' | 'interactions' | 'related';
