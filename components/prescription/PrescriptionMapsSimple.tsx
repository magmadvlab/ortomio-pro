/**
 * Simple Prescription Maps Component for Testing
 */

import React from 'react';
import { Map, Plus, Settings } from 'lucide-react';

interface PrescriptionMapsSimpleProps {
  gardenId: string;
}

const PrescriptionMapsSimple: React.FC<PrescriptionMapsSimpleProps> = ({ gardenId }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg">
              <Map className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Prescription Maps</h1>
              <p className="text-gray-600">
                Sistema completo per precision farming (Versione Test)
              </p>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-2">✅ Sistema Attivo</h3>
            <p className="text-sm text-green-700">
              Garden ID: {gardenId}
            </p>
            <p className="text-sm text-green-700">
              Le Prescription Maps sono state caricate correttamente!
            </p>
          </div>
        </div>

        {/* Mock Data */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Mappe Disponibili</h2>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-3">
              <Plus size={18} />
              Nuova Mappa
            </button>
          </div>

          <div className="grid gap-4">
            {/* Mock Map 1 */}
            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Map className="text-green-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Fertilizzazione Azoto Gennaio 2026</h3>
                    <p className="text-sm text-gray-600">12.5 ha • 8 zone • Qualità: 92%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Completata
                  </span>
                  <button className="p-3 text-gray-600 hover:text-gray-900 rounded-lg">
                    <Settings size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Mock Map 2 */}
            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Map className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Semina Mais Primavera</h3>
                    <p className="text-sm text-gray-600">8.3 ha • 6 zone • Qualità: 88%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Completata
                  </span>
                  <button className="p-3 text-gray-600 hover:text-gray-900 rounded-lg">
                    <Settings size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-yellow-50 border border-yellow-full max-w-sm rounded-lg p-4 mt-6">
          <h3 className="font-medium text-yellow-full max-w-sm mb-2">🔧 Debug Info</h3>
          <div className="text-sm text-yellow-full max-w-sm space-y-1">
            <p>• Componente: PrescriptionMapsSimple</p>
            <p>• Garden ID: {gardenId}</p>
            <p>• Timestamp: {new Date().toLocaleString()}</p>
            <p>• Status: Funzionante ✅</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionMapsSimple;