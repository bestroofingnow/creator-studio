import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.describe('Sign In Page', () => {
    test('should display sign in page', async ({ page }) => {
      await page.goto('/signin');

      // Check for page elements
      await expect(page.getByText('Welcome Back')).toBeVisible();
      await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
      await expect(page.getByPlaceholder('Enter your password')).toBeVisible();
      await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
    });

    test('should have Google sign in option', async ({ page }) => {
      await page.goto('/signin');

      await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();
    });

    test('should have link to register page', async ({ page }) => {
      await page.goto('/signin');

      await expect(page.getByRole('link', { name: /Create one free/i })).toBeVisible();

      // Click and verify navigation
      await page.getByRole('link', { name: /Create one free/i }).click();
      await expect(page).toHaveURL(/\/register/);
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/signin');

      // Fill form with invalid credentials
      await page.getByPlaceholder('you@example.com').fill('invalid@test.com');
      await page.getByPlaceholder('Enter your password').fill('wrongpassword');

      // Submit form
      await page.getByRole('button', { name: /Sign In/i }).click();

      // Wait for error message
      await expect(page.getByText(/Invalid email or password/i)).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Register Page', () => {
    test('should display register page', async ({ page }) => {
      await page.goto('/register');

      // Check for page elements
      await expect(page.getByText('Create Your Account')).toBeVisible();
      await expect(page.getByPlaceholder('John Doe')).toBeVisible();
      await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
      await expect(page.getByPlaceholder('Create a password')).toBeVisible();
      await expect(page.getByPlaceholder('Confirm your password')).toBeVisible();
    });

    test('should display benefits on desktop', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/register');

      // Check for benefits panel
      await expect(page.getByText('1,000 free credits to start')).toBeVisible();
      await expect(page.getByText('Access to all AI tools')).toBeVisible();
    });

    test('should have Google sign up option', async ({ page }) => {
      await page.goto('/register');

      await expect(page.getByRole('button', { name: /Sign up with Google/i })).toBeVisible();
    });

    test('should have link to sign in page', async ({ page }) => {
      await page.goto('/register');

      await expect(page.getByRole('link', { name: /Sign in/i })).toBeVisible();

      // Click and verify navigation
      await page.getByRole('link', { name: /Sign in/i }).click();
      await expect(page).toHaveURL(/\/signin/);
    });

    test('should validate password match', async ({ page }) => {
      await page.goto('/register');

      // Fill form with mismatched passwords
      await page.getByPlaceholder('John Doe').fill('Test User');
      await page.getByPlaceholder('you@example.com').fill('test@example.com');
      await page.getByPlaceholder('Create a password').fill('password123');
      await page.getByPlaceholder('Confirm your password').fill('differentpassword');

      // Submit form
      await page.getByRole('button', { name: /Create Account/i }).click();

      // Should show error
      await expect(page.getByText(/Passwords do not match/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to signin when accessing dashboard without auth', async ({ page }) => {
      // Try to access protected route
      await page.goto('/dashboard');

      // Should redirect to signin
      await expect(page).toHaveURL(/\/signin.*callbackUrl/);
    });

    test('should redirect to signin when accessing account without auth', async ({ page }) => {
      // Try to access protected route
      await page.goto('/account');

      // Should redirect to signin
      await expect(page).toHaveURL(/\/signin.*callbackUrl/);
    });
  });

  test.describe('Legacy Login Redirect', () => {
    test('should redirect /login to /signin', async ({ page }) => {
      await page.goto('/login');

      // Should redirect to signin
      await expect(page).toHaveURL(/\/signin/);
    });

    test('should redirect /login?signup=true to /register', async ({ page }) => {
      await page.goto('/login?signup=true');

      // Should redirect to register
      await expect(page).toHaveURL(/\/register/);
    });
  });
});
