import { test, expect } from '../../fixtures/test';
import { SELECTORS } from '../../utils/selectors';
import userJson from '../../fixtures/data/user.json';

const CALC_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

test.beforeEach(async ({ page }) => {
  await page.addInitScript((user) => {
    localStorage.setItem('auth-store', JSON.stringify({ state: { user }, version: 0 }));
  }, userJson);
});

/**
 * Navigate to the calculation page and switch to the Sensitivity tab.
 * The SensitivityPanel is rendered only under that tab.
 */
async function openSensitivityTab(page: import('@playwright/test').Page) {
  await page.goto(`/calculations/${CALC_ID}`);

  // The tab label comes from i18n key calculation.tabs.sensitivity
  await page.getByRole('button', { name: /sensitivity/i }).click();
}

test.describe('Sensitivity panel', () => {
  test('sensitivity panel renders after switching to sensitivity tab', async ({
    page,
    mocks,
  }) => {
    // useCalculation calls GET /api/calculations?userId=...&page=0&size=100
    await mocks.mockCalculationsList();
    await mocks.mockCalculationScenarios();
    await mocks.mockCalculatorVersions();

    await openSensitivityTab(page);

    await expect(page.locator(SELECTORS.sensitivityPanel)).toBeVisible();
  });

  test('sensitivity chart is visible inside the panel', async ({ page, mocks }) => {
    await mocks.mockCalculationsList();
    await mocks.mockCalculationScenarios();
    await mocks.mockCalculatorVersions();

    await openSensitivityTab(page);

    await expect(page.locator(SELECTORS.sensitivityChart)).toBeVisible();
  });

  test('switching axis selector to "term" keeps the chart visible', async ({
    page,
    mocks,
  }) => {
    await mocks.mockCalculationsList();
    await mocks.mockCalculationScenarios();
    await mocks.mockCalculatorVersions();

    await openSensitivityTab(page);

    // The panel has three axis buttons: rate (default), term, amount
    const termAxisBtn = page.locator(SELECTORS.sensitivityAxisBtn('term'));
    await expect(termAxisBtn).toBeVisible();
    await termAxisBtn.click();

    // After switching axis the chart container should still be visible
    await expect(page.locator(SELECTORS.sensitivityChart)).toBeVisible();
  });

  test('switching axis selector to "amount" keeps the chart visible', async ({
    page,
    mocks,
  }) => {
    await mocks.mockCalculationsList();
    await mocks.mockCalculationScenarios();
    await mocks.mockCalculatorVersions();

    await openSensitivityTab(page);

    const amountAxisBtn = page.locator(SELECTORS.sensitivityAxisBtn('amount'));
    await expect(amountAxisBtn).toBeVisible();
    await amountAxisBtn.click();

    await expect(page.locator(SELECTORS.sensitivityChart)).toBeVisible();
  });

  test('all three axis buttons are present', async ({ page, mocks }) => {
    await mocks.mockCalculationsList();
    await mocks.mockCalculationScenarios();
    await mocks.mockCalculatorVersions();

    await openSensitivityTab(page);

    await expect(page.locator(SELECTORS.sensitivityAxisBtn('rate'))).toBeVisible();
    await expect(page.locator(SELECTORS.sensitivityAxisBtn('term'))).toBeVisible();
    await expect(page.locator(SELECTORS.sensitivityAxisBtn('amount'))).toBeVisible();
  });

  test('sensitivity panel contains an SVG chart', async ({ page, mocks }) => {
    await mocks.mockCalculationsList();
    await mocks.mockCalculationScenarios();
    await mocks.mockCalculatorVersions();

    await openSensitivityTab(page);

    // Recharts ResponsiveContainer renders an SVG
    await expect(page.locator(SELECTORS.sensitivityChart).locator('svg').first()).toBeVisible();
  });
});
