import React, { useState } from 'react';
import { AquaponicSystemConfig, AquaponicSystemType } from '@/types/indoorGrowing';
import { InfoTooltip } from '../shared/InfoTooltip';

interface AquaponicConfigFormProps {
  initialConfig?: AquaponicSystemConfig;
  onSubmit: (config: AquaponicSystemConfig) => void;
  onCancel?: () => void;
}

export const AquaponicConfigForm: React.FC<AquaponicConfigFormProps> = ({
  initialConfig,
  onSubmit,
  onCancel
}) => {
  const [systemType, setSystemType] = useState<AquaponicSystemType>(
    initialConfig?.systemType || 'MediaBed'
  );
  const [tankCapacity, setTankCapacity] = useState(
    initialConfig?.fishTank.capacity?.toString() || '500'
  );
  const [fishSpecies, setFishSpecies] = useState(
    initialConfig?.fishTank.fishSpecies?.join(', ') || ''
  );
  const [fishCount, setFishCount] = useState(
    initialConfig?.fishTank.fishCount?.toString() || ''
  );
  const [hasMechanicalFilter, setHasMechanicalFilter] = useState(
    initialConfig?.filtration.hasMechanicalFilter ?? true
  );
  const [hasBiologicalFilter, setHasBiologicalFilter] = useState(
    initialConfig?.filtration.hasBiologicalFilter ?? true
  );
  const [phTarget, setPhTarget] = useState(
    initialConfig?.waterQuality.phTarget?.toString() || '7.0'
  );
  const [ammoniaTarget, setAmmoniaTarget] = useState(
    initialConfig?.waterQuality.ammoniaTarget?.toString() || '0.5'
  );
  const [nitriteTarget, setNitriteTarget] = useState(
    initialConfig?.waterQuality.nitriteTarget?.toString() || '0.5'
  );
  const [nitrateTarget, setNitrateTarget] = useState(
    initialConfig?.waterQuality.nitrateTarget?.toString() || '50'
  );
  const [tempMin, setTempMin] = useState(
    initialConfig?.waterQuality.temperature.min?.toString() || '20'
  );
  const [tempMax, setTempMax] = useState(
    initialConfig?.waterQuality.temperature.max?.toString() || '28'
  );
  const [pumpFlowRate, setPumpFlowRate] = useState(
    initialConfig?.waterCycle.pumpFlowRate?.toString() || '10'
  );
  const [testFrequencyDays, setTestFrequencyDays] = useState(
    initialConfig?.maintenance.testFrequencyDays?.toString() || '3'
  );
  const [feedFrequency, setFeedFrequency] = useState(
    initialConfig?.maintenance.feedFrequency?.toString() || '2'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const config: AquaponicSystemConfig = {
      systemType,
      fishTank: {
        capacity: parseFloat(tankCapacity),
        fishSpecies: fishSpecies ? fishSpecies.split(',').map(s => s.trim()) : undefined,
        fishCount: fishCount ? parseInt(fishCount) : undefined,
      },
      filtration: {
        hasMechanicalFilter,
        hasBiologicalFilter,
      },
      waterQuality: {
        phTarget: parseFloat(phTarget),
        ammoniaTarget: parseFloat(ammoniaTarget),
        nitriteTarget: parseFloat(nitriteTarget),
        nitrateTarget: parseFloat(nitrateTarget),
        temperature: {
          min: parseFloat(tempMin),
          max: parseFloat(tempMax),
        },
      },
      waterCycle: {
        pumpFlowRate: parseFloat(pumpFlowRate),
        cycleFrequency: 24,
        cycleDuration: 60,
      },
      maintenance: {
        testFrequencyDays: parseInt(testFrequencyDays),
        feedFrequency: parseInt(feedFrequency),
      },
    };
    onSubmit(config);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo Sistema Acquaponico
        </label>
        <select
          value={systemType}
          onChange={(e) => setSystemType(e.target.value as AquaponicSystemType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="MediaBed">Media Bed</option>
          <option value="NFT">NFT</option>
          <option value="DWC">DWC</option>
          <option value="Hybrid">Ibrido</option>
        </select>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Vasca Pesci</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacità Vasca (L)
            </label>
            <input
              type="number"
              value={tankCapacity}
              onChange={(e) => setTankCapacity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
              min="50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specie Pesci (separate da virgola)
            </label>
            <input
              type="text"
              value={fishSpecies}
              onChange={(e) => setFishSpecies(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="es. Tilapia, Carpe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numero Pesci
            </label>
            <input
              type="number"
              value={fishCount}
              onChange={(e) => setFishCount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="1"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Filtrazione</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={hasMechanicalFilter}
              onChange={(e) => setHasMechanicalFilter(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700">Filtro Meccanico</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={hasBiologicalFilter}
              onChange={(e) => setHasBiologicalFilter(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700">Filtro Biologico</span>
          </label>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Parametri Qualità Acqua Target</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">pH Target</label>
            <input
              type="number"
              value={phTarget}
              onChange={(e) => setPhTarget(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              step="0.1"
              min="6.5"
              max="7.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ammoniaca Target (mg/L)</label>
            <input
              type="number"
              value={ammoniaTarget}
              onChange={(e) => setAmmoniaTarget(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              step="0.1"
              min="0"
              max="2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nitriti Target (mg/L)</label>
            <input
              type="number"
              value={nitriteTarget}
              onChange={(e) => setNitriteTarget(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              step="0.1"
              min="0"
              max="2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nitrati Target (mg/L)</label>
            <input
              type="number"
              value={nitrateTarget}
              onChange={(e) => setNitrateTarget(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="20"
              max="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temp Min (°C)</label>
            <input
              type="number"
              value={tempMin}
              onChange={(e) => setTempMin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="15"
              max="30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temp Max (°C)</label>
            <input
              type="number"
              value={tempMax}
              onChange={(e) => setTempMax(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="20"
              max="35"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Ciclo Acqua</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Portata Pompa (L/min)
          </label>
          <input
            type="number"
            value={pumpFlowRate}
            onChange={(e) => setPumpFlowRate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            min="1"
          />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Manutenzione</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequenza Test Acqua (giorni)
            </label>
            <input
              type="number"
              value={testFrequencyDays}
              onChange={(e) => setTestFrequencyDays(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="1"
              max="7"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequenza Alimentazione (volte/giorno)
            </label>
            <input
              type="number"
              value={feedFrequency}
              onChange={(e) => setFeedFrequency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="1"
              max="4"
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






