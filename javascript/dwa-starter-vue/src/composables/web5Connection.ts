import { toast } from '@/components/ui/toast/use-toast'
import { useWeb5Store } from '@/stores/web5'
import { Web5, type Web5ConnectOptions, type ConnectOptions } from '@web5/api'
import { ref, type Ref } from 'vue'
import { useWeb5 } from '@/composables/web5'

export function useWeb5Connection() {
  const { setWeb5 } = useWeb5Store()
  const isWeb5WalletConnectLoading = ref(false)
  const isWeb5ConnectLoading = ref(false)

  const connectToWeb5 = async (
    options: Web5ConnectOptions,
    loadingState: Ref<boolean, boolean>
  ) => {
    try {
      loadingState.value = true
      const connection = await Web5.connect(options)
      setWeb5(connection)

      const { installProtocols } = useWeb5()
      await installProtocols()

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
      loadingState.value = false
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
    await connectToWeb5(connectOptions, isWeb5ConnectLoading)
  }

  const walletConnect = async () => {
    const walletConnectOptions = {} as ConnectOptions
    await connectToWeb5(
      {
        walletConnectOptions,
        sync: '15s'
      },
      isWeb5WalletConnectLoading
    )
  }

  return { connect, walletConnect, isWeb5WalletConnectLoading, isWeb5ConnectLoading }
}
