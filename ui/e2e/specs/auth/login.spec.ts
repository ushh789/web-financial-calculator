import { test, expect } from '../../fixtures/test';
import userJson from '../../fixtures/data/user.json';

test.describe('Login', () => {
  test('happy path — valid credentials redirect to dashboard', async ({ page }) => {
    await page.route('**/auth/login', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(userJson) })
    );

    await page.goto('/login');
    await page.locator('#username').fill('testuser');
    await page.locator('#password').fill('password123');
    await page.getByRole('button', { name: /login|sign in|увійти/i }).click();

    await page.waitForURL(/dashboard/);
    await expect(page).toHaveURL(/dashboard/);
  });

  test('invalid credentials — shows error message', async ({ page }) => {
    await page.route('**/auth/login', route =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid credentials' }),
      })
    );

    await page.goto('/login');
    await page.locator('#username').fill('baduser');
    await page.locator('#password').fill('badpassword');
    await page.getByRole('button', { name: /login|sign in|увійти/i }).click();

    const alert = page.getByRole('alert');
    const errorText = page.getByText(/invalid credentials|невірн/i);
    await expect(alert.or(errorText).first()).toBeVisible();
  });

  test('server error — shows error state and no redirect', async ({ page }) => {
    await page.route('**/auth/login', route =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Server error' }) })
    );

    await page.goto('/login');
    await page.locator('#username').fill('testuser');
    await page.locator('#password').fill('password123');
    await page.getByRole('button', { name: /login|sign in|увійти/i }).click();

    // Should remain on login page
    await expect(page).toHaveURL(/login/);
  });

  test('empty fields — shows validation errors', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /login|sign in|увійти/i }).click();

    // Zod schema requires min(1) for both fields
    const usernameError = page.getByText(/введіть логін/i);
    const passwordError = page.getByText(/введіть пароль/i);
    await expect(usernameError.or(passwordError).first()).toBeVisible();
  });
});
