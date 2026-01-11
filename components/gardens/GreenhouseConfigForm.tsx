import React, { useState } from 'react';
import { GreenhouseConfig, GreenhouseStructureType, GreenhouseCoveringType, ArchMaterial } from '@/types/greenhouse';
import { InfoTooltip } from '../shared/InfoTooltip';

interface GreenhouseConfigFormProps {
  initialConfig?: GreenhouseConfig;
  onSubmit: (config: GreenhouseConfig) => void;
  onCancel?: () => void;
}

export const GreenhouseConfigForm: React.FC<GreenhouseConfigFormProps> = ({
  initialConfig,
  onSubmit,
  onCancel
}) => {
  const [structureType, setStructureType] = useState<GreenhouseStructureType>(
    initialConfig?.structureType || 'Arched'
  );
  const [coveringType, setCoveringType] = useState<GreenhouseCoveringType>(
    initialConfig?.coveringType || 'Polyethylene'
  );
  const [coveringThickness, setCoveringThickness] = useState(
    initialConfig?.coveringThickness?.toString() || '150'
  );
  const [archSpacing, setArchSpacing] = useState(
    initialConfig?.archSpacing?.toString() || '100'
  );
  const [archHeight, setArchHeight] = useState(
    initialConfig?.archHeight?.toString() || '200'
  );
  const [archMaterial, setArchMaterial] = useState<ArchMaterial>(
    initialConfig?.archMaterial || 'Steel'
  );
  const [hasVentilation, setHasVentilation] = useState(
    initialConfig?.hasVentilation ?? true
  );
  const [hasHeating, setHasHeating] = useState(
    initialConfig?.hasHeating ?? false
  );
  const [minTemp, setMinTemp] = useState(
    initialConfig?.minTemp?.toString() || '5'
  );
  const [maxTemp, setMaxTemp] = useState(
    initialConfig?.maxTemp?.toString() || '35'
  );
  const [width, setWidth] = useState(
    initialConfig?.width?.toString() || ''
  );
  const [length, setLength] = useState(
    initialConfig?.length?.toString() || ''
  );
  const [height, setHeight] = useState(
    initialConfig?.height?.toString() || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const config: GreenhouseConfig = {
      structureType,
      coveringType,
      coveringThickness: coveringThickness ? parseFloat(coveringThickness) : undefined,
      archSpacing: archSpacing ? parseFloat(archSpacing) : undefined,
      archHeight: archHeight ? parseFloat(archHeight) : undefined,
      archMaterial,
      hasVentilation,
      hasHeating,
      minTemp: minTemp ? parseFloat(minTemp) : undefined,
      maxTemp: maxTemp ? parseFloat(maxTemp) : undefined,
      width: width ? parseFloat(width) : undefined,
      length: length ? parseFloat(length) : undefined,
      height: height ? parseFloat(height) : undefined,
    };
    onSubmit(config);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo Struttura
          <InfoTooltip content="Tipo di struttura della serra/tunnel" />
        </label>
        <select
          value={structureType}
          onChange={(e) => setStructureType(e.target.value as GreenhouseStructureType)}
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
        >
          <option value="Arched">Archetti</option>
          <option value="Tunnel">Tunnel</option>
          <option value="ColdFrame">Cassone freddo</option>
          <option value="Polytunnel">Polytunnel</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo Copertura
          <InfoTooltip content="Materiale di copertura della serra" />
        </label>
        <select
          value={coveringType}
          onChange={(e) => setCoveringType(e.target.value as GreenhouseCoveringType)}
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
        >
          <option value="Polyethylene">Polietilene</option>
          <option value="Polycarbonate">Policarbonato</option>
          <option value="Glass">Vetro</option>
          <option value="Netting">Rete</option>
        </select>
      </div>

      {coveringType === 'Polyethylene' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Spessore Copertura (micron)
            <InfoTooltip content="Spessore del film polietilene in micron (es. 150, 200)" />
          </label>
          <input
            type="number"
            value={coveringThickness}
            onChange={(e) => setCoveringThickness(e.target.value)}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
            placeholder="150"
            min="50"
            max="300"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Spaziatura Archetti (cm)
            <InfoTooltip content="Distanza tra gli archetti in centimetri" />
          </label>
          <input
            type="number"
            value={archSpacing}
            onChange={(e) => setArchSpacing(e.target.value)}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
            placeholder="100"
            min="50"
            max="200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Altezza Archetti (cm)
            <InfoTooltip content="Altezza degli archetti in centimetri" />
          </label>
          <input
            type="number"
            value={archHeight}
            onChange={(e) => setArchHeight(e.target.value)}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
            placeholder="200"
            min="100"
            max="400"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Materiale Archetti
          <InfoTooltip content="Materiale degli archetti" />
        </label>
        <select
          value={archMaterial}
          onChange={(e) => setArchMaterial(e.target.value as ArchMaterial)}
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
        >
          <option value="Steel">Acciaio</option>
          <option value="Aluminum">Alluminio</option>
          <option value="PVC">PVC</option>
          <option value="Bamboo">Bambù</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={hasVentilation}
              onChange={(e) => setHasVentilation(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700">Ventilazione</span>
            <InfoTooltip content="La serra ha sistema di ventilazione" />
          </label>
        </div>

        <div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={hasHeating}
              onChange={(e) => setHasHeating(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700">Riscaldamento</span>
            <InfoTooltip content="La serra ha sistema di riscaldamento" />
          </label>
        </div>
      </div>

      {hasHeating && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperatura Minima (°C)
              <InfoTooltip content="Temperatura minima garantita in serra" />
            </label>
            <input
              type="number"
              value={minTemp}
              onChange={(e) => setMinTemp(e.target.value)}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
              placeholder="5"
              min="-10"
              max="20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperatura Massima (°C)
              <InfoTooltip content="Temperatura massima garantita in serra" />
            </label>
            <input
              type="number"
              value={maxTemp}
              onChange={(e) => setMaxTemp(e.target.value)}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
              placeholder="35"
              min="20"
              max="50"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Larghezza (cm)
            <InfoTooltip content="Larghezza della serra in centimetri" />
          </label>
          <input
            type="number"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
            placeholder="300"
            min="50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lunghezza (cm)
            <InfoTooltip content="Lunghezza della serra in centimetri" />
          </label>
          <input
            type="number"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
            placeholder="600"
            min="50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Altezza (cm)
            <InfoTooltip content="Altezza della serra in centimetri" />
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
            placeholder="250"
            min="100"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4">
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

