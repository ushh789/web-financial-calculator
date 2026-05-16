import { test, expect } from '../../fixtures/test';
import userJson from '../../fixtures/data/user.json';

test.describe('Logout', () => {
  test('logout clears auth and redirects to login', async ({ page }) => {
    // Pre-populate sessionStorage to simulate logged-in state
    await page.addInitScript((userFixture) => {
      sessionStorage.setItem(
        'auth-store',
        JSON.stringify({ state: { user: userFixture }, version: 0 })
      );
    }, userJson);

    await page.route('**/auth/logout', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) })
    );

    // Mock dashboard-related API calls to prevent unrelated errors
    await page.route('**/api/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }));

    await page.goto('/dashboard');

    // Wait for Zustand to hydrate from sessionStorage — the user name appears in the sidebar footer.
    await expect(page.getByText('Test User')).toBeVisible();

    // aria-label is "Log out" (en.json nav.logout) — two words, not one.
    const logoutButton = page.getByRole('button', { name: /log out|вийти/i });
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();

    await page.waitForURL(/login/);
    await expect(page).toHaveURL(/login/);

    // Verify sessionStorage is cleared (user should be null in auth-store)
    const authStore = await page.evaluate(() => sessionStorage.getItem('auth-store'));
    const parsed = authStore ? JSON.parse(authStore) : null;
    expect(parsed?.state?.user ?? null).toBeNull();
  });
});
