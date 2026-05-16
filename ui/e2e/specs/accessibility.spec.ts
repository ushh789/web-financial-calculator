import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../fixtures/test';
import userJson from '../fixtures/data/user.json';

// Accessibility tests using @axe-core/playwright.
// We check WCAG 2.0 Level A and AA rules on key pages.
//
// Notes:
// - The login page test uses an anonymous storage state override so the middleware
//   doesn't redirect a logged-in user away from /login.
// - The calculators list test sets the E2E_CALCULATORS_LIST cookie so the SSR
//   serverFetch returns a fixture instead of hitting the real backend.

test.describe('Accessibility — WCAG 2.x AA', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((user) => {
      localStorage.setItem('auth-store', JSON.stringify({ state: { user }, version: 0 }));
    }, userJson);
  });

  test('login page has no critical a11y violations', async ({ page }) => {
    // Override storage state for this test: use no accessToken so the middleware
    // doesn't redirect away from /login to /dashboard.
    await page.context().clearCookies();
    await page.context().addCookies([
      {
        name: 'NEXT_LOCALE',
        value: 'en',
        domain: 'localhost',
        path: '/',
        expires: -1,
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('dashboard has no critical a11y violations', async ({ page, mocks }) => {
    await mocks.mockCalculationsList();
    await mocks.mockCalculatorsList();
    await page.goto('/dashboard');
    // Wait for the main heading to be visible to ensure page has hydrated
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('calculators list has no critical a11y violations', async ({ page }) => {
    // Set the SSR fixture cookie so serverFetch doesn't hit the real backend.
    await page.context().addCookies([
      {
        name: 'E2E_MODE',
        value: 'fixture',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/calculators');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
