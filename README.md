# Carbon Credit Tracking System

A comprehensive blockchain-based carbon credit tracking system built with Move on the IOTA network, featuring both smart contract backend and React frontend interface.

## Overview

This system allows for the issuance, transfer, and retirement of carbon credits in a transparent and immutable way. Each carbon credit represents a verified reduction or removal of one metric ton of CO2 equivalent from the atmosphere.

## Architecture

The system consists of two main components:
1. **Smart Contract Backend** - Move language contract deployed on IOTA blockchain
2. **Web Frontend** - React-based user interface for interacting with the contract

## Smart Contract Functions

### Core Data Structures

#### CarbonCredit
```move
public struct CarbonCredit has key, store {
    id: UID,
    project_name: String,
    issuer: address,
    amount: u64,              // Amount in tons of CO2 equivalent
    vintage_year: u64,        // Year the carbon reduction occurred
    methodology: String,      // Verification methodology used
    is_retired: bool,
}
```

#### CarbonRegistry
```move
public struct CarbonRegistry has key {
    id: UID,
    admin: address,
    total_issued: u64,
    total_retired: u64,
}
```

### Public Functions

#### `issue_credits()`
```move
public fun issue_credits(
    registry: &mut CarbonRegistry,
    project_name: String,
    amount: u64,
    vintage_year: u64,
    methodology: String,
    ctx: &mut TxContext
): CarbonCredit
```
- **Purpose**: Creates new carbon credits for verified environmental projects
- **Parameters**: Registry reference, project details, amount, vintage year, methodology
- **Returns**: New CarbonCredit object
- **Events**: Emits `CreditIssued` event
- **Validation**: Ensures amount > 0

#### `transfer_credits()`
```move
public fun transfer_credits(
    credit: CarbonCredit,
    recipient: address,
    ctx: &mut TxContext
)
```
- **Purpose**: Transfers carbon credits to another address
- **Parameters**: Credit object, recipient address, transaction context
- **Events**: Emits `CreditTransferred` event
- **Effect**: Changes ownership of the credit object

#### `retire_credits()`
```move
public fun retire_credits(
    registry: &mut CarbonRegistry,
    credit: CarbonCredit,
    retirement_reason: String,
    ctx: &mut TxContext
)
```
- **Purpose**: Permanently removes credits from circulation
- **Parameters**: Registry reference, credit object, retirement reason
- **Events**: Emits `CreditRetired` event
- **Effect**: Destroys the credit object, updates registry statistics
- **Validation**: Ensures credit is not already retired

#### `get_credit_info()`
```move
public fun get_credit_info(credit: &CarbonCredit): (String, address, u64, u64, String, bool)
```
- **Purpose**: Retrieves detailed information about a carbon credit
- **Returns**: Project name, issuer, amount, vintage year, methodology, retirement status
- **Access**: Read-only function

#### `get_registry_stats()`
```move
public fun get_registry_stats(registry: &CarbonRegistry): (u64, u64)
```
- **Purpose**: Gets system-wide statistics
- **Returns**: Total issued credits, total retired credits
- **Access**: Read-only function

#### `is_active()`
```move
public fun is_active(credit: &CarbonCredit): bool
```
- **Purpose**: Checks if a credit is still active (not retired)
- **Returns**: Boolean indicating active status

#### `get_available_credits()`
```move
public fun get_available_credits(registry: &CarbonRegistry): u64
```
- **Purpose**: Calculates available credits (issued - retired)
- **Returns**: Number of available credits

### Events System

#### CreditIssued
```move
public struct CreditIssued has copy, drop {
    credit_id: address,
    project_name: String,
    issuer: address,
    amount: u64,
    vintage_year: u64,
}
```

#### CreditTransferred
```move
public struct CreditTransferred has copy, drop {
    credit_id: address,
    from: address,
    to: address,
    amount: u64,
}
```

#### CreditRetired
```move
public struct CreditRetired has copy, drop {
    credit_id: address,
    owner: address,
    amount: u64,
    retirement_reason: String,
}
```

## Frontend Application

