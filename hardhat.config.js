import '@nomicfoundation/hardhat-toolbox';
import { config } from 'dotenv';
config();

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: '0.8.19',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    kasplex: {
      url: 'https://rpc.kasplextest.xyz',
      chainId: 167012,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 'auto',
      gas: 'auto',
    },
    igra: {
      url: 'https://devnet.igralabs.com:8545/c6a2b8d4e7f34a9c5d1b7e3f2a8c9d0e/',
      chainId: 2600,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 'auto',
      gas: 'auto',
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  mocha: {
    timeout: 40000,
  },
};