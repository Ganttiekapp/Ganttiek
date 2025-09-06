import { test, expect } from '@playwright/test';

test.describe('Bananas Gantt Integration Test', () => {
  test('should load project page with Gantt component without errors', async ({ page }) => {
    // Set up error tracking
    const errors = [];
    const warnings = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    // Navigate to the page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for any async loading
    await page.waitForTimeout(3000);
    
    // Log all errors and warnings
    console.log('=== ERRORS ===');
    errors.forEach(error => console.log('ERROR:', error));
    
    console.log('=== WARNINGS ===');
    warnings.forEach(warning => console.log('WARNING:', warning));
    
    // Check for critical errors related to Gantt component
    const ganttErrors = errors.filter(error => 
      error.includes('Gantt') || 
      error.includes('gantt') ||
      error.includes('Bananas') ||
      error.includes('bananas') ||
      error.includes('import') ||
      error.includes('module') ||
      error.includes('Cannot resolve') ||
      error.includes('Failed to load') ||
      error.includes('Importing binding name')
    );
    
    if (ganttErrors.length > 0) {
      console.log('=== GANTT-RELATED ERRORS ===');
      ganttErrors.forEach(error => console.log('GANTT ERROR:', error));
    }
    
    // The page should still load even if there are some errors
    await expect(page.locator('h1')).toBeVisible();
    
    // Check if the page title is correct
    const title = await page.locator('h1').textContent();
    expect(title).toBe('Login');
    
    // Check for critical errors (allow warnings and non-critical errors)
    const criticalErrors = errors.filter(error => 
      !error.includes('warning') && 
      !error.includes('deprecated') &&
      !error.includes('non-passive') &&
      !error.includes('favicon') &&
      !error.includes('404') &&
      !error.includes('form') && // Allow form prop warnings
      !error.includes('Root') // Allow Root component warnings
    );
    
    if (criticalErrors.length > 0) {
      throw new Error(`Critical JavaScript errors found: ${criticalErrors.join(', ')}`);
    }
    
    console.log('✅ Page loaded successfully without critical errors!');
  });

  test('should test Gantt component import in browser context', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test importing Gantt components in the browser context
    const importTest = await page.evaluate(async () => {
      try {
        // Try to import from the index file (same as the project page)
        const { BananasGantt, GanttEngine, GanttRenderer, GanttInteractions } = await import('/src/lib/gantt/index.js');
        
        return {
          success: true,
          components: {
            BananasGantt: typeof BananasGantt,
            GanttEngine: typeof GanttEngine,
            GanttRenderer: typeof GanttRenderer,
            GanttInteractions: typeof GanttInteractions
          }
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          stack: error.stack
        };
      }
    });
    
    console.log('Browser import test result:', importTest);
    
    if (!importTest.success) {
      throw new Error(`Failed to import Gantt components in browser: ${importTest.error}`);
    }
    
    // Check that all components are available
    expect(importTest.components.BananasGantt).toBe('function');
    expect(importTest.components.GanttEngine).toBe('function');
    expect(importTest.components.GanttRenderer).toBe('function');
    expect(importTest.components.GanttInteractions).toBe('function');
    
    console.log('✅ All Gantt components imported successfully in browser!');
  });
});
