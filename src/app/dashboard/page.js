'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Minus, Send, LogOut, User, IndianRupee, Zap } from 'lucide-react';
import { useAuth } from '../../components/auth/AuthProvider';
import { useExperience } from '../../components/preferences/ExperienceProvider';
import { WalletProvider, useWallet } from '../../components/wallet/WalletProvider';
import { BalanceCard } from '../../components/wallet/BalanceCard';
import { TransactionHistory } from '../../components/wallet/TransactionHistory';
import { WalletInsights } from '../../components/dashboard/WalletInsights';
import { NotificationPreferences } from '../../components/dashboard/NotificationPreferences';
import { DepositModal } from '../../components/wallet/DepositModal';
import { WithdrawModal } from '../../components/wallet/WithdrawModal';
import { TransferModal } from '../../components/wallet/TransferModal';
import { INRTransferModal } from '../../components/wallet/INRTransferModal';
import { SponsoredTransferModal } from '../../components/wallet/SponsoredTransferModal';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { HelpButton } from '../../components/onboarding/HelpButton';
import { PreferenceControls } from '../../components/preferences/PreferenceControls';

function DashboardContent() {
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [inrTransferModalOpen, setInrTransferModalOpen] = useState(false);
  const [sponsoredTransferModalOpen, setSponsoredTransferModalOpen] = useState(false);
  
  const { user, logout } = useAuth();
  const { t } = useExperience();
  const { loadWalletData } = useWallet();

  const handleTransferComplete = () => {
    // Refresh wallet data after successful transfer
    if (loadWalletData) {
      loadWalletData();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border-color)] bg-[var(--card-background)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Image src="/xramp-logo.png" width={100} height={50} alt="logo" />

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <PreferenceControls compact />
              <div className="flex items-center space-x-2 text-sm text-zinc-800">
                <User className="h-4 w-4" />
                <span className="max-w-[180px] truncate sm:max-w-none">{user?.email}</span>
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
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {t('dashboard.welcome')}
          </h1>
          <p className="text-zinc-800">
            {t('dashboard.subtitle')}
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
                <CardTitle className="text-zinc-950">{t('dashboard.quickActions')}</CardTitle>
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

                <Button
                  variant="outline"
                  className="w-full justify-start bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                  onClick={() => setSponsoredTransferModalOpen(true)}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Gasless Transfer ✨
                </Button>
              </CardContent>
            </Card>

            {/* Wallet Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-zinc-950">{t('dashboard.walletInfo')}</CardTitle>
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

            <NotificationPreferences />
          </div>

          {/* Right Column - Transaction History */}
          <div className="lg:col-span-2 space-y-6">
            <WalletInsights />
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

      <SponsoredTransferModal
        isOpen={sponsoredTransferModalOpen}
        onClose={() => setSponsoredTransferModalOpen(false)}
      />
    </div>
  );
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const { t } = useExperience();
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
          <p className="text-zinc-800">{t('common.loadingWallet')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-800">{t('common.redirecting')}</p>
        </div>
      </div>
    );
  }

  return (
    <WalletProvider>
      <DashboardContent />
      <HelpButton />
    </WalletProvider>
  );
}
