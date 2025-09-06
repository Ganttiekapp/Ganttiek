import { test, expect } from '@playwright/test';

test.describe('Basic Functionality', () => {
  test.setTimeout(15000); // 15 seconds

  test('should load home page', async ({ page }) => {
    await page.goto('/');
    
    // Check if page loads
    await expect(page).toHaveTitle(/Ganttiek/);
    
    // Check if main content is present
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/login');
    
    // Check if login page loads
    await expect(page).toHaveTitle(/Login/);
    
    // Check if form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/signup');
    
    // Check if signup page loads
    await expect(page).toHaveTitle(/Sign Up/);
    
    // Check if form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
  });
});
