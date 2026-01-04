import React, { useState, useEffect } from 'react';
import { InfoTooltip } from '../shared/InfoTooltip';

interface ContainerSizeConfigProps {
  initialCount?: number;
  initialLength?: number;
  initialWidth?: number;
  initialHeight?: number;
  initialHoles?: number;
  onConfigChange: (count: number, length: number, width: number, height: number, holes: number, areaSqMeters: number) => void;
  containerType: 'Cassone' | 'Vasca';
}

export const ContainerSizeConfig: React.FC<ContainerSizeConfigProps> = ({
  initialCount = 0,
  initialLength = 0,
  initialWidth = 0,
  initialHeight = 0,
  initialHoles = 0,
  onConfigChange,
  containerType,
}) => {
  const [count, setCount] = useState(initialCount);
  const [length, setLength] = useState(initialLength);
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const [holes, setHoles] = useState(initialHoles);

  useEffect(() => {
    if (count > 0 && length > 0 && width > 0) {
      const areaPerContainer = (length * width) / 10000; // m²
      const totalArea = count * areaPerContainer;
      onConfigChange(count, length, width, height, holes, totalArea);
    } else {
      onConfigChange(0, 0, 0, 0, 0, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, length, width, height, holes]); // onConfigChange rimosso dalle dipendenze per evitare loop infinito

  const calculateArea = (): number => {
    if (count > 0 && length > 0 && width > 0) {
      const areaPerContainer = (length * width) / 10000;
      return count * areaPerContainer;
    }
    return 0;
  };

  const totalArea = calculateArea();

  const containerLabel = containerType === 'Cassone' ? 'Cassoni' : 'Vasche';
  const containerSingular = containerType === 'Cassone' ? 'Cassone' : 'Vasca';
  const containerDescription = containerType === 'Cassone' 
    ? 'I cassoni sono contenitori profondi ideali per coltivazioni che richiedono più spazio radicale.'
    : 'Le vasche sono contenitori grandi, spesso utilizzate per coltivazioni acquatiche o idroponiche.';

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-blue-800">
          💡 {containerDescription} Configura le dimensioni dei tuoi {containerLabel.toLowerCase()}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numero {containerLabel} *
            <InfoTooltip content={`Numero totale di ${containerLabel.toLowerCase()} delle stesse dimensioni`} />
          </label>
          <input
            type="number"
            value={count || ''}
            onChange={(e) => setCount(parseInt(e.target.value) || 0)}
            placeholder="Es. 3"
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numero Piante per {containerSingular} (opzionale)
            <InfoTooltip content={`Numero di piante che puoi piantare in ogni ${containerSingular.toLowerCase()}`} />
          </label>
          <input
            type="number"
            value={holes || ''}
            onChange={(e) => setHoles(parseInt(e.target.value) || 0)}
            placeholder="Es. 4"
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lunghezza (L) cm *
            <InfoTooltip content={`Lunghezza del ${containerSingular.toLowerCase()} in centimetri`} />
          </label>
          <input
            type="number"
            value={length || ''}
            onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
            placeholder="Es. 100"
            min="1"
            step="0.1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Larghezza (l) cm *
            <InfoTooltip content={`Larghezza del ${containerSingular.toLowerCase()} in centimetri`} />
          </label>
          <input
            type="number"
            value={width || ''}
            onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
            placeholder="Es. 50"
            min="1"
            step="0.1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Altezza (H) cm *
            <InfoTooltip content={`Altezza del ${containerSingular.toLowerCase()} in centimetri`} />
          </label>
          <input
            type="number"
            value={height || ''}
            onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
            placeholder={containerType === 'Cassone' ? 'Es. 40' : 'Es. 60'}
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
          {holes > 0 && (
            <div className="mt-2 text-xs text-gray-600">
              Capacità totale: {count * holes} piante ({holes} per {containerSingular.toLowerCase()} × {count} {containerLabel.toLowerCase()})
            </div>
          )}
          {height > 0 && (
            <div className="mt-1 text-xs text-gray-600">
              Volume totale: {((count * length * width * height) / 1000000).toFixed(2)} m³
            </div>
          )}
        </div>
      )}
    </div>
  );
};


