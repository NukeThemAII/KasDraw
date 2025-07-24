import hre from 'hardhat';
import fs from 'fs';
import path from 'path';

const { ethers } = hre;

// Load contract configuration
const LOTTERY_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const LOTTERY_ABI = [
  'function canExecuteDrawPublic() view returns (bool)',
  'function executeDrawPublic() external',
  'function getLotteryStats() view returns (uint256, uint256, uint256, uint256, uint256, bool)',
  'function getCurrentDrawId() view returns (uint256)'
];

async function checkAndExecuteDraw() {
  try {
    console.log('🔍 Checking lottery draw status...');
    console.log('Contract Address:', LOTTERY_CONTRACT_ADDRESS);
    console.log('Timestamp:', new Date().toISOString());
    
    // Get signer (use first account)
    const [signer] = await ethers.getSigners();
    console.log('Executor Address:', signer.address);
    
    // Connect to contract
    const lottery = new ethers.Contract(LOTTERY_CONTRACT_ADDRESS, LOTTERY_ABI, signer);
    
    // Check if draw can be executed
    const canExecute = await lottery.canExecuteDrawPublic();
    console.log('Can Execute Draw:', canExecute);
    
    // Get current lottery stats
    const stats = await lottery.getLotteryStats();
    const [accumulatedJackpot, ticketsSoldThisDraw, totalTicketsSold, nextDrawTime, executorReward] = stats;
    
    console.log('📊 Current Lottery Stats:');
    console.log('  Jackpot:', ethers.formatEther(accumulatedJackpot), 'ETH');
    console.log('  Tickets This Draw:', ticketsSoldThisDraw.toString());
    console.log('  Total Tickets:', totalTicketsSold.toString());
    console.log('  Next Draw Time:', new Date(Number(nextDrawTime) * 1000).toLocaleString());
    console.log('  Executor Reward:', ethers.formatEther(executorReward), 'ETH');
    
    if (canExecute) {
      console.log('🎯 Executing lottery draw...');
      
      // Execute the draw
      const tx = await lottery.executeDrawPublic();
      console.log('Transaction Hash:', tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ Draw executed successfully!');
      console.log('Block Number:', receipt.blockNumber);
      console.log('Gas Used:', receipt.gasUsed.toString());
      
      // Get updated stats
      const newStats = await lottery.getLotteryStats();
      const [newJackpot, newTickets, newTotal, newNextDraw] = newStats;
      
      console.log('📊 Updated Lottery Stats:');
      console.log('  New Jackpot:', ethers.formatEther(newJackpot), 'ETH');
      console.log('  New Draw ID:', await lottery.getCurrentDrawId());
      console.log('  Next Draw Time:', new Date(Number(newNextDraw) * 1000).toLocaleString());
      
      // Log execution to file
      logExecution({
        timestamp: new Date().toISOString(),
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        oldJackpot: ethers.formatEther(accumulatedJackpot),
        newJackpot: ethers.formatEther(newJackpot),
        executorReward: ethers.formatEther(executorReward)
      });
      
    } else {
      console.log('⏳ Draw not ready yet. Next check in 1 hour.');
      const timeUntilDraw = Number(nextDrawTime) * 1000 - Date.now();
      if (timeUntilDraw > 0) {
        console.log('Time until next draw:', Math.floor(timeUntilDraw / (1000 * 60 * 60)), 'hours');
      }
    }
    
  } catch (error) {
    console.error('❌ Error in automation script:', error.message);
    
    // Log error to file
    logError({
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack
    });
  }
}

function logExecution(data) {
  const logFile = path.join(process.cwd(), 'logs', 'executions.json');
  
  // Ensure logs directory exists
  const logsDir = path.dirname(logFile);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Read existing logs or create empty array
  let logs = [];
  if (fs.existsSync(logFile)) {
    try {
      logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
    } catch (e) {
      logs = [];
    }
  }
  
  // Add new log entry
  logs.push(data);
  
  // Keep only last 100 entries
  if (logs.length > 100) {
    logs = logs.slice(-100);
  }
  
  // Write back to file
  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
}

function logError(data) {
  const logFile = path.join(process.cwd(), 'logs', 'errors.json');
  
  // Ensure logs directory exists
  const logsDir = path.dirname(logFile);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Read existing logs or create empty array
  let logs = [];
  if (fs.existsSync(logFile)) {
    try {
      logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
    } catch (e) {
      logs = [];
    }
  }
  
  // Add new log entry
  logs.push(data);
  
  // Keep only last 50 entries
  if (logs.length > 50) {
    logs = logs.slice(-50);
  }
  
  // Write back to file
  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
}

// Run the automation check
checkAndExecuteDraw()
  .then(() => {
    console.log('🏁 Automation script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });