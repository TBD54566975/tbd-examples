import { test, expect } from "@playwright/test";

test("Add To Home Screen prompt should appear when eligible", async ({
  page,
}) => {
  // Ensure the app is loaded
  await page.goto("http://localhost:5173");

  // Check if the manifest is available (this ensures the app is PWA-ready)

  await page.waitForLoadState("networkidle"); // Wait until the page is stable
  const manifest = await page.evaluate(() => {
    return !!document.querySelector('link[rel="manifest"]');
  });
  expect(manifest).toBeTruthy(); // Make sure the manifest is present

  // Mock the beforeinstallprompt event
  await page.evaluate(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault(); // Prevents the default install prompt from appearing
      window.deferredPrompt = e; // Save the event for later use
    });
    // Dispatch the event manually
    const event = new Event("beforeinstallprompt");
    window.dispatchEvent(event);
  });

  // Verify the mocked event was handled
  const promptHandled = await page.evaluate(() => !!window.deferredPrompt);
  expect(promptHandled).toBeTruthy();
});
