import { useReadContract, useWriteContract, useAccount, useWatchContractEvent } from 'wagmi'
import { ethers } from 'ethers'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

// Contract configuration
const LOTTERY_CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`
const TICKET_PRICE = '10' // 10 KAS per ticket

// Enhanced ABI for V2 contract
const LOTTERY_ABI_V2 = [
  // Read functions
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
      { name: 'canExecute', type: 'bool' },
      { name: 'totalPrizesDistributedAmount', type: 'uint256' },
      { name: 'currentDrawTickets', type: 'uint256' }
    ]
  },
  {
    type: 'function',
    name: 'canExecuteDrawPublic',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'canExecute', type: 'bool' },
      { name: 'timeRemaining', type: 'uint256' },
      { name: 'nextDrawTimeStamp', type: 'uint256' },
      { name: 'blocksRemaining', type: 'uint256' },
      { name: 'nextDrawBlockNumber', type: 'uint256' }
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
      { name: 'lastPlayTime', type: 'uint256' },
      { name: 'totalSpent', type: 'uint256' },
      { name: 'biggestWin', type: 'uint256' }
    ]
  },
  {
    type: 'function',
    name: 'getTicket',
    stateMutability: 'view',
    inputs: [{ name: 'ticketId', type: 'uint256' }],
    outputs: [
      { name: 'player', type: 'address' },
      { name: 'numbers', type: 'uint256[5]' },
      { name: 'drawId', type: 'uint256' },
      { name: 'claimed', type: 'bool' },
      { name: 'purchaseTime', type: 'uint256' },
      { name: 'purchaseBlock', type: 'uint256' }
    ]
  },
  {
    type: 'function',
    name: 'getDraw',
    stateMutability: 'view',
    inputs: [{ name: 'drawId', type: 'uint256' }],
    outputs: [
      { name: 'summary', type: 'tuple', components: [
        { name: 'id', type: 'uint256' },
        { name: 'winningNumbers', type: 'uint256[5]' },
        { name: 'timestamp', type: 'uint256' },
        { name: 'totalPrizePool', type: 'uint256' },
        { name: 'jackpotAmount', type: 'uint256' },
        { name: 'totalTickets', type: 'uint256' },
        { name: 'executed', type: 'bool' },
        { name: 'executor', type: 'address' }
      ]}
    ]
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
    name: 'getRecentDraws',
    stateMutability: 'view',
    inputs: [{ name: 'count', type: 'uint256' }],
    outputs: [
      { name: '', type: 'tuple[]', components: [
        { name: 'id', type: 'uint256' },
        { name: 'winningNumbers', type: 'uint256[5]' },
        { name: 'timestamp', type: 'uint256' },
        { name: 'totalPrizePool', type: 'uint256' },
        { name: 'jackpotAmount', type: 'uint256' },
        { name: 'totalTickets', type: 'uint256' },
        { name: 'executed', type: 'bool' },
        { name: 'executor', type: 'address' }
      ]}
    ]
  },
  {
    type: 'function',
    name: 'currentDrawId',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    type: 'function',
    name: 'getRolloverAmount',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    type: 'function',
    name: 'getCurrentExecutorReward',
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
  // Write functions
  {
    type: 'function',
    name: 'purchaseTickets',
    stateMutability: 'payable',
    inputs: [{ name: 'ticketNumbers', type: 'uint256[5][]' }],
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
  // Events
  {
    type: 'event',
    name: 'TicketPurchased',
    inputs: [
      { name: 'player', type: 'address', indexed: true },
      { name: 'ticketId', type: 'uint256', indexed: true },
      { name: 'drawId', type: 'uint256', indexed: true },
      { name: 'numbers', type: 'uint256[5]' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'totalCost', type: 'uint256' }
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
      { name: 'executorReward', type: 'uint256' },
      { name: 'totalTickets', type: 'uint256' }
    ]
  },
  {
    type: 'event',
    name: 'PrizeClaimed',
    inputs: [
      { name: 'player', type: 'address', indexed: true },
      { name: 'ticketId', type: 'uint256', indexed: true },
      { name: 'drawId', type: 'uint256', indexed: true },
      { name: 'matches', type: 'uint256' },
      { name: 'amount', type: 'uint256' }
    ]
  }
] as const

// Types
export interface LotteryStats {
  currentJackpot: string
  ticketsSoldThisDraw: number
  totalTickets: number
  nextDrawTime: number
  executorReward: string
  canExecute: boolean
  totalPrizesDistributed: string
  currentDrawTickets: number
}

export interface DrawExecutionInfo {
  canExecute: boolean
  timeRemaining: number
  nextDrawTime: number
  blocksRemaining: number
  nextDrawBlock: number
}

export interface PlayerStats {
  totalTickets: number
  totalWinnings: string
  ticketIds: number[]
  totalDeposits: string
  lastPlayTime: number
  totalSpent: string
  biggestWin: string
}

export interface TicketInfo {
  player: string
  numbers: number[]
  drawId: number
  claimed: boolean
  purchaseTime: number
  purchaseBlock: number
}

export interface DrawSummary {
  id: number
  winningNumbers: number[]
  timestamp: number
  totalPrizePool: string
  jackpotAmount: string
  totalTickets: number
  executed: boolean
  executor: string
}

export interface WinnerInfo {
  address: string
  matchCount: number
  prizeAmount: string
  claimed: boolean
}

// Main hook for lottery contract interaction
export const useLotteryContractV2 = () => {
  const { address: account } = useAccount()
  const [isRefreshing, setIsRefreshing] = useState(false)

  // ============ READ HOOKS ============

  // Get lottery statistics with real-time updates
  const {
    data: lotteryStatsData,
    refetch: refetchLotteryStats,
    error: lotteryStatsError,
    isLoading: lotteryStatsLoading
  } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI_V2,
    functionName: 'getLotteryStats',
    query: {
      refetchInterval: 5000, // Refresh every 5 seconds
      retry: 3,
      retryDelay: 1000,
      staleTime: 2000,
    },
  })

  // Get draw execution info
  const {
    data: drawExecutionData,
    refetch: refetchDrawExecution,
    isLoading: drawExecutionLoading
  } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI_V2,
    functionName: 'canExecuteDrawPublic',
    query: {
      refetchInterval: 10000, // Refresh every 10 seconds for countdown
      retry: 3,
      retryDelay: 1000,
      staleTime: 5000,
    },
  })

  // Get current draw ID
  const {
    data: currentDrawIdData,
    refetch: refetchCurrentDrawId
  } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI_V2,
    functionName: 'currentDrawId',
    query: {
      refetchInterval: 30000, // Refresh every 30 seconds
    },
  })

  // Get player stats for connected account
  const {
    data: playerStatsData,
    refetch: refetchPlayerStats,
    isLoading: playerStatsLoading
  } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI_V2,
    functionName: 'getPlayerStats',
    args: account ? [account] : undefined,
    query: {
      enabled: !!account,
      refetchInterval: 15000, // Refresh every 15 seconds
    },
  })

  // Get rollover amount
  const {
    data: rolloverAmountData,
    refetch: refetchRolloverAmount
  } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI_V2,
    functionName: 'getRolloverAmount',
    query: {
      refetchInterval: 10000, // Refresh every 10 seconds
    },
  })

  // Get paused status
  const {
    data: pausedData,
    refetch: refetchPaused
  } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI_V2,
    functionName: 'paused',
  })

  // ============ WRITE HOOKS ============

  const {
    writeContract: purchaseTicketsWrite,
    isPending: isPurchasing,
    error: purchaseError
  } = useWriteContract()

  const {
    writeContract: executeDrawWrite,
    isPending: isExecutingDraw,
    error: executeError
  } = useWriteContract()

  const {
    writeContract: claimPrizeWrite,
    isPending: isClaiming,
    error: claimError
  } = useWriteContract()

  // ============ EVENT LISTENERS ============

  // Listen for ticket purchases
  useWatchContractEvent({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI_V2,
    eventName: 'TicketPurchased',
    onLogs(logs) {
      console.log('Ticket purchased:', logs)
      // Refresh relevant data
      refetchLotteryStats()
      refetchPlayerStats()
    },
  })

  // Listen for draw executions
  useWatchContractEvent({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI_V2,
    eventName: 'DrawExecuted',
    onLogs(logs) {
      console.log('Draw executed:', logs)
      toast.success('Draw executed! Check results.')
      // Refresh all data
      refreshAllData()
    },
  })

  // Listen for prize claims
  useWatchContractEvent({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI_V2,
    eventName: 'PrizeClaimed',
    onLogs(logs) {
      console.log('Prize claimed:', logs)
      if (logs.some(log => log.args.player === account)) {
        toast.success('Prize claimed successfully!')
      }
      refetchPlayerStats()
    },
  })

  // ============ HELPER FUNCTIONS ============

  const refreshAllData = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        refetchLotteryStats(),
        refetchDrawExecution(),
        refetchCurrentDrawId(),
        refetchPlayerStats(),
        refetchRolloverAmount(),
        refetchPaused()
      ])
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [
    refetchLotteryStats,
    refetchDrawExecution,
    refetchCurrentDrawId,
    refetchPlayerStats,
    refetchRolloverAmount,
    refetchPaused
  ])

  // ============ ACTION FUNCTIONS ============

  const purchaseTickets = async (ticketNumbers: number[][]) => {
    if (!account) {
      toast.error('Please connect your wallet')
      return false
    }

    if (!ticketNumbers.length) {
      toast.error('No tickets to purchase')
      return false
    }

    try {
      // Validate ticket numbers
      for (const ticket of ticketNumbers) {
        if (ticket.length !== 5) {
          toast.error('Each ticket must have exactly 5 numbers')
          return false
        }
        
        const uniqueNumbers = new Set(ticket)
        if (uniqueNumbers.size !== 5) {
          toast.error('Ticket numbers must be unique')
          return false
        }
        
        for (const num of ticket) {
          if (num < 1 || num > 35) {
            toast.error('Numbers must be between 1 and 35')
            return false
          }
        }
      }

      const formattedTickets = ticketNumbers.map(ticket => 
        ticket.map(num => BigInt(num))
      )
      
      const totalCost = ethers.parseEther(
        (ticketNumbers.length * parseFloat(TICKET_PRICE)).toString()
      )

      await purchaseTicketsWrite({
        address: LOTTERY_CONTRACT_ADDRESS,
        abi: LOTTERY_ABI_V2,
        functionName: 'purchaseTickets',
        args: [formattedTickets],
        value: totalCost,
      })
      
      toast.success(`${ticketNumbers.length} ticket(s) purchased successfully!`)
      return true
    } catch (error) {
      console.error('Error purchasing tickets:', error)
      toast.error('Failed to purchase tickets')
      return false
    }
  }

  const executeDrawPublic = async () => {
    if (!account) {
      toast.error('Please connect your wallet')
      return false
    }

    try {
      await executeDrawWrite({
        address: LOTTERY_CONTRACT_ADDRESS,
        abi: LOTTERY_ABI_V2,
        functionName: 'executeDrawPublic',
      })
      
      toast.success('Draw execution initiated!')
      return true
    } catch (error) {
      console.error('Error executing draw:', error)
      toast.error('Failed to execute draw')
      return false
    }
  }

  const claimPrize = async (ticketId: number) => {
    if (!account) {
      toast.error('Please connect your wallet')
      return false
    }

    try {
      await claimPrizeWrite({
        address: LOTTERY_CONTRACT_ADDRESS,
        abi: LOTTERY_ABI_V2,
        functionName: 'claimPrize',
        args: [BigInt(ticketId)],
      })
      
      toast.success('Prize claim initiated!')
      return true
    } catch (error) {
      console.error('Error claiming prize:', error)
      toast.error('Failed to claim prize')
      return false
    }
  }

  // ============ PARSED DATA ============

  const lotteryStats: LotteryStats | null = lotteryStatsData ? {
    currentJackpot: ethers.formatEther(lotteryStatsData[0]),
    ticketsSoldThisDraw: Number(lotteryStatsData[1]),
    totalTickets: Number(lotteryStatsData[2]),
    nextDrawTime: Number(lotteryStatsData[3]),
    executorReward: ethers.formatEther(lotteryStatsData[4]),
    canExecute: Boolean(lotteryStatsData[5]),
    totalPrizesDistributed: ethers.formatEther(lotteryStatsData[6]),
    currentDrawTickets: Number(lotteryStatsData[7])
  } : null

  const drawExecutionInfo: DrawExecutionInfo | null = drawExecutionData ? {
    canExecute: Boolean(drawExecutionData[0]),
    timeRemaining: Number(drawExecutionData[1]),
    nextDrawTime: Number(drawExecutionData[2]),
    blocksRemaining: Number(drawExecutionData[3]),
    nextDrawBlock: Number(drawExecutionData[4])
  } : null

  const playerStats: PlayerStats | null = playerStatsData ? {
    totalTickets: Number(playerStatsData[0]),
    totalWinnings: ethers.formatEther(playerStatsData[1]),
    ticketIds: playerStatsData[2].map(id => Number(id)),
    totalDeposits: ethers.formatEther(playerStatsData[3]),
    lastPlayTime: Number(playerStatsData[4]),
    totalSpent: ethers.formatEther(playerStatsData[5]),
    biggestWin: ethers.formatEther(playerStatsData[6])
  } : null

  const currentDrawId = currentDrawIdData ? Number(currentDrawIdData) : 1
  const rolloverAmount = rolloverAmountData ? ethers.formatEther(rolloverAmountData) : '0'
  const isPaused = pausedData ? Boolean(pausedData) : false

  return {
    // Data
    lotteryStats,
    drawExecutionInfo,
    playerStats,
    currentDrawId,
    rolloverAmount,
    isPaused,
    
    // Loading states
    isLoading: lotteryStatsLoading || drawExecutionLoading || playerStatsLoading,
    isRefreshing,
    
    // Action states
    isPurchasing,
    isExecutingDraw,
    isClaiming,
    
    // Errors
    lotteryStatsError,
    purchaseError,
    executeError,
    claimError,
    
    // Actions
    purchaseTickets,
    executeDrawPublic,
    claimPrize,
    refreshAllData,
    
    // Manual refresh functions
    refetchLotteryStats,
    refetchDrawExecution,
    refetchCurrentDrawId,
    refetchPlayerStats,
    refetchRolloverAmount,
    refetchPaused
  }
}

// Hook for getting ticket details
export const useTicketDetails = (ticketId: number) => {
  const { data, isLoading, error, refetch } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI_V2,
    functionName: 'getTicket',
    args: [BigInt(ticketId)],
    query: {
      enabled: ticketId > 0,
    },
  })

  const ticketInfo: TicketInfo | null = data ? {
    player: data[0],
    numbers: data[1].map(n => Number(n)),
    drawId: Number(data[2]),
    claimed: data[3],
    purchaseTime: Number(data[4]),
    purchaseBlock: Number(data[5])
  } : null

  return {
    ticketInfo,
    isLoading,
    error,
    refetch
  }
}

// Hook for getting draw details
export const useDrawDetails = (drawId: number) => {
  const { data, isLoading, error, refetch } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI_V2,
    functionName: 'getDraw',
    args: [BigInt(drawId)],
    query: {
      enabled: drawId > 0,
    },
  })

  const drawSummary: DrawSummary | null = data ? {
    id: Number(data.summary.id),
    winningNumbers: data.summary.winningNumbers.map(n => Number(n)),
    timestamp: Number(data.summary.timestamp),
    totalPrizePool: ethers.formatEther(data.summary.totalPrizePool),
    jackpotAmount: ethers.formatEther(data.summary.jackpotAmount),
    totalTickets: Number(data.summary.totalTickets),
    executed: data.summary.executed,
    executor: data.summary.executor
  } : null

  return {
    drawSummary,
    isLoading,
    error,
    refetch
  }
}

// Hook for getting draw winners
export const useDrawWinners = (drawId: number) => {
  const { data, isLoading, error, refetch } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI_V2,
    functionName: 'getDrawWinners',
    args: [BigInt(drawId)],
    query: {
      enabled: drawId > 0,
      refetchInterval: 30000, // Refresh every 30 seconds
    },
  })

  const winners: WinnerInfo[] = data ? 
    data[0].map((address, index) => ({
      address: address,
      matchCount: Number(data[1][index]),
      prizeAmount: ethers.formatEther(data[2][index]),
      claimed: data[3][index]
    })) : []

  return {
    winners,
    isLoading,
    error,
    refetch
  }
}

// Hook for getting recent draws
export const useRecentDraws = (count: number = 10) => {
  const { data, isLoading, error, refetch } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI_V2,
    functionName: 'getRecentDraws',
    args: [BigInt(count)],
    query: {
      refetchInterval: 60000, // Refresh every minute
    },
  })

  const recentDraws: DrawSummary[] = data ? 
    data.map(draw => ({
      id: Number(draw.id),
      winningNumbers: draw.winningNumbers.map(n => Number(n)),
      timestamp: Number(draw.timestamp),
      totalPrizePool: ethers.formatEther(draw.totalPrizePool),
      jackpotAmount: ethers.formatEther(draw.jackpotAmount),
      totalTickets: Number(draw.totalTickets),
      executed: draw.executed,
      executor: draw.executor
    })) : []

  return {
    recentDraws,
    isLoading,
    error,
    refetch
  }
}

export default useLotteryContractV2