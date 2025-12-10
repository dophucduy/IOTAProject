import React, { useState, useEffect } from 'react';
import { IotaClient, getFullnodeUrl } from '@iota/iota-sdk/client';
import { TransactionBlock } from '@iota/iota-sdk/transactions';
import { WalletProvider, useWallet } from './WalletProvider';
import WalletConnection from './WalletConnection';

// Contract configuration
const CONTRACT_CONFIG = {
  PACKAGE_ID: '0xd06181cdb4a44c6336ad0a94cf8aa555d29552def7486f578758dda630d9efe4',
  REGISTRY_ID: '0xae96e53ab4db4d1dfd14f7d7047a48065a7d970975eaf713ed925b57c7102054',
  MODULE_NAME: 'carbon_credits',
  NETWORK: 'testnet'
};

function AppContent() {
  const {
    wallet,
    account,
    client,
    isConnected,
    signAndExecuteTransaction,
    createIssueCreditsTransaction,
    createRetireCreditsTransaction,
    createTransferCreditsTransaction
  } = useWallet();

  const [registryStats, setRegistryStats] = useState({ totalIssued: 0, totalRetired: 0 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [userCredits, setUserCredits] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);
  
  // Form states
  const [issueForm, setIssueForm] = useState({
    projectName: '',
    amount: '',
    vintageYear: new Date().getFullYear(),
    methodology: 'VCS Standard'
  });

  const [transferForm, setTransferForm] = useState({
    creditId: '',
    recipient: ''
  });

  const [retireForm, setRetireForm] = useState({
    creditId: '',
    reason: ''
  });

  // Fetch data when client is available
  useEffect(() => {
    if (client) {
      fetchRegistryStats();
    }
  }, [client]);

  // Fetch user credits when wallet connects
  useEffect(() => {
    if (isConnected && client) {
      fetchUserCredits();
    }
  }, [isConnected, client]);

  const fetchRegistryStats = async () => {
    if (!client) return;
    
    try {
      setLoading(true);
      
      // Call the get_registry_stats function
      const result = await client.devInspectTransactionBlock({
        transactionBlock: (() => {
          const tx = new TransactionBlock();
          tx.moveCall({
            target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::get_registry_stats`,
            arguments: [tx.object(CONTRACT_CONFIG.REGISTRY_ID)]
          });
          return tx;
        })(),
        sender: account || '0x0000000000000000000000000000000000000000000000000000000000000000'
      });

      if (result.results && result.results[0] && result.results[0].returnValues) {
        const [totalIssued, totalRetired] = result.results[0].returnValues;
        setRegistryStats({
          totalIssued: parseInt(totalIssued[0]) || 0,
          totalRetired: parseInt(totalRetired[0]) || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch registry stats:', error);
      showMessage('Failed to fetch registry statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCredits = async () => {
    if (!client || !account) return;

    try {
      // Get objects owned by the user
      const objects = await client.getOwnedObjects({
        owner: account,
        filter: {
          StructType: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::CarbonCredit`
        },
        options: {
          showContent: true,
          showType: true
        }
      });

      const credits = objects.data.map(obj => ({
        id: obj.data.objectId,
        ...obj.data.content.fields
      }));

      setUserCredits(credits);
    } catch (error) {
      console.error('Failed to fetch user credits:', error);
    }
  };

  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleIssueFormChange = (e) => {
    const { name, value } = e.target;
    setIssueForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIssueCredits = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      showMessage('Please connect your wallet first', 'error');
      return;
    }

    if (!issueForm.projectName || !issueForm.amount) {
      showMessage('Please fill in all required fields', 'error');
      return;
    }

    try {
      setLoading(true);
      showMessage('Creating transaction...', 'info');

      // Create transaction block
      const tx = createIssueCreditsTransaction(
        CONTRACT_CONFIG.REGISTRY_ID,
        issueForm.projectName,
        parseInt(issueForm.amount),
        parseInt(issueForm.vintageYear),
        issueForm.methodology
      );

      // Sign and execute transaction
      const result = await signAndExecuteTransaction(tx);
      
      if (result.effects?.status?.status === 'success' || result.digest) {
        showMessage(`Successfully issued ${issueForm.amount} carbon credits for "${issueForm.projectName}"!`, 'success');
        
        // Add to transaction history
        const newTransaction = {
          hash: result.digest,
          type: 'Issue Credits',
          amount: issueForm.amount,
          projectName: issueForm.projectName,
          timestamp: new Date().toISOString(),
          status: 'success',
          gasUsed: result.effects?.gasUsed?.computationCost || '1000000',
          explorerUrl: `https://explorer.iota.cafe/testnet/txblock/${result.digest}`
        };
        
        setTransactionHistory(prev => [newTransaction, ...prev.slice(0, 9)]);
        
        // Reset form
        setIssueForm({
          projectName: '',
          amount: '',
          vintageYear: new Date().getFullYear(),
          methodology: 'VCS Standard'
        });

        // Refresh data
        await fetchRegistryStats();
        await fetchUserCredits();
      } else {
        throw new Error('Transaction failed');
      }
      
    } catch (error) {
      console.error('Failed to issue credits:', error);
      showMessage(`Failed to issue carbon credits: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTransferCredits = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      showMessage('Please connect your wallet first', 'error');
      return;
    }

    if (!transferForm.creditId || !transferForm.recipient) {
      showMessage('Please fill in all required fields', 'error');
      return;
    }

    try {
      setLoading(true);
      showMessage('Creating transfer transaction...', 'info');

      const tx = createTransferCreditsTransaction(
        transferForm.creditId,
        transferForm.recipient
      );

      const result = await signAndExecuteTransaction(tx);
      
      if (result.effects?.status?.status === 'success' || result.digest) {
        showMessage('Successfully transferred carbon credits!', 'success');
        
        setTransferForm({ creditId: '', recipient: '' });
        await fetchUserCredits();
      } else {
        throw new Error('Transfer failed');
      }
      
    } catch (error) {
      console.error('Failed to transfer credits:', error);
      showMessage(`Failed to transfer credits: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRetireCredits = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      showMessage('Please connect your wallet first', 'error');
      return;
    }

    if (!retireForm.creditId || !retireForm.reason) {
      showMessage('Please fill in all required fields', 'error');
      return;
    }

    try {
      setLoading(true);
      showMessage('Creating retirement transaction...', 'info');

      const tx = createRetireCreditsTransaction(
        CONTRACT_CONFIG.REGISTRY_ID,
        retireForm.creditId,
        retireForm.reason
      );

      const result = await signAndExecuteTransaction(tx);
      
      if (result.effects?.status?.status === 'success' || result.digest) {
        showMessage('Successfully retired carbon credits!', 'success');
        
        setRetireForm({ creditId: '', reason: '' });
        await fetchRegistryStats();
        await fetchUserCredits();
      } else {
        throw new Error('Retirement failed');
      }
      
    } catch (error) {
      console.error('Failed to retire credits:', error);
      showMessage(`Failed to retire credits: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const availableCredits = registryStats.totalIssued - registryStats.totalRetired;

  return (
    <div className="container">
      <div className="header">
        <div className="header-content">
          <div className="header-text">
            <h1>🌱 Carbon Credit Tracking System</h1>
            <p>Transparent, blockchain-based carbon credit management on IOTA</p>
            <div className="network-info">
              Connected to IOTA Testnet • Contract: {CONTRACT_CONFIG.PACKAGE_ID.slice(0, 10)}...
            </div>
          </div>
          <div className="header-wallet">
            <WalletConnection />
          </div>
        </div>
      </div>

      {message && (
        <div className={`alert alert-${messageType}`}>
          {message}
        </div>
      )}

      {/* Registry Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{registryStats.totalIssued}</h3>
          <p>Total Credits Issued</p>
        </div>
        <div className="stat-card">
          <h3>{registryStats.totalRetired}</h3>
          <p>Total Credits Retired</p>
        </div>
        <div className="stat-card">
          <h3>{availableCredits}</h3>
          <p>Available Credits</p>
        </div>
      </div>

      {/* Issue Credits Form */}
      <div className="card">
        <h2>🏭 Issue New Carbon Credits</h2>
        <form onSubmit={handleIssueCredits}>
          <div className="form-group">
            <label htmlFor="projectName">Project Name *</label>
            <input
              type="text"
              id="projectName"
              name="projectName"
              value={issueForm.projectName}
              onChange={handleIssueFormChange}
              placeholder="e.g., Solar Farm Project Alpha"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount (tons CO2 equivalent) *</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={issueForm.amount}
              onChange={handleIssueFormChange}
              placeholder="e.g., 100"
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="vintageYear">Vintage Year</label>
            <input
              type="number"
              id="vintageYear"
              name="vintageYear"
              value={issueForm.vintageYear}
              onChange={handleIssueFormChange}
              min="2000"
              max={new Date().getFullYear()}
            />
          </div>

          <div className="form-group">
            <label htmlFor="methodology">Verification Methodology</label>
            <select
              id="methodology"
              name="methodology"
              value={issueForm.methodology}
              onChange={handleIssueFormChange}
            >
              <option value="VCS Standard">VCS Standard</option>
              <option value="Gold Standard">Gold Standard</option>
              <option value="REDD+">REDD+</option>
              <option value="CDM">Clean Development Mechanism</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button type="submit" className="btn" disabled={loading || !isConnected}>
            {loading ? 'Processing...' : !isConnected ? '🔗 Connect Wallet First' : '🌿 Issue Credits'}
          </button>
          {!isConnected && (
            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
              Connect your wallet to issue carbon credits on the blockchain
            </p>
          )}
        </form>
      </div>

      {/* User Credits */}
      {isConnected && (
        <div className="card">
          <h2>💳 Your Carbon Credits</h2>
          {userCredits.length > 0 ? (
            <div className="credit-list"></div>
              {userCredits.map((credit) => (
                <div key={credit.id} className="credit-item">
                  <h4>{credit.project_name}</h4>
                  <p><strong>Amount:</strong> {credit.amount} tons CO2</p>
                  <p><strong>Vintage Year:</strong> {credit.vintage_year}</p>
                  <p><strong>Methodology:</strong> {credit.methodology}</p>
                  <p><strong>Status:</strong> 
                    <span className={`status-badge ${credit.is_retired ? 'status-retired' : 'status-active'}`}>
                      {credit.is_retired ? 'Retired' : 'Active'}
                    </span>
                  </p>
                  <p><strong>Credit ID:</strong> <code>{credit.id.slice(0, 20)}...</code></p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666', fontStyle: 'italic' }}>
              No carbon credits found. Issue some credits to get started!
            </p>
          )}
        </div>
      )}

      {/* Transfer Credits */}
      {isConnected && userCredits.length > 0 && (
        <div className="card">
          <h2>🔄 Transfer Credits</h2>
          <form onSubmit={handleTransferCredits}>
            <div className="form-group">
              <label htmlFor="transfer-credit">Select Credit to Transfer</label>
              <select
                id="transfer-credit"
                value={transferForm.creditId}
                onChange={(e) => setTransferForm(prev => ({ ...prev, creditId: e.target.value }))}
                required
              >
                <option value="">Choose a credit...</option>
                {userCredits.filter(credit => !credit.is_retired).map((credit) => (
                  <option key={credit.id} value={credit.id}>
                    {credit.project_name} - {credit.amount} tons
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="recipient">Recipient Address</label>
              <input
                type="text"
                id="recipient"
                value={transferForm.recipient}
                onChange={(e) => setTransferForm(prev => ({ ...prev, recipient: e.target.value }))}
                placeholder="0x..."
                required
              />
            </div>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Processing...' : '🔄 Transfer Credits'}
            </button>
          </form>
        </div>
      )}

      {/* Retire Credits */}
      {isConnected && userCredits.length > 0 && (
        <div className="card">
          <h2>🗑️ Retire Credits</h2>
          <form onSubmit={handleRetireCredits}>
            <div className="form-group">
              <label htmlFor="retire-credit">Select Credit to Retire</label>
              <select
                id="retire-credit"
                value={retireForm.creditId}
                onChange={(e) => setRetireForm(prev => ({ ...prev, creditId: e.target.value }))}
                required
              >
                <option value="">Choose a credit...</option>
                {userCredits.filter(credit => !credit.is_retired).map((credit) => (
                  <option key={credit.id} value={credit.id}>
                    {credit.project_name} - {credit.amount} tons
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="retirement-reason">Retirement Reason</label>
              <input
                type="text"
                id="retirement-reason"
                value={retireForm.reason}
                onChange={(e) => setRetireForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="e.g., Corporate Net Zero Commitment"
                required
              />
            </div>

            <button type="submit" className="btn btn-danger" disabled={loading}>
              {loading ? 'Processing...' : '🗑️ Retire Credits'}
            </button>
          </form>
        </div>
      )}

      {/* Actions */}
      <div className="card">
        <h2>📊 Registry Actions</h2>
        <p>Manage your carbon credit registry and view detailed statistics.</p>
        
        <button 
          className="btn btn-success" 
          onClick={() => fetchRegistryStats()}
          disabled={loading}
        >
          🔄 Refresh Stats
        </button>
      </div>

      {/* Transaction History */}
      {isConnected && transactionHistory.length > 0 && (
        <div className="card">
          <h2>🔗 Transaction History</h2>
          <p style={{ marginBottom: '20px', color: '#666' }}>Your blockchain transactions with links to IOTA Explorer</p>
          <div className="transaction-list">
            {transactionHistory.map((tx, index) => (
              <div key={index} className="transaction-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ color: '#495057' }}>{tx.type}</strong>
                  <span className={`status-badge ${tx.status === 'success' ? 'status-active' : 'status-retired'}`}>
                    {tx.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px' }}>
                  {tx.projectName && <span><strong>Project:</strong> {tx.projectName} • </span>}
                  <strong>Amount:</strong> {tx.amount} tons CO2 • 
                  <strong>Gas:</strong> {parseInt(tx.gasUsed).toLocaleString()} NANOS
                </div>
                <div style={{ fontSize: '0.8rem', color: '#999', marginBottom: '8px' }}>
                  {new Date(tx.timestamp).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.8rem' }}>
                  <strong>TX Hash:</strong> <code style={{ background: '#e9ecef', padding: '2px 4px', borderRadius: '3px', fontSize: '0.7rem' }}>{tx.hash}</code>
                  <br />
                  <a href={tx.explorerUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#667eea', textDecoration: 'none' }}>
                    🔗 View on IOTA Explorer
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blockchain Explorer Links */}
      <div className="card">
        <h2>🌐 Blockchain Explorer</h2>
        <p style={{ marginBottom: '15px', color: '#666' }}>View your contract and registry on IOTA Explorer:</p>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <a 
            href={`https://explorer.iota.cafe/testnet/object/${CONTRACT_CONFIG.PACKAGE_ID}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-outline" 
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            📦 View Contract
          </a>
          <a 
            href={`https://explorer.iota.cafe/testnet/object/${CONTRACT_CONFIG.REGISTRY_ID}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-outline" 
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            🏛️ View Registry
          </a>
        </div>
      </div>

      {/* Contract Information */}
      <div className="card">
        <h2>🔗 Contract Information</h2>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>
          <p><strong>Package ID:</strong> <code>{CONTRACT_CONFIG.PACKAGE_ID}</code></p>
          <p><strong>Registry ID:</strong> <code>{CONTRACT_CONFIG.REGISTRY_ID}</code></p>
          <p><strong>Network:</strong> IOTA Testnet</p>
          <p><strong>Status:</strong> <span className="status-badge status-active">Active</span></p>
        </div>
      </div>

      {/* Footer */}
      <div className="card" style={{ textAlign: 'center', marginTop: '40px' }}>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          🌍 Built with IOTA blockchain technology for transparent carbon credit tracking
        </p>
        <p style={{ color: '#999', fontSize: '0.8rem', marginTop: '10px' }}>
          This is a demo interface. Connect a wallet for full functionality.
        </p>
      </div>
    </div>
  );
}

}

function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}

export default App;