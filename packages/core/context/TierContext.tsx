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
  isPlus: () => boolean;
  isPro: () => boolean;
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
    
    // LOCALE: Forza PRO in sviluppo locale
    const isLocalDev = window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      process.env.NODE_ENV === 'development'
    
    if (isLocalDev) {
      // In locale, forza sempre PRO (il tier più completo)
      return AppTier.PRO;
    }
    
    // Load from localStorage on mount (solo in produzione, solo nel browser)
    try {
      const saved = localStorage.getItem(TIER_STORAGE_KEY);
      if (saved && (
        saved === AppTier.FREE || 
        saved === AppTier.PLUS || 
        saved === AppTier.PRO ||
        // Legacy tier support (backward compatibility)
        saved === 'PRO_CONSUMER' ||
        saved === 'PRO_PROFESSIONAL'
      )) {
        // Map legacy tiers to new ones
        if (saved === 'PRO_CONSUMER') return AppTier.PLUS;
        if (saved === 'PRO_PROFESSIONAL') return AppTier.PRO;
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

        // FASE DI TEST: Forza PRO per tutti gli utenti autenticati online
        // TODO: Rimuovere questa logica quando si passa a produzione reale
        const FORCE_PRO_IN_TEST = process.env.NEXT_PUBLIC_FORCE_PRO_TEST === 'true' || 
                                  process.env.NODE_ENV !== 'production';
        
        if (FORCE_PRO_IN_TEST) {
          // Aggiorna il tier nel database per mantenere consistenza
          const { data: profile } = await supabase
            .from('profiles')
            .select('tier')
            .eq('id', session.user.id)
            .single();

          // Se il tier nel database non è PRO, aggiornalo
          if (!profile || profile.tier !== 'PRO') {
            await supabase
              .from('profiles')
              .upsert({
                id: session.user.id,
                tier: 'PRO',
              }, {
                onConflict: 'id',
              });
          }

          // Forza sempre PRO in fase di test
          setTierState(AppTier.PRO);
          if (typeof window !== 'undefined') {
            localStorage.setItem(TIER_STORAGE_KEY, AppTier.PRO);
          }
          return;
        }

        // PRODUZIONE: Carica tier dal database normalmente
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
          // Map database tier to AppTier enum (with legacy tier migration)
          const dbTier = profile.tier as string;
          let appTier: AppTier;
          
          switch (dbTier) {
            case 'PLUS':
              appTier = AppTier.PLUS;
              break;
            case 'PRO':
              appTier = AppTier.PRO;
              break;
            case 'FREE':
              appTier = AppTier.FREE;
              break;
            // Legacy tier migration (backward compatibility)
            case 'PRO_CONSUMER':
              appTier = AppTier.PLUS; // Migrate PRO_CONSUMER to PLUS
              break;
            case 'PRO_PROFESSIONAL':
              appTier = AppTier.PRO; // Migrate PRO_PROFESSIONAL to PRO
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
          // In fase di test, mantieni PRO anche dopo logout (solo locale)
          const isLocalDev = typeof window !== 'undefined' && (
            window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1'
          );
          
          if (isLocalDev) {
            setTierState(AppTier.PRO);
            if (typeof window !== 'undefined') {
              localStorage.setItem(TIER_STORAGE_KEY, AppTier.PRO);
            }
          } else {
            setTierState(defaultTier);
            if (typeof window !== 'undefined') {
              localStorage.removeItem(TIER_STORAGE_KEY);
            }
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

  const isPlus = () => {
    return tier === AppTier.PLUS;
  };

  const isPro = () => {
    return tier === AppTier.PRO;
  };

  return (
    <TierContext.Provider value={{ tier, setTier, isPlus, isPro }}>
      {children}
    </TierContext.Provider>
  );
};

export { TierContext };

