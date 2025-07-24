import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { ethers } from 'ethers'
import { LOTTERY_ABI, LOTTERY_CONTRACT_ADDRESS, LOTTERY_CONFIG } from '../config/lottery'
import { toast } from 'sonner'

export const useLotteryContract = () => {

  // Get lottery state
  const { 
    data: lotteryState, 
    refetch: refetchLotteryState 
  } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getLotteryState',
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

  // Check if public draw can be executed
  const { 
    data: canExecuteDrawPublic, 
    refetch: refetchCanExecuteDrawPublic 
  } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'canExecuteDrawPublic',
  })
  
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
    } catch (error) {
      console.error('Error withdrawing admin fees:', error)
      toast.error('Failed to withdraw admin fees')
    }
  }

  // Parse lottery state
  const parsedLotteryState = lotteryState ? {
    currentDrawId: Number(lotteryState[0]),
    totalTicketsSold: Number(lotteryState[1]),
    accumulatedJackpot: ethers.formatEther(lotteryState[2]),
    adminBalance: ethers.formatEther(lotteryState[3]),
    paused: lotteryState[4],
  } : null

  return {
    lotteryState: parsedLotteryState,
    playerStats,
    refetchLotteryState,
    refetchPlayerStats,
    
    // Actions
    buyTickets,
    executeDrawAuto,
    executeDrawPublic,
    executeDrawWithNumbers,
    claimTicketPrize,
    withdrawAdminFees: withdrawAdminFeesAction,
    
    // Public draw utilities
    canExecuteDrawPublic,
    refetchCanExecuteDrawPublic,
    
    // Loading states
    isPurchasing,
    isExecutingDraw: isExecuting,
    isClaiming,
    isWithdrawing,
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