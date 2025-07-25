import hre from 'hardhat';
import fs from 'fs';
const { ethers } = hre;

async function main() {
  console.log('🚀 Deploying KasDrawLotteryV2Fixed contract to Kasplex Testnet with HIGH GAS...');
  console.log('Network:', hre.network.name);
  console.log('Chain ID:', hre.network.config.chainId);
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('Account balance:', ethers.formatEther(balance), 'KAS');
  
  if (balance < ethers.parseEther('1')) {
    throw new Error('Insufficient balance for deployment. Need at least 1 KAS for gas fees.');
  }
  
  // Get the contract factory
  const KasDrawLotteryV2Fixed = await ethers.getContractFactory('KasDrawLotteryV2Fixed');
  
  console.log('📝 Contract compilation successful');
  
  // Deploy with HIGH gas settings matching MetaMask screenshot
  console.log('🔄 Deploying fixed contract with HIGH GAS settings...');
  
  const deploymentOptions = {
    gasLimit: 6000000, // Higher gas limit for contract deployment
    maxFeePerGas: ethers.parseUnits('5000', 'gwei'), // Max base fee: 5000 GWEI
    maxPriorityFeePerGas: ethers.parseUnits('5000', 'gwei'), // Priority fee: 5000 GWEI
  };
  
  console.log('🔥 HIGH GAS settings:', {
    gasLimit: deploymentOptions.gasLimit,
    maxFeePerGas: ethers.formatUnits(deploymentOptions.maxFeePerGas, 'gwei') + ' GWEI',
    maxPriorityFeePerGas: ethers.formatUnits(deploymentOptions.maxPriorityFeePerGas, 'gwei') + ' GWEI'
  });
  
  let lottery;
  let retries = 3;
  
  while (retries > 0) {
    try {
      console.log(`⏳ HIGH GAS deployment attempt ${4 - retries}/3...`);
      
      lottery = await KasDrawLotteryV2Fixed.deploy(deploymentOptions);
      
      console.log('⏳ Waiting for deployment confirmation...');
      await lottery.waitForDeployment();
      
      break; // Success, exit retry loop
      
    } catch (error) {
      retries--;
      console.log(`❌ Deployment attempt failed: ${error.message}`);
      
      if (retries > 0) {
        console.log(`🔄 Retrying in 15 seconds... (${retries} attempts remaining)`);
        await new Promise(resolve => setTimeout(resolve, 15000));
      } else {
        throw error;
      }
    }
  }
  
  const contractAddress = await lottery.getAddress();
  const deploymentTx = lottery.deploymentTransaction();
  
  console.log('✅ KasDrawLotteryV2Fixed deployed successfully to Kasplex Testnet!');
  console.log('📍 Contract address:', contractAddress);
  console.log('🔗 Transaction hash:', deploymentTx.hash);
  console.log('🌐 Explorer URL:', `https://frontend.kasplextest.xyz/tx/${deploymentTx.hash}`);
  
  // Verify deployment
  console.log('\n🔍 Verifying deployment...');
  
  try {
    // Wait a bit for the transaction to be fully confirmed
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    const owner = await lottery.owner();
    const currentDrawId = await lottery.currentDrawId();
    const ticketPrice = await lottery.TICKET_PRICE();
    const adminFeePercentage = await lottery.ADMIN_FEE_PERCENTAGE();
    
    console.log('\n📊 Contract Details:');
    console.log('👤 Owner:', owner);
    console.log('🎲 Current Draw ID:', currentDrawId.toString());
    console.log('💰 Ticket Price:', ethers.formatEther(ticketPrice), 'KAS');
    console.log('💼 Admin Fee:', (Number(adminFeePercentage) / 100).toString() + '%');
    
    console.log('\n✅ Contract verification successful!');
    
  } catch (error) {
    console.error('❌ Contract verification failed:', error.message);
    console.log('⚠️  Contract deployed but verification failed. This is usually temporary.');
  }
  
  // Update .env file with new contract address
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
  console.log('🔧 Updated .env file with new Kasplex contract address');
  
  // Save deployment info
  const deploymentInfo = {
    contractName: 'KasDrawLotteryV2Fixed',
    contractAddress: contractAddress,
    deploymentHash: deploymentTx.hash,
    deployer: deployer.address,
    owner: deployer.address,
    network: 'kasplex-testnet',
    chainId: 167012,
    rpcUrl: 'https://rpc.kasplextest.xyz',
    explorerUrl: `https://frontend.kasplextest.xyz/address/${contractAddress}`,
    deployedAt: new Date().toISOString(),
    gasSettings: {
      gasLimit: deploymentOptions.gasLimit,
      maxFeePerGas: deploymentOptions.maxFeePerGas.toString(),
      maxPriorityFeePerGas: deploymentOptions.maxPriorityFeePerGas.toString()
    },
    fixes: [
      'Fixed prize claiming logic',
      'Corrected accounting mathematics', 
      'Fixed draw data structure access',
      'Improved percentage calculations',
      'Enhanced error handling',
      'Deployed with HIGH GAS settings for reliability'
    ]
  };
  
  fs.writeFileSync('./deployment-info-kasplex-highgas.json', JSON.stringify(deploymentInfo, null, 2));
  console.log('💾 Deployment info saved to: deployment-info-kasplex-highgas.json');
  
  console.log('\n🎉 HIGH GAS Kasplex deployment completed successfully!');
  console.log('🔗 Contract Address:', contractAddress);
  console.log('🌐 View on Explorer:', `https://frontend.kasplextest.xyz/address/${contractAddress}`);
  console.log('\n📱 Dapp is now updated with the new contract address!');
  console.log('🚀 Ready to test the lottery in the UI!');
}

main()
  .then(() => {
    console.log('\n✅ HIGH GAS Kasplex deployment script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ HIGH GAS Kasplex deployment failed:', error);
    process.exit(1);
  });