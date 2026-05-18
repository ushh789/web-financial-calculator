import { test, expect } from '../../fixtures/test';
import userJson from '../../fixtures/data/user.json';
import { setAccessTokenCookie } from '../../utils/auth';

test.describe('Token refresh interceptor', () => {
  test('401 → refresh → retry succeeds — page stays on dashboard', async ({ page }) => {
    // Pre-populate localStorage to simulate logged-in state
    await page.addInitScript((userFixture) => {
      localStorage.setItem(
        'auth-store',
        JSON.stringify({ state: { user: userFixture }, version: 0 })
      );
    }, userJson);
    await setAccessTokenCookie(page);

    let dashboardCallCount = 0;

    // First GET to /api/calculators returns 401, second (retry after refresh) returns 200
    await page.route('**/api/calculators', route => {
      dashboardCallCount++;
      if (dashboardCallCount === 1) {
        return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Unauthorized' }) });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [], totalElements: 0, totalPages: 0, size: 20, number: 0 }) });
    });

    // Mock other API calls
    await page.route('**/api/**', route => {
      if (!route.request().url().includes('/api/calculators')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      }
      return route.continue();
    });

    // Mock refresh endpoint to succeed
    await page.route('**/auth/refresh', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) })
    );

    await page.goto('/dashboard');

    // Page should remain on dashboard (not redirected to login)
    await expect(page).toHaveURL(/dashboard/);
  });

  test('401 → refresh fails → redirect to login', async ({ page }) => {
    // Pre-populate localStorage to simulate logged-in state
    await page.addInitScript((userFixture) => {
      localStorage.setItem(
        'auth-store',
        JSON.stringify({ state: { user: userFixture }, version: 0 })
      );
    }, userJson);
    await setAccessTokenCookie(page);

    // Any authenticated API call returns 401
    await page.route('**/api/calculators', route =>
      route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Unauthorized' }) })
    );

    await page.route('**/api/**', route => {
      if (!route.request().url().includes('/api/calculators')) {
        return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Unauthorized' }) });
      }
      return route.continue();
    });

    // Mock refresh to also fail with 401
    await page.route('**/auth/refresh', route =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        headers: {
          'Set-Cookie': 'accessToken=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax',
        },
        body: JSON.stringify({ message: 'Refresh token expired' }),
      })
    );

    await page.goto('/dashboard');

    // The axios interceptor calls window.location.href = '/login' on refresh failure
    await page.waitForURL(/login/, { timeout: 10_000 });
    await expect(page).toHaveURL(/login/);
  });
});
