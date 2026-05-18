import { test, expect } from '../../fixtures/test';
import { SELECTORS } from '../../utils/selectors';
import userJson from '../../fixtures/data/user.json';

const CALC_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

test.beforeEach(async ({ page }) => {
  await page.addInitScript((user) => {
    localStorage.setItem('auth-store', JSON.stringify({ state: { user }, version: 0 }));
  }, userJson);
});

test.describe('Amortization chart', () => {
  test('chart renders after loading a calculation with cash flows', async ({ page, mocks }) => {
    // useCalculation calls GET /api/calculations?userId=...&page=0&size=100
    // The fixture must contain the calculation with CALC_ID so useCalculation finds it.
    await mocks.mockCalculationsList();
    await mocks.mockCalculationScenarios();
    await mocks.mockCalculatorVersions();

    await page.goto(`/calculations/${CALC_ID}`);

    // Chart tab is active by default; data-testid="amortization-chart" wraps the chart
    await expect(page.locator(SELECTORS.amortizationChart)).toBeVisible();
  });

  test('chart container renders an SVG', async ({ page, mocks }) => {
    await mocks.mockCalculationsList();
    await mocks.mockCalculationScenarios();
    await mocks.mockCalculatorVersions();

    await page.goto(`/calculations/${CALC_ID}`);

    const chart = page.locator(SELECTORS.amortizationChart);
    await expect(chart).toBeVisible();

    // Recharts ResponsiveContainer renders an SVG element
    await expect(chart.locator('svg').first()).toBeVisible();
  });
});
