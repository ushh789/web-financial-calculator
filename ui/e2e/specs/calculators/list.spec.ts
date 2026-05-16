import { test, expect } from '../../fixtures/test';
import userJson from '../../fixtures/data/user.json';

const CALC_ID = '11111111-1111-1111-1111-111111111111';
const CALC_NAME = 'Annuity Loan';

test.beforeEach(async ({ page }) => {
  await page.addInitScript((user) => {
    sessionStorage.setItem('auth-store', JSON.stringify({ state: { user }, version: 0 }));
  }, userJson);
});

test.describe('Calculators list', () => {
  test('renders calculator cards from fixture', async ({ page, mocks }) => {
    await mocks.mockCalculatorsList(page);
    await page.goto('/calculators');

    await expect(page.getByText(CALC_NAME)).toBeVisible();
  });

  test('shows empty state when list is empty', async ({ page, mocks }) => {
    await mocks.mockCalculatorsList(page, {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 20,
      number: 0,
    });
    await page.goto('/calculators');

    // The page renders an empty message via t("empty")
    const emptyMsg = page.getByText(/no calculators|empty|немає/i);
    await expect(emptyMsg).toBeVisible();
  });

  test('page loads without errors', async ({ page, mocks }) => {
    await mocks.mockCalculatorsList(page);

    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/calculators');
    await expect(page).toHaveURL(/calculators/);
    expect(errors).toHaveLength(0);
  });

  test('clicking a calculator card navigates to its detail page', async ({ page, mocks }) => {
    await mocks.mockCalculatorsList(page);
    await page.goto('/calculators');

    await page.getByText(CALC_NAME).click();

    await page.waitForURL(new RegExp(`/calculators/${CALC_ID}`));
    await expect(page).toHaveURL(new RegExp(`/calculators/${CALC_ID}`));
  });
});