### Technology Stack
- **Framework**: React 18 with functional components and hooks
- **Blockchain Integration**: IOTA SDK for blockchain interactions
- **Styling**: Custom CSS with modern design patterns
- **Build Tool**: Webpack with Babel transpilation
- **Development Server**: Python HTTP server for local development

### Key Components

#### App.js - Main Application Component
- **State Management**: Uses React hooks for managing application state
- **IOTA Client**: Initializes connection to IOTA testnet
- **Contract Integration**: Handles smart contract function calls
- **UI Components**: Renders all interface elements

#### Core Features

##### Statistics Dashboard
```javascript
const [registryStats, setRegistryStats] = useState({ 
    totalIssued: 0, 
    totalRetired: 0 
});
```
- Real-time display of registry statistics
- Automatic calculation of available credits
- Visual cards with gradient styling

##### Credit Issuance Form
```javascript
const [issueForm, setIssueForm] = useState({
    projectName: '',
    amount: '',
    vintageYear: new Date().getFullYear(),
    methodology: 'VCS Standard'
});
```
- Form validation and error handling
- Dynamic methodology selection
- Integration with smart contract issue function

##### Blockchain Integration
```javascript
const fetchRegistryStats = async (iotaClient = client) => {
    const result = await iotaClient.devInspectTransactionBlock({
        transactionBlock: (() => {
            const tx = new TransactionBlock();
            tx.moveCall({
                target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::get_registry_stats`,
                arguments: [tx.object(CONTRACT_CONFIG.REGISTRY_ID)]
            });
            return tx;
        })(),
        sender: '0x0000000000000000000000000000000000000000000000000000000000000000'
    });
};
```

### User Interface Features

#### Responsive Design
- Mobile-first approach with CSS Grid and Flexbox
- Adaptive layouts for different screen sizes
- Modern gradient backgrounds and card-based design

#### Interactive Elements
- Hover effects and smooth transitions
- Loading states and disabled button handling
- Real-time form validation

#### Alert System
- Success, error, and info message types
- Auto-dismissing notifications
- Contextual feedback for user actions

### Development Setup

#### Local Development
```bash
# Start the development server
python server.py
# or
double-click start.bat
```

#### File Structure
```
carbon-credits-dapp/
├── index.html          # Main application interface
├── server.py           # Local development server
├── start.bat          # Windows startup script
├── src/
│   ├── App.js         # React main component
│   ├── index.js       # React entry point
│   └── index.css      # Styling
├── public/
│   └── index.html     # HTML template
└── package.json       # Dependencies and scripts
```

### Contract Configuration
```javascript
const CONTRACT_CONFIG = {
    PACKAGE_ID: '0xd06181cdb4a44c6336ad0a94cf8aa555d29552def7486f578758dda630d9efe4',
    REGISTRY_ID: '0xae96e53ab4db4d1dfd14f7d7047a48065a7d970975eaf713ed925b57c7102054',
    MODULE_NAME: 'carbon_credits',
    NETWORK: 'testnet'
};
```

## Usage Examples

### Smart Contract Usage

```move
// Issue 100 tons of carbon credits for a solar project
let credit = carbon_credits::issue_credits(
    &mut registry,
    string::utf8(b"Solar Farm Project"),
    100,
    2024,
    string::utf8(b"VCS Standard"),
    ctx
);

// Transfer credits to another party
carbon_credits::transfer_credits(credit, recipient_address, ctx);

// Retire credits to offset emissions
carbon_credits::retire_credits(
    &mut registry,
    credit,
    string::utf8(b"Corporate Net Zero Commitment"),
    ctx
);

// Get credit information
let (project_name, issuer, amount, vintage_year, methodology, is_retired) = 
    carbon_credits::get_credit_info(&credit);

// Check registry statistics
let (total_issued, total_retired) = carbon_credits::get_registry_stats(&registry);
```

### Frontend Usage

#### Issuing Credits via Web Interface
1. Open the web application at `http://localhost:8000`
2. Fill in the "Issue New Carbon Credits" form:
   - Project Name: "Solar Farm Project Alpha"
   - Amount: 100
   - Vintage Year: 2024
   - Methodology: VCS Standard
3. Click "🌿 Issue Credits" button
4. View updated statistics in the dashboard

