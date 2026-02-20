#!/usr/bin/env node
/**
 * Vault FNC/API 마크다운 → spec-data/docs/ JSON 변환
 *
 * Vault의 기능명세서(FNC)와 API명세서(API) 마크다운을 파싱하여
 * Living Spec Doc Viewer에서 사용할 JSON 파일을 생성합니다.
 *
 * 사용법: node scripts/generate-doc-json.js --vault /path/to/vault
 *         node scripts/generate-doc-json.js --vault /path/to/vault --output src/spec-data/docs
 */
const fs = require('fs');
const path = require('path');

// 인자 파싱
const args = process.argv.slice(2);
let vaultPath = '';
let outputDir = 'src/spec-data/docs';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--vault' && args[i + 1]) vaultPath = args[++i];
  if (args[i] === '--output' && args[i + 1]) outputDir = args[++i];
}

// Vault 경로 자동 감지
if (!vaultPath) {
  // spec.config.json에서 vaultPath 읽기
  try {
    const config = JSON.parse(fs.readFileSync('spec.config.json', 'utf8'));
    vaultPath = config.vaultPath;
  } catch {}
}

if (!vaultPath) {
  // ~/.claude/.planning-kit.json에서 vaultPath 읽기
  try {
    const home = process.env.HOME || process.env.USERPROFILE;
    const config = JSON.parse(fs.readFileSync(path.join(home, '.claude', '.planning-kit.json'), 'utf8'));
    vaultPath = config.vaultPath;
  } catch {}
}

if (!vaultPath || !fs.existsSync(vaultPath)) {
  console.error('[ERROR] Vault 경로를 찾을 수 없습니다.');
  console.error('  --vault 옵션으로 경로를 지정하거나,');
  console.error('  spec.config.json에 vaultPath를 설정하세요.');
  process.exit(1);
}

// 출력 디렉토리 생성
fs.mkdirSync(outputDir, { recursive: true });

// FNC + API 디렉토리 스캔
const docDirs = [
  { dir: path.join(vaultPath, '03-개발', '기능명세서'), type: 'functional-spec', prefix: 'FNC' },
  { dir: path.join(vaultPath, '03-개발', 'API명세서'), type: 'api-spec', prefix: 'API' },
];

let totalGenerated = 0;

for (const { dir, type, prefix } of docDirs) {
  if (!fs.existsSync(dir)) {
    console.log(`[SKIP] ${dir} 디렉토리 없음`);
    continue;
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md') && f.startsWith(prefix));

  for (const file of files) {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const docId = file.replace('.md', '');

    // Frontmatter 파싱
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    const frontmatter = {};
    if (fmMatch) {
      fmMatch[1].split('\n').forEach(line => {
        const [key, ...rest] = line.split(':');
        if (key && rest.length > 0) {
          let value = rest.join(':').trim();
          // 배열 값 파싱
          if (value.startsWith('[') && value.endsWith(']')) {
            try { value = JSON.parse(value.replace(/\[\[/g, '"').replace(/\]\]/g, '"')); } catch {}
          }
          // 따옴표 제거
          if (typeof value === 'string') value = value.replace(/^["']|["']$/g, '');
          frontmatter[key.trim()] = value;
        }
      });
    }

    // 본문 섹션 파싱 (## 기준)
    const body = fmMatch ? content.slice(fmMatch[0].length) : content;
    const sections = [];
    const sectionRegex = /^## (.+)$/gm;
    let match;
    const sectionStarts = [];

    while ((match = sectionRegex.exec(body)) !== null) {
      sectionStarts.push({ title: match[1].trim(), index: match.index });
    }

    for (let i = 0; i < sectionStarts.length; i++) {
      const start = sectionStarts[i].index + sectionStarts[i].title.length + 3; // "## " + title + "\n"
      const end = i + 1 < sectionStarts.length ? sectionStarts[i + 1].index : body.length;
      const sectionContent = body.slice(start, end).trim();

      if (sectionContent) {
        sections.push({
          title: sectionStarts[i].title,
          content: sectionContent,
        });
      }
    }

    // 관련 문서 추출
    const related = [];
    if (Array.isArray(frontmatter.related)) {
      related.push(...frontmatter.related);
    } else if (typeof frontmatter.related === 'string' && frontmatter.related) {
      const refs = frontmatter.related.match(/\[\[([^\]]+)\]\]/g);
      if (refs) related.push(...refs.map(r => r.replace(/\[\[|\]\]/g, '')));
    }

    // JSON 생성
    const docJson = {
      docId,
      title: frontmatter.title || docId,
      type,
      status: frontmatter.status || 'draft',
      version: frontmatter.version || '0.1.0',
      updated: frontmatter.updated || new Date().toISOString().split('T')[0],
      related,
      sections,
      module: frontmatter.module || undefined,
    };

    const outputPath = path.join(outputDir, `${docId}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(docJson, null, 2));
    totalGenerated++;
    console.log(`[OK] ${docId} → ${outputPath} (${sections.length}개 섹션)`);
  }
}

console.log('');
console.log(`=== 완료: ${totalGenerated}개 문서 JSON 생성 → ${outputDir}/ ===`);
