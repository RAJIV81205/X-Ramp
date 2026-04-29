'use client';

/**
 * SponsoredTransferModal
 *
 * UI for the Fee Sponsorship (gasless transfer) feature.
 * Users send XLM without paying any network fees — the platform sponsors the fee
 * via Stellar's Fee Bump transaction mechanism.
 */

import { useState, useEffect } from 'react';
import { Zap, Send, Info, CheckCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert, AlertDescription } from '../ui/Alert';
import { useWallet } from './WalletProvider';

export function SponsoredTransferModal({ isOpen, onClose }) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [sponsorshipStatus, setSponsorshipStatus] = useState(null);
  const [result, setResult] = useState(null);

  const { sponsoredTransfer, stellarBalance } = useWallet();

  // Fetch sponsorship status when modal opens
  useEffect(() => {
    if (isOpen) {
      fetch('/api/wallet/sponsored-transfer')
        .then((r) => r.json())
        .then((data) => setSponsorshipStatus(data))
        .catch(() => setSponsorshipStatus({ feeSponsorshipEnabled: false }));
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};
    const numAmount = parseFloat(amount);
    const available = parseFloat(stellarBalance);

    if (!recipientEmail) {
      newErrors.recipientEmail = 'Recipient email is required';
    } else if (!/\S+@\S+\.\S+/.test(recipientEmail)) {
      newErrors.recipientEmail = 'Invalid email address';
    }

    if (!amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    } else if (numAmount > available - 0.5) {
      newErrors.amount = `Insufficient balance (need to keep 0.5 XLM reserve). Max: ${Math.max(0, available - 0.5).toFixed(2)} XLM`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await sponsoredTransfer(recipientEmail, amount, message);
      setResult(data);
    } catch {
      // Error is handled by WalletProvider (toast)
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
      setResult(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Gasless Transfer" size="md">
      {result ? (
        // ── Success state ──────────────────────────────────────────────────
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Transfer Complete!</h3>
          <p className="text-zinc-600">{result.message}</p>

          {result.feeSponsored && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left space-y-2">
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <Zap className="h-4 w-4" />
                Fee Sponsorship Active
              </div>
              <p className="text-sm text-green-600">
                X-Ramp paid the Stellar network fee on your behalf via a Fee Bump
                transaction. You paid <strong>zero fees</strong>.
              </p>
              {result.sponsorPublicKey && (
                <p className="text-xs text-green-500 font-mono break-all">
                  Sponsor: {result.sponsorPublicKey}
                </p>
              )}
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-3 text-left text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-zinc-500">Amount</span>
              <span className="font-medium">{result.transaction?.amount} XLM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Recipient</span>
              <span className="font-medium">{result.transaction?.recipientEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Tx Hash</span>
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${result.transaction?.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-blue-600 hover:underline truncate max-w-[180px]"
              >
                {result.transaction?.hash?.slice(0, 16)}…
              </a>
            </div>
          </div>

          <Button onClick={handleClose} className="w-full">
            Done
          </Button>
        </div>
      ) : (
        // ── Form state ─────────────────────────────────────────────────────
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Feature badge */}
          <div className="flex items-start gap-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
            <Zap className="h-5 w-5 text-purple-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-purple-800">
                Gasless Transfer — Fee Sponsorship
              </p>
              <p className="text-xs text-purple-600 mt-0.5">
                X-Ramp pays the Stellar network fee for you using a{' '}
                <a
                  href="https://developers.stellar.org/docs/encyclopedia/fee-bump-transactions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Fee Bump transaction
                </a>
                . You only need the XLM you want to send.
              </p>
            </div>
          </div>

          {/* Sponsorship status indicator */}
          {sponsorshipStatus && (
            <div
              className={`flex items-center gap-2 text-xs px-3 py-2 rounded-md ${
                sponsorshipStatus.feeSponsorshipEnabled
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
              }`}
            >
              <Info className="h-3.5 w-3.5 shrink-0" />
              {sponsorshipStatus.feeSponsorshipEnabled
                ? `Fee sponsorship is active. Sponsor: ${sponsorshipStatus.sponsorPublicKey?.slice(0, 8)}…`
                : 'Fee sponsorship is in demo mode (SPONSOR_SECRET_KEY not set). Transaction will use standard fees.'}
            </div>
          )}

          {/* Balance */}
          <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-600">Available Balance</span>
              <span className="font-medium">{stellarBalance} XLM</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-zinc-400">Network fee</span>
              <span className="text-xs text-green-600 font-medium">
                {sponsorshipStatus?.feeSponsorshipEnabled ? '0 XLM (sponsored!)' : '~0.00001 XLM'}
              </span>
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
            min="0.0000001"
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
              The recipient must have an active X-Ramp account. Their wallet must
              also be funded on the Stellar network to receive funds.
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
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              Send {amount || '0'} XLM (Free)
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
