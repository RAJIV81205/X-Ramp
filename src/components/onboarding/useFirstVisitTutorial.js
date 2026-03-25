'use client';

import { useEffect, useState } from 'react';

const FIRST_VISIT_KEY = 'x-ramp-first-visit-tutorial-shown';

export function useFirstVisitTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has seen the tutorial before
    const hasSeenTutorial = localStorage.getItem(FIRST_VISIT_KEY);
    
    if (!hasSeenTutorial) {
      // Show tutorial on first visit
      setShowTutorial(true);
      // Mark as seen
      localStorage.setItem(FIRST_VISIT_KEY, 'true');
    }
    
    setIsLoading(false);
  }, []);

  const closeTutorial = () => {
    setShowTutorial(false);
  };

  const resetTutorial = () => {
    localStorage.removeItem(FIRST_VISIT_KEY);
    setShowTutorial(true);
  };

  return {
    showTutorial,
    closeTutorial,
    resetTutorial,
    isLoading
  };
}
