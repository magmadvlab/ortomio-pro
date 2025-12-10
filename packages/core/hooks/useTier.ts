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
  can: (feature: keyof TierConfig['features']) => boolean;
  limit: <K extends keyof TierConfig['limits']>(limitKey: K) => number;
  checkLimit: <K extends keyof TierConfig['limits']>(
    limitKey: K,
    currentValue: number
  ) => { allowed: boolean; remaining: number };
  setTier: (tier: AppTier) => void;
}

export const useTier = (): UseTierReturn => {
  const context = useContext(TierContext);
  
  if (!context) {
    throw new Error('useTier must be used within a TierProvider');
  }

  const { tier, setTier } = context;
  const config = getTierConfig(tier);

  const can = (feature: keyof TierConfig['features']): boolean => {
    return config.features[feature] === true;
  };

  const limit = <K extends keyof TierConfig['limits']>(limitKey: K): number => {
    return config.limits[limitKey];
  };

  const checkLimit = <K extends keyof TierConfig['limits']>(
    limitKey: K,
    currentValue: number
  ): { allowed: boolean; remaining: number } => {
    const maxValue = config.limits[limitKey];
    
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

  return {
    tier,
    config,
    isPro: tier === AppTier.PRO,
    isFree: tier === AppTier.FREE,
    can,
    limit,
    checkLimit,
    setTier,
  };
};

