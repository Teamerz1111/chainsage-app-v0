# 0G Compute Integration for Risk Detector

This document explains how the 0G Compute SDK is integrated into the ChainSage risk detection system to replace traditional AI services.

## Overview

The risk detector now uses **0G Compute Network** for decentralized AI inference, providing:

- **Decentralized AI**: No single point of failure
- **Verifiable Compute**: TEE (Trusted Execution Environment) verification
- **Pay-per-use**: Micropayments with OG tokens
- **Multiple Models**: Access to gpt-oss-120b and deepseek-r1-70b

## Setup

### 1. Installation

Already installed in `package.json`:

```bash
pnpm add @0glabs/0g-serving-broker @types/crypto-js@4.2.2 crypto-js@4.2.0
```

### 2. Wallet Connection

The service uses **MetaMask wallet connection** (no private keys required):

```typescript
import { zgComputeService } from "@/lib/0g-compute";

// Initialize with wallet connection
const success = await zgComputeService.initialize();
```

### 3. Network Configuration

Ensure MetaMask is connected to **0G Testnet**:

- Chain ID: `16602` (`0x40da`)
- RPC URL: `https://evmrpc-testnet.0g.ai`
- Currency: OG Token

## Core Concepts

### 1. The Broker

Your interface to the 0G Compute Network:

- Handles authentication and billing
- Manages provider connections
- Verifies computations

### 2. Providers

Official 0G AI Service Providers:

| Model           | Provider Address                             | Description       |
| --------------- | -------------------------------------------- | ----------------- |
| gpt-oss-120b    | `0xf07240Efa67755B5311bc75784a061eDB47165Dd` | General AI tasks  |
| deepseek-r1-70b | `0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3` | Complex reasoning |

### 3. Prepaid Accounts

- Fund account before usage
- Automatic micropayments per request
- ~0.001 OG per request

## Usage

### Initialize Service

```typescript
// Initialize0G Compute (done automatically during app initialization)
const success = await zgComputeService.initialize();

if (success) {
  console.log("0G Compute ready!");
}
```

### Fund Your Account

```typescript
// Add 10 OG tokens (~10,000 requests)
await zgComputeService.addFunds(10);

// Check balance
const balance = await zgComputeService.getAccountBalance();
console.log(`Balance: ${balance.balance} OG`);
```

### Transaction Risk Analysis

```typescript
import { zgComputeService } from "@/lib/0g-compute";

const result = await zgComputeService.analyzeTransaction({
  transactionData: {
    hash: "0x123...",
    from: "0xabc...",
    to: "0xdef...",
    value: "1.5",
    timestamp: Date.now(),
    blockNumber: 12345,
  },
  context: {
    riskFactors: {
      transactionVolume: 75,
      frequencyScore: 60,
      contractRisk: 40,
      networkReputation: 70,
      walletAge: 80,
      behaviorPattern: 50,
    },
  },
});

if (result.success) {
  console.log("AI Analysis:", result.data);
  console.log("Provider:", result.provider);
  console.log("Model:", result.model);
}
```

### Wallet Analysis

```typescript
const result = await zgComputeService.analyzeWallet({
  walletAddress: "0x742d35Cc6634C0532925a3b844C0532925a3b8D4",
  context: {
    networkId: 1,
    includeTransactions: true,
    maxTransactions: 100,
  },
});
```

### Chat Interface

```typescript
const result = await zgComputeService.chat({
  message: "What are common blockchain security risks?",
  context: {
    userRole: "admin",
    blockchainData: { connectedWallet: address },
  },
});
```

## Account Management

### Check Balance

```typescript
const account = await zgComputeService.getAccountBalance();
console.log(`
    Balance: ${account.balance} OG
    Available: ${account.available} OG
`);
```

### Add More Funds

```typescript
// Initial funding (creates account)
await zgComputeService.addFunds(10);

// Add to existing account
await zgComputeService.depositFunds(5);
```

### Request Refund

```typescript
// Withdraw unused funds from inference service
await zgComputeService.retrieveFunds("inference");
```

## Integration Points

### 1. Risk Scoring (`lib/risk-scoring.ts`)

The `IntelligentRiskScorer` uses 0G Compute for enhanced AI reasoning:

```typescript
const metadata = await IntelligentRiskScorer.generateRiskMetadataWithAI(
  "risk-001",
  riskFactors,
  transactionData
);
```

### 2. API Classification (`lib/api.ts`)

Transaction classification uses 0G Compute:

```typescript
const result = await apiService.classifyTransaction(transactionData);
```

### 3. Admin Dashboard (`components/admin-dashboard.tsx`)

Real-time AI chat powered by 0G Compute:

```typescript
const handleSendMessage = async () => {
  const result = await zgComputeService.chat({
    message: userMessage,
    context: { userRole: "admin" },
  });
};
```

## Troubleshooting

### Error: Insufficient Balance

```typescript
// Add more funds
await zgComputeService.addFunds(1); // Add 1 OG (~1000 requests)
```

### Error: Headers Already Used

Request headers are single-use. The SDK handles this automatically by generating new headers for each request.

### Error: Provider Not Responding

The SDK automatically tries all official providers. If one fails, it moves to the next.

### Error: Circuit Breaker Open

MetaMask is busy:

- Wait 1-2 minutes
- Restart MetaMask
- Try again

### Error: Wrong Network

Ensure MetaMask is on 0G Testnet (Chain ID: 16602).

## Cost Estimation

| Usage  | OG Tokens | Approximate Requests |
| ------ | --------- | -------------------- |
| Light  | 0.1       | ~100 requests        |
| Medium | 1.0       | ~1,000 requests      |
| Heavy  | 10.0      | ~10,000 requests     |

## Benefits

### vs. Traditional AI APIs

| Feature          | 0G Compute     | Traditional API   |
| ---------------- | -------------- | ----------------- |
| Decentralization | ✅ Yes         | ❌ No             |
| Verification     | ✅ TEE         | ❌ Trust-based    |
| Rate Limiting    | ✅ None        | ⚠️ Common         |
| Privacy          | ✅ On-chain    | ⚠️ Centralized    |
| Cost             | 💰 Pay-per-use | 💰💰 Subscription |

## Next Steps

1. **Test Integration**: Use the test page at `/test-0g`
2. **Fund Account**: Add OG tokens for production use
3. **Monitor Usage**: Check balance regularly
4. **Scale**: Add more funds as needed

## Support

- **Documentation**: https://docs.0g.ai
- **Discord**: Join 0G Labs Discord
- **GitHub**: https://github.com/0glabs

## Security Notes

- ✅ Uses wallet connection (no private keys in code)
- ✅ TEE verification for trusted execution
- ✅ Automatic provider fallback
- ✅ Single-use authentication headers
- ✅ Client-side only (no server exposure)

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Integration**: ChainSage Risk Detector

