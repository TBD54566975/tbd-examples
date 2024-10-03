<script setup lang="ts">
import NavMenu from '@/components/NavMenu.vue'
</script>

<template>
  <header class="flex justify-center items-center">
    <NavMenu />
  </header>

  <main class="min-h-screen flex justify-center items-center">
    <RouterView />
  </main>
</template>

<style lang="css">
h1 {
  @apply text-5xl font-bold;
}
</style>
