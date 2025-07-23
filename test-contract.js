// Simple test script to verify smart contract functionality
import { ethers } from 'ethers';

// Contract configuration
const CONTRACT_ADDRESS = '0x90450a72f9827AB047674a01c422d6DEA7772D63';
const RPC_URL = 'https://rpc.kasplextest.xyz';
const TICKET_PRICE = '10'; // 10 KAS

// Simple ABI for testing
const SIMPLE_ABI = [
  'function TICKET_PRICE() view returns (uint256)',
  'function currentDrawId() view returns (uint256)',
  'function totalTicketsSold() view returns (uint256)',
  'function accumulatedJackpot() view returns (uint256)',
  'function adminBalance() view returns (uint256)',
  'function paused() view returns (bool)',
  'function getLotteryState() view returns (uint256, uint256, uint256, uint256, bool)'
];

async function testContract() {
  try {
    console.log('Testing KasDraw Lottery Contract...');
    console.log('Contract Address:', CONTRACT_ADDRESS);
    console.log('RPC URL:', RPC_URL);
    
    // Create provider
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    // Test connection
    console.log('\nTesting RPC connection...');
    const network = await provider.getNetwork();
    console.log('Connected to network:', network.name, 'Chain ID:', network.chainId.toString());
    
    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, SIMPLE_ABI, provider);
    
    // Test contract calls
    console.log('\nTesting contract calls...');
    
    try {
      const ticketPrice = await contract.TICKET_PRICE();
      console.log('Ticket Price:', ethers.formatEther(ticketPrice), 'KAS');
    } catch (error) {
      console.error('Error getting ticket price:', error.message);
    }
    
    try {
      const currentDrawId = await contract.currentDrawId();
      console.log('Current Draw ID:', currentDrawId.toString());
    } catch (error) {
      console.error('Error getting current draw ID:', error.message);
    }
    
    try {
      const totalTickets = await contract.totalTicketsSold();
      console.log('Total Tickets Sold:', totalTickets.toString());
    } catch (error) {
      console.error('Error getting total tickets:', error.message);
    }
    
    try {
      const jackpot = await contract.accumulatedJackpot();
      console.log('Accumulated Jackpot:', ethers.formatEther(jackpot), 'KAS');
    } catch (error) {
      console.error('Error getting jackpot:', error.message);
    }
    
    try {
      const isPaused = await contract.paused();
      console.log('Contract Paused:', isPaused);
    } catch (error) {
      console.error('Error getting paused status:', error.message);
    }
    
    // Test lottery state function
    try {
      const lotteryState = await contract.getLotteryState();
      console.log('\nLottery State:');
      console.log('- Current Draw ID:', lotteryState[0].toString());
      console.log('- Total Tickets Sold:', lotteryState[1].toString());
      console.log('- Accumulated Jackpot:', ethers.formatEther(lotteryState[2]), 'KAS');
      console.log('- Admin Balance:', ethers.formatEther(lotteryState[3]), 'KAS');
      console.log('- Paused:', lotteryState[4]);
    } catch (error) {
      console.error('Error getting lottery state:', error.message);
    }
    
    console.log('\n✅ Contract test completed successfully!');
    
  } catch (error) {
    console.error('❌ Contract test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testContract();