// Lottery contract configuration and constants

// Admin wallet address
export const ADMIN_ADDRESS = '0x71d7aCcfB0dFB579b8f00de612890FB875E16eef'

// Enhanced Lottery game constants - Easier to Win!
export const LOTTERY_CONFIG = {
  TICKET_PRICE: '10.0', // 10.0 KAS per ticket (as deployed)
  MIN_NUMBER: 1,
  MAX_NUMBER: 49,
  NUMBERS_PER_TICKET: 6,
  DRAWS_PER_WEEK: 2,
  DRAW_DAYS: [3, 6], // Wednesday (3) and Saturday (6)
  DRAW_TIME: '20:00', // 8 PM
  DRAW_INTERVAL_HOURS: 84, // 3.5 days between draws
  EXECUTOR_REWARD_PERCENTAGE: 1, // 1% of prize pool
  MIN_EXECUTOR_REWARD: '0.1', // Minimum 0.1 KAS
  MAX_EXECUTOR_REWARD: '10', // Maximum 10 KAS
} as const

// Enhanced Prize structure with more winning tiers
export const PRIZE_STRUCTURE = {
  JACKPOT: 50, // 5 matches (reduced to fund more tiers)
  SECOND_PRIZE: 20, // 4 matches
  THIRD_PRIZE: 15, // 3 matches
  FOURTH_PRIZE: 10, // 2 matches - NEW TIER!
  FIFTH_PRIZE: 5, // Future expansion
  ADMIN_FEE: 1,
} as const

// Winning odds calculation (for display)
export const WINNING_ODDS = {
  JACKPOT: '1 in 324,632', // C(35,5)
  SECOND_PRIZE: '1 in 7,624', // 4 out of 5 matches
  THIRD_PRIZE: '1 in 344', // 3 out of 5 matches
  FOURTH_PRIZE: '1 in 35', // 2 out of 5 matches
  ANY_PRIZE: '1 in 32', // Any winning combination
} as const

