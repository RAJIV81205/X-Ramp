'use client';

import { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, RefreshCw, Search, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useWallet } from './WalletProvider';
import { useExperience } from '../preferences/ExperienceProvider';
import { shortAddress } from '../../lib/ux';

const formatAmount = (transaction) => {
  const isINRTransaction = transaction.method === 'inr_transfer' ||
    transaction.method === 'auto_inr_transfer' ||
    transaction.inrAmount ||
    transaction.description?.includes('₹') ||
    transaction.description?.includes('INR');

  if (isINRTransaction && transaction.type === 'transfer_sent') {
    if (transaction.inrAmount) {
      return `₹${transaction.inrAmount}`;
    }

    const inrMatch = transaction.description?.match(/₹(\d+(?:\.\d+)?)/);
    if (inrMatch) {
      return `₹${inrMatch[1]}`;
    }
  }

  return `${transaction.amount} XLM`;
};

const getTransactionIcon = (type) => {
  switch (type) {
    case 'deposit':
      return ArrowDownLeft;
    case 'withdrawal':
      return ArrowUpRight;
    case 'transfer_sent':
      return Send;
    case 'transfer_received':
      return ArrowDownLeft;
    default:
      return ArrowUpRight;
  }
};

const getTransactionColor = (type) => {
  switch (type) {
    case 'deposit':
    case 'transfer_received':
      return 'text-green-600';
    case 'withdrawal':
    case 'transfer_sent':
      return 'text-red-600';
    default:
      return 'text-zinc-800';
  }
};

const getTransactionSign = (type) => {
  switch (type) {
    case 'deposit':
    case 'transfer_received':
      return '+';
    case 'withdrawal':
    case 'transfer_sent':
      return '-';
    default:
      return '';
  }
};

const formatTransactionType = (type) => {
  switch (type) {
    case 'deposit':
      return 'Deposit';
    case 'withdrawal':
      return 'Withdrawal';
    case 'transfer_sent':
      return 'Sent';
    case 'transfer_received':
      return 'Received';
    default:
      return 'Transaction';
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays - 1} days ago`;
  return date.toLocaleDateString();
};

export function TransactionHistory() {
  const { transactions, loading, loadTransactions } = useWallet();
  const { t } = useExperience();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesQuery = !query || [
      transaction.description,
      transaction.method,
      transaction.hash,
      transaction.recipientEmail,
      transaction.senderEmail,
    ]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;

    return matchesQuery && matchesStatus && matchesType;
  });

  return (
    <Card className="dark-surface">
      <CardHeader className="flex flex-col gap-4 pb-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <CardTitle className="text-zinc-950">{t('dashboard.recentTransactions')}</CardTitle>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Search and filter wallet activity faster.
          </p>
        </div>

        <Button variant="ghost" size="icon" onClick={loadTransactions} disabled={loading} aria-label="Refresh transactions">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px_160px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by email, hash, or description"
              className="pl-10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 rounded-xs border border-zinc-200 bg-white px-3 text-sm text-zinc-900"
          >
            <option value="all">All statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="processing">Processing</option>
          </select>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="h-10 rounded-xs border border-zinc-200 bg-white px-3 text-sm text-zinc-900"
          >
            <option value="all">All types</option>
            <option value="deposit">Deposits</option>
            <option value="withdrawal">Withdrawals</option>
            <option value="transfer_sent">Sent</option>
            <option value="transfer_received">Received</option>
          </select>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <ArrowUpRight className="h-8 w-8 text-gray-700" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              No matching transactions
            </h3>
            <p className="text-zinc-800">
              Try another filter, or start sending funds to build your activity log.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => {
              const Icon = getTransactionIcon(transaction.type);
              const colorClass = getTransactionColor(transaction.type);
              const sign = getTransactionSign(transaction.type);

              return (
                <div
                  key={transaction.id}
                  className="flex flex-col gap-3 rounded-xs border border-zinc-200 p-4 text-left transition-colors hover:bg-zinc-50 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`rounded-full bg-gray-100 p-2 ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {formatTransactionType(transaction.type)}
                      </p>
                      <p className="text-sm text-zinc-800">
                        {transaction.description || transaction.method || 'Transaction'}
                      </p>
                      {(transaction.recipientEmail || transaction.senderEmail) && (
                        <p className="text-xs text-gray-700">
                          {transaction.recipientEmail ? `To: ${transaction.recipientEmail}` : `From: ${transaction.senderEmail}`}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                        {shortAddress(transaction.hash, 10, 8)}
                      </p>
                    </div>
                  </div>

                  <div className="text-left md:text-right">
                    <p className={`font-medium ${colorClass}`}>
                      {sign}{formatAmount(transaction)}
                    </p>
                    <p className="text-sm text-gray-700">
                      {formatDate(transaction.createdAt)}
                    </p>
                    {transaction.status && (
                      <p className={`text-xs ${transaction.status === 'completed' ? 'text-green-600' :
                        transaction.status === 'pending' ? 'text-yellow-600' :
                          transaction.status === 'failed' ? 'text-red-600' :
                            'text-zinc-800'
                        }`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
