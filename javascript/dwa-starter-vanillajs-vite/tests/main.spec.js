<<<<<<< HEAD
import { test, expect } from '@playwright/test';

test.describe('Vanilla Router with Theme Toggle and Accessibility Checks', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to ensure isolation
    await page.goto('/'); // Ensure starting from your app's root
=======
// tests/main.spec.js
import { test, expect } from '@playwright/test';

test.describe('Vanilla Router with Theme Toggle', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to ensure isolation
    await page.goto('/'); // Make sure you start from your app's root
>>>>>>> bc9da6b0eb7af8bb1bfc744648b064491a500710
    await page.evaluate(() => localStorage.clear());
  });

  test('should navigate to Home and toggle theme', async ({ page }) => {
    await page.goto('/');
    
    // Check the initial theme based on the system preference
    const systemPrefersDark = await page.evaluate(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
    const appliedTheme = await page.evaluate(() => document.body.classList.contains('dark-mode'));
    expect(appliedTheme).toBe(systemPrefersDark);
    
    // Click the theme toggle button
    await page.click('#theme-toggle');
    
    // Check if the theme has changed
    const isDarkModeAfterToggle = await page.evaluate(() => document.body.classList.contains('dark-mode'));
    expect(isDarkModeAfterToggle).toBe(!systemPrefersDark);
    
    // Verify localStorage has the correct theme
    const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(storedTheme).toBe(!systemPrefersDark ? 'dark' : 'light');
  });

  test('should check ARIA labels and alt text on Home', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the main container to be present
    await page.waitForSelector('div[role="main"]');

    // Check ARIA label for the main container
    const mainLabel = await page.getAttribute('div[role="main"]', 'aria-label');
    expect(mainLabel).toBe('Home Page');

    // Check ARIA label for navigation
    const navLabel = await page.getAttribute('nav[role="navigation"]', 'aria-label');
    expect(navLabel).toBe('Main Navigation');

    // Check alt text of the image
    const imageAlt = await page.getAttribute('img', 'alt');
    expect(imageAlt).toBe('A descriptive alt text for the image');
});



  test('should navigate to About', async ({ page }) => {
    await page.goto('/about');
    expect(await page.textContent('h1')).toBe('DWA Starter Vanilla'); 
  });

  test('should navigate to Settings', async ({ page }) => {
    await page.goto('/settings');
    expect(await page.textContent('h1')).toBe('Settings');
  });

  test('should show Not Found for undefined routes', async ({ page }) => {
    await page.goto('/undefined-route');
    expect(await page.textContent('h1')).toBe('404 - Page Not Found');
  });

  test('should load correct theme based on localStorage', async ({ page }) => {
    // Set theme to dark mode
    await page.evaluate(() => localStorage.setItem('theme', 'dark'));
    await page.goto('/');
    
    const isDarkMode = await page.evaluate(() => document.body.classList.contains('dark-mode'));
    expect(isDarkMode).toBe(true);

    // Set theme to light mode
    await page.evaluate(() => localStorage.setItem('theme', 'light'));
    await page.goto('/');
    
    const isLightMode = await page.evaluate(() => document.body.classList.contains('light-mode'));
    expect(isLightMode).toBe(true);
  });

  test('should respect system theme preference if no stored theme', async ({ page }) => {
    await page.goto('/'); // Clear any localStorage state if needed
    await page.evaluate(() => localStorage.removeItem('theme'));
    
    const systemPrefersDark = await page.evaluate(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
    const isDarkMode = await page.evaluate(() => document.body.classList.contains('dark-mode'));
    expect(isDarkMode).toBe(systemPrefersDark);
  });
});
