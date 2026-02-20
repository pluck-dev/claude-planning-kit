'use client';

import React, { useState, useCallback } from 'react';
import { X, ChevronRight, ChevronDown, FileText, Zap, Layers, Link2, ArrowLeft } from 'lucide-react';
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

/** 문서 JSON 타입 */
interface DocSection {
  title: string;
  content: string;
}
interface DocData {
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

/** 마크다운 테이블/코드를 간단히 렌더링하는 컴포넌트 */
function DocContent({ content }: { content: string }) {
  // 코드 블록과 일반 텍스트를 분리
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2">
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const lines = part.split('\n');
          const code = lines.slice(1, -1).join('\n');
          return (
            <pre key={i} className="bg-gray-900 text-green-300 text-xs p-3 rounded-lg overflow-x-auto">
              <code>{code}</code>
            </pre>
          );
        }
        // 일반 텍스트 (테이블 포함)
        const trimmed = part.trim();
        if (!trimmed) return null;

        // 테이블 감지 (| 로 시작하는 줄이 2줄 이상)
        const lines = trimmed.split('\n');
        const tableLines = lines.filter((l) => l.trim().startsWith('|'));
        if (tableLines.length >= 2) {
          return <MarkdownTable key={i} lines={lines} />;
        }

        // 일반 텍스트
        return (
          <div key={i} className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
            {trimmed.split('\n').map((line, j) => {
              if (line.startsWith('### ')) {
                return <p key={j} className="font-semibold text-gray-800 mt-2 mb-1">{line.replace('### ', '')}</p>;
              }
              if (line.startsWith('- ')) {
                return <p key={j} className="pl-3">• {line.slice(2)}</p>;
              }
              if (line.trim() === '---') return null;
              return <p key={j}>{line}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

/** 간단한 마크다운 테이블 렌더러 */
function MarkdownTable({ lines }: { lines: string[] }) {
  const tableRows = lines.filter((l) => l.trim().startsWith('|'));
  if (tableRows.length < 2) return null;

  const parseRow = (row: string) =>
    row.split('|').slice(1, -1).map((cell) => cell.trim());

  const headers = parseRow(tableRows[0]);
  // 구분선(|---|) 건너뛰기
  const startIdx = tableRows[1].includes('---') ? 2 : 1;
  const dataRows = tableRows.slice(startIdx).map(parseRow);

  return (
    <div className="overflow-x-auto my-1">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-gray-50">
            {headers.map((h, i) => (
              <th key={i} className="border border-gray-200 px-2 py-1.5 text-left font-semibold text-gray-600 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {row.map((cell, j) => (
                <td key={j} className="border border-gray-200 px-2 py-1 text-gray-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 관련문서 탭 콘텐츠 — Doc Viewer 기능 포함 */
function RelatedTab({
  relatedDocs,
}: {
  relatedDocs: { fnc: string[]; api: string[]; tc: string[]; sts: string[]; scn: string[] };
}) {
  const [selectedDoc, setSelectedDoc] = useState<DocData | null>(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  const loadDoc = useCallback(async (docId: string) => {
    // 토글: 같은 문서 클릭 시 닫기
    if (selectedDoc?.docId === docId) {
      setSelectedDoc(null);
      return;
    }
    setIsLoadingDoc(true);
    setLoadError(null);
    try {
      const mod = await import(`@/spec-data/docs/${docId}.json`);
      setSelectedDoc(mod.default as DocData);
      setExpandedSections(new Set([0])); // 첫 번째 섹션 자동 펼침
    } catch {
      setLoadError(`문서를 불러올 수 없습니다: ${docId}`);
      setSelectedDoc(null);
    } finally {
      setIsLoadingDoc(false);
    }
  }, [selectedDoc?.docId]);

  const toggleSection = useCallback((idx: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const sections = [
    { label: 'FNC (기능명세서)', items: relatedDocs.fnc, color: 'bg-purple-100 text-purple-700', activeColor: 'bg-purple-600 text-white' },
    { label: 'API (API명세서)', items: relatedDocs.api, color: 'bg-green-100 text-green-700', activeColor: 'bg-green-600 text-white' },
    { label: 'TC', items: relatedDocs.tc, color: 'bg-orange-100 text-orange-700', activeColor: 'bg-orange-600 text-white' },
    { label: 'STS', items: relatedDocs.sts, color: 'bg-pink-100 text-pink-700', activeColor: 'bg-pink-600 text-white' },
    { label: 'SCN', items: relatedDocs.scn, color: 'bg-cyan-100 text-cyan-700', activeColor: 'bg-cyan-600 text-white' },
  ].filter((s) => s.items.length > 0);

  if (sections.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-8">관련 문서 없음</p>;
  }

  // 문서 뷰어 모드
  if (selectedDoc) {
    return (
      <div className="flex flex-col h-full">
        {/* 문서 헤더 */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={() => setSelectedDoc(null)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mb-2 transition-colors"
          >
            <ArrowLeft size={12} />
            목록으로 돌아가기
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              selectedDoc.type === 'functional-spec'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {selectedDoc.docId}
            </span>
            <span className="text-xs text-gray-400">v{selectedDoc.version}</span>
          </div>
          <p className="font-semibold text-gray-800 text-sm">{selectedDoc.title}</p>
          <div className="flex gap-2 mt-1.5 text-xs text-gray-500">
            <span>수정: {selectedDoc.updated}</span>
            {selectedDoc.module && <span>• {selectedDoc.module}</span>}
          </div>
        </div>

        {/* 섹션 목록 (아코디언) */}
        <div className="flex-1 overflow-y-auto">
          {selectedDoc.sections.map((section, idx) => (
            <div key={idx} className="border-b border-gray-100">
              <button
                onClick={() => toggleSection(idx)}
                className="w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                {expandedSections.has(idx) ? (
                  <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
                )}
                <span className="text-sm font-medium text-gray-700">{section.title}</span>
              </button>
              {expandedSections.has(idx) && (
                <div className="px-4 pb-3">
                  <DocContent content={section.content} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 뱃지 목록 모드
  return (
    <div className="px-4 py-3 space-y-3">
      <p className="text-xs text-gray-400 mb-2">문서를 클릭하면 내용을 확인할 수 있습니다</p>
      {isLoadingDoc && (
        <div className="flex items-center justify-center py-4">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {loadError && (
        <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded">{loadError}</p>
      )}
      {sections.map((section) => (
        <div key={section.label}>
          <p className="text-xs font-semibold text-gray-500 mb-1.5">{section.label}</p>
          <div className="flex flex-wrap gap-1.5">
            {section.items.map((id) => (
              <button
                key={id}
                onClick={() => loadDoc(id)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer transition-all duration-150 hover:shadow-md hover:scale-105 ${section.color}`}
              >
                {id}
              </button>
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
