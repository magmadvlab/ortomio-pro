import React, { useState, useEffect } from 'react';
import { InfoTooltip } from '../shared/InfoTooltip';

interface PotSizeConfigProps {
  initialCount?: number;
  initialDiameter?: number;
  onConfigChange: (count: number, diameter: number, areaSqMeters: number) => void;
}

export const PotSizeConfig: React.FC<PotSizeConfigProps> = ({
  initialCount = 0,
  initialDiameter = 0,
  onConfigChange
}) => {
  const [count, setCount] = useState(initialCount);
  const [diameter, setDiameter] = useState(initialDiameter);

  useEffect(() => {
    if (count > 0 && diameter > 0) {
      const areaPerPot = Math.PI * Math.pow(diameter / 2, 2) / 10000; // m²
      const totalArea = count * areaPerPot;
      onConfigChange(count, diameter, totalArea);
    } else {
      onConfigChange(0, 0, 0);
    }
  }, [count, diameter, onConfigChange]);

  const calculateArea = (): number => {
    if (count > 0 && diameter > 0) {
      const areaPerPot = Math.PI * Math.pow(diameter / 2, 2) / 10000;
      return count * areaPerPot;
    }
    return 0;
  };

  const totalArea = calculateArea();

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-blue-800">
          💡 Configura i tuoi vasi. Puoi aggiungere serie multiple di vasi diversi nello Step 6 (Zone Aggiuntive).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numero Vasi *
            <InfoTooltip content="Numero totale di vasi dello stesso diametro" />
          </label>
          <input
            type="number"
            value={count || ''}
            onChange={(e) => setCount(parseInt(e.target.value) || 0)}
            placeholder="Es. 5"
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Diametro Vaso (cm) *
            <InfoTooltip content="Diametro del vaso in centimetri (es. 29 per vaso ø29)" />
          </label>
          <input
            type="number"
            value={diameter || ''}
            onChange={(e) => setDiameter(parseFloat(e.target.value) || 0)}
            placeholder="Es. 29"
            min="1"
            step="0.1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {totalArea > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Superficie Totale Calcolata:</span>
            <span className="text-lg font-bold text-green-700">
              {totalArea.toFixed(2)} m²
            </span>
          </div>
          {totalArea < 1 && (
            <p className="text-xs text-orange-600 mt-2">
              ⚠️ Superficie molto piccola. Verifica le dimensioni inserite.
            </p>
          )}
        </div>
      )}
    </div>
  );
};










