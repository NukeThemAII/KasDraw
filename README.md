# KasDraw - Kaspa Lottery DApp 🎲

A production-ready decentralized lottery application built on the Kaspa blockchain, featuring automated draws, real-time updates, transparent prize distribution, and a modern web interface.

## 🌟 Features

### Core Functionality
- **Decentralized Lottery**: Smart contract-based lottery system with enhanced security
- **Automated Draws**: Time-based automatic draw execution (every 3.5 days)
- **Real-time Updates**: Live jackpot and countdown with 5-10 second refresh intervals
- **Transparent Prizes**: On-chain prize calculation and distribution
- **Executor Rewards**: Public execution with 0.1% jackpot rewards (min 0.1 KAS, max 10 KAS)

### User Experience
- **Modern UI**: React-based responsive web interface with Kaspa branding
- **Live Data**: Real-time jackpot display and countdown timer
- **Wallet Integration**: Seamless connection with Kaspa-compatible wallets
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Mobile Responsive**: Optimized for all device sizes

### Technical Excellence
- **Production Ready**: Comprehensive automation and monitoring system
- **High Performance**: Optimized contract interactions and caching
- **Robust Logging**: Structured JSON logging for monitoring and debugging
- **Security First**: Enhanced validation, reentrancy protection, and access controls

## 🎮 How to Play

1. **Connect Wallet**: Click "Connect Wallet" and select your Kaspa wallet
2. **View Current Draw**: See live jackpot amount and countdown timer
3. **Purchase Tickets**: Navigate to "Play" page and buy tickets (10 KAS each)
4. **Select Numbers**: Choose 5 numbers from 1-35 for each ticket
5. **Wait for Draw**: Draws occur automatically every 3.5 days
6. **Check Results**: View results on the "Draw" page
7. **Claim Prizes**: Winners can claim prizes directly from the interface

## 🏗️ Technical Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with Kaspa theme
- **Web3**: Wagmi v2 + RainbowKit + Ethers.js v6
- **Smart Contract**: Solidity 0.8.19 + OpenZeppelin
- **State Management**: Zustand + React Query
- **Notifications**: Sonner toast system
- **Network**: Kasplex EVM Testnet (Chain ID: 167012)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- MetaMask browser extension
- Kasplex testnet KAS tokens
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/kasdraw.git
   cd KasDraw
   ```

2. **Install dependencies (pnpm recommended)**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to `http://localhost:5175`

### Development Setup

```bash
# 1. Start local Hardhat node
npx hardhat node

# 2. Deploy contracts (in another terminal)
npx hardhat run scripts/deploy.js --network localhost

# 3. Populate with test data
npx hardhat run scripts/purchase-tickets.js --network localhost

# 4. Start frontend development server
npm run dev

# 5. Open browser to http://localhost:5175
```

## 📋 Smart Contract Deployment

### Deploy to Kasplex Testnet

1. **Configure Hardhat**
   ```bash
   # Ensure .env file has your private key
   PRIVATE_KEY=your_private_key_here
   ```

2. **Compile contracts**
   ```bash
   npx hardhat compile
   ```

3. **Deploy to testnet**
   ```bash
   npx hardhat run scripts/deploy.js --network kasplex
   ```

4. **Update contract address**
   - Copy the deployed contract address
   - Update `VITE_CONTRACT_ADDRESS` in `.env`
   - Restart the development server

### Contract Verification

After deployment, verify the contract on the Kasplex block explorer for transparency.

## 🎯 Game Rules

### Ticket Purchase
- **Price**: 10 KAS per ticket
- **Numbers**: Select 5 unique numbers from 1-35
- **Multiple Tickets**: Purchase multiple tickets in one transaction

### Prize Structure
- **Tier 1 (5/5 matches)**: 60% of prize pool (Jackpot)
- **Tier 2 (4/5 matches)**: 20% of prize pool
- **Tier 3 (3/5 matches)**: 15% of prize pool
- **Tier 4 (2/5 matches)**: 5% of prize pool
- **Admin Fee**: 1% of ticket sales

### Draw Schedule
- **Frequency**: Every 7 days
- **Execution**: Automated or public execution
- **Incentive**: 0.1 KAS reward for executing draws
- **Transparency**: All draws recorded on blockchain

