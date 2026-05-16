import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../fixtures/test';
import userJson from '../fixtures/data/user.json';

// Accessibility tests using @axe-core/playwright.
// We check WCAG 2.0 Level A and AA rules on key pages.

test.describe('Accessibility — WCAG 2.x AA', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((user) => {
      sessionStorage.setItem('auth-store', JSON.stringify({ state: { user }, version: 0 }));
    }, userJson);
  });

  test('login page has no critical a11y violations', async ({ page }) => {
    // Login page is public — navigate without auth
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('dashboard has no critical a11y violations', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('calculators list has no critical a11y violations', async ({ page, mocks }) => {
    await mocks.mockCalculatorsList(page);
    await page.goto('/calculators');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
