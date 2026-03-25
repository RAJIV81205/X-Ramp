'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const TransactionStatusContext = createContext({});

export function TransactionStatusProvider({ children }) {
  const [transactions, setTransactions] = useState({});

  const startTransaction = useCallback((transactionId, config = {}) => {
    const {
      type = 'processing',
      title = 'Processing',
      description = 'Please wait...',
      icon = null
    } = config;

    setTransactions(prev => ({
      ...prev,
      [transactionId]: {
        id: transactionId,
        type,
        title,
        description,
        icon,
        status: 'loading',
        progress: 0,
        startTime: Date.now(),
        steps: []
      }
    }));

    return transactionId;
  }, []);

  const updateTransaction = useCallback((transactionId, updates) => {
    setTransactions(prev => ({
      ...prev,
      [transactionId]: {
        ...prev[transactionId],
        ...updates,
        updatedAt: Date.now()
      }
    }));
  }, []);

  const addStep = useCallback((transactionId, step) => {
    setTransactions(prev => {
      const transaction = prev[transactionId];
      if (!transaction) return prev;

      return {
        ...prev,
        [transactionId]: {
          ...transaction,
          steps: [
            ...transaction.steps,
            {
              id: `step-${transaction.steps.length}`,
              timestamp: Date.now(),
              ...step
            }
          ]
        }
      };
    });
  }, []);

  const completeTransaction = useCallback((transactionId, result = {}) => {
    setTransactions(prev => ({
      ...prev,
      [transactionId]: {
        ...prev[transactionId],
        status: 'completed',
        progress: 100,
        result,
        completedAt: Date.now()
      }
    }));
  }, []);

  const failTransaction = useCallback((transactionId, error) => {
    setTransactions(prev => ({
      ...prev,
      [transactionId]: {
        ...prev[transactionId],
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        failedAt: Date.now()
      }
    }));
  }, []);

  const clearTransaction = useCallback((transactionId) => {
    setTransactions(prev => {
      const newTransactions = { ...prev };
      delete newTransactions[transactionId];
      return newTransactions;
    });
  }, []);

  const getTransaction = useCallback((transactionId) => {
    return transactions[transactionId] || null;
  }, [transactions]);

  const getAllTransactions = useCallback(() => {
    return Object.values(transactions);
  }, [transactions]);

  return (
    <TransactionStatusContext.Provider
      value={{
        transactions,
        startTransaction,
        updateTransaction,
        addStep,
        completeTransaction,
        failTransaction,
        clearTransaction,
        getTransaction,
        getAllTransactions
      }}
    >
      {children}
    </TransactionStatusContext.Provider>
  );
}

export function useTransactionStatus() {
  const context = useContext(TransactionStatusContext);
  if (!context) {
    throw new Error('useTransactionStatus must be used within TransactionStatusProvider');
  }
  return context;
}
