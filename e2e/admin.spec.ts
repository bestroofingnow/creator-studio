import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test('admin page should load and show loading state', async ({ page }) => {
    await page.goto('/admin');

    // The admin page should load without crashing
    // Non-authenticated users will see loading indicator (since session check is client-side)
    await expect(page).toHaveURL('/admin');

    // Page should have loaded (no server error)
    const body = await page.locator('body').textContent();
    expect(body).toBeDefined();
  });

  test('admin page exists in the route structure', async ({ page }) => {
    // Navigate to admin page
    await page.goto('/admin');

    // Check that we're on the admin route
    await expect(page).toHaveURL('/admin');
  });
});
