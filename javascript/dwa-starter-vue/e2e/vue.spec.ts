import { test, expect } from '@playwright/test'

// Test for the home page
test('visits the app root url', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toHaveText('DWA Starter Vue!')
})

// Test for the about page
test('visits the about page', async ({ page }) => {
  await page.goto('/about')
  await expect(page.locator('p').first()).toHaveText(
    "Decentralized Web App: it's a Web5 Progressive Web App."
  )
})

// TODO: mock web5 connection for access to settings page
// // Test for the settings page
// test('visits the settings page', async ({ page }) => {
//   await page.goto('/settings')
//   await expect(page.locator('h1')).toHaveText('Settings')
// })

// Test for the 404 page
test('handles 404 - Page Not Found', async ({ page }) => {
  await page.goto('/non-existing-page') // Navigate to a non-existing page
  await expect(page.locator('h1')).toHaveText('404 - Page Not Found')
})
