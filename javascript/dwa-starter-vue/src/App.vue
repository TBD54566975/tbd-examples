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
h1,
h2,
h3 {
  @apply scroll-m-20 tracking-tight;
}

h1 {
  @apply text-4xl font-extrabold lg:text-5xl;
}

h2 {
  @apply border-b pb-2 text-3xl font-semibold transition-colors first:mt-0;
}

h3 {
  @apply text-2xl font-semibold;
}

p {
  @apply leading-7 [&:not(:first-child)]:mt-6;
}
</style>
