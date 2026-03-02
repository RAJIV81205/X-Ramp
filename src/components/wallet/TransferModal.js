'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert, AlertDescription } from '../ui/Alert';
import { useWallet } from './WalletProvider';

export function TransferModal({ isOpen, onClose }) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { transfer, stellarBalance } = useWallet();

  const validateForm = () => {
    const newErrors = {};
    const numAmount = parseFloat(amount);
    const availableBalance = parseFloat(stellarBalance);

    if (!recipientEmail) {
      newErrors.recipientEmail = 'Recipient email is required';
    } else if (!/\S+@\S+\.\S+/.test(recipientEmail)) {
      newErrors.recipientEmail = 'Invalid email address';
    }

    if (!amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    } else if (numAmount < 1) {
      newErrors.amount = 'Minimum transfer is $1';
    } else if (numAmount > availableBalance) {
      newErrors.amount = 'Insufficient balance';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      await transfer(recipientEmail, amount, message);

      // Reset form
      setRecipientEmail('');
      setAmount('');
      setMessage('');
      setErrors({});
      onClose();
    } catch (error) {
      // Error is handled by the wallet provider
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setRecipientEmail('');
      setAmount('');
      setMessage('');
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Send Money"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-zinc-800">
          Send money to anyone with an email address. They'll receive instructions to claim the funds.
        </p>

        <div className="bg-zinc-50 p-4 rounded-xs border border-zinc-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-800">Available Balance</span>
            <span className="font-medium">{stellarBalance} XLM</span>
          </div>
        </div>

        <Input
          label="Recipient Email"
          type="email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          error={errors.recipientEmail}
          placeholder="Enter recipient's email"
          disabled={loading}
        />

        <Input
          label="Amount (XLM)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
          placeholder="Enter amount"
          min="1"
          step="0.01"
          disabled={loading}
        />

        <Input
          label="Message (Optional)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add a note for the recipient"
          disabled={loading}
        />

        <Alert>
          <AlertDescription>
            The recipient will receive an email with instructions to claim the funds.
            If they don't have an X-Ramp account, they can create one to receive the money.
          </AlertDescription>
        </Alert>

        <div className="flex space-x-3">
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
            loading={loading}
            disabled={loading}
            className="flex-1"
          >
            <Send className="h-4 w-4 mr-2" />
            Send {amount || '0'} XLM
          </Button>
        </div>
      </form>
    </Modal>
  );
}