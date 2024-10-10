import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Web5ConnectResult } from '@web5/api'

export const useWeb5Store = defineStore('web5Store', () => {
  const web5 = ref<Web5ConnectResult>()
  function setWeb5(_web5Connection: Web5ConnectResult) {
    web5.value = _web5Connection
  }

  return { web5, setWeb5 }
})
