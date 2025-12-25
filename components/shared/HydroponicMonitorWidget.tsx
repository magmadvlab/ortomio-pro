import React, { useState, useEffect } from 'react';
import { Garden } from '@/types';
import { HydroponicReading } from '@/types/indoorGrowing';
import { useStorage } from '@/packages/core/hooks/useStorage';
import { Droplets, AlertCircle } from 'lucide-react';

interface HydroponicMonitorWidgetProps {
  garden: Garden;
  onOpenDetails?: () => void;
}

export const HydroponicMonitorWidget: React.FC<HydroponicMonitorWidgetProps> = ({
  garden,
  onOpenDetails
}) => {
  const { storageProvider } = useStorage();
  const [readings, setReadings] = useState<HydroponicReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (garden.hydroponicConfig) {
      loadReadings();
    }
  }, [garden.id, garden.hydroponicConfig]);

  const loadReadings = async () => {
    try {
      const recentReadings = await storageProvider.getHydroponicReadings(garden.id, 1);
      setReadings(recentReadings);
    } catch (error) {
      console.error('Error loading hydroponic readings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!garden.hydroponicConfig) return null;

  const config = garden.hydroponicConfig;
  const lastReading = readings[0];
  const phTarget = config.nutrientSolution.phTarget;
  const ecTarget = config.nutrientSolution.ecTarget;
  const phCurrent = lastReading?.ph;
  const ecCurrent = lastReading?.ec;
  const volumeCurrent = lastReading?.reservoirVolume;
  const volumePercent = volumeCurrent && config.nutrientSolution.reservoirCapacity
    ? (volumeCurrent / config.nutrientSolution.reservoirCapacity) * 100
    : null;

  const phDiff = phCurrent ? Math.abs(phCurrent - phTarget) : null;
  const ecDiff = ecCurrent ? Math.abs(ecCurrent - ecTarget) : null;
  const phStatus = phDiff !== null ? (phDiff > 1 ? 'critical' : phDiff > 0.5 ? 'warning' : 'ok') : 'unknown';
  const ecStatus = ecDiff !== null ? (ecDiff > 1 ? 'critical' : ecDiff > 0.5 ? 'warning' : 'ok') : 'unknown';
  const volumeStatus = volumePercent !== null ? (volumePercent < 30 ? 'critical' : volumePercent < 50 ? 'warning' : 'ok') : 'unknown';

  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Droplets size={20} className="text-blue-600" />
          <h3 className="text-lg font-bold text-gray-800">Monitoraggio Idroponica</h3>
        </div>
        {onOpenDetails && (
          <button
            onClick={onOpenDetails}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Dettagli
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-4 text-gray-500 text-sm">Caricamento...</div>
      ) : !lastReading ? (
        <div className="text-center py-4 text-gray-500 text-sm">
          Nessuna lettura registrata. Aggiungi la prima lettura!
        </div>
      ) : (
        <div className="space-y-3">
          {/* pH */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">pH</span>
              <span className={`text-sm font-bold ${
                phStatus === 'critical' ? 'text-red-600' :
                phStatus === 'warning' ? 'text-yellow-600' :
                phStatus === 'ok' ? 'text-green-600' : 'text-gray-400'
              }`}>
                {phCurrent?.toFixed(2) || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    phStatus === 'critical' ? 'bg-red-500' :
                    phStatus === 'warning' ? 'bg-yellow-500' :
                    phStatus === 'ok' ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                  style={{ width: `${Math.min(100, ((phCurrent || 0) / 14) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">Target: {phTarget}</span>
            </div>
            {phStatus !== 'ok' && phDiff !== null && (
              <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                <AlertCircle size={12} />
                <span>Deviazione: {phDiff.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* EC */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">EC (mS/cm)</span>
              <span className={`text-sm font-bold ${
                ecStatus === 'critical' ? 'text-red-600' :
                ecStatus === 'warning' ? 'text-yellow-600' :
                ecStatus === 'ok' ? 'text-green-600' : 'text-gray-400'
              }`}>
                {ecCurrent?.toFixed(2) || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    ecStatus === 'critical' ? 'bg-red-500' :
                    ecStatus === 'warning' ? 'bg-yellow-500' :
                    ecStatus === 'ok' ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                  style={{ width: `${Math.min(100, ((ecCurrent || 0) / 5) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">Target: {ecTarget}</span>
            </div>
            {ecStatus !== 'ok' && ecDiff !== null && (
              <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                <AlertCircle size={12} />
                <span>Deviazione: {ecDiff.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Volume */}
          {volumePercent !== null && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Volume Serbatoio</span>
                <span className={`text-sm font-bold ${
                  volumeStatus === 'critical' ? 'text-red-600' :
                  volumeStatus === 'warning' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {volumePercent.toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      volumeStatus === 'critical' ? 'bg-red-500' :
                      volumeStatus === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${volumePercent}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {volumeCurrent?.toFixed(1)}L / {config.nutrientSolution.reservoirCapacity}L
                </span>
              </div>
            </div>
          )}

          {/* Temperatura */}
          {lastReading.waterTemperature && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Temperatura:</span> {lastReading.waterTemperature.toFixed(1)}°C
            </div>
          )}
        </div>
      )}
    </div>
  );
};













