import hre from 'hardhat';
import fs from 'fs';
const { ethers } = hre;

async function main() {
  console.log('🚀 Deploying KasDrawLotteryV2 contract...');
  console.log('Network:', hre.network.name);
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('Account balance:', ethers.formatEther(balance), 'KAS');
  
  if (balance < ethers.parseEther('1')) {
    console.warn('⚠️  Low balance detected. Make sure you have enough KAS for deployment.');
  }
  
  // Get the contract factory
  const KasDrawLotteryV2 = await ethers.getContractFactory('KasDrawLotteryV2');
  
  console.log('📝 Contract compilation successful');
  
  // Deploy the contract
  console.log('🔄 Deploying contract...');
  const lottery = await KasDrawLotteryV2.deploy();
  
  // Wait for deployment to complete
  console.log('⏳ Waiting for deployment confirmation...');
  await lottery.waitForDeployment();
  
  const contractAddress = await lottery.getAddress();
  const deploymentTx = lottery.deploymentTransaction();
  
  console.log('✅ KasDrawLotteryV2 deployed successfully!');
  console.log('📍 Contract address:', contractAddress);
  console.log('🔗 Transaction hash:', deploymentTx.hash);
  console.log('⛽ Gas used:', deploymentTx.gasLimit.toString());
  
  // Verify deployment by calling contract functions
  console.log('\n🔍 Verifying deployment...');
  
  try {
    const owner = await lottery.owner();
    const currentDrawId = await lottery.currentDrawId();
    const ticketPrice = await lottery.TICKET_PRICE();
    const maxNumber = await lottery.MAX_NUMBER();
    const numbersPerTicket = await lottery.NUMBERS_PER_TICKET();
    const drawInterval = await lottery.DRAW_INTERVAL();
    
    console.log('\n📊 Contract Details:');
    console.log('👤 Owner:', owner);
    console.log('🎲 Current Draw ID:', currentDrawId.toString());
    console.log('💰 Ticket Price:', ethers.formatEther(ticketPrice), 'KAS');
    console.log('🔢 Number Range: 1 -', maxNumber.toString());
    console.log('🎫 Numbers per Ticket:', numbersPerTicket.toString());
    console.log('⏰ Draw Interval:', (Number(drawInterval) / (24 * 60 * 60)).toFixed(1), 'days');
    
    // Get lottery stats
    const stats = await lottery.getLotteryStats();
    console.log('\n📈 Initial Stats:');
    console.log('💎 Current Jackpot:', ethers.formatEther(stats[0]), 'KAS');
    console.log('🎫 Tickets Sold This Draw:', stats[1].toString());
    console.log('📊 Total Tickets:', stats[2].toString());
    console.log('⏰ Next Draw Time:', new Date(Number(stats[3]) * 1000).toLocaleString());
    
    console.log('\n✅ Contract verification successful!');
    
  } catch (error) {
    console.error('❌ Contract verification failed:', error.message);
  }
  
  // Save deployment info
  const deploymentInfo = {
    contractName: 'KasDrawLotteryV2',
    contractAddress: contractAddress,
    deploymentHash: deploymentTx.hash,
    deployer: deployer.address,
    owner: deployer.address,
    network: hre.network.name,
    chainId: hre.network.config.chainId || 'unknown',
    deployedAt: new Date().toISOString(),
    gasUsed: deploymentTx.gasLimit.toString(),
    contractConfig: {
      ticketPrice: '10 KAS',
      numberRange: '1-35',
      numbersPerTicket: 5,
      drawInterval: '3.5 days',
      prizeStructure: {
        jackpot: '50%',
        secondPrize: '25%',
        thirdPrize: '15%',
        fourthPrize: '10%'
      }
    }
  };
  
  const deploymentFile = './deployment-info-v2.json';
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log('💾 Deployment info saved to:', deploymentFile);
  
  // Update .env file
  const envPath = './.env';
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Update or add contract address
  const contractAddressLine = `VITE_CONTRACT_ADDRESS=${contractAddress}`;
  
  if (envContent.includes('VITE_CONTRACT_ADDRESS=')) {
    envContent = envContent.replace(/VITE_CONTRACT_ADDRESS=.*/g, contractAddressLine);
  } else {
    envContent += `\n${contractAddressLine}\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('🔧 Updated .env file with new contract address');
  
  // Generate frontend config update
  const configUpdate = `
// Updated contract configuration for KasDrawLotteryV2
export const LOTTERY_CONTRACT_ADDRESS_V2 = '${contractAddress}';
export const DEPLOYMENT_INFO = ${JSON.stringify(deploymentInfo, null, 2)};
`;
  
  fs.writeFileSync('./src/config/deployment.ts', configUpdate);
  console.log('⚙️  Generated frontend config file');
  
  console.log('\n🎉 Deployment completed successfully!');
  console.log('\n📋 Next Steps:');
  console.log('1. Update your frontend to use the new contract address');
  console.log('2. Test the contract functions');
  console.log('3. Fund the contract if needed');
  console.log('4. Set up automation for draw execution');
  
  console.log('\n🔗 Contract Address:', contractAddress);
  console.log('🌐 Network:', hre.network.name);
  
  if (hre.network.name === 'kasplex') {
    console.log('🔍 View on Explorer: https://frontend.kasplextest.xyz/address/' + contractAddress);
  }
}

// Handle errors
main()
  .then(() => {
    console.log('\n✅ Deployment script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Deployment failed:', error);
    process.exit(1);
  });