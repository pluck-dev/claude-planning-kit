/**
 * 리포트 포매터
 * ANSI 코드를 직접 사용하여 컬러 콘솔 출력
 */

// ──────────────────────────────────────────────────────────
// ANSI 색상 코드
// ──────────────────────────────────────────────────────────

const ANSI: Record<string, string> = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  cyan: '\x1b[36m',
};

/**
 * 텍스트에 ANSI 색상 코드 적용
 */
export function colorize(
  text: string,
  color: 'red' | 'yellow' | 'green' | 'blue' | 'gray',
): string {
  return `${ANSI[color]}${text}${ANSI.reset}`;
}

/** 굵게 출력 */
function bold(text: string): string {
  return `${ANSI.bold}${text}${ANSI.reset}`;
}

/** 구분선 */
function divider(char = '─', width = 60): string {
  return colorize(char.repeat(width), 'gray');
}

// ──────────────────────────────────────────────────────────
// export 리포트
// ──────────────────────────────────────────────────────────

/**
 * vault-export 결과 출력
 * status: 'new' | 'modified' | 'unchanged' | 'deleted' | 'error'
 */
export function reportExport(
  results: { screenId: string; status: string; path: string }[],
): void {
  console.log('');
  console.log(bold('📤 Vault Export 결과'));
  console.log(divider());

  if (results.length === 0) {
    console.log(colorize('  처리할 화면이 없습니다.', 'gray'));
    console.log(divider());
    return;
  }

  let newCount = 0;
  let modifiedCount = 0;
  let unchangedCount = 0;
  let errorCount = 0;

  for (const r of results) {
    switch (r.status) {
      case 'new':
        console.log(
          `  ${colorize('✚', 'green')} ${bold(r.screenId)}  ${colorize(r.path, 'gray')}`,
        );
        newCount++;
        break;
      case 'modified':
        console.log(
          `  ${colorize('~', 'yellow')} ${bold(r.screenId)}  ${colorize(r.path, 'gray')}`,
        );
        modifiedCount++;
        break;
      case 'unchanged':
        console.log(
          `  ${colorize('·', 'gray')} ${r.screenId}  ${colorize(r.path, 'gray')}`,
        );
        unchangedCount++;
        break;
      case 'error':
        console.log(
          `  ${colorize('✖', 'red')} ${bold(r.screenId)}  ${colorize(r.path, 'gray')}`,
        );
        errorCount++;
        break;
      default:
        console.log(`  ? ${r.screenId}  ${r.path}`);
    }
  }

  console.log(divider());
  console.log(
    `  합계: ${colorize(`+${newCount}`, 'green')} 신규  ` +
      `${colorize(`~${modifiedCount}`, 'yellow')} 수정  ` +
      `${colorize(`·${unchangedCount}`, 'gray')} 변경없음` +
      (errorCount > 0 ? `  ${colorize(`✖${errorCount}`, 'red')} 오류` : ''),
  );
  console.log('');
}

// ──────────────────────────────────────────────────────────
// import 리포트
// ──────────────────────────────────────────────────────────

/**
 * vault-import(스크린샷 캡처) 결과 출력
 */
export function reportImport(
  results: { screenId: string; screenshotPath: string }[],
): void {
  console.log('');
  console.log(bold('📥 Vault Import 결과 (스크린샷)'));
  console.log(divider());

  if (results.length === 0) {
    console.log(colorize('  임베드할 스크린샷이 없습니다.', 'gray'));
    console.log(divider());
    return;
  }

  for (const r of results) {
    console.log(
      `  ${colorize('✔', 'green')} ${bold(r.screenId)}  →  ${colorize(r.screenshotPath, 'gray')}`,
    );
  }

  console.log(divider());
  console.log(
    `  총 ${colorize(String(results.length), 'green')}개 화면 스크린샷 임베드 완료`,
  );
  console.log('');
}

// ──────────────────────────────────────────────────────────
// check 리포트
// ──────────────────────────────────────────────────────────

/**
 * vault-check 정합성 리포트 출력
 */
export function reportCheck(results: {
  critical: string[];
  warning: string[];
  info: Record<string, number>;
}): void {
  console.log('');
  console.log(bold('🔍 Living Spec 정합성 체크'));
  console.log(divider());

  // Critical
  if (results.critical.length > 0) {
    console.log(bold(colorize('🔴 Critical', 'red')));
    for (const msg of results.critical) {
      console.log(`  ${colorize('✖', 'red')} ${msg}`);
    }
    console.log('');
  }

  // Warning
  if (results.warning.length > 0) {
    console.log(bold(colorize('🟡 Warning', 'yellow')));
    for (const msg of results.warning) {
      console.log(`  ${colorize('!', 'yellow')} ${msg}`);
    }
    console.log('');
  }

  // Info 통계
  console.log(bold(colorize('🟢 Info', 'green')));
  for (const [label, count] of Object.entries(results.info)) {
    const countStr = colorize(String(count), 'blue');
    console.log(`  ${colorize('·', 'gray')} ${label}: ${countStr}`);
  }

  console.log(divider());

  // 최종 판정
  if (results.critical.length === 0 && results.warning.length === 0) {
    console.log(colorize('  모든 항목 정상입니다.', 'green'));
  } else {
    const summary: string[] = [];
    if (results.critical.length > 0) {
      summary.push(colorize(`Critical ${results.critical.length}건`, 'red'));
    }
    if (results.warning.length > 0) {
      summary.push(colorize(`Warning ${results.warning.length}건`, 'yellow'));
    }
    console.log(`  ${summary.join('  ')} 확인 필요`);
  }
  console.log('');
}
