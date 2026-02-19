'use client';

import React, { useState } from 'react';
import { X, ChevronRight, FileText, Zap, Layers, Link2 } from 'lucide-react';
import { useSpecContext } from '@/components/spec/hooks/use-spec-context';
import type { SpecPanelTab, SpecItem } from '@/components/spec/types/spec.types';

const TABS: { key: SpecPanelTab; label: string; icon: React.ReactNode }[] = [
  { key: 'items', label: 'UI요소', icon: <Layers size={14} /> },
  { key: 'states', label: '상태', icon: <Zap size={14} /> },
  { key: 'interactions', label: '인터랙션', icon: <ChevronRight size={14} /> },
  { key: 'related', label: '관련문서', icon: <Link2 size={14} /> },
];

/** 타입 뱃지 색상 */
function TypeBadge({ type }: { type: string }) {
  return (
    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">
      {type}
    </span>
  );
}

/** UI요소 탭 콘텐츠 */
function ItemsTab({
  items,
  activeItemId,
  onSelect,
}: {
  items: SpecItem[];
  activeItemId: string | null;
  onSelect: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-8">UI 요소 없음</p>
    );
  }
  return (
    <ul className="divide-y divide-gray-100">
      {items.map((item) => (
        <li key={item.id}>
          <button
            className={[
              'w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors',
              activeItemId === item.id ? 'bg-blue-50' : '',
            ].join(' ')}
            onClick={() => onSelect(item.id)}
          >
            {/* 번호 원형 뱃지 */}
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
              {item.labelNumber}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-medium text-gray-800 truncate">
                {item.name}
              </span>
              <span className="text-xs text-gray-400">{item.id}</span>
            </span>
            <TypeBadge type={item.type} />
          </button>
        </li>
      ))}
    </ul>
  );
}

/** 상태 탭 콘텐츠 */
function StatesTab({
  states,
}: {
  states: { state: string; condition: string; display: string; action: string }[];
}) {
  if (states.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-8">상태 정보 없음</p>;
  }
  return (
    <div className="divide-y divide-gray-100">
      {states.map((s, i) => (
        <div key={i} className="px-4 py-3">
          <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded mb-1">
            {s.state}
          </span>
          <dl className="mt-1 space-y-0.5 text-xs text-gray-700">
            <div className="flex gap-2">
              <dt className="text-gray-400 w-12 flex-shrink-0">조건</dt>
              <dd>{s.condition}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-400 w-12 flex-shrink-0">표시</dt>
              <dd>{s.display}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-400 w-12 flex-shrink-0">액션</dt>
              <dd>{s.action}</dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
}

/** 인터랙션 탭 콘텐츠 */
function InteractionsTab({
  interactions,
}: {
  interactions: { trigger: string; action: string; result: string; animation?: string }[];
}) {
  if (interactions.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-8">인터랙션 없음</p>;
  }
  return (
    <div className="divide-y divide-gray-100">
      {interactions.map((ia, i) => (
        <div key={i} className="px-4 py-3">
          <p className="text-xs font-semibold text-blue-700 mb-1">{ia.trigger}</p>
          <dl className="space-y-0.5 text-xs text-gray-700">
            <div className="flex gap-2">
              <dt className="text-gray-400 w-12 flex-shrink-0">액션</dt>
              <dd>{ia.action}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-400 w-12 flex-shrink-0">결과</dt>
              <dd>{ia.result}</dd>
            </div>
            {ia.animation && ia.animation !== '-' && (
              <div className="flex gap-2">
                <dt className="text-gray-400 w-12 flex-shrink-0">애니</dt>
                <dd className="font-mono">{ia.animation}</dd>
              </div>
            )}
          </dl>
        </div>
      ))}
    </div>
  );
}

/** 관련문서 탭 콘텐츠 */
function RelatedTab({
  relatedDocs,
}: {
  relatedDocs: { fnc: string[]; api: string[]; tc: string[]; sts: string[]; scn: string[] };
}) {
  const sections = [
    { label: 'FNC', items: relatedDocs.fnc, color: 'bg-purple-100 text-purple-700' },
    { label: 'API', items: relatedDocs.api, color: 'bg-green-100 text-green-700' },
    { label: 'TC', items: relatedDocs.tc, color: 'bg-orange-100 text-orange-700' },
    { label: 'STS', items: relatedDocs.sts, color: 'bg-pink-100 text-pink-700' },
    { label: 'SCN', items: relatedDocs.scn, color: 'bg-cyan-100 text-cyan-700' },
  ].filter((s) => s.items.length > 0);

  if (sections.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-8">관련 문서 없음</p>;
  }

  return (
    <div className="px-4 py-3 space-y-3">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="text-xs font-semibold text-gray-500 mb-1.5">{section.label}</p>
          <div className="flex flex-wrap gap-1.5">
            {section.items.map((id) => (
              <span
                key={id}
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${section.color}`}
              >
                {id}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Living Spec 우측 사이드바 패널 (width: 360px) */
export function SpecPanel() {
  const ctx = useSpecContext();
  const [activeTab, setActiveTab] = useState<SpecPanelTab>('items');

  // 컨텍스트 없음 또는 normal 모드이면 미렌더링
  if (!ctx || ctx.mode === 'normal') return null;

  const { screenData, isLoading, isPanelOpen, setPanelOpen, activeItemId, setActiveItemId } = ctx;

  return (
    <>
      {/* 오버레이 (패널 바깥 클릭 시 닫힘) */}
      {isPanelOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setPanelOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 사이드바 패널 */}
      <aside
        className={[
          'fixed top-0 right-0 h-full w-[360px] bg-white border-l border-gray-200 shadow-2xl z-50',
          'flex flex-col transition-transform duration-300 ease-in-out',
          isPanelOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        aria-label="Living Spec 패널"
      >
        {/* 패널 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-blue-600" />
            <span className="font-semibold text-gray-800 text-sm">Living Spec</span>
            {screenData && (
              <span className="text-xs text-gray-400 font-mono">{screenData.screenId}</span>
            )}
          </div>
          <button
            onClick={() => setPanelOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="패널 닫기"
          >
            <X size={18} />
          </button>
        </div>

        {/* 화면 개요 */}
        {screenData && (
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex-shrink-0">
            <p className="font-semibold text-gray-800 text-sm">{screenData.screenName}</p>
            <p className="text-xs text-gray-500 mt-0.5">{screenData.overview.url}</p>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">
              {screenData.overview.description}
            </p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {screenData.overview.accessRole}
              </span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                v{screenData.version}
              </span>
            </div>
          </div>
        )}

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-gray-200 flex-shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={[
                'flex-1 flex items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors',
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700',
              ].join(' ')}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 (스크롤 영역) */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!isLoading && !screenData && (
            <p className="text-gray-400 text-sm text-center py-8">
              스펙 데이터를 찾을 수 없습니다
            </p>
          )}

          {!isLoading && screenData && (
            <>
              {activeTab === 'items' && (
                <ItemsTab
                  items={screenData.items}
                  activeItemId={activeItemId}
                  onSelect={(id) => {
                    setActiveItemId(id);
                    setActiveTab('items');
                  }}
                />
              )}
              {activeTab === 'states' && (
                <StatesTab states={screenData.states} />
              )}
              {activeTab === 'interactions' && (
                <InteractionsTab interactions={screenData.interactions} />
              )}
              {activeTab === 'related' && (
                <RelatedTab relatedDocs={screenData.relatedDocs} />
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
