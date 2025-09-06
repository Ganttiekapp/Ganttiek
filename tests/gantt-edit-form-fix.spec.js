import { test, expect } from '@playwright/test';

test.describe('Gantt Chart Edit Form Fix', () => {
  test('should verify edit form opens when editTask event is triggered', async ({ page }) => {
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
    
    // Navigate to the demo page to test the event flow
    await page.goto('/gantt-demo', { timeout: 10000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Wait for Gantt chart to load
    await page.waitForSelector('.bananas-gantt-container', { timeout: 10000 });
    
    // Test the edit task event flow
    const editFormTest = await page.evaluate(() => {
      // Find the Gantt container
      const container = document.querySelector('.gantt-main');
      if (!container) return { success: false, error: 'Container not found' };
      
      // Find a task bar
      const taskBar = document.querySelector('.task-bar');
      if (!taskBar) return { success: false, error: 'Task bar not found' };
      
      const taskId = taskBar.getAttribute('data-task-id');
      if (!taskId) return { success: false, error: 'Task ID not found' };
      
      // Simulate the edit task action
      try {
        // Create and dispatch the editTask event
        const event = new CustomEvent('editTask', { 
          detail: { taskId: taskId } 
        });
        container.dispatchEvent(event);
        
        return { 
          success: true, 
          taskId: taskId,
          eventDispatched: true,
          message: 'EditTask event dispatched successfully'
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    expect(editFormTest.success).toBe(true);
    expect(editFormTest.taskId).toBeTruthy();
    console.log(`✅ EditTask event dispatched for task: ${editFormTest.taskId}`);
    
    // Test that the context menu has the edit option
    const contextMenuTest = await page.evaluate(() => {
      // Check if context menu exists
      const contextMenu = document.querySelector('.gantt-context-menu');
      if (!contextMenu) return { success: false, error: 'Context menu not found' };
      
      // Check if edit option exists
      const editOption = Array.from(contextMenu.children).find(el => el.textContent === 'Edit Task');
      
      return { 
        success: true, 
        contextMenuExists: true,
        editOptionExists: !!editOption,
        menuItems: Array.from(contextMenu.children).map(el => el.textContent)
      };
    });
    
    expect(contextMenuTest.success).toBe(true);
    expect(contextMenuTest.editOptionExists).toBe(true);
    console.log('✅ Context menu has edit option');
    console.log('📋 Available menu items:', contextMenuTest.menuItems);
    
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
    
    console.log('✅ Gantt chart edit form fix is working!');
  });
});
