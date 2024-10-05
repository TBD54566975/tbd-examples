import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Web5ConnectResult } from '@web5/api'
import { parse, stringify } from 'zipson'

export const useWeb5Store = defineStore(
  'web5Store',
  () => {
    const web5 = ref<Web5ConnectResult>()
    const did = ref('this should show in the localStorage')
    function setWeb5(_web5Connection: Web5ConnectResult) {
      did.value = _web5Connection.did
      web5.value = _web5Connection
    }

    return { web5, setWeb5 }
  },
  {
    persist: {
      storage: localStorage,
      serializer: {
        deserialize: parse,
        serialize: stringify
      },
      beforeHydrate: (ctx) => {
        console.log(`about to hydrate '${ctx.store.$id}'`)
      },
      afterHydrate: (ctx) => {
        console.log(`just hydrated '${ctx.store.$id}'`)
      }
    }
  }
)
