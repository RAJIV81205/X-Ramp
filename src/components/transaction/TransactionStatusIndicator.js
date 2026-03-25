'use client';

import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  AlertCircle,
  Loader,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap
} from 'lucide-react';
import { useState } from 'react';

export function TransactionStatusIndicator({ transaction, onDismiss }) {
  const [expanded, setExpanded] = useState(false);

  if (!transaction) return null;

  const { status, title, description, progress, steps, error, result, type, icon: Icon } = transaction;

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader className="w-5 h-5 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'from-blue-50 to-blue-100 border-blue-200';
      case 'completed':
        return 'from-green-50 to-green-100 border-green-200';
      case 'error':
        return 'from-red-50 to-red-100 border-red-200';
      default:
        return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };

  const getStatusTextColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-900';
      case 'completed':
        return 'text-green-900';
      case 'error':
        return 'text-red-900';
      default:
        return 'text-gray-900';
    }
  };

  const getIconColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`bg-linear-to-r ${getStatusColor()} border rounded-lg p-4 shadow-lg`}
      >
        {/* Main Status Bar */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            {/* Icon */}
            <div className={`${getIconColor()} mt-0.5 shrink-0`}>
              {Icon ? <Icon className="w-5 h-5" /> : getStatusIcon()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold ${getStatusTextColor()} truncate`}>
                {title}
              </h3>
              <p className={`text-sm ${getStatusTextColor()} opacity-75 truncate`}>
                {description}
              </p>

              {/* Progress Bar */}
              {status === 'loading' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden"
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-linear-to-r from-blue-500 to-blue-600 rounded-full"
                  />
                </motion.div>
              )}

              {/* Error Message */}
              {status === 'error' && error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-red-700 mt-2 font-medium"
                >
                  {error}
                </motion.p>
              )}

              {/* Success Message */}
              {status === 'completed' && result?.message && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-green-700 mt-2 font-medium"
                >
                  {result.message}
                </motion.p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Expand Button */}
            {steps.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setExpanded(!expanded)}
                className={`p-1.5 rounded-lg transition-colors ${
                  status === 'loading'
                    ? 'hover:bg-blue-200'
                    : status === 'completed'
                    ? 'hover:bg-green-200'
                    : 'hover:bg-red-200'
                }`}
              >
                {expanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </motion.button>
            )}

            {/* Dismiss Button */}
            {(status === 'completed' || status === 'error') && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onDismiss}
                className={`p-1.5 rounded-lg transition-colors ${
                  status === 'completed'
                    ? 'hover:bg-green-200'
                    : 'hover:bg-red-200'
                }`}
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Expanded Steps */}
        <AnimatePresence>
          {expanded && steps.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-current border-opacity-20"
            >
              <div className="space-y-2">
                {steps.map((step, idx) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-2 text-sm"
                  >
                    <div className="shrink-0 mt-0.5">
                      {step.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : step.status === 'error' ? (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      ) : (
                        <Loader className="w-4 h-4 animate-spin text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${getStatusTextColor()}`}>
                        {step.label}
                      </p>
                      {step.description && (
                        <p className={`text-xs ${getStatusTextColor()} opacity-75`}>
                          {step.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
