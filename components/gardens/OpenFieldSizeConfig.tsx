import React, { useState, useEffect } from 'react';
import { AreaUnit, convertToSqMeters, convertFromSqMeters } from '@/utils/areaConverter';

interface OpenFieldSizeConfigProps {
  initialSize?: number;
  initialUnit?: AreaUnit;
  onConfigChange: (sizeSqMeters: number, unit: AreaUnit) => void;
}

export const OpenFieldSizeConfig: React.FC<OpenFieldSizeConfigProps> = ({
  initialSize = 0,
  initialUnit = 'sqm',
  onConfigChange
}) => {
  const [sizeValue, setSizeValue] = useState(() => {
    if (initialSize > 0 && initialUnit) {
      return convertFromSqMeters(initialSize, initialUnit).toFixed(2);
    }
    return '';
  });
  const [unit, setUnit] = useState<AreaUnit>(initialUnit);

  useEffect(() => {
    if (sizeValue) {
      const numValue = parseFloat(sizeValue);
      if (!isNaN(numValue) && numValue > 0) {
        const sqM = convertToSqMeters(numValue, unit);
        onConfigChange(sqM, unit);
      } else {
        onConfigChange(0, unit);
      }
    } else {
      onConfigChange(0, unit);
    }
  }, [sizeValue, unit, onConfigChange]);

  const getUnitLabel = (u: AreaUnit): string => {
    switch (u) {
      case 'sqm': return 'm²';
      case 'are': return 'are';
      case 'hectare': return 'ettari';
      default: return 'm²';
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-blue-800">
          💡 Inserisci la superficie totale del tuo campo aperto.
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          value={sizeValue}
          onChange={(e) => {
            const value = e.target.value;
            setSizeValue(value);
          }}
          placeholder="Es. 20"
          min="0"
          step="0.01"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <select
          value={unit}
          onChange={(e) => {
            const newUnit = e.target.value as AreaUnit;
            setUnit(newUnit);
            if (sizeValue) {
              const numValue = parseFloat(sizeValue);
              if (!isNaN(numValue)) {
                const currentSqM = convertToSqMeters(numValue, unit);
                const newDisplayValue = convertFromSqMeters(currentSqM, newUnit);
                setSizeValue(newDisplayValue.toFixed(2));
              }
            }
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="sqm">m²</option>
          <option value="are">are</option>
          <option value="hectare">ettari</option>
        </select>
      </div>

      {sizeValue && parseFloat(sizeValue) > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Superficie Totale:</span>
            <span className="text-lg font-bold text-green-700">
              {sizeValue} {getUnitLabel(unit)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};


