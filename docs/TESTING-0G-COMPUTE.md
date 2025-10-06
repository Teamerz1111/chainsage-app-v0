# Testing 0G Compute Integration

Quick guide to test the 0G Compute integration in the ChainSage application.

## Prerequisites

1. **MetaMask Installed**: Browser extension required
2. **0G Testnet Added**: Chain ID 16602 (`0x40da`)
3. **ETH for Gas**: Small amount of ETH on 0G testnet
4. **OG Tokens**: For inference requests (can add via test page)

## Test Page Access

Navigate to: **`http://localhost:3000/test-0g`**

## Testing Steps

### Step 1: Connect Wallet

1. Click **"Connect Wallet"** button
2. Approve MetaMask connection
3. Ensure you're on **0G Testnet** (Chain ID: 16602)
4. If wrong network, click **"Switch Network"**

### Step 2: Initialize 0G Compute

1. Wait for "Service Loaded: Yes"
2. Wait for "Wallet Status: Connected"
3. Click **"Initialize"** button
4. Wait for "0G Compute Status: Initialized"

### Step 3: Fund Account

1. Check current balance (should show "0.0000 OG" initially)
2. Click **"Add 0.1 OG"** button
3. Approve MetaMask transaction
4. Wait for confirmation
5. Balance should update to ~0.1 OG

**Quick Action Buttons:**

- **Add 0.1 OG**: ~100 requests
- **Acknowledge Providers**: Manually register AI providers
- **Check Balance**: Refresh balance display
- **Check MetaMask**: Verify ETH balance for gas

### Step 4: Test AI Chat

1. Enter a question in the chat input:
   - Example: "What are blockchain security risks?"
   - Example: "Explain smart contract vulnerabilities"
2. Click **"Send"** button
3. Wait for AI response
4. Response will show which provider/model was used

### Step 5: Test Risk Analysis

1. Click **"Test Risk Analysis"** button
2. It will analyze a mock transaction with risk factors
3. Results display:
   - Risk Score (0-100)
   - Severity level
   - Confidence percentage
   - AI Provider used
   - AI Reasoning (recommendations from 0G Compute)

## Expected Behavior

### ✅ Success Indicators

- **Green checkmarks**: Service loaded, wallet connected, initialized
- **Balance updates**: After funding transactions
- **AI responses**: Clear, helpful responses from AI models
- **Risk analysis**: Detailed risk scores and reasoning

### ⚠️ Common Issues

#### Wrong Network

**Symptom**: "Wrong Network" badge appears
**Solution**: Click "Switch Network" button

#### Not Initialized

**Symptom**: "0G Compute Status: Not Initialized"
**Solution**:

1. Ensure wallet is connected
2. Ensure correct network (0G testnet)
3. Click "Initialize" button
4. Check console for errors

#### Failed to Add Funds

**Symptom**: Error message when clicking "Add Funds"
**Solutions**:

1. **Check ETH balance**: Need ETH for gas fees
   - Click "Check MetaMask" to verify
2. **Wait for circuit breaker**: If network is busy, wait 1-2 minutes
3. **Try smaller amount**: Use 0.1 instead of 1.0
4. **Approve MetaMask**: Don't reject the transaction

#### Chat Not Working

**Symptom**: Error or "All providers failed"
**Solutions**:

1. **Check balance**: Need OG tokens funded
2. **Acknowledge providers**: Click "Acknowledge Providers"
3. **Wait for network**: Providers may be temporarily offline
4. **Check console**: F12 for detailed error messages

#### Balance Shows 0.0000

**Symptom**: Balance doesn't update after funding
**Solutions**:

1. **Wait for transaction**: Check MetaMask for pending transactions
2. **Click "Check Balance"**: Manually refresh
3. **Verify transaction**: Check 0G block explorer
4. **Try again**: Initial funding may need retry

## Debug Information

The test page shows debug information at the bottom:

```
Client Side: Yes/No
Service Loaded: Yes/No
Wallet Connected: Yes/No
Initialized: Yes/No
Wallet Address: 0x...
```

### Console Logging

Open browser console (F12) to see detailed logs:

- Initialization steps
- Network checks
- Funding transactions
- Provider acknowledgments
- Inference requests
- Balance updates

## Testing Checklist

- [ ] Wallet connects successfully
- [ ] Network switches to 0G testnet
- [ ] Service initializes without errors
- [ ] Account funds successfully (0.1 OG added)
- [ ] Balance displays correctly
- [ ] Providers acknowledged
- [ ] Chat responds with AI answers
- [ ] Risk analysis completes
- [ ] AI reasoning appears in results

## Cost Tracking

Monitor your usage:

| Action        | Cost      | Balance Change |
| ------------- | --------- | -------------- |
| Add Funds     | 0.1 OG    | +0.1000        |
| Chat Request  | ~0.001 OG | -0.0010        |
| Risk Analysis | ~0.001 OG | -0.0010        |
| Balance Check | Free      | 0.0000         |

## Production Testing

After successful test page validation:

1. **Navigate to main app**: `/`
2. **Connect wallet**: Use same wallet as test
3. **Try features**:
   - Transaction monitoring
   - Risk scoring
   - Wallet analysis
   - Admin chat (if admin)

## Troubleshooting Commands

### Check Network

```javascript
window.ethereum.request({ method: "eth_chainId" });
// Expected: "0x40da" (16602)
```

### Check Account

```javascript
window.ethereum.request({ method: "eth_accounts" });
// Should return your connected address
```

### Check Balance

```javascript
window.ethereum.request({
  method: "eth_getBalance",
  params: [yourAddress, "latest"],
});
```

## Support

If issues persist:

1. **Clear browser cache**: Hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)
2. **Restart MetaMask**: Lock and unlock wallet
3. **Try fresh wallet**: Use different address
4. **Check network status**: Verify 0G testnet is operational
5. **Review console logs**: F12 → Console tab
6. **Check documentation**: `/docs/0G-COMPUTE-INTEGRATION.md`

## Next Steps

Once testing is successful:

1. ✅ **Integration verified**: 0G Compute working
2. 💰 **Fund for production**: Add more OG tokens as needed
3. 🚀 **Deploy**: Ready for production use
4. 📊 **Monitor**: Track usage and costs

---

**Test Page**: `/test-0g`  
**Documentation**: `/docs/0G-COMPUTE-INTEGRATION.md`  
**Version**: 1.0.0

