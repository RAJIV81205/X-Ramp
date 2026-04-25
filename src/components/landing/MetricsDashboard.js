'use client';

import { motion } from 'motion/react';
import { CheckCircle2, Database, IndianRupee, ShieldCheck, Users, Wallet } from 'lucide-react';

const cardConfig = [
  {
    key: 'totalUsers',
    title: 'Total Users',
    icon: Users,
    kind: 'number'
  },
  {
    key: 'verifiedUsers',
    title: 'Verified Users',
    icon: ShieldCheck,
    kind: 'number'
  },
  {
    key: 'totalTransactions',
    title: 'Total Transactions',
    icon: Database,
    kind: 'number'
  },
  {
    key: 'completedTransactions',
    title: 'Completed Transactions',
    icon: CheckCircle2,
    kind: 'number'
  },
  {
    key: 'totalXlmVolume',
    title: 'XLM Volume',
    icon: Wallet,
    kind: 'xlm'
  },
  {
    key: 'totalInrVolume',
    title: 'INR Volume',
    icon: IndianRupee,
    kind: 'inr'
  }
];

const formatByKind = (value, kind) => {
  const safeValue = Number.isFinite(value) ? value : 0;

  if (kind === 'inr') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(safeValue);
  }

  if (kind === 'xlm') {
    return `${new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2
    }).format(safeValue)} XLM`;
  }

  return new Intl.NumberFormat('en-US').format(Math.round(safeValue));
};

export function MetricsDashboard({ metrics }) {
  return (
    <section className="py-18 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <p className="text-xs font-mono tracking-[0.2em] text-gray-500 uppercase mb-2">
            Live Database Metrics
          </p>
          <h2 className="text-3xl font-bold text-gray-900">
            Platform Health at a Glance
          </h2>
          <p className="text-gray-500 mt-3 max-w-2xl">
            Metrics are loaded directly from MongoDB on each page request.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 border-t border-l border-gray-200 bg-white">
          {cardConfig.map((card, index) => {
            const Icon = card.icon;
            const value = metrics?.[card.key] ?? 0;

            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07 }}
                className="border-r border-b border-gray-200 p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-medium text-gray-500">{card.title}</span>
                  <span className="inline-flex p-2 rounded-md bg-blue-50 text-blue-600">
                    <Icon className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {formatByKind(value, card.kind)}
                </p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 p-4 border border-gray-200 bg-gray-50 rounded-sm flex flex-wrap items-center gap-6">
          <p className="text-sm text-gray-600">
            Success Rate: <span className="font-semibold text-gray-900">{(metrics?.successRate || 0).toFixed(1)}%</span>
          </p>
          <p className="text-sm text-gray-600">
            ZK Protected Transactions: <span className="font-semibold text-gray-900">{new Intl.NumberFormat('en-US').format(metrics?.zkProtectedTransactions || 0)}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
