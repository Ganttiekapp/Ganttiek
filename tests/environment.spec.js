import { test, expect } from '@playwright/test';

test.describe('Environment Configuration', () => {
  test.setTimeout(30000); // 30 seconds

  test('should handle invalid environment variables gracefully', async ({ page }) => {
    // This test verifies that the app doesn't crash with invalid environment variables
    // The app should still load and redirect to login even with test Supabase config
    
    try {
      await page.goto('/');
      
      // The page should load without JavaScript errors
      // It should redirect to login since not authenticated
      await expect(page).toHaveURL(/\/login/);
      await expect(page).toHaveTitle(/Login/);
      
      // Check if login form is present
      await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 5000 });
      
    } catch (error) {
      // If there's a JavaScript error, the page won't load properly
      throw new Error(`Environment configuration error: ${error.message}`);
    }
  });

  test('should load all main pages without environment errors', async ({ page }) => {
    const pages = [
      { path: '/', shouldRedirect: true },
      { path: '/login', shouldRedirect: false },
      { path: '/signup', shouldRedirect: false },
      { path: '/dashboard', shouldRedirect: true },
      { path: '/projects', shouldRedirect: true },
      { path: '/tasks', shouldRedirect: true }
    ];
    
    for (const { path, shouldRedirect } of pages) {
      try {
        await page.goto(path);
        
        if (shouldRedirect) {
          // Protected pages should redirect to login when not authenticated
          await expect(page).toHaveURL(/\/login/);
          await expect(page).toHaveTitle(/Login/);
        } else {
          // Login and signup pages should load directly
          await expect(page).toHaveURL(new RegExp(path.replace('/', '\\/')));
          await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
        }
        
      } catch (error) {
        throw new Error(`Failed to load page ${path}: ${error.message}`);
      }
    }
  });

  test('should handle Supabase client initialization', async ({ page }) => {
    // Test that the Supabase client can be initialized without errors
    await page.goto('/login');
    
    // Check for console errors related to Supabase
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Wait for page to load
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
    
    // Check that there are no critical Supabase initialization errors
    const criticalErrors = consoleErrors.filter(error => 
      error.includes('ERR_INVALID_URL') || 
      error.includes('Invalid URL') ||
      error.includes('Supabase client error')
    );
    
    if (criticalErrors.length > 0) {
      throw new Error(`Critical Supabase errors detected: ${criticalErrors.join(', ')}`);
    }
  });
});
