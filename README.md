<img width="995" height="926" alt="image" src="https://github.com/user-attachments/assets/f58ea85e-5680-4b13-b54d-c5b8e5d6aae6" />

# Carbon Credit Tracking System

A simple blockchain-based carbon credit tracking system built with Move on the IOTA network.

## Overview

This system allows for the issuance, transfer, and retirement of carbon credits in a transparent and immutable way. Each carbon credit represents a verified reduction or removal of one metric ton of CO2 equivalent from the atmosphere.

## Features

### Core Functionality
- **Issue Credits**: Create new carbon credits for verified environmental projects
- **Transfer Credits**: Move credits between different addresses
- **Retire Credits**: Permanently remove credits from circulation to offset emissions
- **Track Statistics**: Monitor total issued, retired, and available credits

### Data Tracking
Each carbon credit contains:
- Project name and issuer information
- Amount (in tons of CO2 equivalent)
- Vintage year (when the carbon reduction occurred)
- Verification methodology used
- Retirement status

## Smart Contract Structure

### Main Components

1. **CarbonCredit**: Individual credit certificates with project details
2. **CarbonRegistry**: Central registry tracking system statistics
3. **Events**: Blockchain events for credit issuance, transfers, and retirements

### Key Functions

- `issue_credits()`: Create new carbon credits
- `transfer_credits()`: Transfer credits to another address
- `retire_credits()`: Permanently retire credits from circulation
- `get_credit_info()`: Retrieve credit details
- `get_registry_stats()`: Get system-wide statistics

## Usage Example

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
```

## Building and Testing

```bash
# Build the project
iota move build

# Run tests
iota move test
```

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

## Future Enhancements

Potential improvements could include:
- Batch operations for multiple credits
- Credit splitting and merging
- Time-based restrictions
- Integration with external verification systems
- Marketplace functionality
