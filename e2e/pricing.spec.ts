import { test, expect } from '@playwright/test';

test.describe('Pricing Page', () => {
  test('should display pricing page', async ({ page }) => {
    await page.goto('/pricing');

    // Check for header
    await expect(page.getByRole('heading', { name: 'Simple, transparent pricing' })).toBeVisible();

    // Check for plan cards using headings
    await expect(page.locator('h3').getByText('Starter')).toBeVisible();
    await expect(page.locator('h3').getByText('Pro')).toBeVisible();
    await expect(page.locator('h3').getByText('Business')).toBeVisible();
  });

  test('should display plan prices', async ({ page }) => {
    await page.goto('/pricing');

    // Check for visible price elements - prices appear in span elements
    await expect(page.locator('span:has-text("$29")')).toBeVisible();
    await expect(page.locator('span:has-text("$79")')).toBeVisible();
    await expect(page.locator('span:has-text("$199")')).toBeVisible();
  });

  test('should display credit amounts', async ({ page }) => {
    await page.goto('/pricing');

    // Check for credit amounts in text
    await expect(page.getByText('25,000 credits/month').first()).toBeVisible();
    await expect(page.getByText('100,000 credits/month').first()).toBeVisible();
    await expect(page.getByText('500,000 credits/month').first()).toBeVisible();
  });

  test('should highlight Pro plan as popular', async ({ page }) => {
    await page.goto('/pricing');

    await expect(page.getByText('Most Popular')).toBeVisible();
  });

  test('should have Get Started buttons', async ({ page }) => {
    await page.goto('/pricing');

    // Check that Get Started buttons exist
    const buttons = page.getByRole('button', { name: 'Get Started' });
    await expect(buttons).toHaveCount(3);
  });

  test('should navigate back to home', async ({ page }) => {
    await page.goto('/pricing');

    // Click on logo link
    await page.getByRole('link', { name: /Creator Studio/i }).click();

    // Should be on home page
    await expect(page).toHaveURL('/');
  });
});
