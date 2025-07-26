# DecentralizedLottery Smart Contract

## Overview

The DecentralizedLottery is a next-generation, fully decentralized lottery protocol designed for EVM-compatible blockchains with fast block times (like Kasplex and Igra testnets). This contract eliminates centralized control while maintaining security, fairness, and gas efficiency.

## Key Features

### 🔒 Zero Centralization
- **No Admin Control**: No centralized withdrawal functions or manual interventions
- **Autonomous Operation**: Draws execute automatically based on time and block conditions
- **Community Driven**: Anyone can execute draws and earn rewards
- **Transparent Economics**: All fees and distributions are hardcoded and immutable

### 🎲 Enhanced Randomness
- **Multi-Source Entropy**: Combines block hash, timestamp, difficulty, and transaction data
- **Fast Block Optimization**: Leverages 10 BPS (blocks per second) for better randomness
- **Manipulation Resistant**: Uses multiple unpredictable sources
- **Cryptographically Secure**: Built on keccak256 hash functions

### ⚡ Gas Optimized
- **Efficient Storage**: Packed structs and optimized data layouts
- **Batch Operations**: Support for multiple ticket purchases in single transaction
- **Smart Caching**: Reduced redundant calculations
- **Minimal External Calls**: Self-contained logic reduces gas costs

### 📊 Analytics Ready
- **Comprehensive Metrics**: Total draws, tickets sold, prizes distributed
- **Player Statistics**: Individual performance tracking
- **Real-time Data**: Live jackpot and draw information
- **Historical Records**: Complete draw and winner history

### 🛡️ Security Features
- **Reentrancy Protection**: Built-in guards against reentrancy attacks
- **Emergency Circuit Breaker**: Automatic pause for unusual jackpot sizes
- **Input Validation**: Comprehensive checks for all user inputs
- **Overflow Protection**: SafeMath equivalent built-in (Solidity 0.8+)

## Game Mechanics

### Ticket System
- **Price**: 0.1 KAS per ticket
- **Numbers**: Select 5 numbers from 1-35
- **Batch Limit**: Maximum 50 tickets per transaction
- **Validation**: Automatic duplicate and range checking

### Prize Distribution
- **Jackpot (5 matches)**: 50% of prize pool
- **2nd Prize (4 matches)**: 25% of prize pool
- **3rd Prize (3 matches)**: 15% of prize pool
- **4th Prize (2 matches)**: 9.25% of prize pool
- **Protocol Fee**: 0.5% for contract maintenance
- **Executor Reward**: 0.25% for draw execution

### Draw Timing
- **Production Mode**: Every 1 hour (3600 seconds)
- **Testing Mode**: Every 10 minutes (600 seconds)
- **Dual Conditions**: Both time AND block number must be reached
- **Public Execution**: Anyone can trigger draws and earn rewards

## Contract Architecture

### Core Components

```solidity
// Main data structures
struct Ticket {
    address player;
    uint256[5] numbers;
    uint256 drawId;
    bool claimed;
    uint256 purchaseTime;
    uint256 batchId;
}

struct Draw {
    uint256 id;
    uint256[5] winningNumbers;
    uint256 timestamp;
    uint256 totalPrizePool;
    uint256 jackpotAmount;
    uint256 totalTickets;
    bool executed;
    address executor;
    uint256 randomSeed;
}

struct LotteryAnalytics {
    uint256 totalDraws;
    uint256 totalTicketsSold;
    uint256 totalPrizesDistributed;
    uint256 totalProtocolFees;
    uint256 averageJackpot;
    uint256 largestJackpot;
    uint256 totalPlayers;
}
```

### Key Functions

#### User Functions
- `purchaseTickets(uint256[5][] ticketNumbers)`: Buy multiple tickets
- `claimPrizes(uint256[] ticketIds)`: Claim winnings from multiple tickets
- `executeDraw()`: Execute draw and earn reward (public)

#### View Functions
- `getDrawInfo()`: Current draw status and jackpot
- `getTimeUntilDraw()`: Time and blocks remaining
- `getDraw(uint256 drawId)`: Historical draw information
- `getTicket(uint256 ticketId)`: Ticket details
- `getPlayerStats(address player)`: Player statistics
- `getAnalytics()`: Global lottery analytics

#### Testing Functions (Testing Mode Only)
- `setTestingMode(bool enabled, uint256 testInterval)`: Configure testing
- `forceExecuteDrawForTesting()`: Force draw execution for testing

#### Emergency Functions
- `emergencyPause()`: Pause contract (automatic circuit breaker)
- `emergencyUnpause()`: Resume operations

## Deployment Guide

### Prerequisites
- Node.js 16+
- Hardhat development environment
- Network configuration (Kasplex/Igra/Local)

### Deployment Steps

1. **Configure Network**
   ```bash
   # Update hardhat.config.js with network settings
   # Set environment variables in .env
   ```

