import { useContract, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi'
import { ethers } from 'ethers'
import { LOTTERY_ABI, LOTTERY_CONTRACT_ADDRESS, LOTTERY_CONFIG } from '../config/lottery'
import { toast } from 'sonner'

export const useLotteryContract = () => {
  // Get contract instance
  const contract = useContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
  })

  // Read lottery state
  const { data: lotteryState, refetch: refetchLotteryState } = useContractRead({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getLotteryState',
    watch: true,
  })

  // Purchase tickets
  const { config: purchaseConfig } = usePrepareContractWrite({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'purchaseTickets',
  })

  const { write: purchaseTickets, isLoading: isPurchasing } = useContractWrite({
    ...purchaseConfig,
    onSuccess: (data) => {
      toast.success('Tickets purchased successfully!')
      refetchLotteryState()
    },
    onError: (error) => {
      console.error('Purchase failed:', error)
      toast.error('Failed to purchase tickets')
    },
  })

  // Execute draw (admin only)
  const { config: drawConfig } = usePrepareContractWrite({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'executeDraw',
  })

  const { write: executeDraw, isLoading: isExecutingDraw } = useContractWrite({
    ...drawConfig,
    onSuccess: (data) => {
      toast.success('Draw executed successfully!')
      refetchLotteryState()
    },
    onError: (error) => {
      console.error('Draw execution failed:', error)
      toast.error('Failed to execute draw')
    },
  })

  // Claim prize
  const { config: claimConfig } = usePrepareContractWrite({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'claimPrize',
  })

  const { write: claimPrize, isLoading: isClaiming } = useContractWrite({
    ...claimConfig,
    onSuccess: (data) => {
      toast.success('Prize claimed successfully!')
      refetchLotteryState()
    },
    onError: (error) => {
      console.error('Claim failed:', error)
      toast.error('Failed to claim prize')
    },
  })

  // Withdraw admin fees
  const { config: withdrawConfig } = usePrepareContractWrite({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'withdrawAdminFees',
  })

  const { write: withdrawAdminFees, isLoading: isWithdrawing } = useContractWrite({
    ...withdrawConfig,
    onSuccess: (data) => {
      toast.success('Admin fees withdrawn successfully!')
      refetchLotteryState()
    },
    onError: (error) => {
      console.error('Withdrawal failed:', error)
      toast.error('Failed to withdraw admin fees')
    },
  })

  // Helper functions
  const buyTickets = async (ticketNumbers: number[][]) => {
    if (!purchaseTickets) {
      toast.error('Contract not ready')
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

      purchaseTickets({
        args: [formattedTickets],
        value: totalCost,
      })
    } catch (error) {
      console.error('Error buying tickets:', error)
      toast.error('Failed to prepare ticket purchase')
    }
  }

  const executeDrawWithNumbers = async (winningNumbers: number[]) => {
    if (!executeDraw) {
      toast.error('Contract not ready')
      return
    }

    try {
      const formattedNumbers = winningNumbers.map(num => BigInt(num))
      executeDraw({
        args: [formattedNumbers],
      })
    } catch (error) {
      console.error('Error executing draw:', error)
      toast.error('Failed to prepare draw execution')
    }
  }

  const claimTicketPrize = async (ticketId: number) => {
    if (!claimPrize) {
      toast.error('Contract not ready')
      return
    }

    try {
      claimPrize({
        args: [BigInt(ticketId)],
      })
    } catch (error) {
      console.error('Error claiming prize:', error)
      toast.error('Failed to prepare prize claim')
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
    contract,
    lotteryState: parsedLotteryState,
    refetchLotteryState,
    
    // Actions
    buyTickets,
    executeDrawWithNumbers,
    claimTicketPrize,
    withdrawAdminFees,
    
    // Loading states
    isPurchasing,
    isExecutingDraw,
    isClaiming,
    isWithdrawing,
  }
}

// Hook for reading ticket data
export const useTicketData = (ticketId: number) => {
  const { data: ticketData } = useContractRead({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getTicket',
    args: [BigInt(ticketId)],
    enabled: ticketId > 0,
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
  const { data: drawData } = useContractRead({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getDraw',
    args: [BigInt(drawId)],
    enabled: drawId > 0,
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
  const { data: playerData } = useContractRead({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getPlayerStats',
    args: [playerAddress as `0x${string}`],
    enabled: !!playerAddress,
  })

  return playerData ? {
    totalTickets: Number(playerData[0]),
    totalWinnings: ethers.formatEther(playerData[1]),
    ticketIds: playerData[2].map(id => Number(id)),
  } : null
}