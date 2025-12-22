/**
 * Install Prompt Component
 * Mostra prompt per installare PWA su schermata home
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verifica se app è già installata
    if (typeof window !== 'undefined') {
      // Verifica se è in standalone mode (app installata)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone ||
                          document.referrer.includes('android-app://');
      
      setIsInstalled(isStandalone);
      
      if (isStandalone) {
        return; // App già installata, non mostrare prompt
      }
    }

    // Ascolta evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Verifica se utente ha già rifiutato l'installazione
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      // Mostra di nuovo dopo 7 giorni
      if (daysSinceDismissed < 7) {
        setShowPrompt(false);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      // Mostra prompt installazione
      await deferredPrompt.prompt();
      
      // Attendi scelta utente
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setShowPrompt(false);
        setIsInstalled(true);
      } else {
        console.log('User dismissed the install prompt');
        // Salva che utente ha rifiutato
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
        setShowPrompt(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Salva che utente ha rifiutato
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Non mostrare se app è già installata o prompt non disponibile
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
      <div className="bg-white rounded-lg shadow-xl border-2 border-green-200 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Download className="text-green-600" size={24} />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 mb-1">
              Installa OrtoMio
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Aggiungi OrtoMio alla schermata home per un accesso rapido e funzionamento offline.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
              >
                Installa
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                aria-label="Chiudi"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;










