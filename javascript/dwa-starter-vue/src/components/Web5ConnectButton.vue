<script lang="ts" setup>
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { useWeb5Connection } from '@/composables/web5Connection'
import { Link2Icon, ReloadIcon, LinkBreak2Icon, Cross1Icon } from '@radix-icons/vue'
import QrcodeVue from 'qrcode.vue'
import { toast } from '@/components/ui/toast/use-toast'
import { Input } from '@/components/ui/input'

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

const truncateString = (data: string) => `${data.substring(0, 7)}...${data.slice(data.length - 4)}`

const isOpen = ref(false)
const { connect, walletConnect, isWeb5ConnectLoading, isWeb5WalletConnectLoading } =
  useWeb5Connection()
const { web5 } = storeToRefs(useWeb5Store())

const pin = ref('')
const showPinScreen = ref(false)

const submitPin = () => {
  if (pin.value.trim().length === 0) {
    toast({ title: 'Error', description: "pin can't be empty" })
    return
  }

  postMessage({ type: 'pinSubmitted', pin: pin.value }, window.parent.origin)
}

const qrCodeValue = ref('')
const handleCancelBtnClick = () => {
  qrCodeValue.value = ''
}
const handleWalletConnect = async () => {
  await walletConnect(
    (uri) => (qrCodeValue.value = uri),
    (show) => (showPinScreen.value = show)
  )
}
</script>

<template>
  <p v-if="web5">hi, {{ truncateString(web5.did) }}</p>
  <Drawer v-else v-model:open="isOpen">
    <DrawerTrigger as-child>
      <Button variant="outline" class="w-full dark:bg-zinc-950 dark:text-white">
        <Link2Icon class="w-4 h-4 mr-2" />
        Connect
      </Button>
    </DrawerTrigger>
    <DrawerContent class="dark:bg-zinc-950 dark:text-white">
      <DrawerHeader class="flex flex-col items-center">
        <DrawerTitle>Connect to Web5</DrawerTitle>
        <DrawerDescription>{{
          showPinScreen
            ? 'Please enter the PIN on your wallet'
            : qrCodeValue
              ? 'Scan QR code below'
              : "Select how you'd like to connect below."
        }}</DrawerDescription>
      </DrawerHeader>

      <div v-if="showPinScreen" class="flex flex-col gap-2 p-4 items-center">
        <Input
          type="password"
          maxlength="6"
          pattern="\d{4,6}"
          inputmode="numeric"
          placeholder="Enter your pin code"
          v-model="pin"
          class="lg:w-1/3 w-full"
        />
        <Button
          variant="outline"
          class="lg:w-1/3 w-full bg-blue-600 text-white dark:bg-blue-600 dark:text-white"
          @click="submitPin"
        >
          Submit
        </Button>
      </div>

      <div v-else-if="qrCodeValue" class="flex flex-col gap-2 p-4 items-center">
        <qrcode-vue :value="qrCodeValue" render-as="canvas" :margin="2" :size="320" />
      </div>

      <div v-else class="flex flex-col gap-2 p-4 items-center">
        <Button
          variant="outline"
          :disabled="isWeb5ConnectLoading || isWeb5WalletConnectLoading"
          class="lg:w-1/3 w-full dark:bg-zinc-950 dark:text-white"
          @click="connect"
        >
          <ReloadIcon v-if="isWeb5ConnectLoading" class="w-4 h-4 mr-2 animate-spin" />
          <div v-else class="flex items-center">
            <Link2Icon class="w-4 h-4 mr-2" /> Create a new DID
          </div>
        </Button>

        <Button
          variant="outline"
          :disabled="isWeb5ConnectLoading || isWeb5WalletConnectLoading"
          class="lg:w-1/3 w-full dark:bg-zinc-950 dark:text-white"
          @click="handleWalletConnect"
        >
          <ReloadIcon v-if="isWeb5WalletConnectLoading" class="w-4 h-4 mr-2 animate-spin" />
          <div v-else class="flex items-center">
            <LinkBreak2Icon class="w-4 h-4 mr-2" /> Connect To a Wallet
          </div>
        </Button>
      </div>
      <DrawerFooter>
        <DrawerClose as-child>
          <Button
            variant="outline"
            @click="handleCancelBtnClick"
            class="lg:w-1/3 w-full place-self-center bg-red-600 text-white dark:bg-red-600 dark:text-white"
            ><Cross1Icon class="w-4 h-4 mr-2" /> Cancel
          </Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
