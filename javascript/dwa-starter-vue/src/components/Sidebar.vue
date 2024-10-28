<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { TextAlignLeftIcon } from '@radix-icons/vue'
import { ref } from 'vue'

import SidebarList from '@/components/SidebarList.vue'

const isOpen = ref(false)
const toggleDrawer = () => {
  isOpen.value = !isOpen.value
}
const closeDrawer = () => {
  isOpen.value = false
}
</script>

<template>
  <!-- Sidebar container for mobile -->
  <aside class="lg:hidden">
    <!-- Toggle button with ARIA for expanded state -->
    <header class="border-b py-2 backdrop-blur-lg dark:border-gray-700">
      <Button @click="toggleDrawer" variant="ghost" aria-expanded="isOpen" aria-controls="mobile-sidebar" aria-label="Toggle sidebar">
        <TextAlignLeftIcon class="w-6 h-6" />
      </Button>
    </header>

    <!-- Keyboard accessible with tabindex and Enter key -->
    <div v-if="isOpen" @click="closeDrawer" class="fixed inset-0 bg-black bg-opacity-80 z-10" role="button" tabindex="0" aria-label="Close sidebar" @keydown.enter="closeDrawer"></div>

    <!-- Sidebar drawer for navigation links -->
    <div id="mobile-sidebar"
      :class="[
        'fixed top-0 left-0 z-20 h-full w-64 bg-white dark:bg-zinc-950 shadow-md transition-transform p-4',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
      :aria-hidden="isOpen ? 'false' : 'true'"
    >
      <SidebarList @itemClicked="closeDrawer" />
    </div>
  </aside>

  <!-- Sidebar container for desktop -->
  <aside class="hidden lg:block h-full p-4 w-64">
    <SidebarList />
  </aside>
</template>
