/**
 * vault-import CLI
 * 화면 스크린샷을 캡처하여 Vault SCR 문서에 임베드
 *
 * 사용법:
 *   tsx scripts/vault-import.ts [--vault <vault-path>] [--project <project-path>] [--url <base-url>]
 *
 * 기본값:
 *   --vault   ~/Documents/service-planning-vault
 *   --project . (현재 디렉토리)
 *   --url     http://localhost:3000
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as child_process from 'child_process';
import { readManifest } from './vault-utils/manifest';
import { reportImport } from './vault-utils/reporter';
import type { ManifestEntry } from '../src/components/spec/types/spec.types';

// ──────────────────────────────────────────────────────────
// CLI 인자 파싱
// ──────────────────────────────────────────────────────────

interface CliArgs {
  vault: string;
  project: string;
  baseUrl: string;
  screenId?: string; // 특정 화면만 처리 (선택적)
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const result: CliArgs = {
    vault: path.join(os.homedir(), 'Documents', 'service-planning-vault'),
    project: process.cwd(),
    baseUrl: 'http://localhost:3000',
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--vault' && args[i + 1]) {
      result.vault = expandTilde(args[i + 1]);
      i++;
    } else if (args[i] === '--project' && args[i + 1]) {
      result.project = expandTilde(args[i + 1]);
      i++;
    } else if (args[i] === '--url' && args[i + 1]) {
      result.baseUrl = args[i + 1].replace(/\/$/, ''); // trailing slash 제거
      i++;
    } else if (args[i] === '--screen' && args[i + 1]) {
      result.screenId = args[i + 1];
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
// Playwright 가용 여부 확인
// ──────────────────────────────────────────────────────────

function isPlaywrightAvailable(): boolean {
  try {
    child_process.execSync('npx playwright --version', {
      stdio: 'ignore',
      timeout: 5000,
    });
    return true;
  } catch {
    return false;
  }
}

// ──────────────────────────────────────────────────────────
// Playwright 스크린샷 캡처
// ──────────────────────────────────────────────────────────

/**
 * Playwright를 사용하여 URL 스크린샷 캡처
 * 실패 시 null 반환
 */
function captureScreenshot(url: string, outputPath: string): boolean {
  // 임시 Playwright 스크립트 작성
  const tmpScript = path.join(os.tmpdir(), `_pw_capture_${Date.now()}.js`);
  const script = `
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  try {
    await page.goto(${JSON.stringify(url)}, { waitUntil: 'networkidle', timeout: 15000 });
    await page.screenshot({ path: ${JSON.stringify(outputPath)}, fullPage: false });
    console.log('OK');
  } catch (e) {
    console.error('FAIL', e.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
`;

  try {
    fs.writeFileSync(tmpScript, script, 'utf-8');
    child_process.execSync(`node ${tmpScript}`, {
      stdio: 'pipe',
      timeout: 30000,
    });
    return true;
  } catch {
    return false;
  } finally {
    try { fs.unlinkSync(tmpScript); } catch { /* 무시 */ }
  }
}

// ──────────────────────────────────────────────────────────
// 라벨 매핑 테이블 생성
// ──────────────────────────────────────────────────────────

/**
 * spec-data JSON에서 items를 읽어 라벨 테이블 마크다운 생성
 */
function buildLabelTable(projectRoot: string, screenId: string): string {
  const jsonPath = path.join(projectRoot, 'src', 'spec-data', `${screenId}.json`);
  if (!fs.existsSync(jsonPath)) return '';

  try {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const items = data.items ?? [];

    if (items.length === 0) return '';

    const rows = items
      .map(
        (item: { labelNumber: number; id: string; name: string; type: string }) =>
          `| ${item.labelNumber} | ${item.id} | ${item.name} | ${item.type} |`,
      )
      .join('\n');

    return [
      '',
      '| 라벨번호 | UI ID | 요소명 | 타입 |',
      '|---------|-------|--------|------|',
      rows,
      '',
    ].join('\n');
  } catch {
    return '';
  }
}

// ──────────────────────────────────────────────────────────
// Vault SCR 문서에 이미지 임베드
// ──────────────────────────────────────────────────────────

/**
 * SCR 문서의 "2. 와이어프레임" 섹션 아래에 퍼블리시 UI 이미지 삽입
 * "2.5 퍼블리시된 UI" 서브섹션을 생성하거나 갱신
 */
