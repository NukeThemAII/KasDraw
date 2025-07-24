# KasDraw Lottery Automation Guide

This guide explains how to set up automated lottery draw execution for the KasDraw lottery system.

## Overview

The KasDraw lottery system supports automated draw execution through smart contract functions. Draws can be executed automatically when the time interval has passed and there are tickets sold.

## Current System Status

- **Draw Frequency**: Twice per week (every 3.5 days)
- **Auto-execution**: Enabled with public execution rewards
- **Executor Reward**: 0.1% of jackpot (min 0.1 KAS, max 10 KAS)
- **Contract Address**: `0x5FbDB2315678afecb367f032d93F642f64180aa3` (localhost)

## Automation Methods

### 1. Enhanced Automation Script

The new `scripts/automation.js` provides comprehensive automation:

```bash
# Run automation check
npx hardhat run scripts/automation.js --network localhost

# For production
npx hardhat run scripts/automation.js --network kaspa
```

**Features:**
- Automatic draw execution when ready
- Comprehensive logging and error handling
- Real-time lottery statistics
- Transaction confirmation and gas tracking

### 2. Cron Job Setup (Production)

**Recommended Schedule**: Every 2 hours to ensure timely execution

```bash
# Edit crontab
crontab -e

# Add entry to check every 2 hours
0 */2 * * * cd /path/to/kasdraw && npx hardhat run scripts/automation.js --network kaspa >> /var/log/kasdraw-automation.log 2>&1
```

**Alternative for high-frequency checking:**
```bash
# Check every 30 minutes during peak times
*/30 * * * * cd /path/to/kasdraw && npx hardhat run scripts/automation.js --network kaspa
```

### 3. Manual Execution (Backup)

For testing or emergency execution:

```bash
# Check if draw can be executed
npx hardhat console --network localhost

# In the console:
const lottery = await ethers.getContractAt("KasDrawLottery", "0x5FbDB2315678afecb367f032d93F642f64180aa3")
const canExecute = await lottery.canExecuteDrawPublic()
console.log("Can execute:", canExecute)

if (canExecute) {
  const tx = await lottery.executeDrawPublic()
  console.log("Transaction:", tx.hash)
}
```

## Configuration

### Environment Variables

```env
# Required for production
PRIVATE_KEY=your_executor_private_key
KASPA_RPC_URL=https://rpc.kasplextest.xyz/

# Optional
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
LOG_LEVEL=info
```

### Network Configuration

Update contract address in `src/config/lottery.ts` after each deployment:

```typescript
export const LOTTERY_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
```

## Monitoring & Logging

### Log Files

Automation generates structured logs:

- `logs/executions.json`: Successful draw executions (last 100)
- `logs/errors.json`: Error logs and failures (last 50)
- System logs: `/var/log/kasdraw-automation.log`

### Log Structure

**Execution Log:**
```json
{
  "timestamp": "2024-12-27T12:00:00.000Z",
  "txHash": "0x...",
  "blockNumber": 12345,
  "gasUsed": "150000",
  "oldJackpot": "69.3",
  "newJackpot": "0.1",
  "executorReward": "0.693"
}
```

**Error Log:**
```json
{
  "timestamp": "2024-12-27T12:00:00.000Z",
  "error": "Error message",
  "stack": "Full stack trace"
}
```

### Health Monitoring

Regular checks:

1. **Executor Balance**: Ensure sufficient KAS for gas fees
2. **Draw Frequency**: Verify draws execute every 3.5 days
3. **Error Rate**: Monitor `logs/errors.json` for issues
4. **Network Status**: Check RPC connectivity

## Production Deployment

### 1. Server Setup

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy to production network
npx hardhat run scripts/deploy.js --network kaspa

# Update frontend configuration
# Edit src/config/lottery.ts with new contract address

# Test automation
npx hardhat run scripts/automation.js --network kaspa
```

### 2. Cron Configuration

```bash
# Create automation user
sudo useradd -m kasdraw-automation
sudo su - kasdraw-automation

# Setup cron
crontab -e

# Production schedule (every 2 hours)
0 */2 * * * cd /home/kasdraw-automation/kasdraw && /usr/bin/node /usr/bin/npx hardhat run scripts/automation.js --network kaspa >> /var/log/kasdraw-automation.log 2>&1

# Log rotation
0 0 * * 0 /usr/sbin/logrotate /etc/logrotate.d/kasdraw-automation
```

### 3. Monitoring Setup

```bash
# Create monitoring script
cat > /home/kasdraw-automation/monitor.sh << 'EOF'
#!/bin/bash
LOG_FILE="/var/log/kasdraw-automation.log"
ERROR_COUNT=$(tail -100 "$LOG_FILE" | grep -c "❌")

if [ "$ERROR_COUNT" -gt 5 ]; then
    echo "High error rate detected: $ERROR_COUNT errors in last 100 lines" | mail -s "KasDraw Automation Alert" admin@example.com
fi
EOF

chmod +x /home/kasdraw-automation/monitor.sh

# Add to cron (daily check)
0 9 * * * /home/kasdraw-automation/monitor.sh
```

## Troubleshooting

### Common Issues

1. **"Draw not ready yet"**
   - Normal behavior, wait for next interval
   - Check `nextDrawTime` in logs

2. **"Insufficient funds"**
   - Top up executor account with KAS
   - Minimum: 1 KAS for gas fees

3. **"Contract call failed"**
   - Check network connectivity
   - Verify contract address is correct
   - Ensure contract is not paused

4. **"Transaction timeout"**
   - Increase gas limit in script
   - Check network congestion

### Recovery Procedures

1. **Missed Draw**:
   ```bash
   # Check current status
   npx hardhat run scripts/automation.js --network kaspa
   
   # Force execution if needed
   npx hardhat console --network kaspa
   # Manual execution commands...
   ```

2. **Contract Upgrade**:
   ```bash
   # Deploy new contract
   npx hardhat run scripts/deploy.js --network kaspa
   
   # Update configuration
   # Edit src/config/lottery.ts
   # Update scripts/automation.js if needed
   
   # Test new deployment
   npx hardhat run scripts/automation.js --network kaspa
   ```

## Security Best Practices

1. **Private Key Security**:
   - Use hardware wallet for production
   - Store keys in secure environment variables
   - Never commit keys to version control

2. **Access Control**:
   - Dedicated automation user account
   - Minimal system permissions
   - Regular security audits

3. **Monitoring**:
   - Real-time error alerts
   - Transaction monitoring
   - Balance threshold alerts

## Maintenance Schedule

### Daily
- Check automation logs for errors
- Verify last execution time

### Weekly
- Review executor account balance
- Check system resource usage
- Validate draw frequency

### Monthly
- Update dependencies
- Review and rotate logs
- Performance optimization

### Quarterly
- Security audit
- Backup and disaster recovery testing
- Documentation updates

## Support & Escalation

### Log Analysis
```bash
# Check recent executions
tail -20 logs/executions.json

# Check for errors
tail -20 logs/errors.json

# System logs
tail -50 /var/log/kasdraw-automation.log
```

### Emergency Contacts
- Development Team: dev@kasdraw.com
- System Admin: admin@kasdraw.com
- 24/7 Support: +1-XXX-XXX-XXXX

### Escalation Matrix
1. **Level 1**: Automation script errors (auto-retry)
2. **Level 2**: Network connectivity issues (manual intervention)
3. **Level 3**: Contract failures (development team)
4. **Level 4**: Security incidents (immediate escalation)

---

**Last Updated**: December 27, 2024
**Version**: 2.0
**Next Review**: March 27, 2025