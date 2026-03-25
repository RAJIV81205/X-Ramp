'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { HelpCircle } from 'lucide-react';
import { OnboardingTutorial } from './OnboardingTutorial';

export function HelpButton() {
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowTutorial(true)}
        className="fixed bottom-6 right-6 p-3 bg-linear-to-br from-blue-600 to-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow z-40"
        title="Learn how X-Ramp works"
      >
        <HelpCircle className="w-6 h-6" />
      </motion.button>

      {showTutorial && (
        <OnboardingTutorial 
          onClose={() => setShowTutorial(false)}
        />
      )}
    </>
  );
}
