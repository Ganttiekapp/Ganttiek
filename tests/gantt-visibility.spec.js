import { test, expect } from '@playwright/test';

test.describe('Gantt Chart Visibility', () => {
  test('should verify Gantt chart is actually visible and functional', async ({ page }) => {
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
    
    // Check if the page loads correctly
    await expect(page.locator('h1')).toContainText('Bananas Gantt Chart Demo', { timeout: 5000 });
    
    // Wait for the Gantt chart to be rendered
    await page.waitForSelector('.bananas-gantt-container', { timeout: 10000 });
    await expect(page.locator('.bananas-gantt-container')).toBeVisible({ timeout: 5000 });
    
    // Check if the main chart SVG element is present (not toolbar icons)
    // The main chart SVG should be in the gantt-main container
    const chartSvg = page.locator('.gantt-main svg');
    await expect(chartSvg).toBeVisible({ timeout: 5000 });
    
    // Check if the chart has content (width and height)
    const svgBox = await chartSvg.boundingBox();
    expect(svgBox).toBeTruthy();
    expect(svgBox.width).toBeGreaterThan(100); // Should be much larger than toolbar icons
    expect(svgBox.height).toBeGreaterThan(100);
    
    // Check if the demo info is displayed
    await expect(page.locator('.demo-info')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Features Demonstrated:')).toBeVisible({ timeout: 5000 });
    
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
    
    console.log('✅ Gantt chart is visible and functional!');
    console.log(`📊 Chart dimensions: ${svgBox.width}x${svgBox.height}px`);
  });
});
