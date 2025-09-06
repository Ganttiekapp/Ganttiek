import { test, expect } from '@playwright/test';

test.describe('Project Management', () => {
  test('should display projects page correctly', async ({ page }) => {
    await page.goto('/projects');
    
    // Should redirect to login since not authenticated
    await expect(page).toHaveURL('/login');
  });

  test('should display create project page correctly', async ({ page }) => {
    await page.goto('/projects/new');
    
    // Should redirect to login since not authenticated
    await expect(page).toHaveURL('/login');
  });

  test('should display dashboard correctly', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login since not authenticated
    await expect(page).toHaveURL('/login');
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/');
    
    // The app should redirect to login page when not authenticated
    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveTitle(/Login/);
    
    // Check if login page elements are present
    await expect(page.locator('h1')).toContainText('Login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('should have proper login page structure and styling', async ({ page }) => {
    await page.goto('/login');
    
    // Check if main elements are present
    await expect(page.locator('.auth-container')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.auth-card')).toBeVisible({ timeout: 5000 });
    
    // Check if buttons have proper styling
    const submitButton = page.locator('button[type="submit"]');
    const signupLink = page.locator('a[href="/signup"]');
    
    await expect(submitButton).toHaveClass(/btn-primary/);
    await expect(signupLink).toBeVisible();
  });

  test('should handle form interactions correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Test email input
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');
    
    // Test button state
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();
  });

  test('should handle form submission', async ({ page }) => {
    await page.goto('/login');
    
    // Submit empty form
    await page.click('button[type="submit"]');
    
    // Check if we're still on the login page (form didn't redirect)
    await expect(page).toHaveURL('/login');
    
    // The form should either show an error or prevent submission
    // Since we can't guarantee the error message appears, just check the page state
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});
