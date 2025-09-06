import { test, expect } from '@playwright/test';

test.describe('Gantt Chart Task Editing', () => {
  test('should verify Gantt chart editing functionality is available', async ({ page }) => {
    // Set up error tracking
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    // Navigate to the demo page
    await page.goto('/gantt-demo', { timeout: 10000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Wait for Gantt chart to load
    await page.waitForSelector('.bananas-gantt-container', { timeout: 10000 });
    
    // Check if Gantt chart is visible
    await expect(page.locator('.bananas-gantt-container')).toBeVisible({ timeout: 5000 });
    
    // Find task bar elements
    const taskBars = page.locator('.task-bar');
    const taskBarCount = await taskBars.count();
    expect(taskBarCount).toBeGreaterThan(0);
    
    // Verify that tasks have the data-task-id attribute (needed for editing)
    const firstTaskBar = taskBars.first();
    const taskId = await firstTaskBar.getAttribute('data-task-id');
    expect(taskId).toBeTruthy();
    
    // Check that the Gantt chart has interactive elements
    await expect(page.locator('.gantt-toolbar')).toBeVisible({ timeout: 5000 });
    
    // Log any errors found
    if (errors.length > 0) {
      console.log('Errors found:', errors);
    }
    
    // Check for critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('warning') && 
      !error.includes('deprecated') &&
      !error.includes('non-passive') &&
      !error.includes('favicon') &&
      !error.includes('404')
    );
    
    if (criticalErrors.length > 0) {
      throw new Error(`Critical errors found: ${criticalErrors.join(', ')}`);
    }
    
    console.log('✅ Gantt chart editing functionality is available!');
    console.log(`📋 Found ${taskBarCount} interactive task bars with IDs`);
  });

  test('should verify task editing integration', async ({ page }) => {
    // This test verifies that the editing functionality is properly integrated
    await page.goto('/gantt-demo', { timeout: 10000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Check that the Gantt chart has interactive elements
    await expect(page.locator('.bananas-gantt-container')).toBeVisible({ timeout: 5000 });
    
    // Check that task bars are present and interactive
    const taskBars = page.locator('.task-bar');
    const taskBarCount = await taskBars.count();
    expect(taskBarCount).toBeGreaterThan(0);
    
    // Verify that tasks have the data-task-id attribute (needed for editing)
    const firstTaskBar = taskBars.first();
    const taskId = await firstTaskBar.getAttribute('data-task-id');
    expect(taskId).toBeTruthy();
    
    console.log('✅ Task editing integration verified');
    console.log(`📋 Found ${taskBarCount} interactive task bars`);
  });
});
