import { defineChain } from 'viem'

// Kasplex EVM Testnet configuration
export const kasplexTestnet = defineChain({
  id: 167012,
  name: 'Kasplex Network Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Bridged Kas',
    symbol: 'KAS',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.kasplextest.xyz'],
      webSocket: undefined,
    },
    public: {
      http: ['https://rpc.kasplextest.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Kasplex Explorer',
      url: 'https://frontend.kasplextest.xyz',
    },
  },
  testnet: true,
})

export const supportedChains = [kasplexTestnet] as const