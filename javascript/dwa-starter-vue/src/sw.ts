/// <reference lib="webworker" />
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute
} from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'

import { activatePolyfills } from '@web5/browser'

// Declare Service Worker Global Scope
declare let self: ServiceWorkerGlobalScope

// Listen for the SKIP_WAITING message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting()
})

// Precache and route assets
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

let allowlist
if (import.meta.env.DEV) {
  allowlist = [/^\/$/] // Allowlist for the root URL in development
}

// Register Navigation Route
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html'), { allowlist }))

// Activate polyfills with a Time-To-Live (TTL) of 30 seconds
activatePolyfills({
  onCacheCheck() {
    return {
      ttl: 30000
    }
  }
})
