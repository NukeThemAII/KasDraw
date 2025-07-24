import hre from 'hardhat';
const { ethers } = hre;

async function main() {
  console.log('Purchasing test tickets on Kasplex testnet...');
  
  // Contract address from deployment
  const contractAddress = '0x1e53ab878e2e5F66db4337894Ed22e0F9b07BD97';
  
  // Get the contract factory and attach to deployed contract
  const KasDrawLottery = await ethers.getContractFactory('KasDrawLottery');
  const lottery = KasDrawLottery.attach(contractAddress);
  
  // Get signer (deployer account)
  const [signer] = await ethers.getSigners();
  console.log('Using account:', signer.address);
  
  try {
    // Check current balance
    const balance = await ethers.provider.getBalance(signer.address);
    console.log('Account balance:', ethers.formatEther(balance), 'KAS');
    
    // Get ticket price
    const ticketPrice = await lottery.TICKET_PRICE();
    console.log('Ticket price:', ethers.formatEther(ticketPrice), 'KAS');
    
    // Purchase 3 test tickets with different number combinations
    const testTickets = [
      [1, 5, 10, 15, 20],   // First ticket
      [2, 7, 12, 18, 25],   // Second ticket
      [3, 9, 14, 21, 30]    // Third ticket
    ];
    
    console.log('\nPurchasing tickets with numbers:');
    testTickets.forEach((ticket, index) => {
      console.log(`Ticket ${index + 1}: [${ticket.join(', ')}]`);
    });
    
    // Calculate total cost
    const totalCost = ticketPrice * BigInt(testTickets.length);
    console.log('\nTotal cost:', ethers.formatEther(totalCost), 'KAS');
    
    // Purchase tickets
    const tx = await lottery.purchaseTickets(testTickets, {
      value: totalCost,
      gasLimit: 500000 // Set a reasonable gas limit
    });
    
    console.log('\nTransaction sent:', tx.hash);
    console.log('Waiting for confirmation...');
    
    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);
    
    // Check updated lottery stats
    console.log('\nUpdated lottery stats:');
    const stats = await lottery.getLotteryStats();
    console.log('Current Jackpot:', ethers.formatEther(stats[0]), 'KAS');
    console.log('Tickets Sold This Draw:', stats[1].toString());
    console.log('Total Tickets:', stats[2].toString());
    
    console.log('\n✅ Test tickets purchased successfully!');
    
  } catch (error) {
    console.error('❌ Error purchasing tickets:', error.message);
    
    // Check if it's a gas estimation error
    if (error.message.includes('gas')) {
      console.log('\n💡 Tip: Make sure you have enough KAS for gas fees');
    }
    
    // Check if it's a contract error
    if (error.message.includes('revert')) {
      console.log('\n💡 Tip: Check if the contract is paused or if numbers are valid');
    }
    
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });