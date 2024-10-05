import { registerSW } from 'virtual:pwa-register'

registerSW({
  onNeedRefresh() {
    console.log('A new service worker is available.')
    const userConfirmed = window.confirm('A new version is available. Do you want to refresh?')
    if (userConfirmed) {
      window.location.reload()
    }
  },
  onOfflineReady() {
    console.log('The app is ready to work offline.')
  }
})
