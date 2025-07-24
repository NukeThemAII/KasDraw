import { defineChain } from 'viem'

// Local Hardhat development chain
export const hardhatLocal = defineChain({
  id: 31337,
  name: 'Hardhat Local',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
    public: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  testnet: true,
})

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

export const supportedChains = [hardhatLocal, kasplexTestnet] as const