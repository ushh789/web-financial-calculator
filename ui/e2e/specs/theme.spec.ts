import { test, expect } from '../fixtures/test';
import userJson from '../fixtures/data/user.json';

// next-themes sets a class on <html>: either "light" or "dark".
// The ThemeToggle button has aria-label="Toggle theme" (from common.toggleTheme in en/uk).
// When locale is uk (default), the label is "Перемкнути тему".
// We use aria-label matching both languages via a regex.

test.describe('theme toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((user) => {
      sessionStorage.setItem('auth-store', JSON.stringify({ state: { user }, version: 0 }));
    }, userJson);
  });

  test('html element has a theme class on page load', async ({ page }) => {
    await page.goto('/dashboard');
    // next-themes adds either "light" or "dark" class to <html>
    const htmlClass = await page.locator('html').getAttribute('class');
    const hasThemeClass = htmlClass?.includes('light') || htmlClass?.includes('dark');
    expect(hasThemeClass).toBe(true);
  });

  test('clicking theme toggle switches the theme class on html', async ({ page }) => {
    await page.goto('/dashboard');

    const html = page.locator('html');
    const initialClass = await html.getAttribute('class');
    const startedDark = initialClass?.includes('dark') ?? false;

    // Click the theme toggle button (aria-label varies by locale)
    const themeToggle = page.getByRole('button', { name: /toggle theme|перемкнути тему/i });
    await themeToggle.click();

    // Theme should have flipped
    if (startedDark) {
      await expect(html).toHaveClass(/light/);
    } else {
      await expect(html).toHaveClass(/dark/);
    }
  });

  test('theme persists after navigating to another page', async ({ page }) => {
    await page.goto('/dashboard');

    const html = page.locator('html');
    const initialClass = await html.getAttribute('class');
    const startedDark = initialClass?.includes('dark') ?? false;

    // Toggle the theme
    const themeToggle = page.getByRole('button', { name: /toggle theme|перемкнути тему/i });
    await themeToggle.click();

    // Verify theme changed
    const expectedClass = startedDark ? /light/ : /dark/;
    await expect(html).toHaveClass(expectedClass);

    // Navigate to calculators and verify theme is preserved
    await page.goto('/calculators');
    await expect(html).toHaveClass(expectedClass);
  });

  test('toggling twice restores original theme', async ({ page }) => {
    await page.goto('/dashboard');

    const html = page.locator('html');
    const initialClass = await html.getAttribute('class');
    const startedDark = initialClass?.includes('dark') ?? false;
    const originalPattern = startedDark ? /dark/ : /light/;

    const themeToggle = page.getByRole('button', { name: /toggle theme|перемкнути тему/i });

    // Toggle once
    await themeToggle.click();
    await expect(html).toHaveClass(startedDark ? /light/ : /dark/);

    // Toggle again — should restore original
    await themeToggle.click();
    await expect(html).toHaveClass(originalPattern);
  });
});
