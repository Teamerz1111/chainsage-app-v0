# Sample Wallet Addresses for Testing

This document contains wallet addresses that can be used for testing the ChainSage monitoring system. These addresses are publicly documented exchange hot wallets that typically exhibit high-volume transaction patterns.

## 🏦 Exchange Hot Wallets (Ethereum)

### Binance Hot Wallets
- `0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be` (Binance Hot Wallet)
- `0xd551234ae421e3bcba99a0da6d736074f22192ff` (Binance Hot Wallet 2)
- `0x564286362092d8e7936f0549571a803b203aaced` (Binance Hot Wallet 3)

### Coinbase Exchange
- `0x71660c4005ba85c37ccec55d0c4493e66fe775d3` (Coinbase Exchange)
- `0x503828976d22510aad0201ac7ec88293211d23da` (Coinbase Hot Wallet)
- `0xddfabcdc4d8ffc6d5beaf154f18b778f892a0740` (Coinbase Institutional)

### Kraken
- `0x2910543af39aba0cd09dbb2d50200b3e800a63d2` (Kraken Exchange)
- `0x0a869d79a7052c7f1b55a8ebabbea3420f0d1e13` (Kraken Hot Wallet)

### Bitfinex
- `0x1151314c646ce4e0efd76d1af4760ae66a9fe30f` (Bitfinex Hot Wallet)
- `0x7727e5113d1d161373623e5f49fd568b4f543a9e` (Bitfinex Cold Storage)

### Huobi (HTX)
- `0xdc76cd25977e0a5ae17155770273ad58648900d3` (Huobi Hot Wallet)
- `0x6748f50f686bfbca6fe8ad62b22228b87f31ff2b` (Huobi Exchange)

## 🧪 Testing Recommendations

### High Risk Testing
**Address:** `0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be`
- **Threshold:** $1,000 (default)
- **Expected Risk Score:** 75-90 (HIGH)
- **Expected Alerts:** Volume-based, pattern-based

### Medium Risk Testing
**Address:** `0x71660c4005ba85c37ccec55d0c4493e66fe775d3`
- **Threshold:** $10,000 (higher threshold)
- **Expected Risk Score:** 50-75 (MEDIUM)
- **Expected Alerts:** Large transaction alerts

### Low Risk Testing
**Address:** `0x2910543af39aba0cd09dbb2d50200b3e800a63d2`
- **Threshold:** $100,000 (very high threshold)
- **Expected Risk Score:** 25-50 (LOW-MEDIUM)
- **Expected Alerts:** Minimal alerts

## ⚠️ Alert Trigger Patterns

These addresses will likely trigger alerts due to:

1. **Large Volume Activity**
   - Exchange wallets process millions of dollars daily
   - Transactions often exceed monitoring thresholds
   - High frequency trading patterns

2. **Unusual Patterns**
   - Batch transactions (multiple large amounts)
   - Round-the-clock activity (24/7 operations)
   - Cross-chain movements between protocols

3. **AI Risk Factors**
   - Volume spikes during market volatility
   - Large withdrawal patterns
   - Mixing service characteristics
   - High-frequency micro-transactions

## 📋 Usage Instructions

1. **Copy any address** from the list above
2. **Add to watchlist** through the Admin Dashboard Settings
3. **Set appropriate threshold** based on testing goals
4. **Monitor risk score** and alert generation
5. **Review alert patterns** in the monitoring dashboard

## 🔒 Important Notes

- These are **publicly documented** exchange addresses
- Used for **defensive monitoring** and **testing purposes** only
- Addresses are from official blockchain analytics sources
- Always verify addresses from official exchange documentation when possible
- Addresses may change over time as exchanges update their infrastructure

## 🌐 Additional Chains

For testing on other chains, similar exchange hot wallets exist on:
- **Polygon:** Binance, Coinbase, and other major exchanges
- **BSC:** Native Binance Chain exchange wallets
- **Arbitrum:** Layer 2 exchange bridge wallets

Contact the development team for specific addresses on other chains if needed.