/**
 * Vegetation Indices Chart Component
 * Visualizza trend degli indici vegetativi nel tempo con confronto valori ottimali
 */

'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { VegetationIndices, getVegetationIndicesByTask, checkIndicesThresholds } from '@/services/vegetationIndexService';
import { getSupabaseClient } from '@/config/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface VegetationIndicesChartProps {
  taskId: string;
  zoneId?: string;
}

export const VegetationIndicesChart: React.FC<VegetationIndicesChartProps> = ({
  taskId,
  zoneId
}) => {
  const [indices, setIndices] = useState<VegetationIndices[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<'ndvi' | 'evi' | 'lai' | 'chlorophyllIndex'>('ndvi');

  const supabase = getSupabaseClient();

  useEffect(() => {
    if (supabase && taskId) {
      loadIndices();
    }
  }, [supabase, taskId, zoneId]);

  const loadIndices = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const loaded = await getVegetationIndicesByTask(supabase, taskId);
      setIndices(loaded);
    } catch (error) {
      console.error('Error loading vegetation indices:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepara dati per grafico
  const prepareChartData = () => {
    const sorted = [...indices].sort((a, b) => 
      new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime()
    );
    
    return sorted.map(idx => ({
      date: new Date(idx.createdAt || '').toLocaleDateString('it-IT', { month: 'short', day: 'numeric' }),
      ndvi: idx.ndvi,
      evi: idx.evi,
      lai: idx.lai,
      chlorophyllIndex: idx.chlorophyllIndex,
      fullDate: idx.createdAt
    }));
  };

  const chartData = prepareChartData();
  const latestIndices = indices.length > 0 ? indices[indices.length - 1] : null;
  const thresholds = latestIndices ? checkIndicesThresholds(latestIndices) : null;

  // Valori ottimali per riferimento
  const optimalValues = {
    ndvi: { min: 0.3, optimal: 0.6, max: 1.0 },
    evi: { min: 0.2, optimal: 0.5, max: 1.0 },
    lai: { min: 1.0, optimal: 3.0, max: 10.0 },
    chlorophyllIndex: { min: 0.5, optimal: 2.0, max: 5.0 }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600">Caricamento indici vegetativi...</p>
      </div>
    );
  }

  if (indices.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 text-gray-600">
          <Info size={20} />
          <p>Nessun indice vegetativo disponibile. Gli indici vengono calcolati automaticamente quando carichi una foto.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Latest Values Summary */}
      {latestIndices && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold mb-4">Indici Correnti</h4>
          <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-4 gap-4">
            {latestIndices.ndvi !== undefined && (
              <div className={`p-4 rounded-lg border-2 ${
                latestIndices.ndvi >= optimalValues.ndvi.optimal 
                  ? 'border-green-500 bg-green-50' 
                  : latestIndices.ndvi >= optimalValues.ndvi.min
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-red-500 bg-red-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">NDVI</span>
                  {latestIndices.ndvi >= optimalValues.ndvi.optimal ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <AlertTriangle size={16} className="text-yellow-full max-w-sm" />
                  )}
                </div>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{latestIndices.ndvi.toFixed(3)}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Ottimale: {optimalValues.ndvi.optimal}
                </p>
              </div>
            )}
            
            {latestIndices.evi !== undefined && (
              <div className={`p-4 rounded-lg border-2 ${
                latestIndices.evi >= optimalValues.evi.optimal 
                  ? 'border-green-500 bg-green-50' 
                  : latestIndices.evi >= optimalValues.evi.min
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-red-500 bg-red-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">EVI</span>
                  {latestIndices.evi >= optimalValues.evi.optimal ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <AlertTriangle size={16} className="text-yellow-full max-w-sm" />
                  )}
                </div>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{latestIndices.evi.toFixed(3)}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Ottimale: {optimalValues.evi.optimal}
                </p>
              </div>
            )}
            
            {latestIndices.lai !== undefined && (
              <div className={`p-4 rounded-lg border-2 ${
                latestIndices.lai >= optimalValues.lai.optimal 
                  ? 'border-green-500 bg-green-50' 
                  : latestIndices.lai >= optimalValues.lai.min
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-red-500 bg-red-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">LAI</span>
                  {latestIndices.lai >= optimalValues.lai.optimal ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <AlertTriangle size={16} className="text-yellow-full max-w-sm" />
                  )}
                </div>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{latestIndices.lai.toFixed(2)}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Ottimale: {optimalValues.lai.optimal}
                </p>
              </div>
            )}
            
            {latestIndices.chlorophyllIndex !== undefined && (
              <div className={`p-4 rounded-lg border-2 ${
                latestIndices.chlorophyllIndex >= optimalValues.chlorophyllIndex.optimal 
                  ? 'border-green-500 bg-green-50' 
                  : latestIndices.chlorophyllIndex >= optimalValues.chlorophyllIndex.min
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-red-500 bg-red-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Chlorophyll</span>
                  {latestIndices.chlorophyllIndex >= optimalValues.chlorophyllIndex.optimal ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <AlertTriangle size={16} className="text-yellow-full max-w-sm" />
                  )}
                </div>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{latestIndices.chlorophyllIndex.toFixed(2)}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Ottimale: {optimalValues.chlorophyllIndex.optimal}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alerts */}
      {thresholds && !thresholds.isHealthy && (
        <div className="bg-yellow-50 border-l-4 border-yellow-full max-w-sm p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle size={20} className="text-yellow-full max-w-sm" />
            <h4 className="text-lg font-semibold text-yellow-full max-w-sm">Avvisi</h4>
          </div>
          <ul className="list-disc list-inside text-sm text-yellow-full max-w-sm">
            {thresholds.alerts.map((alert, i) => (
              <li key={i}>{alert}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold">Trend Indici Vegetativi</h4>
            <div className="flex items-center gap-3">
              <select
                value={selectedIndex}
                onChange={(e) => setSelectedIndex(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="ndvi">NDVI</option>
                <option value="evi">EVI</option>
                <option value="lai">LAI</option>
                <option value="chlorophyllIndex">Chlorophyll Index</option>
              </select>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <ReferenceLine 
                y={optimalValues[selectedIndex].optimal} 
                stroke="#10b981" 
                strokeDasharray="5 5"
                label={{ value: 'Ottimale', position: 'right' }}
              />
              <ReferenceLine 
                y={optimalValues[selectedIndex].min} 
                stroke="#f59e0b" 
                strokeDasharray="3 3"
                label={{ value: 'Minimo', position: 'right' }}
              />
              <Line 
                type="monotone" 
                dataKey={selectedIndex} 
                stroke="#3b82f6" 
                strokeWidth={2}
                name={selectedIndex.toUpperCase()}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Info Box */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <Info size={16} className="text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Cosa significano questi indici?</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li><strong>NDVI</strong>: Indice di vegetazione normalizzato. Valori alti indicano vegetazione sana e densa.</li>
                  <li><strong>EVI</strong>: Indice di vegetazione migliorato, più sensibile alle variazioni di biomassa.</li>
                  <li><strong>LAI</strong>: Indice di area fogliare. Misura la superficie fogliare per unità di terreno.</li>
                  <li><strong>Chlorophyll Index</strong>: Indice di clorofilla. Valori alti indicano buona fotosintesi.</li>
                </ul>
                <p className="text-xs mt-2 text-blue-700">
                  <strong>Nota:</strong> Questi indici sono calcolati da foto RGB e sono approssimazioni. 
                  Per misurazioni precise sono necessari sensori multispettrali o satellitari.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VegetationIndicesChart;