// Enhanced Contract ABI - Complete interface for KasDrawLottery v2
export const LOTTERY_ABI = [
  // Core Functions
  {
    type: 'function',
    name: 'purchaseTickets',
    stateMutability: 'payable',
    inputs: [{ name: 'ticketNumbers', type: 'uint256[5][]' }], // Updated to 5 numbers
    outputs: []
  },
  {
    type: 'function',
    name: 'executeDraw',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },
  {
    type: 'function',
    name: 'executeDrawManual',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'winningNumbers', type: 'uint256[5]' }], // Updated to 5 numbers
    outputs: []
  },
  {
    type: 'function',
    name: 'executeDrawPublic',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },
  {
    type: 'function',
    name: 'claimPrize',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'ticketId', type: 'uint256' }],
    outputs: []
  },
  {
    type: 'function',
    name: 'withdrawAdminFees',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },
  {
    type: 'function',
    name: 'emergencyRefundAll',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },
  {
    type: 'function',
    name: 'pause',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },
  {
    type: 'function',
    name: 'unpause',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },
  // Enhanced View Functions
  {
    type: 'function',
    name: 'currentDrawId',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    type: 'function',
    name: 'adminBalance',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    type: 'function',
    name: 'paused',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    type: 'function',
    name: 'canExecuteDrawPublic',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'canExecute', type: 'bool' },
      { name: 'timeRemaining', type: 'uint256' },
      { name: 'nextDrawTime', type: 'uint256' },
      { name: 'blocksRemaining', type: 'uint256' },
      { name: 'nextDrawBlock', type: 'uint256' }
    ]
  },
  {
    type: 'function',
    name: 'getCurrentExecutorReward',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 'reward', type: 'uint256' }]
  },
  {
    type: 'function',
    name: 'getLotteryStats',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'currentJackpot', type: 'uint256' },
      { name: 'ticketsSoldThisDraw', type: 'uint256' },
      { name: 'totalTickets', type: 'uint256' },
      { name: 'nextDraw', type: 'uint256' },
      { name: 'executorReward', type: 'uint256' },
      { name: 'canExecute', type: 'bool' }
    ]
  },
  {
    type: 'function',
    name: 'getTicket',
    stateMutability: 'view',
    inputs: [{ name: 'ticketId', type: 'uint256' }],
    outputs: [
      { name: 'player', type: 'address' },
      { name: 'numbers', type: 'uint256[5]' }, // Updated to 5 numbers
      { name: 'drawId', type: 'uint256' },
      { name: 'claimed', type: 'bool' },
      { name: 'purchaseTime', type: 'uint256' }
    ]
  },
  {
    type: 'function',
    name: 'getDraw',
    stateMutability: 'view',
    inputs: [{ name: 'drawId', type: 'uint256' }],
    outputs: [
      { name: 'id', type: 'uint256' },
      { name: 'winningNumbers', type: 'uint256[5]' }, // Updated to 5 numbers
      { name: 'timestamp', type: 'uint256' },
      { name: 'totalPrizePool', type: 'uint256' },
      { name: 'jackpotAmount', type: 'uint256' },
      { name: 'executorReward', type: 'uint256' },
      { name: 'executor', type: 'address' },
      { name: 'executed', type: 'bool' }
    ]
  },
  {
    type: 'function',
    name: 'getPlayerStats',
    stateMutability: 'view',
    inputs: [{ name: 'player', type: 'address' }],
    outputs: [
      { name: 'totalTickets', type: 'uint256' },
      { name: 'totalWinnings', type: 'uint256' },
      { name: 'ticketIds', type: 'uint256[]' },
      { name: 'totalDeposits', type: 'uint256' },
      { name: 'lastPlayTime', type: 'uint256' }
    ]
  },
  {
    type: 'function',
    name: 'getPrizeAmount',
    stateMutability: 'view',
    inputs: [
      { name: 'drawId', type: 'uint256' },
      { name: 'matches', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    type: 'function',
    name: 'getWinnersCount',
    stateMutability: 'view',
    inputs: [
      { name: 'drawId', type: 'uint256' },
      { name: 'matches', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    type: 'function',
    name: 'getDrawWinners',
    stateMutability: 'view',
    inputs: [{ name: 'drawId', type: 'uint256' }],
    outputs: [
      { name: 'winners', type: 'address[]' },
      { name: 'matchCounts', type: 'uint256[]' },
      { name: 'prizeAmounts', type: 'uint256[]' },
      { name: 'claimed', type: 'bool[]' }
    ]
  },
  {
    type: 'function',
    name: 'getRolloverAmount',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 'rolloverAmount', type: 'uint256' }]
  },
  // Events
  {
    type: 'event',
    name: 'TicketPurchased',
    inputs: [
      { name: 'player', type: 'address', indexed: true },
      { name: 'ticketId', type: 'uint256', indexed: true },
      { name: 'drawId', type: 'uint256', indexed: true },
      { name: 'numbers', type: 'uint256[5]' },
      { name: 'timestamp', type: 'uint256' }
    ]
  },
  {
    type: 'event',
    name: 'DrawExecuted',
    inputs: [
      { name: 'drawId', type: 'uint256', indexed: true },
      { name: 'winningNumbers', type: 'uint256[5]' },
      { name: 'totalPrizePool', type: 'uint256' },
      { name: 'jackpotAmount', type: 'uint256' },
      { name: 'executor', type: 'address', indexed: true },
      { name: 'executorReward', type: 'uint256' }
    ]
  },
  {
    type: 'event',
    name: 'DrawExecutedByPublic',
    inputs: [
      { name: 'executor', type: 'address', indexed: true },
      { name: 'drawId', type: 'uint256', indexed: true },
      { name: 'reward', type: 'uint256' }
    ]
  },
  {
    type: 'event',
    name: 'EmergencyRefund',
    inputs: [
      { name: 'player', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256' }
    ]
  }
] as const

// Contract addresses for different networks
const CONTRACT_ADDRESSES = {
  kasplex: '0x98a05a361a79eF343C8b0b666566145076AEE5ca', // Kasplex testnet
  igra: '0x8ff583fC58a78ad630A3184826DFC7B4e25072AE', // Igra Labs devnet (updated with 0.1 KAS price)
  hardhat: '0x5FbDB2315678afecb367f032d93F642f64180aa3' // Local hardhat
}

// Get contract address based on environment or default to Kasplex
export const LOTTERY_CONTRACT_ADDRESS = 
  import.meta.env.VITE_CONTRACT_ADDRESS || 
  import.meta.env.VITE_KASPLEX_CONTRACT_ADDRESS || 
  CONTRACT_ADDRESSES.kasplex