<script setup lang="ts">
import NavMenu from '@/components/NavMenu.vue'
</script>

<template>
  <NavMenu />

  <main class="min-h-screen flex justify-center items-center dark:bg-zinc-950 dark:text-white">
    <RouterView />
  </main>
</template>

<style lang="css">
h1 {
  @apply text-5xl font-bold;
}
</style>
