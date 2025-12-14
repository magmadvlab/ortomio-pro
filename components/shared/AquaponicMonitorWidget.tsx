import React, { useState, useEffect } from 'react';
import { Garden } from '@/types';
import { AquaponicReading } from '@/types/indoorGrowing';
import { useStorage } from '@/packages/core/hooks/useStorage';
import { Fish, AlertCircle } from 'lucide-react';

interface AquaponicMonitorWidgetProps {
  garden: Garden;
  onOpenDetails?: () => void;
}

export const AquaponicMonitorWidget: React.FC<AquaponicMonitorWidgetProps> = ({
  garden,
  onOpenDetails
}) => {
  const { storageProvider } = useStorage();
  const [readings, setReadings] = useState<AquaponicReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (garden.aquaponicConfig) {
      loadReadings();
    }
  }, [garden.id, garden.aquaponicConfig]);

  const loadReadings = async () => {
    try {
      const recentReadings = await storageProvider.getAquaponicReadings(garden.id, 1);
      setReadings(recentReadings);
    } catch (error) {
      console.error('Error loading aquaponic readings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!garden.aquaponicConfig) return null;

  const config = garden.aquaponicConfig;
  const lastReading = readings[0];

  const getStatus = (value: number | undefined, target: number, maxSafe: number) => {
    if (!value) return 'unknown';
    if (value > maxSafe) return 'critical';
    if (value > target * 1.5) return 'warning';
    return 'ok';
  };

  const phStatus = getStatus(lastReading?.ph, config.waterQuality.phTarget, 7.5);
  const ammoniaStatus = getStatus(lastReading?.ammonia, config.waterQuality.ammoniaTarget, config.waterQuality.ammoniaTarget * 2);
  const nitriteStatus = getStatus(lastReading?.nitrite, config.waterQuality.nitriteTarget, config.waterQuality.nitriteTarget * 2);
  const nitrateStatus = lastReading?.nitrate ? (lastReading.nitrate < 20 ? 'warning' : lastReading.nitrate > 100 ? 'warning' : 'ok') : 'unknown';

  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Fish size={20} className="text-blue-600" />
          <h3 className="text-lg font-bold text-gray-800">Monitoraggio Acquaponica</h3>
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
          Nessuna lettura registrata. Aggiungi il primo test acqua!
        </div>
      ) : (
        <div className="space-y-2">
          {/* pH */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">pH</span>
            <span className={`text-sm font-bold ${
              phStatus === 'critical' ? 'text-red-600' :
              phStatus === 'warning' ? 'text-yellow-600' :
              phStatus === 'ok' ? 'text-green-600' : 'text-gray-400'
            }`}>
              {lastReading.ph?.toFixed(2) || 'N/A'}
            </span>
          </div>

          {/* Ammoniaca */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Ammoniaca (mg/L)</span>
            <span className={`text-sm font-bold ${
              ammoniaStatus === 'critical' ? 'text-red-600' :
              ammoniaStatus === 'warning' ? 'text-yellow-600' :
              ammoniaStatus === 'ok' ? 'text-green-600' : 'text-gray-400'
            }`}>
              {lastReading.ammonia?.toFixed(2) || 'N/A'}
            </span>
          </div>
          {ammoniaStatus === 'critical' && (
            <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 p-1 rounded">
              <AlertCircle size={12} />
              <span>CRITICO per pesci!</span>
            </div>
          )}

          {/* Nitriti */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Nitriti (mg/L)</span>
            <span className={`text-sm font-bold ${
              nitriteStatus === 'critical' ? 'text-red-600' :
              nitriteStatus === 'warning' ? 'text-yellow-600' :
              nitriteStatus === 'ok' ? 'text-green-600' : 'text-gray-400'
            }`}>
              {lastReading.nitrite?.toFixed(2) || 'N/A'}
            </span>
          </div>
          {nitriteStatus === 'critical' && (
            <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 p-1 rounded">
              <AlertCircle size={12} />
              <span>CRITICO per pesci!</span>
            </div>
          )}

          {/* Nitrati */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Nitrati (mg/L)</span>
            <span className={`text-sm font-bold ${
              nitrateStatus === 'warning' ? 'text-yellow-600' :
              nitrateStatus === 'ok' ? 'text-green-600' : 'text-gray-400'
            }`}>
              {lastReading.nitrate?.toFixed(2) || 'N/A'}
            </span>
          </div>

          {/* Temperatura */}
          {lastReading.waterTemperature && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Temperatura:</span>
              <span>{lastReading.waterTemperature.toFixed(1)}°C</span>
            </div>
          )}

          {/* Ossigeno */}
          {lastReading.dissolvedOxygen && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Ossigeno (mg/L):</span>
              <span>{lastReading.dissolvedOxygen.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


