import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import App from '../src/App.vue'
import HomeView from '../src/views/HomeView.vue'
import AboutView from '../src/views/AboutView.vue'
import SettingsView from '../src/views/SettingsView.vue'
import NotFoundView from '../src/views/NotFoundView.vue'
import NavMenu from '../src/components/NavMenu.vue'

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
})
