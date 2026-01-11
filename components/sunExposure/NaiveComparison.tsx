/**
 * Naive Comparison Component
 * Mostra confronto side-by-side approccio naive vs ottimizzato
 */

import React from 'react';
import { ComparisonResult } from '../../services/naiveComparisonService';
import { XCircle, CheckCircle, TrendingUp, Droplet, Calendar } from 'lucide-react';

interface NaiveComparisonProps {
  comparison: ComparisonResult;
}

const NaiveComparison: React.FC<NaiveComparisonProps> = ({ comparison }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <h3 className="text-lg font-bold text-gray-800">Confronto Approcci</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Approccio Naive */}
        <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
          <div className="flex items-center gap-3 mb-3">
            <XCircle size={20} className="text-red-600" />
            <h4 className="font-bold text-red-900">Approccio Naive</h4>
          </div>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Coltura:</span>
              <span className="font-medium ml-2">{comparison.naiveApproach.plant}</span>
            </div>
            <div>
              <span className="text-gray-600">Resa:</span>
              <span className="font-bold text-red-700 ml-2">
                {comparison.naiveApproach.resa} kg
              </span>
            </div>
            <div>
              <span className="text-gray-600">Rischio fallimento:</span>
              <span className="font-bold text-red-700 ml-2">
                {comparison.naiveApproach.rischioFallimento}%
              </span>
            </div>
            <div>
              <span className="text-gray-600">Cicli:</span>
              <span className="font-medium ml-2">
                {comparison.naiveApproach.cicli}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Consumo acqua:</span>
              <span className="font-medium ml-2">
                {comparison.naiveApproach.consumoAcqua} L
              </span>
            </div>
            {comparison.naiveApproach.motivoFallimento && (
              <div className="mt-2 p-3 bg-red-100 rounded text-xs text-red-800">
                ⚠️ {comparison.naiveApproach.motivoFallimento}
              </div>
            )}
          </div>
        </div>

        {/* Approccio Ottimizzato */}
        <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle size={20} className="text-green-600" />
            <h4 className="font-bold text-green-900">Approccio Ottimizzato</h4>
          </div>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Colture:</span>
              <span className="font-medium ml-2">
                {comparison.optimizedApproach.colture.join(', ')}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Resa totale:</span>
              <span className="font-bold text-green-700 ml-2">
                {comparison.optimizedApproach.resaTotale} kg
              </span>
            </div>
            <div>
              <span className="text-gray-600">Cicli:</span>
              <span className="font-bold text-green-700 ml-2">
                {comparison.optimizedApproach.cicli}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Risparmio acqua:</span>
              <span className="font-bold text-green-700 ml-2">
                {comparison.optimizedApproach.risparmioAcqua}%
              </span>
            </div>
            <div className="mt-2 p-3 bg-green-100 rounded text-xs text-green-800">
              ✓ {comparison.optimizedApproach.motivoSuccesso}
            </div>
          </div>
        </div>
      </div>

      {/* Guadagni */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <TrendingUp size={20} className="text-blue-600" />
          <h4 className="font-bold text-blue-900">Guadagni con Approccio Ottimizzato</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-blue-700">
              +{comparison.guadagno.resaExtra} kg
            </div>
            <div className="text-gray-600 mt-1">Resa extra</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-blue-700">
              +{comparison.guadagno.cicliExtra}
            </div>
            <div className="text-gray-600 mt-1">Cicli extra</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-blue-700">
              -{comparison.guadagno.risparmioAcquaLitri} L
            </div>
            <div className="text-gray-600 mt-1">Risparmio acqua</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NaiveComparison;

