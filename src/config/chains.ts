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

// Igra Labs Devnet configuration
export const igraDevnet = defineChain({
  id: 2600,
  name: 'Igra Labs Devnet',
  nativeCurrency: {
    decimals: 18,
    name: 'iKAS',
    symbol: 'iKAS',
  },
  rpcUrls: {
    default: {
      http: ['https://devnet.igralabs.com:8545/c6a2b8d4e7f34a9c5d1b7e3f2a8c9d0e/'],
      webSocket: undefined,
    },
    public: {
      http: ['https://devnet.igralabs.com:8545/c6a2b8d4e7f34a9c5d1b7e3f2a8c9d0e/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Igra Explorer',
      url: 'https://explorer.igralabs.com/',
    },
  },
  testnet: true,
})

export const supportedChains = [hardhatLocal, kasplexTestnet, igraDevnet] as const