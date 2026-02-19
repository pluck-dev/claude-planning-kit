'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { SpecTooltipProps } from '@/components/spec/types/spec.types';

/**
 * 클릭한 SpecLabel 옆에 표시되는 팝업 툴팁.
 * anchorRect 기반으로 화면 밖으로 나가지 않게 위치를 자동 조정.
 */
export function SpecTooltip({ item, onClose, anchorRect }: SpecTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 });

  // anchorRect 기반 위치 계산
  useEffect(() => {
    if (!tooltipRef.current) return;

    const MARGIN = 8;
    const tooltipEl = tooltipRef.current;
    const tooltipWidth = tooltipEl.offsetWidth || 320;
    const tooltipHeight = tooltipEl.offsetHeight || 200;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top: number;
    let left: number;

    if (anchorRect) {
      // 기본: 라벨 오른쪽에 배치
      left = anchorRect.right + MARGIN;
      top = anchorRect.top;

      // 오른쪽 경계 초과 시 왼쪽으로 이동
      if (left + tooltipWidth > viewportWidth - MARGIN) {
        left = anchorRect.left - tooltipWidth - MARGIN;
      }

      // 하단 경계 초과 시 위로 조정
      if (top + tooltipHeight > viewportHeight - MARGIN) {
        top = viewportHeight - tooltipHeight - MARGIN;
      }

      // 상단 경계 미달 시 보정
      if (top < MARGIN) {
        top = MARGIN;
      }
    } else {
      // anchorRect 없으면 화면 중앙 우측에 고정
      top = viewportHeight / 2 - tooltipHeight / 2;
      left = viewportWidth - tooltipWidth - MARGIN * 4;
    }

    setStyle({ position: 'fixed', top, left, zIndex: 9999, opacity: 1 });
  }, [anchorRect]);

  // 바깥 클릭 시 닫힘
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  // ESC 키로 닫힘
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      ref={tooltipRef}
      style={style}
      className="bg-white shadow-xl rounded-lg border border-gray-200 p-4 max-w-sm w-80 transition-opacity duration-150"
      role="dialog"
      aria-modal="true"
      aria-label={`${item.id} 스펙 정보`}
    >
      {/* 헤더: ID + 이름 + 닫기 버튼 */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded mr-2">
            {item.id}
          </span>
          <span className="font-semibold text-gray-900 text-sm">{item.name}</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors ml-2 flex-shrink-0"
          aria-label="닫기"
        >
          <X size={16} />
        </button>
      </div>

      {/* 상세 정보 테이블 */}
      <dl className="space-y-1.5 text-xs">
        {/* 타입 */}
        <div className="flex items-center gap-2">
          <dt className="text-gray-500 w-16 flex-shrink-0">타입</dt>
          <dd className="text-gray-800 font-medium">{item.type}</dd>
        </div>

        {/* 필수 여부 */}
        <div className="flex items-center gap-2">
          <dt className="text-gray-500 w-16 flex-shrink-0">필수</dt>
          <dd>
            <span
              className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                item.required
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {item.required ? '필수' : '선택'}
            </span>
          </dd>
        </div>

        {/* 기본값 */}
        {item.defaultValue && (
          <div className="flex items-center gap-2">
            <dt className="text-gray-500 w-16 flex-shrink-0">기본값</dt>
            <dd className="text-gray-800 font-mono bg-gray-50 px-1 rounded">
              {item.defaultValue}
            </dd>
          </div>
        )}

        {/* 유효성 */}
        {item.validation && (
          <div className="flex items-center gap-2">
            <dt className="text-gray-500 w-16 flex-shrink-0">유효성</dt>
            <dd className="text-gray-800">{item.validation}</dd>
          </div>
        )}

        {/* 에러 메시지 */}
        {item.errorMessage && (
          <div className="flex items-start gap-2">
            <dt className="text-gray-500 w-16 flex-shrink-0 pt-0.5">에러</dt>
            <dd className="text-red-600">{item.errorMessage}</dd>
          </div>
        )}

        {/* 설명 */}
        {item.description && (
          <div className="flex items-start gap-2 pt-1 border-t border-gray-100">
            <dt className="text-gray-500 w-16 flex-shrink-0 pt-0.5">설명</dt>
            <dd className="text-gray-700 leading-relaxed">{item.description}</dd>
          </div>
        )}
      </dl>

      {/* 관련 문서 링크 */}
      {(item.relatedFnc || item.relatedApi) && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-1.5">
          {item.relatedFnc && (
            <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full font-medium">
              FNC {item.relatedFnc}
            </span>
          )}
          {item.relatedApi && (
            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
              API {item.relatedApi}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
