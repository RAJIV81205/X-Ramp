'use client';

import { useEffect, useState } from 'react';

const FIRST_VISIT_KEY = 'x-ramp-first-visit-tutorial-shown';

export function useFirstVisitTutorial() {
  const [showTutorial, setShowTutorial] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem(FIRST_VISIT_KEY);
  });
  const isLoading = typeof window === 'undefined';

  useEffect(() => {
    if (showTutorial && typeof window !== 'undefined') {
      localStorage.setItem(FIRST_VISIT_KEY, 'true');
    }
  }, [showTutorial]);

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
