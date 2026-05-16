import { test as base, expect } from '@playwright/test';
import * as apiMocks from './api-mocks';

type Mocks = typeof apiMocks;

export const test = base.extend<{ mocks: Mocks }>({
  mocks: async ({ page }, use) => {
    const bound = Object.fromEntries(
      Object.entries(apiMocks).map(([k, fn]) => [k, (...args: unknown[]) => (fn as Function)(page, ...args)])
    ) as Mocks;
    await use(bound);
  },
});

export { expect };
