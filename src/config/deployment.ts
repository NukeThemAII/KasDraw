// Updated contract configuration for KasDrawLotteryV2Fixed on Kasplex Testnet
export const LOTTERY_CONTRACT_ADDRESS_V2 = '0x194d33A6A4d9fFF6476125374b095779C561588d';

export const DEPLOYMENT_INFO = {
  "contractName": "KasDrawLotteryV2Fixed",
  "contractAddress": "0x194d33A6A4d9fFF6476125374b095779C561588d",
  "deploymentHash": "0xcf11e9351cb4ac333cc2b29dac625c9da5014008ccfe476118c398f1d1500454",
  "deployer": "0x71d7aCcfB0dFB579b8f00de612890FB875E16eef",
  "owner": "0x71d7aCcfB0dFB579b8f00de612890FB875E16eef",
  "network": "kasplex-testnet",
  "chainId": 167012,
  "rpcUrl": "https://rpc.kasplextest.xyz",
  "explorerUrl": "https://frontend.kasplextest.xyz",
  "deployedAt": "2025-07-25T08:41:20.000Z",
  "gasUsed": "6000000",
  "contractConfig": {
    "ticketPrice": "10 KAS",
    "numberRange": "1-35",
    "numbersPerTicket": 5,
    "drawInterval": "3.5 days",
    "prizeStructure": {
      "jackpot": "50%",
      "secondPrize": "25%",
      "thirdPrize": "15%",
      "fourthPrize": "10%"
    }
  }
};

// Contract ABI - This should match your deployed contract
export const LOTTERY_CONTRACT_ABI = [
  // Add your contract ABI here if needed
  // The hooks should automatically detect the ABI from the contract
];

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 167012,
  name: 'Kasplex Network Testnet',
  rpcUrl: 'https://rpc.kasplextest.xyz',
  explorerUrl: 'https://frontend.kasplextest.xyz',
  nativeCurrency: {
    name: 'Bridged Kas',
    symbol: 'KAS',
    decimals: 18
  }
};