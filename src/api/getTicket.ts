import { ethers } from 'ethers';
import { LOTTERY_ABI, LOTTERY_CONTRACT_ADDRESS } from '../config/lottery';

// This would typically be an API route, but for now we'll create a utility function
export async function getTicketDetails(ticketId: number) {
  try {
    // Create provider for Kasplex testnet
    const provider = new ethers.JsonRpcProvider('https://rpc.kasplextest.xyz');
    
    // Create contract instance
    const contract = new ethers.Contract(
      LOTTERY_CONTRACT_ADDRESS,
      LOTTERY_ABI,
      provider
    );

    // Get ticket details from contract
    const ticket = await contract.getTicket(ticketId);
    
    return {
      success: true,
      data: {
        id: ticketId,
        player: ticket[0],
        numbers: ticket[1].map((n: bigint) => Number(n)),
        drawId: Number(ticket[2]),
        claimed: ticket[3]
      }
    };
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return {
      success: false,
      error: 'Failed to fetch ticket details'
    };
  }
}

// Mock API response for development
export function mockGetTicket(ticketId: number) {
  return {
    success: true,
    data: {
      id: ticketId,
      player: '0x71d7aCcfB0dFB579b8f00de612890FB875E16eef',
      numbers: [1, 15, 23, 34, 42, 49],
      drawId: 1,
      claimed: false
    }
  };
}