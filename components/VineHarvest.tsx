import React, { useState } from 'react';
import { HarvestLogData } from '../types';
import { VineHarvest as VineHarvestData, WineAnalysis } from '../types/vine';
import { isWinemakingUrgent, isOptimalHarvestTime } from '../logic/vineEngine';
import { Wine, AlertCircle, CheckCircle, Calendar, TrendingUp } from 'lucide-react';
import { useTier } from '../packages/core/hooks/useTier';
import UpgradePrompt from './UpgradePrompt';

interface VineHarvestProps {
  harvestData: Partial<VineHarvestData>;
  brixTarget: number;
  onUpdate: (data: Partial<VineHarvestData>) => void;
}

const VineHarvest: React.FC<VineHarvestProps> = ({ harvestData, brixTarget, onUpdate }) => {
  const { can } = useTier();
  const [showWinemaking, setShowWinemaking] = useState(false);

  // Protezione Pro: Colture specializzate sono feature Pro
  if (!can('specializedCrops')) {
    return (
      <div className="bg-white p-6 rounded-xl border-2 border-purple-200">
        <UpgradePrompt
          feature="Gestione Viti e Produzione Vino"
          variant="inline"
          onUpgrade={() => console.log('Upgrade to Pro')}
        />
      </div>
    );
  }

  const grapeQty = harvestData.grapeQuantity || 0;
  const brixAtHarvest = harvestData.brixAtHarvest || 0;
  const isReady = isOptimalHarvestTime(
    { cropType: 'Vine', brixTarget } as any,
    brixAtHarvest,
    new Date(harvestData.harvestDate || new Date().toISOString())
  );
  const isUrgent = harvestData.harvestDate && harvestData.wineType && 
    isWinemakingUrgent(harvestData.harvestDate, harvestData.wineType, new Date());

  // Stima vino: circa 70-80% del peso uva per vino rosso, 60-70% per bianco
  const wineYield = grapeQty > 0 
    ? (harvestData.wineType === 'White' || harvestData.wineType === 'Rosé' 
        ? grapeQty * 0.65 
        : grapeQty * 0.75)
    : 0;

  return (
    <div className="space-y-4">
      {/* Vendemmia */}
      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Wine className="text-purple-600" size={18} />
          Vendemmia
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Quantità Uva (kg)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={grapeQty || ''}
              onChange={(e) => onUpdate({ grapeQuantity: parseFloat(e.target.value) || 0 })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Gradi Brix al Momento Raccolta
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="30"
                step="0.1"
                value={brixAtHarvest || ''}
                onChange={(e) => onUpdate({ brixAtHarvest: parseFloat(e.target.value) || 0 })}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-gray-600">°Brix</span>
              {brixTarget > 0 && (
                <span className="text-sm text-gray-500">
                  (target: {brixTarget}°)
                </span>
              )}
            </div>
            {isReady && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle size={12} />
                Brix target raggiunto!
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Data Vendemmia
            </label>
            <input
              type="date"
              value={harvestData.harvestDate || new Date().toISOString().split('T')[0]}
              onChange={(e) => onUpdate({ harvestDate: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Metodo Raccolta
            </label>
            <select
              value={harvestData.harvestMethod || 'Manual'}
              onChange={(e) => onUpdate({ harvestMethod: e.target.value as any })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="Manual">Manuale</option>
              <option value="Mechanical">Meccanico</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stima Vino */}
      {grapeQty > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-blue-600" size={18} />
            <span className="font-semibold text-blue-800">Stima Vino Atteso</span>
          </div>
          <p className="text-sm text-blue-700">
            Da <strong>{grapeQty} kg</strong> di uva, ti aspetti circa{' '}
            <strong>{wineYield.toFixed(1)} litri</strong> di vino
            (resa: {harvestData.wineType === 'White' ? '60-70%' : '70-80%'}).
          </p>
        </div>
      )}

      {/* Vinificazione */}
      <div className="p-4 bg-red-50 rounded-lg border-2 border-red-300">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
            <Wine className="text-red-600" size={18} />
            Vinificazione
          </h4>
          {isUrgent && (
            <div className="flex items-center gap-1 text-red-600">
              <AlertCircle size={16} />
              <span className="text-xs font-semibold">URGENTE</span>
            </div>
          )}
        </div>

        {isUrgent && harvestData.harvestDate && (
          <div className="mb-3 p-3 bg-red-100 rounded-lg border border-red-200">
            <p className="text-sm text-red-700">
              ⚠️ <strong>Vinificazione Urgente:</strong> Per uve {harvestData.wineType?.toLowerCase()}, 
              inizia la vinificazione entro 24 ore dalla vendemmia per preservare qualità e aromi.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowWinemaking(!showWinemaking)}
          className="w-full p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          {showWinemaking ? 'Nascondi' : 'Registra Vinificazione'}
        </button>

        {showWinemaking && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Data Vinificazione
              </label>
              <input
                type="date"
                value={harvestData.winemakingDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => onUpdate({ winemakingDate: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tipo Vino
              </label>
              <select
                value={harvestData.wineType || 'Red'}
                onChange={(e) => onUpdate({ wineType: e.target.value as any })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="Red">Rosso</option>
                <option value="White">Bianco</option>
                <option value="Rosé">Rosato</option>
                <option value="Sparkling">Spumante</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Vino Prodotto (litri)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={harvestData.wineProduced || ''}
                onChange={(e) => onUpdate({ wineProduced: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Analisi Vino */}
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <h5 className="font-semibold text-gray-800 mb-2">Analisi Vino</h5>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Gradazione Alcolica (% vol)</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={harvestData.wineAnalysis?.alcohol || ''}
                    onChange={(e) => onUpdate({
                      wineAnalysis: {
                        ...harvestData.wineAnalysis,
                        alcohol: parseFloat(e.target.value) || 0
                      } as WineAnalysis
                    })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="12.0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Acidità (g/L acido tartarico)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={harvestData.wineAnalysis?.acidity || ''}
                    onChange={(e) => onUpdate({
                      wineAnalysis: {
                        ...harvestData.wineAnalysis,
                        acidity: parseFloat(e.target.value) || 0
                      } as WineAnalysis
                    })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="5.0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">pH</label>
                  <input
                    type="number"
                    min="0"
                    max="7"
                    step="0.01"
                    value={harvestData.wineAnalysis?.pH || ''}
                    onChange={(e) => onUpdate({
                      wineAnalysis: {
                        ...harvestData.wineAnalysis,
                        pH: parseFloat(e.target.value) || 0
                      } as WineAnalysis
                    })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="3.5"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Data Imbottigliamento
              </label>
              <input
                type="date"
                value={(harvestData as any).bottlingDate || ''}
                onChange={(e) => onUpdate({ bottlingDate: e.target.value } as any)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Bottiglie Prodotte
              </label>
              <input
                type="number"
                min="0"
                value={(harvestData as any).bottlesProduced || ''}
                onChange={(e) => onUpdate({ bottlesProduced: parseInt(e.target.value) || 0 } as any)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VineHarvest;

