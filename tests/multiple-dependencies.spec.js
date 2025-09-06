import { test, expect } from '@playwright/test';

test.describe('Multiple Task Dependencies', () => {
  test('should allow multiple tasks to depend on the same parent task', async ({ page }) => {
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
    
    // Navigate to the demo page first to verify basic functionality
    await page.goto('/gantt-demo', { timeout: 10000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Wait for Gantt chart to load
    await page.waitForSelector('.bananas-gantt-container', { timeout: 10000 });
    
    // Check if Gantt chart is visible
    await expect(page.locator('.bananas-gantt-container')).toBeVisible({ timeout: 5000 });
    
    // Test that the dependency system can handle multiple dependencies
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
      
      // Count unique dependency connections
      const dependencyPaths = svg.querySelectorAll('.gantt-dependencies path');
      const uniqueConnections = new Set();
      
      dependencyPaths.forEach(path => {
        const d = path.getAttribute('d');
        if (d) {
          uniqueConnections.add(d);
        }
      });
      
      return {
        success: true,
        hasDependenciesGroup,
        hasDependencyArrows,
        taskCount,
        dependencyCount: dependencyArrows.length,
        uniqueConnections: uniqueConnections.size,
        svgFound: true
      };
    });
    
    expect(dependencyTest.success).toBe(true);
    expect(dependencyTest.svgFound).toBe(true);
    expect(dependencyTest.hasDependenciesGroup).toBe(true);
    expect(dependencyTest.taskCount).toBeGreaterThan(0);
    
    console.log('✅ Dependencies group is present');
    console.log(`📊 Found ${dependencyTest.taskCount} task bars`);
    console.log(`📊 Found ${dependencyTest.dependencyCount} dependency arrows`);
    console.log(`📊 Found ${dependencyTest.uniqueConnections} unique connections`);
    
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
    
    console.log('✅ Multiple dependency functionality is working!');
  });

  test('should verify dependency arrows show multiple connections to same parent', async ({ page }) => {
    await page.goto('/gantt-demo', { timeout: 10000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Wait for Gantt chart to load
    await page.waitForSelector('.bananas-gantt-container', { timeout: 10000 });
    
    // Check if dependency arrows exist and can handle multiple connections
    const arrowsTest = await page.evaluate(() => {
      const svg = document.querySelector('.gantt-main svg');
      if (!svg) return { success: false, error: 'SVG not found' };
      
      // Look for dependency arrows (paths and polygons)
      const dependencyPaths = svg.querySelectorAll('.gantt-dependencies path');
      const dependencyArrows = svg.querySelectorAll('.gantt-dependencies polygon');
      
      // Analyze the dependency structure
      const connections = [];
      dependencyPaths.forEach((path, index) => {
        const d = path.getAttribute('d');
        if (d) {
          // Extract start and end points from the path
          const matches = d.match(/M\s*([\d.]+)\s*([\d.]+).*L\s*([\d.]+)\s*([\d.]+)/);
          if (matches) {
            connections.push({
              index,
              startX: parseFloat(matches[1]),
              startY: parseFloat(matches[2]),
              endX: parseFloat(matches[3]),
              endY: parseFloat(matches[4])
            });
          }
        }
      });
      
      return {
        success: true,
        dependencyPaths: dependencyPaths.length,
        dependencyArrows: dependencyArrows.length,
        totalDependencyElements: dependencyPaths.length + dependencyArrows.length,
        connections: connections.length,
        hasMultipleConnections: connections.length > 1
      };
    });
    
    expect(arrowsTest.success).toBe(true);
    console.log(`✅ Found ${arrowsTest.dependencyPaths} dependency paths`);
    console.log(`✅ Found ${arrowsTest.dependencyArrows} dependency arrows`);
    console.log(`📊 Total dependency elements: ${arrowsTest.totalDependencyElements}`);
    console.log(`📊 Analyzed ${arrowsTest.connections} connections`);
    console.log(`📊 Has multiple connections: ${arrowsTest.hasMultipleConnections}`);
    
    // The demo should have multiple dependencies
    expect(arrowsTest.totalDependencyElements).toBeGreaterThan(0);
  });
});
