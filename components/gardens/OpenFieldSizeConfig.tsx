import React, { useState, useEffect } from 'react';
import { AreaUnit, convertToSqMeters, convertFromSqMeters } from '@/utils/areaConverter';
import { ChevronDown, ChevronRight, Info } from 'lucide-react';

export interface RowConfig {
  numberOfRows: number;
  lengthMeters: number;
  widthMeters?: number;
  defaultRowSpacingCm?: number;
}

export interface OpenFieldConfig {
  sizeSqMeters: number;
  sizeUnit: AreaUnit;
  rowConfig?: RowConfig;
  showAdditionalStructures: boolean;
}

interface OpenFieldSizeConfigProps {
  onConfigChange: (config: OpenFieldConfig) => void;
  initialValue?: Partial<OpenFieldConfig>;
}

export const OpenFieldSizeConfig: React.FC<OpenFieldSizeConfigProps> = ({
  onConfigChange,
  initialValue
}) => {
  const [size, setSize] = useState<string>(
    initialValue?.sizeSqMeters
      ? convertFromSqMeters(initialValue.sizeSqMeters, initialValue.sizeUnit || 'sqm').toString()
      : ''
  );
  const [unit, setUnit] = useState<AreaUnit>(initialValue?.sizeUnit || 'sqm');
  const [showRowConfig, setShowRowConfig] = useState(!!initialValue?.rowConfig);
  const [numberOfRows, setNumberOfRows] = useState<string>(initialValue?.rowConfig?.numberOfRows?.toString() || '');
  const [lengthMeters, setLengthMeters] = useState<string>(initialValue?.rowConfig?.lengthMeters?.toString() || '');
  const [widthMeters, setWidthMeters] = useState<string>(initialValue?.rowConfig?.widthMeters?.toString() || '');
  const [showAdditionalStructures, setShowAdditionalStructures] = useState(initialValue?.showAdditionalStructures || false);

  // Calcola conversioni automatiche
  const getConversions = () => {
    const sizeNum = parseFloat(size);
    if (isNaN(sizeNum) || sizeNum <= 0) {
      return { sqm: '0', are: '0', hectare: '0' };
    }

    const sqMeters = convertToSqMeters(sizeNum, unit);
    return {
      sqm: sqMeters.toFixed(2),
      are: (sqMeters / 100).toFixed(2),
      hectare: (sqMeters / 10000).toFixed(4)
    };
  };

  // Calcola distanza media tra file
  const calculateAverageSpacing = (): number | null => {
    const rows = parseFloat(numberOfRows);
    const width = parseFloat(widthMeters);

    if (isNaN(rows) || isNaN(width) || rows <= 0 || width <= 0) {
      return null;
    }

    return (width / rows) * 100; // converti in cm
  };

  // Effect per notificare cambiamenti
  useEffect(() => {
    const sizeNum = parseFloat(size);
    if (isNaN(sizeNum) || sizeNum <= 0) {
      return;
    }

    const config: OpenFieldConfig = {
      sizeSqMeters: convertToSqMeters(sizeNum, unit),
      sizeUnit: unit,
      showAdditionalStructures
    };

    // Aggiungi rowConfig se compilato
    if (showRowConfig && numberOfRows && lengthMeters) {
      const rows = parseFloat(numberOfRows);
      const length = parseFloat(lengthMeters);

      if (!isNaN(rows) && !isNaN(length) && rows > 0 && length > 0) {
        config.rowConfig = {
          numberOfRows: rows,
          lengthMeters: length
        };

        if (widthMeters) {
          const width = parseFloat(widthMeters);
          if (!isNaN(width) && width > 0) {
            config.rowConfig.widthMeters = width;
            const spacing = calculateAverageSpacing();
            if (spacing !== null) {
              config.rowConfig.defaultRowSpacingCm = Math.round(spacing);
            }
          }
        }
      }
    }

    onConfigChange(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, unit, showRowConfig, numberOfRows, lengthMeters, widthMeters, showAdditionalStructures]);

  const conversions = getConversions();
  const averageSpacing = calculateAverageSpacing();

  return (
    <div className="space-y-6">
      {/* Superficie Principale */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Campo Aperto (opzionale)
        </label>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
          <p className="text-sm text-gray-700 flex items-start gap-2">
            <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
            Inserisci la superficie totale del tuo campo aperto.
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="Es. 2000"
            min="0"
            step="0.01"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as AreaUnit)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
          >
            <option value="sqm">m²</option>
            <option value="are">are</option>
            <option value="hectare">ha</option>
          </select>
        </div>

        {/* Conversioni automatiche */}
        {parseFloat(size) > 0 && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-semibold text-gray-900 mb-2">Superficie Totale:</p>
            <div className="space-y-1 text-sm text-gray-700">
              <p>• {conversions.sqm} m²</p>
              <p>• {conversions.are} are</p>
              <p>• {conversions.hectare} ha</p>
            </div>
          </div>
        )}
      </div>

      {/* Configurazione Filari */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setShowRowConfig(!showRowConfig)}
          className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
        >
          <span className="font-medium text-gray-900 flex items-center gap-2">
            {showRowConfig ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            Configurazione Filari (Opzionale)
          </span>
        </button>

        {showRowConfig && (
          <div className="p-4 space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700 flex items-start gap-2">
                <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                Specifica numero e dimensioni filari. Potrai personalizzare le distanze tra file quando pianterai le colture.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numero Filari
              </label>
              <input
                type="number"
                value={numberOfRows}
                onChange={(e) => setNumberOfRows(e.target.value)}
                placeholder="Es. 30"
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lunghezza Filari (m)
              </label>
              <input
                type="number"
                value={lengthMeters}
                onChange={(e) => setLengthMeters(e.target.value)}
                placeholder="Es. 100"
                min="0.1"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Larghezza Totale (m) - Opzionale
              </label>
              <input
                type="number"
                value={widthMeters}
                onChange={(e) => setWidthMeters(e.target.value)}
                placeholder="Es. 20"
                min="0.1"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Se specifichi larghezza e numero filari, calcoleremo automaticamente la distanza media tra file.
              </p>
            </div>

            {/* Calcolo distanza media */}
            {averageSpacing !== null && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-semibold text-green-900">
                  ✓ Distanza media tra file: {Math.round(averageSpacing)} cm
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Strutture Aggiuntive */}
      {!showAdditionalStructures && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-700 mb-3">
            Hai strutture aggiuntive come vasi, letti rialzati o cassoni?
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowAdditionalStructures(true)}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Aggiungi Ora
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAdditionalStructures(false);
                // Notifica esplicitamente al parent che l'utente ha scelto di non aggiungere strutture
                // Questo permette al wizard di procedere anche se size non è ancora inserito
                const sizeNum = parseFloat(size) || 0;
                onConfigChange({
                  sizeSqMeters: sizeNum > 0 ? convertToSqMeters(sizeNum, unit) : 0,
                  sizeUnit: unit,
                  showAdditionalStructures: false
                });
              }}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Salta - Dopo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

