import { test, expect } from '../fixtures/test';
import userJson from '../fixtures/data/user.json';

// Locale is stored in the NEXT_LOCALE cookie (no URL prefix).
// Default locale is 'uk'. The LocaleSwitcher button shows "EN" when current
// locale is 'uk' (click to switch to English) and "UA" when current locale
// is 'en' (click to switch back to Ukrainian).

test.describe('i18n locale switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((user) => {
      sessionStorage.setItem('auth-store', JSON.stringify({ state: { user }, version: 0 }));
    }, userJson);
  });

  test('default locale renders Ukrainian text on dashboard', async ({ page }) => {
    // Default locale is 'uk' (no cookie set)
    await page.goto('/dashboard');
    // "Дашборд" is the uk translation for nav.dashboard shown in the breadcrumb
    await expect(page.getByText('Дашборд')).toBeVisible();
  });

  test('switching locale from uk to en changes dashboard text to English', async ({ page }) => {
    // Start at dashboard with default (uk) locale
    await page.goto('/dashboard');
    await expect(page.getByText('Дашборд')).toBeVisible();

    // The locale switcher button shows "EN" when locale is uk (click to switch to en)
    const localeSwitcher = page.getByRole('button', { name: 'EN' });
    await expect(localeSwitcher).toBeVisible();
    await localeSwitcher.click();

    // After switching, the page re-renders in English
    // "Dashboard" is the en translation for nav.dashboard shown in the breadcrumb
    await expect(page.getByText('Dashboard')).toBeVisible();

    // The switcher now shows "UA" (current locale is en, next would be uk)
    await expect(page.getByRole('button', { name: 'UA' })).toBeVisible();
  });

  test('locale preference persists after navigating to another page', async ({ page }) => {
    // Switch to English via cookie
    await page.goto('/dashboard');
    const localeSwitcher = page.getByRole('button', { name: 'EN' });
    await localeSwitcher.click();

    // Wait for the locale to take effect (page re-renders in English)
    await expect(page.getByText('Dashboard')).toBeVisible();

    // Navigate to calculators
    await page.goto('/calculators');

    // The locale cookie persists; calculators page should show English text
    // "Calculators" is the en translation for nav.calculators shown in the breadcrumb
    await expect(page.getByText('Calculators')).toBeVisible();

    // The switcher still shows "UA" confirming locale is 'en'
    await expect(page.getByRole('button', { name: 'UA' })).toBeVisible();
  });

  test('switching back to uk locale restores Ukrainian text', async ({ page }) => {
    // First switch to en
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'EN' }).click();
    await expect(page.getByText('Dashboard')).toBeVisible();

    // Now switch back to uk
    await page.getByRole('button', { name: 'UA' }).click();
    await expect(page.getByText('Дашборд')).toBeVisible();
  });
});
