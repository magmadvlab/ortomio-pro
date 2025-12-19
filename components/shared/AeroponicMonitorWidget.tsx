import React, { useState } from 'react';
import { Garden } from '@/types';
import { Wind } from 'lucide-react';

interface AeroponicMonitorWidgetProps {
  garden: Garden;
  onOpenDetails?: () => void;
}

export const AeroponicMonitorWidget: React.FC<AeroponicMonitorWidgetProps> = ({
  garden,
  onOpenDetails
}) => {
  if (!garden.aeroponicConfig) return null;

  const config = garden.aeroponicConfig;
  const daysSinceLastClean = config.maintenance.lastNozzleClean
    ? Math.floor((new Date().getTime() - new Date(config.maintenance.lastNozzleClean).getTime()) / (1000 * 60 * 60 * 24))
    : Infinity;

  const needsCleaning = daysSinceLastClean >= config.maintenance.cleanFrequencyDays;

  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wind size={20} className="text-purple-600" />
          <h3 className="text-lg font-bold text-gray-800">Monitoraggio Aeroponica</h3>
        </div>
        {onOpenDetails && (
          <button
            onClick={onOpenDetails}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Dettagli
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-sm text-gray-700 mb-1">Sistema Nebulizzazione</div>
          <div className="text-sm text-gray-600">
            {config.misting.nozzleCount} ugelli • {config.misting.mistFrequency} volte/giorno
          </div>
          {config.misting.pressure && (
            <div className="text-xs text-gray-500 mt-1">
              Pressione: {config.misting.pressure} PSI
            </div>
          )}
        </div>

        <div>
          <div className="text-sm text-gray-700 mb-1">Soluzione Nutritiva</div>
          <div className="text-sm text-gray-600">
            pH Target: {config.nutrientSolution.phTarget} • EC Target: {config.nutrientSolution.ecTarget} mS/cm
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-700 mb-1">Camera Radici</div>
          <div className="text-sm text-gray-600">
            Volume: {config.rootChamber.volume}L
            {config.rootChamber.hasDrainage && <span className="ml-2">✓ Drenaggio</span>}
            {config.rootChamber.hasVentilation && <span className="ml-2">✓ Ventilazione</span>}
          </div>
        </div>

        {needsCleaning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
            <div className="text-sm text-yellow-800">
              ⚠️ Pulizia ugelli necessaria ({daysSinceLastClean} giorni dall'ultima pulizia)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};








