'use client';

import { useState } from 'react';
import { Building } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert, AlertDescription } from '../ui/Alert';
import { useWallet } from './WalletProvider';

export function WithdrawModal({ isOpen, onClose }) {
  const [step, setStep] = useState('amount'); // 'amount', 'bank', 'processing'
  const [amount, setAmount] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    accountNumber: '',
    routingNumber: '',
    bankName: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { withdraw, stellarBalance } = useWallet();

  const validateAmount = () => {
    const newErrors = {};
    const numAmount = parseFloat(amount);
    const availableBalance = parseFloat(stellarBalance);

    if (!amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    } else if (numAmount < 10) {
      newErrors.amount = 'Minimum withdrawal is $10';
    } else if (numAmount > 5000) {
      newErrors.amount = 'Maximum withdrawal is $5,000';
    } else if (numAmount > availableBalance) {
      newErrors.amount = 'Insufficient balance';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateBankDetails = () => {
    const newErrors = {};

    if (!bankDetails.accountHolderName) {
      newErrors.accountHolderName = 'Account holder name is required';
    }

    if (!bankDetails.accountNumber) {
      newErrors.accountNumber = 'Account number is required';
    } else if (bankDetails.accountNumber.length < 8) {
      newErrors.accountNumber = 'Account number must be at least 8 digits';
    }

    if (!bankDetails.routingNumber) {
      newErrors.routingNumber = 'Routing number is required';
    } else if (bankDetails.routingNumber.length !== 9) {
      newErrors.routingNumber = 'Routing number must be 9 digits';
    }

    if (!bankDetails.bankName) {
      newErrors.bankName = 'Bank name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAmountNext = () => {
    if (validateAmount()) {
      setStep('bank');
    }
  };

  const handleBankDetailsSubmit = async () => {
    if (!validateBankDetails()) return;

    setLoading(true);
    setStep('processing');

    try {
      await withdraw(amount, bankDetails);

      // Reset form
      setStep('amount');
      setAmount('');
      setBankDetails({
        accountHolderName: '',
        accountNumber: '',
        routingNumber: '',
        bankName: ''
      });
      setErrors({});
      onClose();
    } catch (error) {
      setStep('bank');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'bank') {
      setStep('amount');
    } else if (step === 'processing') {
      setStep('bank');
    }
  };

  const handleClose = () => {
    if (!loading) {
      setStep('amount');
      setAmount('');
      setBankDetails({
        accountHolderName: '',
        accountNumber: '',
        routingNumber: '',
        bankName: ''
      });
      setErrors({});
      onClose();
    }
  };

  const handleBankDetailChange = (field, value) => {
    setBankDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Withdraw Funds"
      size="md"
    >
      {step === 'amount' && (
        <div className="space-y-4">
          <p className="text-zinc-800">
            Withdraw funds from your X-Ramp wallet to your bank account.
          </p>

          <div className="bg-zinc-50 p-4 rounded-xs border border-zinc-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-800">Available Balance</span>
              <span className="font-medium">{stellarBalance} XLM</span>
            </div>
          </div>

          <Input
            label="Withdrawal Amount (XLM)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={errors.amount}
            placeholder="Enter amount"
            min="10"
            max="5000"
            step="0.01"
          />

          <Alert>
            <AlertDescription>
              Withdrawals are processed within 1-3 business days.
              A small network fee may apply.
            </AlertDescription>
          </Alert>

          <Button onClick={handleAmountNext} className="w-full">
            Continue
          </Button>
        </div>
      )}

      {step === 'bank' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Bank Account Details</h3>
            <Button variant="ghost" size="sm" onClick={handleBack}>
              Change Amount
            </Button>
          </div>

          <div className="bg-blue-50 p-4 rounded-xs border border-blue-200">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Withdrawing {amount} XLM</span>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Account Holder Name"
              value={bankDetails.accountHolderName}
              onChange={(e) => handleBankDetailChange('accountHolderName', e.target.value)}
              error={errors.accountHolderName}
              placeholder="Full name on account"
            />

            <Input
              label="Account Number"
              value={bankDetails.accountNumber}
              onChange={(e) => handleBankDetailChange('accountNumber', e.target.value.replace(/\D/g, ''))}
              error={errors.accountNumber}
              placeholder="Account number"
            />

            <Input
              label="Routing Number"
              value={bankDetails.routingNumber}
              onChange={(e) => handleBankDetailChange('routingNumber', e.target.value.replace(/\D/g, '').slice(0, 9))}
              error={errors.routingNumber}
              placeholder="9-digit routing number"
              maxLength={9}
            />

            <Input
              label="Bank Name"
              value={bankDetails.bankName}
              onChange={(e) => handleBankDetailChange('bankName', e.target.value)}
              error={errors.bankName}
              placeholder="Name of your bank"
            />
          </div>

          <Alert>
            <AlertDescription>
              Your bank details are encrypted and will only be used for this withdrawal.
              We use zero-knowledge proofs to verify your ownership without exposing sensitive data.
            </AlertDescription>
          </Alert>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleBack} className="flex-1">
              Back
            </Button>
            <Button onClick={handleBankDetailsSubmit} className="flex-1">
              Withdraw {amount} XLM
            </Button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h3 className="font-medium">Processing Withdrawal</h3>
          <p className="text-zinc-800">
            We&apos;re processing your {amount} XLM withdrawal to your bank account.
            This may take a few moments...
          </p>
          <Alert>
            <AlertDescription>
              Your withdrawal is being verified using zero-knowledge proofs.
              You&apos;ll receive a confirmation email once the transfer is initiated.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </Modal>
  );
}