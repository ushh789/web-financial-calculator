import type { Page } from '@playwright/test';
import userJson from '../fixtures/data/user.json';
import adminJson from '../fixtures/data/admin.json';

export async function setAccessTokenCookie(page: Page) {
  await page.context().addCookies([
    {
      name: 'accessToken',
      value: 'playwright-access-token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
  ]);
}

/**
 * Programmatically stub auth for tests that do not rely on the setup storage state.
 *
 * This stubs /auth/login (in case the app calls it) and injects the Zustand
 * auth-store into localStorage so the app sees a logged-in user without
 * hitting the real backend.
 */
export async function loginAs(page: Page, role: 'user' | 'admin') {
  const user = role === 'admin' ? adminJson : userJson;

  await setAccessTokenCookie(page);

  // Stub /auth/me in case the app or middleware checks it
  await page.route('**/auth/me', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(user) })
  );

  // Inject Zustand auth-store directly into localStorage
  const storeValue = JSON.stringify({ state: { user }, version: 0 });
  await page.addInitScript((value) => {
    // Runs before the page JS - pre-populate localStorage so Zustand
    // rehydrates as logged-in on first render
    localStorage.setItem('auth-store', value);
  }, storeValue);
}


