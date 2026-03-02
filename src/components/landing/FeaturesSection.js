'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Fingerprint, Zap, Lock, Database } from 'lucide-react';
import { WalletVisual, RampVisual, SorobanVisual, ComplianceVisual, FeatureSkeleton } from './FeatureVisuals';

const features = [
  {
    title: "Keyless ZK Wallet",
    description: "Eliminates traditional seed phrases. Onboard using only email or phone. secure mapping via Poseidon hashes.",
    icon: Fingerprint,
    category: "Security",
    visual: WalletVisual
  },
  {
    title: "Trustless Fiat Ramps",
    description: "Bridges bank transfers and crypto using zk-SNARKs (Groth16). Verifies fiat movement through signed anchor attestations.",
    icon: Zap,
    category: "Infrastructure",
    visual: RampVisual
  },
  {
    title: "Soroban Verification",
    description: "Custom xramp-vault contract on Stellar Soroban network verifies ZK proofs on BN254 curve for automated settlement.",
    icon: Database,
    category: "Smart Contracts",
    visual: SorobanVisual
  },
  {
    title: "Privacy Compliance",
    description: "Attribute-based ZK proofs for compliance requirements without revealing PII on-chain. Zero compromises.",
    icon: Lock,
    category: "Privacy",
    visual: ComplianceVisual
  }
];

export const FeaturesSection = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 md:flex md:items-end md:justify-between ">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Core Infrastructure</h2>
            <p className="text-gray-500 text-lg">
              Built on advanced cryptography for a seamless, secure, and private financial experience.
            </p>
          </div>
        </div>

        {/* Grid Layout with Borders */}
        <div className="grid md:grid-cols-2 border-t border-l border-gray-200">
          <AnimatePresence mode="wait">
            {loading ? (
              // Skeleton Loading State
              <>
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={`skeleton-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-r border-b border-gray-200"
                  >
                    <FeatureSkeleton />
                  </motion.div>
                ))}
              </>
            ) : (
              // Actual Content
              features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover="hover"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative p-8 border-r border-b border-gray-200 bg-white hover:bg-gray-50/50 transition-colors"
                >
                  {/* Feature Visual */}
                  {feature.visual && (
                    <div className="mb-6">
                      <feature.visual />
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-6">
                    <span className="inline-flex items-center justify-center p-2 bg-gray-100 text-gray-400 rounded-sm group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      <feature.icon className="w-6 h-6" />
                    </span>
                    <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded-sm border border-gray-100">
                      {feature.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};