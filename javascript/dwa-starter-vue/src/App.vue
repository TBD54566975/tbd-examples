<script setup lang="ts">
import Toaster from '@/components/ui/toast/Toaster.vue'
import Sidebar from '@/components/Sidebar.vue'
</script>

<template>
  <div class="flex min-h-screen lg:flex-row flex-col dark:bg-zinc-950 dark:text-white">
    <header class="sticky top-0">
      <Sidebar />
    </header>

    <main class="p-4 lg:h-screen overflow-y-auto flex flex-col w-full" aria-labelledby="region-id">
      <RouterView />
    </main>
  </div>
  <Toaster />
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
  @apply text-3xl font-semibold;
}

h3 {
  @apply text-2xl font-semibold;
}

p {
  @apply leading-7 [&:not(:first-child)]:my-6;
}
</style>
