import type { Page } from '@playwright/test';
import defaultUser from './data/user.json';
import defaultCalculators from './data/calculators.json';
import defaultCalculatorDetail from './data/calculator-detail.json';
import defaultCalculationResult from './data/calculation-result.json';

type UserFixture = typeof defaultUser;
type CalculatorsFixture = typeof defaultCalculators;
type CalculatorDetailFixture = typeof defaultCalculatorDetail;
type CalculationResultFixture = typeof defaultCalculationResult;

// Stub GET auth/me - returns a fake logged-in user.
// The app itself does not call /auth/me; this is used in the auth setup
// and tests that need to verify session hydration via route stubbing.
export async function mockAuthMe(page: Page, user: UserFixture = defaultUser) {
  await page.route('**/auth/me', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(user) })
  );
}

// Stub GET /api/calculators - returns a paginated list of calculators.
export async function mockCalculatorsList(
  page: Page,
  fixture: CalculatorsFixture = defaultCalculators
) {
  await page.route('**/api/calculators', route => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fixture),
      });
    }
    return route.continue();
  });
}

// Stub GET /api/calculators/:id - returns a single calculator.
export async function mockCalculatorDetail(
  page: Page,
  fixture: CalculatorDetailFixture = defaultCalculatorDetail
) {
  await page.route(/\/api\/calculators\/[^/]+$/, route => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fixture),
      });
    }
    return route.continue();
  });
}

// Stub POST /api/calculators/:id/calculate - returns a calculation result.
// Note: the actual API uses POST /api/calculations to create calculations;
// adjust this mock if the calculate endpoint differs.
export async function mockRunCalculation(
  page: Page,
  fixture: CalculationResultFixture = defaultCalculationResult
) {
  await page.route(/\/api\/calculators\/[^/]+\/calculate/, route => {
    if (route.request().method() === 'POST') {
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(fixture),
      });
    }
    return route.continue();
  });
}

// Stub GET /api/calculations/:id - returns a single calculation.
export async function mockCalculationDetail(
  page: Page,
  fixture: CalculationResultFixture = defaultCalculationResult
) {
  await page.route(/\/api\/calculations\/[^/]+$/, route => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fixture),
      });
    }
    return route.continue();
  });
}

type CalculationsListFixture = {
  content: CalculationResultFixture[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

// Stub GET /api/calculations - returns a paginated list of calculations.
export async function mockCalculationsList(
  page: Page,
  fixture: CalculationsListFixture = {
    content: [defaultCalculationResult],
    totalElements: 1,
    totalPages: 1,
    size: 20,
    number: 0,
  }
) {
  await page.route('**/api/calculations', route => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fixture),
      });
    }
    return route.continue();
  });
}
