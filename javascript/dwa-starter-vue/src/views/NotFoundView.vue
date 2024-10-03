<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <div class="flex flex-col items-start gap-4">
    <h1>404 - Page Not Found</h1>
    <p class="text-lg">The page you are looking for doesn’t exist.</p>
    <Button asChild>
      <RouterLink to="/">Go Home</RouterLink>
    </Button>
  </div>
</template>
