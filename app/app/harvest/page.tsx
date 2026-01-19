'use client';

import React, { useState, useEffect } from 'react';
import { HarvestDashboard } from '../../../components/harvest/HarvestDashboard';
import { useStorage } from '@/packages/core/hooks/useStorage';
import { Garden } from '@/types';

export default function HarvestPage() {
  const { storageProvider } = useStorage();
  const [loading, setLoading] = useState(true);
  const [activeGarden, setActiveGarden] = useState<Garden | null>(null);

  useEffect(() => {
    loadActiveGarden();
  }, [storageProvider]);

  const loadActiveGarden = async () => {
    try {
      setLoading(true);
      const gardens = await storageProvider.getGardens();
      if (gardens.length > 0) {
        // Prendi il primo giardino o quello attivo
        setActiveGarden(gardens[0]);
      }
    } catch (error) {
      console.error('Error loading garden:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento gestione raccolti...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  🌾 Gestione Raccolti
                </h1>
                <p className="mt-2 text-gray-600">
                  Registra e monitora i tuoi raccolti per ottimizzare la produzione
                  {activeGarden && (
                    <span className="ml-2 text-green-600 font-medium">
                      • {activeGarden.name}
                    </span>
                  )}
                </p>
              </div>
              
              {/* Info sistema tracciamento */}
              <div className="hidden lg:block">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-800">
                    <span className="text-sm font-medium">💡 Sistema Intelligente</span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Collega i raccolti alle colture piantate per analisi complete
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HarvestDashboard gardenId={activeGarden?.id} />
      </div>
    </div>
  );
}