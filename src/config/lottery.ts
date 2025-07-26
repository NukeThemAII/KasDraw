/**
 * DecentralizedLottery Configuration
 * Updated for the new fully decentralized lottery contract
 */

export const LOTTERY_CONFIG = {
  // Contract Configuration
  TICKET_PRICE: '0.1', // 0.1 KAS per ticket
  NUMBERS_PER_TICKET: 5,
  MAX_NUMBER: 35,
  MIN_NUMBER: 1,
  MAX_TICKETS_PER_BATCH: 50,
  
  // Timing Configuration
  DRAW_INTERVAL: {
    PRODUCTION: 3600, // 1 hour in seconds
    TESTING: 600, // 10 minutes in seconds
  },
  
  // Economic Configuration (in basis points)
  FEES: {
    PROTOCOL_FEE: 50, // 0.5%
    EXECUTOR_REWARD: 25, // 0.25%
  },
  
  // Prize Distribution (in basis points)
  PRIZE_DISTRIBUTION: {
    JACKPOT: 5000, // 50% for 5 matches
    SECOND_PRIZE: 2500, // 25% for 4 matches
    THIRD_PRIZE: 1500, // 15% for 3 matches
    FOURTH_PRIZE: 925, // 9.25% for 2 matches
  },
  
  // Security Thresholds
  EMERGENCY_PAUSE_THRESHOLD: '100', // 100 KAS
  MIN_EXECUTOR_REWARD: '0.05', // 0.05 KAS
  MAX_EXECUTOR_REWARD: '5', // 5 KAS
  
  // UI Configuration
  UI: {
    MAX_DISPLAY_TICKETS: 20,
    REFRESH_INTERVAL: 30000, // 30 seconds
    ANIMATION_DURATION: 300,
    TOAST_DURATION: 5000,
  },
  
  // Analytics Configuration
  ANALYTICS: {
    ENABLE_REAL_TIME: true,
    UPDATE_INTERVAL: 15000, // 15 seconds
    CHART_DATA_POINTS: 50,
  },
};

// Contract ABI for DecentralizedLottery
export const LOTTERY_ABI = [
  // Constructor
  {
    "inputs": [
      {
        "internalType": "bool",
        "name": "_testingMode",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  
  // Main Functions
  {
    "inputs": [
      {
        "internalType": "uint256[5][]",
        "name": "ticketNumbers",
        "type": "uint256[5][]"
      }
    ],
    "name": "purchaseTickets",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "executeDraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256[]",
        "name": "ticketIds",
        "type": "uint256[]"
      }
    ],
    "name": "claimPrizes",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  
  // View Functions
  {
    "inputs": [],
    "name": "getDrawInfo",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "currentDraw",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "nextDrawTimestamp",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "nextDrawBlockNumber",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "currentJackpot",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "ticketsSold",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "canExecute",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "executorReward",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTimeUntilDraw",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "timeRemaining",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "blocksRemaining",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "drawId",
        "type": "uint256"
      }
    ],
    "name": "getDraw",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "uint256[5]",
        "name": "winningNumbers",
        "type": "uint256[5]"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalPrizePool",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "jackpotAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalTickets",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "executed",
        "type": "bool"
      },
      {
        "internalType": "address",
        "name": "executor",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "randomSeed",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "drawId",
        "type": "uint256"
      }
    ],
    "name": "getDrawWinners",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "winners5",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "winners4",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "winners3",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "winners2",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "prize5",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "prize4",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "prize3",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "prize2",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "ticketId",
        "type": "uint256"
      }
    ],
    "name": "getTicket",
    "outputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "internalType": "uint256[5]",
        "name": "numbers",
        "type": "uint256[5]"
      },
      {
        "internalType": "uint256",
        "name": "drawId",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "claimed",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "purchaseTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "batchId",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "getPlayerStats",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "totalTickets",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalWinnings",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalSpent",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "biggestWin",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lastPlayTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "winCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256[]",
        "name": "ticketIds",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAnalytics",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "totalDraws",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalTicketsSold",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalPrizesDistributed",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalProtocolFees",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "averageJackpot",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "largestJackpot",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalPlayers",
            "type": "uint256"
          }
        ],
        "internalType": "struct DecentralizedLottery.LotteryAnalytics",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "drawId",
        "type": "uint256"
      }
    ],
    "name": "getPlayerTicketsByDraw",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "canExecuteDraw",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  
  // Testing Functions (only available in testing mode)
  {
    "inputs": [
      {
        "internalType": "bool",
        "name": "_enabled",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "_testInterval",
        "type": "uint256"
      }
    ],
    "name": "setTestingMode",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "forceExecuteDrawForTesting",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  
  // Emergency Functions
  {
    "inputs": [],
    "name": "emergencyPause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "emergencyUnpause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  
  // State Variables (public getters)
  {
    "inputs": [],
    "name": "currentDrawId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "accumulatedJackpot",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "testingMode",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "emergencyPaused",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  
  // Events
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "drawId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256[]",
        "name": "ticketIds",
        "type": "uint256[]"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "totalCost",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "batchId",
        "type": "uint256"
      }
    ],
    "name": "TicketsPurchased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "drawId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256[5]",
        "name": "winningNumbers",
        "type": "uint256[5]"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "totalPrizePool",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "jackpotAmount",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "executor",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "executorReward",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "totalTickets",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "randomSeed",
        "type": "uint256"
      }
    ],
    "name": "DrawExecuted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256[]",
        "name": "ticketIds",
        "type": "uint256[]"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "totalAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "winCount",
        "type": "uint256"
      }
    ],
    "name": "PrizesClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "fromDrawId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "toDrawId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "JackpotRollover",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "jackpotAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "threshold",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "EmergencyCircuitBreaker",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "totalDraws",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "totalTickets",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "totalPrizes",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "averageJackpot",
        "type": "uint256"
      }
    ],
    "name": "AnalyticsUpdated",
    "type": "event"
  },
  
  // Fallback and Receive
  {
    "stateMutability": "payable",
    "type": "receive"
  },
  {
    "stateMutability": "payable",
    "type": "fallback"
  }
];

