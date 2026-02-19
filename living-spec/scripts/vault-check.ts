/**
 * vault-check CLI
 * Vault SCR .md ↔ spec-data JSON ↔ 코드 정합성 리포트
 *
 * 사용법:
 *   tsx scripts/vault-check.ts [--vault <vault-path>] [--project <project-path>]
 *
 * 기본값:
 *   --vault   ~/Documents/service-planning-vault
 *   --project . (현재 디렉토리)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { readManifest } from './vault-utils/manifest';
import { parseFrontmatter } from './vault-utils/md-parser';
import { reportCheck } from './vault-utils/reporter';

// ──────────────────────────────────────────────────────────
// CLI 인자 파싱
// ──────────────────────────────────────────────────────────

interface CliArgs {
  vault: string;
  project: string;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const result: CliArgs = {
    vault: path.join(os.homedir(), 'Documents', 'service-planning-vault'),
    project: process.cwd(),
  };

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

function expandTilde(p: string): string {
  if (p.startsWith('~/')) {
    return path.join(os.homedir(), p.slice(2));
  }
  return path.resolve(p);
}

// ──────────────────────────────────────────────────────────
// 스캔 헬퍼
// ──────────────────────────────────────────────────────────

/** vault SCR .md 파일 목록을 { screenId, updatedAt, filePath } 배열로 반환 */
function scanVaultScreens(vaultRoot: string): Array<{
  screenId: string;
  updatedAt: string;
  filePath: string;
}> {
  const screenDesignDir = path.join(vaultRoot, '02-기획-디자인', '화면설계서');
  if (!fs.existsSync(screenDesignDir)) return [];

  const results: { screenId: string; updatedAt: string; filePath: string }[] = [];

  const mdFiles = fs
    .readdirSync(screenDesignDir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'));

  for (const f of mdFiles) {
    const fullPath = path.join(screenDesignDir, f);
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const fm = parseFrontmatter(content);
      const screenId = String(fm['screen_id'] ?? '').trim();
      const updatedAt = String(fm['updated'] ?? '').trim();

      if (screenId && screenId !== 'SCR-xxx') {
        results.push({ screenId, updatedAt, filePath: fullPath });
      }
    } catch {
      // 파싱 실패 무시
    }
  }

  return results;
}

/** spec-data JSON 파일 목록을 { screenId, lastSyncedAt, filePath } 배열로 반환 */
function scanJsonScreens(projectRoot: string): Array<{
  screenId: string;
  lastSyncedAt: string;
  updatedAt: string;
  filePath: string;
}> {
  const specDataDir = path.join(projectRoot, 'src', 'spec-data');
  if (!fs.existsSync(specDataDir)) return [];

  const results: {
    screenId: string;
    lastSyncedAt: string;
    updatedAt: string;
    filePath: string;
  }[] = [];

  const jsonFiles = fs
    .readdirSync(specDataDir)
    .filter((f) => f.endsWith('.json') && f !== '_manifest.json');

  for (const f of jsonFiles) {
    const fullPath = path.join(specDataDir, f);
    try {
      const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
      if (data.screenId) {
        results.push({
          screenId: data.screenId,
          lastSyncedAt: data.lastSyncedAt ?? '',
          updatedAt: data.updatedAt ?? '',
          filePath: fullPath,
        });
      }
    } catch {
      // 파싱 실패 무시
    }
  }

  return results;
}

/**
 * src/app/ 코드에서 SpecLabel이 사용된 화면(screenId) 목록을 grep으로 추출
 * child_process 사용 없이 fs로 직접 탐색
 */
function scanSpecLabelUsage(projectRoot: string): Set<string> {
  const appDir = path.join(projectRoot, 'src', 'app');
  const usedScreenIds = new Set<string>();

  if (!fs.existsSync(appDir)) return usedScreenIds;

  // app 디렉토리를 재귀 탐색하여 SpecLabel 사용 파일 확인
  const tsxFiles = findFilesRecursive(appDir, ['.tsx', '.ts']);
  for (const filePath of tsxFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('SpecLabel') || content.includes('SpecProvider')) {
        // 해당 파일의 경로에서 screenId 추정 (manifest 기반)
        const relPath = path.relative(projectRoot, filePath).replace(/\\/g, '/');
        // manifest에서 filePath가 일치하는 항목의 screenId를 사용
        usedScreenIds.add(relPath); // relPath를 키로 저장, 아래에서 매핑
      }
    } catch { /* 무시 */ }
  }

  return usedScreenIds;
}

