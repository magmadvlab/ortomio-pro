import React, { useState } from 'react';
import { HarvestLogData } from '../types';
import { OliveHarvest as OliveHarvestData, OilQuality } from '../types/olive';
import { calculateExpectedOilYield, isMillingUrgent } from '../logic/oliveEngine';
import { Droplets, AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import { useTier } from '../packages/core/hooks/useTier';
import UpgradePrompt from './UpgradePrompt';

interface OliveHarvestProps {
  harvestData: Partial<OliveHarvestData>;
  oilYieldExpected: number; // kg olio/100kg olive
  onUpdate: (data: Partial<OliveHarvestData>) => void;
}

const OliveHarvest: React.FC<OliveHarvestProps> = ({ harvestData, oilYieldExpected, onUpdate }) => {
  const { can } = useTier();
  const [showMilling, setShowMilling] = useState(false);

  // Protezione Pro: Colture specializzate sono feature Pro
  if (!can('specializedCrops')) {
    return (
      <div className="bg-white p-6 rounded-xl border-2 border-purple-200">
        <UpgradePrompt
          feature="Gestione Olivi e Produzione Olio"
          variant="inline"
          onUpgrade={() => console.log('Upgrade to Pro')}
        />
      </div>
    );
  }

  const oliveQty = harvestData.oliveQuantity || 0;
  const expectedOil = calculateExpectedOilYield(oliveQty, oilYieldExpected);
  const isUrgent = (harvestData as any).date ? isMillingUrgent((harvestData as any).date) : false;

  return (
    <div className="space-y-4">
      {/* Raccolta Olive */}
      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-3">
          <Droplets className="text-green-600" size={18} />
          Raccolta Olive
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Quantità Olive (kg)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={oliveQty || ''}
              onChange={(e) => onUpdate({ oliveQuantity: parseFloat(e.target.value) || 0 })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Metodo Raccolta
            </label>
            <select
              value={harvestData.harvestMethod || 'Manual'}
              onChange={(e) => onUpdate({ harvestMethod: e.target.value as any })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="Manual">Manuale</option>
              <option value="Mechanical">Meccanico</option>
              <option value="Shaking">Scuotitura</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Data Raccolta
            </label>
            <input
              type="date"
              value={(harvestData as any).date || new Date().toISOString().split('T')[0]}
              onChange={(e) => onUpdate({ date: e.target.value } as Partial<OliveHarvestData>)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Stima Olio */}
      {oliveQty > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <Droplets className="text-blue-600" size={18} />
            <span className="font-semibold text-blue-800">Stima Olio Atteso</span>
          </div>
          <p className="text-sm text-blue-700">
            Da <strong>{oliveQty} kg</strong> di olive, ti aspetti circa{' '}
            <strong>{expectedOil.toFixed(2)} litri</strong> di olio
            (resa: {oilYieldExpected} kg olio/100kg olive).
          </p>
        </div>
      )}

      {/* Frangitura */}
      <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-300">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-800 flex items-center gap-3">
            <Calendar className="text-orange-600" size={18} />
            Frangitura
          </h4>
          {isUrgent && (
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle size={16} />
              <span className="text-xs font-semibold">URGENTE</span>
            </div>
          )}
        </div>

        {isUrgent && (harvestData as any).date && (
          <div className="mb-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-700">
              ⚠️ <strong>Frangitura Urgente:</strong> Le olive sono state raccolte più di 24 ore fa.
              Per mantenere la qualità, frangile entro 48 ore dalla raccolta.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowMilling(!showMilling)}
          className="w-full p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          {showMilling ? 'Nascondi' : 'Registra Frangitura'}
        </button>

        {showMilling && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Data Frangitura
              </label>
              <input
                type="date"
                value={harvestData.millingDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => onUpdate({ millingDate: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tipo Frangitura
              </label>
              <select
                value={(harvestData as any).millingType || 'Traditional'}
                onChange={(e) => onUpdate({ millingType: e.target.value as any } as Partial<OliveHarvestData>)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="Traditional">Tradizionale</option>
                <option value="Continuous">Continua</option>
                <option value="Two-phase">Bifase</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Olio Prodotto (litri)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={harvestData.oilProduced || ''}
                onChange={(e) => onUpdate({ oilProduced: parseFloat(e.target.value) || 0 })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Analisi Olio */}
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <h5 className="font-semibold text-gray-800 mb-2">Analisi Qualità Olio</h5>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Acidità (% acido oleico)</label>
                  <input
                    type="number"
                    min="0"
                    max="2"
                    step="0.01"
                    value={harvestData.oilQuality?.acidity || ''}
                    onChange={(e) => onUpdate({
                      oilQuality: {
                        ...harvestData.oilQuality,
                        acidity: parseFloat(e.target.value) || 0
                      } as OilQuality
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Perossidi (meq O2/kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={harvestData.oilQuality?.peroxide || ''}
                    onChange={(e) => onUpdate({
                      oilQuality: {
                        ...harvestData.oilQuality,
                        peroxide: parseFloat(e.target.value) || 0
                      } as OilQuality
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Polifenoli (mg/kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={harvestData.oilQuality?.polyphenols || ''}
                    onChange={(e) => onUpdate({
                      oilQuality: {
                        ...harvestData.oilQuality,
                        polyphenols: parseFloat(e.target.value) || 0
                      } as OilQuality
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Note Frangitura
              </label>
              <textarea
                value={harvestData.millingNotes || ''}
                onChange={(e) => onUpdate({ millingNotes: e.target.value })}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Nome frantoio, note sulla qualità, etc."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OliveHarvest;

