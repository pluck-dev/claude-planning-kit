/**
 * _manifest.json CRUD 유틸
 * spec-data 매니페스트 파일을 읽고 쓰는 함수 모음
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ManifestEntry, SpecManifest } from '../../src/components/spec/types/spec.types';

/** manifest 파일 경로 */
const MANIFEST_RELATIVE = 'src/spec-data/_manifest.json';

/** 기본 빈 매니페스트 */
function emptyManifest(): SpecManifest {
  return {
    projectName: 'fitgenie',
    version: '1.0.0',
    updatedAt: new Date().toISOString(),
    screens: [],
  };
}

/**
 * 매니페스트 파일을 읽어 반환.
 * 파일이 없으면 빈 매니페스트를 반환 (에러 없음).
 */
export function readManifest(projectRoot: string): SpecManifest {
  const manifestPath = path.join(projectRoot, MANIFEST_RELATIVE);

  if (!fs.existsSync(manifestPath)) {
    return emptyManifest();
  }

  try {
    const raw = fs.readFileSync(manifestPath, 'utf-8');
    return JSON.parse(raw) as SpecManifest;
  } catch {
    // 파싱 실패 시 빈 매니페스트 반환
    console.warn(`[manifest] 파싱 실패: ${manifestPath}, 빈 매니페스트로 초기화합니다.`);
    return emptyManifest();
  }
}

/**
 * 매니페스트를 파일에 저장.
 * 디렉토리가 없으면 자동 생성.
 */
export function writeManifest(projectRoot: string, manifest: SpecManifest): void {
  const manifestPath = path.join(projectRoot, MANIFEST_RELATIVE);
  const dir = path.dirname(manifestPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // updatedAt 갱신
  manifest.updatedAt = new Date().toISOString();

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
}

/**
 * 화면 항목을 매니페스트에 추가 또는 갱신.
 * 동일 screenId가 이미 존재하면 덮어씀.
 */
export function addScreen(projectRoot: string, entry: ManifestEntry): void {
  const manifest = readManifest(projectRoot);

  const existingIdx = manifest.screens.findIndex(
    (s) => s.screenId === entry.screenId,
  );

  if (existingIdx >= 0) {
    manifest.screens[existingIdx] = entry;
  } else {
    manifest.screens.push(entry);
  }

  // screenId 기준 정렬
  manifest.screens.sort((a, b) => a.screenId.localeCompare(b.screenId));

  writeManifest(projectRoot, manifest);
}

/**
 * screenId에 해당하는 화면 항목을 매니페스트에서 제거.
 * 존재하지 않으면 아무 작업도 하지 않음.
 */
export function removeScreen(projectRoot: string, screenId: string): void {
  const manifest = readManifest(projectRoot);

  const before = manifest.screens.length;
  manifest.screens = manifest.screens.filter((s) => s.screenId !== screenId);

  if (manifest.screens.length < before) {
    writeManifest(projectRoot, manifest);
  }
}

/**
 * pagePath(예: "/members")로 화면 항목 검색.
 * 없으면 undefined 반환.
 */
export function findScreenByPath(
  manifest: SpecManifest,
  pagePath: string,
): ManifestEntry | undefined {
  return manifest.screens.find((s) => s.pagePath === pagePath);
}

/**
 * screenId(예: "SCR-001")로 화면 항목 검색.
 * 없으면 undefined 반환.
 */
export function findScreenById(
  manifest: SpecManifest,
  screenId: string,
): ManifestEntry | undefined {
  return manifest.screens.find((s) => s.screenId === screenId);
}
