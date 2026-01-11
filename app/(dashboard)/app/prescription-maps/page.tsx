/**
 * Prescription Maps Page
 * Pagina principale per gestione mappe prescrizione precision farming
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useStorage } from '@/packages/core/hooks/useStorage';
import { useTier } from '@/packages/core/hooks/useTier';
import PrescriptionMapsSimple from '@/components/prescription/PrescriptionMapsSimple';
import { Map, Crown, Lock } from 'lucide-react';

export default function PrescriptionMapsPage() {
  const [gardenId, setGardenId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Safe hooks with error handling
  let storageProvider = null;
  let isPro = false;
  
  try {
    const storage = useStorage();
    storageProvider = storage?.storageProvider;
  } catch (err) {
    console.warn('Storage context not available:', err);
  }

  try {
    const tier = useTier();
    isPro = tier?.isPro || false;
  } catch (err) {
    console.warn('Tier context not available, defaulting to PRO for testing:', err);
    isPro = true; // Default to PRO for testing
  }

  useEffect(() => {
    loadGardenData();
  }, []);

  const loadGardenData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current garden ID from storage
      // For now, use a default garden ID - this would come from user context
      setGardenId('default-garden');
      
    } catch (error) {
      console.error('Error loading garden data:', error);
      setError('Errore nel caricamento dei dati del giardino');
      setGardenId('default-garden'); // Fallback
    } finally {
      setLoading(false);
    }
  };

  // Show error if any
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Map className="text-red-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Errore
            </h2>
            <p className="text-gray-600">
              {error}
            </p>
          </div>
          <button
            onClick={() => {
              setError(null);
              loadGardenData();
            }}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-all duration-200"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  // Show upgrade prompt for non-PRO users
  if (!isPro) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
              <Map className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Prescription Maps
            </h2>
            <p className="text-gray-600">
              Mappe prescrizione per precision farming professionale
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <Lock className="text-yellow-600 mr-2" size={20} />
              <span className="font-medium text-yellow-800">Funzionalità PRO</span>
            </div>
            <p className="text-sm text-yellow-700">
              Le mappe prescrizione sono disponibili solo per utenti PRO. 
              Upgrade per accedere a precision farming avanzato.
            </p>
          </div>

          <div className="space-y-3 text-left mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Mappe prescrizione basate su dati NDVI e plant-level
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Export per GPS agricoli e machinery automation
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Analisi costi e ottimizzazione input
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Compatibilità machinery universale
            </div>
          </div>

          <button
            onClick={() => {
              // This would typically open upgrade modal or redirect to pricing
              alert('Upgrade a PRO per accedere alle Prescription Maps!\n\nContatta il supporto per maggiori informazioni.');
            }}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
          >
            <Crown size={20} />
            Upgrade a PRO
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento Prescription Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg">
              <Map className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mappe Prescrizione</h1>
              <p className="text-gray-600">
                Sistema completo per precision farming e applicazione a rateo variabile
              </p>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Map className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Zone Management</p>
                  <p className="text-sm text-gray-600">Gestione avanzata zone</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Map className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Universal Export</p>
                  <p className="text-sm text-gray-600">Tutti i formati GPS</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Map className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Plant-Level Data</p>
                  <p className="text-sm text-gray-600">Precisione massima</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Map className="text-orange-600" size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Cost Analysis</p>
                  <p className="text-sm text-gray-600">ROI e ottimizzazione</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard */}
        <PrescriptionMapsSimple gardenId={gardenId} />
      </div>
    </div>
  );
}