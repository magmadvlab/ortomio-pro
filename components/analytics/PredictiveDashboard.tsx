/**
 * Predictive Dashboard Component
 * Dashboard con previsioni: data raccolto ottimale, resa prevista, rischio malattie, fabbisogno idrico
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, AlertTriangle, Droplets, BarChart3, Loader } from 'lucide-react';
import { 
  predictOptimalHarvestDate, 
  predictYield, 
  predictDiseaseRisk, 
  predictWaterRequirement 
} from '@/services/predictiveAnalyticsService';
import { GardenTask, Garden, HarvestLogData } from '@/types';
import { getMasterSheetSync } from '@/services/plantMasterService';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PredictiveDashboardProps {
  task: GardenTask;
  garden: Garden;
  historicalHarvests?: HarvestLogData[];
}

export const PredictiveDashboard: React.FC<PredictiveDashboardProps> = ({
  task,
  garden,
  historicalHarvests = []
}) => {
  const [loading, setLoading] = useState(true);
  const [harvestPrediction, setHarvestPrediction] = useState<any>(null);
  const [yieldPrediction, setYieldPrediction] = useState<any>(null);
  const [diseaseRisk, setDiseaseRisk] = useState<any>(null);
  const [waterRequirement, setWaterRequirement] = useState<any>(null);

  useEffect(() => {
    loadPredictions();
  }, [task, garden]);

  const loadPredictions = async () => {
    setLoading(true);
    try {
      const masterData = getMasterSheetSync(task.plantName);
      if (!masterData) {
        console.error('Master data not found for', task.plantName);
        setLoading(false);
        return;
      }

      const [harvest, yieldPred, disease, water] = await Promise.all([
        predictOptimalHarvestDate(task, masterData, garden),
        predictYield(task, masterData, garden, historicalHarvests),
        predictDiseaseRisk(task, masterData, garden),
        predictWaterRequirement(task, masterData, garden)
      ]);

      setHarvestPrediction(harvest);
      setYieldPrediction(yieldPred);
      setDiseaseRisk(disease);
      setWaterRequirement(water);
    } catch (error) {
      console.error('Error loading predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader size={32} className="animate-spin text-green-600" />
          <span className="ml-3 text-gray-600">Caricamento previsioni...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <BarChart3 size={28} />
        Previsioni Agricoltura di Precisione
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Harvest Prediction */}
        {harvestPrediction && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={20} className="text-blue-600" />
              <h4 className="text-lg font-semibold">Data Raccolto Ottimale</h4>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-bold text-blue-600">
                  {harvestPrediction.optimalHarvestDate.toLocaleDateString('it-IT')}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Confidenza: {Math.round(harvestPrediction.confidence * 100)}%
                </p>
              </div>
              {harvestPrediction.earliestHarvestDate && harvestPrediction.latestHarvestDate && (
                <div className="text-sm text-gray-600">
                  <p>Finestra raccolto:</p>
                  <p>
                    {harvestPrediction.earliestHarvestDate.toLocaleDateString('it-IT')} - {' '}
                    {harvestPrediction.latestHarvestDate.toLocaleDateString('it-IT')}
                  </p>
                </div>
              )}
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-1">Fattori:</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Fase: {harvestPrediction.factors.currentPhase}</li>
                  <li>• Crescita: {harvestPrediction.factors.growthRate}</li>
                  <li>• Meteo: {harvestPrediction.factors.weatherConditions}</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Yield Prediction */}
        {yieldPrediction && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={20} className="text-green-600" />
              <h4 className="text-lg font-semibold">Resa Prevista</h4>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-bold text-green-600">
                  {yieldPrediction.predictedYieldKg.toFixed(1)} kg
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {yieldPrediction.predictedYieldPerSqm.toFixed(2)} kg/m²
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Confidenza: {Math.round(yieldPrediction.confidence * 100)}%
                </p>
              </div>
              <div className="text-sm text-gray-600">
                <p>Range previsto:</p>
                <p>
                  {yieldPrediction.range.min.toFixed(1)} - {yieldPrediction.range.max.toFixed(1)} kg
                </p>
              </div>
              {yieldPrediction.factors.historicalAverage && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-green-700">
                    Media storica: {yieldPrediction.factors.historicalAverage.toFixed(1)} kg
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Disease Risk */}
        {diseaseRisk && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle 
                size={20} 
                className={`${
                  diseaseRisk.riskLevel === 'critical' ? 'text-red-600' :
                  diseaseRisk.riskLevel === 'high' ? 'text-orange-600' :
                  diseaseRisk.riskLevel === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}
              />
              <h4 className="text-lg font-semibold">Rischio Malattie</h4>
            </div>
            <div className="space-y-3">
              <div>
                <p className={`text-2xl font-bold ${
                  diseaseRisk.riskLevel === 'critical' ? 'text-red-600' :
                  diseaseRisk.riskLevel === 'high' ? 'text-orange-600' :
                  diseaseRisk.riskLevel === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {diseaseRisk.riskLevel.toUpperCase()}
                </p>
              </div>
              {diseaseRisk.diseases.length > 0 && (
                <div className="space-y-2">
                  {diseaseRisk.diseases.map((disease: any, i: number) => (
                    <div key={i} className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-red-800">{disease.name}</p>
                      <p className="text-xs text-red-700">
                        Probabilità: {Math.round(disease.probability * 100)}%
                      </p>
                      {disease.prevention.length > 0 && (
                        <ul className="text-xs text-red-600 mt-1 list-disc list-inside">
                          {disease.prevention.slice(0, 2).map((p: string, j: number) => (
                            <li key={j}>{p}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Water Requirement */}
        {waterRequirement && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Droplets size={20} className="text-blue-600" />
              <h4 className="text-lg font-semibold">Fabbisogno Idrico</h4>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {waterRequirement.averageDailyRequirement.toFixed(1)} L/m²/giorno
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Media prossimi 7 giorni
                </p>
              </div>
              {waterRequirement.next7Days.length > 0 && (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={waterRequirement.next7Days}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="litersPerSqm" fill="#3b82f6" name="L/m²" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictiveDashboard;