/** 디렉토리 재귀 탐색으로 특정 확장자 파일 목록 반환 */
function findFilesRecursive(dir: string, exts: string[]): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFilesRecursive(fullPath, exts));
    } else if (entry.isFile() && exts.some((ext) => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

// ──────────────────────────────────────────────────────────
// 날짜 비교 헬퍼
// ──────────────────────────────────────────────────────────

/**
 * vaultDate가 jsonDate보다 최신인지 확인
 * YYYY-MM-DD 또는 ISO 8601 형식 지원
 */
function isVaultNewer(vaultDate: string, jsonDate: string): boolean {
  if (!vaultDate || !jsonDate) return false;
  try {
    return new Date(vaultDate) > new Date(jsonDate);
  } catch {
    return false;
  }
}

// ──────────────────────────────────────────────────────────
// 메인 로직
// ──────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const { vault, project } = parseArgs();

  console.log(`\n[vault-check]`);
  console.log(`  Vault   : ${vault}`);
  console.log(`  Project : ${project}\n`);

  // 1. vault SCR .md 스캔
  const vaultScreens = scanVaultScreens(vault);

  // 2. spec-data JSON 스캔
  const jsonScreens = scanJsonScreens(project);

  // 3. manifest 로드
  const manifest = readManifest(project);

  // 4. 코드 SpecLabel 사용 파일 스캔
  const specLabelFiles = scanSpecLabelUsage(project);

  // manifest의 filePath 기준으로 SpecLabel 사용 여부 판단
  const specLabelScreenIds = new Set<string>();
  for (const entry of manifest.screens) {
    const relPath = entry.filePath.replace(/\\/g, '/');
    if (specLabelFiles.has(relPath)) {
      specLabelScreenIds.add(entry.screenId);
    }
  }

  // 맵 구성
  const vaultMap = new Map(vaultScreens.map((s) => [s.screenId, s]));
  const jsonMap = new Map(jsonScreens.map((s) => [s.screenId, s]));
  const manifestIds = new Set(manifest.screens.map((s) => s.screenId));

  const critical: string[] = [];
  const warning: string[] = [];

  // ── 체크 1: SCR md 있으나 JSON 없음 → export 필요 (Critical)
  for (const [screenId] of vaultMap) {
    if (!jsonMap.has(screenId)) {
      critical.push(
        `[SCR→JSON 없음] ${screenId}: vault에 md가 있으나 JSON이 없습니다. vault-export를 실행하세요.`,
      );
    }
  }

  // ── 체크 2: JSON 있으나 SCR md 없음 → 고아 JSON (Critical)
  for (const [screenId] of jsonMap) {
    if (!vaultMap.has(screenId)) {
      critical.push(
        `[고아 JSON] ${screenId}: JSON은 있으나 vault SCR md가 없습니다. 삭제 또는 복구가 필요합니다.`,
      );
    }
  }

  // ── 체크 3: vault updated > JSON lastSyncedAt → vault가 앞서감 (Warning)
  for (const [screenId, vaultInfo] of vaultMap) {
    const jsonInfo = jsonMap.get(screenId);
    if (!jsonInfo) continue;

    const syncDate = jsonInfo.lastSyncedAt || jsonInfo.updatedAt;
    if (isVaultNewer(vaultInfo.updatedAt, syncDate)) {
      warning.push(
        `[동기화 필요] ${screenId}: vault(${vaultInfo.updatedAt}) > JSON(${syncDate}). vault-export를 실행하세요.`,
      );
    }
  }

  // ── 체크 4: SpecLabel이 코드에 적용되지 않은 화면 (Warning)
  for (const entry of manifest.screens) {
    if (!specLabelScreenIds.has(entry.screenId)) {
      warning.push(
        `[SpecLabel 미적용] ${entry.screenId} (${entry.filePath}): SpecLabel/SpecProvider가 코드에 없습니다.`,
      );
    }
  }

  // ── 체크 5: manifest에 없는 JSON (Warning)
  for (const [screenId] of jsonMap) {
    if (!manifestIds.has(screenId)) {
      warning.push(
        `[Manifest 누락] ${screenId}: JSON은 있으나 manifest에 등록되지 않았습니다.`,
      );
    }
  }

  // ── Info 통계
  const totalScreens = vaultMap.size;
  const syncedCount = [...vaultMap.keys()].filter((id) => jsonMap.has(id)).length;
  const exportNeeded = critical.filter((m) => m.includes('SCR→JSON 없음')).length;
  const orphanJson = critical.filter((m) => m.includes('고아 JSON')).length;
  const labelMissing = warning.filter((m) => m.includes('SpecLabel 미적용')).length;
  const outOfSync = warning.filter((m) => m.includes('동기화 필요')).length;

  const info: Record<string, number> = {
    '총 화면 수 (vault)': totalScreens,
    '동기화된 화면 수': syncedCount,
    'export 필요': exportNeeded,
    '고아 JSON': orphanJson,
    '동기화 필요 (vault 앞섬)': outOfSync,
    'SpecLabel 미적용': labelMissing,
  };

  // 결과 출력
  reportCheck({ critical, warning, info });

  // 종료 코드: critical이 있으면 1
  if (critical.length > 0) {
    process.exit(1);
  }
}

// ──────────────────────────────────────────────────────────
// 실행
// ──────────────────────────────────────────────────────────

main().catch((err) => {
  console.error('[vault-check] 예상치 못한 오류:', err);
  process.exit(1);
});
