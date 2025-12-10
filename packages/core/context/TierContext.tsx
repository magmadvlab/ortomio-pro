/**
 * Tier Context Provider
 * Manages app tier state (Free/Pro) and provides it to all components
 */

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AppTier } from '../config/tiers';

interface TierContextType {
  tier: AppTier;
  setTier: (tier: AppTier) => void;
}

const TierContext = createContext<TierContextType | undefined>(undefined);

const TIER_STORAGE_KEY = 'ortomio_tier';

interface TierProviderProps {
  children: ReactNode;
  defaultTier?: AppTier;
}

export const TierProvider: React.FC<TierProviderProps> = ({
  children,
  defaultTier = AppTier.FREE,
}) => {
  const [tier, setTierState] = useState<AppTier>(() => {
    // Load from localStorage on mount
    try {
      const saved = localStorage.getItem(TIER_STORAGE_KEY);
      if (saved && (saved === AppTier.FREE || saved === AppTier.PRO)) {
        return saved as AppTier;
      }
    } catch (e) {
      console.error('Error loading tier from localStorage', e);
    }
    return defaultTier;
  });

  // Persist to localStorage when tier changes
  useEffect(() => {
    try {
      localStorage.setItem(TIER_STORAGE_KEY, tier);
    } catch (e) {
      console.error('Error saving tier to localStorage', e);
    }
  }, [tier]);

  const setTier = (newTier: AppTier) => {
    setTierState(newTier);
  };

  return (
    <TierContext.Provider value={{ tier, setTier }}>
      {children}
    </TierContext.Provider>
  );
};

export { TierContext };