## 🔧 Development

### Project Structure
```
KasDraw/
├── contracts/           # Solidity smart contracts
├── scripts/            # Deployment scripts
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom React hooks
│   ├── config/        # Configuration files
│   └── utils/         # Utility functions
├── public/            # Static assets
└── docs/              # Documentation
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npx hardhat compile` - Compile smart contracts
- `npx hardhat test` - Run contract tests

### Environment Variables

```bash
# Smart contract deployment
PRIVATE_KEY=your_private_key_here
ADMIN_ADDRESS=0x2546BcD3c84621e976D8185a91A922aE77ECEc30

# Frontend configuration
VITE_CONTRACT_ADDRESS=0x1e53ab878e2e5F66db4337894Ed22e0F9b07BD97
VITE_RPC_URL=https://rpc.kasplextest.xyz
VITE_CHAIN_ID=167012

# Note: Contract address updated with latest Kasplex testnet deployment
# Deployed: 2025-01-15 with enhanced security features
# Previous addresses: 0x0165878A594ca255338adfa4d48449f69242Eb8F, 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

## 🌿 Development Workflow

### Branch Strategy

We use a two-branch development strategy to ensure code stability:

- **`main` branch**: Production-ready, stable code only
- **`dev` branch**: Active development and testing

### Development Process

1. **Development Work**: All new features and changes are made on the `dev` branch
2. **Testing**: Thoroughly test changes on `dev` branch
3. **Merge to Main**: Only tested, working code is merged from `dev` to `main`
4. **Rollback Safety**: If issues arise, we can reset `dev` from `main` and start over

### Branch Commands

```bash
# Switch to dev branch for development
git checkout dev

# Create feature branch from dev (optional)
git checkout -b feature/new-feature dev

# Push changes to dev branch
git push origin dev

# Switch back to main (stable)
git checkout main

