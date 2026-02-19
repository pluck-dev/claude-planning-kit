# E2E 테스트 스킬 (Playwright)

## 개요
TC 문서를 기반으로 Playwright E2E 테스트 코드를 생성하고 실행한다.
- TC 문서 → Playwright 테스트 코드 자동 변환
- Page Object Model 패턴 적용
- CI/CD 파이프라인 연동 가능

## 호출
```
/e2e init                          ← Playwright 설치 + 프로젝트 설정
/e2e generate SC-012               ← 특정 화면의 E2E 코드 생성
/e2e generate 회원관리             ← 특정 기능의 E2E 코드 생성
/e2e generate loop                 ← TC 기반 순차 생성
/e2e run                           ← 전체 E2E 테스트 실행
/e2e run 회원관리                  ← 특정 기능만 실행
```

---

## 1. 핵심 원칙

### TC 문서 기반 코드 생성
```
절대 테스트 코드를 "상상"으로 작성하지 않는다.
반드시 docs/tc/*.md의 TC를 먼저 읽고, 각 TC를 코드로 변환한다.
TC가 없으면 먼저 /generate-tc를 실행하라고 안내한다.
```

### Page Object Model (POM)
```
페이지별 객체를 분리하여 유지보수성을 높인다.
셀렉터 변경 시 POM만 수정하면 모든 테스트에 반영된다.
```

### 환경 독립성
```
테스트 데이터는 fixture로 관리한다.
실제 DB/API에 의존하지 않는 독립 실행 가능한 테스트를 작성한다.
필요 시 API mocking (MSW 또는 Playwright route) 사용한다.
```

---

## 2. 파일/폴더 구조

### 초기 설정 후 구조
```
fitgenie/
├── playwright.config.ts           ← Playwright 설정
├── tests/
│   ├── e2e/
│   │   ├── auth/
│   │   │   └── login.spec.ts      ← 인증 E2E
│   │   ├── admin/
│   │   │   ├── dashboard.spec.ts  ← 대시보드 E2E
│   │   │   ├── members.spec.ts    ← 회원관리 E2E
│   │   │   ├── products.spec.ts   ← 상품관리 E2E
│   │   │   ├── sales.spec.ts      ← 매출관리 E2E
│   │   │   ├── schedules.spec.ts  ← 스케줄관리 E2E
│   │   │   ├── lockers.spec.ts    ← 락커관리 E2E
│   │   │   ├── staff.spec.ts      ← 직원관리 E2E
│   │   │   └── settings.spec.ts   ← 설정 E2E
│   │   └── member-app/
│   │       ├── home.spec.ts       ← 회원앱 홈 E2E
│   │       ├── booking.spec.ts    ← 예약 E2E
│   │       └── mypage.spec.ts     ← 마이페이지 E2E
│   ├── pages/                      ← Page Object Models
│   │   ├── base.page.ts           ← 공통 페이지 베이스
│   │   ├── login.page.ts
│   │   ├── admin/
│   │   │   ├── sidebar.component.ts
│   │   │   ├── dashboard.page.ts
│   │   │   ├── members.page.ts
│   │   │   ├── members-detail.page.ts
│   │   │   ├── products.page.ts
│   │   │   └── ...
│   │   └── member-app/
│   │       ├── home.page.ts
│   │       └── ...
│   ├── fixtures/                   ← 테스트 데이터 + 커스텀 fixture
│   │   ├── auth.fixture.ts        ← 인증 fixture (로그인 상태)
│   │   ├── test-data.ts           ← 테스트용 더미 데이터
│   │   └── index.ts               ← fixture 통합 export
│   └── helpers/                    ← 유틸리티
│       ├── api.helper.ts          ← API 직접 호출 헬퍼
│       └── wait.helper.ts         ← 커스텀 대기 헬퍼
```

---

## 3. /e2e init 워크플로우

### Step 1: Playwright 설치
```bash
cd fitgenie
npm install -D @playwright/test
npx playwright install chromium
```

### Step 2: playwright.config.ts 생성
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 14'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

### Step 3: 기본 파일 생성
- Base Page Object
- Auth Fixture (로그인 상태 유지)
- 폴더 구조 생성

### Step 4: package.json 스크립트 추가
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:report": "playwright show-report"
  }
}
```

---

## 4. /e2e generate 워크플로우

### Step 0: 정보 수집 (병렬)

**Agent A: TC 문서 읽기** (subagent_type: Explore)
```
대상 기능의 TC 문서를 읽고 분석:
1. docs/tc/[번호]-[이름].md
2. TC 목록 (ID, 레벨, 유형)
3. 테스트 단계 (Step별 동작 + 기대 결과)
4. API 검증 항목
5. 에러 케이스

결과: E2E 코드에 반영할 테스트 시나리오
```

**Agent B: 코드 분석** (subagent_type: Explore)
```
실제 페이지 코드를 읽고 분석:
1. 페이지 컴포넌트 (data-testid 확인)
2. UI 요소 셀렉터 (button, input, table 등)
3. API 호출 패턴 (fetch URL, 요청/응답)
4. 네비게이션 경로 (router.push)
5. 상태 관리 패턴

