# Wallet Integration Guide

This document explains how wallet integration works in the Carbon Credit Tracking System and how to set it up for real blockchain transactions.

## Overview

The application supports multiple wallet connection methods:
1. **IOTA Wallet Browser Extension** (for real transactions)
2. **Demo Wallet** (for testing and development)

## Wallet Features

### 🔗 Connection Management
- Connect/disconnect wallet functionality
- Automatic wallet detection
- Connection status display
- Balance monitoring

### 🔐 Transaction Signing
- Secure transaction signing through wallet
- User approval for all blockchain operations
- Gas fee estimation and payment
- Transaction status tracking

### 💳 Account Management
- Display connected wallet address
- Show IOTA balance
- Account switching support
- Network validation (testnet/mainnet)

## Supported Wallets

### IOTA Wallet (Recommended)
- **Type**: Browser Extension
- **Download**: [Chrome Web Store](https://chrome.google.com/webstore/detail/iota-wallet)
- **Features**: Full transaction signing, secure key management
- **Network**: Supports both testnet and mainnet

### Demo Wallet (Development)
- **Type**: Simulated wallet for testing
- **Features**: Mock transactions, no real blockchain interaction
- **Use Case**: Development and demonstration purposes

## Implementation Details

### WalletProvider Component
```javascript
// Provides wallet context to the entire application
<WalletProvider>
  <App />
</WalletProvider>
```

### Key Functions

#### Connection
```javascript
const { connectIotaWallet, isConnected, account } = useWallet();

// Connect to IOTA wallet
await connectIotaWallet();
```

#### Transaction Signing
```javascript
const { signAndExecuteTransaction, createIssueCreditsTransaction } = useWallet();

// Create transaction
const tx = createIssueCreditsTransaction(registryId, projectName, amount, year, methodology);

// Sign and execute
const result = await signAndExecuteTransaction(tx);
```

#### Balance Checking
```javascript
const { getBalance } = useWallet();

const balance = await getBalance();
console.log(`Balance: ${balance.totalBalance} NANOS`);
```

## Transaction Types

### Issue Credits
```javascript
// Creates new carbon credits on the blockchain
const tx = createIssueCreditsTransaction(
  registryId,      // Registry contract ID
  projectName,     // Project name string
  amount,          // Amount in tons (u64)
  vintageYear,     // Year (u64)
  methodology      // Methodology string
);
```

### Transfer Credits
```javascript
// Transfers credits to another address
const tx = createTransferCreditsTransaction(
  creditId,        // Credit object ID
  recipientAddress // Recipient wallet address
);
```

### Retire Credits
```javascript
// Permanently retires credits from circulation
const tx = createRetireCreditsTransaction(
  registryId,      // Registry contract ID
  creditId,        // Credit object ID
  retirementReason // Reason string
);
```

## Security Features

### 🔒 Private Key Security
- Private keys never leave the user's wallet
- All transactions require explicit user approval
- Secure communication with wallet extension

### 🛡️ Transaction Validation
- Input validation before transaction creation
- Gas estimation and fee display
- Network verification (testnet/mainnet)
- Error handling for failed transactions

### 🔍 Transparency
- All transactions are recorded on IOTA blockchain
- Event emission for audit trails
- Real-time balance and credit updates

## Setup Instructions

### For Development (Demo Wallet)
1. No additional setup required
2. Click "Connect Wallet" and select "Demo Wallet"
3. All transactions are simulated locally

### For Production (Real Wallet)
1. Install IOTA Wallet browser extension
2. Create or import wallet account
3. Ensure you have IOTA tokens for gas fees
4. Connect to appropriate network (testnet/mainnet)

### Environment Configuration
```javascript
// Update contract configuration for your deployment
const CONTRACT_CONFIG = {
  PACKAGE_ID: 'your_package_id',
  REGISTRY_ID: 'your_registry_id',
  MODULE_NAME: 'carbon_credits',
  NETWORK: 'testnet' // or 'mainnet'
};
```

## Error Handling

### Common Errors
- **Wallet Not Found**: Install IOTA Wallet extension
- **Insufficient Balance**: Add IOTA tokens to wallet
- **Transaction Failed**: Check network connection and gas fees
- **Invalid Address**: Verify recipient address format

### Error Messages
```javascript
try {
  await signAndExecuteTransaction(tx);
} catch (error) {
  if (error.message.includes('insufficient')) {
    showMessage('Insufficient balance for transaction', 'error');
  } else if (error.message.includes('rejected')) {
    showMessage('Transaction rejected by user', 'info');
  } else {
    showMessage(`Transaction failed: ${error.message}`, 'error');
  }
}
```

## Testing

### Local Testing
1. Use demo wallet for UI testing
2. Test all transaction flows
3. Verify error handling

### Testnet Testing
1. Connect real IOTA wallet
2. Get testnet tokens from faucet
3. Test actual blockchain transactions
4. Verify transaction results on explorer

### Mainnet Deployment
1. Ensure thorough testing on testnet
2. Update contract addresses for mainnet
3. Use real IOTA tokens
4. Monitor transaction costs

## Best Practices

### User Experience
- Clear wallet connection status
- Loading states during transactions
- Helpful error messages
- Transaction confirmation feedback

### Security
- Validate all inputs before transaction creation
- Handle wallet disconnection gracefully
- Implement proper error boundaries
- Regular security audits

### Performance
- Cache wallet connection state
- Optimize transaction creation
- Minimize unnecessary blockchain calls
- Implement proper loading states

## Troubleshooting

### Wallet Connection Issues
1. Check if IOTA Wallet extension is installed
2. Verify wallet is unlocked
3. Ensure correct network selection
4. Clear browser cache if needed

### Transaction Failures
1. Check wallet balance
2. Verify gas price settings
3. Ensure network connectivity
4. Check contract addresses

### Development Issues
1. Verify React dependencies
2. Check console for errors
3. Ensure proper component wrapping
4. Test with demo wallet first

## Future Enhancements

### Planned Features
- Multi-wallet support (MetaMask, WalletConnect)
- Hardware wallet integration
- Batch transaction support
- Advanced transaction history

### Integration Opportunities
- DeFi protocol integration
- Carbon marketplace connectivity
- Cross-chain bridge support
- Mobile wallet compatibility