// Helper functions for the frontend
export const LOTTERY_HELPERS = {
  // Format ticket price for display
  formatTicketPrice: (price: string): string => {
    return `${price} KAS`;
  },
  
  // Calculate total cost for multiple tickets
  calculateTotalCost: (ticketCount: number): string => {
    return (parseFloat(LOTTERY_CONFIG.TICKET_PRICE) * ticketCount).toString();
  },
  
  // Validate ticket numbers
  validateTicketNumbers: (numbers: number[]): { valid: boolean; error?: string } => {
    if (numbers.length !== LOTTERY_CONFIG.NUMBERS_PER_TICKET) {
      return { valid: false, error: `Must select exactly ${LOTTERY_CONFIG.NUMBERS_PER_TICKET} numbers` };
    }
    
    for (const num of numbers) {
      if (num < LOTTERY_CONFIG.MIN_NUMBER || num > LOTTERY_CONFIG.MAX_NUMBER) {
        return { valid: false, error: `Numbers must be between ${LOTTERY_CONFIG.MIN_NUMBER} and ${LOTTERY_CONFIG.MAX_NUMBER}` };
      }
    }
    
    const uniqueNumbers = new Set(numbers);
    if (uniqueNumbers.size !== numbers.length) {
      return { valid: false, error: 'Duplicate numbers are not allowed' };
    }
    
    return { valid: true };
  },
  
  // Format time remaining
  formatTimeRemaining: (seconds: number): string => {
    if (seconds <= 0) return 'Draw ready!';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  },
  
  // Calculate prize tier based on matches
  getPrizeTier: (matches: number): { tier: string; percentage: number } | null => {
    switch (matches) {
      case 5:
        return { tier: 'Jackpot', percentage: LOTTERY_CONFIG.PRIZE_DISTRIBUTION.JACKPOT / 100 };
      case 4:
        return { tier: '2nd Prize', percentage: LOTTERY_CONFIG.PRIZE_DISTRIBUTION.SECOND_PRIZE / 100 };
      case 3:
        return { tier: '3rd Prize', percentage: LOTTERY_CONFIG.PRIZE_DISTRIBUTION.THIRD_PRIZE / 100 };
      case 2:
        return { tier: '4th Prize', percentage: LOTTERY_CONFIG.PRIZE_DISTRIBUTION.FOURTH_PRIZE / 100 };
      default:
        return null;
    }
  },
  
  // Generate random ticket numbers for quick pick
  generateQuickPick: (): number[] => {
    const numbers: number[] = [];
    while (numbers.length < LOTTERY_CONFIG.NUMBERS_PER_TICKET) {
      const num = Math.floor(Math.random() * LOTTERY_CONFIG.MAX_NUMBER) + LOTTERY_CONFIG.MIN_NUMBER;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    return numbers.sort((a, b) => a - b);
  },
  
  // Check if numbers match winning numbers
  countMatches: (ticketNumbers: number[], winningNumbers: number[]): number => {
    return ticketNumbers.filter(num => winningNumbers.includes(num)).length;
  },
  
  // Format large numbers for display
  formatNumber: (num: string | number): string => {
    const value = typeof num === 'string' ? parseFloat(num) : num;
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    } else {
      return value.toFixed(2);
    }
  },
  
  // Convert wei to KAS
  weiToKAS: (wei: string): string => {
    return (parseFloat(wei) / 1e18).toFixed(4);
  },
  
  // Convert KAS to wei
  kasToWei: (kas: string): string => {
    return (parseFloat(kas) * 1e18).toString();
  }
};

// Error messages
export const LOTTERY_ERRORS = {
  INSUFFICIENT_BALANCE: 'Insufficient balance to purchase tickets',
  INVALID_NUMBERS: 'Invalid ticket numbers selected',
  DUPLICATE_NUMBERS: 'Duplicate numbers are not allowed',
  NUMBERS_OUT_OF_RANGE: `Numbers must be between ${LOTTERY_CONFIG.MIN_NUMBER} and ${LOTTERY_CONFIG.MAX_NUMBER}`,
  TOO_MANY_TICKETS: `Maximum ${LOTTERY_CONFIG.MAX_TICKETS_PER_BATCH} tickets per batch`,
  NO_TICKETS_SELECTED: 'No tickets selected',
  DRAW_NOT_READY: 'Draw is not ready for execution',
  NO_PRIZES_TO_CLAIM: 'No prizes to claim',
  EMERGENCY_PAUSED: 'Lottery is temporarily paused due to emergency conditions',
  NETWORK_ERROR: 'Network error. Please try again.',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  WALLET_NOT_CONNECTED: 'Please connect your wallet first',
};

// Success messages
export const LOTTERY_SUCCESS = {
  TICKETS_PURCHASED: 'Tickets purchased successfully!',
  DRAW_EXECUTED: 'Draw executed successfully!',
  PRIZES_CLAIMED: 'Prizes claimed successfully!',
  WALLET_CONNECTED: 'Wallet connected successfully!',
};