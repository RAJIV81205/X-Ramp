import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import { LandingPageClient } from '@/components/landing/LandingPageClient';

export const dynamic = 'force-dynamic';

const emptyMetrics = {
  totalUsers: 0,
  verifiedUsers: 0,
  totalTransactions: 0,
  completedTransactions: 0,
  totalXlmVolume: 0,
  totalInrVolume: 0,
  zkProtectedTransactions: 0,
  successRate: 0
};

async function getLandingMetrics() {
  try {
    await connectDB();

    const [
      totalUsers,
      verifiedUsers,
      totalTransactions,
      completedTransactions,
      zkProtectedTransactions,
      volumeStats
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ verified: true }),
      Transaction.countDocuments({}),
      Transaction.countDocuments({ status: 'completed' }),
      Transaction.countDocuments({ zkProofUsed: true }),
      Transaction.aggregate([
        {
          $group: {
            _id: null,
            totalXlmVolume: {
              $sum: {
                $convert: {
                  input: '$amount',
                  to: 'double',
                  onError: 0,
                  onNull: 0
                }
              }
            },
            totalInrVolume: {
              $sum: {
                $convert: {
                  input: '$inrAmount',
                  to: 'double',
                  onError: 0,
                  onNull: 0
                }
              }
            }
          }
        }
      ])
    ]);

    const totals = volumeStats[0] || {};
    const successRate = totalTransactions > 0
      ? (completedTransactions / totalTransactions) * 100
      : 0;

    return {
      totalUsers,
      verifiedUsers,
      totalTransactions,
      completedTransactions,
      totalXlmVolume: totals.totalXlmVolume || 0,
      totalInrVolume: totals.totalInrVolume || 0,
      zkProtectedTransactions,
      successRate
    };
  } catch (error) {
    console.error('Failed to load landing metrics:', error);
    return emptyMetrics;
  }
}

export default async function Home() {
  const metrics = await getLandingMetrics();
  return <LandingPageClient metrics={metrics} />;
}
