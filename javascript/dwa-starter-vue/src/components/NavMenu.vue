<script setup lang="ts">
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from '@/components/ui/navigation-menu'
import { Button } from '@/components/ui/button'
import { HomeIcon, GearIcon, AvatarIcon, Link2Icon } from '@radix-icons/vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const navList: { title: string; href: string; icon: any }[] = [
  {
    title: 'Home',
    href: '/',
    icon: HomeIcon
  },
  {
    title: 'About',
    href: '/about',
    icon: AvatarIcon
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: GearIcon
  }
]
</script>
<template>
  <nav class="flex flex-col gap-4 w-full h-full">
    <h2 class="text-xl font-bold">My DWA</h2>

    <div class="flex flex-col gap-2">
      <div v-for="item in navList" :key="item.title">
        <Button
          :variant="route.path === item.href ? 'secondary' : 'ghost'"
          class="w-full justify-start"
          asChild
        >
          <RouterLink :to="item.href">
            <component :is="item.icon" class="w-4 h-4 mr-2" />
            {{ item.title }}
          </RouterLink>
        </Button>
      </div>
    </div>

    <Button variant="ghost" class="w-full mt-auto">
      <Link2Icon class="w-4 h-4 mr-2" />
      Connect
    </Button>
  </nav>
</template>
