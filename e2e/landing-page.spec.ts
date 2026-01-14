import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display the landing page with hero section', async ({ page }) => {
    await page.goto('/');

    // Check for the main headline using more specific selector
    await expect(page.locator('h1').getByText('Create Amazing Content')).toBeVisible();
    await expect(page.locator('h1').getByText('With AI-Powered Tools')).toBeVisible();

    // Check for the logo in nav
    await expect(page.locator('nav').getByText('Creator Studio')).toBeVisible();

    // Check for CTA button
    await expect(page.getByRole('button', { name: 'Start Creating Free' })).toBeVisible();
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');

    // Check navigation in the nav element specifically
    const nav = page.locator('nav');
    await expect(nav.getByRole('link', { name: 'Features' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Plans' })).toBeVisible();
  });

  test('should display features section', async ({ page }) => {
    await page.goto('/');

    // Check for feature cards
    await expect(page.getByText('AI Chat Assistant')).toBeVisible();
    await expect(page.getByText('Image Generation')).toBeVisible();
    await expect(page.getByText('Video Generation')).toBeVisible();
  });

  test('should display pricing section', async ({ page }) => {
    await page.goto('/');

    // Scroll to pricing section
    const pricingHeading = page.getByRole('heading', { name: 'Simple, Transparent Pricing' });
    await pricingHeading.scrollIntoViewIfNeeded();
    await expect(pricingHeading).toBeVisible();

    // Check for pricing plan names - use exact match in section
    const pricingSection = page.locator('#pricing');
    await expect(pricingSection.locator('h3').getByText('Free')).toBeVisible();
    await expect(pricingSection.locator('h3').getByText('Starter')).toBeVisible();
    await expect(pricingSection.locator('h3').getByText('Pro')).toBeVisible();
    await expect(pricingSection.locator('h3').getByText('Business')).toBeVisible();
  });

  test('should navigate to register page from CTA', async ({ page }) => {
    await page.goto('/');

    // Click the main CTA button in hero
    await page.getByRole('button', { name: 'Start Creating Free' }).click();

    // Should navigate to register
    await expect(page).toHaveURL(/\/register/);
  });

  test('should navigate to sign in page', async ({ page }) => {
    await page.goto('/');

    // Click sign in link in nav
    await page.locator('nav').getByRole('link', { name: 'Sign In' }).click();

    // Should navigate to signin
    await expect(page).toHaveURL(/\/signin/);
  });
});
