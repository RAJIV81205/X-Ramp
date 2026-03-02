'use client';

import { useState } from 'react';
import { Eye, EyeOff, RefreshCw, DollarSign, Star, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { useWallet } from './WalletProvider';
import { useAuth } from '../auth/AuthProvider';
import toast from 'react-hot-toast';

export function BalanceCard() {
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);
  const { balance, stellarBalance, loading, refreshBalance } = useWallet();
  const { user } = useAuth();

  const handleRefresh = async () => {
    await refreshBalance();
  };

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

  return (
    <Card className="bg-zinc-950 text-white border-zinc-800 shadow-lg relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-white">
          Wallet Balances
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowBalance(!showBalance)}
            className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            {showBalance ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
            className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 relative z-10">
        {/* Unified XLM Balance */}
        <div>
          <div className="flex items-center space-x-2">
            <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            <div className="text-2xl font-bold tracking-tight">
              {showBalance ? stellarBalance : '••••••'}
            </div>
            <span className="text-sm text-zinc-400">XLM</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">Your XLM Balance</p>
        </div>

        {/* Balance Details */}
        <div className="border-t border-zinc-800 pt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Available for transfers</span>
            <span className="font-medium">{showBalance ? stellarBalance : '••••••'} XLM</span>
          </div>
        </div>

        {user?.publicKey && (
          <div className="mt-4 space-y-2 border-t border-zinc-800 pt-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-500">Wallet Address</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(user.publicKey)}
                className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                {copied ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xs p-2 font-mono text-xs text-zinc-400 break-all">
              {user.publicKey}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-zinc-500">
          <span>Keyless Wallet</span>
          <span className="flex items-center text-zinc-400">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
            Active
          </span>
        </div>
      </CardContent>
    </Card>
  );
}