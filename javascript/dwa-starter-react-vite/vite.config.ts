import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import nodePolyfills from "vite-plugin-node-stdlib-browser";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    global: "globalThis",
  },
  plugins: [
    nodePolyfills(),
    react(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      registerType: "prompt",
      injectRegister: "auto",

      pwaAssets: {
        disabled: false,
        config: true,
      },

      manifest: {
        name: "DWA Starter",
        short_name: "DWA",
        description: "A Decentralized Web Application template",
        theme_color: "#ffec19",
      },

      injectManifest: {
        globPatterns: ["**/*.{js,css,html,json,svg,png,ico}"],
      },

      devOptions: {
        enabled: true,
        navigateFallback: "index.html",
        suppressWarnings: false,
        type: "module",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