결과: POM 셀렉터 + API mock 패턴
```

### Step 1: Page Object 생성/업데이트
TC에서 참조하는 UI 요소를 Page Object로 정의한다.

### Step 2: E2E 테스트 코드 생성
TC의 각 테스트 케이스를 Playwright 테스트 코드로 변환한다.

### Step 3: 검증
- 코드 lint 확인
- 가능하면 dry-run 실행

---

## 5. 코드 패턴

### Base Page Object
```typescript
// tests/pages/base.page.ts
import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async getToast() {
    return this.page.locator('[data-testid="toast"]');
  }
}
```

### Auth Fixture
```typescript
// tests/fixtures/auth.fixture.ts
import { test as base, Page } from '@playwright/test';

type AuthFixtures = {
  adminPage: Page;
  memberPage: Page;
};

export const test = base.extend<AuthFixtures>({
  adminPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.fill('[name="email"]', process.env.TEST_ADMIN_EMAIL!);
    await page.fill('[name="password"]', process.env.TEST_ADMIN_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    await use(page);
  },
  memberPage: async ({ page }, use) => {
    await page.goto('/member-app/login');
    await page.fill('[name="phone"]', process.env.TEST_MEMBER_PHONE!);
    await page.click('button[type="submit"]');
    await page.waitForURL('/member-app');
    await use(page);
  },
});
```

### E2E 테스트 코드 패턴
```typescript
// tests/e2e/admin/members.spec.ts
import { test } from '../../fixtures/auth.fixture';
import { expect } from '@playwright/test';
import { MembersPage } from '../../pages/admin/members.page';

test.describe('회원관리', () => {
  let membersPage: MembersPage;

  test.beforeEach(async ({ adminPage }) => {
    membersPage = new MembersPage(adminPage);
    await membersPage.goto();
  });

  // TC-012-001: 회원 목록 조회
  test('TC-012-001: 회원 목록이 정상 표시된다', async () => {
    await expect(membersPage.table).toBeVisible();
    await expect(membersPage.rows).toHaveCount.greaterThan(0);
  });

  // TC-012-002: 회원 검색
  test('TC-012-002: 이름으로 회원을 검색할 수 있다', async () => {
    await membersPage.search('홍길동');
    await expect(membersPage.rows.first()).toContainText('홍길동');
  });

  // TC-012-003: 검색 결과 없음
  test('TC-012-003: 검색 결과가 없으면 안내 메시지가 표시된다', async () => {
    await membersPage.search('존재하지않는이름xyz');
    await expect(membersPage.emptyState).toBeVisible();
    await expect(membersPage.emptyState).toContainText('검색 결과가 없습니다');
  });
});
```

### Page Object 패턴
```typescript
// tests/pages/admin/members.page.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

export class MembersPage extends BasePage {
  readonly searchInput: Locator;
  readonly table: Locator;
  readonly rows: Locator;
  readonly emptyState: Locator;
  readonly addButton: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.locator('[data-testid="search-input"]');
    this.table = page.locator('[data-testid="members-table"]');
    this.rows = page.locator('[data-testid="members-table"] tbody tr');
    this.emptyState = page.locator('[data-testid="empty-state"]');
    this.addButton = page.locator('[data-testid="add-member-btn"]');
  }

  async goto() {
    await this.page.goto('/members');
    await this.waitForPageLoad();
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForResponse('**/api/members**');
  }

  async clickAdd() {
    await this.addButton.click();
    await this.page.waitForURL('/members/new');
  }
}
```

---

## 6. TC → E2E 매핑 규칙

### TC 레벨별 자동화 전략
| TC 레벨 | 자동화 | 설명 |
|---------|--------|------|
| L1 Smoke | 🤖 필수 자동화 | CI에서 매 빌드 실행 |
| L2 Critical | 🤖 필수 자동화 | PR merge 전 실행 |
| L3 Comprehensive | 🤖 가능하면 자동화 | 야간 빌드 실행 |
| L4 Edge Case | 👤 수동 + 부분 자동화 | 릴리즈 전 실행 |

### TC 유형별 코드 패턴
| TC 유형 | Playwright 패턴 |
|---------|----------------|
| UI 확인 | `expect(locator).toBeVisible()` |
| 네비게이션 | `page.goto()` + `waitForURL()` |
| 폼 입력 | `page.fill()` + `page.click()` |
| API 검증 | `page.waitForResponse()` + status 확인 |
| 에러 처리 | `page.route()` mock + 에러 UI 확인 |
| 권한 체크 | fixture 없는 직접 접근 → redirect 확인 |

---

## 7. 주의사항

- TC 문서가 없으면 코드를 생성하지 않는다 (먼저 /generate-tc 안내)
- data-testid가 코드에 없으면 POM에 주석으로 표시하고 사용자에게 알린다
- API mock은 최소한으로 사용 (실제 동작 테스트 우선)
- 테스트 간 상태 격리 (각 테스트는 독립 실행 가능해야 함)
- 하드코딩된 대기시간 (sleep) 사용 금지 → waitForResponse, waitForSelector 사용
- 민감 정보 (비밀번호 등)는 .env.test에서 관리
- CI 환경과 로컬 환경 모두 동작하도록 설정
