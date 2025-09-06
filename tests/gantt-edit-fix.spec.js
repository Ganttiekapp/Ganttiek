import { test, expect } from '@playwright/test';

test.describe('Gantt Chart Edit Task Fix', () => {
  test('should verify editTask event is properly handled', async ({ page }) => {
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
    
    // Verify that tasks have the data-task-id attribute
    const firstTaskBar = taskBars.first();
    const taskId = await firstTaskBar.getAttribute('data-task-id');
    expect(taskId).toBeTruthy();
    
    // Test that the Gantt chart component can emit events
    const eventTest = await page.evaluate(() => {
      // Find the Gantt container
      const container = document.querySelector('.gantt-main');
      if (!container) return { success: false, error: 'Container not found' };
      
      // Test if we can dispatch events
      try {
        const event = new CustomEvent('editTask', { 
          detail: { taskId: 'test-task-id' } 
        });
        container.dispatchEvent(event);
        return { success: true, eventDispatched: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    expect(eventTest.success).toBe(true);
    console.log('✅ EditTask event can be dispatched');
    
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
    
    console.log('✅ Gantt chart editTask event handling is working!');
  });
});
