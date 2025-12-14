import React, { useState } from 'react';
import { AeroponicSystemConfig, AeroponicSystemType } from '@/types/indoorGrowing';
import { InfoTooltip } from '../shared/InfoTooltip';

interface AeroponicConfigFormProps {
  initialConfig?: AeroponicSystemConfig;
  onSubmit: (config: AeroponicSystemConfig) => void;
  onCancel?: () => void;
}

export const AeroponicConfigForm: React.FC<AeroponicConfigFormProps> = ({
  initialConfig,
  onSubmit,
  onCancel
}) => {
  const [systemType, setSystemType] = useState<AeroponicSystemType>(
    initialConfig?.systemType || 'HighPressure'
  );
  const [nozzleCount, setNozzleCount] = useState(
    initialConfig?.misting.nozzleCount?.toString() || '8'
  );
  const [mistFrequency, setMistFrequency] = useState(
    initialConfig?.misting.mistFrequency?.toString() || '48'
  );
  const [mistDuration, setMistDuration] = useState(
    initialConfig?.misting.mistDuration?.toString() || '5'
  );
  const [mistInterval, setMistInterval] = useState(
    initialConfig?.misting.mistInterval?.toString() || '5'
  );
  const [pressure, setPressure] = useState(
    initialConfig?.misting.pressure?.toString() || '80'
  );
  const [reservoirCapacity, setReservoirCapacity] = useState(
    initialConfig?.nutrientSolution.reservoirCapacity?.toString() || '50'
  );
  const [phTarget, setPhTarget] = useState(
    initialConfig?.nutrientSolution.phTarget?.toString() || '6.0'
  );
  const [ecTarget, setEcTarget] = useState(
    initialConfig?.nutrientSolution.ecTarget?.toString() || '2.0'
  );
  const [chamberVolume, setChamberVolume] = useState(
    initialConfig?.rootChamber.volume?.toString() || '100'
  );
  const [hasDrainage, setHasDrainage] = useState(
    initialConfig?.rootChamber.hasDrainage ?? true
  );
  const [hasVentilation, setHasVentilation] = useState(
    initialConfig?.rootChamber.hasVentilation ?? true
  );
  const [cleanFrequencyDays, setCleanFrequencyDays] = useState(
    initialConfig?.maintenance.cleanFrequencyDays?.toString() || '7'
  );
  const [changeFrequencyDays, setChangeFrequencyDays] = useState(
    initialConfig?.maintenance.changeFrequencyDays?.toString() || '14'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const config: AeroponicSystemConfig = {
      systemType,
      misting: {
        nozzleCount: parseInt(nozzleCount),
        nozzleFlowRate: 0.5,
        mistFrequency: parseInt(mistFrequency),
        mistDuration: parseInt(mistDuration),
        mistInterval: parseInt(mistInterval),
        pressure: systemType === 'HighPressure' ? parseFloat(pressure) : undefined,
      },
      nutrientSolution: {
        reservoirCapacity: parseFloat(reservoirCapacity),
        phTarget: parseFloat(phTarget),
        ecTarget: parseFloat(ecTarget),
      },
      rootChamber: {
        volume: parseFloat(chamberVolume),
        hasDrainage,
        hasVentilation,
      },
      maintenance: {
        cleanFrequencyDays: parseInt(cleanFrequencyDays),
        changeFrequencyDays: parseInt(changeFrequencyDays),
      },
    };
    onSubmit(config);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo Sistema Aeroponico
        </label>
        <select
          value={systemType}
          onChange={(e) => setSystemType(e.target.value as AeroponicSystemType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="HighPressure">Alta Pressione</option>
          <option value="LowPressure">Bassa Pressione</option>
          <option value="Ultrasonic">Ultrasonico</option>
        </select>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Nebulizzazione</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numero Ugelli
            </label>
            <input
              type="number"
              value={nozzleCount}
              onChange={(e) => setNozzleCount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="1"
            />
          </div>
          {systemType === 'HighPressure' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pressione (PSI)
              </label>
              <input
                type="number"
                value={pressure}
                onChange={(e) => setPressure(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="40"
                max="120"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequenza Nebulizzazione (volte/giorno)
            </label>
            <input
              type="number"
              value={mistFrequency}
              onChange={(e) => setMistFrequency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="12"
              max="144"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Durata Ciclo (secondi)
            </label>
            <input
              type="number"
              value={mistDuration}
              onChange={(e) => setMistDuration(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="3"
              max="15"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Intervallo tra Cicli (minuti)
            </label>
            <input
              type="number"
              value={mistInterval}
              onChange={(e) => setMistInterval(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="1"
              max="30"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Soluzione Nutritiva</h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacità Serbatoio (L)
            </label>
            <input
              type="number"
              value={reservoirCapacity}
              onChange={(e) => setReservoirCapacity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              pH Target
            </label>
            <input
              type="number"
              value={phTarget}
              onChange={(e) => setPhTarget(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              step="0.1"
              min="5"
              max="7"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              EC Target (mS/cm)
            </label>
            <input
              type="number"
              value={ecTarget}
              onChange={(e) => setEcTarget(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              step="0.1"
              min="1"
              max="3"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Camera Radici</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Volume Camera (L)
            </label>
            <input
              type="number"
              value={chamberVolume}
              onChange={(e) => setChamberVolume(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="20"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={hasDrainage}
                onChange={(e) => setHasDrainage(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Sistema di Drenaggio</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={hasVentilation}
                onChange={(e) => setHasVentilation(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Ventilazione</span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Manutenzione</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequenza Pulizia Ugelli (giorni)
            </label>
            <input
              type="number"
              value={cleanFrequencyDays}
              onChange={(e) => setCleanFrequencyDays(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="3"
              max="14"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequenza Cambio Soluzione (giorni)
            </label>
            <input
              type="number"
              value={changeFrequencyDays}
              onChange={(e) => setChangeFrequencyDays(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="7"
              max="30"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Annulla
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Salva Configurazione
        </button>
      </div>
    </form>
  );
};