# Reset dev branch from main if needed
git checkout dev
git reset --hard main
git push --force-with-lease origin dev
```

### Current Branch Status
- **Active Development**: `dev` branch
- **Production**: `main` branch
- **Contract Address**: Updated in both branches

## Timer System Documentation

### How KasDraw Timers Work

KasDraw uses a sophisticated dual-validation timing system that combines both blockchain timestamps and block numbers to ensure accurate and tamper-proof draw intervals.

#### Timer Architecture

**1. Dual Validation System**
- **Timestamp Validation**: Uses `block.timestamp` for human-readable time tracking
- **Block Validation**: Uses block numbers for additional security and consistency
- **Combined Logic**: Both conditions must be met for draw execution

**2. On-Chain Data Sources**
- **Primary Source**: Smart contract state (`canExecuteDrawPublic()` function)
- **Real-time Updates**: Frontend polls contract every 5-10 seconds
- **Block-based Accuracy**: Leverages blockchain's immutable block progression

**3. Timer Accuracy & Reliability**
- **Precision**: Accurate to the blockchain block time (~15 seconds on most networks)
- **Tamper-proof**: Cannot be manipulated by external parties
- **Network Independent**: Works consistently across different network conditions
- **Fail-safe**: Multiple validation layers prevent premature execution

#### Technical Implementation

**Smart Contract Timer Logic:**
```solidity
function canExecuteDrawPublic() external view returns (
    bool canExecute,
    uint256 timeRemaining,
    uint256 nextDrawTime,
    uint256 blocksRemaining,
    uint256 nextDrawBlock
) {
    bool timeReached = block.timestamp >= nextDrawTime;
    bool blockReached = block.number >= nextDrawBlock;
    bool canExec = timeReached && blockReached;
    
    uint256 timeRem = timeReached ? 0 : nextDrawTime - block.timestamp;
    uint256 blockRem = blockReached ? 0 : nextDrawBlock - block.number;
    
    return (canExec, timeRem, nextDrawTime, blockRem, nextDrawBlock);
}
```

**Frontend Timer Integration:**
- **Live Updates**: `refetchInterval: 5000ms` for real-time countdown
- **State Management**: React hooks manage timer state and updates
- **Error Handling**: Graceful fallbacks for network issues
- **Visual Feedback**: Real-time countdown display with blockchain validation indicators

#### Timer Data Flow

1. **Contract State**: Smart contract calculates next draw time and block
2. **Frontend Polling**: React app queries contract every 5 seconds
3. **Data Processing**: Hook processes raw blockchain data into readable format
4. **UI Updates**: Countdown timer updates in real-time
5. **Validation**: Multiple checks ensure execution readiness

#### Security & Accuracy Features

**Blockchain-Native Timing:**
- Uses immutable blockchain timestamps
- Cannot be manipulated by external actors
- Consistent across all network participants

**Dual Validation:**
- Timestamp AND block number must both be reached
- Prevents edge cases and timing attacks
- Ensures reliable 3.5-day intervals

**Real-time Synchronization:**
- Frontend stays synchronized with blockchain state
- Automatic retry mechanisms for failed requests
- Graceful handling of network interruptions

## 🔐 Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Pausable**: Emergency pause functionality
- **Ownable**: Admin access control
- **Input Validation**: Comprehensive number validation
- **Safe Math**: Overflow protection with Solidity 0.8+
- **🆕 Block-Based Timing**: Enhanced security with block number validation
- **🆕 Dual Validation**: Both time and block-based draw execution controls
- **🆕 Frontend Security**: Improved UI state management prevents premature draw execution
- **🆕 Smart Contract Protection**: Multiple layers of validation prevent unauthorized draws

### 📋 Security Audit

KasDraw has undergone a comprehensive security audit. For detailed security analysis, vulnerability assessment, and recommendations, see:

**[📄 Security Audit Report](./SECURITY_AUDIT_REPORT.md)**

**Audit Summary:**
- **Overall Security Rating**: HIGH
- **Critical Vulnerabilities**: None identified
- **High-Risk Issues**: None identified
- **Medium-Risk Issues**: 1 (RNG methodology - mitigated by Kasplex L2 speed)
- **Status**: Approved for testnet operation and well-positioned for mainnet deployment

## 🎲 Random Number Generation

### Current Method: Enhanced Fisher-Yates Shuffle

KasDraw uses a sophisticated random number generation system that combines multiple entropy sources for better randomness distribution:

#### **Algorithm**: Fisher-Yates Shuffle
- **Purpose**: Ensures uniform distribution of selected numbers
- **Process**: Selects 5 unique numbers from 1-35 without replacement
- **Guarantee**: Each number has equal probability of selection
- **Enhanced Odds**: Improved winning chances with smaller number pool

#### **Entropy Sources**
```solidity
// Multiple blockchain variables combined for entropy
uint256 baseEntropy = uint256(keccak256(abi.encodePacked(
    block.timestamp,    // Current block time
    block.difficulty,   // Network difficulty
    block.number,       // Current block number
    block.coinbase,     // Miner address
    msg.sender,         // Function caller
    currentDrawId,      // Draw identifier
    totalTicketsSold,   // Ticket sales count
    address(this).balance, // Contract balance
    gasleft()          // Remaining gas
)));
```

#### **Security Considerations**
- **⚠️ Medium Risk**: Uses on-chain variables for randomness
- **Mitigation**: Multiple entropy sources reduce predictability
- **Enhancement**: Additional entropy generated for each number selection
- **Future**: Consider Chainlink VRF for production deployment

#### **Process Flow**
1. **Initialize**: Create array of all possible numbers (1-49)
2. **Generate Base Entropy**: Combine multiple blockchain variables
3. **Select Numbers**: Use Fisher-Yates algorithm with enhanced entropy
4. **Sort Results**: Return numbers in ascending order for consistency

#### **Advantages**
- ✅ **Uniform Distribution**: Each number has equal selection probability
- ✅ **No Duplicates**: Algorithm guarantees unique number selection
- ✅ **Enhanced Entropy**: Multiple sources reduce predictability
- ✅ **Gas Efficient**: Optimized for blockchain execution

#### **Limitations**
- ⚠️ **Miner Influence**: Potential manipulation on some networks
- ⚠️ **Predictability**: Advanced actors might predict some variables
- 💡 **Recommendation**: Upgrade to Chainlink VRF for maximum security

## 🌐 Network Configuration

### Kasplex EVM Testnet
- **Chain ID**: 167012
- **RPC URL**: https://rpc.kasplex.org
- **Currency**: KAS
- **Block Explorer**: [Kasplex Explorer](https://explorer.kasplex.org)

### MetaMask Setup
1. Open MetaMask
2. Add Custom Network
3. Enter Kasplex testnet details
4. Import test KAS tokens

## 📊 Admin Dashboard

The admin dashboard provides:
- **Draw Management**: Execute lottery draws
- **Financial Overview**: Monitor jackpots and fees
- **Player Statistics**: View participation metrics
- **Emergency Controls**: Pause/unpause functionality

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Kaspa Theming**: Turquoise and blue color scheme
- **Real-time Updates**: Live jackpot and countdown
- **Transaction Feedback**: Clear success/error messages
- **Accessibility**: WCAG compliant design

## 📝 Changelog

### 2025-01-15 - Security & Automation Update
- **🔒 Critical Security Fixes**: Fixed flawed prize calculation logic
- **⚡ Gas Optimization**: Optimized `getDrawWinners` function for better performance
- **🎯 Decentralized Execution**: Added `executeDrawPublic()` for community-driven draws
- **🤖 Automation System**: Comprehensive automated draw execution with monitoring
- **💰 Executor Incentives**: 0.1 KAS reward for triggering draws
- **📊 Enhanced Events**: Improved logging and transparency
- **📚 Documentation**: Complete automation guide and setup instructions

### Latest Updates (2025-01-27)

#### 🔒 Security & Timing Enhancements
- **Block-Based Timing**: Enhanced draw execution security with block number validation
- **Dual Validation System**: Both timestamp and block-based controls for draw execution
- **Frontend Security**: Improved UI state management prevents premature draw button activation
- **Smart Contract Protection**: Multiple validation layers prevent unauthorized draw execution
- **Enhanced canExecuteDrawPublic**: Returns comprehensive timing and block information
- **UI Responsiveness**: Fixed white page issues with better error handling and auto-refresh
- **Contract Redeployment**: New secure contract deployed at `0x5FbDB2315678afecb367f032d93F642f64180aa3`

#### 🚀 Previous Major Updates (2025-07-23)
- **Ticket Price Updated**: Changed from 0.1 KAS to 10 KAS for enhanced prize pools
- **Results Page Fixed**: Resolved white screen issue with comprehensive error handling
- **Security Audit Completed**: Full security review with HIGH security rating
- **Enhanced Error Handling**: Improved RPC connection resilience and user feedback
- **Simplified UI**: Streamlined Results page for better user experience

#### 🎨 UI Enhancements
- **Enhanced Jackpot Display**: Redesigned jackpot section with vibrant Kaspa.org-inspired colors
- **Improved Visibility**: Larger, more prominent jackpot numbers with gradient text effects
- **Better Contrast**: Enhanced color scheme for better readability
- **Animated Elements**: Added subtle animations and glow effects for visual appeal

#### 🎯 Technical Improvements
- **Color Palette Update**: Refreshed CSS variables with Kaspa.org-inspired theme
- **Responsive Design**: Improved mobile and desktop jackpot display
- **Performance**: Optimized rendering and reduced bundle size

## 🧪 Testing

### Frontend Testing
```bash
npm run test
```

### Smart Contract Testing
```bash
npx hardhat test
```

### Manual Testing Checklist
- [ ] Wallet connection
- [ ] Ticket purchase flow
- [ ] Number selection validation
- [ ] Prize claiming
- [ ] Admin functions
- [ ] Mobile responsiveness

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the smart contract code

## 🚀 Deployment Status

- ✅ Frontend: Complete and functional with enhanced security
- ✅ Smart Contract: Deployed with block-based timing security
- ✅ Web3 Integration: Fully implemented with improved error handling
- ✅ Local Development: Ready and tested
- ✅ Security Enhancements: Block-based timing and dual validation implemented
- ⏳ Testnet Deployment: Ready for deployment
- ⏳ Production Deployment: Pending final testing

---

**Built with ❤️ for the Kaspa community**