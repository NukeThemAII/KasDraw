import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { kasplexTestnet } from '../config/chains'
import { switchToKasplexTestnet } from '../utils/networkHelper'
import { toast } from 'sonner'
import { AlertTriangle, Wifi } from 'lucide-react'

const NetworkSwitcher = () => {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const isOnKasplexTestnet = chainId === kasplexTestnet.id
  const isWrongNetwork = isConnected && !isOnKasplexTestnet

  const handleSwitchNetwork = async () => {
    try {
      if (switchChain) {
        // Try using wagmi first
        switchChain({ chainId: kasplexTestnet.id })
      } else {
        // Fallback to direct MetaMask interaction
        await switchToKasplexTestnet()
      }
      toast.success('Switched to Kasplex Testnet!')
    } catch (error: any) {
      console.error('Failed to switch network:', error)
      toast.error('Failed to switch network. Please switch manually in MetaMask.')
    }
  }

  if (!isConnected) {
    return null
  }

  if (isWrongNetwork) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Wrong Network Detected
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Please switch to Kasplex Testnet to use the lottery.
            </p>
          </div>
          <button
            onClick={handleSwitchNetwork}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Wifi className="w-4 h-4" />
            Switch Network
          </button>
        </div>
      </div>
    )
  }

  if (isOnKasplexTestnet) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-800">
            Connected to Kasplex Testnet
          </span>
        </div>
      </div>
    )
  }

  return null
}

export default NetworkSwitcher