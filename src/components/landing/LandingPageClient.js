'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { LoginForm } from '../auth/LoginForm';
import { RegisterForm } from '../auth/RegisterForm';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { CTASection } from './CTASection';
import { Footer } from './Footer';
import { MetricsDashboard } from './MetricsDashboard';
import { OnboardingTutorial } from '../onboarding/OnboardingTutorial';
import { useFirstVisitTutorial } from '../onboarding/useFirstVisitTutorial';
import { useExperience } from '../preferences/ExperienceProvider';

export function LandingPageClient({ metrics }) {
  const [authMode, setAuthMode] = useState(null);
  const { showTutorial, closeTutorial, isLoading } = useFirstVisitTutorial();
  const { t } = useExperience();

  if (authMode) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen bg-dot-pattern flex items-center justify-center p-4 bg-[var(--background)]"
        >
          <div className="w-full max-w-md relative">
            <motion.button
              layout
              onClick={() => setAuthMode(null)}
              className="absolute -top-12 left-0 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors flex items-center gap-2 group"
            >
              <ArrowRight className="rotate-180 w-4 h-4 transition-transform group-hover:-translate-x-1" /> {t('common.backToHome')}
            </motion.button>
            <div className="bg-[var(--card-background)] shadow-xl shadow-gray-200/50 border border-[var(--border-color)] rounded-lg overflow-hidden">
              {authMode === 'login' && (
                <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
              )}
              {authMode === 'register' && (
                <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {!isLoading && showTutorial && (
        <OnboardingTutorial
          onClose={closeTutorial}
          onGetStarted={() => setAuthMode('register')}
        />
      )}
      <Navbar
        onLogin={() => setAuthMode('login')}
        onRegister={() => setAuthMode('register')}
      />
      <HeroSection onRegister={() => setAuthMode('register')} />
      <MetricsDashboard metrics={metrics} />
      <FeaturesSection />
      <CTASection onRegister={() => setAuthMode('register')} />
      <Footer />
    </div>
  );
}
