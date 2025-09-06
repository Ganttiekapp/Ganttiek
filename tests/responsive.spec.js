import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('should work on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    
    // Check if page loads correctly on mobile
    await expect(page.locator('.auth-container')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.auth-card')).toBeVisible({ timeout: 5000 });
    
    // Check if form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should work on tablet devices', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/login');
    
    // Check if page loads correctly on tablet
    await expect(page.locator('.auth-container')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.auth-card')).toBeVisible({ timeout: 5000 });
  });

  test('should work on desktop devices', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/login');
    
    // Check if page loads correctly on desktop
    await expect(page.locator('.auth-container')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.auth-card')).toBeVisible({ timeout: 5000 });
  });

  test('should handle form layout on different screen sizes', async ({ page }) => {
    // Test mobile form layout
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    
    await expect(page.locator('.auth-container')).toBeVisible();
    await expect(page.locator('.auth-card')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    
    // Test desktop form layout
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/login');
    
    await expect(page.locator('.auth-container')).toBeVisible();
    await expect(page.locator('.auth-card')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});
