/**
 * Tier Context Provider
 * Manages app tier state (Free/Pro) and provides it to all components
 * Loads tier from database when user is authenticated
 */

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AppTier } from '../config/tiers';
import { getSupabaseClient } from '@/config/supabase';

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

  // Load tier from database when user is authenticated
  useEffect(() => {
    const loadTierFromDatabase = async () => {
      try {
        const supabase = getSupabaseClient();
        if (!supabase) return;

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        // Load tier from profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('tier')
          .eq('id', session.user.id)
          .single();

        if (error) {
          // Profile might not exist yet, that's ok
          console.log('Profile not found, using default tier');
          return;
        }

        if (profile?.tier) {
          // Map database tier to AppTier enum
          const dbTier = profile.tier as string;
          let appTier: AppTier;
          
          switch (dbTier) {
            case 'PRO_CONSUMER':
              appTier = AppTier.PRO_CONSUMER;
              break;
            case 'PRO_PROFESSIONAL':
              appTier = AppTier.PRO_PROFESSIONAL;
              break;
            case 'PRO':
              appTier = AppTier.PRO; // Legacy
              break;
            default:
              appTier = AppTier.FREE;
          }

          setTierState(appTier);
          // Also save to localStorage for offline access
          if (typeof window !== 'undefined') {
            localStorage.setItem(TIER_STORAGE_KEY, appTier);
          }
        }
      } catch (error) {
        console.error('Error loading tier from database:', error);
      }
    };

    loadTierFromDatabase();

    // Listen for auth state changes
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          loadTierFromDatabase();
        } else if (event === 'SIGNED_OUT') {
          // Reset to default tier on logout
          setTierState(defaultTier);
          if (typeof window !== 'undefined') {
            localStorage.removeItem(TIER_STORAGE_KEY);
          }
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [defaultTier]);

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

