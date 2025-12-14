import React, { useState, useEffect } from 'react';
import { GardenTask, Garden } from '../types';
import { VineCrop } from '../types/vine';
import { calculateBrixProgress, estimateDaysToHarvest, isOptimalHarvestTime } from '../logic/vineEngine';
import { getMasterSheet } from '../services/plantMasterService';
import { getWeatherForecast } from '../services/weatherService';
import { TrendingUp, AlertCircle, CheckCircle, Calendar } from 'lucide-react';

interface BrixMonitorProps {
  task: GardenTask;
  garden: Garden;
  onUpdateBrix?: (brix: number) => void;
}

const BrixMonitor: React.FC<BrixMonitorProps> = ({ task, garden, onUpdateBrix }) => {
  const [currentBrix, setCurrentBrix] = useState<number | null>(null);
  const [estimatedBrix, setEstimatedBrix] = useState<number | null>(null);

  const masterData = getMasterSheet(task.plantName);
  const vineCrop = masterData as unknown as VineCrop | undefined;

  useEffect(() => {
    if (!vineCrop || vineCrop.cropType !== 'Vine') return;

    // Calcola Brix stimato
    const updateBrix = async () => {
      let weather;
      if (garden.coordinates) {
        weather = await getWeatherForecast(garden.coordinates.latitude, garden.coordinates.longitude);
      }
      const estimated = calculateBrixProgress(vineCrop, new Date(), weather ?? undefined);
      setEstimatedBrix(estimated ?? null);
    };

    updateBrix();
  }, [vineCrop, garden.coordinates]);

  if (!vineCrop || vineCrop.cropType !== 'Vine') {
    return null;
  }

  const brixToUse = currentBrix !== null ? currentBrix : estimatedBrix || 0;
  const daysToHarvest = estimateDaysToHarvest(vineCrop, brixToUse, new Date());
  const isReady = isOptimalHarvestTime(vineCrop, brixToUse, new Date());
  const progress = Math.min((brixToUse / vineCrop.brixTarget) * 100, 100);

  return (
    <div className="p-6 bg-white rounded-xl border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="text-purple-500" size={24} />
        <h3 className="text-xl font-bold text-gray-800">Monitoraggio Brix</h3>
      </div>

      {/* Input Brix Manuale */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Brix Attuale (Gradi)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="0"
            max="30"
            step="0.1"
            value={currentBrix !== null ? currentBrix : ''}
            onChange={(e) => {
              const value = e.target.value ? parseFloat(e.target.value) : null;
              setCurrentBrix(value);
              if (value !== null && onUpdateBrix) {
                onUpdateBrix(value);
              }
            }}
            placeholder={estimatedBrix ? estimatedBrix.toFixed(1) : 'Inserisci Brix'}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          <span className="text-gray-600">°Brix</span>
        </div>
        {estimatedBrix && currentBrix === null && (
          <p className="text-xs text-gray-500 mt-1">
            Stima automatica: {estimatedBrix.toFixed(1)}°Brix
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Progresso Maturazione</span>
          <span className="text-sm font-bold text-purple-600">
            {brixToUse.toFixed(1)}° / {vineCrop.brixTarget}°
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isReady ? 'bg-green-500' : progress > 80 ? 'bg-yellow-500' : 'bg-purple-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stato Vendemmia */}
      {isReady ? (
        <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="text-green-600" size={20} />
            <span className="font-semibold text-green-800">Pronto per Vendemmia!</span>
          </div>
          <p className="text-sm text-green-700">
            Il Brix target è stato raggiunto. Raccogli immediatamente per qualità ottimale.
          </p>
        </div>
      ) : daysToHarvest !== null ? (
        <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="text-blue-600" size={20} />
            <span className="font-semibold text-blue-800">Stima Giorni alla Vendemmia</span>
          </div>
          <p className="text-sm text-blue-700">
            Circa <strong>{daysToHarvest} giorni</strong> alla vendemmia (basato su trend attuale).
          </p>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-300 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="text-gray-600" size={20} />
            <span className="font-semibold text-gray-800">Fuori Periodo</span>
          </div>
          <p className="text-sm text-gray-700">
            Il periodo di vendemmia va da{' '}
            {new Date(2024, vineCrop.harvestWindow.startMonth - 1, 1).toLocaleDateString('it-IT', { month: 'long' })}{' '}
            a{' '}
            {new Date(2024, vineCrop.harvestWindow.endMonth - 1, 1).toLocaleDateString('it-IT', { month: 'long' })}.
          </p>
        </div>
      )}

      {/* Info Varietà */}
      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
        <div className="text-sm text-gray-600 mb-1">Varietà</div>
        <div className="font-bold text-gray-800">{task.plantName} {task.variety ? `- ${task.variety}` : ''}</div>
        <div className="text-sm text-gray-600 mt-2">
          Sistema: {vineCrop.trainingSystem} | Target: {vineCrop.brixTarget}°Brix
        </div>
      </div>
    </div>
  );
};

export default BrixMonitor;

