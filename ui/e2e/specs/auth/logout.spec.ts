import { test, expect } from '../../fixtures/test';
import userJson from '../../fixtures/data/user.json';
import { setAccessTokenCookie } from '../../utils/auth';

test.describe('Logout', () => {
  test('logout clears auth and redirects to login', async ({ page }) => {
    // Establish the origin on the auth page (no backend calls), then write
    // the Zustand auth-store to localStorage before navigating to the app.
    await page.goto('/login');
    await page.evaluate((user) => {
      localStorage.setItem('auth-store', JSON.stringify({ state: { user }, version: 0 }));
    }, userJson);
    await setAccessTokenCookie(page);

    await page.route('**/auth/logout', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'Set-Cookie': 'accessToken=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax',
        },
        body: JSON.stringify({}),
      })
    );
    await page.route('**/api/**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [], totalElements: 0 }) })
    );

    await page.goto('/dashboard');

    // Wait for Zustand to hydrate and the sidebar footer to render.
    await expect(page.getByText('Test User')).toBeVisible({ timeout: 10_000 });

    // aria-label is "Log out" (en.json nav.logout) — two words, not one.
    const logoutButton = page.getByRole('button', { name: /log out|вийти/i });
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();

    await page.waitForURL(/login/);
    await expect(page).toHaveURL(/login/);

    // Verify localStorage is cleared (user should be null in auth-store)
    const authStore = await page.evaluate(() => localStorage.getItem('auth-store'));
    const parsed = authStore ? JSON.parse(authStore) : null;
    expect(parsed?.state?.user ?? null).toBeNull();
  });
});
