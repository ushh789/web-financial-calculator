import { test, expect } from '../../fixtures/test';
import userJson from '../../fixtures/data/user.json';
import type { Page } from '@playwright/test';

const CALC_ID = '11111111-1111-1111-1111-111111111111';
const CALC_NAME = 'Annuity Loan';

async function useServerCalculatorList(page: Page, value: 'fixture' | 'empty') {
  await page.context().addCookies([
    {
      name: 'E2E_CALCULATORS_LIST',
      value,
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ]);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript((user) => {
    localStorage.setItem('auth-store', JSON.stringify({ state: { user }, version: 0 }));
  }, userJson);
});

test.describe('Calculators list', () => {
  test('renders calculator cards from fixture', async ({ page }) => {
    await useServerCalculatorList(page, 'fixture');
    await page.goto('/calculators');

    await expect(page.getByRole('heading', { name: CALC_NAME })).toBeVisible();
  });

  test('shows empty state when list is empty', async ({ page }) => {
    await useServerCalculatorList(page, 'empty');
    await page.goto('/calculators');

    // The page renders an empty message via t("empty")
    const emptyMsg = page.getByText(/no calculators|empty|немає/i);
    await expect(emptyMsg).toBeVisible();
  });

  test('page loads without errors', async ({ page }) => {
    await useServerCalculatorList(page, 'fixture');

    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/calculators');
    await expect(page).toHaveURL(/calculators/);
    expect(errors).toHaveLength(0);
  });

  test('clicking a calculator card navigates to its detail page', async ({ page, mocks }) => {
    await useServerCalculatorList(page, 'fixture');
    await mocks.mockCalculatorDetail();
    await mocks.mockCalculatorVersions();
    await page.goto('/calculators');

    await page.locator(`a[href="/calculators/${CALC_ID}"]`).click();

    await page.waitForURL(new RegExp(`/calculators/${CALC_ID}`));
    await expect(page).toHaveURL(new RegExp(`/calculators/${CALC_ID}`));
  });
});
