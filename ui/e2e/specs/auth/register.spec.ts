import { test, expect } from '../../fixtures/test';

test.describe('Register', () => {
  test('happy path — successful registration redirects to login', async ({ page }) => {
    await page.route('**/auth/register', route =>
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ message: 'Created' }) })
    );

    await page.goto('/register');
    await page.locator('#username').fill('newuser');
    await page.locator('#email').fill('newuser@test.com');
    await page.locator('#password').fill('password123');
    await page.locator('#confirmPassword').fill('password123');

    await page.getByRole('button', { name: /register|sign up|зареєструватись/i }).click();

    await page.waitForURL(/login/);
    await expect(page).toHaveURL(/login/);
  });

  test('password mismatch — shows validation error', async ({ page }) => {
    await page.goto('/register');
    await page.locator('#username').fill('newuser');
    await page.locator('#email').fill('newuser@test.com');
    await page.locator('#password').fill('password123');
    await page.locator('#confirmPassword').fill('different456');

    await page.getByRole('button', { name: /register|sign up|зареєструватись/i }).click();

    // confirmPassword error from Zod refine: "Паролі не збігаються"
    await expect(page.getByText(/паролі не збігаються/i)).toBeVisible();
  });

  test('duplicate username/email — shows 409 conflict error', async ({ page }) => {
    await page.route('**/auth/register', route =>
      route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Username or email already exists' }),
      })
    );

    await page.goto('/register');
    await page.locator('#username').fill('existinguser');
    await page.locator('#email').fill('existing@test.com');
    await page.locator('#password').fill('password123');
    await page.locator('#confirmPassword').fill('password123');

    await page.getByRole('button', { name: /register|sign up|зареєструватись/i }).click();

    const alert = page.getByRole('alert');
    const errorText = page.getByText(/already exists|conflict|помилка/i);
    await expect(alert.or(errorText).first()).toBeVisible();
  });
});
