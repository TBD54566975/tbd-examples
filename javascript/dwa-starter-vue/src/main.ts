import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { registerSW } from 'virtual:pwa-register'

import App from '@/App.vue'
import { router } from '@/router'

const app = createApp(App)

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

app.use(createPinia())
app.use(router)
app.mount('#app')
