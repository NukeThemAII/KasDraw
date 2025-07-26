import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { hardhatLocal, kasplexTestnet, igraDevnet } from './chains'
import { http } from 'viem'

// Use Igra devnet for production deployment
const isDevelopment = false // Set to true only for local development

export const config = getDefaultConfig({
  appName: 'KasDraw Lottery',
  projectId: 'kasdraw-lottery-dapp', // You can get a project ID from WalletConnect Cloud
  chains: isDevelopment ? [hardhatLocal] : [igraDevnet, kasplexTestnet],
  transports: {
    [hardhatLocal.id]: http('http://127.0.0.1:8545', {
      timeout: 30000,
      retryCount: 3,
      retryDelay: 1000,
    }),
    [kasplexTestnet.id]: http('https://rpc.kasplextest.xyz', {
      timeout: 30000,
      retryCount: 3,
      retryDelay: 1000,
    }),
    [igraDevnet.id]: http('https://devnet.igralabs.com:8545/c6a2b8d4e7f34a9c5d1b7e3f2a8c9d0e/', {
      timeout: 30000,
      retryCount: 3,
      retryDelay: 1000,
    }),
  },
  ssr: false, // If your dApp uses server side rendering (SSR)
})

// Register config with TypeScript for better type inference
declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}