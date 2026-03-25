'use client';

import { useTransactionStatus } from './TransactionStatusContext';
import { useCallback } from 'react';

/**
 * Hook for managing transaction lifecycle
 * Simplifies starting, updating, and completing transactions
 */
export function useTransaction() {
  const {
    startTransaction,
    updateTransaction,
    addStep,
    completeTransaction,
    failTransaction,
    getTransaction
  } = useTransactionStatus();

  const executeTransaction = useCallback(
    async (config, asyncFn) => {
      const {
        id,
        type = 'processing',
        title = 'Processing',
        description = 'Please wait...',
        icon = null
      } = config;

      try {
        // Start transaction
        startTransaction(id, { type, title, description, icon });

        // Execute async function with transaction context
        const result = await asyncFn({
          addStep: (step) => addStep(id, step),
          updateProgress: (progress) => updateTransaction(id, { progress }),
          updateDescription: (desc) => updateTransaction(id, { description: desc })
        });

        // Complete transaction
        completeTransaction(id, result);

        return result;
      } catch (error) {
        // Fail transaction
        failTransaction(id, error);
        throw error;
      }
    },
    [startTransaction, updateTransaction, addStep, completeTransaction, failTransaction]
  );

  return {
    executeTransaction,
    getTransaction,
    startTransaction,
    updateTransaction,
    addStep,
    completeTransaction,
    failTransaction
  };
}
