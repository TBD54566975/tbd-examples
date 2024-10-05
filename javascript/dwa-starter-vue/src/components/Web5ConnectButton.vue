<script lang="ts" setup>
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { useWeb5Connection } from '@/composables/web5Connection'
import { Link2Icon, ReloadIcon, LinkBreak2Icon, Cross1Icon } from '@radix-icons/vue'

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose
} from '@/components/ui/drawer'
import { storeToRefs } from 'pinia'
import { useWeb5Store } from '@/stores/web5'

const isOpen = ref(false)

const { connect, walletConnect, isWeb5ConnectionLoading } = useWeb5Connection()
const { web5 } = storeToRefs(useWeb5Store())

const truncateString = (data: string) => `${data.substring(0, 7)}...${data.slice(data.length - 4)}`
</script>

<template>
  <p v-if="web5" class="rounded-xl bg-blue-600 text-white p-2">
    hi, {{ truncateString(web5.did) }}
  </p>
  <Drawer v-else v-model:open="isOpen">
    <DrawerTrigger as-child>
      <Button variant="ghost" class="w-full justify-center">
        <Link2Icon class="w-4 h-4 mr-2" />
        Connect
      </Button>
    </DrawerTrigger>
    <DrawerContent class="dark:bg-zinc-950 dark:text-white">
      <DrawerHeader class="flex flex-col items-center">
        <DrawerTitle>Connect to Web5</DrawerTitle>
        <DrawerDescription>Select how you'd like to connect below.</DrawerDescription>
      </DrawerHeader>
      <div class="flex flex-col gap-2 p-4">
        <Button
          variant="outline"
          :disabled="isWeb5ConnectionLoading"
          class="w-full justify-center dark:bg-zinc-950 dark:text-white"
          @click="connect"
        >
          <ReloadIcon v-if="isWeb5ConnectionLoading" class="w-4 h-4 mr-2 animate-spin" />
          <div v-else class="flex items-center">
            <Link2Icon class="w-4 h-4 mr-2" /> Local Agent Connect
          </div>
        </Button>

        <Button
          variant="outline"
          :disabled="isWeb5ConnectionLoading"
          class="w-full justify-center dark:bg-zinc-950 dark:text-white"
          @click="walletConnect"
        >
          <ReloadIcon v-if="isWeb5ConnectionLoading" class="w-4 h-4 mr-2 animate-spin" />
          <div v-else class="flex items-center">
            <LinkBreak2Icon class="w-4 h-4 mr-2" /> Wallet Connect
          </div>
        </Button>
      </div>
      <DrawerFooter>
        <DrawerClose as-child>
          <Button variant="outline" class="bg-red-500 text-white dark:bg-red-500 dark:text-white"
            ><Cross1Icon class="w-4 h-4 mr-2" /> Cancel
          </Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
