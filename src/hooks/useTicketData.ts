import { useReadContract } from 'wagmi'
import { LOTTERY_CONTRACT_ADDRESS, LOTTERY_ABI } from '../config/lottery'

export const useTicketData = (ticketId: number, enabled: boolean = true) => {
  return useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getTicket',
    args: [BigInt(ticketId)] as const,
    query: {
      enabled: enabled && !!ticketId,
    },
  })
}