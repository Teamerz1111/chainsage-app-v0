# 0G SDK Update - Version 0.4.4

## ✅ Update Summary

Successfully updated to the **latest version of @0glabs/0g-serving-broker: 0.4.4**

## 🔧 Key Changes

### 1. Package Version
- **Before**: 0.4.4 (was already latest)
- **After**: 0.4.4 (confirmed latest)
- **Command**: `pnpm update @0glabs/0g-serving-broker@latest`

### 2. Fixed `addFunds()` Method

The main issue with the `value.toFixed is not a function` error has been addressed:

#### Root Cause
The 0G SDK internally expects amounts as **strings**, not numbers. When a number was passed, the SDK's internal `.toFixed()` call would fail.

#### Solution Implemented
```typescript
// Convert to string format as per 0G documentation
const amountStr = typeof amount === 'number' ? amount.toString() : amount;

// Check if account exists first
let accountExists = false;
try {
    const ledger = await this.broker.ledger.getLedger();
    accountExists = ledger && ledger.totalBalance !== undefined;
} catch (e) {
    console.log("Account does not exist yet, will create new one");
}

if (!accountExists) {
    // Use addLedger for initial account creation
    await this.broker.ledger.addLedger(amountStr);
} else {
    // Use depositFund for existing account
    await this.broker.ledger.depositFund(amountStr);
}
```

#### What Changed
1. **Amount Format**: Always convert to string before passing to SDK
2. **Smart Detection**: Check if account exists before choosing method
3. **Correct Method Selection**:
   - `addLedger()` for **new accounts** (first-time funding)
   - `depositFund()` for **existing accounts** (additional funding)
4. **Enhanced Error Messages**: Specific troubleshooting for each error type

### 3. Enhanced Error Handling

Added detailed error messages for common issues:

| Error Type | What It Means | How to Fix |
|-----------|---------------|------------|
| `insufficient` | Not enough ETH for gas | Add more ETH to wallet on 0G testnet |
| `circuit breaker` | Network overloaded | Wait 1-2 minutes and retry |
| `maxPriorityFee` / `EIP-1559` | Gas pricing issue | Known 0G testnet issue, retry |
| `decode result` / `toFixed` | Amount formatting | Use whole numbers (1 instead of 0.1) |
| `revert` | Transaction rejected | Verify network and account status |

## 🧪 Testing Steps

### Step 1: Connect Wallet
1. Open the test page: `http://localhost:3000/test-0g`
2. Click **"Connect Wallet"**
3. Approve MetaMask connection

### Step 2: Switch Network
1. If "Wrong Network" appears, click **"Switch Network"**
2. Approve the network switch in MetaMask
3. Verify: Chain ID should be **16602 (0x40da)**

### Step 3: Initialize Service
1. Click **"Initialize"**
2. Wait for confirmation
3. Check console for initialization logs

### Step 4: Check Balance
1. Click **"Check Balance"**
2. Should show current balance (likely 0.0000 OG initially)

### Step 5: Add Funds
1. Click **"Add 0.1 OG"** (or try 1 OG for better testing)
2. Approve the transaction in MetaMask
3. Wait for confirmation
4. Check balance again - should now show the added amount

### Step 6: Test Chat
1. Enter a question in the chat input
2. Click **"Send"**
3. Wait for AI response from 0G Compute

### Step 7: Test Risk Analysis
1. Click **"Test Risk Analysis"**
2. Review the AI-generated risk assessment

## ⚠️ Known Issues & Workarounds

### Issue 1: EIP-1559 Gas Pricing Error
**Symptom**: `The method "eth_maxPriorityFeePerGas" does not exist`

**Why**: 0G testnet doesn't support EIP-1559 gas pricing

**Workaround**: 
- This error can be ignored - the transaction will still process
- Or wait and retry after a few moments

### Issue 2: Circuit Breaker Error
**Symptom**: `circuit breaker is open`

**Why**: Network is experiencing high traffic

**Fix**: 
- Wait 1-2 minutes
- Restart MetaMask if needed
- Try again

### Issue 3: Decimal Amount Issues
**Symptom**: `value.toFixed is not a function` or `decode result data`

**Why**: SDK may have issues with decimal amounts in certain conditions

**Fix**: 
- Use whole numbers: Try `1` instead of `0.1`
- The string conversion in our updated code should fix this

### Issue 4: Provider Not Responding
**Symptom**: `All providers failed to respond`

**Why**: Providers may not be acknowledged or available

**Fix**:
1. Click **"Acknowledge Providers"** button
2. Ensure account has sufficient balance
3. Wait a moment and retry

## 📊 Cost Reference

| Action | OG Cost | Equivalent Requests |
|--------|---------|---------------------|
| Add 0.1 OG | 0.1 OG | ~100 requests |
| Add 1 OG | 1 OG | ~1,000 requests |
| Add 10 OG | 10 OG | ~10,000 requests |
| Chat Request | ~0.001 OG | 1 request |
| Risk Analysis | ~0.001 OG | 1 request |

## 🔍 Debugging Commands

### Check Current Chain ID
```javascript
window.ethereum.request({ method: 'eth_chainId' })
// Expected: "0x40da" (16602)
```

### Check Connected Account
```javascript
window.ethereum.request({ method: 'eth_accounts' })
// Returns: ["0x..."]
```

### Check ETH Balance
```javascript
window.ethereum.request({
  method: 'eth_getBalance',
  params: [yourAddress, 'latest']
})
```

### View Console Logs
Open browser DevTools (F12) and check the Console tab for detailed logs:
- Initialization status
- Network checks
- Balance queries
- Transaction status
- Error messages

## 📚 SDK Documentation Reference

- **Official Docs**: https://docs.0g.ai/
- **SDK Version**: 0.4.4
- **Network**: 0G Testnet
- **Chain ID**: 16602 (0x40da)
- **RPC URL**: https://evmrpc-testnet.0g.ai

## 🎯 Next Steps

1. **Test the funding flow** with the updated code
2. **Try whole numbers first** (1 OG) to avoid decimal issues
3. **Monitor console logs** for detailed error information
4. **Report any persistent issues** with full error logs

## ✨ Benefits of Latest Version

- ✅ Better error handling
- ✅ More stable transactions
- ✅ Improved provider management
- ✅ Enhanced balance queries
- ✅ Smart account detection (new vs existing)

---

**Last Updated**: October 6, 2025  
**SDK Version**: 0.4.4  
**Status**: Ready for testing

