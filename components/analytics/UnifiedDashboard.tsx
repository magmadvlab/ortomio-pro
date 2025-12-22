/**
 * Unified Dashboard Component
 * Dashboard unificata con tutti i dati da multiple sorgenti
 */

'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, Droplets, Sun, Leaf, Loader } from 'lucide-react';
import { aggregateTaskData, generateInsights, findCorrelations } from '@/services/dataIntegrationService';
import { getSupabaseClient } from '@/config/supabase';
import { GardenTask, Garden } from '@/types';
import PredictiveDashboard from './PredictiveDashboard';
import VegetationIndicesChart from '@/components/plantTracking/VegetationIndicesChart';

interface UnifiedDashboardProps {
  task: GardenTask;
  garden: Garden;
}

export const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({
  task,
  garden
}) => {
  const [loading, setLoading] = useState(true);
  const [integratedData, setIntegratedData] = useState<any>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [correlations, setCorrelations] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [task, garden]);

  const loadData = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

      const data = await aggregateTaskData(supabase, task, garden);
      setIntegratedData(data);
      
      const generatedInsights = generateInsights(data);
      setInsights(generatedInsights);
      
      // Per correlazioni servirebbero più dati storici
      // setCorrelations(findCorrelations([data]));
    } catch (error) {
      console.error('Error loading unified data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader size={32} className="animate-spin text-green-600" />
          <span className="ml-3 text-gray-600">Caricamento dati...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
        <BarChart3 size={32} />
        Dashboard Unificata - Agricoltura di Precisione
      </h2>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2 flex items-center gap-2">
            <AlertTriangle size={20} />
            Insights Automatici
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
            {insights.map((insight, i) => (
              <li key={i}>{insight}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Data Summary Cards */}
      {integratedData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {integratedData.vegetationIndices?.ndvi !== undefined && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Leaf size={20} className="text-green-600" />
                <span className="text-sm font-medium text-gray-700">NDVI</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {integratedData.vegetationIndices.ndvi.toFixed(3)}
              </p>
            </div>
          )}
          
          {integratedData.weatherData && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sun size={20} className="text-yellow-600" />
                <span className="text-sm font-medium text-gray-700">Temperatura</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {integratedData.weatherData.temperature.toFixed(1)}°C
              </p>
            </div>
          )}
          
          {integratedData.soilAnalysis?.ph !== undefined && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplets size={20} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-700">pH Suolo</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {integratedData.soilAnalysis.ph.toFixed(1)}
              </p>
            </div>
          )}
          
          {integratedData.photoAnalysis && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={20} className="text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Salute</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(integratedData.photoAnalysis.healthScore * 100)}%
              </p>
            </div>
          )}
        </div>
      )}

      {/* Predictive Dashboard */}
      <PredictiveDashboard task={task} garden={garden} />

      {/* Vegetation Indices Chart */}
      <VegetationIndicesChart taskId={task.id} zoneId={task.zoneId} />
    </div>
  );
};

export default UnifiedDashboard;

