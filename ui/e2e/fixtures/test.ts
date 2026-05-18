import { test as base, expect } from '@playwright/test';
import * as apiMocks from './api-mocks';

type BoundMocks = {
  [K in keyof typeof apiMocks]: typeof apiMocks[K] extends (
    page: infer _Page,
    ...args: infer Args
  ) => infer Return
    ? (...args: Args) => Return
    : never;
};

export const test = base.extend<{ mocks: BoundMocks }>({
  mocks: async ({ page }, use) => {
    // Stub auth/refresh globally so axios 401 interceptor never redirects to /login during tests.
    await page.route('**/auth/refresh', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    );

    const bound = Object.fromEntries(
      Object.entries(apiMocks).map(([k, fn]) => [k, (...args: unknown[]) => (fn as Function)(page, ...args)])
    ) as BoundMocks;
    await use(bound);
  },
});

export { expect };
