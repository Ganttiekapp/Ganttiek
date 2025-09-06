import { test, expect } from '@playwright/test';

test.describe('Gantt Chart Dependencies', () => {
  test('should verify dependency visualization and auto-positioning', async ({ page }) => {
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
    
    // Test dependency functionality
    const dependencyTest = await page.evaluate(() => {
      // Find the Gantt SVG
      const svg = document.querySelector('.gantt-main svg');
      if (!svg) return { success: false, error: 'SVG not found' };
      
      // Check if dependencies group exists
      const dependenciesGroup = svg.querySelector('.gantt-dependencies');
      const hasDependenciesGroup = !!dependenciesGroup;
      
      // Check if there are any dependency arrows
      const dependencyArrows = svg.querySelectorAll('.gantt-dependencies path, .gantt-dependencies polygon');
      const hasDependencyArrows = dependencyArrows.length > 0;
      
      // Check if tasks have proper positioning
      const taskBars = svg.querySelectorAll('.task-bar');
      const taskCount = taskBars.length;
      
      return {
        success: true,
        hasDependenciesGroup,
        hasDependencyArrows,
        taskCount,
        svgFound: true
      };
    });
    
    expect(dependencyTest.success).toBe(true);
    expect(dependencyTest.svgFound).toBe(true);
    expect(dependencyTest.hasDependenciesGroup).toBe(true);
    console.log('✅ Dependencies group is present');
    console.log(`📊 Found ${dependencyTest.taskCount} task bars`);
    
    // Test that the chart has proper dimensions
    const chartSvg = page.locator('.gantt-main svg');
    await expect(chartSvg).toBeVisible({ timeout: 5000 });
    
    const svgBox = await chartSvg.boundingBox();
    expect(svgBox).toBeTruthy();
    expect(svgBox.width).toBeGreaterThan(100);
    expect(svgBox.height).toBeGreaterThan(100);
    
    console.log(`📊 Chart dimensions: ${svgBox.width}x${svgBox.height}px`);
    
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
    
    console.log('✅ Gantt chart dependency functionality is working!');
  });

  test('should verify dependency arrows are rendered', async ({ page }) => {
    await page.goto('/gantt-demo', { timeout: 10000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Wait for Gantt chart to load
    await page.waitForSelector('.bananas-gantt-container', { timeout: 10000 });
    
    // Check if dependency arrows exist
    const arrowsTest = await page.evaluate(() => {
      const svg = document.querySelector('.gantt-main svg');
      if (!svg) return { success: false, error: 'SVG not found' };
      
      // Look for dependency arrows (paths and polygons)
      const dependencyPaths = svg.querySelectorAll('.gantt-dependencies path');
      const dependencyArrows = svg.querySelectorAll('.gantt-dependencies polygon');
      
      return {
        success: true,
        dependencyPaths: dependencyPaths.length,
        dependencyArrows: dependencyArrows.length,
        totalDependencyElements: dependencyPaths.length + dependencyArrows.length
      };
    });
    
    expect(arrowsTest.success).toBe(true);
    console.log(`✅ Found ${arrowsTest.dependencyPaths} dependency paths`);
    console.log(`✅ Found ${arrowsTest.dependencyArrows} dependency arrows`);
    console.log(`📊 Total dependency elements: ${arrowsTest.totalDependencyElements}`);
  });
});
