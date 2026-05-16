import { test, expect } from '../fixtures/test';

test.describe('Navigation smoke', () => {
  test('dashboard loads for authenticated user', async ({ page, mocks }) => {
    await mocks.mockAuthMe(page);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('unauthenticated user is redirected to login', async ({ page }) => {
    // mock auth/me to return 401
    await page.route('**/auth/me', route => route.fulfill({ status: 401 }));
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });

  test('calculators page loads', async ({ page, mocks }) => {
    await mocks.mockAuthMe(page);
    await mocks.mockCalculatorsList(page);
    await page.goto('/calculators');
    await expect(page.getByRole('heading', { name: /calculator/i })).toBeVisible();
  });
});
