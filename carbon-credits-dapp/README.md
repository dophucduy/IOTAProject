# Carbon Credits DApp

A React frontend for the Carbon Credit Tracking System deployed on IOTA blockchain.

## Features

- 🌱 **Issue Carbon Credits**: Create new carbon credits for environmental projects
- 📊 **View Statistics**: Monitor total issued, retired, and available credits
- 🔄 **Transfer Credits**: Move credits between addresses (demo)
- 🗑️ **Retire Credits**: Permanently remove credits from circulation (demo)
- 🔗 **Blockchain Integration**: Direct connection to IOTA testnet

## Contract Information

- **Package ID**: `0xd06181cdb4a44c6336ad0a94cf8aa555d29552def7486f578758dda630d9efe4`
- **Registry ID**: `0xae96e53ab4db4d1dfd14f7d7047a48065a7d970975eaf713ed925b57c7102054`
- **Network**: IOTA Testnet

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Usage

1. The app automatically connects to IOTA testnet
2. View real-time registry statistics
3. Use the form to simulate issuing new carbon credits
4. Explore different actions available in the system

## Technology Stack

- **Frontend**: React 18
- **Blockchain**: IOTA SDK
- **Build Tool**: Webpack
- **Styling**: Custom CSS with modern design

## Development

This is a demo interface that shows how to interact with the carbon credit smart contract. For full functionality, you would need to:

1. Integrate wallet connection (IOTA Wallet, etc.)
2. Handle transaction signing
3. Add error handling for network issues
4. Implement real-time updates

## Smart Contract

The frontend connects to a Move smart contract deployed on IOTA that handles:
- Carbon credit issuance
- Credit transfers
- Credit retirement
- Registry statistics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details