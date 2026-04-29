'use client';

import { useState } from 'react';
import { CreditCard, Building, Smartphone, Shield, Zap } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent } from '../ui/Card';
import { Alert, AlertDescription } from '../ui/Alert';
import { useWallet } from './WalletProvider';

const paymentMethods = [
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    icon: Building,
    description: 'Direct bank transfer (ACH)',
    processingTime: '1-3 business days',
    fees: 'Free'
  },
  {
    id: 'debit_card',
    name: 'Debit Card',
    icon: CreditCard,
    description: 'Instant deposit with debit card',
    processingTime: 'Instant',
    fees: '2.9% + $0.30'
  },
  {
    id: 'mobile_payment',
    name: 'Mobile Payment',
    icon: Smartphone,
    description: 'Apple Pay, Google Pay, etc.',
    processingTime: 'Instant',
    fees: '2.9% + $0.30'
  }
];

export function DepositModal({ isOpen, onClose }) {
  const [step, setStep] = useState('method'); // 'method', 'amount', 'processing'
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [amount, setAmount] = useState('');
  const [useZkProof, setUseZkProof] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [zkProofStatus, setZkProofStatus] = useState(null);
  
  const { deposit } = useWallet();

  const validateAmount = () => {
    const newErrors = {};
    const numAmount = parseFloat(amount);
    
    if (!amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    } else if (numAmount < 10) {
      newErrors.amount = 'Minimum deposit is $10';
    } else if (numAmount > 10000) {
      newErrors.amount = 'Maximum deposit is $10,000';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setStep('amount');
  };

  const handleAmountSubmit = async () => {
    if (!validateAmount()) return;
    
    setLoading(true);
    setStep('processing');
    setZkProofStatus(useZkProof ? 'generating' : null);
    
    try {
      // Call deposit with ZK proof option
      const result = await deposit(amount, selectedMethod.id, useZkProof);
      
      if (useZkProof && result?.zkProof) {
        setZkProofStatus('verified');
      }
      
      // Reset form
      setTimeout(() => {
        setStep('method');
        setSelectedMethod(null);
        setAmount('');
        setUseZkProof(false);
        setErrors({});
        setZkProofStatus(null);
        onClose();
      }, 2000);
    } catch (error) {
      setStep('amount');
      setZkProofStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'amount') {
      setStep('method');
      setSelectedMethod(null);
    } else if (step === 'processing') {
      setStep('amount');
    }
  };

  const handleClose = () => {
    if (!loading) {
      setStep('method');
      setSelectedMethod(null);
      setAmount('');
      setUseZkProof(false);
      setErrors({});
      setZkProofStatus(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Deposit Funds"
      size="md"
    >
      {step === 'method' && (
        <div className="space-y-4">
          <p className="text-zinc-800">
            Choose your preferred payment method to add funds to your X-Ramp wallet.
          </p>
          
          <div className="space-y-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <Card
                  key={method.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleMethodSelect(method)}
                >
                  <CardContent className="p-4 text-zinc-900">
                    <div className="flex items-start space-x-3">
                      <Icon className="h-6 w-6 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-medium">{method.name}</h3>
                        <p className="text-sm text-zinc-800 mt-1">
                          {method.description}
                        </p>
                        <div className="flex justify-between mt-2 text-xs text-gray-700">
                          <span>Processing: {method.processingTime}</span>
                          <span>Fees: {method.fees}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {step === 'amount' && selectedMethod && (
        <div className="space-y-4 text-zinc-900">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Deposit Amount</h3>
            <Button variant="ghost" size="sm" onClick={handleBack}>
              Change Method
            </Button>
          </div>
          
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <selectedMethod.icon className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">{selectedMethod.name}</p>
                  <p className="text-sm text-zinc-800">
                    {selectedMethod.processingTime} • {selectedMethod.fees}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Input
            label="Amount (USD)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={errors.amount}
            placeholder="Enter amount"
            min="10"
            max="10000"
            step="0.01"
          />

          {/* ZK Proof Option */}
          <Card className="border-2 border-dashed border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    id="useZkProof"
                    checked={useZkProof}
                    onChange={(e) => setUseZkProof(e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="useZkProof" className="flex items-center cursor-pointer">
                    <Shield className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-900">
                      Use Zero-Knowledge Proof Verification
                    </span>
                  </label>
                  <p className="text-sm text-blue-800 mt-1">
                    Generate a cryptographic proof to verify your deposit without revealing sensitive information.
                    This provides enhanced privacy and security.
                  </p>
                  {useZkProof && (
                    <div className="mt-2 flex items-center text-xs text-blue-700">
                      <Zap className="h-3 w-3 mr-1" />
                      <span>ZK proof will be generated during processing</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Alert>
            <AlertDescription>
              Funds will be converted from USD to XLM and credited to your wallet after processing.
              {useZkProof && ' Your deposit will be verified using zero-knowledge cryptography for enhanced privacy.'}
            </AlertDescription>
          </Alert>
          
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleBack} className="flex-1">
              Back
            </Button>
            <Button onClick={handleAmountSubmit} className="flex-1">
              {useZkProof ? (
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  ZK Deposit ${amount || '0'}
                </div>
              ) : (
                `Deposit $${amount || '0'}`
              )}
            </Button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h3 className="font-medium">Processing Deposit</h3>
          <p className="text-zinc-800">
            We&apos;re processing your ${amount} deposit via {selectedMethod?.name}.
            {useZkProof && ' Generating zero-knowledge proof...'}
          </p>
          
          {useZkProof && (
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">
                  {zkProofStatus === 'generating' && 'Generating ZK Proof...'}
                  {zkProofStatus === 'verified' && 'ZK Proof Verified ✓'}
                  {!zkProofStatus && 'ZK Proof Enabled'}
                </span>
              </div>
              
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800">
                  {zkProofStatus === 'generating' && 'Creating cryptographic proof to verify your deposit privately...'}
                  {zkProofStatus === 'verified' && 'Your deposit has been verified using zero-knowledge cryptography!'}
                  {!zkProofStatus && 'Your deposit will be verified using zero-knowledge proofs for enhanced privacy.'}
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          {!useZkProof && (
            <Alert>
              <AlertDescription>
                Your deposit is being processed securely.
                You&apos;ll be notified once the funds are available in your wallet.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </Modal>
  );
}