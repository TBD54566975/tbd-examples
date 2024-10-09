import { createWebHistory, createRouter } from 'vue-router'

import AboutView from '@/views/AboutView.vue'
import HomeView from '@/views/HomeView.vue'
import SettingsView from '@/views/SettingsView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import { useWeb5Store } from '@/stores/web5'
import { storeToRefs } from 'pinia'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomeView },
    { path: '/about', component: AboutView },
    { path: '/settings', component: SettingsView },
    { path: '/:pathMatch(.*)*', component: NotFoundView }
  ]
})

router.beforeEach((to, _from, next) => {
  const { web5 } = storeToRefs(useWeb5Store())

  if (to.path === '/settings' && !web5.value) {
    return next('/')
  }
  next()
})
