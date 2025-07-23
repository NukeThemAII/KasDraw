import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { kasplexTestnet } from './chains'

export const config = getDefaultConfig({
  appName: 'KasDraw Lottery',
  projectId: 'kasdraw-lottery-dapp', // You can get a project ID from WalletConnect Cloud
  chains: [kasplexTestnet],
  ssr: false, // If your dApp uses server side rendering (SSR)
})

// Register config with TypeScript for better type inference
declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}