/**
 * React Hook for Tier Management
 * OrtoMio PRO - Always returns PRO tier
 */

import { useContext, useCallback, useMemo } from 'react';
import { TierContext } from '../context/TierContext';
import { AppTier, TierConfig, getTierConfig, PRO_TIER } from '../config/tiers';

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
  
  // Always use PRO tier
  const tier = AppTier.PRO;
  const config = PRO_TIER;

  // All features are always enabled in PRO
  const can = useCallback((_feature: keyof TierConfig['features']): boolean => {
    return true;
  }, []);

  // All limits are unlimited in PRO
  const limit = useCallback(<K extends keyof TierConfig['limits']>(_limitKey: K): number => {
    return -1; // Unlimited
  }, []);

  // All limits are unlimited in PRO
  const checkLimit = useCallback(<K extends keyof TierConfig['limits']>(
    _limitKey: K,
    _currentValue: number
  ): { allowed: boolean; remaining: number } => {
    return { allowed: true, remaining: -1 }; // Always allowed, unlimited
  }, []);

  // All features are always enabled in PRO
  const hasFeature = useCallback((_feature: string): boolean => {
    return true;
  }, []);

  // setTier is a no-op since we're always PRO
  const setTier = useCallback((_tier: AppTier): void => {
    // No-op - always PRO
  }, []);

  return useMemo(() => ({
    tier,
    config,
    isPro: true,
    isFree: false,
    isPlus: true, // PRO includes all PLUS features
    can,
    limit,
    checkLimit,
    hasFeature,
    setTier,
  }), [tier, config, can, limit, checkLimit, hasFeature, setTier]);
};
