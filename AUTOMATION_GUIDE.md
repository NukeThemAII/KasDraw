# KasDraw Lottery Automation Guide

## Overview

This guide explains how to set up and use the automated draw execution system for the KasDraw lottery. The system allows for both manual and automated execution of lottery draws.

## Features

### 1. Decentralized Draw Execution
- **Public Execution**: Anyone can execute draws after the time interval has passed
- **Incentive System**: Executors receive a 0.1 KAS reward for executing draws
- **Time-based Triggers**: Draws can be executed every 7 days
- **Safety Checks**: Multiple validations ensure draws are executed correctly

### 2. Automated Script
- **Smart Monitoring**: Checks if draws can be executed
- **Gas Estimation**: Calculates transaction costs before execution
- **Error Handling**: Comprehensive error reporting and handling
- **Event Parsing**: Displays draw results and rewards

## Setup Instructions

### Prerequisites

1. **Node.js and npm** installed
2. **Hardhat** configured with Kasplex network
3. **Private key** with sufficient KAS for gas fees
4. **Deployed contract** address in `deployment-info.json`

### Environment Configuration

1. Ensure your `.env` file contains:
   ```
   PRIVATE_KEY=your_private_key_here
   KASPLEX_RPC_URL=https://rpc.kasplex.com
   ```

2. Verify `hardhat.config.js` has the Kasplex network configured:
   ```javascript
   networks: {
     kasplex: {
       url: process.env.KASPLEX_RPC_URL,
       accounts: [process.env.PRIVATE_KEY]
     }
   }
   ```

## Usage

### Manual Execution

Run the automation script manually:

```bash
npm run auto-draw
```

Or using Hardhat directly:

```bash
npx hardhat run scripts/autoExecuteDraw.js --network kasplex
```

### Automated Execution

#### Option 1: Cron Job (Linux/macOS)

1. Open crontab:
   ```bash
   crontab -e
   ```

2. Add a job to run every hour:
   ```bash
   0 * * * * cd /path/to/KasDraw && npm run auto-draw >> /var/log/kasdraw-auto.log 2>&1
   ```

3. Or run every 6 hours:
   ```bash
   0 */6 * * * cd /path/to/KasDraw && npm run auto-draw >> /var/log/kasdraw-auto.log 2>&1
   ```

#### Option 2: Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., daily at specific time)
4. Set action to run:
   - Program: `cmd`
   - Arguments: `/c cd /d "C:\path\to\KasDraw" && npm run auto-draw`

#### Option 3: GitHub Actions (CI/CD)

Create `.github/workflows/auto-draw.yml`:

```yaml
name: Auto Execute Draw

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Manual trigger

jobs:
  auto-draw:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run auto-draw
        env:
          PRIVATE_KEY: ${{ secrets.PRIVATE_KEY }}
          KASPLEX_RPC_URL: ${{ secrets.KASPLEX_RPC_URL }}
```

## Smart Contract Functions

### Public Draw Execution

```solidity
function executeDrawPublic() external nonReentrant whenNotPaused
```

**Requirements:**
- Draw interval (7 days) has passed since last draw
- Current draw has not been executed
- At least one ticket sold for current draw
- Contract is not paused

**Rewards:**
- Executor receives 0.1 KAS if contract has sufficient balance
- Event `DrawExecutedByPublic` is emitted

### Timing Functions

```solidity
// Check if draw can be executed
function canExecuteDrawPublic() external view returns (bool canExecute, uint256 timeRemaining)

// Get next draw execution time
function getNextDrawTime() external view returns (uint256 nextDrawTime)
```

## Monitoring and Logging

### Script Output

The automation script provides detailed logging:

```
🎲 Starting automated draw execution check...
📍 Contract address: 0x...
🔑 Executor address: 0x...

📊 Current Lottery State:
   Draw ID: 5
   Total Tickets Sold: 42
   Accumulated Jackpot: 156.7 KAS
   Contract Paused: false

🎫 Tickets for current draw: 8
💰 Executor balance: 10.5 KAS

⛽ Estimating gas for draw execution...
   Estimated gas: 245,678
   Gas price: 1.2 gwei
   Estimated cost: 0.0029 KAS

🎲 Executing draw 5...
📝 Transaction hash: 0x...
✅ Draw executed successfully!

🎯 Draw Results:
   Draw ID: 5
   Winning Numbers: [7, 14, 23, 31, 42, 49]
   Total Prize Pool: 156.7 KAS
   Jackpot Amount: 94.02 KAS

💰 Executor Reward:
   Executor: 0x...
   Reward: 0.1 KAS
```

### Error Handling

Common scenarios handled:
- Draw already executed
- No tickets sold
- Time interval not reached
- Insufficient gas
- Network connectivity issues
- Contract paused

## Security Considerations

### Private Key Management

1. **Never commit private keys** to version control
2. **Use environment variables** for sensitive data
3. **Rotate keys regularly** for production systems
4. **Use hardware wallets** for high-value operations

### Execution Safety

1. **Gas Limits**: Script sets reasonable gas limits
2. **Balance Checks**: Verifies executor has sufficient funds
3. **State Validation**: Multiple checks before execution
4. **Error Recovery**: Graceful handling of failures

### Monitoring

1. **Log Analysis**: Monitor logs for errors or unusual patterns
2. **Balance Alerts**: Set up alerts for low executor balance
3. **Network Status**: Monitor Kasplex network health
4. **Contract Events**: Track draw executions and rewards

## Troubleshooting

### Common Issues

1. **"Draw interval not reached yet"**
   - Wait for the 7-day interval to pass
   - Check `getNextDrawTime()` for exact timing

2. **"No tickets sold for this draw"**
   - Normal behavior, script will skip execution
   - Draw will remain open for ticket sales

3. **"Insufficient funds for gas"**
   - Add more KAS to executor wallet
   - Check current gas prices

4. **"Contract is paused"**
   - Contact contract owner
   - Check for emergency situations

5. **"Network connection failed"**
   - Check Kasplex RPC endpoint
   - Verify internet connectivity
   - Try alternative RPC endpoints

### Debug Mode

For detailed debugging, modify the script to include:

```javascript
// Add at the top of autoExecuteDraw.js
const DEBUG = process.env.DEBUG === 'true';

// Use throughout the script
if (DEBUG) {
    console.log('Debug info:', debugData);
}
```

Run with debug mode:
```bash
DEBUG=true npm run auto-draw
```

## Best Practices

1. **Regular Monitoring**: Check automation logs regularly
2. **Balance Management**: Maintain sufficient KAS for gas fees
3. **Backup Executors**: Set up multiple automation instances
4. **Testing**: Test on testnet before production deployment
5. **Documentation**: Keep this guide updated with changes

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review contract events and logs
3. Verify network and configuration
4. Contact the development team

---

*Last updated: [Current Date]*
*Version: 1.0*