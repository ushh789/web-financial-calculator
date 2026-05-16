import { test, expect } from '../../fixtures/test';
import { SELECTORS } from '../../utils/selectors';
import userJson from '../../fixtures/data/user.json';

const CALC_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

test.beforeEach(async ({ page }) => {
  await page.addInitScript((user) => {
    sessionStorage.setItem('auth-store', JSON.stringify({ state: { user }, version: 0 }));
  }, userJson);
});

test.describe('Amortization chart', () => {
  test('chart renders after loading a calculation with cash flows', async ({ page, mocks }) => {
    await mocks.mockCalculationsList(page);
    await mocks.mockCalculationScenarios(page);
    await mocks.mockCalculatorVersions(page);

    await page.goto(`/calculations/${CALC_ID}`);

    // Chart tab is active by default; data-testid="amortization-chart" wraps the chart
    await expect(page.locator(SELECTORS.amortizationChart)).toBeVisible();
  });

  test('chart container renders an SVG', async ({ page, mocks }) => {
    await mocks.mockCalculationsList(page);
    await mocks.mockCalculationScenarios(page);
    await mocks.mockCalculatorVersions(page);

    await page.goto(`/calculations/${CALC_ID}`);

    const chart = page.locator(SELECTORS.amortizationChart);
    await expect(chart).toBeVisible();

    // Recharts ResponsiveContainer renders an SVG element
    await expect(chart.locator('svg')).toBeVisible();
  });
});
