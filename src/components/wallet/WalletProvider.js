'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { XRampContract, formatBalance, getAccountBalance } from '../../lib/stellar';
import toast from 'react-hot-toast';

const WalletContext = createContext({});

export function WalletProvider({ children }) {
  const [balance, setBalance] = useState('0');
  const [stellarBalance, setStellarBalance] = useState('0');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState(null);
  
  const { user } = useAuth();

  const loadTransactions = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/wallet/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  }, []);

  const loadWalletData = useCallback(async (contractInstance = contract) => {
    if (!user?.publicKey) return;
    
    setLoading(true);
    try {
      // Load Stellar network balance (this is now our primary balance)
      let accountExists = false;
      try {
        const balances = await getAccountBalance(user.publicKey);
        const xlmBalance = balances.find(b => b.asset_type === 'native');
        const currentBalance = xlmBalance ? parseFloat(xlmBalance.balance).toFixed(2) : '0';
        
        // Use Stellar balance as both balances for simplicity
        setStellarBalance(currentBalance);
        setBalance(currentBalance);
        accountExists = true;
        
        console.log(`Loaded XLM balance: ${currentBalance} XLM`);
      } catch (error) {
        if (error.message.includes('Account not found')) {
          console.log('Account not found on network, needs funding');
          setStellarBalance('0');
          setBalance('0');
          accountExists = false;
        } else {
          console.error('Failed to load Stellar balance:', error);
          setStellarBalance('0');
          setBalance('0');
        }
      }

      // Load transaction history for display purposes
      await loadTransactions();
      
    } catch (error) {
      console.error('Failed to load wallet data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  }, [contract, loadTransactions, user?.publicKey]);

  const initializeWallet = useCallback(async () => {
    try {
      const contractInstance = new XRampContract();
      setContract(contractInstance);
      await loadWalletData(contractInstance);
    } catch (error) {
      console.error('Failed to initialize contract:', error);
      toast.error('Failed to initialize wallet contract');
    }
  }, [loadWalletData]);

  useEffect(() => {
    if (user?.publicKey) {
      initializeWallet();
    }
  }, [user?.publicKey, initializeWallet]);

  const deposit = async (amount, paymentMethod = 'bank_transfer', useZkProof = false) => {
    if (!user?.publicKey) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          paymentMethod,
          userAddress: user.publicKey,
          useZkProof
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Deposit failed');
      }

      if (useZkProof && data.zkProof) {
        toast.success(`ZK-verified deposit completed! Proof generated and verified.`);
      } else {
        toast.success('Deposit completed successfully!');
      }
      
      // Reload wallet data
      await loadWalletData();
      
      return data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async (amount, bankDetails) => {
    if (!user?.publicKey) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          bankDetails,
          userAddress: user.publicKey
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Withdrawal failed');
      }

      toast.success('Withdrawal initiated successfully!');
      
      // Reload wallet data
      await loadWalletData();
      
      return data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const transfer = async (recipientEmail, amount, message = '') => {
    if (!user?.publicKey) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/wallet/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientEmail,
          amount: parseFloat(amount),
          message,
          senderAddress: user.publicKey
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Transfer failed');
      }

      toast.success(data.message || 'Transfer completed successfully!');
      
      // Reload wallet data
      await loadWalletData();
      
      return data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fundTestnetWallet = async () => {
    if (!user?.publicKey) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      toast.loading('Funding wallet with testnet XLM...', { id: 'funding' });
      
      // Fund the account using Stellar Friendbot
      const response = await fetch(`https://friendbot.stellar.org?addr=${user.publicKey}`);
      
      if (!response.ok) {
        throw new Error('Failed to fund account');
      }
      
      // Wait a bit for the account to be created
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success('Wallet funded successfully!', { id: 'funding' });
      
      // Reload wallet data
      await loadWalletData();
      
      return true;
    } catch (error) {
      toast.error(`Funding failed: ${error.message}`, { id: 'funding' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fee-sponsored (gasless) XLM transfer.
   * The platform pays the Stellar network fee via a Fee Bump transaction.
   */
  const sponsoredTransfer = async (recipientEmail, amount, message = '') => {
    if (!user?.publicKey) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);

      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/wallet/sponsored-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientEmail,
          amount: parseFloat(amount),
          message,
          senderAddress: user.publicKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sponsored transfer failed');
      }

      if (data.feeSponsored) {
        toast.success(`Gasless transfer complete! X-Ramp paid the network fee.`);
      } else {
        toast.success(data.message || 'Transfer completed successfully!');
      }

      await loadWalletData();
      return data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshBalance = async () => {
    await loadWalletData();
  };

  const value = {
    balance,
    stellarBalance,
    transactions,
    loading,
    deposit,
    withdraw,
    transfer,
    sponsoredTransfer,
    refreshBalance,
    loadTransactions,
    fundTestnetWallet
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}