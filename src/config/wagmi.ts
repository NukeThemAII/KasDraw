import { http, createConfig } from 'wagmi'
import { kasplexTestnet, igraDevnet } from './chains'

export const config = createConfig({
  chains: [kasplexTestnet, igraDevnet],
  transports: {
    [kasplexTestnet.id]: http('https://rpc.kasplextest.xyz'),
    [igraDevnet.id]: http('https://devnet.igralabs.com:8545/c6a2b8d4e7f34a9c5d1b7e3f2a8c9d0e/'),
  },
})

// Register config with TypeScript for better type inference
declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}