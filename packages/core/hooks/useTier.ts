/**
 * React Hook for Tier Management
 * Provides access to tier configuration and helper methods
 */

import { useContext } from 'react';
import { TierContext } from '../context/TierContext';
import { AppTier, TierConfig, getTierConfig } from '../config/tiers';

export interface UseTierReturn {
  tier: AppTier;
  config: TierConfig;
  isPro: boolean;
  isFree: boolean;
  isPlus: boolean;
  can: (feature: keyof TierConfig['features']) => boolean;
  limit: <K extends keyof TierConfig['limits']>(limitKey: K) => number;
  checkLimit: <K extends keyof TierConfig['limits']>(
    limitKey: K,
    currentValue: number
  ) => { allowed: boolean; remaining: number };
  hasFeature: (feature: string) => boolean;
  setTier: (tier: AppTier) => void;
}

export const useTier = (): UseTierReturn => {
  const context = useContext(TierContext);
  
  if (!context) {
    throw new Error('useTier must be used within a TierProvider');
  }

  const { tier, setTier, isPlus: contextIsPlus, isPro: contextIsPro } = context;
  const config = getTierConfig(tier);

  const can = (feature: keyof TierConfig['features']): boolean => {
    // LOCALE: Bypassa controlli in sviluppo locale
    const isLocalDev = typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      process.env.NODE_ENV === 'development'
    );
    if (isLocalDev) {
      return true; // Permetti sempre accesso in locale
    }
    return config.features[feature] === true;
  };

  const limit = <K extends keyof TierConfig['limits']>(limitKey: K): number => {
    return config.limits[limitKey] ?? -1;
  };

  const checkLimit = <K extends keyof TierConfig['limits']>(
    limitKey: K,
    currentValue: number
  ): { allowed: boolean; remaining: number } => {
    // LOCALE: Bypassa limiti in sviluppo locale
    const isLocalDev = typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      process.env.NODE_ENV === 'development'
    );
    if (isLocalDev) {
      return { allowed: true, remaining: -1 }; // Illimitato in locale
    }
    
    const maxValue = config.limits[limitKey] ?? -1;
    
    // -1 means unlimited
    if (maxValue === -1) {
      return { allowed: true, remaining: -1 };
    }
    
    const remaining = maxValue - currentValue;
    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining),
    };
  };

  const hasFeature = (feature: string): boolean => {
    // LOCALE: Bypassa controlli in sviluppo locale
    const isLocalDev = typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      process.env.NODE_ENV === 'development'
    );
    if (isLocalDev) {
      return true; // Permetti sempre accesso in locale
    }
    // Check if feature exists in config
    if (feature in config.features) {
      return config.features[feature as keyof TierConfig['features']] === true;
    }
    return false;
  };

  return {
    tier,
    config,
    isPro: tier === AppTier.PRO || tier === AppTier.PLUS,
    isFree: tier === AppTier.FREE,
    isPlus: contextIsPlus(),
    can,
    limit,
    checkLimit,
    hasFeature,
    setTier,
  };
};

