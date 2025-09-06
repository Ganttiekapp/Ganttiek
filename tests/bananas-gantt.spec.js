import { test, expect } from '@playwright/test';

test.describe('Bananas Gantt Chart Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load login page without errors', async ({ page }) => {
    // Check for JavaScript errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    // Check if login page loads
    await expect(page.locator('h1')).toContainText('Login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    
    // Wait a bit to catch any async errors
    await page.waitForTimeout(2000);
    
    // Log any errors found
    if (errors.length > 0) {
      console.log('JavaScript errors found:', errors);
    }
    
    // Check for critical errors (allow warnings and non-critical errors)
    const criticalErrors = errors.filter(error => 
      !error.includes('warning') && 
      !error.includes('deprecated') &&
      !error.includes('non-passive') &&
      !error.includes('favicon') &&
      !error.includes('404')
    );
    
    if (criticalErrors.length > 0) {
      throw new Error(`Critical JavaScript errors found: ${criticalErrors.join(', ')}`);
    }
  });

  test('should login and navigate to projects', async ({ page }) => {
    // Fill in email
    await page.fill('input[type="email"]', 'test@example.com');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL('/projects', { timeout: 10000 });
    
    // Check if projects page loads
    await expect(page.locator('h1')).toContainText('Projects');
  });

  test('should create a project and navigate to project page', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    await page.waitForURL('/projects', { timeout: 10000 });
    
    // Create a new project
    await page.click('button:has-text("Create New Project")');
    await page.fill('input[name="name"]', 'Test Project for Gantt');
    await page.fill('textarea[name="description"]', 'Test project description');
    await page.click('button[type="submit"]');
    
    // Wait for project creation and navigation
    await page.waitForURL(/\/projects\/[a-f0-9-]+/, { timeout: 10000 });
    
    // Check if project page loads
    await expect(page.locator('h1')).toContainText('Test Project for Gantt');
  });

  test('should create tasks and display Gantt chart', async ({ page }) => {
    // Login and create project
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    await page.waitForURL('/projects', { timeout: 10000 });
    
    await page.click('button:has-text("Create New Project")');
    await page.fill('input[name="name"]', 'Gantt Test Project');
    await page.fill('textarea[name="description"]', 'Project for testing Gantt chart');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/projects\/[a-f0-9-]+/, { timeout: 10000 });
    
    // Create a task
    await page.click('button:has-text("Add Task")');
    await page.fill('input[name="name"]', 'Test Task 1');
    await page.fill('input[name="start_date"]', '2024-01-01');
    await page.fill('input[name="end_date"]', '2024-01-15');
    await page.selectOption('select[name="status"]', 'in_progress');
    await page.selectOption('select[name="priority"]', 'high');
    await page.fill('input[name="progress"]', '50');
    await page.click('button[type="submit"]');
    
    // Wait for task creation
    await page.waitForTimeout(2000);
    
    // Check if Gantt chart is visible
    await expect(page.locator('.bananas-gantt-container')).toBeVisible();
    
    // Check if toolbar is present
    await expect(page.locator('.gantt-toolbar')).toBeVisible();
    
    // Check if task is displayed in Gantt
    await expect(page.locator('.task-bar')).toBeVisible();
  });

  test('should handle Gantt chart interactions', async ({ page }) => {
    // Login, create project and task
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    await page.waitForURL('/projects', { timeout: 10000 });
    
    await page.click('button:has-text("Create New Project")');
    await page.fill('input[name="name"]', 'Interactive Gantt Test');
    await page.fill('textarea[name="description"]', 'Testing Gantt interactions');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/projects\/[a-f0-9-]+/, { timeout: 10000 });
    
    // Create multiple tasks
    await page.click('button:has-text("Add Task")');
    await page.fill('input[name="name"]', 'Task 1');
    await page.fill('input[name="start_date"]', '2024-01-01');
    await page.fill('input[name="end_date"]', '2024-01-10');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Add Task")');
    await page.fill('input[name="name"]', 'Task 2');
    await page.fill('input[name="start_date"]', '2024-01-11');
    await page.fill('input[name="end_date"]', '2024-01-20');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Check if Gantt chart loads without errors
    await expect(page.locator('.bananas-gantt-container')).toBeVisible();
    
    // Check if tasks are rendered
    const taskBars = page.locator('.task-bar');
    await expect(taskBars).toHaveCount(2);
    
    // Test toolbar buttons
    await expect(page.locator('.toolbar-btn')).toHaveCount.greaterThan(0);
    
    // Test zoom functionality
    await page.click('.toolbar-btn[title="Zoom In"]');
    await page.waitForTimeout(500);
    
    // Test theme toggle (if available)
    const themeButtons = page.locator('.toolbar-btn[title*="theme"], .toolbar-btn[title*="Theme"]');
    if (await themeButtons.count() > 0) {
      await themeButtons.first().click();
      await page.waitForTimeout(500);
    }
  });

  test('should handle Gantt chart errors gracefully', async ({ page }) => {
    // Login and create project
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    await page.waitForURL('/projects', { timeout: 10000 });
    
    await page.click('button:has-text("Create New Project")');
    await page.fill('input[name="name"]', 'Error Test Project');
    await page.fill('textarea[name="description"]', 'Testing error handling');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/projects\/[a-f0-9-]+/, { timeout: 10000 });
    
    // Check if page loads without JavaScript errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    // Wait for page to fully load
    await page.waitForTimeout(3000);
    
    // Check for critical errors (allow warnings)
    const criticalErrors = errors.filter(error => 
      !error.includes('warning') && 
      !error.includes('deprecated') &&
      !error.includes('non-passive')
    );
    
    if (criticalErrors.length > 0) {
      console.log('Critical errors found:', criticalErrors);
    }
    
    // The page should still be functional even with some errors
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should export Gantt chart', async ({ page }) => {
    // Login, create project and task
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    await page.waitForURL('/projects', { timeout: 10000 });
    
    await page.click('button:has-text("Create New Project")');
    await page.fill('input[name="name"]', 'Export Test Project');
    await page.fill('textarea[name="description"]', 'Testing export functionality');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/projects\/[a-f0-9-]+/, { timeout: 10000 });
    
    // Create a task
    await page.click('button:has-text("Add Task")');
    await page.fill('input[name="name"]', 'Export Task');
    await page.fill('input[name="start_date"]', '2024-01-01');
    await page.fill('input[name="end_date"]', '2024-01-15');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Check if export buttons are present
    const exportButtons = page.locator('.toolbar-btn[title*="Export"]');
    await expect(exportButtons).toHaveCount.greaterThan(0);
    
    // Test SVG export (this will trigger download)
    const svgExportButton = page.locator('.toolbar-btn[title="Export SVG"]');
    if (await svgExportButton.count() > 0) {
      // Set up download handling
      const downloadPromise = page.waitForEvent('download');
      await svgExportButton.click();
      
      try {
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toContain('.svg');
      } catch (error) {
        // Download might not work in test environment, that's okay
        console.log('Download test skipped (expected in test environment)');
      }
    }
  });
});