2. **Deploy Contract**
   ```bash
   # For testing mode (10-minute draws)
   npx hardhat run scripts/deployDecentralizedLottery.js --network kasplex
   
   # For production mode (1-hour draws)
   # Set PRODUCTION_MODE=true in deployment script
   ```

3. **Verify Deployment**
   ```bash
   # Check deployment info
   cat deployment-info-kasplex-decentralized.json
   
   # Verify contract on explorer (if available)
   npx hardhat verify --network kasplex <CONTRACT_ADDRESS> <TESTING_MODE>
   ```

### Network Configurations

#### Kasplex Testnet
```javascript
kasplex: {
  url: "https://rpc.kasplextest.xyz/",
  chainId: 167012,
  accounts: [process.env.PRIVATE_KEY],
  gasPrice: 20000000000, // 20 gwei
  gas: 8000000
}
```

#### Igra Labs Testnet
```javascript
igra: {
  url: "https://rpc.igra.world/",
  chainId: 167013,
  accounts: [process.env.PRIVATE_KEY],
  gasPrice: 15000000000, // 15 gwei
  gas: 6000000
}
```

## Testing

### Comprehensive Test Suite

```bash
# Run all tests
npx hardhat test test/DecentralizedLottery.test.js

# Run specific test categories
npx hardhat test --grep "Ticket Purchase"
npx hardhat test --grep "Draw Execution"
npx hardhat test --grep "Prize Claiming"
npx hardhat test --grep "Security"
```

### Test Coverage
- ✅ Contract deployment and initialization
- ✅ Ticket purchasing (single and batch)
- ✅ Draw execution (automatic and manual)
- ✅ Prize calculation and claiming
- ✅ Analytics and statistics
- ✅ Security features (reentrancy, emergency pause)
- ✅ Gas optimization validation
- ✅ Testing mode functionality

## Frontend Integration

### Configuration
The contract integrates with the existing KasDraw frontend through updated configuration files:

- `src/config/lottery.ts`: Contract ABI and configuration
- Updated ticket price: 0.1 KAS
- Updated game rules: 5 numbers from 1-35
- New analytics endpoints

### Key Integration Points

```typescript
// Purchase tickets
const tx = await contract.purchaseTickets(ticketNumbers, {
  value: ethers.utils.parseEther((ticketCount * 0.1).toString())
});

// Get current draw info
const drawInfo = await contract.getDrawInfo();

// Execute draw (earn reward)
const tx = await contract.executeDraw();

// Claim prizes
const tx = await contract.claimPrizes(ticketIds);

// Get analytics
const analytics = await contract.getAnalytics();
```

## Security Considerations

### Implemented Protections

1. **Reentrancy Guards**: All external calls protected
2. **Input Validation**: Comprehensive parameter checking
3. **Access Control**: No privileged functions in production
4. **Circuit Breaker**: Automatic pause for large jackpots
5. **Overflow Protection**: Built-in SafeMath (Solidity 0.8+)
6. **Randomness**: Multi-source entropy generation

### Audit Recommendations

1. **External Audit**: Recommended before mainnet deployment
2. **Formal Verification**: Consider for critical functions
3. **Bug Bounty**: Implement community security program
4. **Gradual Rollout**: Start with small jackpots

## Gas Optimization

### Implemented Optimizations

1. **Packed Structs**: Efficient storage layout
2. **Batch Operations**: Multiple tickets per transaction
3. **Cached Calculations**: Reduced redundant computations
4. **Optimized Loops**: Minimal iteration overhead
5. **Storage Patterns**: Strategic use of storage vs memory

### Gas Estimates

- **Deploy Contract**: ~3,500,000 gas
- **Purchase 1 Ticket**: ~150,000 gas
- **Purchase 10 Tickets**: ~800,000 gas
- **Execute Draw**: ~200,000 gas
- **Claim Prize**: ~100,000 gas

## Roadmap

### Phase 1: Core Implementation ✅
- Basic lottery functionality
- Security features
- Testing framework

### Phase 2: Enhanced Features 🚧
- Advanced analytics dashboard
- Multi-network deployment
- Performance optimizations

### Phase 3: Ecosystem Integration 📋
- Cross-chain compatibility
- DeFi integrations
- Community governance

## Contributing

### Development Setup

```bash
# Clone repository
git clone <repository-url>
cd KasDraw

# Install dependencies
npm install

# Run tests
npx hardhat test

# Deploy locally
npx hardhat node
npx hardhat run scripts/deployDecentralizedLottery.js --network localhost
```

### Code Standards

- Follow Solidity style guide
- Comprehensive NatSpec documentation
- 100% test coverage for new features
- Gas optimization analysis
- Security review for all changes

## License

MIT License - see LICENSE file for details

## Support

For technical support or questions:
- Create GitHub issues for bugs
- Join community discussions
- Review documentation and examples

---

**⚠️ Disclaimer**: This is experimental software. Use at your own risk. Always conduct thorough testing before deploying to mainnet.