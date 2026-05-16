import { test, expect } from '../../fixtures/test';
import { SELECTORS } from '../../utils/selectors';
import userJson from '../../fixtures/data/user.json';

const CALC_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

test.beforeEach(async ({ page }) => {
  await page.addInitScript((user) => {
    sessionStorage.setItem('auth-store', JSON.stringify({ state: { user }, version: 0 }));
  }, userJson);
});

test.describe('Scenario panel', () => {
  test('scenario panel renders on calculation page', async ({ page, mocks }) => {
    await mocks.mockCalculationDetail(page);
    await mocks.mockCalculationScenarios(page);
    await mocks.mockCalculatorVersions(page);

    await page.goto(`/calculations/${CALC_ID}`);

    await expect(page.locator(SELECTORS.scenarioPanel)).toBeVisible();
  });

  test('add scenario button toggles the form', async ({ page, mocks }) => {
    await mocks.mockCalculationDetail(page);
    await mocks.mockCalculationScenarios(page);
    await mocks.mockCalculatorVersions(page);

    await page.goto(`/calculations/${CALC_ID}`);

    // The add-scenario form should not be visible before clicking
    await expect(page.locator('#scenarioName')).not.toBeVisible();

    // Click the add scenario button
    await page.locator(SELECTORS.addScenarioBtn).click();

    // The form's scenarioName input should now be visible
    await expect(page.locator('#scenarioName')).toBeVisible();
  });

  test('submitting the add scenario form invokes the POST and closes the form', async ({
    page,
    mocks,
  }) => {
    await mocks.mockCalculationDetail(page);
    await mocks.mockCalculationScenarios(page);
    await mocks.mockCalculatorVersions(page);
    await mocks.mockAddScenario(page);

    await page.goto(`/calculations/${CALC_ID}`);

    // Open form
    await page.locator(SELECTORS.addScenarioBtn).click();
    await expect(page.locator('#scenarioName')).toBeVisible();

    // Fill required fields
    await page.locator('#scenarioName').fill('Alt Scenario');
    await page.locator('#amount').fill('120000');
    await page.locator('#rate').fill('6');
    await page.locator('#term').fill('24');

    // Submit
    await page.getByRole('button', { name: /^save$|^add$|^submit$/i }).click();

    // After successful submission the form closes (scenarioName input hidden)
    await expect(page.locator('#scenarioName')).not.toBeVisible();
  });

  test('scenario list renders with at least one entry', async ({ page, mocks }) => {
    await mocks.mockCalculationDetail(page);
    await mocks.mockCalculationScenarios(page);
    await mocks.mockCalculatorVersions(page);

    await page.goto(`/calculations/${CALC_ID}`);

    const list = page.locator(SELECTORS.scenarioList);
    await expect(list).toBeVisible();

    // There is at least one scenario row in the list
    await expect(list.locator('[class*="flex items-center"]').first()).toBeVisible();
  });

  test('compare panel renders when two scenarios are selected for comparison', async ({
    page,
    mocks,
  }) => {
    // Return two scenarios so the user can toggle compare on both
    const twoScenarios = [
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        calculationId: CALC_ID,
        scenarioName: 'Default',
        scenarioInput: { amount: 100000, rate: 5, term: 12 },
        scenarioResult: {
          cashFlows: [
            {
              date: '2024-07-01',
              totalAmount: { amount: 8560.75, currencyCode: 'USD' },
              type: 'OUTFLOW',
              description: 'Monthly payment',
              breakdown: {
                principal: { amount: 8144.08, currencyCode: 'USD' },
                interest: { amount: 416.67, currencyCode: 'USD' },
                fee: { amount: 0, currencyCode: 'USD' },
              },
            },
          ],
        },
        createdAt: '2024-06-01T10:00:00Z',
      },
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        calculationId: CALC_ID,
        scenarioName: 'Alt Scenario',
        scenarioInput: { amount: 120000, rate: 6, term: 24 },
        scenarioResult: {
          cashFlows: [
            {
              date: '2024-07-01',
              totalAmount: { amount: 5763.34, currencyCode: 'USD' },
              type: 'OUTFLOW',
              description: 'Monthly payment',
              breakdown: {
                principal: { amount: 5163.34, currencyCode: 'USD' },
                interest: { amount: 600.0, currencyCode: 'USD' },
                fee: { amount: 0, currencyCode: 'USD' },
              },
            },
          ],
        },
        createdAt: '2024-06-02T10:00:00Z',
      },
    ];

    await page.route(/\/api\/calculations\/[^/]+\/scenarios$/, (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(twoScenarios),
        });
      }
      return route.continue();
    });

    await mocks.mockCalculationDetail(page);
    await mocks.mockCalculatorVersions(page);

    await page.goto(`/calculations/${CALC_ID}`);

    // Wait for scenario list to appear
    await expect(page.locator(SELECTORS.scenarioList)).toBeVisible();

    // Click Compare on both scenario rows (buttons with text "Compare")
    const compareButtons = page.locator(SELECTORS.scenarioList).getByRole('button', { name: /compare/i });
    await compareButtons.nth(0).click();
    await compareButtons.nth(1).click();

    // ScenarioCompare renders a grid with two cards — look for the grid element
    const compareGrid = page.locator('.grid.grid-cols-1.sm\\:grid-cols-2');
    await expect(compareGrid).toBeVisible();
  });
});
