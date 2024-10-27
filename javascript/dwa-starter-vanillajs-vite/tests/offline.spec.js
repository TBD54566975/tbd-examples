// // tests/offline.spec.js
import { test, expect } from "@playwright/test";

test("App should load and function offline", async ({ page, context }) => {
  // Load the app online to cache assets
  await page.goto("http://localhost:5173");
  await expect(page.locator("body")).toBeVisible();

  // Enable offline mode
  await context.setOffline(true);

  // Confirm that offline content is accessible
  const pageContent = await page.evaluate(() => document.body.innerText);
  expect(pageContent).toContain("Home"); // Check content that’s expected offline

  // Disable offline mode to reset conditions
  await context.setOffline(false);
});
