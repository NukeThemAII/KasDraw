import { useReadContract } from 'wagmi'
import { LOTTERY_ABI, LOTTERY_CONTRACT_ADDRESS } from '../config/lottery'
import { formatEther } from 'viem'

export interface WinnerInfo {
  address: string
  matchCount: number
  prizeAmount: string
  claimed: boolean
}

export function useDrawWinners(drawId: number) {
  const { data, isLoading, error, refetch } = useReadContract({
    abi: LOTTERY_ABI,
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    functionName: 'getDrawWinners',
    args: [BigInt(drawId)],
    query: {
      enabled: drawId > 0,
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  })

  const winners: WinnerInfo[] = data ? (
    (data as [string[], bigint[], bigint[], boolean[]]).map((_, index) => ({
      address: (data as [string[], bigint[], bigint[], boolean[]])[0][index],
      matchCount: Number((data as [string[], bigint[], bigint[], boolean[]])[1][index]),
      prizeAmount: formatEther((data as [string[], bigint[], bigint[], boolean[]])[2][index]),
      claimed: (data as [string[], bigint[], bigint[], boolean[]])[3][index],
    }))
  ) : []

  return {
    winners,
    isLoading,
    error,
    refetch,
  }
}

export function useRolloverAmount() {
  const { data, isLoading, error, refetch } = useReadContract({
    abi: LOTTERY_ABI,
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    functionName: 'getRolloverAmount',
    query: {
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  })

  const rolloverAmount = data ? formatEther(data as bigint) : '0'

  return {
    rolloverAmount,
    isLoading,
    error,
    refetch,
  }
}

export function useLastFourDrawsWinners() {
  // Get current draw ID from the contract
  const { data: currentDrawIdData } = useReadContract({
    abi: LOTTERY_ABI,
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    functionName: 'currentDrawId',
  })

  const currentDrawId = currentDrawIdData ? Number(currentDrawIdData) : 1
  
  // Get winners for last 4 draws (excluding current draw)
  const lastDrawIds = Array.from({ length: 4 }, (_, i) => currentDrawId - 1 - i).filter(id => id > 0)
  
  const drawWinners = lastDrawIds.map(drawId => {
    const { winners, isLoading, error } = useDrawWinners(drawId)
    return { drawId, winners, isLoading, error }
  })

  const allWinners = drawWinners.flatMap(({ winners, drawId }) => 
    winners.map(winner => ({ ...winner, drawId }))
  )

  const isLoading = drawWinners.some(({ isLoading }) => isLoading)
  const hasError = drawWinners.some(({ error }) => error)

  return {
    allWinners,
    drawWinners,
    isLoading,
    hasError,
  }
}