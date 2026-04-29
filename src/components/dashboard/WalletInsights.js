'use client';

import { BarChart3, Clock3, ShieldCheck, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useWallet } from '../wallet/WalletProvider';

export function WalletInsights() {
  const { transactions, stellarBalance } = useWallet();

  const completedTransactions = transactions.filter((transaction) => transaction.status === 'completed');
  const sentTransactions = transactions.filter((transaction) => transaction.type === 'transfer_sent');
  const monthlyVolume = completedTransactions.reduce((total, transaction) => total + Number(transaction.amount || 0), 0);
  const pendingTransactions = transactions.filter((transaction) => transaction.status === 'pending').length;
  const zkTransactions = transactions.filter((transaction) => transaction.method?.includes('inr') || transaction.method?.includes('sponsored')).length;

  const cards = [
    {
      label: 'Available XLM',
      value: `${stellarBalance} XLM`,
      icon: TrendingUp,
      tone: 'text-blue-600',
      note: 'Live balance from Stellar testnet',
    },
    {
      label: 'Volume tracked',
      value: `${monthlyVolume.toFixed(2)} XLM`,
      icon: BarChart3,
      tone: 'text-emerald-600',
      note: 'Useful for analytics and portfolio tracking',
    },
    {
      label: 'Pending actions',
      value: `${pendingTransactions}`,
      icon: Clock3,
      tone: 'text-amber-600',
      note: 'Transfers that may need follow-up',
    },
    {
      label: 'Privacy-protected flows',
      value: `${zkTransactions}/${transactions.length || 0}`,
      icon: ShieldCheck,
      tone: 'text-violet-600',
      note: 'ZK or sponsored transaction coverage',
    },
  ];

  return (
    <Card className="dark-surface">
      <CardHeader>
        <CardTitle className="text-zinc-950">Portfolio Insights</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div key={card.label} className="rounded-xs border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500">{card.label}</p>
                <Icon className={`h-4 w-4 ${card.tone}`} />
              </div>
              <p className="mt-3 text-2xl font-semibold text-zinc-950">{card.value}</p>
              <p className="mt-1 text-xs text-zinc-500">{card.note}</p>
            </div>
          );
        })}

        <div className="rounded-xs border border-zinc-200 bg-zinc-50 p-4 sm:col-span-2">
          <p className="text-sm text-zinc-500">Wallet activity snapshot</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              {transactions.length} total transactions
            </span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
              {completedTransactions.length} completed
            </span>
            <span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700">
              {sentTransactions.length} sent by you
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
