import { test, expect } from '../../fixtures/test';
import { SELECTORS } from '../../utils/selectors';
import adminJson from '../../fixtures/data/admin.json';
import userJson from '../../fixtures/data/user.json';

test.describe('Admin calculators page', () => {
  test('admin user sees the admin calculators page', async ({ page, mocks }) => {
    // Pre-auth as admin via localStorage
    await page.addInitScript((admin) => {
      localStorage.setItem('auth-store', JSON.stringify({ state: { user: admin }, version: 0 }));
    }, adminJson);

    await mocks.mockCalculatorsList();

    await page.goto('/admin/calculators');

    await expect(page.locator(SELECTORS.adminCalculatorsPage)).toBeVisible();
  });

  test('create calculator button opens a slide-over sheet with a form', async ({
    page,
    mocks,
  }) => {
    await page.addInitScript((admin) => {
      localStorage.setItem('auth-store', JSON.stringify({ state: { user: admin }, version: 0 }));
    }, adminJson);

    await mocks.mockCalculatorsList();

    await page.goto('/admin/calculators');

    // The admin-calculators-page must be visible before we interact
    await expect(page.locator(SELECTORS.adminCalculatorsPage)).toBeVisible();

    // Click the create calculator button — it opens a Sheet component
    await page.locator(SELECTORS.createCalculatorBtn).click();

    // The Sheet opens and renders the CreateCalculatorForm which has a code input
    const codeInput = page.locator('input[placeholder="loan_annuity_v1"]');
    await expect(codeInput).toBeVisible();
  });

  test('non-admin user is redirected away from admin pages', async ({ page, mocks }) => {
    // Pre-auth as a regular user (role: USER)
    await page.addInitScript((user) => {
      localStorage.setItem('auth-store', JSON.stringify({ state: { user }, version: 0 }));
    }, userJson);

    await mocks.mockCalculatorsList();

    await page.goto('/admin/calculators');

    // AdminLayout redirects non-admin users to /dashboard and renders null
    // So the admin page element should NOT appear
    await expect(page.locator(SELECTORS.adminCalculatorsPage)).not.toBeVisible();
  });

  test('admin page shows calculator list when calculators exist', async ({
    page,
    mocks,
  }) => {
    await page.addInitScript((admin) => {
      localStorage.setItem('auth-store', JSON.stringify({ state: { user: admin }, version: 0 }));
    }, adminJson);

    await mocks.mockCalculatorsList();

    await page.goto('/admin/calculators');

    await expect(page.locator(SELECTORS.adminCalculatorsPage)).toBeVisible();

    // The fixtures contain 2 calculators — both code values should appear
    await expect(page.getByText('ANNUITY_LOAN')).toBeVisible();
    await expect(page.getByText('LINEAR_LOAN')).toBeVisible();
  });
});
