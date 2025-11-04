# ChainSage (0g-Sygna) - AI-Powered Blockchain Intelligence

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://chainsage-app.vercel.app)
[![0G Mainnet](https://img.shields.io/badge/0G-Mainnet-blue)](https://chainscan.0g.ai/address/0x65259ad0C0872E9EC83b8fcd0a8541BC7015C0978)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Real-time blockchain monitoring meets AI-powered risk detection on the 0G Network**

Built for **0G WaveHack 5th Wave** | Team: **Teamerz1111**

---

## 🚀 Quick Links

- **🌐 Live Application:** https://chainsage-app.vercel.app
- **📜 Smart Contract:** [0x65259ad0C0872E9EC83b8fcd0a8541BC7015C0978](https://chainscan.0g.ai/address/0x65259ad0C0872E9EC83b8fcd0a8541BC7015C0978)
- **🐦 Twitter Thread:** [PASTE YOUR X LINK - Tag @0G_Builders]
- **🔗 Backend API:** https://backend-3o2x.onrender.com
- **📦 Contracts Repo:** https://github.com/Teamerz1111/contracts
- **🖥️ Backend Repo:** https://github.com/Teamerz1111/backend

---

## 📋 Table of Contents

- [Overview](#overview)
- [The Problem We Solve](#the-problem-we-solve)
- [Our Solution](#our-solution)
- [Unique Selling Points](#unique-selling-points)
- [0G Network Integration](#0g-network-integration)
- [Smart Contract Deployment](#smart-contract-deployment)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [Testing](#testing)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## 🎯 Overview

ChainSage is an **AI-powered blockchain monitoring platform** that provides real-time security intelligence for crypto users. Unlike traditional blockchain explorers that only display raw transaction data, ChainSage analyzes every transaction using **0G Compute Network's decentralized AI** to detect risks, suspicious patterns, and anomalies before they become problems.

Think of it as having a **24/7 security analyst** watching the blockchain for you, powered by 0G's decentralized infrastructure.

### 🏆 WaveHack 5th Wave Submission

This project demonstrates the full power of the 0G ecosystem:
- ✅ **0G Compute Network** for decentralized AI processing
- ✅ **0G Mainnet** for smart contract deployment (Chain ID: 16661)
- ✅ **Production-ready** application deployed and accessible
- ✅ **Real-world utility** for blockchain security and monitoring

---

## 🔍 The Problem We Solve

### Current Challenges in Blockchain Monitoring:

1. **Data Overload:** Blockchain explorers show raw transaction data without context or analysis
2. **Manual Analysis Required:** Users must manually investigate suspicious activity
3. **Reactive Security:** Most tools alert you AFTER problems occur
4. **Centralized Dependencies:** Traditional monitoring relies on centralized APIs with rate limits
5. **No Risk Intelligence:** No automated risk scoring or pattern detection
6. **Poor UX:** Complex interfaces requiring blockchain expertise

### Real-World Impact:

- Users lose funds to scams and hacks that could have been detected
- Traders miss suspicious patterns in wallet activity
- DeFi users can't easily assess counterparty risk
- Security researchers lack automated analysis tools

---

## 💡 Our Solution

ChainSage combines **decentralized AI** with **on-chain smart contracts** to provide:

### 🤖 AI-Powered Risk Analysis
- Automatic risk scoring (0-100 scale) for every transaction
- Pattern detection for suspicious activity
- Natural language explanations of detected risks
- Real-time anomaly detection

### 📊 Real-Time Monitoring
- Watch any wallet address 24/7
- Instant alerts for unusual activity
- WebSocket-powered live updates
- Transaction pattern analysis

### 🔗 On-Chain Watchlist Management
- Store watchlists directly on 0G Mainnet
- Trustless, persistent data storage
- Event-driven real-time synchronization
- Decentralized access control

### 🎨 Beautiful User Experience
- Clean, intuitive cyberpunk-themed UI
- No blockchain expertise required
- One-click wallet connection
- Instant insights without configuration

---

## ⭐ Unique Selling Points

### What Makes ChainSage Stand Out in the 0G Ecosystem?

#### 1. **Truly Decentralized AI**
Unlike competitors using centralized AI APIs (OpenAI, Anthropic), ChainSage leverages **0G Compute Network** for:
- No single point of failure
- Censorship-resistant analysis
- Community-owned infrastructure
- Transparent, on-chain operations

#### 2. **On-Chain Data Persistence**
Watchlists and risk scores stored on **0G Mainnet** ensure:
- Trustless access to your data
- No centralized database vulnerabilities
- Permanent, immutable records
- Cross-platform accessibility

#### 3. **No Rate Limits**
By using decentralized infrastructure:
- Analyze unlimited transactions
- No API key management
- No subscription tiers
- Pay only for what you use

#### 4. **Wallet-Based Authentication**
Your MetaMask wallet is your identity:
- No usernames or passwords
- No email verification
- No personal data collection
- Privacy-preserving by design

#### 5. **Production-Ready Today**
Not a prototype or MVP:
- Fully deployed and accessible
- Real-time monitoring working
- AI analysis functional
- Smart contracts verified on-chain

---

## 🌐 0G Network Integration

### How We Use 0G's Infrastructure

#### **0G Compute Network**
```
Purpose: Decentralized AI Processing
Models: Llama 3.3 70B, DeepSeek R1
Authentication: Wallet-based (no API keys)
Pricing: Pay-per-use
Benefits: No rate limits, censorship-resistant
```

**Implementation:**
- User connects MetaMask wallet
- App initializes 0G Compute client
- Transaction data sent to decentralized AI nodes
- Risk analysis returned in real-time
- Results displayed with natural language explanations

#### **0G Mainnet (Chain ID: 16661)**
```
Purpose: Smart Contract Deployment
Contract: ChainSageMonitor
Address: 0x65259ad0C0872E9EC83b8fcd0a8541BC7015C0978
Functions: Watchlist management, risk scoring
Events: Real-time updates via WebSocket
```

**Implementation:**
- Smart contract stores user watchlists
- Risk scores tracked on-chain
- Event emissions trigger frontend updates
- Trustless data access for all users

---

## 📜 Smart Contract Deployment

### Deployment Details

**Contract Name:** ChainSageMonitor  
**Network:** 0G Mainnet  
**Chain ID:** 16661  
**Contract Address:** `0x65259ad0C0872E9EC83b8fcd0a8541BC7015C0978`

**Block Explorer:** [View on ChainScan](https://chainscan.0g.ai/address/0x65259ad0C0872E9EC83b8fcd0a8541BC7015C0978)

**Deployment Transaction:** [0x2c8d5689101Db0a13c44e5793f57b4951f63690d7f7d9c8db95c9B6ec7a94ac5](https://chainscan.0g.ai/tx/0x2c8d5689101Db0a13c44e5793f57b4951f63690d7f7d9c8db95c9B6ec7a94ac5)

**Deployment Block:** 11,555,978  
**Deployment Date:** November 4, 2025  
**Gas Used:** 0.006044652010578141 0G

### Contract Functions

#### Write Functions (Require Gas)
```solidity
// Add wallet to personal watchlist
function addToWatchlist(address _wallet, string memory _label) external

// Remove wallet from watchlist
function removeFromWatchlist(address _wallet) external

// Update risk score (owner only)
function updateRiskScore(address _wallet, uint256 _score) external
```

#### Read Functions (Free)
```solidity
// Get user's complete watchlist
function getUserWatchlist(address _user) external view returns (address[] memory)

// Get watchlist entry details
function getWatchlistEntry(address _user, address _wallet) external view returns (WatchlistEntry memory)

// Get risk score for any wallet
function getRiskScore(address _wallet) external view returns (uint256)

// Get platform statistics
function getPlatformStats() external view returns (uint256 users, uint256 watchlists)
```

### Contract Events
```solidity
event WalletAdded(address indexed user, address indexed wallet, string label, uint256 timestamp);
event WalletRemoved(address indexed user, address indexed wallet, uint256 timestamp);
event RiskScoreUpdated(address indexed wallet, uint256 oldScore, uint256 newScore, uint256 timestamp);
```

---

## ✨ Key Features

### 1. Real-Time Wallet Monitoring
- Monitor any Ethereum address
- Live transaction tracking
- Instant notifications via WebSocket
- Historical activity analysis

### 2. AI-Powered Risk Detection
- Automatic risk scoring (0-100 scale)
- Pattern recognition for suspicious activity
- Natural language risk explanations
- Anomaly detection algorithms

### 3. Watchlist Management
- Add unlimited wallet addresses
- Custom labels for easy identification
- On-chain storage via smart contract
- Cross-device synchronization

### 4. Activity Feed
- Real-time transaction updates
- Risk level indicators (Low/Medium/High/Critical)
- Transaction details and context
- Filter by risk level

### 5. Admin Dashboard
- Manage all watchlists in one place
- View platform statistics
- Risk score overview
- Quick actions for common tasks

### 6. Beautiful UI/UX
- Cyberpunk-themed design
- Smooth animations and transitions
- Responsive layout (mobile-friendly)
- Intuitive navigation

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                        │
│                    (Next.js 15 + React 19)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Activity   │  │  Risk Feed   │  │    Admin     │      │
│  │     Feed     │  │              │  │  Dashboard   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND SERVICES                        │
│                  (Node.js + Express + WS)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   REST API   │  │   WebSocket  │  │    Chain     │      │
│  │    Server    │  │    Server    │  │   Monitor    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  0G Compute  │    │  0G Mainnet  │    │  Blockchain  │
│   Network    │    │   Contract   │    │     RPCs     │
│  (AI Models) │    │  (Watchlist) │    │   (Ethereum) │
└──────────────┘    └──────────────┘    └──────────────┘
```

### Data Flow

1. **User Action** → Frontend captures user input (search address, add to watchlist)
2. **API Request** → Frontend sends request to backend API
3. **Blockchain Query** → Backend fetches transaction data from blockchain RPCs
4. **AI Analysis** → Transaction data sent to 0G Compute for risk analysis
5. **Smart Contract** → Watchlist data stored on 0G Mainnet contract
6. **Real-Time Updates** → WebSocket pushes updates to connected clients
7. **UI Rendering** → Frontend displays results with risk scores and insights

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4.1
- **Components:** Radix UI
- **State Management:** React Context + Hooks
- **Web3:** ethers.js v6
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React
- **Deployment:** Vercel

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express.js
- **WebSocket:** ws library
- **Security:** Helmet, CORS
- **Blockchain:** ethers.js
- **Deployment:** Render

### Smart Contracts
- **Language:** Solidity 0.8.20
- **Development:** Remix IDE
- **Network:** 0G Mainnet (Chain ID: 16661)
- **Standards:** ERC-20 compatible patterns

### AI & Blockchain
- **AI Provider:** 0G Compute Network
- **AI Models:** Llama 3.3 70B, DeepSeek R1
- **Blockchain:** 0G Mainnet, Ethereum
- **RPC:** 0G RPC (https://evmrpc.0g.ai)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- MetaMask browser extension
- 0.1 0G tokens (for AI features)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Teamerz1111/chainsage-app-v0.git
cd chainsage-app-v0

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Environment Variables (Optional)

Create `.env.local` if running your own backend:

```env
NEXT_PUBLIC_API_URL=https://backend-3o2x.onrender.com
NEXT_PUBLIC_WS_URL=wss://backend-3o2x.onrender.com
```

---

## 📖 Usage Guide

### For End Users

#### Step 1: Connect Wallet
1. Visit https://chainsage-app.vercel.app
2. Click "Connect Wallet" in the navbar
3. Approve MetaMask connection
4. Ensure you're on 0G Mainnet (Chain ID: 16661)

#### Step 2: Search for Addresses
1. Enter any Ethereum wallet address in the search bar
2. Click "Analyze" or press Enter
3. View real-time activity feed with AI risk scores

#### Step 3: Add to Watchlist
1. Click "Add to Watchlist" on any address
2. Enter a custom label (e.g., "Binance Hot Wallet")
3. Transaction will be sent to 0G Mainnet
4. Confirm in MetaMask

#### Step 4: Monitor Activity
1. Navigate to Admin Dashboard
2. View all your watchlisted addresses
3. See real-time updates as transactions occur
4. Check risk scores and alerts

### For Developers

#### Interacting with Smart Contract

```javascript
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = '0x65259ad0C0872E9EC83b8fcd0a8541BC7015C0978';
const CONTRACT_ABI = [/* ABI here */];

// Connect to 0G Mainnet
const provider = new ethers.JsonRpcProvider('https://evmrpc.0g.ai');
const signer = await provider.getSigner();

// Initialize contract
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

// Add to watchlist
await contract.addToWatchlist(
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  'Binance Hot Wallet'
);

// Get watchlist
const watchlist = await contract.getUserWatchlist(signer.address);
console.log('My watchlist:', watchlist);

// Get risk score
const riskScore = await contract.getRiskScore('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
console.log('Risk score:', riskScore);
```

---

## 🧪 Testing

### Sample Addresses for Testing

Try monitoring these high-activity wallets:

```
Binance Hot Wallet: 0x28C6c06298d514Db089934071355E5743bf21d60
Coinbase: 0x71660c4005BA85c37ccec55d0C4493E66Fe775d3
Uniswap Router: 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
```

### Testing Checklist

- [ ] Connect MetaMask to 0G Mainnet
- [ ] Search for a wallet address
- [ ] View AI risk analysis
- [ ] Add address to watchlist (requires 0G tokens)
- [ ] Check Admin Dashboard
- [ ] Verify real-time updates
- [ ] Test on mobile device

---

## 🗺️ Roadmap

### Phase 1: Foundation (Completed ✅)
- [x] Core monitoring functionality
- [x] 0G Compute integration
- [x] Smart contract deployment
- [x] Frontend UI/UX
- [x] Real-time WebSocket updates
- [x] Production deployment

### Phase 2: Enhancement (Next 2-3 months)
- [ ] Multi-chain support (Polygon, BSC, Arbitrum)
- [ ] Advanced risk models with ML
- [ ] Email/Telegram notifications
- [ ] Portfolio tracking
- [ ] Historical data analysis
- [ ] Mobile-responsive improvements

### Phase 3: Expansion (3-6 months)
- [ ] 0G Storage integration for historical data
- [ ] Smart contract risk analysis
- [ ] DeFi protocol monitoring
- [ ] Mobile app (React Native)
- [ ] API for developers
- [ ] Community risk models

### Phase 4: Ecosystem (6+ months)
- [ ] Browser extension
- [ ] Integration with popular wallets
- [ ] DAO governance for risk models
- [ ] Staking and rewards program
- [ ] Enterprise features
- [ ] Multi-language support

---

## 🤝 Contributing

We welcome contributions from the community!

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation
- Ensure all tests pass

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **0G Labs** for the incredible infrastructure and WaveHack opportunity
- **0G Compute Network** for decentralized AI capabilities
- **0G Mainnet** for reliable smart contract deployment
- **The 0G Community** for support and feedback
- **Open Source Contributors** who made this possible

---

## 📞 Contact & Links

- **Live Demo:** https://chainsage-app.vercel.app
- **Smart Contract:** https://chainscan.0g.ai/address/0x65259ad0C0872E9EC83b8fcd0a8541BC7015C0978
- **GitHub:** https://github.com/Teamerz1111/chainsage-app-v0
- **Twitter:** [@0G_Builders](https://twitter.com/0G_Builders)
- **Team:** Teamerz1111

---

**Built with ❤️ on the 0G Network for WaveHack 5th Wave**

*Empowering users with AI-powered blockchain intelligence*
