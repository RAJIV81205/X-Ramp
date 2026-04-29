'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Copy, ExternalLink, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

export function WalletCreatedNotification({ walletAddress, onClose }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Address copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy address');
    }
  };

  if (!walletAddress) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-green-800">Wallet Created Successfully!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-zinc-800">
            Your keyless wallet has been created. Here&apos;s your Stellar address:
          </div>

          <div className="space-y-2">
            <div className="p-3 bg-zinc-50 rounded-xs border border-zinc-200">
              <code className="text-xs break-all font-mono">{walletAddress}</code>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(walletAddress)}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                {copied ? 'Copied!' : 'Copy Address'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://friendbot.stellar.org?addr=${walletAddress}`, '_blank')}
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Fund Wallet
              </Button>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xs p-3">
            <div className="text-sm text-yellow-800">
              <strong>Important:</strong> Your wallet needs XLM to pay for transaction fees.
              Click &quot;Fund Wallet&quot; to get free testnet XLM, or send XLM from another wallet.
            </div>
          </div>

          <Button onClick={onClose} className="w-full">
            <X className="h-4 w-4 mr-2" />
            Got it, take me to my wallet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}