import { test, expect } from '@playwright/test';

test('Check if "Hello, world!" is rendered', async ({ page }) => {
  // Navigate to the base URL specified in the Playwright config
  await page.goto('/');
  
  // Check for the text
  const content = await page.textContent('h1');
  expect(content).toBe('Hello, world!');
});