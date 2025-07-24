import hre from 'hardhat';
import fs from 'fs';
const { ethers } = hre;

// Kasplex testnet automation script
const AUTOMATION_CONFIG = {
  CONTRACT_ADDRESS: '0x1e53ab878e2e5F66db4337894Ed22e0F9b07BD97',
  CHECK_INTERVAL: 60000, // Check every minute
  MAX_RETRIES: 3,
  RETRY_DELAY: 5000, // 5 seconds
  LOG_FILE: './logs/automation-kasplex.log'
};

class KasplexAutomation {
  constructor() {
    this.contract = null;
    this.signer = null;
    this.isRunning = false;
    this.logFile = AUTOMATION_CONFIG.LOG_FILE;
    
    // Ensure logs directory exists
    if (!fs.existsSync('./logs')) {
      fs.mkdirSync('./logs', { recursive: true });
    }
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      network: 'kasplex-testnet',
      contract: AUTOMATION_CONFIG.CONTRACT_ADDRESS
    };
    
    console.log(`[${timestamp}] ${level}: ${message}`);
    
    // Append to log file
    fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + '\n');
  }

  async initialize() {
    try {
      this.log('Initializing Kasplex automation system...');
      
      // Get signer
      const [signer] = await ethers.getSigners();
      this.signer = signer;
      this.log(`Using account: ${signer.address}`);
      
      // Check balance
      const balance = await ethers.provider.getBalance(signer.address);
      this.log(`Account balance: ${ethers.formatEther(balance)} KAS`);
      
      if (balance < ethers.parseEther('1')) {
        this.log('WARNING: Low balance detected. Ensure sufficient KAS for gas fees.', 'WARN');
      }
      
      // Connect to contract
      const KasDrawLottery = await ethers.getContractFactory('KasDrawLottery');
      this.contract = KasDrawLottery.attach(AUTOMATION_CONFIG.CONTRACT_ADDRESS);
      
      // Verify contract connection
      const owner = await this.contract.owner();
      this.log(`Contract owner: ${owner}`);
      
      const currentDrawId = await this.contract.currentDrawId();
      this.log(`Current draw ID: ${currentDrawId}`);
      
      this.log('✅ Automation system initialized successfully');
      return true;
      
    } catch (error) {
      this.log(`❌ Initialization failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async checkDrawStatus() {
    try {
      // Get draw execution status
      const canExecuteData = await this.contract.canExecuteDrawPublic();
      const canExecute = canExecuteData[0];
      const timeRemaining = Number(canExecuteData[1]);
      const nextDrawTime = Number(canExecuteData[2]);
      
      this.log(`Draw status - Can execute: ${canExecute}, Time remaining: ${timeRemaining}s`);
      
      if (canExecute) {
        this.log('🎯 Draw is ready for execution!');
        return await this.executeDraw();
      } else {
        const nextDrawDate = new Date(nextDrawTime * 1000);
        this.log(`⏰ Next draw scheduled for: ${nextDrawDate.toISOString()}`);
        return false;
      }
      
    } catch (error) {
      this.log(`❌ Error checking draw status: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async executeDraw() {
    try {
      this.log('🚀 Attempting to execute draw...');
      
      // Check if we're the owner or if public execution is allowed
      const owner = await this.contract.owner();
      const isOwner = owner.toLowerCase() === this.signer.address.toLowerCase();
      
      let tx;
      if (isOwner) {
        this.log('Executing as contract owner...');
        tx = await this.contract.executeDraw({
          gasLimit: 500000
        });
      } else {
        this.log('Executing as public user...');
        tx = await this.contract.executeDrawPublic({
          gasLimit: 500000
        });
      }
      
      this.log(`Transaction sent: ${tx.hash}`);
      this.log('Waiting for confirmation...');
      
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        this.log(`✅ Draw executed successfully! Block: ${receipt.blockNumber}`);
        
        // Log updated stats
        await this.logLotteryStats();
        
        return true;
      } else {
        this.log('❌ Draw execution failed - transaction reverted', 'ERROR');
        return false;
      }
      
    } catch (error) {
      this.log(`❌ Draw execution failed: ${error.message}`, 'ERROR');
      
      // Check for specific error types
      if (error.message.includes('gas')) {
        this.log('💡 Gas estimation failed - may need more KAS or higher gas limit', 'WARN');
      }
      
      return false;
    }
  }

  async logLotteryStats() {
    try {
      const stats = await this.contract.getLotteryStats();
      const currentDrawId = await this.contract.currentDrawId();
      
      this.log('📊 Current lottery stats:');
      this.log(`  Current Draw ID: ${currentDrawId}`);
      this.log(`  Jackpot: ${ethers.formatEther(stats[0])} KAS`);
      this.log(`  Tickets Sold: ${stats[1]}`);
      this.log(`  Total Tickets: ${stats[2]}`);
      this.log(`  Executor Reward: ${ethers.formatEther(stats[4])} KAS`);
      
    } catch (error) {
      this.log(`❌ Error fetching lottery stats: ${error.message}`, 'ERROR');
    }
  }

  async start() {
    if (this.isRunning) {
      this.log('Automation is already running', 'WARN');
      return;
    }
    
    this.isRunning = true;
    this.log('🚀 Starting Kasplex automation system...');
    
    // Initial stats log
    await this.logLotteryStats();
    
    // Main automation loop
    while (this.isRunning) {
      try {
        await this.checkDrawStatus();
        
        // Wait for next check
        await new Promise(resolve => setTimeout(resolve, AUTOMATION_CONFIG.CHECK_INTERVAL));
        
      } catch (error) {
        this.log(`❌ Automation loop error: ${error.message}`, 'ERROR');
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, AUTOMATION_CONFIG.RETRY_DELAY));
      }
    }
  }

  stop() {
    this.log('🛑 Stopping automation system...');
    this.isRunning = false;
  }
}

// Main execution
async function main() {
  const automation = new KasplexAutomation();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    automation.log('Received SIGINT, shutting down gracefully...');
    automation.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    automation.log('Received SIGTERM, shutting down gracefully...');
    automation.stop();
    process.exit(0);
  });
  
  try {
    await automation.initialize();
    await automation.start();
  } catch (error) {
    automation.log(`❌ Automation failed: ${error.message}`, 'ERROR');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { KasplexAutomation };