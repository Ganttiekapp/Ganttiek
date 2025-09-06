import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  // Set a reasonable timeout for all tests in this describe block
  test.setTimeout(30000); // 30 seconds
  test('should display login page correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Check if the page loads correctly
    await expect(page).toHaveTitle(/Login - Ganttiek/);
    
    // Check if the form elements are present
    await expect(page.locator('h1')).toContainText('Login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Send Magic Link');
    
    // Check if the info message is displayed
    await expect(page.locator('.info')).toContainText('We\'ll send you a secure link to sign in without a password');
  });

  test('should display signup page correctly', async ({ page }) => {
    await page.goto('/signup');
    
    // Check if the page loads correctly
    await expect(page).toHaveTitle(/Sign Up - Ganttiek/);
    
    // Check if the form elements are present
    await expect(page.locator('h1')).toContainText('Sign Up');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Create Account');
    
    // Check if the info message is displayed
    await expect(page.locator('.info')).toContainText('We\'ll send you a secure link to create your account without a password');
  });

  test('should have form validation on login', async ({ page }) => {
    await page.goto('/login');
    
    // Check if form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Try to submit without email and check if button is disabled or error appears
    await page.click('button[type="submit"]');
    
    // The form should either show an error or prevent submission
    // Let's check if the page is still on login (no redirect happened)
    await expect(page).toHaveURL('/login');
  });

  test('should have form validation on signup', async ({ page }) => {
    await page.goto('/signup');
    
    // Check if form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Try to submit without email and check if button is disabled or error appears
    await page.click('button[type="submit"]');
    
    // The form should either show an error or prevent submission
    // Let's check if the page is still on signup (no redirect happened)
    await expect(page).toHaveURL('/signup');
  });

  test('should navigate between login and signup pages', async ({ page }) => {
    await page.goto('/login');
    
    // Click on signup link
    await page.click('a[href="/signup"]');
    await expect(page).toHaveURL('/signup');
    
    // Click on login link
    await page.click('a[href="/login"]');
    await expect(page).toHaveURL('/login');
  });
});
