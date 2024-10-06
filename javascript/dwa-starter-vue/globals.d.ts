declare module 'vite-plugin-node-stdlib-browser' {
  const nodePolyfills: any
  export default nodePolyfills
}

declare module 'virtual:pwa-register' {
  export function registerSW(options?: {
    immediate?: boolean
    onNeedRefresh?: () => void
    onOfflineReady?: () => void
    onRegistered?: (registration: ServiceWorkerRegistration) => void
    onRegisterError?: (error: any) => void
  }): (reloadPage?: boolean) => Promise<void>
}
