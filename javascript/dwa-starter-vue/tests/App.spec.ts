import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { nextTick } from 'vue'
import { useColorMode } from '@vueuse/core'
import { createPinia } from 'pinia'

import App from '../src/App.vue'
import HomeView from '../src/views/HomeView.vue'
import AboutView from '../src/views/AboutView.vue'
import SettingsView from '../src/views/SettingsView.vue'
import NotFoundView from '../src/views/NotFoundView.vue'
import Sidebar from '../src/components/Sidebar.vue'

// Create a router for testing
const routes = [
  { path: '/', component: HomeView },
  { path: '/about', component: AboutView },
  { path: '/settings', component: SettingsView },
  { path: '/:pathMatch(.*)*', component: NotFoundView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

describe('App', () => {
  let wrapper

  // inside your describe block
  let pinia

  beforeEach(() => {
    pinia = createPinia() // Create a Pinia instance
    wrapper = mount(App, {
      global: {
        plugins: [pinia, router] // Add Pinia as a global plugin
      }
    })
  })

  it('renders Sidebar component', () => {
    expect(wrapper.findComponent(Sidebar).exists()).toBe(true) // Check if Sidebar is rendered
  })

  it('renders the HomeView on the home route', async () => {
    await router.push('/')
    await nextTick()

    expect(wrapper.text()).toContain('DWA Starter Vue!') // Check if HomeView content is rendered
  })

  it('renders the AboutView on the about route', async () => {
    await router.push('/about')
    await nextTick()

    expect(wrapper.text()).toContain("Decentralized Web App: it's a Web5 Progressive Web App.") // Check if AboutView content is rendered
  })

  it('renders the SettingsView on the settings route', async () => {
    await router.push('/settings')
    await nextTick()

    expect(wrapper.text()).toContain('Settings') // Check if SettingsView content is rendered
  })

  it('renders the 404 NotFound page on an unknown route', async () => {
    await router.push('/non-existing-page')
    await nextTick()

    expect(wrapper.text()).toContain('404 - Page Not Found') // Check if the 404 page is rendered
  })

  // Dark mode
  it('toggles between dark, light, and system modes directly', async () => {
    const colorMode = useColorMode()

    // Set to light mode and check
    colorMode.value = 'light'
    await nextTick()

    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('vueuse-color-scheme')).toBe('light')

    // Set to dark mode and check
    colorMode.value = 'dark'
    await nextTick()

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('vueuse-color-scheme')).toBe('dark')

    // Set to auto mode and check
    colorMode.value = 'auto'
    await nextTick()

    expect(localStorage.getItem('vueuse-color-scheme')).toBe('auto')
  })
})
