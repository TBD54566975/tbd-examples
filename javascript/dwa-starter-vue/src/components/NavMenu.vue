<script setup lang="ts">
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from '@/components/ui/navigation-menu'

const navList: { title: string; href: string }[] = [
  {
    title: 'Home',
    href: '/'
  },
  {
    title: 'About',
    href: '/about'
  },
  {
    title: 'Settings',
    href: '/settings'
  }
]
</script>

<template>
  <NavigationMenu>
    <NavigationMenuList>
      <NavigationMenuItem v-for="item in navList" :key="item.title">
        <RouterLink :to="item.href">
          <NavigationMenuLink :class="navigationMenuTriggerStyle()">
            {{ item.title }}
          </NavigationMenuLink>
        </RouterLink>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
</template>
