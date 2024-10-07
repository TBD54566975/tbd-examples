import { createWebHistory, createRouter } from 'vue-router'


import AboutView from '@/views/AboutView.vue'
import HomeView from '@/views/HomeView.vue'
import SettingsView from '@/views/SettingsView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomeView },
    { path: '/about', component: AboutView },
    { path: '/settings', component: SettingsView },
    { path: '/:pathMatch(.*)*', component: NotFoundView }
  ]
})
