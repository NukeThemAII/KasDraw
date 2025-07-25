// Network configuration helper for MetaMask
export const KASPLEX_TESTNET_CONFIG = {
  chainId: '0x28C64', // 167012 in hex
  chainName: 'Kasplex Network Testnet',
  nativeCurrency: {
    name: 'Bridged Kas',
    symbol: 'KAS',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.kasplextest.xyz'],
  blockExplorerUrls: ['https://frontend.kasplextest.xyz'],
}

export const addKasplexTestnetToMetaMask = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed')
  }

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [KASPLEX_TESTNET_CONFIG],
    })
    return true
  } catch (error) {
    console.error('Failed to add Kasplex testnet to MetaMask:', error)
    throw error
  }
}

export const switchToKasplexTestnet = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed')
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: KASPLEX_TESTNET_CONFIG.chainId }],
    })
    return true
  } catch (error: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      return await addKasplexTestnetToMetaMask()
    }
    console.error('Failed to switch to Kasplex testnet:', error)
    throw error
  }
}