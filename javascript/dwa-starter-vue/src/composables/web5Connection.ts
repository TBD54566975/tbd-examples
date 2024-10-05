import { toast } from '@/components/ui/toast/use-toast'
import { useWeb5Store } from '@/stores/web5'
import { type ConnectOptions, Web5 } from '@web5/api'
import { ref } from 'vue'
import { useWeb5 } from '@/composables/web5'

export function useWeb5Connection() {
  const { setWeb5 } = useWeb5Store()

  const isWeb5ConnectionLoading = ref(false)

  const walletConnect = async (walletConnectOptions: ConnectOptions) => {
    toast({
      title: 'Info',
      description: `coming soon`
    })
    return
    const connection = await Web5.connect({ walletConnectOptions, sync: '15s' })
    setWeb5(connection)
    return connection
  }
  const connect = async () => {
    try {
      isWeb5ConnectionLoading.value = true
      const connectOptions = {
        techPreview: {
          dwnEndpoints: ['https://dwn.tbddev.org/beta']
        },
        sync: '15s',
        registration: {
          onSuccess: () => {
            console.log('bruh this is workin')
          },
          onFailure: (error: any) => {
            console.log('its not worfking wtff')
            console.log(error)
          }
        }
      }
      // const connectOptions = {
      //   didCreateOptions: {
      //     dwnEndpoints: ['https://dwn.gcda.xyz']
      //   },
      // }
      const connection = await Web5.connect(connectOptions)
      setWeb5(connection)
      const { configureProtocol } = useWeb5()
      await configureProtocol()
      toast({
        title: 'Success',
        description: `web5 connection successful`
      })

      return connection
    } finally {
      isWeb5ConnectionLoading.value = false
    }
  }

  return { connect, walletConnect, isWeb5ConnectionLoading }
}
