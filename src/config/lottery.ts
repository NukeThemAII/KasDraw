// Lottery contract configuration and constants

// Admin wallet address
export const ADMIN_ADDRESS = '0x71d7aCcfB0dFB579b8f00de612890FB875E16eef'

// Lottery game constants
export const LOTTERY_CONFIG = {
  TICKET_PRICE: '0.1', // KAS
  MIN_NUMBER: 1,
  MAX_NUMBER: 49,
  NUMBERS_PER_TICKET: 6,
  DRAWS_PER_WEEK: 2,
  DRAW_DAYS: ['Tuesday', 'Friday'],
  DRAW_TIME: '20:00 UTC',
} as const

// Prize structure percentages
export const PRIZE_STRUCTURE = {
  JACKPOT: 60, // 6 matches
  SECOND_PRIZE: 20, // 5 matches
  THIRD_PRIZE: 15, // 4 matches
  FOURTH_PRIZE: 5, // 3 matches (fixed to total 100%)
  ADMIN_FEE: 1,
} as const

// Contract ABI - Complete interface for KasDrawLottery
export const LOTTERY_ABI = [
  {
    type: 'function',
    name: 'purchaseTickets',
    stateMutability: 'payable',
    inputs: [{ name: 'ticketNumbers', type: 'uint256[6][]' }],
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
    inputs: [{ name: 'winningNumbers', type: 'uint256[6]' }],
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
    name: 'getLotteryState',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'currentDrawId', type: 'uint256' },
      { name: 'totalTicketsSold', type: 'uint256' },
      { name: 'accumulatedJackpot', type: 'uint256' },
      { name: 'adminBalance', type: 'uint256' },
      { name: 'paused', type: 'bool' }
    ]
  },
  {
    type: 'function',
    name: 'getTicket',
    stateMutability: 'view',
    inputs: [{ name: 'ticketId', type: 'uint256' }],
    outputs: [
      { name: 'player', type: 'address' },
      { name: 'numbers', type: 'uint256[6]' },
      { name: 'drawId', type: 'uint256' },
      { name: 'claimed', type: 'bool' }
    ]
  },
  {
    type: 'function',
    name: 'getDraw',
    stateMutability: 'view',
    inputs: [{ name: 'drawId', type: 'uint256' }],
    outputs: [
      { name: 'id', type: 'uint256' },
      { name: 'winningNumbers', type: 'uint256[6]' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'totalPrizePool', type: 'uint256' },
      { name: 'jackpotAmount', type: 'uint256' },
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
      { name: 'ticketIds', type: 'uint256[]' }
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
    name: 'getDrawTickets',
    stateMutability: 'view',
    inputs: [{ name: 'drawId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256[]' }]
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
  }
] as const

// Contract address - will be updated after deployment
export const LOTTERY_CONTRACT_ADDRESS = '0x12Ca0732D05d3b3cf9E7Cf0A0A32fEA11B1eF6dD'