#### Viewing Registry Statistics
```javascript
// The frontend automatically fetches and displays:
// - Total Credits Issued
// - Total Credits Retired  
// - Available Credits (calculated as issued - retired)
```

#### Interacting with Contract Functions
```javascript
// Example of calling contract function from frontend
const result = await iotaClient.devInspectTransactionBlock({
    transactionBlock: (() => {
        const tx = new TransactionBlock();
        tx.moveCall({
            target: `${PACKAGE_ID}::carbon_credits::get_registry_stats`,
            arguments: [tx.object(REGISTRY_ID)]
        });
        return tx;
    })(),
    sender: '0x0000000000000000000000000000000000000000000000000000000000000000'
});
```

## Building and Testing

### Smart Contract

```bash
# Build the Move contract
iota move build

# Run comprehensive test suite
iota move test

# Deploy to testnet
iota client publish --gas-budget 100000000

# Call contract functions
iota client call --package <PACKAGE_ID> --module carbon_credits --function get_registry_stats --args <REGISTRY_ID> --gas-budget 5000000
```

### Frontend Application

```bash
# Navigate to frontend directory
cd carbon-credits-dapp

# Start development server (Python)
python server.py

# Alternative: Use batch file on Windows
start.bat

# For React development (requires Node.js)
npm install
npm run dev
```

### Testing the Complete System

1. **Deploy Contract**: Use `iota client publish` to deploy to testnet
2. **Update Config**: Copy package and registry IDs to frontend config
3. **Start Frontend**: Run `python server.py` in carbon-credits-dapp folder
4. **Test Features**: 
   - Issue credits through web interface
   - View real-time statistics
   - Test transfer and retirement functions

## Project Structure

```
├── sources/
│   └── iotaproject.move      # Main carbon credits module
├── tests/
│   └── iotaproject_tests.move # Comprehensive test suite
├── Move.toml                  # Project configuration
└── README.md                  # This file
```

## Events and Transparency

The system emits events for all major operations:
- `CreditIssued`: When new credits are created
- `CreditTransferred`: When credits change ownership
- `CreditRetired`: When credits are permanently removed

These events provide a complete audit trail for all carbon credit activities.

## Security Features

- Input validation (prevents zero-amount credits)
- Immutable credit properties once issued
- Permanent retirement (credits cannot be "un-retired")
- Event logging for full transparency

## Wallet Integration

The frontend now includes full wallet integration for real blockchain transactions:

### Supported Wallets
- **IOTA Wallet Browser Extension**: For real transactions on IOTA blockchain
- **Demo Wallet**: For testing and development purposes

### Wallet Features
- 🔗 **Connect/Disconnect**: Secure wallet connection management
- 💳 **Balance Display**: Real-time IOTA balance monitoring  
- 🔐 **Transaction Signing**: Secure transaction approval through wallet
- 📊 **Credit Management**: View, transfer, and retire your carbon credits
- 🛡️ **Security**: Private keys never leave your wallet

### Real Transaction Support
```javascript
// Issue credits with real blockchain transaction
const tx = createIssueCreditsTransaction(registryId, projectName, amount, year, methodology);
const result = await signAndExecuteTransaction(tx);

// Transfer credits to another address
const transferTx = createTransferCreditsTransaction(creditId, recipientAddress);
await signAndExecuteTransaction(transferTx);

// Retire credits permanently
const retireTx = createRetireCreditsTransaction(registryId, creditId, reason);
await signAndExecuteTransaction(retireTx);
```

### Setup for Real Transactions
1. Install [IOTA Wallet browser extension](https://chrome.google.com/webstore/detail/iota-wallet)
2. Create or import wallet account
3. Get testnet IOTA tokens from faucet: `iota client faucet`
4. Connect wallet in the application
5. Start issuing and managing carbon credits on blockchain

See `carbon-credits-dapp/WALLET_INTEGRATION.md` for detailed integration guide.

## Future Enhancements

Potential improvements could include:
- Multi-wallet support (MetaMask, WalletConnect)
- Hardware wallet integration
- Batch operations for multiple credits
- Credit splitting and merging
- Time-based restrictions
- Integration with external verification systems
- Carbon credit marketplace functionality
- Cross-chain bridge support