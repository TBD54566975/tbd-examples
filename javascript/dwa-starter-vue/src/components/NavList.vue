<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useRoute } from 'vue-router'
import { HomeIcon, GearIcon, AvatarIcon, Link2Icon } from '@radix-icons/vue'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Icon } from '@iconify/vue'

import { useColorMode } from '@vueuse/core'

const route = useRoute()

const navList = [
  { title: 'Home', href: '/', icon: HomeIcon },
  { title: 'About', href: '/about', icon: AvatarIcon },
  { title: 'Settings', href: '/settings', icon: GearIcon }
]

const emit = defineEmits(['itemClicked'])

const mode = useColorMode()
</script>

<template>
  <nav class="flex flex-col gap-4 h-full">
    <div class="flex items-center justify-between">
      <h2 class="text-lg">My DWA</h2>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" class="dark:bg-zinc-950 dark:text-white" id="theme-toggle-button">
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
          <DropdownMenuItem v-bind:id="'light-mode-option'" @click="mode = 'light'">
            Light
          </DropdownMenuItem>
          <DropdownMenuItem v-bind:id="'dark-mode-option'" @click="mode = 'dark'">
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem v-bind:id="'auto-mode-option'" @click="mode = 'auto'">
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <div class="flex flex-col gap-2">
      <div v-for="item in navList" :key="item.title">
        <Button
          :variant="route.path === item.href ? 'secondary' : 'ghost'"
          class="w-full justify-start"
          asChild
        >
          <RouterLink :to="item.href" @click="emit('itemClicked')">
            <component :is="item.icon" class="w-4 h-4 mr-2" />
            {{ item.title }}
          </RouterLink>
        </Button>
      </div>
    </div>
    <Button variant="ghost" class="w-full justify-start mt-auto">
      <Link2Icon class="w-4 h-4 mr-2" />
      Connect
    </Button>
  </nav>
</template>
