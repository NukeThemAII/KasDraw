import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { ethers } from 'ethers'
import { LOTTERY_ABI, LOTTERY_CONTRACT_ADDRESS, LOTTERY_CONFIG } from '../config/lottery'
import { toast } from 'sonner'

export const useLotteryContract = () => {

  // Get lottery state with polling for live updates
  const { 
    data: lotteryState, 
    refetch: refetchLotteryState,
    error: lotteryStateError,
    isLoading: lotteryStateLoading 
  } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getLotteryStats',
    query: {
      refetchInterval: 5000, // Refetch every 5 seconds for live data
      retry: 3, // Retry failed requests 3 times
      retryDelay: 1000, // Wait 1 second between retries
      staleTime: 2000, // Consider data stale after 2 seconds
    },
  })

  // Debug logging
  console.log('Lottery Contract Debug:', {
    address: LOTTERY_CONTRACT_ADDRESS,
    lotteryState,
    error: lotteryStateError,
    isLoading: lotteryStateLoading
  })

  // Get current draw ID separately
  const { 
    data: currentDrawIdData, 
    refetch: refetchCurrentDrawId 
  } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'currentDrawId',
  })

  // Get admin balance
  const { 
    data: adminBalanceData, 
    refetch: refetchAdminBalance 
  } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'adminBalance',
  })

  // Get paused status
  const { 
    data: pausedData, 
    refetch: refetchPaused 
  } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'paused',
  })

  const { address: account } = useAccount()

  // Get player stats for the connected account
  const { 
    data: playerStats, 
    refetch: refetchPlayerStats 
  } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getPlayerStats',
    args: [account as `0x${string}`],
    query: {
      enabled: !!account,
    },
  })

  // Check if public draw can be executed (enhanced with block validation)
  const { 
    data: canExecuteDrawPublicData, 
    refetch: refetchCanExecuteDrawPublic 
  } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'canExecuteDrawPublic',
    query: {
      refetchInterval: 10000, // Refetch every 10 seconds for countdown updates
      retry: 3, // Retry failed requests 3 times
      retryDelay: 1000, // Wait 1 second between retries
      staleTime: 5000, // Consider data stale after 5 seconds
    },
  })

  // Parse enhanced canExecuteDrawPublic data
  const canExecuteDrawPublic = canExecuteDrawPublicData ? canExecuteDrawPublicData[0] : false
  const timeRemaining = canExecuteDrawPublicData ? Number(canExecuteDrawPublicData[1]) : 0
  const nextDrawTime = canExecuteDrawPublicData ? Number(canExecuteDrawPublicData[2]) : 0
  const blocksRemaining = canExecuteDrawPublicData ? Number(canExecuteDrawPublicData[3]) : 0
  const nextDrawBlock = canExecuteDrawPublicData ? Number(canExecuteDrawPublicData[4]) : 0
  
  // Purchase tickets
  const {
    writeContract: purchaseTickets,
    isPending: isPurchasing,
  } = useWriteContract()

  // Execute draw
  const {
    writeContract: executeDraw,
    isPending: isExecuting,
  } = useWriteContract()

  // Claim prize
  const {
    writeContract: claimPrize,
    isPending: isClaiming,
  } = useWriteContract()

  // Withdraw admin fees
  const {
    writeContract: withdrawAdminFees,
    isPending: isWithdrawing,
  } = useWriteContract()

  // Emergency refund all
  const {
    writeContract: emergencyRefund,
    isPending: isRefunding,
  } = useWriteContract()

  // Helper functions
  const buyTickets = async (ticketNumbers: number[][]) => {
    if (!account) {
      toast.error('Please connect your wallet')
      return
    }

    try {
      // Convert to the format expected by the contract
      const formattedTickets = ticketNumbers.map(ticket => 
        ticket.map(num => BigInt(num))
      )
      
      const totalCost = ethers.parseEther(
        (ticketNumbers.length * parseFloat(LOTTERY_CONFIG.TICKET_PRICE)).toString()
      )

      await purchaseTickets({
        address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
        abi: LOTTERY_ABI,
        functionName: 'purchaseTickets',
        args: [formattedTickets],
        value: totalCost,
      } as any)
      
      toast.success('Tickets purchased successfully!')
      // Refetch lottery state and player stats after successful purchase
      refetchLotteryState()
      refetchCurrentDrawId()
      refetchAdminBalance()
      refetchPaused()
      refetchPlayerStats()
    } catch (error) {
      console.error('Error buying tickets:', error)
      toast.error('Failed to purchase tickets')
    }
  }

  const executeDrawAuto = async () => {
    if (!account) {
      toast.error('Please connect your wallet')
      return
    }

    try {
      await executeDraw({
        address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
        abi: LOTTERY_ABI,
        functionName: 'executeDraw',
      } as any)
      
      toast.success('Draw executed successfully!')
      // Refetch lottery state and player stats after successful draw execution
      refetchLotteryState()
      refetchCurrentDrawId()
      refetchAdminBalance()
      refetchPaused()
      refetchPlayerStats()
    } catch (error) {
      console.error('Error executing draw:', error)
      toast.error('Failed to execute draw')
    }
  }

  const executeDrawPublic = async () => {
    if (!account) {
      toast.error('Please connect your wallet')
      return
    }

    try {
      await executeDraw({
        address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
        abi: LOTTERY_ABI,
        functionName: 'executeDrawPublic',
      } as any)
      
      toast.success('Public draw executed successfully!')
      // Refetch lottery state and player stats after successful draw execution
      refetchLotteryState()
      refetchCurrentDrawId()
      refetchAdminBalance()
      refetchPaused()
      refetchPlayerStats()
    } catch (error) {
      console.error('Error executing public draw:', error)
      toast.error('Failed to execute public draw')
    }
  }

  const executeDrawWithNumbers = async (winningNumbers: number[]) => {
    if (!executeDraw) {
      toast.error('Contract not ready')
      return
    }

    try {
      const formattedNumbers = winningNumbers.map(num => BigInt(num))
      // This would need a separate hook for executeDrawManual
      console.log('Manual draw with numbers:', formattedNumbers)
      toast.info('Manual draw not implemented in this hook')
    } catch (error) {
      console.error('Error executing manual draw:', error)
      toast.error('Failed to prepare manual draw execution')
    }
  }

  const claimTicketPrize = async (ticketId: number) => {
    if (!account) {
      toast.error('Please connect your wallet')
      return
    }

    try {
      await claimPrize({
        address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
        abi: LOTTERY_ABI,
        functionName: 'claimPrize',
        args: [BigInt(ticketId)],
      } as any)
      
      toast.success('Prize claimed successfully!')
      // Refetch lottery state and player stats after successful claim
      refetchLotteryState()
      refetchCurrentDrawId()
      refetchAdminBalance()
      refetchPaused()
      refetchPlayerStats()
    } catch (error) {
      console.error('Error claiming prize:', error)
      toast.error('Failed to claim prize')
    }
  }

  const withdrawAdminFeesAction = async () => {
    if (!account) {
      toast.error('Please connect your wallet')
      return
    }

    try {
      await withdrawAdminFees({
        address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
        abi: LOTTERY_ABI,
        functionName: 'withdrawAdminFees',
      } as any)
      
      toast.success('Admin fees withdrawn successfully!')
      // Refetch lottery state after successful withdrawal
      refetchLotteryState()
      refetchCurrentDrawId()
      refetchAdminBalance()
      refetchPaused()
    } catch (error) {
      console.error('Error withdrawing admin fees:', error)
      toast.error('Failed to withdraw admin fees')
    }
  }

  const emergencyRefundAll = async () => {
    if (!account) {
      toast.error('Please connect your wallet')
      return
    }

    try {
      await emergencyRefund({
        address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
        abi: LOTTERY_ABI,
        functionName: 'emergencyRefundAll',
      } as any)
      
      toast.success('Emergency refund executed successfully!')
      // Refetch lottery state after successful refund
      refetchLotteryState()
      refetchCurrentDrawId()
      refetchAdminBalance()
      refetchPaused()
      refetchPlayerStats()
    } catch (error) {
      console.error('Error executing emergency refund:', error)
      toast.error('Failed to execute emergency refund')
    }
  }

  // Parse lottery state
  const parsedLotteryState = lotteryState ? {
    // getLotteryStats returns: currentJackpot, ticketsSoldThisDraw, totalTickets, nextDraw, executorReward, canExecute
    accumulatedJackpot: ethers.formatEther(lotteryState[0]),
    ticketsSoldThisDraw: Number(lotteryState[1]),
    totalTicketsSold: Number(lotteryState[2]),
    nextDrawTime: Number(lotteryState[3]),
    executorReward: ethers.formatEther(lotteryState[4]),
    canExecute: Boolean(lotteryState[5]),
    currentDrawId: currentDrawIdData ? Number(currentDrawIdData) : 1,
    adminBalance: adminBalanceData ? ethers.formatEther(adminBalanceData) : '0',
    paused: pausedData ? Boolean(pausedData) : false
  } : null

  return {
    lotteryState: parsedLotteryState,
    playerStats,
    refetchLotteryState,
    refetchCurrentDrawId,
    refetchAdminBalance,
    refetchPaused,
    refetchPlayerStats,
    
    // Actions
    buyTickets,
    executeDrawAuto,
    executeDrawPublic,
    executeDrawWithNumbers,
    claimTicketPrize,
    withdrawAdminFees: withdrawAdminFeesAction,
    emergencyRefundAll,
    
    // Public draw utilities (enhanced with block validation)
    canExecuteDrawPublic,
    timeRemaining,
    nextDrawTime,
    blocksRemaining,
    nextDrawBlock,
    refetchCanExecuteDrawPublic,
    
    // Loading states
    isPurchasing,
    isExecutingDraw: isExecuting,
    isClaiming,
    isWithdrawing,
    isRefunding,
  }
}

// Hook for reading ticket data
export const useTicketData = (ticketId: number) => {
  const { data: ticketData } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getTicket',
    args: [BigInt(ticketId)],
  })

  return ticketData ? {
    player: ticketData[0],
    numbers: ticketData[1].map(n => Number(n)),
    drawId: Number(ticketData[2]),
    claimed: ticketData[3],
  } : null
}

// Hook for reading draw data
export const useDrawData = (drawId: number) => {
  const { data: drawData } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getDraw',
    args: [BigInt(drawId)],
  })

  return drawData ? {
    id: Number(drawData[0]),
    winningNumbers: drawData[1].map(n => Number(n)),
    timestamp: Number(drawData[2]),
    totalPrizePool: ethers.formatEther(drawData[3]),
    jackpotAmount: ethers.formatEther(drawData[4]),
    executed: drawData[5],
  } : null
}

// Hook for reading player stats
export const usePlayerStats = (playerAddress: string) => {
  const { data: playerData } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getPlayerStats',
    args: [playerAddress as `0x${string}`],
  })

  return playerData ? {
    totalTickets: Number(playerData[0]),
    totalWinnings: ethers.formatEther(playerData[1]),
    ticketIds: playerData[2].map(id => Number(id)),
  } : null
}