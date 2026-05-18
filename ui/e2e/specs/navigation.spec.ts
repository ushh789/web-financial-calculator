import { test, expect } from '../fixtures/test';
import userJson from '../fixtures/data/user.json';

// Auth note: the playwright config injects localStorage state via storageState
// (.storage/user.json) which was populated by auth.setup.ts. The app is purely
// client-side auth (no /auth/me call); the Zustand auth-store is read from
// localStorage on hydration.
//
// SSR note: /calculators is a server component that calls serverFetch().
// We set the E2E_CALCULATORS_LIST cookie so serverFetch returns the fixture
// instead of hitting the real backend at localhost:8080.

test.describe('Sidebar navigation', () => {
  test.beforeEach(async ({ page, mocks }) => {
    await mocks.mockCalculationsList();
    await mocks.mockCalculatorsList();
    // Pre-populate Zustand auth-store in localStorage so the sidebar renders.
    await page.addInitScript((user) => {
      localStorage.setItem('auth-store', JSON.stringify({ state: { user }, version: 0 }));
    }, userJson);

    // Enable SSR fixture bypass for /calculators so navigating there doesn't
    // fail with a 401 error from the real backend.
    await page.context().addCookies([
      {
        name: 'E2E_MODE',
        value: 'fixture',
        domain: 'localhost',
        path: '/',
      },
    ]);
  });

  test('clicking Dashboard sidebar link navigates to /dashboard', async ({ page }) => {
    await page.goto('/calculators');

    // Click the Dashboard nav link in the sidebar
    const dashboardLink = page.locator('aside').getByRole('link', { name: /dashboard|дашборд/i });
    await dashboardLink.click();

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('clicking Calculators sidebar link navigates to /calculators', async ({ page }) => {
    await page.goto('/dashboard');

    // Click the Calculators nav link in the sidebar
    const calculatorsLink = page.locator('aside').getByRole('link', { name: /calculators|калькулятори/i });
    await calculatorsLink.click();

    await expect(page).toHaveURL(/\/calculators/);
  });

  test('clicking Calculations sidebar link navigates to /calculations', async ({ page, mocks }) => {

    await page.goto('/dashboard');

    // Click the Calculations nav link in the sidebar
    const calculationsLink = page.locator('aside').getByRole('link', { name: /calculations|розрахунки/i });
    await calculationsLink.click();

    await expect(page).toHaveURL(/\/calculations/);
  });
});

test.describe('Anonymous user access', () => {
  test.use({
    storageState: {
      cookies: [{
        name: 'NEXT_LOCALE', value: 'en', domain: 'localhost', path: '/',
        expires: -1, httpOnly: false, secure: false, sameSite: 'Lax',
      }],
      origins: [],
    },
  });

  test('visiting /dashboard without auth redirects to login', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/login\?from=%2Fdashboard/);
  });

  test('visiting /calculators without auth redirects to login', async ({ page }) => {
    await page.goto('/calculators');

    await expect(page).toHaveURL(/\/login\?from=%2Fcalculators/);
  });
});

test.describe('Header user info', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((user) => {
      localStorage.setItem('auth-store', JSON.stringify({ state: { user }, version: 0 }));
    }, userJson);
  });

  test('logged-in user full name appears in the sidebar footer', async ({ page }) => {
    await page.goto('/dashboard');

    // The sidebar footer shows firstName + lastName when both are set
    const fullName = `${userJson.firstName} ${userJson.lastName}`;
    await expect(page.getByText(fullName)).toBeVisible();
  });

  test('logged-in user email appears in the sidebar footer', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText(userJson.email)).toBeVisible();
  });

  test('header renders the breadcrumb for the current page', async ({ page }) => {
    await page.goto('/dashboard');

    // The breadcrumb nav landmark should be visible
    const breadcrumb = page.getByRole('navigation', { name: /breadcrumb|навігаційний ланцюжок/i });
    await expect(breadcrumb).toBeVisible();
  });
});
