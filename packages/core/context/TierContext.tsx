/**
 * Tier Context Provider
 * Manages app tier state (Free/Pro) and provides it to all components
 */

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AppTier } from '../config/tiers';

interface TierContextType {
  tier: AppTier;
  setTier: (tier: AppTier) => void;
  isConsumer: () => boolean;
  isProfessional: () => boolean;
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
    // Durante SSR, usa sempre defaultTier
    if (typeof window === 'undefined') {
      return defaultTier;
    }
    
    // LOCALE: Forza PRO_PROFESSIONAL in sviluppo locale
    const isLocalDev = window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      process.env.NODE_ENV === 'development'
    
    if (isLocalDev) {
      // In locale, forza sempre PRO_PROFESSIONAL (il tier più completo)
      return AppTier.PRO_PROFESSIONAL;
    }
    
    // Load from localStorage on mount (solo in produzione, solo nel browser)
    try {
      const saved = localStorage.getItem(TIER_STORAGE_KEY);
      if (saved && (
        saved === AppTier.FREE || 
        saved === AppTier.PRO || 
        saved === AppTier.PRO_CONSUMER || 
        saved === AppTier.PRO_PROFESSIONAL
      )) {
        return saved as AppTier;
      }
    } catch (e) {
      console.error('Error loading tier from localStorage', e);
    }
    return defaultTier;
  });

  // Persist to localStorage when tier changes (solo nel browser)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(TIER_STORAGE_KEY, tier);
    } catch (e) {
      console.error('Error saving tier to localStorage', e);
    }
  }, [tier]);

  const setTier = (newTier: AppTier) => {
    setTierState(newTier);
  };

  const isConsumer = () => {
    return tier === AppTier.PRO_CONSUMER || tier === AppTier.PRO; // Legacy PRO is treated as Consumer
  };

  const isProfessional = () => {
    return tier === AppTier.PRO_PROFESSIONAL;
  };

  return (
    <TierContext.Provider value={{ tier, setTier, isConsumer, isProfessional }}>
      {children}
    </TierContext.Provider>
  );
};

export { TierContext };

