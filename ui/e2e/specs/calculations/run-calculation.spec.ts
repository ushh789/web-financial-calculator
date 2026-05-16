import { test, expect } from '../../fixtures/test';
import { SELECTORS } from '../../utils/selectors';
import userJson from '../../fixtures/data/user.json';

const CALC_ID = '11111111-1111-1111-1111-111111111111';
const CALC_RESULT_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

test.beforeEach(async ({ page }) => {
  await page.addInitScript((user) => {
    localStorage.setItem('auth-store', JSON.stringify({ state: { user }, version: 0 }));
  }, userJson);
});

test.describe('Run calculation', () => {
  test('filling the form and submitting shows calculation summary', async ({ page, mocks }) => {
    await mocks.mockCalculatorDetail();
    await mocks.mockCalculatorVersions();
    // POST /api/calculations (what useCreateCalculation calls)
    await mocks.mockCreateCalculation();
    // Mocks for the calculation result page navigated to after submit
    await mocks.mockCalculationsList();
    await mocks.mockCalculationScenarios();

    await page.goto(`/calculators/${CALC_ID}`);

    // Fill in required form fields
    await page.locator('#amount').fill('100000');
    await page.locator('#rate').fill('5');
    await page.locator('#term').fill('12');
    await page.locator('#currency').fill('USD');

    // Submit — button label is "Calculate" or "Розрахувати"
    await page.getByRole('button', { name: /^calculate$|^розрахувати$/i }).click();

    // useCreateCalculation navigates to /calculations/:id on success
    await page.waitForURL(new RegExp(`/calculations/${CALC_RESULT_ID}`));

    // Calculation summary renders when cashFlows are present in the active scenario
    await expect(page.locator(SELECTORS.calculationSummary)).toBeVisible();
  });

  test('submitting without required fields shows validation errors', async ({ page, mocks }) => {
    await mocks.mockCalculatorDetail();
    await mocks.mockCalculatorVersions();

    await page.goto(`/calculators/${CALC_ID}`);

    // Submit without filling anything — Zod schema requires amount, rate, term
    await page.getByRole('button', { name: /^calculate$|^розрахувати$/i }).click();

    // Validation error messages rendered with class text-negative
    const errorMsg = page.locator('.text-negative').first();
    await expect(errorMsg).toBeVisible();
  });
});
