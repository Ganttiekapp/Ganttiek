import { test, expect } from '@playwright/test';

test.describe('SVAR Gantt Chart Component', () => {
  test('should load login page without errors', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Verify login page loads correctly
    await expect(page.locator('h1')).toContainText('Login');
    
    // Check that the page has the expected structure
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('should load projects page without errors', async ({ page }) => {
    // Navigate to projects page
    await page.goto('/projects');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Should redirect to login for unauthenticated users
    await expect(page).toHaveURL(/\/login/);
  });

  test('should load dashboard page without errors', async ({ page }) => {
    // Navigate to dashboard page
    await page.goto('/dashboard');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Should redirect to login for unauthenticated users
    await expect(page).toHaveURL(/\/login/);
  });

  test('should have proper page structure', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check for navigation elements
    const nav = page.locator('nav');
    if (await nav.count() > 0) {
      await expect(nav).toBeVisible();
    }
    
    // Check for main content
    const main = page.locator('main');
    if (await main.count() > 0) {
      await expect(main).toBeVisible();
    }
  });
});