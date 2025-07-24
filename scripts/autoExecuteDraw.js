const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

/**
 * Automated Draw Execution Script
 * This script can be run periodically to automatically execute lottery draws
 * when the time interval has passed and there are tickets sold.
 */
async function main() {
    console.log("🎲 Starting automated draw execution check...");
    
    try {
        // Load deployment info
        const deploymentPath = path.join(__dirname, '..', 'deployment-info.json');
        if (!fs.existsSync(deploymentPath)) {
            throw new Error("Deployment info not found. Please deploy the contract first.");
        }
        
        const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
        const contractAddress = deploymentInfo.address;
        
        console.log(`📍 Contract address: ${contractAddress}`);
        
        // Get contract instance
        const KasDrawLottery = await ethers.getContractFactory("KasDrawLottery");
        const lottery = KasDrawLottery.attach(contractAddress);
        
        // Get signer (executor)
        const [executor] = await ethers.getSigners();
        console.log(`🔑 Executor address: ${executor.address}`);
        
        // Check current lottery state
        const [currentDrawId, totalTicketsSold, accumulatedJackpot, adminBalance, paused] = 
            await lottery.getLotteryState();
        
        console.log(`\n📊 Current Lottery State:`);
        console.log(`   Draw ID: ${currentDrawId}`);
        console.log(`   Total Tickets Sold: ${totalTicketsSold}`);
        console.log(`   Accumulated Jackpot: ${ethers.utils.formatEther(accumulatedJackpot)} KAS`);
        console.log(`   Contract Paused: ${paused}`);
        
        if (paused) {
            console.log("⏸️  Contract is paused. Cannot execute draw.");
            return;
        }
        
        // Check if draw can be executed
        const [canExecute, timeRemaining] = await lottery.canExecuteDrawPublic();
        
        if (!canExecute) {
            if (timeRemaining > 0) {
                const hours = Math.floor(timeRemaining / 3600);
                const minutes = Math.floor((timeRemaining % 3600) / 60);
                console.log(`⏰ Draw cannot be executed yet. Time remaining: ${hours}h ${minutes}m`);
            } else {
                console.log(`❌ Draw cannot be executed. Possible reasons:`);
                console.log(`   - Draw already executed`);
                console.log(`   - No tickets sold for current draw`);
            }
            return;
        }
        
        // Check tickets for current draw
        const drawTickets = await lottery.getDrawTickets(currentDrawId);
        console.log(`🎫 Tickets for current draw: ${drawTickets.length}`);
        
        if (drawTickets.length === 0) {
            console.log(`❌ No tickets sold for draw ${currentDrawId}. Cannot execute draw.`);
            return;
        }
        
        // Check executor balance
        const executorBalance = await executor.getBalance();
        console.log(`💰 Executor balance: ${ethers.utils.formatEther(executorBalance)} KAS`);
        
        // Estimate gas for the transaction
        console.log(`\n⛽ Estimating gas for draw execution...`);
        try {
            const gasEstimate = await lottery.estimateGas.executeDrawPublic();
            const gasPrice = await executor.getGasPrice();
            const estimatedCost = gasEstimate.mul(gasPrice);
            
            console.log(`   Estimated gas: ${gasEstimate.toString()}`);
            console.log(`   Gas price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`);
            console.log(`   Estimated cost: ${ethers.utils.formatEther(estimatedCost)} KAS`);
            
            if (executorBalance.lt(estimatedCost.mul(2))) {
                console.log(`⚠️  Warning: Low executor balance. Consider adding more KAS.`);
            }
        } catch (error) {
            console.log(`❌ Gas estimation failed: ${error.message}`);
            return;
        }
        
        // Execute the draw
        console.log(`\n🎲 Executing draw ${currentDrawId}...`);
        
        try {
            const tx = await lottery.executeDrawPublic({
                gasLimit: 500000 // Set a reasonable gas limit
            });
            
            console.log(`📝 Transaction hash: ${tx.hash}`);
            console.log(`⏳ Waiting for confirmation...`);
            
            const receipt = await tx.wait();
            
            if (receipt.status === 1) {
                console.log(`✅ Draw executed successfully!`);
                console.log(`   Block number: ${receipt.blockNumber}`);
                console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
                
                // Parse events to get draw results
                const drawExecutedEvent = receipt.events?.find(e => e.event === 'DrawExecuted');
                const publicExecutionEvent = receipt.events?.find(e => e.event === 'DrawExecutedByPublic');
                
                if (drawExecutedEvent) {
                    const [drawId, winningNumbers, totalPrizePool, jackpotAmount] = drawExecutedEvent.args;
                    console.log(`\n🎯 Draw Results:`);
                    console.log(`   Draw ID: ${drawId}`);
                    console.log(`   Winning Numbers: [${winningNumbers.join(', ')}]`);
                    console.log(`   Total Prize Pool: ${ethers.utils.formatEther(totalPrizePool)} KAS`);
                    console.log(`   Jackpot Amount: ${ethers.utils.formatEther(jackpotAmount)} KAS`);
                }
                
                if (publicExecutionEvent) {
                    const [executorAddr, drawId, reward] = publicExecutionEvent.args;
                    console.log(`\n💰 Executor Reward:`);
                    console.log(`   Executor: ${executorAddr}`);
                    console.log(`   Reward: ${ethers.utils.formatEther(reward)} KAS`);
                }
                
            } else {
                console.log(`❌ Transaction failed`);
            }
            
        } catch (error) {
            console.log(`❌ Draw execution failed: ${error.message}`);
            
            // Check if it's a known error
            if (error.message.includes('Draw already executed')) {
                console.log(`   Reason: Draw was already executed by someone else`);
            } else if (error.message.includes('Draw interval not reached')) {
                console.log(`   Reason: Draw interval not reached yet`);
            } else if (error.message.includes('No tickets sold')) {
                console.log(`   Reason: No tickets sold for this draw`);
            }
        }
        
    } catch (error) {
        console.error(`💥 Script failed: ${error.message}`);
        process.exit(1);
    }
}

// Handle script execution
if (require.main === module) {
    main()
        .then(() => {
            console.log(`\n🏁 Script completed`);
            process.exit(0);
        })
        .catch((error) => {
            console.error(`💥 Unhandled error: ${error.message}`);
            process.exit(1);
        });
}

module.exports = { main };