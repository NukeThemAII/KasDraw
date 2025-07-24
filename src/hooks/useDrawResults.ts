import { useReadContract } from 'wagmi'
import { ethers } from 'ethers'
import { LOTTERY_ABI, LOTTERY_CONTRACT_ADDRESS } from '../config/lottery'
import { useMemo } from 'react'

export interface DrawResult {
  id: number
  date: string
  winningNumbers: number[]
  jackpotAmount: string
  totalPrizePool: string
  winners: {
    jackpot: number
    second: number
    third: number
    fourth: number
  }
  prizeAmounts: {
    jackpot: string
    second: string
    third: string
    fourth: string
  }
  totalTickets: number
  executed: boolean
}

export const useDrawResults = () => {
  // Get lottery state (includes totalTicketsSold)
  const { 
    data: lotteryState, 
    refetch: refetchLotteryState,
    isLoading: isLoadingState 
  } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getLotteryStats',
  })

  // Get current draw ID separately
  const { data: currentDrawIdData } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'currentDrawId',
  })

  const currentDrawId = currentDrawIdData ? Number(currentDrawIdData) : 1
  const totalTicketsSold = lotteryState ? Number(lotteryState[2]) : 0

  // Get current draw data
  const { 
    data: currentDrawData, 
    refetch: refetchCurrentDraw,
    isLoading: isLoadingDraw 
  } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getDraw',
    args: [BigInt(currentDrawId)],
    query: {
      enabled: !!currentDrawId,
    },
  })

  // Get previous draw data (if exists)
  const { 
    data: previousDrawData,
    refetch: refetchPreviousDraw 
  } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getDraw',
    args: [BigInt(Math.max(1, currentDrawId - 1))],
    query: {
      enabled: !!currentDrawId && currentDrawId > 1,
    },
  })

  // Get winner counts for current draw (updated for 5-number system)
  const { data: winnersCount5 } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getWinnersCount',
    args: [BigInt(currentDrawId), BigInt(5)],
    query: {
      enabled: !!currentDrawData && Boolean(currentDrawData[7]), // only if draw is executed
    },
  })

  const { data: winnersCount4 } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getWinnersCount',
    args: [BigInt(currentDrawId), BigInt(4)],
    query: {
      enabled: !!currentDrawData && Boolean(currentDrawData[7]),
    },
  })

  const { data: winnersCount3 } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getWinnersCount',
    args: [BigInt(currentDrawId), BigInt(3)],
    query: {
      enabled: !!currentDrawData && Boolean(currentDrawData[7]),
    },
  })

  const { data: winnersCount2 } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getWinnersCount',
    args: [BigInt(currentDrawId), BigInt(2)],
    query: {
      enabled: !!currentDrawData && Boolean(currentDrawData[7]),
    },
  })

  // Get prize amounts for current draw (updated for 5-number system)
  const { data: prizeAmount5 } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getPrizeAmount',
    args: [BigInt(currentDrawId), BigInt(5)],
    query: {
      enabled: !!currentDrawData && Boolean(currentDrawData[7]),
    },
  })

  const { data: prizeAmount4 } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getPrizeAmount',
    args: [BigInt(currentDrawId), BigInt(4)],
    query: {
      enabled: !!currentDrawData && Boolean(currentDrawData[7]),
    },
  })

  const { data: prizeAmount3 } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getPrizeAmount',
    args: [BigInt(currentDrawId), BigInt(3)],
    query: {
      enabled: !!currentDrawData && Boolean(currentDrawData[7]),
    },
  })

  const { data: prizeAmount2 } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getPrizeAmount',
    args: [BigInt(currentDrawId), BigInt(2)],
    query: {
      enabled: !!currentDrawData && Boolean(currentDrawData[7]),
    },
  })

  // Process draw results
  const drawResults = useMemo(() => {
    const results: DrawResult[] = []

    // Process current draw if executed
    if (currentDrawData && Boolean(currentDrawData[7])) { // executed
      const drawResult: DrawResult = {
        id: Number(currentDrawData[0]),
        date: new Date(Number(currentDrawData[2]) * 1000).toISOString().split('T')[0],
        winningNumbers: currentDrawData[1].map((n: bigint) => Number(n)),
        jackpotAmount: ethers.formatEther(currentDrawData[4]),
        totalPrizePool: ethers.formatEther(currentDrawData[3]),
        winners: {
          jackpot: winnersCount5 ? Number(winnersCount5) : 0,
          second: winnersCount4 ? Number(winnersCount4) : 0,
          third: winnersCount3 ? Number(winnersCount3) : 0,
          fourth: winnersCount2 ? Number(winnersCount2) : 0,
        },
        prizeAmounts: {
          jackpot: prizeAmount5 ? ethers.formatEther(prizeAmount5) : '0',
          second: prizeAmount4 ? ethers.formatEther(prizeAmount4) : '0',
          third: prizeAmount3 ? ethers.formatEther(prizeAmount3) : '0',
          fourth: prizeAmount2 ? ethers.formatEther(prizeAmount2) : '0',
        },
        totalTickets: totalTicketsSold,
        executed: true
      }
      results.push(drawResult)
    }

    // Process previous draw if exists and executed
    if (previousDrawData && Boolean(previousDrawData[7]) && currentDrawId > 1) {
      const prevDrawResult: DrawResult = {
        id: Number(previousDrawData[0]),
        date: new Date(Number(previousDrawData[2]) * 1000).toISOString().split('T')[0],
        winningNumbers: previousDrawData[1].map((n: bigint) => Number(n)),
        jackpotAmount: ethers.formatEther(previousDrawData[4]),
        totalPrizePool: ethers.formatEther(previousDrawData[3]),
        winners: {
          jackpot: 0, // Would need additional calls for previous draw
          second: 0,
          third: 0,
          fourth: 0,
        },
        prizeAmounts: {
          jackpot: '0',
          second: '0',
          third: '0',
          fourth: '0',
        },
        totalTickets: 0,
        executed: true
      }
      results.push(prevDrawResult)
    }

    return results.sort((a, b) => b.id - a.id) // Sort by draw ID descending
  }, [
    currentDrawData,
    previousDrawData,
    winnersCount5,
    winnersCount4,
    winnersCount3,
    winnersCount2,
    prizeAmount5,
    prizeAmount4,
    prizeAmount3,
    prizeAmount2,
    totalTicketsSold,
    currentDrawId
  ])

  const refetchAll = async () => {
    await Promise.all([
      refetchLotteryState(),
      refetchCurrentDraw(),
      refetchPreviousDraw()
    ])
  }

  return {
    drawResults,
    currentDrawId,
    isLoading: isLoadingState || isLoadingDraw,
    refetch: refetchAll,
    lotteryState: lotteryState ? {
      currentDrawId: Number(lotteryState[0]),
      totalTicketsSold: Number(lotteryState[1]),
      accumulatedJackpot: ethers.formatEther(lotteryState[2]),
      adminBalance: ethers.formatEther(lotteryState[3]),
      paused: lotteryState[4],
    } : null
  }
}

// Hook for getting latest executed draw
export const useLatestDraw = () => {
  const { drawResults, isLoading } = useDrawResults()
  
  const latestDraw = useMemo(() => {
    return drawResults.find(draw => draw.executed) || null
  }, [drawResults])

  return {
    latestDraw,
    isLoading
  }
}