/**
 * Obsidian Markdown 파서
 * SCR 화면설계서 .md 파일을 파싱하여 ScreenSpecData로 변환
 */

import * as fs from 'fs';
import * as path from 'path';
import type {
  ScreenSpecData,
  SpecItem,
  SpecElementType,
  SpecScreenState,
  SpecInteraction,
  SpecResponsive,
  SpecOverview,
  SpecRelatedDocs,
} from '../../src/components/spec/types/spec.types';

// ──────────────────────────────────────────────────────────
// YAML Frontmatter 파싱
// ──────────────────────────────────────────────────────────

/**
 * YAML frontmatter 블록을 추출하여 키-값 Record로 반환
 * 배열 형태(tags: [...])와 문자열 형태 모두 처리
 */
export function parseFrontmatter(content: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  // --- 로 감싸인 frontmatter 블록 추출
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return result;

  const yamlBlock = match[1];
  const lines = yamlBlock.split(/\r?\n/);

  for (const line of lines) {
    // key: value 형태
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim();
    const rawValue = line.slice(colonIdx + 1).trim();

    if (!key) continue;

    // 배열 형태: [a, b, c] 또는 빈 []
    if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
      const inner = rawValue.slice(1, -1).trim();
      result[key] = inner
        ? inner.split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''))
        : [];
      continue;
    }

    // 따옴표 제거
    const value = rawValue.replace(/^["']|["']$/g, '');
    result[key] = value;
  }

  return result;
}

// ──────────────────────────────────────────────────────────
// 마크다운 테이블 파싱
// ──────────────────────────────────────────────────────────

/**
 * 지정된 섹션 헤더 아래의 첫 번째 마크다운 테이블을 파싱
 * 헤더 행과 구분자 행(---)을 건너뛰고 데이터 행만 반환
 */
export function parseMarkdownTable(
  content: string,
  sectionHeader: string,
): Record<string, string>[] {
  const rows: Record<string, string>[] = [];

  // 섹션 헤더 위치 탐색 (## N. 형태 포함)
  const headerPattern = new RegExp(
    `(?:^|\\n)#{1,4}\\s*(?:\\d+\\.\\s*)?${escapeRegex(sectionHeader)}[^\\n]*\\n`,
    'i',
  );
  const headerMatch = content.match(headerPattern);
  if (!headerMatch || headerMatch.index === undefined) return rows;

  const afterHeader = content.slice(
    headerMatch.index + headerMatch[0].length,
  );

  // 테이블 행 탐색: | 로 시작하는 연속 행
  const tableMatch = afterHeader.match(/(\|[^\n]+\n)+/);
  if (!tableMatch) return rows;

  const tableLines = tableMatch[0]
    .split('\n')
    .filter((l) => l.trim().startsWith('|') && l.trim().length > 1);

  if (tableLines.length < 2) return rows;

  // 첫 번째 행: 헤더
  const headers = parseTableRow(tableLines[0]);

  // 두 번째 행: 구분자 (---)  → 건너뜀
  // 나머지 행: 데이터
  for (let i = 2; i < tableLines.length; i++) {
    const cells = parseTableRow(tableLines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = cells[idx] ?? '';
    });
    rows.push(row);
  }

  return rows;
}

/** 테이블 행 문자열 → 셀 배열 */
function parseTableRow(line: string): string[] {
  return line
    .split('|')
    .slice(1, -1) // 양 끝 빈 요소 제거
    .map((cell) => cell.trim());
}

// ──────────────────────────────────────────────────────────
// UI 상세 서브섹션 파싱
// ──────────────────────────────────────────────────────────

/**
 * "#### UI-NNN: [요소명]" 서브섹션을 파싱
 * 반환: { "UI-001": { "타입": "...", "Placeholder": "...", ... } }
 */
