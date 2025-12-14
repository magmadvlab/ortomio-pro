import React, { useState } from 'react';
import { IndoorGrowingConfig } from '@/types/indoorGrowing';
import { InfoTooltip } from '../shared/InfoTooltip';

interface IndoorConfigFormProps {
  initialConfig?: IndoorGrowingConfig;
  onSubmit: (config: IndoorGrowingConfig) => void;
  onCancel?: () => void;
}

export const IndoorConfigForm: React.FC<IndoorConfigFormProps> = ({
  initialConfig,
  onSubmit,
  onCancel
}) => {
  const [lightingType, setLightingType] = useState(
    initialConfig?.lighting.type || 'LED'
  );
  const [wattage, setWattage] = useState(
    initialConfig?.lighting.wattage?.toString() || ''
  );
  const [spectrum, setSpectrum] = useState(
    initialConfig?.lighting.spectrum || 'Full'
  );
  const [hoursPerDay, setHoursPerDay] = useState(
    initialConfig?.lighting.hoursPerDay?.toString() || '16'
  );
  const [tempMin, setTempMin] = useState(
    initialConfig?.climate.temperature.min?.toString() || '18'
  );
  const [tempMax, setTempMax] = useState(
    initialConfig?.climate.temperature.max?.toString() || '26'
  );
  const [tempTarget, setTempTarget] = useState(
    initialConfig?.climate.temperature.target?.toString() || '22'
  );
  const [humidityMin, setHumidityMin] = useState(
    initialConfig?.climate.humidity.min?.toString() || '40'
  );
  const [humidityMax, setHumidityMax] = useState(
    initialConfig?.climate.humidity.max?.toString() || '70'
  );
  const [humidityTarget, setHumidityTarget] = useState(
    initialConfig?.climate.humidity.target?.toString() || '55'
  );
  const [hasExtractor, setHasExtractor] = useState(
    initialConfig?.climate.ventilation.hasExtractor ?? true
  );
  const [hasIntake, setHasIntake] = useState(
    initialConfig?.climate.ventilation.hasIntake ?? true
  );
  const [hasCirculation, setHasCirculation] = useState(
    initialConfig?.climate.ventilation.hasCirculation ?? true
  );
  const [width, setWidth] = useState(
    initialConfig?.growSpace.width?.toString() || ''
  );
  const [length, setLength] = useState(
    initialConfig?.growSpace.length?.toString() || ''
  );
  const [height, setHeight] = useState(
    initialConfig?.growSpace.height?.toString() || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const config: IndoorGrowingConfig = {
      lighting: {
        type: lightingType as any,
        wattage: wattage ? parseFloat(wattage) : undefined,
        spectrum: spectrum as any,
        hoursPerDay: hoursPerDay ? parseFloat(hoursPerDay) : undefined,
      },
      climate: {
        temperature: {
          min: parseFloat(tempMin),
          max: parseFloat(tempMax),
          target: parseFloat(tempTarget),
        },
        humidity: {
          min: parseFloat(humidityMin),
          max: parseFloat(humidityMax),
          target: parseFloat(humidityTarget),
        },
        ventilation: {
          hasExtractor,
          hasIntake,
          hasCirculation,
        },
      },
      growSpace: {
        width: parseFloat(width),
        length: parseFloat(length),
        height: parseFloat(height),
      },
    };
    onSubmit(config);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Illuminazione</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo Illuminazione
            </label>
            <select
              value={lightingType}
              onChange={(e) => setLightingType(e.target.value as "Hybrid" | "LED" | "HPS" | "MH" | "Fluorescent" | "Natural")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="LED">LED</option>
              <option value="HPS">HPS</option>
              <option value="MH">MH</option>
              <option value="Fluorescent">Fluorescente</option>
              <option value="Natural">Naturale</option>
              <option value="Hybrid">Ibrido</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wattaggio Totale (W)
            </label>
            <input
              type="number"
              value={wattage}
              onChange={(e) => setWattage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spettro
            </label>
            <select
              value={spectrum}
              onChange={(e) => setSpectrum(e.target.value as "Full" | "Vegetative" | "Flowering" | "Custom")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="Full">Completo</option>
              <option value="Vegetative">Vegetativo</option>
              <option value="Flowering">Fioritura</option>
              <option value="Custom">Personalizzato</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ore Luce/Giorno
            </label>
            <input
              type="number"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="8"
              max="24"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Clima</h3>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temp Min (°C)</label>
            <input
              type="number"
              value={tempMin}
              onChange={(e) => setTempMin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="10"
              max="25"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temp Target (°C)</label>
            <input
              type="number"
              value={tempTarget}
              onChange={(e) => setTempTarget(e.target.value)}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Umidità Min (%)</label>
            <input
              type="number"
              value={humidityMin}
              onChange={(e) => setHumidityMin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="30"
              max="60"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Umidità Target (%)</label>
            <input
              type="number"
              value={humidityTarget}
              onChange={(e) => setHumidityTarget(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="40"
              max="70"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Umidità Max (%)</label>
            <input
              type="number"
              value={humidityMax}
              onChange={(e) => setHumidityMax(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="50"
              max="80"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={hasExtractor}
              onChange={(e) => setHasExtractor(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700">Aspiratore</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={hasIntake}
              onChange={(e) => setHasIntake(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700">Immissione Aria</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={hasCirculation}
              onChange={(e) => setHasCirculation(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700">Ventilazione Circolazione</span>
          </label>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Spazio Coltivabile</h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Larghezza (cm)</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lunghezza (cm)</label>
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Altezza (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="100"
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

