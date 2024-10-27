// tests/sw.spec.js

import { test, expect } from "@playwright/test";

test("Service worker should be registered and ready on page load", async ({
  page,
}) => {
  // Go to the app's base URL
  await page.goto("http://localhost:5173");

  // Wait for the service worker to register and become active
  const swRegisteredAndActive = await page.evaluate(() => {
    return new Promise((resolve) => {
      navigator.serviceWorker.ready.then((registration) => {
        resolve(!!registration.active);
      });
    });
  });

  // Assert that the service worker is both registered and active
  expect(swRegisteredAndActive).toBeTruthy();
});
