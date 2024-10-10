// tests/router.spec.js
import { test, expect } from '@playwright/test';

test.describe('Vanilla Router', () => {
    // Before all tests, start a local server if necessary

    test('should navigate to Home', async ({ page }) => {
        await page.goto('/');
        expect(await page.textContent('h1')).toBe('Home');
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
});
