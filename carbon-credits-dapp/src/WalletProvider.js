import React, { createContext, useContext, useState, useEffect } from 'react';
import { IotaClient, getFullnodeUrl } from '@iota/iota-sdk/client';
import { TransactionBlock } from '@iota/iota-sdk/transactions';

// Wallet Context
const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

// Wallet Provider Component
export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [account, setAccount] = useState(null);
  const [client, setClient] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Initialize IOTA client
  useEffect(() => {
    const initClient = async () => {
      try {
        const iotaClient = new IotaClient({
          url: getFullnodeUrl('testnet')
        });
        setClient(iotaClient);
      } catch (err) {
        console.error('Failed to initialize IOTA client:', err);
        setError('Failed to connect to IOTA network');
      }
    };

    initClient();
  }, []);

  // Check for available wallets
  const getAvailableWallets = () => {
    if (typeof window !== 'undefined' && window.iota) {
      return [
        {
          name: 'IOTA Wallet',
          icon: '🔗',
          connect: connectIotaWallet
        }
      ];
    }
    
    // Fallback for demo/development
    return [
      {
        name: 'Demo Wallet (Testnet)',
        icon: '🧪',
        connect: connectDemoWallet
      }
    ];
  };

  // Connect to IOTA Wallet (browser extension)
  const connectIotaWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (!window.iota) {
        throw new Error('IOTA Wallet not found. Please install the IOTA Wallet browser extension.');
      }

      // Request connection
      const accounts = await window.iota.request({
        method: 'iota_requestAccounts',
      });

      if (accounts && accounts.length > 0) {
        const selectedAccount = accounts[0];
        setAccount(selectedAccount);
        setWallet({
          name: 'IOTA Wallet',
          address: selectedAccount,
          type: 'browser_extension'
        });
        
        return selectedAccount;
      } else {
        throw new Error('No accounts found in wallet');
      }
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  // Demo wallet for development/testing
  const connectDemoWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Simulate wallet connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const demoAddress = '0xa8906e25d6b479f7eae85f1fa8b634790722665176129ce2ed70f3662c3eddb6';
      
      setAccount(demoAddress);
      setWallet({
        name: 'Demo Wallet (Testnet)',
        address: demoAddress,
        type: 'demo'
      });

      return demoAddress;
    } catch (err) {
      console.error('Failed to connect demo wallet:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    setWallet(null);
    setAccount(null);
    setError(null);
  };

  // Sign and execute transaction
  const signAndExecuteTransaction = async (transactionBlock) => {
    if (!wallet || !account || !client) {
      throw new Error('Wallet not connected');
    }

    try {
      if (wallet.type === 'browser_extension' && window.iota) {
        // Use browser extension to sign transaction
        const result = await window.iota.request({
          method: 'iota_signAndExecuteTransactionBlock',
          params: {
            transactionBlock: transactionBlock.serialize(),
            account: account,
            requestType: 'WaitForLocalExecution',
            options: {
              showInput: true,
              showEffects: true,
              showEvents: true,
              showObjectChanges: true,
              showBalanceChanges: true,
            },
          },
        });

        return result;
      } else if (wallet.type === 'demo') {
        // Demo mode - simulate transaction
        console.log('Demo mode: Simulating transaction execution');
        
        // Return mock successful transaction result
        return {
          digest: 'DEMO_' + Math.random().toString(36).substr(2, 9),
          effects: {
            status: { status: 'success' },
            gasUsed: { computationCost: '1000000', storageCost: '2000000' }
          },
          events: [],
          objectChanges: [],
          balanceChanges: []
        };
      } else {
        throw new Error('Unsupported wallet type');
      }
    } catch (err) {
      console.error('Transaction failed:', err);
      throw err;
    }
  };

  // Get account balance
  const getBalance = async () => {
    if (!account || !client) {
      return null;
    }

    try {
      if (wallet.type === 'demo') {
        // Return demo balance
        return {
          totalBalance: '10000000000', // 10 IOTA
          coinObjectCount: 1
        };
      }

      const balance = await client.getBalance({
        owner: account,
      });

      return balance;
    } catch (err) {
      console.error('Failed to get balance:', err);
      return null;
    }
  };

  // Create transaction block for issuing credits
  const createIssueCreditsTransaction = (registryId, projectName, amount, vintageYear, methodology) => {
    const tx = new TransactionBlock();
    
    const [credit] = tx.moveCall({
      target: `0xd06181cdb4a44c6336ad0a94cf8aa555d29552def7486f578758dda630d9efe4::carbon_credits::issue_credits`,
      arguments: [
        tx.object(registryId),
        tx.pure(projectName),
        tx.pure(amount, 'u64'),
        tx.pure(vintageYear, 'u64'),
        tx.pure(methodology)
      ],
    });

    // Transfer the created credit to the user
    tx.transferObjects([credit], tx.pure(account));

    return tx;
  };

  // Create transaction block for retiring credits
  const createRetireCreditsTransaction = (registryId, creditId, retirementReason) => {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `0xd06181cdb4a44c6336ad0a94cf8aa555d29552def7486f578758dda630d9efe4::carbon_credits::retire_credits`,
      arguments: [
        tx.object(registryId),
        tx.object(creditId),
        tx.pure(retirementReason)
      ],
    });

    return tx;
  };

  // Create transaction block for transferring credits
  const createTransferCreditsTransaction = (creditId, recipient) => {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `0xd06181cdb4a44c6336ad0a94cf8aa555d29552def7486f578758dda630d9efe4::carbon_credits::transfer_credits`,
      arguments: [
        tx.object(creditId),
        tx.pure(recipient)
      ],
    });

    return tx;
  };

  const value = {
    wallet,
    account,
    client,
    isConnecting,
    error,
    getAvailableWallets,
    connectIotaWallet,
    connectDemoWallet,
    disconnect,
    signAndExecuteTransaction,
    getBalance,
    createIssueCreditsTransaction,
    createRetireCreditsTransaction,
    createTransferCreditsTransaction,
    isConnected: !!wallet && !!account
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};