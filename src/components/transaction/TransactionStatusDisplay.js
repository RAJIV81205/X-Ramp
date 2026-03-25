'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useTransactionStatus } from './TransactionStatusContext';
import { TransactionStatusIndicator } from './TransactionStatusIndicator';
import { useState } from 'react';

export function TransactionStatusDisplay() {
  const { getAllTransactions, clearTransaction } = useTransactionStatus();
  const [dismissedTransactions, setDismissedTransactions] = useState(new Set());

  const transactions = getAllTransactions().filter(
    tx => !dismissedTransactions.has(tx.id)
  );

  const handleDismiss = (transactionId) => {
    setDismissedTransactions(prev => new Set([...prev, transactionId]));
    clearTransaction(transactionId);
  };

  if (transactions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed bottom-6 right-6 z-40 max-w-md space-y-3"
    >
      <AnimatePresence mode="popLayout">
        {transactions.map((transaction, idx) => (
          <motion.div
            key={transaction.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ delay: idx * 0.05 }}
          >
            <TransactionStatusIndicator
              transaction={transaction}
              onDismiss={() => handleDismiss(transaction.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
