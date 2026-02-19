/**
 * vault-export CLI
 * SCR .md → JSON 변환 메인 스크립트
 *
 * 사용법:
 *   tsx scripts/vault-export.ts [--vault <vault-path>] [--project <project-path>]
 *
 * 기본값:
 *   --vault   ~/Documents/service-planning-vault
 *   --project . (현재 디렉토리)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { parseSCRDocument } from './vault-utils/md-parser';
import { detectChanges } from './vault-utils/diff';
import { addScreen, readManifest, writeManifest } from './vault-utils/manifest';
import { reportExport } from './vault-utils/reporter';
import type { ManifestEntry, ScreenSpecData } from '../src/components/spec/types/spec.types';

// ──────────────────────────────────────────────────────────
// CLI 인자 파싱
// ──────────────────────────────────────────────────────────

interface CliArgs {
  vault: string;
  project: string;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const defaults: CliArgs = {
    vault: path.join(os.homedir(), 'Documents', 'service-planning-vault'),
    project: process.cwd(),
  };

  const result = { ...defaults };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--vault' && args[i + 1]) {
      result.vault = expandTilde(args[i + 1]);
      i++;
    } else if (args[i] === '--project' && args[i + 1]) {
      result.project = expandTilde(args[i + 1]);
      i++;
    }
  }

  return result;
}

/** ~ 경로를 절대 경로로 확장 */
function expandTilde(p: string): string {
  if (p.startsWith('~/')) {
    return path.join(os.homedir(), p.slice(2));
  }
  return path.resolve(p);
}

// ──────────────────────────────────────────────────────────
// 메인 로직
// ──────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const { vault, project } = parseArgs();

  console.log(`\n[vault-export]`);
  console.log(`  Vault   : ${vault}`);
  console.log(`  Project : ${project}\n`);

  // vault 화면설계서 디렉토리 확인
  const screenDesignDir = path.join(vault, '02-기획-디자인', '화면설계서');
  if (!fs.existsSync(screenDesignDir)) {
    console.error(`[오류] 화면설계서 디렉토리를 찾을 수 없습니다: ${screenDesignDir}`);
    process.exit(1);
  }

  // spec-data 출력 디렉토리 준비
  const specDataDir = path.join(project, 'src', 'spec-data');
  if (!fs.existsSync(specDataDir)) {
    fs.mkdirSync(specDataDir, { recursive: true });
    console.log(`  spec-data 디렉토리 생성: ${specDataDir}`);
  }

  // 1. 변경 감지
  const diffs = detectChanges(vault, project);

  // 2. 처리 대상 필터 (new / modified)
  const toProcess = diffs.filter(
    (d) => d.status === 'new' || d.status === 'modified',
  );

  const reportRows: { screenId: string; status: string; path: string }[] = [];

  // 3. 변경분만 JSON 출력
  const mdFiles = fs
    .readdirSync(screenDesignDir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .map((f) => path.join(screenDesignDir, f));

  // screenId → md 파일 경로 맵
  const mdMap = new Map<string, string>();
  for (const mdFile of mdFiles) {
    try {
      const data = parseSCRDocument(mdFile);
      if (data.screenId) {
        mdMap.set(data.screenId, mdFile);
      }
    } catch {
      // 파싱 실패는 무시
    }
  }

  for (const diff of diffs) {
    const jsonOutputPath = path.join(specDataDir, `${diff.screenId}.json`);
    const relPath = path.relative(project, jsonOutputPath);

    if (diff.status === 'deleted') {
      // 고아 JSON 알림만 출력 (삭제는 수동으로)
      reportRows.push({ screenId: diff.screenId, status: 'deleted', path: relPath });
      continue;
    }

    if (diff.status === 'unchanged') {
      reportRows.push({ screenId: diff.screenId, status: 'unchanged', path: relPath });
      continue;
    }

    // new 또는 modified → JSON 생성
    const mdFile = mdMap.get(diff.screenId);
    if (!mdFile) {
      reportRows.push({ screenId: diff.screenId, status: 'error', path: relPath });
      continue;
    }

    try {
      const screenData: ScreenSpecData = parseSCRDocument(mdFile);
      screenData.lastSyncedAt = new Date().toISOString();

      fs.writeFileSync(jsonOutputPath, JSON.stringify(screenData, null, 2), 'utf-8');

      // 4. manifest 업데이트
      const entry: ManifestEntry = buildManifestEntry(screenData, jsonOutputPath, project);
      addScreen(project, entry);

      reportRows.push({ screenId: diff.screenId, status: diff.status, path: relPath });
    } catch (err) {
      console.error(`[오류] ${diff.screenId} 처리 중 실패:`, err);
      reportRows.push({ screenId: diff.screenId, status: 'error', path: relPath });
    }
  }

  // unchanged도 manifest에 등록되지 않은 경우 추가
  for (const diff of diffs.filter((d) => d.status === 'unchanged')) {
    const manifest = readManifest(project);
    const existing = manifest.screens.find((s) => s.screenId === diff.screenId);
    if (!existing) {
      const mdFile = mdMap.get(diff.screenId);
      if (mdFile) {
        try {
          const screenData = parseSCRDocument(mdFile);
          const jsonOutputPath = path.join(specDataDir, `${diff.screenId}.json`);
          const entry = buildManifestEntry(screenData, jsonOutputPath, project);
          addScreen(project, entry);
        } catch {
          // 무시
        }
      }
    }
  }

  // 5. manifest updatedAt 갱신
  const manifest = readManifest(project);
  writeManifest(project, manifest);

  // 6. 결과 출력
  reportExport(reportRows);

  // 처리 요약
  const processedCount = toProcess.length;
  const errorCount = reportRows.filter((r) => r.status === 'error').length;

  if (errorCount > 0) {
    process.exit(1);
  }

  console.log(`완료: ${processedCount}개 화면 처리됨\n`);
}

// ──────────────────────────────────────────────────────────
// 헬퍼
// ──────────────────────────────────────────────────────────

/**
 * ScreenSpecData → ManifestEntry 변환
 * pagePath와 filePath는 overview.url 및 convention으로 추정
 */
function buildManifestEntry(
  data: ScreenSpecData,
  jsonOutputPath: string,
  projectRoot: string,
): ManifestEntry {
  const url = data.overview.url || '';
  // URL에서 pagePath 추출: http://localhost:3000/members → /members
  let pagePath = url;
  try {
    pagePath = new URL(url).pathname;
  } catch {
    // url이 이미 경로 형태이거나 비어 있는 경우
    pagePath = url.startsWith('/') ? url : `/${url}`;
  }

  // filePath: pagePath 기반으로 Next.js 경로 추정
  const routeSegment = pagePath === '/' ? '' : pagePath;
  const filePath = `src/app/(admin)${routeSegment}/page.tsx`;

  return {
    screenId: data.screenId,
    screenName: data.screenName,
    pagePath,
    filePath,
    jsonFile: path.basename(jsonOutputPath),
    platform: data.platform,
    status: data.status,
    lastExported: new Date().toISOString(),
  };
}

// ──────────────────────────────────────────────────────────
// 실행
// ──────────────────────────────────────────────────────────

main().catch((err) => {
  console.error('[vault-export] 예상치 못한 오류:', err);
  process.exit(1);
});
