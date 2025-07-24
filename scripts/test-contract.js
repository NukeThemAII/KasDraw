import hre from 'hardhat';
const { ethers } = hre;

async function main() {
  console.log('Testing KasDrawLottery contract on Kasplex testnet...');
  
  // Contract address from deployment
  const contractAddress = '0x1e53ab878e2e5F66db4337894Ed22e0F9b07BD97';
  
  // Get the contract factory and attach to deployed contract
  const KasDrawLottery = await ethers.getContractFactory('KasDrawLottery');
  const lottery = KasDrawLottery.attach(contractAddress);
  
  try {
    // Test basic contract functions
    console.log('\nTesting contract functions...');
    
    const owner = await lottery.owner();
    console.log('Contract Owner:', owner);
    
    const currentDrawId = await lottery.currentDrawId();
    console.log('Current Draw ID:', currentDrawId.toString());
    
    const ticketPrice = await lottery.TICKET_PRICE();
    console.log('Ticket Price:', ethers.formatEther(ticketPrice), 'KAS');
    
    const paused = await lottery.paused();
    console.log('Contract Paused:', paused);
    
    // Test lottery stats
    const stats = await lottery.getLotteryStats();
    console.log('\nLottery Stats:');
    console.log('Current Jackpot:', ethers.formatEther(stats[0]), 'KAS');
    console.log('Tickets Sold This Draw:', stats[1].toString());
    console.log('Total Tickets:', stats[2].toString());
    console.log('Next Draw Time:', new Date(Number(stats[3]) * 1000).toISOString());
    console.log('Executor Reward:', ethers.formatEther(stats[4]), 'KAS');
    console.log('Can Execute:', stats[5]);
    
    // Test admin balance
    const adminBalance = await lottery.adminBalance();
    console.log('\nAdmin Balance:', ethers.formatEther(adminBalance), 'KAS');
    
    console.log('\n✅ Contract is working correctly on Kasplex testnet!');
    
  } catch (error) {
    console.error('❌ Error testing contract:', error.message);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });