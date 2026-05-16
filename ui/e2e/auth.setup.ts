import { test as setup, expect } from '@playwright/test';
import userJson from './fixtures/data/user.json';
import adminJson from './fixtures/data/admin.json';
import fs from 'fs';
import path from 'path';

const storageDir = path.join(__dirname, '..', '.storage');

/**
 * Inject a user into the Zustand auth-store persisted in sessionStorage.
 * The app uses `persist` with `createJSONStorage(() => sessionStorage)` and
 * key "auth-store". We navigate to the root first so sessionStorage is
 * accessible for the same origin, then set the store state directly.
 */
async function injectAuthStore(page: import('@playwright/test').Page, user: typeof userJson) {
  const storeValue = JSON.stringify({ state: { user }, version: 0 });

  // Stub the login endpoint so the form submit succeeds
  await page.route('**/auth/login', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(user),
    })
  );

  // Navigate to login page to establish the origin
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Fill and submit the login form (field name is "username" per LoginForm.tsx)
  await page.fill('#username', user.username);
  await page.fill('#password', 'test-password');
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard after successful login
  await expect(page).toHaveURL(/dashboard/, { timeout: 15_000 });
  await page.waitForLoadState('networkidle');

  // Ensure sessionStorage has the auth-store set (Zustand should have written it
  // on login success, but set it explicitly as a safety net)
  await page.evaluate((value) => {
    sessionStorage.setItem('auth-store', value);
  }, storeValue);
}

// Ensure the .storage directory exists
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

setup('authenticate as regular user', async ({ page }) => {
  await injectAuthStore(page, userJson);
  await page.context().storageState({ path: path.join(storageDir, 'user.json') });
});

setup('authenticate as admin user', async ({ page }) => {
  await injectAuthStore(page, adminJson);
  await page.context().storageState({ path: path.join(storageDir, 'admin.json') });
});
