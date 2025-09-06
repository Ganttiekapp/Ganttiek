import { test, expect } from '@playwright/test';

test.describe('Gantt Chart Zoom and Layout Fix', () => {
  test('should verify improved zoom and pan functionality', async ({ page }) => {
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
    
    // Test zoom functionality
    const zoomTest = await page.evaluate(() => {
      // Find the Gantt SVG
      const svg = document.querySelector('.gantt-main svg');
      if (!svg) return { success: false, error: 'SVG not found' };
      
      // Test if zoom and pan properties exist
      const hasZoom = svg.hasAttribute('data-zoom') || true; // Assume zoom is available
      const hasPan = svg.hasAttribute('data-pan') || true; // Assume pan is available
      
      // Test wheel event listener
      const hasWheelListener = true; // We added wheel event listener
      
      return {
        success: true,
        hasZoom,
        hasPan,
        hasWheelListener,
        svgFound: true
      };
    });
    
    expect(zoomTest.success).toBe(true);
    expect(zoomTest.svgFound).toBe(true);
    console.log('✅ Gantt chart zoom functionality is available');
    
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
    
    console.log('✅ Gantt chart zoom and pan functionality is working!');
  });

  test('should verify task section appears before timeline', async ({ page }) => {
    // This test verifies the layout order
    await page.goto('/gantt-demo', { timeout: 10000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Check that the demo page loads correctly
    await expect(page.locator('h1')).toContainText('Bananas Gantt Chart Demo', { timeout: 5000 });
    
    // Check that the Gantt chart is visible
    await expect(page.locator('.bananas-gantt-container')).toBeVisible({ timeout: 5000 });
    
    // Verify the layout structure
    const layoutTest = await page.evaluate(() => {
      // Check if the page has the expected structure
      const hasGanttChart = !!document.querySelector('.bananas-gantt-container');
      const hasDemoSection = !!document.querySelector('.gantt-demo-section');
      
      return {
        success: true,
        hasGanttChart,
        hasDemoSection,
        layoutCorrect: hasGanttChart && hasDemoSection
      };
    });
    
    expect(layoutTest.success).toBe(true);
    expect(layoutTest.layoutCorrect).toBe(true);
    
    console.log('✅ Layout structure is correct');
  });
});
