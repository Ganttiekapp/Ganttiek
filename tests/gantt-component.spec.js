import { test, expect } from '@playwright/test';

test.describe('Gantt Component Import Test', () => {
  test('should load page and check for Gantt component errors', async ({ page }) => {
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
      error.includes('Failed to load')
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
  });

  test('should check for module import errors', async ({ page }) => {
    // Navigate to the page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Inject a script to test Gantt component import
    const importTest = await page.evaluate(async () => {
      try {
        // Try to import the Gantt components from individual files
        const ganttEngineModule = await import('/src/lib/gantt/GanttEngine.js');
        const ganttRendererModule = await import('/src/lib/gantt/GanttRenderer.js');
        const ganttInteractionsModule = await import('/src/lib/gantt/GanttInteractions.js');
        const bananasGanttModule = await import('/src/lib/gantt/BananasGantt.svelte');
        
        const GanttEngine = ganttEngineModule.GanttEngine;
        const GanttRenderer = ganttRendererModule.GanttRenderer;
        const GanttInteractions = ganttInteractionsModule.GanttInteractions;
        const BananasGantt = bananasGanttModule.default;
        
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
    
    console.log('Import test result:', importTest);
    
    if (!importTest.success) {
      throw new Error(`Failed to import Gantt components: ${importTest.error}`);
    }
    
    // Check that all components are functions/classes (BananasGantt is a Svelte component function)
    expect(importTest.components.BananasGantt).toBe('function');
    expect(importTest.components.GanttEngine).toBe('function');
    expect(importTest.components.GanttRenderer).toBe('function');
    expect(importTest.components.GanttInteractions).toBe('function');
  });

  test('should test Gantt engine creation', async ({ page }) => {
    // Navigate to the page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test creating a Gantt engine
    const engineTest = await page.evaluate(async () => {
      try {
        const ganttEngineModule = await import('/src/lib/gantt/GanttEngine.js');
        const GanttEngine = ganttEngineModule.GanttEngine;
        
        // Create a new engine instance
        const engine = new GanttEngine({
          timeScale: 'day',
          workingDays: [1, 2, 3, 4, 5]
        });
        
        // Test adding a task
        const task = engine.addTask({
          id: 'test-task',
          name: 'Test Task',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-15'),
          progress: 50,
          status: 'in_progress'
        });
        
        // Test getting tasks
        const tasks = engine.getTasks();
        
        return {
          success: true,
          engineCreated: !!engine,
          taskAdded: !!task,
          tasksCount: tasks.length,
          taskData: task
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          stack: error.stack
        };
      }
    });
    
    console.log('Engine test result:', engineTest);
    
    if (!engineTest.success) {
      throw new Error(`Failed to create Gantt engine: ${engineTest.error}`);
    }
    
    expect(engineTest.engineCreated).toBe(true);
    expect(engineTest.taskAdded).toBe(true);
    expect(engineTest.tasksCount).toBe(1);
    expect(engineTest.taskData.name).toBe('Test Task');
  });
});
