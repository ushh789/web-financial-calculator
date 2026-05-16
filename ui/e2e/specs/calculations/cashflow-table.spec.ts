import { test, expect } from '../../fixtures/test';
import { SELECTORS } from '../../utils/selectors';
import userJson from '../../fixtures/data/user.json';

const CALC_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

test.beforeEach(async ({ page }) => {
  await page.addInitScript((user) => {
    localStorage.setItem('auth-store', JSON.stringify({ state: { user }, version: 0 }));
  }, userJson);
});

test.describe('Cash flow table', () => {
  test('table renders with rows after switching to table tab', async ({ page, mocks }) => {
    await mocks.mockCalculationsList();
    await mocks.mockCalculationScenarios();
    await mocks.mockCalculatorVersions();

    await page.goto(`/calculations/${CALC_ID}`);

    // Switch to the Table tab (label from i18n: "Table")
    await page.getByRole('button', { name: /cash flow table/i }).click();

    const table = page.locator(SELECTORS.cashflowTable);
    await expect(table).toBeVisible();

    // Fixture has 3 cash flows — tbody should have at least one row
    await expect(table.locator('tbody tr')).not.toHaveCount(0);
  });

  test('OUTFLOW filter shows only outflow rows', async ({ page, mocks }) => {
    await mocks.mockCalculationsList();
    await mocks.mockCalculationScenarios();
    await mocks.mockCalculatorVersions();

    await page.goto(`/calculations/${CALC_ID}`);

    await page.getByRole('button', { name: /cash flow table/i }).click();

    const table = page.locator(SELECTORS.cashflowTable);
    await expect(table).toBeVisible();

    // Click the OUTFLOW filter button in the toolbar
    await table.getByRole('button', { name: /^outflow$/i }).click();

    // The fixture has 2 OUTFLOW entries; INFLOW badges should not appear in rows
    const inflowBadges = table.locator('tbody').getByText(/^inflow$/i);
    await expect(inflowBadges).toHaveCount(0);
  });

  test('INFLOW filter shows only inflow rows', async ({ page, mocks }) => {
    await mocks.mockCalculationsList();
    await mocks.mockCalculationScenarios();
    await mocks.mockCalculatorVersions();

    await page.goto(`/calculations/${CALC_ID}`);

    await page.getByRole('button', { name: /cash flow table/i }).click();

    const table = page.locator(SELECTORS.cashflowTable);
    await expect(table).toBeVisible();

    // Click the INFLOW filter button
    await table.getByRole('button', { name: /^inflow$/i }).click();

    // Only the 1 INFLOW entry remains; no OUTFLOW badges in rows
    const outflowBadges = table.locator('tbody').getByText(/^outflow$/i);
    await expect(outflowBadges).toHaveCount(0);
  });

  test('pagination footer renders when table has data', async ({ page, mocks }) => {
    await mocks.mockCalculationsList();
    await mocks.mockCalculationScenarios();
    await mocks.mockCalculatorVersions();

    await page.goto(`/calculations/${CALC_ID}`);

    await page.getByRole('button', { name: /cash flow table/i }).click();

    // cashflow-pagination renders whenever filteredData.length > 0
    await expect(page.locator(SELECTORS.cashflowPagination)).toBeVisible();
  });
});
