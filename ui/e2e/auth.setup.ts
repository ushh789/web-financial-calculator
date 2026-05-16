import { test as setup } from '@playwright/test';
import userJson from './fixtures/data/user.json';
import adminJson from './fixtures/data/admin.json';
import fs from 'fs';
import path from 'path';

const storageDir = path.join(__dirname, '..', '.storage');

if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

// Inject Zustand auth-store into sessionStorage without touching the login UI.
// The app uses persist({ storage: createJSONStorage(() => sessionStorage), name: 'auth-store' }).
async function saveStorageState(
  page: import('@playwright/test').Page,
  user: typeof userJson,
  outPath: string,
) {
  const storeValue = JSON.stringify({ state: { user }, version: 0 });

  // Establish the origin by navigating to login page (no backend call needed).
  // Stub any API calls the login page might make so nothing hangs.
  await page.route('**/api/**', route => route.fulfill({ status: 200, json: [] }));
  await page.route('**/auth/**', route => route.fulfill({ status: 401, json: {} }));

  await page.goto('/login');

  // Set sessionStorage on the established origin, then capture storage state.
  await page.evaluate((value) => {
    sessionStorage.setItem('auth-store', value);
  }, storeValue);

  await page.context().storageState({ path: outPath });
}

setup('authenticate as regular user', async ({ page }) => {
  await saveStorageState(page, userJson, path.join(storageDir, 'user.json'));
});

setup('authenticate as admin user', async ({ page }) => {
  await saveStorageState(page, adminJson, path.join(storageDir, 'admin.json'));
});
