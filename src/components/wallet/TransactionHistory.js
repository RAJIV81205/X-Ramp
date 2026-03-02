'use client';

import { useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, Send, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { useWallet } from './WalletProvider';

const formatAmount = (transaction) => {
  // Check if this is an INR transaction by looking at the description or method
  const isINRTransaction = transaction.method === 'inr_transfer' || 
                          transaction.method === 'auto_inr_transfer' || 
                          transaction.inrAmount ||
                          (transaction.description && transaction.description.includes('₹')) ||
                          (transaction.description && transaction.description.includes('INR'));
  
  // For sent INR transactions, show INR amount
  if (isINRTransaction && transaction.type === 'transfer_sent') {
    // Try to extract INR amount from description if inrAmount field is not available
    if (transaction.inrAmount) {
      return `₹${transaction.inrAmount}`;
    } else if (transaction.description) {
      // Extract INR amount from description like "Auto-completed: ₹121 → 6.2051282 XLM"
      const inrMatch = transaction.description.match(/₹(\d+(?:\.\d+)?)/);
      if (inrMatch) {
        return `₹${inrMatch[1]}`;
      }
    }
  }
  
  // For received INR transactions or regular XLM transactions, show XLM amount
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

  if (diffDays === 1) {
    return 'Today';
  } else if (diffDays === 2) {
    return 'Yesterday';
  } else if (diffDays <= 7) {
    return `${diffDays - 1} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export function TransactionHistory() {
  const { transactions, loading, loadTransactions } = useWallet();

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleRefresh = () => {
    loadTransactions();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-zinc-950">Recent Transactions</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowUpRight className="h-8 w-8 text-gray-700" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No transactions yet
            </h3>
            <p className="text-zinc-800">
              Your transaction history will appear here once you start using your wallet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const Icon = getTransactionIcon(transaction.type);
              const colorClass = getTransactionColor(transaction.type);
              const sign = getTransactionSign(transaction.type);

              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-xs hover:bg-zinc-50 transition-colors text-zinc-900 border-zinc-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full bg-gray-100 ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {formatTransactionType(transaction.type)}
                      </p>
                      <p className="text-sm text-zinc-800">
                        {transaction.description || transaction.method || 'Transaction'}
                      </p>
                      {transaction.recipientEmail && (
                        <p className="text-xs text-gray-700">
                          To: {transaction.recipientEmail}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
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