'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { Navbar } from '../components/landing/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { CTASection } from '../components/landing/CTASection';
import { Footer } from '../components/landing/Footer';
import { OnboardingTutorial } from '../components/onboarding/OnboardingTutorial';
import { useFirstVisitTutorial } from '../components/onboarding/useFirstVisitTutorial';

export default function Home() {
  const [authMode, setAuthMode] = useState(null);
  const { showTutorial, closeTutorial, isLoading } = useFirstVisitTutorial();

  if (authMode) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen bg-dot-pattern flex items-center justify-center p-4 bg-gray-50"
        >
          <div className="w-full max-w-md relative">
            <motion.button
              layout
              onClick={() => setAuthMode(null)}
              className="absolute -top-12 left-0 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2 group"
            >
              <ArrowRight className="rotate-180 w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to home
            </motion.button>
            <div className="bg-white shadow-xl shadow-gray-200/50 border border-gray-200 rounded-lg overflow-hidden">
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
    <div className="min-h-screen bg-white">
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
      <FeaturesSection />
      <CTASection onRegister={() => setAuthMode('register')} />
      <Footer />
    </div>
  );
}
