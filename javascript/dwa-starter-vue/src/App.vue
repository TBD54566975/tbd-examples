<script setup lang="ts">
import NavMenu from '@/components/NavMenu.vue'
</script>

<template>
  <div class="min-h-screen flex p-4 gap-4">
    <!-- Header section -->
    <header>
      <NavMenu />
    </header>

    <main class="flex flex-col items-center">
      <RouterView />
    </main>
  </div>
</template>

<style>
h1 {
  @apply text-5xl font-bold;
}
</style>
