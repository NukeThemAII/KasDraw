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
  JACKPOT: 50, // 6 matches
  SECOND_PRIZE: 20, // 5 matches
  THIRD_PRIZE: 15, // 4 matches
  FOURTH_PRIZE: 14, // 3 matches
  ADMIN_FEE: 1,
} as const

// Contract ABI - Complete interface for KasDrawLottery
export const LOTTERY_ABI = [
  // Write functions
  'function purchaseTickets(uint256[][6] calldata ticketNumbers) external payable',
  'function executeDraw(uint256[6] calldata winningNumbers) external',
  'function claimPrize(uint256 ticketId) external',
  'function withdrawAdminFees() external',
  'function pause() external',
  'function unpause() external',
  
  // View functions
  'function getLotteryState() external view returns (uint256 currentDrawId, uint256 totalTicketsSold, uint256 accumulatedJackpot, uint256 adminBalance, bool paused)',
  'function getTicket(uint256 ticketId) external view returns (address player, uint256[6] numbers, uint256 drawId, bool claimed)',
  'function getDraw(uint256 drawId) external view returns (uint256 id, uint256[6] winningNumbers, uint256 timestamp, uint256 totalPrizePool, uint256 jackpotAmount, bool executed)',
  'function getPlayerStats(address player) external view returns (uint256 totalTickets, uint256 totalWinnings, uint256[] ticketIds)',
  'function getWinnersCount(uint256 drawId, uint256 matches) external view returns (uint256)',
  'function getPrizeAmount(uint256 drawId, uint256 matches) external view returns (uint256)',
  'function getDrawTickets(uint256 drawId) external view returns (uint256[])',
  
  // Constants
  'function TICKET_PRICE() external view returns (uint256)',
  'function NUMBERS_PER_TICKET() external view returns (uint256)',
  'function MAX_NUMBER() external view returns (uint256)',
  'function MIN_NUMBER() external view returns (uint256)',
  'function ADMIN_FEE_PERCENTAGE() external view returns (uint256)',
  
  // Ownership
  'function owner() external view returns (address)',
  'function paused() external view returns (bool)',
  
  // State variables
  'function currentDrawId() external view returns (uint256)',
  'function totalTicketsSold() external view returns (uint256)',
  'function accumulatedJackpot() external view returns (uint256)',
  'function adminBalance() external view returns (uint256)',
  
  // Events
  'event TicketPurchased(address indexed player, uint256 indexed ticketId, uint256 indexed drawId, uint256[6] numbers)',
  'event DrawExecuted(uint256 indexed drawId, uint256[6] winningNumbers, uint256 totalPrizePool, uint256 jackpotAmount)',
  'event PrizeClaimed(address indexed player, uint256 indexed ticketId, uint256 matches, uint256 amount)',
  'event AdminFeesWithdrawn(address indexed admin, uint256 amount)'
] as const

// Contract address - will be updated after deployment
export const LOTTERY_CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'