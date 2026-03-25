'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Shield,
  Wallet,
  Send,
  TrendingUp,
  Lock,
  Mail,
  Zap,
  CheckCircle2,
  ArrowRight,
  Key,
  DollarSign,
  Eye,
  Lightbulb
} from 'lucide-react';

const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to X-Ramp',
    subtitle: 'The world\'s best ZK Fiat Ramp',
    description: 'Experience trustless crypto onboarding with zero-knowledge privacy and keyless wallet technology.',
    icon: Shield,
    color: 'from-blue-600 to-blue-400',
    highlights: [
      { icon: Mail, text: 'Email-based wallet' },
      { icon: Lock, text: 'Zero seed phrases' },
      { icon: Eye, text: 'Privacy-preserving' }
    ]
  },
  {
    id: 'keyless-wallet',
    title: 'Keyless Wallet Technology',
    subtitle: 'No seed phrases. Ever.',
    description: 'Your wallet is derived from your email using advanced cryptography. Recover it anytime with just your email and password.',
    icon: Wallet,
    color: 'from-purple-600 to-purple-400',
    features: [
      {
        title: 'Deterministic Generation',
        description: 'Your wallet is mathematically derived from your email + nonce using Poseidon hashing'
      },
      {
        title: 'Email Recovery',
        description: 'Lose your device? Just log in with your email and password to recover your wallet'
      },
      {
        title: 'No Private Keys to Manage',
        description: 'Your keys are securely stored and encrypted on our servers'
      }
    ]
  },
  {
    id: 'zk-privacy',
    title: 'Zero-Knowledge Privacy',
    subtitle: 'Prove without revealing',
    description: 'All transactions are verified using zk-SNARKs (Groth16 proofs) on the BN254 curve.',
    icon: Eye,
    color: 'from-indigo-600 to-indigo-400',
    features: [
      {
        title: 'Deposit Proofs',
        description: 'Verify bank transfers without revealing your signature or transaction details'
      },
      {
        title: 'INR Exchange Proofs',
        description: 'Prove INR payments for XLM conversion while maintaining privacy'
      },
      {
        title: 'Withdrawal Proofs',
        description: 'Prove sufficient balance without exposing your full transaction history'
      }
    ]
  },
  {
    id: 'deposit-flow',
    title: 'Deposit Flow',
    subtitle: 'Fiat to Crypto in minutes',
    description: 'Convert your fiat currency to XLM (Stellar Lumens) with optional ZK verification.',
    icon: TrendingUp,
    color: 'from-green-600 to-green-400',
    steps: [
      {
        number: 1,
        title: 'Select Payment Method',
        description: 'Choose from bank transfer, debit card, or mobile payment'
      },
      {
        number: 2,
        title: 'Enter Amount',
        description: 'Deposit between $10 and $10,000'
      },
      {
        number: 3,
        title: 'Generate ZK Proof (Optional)',
        description: 'Prove your deposit without revealing sensitive details'
      },
      {
        number: 4,
        title: 'Receive XLM',
        description: 'Funds arrive in your wallet instantly on Stellar network'
      }
    ]
  },
  {
    id: 'transfer-flow',
    title: 'P2P Transfers',
    subtitle: 'Send XLM to other users',
    description: 'Transfer XLM directly to other X-Ramp users by email address.',
    icon: Send,
    color: 'from-cyan-600 to-cyan-400',
    features: [
      {
        title: 'Email-Based Transfers',
        description: 'Send XLM to any X-Ramp user by their email address'
      },
      {
        title: 'Instant Settlement',
        description: 'Transactions settle in real-time on the Stellar network'
      },
      {
        title: 'INR Exchange',
        description: 'Special support for Indian Rupee conversions with automatic verification'
      }
    ]
  },
  {
    id: 'withdraw-flow',
    title: 'Withdrawal Flow',
    subtitle: 'Crypto back to Fiat',
    description: 'Convert your XLM back to fiat currency and withdraw to your bank account.',
    icon: DollarSign,
    color: 'from-orange-600 to-orange-400',
    steps: [
      {
        number: 1,
        title: 'Enter Amount',
        description: 'Specify how much XLM you want to withdraw'
      },
      {
        number: 2,
        title: 'Verify Bank Account',
        description: 'Confirm your bank details for the transfer'
      },
      {
        number: 3,
        title: 'Process Withdrawal',
        description: 'Your XLM is converted and sent to your bank'
      },
      {
        number: 4,
        title: 'Receive Funds',
        description: 'Fiat arrives in your bank account within 1-2 business days'
      }
    ]
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    subtitle: 'Built on cryptography',
    description: 'Your funds and data are protected by industry-leading cryptographic protocols.',
    icon: Lock,
    color: 'from-red-600 to-red-400',
    features: [
      {
        title: 'Cryptographic Attestations',
        description: 'Tamper-proof deposit confirmations using EdDSA signatures'
      },
      {
        title: 'Replay Protection',
        description: 'Prevents double-spending and replay attacks with timestamp validation'
      },
      {
        title: 'Encrypted Storage',
        description: 'Your keys are encrypted in our database with bcrypt hashing'
      },
      {
        title: 'Compliance Ready',
        description: 'Attribute-based ZK proofs for regulatory requirements'
      }
    ]
  },
  {
    id: 'getting-started',
    title: 'Ready to Get Started?',
    subtitle: 'Create your keyless wallet now',
    description: 'Join thousands of users experiencing the future of crypto onboarding.',
    icon: Zap,
    color: 'from-yellow-600 to-yellow-400',
    cta: true
  }
];

