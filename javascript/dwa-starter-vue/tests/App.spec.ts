import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import App from '../src/App.vue'
import HomeView from '../src/views/HomeView.vue'
import AboutView from '../src/views/AboutView.vue'
import SettingsView from '../src/views/SettingsView.vue'
import NotFoundView from '../src/views/NotFoundView.vue'
import NavMenu from '../src/components/NavMenu.vue'

// Mock local storage
const mockLocalStorage = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value
    },
    clear: () => (store = {})
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

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
  it('renders NavMenu component', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    })
    expect(wrapper.findComponent(NavMenu).exists()).toBe(true) // Check if NavMenu is rendered
  })

  it('renders the HomeView on the home route', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    })

    await router.push('/') // Navigate to home route
    await wrapper.vm.$nextTick() // Wait for the next DOM update

    expect(wrapper.text()).toContain('DWA Starter Vue!') // Check if HomeView content is rendered
  })

  it('renders the AboutView on the about route', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    })

    await router.push('/about') // Navigate to about route
    await wrapper.vm.$nextTick() // Wait for the next DOM update

    expect(wrapper.text()).toContain('This is the about page') // Check if AboutView content is rendered
  })

  it('renders the SettingsView on the settings route', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    })

    await router.push('/settings') // Navigate to settings route
    await wrapper.vm.$nextTick() // Wait for the next DOM update

    expect(wrapper.text()).toContain('This is the settings page') // Check if SettingsView content is rendered
  })

  it('renders the 404 NotFound page on an unknown route', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    })

    await router.push('/non-existing-page') // Navigate to an unknown route
    await wrapper.vm.$nextTick() // Wait for the next DOM update

    expect(wrapper.text()).toContain('404 - Page Not Found') // Check if the 404 page is rendered
  })

  // Dark mode
  it('toggles between dark, light, and system modes via the dropdown menu', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    })

    // Find the dropdown trigger
    const dropdownTrigger = wrapper.find('[data-testid="dropdown-trigger"]') // Adjust the selector as necessary
    console.log('')
    expect(dropdownTrigger.exists()).toBe(true)

    // Trigger the dropdown
    await dropdownTrigger.trigger('click')

    // Now check if the dropdown items exist
    const lightModeOption = wrapper.find('[data-testid="light-mode-option"]') // Use a proper selector
    expect(lightModeOption.exists()).toBe(true)

    // Change to light mode
    await lightModeOption.trigger('click')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('vueuse-color-scheme')).toBe('light')
  })

  it('applies system preference if no user preference is stored', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    })

    // Simulate system preference
    vi.stubGlobal('matchMedia', (query) => {
      return {
        matches: query === '(prefers-color-scheme: dark)',
        addListener: vi.fn(),
        removeListener: vi.fn()
      }
    })

    await wrapper.vm.$nextTick()

    // Check if dark mode is applied by default from system preference
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
