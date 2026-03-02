'use client';

import { useState, useEffect } from 'react';
import { Send, IndianRupee, Zap } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert, AlertDescription } from '../ui/Alert';
import { useAuth } from '../auth/AuthProvider';
import toast from 'react-hot-toast';

export function INRTransferModal({ isOpen, onClose, onTransferComplete }) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [inrAmount, setInrAmount] = useState('');
  const [xlmAmount, setXlmAmount] = useState('');
  const [senderBankAccount, setSenderBankAccount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [message, setMessage] = useState('');
  const [exchangeRate, setExchangeRate] = useState(19.5);
  const [loading, setLoading] = useState(false);
  const [generatingProof, setGeneratingProof] = useState(false);
  const [errors, setErrors] = useState({});
  const [generateProof, setGenerateProof] = useState(true);

  const { user } = useAuth();

  // Fetch current exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.warn('No auth token available for exchange rate fetch');
          return;
        }

        const response = await fetch('/api/wallet/inr-transfer', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setExchangeRate(data.exchangeRate);
          console.log(`Updated exchange rate: 1 XLM = ₹${data.exchangeRate}`);
        } else {
          console.warn('Failed to fetch exchange rate, using default');
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        // Keep using default rate
      }
    };

    if (isOpen) {
      fetchExchangeRate();
    }
  }, [isOpen]);

  // Calculate XLM amount when INR amount changes
  useEffect(() => {
    if (inrAmount && exchangeRate) {
      const xlm = (parseFloat(inrAmount) / exchangeRate).toFixed(7);
      setXlmAmount(xlm);
    } else {
      setXlmAmount('');
    }
  }, [inrAmount, exchangeRate]);

  const validateForm = () => {
    const newErrors = {};
    const numAmount = parseFloat(inrAmount);

    if (!recipientEmail) {
      newErrors.recipientEmail = 'Recipient email is required';
    } else if (!/\S+@\S+\.\S+/.test(recipientEmail)) {
      newErrors.recipientEmail = 'Invalid email address';
    }

    if (!inrAmount) {
      newErrors.inrAmount = 'INR amount is required';
    } else if (isNaN(numAmount) || numAmount <= 0) {
      newErrors.inrAmount = 'Amount must be a positive number';
    } else if (numAmount < 50) {
      newErrors.inrAmount = 'Minimum transfer is ₹50';
    } else if (numAmount > 200000) {
      newErrors.inrAmount = 'Maximum transfer is ₹200,000';
    }

    if (!senderBankAccount) {
      newErrors.senderBankAccount = 'Bank account number is required';
    } else if (senderBankAccount.length < 10) {
      newErrors.senderBankAccount = 'Invalid bank account number';
    }

    if (!transactionId) {
      newErrors.transactionId = 'Transaction ID is required';
    } else if (transactionId.length < 8) {
      newErrors.transactionId = 'Invalid transaction ID';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Check if user is authenticated
    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast.error('Please log in to make transfers');
      return;
    }

    setLoading(true);

    try {
      if (generateProof) {
        setGeneratingProof(true);
        toast.loading('Generating zero-knowledge proof...', { id: 'proof-gen' });
      }

      const response = await fetch('/api/wallet/inr-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientEmail,
          inrAmount: parseFloat(inrAmount),
          senderBankAccount,
          transactionId,
          message,
          generateProof
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.dismiss('proof-gen');

        if (data.autoVerified) {
          toast.success(`🎉 Automatic verification successful! ${data.xlmAmount} XLM sent to you from ${recipientEmail}!`);
        } else if (data.zkProofGenerated) {
          if (data.autoVerificationError) {
            toast.error(`Proof generated but auto-verification failed: ${data.autoVerificationError}`);
          } else if (data.systemError) {
            toast.error(`Proof generated but system error: ${data.systemError}`);
          } else {
            toast.success('INR payment proof generated successfully!');
          }
        } else {
          toast.success('INR payment recorded successfully!');
        }

        // Reset form
        setRecipientEmail('');
        setInrAmount('');
        setXlmAmount('');
        setSenderBankAccount('');
        setTransactionId('');
        setMessage('');
        setErrors({});

        if (onTransferComplete) {
          onTransferComplete(data);
        }

        onClose();
      } else {
        toast.dismiss('proof-gen');

        // Handle specific error cases
        if (response.status === 401) {
          toast.error('Authentication failed. Please log in again.');
          // Optionally redirect to login
        } else if (response.status === 400) {
          toast.error(data.error || 'Invalid transfer details');
        } else if (response.status === 500) {
          toast.error('Server error. Please try again later.');
        } else {
          toast.error(data.error || 'Transfer failed');
        }
      }
    } catch (error) {
      toast.dismiss('proof-gen');

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('Transfer failed. Please try again.');
      }

      console.error('Transfer error:', error);
    } finally {
      setLoading(false);
      setGeneratingProof(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setRecipientEmail('');
      setInrAmount('');
      setXlmAmount('');
      setSenderBankAccount('');
      setTransactionId('');
      setMessage('');
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="INR to XLM Exchange"
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="bg-blue-50 p-4 rounded-xs border border-blue-200">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <IndianRupee className="w-4 h-4" />
            <span className="font-medium">Automatic INR to XLM Exchange</span>
          </div>
          <p className="text-sm text-blue-600">
            Generate a ZK proof of your INR payment. If the XLM sender is registered, XLM will be sent automatically!
          </p>
          <p className="text-sm text-blue-600 mt-1">
            Exchange Rate: 1 XLM = ₹{exchangeRate.toFixed(2)}
          </p>
          {xlmAmount && (
            <p className="text-sm text-blue-600 mt-1">
              ₹{inrAmount} → {xlmAmount} XLM
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            XLM Sender Email
          </label>
          <Input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="xlm-sender@example.com"
            disabled={loading}
            className={errors.recipientEmail ? 'border-red-500' : ''}
          />
          {errors.recipientEmail && (
            <p className="text-red-500 text-sm mt-1">{errors.recipientEmail}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (INR)
          </label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="number"
              value={inrAmount}
              onChange={(e) => setInrAmount(e.target.value)}
              placeholder="1000"
              min="50"
              max="200000"
              step="1"
              disabled={loading}
              className={`pl-10 ${errors.inrAmount ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.inrAmount && (
            <p className="text-red-500 text-sm mt-1">{errors.inrAmount}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Minimum: ₹50, Maximum: ₹200,000
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Bank Account Number
          </label>
          <Input
            type="text"
            value={senderBankAccount}
            onChange={(e) => setSenderBankAccount(e.target.value)}
            placeholder="1234567890123456"
            disabled={loading}
            className={errors.senderBankAccount ? 'border-red-500' : ''}
          />
          {errors.senderBankAccount && (
            <p className="text-red-500 text-sm mt-1">{errors.senderBankAccount}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bank Transaction ID
          </label>
          <Input
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="TXN123456789"
            disabled={loading}
            className={errors.transactionId ? 'border-red-500' : ''}
          />
          {errors.transactionId && (
            <p className="text-red-500 text-sm mt-1">{errors.transactionId}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Reference ID from your bank transfer
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message (Optional)
          </label>
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Payment for services"
            disabled={loading}
            maxLength={100}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="generateProof"
            checked={generateProof}
            onChange={(e) => setGenerateProof(e.target.checked)}
            disabled={loading}
            className="rounded border-gray-300"
          />
          <label htmlFor="generateProof" className="text-sm text-gray-700 flex items-center gap-1">
            <Zap className="w-4 h-4 text-yellow-500" />
            Generate ZK Proof (Recommended)
          </label>
        </div>

        {generateProof && (
          <Alert>
            <Zap className="w-4 h-4" />
            <AlertDescription>
              A zero-knowledge proof will be generated to verify your payment without revealing sensitive details.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || generatingProof}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {generatingProof ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating Proof...
              </>
            ) : loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send ₹{inrAmount || '0'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}