'use client';

import { useEffect, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  FileText,
  RefreshCw,
  Search,
  Send,
  Tag,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { useWallet } from './WalletProvider';
import { useExperience } from '../preferences/ExperienceProvider';
import { shortAddress } from '../../lib/ux';

const storageKey = 'xramp-transaction-metadata';

const formatAmount = (transaction) => {
  const isINRTransaction = transaction.method === 'inr_transfer' ||
    transaction.method === 'auto_inr_transfer' ||
    transaction.inrAmount ||
    transaction.description?.includes('₹') ||
    transaction.description?.includes('INR');

  if (isINRTransaction && transaction.type === 'transfer_sent') {
    if (transaction.inrAmount) return `₹${transaction.inrAmount}`;
    const inrMatch = transaction.description?.match(/₹(\d+(?:\.\d+)?)/);
    if (inrMatch) return `₹${inrMatch[1]}`;
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

const readMetadata = () => {
  if (typeof window === 'undefined') return {};

  try {
    return JSON.parse(localStorage.getItem(storageKey) || '{}');
  } catch (error) {
    console.error('Failed to parse local transaction metadata:', error);
    return {};
  }
};

export function TransactionHistory() {
  const { transactions, loading, loadTransactions } = useWallet();
  const { t } = useExperience();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [localMetadata, setLocalMetadata] = useState(readMetadata);
  const [draftTag, setDraftTag] = useState('');

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const saveMetadata = (nextMetadata) => {
    setLocalMetadata(nextMetadata);
    localStorage.setItem(storageKey, JSON.stringify(nextMetadata));
  };

  const exportTransactions = () => {
    const rows = filteredTransactions.map((transaction) => {
      const meta = localMetadata[transaction.id] || {};

      return {
        date: new Date(transaction.createdAt).toLocaleString(),
        type: formatTransactionType(transaction.type),
        status: transaction.status || '',
        amount: transaction.amount,
        method: transaction.method || '',
        counterparty: transaction.recipientEmail || transaction.senderEmail || '',
        label: meta.tag || '',
        note: meta.note || '',
        hash: transaction.hash || '',
      };
    });

    const header = Object.keys(rows[0] || {
      date: '',
      type: '',
      status: '',
      amount: '',
      method: '',
      counterparty: '',
      label: '',
      note: '',
      hash: '',
    });

    const csv = [
      header.join(','),
      ...rows.map((row) => header.map((key) => `"${String(row[key] || '').replaceAll('"', '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `x-ramp-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const meta = localMetadata[transaction.id] || {};
    const matchesQuery = !query || [
      transaction.description,
      transaction.method,
      transaction.hash,
      transaction.recipientEmail,
      transaction.senderEmail,
      meta.tag,
      meta.note,
    ]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;

    return matchesQuery && matchesStatus && matchesType;
  });

  const updateMetadata = (transactionId, updates) => {
    saveMetadata({
      ...localMetadata,
      [transactionId]: {
        ...(localMetadata[transactionId] || {}),
        ...updates,
      },
    });
  };

  const printReceipt = (transaction) => {
    const meta = localMetadata[transaction.id] || {};
    const popup = window.open('', '_blank', 'width=720,height=840');
    if (!popup) return;

    popup.document.write(`
      <html>
        <head>
          <title>X-Ramp Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #111827; }
            h1 { margin-bottom: 24px; }
            .row { display: flex; justify-content: space-between; gap: 16px; border-bottom: 1px solid #e5e7eb; padding: 12px 0; }
            .label { color: #6b7280; }
            .value { font-weight: 600; text-align: right; word-break: break-word; }
          </style>
        </head>
        <body>
          <h1>X-Ramp Transaction Receipt</h1>
          <div class="row"><span class="label">Type</span><span class="value">${formatTransactionType(transaction.type)}</span></div>
          <div class="row"><span class="label">Amount</span><span class="value">${formatAmount(transaction)}</span></div>
          <div class="row"><span class="label">Status</span><span class="value">${transaction.status || 'N/A'}</span></div>
          <div class="row"><span class="label">Counterparty</span><span class="value">${transaction.recipientEmail || transaction.senderEmail || 'Self'}</span></div>
          <div class="row"><span class="label">Date</span><span class="value">${new Date(transaction.createdAt).toLocaleString()}</span></div>
          <div class="row"><span class="label">Label</span><span class="value">${meta.tag || 'Unlabeled'}</span></div>
          <div class="row"><span class="label">Note</span><span class="value">${meta.note || 'No note added'}</span></div>
          <div class="row"><span class="label">Hash</span><span class="value">${transaction.hash || 'N/A'}</span></div>
        </body>
      </html>
    `);

    popup.document.close();
    popup.focus();
    popup.print();
  };

  return (
    <>
      <Card className="dark-surface">
        <CardHeader className="flex flex-col gap-4 pb-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <CardTitle className="text-zinc-950">{t('dashboard.recentTransactions')}</CardTitle>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Search, label, and export wallet activity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={exportTransactions} disabled={!filteredTransactions.length}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="ghost" size="icon" onClick={loadTransactions} disabled={loading} aria-label="Refresh transactions">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px_160px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by email, label, note, or hash"
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
                const meta = localMetadata[transaction.id] || {};

                return (
                  <button
                    key={transaction.id}
                    type="button"
                    onClick={() => {
                      setSelectedTransaction(transaction);
                      setDraftTag(meta.tag || '');
                    }}
                    className="flex w-full flex-col gap-3 rounded-xs border border-zinc-200 p-4 text-left transition-colors hover:bg-zinc-50 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`rounded-full bg-gray-100 p-2 ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">
                            {formatTransactionType(transaction.type)}
                          </p>
                          {meta.tag && (
                            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                              {meta.tag}
                            </span>
                          )}
                        </div>
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
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={Boolean(selectedTransaction)}
        onClose={() => setSelectedTransaction(null)}
        title="Transaction Receipt"
        size="lg"
      >
        {selectedTransaction && (
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xs border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Type</p>
                <p className="mt-2 text-lg font-semibold text-zinc-950">{formatTransactionType(selectedTransaction.type)}</p>
              </div>
              <div className="rounded-xs border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Amount</p>
                <p className="mt-2 text-lg font-semibold text-zinc-950">{formatAmount(selectedTransaction)}</p>
              </div>
            </div>

            <div className="space-y-3 rounded-xs border border-zinc-200 p-4">
              <div className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-3">
                <span className="text-sm text-zinc-500">Status</span>
                <span className="font-medium capitalize text-zinc-950">{selectedTransaction.status || 'n/a'}</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-3">
                <span className="text-sm text-zinc-500">Date</span>
                <span className="font-medium text-right text-zinc-950">{new Date(selectedTransaction.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-3">
                <span className="text-sm text-zinc-500">Counterparty</span>
                <span className="font-medium text-right text-zinc-950">{selectedTransaction.recipientEmail || selectedTransaction.senderEmail || 'Self'}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-zinc-500">Hash</span>
                <span className="font-mono text-right text-xs text-zinc-950">{selectedTransaction.hash || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900">Transaction label</label>
              <div className="flex gap-2">
                <Input
                  value={draftTag}
                  onChange={(event) => setDraftTag(event.target.value)}
                  placeholder="e.g. Salary, Refund, Rent"
                />
                <Button type="button" variant="outline" onClick={() => updateMetadata(selectedTransaction.id, { tag: draftTag.trim() })}>
                  <Tag className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900">Private note</label>
              <textarea
                value={localMetadata[selectedTransaction.id]?.note || ''}
                onChange={(event) => updateMetadata(selectedTransaction.id, { note: event.target.value })}
                placeholder="Add a short note for records or later search."
                className="min-h-28 w-full rounded-xs border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
              />
            </div>

            <div className="rounded-xs border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
              <div className="flex items-center gap-2 font-medium">
                <FileText className="h-4 w-4" />
                Save receipts for records
              </div>
              <p className="mt-2">
                Print this modal to save a lightweight PDF receipt for audits or reimbursements.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => printReceipt(selectedTransaction)} className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Print / Save PDF
              </Button>
              <Button type="button" onClick={() => setSelectedTransaction(null)} className="flex-1">
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
