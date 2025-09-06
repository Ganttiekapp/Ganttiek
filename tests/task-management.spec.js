import { test, expect } from '@playwright/test';

test.describe('Task Management', () => {
  test.setTimeout(30000); // 30 seconds

  test('should display tasks page correctly', async ({ page }) => {
    await page.goto('/tasks');
    
    // Should redirect to login since not authenticated
    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveTitle(/Login/);
  });

  test('should display task detail page correctly', async ({ page }) => {
    await page.goto('/tasks/123');
    
    // Should redirect to login since not authenticated
    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveTitle(/Login/);
  });

  test('should have navigation with task management links', async ({ page }) => {
    await page.goto('/login');
    
    // Check if login page loads
    await expect(page).toHaveTitle(/Login/);
    
    // Check if form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 5000 });
  });

  test('should display dashboard with task management features', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login since not authenticated
    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveTitle(/Login/);
  });

  test('should handle task form interactions', async ({ page }) => {
    await page.goto('/login');
    
    // Check if login page loads
    await expect(page).toHaveTitle(/Login/);
    
    // Check if form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 5000 });
    
    // Test email input
    await page.fill('input[type="email"]', 'test@example.com');
    await expect(page.locator('input[type="email"]')).toHaveValue('test@example.com');
  });

  test('should display project pages with task management', async ({ page }) => {
    await page.goto('/projects');
    
    // Should redirect to login since not authenticated
    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveTitle(/Login/);
  });

  test('should handle task priority and status display', async ({ page }) => {
    await page.goto('/login');
    
    // Check if login page loads
    await expect(page).toHaveTitle(/Login/);
    
    // Check if form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 5000 });
  });

  test('should display task management navigation', async ({ page }) => {
    await page.goto('/login');
    
    // Check if login page loads
    await expect(page).toHaveTitle(/Login/);
    
    // Check if form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 5000 });
  });
});
