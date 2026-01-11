/**
 * Componente per mostrare informazioni su tipo terreno e altitudine
 * Mostra aggiustamenti applicati alle date e compatibilità piante
 */

import React from 'react';
import { Garden } from '../../types';
import { Mountain, Layers, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { calculateSoilWarmingDelay, getSoilCompatibility } from '../../utils/soilTemperatureUtils';
import { calculateAltitudePlantingDelay } from '../../utils/altitudeUtils';

interface SoilAltitudeInfoProps {
  garden: Garden;
  plantName?: string; // Opzionale: mostra compatibilità per una pianta specifica
  showAdjustments?: boolean; // Mostra informazioni su aggiustamenti date
}

const SoilAltitudeInfo: React.FC<SoilAltitudeInfoProps> = ({
  garden,
  plantName,
  showAdjustments = true,
}) => {
  const soilType = garden.soilType || 'Loamy';
  const altitudeMeters = garden.altitudeMeters || 0;

  // Calcola aggiustamenti
  const soilDelay = calculateSoilWarmingDelay(soilType);
  const altitudeDelay = altitudeMeters > 200 
    ? calculateAltitudePlantingDelay(altitudeMeters, 'standard')
    : 0;

  // Compatibilità terreno per pianta specifica
  let soilCompatibility = null;
  if (plantName) {
    soilCompatibility = getSoilCompatibility(plantName, soilType);
  }

  const getSoilTypeLabel = (type: Garden['soilType'] | undefined) => {
    const labels: Record<string, string> = {
      Loamy: 'Franco',
      Sandy: 'Sabbioso',
      Clay: 'Argilloso',
      Silty: 'Limoso',
      Peaty: 'Torboso',
      Chalky: 'Calcareo',
    };
    return labels[type || 'Loamy'] || type || 'Non specificato';
  };

  const getSoilDelayText = (delay: number) => {
    if (delay === 0) return 'Nessun aggiustamento';
    if (delay < 0) return `Anticipo di ${Math.abs(delay)} giorni`;
    return `Ritardo di ${delay} giorni`;
  };

  const getAltitudeDelayText = (delay: number) => {
    if (delay === 0) return 'Nessun aggiustamento';
    return `Ritardo di ${delay} giorni`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-3">
        <Info size={16} />
        Informazioni Terreno e Altitudine
      </h3>

      {/* Tipo Terreno */}
      <div className="flex items-start gap-3">
        <Layers size={16} className="text-gray-500 mt-0.5" />
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-700">
            Tipo Terreno: {getSoilTypeLabel(soilType)}
          </div>
          {showAdjustments && soilDelay !== 0 && (
            <div className="text-xs text-gray-600 mt-1">
              {getSoilDelayText(soilDelay)} per riscaldamento suolo
            </div>
          )}
        </div>
      </div>

      {/* Altitudine */}
      {altitudeMeters > 0 && (
        <div className="flex items-start gap-3">
          <Mountain size={16} className="text-gray-500 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700">
              Altitudine: {altitudeMeters}m s.l.m.
            </div>
            {showAdjustments && altitudeDelay > 0 && (
              <div className="text-xs text-gray-600 mt-1">
                {getAltitudeDelayText(altitudeDelay)} per impianto
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compatibilità Pianta */}
      {plantName && soilCompatibility && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-start gap-3">
            {soilCompatibility.compatible ? (
              <CheckCircle size={16} className="text-green-600 mt-0.5" />
            ) : (
              <AlertTriangle size={16} className="text-yellow-full max-w-sm mt-0.5" />
            )}
            <div className="flex-1">
              <div className={`text-sm font-medium ${
                soilCompatibility.compatible ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {plantName}: {soilCompatibility.compatible ? 'Compatibile' : 'Attenzione'}
              </div>
              {soilCompatibility.reason && (
                <div className="text-xs text-gray-600 mt-1">
                  {soilCompatibility.reason}
                </div>
              )}
              {soilCompatibility.optimalSoilTypes && soilCompatibility.optimalSoilTypes.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  Terreni ottimali: {soilCompatibility.optimalSoilTypes.join(', ')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Riepilogo Aggiustamenti Totali */}
      {showAdjustments && (soilDelay !== 0 || altitudeDelay > 0) && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-600">
            <strong>Aggiustamento totale:</strong>{' '}
            {soilDelay + altitudeDelay === 0 
              ? 'Nessun aggiustamento'
              : soilDelay + altitudeDelay < 0
              ? `Anticipo di ${Math.abs(soilDelay + altitudeDelay)} giorni`
              : `Ritardo di ${soilDelay + altitudeDelay} giorni`
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default SoilAltitudeInfo;

