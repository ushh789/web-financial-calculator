import { test, expect } from '../../fixtures/test';
import userJson from '../../fixtures/data/user.json';

const CALC_ID = '11111111-1111-1111-1111-111111111111';
const CALC_NAME = 'Annuity Loan';

test.beforeEach(async ({ page }) => {
  await page.addInitScript((user) => {
    sessionStorage.setItem('auth-store', JSON.stringify({ state: { user }, version: 0 }));
  }, userJson);
});

test.describe('Calculator detail page', () => {
  test('shows the calculator name', async ({ page, mocks }) => {
    await mocks.mockCalculatorDetail(page);
    await mocks.mockCalculatorVersions(page);
    await page.goto(`/calculators/${CALC_ID}`);

    await expect(page.getByText(CALC_NAME)).toBeVisible();
  });

  test('calculator form fields are visible', async ({ page, mocks }) => {
    await mocks.mockCalculatorDetail(page);
    await mocks.mockCalculatorVersions(page);
    await page.goto(`/calculators/${CALC_ID}`);

    // CalculatorForm renders inputs for amount, rate, term, startDate, currency
    await expect(page.locator('#amount')).toBeVisible();
    await expect(page.locator('#rate')).toBeVisible();
    await expect(page.locator('#term')).toBeVisible();
    await expect(page.locator('#currency')).toBeVisible();
  });

  test('version selector renders when versions are present', async ({ page, mocks }) => {
    await mocks.mockCalculatorDetail(page);
    await mocks.mockCalculatorVersions(page);
    await page.goto(`/calculators/${CALC_ID}`);

    // VersionSelector renders a <Select> with label "Calculator version"
    await expect(page.getByText(/calculator version/i)).toBeVisible();
    // The trigger element has id="version-select"
    await expect(page.locator('#version-select')).toBeVisible();
  });
});
