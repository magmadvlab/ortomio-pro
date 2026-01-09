/**
 * Tier Context Provider
 * OrtoMio PRO - Always PRO tier
 */

import React, { createContext, ReactNode } from 'react';
import { AppTier } from '../config/tiers';

interface TierContextType {
  tier: AppTier;
  setTier: (tier: AppTier) => void;
  isPlus: () => boolean;
  isPro: () => boolean;
}

const TierContext = createContext<TierContextType | undefined>(undefined);

interface TierProviderProps {
  children: ReactNode;
  defaultTier?: AppTier;
}

export const TierProvider: React.FC<TierProviderProps> = ({
  children,
}) => {
  // Always PRO - this is a PRO-only app
  const tier = AppTier.PRO;

  const setTier = (_newTier: AppTier) => {
    // No-op - always PRO
  };

  const isPlus = () => true; // PRO includes all PLUS features
  const isPro = () => true;

  return (
    <TierContext.Provider value={{ tier, setTier, isPlus, isPro }}>
      {children}
    </TierContext.Provider>
  );
};

export { TierContext };
