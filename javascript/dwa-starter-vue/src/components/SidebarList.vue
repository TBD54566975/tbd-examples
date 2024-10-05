<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useRoute } from 'vue-router'
import { HomeIcon, GearIcon, AvatarIcon } from '@radix-icons/vue'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Icon } from '@iconify/vue'

import { useColorMode } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { useWeb5Store } from '@/stores/web5'
import { computed } from 'vue'
import Web5ConnectButton from '@/components/Web5ConnectButton.vue'

const route = useRoute()

const { web5 } = storeToRefs(useWeb5Store())
const navList = computed(() => [
  { title: 'Home', href: '/', icon: HomeIcon },
  { title: 'About', href: '/about', icon: AvatarIcon },
  ...(web5.value ? [{ title: 'Settings', href: '/settings', icon: GearIcon }] : [])
])

const emit = defineEmits(['itemClicked'])

const mode = useColorMode()
const handleModeOptionClick = (value: 'light' | 'dark' | 'auto') => {
  mode.value = value
  emit('itemClicked')
}
</script>

<template>
  <nav class="flex flex-col justify-between h-full">
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <h2 class="text-lg">My DWA</h2>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" class="dark:bg-zinc-950 dark:text-white">
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
            <DropdownMenuItem @click="handleModeOptionClick('light')"> Light </DropdownMenuItem>
            <DropdownMenuItem @click="handleModeOptionClick('dark')"> Dark </DropdownMenuItem>
            <DropdownMenuItem @click="handleModeOptionClick('auto')"> System </DropdownMenuItem>
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
    </div>

    <Web5ConnectButton />
  </nav>
</template>
