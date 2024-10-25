<script setup lang="ts">
import TodoList from '@/components/TodoList.vue'
import Web5ConnectButton from '@/components/Web5ConnectButton.vue'
import { useWeb5Store } from '@/stores/web5'
import { storeToRefs } from 'pinia'

const { web5 } = storeToRefs(useWeb5Store())
</script>
<template>
  <TodoList v-if="web5" />
  <article aria-label="get started" v-else class="self-center text-center">
    <h1>DWA Starter Vue!</h1>
    <img 
      src="/workplace.svg" class="max-h-72 mx-auto" 
      alt="DWAs faciliate communication, collaboration, and fun all while allowing users to own their data." 
    />
    <p>Connect your DWA to get started</p>
    <Web5ConnectButton />
  </article>
</template>
