import { test, expect } from '../fixtures/test';
import userJson from '../fixtures/data/user.json';
import type { Page } from '@playwright/test';

// Locale is stored in the NEXT_LOCALE cookie (no URL prefix).
// Default locale is 'uk'. The LocaleSwitcher button shows "EN" when current
// locale is 'uk' (click to switch to English) and "UA" when current locale
// is 'en' (click to switch back to Ukrainian).
//
// SSR note: /calculators uses serverFetch() during SSR. The E2E_CALCULATORS_LIST
// cookie is set in beforeEach to use the fixture instead of the real backend.

test.describe('i18n locale switching', () => {
  // This suite is stateful via cookies and reloads; keep it serial to avoid flakes.
  test.describe.configure({ mode: 'serial' });

  const breadcrumbNav = (page: Page) =>
    page.getByRole('navigation', { name: /breadcrumb|Навігаційний ланцюжок/i });

  async function setLocaleCookie(page: Page, value: 'uk' | 'en') {
    await page.context().addCookies([
      { name: 'NEXT_LOCALE', value, domain: 'localhost', path: '/' },
    ]);
  }

  test.beforeEach(async ({ page, mocks }) => {
    await mocks.mockCalculationsList();
    await mocks.mockCalculatorsList();
    // Prevent server-rendered /calculators from hitting a real backend during E2E.
    await page.context().addCookies([
      {
        name: 'E2E_MODE',
        value: 'fixture',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.addInitScript((user) => {
      localStorage.setItem('auth-store', JSON.stringify({ state: { user }, version: 0 }));
    }, userJson);
  });

  test('default locale renders Ukrainian text on dashboard', async ({ page }) => {
    await setLocaleCookie(page, 'uk');
    await page.goto('/dashboard');
    await expect(breadcrumbNav(page)).toContainText('Дашборд');
  });

  test('switching locale from uk to en changes dashboard text to English', async ({ page }) => {
    await setLocaleCookie(page, 'uk');
    await page.goto('/dashboard');
    await expect(breadcrumbNav(page)).toContainText('Дашборд');

    await setLocaleCookie(page, 'en');
    await page.reload();
    await expect(breadcrumbNav(page)).toContainText('Dashboard');
  });

  test('locale preference persists after navigating to another page', async ({ page }) => {
    await setLocaleCookie(page, 'en');
    await page.goto('/dashboard');
    await expect(breadcrumbNav(page)).toContainText('Dashboard');

    // /calculators is server-rendered — E2E_CALCULATORS_LIST cookie bypasses real backend.
    await page.goto('/calculators');
    await expect(breadcrumbNav(page)).toContainText('Calculators');
  });

  test('switching back to uk locale restores Ukrainian text', async ({ page }) => {
    await setLocaleCookie(page, 'en');
    await page.goto('/dashboard');
    await expect(breadcrumbNav(page)).toContainText('Dashboard');

    await setLocaleCookie(page, 'uk');
    await page.reload();
    await expect(breadcrumbNav(page)).toContainText('Дашборд');
  });
});
