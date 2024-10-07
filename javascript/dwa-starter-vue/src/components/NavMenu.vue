<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { TextAlignLeftIcon } from '@radix-icons/vue'
import { ref } from 'vue'

import NavList from '@/components/NavList.vue'

const isOpen = ref(false)
const toggleDrawer = () => {
  isOpen.value = !isOpen.value
}
const closeDrawer = () => {
  isOpen.value = false
}
</script>

<template>
  <div class="lg:hidden">
    <div class="border-b py-2 backdrop-blur-lg dark:border-gray-700">
      <Button @click="toggleDrawer" variant="ghost">
        <TextAlignLeftIcon class="w-6 h-6" />
      </Button>
    </div>

    <div v-if="isOpen" @click="closeDrawer" class="fixed inset-0 bg-black bg-opacity-80 z-10"></div>

    <div
      :class="[
        'fixed top-0 left-0 z-20 h-full w-64 bg-white dark:bg-zinc-950 shadow-md transition-transform p-4',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <NavList @itemClicked="closeDrawer" />
    </div>
  </div>

  <div class="hidden lg:block h-full p-4">
    <NavList />
  </div>
</template>
