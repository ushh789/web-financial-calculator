import { test, expect } from '../../fixtures/test';
import userJson from '../../fixtures/data/user.json';
import calculatorVersions from '../../fixtures/data/calculator-versions.json';

const CALC_ID = '11111111-1111-1111-1111-111111111111';

test.beforeEach(async ({ page }) => {
  await page.addInitScript((user) => {
    localStorage.setItem('auth-store', JSON.stringify({ state: { user }, version: 0 }));
  }, userJson);
});

test.describe('Version selector', () => {
  test('version selector shows multiple versions', async ({ page, mocks }) => {
    await mocks.mockCalculatorDetail();
    await mocks.mockCalculatorVersions();
    await page.goto(`/calculators/${CALC_ID}`);

    // Open the version selector dropdown
    await page.locator('#version-select').click();

    const versionCount = calculatorVersions.length;
    // Each version renders a SelectItem — verify the expected number of options exist
    const items = page.getByRole('option');
    await expect(items).toHaveCount(versionCount);
  });

  test('selecting a different version re-renders the form', async ({ page, mocks }) => {
    await mocks.mockCalculatorDetail();
    await mocks.mockCalculatorVersions();
    await page.goto(`/calculators/${CALC_ID}`);

    // Ensure the form is rendered with the default (last) version
    await expect(page.locator('#amount')).toBeVisible();

    // Open the version dropdown and pick Version 1
    await page.locator('#version-select').click();
    await page.getByRole('option', { name: /version 1/i }).click();

    // After selecting, the form is still visible (CalculatorForm is re-keyed by version id)
    await expect(page.locator('#amount')).toBeVisible();
    await expect(page.locator('#rate')).toBeVisible();
  });
});
