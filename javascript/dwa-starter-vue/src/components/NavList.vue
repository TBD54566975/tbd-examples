<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useRoute } from 'vue-router'
import { HomeIcon, GearIcon, AvatarIcon, Link2Icon } from '@radix-icons/vue'

const route = useRoute()

const navList = [
  { title: 'Home', href: '/', icon: HomeIcon },
  { title: 'About', href: '/about', icon: AvatarIcon },
  { title: 'Settings', href: '/settings', icon: GearIcon }
]

const emit = defineEmits(['itemClicked'])
</script>

<template>
  <nav class="flex flex-col gap-4 w-full h-full">
    <h2 class="text-lg">My DWA</h2>

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
