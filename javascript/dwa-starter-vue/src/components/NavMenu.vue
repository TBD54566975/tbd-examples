<script setup lang="ts">
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from '@/components/ui/navigation-menu'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Icon } from '@iconify/vue'

import { useColorMode } from '@vueuse/core'

const navList = [
  { title: 'Home', href: '/' },
  { title: 'About', href: '/about' },
  { title: 'Settings', href: '/settings' }
]

// Use the color mode with VueUse for theme switching
const mode = useColorMode()
</script>

<template>
  <header
    class="sticky z-10 top-0 backdrop-blur-lg border-b bg-white dark:bg-zinc-950 dark:border-gray-700"
  >
    <div class="container flex h-14 items-center justify-between">
      <div class="flex items-center gap-2">
        <!-- Logo Section -->
        <div class="dark:text-white font-semibold">Logo</div>

        <!-- Navigation Menu -->
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem v-for="item in navList" :key="item.title">
              <RouterLink :to="item.href">
                <NavigationMenuLink :class="navigationMenuTriggerStyle() + ' dark:text-white'">
                  {{ item.title }}
                </NavigationMenuLink>
              </RouterLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <!-- Dark Mode Dropdown Menu -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button
            variant="outline"
            class="dark:bg-zinc-950 dark:text-white"
            data-testid="dropdown-trigger"
          >
            <!-- Transitioning moon and sun icons based on dark mode -->
            <Icon
              icon="radix-icons:moon"
              class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
            />
            <Icon
              icon="radix-icons:sun"
              class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
            />
            <span class="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="dark:bg-zinc-950 dark:text-white">
          <DropdownMenuItem @click="mode = 'light'" data-testid="light-mode-option">
            Light
          </DropdownMenuItem>
          <DropdownMenuItem @click="mode = 'dark'" data-testid="dark-mode-option">
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem @click="mode = 'auto'" data-testid="auto-mode-option">
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>
</template>
