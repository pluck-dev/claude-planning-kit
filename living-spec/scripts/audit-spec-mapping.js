#!/usr/bin/env node
/**
 * Living Spec 매핑 감사 스크립트
 *
 * 모든 page.tsx에서 SpecLabel uiId를 추출하고,
 * _manifest.json + SCR JSON과 대조하여 정합성을 검증합니다.
 *
 * 사용법: node scripts/audit-spec-mapping.js
 *         node scripts/audit-spec-mapping.js --json  (JSON 출력)
 */
const fs = require('fs');
const path = require('path');

const jsonOutput = process.argv.includes('--json');

// 1. 매니페스트 로드
const manifestPath = 'src/spec-data/_manifest.json';
if (!fs.existsSync(manifestPath)) {
  console.error('[ERROR] 매니페스트를 찾을 수 없습니다:', manifestPath);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const pathToScr = {};
manifest.screens.forEach(s => { pathToScr[s.path] = s.screenId; });

// 2. 모든 page.tsx 찾기
function findPages(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findPages(full));
    } else if (entry.name === 'page.tsx') {
      results.push(full);
    }
  }
  return results;
}

// 3. route group 패턴 제거 (예: /(admin)/ → /)
function extractUrlPath(pagePath) {
  let urlPath = pagePath
    .replace(/\\/g, '/')
    .replace('src/app/', '/')
    .replace(/\/\([^)]+\)/g, '')  // route group 제거: /(admin), /(auth) 등
    .replace('/page.tsx', '');
  if (urlPath === '' || urlPath === '/') urlPath = '/';
  return urlPath;
}

const pages = findPages('src/app');
const results = [];

for (const pagePath of pages) {
  const content = fs.readFileSync(pagePath, 'utf8');
  // SpecLabel uiId 추출
  const uiIds = [...content.matchAll(/uiId=["']([^"']+)["']/g)].map(m => m[1]);
  if (uiIds.length === 0) continue;

  const urlPath = extractUrlPath(pagePath);
  const scrId = pathToScr[urlPath] || null;

  // SCR JSON 존재 여부 & UI 아이템 매칭
  let scrItems = [];
  let missingItems = [];
  let extraItems = [];
  let scrName = '';
  if (scrId) {
    try {
      const scrJson = JSON.parse(fs.readFileSync('src/spec-data/' + scrId + '.json', 'utf8'));
      scrItems = scrJson.items.map(i => i.id);
      scrName = scrJson.screenName || '';
      missingItems = uiIds.filter(id => !scrItems.includes(id));
      extraItems = scrItems.filter(id => !uiIds.includes(id));
    } catch (e) {
      scrItems = ['FILE_NOT_FOUND'];
      scrName = 'FILE_NOT_FOUND';
    }
  }

  results.push({
    page: urlPath,
    file: pagePath,
    uiIdCount: uiIds.length,
    uiIds: uiIds,
    scrId: scrId || 'NONE',
    scrName,
    scrItemCount: scrItems.length,
    missingInScr: missingItems,
    extraInScr: extraItems,
    status: !scrId ? 'NO_SCR' : missingItems.length > 0 ? 'MISMATCH' : 'OK'
  });
}

// 정렬
results.sort((a, b) => {
  const order = { NO_SCR: 0, MISMATCH: 1, OK: 2 };
  return (order[a.status] || 3) - (order[b.status] || 3);
});

// 출력
if (jsonOutput) {
  console.log(JSON.stringify({
    summary: {
      total: results.length,
      ok: results.filter(r => r.status === 'OK').length,
      mismatch: results.filter(r => r.status === 'MISMATCH').length,
      noScr: results.filter(r => r.status === 'NO_SCR').length,
    },
    results,
  }, null, 2));
} else {
  console.log('=== Living Spec 매핑 감사 결과 ===');
  console.log('총 SpecLabel 사용 페이지:', results.length);
  console.log('OK:', results.filter(r => r.status === 'OK').length);
  console.log('MISMATCH:', results.filter(r => r.status === 'MISMATCH').length);
  console.log('NO_SCR:', results.filter(r => r.status === 'NO_SCR').length);
  console.log('');

  for (const r of results) {
    const icon = r.status === 'OK' ? 'OK' : r.status === 'MISMATCH' ? 'WARN' : 'MISS';
    console.log(`[${icon}] ${r.page} -> ${r.scrId} "${r.scrName}" (page:${r.uiIdCount} scr:${r.scrItemCount})`);
    if (r.status === 'NO_SCR') {
      console.log(`      uiIds: ${r.uiIds.join(', ')}`);
    }
    if (r.status === 'MISMATCH') {
      if (r.missingInScr.length > 0) console.log(`      page에만 있음: ${r.missingInScr.join(', ')}`);
      if (r.extraInScr.length > 0) console.log(`      SCR에만 있음: ${r.extraInScr.join(', ')}`);
    }
  }
}
