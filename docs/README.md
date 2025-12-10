# Carbon Credits dApp - Live Demo

This is the live web interface for the Carbon Credit Tracking System built on IOTA blockchain.

## 🚀 Quick Start

1. **Open the dApp**: Simply open `index.html` in your browser or visit the live demo
2. **Connect Wallet**: Click "Connect Wallet" and choose:
   - **Demo Wallet**: For testing and exploration
   - **IOTA Wallet**: For real blockchain transactions (requires browser extension)
3. **Start Managing Credits**: Issue, transfer, and retire carbon credits

## 🔗 Live Demo Features

### ✨ Wallet Integration
- Connect IOTA Wallet browser extension
- Demo wallet for testing without real tokens
- Real-time balance display
- Secure transaction signing

### 🌱 Carbon Credit Management
- **Issue Credits**: Create new carbon credits for environmental projects
- **Transfer Credits**: Send credits to other addresses
- **Retire Credits**: Permanently remove credits from circulation
- **View Portfolio**: See all your carbon credits and their status

### 📊 Real-time Data
- Live registry statistics from IOTA blockchain
- Transaction history and activity log
- Credit status tracking (active/retired)
- Balance monitoring

## 🛡️ Security

- **Private Keys**: Never leave your wallet - all transactions are signed locally
- **Blockchain Verification**: All operations are recorded on IOTA blockchain
- **Input Validation**: Comprehensive validation prevents invalid transactions
- **Error Handling**: Clear feedback for all operations

## 🔧 For Developers

### Local Development
```bash
# Clone the repository
git clone https://github.com/dophucduy/IOTAProject.git
cd IOTAProject/carbon-credits-dapp

# Start local server
python server.py
# or simply open index.html in browser
```

### Smart Contract Integration
The dApp connects to a deployed Move smart contract on IOTA testnet:
- **Package ID**: `0xd06181cdb4a44c6336ad0a94cf8aa555d29552def7486f578758dda630d9efe4`
- **Registry ID**: `0xae96e53ab4db4d1dfd14f7d7047a48065a7d970975eaf713ed925b57c7102054`
- **Network**: IOTA Testnet

### Technology Stack
- **Frontend**: Vanilla JavaScript with modern ES6+ features
- **Blockchain**: IOTA SDK for blockchain interactions
- **Styling**: Custom CSS with responsive design
- **Wallet**: IOTA Wallet Standard integration

## 📱 Mobile Support

The dApp is fully responsive and works on:
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Android Chrome)
- Tablet devices

## 🌍 Environmental Impact

Each carbon credit represents:
- **1 ton of CO2 equivalent** removed or reduced from the atmosphere
- **Verified environmental projects** like solar farms, reforestation, etc.
- **Transparent tracking** from issuance to retirement
- **Immutable records** on IOTA blockchain

## 🔗 Links

- **Live dApp**: [GitHub Pages Demo](https://dophucduy.github.io/IOTAProject/docs/)
- **Source Code**: [GitHub Repository](https://github.com/dophucduy/IOTAProject)
- **Smart Contract**: [IOTA Explorer](https://explorer.iota.cafe/testnet/object/0xd06181cdb4a44c6336ad0a94cf8aa555d29552def7486f578758dda630d9efe4)
- **Documentation**: [Wallet Integration Guide](../carbon-credits-dapp/WALLET_INTEGRATION.md)

## 🆘 Support

If you encounter any issues:
1. Check that you're connected to IOTA testnet
2. Ensure your wallet has sufficient balance for transactions
3. Try refreshing the page and reconnecting your wallet
4. Open browser developer tools to check for errors

For technical support, please open an issue on the [GitHub repository](https://github.com/dophucduy/IOTAProject/issues).

---

**Built with ❤️ for a sustainable future using IOTA blockchain technology** 🌱