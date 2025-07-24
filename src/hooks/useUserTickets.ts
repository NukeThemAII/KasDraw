import { useState, useEffect, useMemo } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { LOTTERY_ABI, LOTTERY_CONTRACT_ADDRESS } from '../config/lottery'
import { useLotteryContract } from './useLotteryContract'
import { useLatestDraw } from './useDrawResults'
import { ethers } from 'ethers'

export interface UserTicket {
  id: number
  numbers: number[]
  drawId: number
  claimed: boolean
  matches?: number
  prizeAmount?: string
  canClaim?: boolean
  isWinner?: boolean
  prizeType?: string
}

export const useUserTickets = () => {
  const { address } = useAccount()
  const { playerStats, lotteryState } = useLotteryContract()
  const { latestDraw } = useLatestDraw()
  const [userTickets, setUserTickets] = useState<UserTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)

  // Get ticket IDs from player stats
  const ticketIds = useMemo(() => {
    if (!playerStats || !playerStats[2]) return []
    return Array.isArray(playerStats[2]) 
      ? playerStats[2].map((id: any) => Number(id))
      : []
  }, [playerStats])

  // Fetch individual ticket data
  const ticketQueries = ticketIds.map(ticketId => {
    return useReadContract({
      address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
      abi: LOTTERY_ABI,
      functionName: 'getTicket',
      args: [BigInt(ticketId)] as const,
      query: {
        enabled: !!ticketId,
      },
    })
  })

  // Get prize amounts for different match levels
  const { data: prizeAmount6 } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getPrizeAmount',
    args: [BigInt(latestDraw?.id || 1), BigInt(6)] as const,
    query: { enabled: !!latestDraw?.executed }
  })

  const { data: prizeAmount5 } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getPrizeAmount',
    args: [BigInt(latestDraw?.id || 1), BigInt(5)] as const,
    query: { enabled: !!latestDraw?.executed }
  })

  const { data: prizeAmount4 } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getPrizeAmount',
    args: [BigInt(latestDraw?.id || 1), BigInt(4)] as const,
    query: { enabled: !!latestDraw?.executed }
  })

  const { data: prizeAmount3 } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getPrizeAmount',
    args: [BigInt(latestDraw?.id || 1), BigInt(3)] as const,
    query: { enabled: !!latestDraw?.executed }
  })

  // New prize tier for 2 matches
  const { data: prizeAmount2 } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getPrizeAmount',
    args: [BigInt(latestDraw?.id || 1), BigInt(2)] as const,
    query: { enabled: !!latestDraw?.executed }
  })

  useEffect(() => {
    const processTickets = async () => {
      // Enhanced initialization check
      if (!isInitialized && address) {
        setIsInitialized(true)
      }

      if (!address) {
        setUserTickets([])
        setLoading(false)
        setError(null)
        setIsInitialized(false)
        return
      }

      if (ticketQueries.length === 0) {
        setUserTickets([])
        setLoading(false)
        setError(null)
        return
      }

      try {
        setError(null)
        setLoading(true)
        const tickets: UserTicket[] = []
        let hasValidData = false

        for (let i = 0; i < ticketQueries.length; i++) {
          const query = ticketQueries[i]
          
          // Enhanced data validation
          if (query.data && !query.error && !query.isLoading) {
            hasValidData = true
            const ticketData = query.data
            const ticketId = ticketIds[i]
            
            // Parse ticket data
            const ticket: UserTicket = {
              id: ticketId,
              numbers: (ticketData[1] as unknown as bigint[]).map(n => Number(n)),
              drawId: Number(ticketData[2]),
              claimed: ticketData[3] as boolean,
            }

            // Calculate matches if draw is executed
            if (latestDraw && latestDraw.executed && ticket.drawId === latestDraw.id) {
              let matches = 0
              for (const ticketNum of ticket.numbers) {
                for (const winningNum of latestDraw.winningNumbers) {
                  if (ticketNum === winningNum) {
                    matches++
                    break
                  }
                }
              }

              ticket.matches = matches
              ticket.isWinner = matches >= 2 // Updated to include 2+ matches

              // Enhanced prize information with new 2-match tier
              if (matches >= 5) { // Updated for 5-number lottery
                ticket.prizeType = 'JACKPOT'
                const amount = prizeAmount5 && typeof prizeAmount5 === 'bigint' ? prizeAmount5 : BigInt(0)
                ticket.prizeAmount = ethers.formatEther(amount)
                ticket.canClaim = !ticket.claimed && parseFloat(ticket.prizeAmount) > 0
              } else if (matches >= 4) {
                ticket.prizeType = '2nd Prize'
                const amount = prizeAmount4 && typeof prizeAmount4 === 'bigint' ? prizeAmount4 : BigInt(0)
                ticket.prizeAmount = ethers.formatEther(amount)
                ticket.canClaim = !ticket.claimed && parseFloat(ticket.prizeAmount) > 0
              } else if (matches >= 3) {
                ticket.prizeType = '3rd Prize'
                const amount = prizeAmount3 && typeof prizeAmount3 === 'bigint' ? prizeAmount3 : BigInt(0)
                ticket.prizeAmount = ethers.formatEther(amount)
                ticket.canClaim = !ticket.claimed && parseFloat(ticket.prizeAmount) > 0
              } else if (matches >= 2) {
                ticket.prizeType = '4th Prize' // New tier for 2 matches
                const amount = prizeAmount2 && typeof prizeAmount2 === 'bigint' ? prizeAmount2 : BigInt(0)
                ticket.prizeAmount = ethers.formatEther(amount)
                ticket.canClaim = !ticket.claimed && parseFloat(ticket.prizeAmount) > 0
              } else {
                ticket.prizeType = 'No Prize'
                ticket.prizeAmount = '0'
                ticket.canClaim = false
              }
            }

            tickets.push(ticket)
          }
        }

        // Enhanced data validation before setting state
        if (hasValidData || tickets.length > 0) {
          // Sort tickets by ID descending (newest first)
          tickets.sort((a, b) => b.id - a.id)
          setUserTickets(tickets)
          setRetryCount(0) // Reset retry count on success
        } else if (retryCount < 3) {
          // Retry logic for failed data loading
          setTimeout(() => {
            setRetryCount(prev => prev + 1)
          }, 1000 * (retryCount + 1)) // Exponential backoff
          return // Don't set loading to false yet
        }
      } catch (error) {
        console.error('Error processing tickets:', error)
        
        // Enhanced error handling with retry logic
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1)
          }, 2000 * (retryCount + 1))
          setError(`Loading tickets... (attempt ${retryCount + 1}/3)`)
        } else {
          setError('Failed to load tickets. Please refresh the page or check your connection.')
          setUserTickets([])
        }
      } finally {
        // Only set loading to false if we're not retrying
        if (retryCount >= 3 || error === null) {
          setLoading(false)
        }
      }
    }

    processTickets()
  }, [
    address,
    ticketQueries,
    ticketIds,
    latestDraw,
    prizeAmount5,
    prizeAmount4,
    prizeAmount3,
    prizeAmount2, // Include new 2-match prize tier
    retryCount // Include retry count to trigger re-execution
  ])

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTickets = userTickets.length
    const winningTickets = userTickets.filter(t => t.isWinner).length
    const claimedTickets = userTickets.filter(t => t.claimed).length
    const totalWinnings = playerStats ? ethers.formatEther(playerStats[1]) : '0'
    const pendingClaims = userTickets.filter(t => t.canClaim).length

    return {
      totalTickets,
      winningTickets,
      claimedTickets,
      totalWinnings,
      pendingClaims
    }
  }, [userTickets, playerStats])

  return {
    userTickets,
    loading,
    error,
    stats,
    hasTickets: userTickets.length > 0,
    isConnected: !!address,
    isInitialized,
    retryCount
  }
}