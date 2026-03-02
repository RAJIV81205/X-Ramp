'use client';

import { motion } from 'motion/react';
import { Fingerprint, CheckCircle } from 'lucide-react';

export const WalletVisual = () => (
  <div className="h-32 w-full bg-gray-50/50 rounded-sm border border-gray-100 relative overflow-hidden flex items-center justify-center p-4 mb-6 group-hover:bg-blue-50/10 transition-colors">
    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:8px_8px] opacity-50" />

    <motion.div
      className="relative w-32 h-20 bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden flex items-center gap-3 p-3"
      variants={{
        hover: { y: -2, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.05)" }
      }}
    >
      <div className="w-10 h-10 rounded-sm bg-gray-100 flex items-center justify-center">
        <Fingerprint className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
      </div>
      <div className="space-y-2 flex-1">
        <div className="w-12 h-2 bg-gray-100 rounded-sm" />
        <div className="w-16 h-2 bg-gray-100 rounded-sm" />
      </div>

      {/* Auth Indicator */}
      <motion.div
        className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gray-200"
        variants={{
          hover: { backgroundColor: "#3b82f6" }
        }}
      />

      {/* Scanning Beam */}
      <motion.div
        className="absolute top-0 bottom-0 w-[2px] bg-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.5)] z-10"
        style={{ left: 0 }}
        variants={{
          hover: { left: ["0%", "100%", "0%"], opacity: 1 },
          initial: { left: "0%", opacity: 0 }
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  </div>
);

export const RampVisual = () => (
  <div className="h-32 w-full bg-gray-50/50 rounded-sm border border-gray-100 relative overflow-hidden flex items-center justify-center p-4 mb-6 group-hover:bg-blue-50/10 transition-colors">
    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(229,231,235,0.5)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]" />

    <div className="flex items-center gap-4 relative z-10">
      {/* Fiat Card */}
      <motion.div
        className="w-12 h-16 bg-white border border-gray-200 rounded-sm shadow-sm flex flex-col items-center justify-center gap-1"
        variants={{
          hover: { x: 10, opacity: 0 }
        }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1.5 }}
      >
        <span className="text-xs font-bold text-gray-400">$</span>
      </motion.div>

      {/* Arrow/Process */}
      <motion.div
        className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-3 h-3 border-t-2 border-r-2 border-blue-600 rounded-full" />
      </motion.div>

      {/* Crypto Card */}
      <motion.div
        className="w-12 h-16 bg-gray-900 border border-gray-800 rounded-sm shadow-sm flex flex-col items-center justify-center gap-1"
        variants={{
          hover: { x: -10, scale: [0.9, 1.1, 1] }
        }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1.5, delay: 0.25 }}
      >
        <div className="text-xs font-bold text-white">Z</div>
      </motion.div>
    </div>
  </div>
);

export const SorobanVisual = () => (
  <div className="h-32 w-full bg-gray-50/50 rounded-sm border border-gray-100 relative overflow-hidden flex items-center justify-center p-4 mb-6 group-hover:bg-blue-50/10 transition-colors">
    <div className="w-full max-w-[180px] bg-white border border-gray-200 rounded-sm p-3 shadow-sm space-y-2">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] uppercase font-mono text-gray-400">Smart Contract</span>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="h-1.5 rounded-full bg-gray-100"
          variants={{
            hover: { width: ["100%", "60%", "100%"], backgroundColor: ["#f3f4f6", "#dbeafe", "#f3f4f6"] }
          }}
          transition={{ delay: i * 0.1, duration: 1.5, repeat: Infinity }}
        />
      ))}
      <motion.div
        className="mt-2 text-[10px] font-mono text-blue-600 bg-blue-50 p-1 rounded-sm text-center"
        variants={{
          hover: { opacity: [0.5, 1, 0.5] }
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Verifying Proof...
      </motion.div>
    </div>
  </div>
);

export const ComplianceVisual = () => (
  <div className="h-32 w-full bg-gray-50/50 rounded-sm border border-gray-100 relative overflow-hidden flex items-center justify-center p-4 mb-6 group-hover:bg-blue-50/10 transition-colors">
    <div className="relative w-32 h-20">
      {/* Background Matrix */}
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-1">
        {[...Array(24)].map((_, i) => (
          <motion.div
            key={i}
            className="rounded-[1px] bg-gray-200"
            variants={{
              hover: {
                opacity: [0.3, 1, 0.3],
                scale: [1, 0.8, 1],
                backgroundColor: Math.random() > 0.7 ? "#93c5fd" : "#e5e7eb"
              }
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Shield Reveal */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        variants={{
          hover: { opacity: 1, scale: 1 }
        }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-12 h-12 bg-white/90 backdrop-blur-sm border border-blue-100 shadow-lg rounded-full flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-blue-600" />
        </div>
      </motion.div>
    </div>
  </div>
);

export const FeatureSkeleton = () => (
  <div className="h-full p-6 space-y-4 relative overflow-hidden bg-white">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50 to-transparent skew-x-12 animate-shimmer" />
    <div className="w-full h-32 bg-gray-100 rounded-sm animate-pulse mb-6" />
    <div className="flex items-start justify-between">
      <div className="w-10 h-10 bg-gray-100 rounded-md animate-pulse" />
      <div className="h-4 w-16 bg-gray-100 rounded-sm animate-pulse" />
    </div>
    <div className="space-y-3 pt-4">
      <div className="h-5 w-3/4 bg-gray-100 rounded-sm animate-pulse" />
      <div className="h-4 w-full bg-gray-100 rounded-sm animate-pulse" />
      <div className="h-4 w-5/6 bg-gray-100 rounded-sm animate-pulse" />
    </div>
  </div>
);