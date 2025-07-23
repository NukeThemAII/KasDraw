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