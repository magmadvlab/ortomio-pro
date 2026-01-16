'use client';

import React, { useState } from 'react';
import { useGarden } from '@/packages/core/hooks/useGarden';
import SmartPlantManager from '@/components/plants/SmartPlantManager';
import FieldPlantManager from '@/components/plants/FieldPlantManager';
import { TreePine, Target, Grid3X3 } from 'lucide-react';

export default function PlantsPage() {
  const { activeGarden } = useGarden();
  const [activeTab, setActiveTab] = useState<'smart' | 'field'>('smart');

  if (!activeGarden) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <TreePine className="mx-auto text-gray-400 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Nessun Giardino Selezionato
          </h2>
          <p className="text-gray-600">
            Seleziona un giardino per gestire le piante individuali
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <TreePine className="text-green-600" size={28} />
                    Gestione Piante Individuali
                  </h1>
                  <p className="text-sm text-gray-600">
                    Sistema professionale per tracking pianta-per-pianta
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('smart')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                      activeTab === 'smart'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Target size={16} />
                    Smart Manager
                  </button>
                  <button
                    onClick={() => setActiveTab('field')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                      activeTab === 'field'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Grid3X3 size={16} />
                    Field Manager
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Smart Manager */}
        {activeTab === 'smart' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="text-blue-600" size={20} />
                <h3 className="font-semibold text-blue-900">Smart Plant Manager</h3>
              </div>
              <p className="text-sm text-blue-800">
                Sistema intelligente per operazioni di massa con selezione avanzata e foto strategiche. 
                Ideale per campi professionali con centinaia o migliaia di piante.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                  Selezione multipla
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                  Operazioni di massa
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                  Foto intelligenti
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                  Heatmap salute
                </span>
              </div>
            </div>
            
            <SmartPlantManager garden={activeGarden} />
          </div>
        )}

        {/* Tab Field Manager */}
        {activeTab === 'field' && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Grid3X3 className="text-green-600" size={20} />
                <h3 className="font-semibold text-green-900">Field Plant Manager</h3>
              </div>
              <p className="text-sm text-green-800">
                Configuratore automatico per creare campi con tracking individuale. 
                Calcola automaticamente spaziature e genera codici pianta.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                  Configurazione automatica
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                  Calcoli spaziature
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                  Codici automatici
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                  Wizard guidato
                </span>
              </div>
            </div>
            
            <FieldPlantManager garden={activeGarden} />
          </div>
        )}
      </div>
    </div>
  );
}