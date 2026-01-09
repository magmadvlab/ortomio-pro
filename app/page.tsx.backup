'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { getSupabaseClient } from '@/config/supabase';

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      // Controlla se c'è un code di reset password o verifica email
      const code = searchParams.get('code');
      const type = searchParams.get('type');
      const token_hash = searchParams.get('token_hash');

      if (code || token_hash) {
        // Reindirizza al callback handler per gestire l'autenticazione
        const params = new URLSearchParams();
        if (code) params.set('code', code);
        if (type) params.set('type', type);
        if (token_hash) params.set('token_hash', token_hash);
        
        router.replace(`/auth/callback?${params.toString()}`);
        return;
      }

      // Controlla se l'utente è autenticato
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error checking session:', error);
            router.replace('/auth');
            return;
          }

          if (session?.user) {
            // Utente autenticato, reindirizza all'app
            router.replace('/app');
          } else {
            // Utente non autenticato, reindirizza alla registrazione
            router.replace('/auth');
          }
        } catch (error) {
          console.error('Error during auth check:', error);
          router.replace('/auth');
        }
      } else {
        // Supabase non disponibile, reindirizza alla registrazione
        router.replace('/auth');
      }
      
      setIsChecking(false);
    };

    checkAuthAndRedirect();
  }, [router, searchParams]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifica autenticazione...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Reindirizzamento in corso...</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}