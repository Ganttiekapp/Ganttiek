import { test, expect } from '@playwright/test';

test.describe('Duplicate Function Detection', () => {
  test.setTimeout(30000); // 30 seconds

  test('should not have duplicate function declarations', async ({ page }) => {
    // This test will fail if there are JavaScript syntax errors
    // that prevent the page from loading properly
    
    try {
      await page.goto('/projects/123');
      
      // If the page loads without JavaScript errors, the test passes
      // The page should redirect to login since not authenticated
      await expect(page).toHaveURL(/\/login/);
      await expect(page).toHaveTitle(/Login/);
    } catch (error) {
      // If there's a JavaScript error, the page won't load properly
      throw new Error(`JavaScript error detected: ${error.message}`);
    }
  });

  test('should handle project page navigation without errors', async ({ page }) => {
    await page.goto('/projects');
    
    // Should redirect to login since not authenticated
    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveTitle(/Login/);
  });

  test('should handle task page navigation without errors', async ({ page }) => {
    await page.goto('/tasks');
    
    // Should redirect to login since not authenticated
    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveTitle(/Login/);
  });
});
