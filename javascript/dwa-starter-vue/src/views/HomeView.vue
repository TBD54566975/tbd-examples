<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Link2Icon } from '@radix-icons/vue'
</script>
<template>
  <div class="self-center text-center">
    <h1>DWA Starter Vue!</h1>
    <img src="/workplace.svg" class="max-h-72 mx-auto" alt="DWA" />
    <p>Connect your DWA to get started</p>
    <Button variant="ghost" class="w-full justify-center">
      <Link2Icon class="w-4 h-4 mr-2" />
      Connect
    </Button>
  </div>
</template>
