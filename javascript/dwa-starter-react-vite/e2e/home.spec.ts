import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/DWA Starter/);
});

test("has heading", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("DWA Starter")).toBeVisible();
});

test("has connect cta", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Connect your DWA to get Started")).toBeVisible();
});
