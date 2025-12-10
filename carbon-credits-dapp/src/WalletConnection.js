import React, { useState, useEffect } from 'react';
import { useWallet } from './WalletProvider';

const WalletConnection = () => {
  const {
    wallet,
    account,
    isConnecting,
    error,
    getAvailableWallets,
    disconnect,
    getBalance,
    isConnected
  } = useWallet();

  const [balance, setBalance] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Fetch balance when wallet connects
  useEffect(() => {
    if (isConnected) {
      fetchBalance();
    }
  }, [isConnected]);

  const fetchBalance = async () => {
    try {
      const balanceData = await getBalance();
      setBalance(balanceData);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  };

  const handleConnect = async (connectFunction) => {
    try {
      await connectFunction();
      setShowWalletModal(false);
    } catch (err) {
      console.error('Connection failed:', err);
    }
  };

  const formatBalance = (balance) => {
    if (!balance) return '0';
    const iotaBalance = parseInt(balance.totalBalance) / 1000000000; // Convert from nanos to IOTA
    return iotaBalance.toFixed(4);
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected) {
    return (
      <div className="wallet-connected">
        <div className="wallet-info">
          <div className="wallet-details">
            <span className="wallet-name">{wallet.name}</span>
            <span className="wallet-address">{formatAddress(account)}</span>
            {balance && (
              <span className="wallet-balance">
                {formatBalance(balance)} IOTA
              </span>
            )}
          </div>
          <button 
            className="btn btn-sm btn-outline" 
            onClick={disconnect}
            title="Disconnect Wallet"
          >
            🔌 Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <button 
        className="btn btn-primary" 
        onClick={() => setShowWalletModal(true)}
        disabled={isConnecting}
      >
        {isConnecting ? 'Connecting...' : '🔗 Connect Wallet'}
      </button>

      {showWalletModal && (
        <div className="modal-overlay" onClick={() => setShowWalletModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Connect Wallet</h3>
              <button 
                className="modal-close" 
                onClick={() => setShowWalletModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <p>Choose a wallet to connect to the Carbon Credit Tracking System:</p>
              
              {error && (
                <div className="alert alert-error">
                  {error}
                </div>
              )}

              <div className="wallet-options">
                {getAvailableWallets().map((walletOption, index) => (
                  <button
                    key={index}
                    className="wallet-option"
                    onClick={() => handleConnect(walletOption.connect)}
                    disabled={isConnecting}
                  >
                    <span className="wallet-icon">{walletOption.icon}</span>
                    <span className="wallet-name">{walletOption.name}</span>
                    {walletOption.name.includes('Demo') && (
                      <span className="wallet-badge">Testnet</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="wallet-info-text">
                <h4>🔒 Wallet Security</h4>
                <ul>
                  <li>Your private keys never leave your wallet</li>
                  <li>All transactions require your explicit approval</li>
                  <li>Connected to IOTA Testnet for safe testing</li>
                </ul>

                <h4>📱 Don't have a wallet?</h4>
                <p>
                  Install the <a href="https://chrome.google.com/webstore/detail/iota-wallet" target="_blank" rel="noopener noreferrer">IOTA Wallet browser extension</a> or use the demo wallet for testing.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .wallet-connected {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .wallet-info {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.1);
          padding: 8px 16px;
          border-radius: 8px;
          color: white;
        }

        .wallet-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .wallet-name {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .wallet-address {
          font-size: 0.8rem;
          opacity: 0.8;
          font-family: monospace;
        }

        .wallet-balance {
          font-size: 0.8rem;
          opacity: 0.9;
          color: #4CAF50;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 0.8rem;
        }

        .btn-outline {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
        }

        .btn-outline:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .btn-primary {
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e1e5e9;
        }

        .modal-header h3 {
          margin: 0;
          color: #333;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close:hover {
          color: #333;
        }

        .modal-body {
          padding: 24px;
        }

        .wallet-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin: 20px 0;
        }

        .wallet-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .wallet-option:hover {
          border-color: #667eea;
          background: #f8f9ff;
        }

        .wallet-option:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .wallet-icon {
          font-size: 24px;
        }

        .wallet-name {
          font-weight: 600;
          color: #333;
          flex: 1;
        }

        .wallet-badge {
          background: #4CAF50;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .wallet-info-text {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #e1e5e9;
        }

        .wallet-info-text h4 {
          color: #333;
          margin: 16px 0 8px 0;
          font-size: 0.9rem;
        }

        .wallet-info-text ul {
          margin: 8px 0;
          padding-left: 20px;
        }

        .wallet-info-text li {
          margin: 4px 0;
          font-size: 0.85rem;
          color: #666;
        }

        .wallet-info-text p {
          font-size: 0.85rem;
          color: #666;
          margin: 8px 0;
        }

        .wallet-info-text a {
          color: #667eea;
          text-decoration: none;
        }

        .wallet-info-text a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .modal-content {
            width: 95%;
            margin: 20px;
          }
          
          .wallet-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }
      `}</style>
    </>
  );
};

export default WalletConnection;