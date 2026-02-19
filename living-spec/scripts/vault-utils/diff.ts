/**
 * 변경 감지 유틸
 * Vault SCR .md 파일과 기존 JSON을 비교하여 변경 여부를 감지
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ScreenSpecData } from '../../src/components/spec/types/spec.types';
import { parseSCRDocument } from './md-parser';

// ──────────────────────────────────────────────────────────
// 타입 정의
// ──────────────────────────────────────────────────────────

export interface DiffResult {
  screenId: string;
  status: 'new' | 'modified' | 'deleted' | 'unchanged';
  vaultUpdatedAt?: string;
  jsonUpdatedAt?: string;
  changedFields?: string[];
}

// ──────────────────────────────────────────────────────────
// 단일 화면 비교
// ──────────────────────────────────────────────────────────

/**
 * vault에서 파싱한 ScreenSpecData와 기존 JSON ScreenSpecData를 비교
 * 변경된 최상위 필드 목록을 changedFields에 담아 반환
 */
export function compareScreens(
  vaultData: ScreenSpecData,
  jsonData: ScreenSpecData,
): DiffResult {
  const changedFields: string[] = [];

  // 최상위 스칼라 필드 비교
  const scalarFields: (keyof ScreenSpecData)[] = [
    'screenName', 'status', 'version', 'updatedAt', 'platform',
  ];
  for (const field of scalarFields) {
    if (vaultData[field] !== jsonData[field]) {
      changedFields.push(field);
    }
  }

  // overview 비교
  if (!shallowEqual(vaultData.overview, jsonData.overview)) {
    changedFields.push('overview');
  }

  // items 비교 (JSON 직렬화로 깊은 비교)
  if (JSON.stringify(vaultData.items) !== JSON.stringify(jsonData.items)) {
    changedFields.push('items');
  }

  // states 비교
  if (JSON.stringify(vaultData.states) !== JSON.stringify(jsonData.states)) {
    changedFields.push('states');
  }

  // interactions 비교
  if (
    JSON.stringify(vaultData.interactions) !==
    JSON.stringify(jsonData.interactions)
  ) {
    changedFields.push('interactions');
  }

  // responsive 비교
  if (!shallowEqual(vaultData.responsive, jsonData.responsive)) {
    changedFields.push('responsive');
  }

  // accessibility 비교
  if (
    JSON.stringify(vaultData.accessibility) !==
    JSON.stringify(jsonData.accessibility)
  ) {
    changedFields.push('accessibility');
  }

  // relatedDocs 비교
  if (
    JSON.stringify(vaultData.relatedDocs) !==
    JSON.stringify(jsonData.relatedDocs)
  ) {
    changedFields.push('relatedDocs');
  }

  const status: DiffResult['status'] =
    changedFields.length > 0 ? 'modified' : 'unchanged';

  return {
    screenId: vaultData.screenId,
    status,
    vaultUpdatedAt: vaultData.updatedAt,
    jsonUpdatedAt: jsonData.updatedAt,
    changedFields: changedFields.length > 0 ? changedFields : undefined,
  };
}

// ──────────────────────────────────────────────────────────
// 전체 변경 감지
// ──────────────────────────────────────────────────────────

/**
 * vault의 SCR .md 파일 목록과 projectRoot의 spec-data JSON을 비교하여
 * 모든 화면의 DiffResult 배열을 반환
 *
 * @param vaultRoot  Obsidian vault 루트 경로
 * @param projectRoot Next.js 프로젝트 루트 경로
 */
export function detectChanges(
  vaultRoot: string,
  projectRoot: string,
): DiffResult[] {
  const results: DiffResult[] = [];

  // vault의 SCR .md 파일 스캔
  const screenDesignDir = path.join(
    vaultRoot,
    '02-기획-디자인',
    '화면설계서',
  );
  const vaultFiles = fs.existsSync(screenDesignDir)
    ? fs
        .readdirSync(screenDesignDir)
        .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
        .map((f) => path.join(screenDesignDir, f))
    : [];

  // spec-data JSON 파일 스캔
  const specDataDir = path.join(projectRoot, 'src', 'spec-data');
  const jsonFiles = fs.existsSync(specDataDir)
    ? fs
        .readdirSync(specDataDir)
        .filter((f) => f.endsWith('.json') && f !== '_manifest.json')
        .map((f) => path.join(specDataDir, f))
    : [];

  // vault md → screenId 맵
  const vaultMap = new Map<string, ScreenSpecData>();
  for (const mdFile of vaultFiles) {
    try {
      const data = parseSCRDocument(mdFile);
      if (data.screenId) {
        vaultMap.set(data.screenId, data);
      }
    } catch (err) {
      console.warn(`[diff] 파싱 실패: ${mdFile}`, err);
    }
  }

  // JSON → screenId 맵
  const jsonMap = new Map<string, ScreenSpecData>();
  for (const jsonFile of jsonFiles) {
    try {
      const raw = fs.readFileSync(jsonFile, 'utf-8');
      const data = JSON.parse(raw) as ScreenSpecData;
      if (data.screenId) {
        jsonMap.set(data.screenId, data);
      }
    } catch (err) {
      console.warn(`[diff] JSON 파싱 실패: ${jsonFile}`, err);
    }
  }

  // vault에 있는 파일 처리
  for (const [screenId, vaultData] of vaultMap.entries()) {
    const jsonData = jsonMap.get(screenId);

    if (!jsonData) {
      // vault에만 있음 → new
      results.push({
        screenId,
        status: 'new',
        vaultUpdatedAt: vaultData.updatedAt,
      });
    } else {
      // 양쪽 모두 존재 → 비교
      results.push(compareScreens(vaultData, jsonData));
    }
  }

  // JSON에만 있는 파일 → deleted
  for (const [screenId, jsonData] of jsonMap.entries()) {
    if (!vaultMap.has(screenId)) {
      results.push({
        screenId,
        status: 'deleted',
        jsonUpdatedAt: jsonData.updatedAt,
      });
    }
  }

  // screenId 기준 정렬
  results.sort((a, b) => a.screenId.localeCompare(b.screenId));

  return results;
}

// ──────────────────────────────────────────────────────────
// 내부 헬퍼
// ──────────────────────────────────────────────────────────

/** 객체의 얕은 동등 비교 */
function shallowEqual<T extends object>(a: T, b: T): boolean {
  const keysA = Object.keys(a) as (keyof T)[];
  const keysB = Object.keys(b) as (keyof T)[];
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}
