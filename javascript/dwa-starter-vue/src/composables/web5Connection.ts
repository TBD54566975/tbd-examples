import { toast } from '@/components/ui/toast/use-toast'
import { useWeb5Store } from '@/stores/web5'
import { Web5, type Web5ConnectOptions, type ConnectOptions } from '@web5/api'
import { ref } from 'vue'
import { useWeb5 } from '@/composables/web5'

export function useWeb5Connection() {
  const { setWeb5 } = useWeb5Store()
  const isWeb5ConnectionLoading = ref(false)

  const connectToWeb5 = async (options: Web5ConnectOptions) => {
    try {
      isWeb5ConnectionLoading.value = true
      const connection = await Web5.connect(options)
      setWeb5(connection)

      const { configureProtocol } = useWeb5()
      await configureProtocol()

      toast({
        title: 'Success',
        description: `Web5 connection successful`
      })
    } catch (error: any) {
      console.error('Web5 connection failed:', error)
      toast({
        title: 'Error',
        description: `Web5 connection failed: ${error.message || error}`
      })
    } finally {
      isWeb5ConnectionLoading.value = false
    }
  }

  const connect = async () => {
    const connectOptions: Web5ConnectOptions = {
      techPreview: {
        dwnEndpoints: ['https://dwn.tbddev.org/beta']
      },
      sync: '15s',
      registration: {
        onSuccess: () => {},
        onFailure: (error: any) => {
          console.error('Registration failed:', error)
        }
      }
    }
    await connectToWeb5(connectOptions)
  }

  const walletConnect = async (walletConnectOptions: ConnectOptions) => {
    toast({
      title: 'Info',
      description: 'coming soon'
    })
    // await connectToWeb5({
    //   walletConnectOptions,
    //   sync: '15s'
    // })
  }

  return { connect, walletConnect, isWeb5ConnectionLoading }
}
