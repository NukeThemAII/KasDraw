# KasDraw - Decentralized Lottery DApp

A decentralized lottery application built on the Kasplex EVM testnet, featuring multi-tier prizes, rollover jackpots, and transparent on-chain draws.

## 🎯 Features

- **Multi-Tier Prize System**: 4 prize tiers with 60%, 20%, 15%, and 4% distribution
- **Rollover Jackpots**: Unclaimed jackpots roll over to the next draw
- **Admin Fee Structure**: 1% of ticket sales for platform maintenance
- **Secure Smart Contract**: Built with OpenZeppelin standards
- **Enhanced UI**: Kaspa.org-inspired design with vibrant jackpot display
- **MetaMask Integration**: Seamless wallet connection and transactions
- **Real-time Updates**: Live jackpot and draw information
- **Updated Pricing**: 10 KAS per ticket for enhanced prize pools

## 🎮 How to Play

1. **Connect Wallet**: Connect your MetaMask wallet to the Kasplex testnet
2. **Select Numbers**: Choose 6 numbers from 1-49 or use Quick Pick
3. **Purchase Tickets**: Buy tickets for 10 KAS each
4. **Wait for Draw**: Draws occur twice weekly (Wednesday & Saturday at 8 PM)
5. **Claim Prizes**: Check results and claim any winnings

## 🏗️ Technical Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with Kaspa theme
- **Web3**: Wagmi + RainbowKit + Ethers.js v6
- **Smart Contract**: Solidity 0.8.19 + OpenZeppelin
- **Network**: Kasplex EVM Testnet (Chain ID: 167012)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- MetaMask browser extension
- Kasplex testnet KAS tokens

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd KasDraw
   ```

2. **Install dependencies**
   ```bash
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
   Navigate to `http://localhost:5173`

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
- **Numbers**: Select 6 unique numbers from 1-49
- **Multiple Tickets**: Purchase multiple tickets in one transaction

### Prize Structure
- **Jackpot (6 matches)**: 60% of prize pool
- **Second Prize (5 matches)**: 20% of prize pool
- **Third Prize (4 matches)**: 15% of prize pool
- **Fourth Prize (3 matches)**: 4% of prize pool
- **Admin Fee**: 1% of ticket sales

### Draw Schedule
- **Frequency**: Twice weekly
- **Days**: Wednesday and Saturday
- **Time**: 8:00 PM UTC
- **Execution**: Manual draw execution by admin

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
VITE_CONTRACT_ADDRESS=deployed_contract_address
VITE_RPC_URL=https://rpc.kasplex.org
VITE_CHAIN_ID=167012
```

## 🔐 Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Pausable**: Emergency pause functionality
- **Ownable**: Admin access control
- **Input Validation**: Comprehensive number validation
- **Safe Math**: Overflow protection with Solidity 0.8+

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

### Latest Updates (2025-07-23)

#### 🚀 Major Updates
- **Ticket Price Updated**: Changed from 0.1 KAS to 10 KAS for enhanced prize pools
- **Results Page Fixed**: Resolved white screen issue with comprehensive error handling
- **Security Audit Completed**: Full security review with HIGH security rating
- **Contract Redeployment**: New contract deployed at `0xAcef979AB3D7b50657a8334a85407B5c6840F568`
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

- ✅ Frontend: Complete and functional
- ✅ Smart Contract: Ready for deployment
- ✅ Web3 Integration: Fully implemented
- ⏳ Testnet Deployment: Pending
- ⏳ Production Deployment: Pending

---

**Built with ❤️ for the Kaspa community**