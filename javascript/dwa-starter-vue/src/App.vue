<script setup lang="ts">
import NavMenu from '@/components/NavMenu.vue'
</script>

<template>
  <div class="flex gap-4">
    <header class="p-4 h-screen sticky top-0">
      <NavMenu />
    </header>

    <main class="p-4 overflow-y-auto">
      <RouterView />
    </main>
  </div>
</template>

<style>
h1 {
  @apply text-5xl font-bold;
}
</style>
