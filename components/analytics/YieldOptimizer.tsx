/**
 * Yield Optimizer Component
 * Visualizza previsioni resa e suggerimenti ottimizzazione ROI
 */

'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Target, Loader } from 'lucide-react';
import { optimizeYield, calculateFertilizationROI } from '@/services/yieldModelService';
import { GardenTask, Garden, HarvestLogData } from '@/types';
import { getMasterSheetSync } from '@/services/plantMasterService';
import { getMarketPrice } from '@/data/marketPrices';

interface YieldOptimizerProps {
  task: GardenTask;
  garden: Garden;
  historicalHarvests?: HarvestLogData[];
}

export const YieldOptimizer: React.FC<YieldOptimizerProps> = ({
  task,
  garden,
  historicalHarvests = []
}) => {
  const [loading, setLoading] = useState(true);
  const [optimization, setOptimization] = useState<any>(null);
  const [marketPrice, setMarketPrice] = useState<number>(0);

  useEffect(() => {
    loadOptimization();
  }, [task, garden]);

  const loadOptimization = async () => {
    setLoading(true);
    try {
      const masterData = getMasterSheetSync(task.plantName);
      if (!masterData) {
        console.error('Master data not found');
        setLoading(false);
        return;
      }

      const opt = await optimizeYield(task, masterData, garden, historicalHarvests);
      setOptimization(opt);

      // Calcola prezzo di mercato
      const date = new Date(task.date);
      const month = date.getMonth();
      const season = (month >= 5 && month <= 8) ? 'Summer' : 'Winter';
      const price = getMarketPrice(task.plantName, season);
      setMarketPrice(price);
    } catch (error) {
      console.error('Error loading optimization:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader size={32} className="animate-spin text-green-600" />
          <span className="ml-3 text-gray-600">Calcolo ottimizzazione...</span>
        </div>
      </div>
    );
  }

  if (!optimization) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600">Nessun dato disponibile per l'ottimizzazione.</p>
      </div>
    );
  }

  const { currentPrediction, optimizedPrediction, recommendations } = optimization;
  const additionalYield = optimizedPrediction.predictedYieldKg - currentPrediction.predictedYieldKg;
  const additionalRevenue = additionalYield * marketPrice;

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Target size={28} />
        Ottimizzazione Resa
      </h3>

      {/* Current vs Optimized */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold mb-4 text-gray-700">Resa Attuale Prevista</h4>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-gray-900">
              {currentPrediction.predictedYieldKg.toFixed(1)} kg
            </p>
            <p className="text-sm text-gray-600">
              {currentPrediction.predictedYieldPerSqm.toFixed(2)} kg/m²
            </p>
            <p className="text-sm text-gray-500">
              Confidenza: {Math.round(currentPrediction.confidence * 100)}%
            </p>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg border-2 border-green-500 p-6">
          <h4 className="text-lg font-semibold mb-4 text-green-800">Resa Ottimizzata</h4>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-green-700">
              {optimizedPrediction.predictedYieldKg.toFixed(1)} kg
            </p>
            <p className="text-sm text-green-600">
              {optimizedPrediction.predictedYieldPerSqm.toFixed(2)} kg/m²
            </p>
            <div className="mt-3 pt-3 border-t border-green-300">
              <p className="text-sm font-medium text-green-800">
                +{additionalYield.toFixed(1)} kg (+{Math.round((additionalYield / currentPrediction.predictedYieldKg) * 100)}%)
              </p>
              {marketPrice > 0 && (
                <p className="text-sm text-green-700">
                  +€{additionalRevenue.toFixed(2)} di valore aggiuntivo
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" />
            Raccomandazioni per Ottimizzazione
          </h4>
          <div className="space-y-4">
            {recommendations.map((rec: any, i: number) => (
              <div key={i} className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-blue-900">{rec.action}</p>
                    <p className="text-sm text-blue-700 mt-1">{rec.expectedImpact}</p>
                  </div>
                  {rec.cost !== undefined && rec.roi !== undefined && (
                    <div className="text-right ml-4">
                      <p className="text-sm text-blue-600">Costo: €{rec.cost}</p>
                      <p className="text-sm font-medium text-green-700">
                        ROI: {rec.roi.toFixed(1)}x
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ROI Analysis */}
      {recommendations.length > 0 && marketPrice > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign size={20} className="text-green-600" />
            Analisi ROI
          </h4>
          <div className="space-y-3">
            {recommendations.map((rec: any, i: number) => {
              if (rec.cost === undefined) return null;
              
              const roi = calculateFertilizationROI(
                currentPrediction.predictedYieldKg,
                optimizedPrediction.predictedYieldKg,
                rec.cost,
                marketPrice
              );
              
              return (
                <div key={i} className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-900 mb-2">{rec.action}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Resa aggiuntiva</p>
                      <p className="font-semibold text-gray-900">{roi.additionalYield} kg</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Ricavo aggiuntivo</p>
                      <p className="font-semibold text-green-700">€{roi.additionalRevenue.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Costo</p>
                      <p className="font-semibold text-gray-900">€{rec.cost}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">ROI</p>
                      <p className="font-semibold text-green-700">{roi.roi.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default YieldOptimizer;







