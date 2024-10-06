import { defineConfig } from '@playwright/test';


export default defineConfig({
  testDir: './tests',  // Specifies where your test files are located
  use: {
    baseURL: 'http://localhost:5173', // Update this to match your Vite server URL
  },
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});