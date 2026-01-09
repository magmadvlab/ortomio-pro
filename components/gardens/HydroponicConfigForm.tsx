import React, { useState } from 'react';
import { HydroponicSystemConfig, HydroponicSystemType } from '@/types/indoorGrowing';
import { InfoTooltip } from '../shared/InfoTooltip';

interface HydroponicConfigFormProps {
  initialConfig?: HydroponicSystemConfig;
  onSubmit: (config: HydroponicSystemConfig) => void;
  onCancel?: () => void;
}

export const HydroponicConfigForm: React.FC<HydroponicConfigFormProps> = ({
  initialConfig,
  onSubmit,
  onCancel
}) => {
  const [systemType, setSystemType] = useState<HydroponicSystemType>(
    initialConfig?.systemType || 'NFT'
  );
  
  // Soluzione nutritiva
  const [reservoirCapacity, setReservoirCapacity] = useState(
    initialConfig?.nutrientSolution.reservoirCapacity?.toString() || '50'
  );
  const [currentVolume, setCurrentVolume] = useState(
    initialConfig?.nutrientSolution.currentVolume?.toString() || ''
  );
  const [phTarget, setPhTarget] = useState(
    initialConfig?.nutrientSolution.phTarget?.toString() || '6.0'
  );
  const [phCurrent, setPhCurrent] = useState(
    initialConfig?.nutrientSolution.phCurrent?.toString() || ''
  );
  const [ecTarget, setEcTarget] = useState(
    initialConfig?.nutrientSolution.ecTarget?.toString() || '2.0'
  );
  const [ecCurrent, setEcCurrent] = useState(
    initialConfig?.nutrientSolution.ecCurrent?.toString() || ''
  );
  const [nutrientBrand, setNutrientBrand] = useState(
    initialConfig?.nutrientSolution.nutrientBrand || ''
  );
  const [nutrientFormula, setNutrientFormula] = useState(
    initialConfig?.nutrientSolution.nutrientFormula || ''
  );

  // NFT Config
  const [channelLength, setChannelLength] = useState(
    initialConfig?.nftConfig?.channelLength?.toString() || '300'
  );
  const [channelSlope, setChannelSlope] = useState(
    initialConfig?.nftConfig?.channelSlope?.toString() || '2'
  );
  const [flowRate, setFlowRate] = useState(
    initialConfig?.nftConfig?.flowRate?.toString() || '2'
  );
  const [channelCount, setChannelCount] = useState(
    initialConfig?.nftConfig?.channelCount?.toString() || '4'
  );

  // DWC Config
  const [bucketSize, setBucketSize] = useState(
    initialConfig?.dwcConfig?.bucketSize?.toString() || '20'
  );
  const [bucketCount, setBucketCount] = useState(
    initialConfig?.dwcConfig?.bucketCount?.toString() || '4'
  );
  const [airPumpPower, setAirPumpPower] = useState(
    initialConfig?.dwcConfig?.airPumpPower?.toString() || ''
  );
  const [airStoneCount, setAirStoneCount] = useState(
    initialConfig?.dwcConfig?.airStoneCount?.toString() || ''
  );

  // Ebb & Flow Config
  const [floodDepth, setFloodDepth] = useState(
    initialConfig?.ebbFlowConfig?.floodDepth?.toString() || '5'
  );
  const [floodDuration, setFloodDuration] = useState(
    initialConfig?.ebbFlowConfig?.floodDuration?.toString() || '15'
  );
  const [drainDuration, setDrainDuration] = useState(
    initialConfig?.ebbFlowConfig?.drainDuration?.toString() || '15'
  );
  const [floodFrequency, setFloodFrequency] = useState(
    initialConfig?.ebbFlowConfig?.floodFrequency?.toString() || '4'
  );

  // Drip Config
  const [dripperFlowRate, setDripperFlowRate] = useState(
    initialConfig?.dripConfig?.dripperFlowRate?.toString() || '2'
  );
  const [dripperCount, setDripperCount] = useState(
    initialConfig?.dripConfig?.dripperCount?.toString() || '8'
  );
  const [timerFrequency, setTimerFrequency] = useState(
    initialConfig?.dripConfig?.timerFrequency?.toString() || '3'
  );
  const [timerDuration, setTimerDuration] = useState(
    initialConfig?.dripConfig?.timerDuration?.toString() || '30'
  );

  // Manutenzione
  const [changeFrequencyDays, setChangeFrequencyDays] = useState(
    initialConfig?.maintenance.changeFrequencyDays?.toString() || '14'
  );
  const [phCheckFrequencyDays, setPhCheckFrequencyDays] = useState(
    initialConfig?.maintenance.phCheckFrequencyDays?.toString() || '2'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const config: HydroponicSystemConfig = {
      systemType,
      nutrientSolution: {
        reservoirCapacity: parseFloat(reservoirCapacity),
        currentVolume: currentVolume ? parseFloat(currentVolume) : undefined,
        phTarget: parseFloat(phTarget),
        phCurrent: phCurrent ? parseFloat(phCurrent) : undefined,
        ecTarget: parseFloat(ecTarget),
        ecCurrent: ecCurrent ? parseFloat(ecCurrent) : undefined,
        nutrientBrand: nutrientBrand || undefined,
        nutrientFormula: nutrientFormula || undefined,
      },
      nftConfig: systemType === 'NFT' ? {
        channelLength: parseFloat(channelLength),
        channelSlope: parseFloat(channelSlope),
        flowRate: parseFloat(flowRate),
        channelCount: parseInt(channelCount),
      } : undefined,
      dwcConfig: systemType === 'DWC' ? {
        bucketSize: parseFloat(bucketSize),
        bucketCount: parseInt(bucketCount),
        airPumpPower: airPumpPower ? parseFloat(airPumpPower) : undefined,
        airStoneCount: airStoneCount ? parseInt(airStoneCount) : undefined,
      } : undefined,
      ebbFlowConfig: systemType === 'EbbFlow' ? {
        floodDepth: parseFloat(floodDepth),
        floodDuration: parseFloat(floodDuration),
        drainDuration: parseFloat(drainDuration),
        floodFrequency: parseFloat(floodFrequency),
      } : undefined,
      dripConfig: systemType === 'Drip' ? {
        dripperFlowRate: parseFloat(dripperFlowRate),
        dripperCount: parseInt(dripperCount),
        timerFrequency: parseFloat(timerFrequency),
        timerDuration: parseFloat(timerDuration),
      } : undefined,
      maintenance: {
        changeFrequencyDays: parseInt(changeFrequencyDays),
        phCheckFrequencyDays: parseInt(phCheckFrequencyDays),
      },
    };
    onSubmit(config);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo Sistema Idroponico
          <InfoTooltip content="Seleziona il tipo di sistema idroponico" />
        </label>
        <select
          value={systemType}
          onChange={(e) => setSystemType(e.target.value as HydroponicSystemType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="NFT">NFT (Tecnica del Film Nutriente)</option>
          <option value="DWC">DWC (Coltura in Acqua Profonda)</option>
          <option value="EbbFlow">Flusso e Riflusso</option>
          <option value="Drip">Sistema a Goccia</option>
          <option value="Wick">Sistema a Stoppino</option>
          <option value="Kratky">Metodo Kratky</option>
        </select>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Soluzione Nutritiva</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacità Serbatoio (L)
              <InfoTooltip content="Capacità totale del serbatoio in litri" />
            </label>
            <input
              type="number"
              value={reservoirCapacity}
              onChange={(e) => setReservoirCapacity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Volume Attuale (L)
              <InfoTooltip content="Volume attuale di soluzione nel serbatoio" />
            </label>
            <input
              type="number"
              value={currentVolume}
              onChange={(e) => setCurrentVolume(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              pH Target
              <InfoTooltip content="pH target della soluzione (5.5-6.5 per la maggior parte delle piante)" />
            </label>
            <input
              type="number"
              value={phTarget}
              onChange={(e) => setPhTarget(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
              step="0.1"
              min="4"
              max="8"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              pH Attuale
              <InfoTooltip content="pH attuale della soluzione (opzionale)" />
            </label>
            <input
              type="number"
              value={phCurrent}
              onChange={(e) => setPhCurrent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              step="0.1"
              min="4"
              max="8"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              EC Target (mS/cm)
              <InfoTooltip content="Conducibilità elettrica target (1.5-3.0 per la maggior parte delle piante)" />
            </label>
            <input
              type="number"
              value={ecTarget}
              onChange={(e) => setEcTarget(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
              step="0.1"
              min="0.5"
              max="5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              EC Attuale (mS/cm)
              <InfoTooltip content="EC attuale della soluzione (opzionale)" />
            </label>
            <input
              type="number"
              value={ecCurrent}
              onChange={(e) => setEcCurrent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              step="0.1"
              min="0"
              max="5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marca Nutrienti
              <InfoTooltip content="Marca dei nutrienti utilizzati (opzionale)" />
            </label>
            <input
              type="text"
              value={nutrientBrand}
              onChange={(e) => setNutrientBrand(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="es. General Hydroponics"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Formula NPK
              <InfoTooltip content="Formula NPK dei nutrienti (es. 5-5-5)" />
            </label>
            <input
              type="text"
              value={nutrientFormula}
              onChange={(e) => setNutrientFormula(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="es. 5-5-5"
            />
          </div>
        </div>
      </div>

      {systemType === 'NFT' && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Configurazione NFT</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lunghezza Canali (cm)
              </label>
              <input
                type="number"
                value={channelLength}
                onChange={(e) => setChannelLength(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pendenza (%)
              </label>
              <input
                type="number"
                value={channelSlope}
                onChange={(e) => setChannelSlope(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                step="0.1"
                min="1"
                max="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Portata (L/min)
              </label>
              <input
                type="number"
                value={flowRate}
                onChange={(e) => setFlowRate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="0.5"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numero Canali
              </label>
              <input
                type="number"
                value={channelCount}
                onChange={(e) => setChannelCount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="1"
              />
            </div>
          </div>
        </div>
      )}

      {systemType === 'DWC' && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Configurazione DWC</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dimensione Secchi (L)
              </label>
              <input
                type="number"
                value={bucketSize}
                onChange={(e) => setBucketSize(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numero Secchi
              </label>
              <input
                type="number"
                value={bucketCount}
                onChange={(e) => setBucketCount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Potenza Pompa Aria (W)
              </label>
              <input
                type="number"
                value={airPumpPower}
                onChange={(e) => setAirPumpPower(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numero Pietre Porose
              </label>
              <input
                type="number"
                value={airStoneCount}
                onChange={(e) => setAirStoneCount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="1"
              />
            </div>
          </div>
        </div>
      )}

      {systemType === 'EbbFlow' && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Configurazione Flusso e Riflusso</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profondità Allagamento (cm)
              </label>
              <input
                type="number"
                value={floodDepth}
                onChange={(e) => setFloodDepth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="2"
                max="15"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durata Allagamento (min)
              </label>
              <input
                type="number"
                value={floodDuration}
                onChange={(e) => setFloodDuration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="5"
                max="60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durata Scolo (min)
              </label>
              <input
                type="number"
                value={drainDuration}
                onChange={(e) => setDrainDuration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="5"
                max="60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequenza Allagamento (volte/giorno)
              </label>
              <input
                type="number"
                value={floodFrequency}
                onChange={(e) => setFloodFrequency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="1"
                max="12"
              />
            </div>
          </div>
        </div>
      )}

      {systemType === 'Drip' && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Configurazione Drip</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Portata Gocciolatore (L/h)
              </label>
              <input
                type="number"
                value={dripperFlowRate}
                onChange={(e) => setDripperFlowRate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="0.5"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numero Gocciolatori
              </label>
              <input
                type="number"
                value={dripperCount}
                onChange={(e) => setDripperCount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequenza Timer (volte/giorno)
              </label>
              <input
                type="number"
                value={timerFrequency}
                onChange={(e) => setTimerFrequency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="1"
                max="12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durata Ciclo (min)
              </label>
              <input
                type="number"
                value={timerDuration}
                onChange={(e) => setTimerDuration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="5"
                max="120"
              />
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Manutenzione</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequenza Cambio Soluzione (giorni)
              <InfoTooltip content="Ogni quanti giorni cambiare completamente la soluzione nutritiva" />
            </label>
            <input
              type="number"
              value={changeFrequencyDays}
              onChange={(e) => setChangeFrequencyDays(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
              min="7"
              max="30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequenza Controllo pH (giorni)
              <InfoTooltip content="Ogni quanti giorni controllare il pH della soluzione" />
            </label>
            <input
              type="number"
              value={phCheckFrequencyDays}
              onChange={(e) => setPhCheckFrequencyDays(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
              min="1"
              max="7"
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

