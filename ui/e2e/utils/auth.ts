import type { Page } from '@playwright/test';
import userJson from '../fixtures/data/user.json';
import adminJson from '../fixtures/data/admin.json';

/**
 * Programmatically stub auth for tests that do not rely on the setup storage state.
 *
 * This stubs /auth/login (in case the app calls it) and injects the Zustand
 * auth-store into sessionStorage so the app sees a logged-in user without
 * hitting the real backend.
 */
export async function loginAs(page: Page, role: 'user' | 'admin') {
  const user = role === 'admin' ? adminJson : userJson;

  // Stub /auth/me in case the app or middleware checks it
  await page.route('**/auth/me', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(user) })
  );

  // Inject Zustand auth-store directly into sessionStorage
  const storeValue = JSON.stringify({ state: { user }, version: 0 });
  await page.addInitScript((value) => {
    // Runs before the page JS — pre-populate sessionStorage so Zustand
    // rehydrates as logged-in on first render
    sessionStorage.setItem('auth-store', value);
  }, storeValue);
}
