import React, { useState, useEffect } from 'react';
import { Plus, X, Calculator, Info } from 'lucide-react';
import { GreenhouseStructure, GreenhouseStructureType, GreenhouseCoveringType, ArchMaterial } from '@/types/greenhouse';

interface MultipleGreenhouseConfigProps {
  structures: GreenhouseStructure[];
  onChange: (structures: GreenhouseStructure[]) => void;
  onTotalAreaCalculated?: (totalAreaSqMeters: number) => void;
}

export const MultipleGreenhouseConfig: React.FC<MultipleGreenhouseConfigProps> = ({
  structures,
  onChange,
  onTotalAreaCalculated,
}) => {
  const [localStructures, setLocalStructures] = useState<GreenhouseStructure[]>(structures);

  useEffect(() => {
    setLocalStructures(structures);
  }, [structures]);

  useEffect(() => {
    // Calcola superficie totale
    let totalArea = 0;
    for (const structure of localStructures) {
      if (structure.width && structure.length) {
        // Converti da cm² a m²
        totalArea += (structure.width * structure.length) / 10000;
      } else if (structure.archCount && structure.archLength && structure.archWidth) {
        // Calcola da archi
        const areaPerArch = (structure.archLength * structure.archWidth); // m² per arco
        totalArea += areaPerArch * structure.archCount;
      }
    }
    onTotalAreaCalculated?.(totalArea);
    onChange(localStructures);
  }, [localStructures]);

  const addStructure = () => {
    const newStructure: GreenhouseStructure = {
      id: `structure_${Date.now()}`,
      name: `Serra ${localStructures.length + 1}`,
      structureType: 'Arched',
      coveringType: 'Polyethylene',
    };
    setLocalStructures([...localStructures, newStructure]);
  };

  const removeStructure = (id: string) => {
    setLocalStructures(localStructures.filter(s => s.id !== id));
  };

  const updateStructure = (id: string, updates: Partial<GreenhouseStructure>) => {
    setLocalStructures(localStructures.map(s => 
      s.id === id ? { ...s, ...updates } : s
    ));
  };

  const calculateDimensionsFromArches = (structure: GreenhouseStructure) => {
    if (structure.archCount && structure.archLength && structure.archWidth) {
      // Calcola dimensioni totali da archi
      const length = structure.archLength * structure.archCount; // metri
      const width = structure.archWidth; // metri
      return {
        length: length * 100, // Converti a cm
        width: width * 100, // Converti a cm
        height: structure.archHeight ? structure.archHeight * 100 : undefined, // Converti a cm
      };
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-800">
            <p className="font-semibold mb-1">Configurazione Serre Multiple</p>
            <p>
              Puoi aggiungere più serre/tunnel al tuo giardino. Per ogni serra, specifica il numero di archi 
              e le dimensioni, oppure inserisci direttamente le dimensioni totali. La superficie totale 
              verrà calcolata automaticamente.
            </p>
          </div>
        </div>
      </div>

      {localStructures.map((structure, index) => {
        const calculatedDims = calculateDimensionsFromArches(structure);
        const areaSqMeters = structure.width && structure.length 
          ? (structure.width * structure.length) / 10000 
          : calculatedDims 
            ? (calculatedDims.length * calculatedDims.width) / 10000 
            : 0;

        return (
          <div key={structure.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-800">{structure.name}</h4>
              {localStructures.length > 1 && (
                <button
                  onClick={() => removeStructure(structure.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Serre/Tunnel
                </label>
                <input
                  type="text"
                  value={structure.name}
                  onChange={(e) => updateStructure(structure.id, { name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Es. Serra Nord"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo Struttura
                </label>
                <select
                  value={structure.structureType}
                  onChange={(e) => updateStructure(structure.id, { structureType: e.target.value as GreenhouseStructureType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="Arched">Arco</option>
                  <option value="Tunnel">Tunnel</option>
                  <option value="Polytunnel">Polytunnel</option>
                  <option value="ColdFrame">Cold Frame</option>
                </select>
              </div>
            </div>

            <div className="border-t border-gray-300 pt-4 mb-4">
              <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Calculator size={16} />
                Dimensioni per Arco
              </h5>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Numero Archi
                  </label>
                  <input
                    type="number"
                    value={structure.archCount || ''}
                    onChange={(e) => updateStructure(structure.id, { archCount: parseInt(e.target.value) || 0 })}
                    placeholder="Es. 10"
                    min="1"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Lunghezza Arco (m)
                  </label>
                  <input
                    type="number"
                    value={structure.archLength || ''}
                    onChange={(e) => updateStructure(structure.id, { archLength: parseFloat(e.target.value) || 0 })}
                    placeholder="Es. 6"
                    step="0.1"
                    min="0"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Larghezza Arco (m)
                  </label>
                  <input
                    type="number"
                    value={structure.archWidth || ''}
                    onChange={(e) => updateStructure(structure.id, { archWidth: parseFloat(e.target.value) || 0 })}
                    placeholder="Es. 3"
                    step="0.1"
                    min="0"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Altezza Arco (m)
                  </label>
                  <input
                    type="number"
                    value={structure.archHeight || ''}
                    onChange={(e) => updateStructure(structure.id, { archHeight: parseFloat(e.target.value) || 0 })}
                    placeholder="Es. 2.5"
                    step="0.1"
                    min="0"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              {calculatedDims && (
                <p className="text-xs text-green-600 mt-2">
                  ✓ Dimensioni calcolate: {calculatedDims.length.toFixed(0)}cm × {calculatedDims.width.toFixed(0)}cm
                  {calculatedDims.height && ` × ${calculatedDims.height.toFixed(0)}cm`}
                </p>
              )}
            </div>

            <div className="border-t border-gray-300 pt-4">
              <h5 className="text-sm font-semibold text-gray-700 mb-3">Dimensioni Totali (opzionale - override calcolo)</h5>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Larghezza (cm)
                  </label>
                  <input
                    type="number"
                    value={structure.width || ''}
                    onChange={(e) => updateStructure(structure.id, { width: parseFloat(e.target.value) || 0 })}
                    placeholder="Auto"
                    min="0"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Lunghezza (cm)
                  </label>
                  <input
                    type="number"
                    value={structure.length || ''}
                    onChange={(e) => updateStructure(structure.id, { length: parseFloat(e.target.value) || 0 })}
                    placeholder="Auto"
                    min="0"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Altezza (cm)
                  </label>
                  <input
                    type="number"
                    value={structure.height || ''}
                    onChange={(e) => updateStructure(structure.id, { height: parseFloat(e.target.value) || 0 })}
                    placeholder="Auto"
                    min="0"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {areaSqMeters > 0 && (
              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                Superficie: <strong>{areaSqMeters.toFixed(2)} m²</strong>
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={addStructure}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <Plus size={18} />
        Aggiungi Altra Serra/Tunnel
      </button>
    </div>
  );
};

