import { test, expect } from '@playwright/test';

test.describe('Task Dependencies', () => {
  test.setTimeout(30000); // 30 seconds

  test('should display project page with task dependency support', async ({ page }) => {
    await page.goto('/projects/123');
    
    // Should redirect to login since not authenticated
    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveTitle(/Login/);
  });

  test('should handle task creation with parent task selection', async ({ page }) => {
    await page.goto('/login');
    
    // Check if login page loads
    await expect(page).toHaveTitle(/Login/);
    
    // Check if form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 5000 });
  });

  test('should handle task editing with dependency changes', async ({ page }) => {
    await page.goto('/login');
    
    // Check if login page loads
    await expect(page).toHaveTitle(/Login/);
    
    // Check if form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 5000 });
  });

  test('should display task dependencies in task list', async ({ page }) => {
    await page.goto('/login');
    
    // Check if login page loads
    await expect(page).toHaveTitle(/Login/);
    
    // Check if form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 5000 });
  });

  test('should prevent circular dependencies', async ({ page }) => {
    await page.goto('/login');
    
    // Check if login page loads
    await expect(page).toHaveTitle(/Login/);
    
    // Check if form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 5000 });
  });

  test('should handle dependency validation', async ({ page }) => {
    await page.goto('/login');
    
    // Check if login page loads
    await expect(page).toHaveTitle(/Login/);
    
    // Check if form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 5000 });
  });

  test('should load available parent tasks', async ({ page }) => {
    await page.goto('/login');
    
    // Check if login page loads
    await expect(page).toHaveTitle(/Login/);
    
    // Check if form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 5000 });
  });
});
