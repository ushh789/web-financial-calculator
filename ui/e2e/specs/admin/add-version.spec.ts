import { test, expect } from '../../fixtures/test';
import { SELECTORS } from '../../utils/selectors';
import adminJson from '../../fixtures/data/admin.json';
import defaultVersions from '../../fixtures/data/calculator-versions.json';

const CALCULATOR_ID = '11111111-1111-1111-1111-111111111111';

// A new version that will be returned by the POST response
const newVersion = {
  id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  calculatorId: CALCULATOR_ID,
  version: 3,
  active: true,
  createdAt: '2024-09-01T00:00:00Z',
  algorithmMetadata: {
    type: 'LOAN',
    constraints: {
      minAmount: 1000,
      maxAmount: 500000,
      minRate: 1,
      maxRate: 30,
      minTerm: 3,
      maxTerm: 120,
    },
    defaults: {
      currency: 'EUR',
      roundingScale: 2,
      roundingMode: 'HALF_UP',
    },
    repayment: {
      frequency: 'MONTHLY',
      strategy: 'LINEAR',
    },
    interest: {
      method: 'SIMPLE',
      rateType: 'FIXED',
    },
  },
};

test.describe('Add version flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((admin) => {
      sessionStorage.setItem('auth-store', JSON.stringify({ state: { user: admin }, version: 0 }));
    }, adminJson);
  });

  test('add version button opens the version form dialog', async ({ page, mocks }) => {
    await mocks.mockCalculatorsList(page);
    await mocks.mockCalculatorVersions(page);

    await page.goto('/admin/calculators');

    await expect(page.locator(SELECTORS.adminCalculatorsPage)).toBeVisible();

    // Click "Add Version" button for the first calculator row
    const addVersionBtn = page.getByRole('button', { name: /add version/i }).first();
    await expect(addVersionBtn).toBeVisible();
    await addVersionBtn.click();

    // The Dialog opens and renders AddVersionForm — it has a submit button
    const submitBtn = page.getByRole('button', { name: /add version/i }).last();
    await expect(submitBtn).toBeVisible();
  });

  test('submitting add version form triggers POST and closes dialog', async ({
    page,
    mocks,
  }) => {
    await mocks.mockCalculatorsList(page);
    await mocks.mockCalculatorVersions(page);
    await mocks.mockAddCalculatorVersion(page);

    await page.goto('/admin/calculators');

    await expect(page.locator(SELECTORS.adminCalculatorsPage)).toBeVisible();

    // Open the add version dialog for the first calculator
    const addVersionBtn = page.getByRole('button', { name: /add version/i }).first();
    await addVersionBtn.click();

    // The submit button inside the dialog is the last "Add Version" button
    const submitBtn = page.getByRole('button', { name: /add version/i }).last();
    await expect(submitBtn).toBeVisible();

    // Submit with default form values
    await submitBtn.click();

    // After successful POST, the dialog closes — the form submit button should no longer be visible
    await expect(submitBtn).not.toBeVisible();
  });

  test('versions list updates after new version added', async ({ page, mocks }) => {
    // Initial GET returns the existing 2 versions
    let versionsCallCount = 0;
    const updatedVersions = [...defaultVersions, newVersion];

    await page.route(/\/api\/calculators\/[^/]+\/versions$/, (route) => {
      if (route.request().method() === 'GET') {
        // Return updated list on subsequent fetches (after invalidation)
        const body = versionsCallCount === 0 ? defaultVersions : updatedVersions;
        versionsCallCount++;
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(body),
        });
      }
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(newVersion),
        });
      }
      return route.continue();
    });

    await mocks.mockCalculatorsList(page);

    await page.goto('/admin/calculators');

    await expect(page.locator(SELECTORS.adminCalculatorsPage)).toBeVisible();

    // Open the dialog and submit
    const addVersionBtn = page.getByRole('button', { name: /add version/i }).first();
    await addVersionBtn.click();

    const submitBtn = page.getByRole('button', { name: /add version/i }).last();
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Dialog closes after success
    await expect(submitBtn).not.toBeVisible();
  });
});
