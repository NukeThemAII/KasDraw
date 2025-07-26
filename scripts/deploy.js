import hre from 'hardhat';
import fs from 'fs';
const { ethers } = hre;

async function main() {
  console.log('Deploying KasDrawLottery contract...');
  
  // Get the contract factory
  const KasDrawLottery = await ethers.getContractFactory('KasDrawLottery');
  
  // Deploy the contract with explicit gas settings
  const lottery = await KasDrawLottery.deploy({
    gasLimit: 5000000,
    gasPrice: ethers.parseUnits('20', 'gwei')
  });
  
  // Wait for deployment to complete
  await lottery.waitForDeployment();
  
  console.log('KasDrawLottery deployed to:', await lottery.getAddress());
  console.log('Transaction hash:', lottery.deploymentTransaction().hash);
  
  // Verify deployment
  const owner = await lottery.owner();
  const currentDrawId = await lottery.currentDrawId();
  const ticketPrice = await lottery.TICKET_PRICE();
  
  console.log('\nContract Details:');
  console.log('Owner:', owner);
  console.log('Current Draw ID:', currentDrawId.toString());
  console.log('Ticket Price:', ethers.formatEther(ticketPrice), 'KAS');
  
  // Save deployment info
  const networkName = hre.network.name;
  const chainId = hre.network.config.chainId;
  const networkDisplayName = networkName === 'igra' ? 'Igra Labs Devnet' : 'Kasplex EVM Testnet';
  
  const deploymentInfo = {
    contractAddress: await lottery.getAddress(),
    deploymentHash: lottery.deploymentTransaction().hash,
    owner: owner,
    network: networkDisplayName,
    chainId: chainId,
    deployedAt: new Date().toISOString()
  };
  
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