function embedScreenshotInVault(
  vaultRoot: string,
  screenId: string,
  screenshotVaultPath: string,
  labelTable: string,
): boolean {
  const screenDesignDir = path.join(vaultRoot, '02-기획-디자인', '화면설계서');
  if (!fs.existsSync(screenDesignDir)) return false;

  // SCR 문서 파일 탐색
  const mdFiles = fs
    .readdirSync(screenDesignDir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'));

  let targetFile: string | null = null;
  for (const f of mdFiles) {
    const fullPath = path.join(screenDesignDir, f);
    const content = fs.readFileSync(fullPath, 'utf-8');
    if (content.includes(`screen_id: "${screenId}"`) || content.includes(`screen_id: ${screenId}`)) {
      targetFile = fullPath;
      break;
    }
  }

  if (!targetFile) return false;

  let content = fs.readFileSync(targetFile, 'utf-8');

  // 임베드 블록 생성 (vault 상대 경로 사용)
  const vaultRelPath = path.relative(vaultRoot, screenshotVaultPath).replace(/\\/g, '/');
  const embedBlock = [
    '\n### 2.5 퍼블리시된 UI\n',
    `![[${vaultRelPath}]]`,
    labelTable,
  ].join('\n');

  // 기존 "2.5 퍼블리시된 UI" 섹션 교체 또는 "## 3." 앞에 삽입
  if (content.includes('### 2.5 퍼블리시된 UI')) {
    // 기존 섹션 교체
    content = content.replace(
      /### 2\.5 퍼블리시된 UI[\s\S]*?(?=\n##|\n---|\Z)/,
      embedBlock.trimStart(),
    );
  } else {
    // "## 3. UI 구성요소" 앞에 삽입
    const insertBefore = content.search(/\n## 3\./);
    if (insertBefore >= 0) {
      content =
        content.slice(0, insertBefore) +
        embedBlock +
        '\n\n---\n' +
        content.slice(insertBefore + 1);
    } else {
      // 문서 끝에 추가
      content += embedBlock;
    }
  }

  fs.writeFileSync(targetFile, content, 'utf-8');
  return true;
}

// ──────────────────────────────────────────────────────────
// 메인 로직
// ──────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const { vault, project, baseUrl, screenId: filterScreenId } = parseArgs();

  console.log(`\n[vault-import]`);
  console.log(`  Vault   : ${vault}`);
  console.log(`  Project : ${project}`);
  console.log(`  Base URL: ${baseUrl}\n`);

  // manifest에서 화면-URL 매핑 확인
  const manifest = readManifest(project);
  if (manifest.screens.length === 0) {
    console.log('manifest에 등록된 화면이 없습니다. vault-export를 먼저 실행하세요.');
    process.exit(0);
  }

  // 처리 대상 화면 필터
  const targets: ManifestEntry[] = filterScreenId
    ? manifest.screens.filter((s) => s.screenId === filterScreenId)
    : manifest.screens;

  if (targets.length === 0) {
    console.log(`처리할 화면이 없습니다 (screenId: ${filterScreenId ?? 'all'})`);
    process.exit(0);
  }

  // vault 스크린샷 저장 디렉토리
  const screenshotDir = path.join(vault, '_assets', 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
    console.log(`  스크린샷 디렉토리 생성: ${screenshotDir}`);
  }

  const playwrightAvailable = isPlaywrightAvailable();
  if (!playwrightAvailable) {
    console.log('  ⚠️  Playwright가 설치되어 있지 않습니다.');
    console.log('  수동 캡처 안내:');
    console.log('    1. npx playwright install chromium 으로 설치 후 재실행');
    console.log('    2. 또는 브라우저에서 직접 스크린샷 후 아래 경로에 저장:\n');
    for (const screen of targets) {
      const url = buildScreenUrl(baseUrl, screen.pagePath);
      const screenshotPath = path.join(screenshotDir, `${screen.screenId}-labeled.png`);
      console.log(`     ${screen.screenId}  ${url}`);
      console.log(`     → ${screenshotPath}\n`);
    }
    process.exit(0);
  }

  console.log(`  Playwright 사용 가능 → 자동 캡처 시작\n`);

  const importResults: { screenId: string; screenshotPath: string }[] = [];

  for (const screen of targets) {
    const captureUrl = buildScreenUrl(baseUrl, screen.pagePath) + '?spec-mode=screenshot';
    const outputPath = path.join(screenshotDir, `${screen.screenId}-labeled.png`);

    process.stdout.write(`  캡처 중: ${screen.screenId} (${captureUrl}) ... `);

    const success = captureScreenshot(captureUrl, outputPath);

    if (!success) {
      console.log('실패');
      console.warn(`    [경고] ${screen.screenId} 캡처 실패. 수동으로 저장해 주세요: ${outputPath}`);
      continue;
    }

    console.log('완료');

    // 라벨 테이블 생성
    const labelTable = buildLabelTable(project, screen.screenId);

    // vault SCR 문서에 임베드
    const embedded = embedScreenshotInVault(vault, screen.screenId, outputPath, labelTable);
    if (embedded) {
      console.log(`    → vault 문서 업데이트: ${screen.screenId}`);
    } else {
      console.log(`    → vault 문서를 찾지 못했습니다. 수동으로 임베드하세요.`);
    }

    importResults.push({
      screenId: screen.screenId,
      screenshotPath: path.relative(vault, outputPath),
    });
  }

  // 결과 출력
  reportImport(importResults);
}

// ──────────────────────────────────────────────────────────
// 헬퍼
// ──────────────────────────────────────────────────────────

/** pagePath와 baseUrl을 합쳐 전체 URL 생성 */
function buildScreenUrl(baseUrl: string, pagePath: string): string {
  const cleanPath = pagePath.startsWith('/') ? pagePath : `/${pagePath}`;
  return `${baseUrl}${cleanPath}`;
}

// ──────────────────────────────────────────────────────────
// 실행
// ──────────────────────────────────────────────────────────

main().catch((err) => {
  console.error('[vault-import] 예상치 못한 오류:', err);
  process.exit(1);
});
