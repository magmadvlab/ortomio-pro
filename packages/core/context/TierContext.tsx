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
            .select('tier, ai_credits_total, ai_credits_used')
            .eq('id', session.user.id)
            .maybeSingle();

          // Se il tier nel database non è PRO, aggiornalo o crealo
          if (!profile || profile.tier !== 'PRO') {
            await supabase
              .from('profiles')
              .upsert({
                id: session.user.id,
                tier: 'PRO',
                ai_credits_total: profile?.ai_credits_total ?? 200,
                ai_credits_used: profile?.ai_credits_used ?? 0,
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
        // Use maybeSingle() instead of single() to avoid 406 error when profile doesn't exist
        
        // SPECIAL CASE: Forza PRO per roberto.lalinga@gmail.com (superadmin)
        const isSuperAdmin = session.user.email === 'roberto.lalinga@gmail.com';
        
        if (isSuperAdmin) {
          console.debug('[TierContext] Superadmin detected:', session.user.email, 'forcing PRO tier');
          // Assicurati che il profilo esista con tier PRO
          const { data: existingProfile, error: profileError } = await supabase
            .from('profiles')
            .select('tier, ai_credits_total, ai_credits_used')
            .eq('id', session.user.id)
            .maybeSingle();

          console.debug('[TierContext] Existing profile:', existingProfile, 'Error:', profileError);

          if (!existingProfile || (existingProfile.tier !== 'PRO' && existingProfile.tier !== 'PRO_PROFESSIONAL')) {
            console.debug('[TierContext] Creating/updating superadmin profile with PRO tier');
            // Crea o aggiorna il profilo con tier PRO e crediti illimitati
            const { data: upsertData, error: upsertError } = await supabase
              .from('profiles')
              .upsert({
                id: session.user.id,
                tier: 'PRO',
                ai_credits_total: 999999,
                ai_credits_used: existingProfile?.ai_credits_used ?? 0,
              }, {
                onConflict: 'id',
              });

            console.debug('[TierContext] Upsert result:', upsertData, 'Error:', upsertError);
          }

          console.debug('[TierContext] Setting tier to PRO for superadmin');
          setTierState(AppTier.PRO);
          if (typeof window !== 'undefined') {
            localStorage.setItem(TIER_STORAGE_KEY, AppTier.PRO);
          }
          return;
        }
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('tier')
          .eq('id', session.user.id)
          .maybeSingle();

        // Handle 406 errors and other cases where profile doesn't exist
        // 406 can occur even with maybeSingle() due to RLS or PostgREST configuration
        if (error) {
          // PGRST116 (No rows) or error messages indicating not found mean profile doesn't exist
          // Note: PostgrestError doesn't have a status property, we check code and message
          const isNotFoundError = error.code === 'PGRST116' || 
                                  error.message?.includes('No rows') ||
                                  error.message?.includes('not found') ||
                                  error.message?.includes('406');
          
          if (isNotFoundError) {
            // Profile doesn't exist - create it
            console.log('Profile not found, creating default profile');
            const { error: createError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                tier: 'FREE',
                ai_credits_total: 3,
                ai_credits_used: 0,
              });
            
            if (createError) {
              // If profile was just created by another request (race condition), that's ok
              if (createError.code === '23505') {
                console.log('Profile already exists (created by another request)');
              } else {
                console.error('Error creating profile:', createError);
              }
              // Use default tier even if creation fails
              setTierState(AppTier.FREE);
              if (typeof window !== 'undefined') {
                localStorage.setItem(TIER_STORAGE_KEY, AppTier.FREE);
              }
              return;
            }
            
            // Use default tier after creating profile
            setTierState(AppTier.FREE);
            if (typeof window !== 'undefined') {
              localStorage.setItem(TIER_STORAGE_KEY, AppTier.FREE);
            }
            return;
          } else {
            // Other error - log but don't create profile
            console.error('Error fetching profile:', error);
            return;
          }
        }

        // If profile is null, create it
        if (!profile) {
          console.log('Profile not found, creating default profile');
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              tier: 'FREE',
              ai_credits_total: 3,
              ai_credits_used: 0,
            });
          
          if (createError) {
            // If insert fails due to conflict, profile was just created - use default
            if (createError.code === '23505') {
              console.log('Profile was just created by another request');
            } else {
              console.error('Error creating profile:', createError);
            }
            // Use default tier even if creation fails
            setTierState(AppTier.FREE);
            if (typeof window !== 'undefined') {
              localStorage.setItem(TIER_STORAGE_KEY, AppTier.FREE);
            }
            return;
          }
          
          // Use default tier after creating profile
          setTierState(AppTier.FREE);
          if (typeof window !== 'undefined') {
            localStorage.setItem(TIER_STORAGE_KEY, AppTier.FREE);
          }
          return;
        }

        if (profile?.tier) {
          // Map database tier to AppTier enum (with legacy tier migration)
          const dbTier = profile.tier as string;
          let appTier: AppTier;

          console.debug('[TierContext] Loading tier from database:', dbTier, 'for user:', session.user.email);

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
              console.warn(`[TierContext] Unknown tier in database: ${dbTier}, defaulting to FREE`);
              appTier = AppTier.FREE;
          }

          console.debug('[TierContext] Mapped tier:', dbTier, '->', appTier);
          setTierState(appTier);
          // Also save to localStorage for offline access
          if (typeof window !== 'undefined') {
            localStorage.setItem(TIER_STORAGE_KEY, appTier);
          }
        } else {
          console.debug('[TierContext] No tier in profile, using default FREE');
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

