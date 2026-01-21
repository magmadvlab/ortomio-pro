'use client';

import { useState, useEffect } from 'react';
import { guidesService, type TourStep } from '@/services/guidesService';

export function useOnboarding() {
  const [showTour, setShowTour] = useState(false);
  const [tourSteps, setTourSteps] = useState<TourStep[]>([]);

  useEffect(() => {
    // Check if onboarding should be shown
    const shouldShow = !guidesService.hasCompletedOnboarding();
    
    if (shouldShow) {
      // Load tour steps
      const steps = guidesService.getOnboardingTour();
      setTourSteps(steps);
      
      // Show tour after a short delay
      setTimeout(() => {
        setShowTour(true);
      }, 1000);
    }
  }, []);

  const completeTour = () => {
    guidesService.completeOnboarding();
    setShowTour(false);
  };

  const skipTour = () => {
    guidesService.completeOnboarding();
    setShowTour(false);
  };

  const restartTour = () => {
    guidesService.resetOnboarding();
    const steps = guidesService.getOnboardingTour();
    setTourSteps(steps);
    setShowTour(true);
  };

  return {
    showTour,
    tourSteps,
    completeTour,
    skipTour,
    restartTour
  };
}
