'use client';

import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  AlertCircle,
  Loader,
  X,
  Copy,
  ExternalLink,
  Clock
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function TransactionStatusModal({ transaction, isOpen, onClose }) {
  const [copiedField, setCopiedField] = useState(null);

  if (!isOpen || !transaction) return null;

  const { status, title, description, progress, steps, error, result, type } = transaction;

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader className="w-12 h-12 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="w-12 h-12" />;
      case 'error':
        return <AlertCircle className="w-12 h-12" />;
      default:
        return <Clock className="w-12 h-12" />;
    }
  };

  const getStatusColor = () => {
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

  const getBackgroundColor = () => {
    switch (status) {
      case 'loading':
        return 'from-blue-50 to-blue-100';
      case 'completed':
        return 'from-green-50 to-green-100';
      case 'error':
        return 'from-red-50 to-red-100';
      default:
        return 'from-gray-50 to-gray-100';
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className={`bg-linear-to-r ${getBackgroundColor()} p-6 relative`}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <motion.div
                animate={status === 'loading' ? { rotate: 360 } : {}}
                transition={status === 'loading' ? { duration: 2, repeat: Infinity, ease: 'linear' } : {}}
                className={`${getStatusColor()} mb-4`}
              >
                {getStatusIcon()}
              </motion.div>

              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {title}
              </h2>
              <p className="text-sm text-gray-600">
                {description}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Progress Bar */}
            {status === 'loading' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-semibold text-blue-600">{progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-linear-to-r from-blue-500 to-blue-600 rounded-full"
                  />
                </div>
              </motion.div>
            )}

            {/* Steps */}
            {steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Transaction Steps
                </h3>
                <div className="space-y-2">
                  {steps.map((step, idx) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="shrink-0 mt-0.5">
                        {step.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : step.status === 'error' ? (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        ) : (
                          <Loader className="w-5 h-5 animate-spin text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">
                          {step.label}
                        </p>
                        {step.description && (
                          <p className="text-xs text-gray-600 mt-0.5">
                            {step.description}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Error Details */}
            {status === 'error' && error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <h3 className="text-sm font-semibold text-red-900 mb-2">
                  Error Details
                </h3>
                <p className="text-sm text-red-700 wrap-break-word">
                  {error}
                </p>
              </motion.div>
            )}

            {/* Success Details */}
            {status === 'completed' && result && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3"
              >
                {result.message && (
                  <div>
                    <h3 className="text-sm font-semibold text-green-900 mb-1">
                      Success
                    </h3>
                    <p className="text-sm text-green-700">
                      {result.message}
                    </p>
                  </div>
                )}

                {/* Result Fields */}
                {result.fields && Object.entries(result.fields).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-green-700 font-medium capitalize">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-white px-2 py-1 rounded border border-green-200 text-green-900 font-mono break-all">
                        {String(value)}
                      </code>
                      <button
                        onClick={() => copyToClipboard(String(value), key)}
                        className="p-1 hover:bg-green-100 rounded transition-colors"
                      >
                        <Copy className={`w-4 h-4 ${copiedField === key ? 'text-green-600' : 'text-green-700'}`} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* External Link */}
                {result.link && (
                  <a
                    href={result.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium mt-2"
                  >
                    View on Explorer
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t flex gap-3">
            {status === 'loading' ? (
              <button
                disabled
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-600 font-medium rounded-lg cursor-not-allowed"
              >
                Processing...
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
