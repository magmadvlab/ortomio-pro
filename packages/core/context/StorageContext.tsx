/**
 * Storage Context Provider
 * Provides IStorageProvider to all components via React Context
 * Eliminates prop drilling of storageProvider
 * Switches automatically between LocalStorageProvider and SupabaseStorageProvider based on auth
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IStorageProvider } from '../storage/interface';
import { getDefaultStorageProvider, getSupabaseStorageProvider, getLocalStorageProvider } from '../storage/factory';
import { getSupabaseClient } from '@/config/supabase';
import { isBypassActive } from '@/lib/auth-bypass';

interface StorageContextType {
  storageProvider: IStorageProvider;
  isInitialized: boolean;
  error: string | null;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

interface StorageProviderProps {
  children: ReactNode;
  initialProvider?: IStorageProvider;
}

export const StorageProvider: React.FC<StorageProviderProps> = ({ 
  children, 
  initialProvider 
}) => {
  // Se initialProvider è fornito, usalo (per compatibilità)
  // Altrimenti inizia con LocalStorageProvider per evitare problemi di timing
  // e poi fa switch automatico basato su auth
  // SEMPRE inizia con LocalStorageProvider per evitare problemi di timing
  const [storageProvider, setStorageProvider] = useState<IStorageProvider>(
    () => getLocalStorageProvider()
  );
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Verifica autenticazione Supabase direttamente (senza hook)
  useEffect(() => {
    const checkAuthAndSwitch = async () => {
      try {
        setIsInitialized(false);
        
        // Se bypass attivo, usa SupabaseStorageProvider senza check auth
        if (isBypassActive()) {
          console.log('🔓 Auth Bypass ACTIVE - Using Supabase without authentication check');
          const supabaseProvider = getSupabaseStorageProvider();
          if (supabaseProvider) {
            setStorageProvider(supabaseProvider);
          } else {
            // Fallback a LocalStorage se Supabase non disponibile
            console.warn('Supabase not available, falling back to LocalStorage');
            setStorageProvider(getLocalStorageProvider());
          }
          setIsInitialized(true);
          setError(null);
          return;
        }
        
        // Verifica se c'è una sessione Supabase attiva
        const supabase = getSupabaseClient();
        let isAuthenticated = false;
        
        if (supabase) {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            isAuthenticated = !!session?.user;
          } catch (authError) {
            // Se c'è un errore nel check auth, usa LocalStorage
            console.warn('Auth check failed, using LocalStorage:', authError);
            isAuthenticated = false;
          }
        }
        
        if (isAuthenticated) {
          // Utente autenticato: usa SupabaseStorageProvider
          const supabaseProvider = getSupabaseStorageProvider();
          if (supabaseProvider && storageProvider !== supabaseProvider) {
            setStorageProvider(supabaseProvider);
          } else if (!supabaseProvider && storageProvider?.constructor.name !== 'LocalStorageProvider') {
            // Fallback a LocalStorage se Supabase non disponibile
            setStorageProvider(getLocalStorageProvider());
          }
        } else {
          // Utente non autenticato: usa LocalStorageProvider (già impostato)
          if (storageProvider?.constructor.name !== 'LocalStorageProvider') {
            setStorageProvider(getLocalStorageProvider());
          }
        }
        
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setIsInitialized(true);
        console.error('Storage provider switch error:', err);
        // Fallback a LocalStorage in caso di errore
        setStorageProvider(getLocalStorageProvider());
      }
    };
    
    checkAuthAndSwitch();
    
    // Ascolta cambiamenti autenticazione (solo se bypass non attivo)
    if (!isBypassActive()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
          try {
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
              checkAuthAndSwitch();
            }
          } catch (err) {
            console.error('onAuthStateChange handler error (StorageContext):', err);
          }
        });
        
        return () => {
          subscription.unsubscribe();
        }
      }
    }
  }, []);

  // Test connection quando il provider cambia e gestisci errori di auth
  useEffect(() => {
    // Se non è ancora inizializzato, non fare test
    if (!isInitialized) return;
    
    const testConnection = async () => {
      try {
        // Test by getting gardens (lightweight operation)
        await storageProvider.getGardens();
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        
        // Se è un errore di autenticazione e stiamo usando SupabaseStorageProvider,
        // fallback a LocalStorageProvider
        if (errorMessage.includes('not authenticated')) {
          console.warn('User not authenticated, switching to LocalStorageProvider');
          setStorageProvider(getLocalStorageProvider());
          setError(null);
          return;
        }
        
        setError(errorMessage);
        console.error('Storage provider test error:', err);
      }
    };

    testConnection();
  }, [storageProvider, isInitialized]);

  return (
    <StorageContext.Provider value={{ storageProvider, isInitialized, error }}>
      {children}
    </StorageContext.Provider>
  );
};

/**
 * Hook to access storage provider from context
 * @throws Error if used outside StorageProvider
 */
export const useStorage = (): StorageContextType => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
};







