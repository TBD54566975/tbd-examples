import { test, expect } from '@playwright/test';

test.describe('Vanilla Router', () => {
    test('should navigate to Home', async ({ page }) => {
        await page.goto('http://localhost:5173/');
        expect(await page.textContent('h1')).toBe('Home');
    });

    test('should navigate to About', async ({ page }) => {
        await page.goto('http://localhost:5173/about');
        expect(await page.textContent('h1')).toBe('DWA Starter Vanilla');
    });

    test('should navigate to Settings', async ({ page }) => {
        await page.goto('http://localhost:5173/settings');
        expect(await page.textContent('h1')).toBe('Settings');
    });

    test('should show Not Found for undefined routes', async ({ page }) => {
        await page.goto('http://localhost:5173/undefined-route');
        expect(await page.textContent('h1')).toBe('404 - Page Not Found');
    });
});

test.describe('Theme Toggle Functionality', () => {
    test('should toggle dark mode and remember preference', async ({ page }) => {
        await page.goto('http://localhost:5173/');
        
        // Check initial state
        const initialIsDarkMode = await page.evaluate(() => document.documentElement.classList.contains('dark'));
        
        // Toggle the theme
        await page.click('#theme-toggle');
        
        // Verify that the theme was toggled
        const isDarkModeAfterToggle = await page.evaluate(() => document.documentElement.classList.contains('dark'));
        expect(isDarkModeAfterToggle).toBe(!initialIsDarkMode);
        
        // Reload the page to check if preference is remembered
        await page.reload();
        const isDarkModeAfterReload = await page.evaluate(() => document.documentElement.classList.contains('dark'));
        expect(isDarkModeAfterReload).toBe(isDarkModeAfterToggle);
    });

    test('should load with correct theme based on system preference when no localStorage is set', async ({ page }) => {
        // Clear localStorage
        await page.evaluate(() => localStorage.removeItem('theme'));

        await page.goto('http://localhost:5173/');

        // Get system preference
        const prefersDarkMode = await page.evaluate(() => window.matchMedia('(prefers-color-scheme: dark)').matches);

        // Check if the page loads with the correct theme based on system preference
        const isDarkMode = await page.evaluate(() => document.documentElement.classList.contains('dark'));
        expect(isDarkMode).toBe(prefersDarkMode);
    });

    test('should persist theme across different routes', async ({ page }) => {
        await page.goto('http://localhost:5173/');
        
        // Toggle to dark mode
        await page.click('#theme-toggle');
        const isDarkMode = await page.evaluate(() => document.documentElement.classList.contains('dark'));
        expect(isDarkMode).toBe(true);

        // Navigate to a different route
        await page.goto('http://localhost:5173/about');
        const isDarkModeOnNewRoute = await page.evaluate(() => document.documentElement.classList.contains('dark'));
        expect(isDarkModeOnNewRoute).toBe(true);
    });
});
