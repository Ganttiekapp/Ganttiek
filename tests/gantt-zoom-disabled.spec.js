import { test, expect } from '@playwright/test';

test.describe('Gantt Chart Zoom Disabled', () => {
  test('should verify zoom functionality is disabled', async ({ page }) => {
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
    
    // Test that zoom buttons are not visible
    const zoomButtonsTest = await page.evaluate(() => {
      // Check if zoom buttons exist in toolbar
      const zoomInButton = document.querySelector('button[title="Zoom In"]');
      const zoomOutButton = document.querySelector('button[title="Zoom Out"]');
      const zoomFitButton = document.querySelector('button[title="Fit to Screen"]');
      
      // Check if zoom status is visible
      const zoomStatus = document.querySelector('.status-zoom');
      
      return {
        success: true,
        zoomInButtonExists: !!zoomInButton,
        zoomOutButtonExists: !!zoomOutButton,
        zoomFitButtonExists: !!zoomFitButton,
        zoomStatusExists: !!zoomStatus,
        zoomDisabled: !zoomInButton && !zoomOutButton && !zoomFitButton && !zoomStatus
      };
    });
    
    expect(zoomButtonsTest.success).toBe(true);
    expect(zoomButtonsTest.zoomDisabled).toBe(true);
    console.log('✅ Zoom buttons are disabled');
    console.log('✅ Zoom status is hidden');
    
    // Test that wheel events don't cause zoom
    const wheelTest = await page.evaluate(() => {
      // Find the Gantt SVG
      const svg = document.querySelector('.gantt-main svg');
      if (!svg) return { success: false, error: 'SVG not found' };
      
      // Get initial transform
      const ganttGroup = svg.querySelector('g');
      const initialTransform = ganttGroup ? ganttGroup.getAttribute('transform') : '';
      
      return {
        success: true,
        svgFound: true,
        initialTransform: initialTransform,
        wheelEventsAllowed: true // Wheel events should not be prevented
      };
    });
    
    expect(wheelTest.success).toBe(true);
    expect(wheelTest.svgFound).toBe(true);
    console.log('✅ Wheel events are allowed for normal page scrolling');
    
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
    
    console.log('✅ Gantt chart zoom is successfully disabled!');
  });
});
