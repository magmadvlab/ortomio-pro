/**
 * Storage Context Provider
 * Provides IStorageProvider to all components via React Context
 * Eliminates prop drilling of storageProvider
 * Switches automatically between LocalStorageProvider and SupabaseStorageProvider based on auth
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IStorageProvider } from '../storage/interface';
import { getSupabaseStorageProvider, getLocalStorageProvider } from '../storage/factory';
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
  const [storageProvider, setStorageProvider] = useState<IStorageProvider>(
    () => initialProvider ?? getLocalStorageProvider()
  );
  const [isInitialized, setIsInitialized] = useState<boolean>(Boolean(initialProvider));
  const [error, setError] = useState<string | null>(null);
  
  // Verifica autenticazione Supabase direttamente (senza hook)
  useEffect(() => {
    if (initialProvider) {
      setStorageProvider(initialProvider);
      setIsInitialized(true);
      setError(null);
      return;
    }

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
            throw new Error('Supabase non disponibile durante il bypass autenticato');
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
            throw new Error('Impossibile verificare la sessione cloud', { cause: authError });
          }
        }
        
        if (isAuthenticated) {
          // Utente autenticato: usa SupabaseStorageProvider
          const supabaseProvider = getSupabaseStorageProvider();
          if (supabaseProvider && storageProvider !== supabaseProvider) {
            setStorageProvider(supabaseProvider);
          } else if (!supabaseProvider) {
            throw new Error('Sessione autenticata senza provider cloud disponibile');
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
  }, [initialProvider]);

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
        
        setError(errorMessage);
        console.error('Storage provider test error:', err);
      }
    };

    testConnection();
  }, [storageProvider, isInitialized]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-600">
        Connessione ai dati in corso…
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="flex min-h-screen items-center justify-center bg-gray-50 px-6 text-center">
        <div>
          <p className="font-medium text-red-700">Archivio dati non disponibile</p>
          <p className="mt-2 text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

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






