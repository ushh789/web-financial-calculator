import { test, expect } from '../fixtures/test';
import userJson from '../fixtures/data/user.json';

// Auth note: the playwright config injects sessionStorage state via storageState
// (.storage/user.json) which was populated by auth.setup.ts. The app is purely
// client-side auth (no /auth/me call); the Zustand auth-store is read from
// sessionStorage on hydration.

test.describe('Sidebar navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((user) => {
      sessionStorage.setItem('auth-store', JSON.stringify({ state: { user }, version: 0 }));
    }, userJson);
  });

  test('clicking Dashboard sidebar link navigates to /dashboard', async ({ page }) => {
    await page.goto('/calculators');

    // Click the Dashboard nav link in the sidebar
    const dashboardLink = page.getByRole('link', { name: /dashboard|дашборд/i });
    await dashboardLink.click();

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('clicking Calculators sidebar link navigates to /calculators', async ({ page }) => {
    await page.goto('/dashboard');

    // Click the Calculators nav link in the sidebar
    const calculatorsLink = page.getByRole('link', { name: /calculators|калькулятори/i });
    await calculatorsLink.click();

    await expect(page).toHaveURL(/\/calculators/);
  });

  test('clicking Calculations sidebar link navigates to /calculations', async ({ page }) => {
    await page.goto('/dashboard');

    // Click the Calculations nav link in the sidebar
    const calculationsLink = page.getByRole('link', { name: /calculations|розрахунки/i });
    await calculationsLink.click();

    await expect(page).toHaveURL(/\/calculations/);
  });
});

test.describe('Anonymous user access', () => {
  // These tests run WITHOUT injecting auth into sessionStorage.
  // The app is client-side only (no server middleware protecting routes).
  // Without auth state, the sidebar/header still render but the user profile
  // footer in the sidebar is hidden. The page content may still render
  // (no server-side redirect), but the user is effectively unauthenticated.
  //
  // Note: if the app adds client-side redirect logic in the future,
  // update these tests to assert toHaveURL(/login/).

  test('visiting /dashboard without auth renders the page (no server-side guard)', async ({ page }) => {
    // Do NOT inject sessionStorage auth
    await page.goto('/dashboard');

    // The page renders without redirecting — there is no server middleware.
    // The URL remains /dashboard.
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('visiting /calculators without auth renders the page', async ({ page }) => {
    await page.goto('/calculators');
    await expect(page).toHaveURL(/\/calculators/);
  });
});

test.describe('Header user info', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((user) => {
      sessionStorage.setItem('auth-store', JSON.stringify({ state: { user }, version: 0 }));
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