export function parseUIDetailSections(
  content: string,
): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};

  // UI-NNN 서브섹션 패턴
  const sectionPattern = /#{3,5}\s*(UI-\d+):\s*([^\n]*)\n([\s\S]*?)(?=\n#{3,5}\s*UI-\d+:|\n#{1,2}\s|\n---|\Z)/g;

  let match: RegExpExecArray | null;
  while ((match = sectionPattern.exec(content)) !== null) {
    const uiId = match[1]; // "UI-001"
    const body = match[3];
    const attrs: Record<string, string> = {};

    // "- **키**: 값" 형태 파싱
    const attrPattern = /^\s*-\s*\*\*([^*]+)\*\*\s*:\s*(.*)$/gm;
    let attrMatch: RegExpExecArray | null;
    while ((attrMatch = attrPattern.exec(body)) !== null) {
      const key = attrMatch[1].trim();
      const value = attrMatch[2].trim().replace(/^["']|["']$/g, '');
      attrs[key] = value;
    }

    result[uiId] = attrs;
  }

  return result;
}

// ──────────────────────────────────────────────────────────
// 위키링크 추출
// ──────────────────────────────────────────────────────────

/**
 * 지정 섹션에서 [[XXX-NNN]] 형태의 위키링크를 추출
 * section이 빈 문자열이면 전체 문서에서 추출
 */
export function parseWikiLinks(content: string, section: string): string[] {
  const links: string[] = [];

  let searchArea = content;

  if (section) {
    const headerPattern = new RegExp(
      `(?:^|\\n)#{1,4}\\s*(?:\\d+\\.\\s*)?${escapeRegex(section)}[^\\n]*\\n`,
      'i',
    );
    const headerMatch = content.match(headerPattern);
    if (headerMatch && headerMatch.index !== undefined) {
      const afterHeader = content.slice(
        headerMatch.index + headerMatch[0].length,
      );
      // 다음 동급/상위 섹션 전까지
      const nextSectionMatch = afterHeader.match(/\n#{1,4}\s/);
      searchArea = nextSectionMatch
        ? afterHeader.slice(0, nextSectionMatch.index)
        : afterHeader;
    } else {
      return links;
    }
  }

  const wikiPattern = /\[\[([A-Z]+-\d+(?:[^\]]*)?)\]\]/g;
  let wikiMatch: RegExpExecArray | null;
  while ((wikiMatch = wikiPattern.exec(searchArea)) !== null) {
    // "FNC-001|표시이름" 형태에서 ID만 추출
    const id = wikiMatch[1].split('|')[0].trim();
    if (id && !links.includes(id)) {
      links.push(id);
    }
  }

  return links;
}

// ──────────────────────────────────────────────────────────
// SCR 문서 전체 파싱
// ──────────────────────────────────────────────────────────

/**
 * SCR 화면설계서 .md 파일을 읽어 ScreenSpecData로 변환
 */
export function parseSCRDocument(filePath: string): ScreenSpecData {
  const content = fs.readFileSync(filePath, 'utf-8');

  // ── frontmatter ──
  const fm = parseFrontmatter(content);

  // ── 1. 화면 개요 ──
  const overviewRows = parseMarkdownTable(content, '화면 개요');
  const overviewMap = tableRowsToMap(overviewRows, '항목', '내용');

  const overview: SpecOverview = {
    category: overviewMap['카테고리'] ?? '',
    accessPath: overviewMap['접근 경로'] ?? '',
    accessRole: overviewMap['접근 권한'] ?? '',
    url: overviewMap['URL'] ?? '',
    description: extractBlockquote(content),
  };

  // ── 3. UI 구성요소 ──
  const uiRows = parseMarkdownTable(content, 'UI 구성요소');
  const uiDetails = parseUIDetailSections(content);

  const items: SpecItem[] = uiRows.map((row, idx) => {
    const uiId = row['요소 ID'] ?? row['요소ID'] ?? '';
    const detail = uiDetails[uiId] ?? {};

    const rawMaxLength = detail['최대 글자 수'] ?? detail['최대글자수'] ?? '';
    const maxLengthNum = rawMaxLength ? parseInt(rawMaxLength, 10) : undefined;

    return {
      id: uiId,
      name: row['요소명'] ?? '',
      type: normalizeElementType(row['타입'] ?? ''),
      required: (row['필수 여부'] ?? row['필수여부'] ?? '').toUpperCase() === 'Y',
      defaultValue: row['기본값'] ?? '',
      validation: row['유효성 검증'] ?? row['유효성검증'] ?? '',
      description: detail['타입'] ? `타입: ${detail['타입']}` : '',
      placeholder: detail['Placeholder'] || detail['placeholder'] || undefined,
      maxLength: isNaN(maxLengthNum as number) ? undefined : maxLengthNum,
      errorMessage: detail['에러 메시지'] ?? detail['에러메시지'] ?? undefined,
      labelNumber: idx + 1,
    };
  });

  // ── 4. 상태별 화면 정의 ──
  const stateRows = parseMarkdownTable(content, '상태별 화면 정의');
  const states: SpecScreenState[] = stateRows.map((row) => ({
    state: row['상태'] ?? '',
    condition: row['조건'] ?? '',
    display: row['표시 내용'] ?? row['표시내용'] ?? '',
    action: row['액션'] ?? '',
  }));

  // ── 5. 인터랙션 정의 ──
  const interactionRows = parseMarkdownTable(content, '인터랙션 정의');
  const interactions: SpecInteraction[] = interactionRows.map((row) => ({
    trigger: row['트리거'] ?? '',
    action: row['액션'] ?? '',
    result: row['결과'] ?? '',
    animation: row['애니메이션'] || undefined,
  }));

  // ── 6. 반응형 대응 ──
  const responsiveRows = parseMarkdownTable(content, '반응형 대응');
  const responsiveMap = tableRowsToMap(responsiveRows, 'Breakpoint', '레이아웃 변화');
  const responsive: SpecResponsive = {
    desktop: responsiveMap['Desktop'] ?? '',
    tablet: responsiveMap['Tablet'] ?? '',
    mobile: responsiveMap['Mobile'] ?? '',
  };

  // ── 7. 접근성 ──
  const accessibilityRows = parseMarkdownTable(content, '접근성');
  const accessibility: Record<string, string> = {};
  for (const row of accessibilityRows) {
    const key = row['항목'] ?? '';
    const value = row['구현 사항'] ?? row['구현사항'] ?? '';
    if (key) accessibility[key] = value;
  }

  // ── 8. 관련 문서 ──
  const relatedSection = '관련 문서';
  const relatedDocs: SpecRelatedDocs = {
    fnc: parseWikiLinks(content, relatedSection).filter((id) => id.startsWith('FNC-')),
    api: parseWikiLinks(content, relatedSection).filter((id) => id.startsWith('API-')),
    tc: parseWikiLinks(content, relatedSection).filter((id) => id.startsWith('TC-')),
    sts: parseWikiLinks(content, relatedSection).filter((id) => id.startsWith('STS-')),
    scn: parseWikiLinks(content, relatedSection).filter((id) => id.startsWith('SCN-')),
  };

  // ── 메타 정보 ──
  const screenId = String(fm['screen_id'] ?? path.basename(filePath, '.md'));
  const screenName = String(fm['title'] ?? overviewMap['화면명'] ?? '');
  const status = String(fm['status'] ?? 'draft');
  const version = String(fm['version'] ?? '0.1.0');
  const updatedAt = String(fm['updated'] ?? new Date().toISOString().slice(0, 10));
  const platform = normalizePlatform(String(fm['platform'] ?? 'web'));

  return {
    screenId,
    screenName,
    status,
    version,
    updatedAt,
    platform,
    overview,
    items,
    states,
    interactions,
    responsive,
    accessibility,
    relatedDocs,
  };
}

// ──────────────────────────────────────────────────────────
// 내부 헬퍼
// ──────────────────────────────────────────────────────────

/** 정규식 특수문자 이스케이프 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** 테이블 rows(key열, value열)를 단일 맵으로 변환 */
function tableRowsToMap(
  rows: Record<string, string>[],
  keyCol: string,
  valueCol: string,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const row of rows) {
    const k = row[keyCol];
    if (k) map[k] = row[valueCol] ?? '';
  }
  return map;
}