export function OnboardingTutorial({ onClose, onGetStarted }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const step = TUTORIAL_STEPS[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGetStarted = () => {
    onClose();
    if (onGetStarted) onGetStarted();
  };

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (dir) => ({
      zIndex: 0,
      x: dir < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <AnimatePresence mode="wait">
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
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className={`bg-linear-to-r ${step.color} p-8 text-white relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.2)_25%,rgba(255,255,255,.2)_50%,transparent_50%,transparent_75%,rgba(255,255,255,.2)_75%,rgba(255,255,255,.2))] bg-size-[40px_40px]" />
            </div>

            <div className="relative z-10 flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-1">{step.title}</h2>
                  <p className="text-white/80 text-sm">{step.subtitle}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 min-h-96 relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
              >
                {/* Description */}
                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                  {step.description}
                </p>

                {/* Highlights (Welcome step) */}
                {step.highlights && (
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {step.highlights.map((highlight, idx) => {
                      const HighlightIcon = highlight.icon;
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg"
                        >
                          <HighlightIcon className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium text-gray-700 text-center">
                            {highlight.text}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Features */}
                {step.features && (
                  <div className="space-y-4 mb-8">
                    {step.features.map((feature, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {feature.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {feature.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Steps */}
                {step.steps && (
                  <div className="space-y-4 mb-8">
                    {step.steps.map((stepItem, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex gap-4 p-4 bg-linear-to-r from-gray-50 to-transparent rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-linear-to-br from-blue-600 to-blue-400 text-white font-bold shrink-0">
                          {stepItem.number}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {stepItem.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {stepItem.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* CTA Section */}
                {step.cta && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200 text-center"
                  >
                    <Lightbulb className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <p className="text-gray-700 mb-4">
                      You now understand how X-Ramp works. Let's create your keyless wallet and start your crypto journey.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 flex items-center justify-between border-t">
            {/* Progress Indicator */}
            <div className="flex items-center gap-2">
              {TUTORIAL_STEPS.map((_, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => {
                    setDirection(idx > currentStep ? 1 : -1);
                    setCurrentStep(idx);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentStep
                      ? 'bg-blue-600 w-8'
                      : 'bg-gray-300 w-2 hover:bg-gray-400'
                  }`}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {currentStep === TUTORIAL_STEPS.length - 1 ? (
                <button
                  onClick={handleGetStarted}
                  className="px-6 py-2 bg-linear-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-linear-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
