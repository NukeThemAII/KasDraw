const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

/**
 * Deploy DecentralizedLottery Contract
 * 
 * Features:
 * - Fully decentralized lottery with enhanced security
 * - Gas-optimized operations
 * - Enhanced randomness generation
 * - Comprehensive analytics
 * - Testing mode support
 * - Emergency circuit breakers
 */

async function main() {
    console.log("\n🎲 Deploying DecentralizedLottery Contract...");
    console.log("================================================");
    
    // Get network information
    const network = await ethers.provider.getNetwork();
    const [deployer] = await ethers.getSigners();
    
    console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);
    console.log(`👤 Deployer: ${deployer.address}`);
    
    // Check deployer balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`💰 Deployer Balance: ${ethers.formatEther(balance)} ETH`);
    
    if (balance < ethers.parseEther("0.1")) {
        console.warn("⚠️  Warning: Low deployer balance. Deployment may fail.");
    }
    
    // Determine if we're in testing mode based on network
    const isTestingMode = network.chainId === 31337 || // Hardhat local
                         network.chainId === 167012 || // Kasplex testnet
                         network.chainId === 1122334455; // Igra testnet (example)
    
    console.log(`🧪 Testing Mode: ${isTestingMode ? 'ENABLED' : 'DISABLED'}`);
    
    // Get contract factory
    const DecentralizedLottery = await ethers.getContractFactory("DecentralizedLottery");
    
    // Estimate gas for deployment
    console.log("\n⛽ Estimating deployment gas...");
    const deploymentData = DecentralizedLottery.interface.encodeDeploy([isTestingMode]);
    const estimatedGas = await ethers.provider.estimateGas({
        data: deploymentData
    });
    
    console.log(`📊 Estimated Gas: ${estimatedGas.toString()}`);
    
    // Get current gas price
    const feeData = await ethers.provider.getFeeData();
    console.log(`💨 Gas Price: ${ethers.formatUnits(feeData.gasPrice, 'gwei')} gwei`);
    
    // Calculate deployment cost
    const deploymentCost = estimatedGas * feeData.gasPrice;
    console.log(`💸 Estimated Cost: ${ethers.formatEther(deploymentCost)} ETH`);
    
    // Deploy with optimized gas settings
    console.log("\n🚀 Deploying contract...");
    
    const gasLimit = estimatedGas + (estimatedGas * 20n / 100n); // Add 20% buffer
    const gasPrice = feeData.gasPrice + (feeData.gasPrice * 10n / 100n); // Add 10% to gas price
    
    console.log(`🔧 Using Gas Limit: ${gasLimit.toString()}`);
    console.log(`🔧 Using Gas Price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);
    
    const lottery = await DecentralizedLottery.deploy(isTestingMode, {
        gasLimit: gasLimit,
        gasPrice: gasPrice
    });
    
    console.log(`⏳ Transaction Hash: ${lottery.deploymentTransaction().hash}`);
    console.log(`⏳ Waiting for confirmation...`);
    
    // Wait for deployment
    await lottery.waitForDeployment();
    const contractAddress = await lottery.getAddress();
    
    console.log(`\n✅ DecentralizedLottery deployed successfully!`);
    console.log(`📍 Contract Address: ${contractAddress}`);
    
    // Verify deployment
    console.log("\n🔍 Verifying deployment...");
    
    try {
        // Test basic contract functions
        const drawInfo = await lottery.getDrawInfo();
        const analytics = await lottery.getAnalytics();
        const canExecute = await lottery.canExecuteDraw();
        
        console.log(`📊 Current Draw ID: ${drawInfo.currentDraw}`);
        console.log(`💰 Current Jackpot: ${ethers.formatEther(drawInfo.currentJackpot)} KAS`);
        console.log(`🎫 Tickets Sold: ${drawInfo.ticketsSold}`);
        console.log(`⏰ Next Draw: ${new Date(Number(drawInfo.nextDrawTimestamp) * 1000).toLocaleString()}`);
        console.log(`🎯 Can Execute Draw: ${canExecute}`);
        console.log(`📈 Total Players: ${analytics.totalPlayers}`);
        
        if (isTestingMode) {
            console.log(`\n🧪 Testing Mode Features:`);
            console.log(`   - Quick draw intervals (10 minutes)`);
            console.log(`   - Force execute function available`);
            console.log(`   - Testing mode can be toggled`);
        }
        
        console.log(`\n✅ Contract verification successful!`);
        
    } catch (error) {
        console.error(`❌ Contract verification failed:`, error.message);
        throw error;
    }
    
    // Save deployment information
    const deploymentInfo = {
        contractName: "DecentralizedLottery",
        contractAddress: contractAddress,
        deployerAddress: deployer.address,
        network: {
            name: network.name,
            chainId: network.chainId.toString()
        },
        deployment: {
            blockNumber: lottery.deploymentTransaction().blockNumber,
            transactionHash: lottery.deploymentTransaction().hash,
            gasUsed: estimatedGas.toString(),
            gasPrice: gasPrice.toString(),
            deploymentCost: ethers.formatEther(deploymentCost),
            timestamp: new Date().toISOString()
        },
        contractConfig: {
            ticketPrice: "0.1", // KAS
            numbersPerTicket: 5,
            maxNumber: 35,
            drawInterval: isTestingMode ? "10 minutes" : "1 hour",
            testingMode: isTestingMode
        },
        features: {
            decentralized: true,
            enhancedRandomness: true,
            gasOptimized: true,
            emergencyCircuitBreaker: true,
            analyticsEnabled: true,
            batchProcessing: true
        },
        economics: {
            protocolFee: "0.5%",
            executorReward: "0.25%",
            prizeDistribution: {
                jackpot: "50%", // 5 matches
                secondPrize: "25%", // 4 matches
                thirdPrize: "15%", // 3 matches
                fourthPrize: "9.25%" // 2 matches
            }
        },
        security: {
            reentrancyProtection: true,
            pausable: true,
            emergencyPause: true,
            noOwnerPrivileges: true,
            enhancedRandomness: true
        }
    };
    
    // Determine filename based on network
    let filename;
    if (network.chainId === 31337) {
        filename = 'deployment-info-hardhat.json';
    } else if (network.chainId === 167012) {
        filename = 'deployment-info-kasplex-decentralized.json';
    } else {
        filename = `deployment-info-decentralized-${network.chainId}.json`;
    }
    
    const deploymentPath = path.join(__dirname, '..', filename);
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    
    console.log(`\n💾 Deployment info saved to: ${filename}`);
    
    // Update .env file for frontend
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add contract address
    const contractAddressLine = `NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS=${contractAddress}`;
    
    if (envContent.includes('NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS=')) {
        envContent = envContent.replace(
            /NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS=.*/,
            contractAddressLine
        );
    } else {
        envContent += `\n${contractAddressLine}\n`;
    }
    
    // Add network info
    const networkLine = `NEXT_PUBLIC_NETWORK_CHAIN_ID=${network.chainId}`;
    if (envContent.includes('NEXT_PUBLIC_NETWORK_CHAIN_ID=')) {
        envContent = envContent.replace(
            /NEXT_PUBLIC_NETWORK_CHAIN_ID=.*/,
            networkLine
        );
    } else {
        envContent += `${networkLine}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log(`📝 Updated .env file with new contract address`);
    
    // Display contract interaction examples
    console.log(`\n📚 Contract Interaction Examples:`);
    console.log(`=====================================`);
    console.log(`
// Purchase tickets (JavaScript/ethers.js)`);
    console.log(`const ticketNumbers = [[1, 5, 10, 15, 20], [2, 6, 11, 16, 21]];`);
    console.log(`const ticketPrice = ethers.parseEther("0.1");`);
    console.log(`const totalCost = ticketPrice * BigInt(ticketNumbers.length);`);
    console.log(`await lottery.purchaseTickets(ticketNumbers, { value: totalCost });`);
    
    console.log(`\n// Execute draw`);
    console.log(`await lottery.executeDraw();`);
    
    console.log(`\n// Claim prizes`);
    console.log(`const ticketIds = [1, 2, 3];`);
    console.log(`await lottery.claimPrizes(ticketIds);`);
    
    console.log(`\n// Get analytics`);
    console.log(`const analytics = await lottery.getAnalytics();`);
    console.log(`const drawInfo = await lottery.getDrawInfo();`);
    
    if (isTestingMode) {
        console.log(`\n🧪 Testing Functions:`);
        console.log(`// Force execute draw (testing only)`);
        console.log(`await lottery.forceExecuteDrawForTesting();`);
        
        console.log(`\n// Set custom test interval (testing only)`);
        console.log(`await lottery.setTestingMode(true, 300); // 5 minutes`);
    }
    
    console.log(`\n🎉 Deployment completed successfully!`);
    console.log(`\n📋 Next Steps:`);
    console.log(`   1. Update frontend configuration with new contract address`);
    console.log(`   2. Test contract functions on the deployed network`);
    console.log(`   3. Monitor contract analytics and performance`);
    if (isTestingMode) {
        console.log(`   4. Use testing functions to validate lottery mechanics`);
        console.log(`   5. Disable testing mode before production deployment`);
    }
    
    return {
        contractAddress,
        deploymentInfo,
        network: network.chainId.toString()
    };
}

// Execute deployment
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("\n❌ Deployment failed:", error);
            process.exit(1);
        });
}

module.exports = main;