/** 첫 번째 blockquote(> 로 시작하는 줄) 추출 */
function extractBlockquote(content: string): string {
  const match = content.match(/^>\s*(.+)$/m);
  return match ? match[1].trim() : '';
}

/** 타입 문자열을 SpecElementType으로 정규화 */
function normalizeElementType(raw: string): SpecElementType {
  const validTypes: SpecElementType[] = [
    'Input', 'TextArea', 'Select', 'Checkbox', 'Radio', 'Toggle',
    'Button', 'Link', 'Table', 'Card', 'Modal', 'Tab', 'Badge', 'Tag',
    'DatePicker', 'TimePicker', 'FileUpload', 'Search', 'Pagination',
    'Chart', 'Stat', 'Avatar', 'Image', 'Text', 'Label', 'Icon',
    'Tooltip', 'Toast', 'Skeleton', 'EmptyState', 'Other',
  ];
  // "Text Input" → "Input" 등 부분 매칭
  for (const t of validTypes) {
    if (raw.includes(t)) return t;
  }
  return 'Other';
}

/** platform 문자열 정규화 */
function normalizePlatform(raw: string): 'web' | 'mobile' | 'both' {
  if (raw === 'mobile') return 'mobile';
  if (raw === 'both') return 'both';
  return 'web';
}
