import hre from 'hardhat';
import fs from 'fs';
const { ethers } = hre;

async function main() {
  console.log('🚀 Deploying KasDrawLotteryV2Fixed contract...');
  console.log('Network:', hre.network.name);
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('Account balance:', ethers.formatEther(balance), 'KAS');
  
  // Get the contract factory
  const KasDrawLotteryV2Fixed = await ethers.getContractFactory('KasDrawLotteryV2Fixed');
  
  console.log('📝 Contract compilation successful');
  
  // Deploy the contract
  console.log('🔄 Deploying fixed contract...');
  const lottery = await KasDrawLotteryV2Fixed.deploy({
    gasLimit: 5000000,
    gasPrice: ethers.parseUnits('10', 'gwei')
  });
  
  // Wait for deployment to complete
  console.log('⏳ Waiting for deployment confirmation...');
  await lottery.waitForDeployment();
  
  const contractAddress = await lottery.getAddress();
  const deploymentTx = lottery.deploymentTransaction();
  
  console.log('✅ KasDrawLotteryV2Fixed deployed successfully!');
  console.log('📍 Contract address:', contractAddress);
  console.log('🔗 Transaction hash:', deploymentTx.hash);
  
  // Verify deployment
  console.log('\n🔍 Verifying deployment...');
  
  try {
    const owner = await lottery.owner();
    const currentDrawId = await lottery.currentDrawId();
    const ticketPrice = await lottery.TICKET_PRICE();
    
    console.log('\n📊 Contract Details:');
    console.log('👤 Owner:', owner);
    console.log('🎲 Current Draw ID:', currentDrawId.toString());
    console.log('💰 Ticket Price:', ethers.formatEther(ticketPrice), 'KAS');
    
    console.log('\n✅ Contract verification successful!');
    
  } catch (error) {
    console.error('❌ Contract verification failed:', error.message);
  }
  
  // Update .env file
  const envPath = './.env';
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Update contract address
  const contractAddressLine = `VITE_CONTRACT_ADDRESS=${contractAddress}`;
  
  if (envContent.includes('VITE_CONTRACT_ADDRESS=')) {
    envContent = envContent.replace(/VITE_CONTRACT_ADDRESS=.*/g, contractAddressLine);
  } else {
    envContent += `\n${contractAddressLine}\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('🔧 Updated .env file with new contract address');
  
  // Save deployment info
  const deploymentInfo = {
    contractName: 'KasDrawLotteryV2Fixed',
    contractAddress: contractAddress,
    deploymentHash: deploymentTx.hash,
    deployer: deployer.address,
    owner: deployer.address,
    network: hre.network.name,
    chainId: hre.network.config.chainId || 'unknown',
    deployedAt: new Date().toISOString(),
    fixes: [
      'Fixed prize claiming logic',
      'Corrected accounting mathematics',
      'Fixed draw data structure access',
      'Improved percentage calculations',
      'Enhanced error handling'
    ]
  };
  
  fs.writeFileSync('./deployment-info-v2-fixed.json', JSON.stringify(deploymentInfo, null, 2));
  console.log('💾 Deployment info saved to: deployment-info-v2-fixed.json');
  
  console.log('\n🎉 Fixed contract deployment completed successfully!');
  console.log('🔗 Contract Address:', contractAddress);
}

main()
  .then(() => {
    console.log('\n✅ Deployment script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Deployment failed:', error);
    process.exit(1);
  });