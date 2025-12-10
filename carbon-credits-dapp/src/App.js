import React, { useState, useEffect } from 'react';
import { IotaClient, getFullnodeUrl } from '@iota/iota-sdk/client';
import { TransactionBlock } from '@iota/iota-sdk/transactions';

// Contract configuration
const CONTRACT_CONFIG = {
  PACKAGE_ID: '0xd06181cdb4a44c6336ad0a94cf8aa555d29552def7486f578758dda630d9efe4',
  REGISTRY_ID: '0xae96e53ab4db4d1dfd14f7d7047a48065a7d970975eaf713ed925b57c7102054',
  MODULE_NAME: 'carbon_credits',
  NETWORK: 'testnet'
};

function App() {
  const [client, setClient] = useState(null);
  const [registryStats, setRegistryStats] = useState({ totalIssued: 0, totalRetired: 0 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  
  // Form states
  const [issueForm, setIssueForm] = useState({
    projectName: '',
    amount: '',
    vintageYear: new Date().getFullYear(),
    methodology: 'VCS Standard'
  });

  // Initialize IOTA client
  useEffect(() => {
    const initClient = async () => {
      try {
        const iotaClient = new IotaClient({
          url: getFullnodeUrl('testnet')
        });
        setClient(iotaClient);
        await fetchRegistryStats(iotaClient);
      } catch (error) {
        console.error('Failed to initialize client:', error);
        showMessage('Failed to connect to IOTA network', 'error');
      }
    };

    initClient();
  }, []);

  const fetchRegistryStats = async (iotaClient = client) => {
    if (!iotaClient) return;
    
    try {
      setLoading(true);
      
      // Call the get_registry_stats function
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
    
    if (!client) {
      showMessage('Client not initialized', 'error');
      return;
    }

    if (!issueForm.projectName || !issueForm.amount) {
      showMessage('Please fill in all required fields', 'error');
      return;
    }

    try {
      setLoading(true);
      showMessage('This is a demo interface. In a real application, you would connect a wallet to sign transactions.', 'info');
      
      // Simulate successful transaction
      setTimeout(() => {
        showMessage(`Successfully issued ${issueForm.amount} carbon credits for "${issueForm.projectName}"!`, 'success');
        setIssueForm({
          projectName: '',
          amount: '',
          vintageYear: new Date().getFullYear(),
          methodology: 'VCS Standard'
        });
        // In a real app, you would refresh the stats here
        setLoading(false);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to issue credits:', error);
      showMessage('Failed to issue carbon credits', 'error');
      setLoading(false);
    }
  };

  const availableCredits = registryStats.totalIssued - registryStats.totalRetired;

  return (
    <div className="container">
      <div className="header">
        <h1>🌱 Carbon Credit Tracking System</h1>
        <p>Transparent, blockchain-based carbon credit management on IOTA</p>
        <div className="network-info">
          Connected to IOTA Testnet • Contract: {CONTRACT_CONFIG.PACKAGE_ID.slice(0, 10)}...
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

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Processing...' : '🌿 Issue Credits'}
          </button>
        </form>
      </div>

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
        
        <button 
          className="btn" 
          onClick={() => showMessage('Transfer functionality would allow moving credits between addresses', 'info')}
        >
          🔄 Transfer Credits
        </button>
        
        <button 
          className="btn btn-danger" 
          onClick={() => showMessage('Retirement functionality would permanently remove credits from circulation', 'info')}
        >
          🗑️ Retire Credits
        </button>
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

export default App;