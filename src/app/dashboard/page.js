'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image"
import { Plus, Minus, Send, LogOut, User, IndianRupee } from 'lucide-react';
import { useAuth } from '../../components/auth/AuthProvider';
import { WalletProvider, useWallet } from '../../components/wallet/WalletProvider';
import { BalanceCard } from '../../components/wallet/BalanceCard';
import { TransactionHistory } from '../../components/wallet/TransactionHistory';
import { DepositModal } from '../../components/wallet/DepositModal';
import { WithdrawModal } from '../../components/wallet/WithdrawModal';
import { TransferModal } from '../../components/wallet/TransferModal';
import { INRTransferModal } from '../../components/wallet/INRTransferModal';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

function DashboardContent() {
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [inrTransferModalOpen, setInrTransferModalOpen] = useState(false);
  
  const { user, logout } = useAuth();
  const { stellarBalance, loadWalletData } = useWallet();

  const handleTransferComplete = () => {
    // Refresh wallet data after successful transfer
    if (loadWalletData) {
      loadWalletData();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Image src="/xramp-logo.png" width={100} height={50} alt='logo' />

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-zinc-800">
                <User className="h-4 w-4" />
                <span>{user?.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-zinc-800"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back!
          </h1>
          <p className="text-zinc-800">
            Manage your keyless crypto wallet with zero-knowledge privacy.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Balance and Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Balance Card */}
            <BalanceCard />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-zinc-950">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  onClick={() => setDepositModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Deposit Funds
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setWithdrawModalOpen(true)}
                >
                  <Minus className="h-4 w-4 mr-2" />
                  Withdraw Funds
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setTransferModalOpen(true)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send XLM
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                  onClick={() => setInrTransferModalOpen(true)}
                >
                  <IndianRupee className="h-4 w-4 mr-2" />
                  INR → XLM Exchange
                </Button>
              </CardContent>
            </Card>

            {/* Wallet Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-zinc-950">Wallet Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-zinc-500">
                <div>
                  <p className="text-sm text-zinc-800">Wallet Type</p>
                  <p className="font-medium">Keyless ZK Wallet</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-800">Network</p>
                  <p className="font-medium">Stellar Testnet</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-800">Security</p>
                  <p className="font-medium text-green-600">Zero-Knowledge Protected</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Transaction History */}
          <div className="lg:col-span-2">
            <TransactionHistory />
          </div>
        </div>
      </main>

      {/* Modals */}
      <DepositModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
      />
      
      <WithdrawModal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
      />
      
      <TransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
      />

      <INRTransferModal
        isOpen={inrTransferModalOpen}
        onClose={() => setInrTransferModalOpen(false)}
        onTransferComplete={handleTransferComplete}
      />
    </div>
  );
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-zinc-800">Loading your wallet...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-800">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <WalletProvider>
      <DashboardContent />
    </WalletProvider>
  );
}