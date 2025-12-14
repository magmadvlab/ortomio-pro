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
  // Altrimenti usa switch automatico basato su auth
  const [storageProvider, setStorageProvider] = useState<IStorageProvider>(
    () => initialProvider || getDefaultStorageProvider()
  );
  const [isInitialized, setIsInitialized] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Verifica autenticazione Supabase direttamente (senza hook)
  useEffect(() => {
    if (initialProvider) {
      // Se initialProvider è fornito, non fare switch
      return;
    }
    
    const checkAuthAndSwitch = async () => {
      try {
        setIsInitialized(false);
        
        // Verifica se c'è una sessione Supabase attiva
        const supabase = getSupabaseClient();
        let isAuthenticated = false;
        
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          isAuthenticated = !!session?.user;
        }
        
        if (isAuthenticated) {
          // Utente autenticato: usa SupabaseStorageProvider
          const supabaseProvider = getSupabaseStorageProvider();
          if (supabaseProvider) {
            setStorageProvider(supabaseProvider);
          } else {
            // Fallback a LocalStorage se Supabase non disponibile
            setStorageProvider(getLocalStorageProvider());
          }
        } else {
          // Utente non autenticato: usa LocalStorageProvider
          setStorageProvider(getLocalStorageProvider());
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
    
    // Ascolta cambiamenti autenticazione
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          checkAuthAndSwitch();
        }
      });
      
      return () => {
        subscription.unsubscribe();
      }
    }
  }, [initialProvider]);

  // Optional: Test connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        setIsInitialized(false);
        // Test by getting gardens (lightweight operation)
        await storageProvider.getGardens();
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setIsInitialized(true); // Still initialized, just with error
        console.error('Storage provider initialization error:', err);
      }
    };

    testConnection();
  }, [storageProvider]);

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







