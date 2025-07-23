const { ethers } = require('hardhat');

async function main() {
  console.log('Deploying KasDrawLottery contract...');
  
  // Get the contract factory
  const KasDrawLottery = await ethers.getContractFactory('KasDrawLottery');
  
  // Deploy the contract
  const lottery = await KasDrawLottery.deploy();
  
  // Wait for deployment to complete
  await lottery.deployed();
  
  console.log('KasDrawLottery deployed to:', lottery.address);
  console.log('Transaction hash:', lottery.deployTransaction.hash);
  
  // Verify deployment
  const owner = await lottery.owner();
  const currentDrawId = await lottery.currentDrawId();
  const ticketPrice = await lottery.TICKET_PRICE();
  
  console.log('\nContract Details:');
  console.log('Owner:', owner);
  console.log('Current Draw ID:', currentDrawId.toString());
  console.log('Ticket Price:', ethers.utils.formatEther(ticketPrice), 'KAS');
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: lottery.address,
    deploymentHash: lottery.deployTransaction.hash,
    owner: owner,
    network: 'Kasplex EVM Testnet',
    chainId: 167012,
    deployedAt: new Date().toISOString()
  };
  
  const fs = require('fs');
  fs.writeFileSync(
    './deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log('\nDeployment info saved to deployment-info.json');
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });