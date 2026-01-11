import React, { useState } from 'react';
import { GardenAccessory, AccessoryCategory, SupportType, NettingType, WireType, AccessoryMaterial } from '@/types/accessories';
import { InfoTooltip } from '../shared/InfoTooltip';

interface AccessoryFormProps {
  gardenId: string;
  initialAccessory?: GardenAccessory;
  onSubmit: (accessory: Omit<GardenAccessory, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel?: () => void;
  suggestedFor?: string; // Nome pianta per cui è suggerito
}

export const AccessoryForm: React.FC<AccessoryFormProps> = ({
  gardenId,
  initialAccessory,
  onSubmit,
  onCancel,
  suggestedFor
}) => {
  const [name, setName] = useState(initialAccessory?.name || '');
  const [category, setCategory] = useState<AccessoryCategory>(
    initialAccessory?.category || 'Support'
  );
  const [supportType, setSupportType] = useState<SupportType | ''>(
    initialAccessory?.supportType || ''
  );
  const [nettingType, setNettingType] = useState<NettingType | ''>(
    initialAccessory?.nettingType || ''
  );
  const [wireType, setWireType] = useState<WireType | ''>(
    initialAccessory?.wireType || ''
  );
  const [material, setMaterial] = useState<AccessoryMaterial>(
    initialAccessory?.material || 'Wood'
  );
  const [quantity, setQuantity] = useState(
    initialAccessory?.quantity?.toString() || '1'
  );
  const [length, setLength] = useState(
    initialAccessory?.length?.toString() || ''
  );
  const [height, setHeight] = useState(
    initialAccessory?.height?.toString() || ''
  );
  const [width, setWidth] = useState(
    initialAccessory?.width?.toString() || ''
  );
  const [diameter, setDiameter] = useState(
    initialAccessory?.diameter?.toString() || ''
  );
  const [meshSize, setMeshSize] = useState(
    initialAccessory?.meshSize?.toString() || ''
  );
  const [usedFor, setUsedFor] = useState(
    initialAccessory?.usedFor?.join(', ') || ''
  );
  const [installationDate, setInstallationDate] = useState(
    initialAccessory?.installationDate || ''
  );
  const [expectedLifespan, setExpectedLifespan] = useState(
    initialAccessory?.expectedLifespan?.toString() || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const accessory: Omit<GardenAccessory, 'id' | 'createdAt' | 'updatedAt'> = {
      gardenId,
      name: name.trim(),
      category,
      material,
      quantity: quantity ? parseInt(quantity) : undefined,
      length: length ? parseFloat(length) : undefined,
      height: height ? parseFloat(height) : undefined,
      width: width ? parseFloat(width) : undefined,
      diameter: diameter ? parseFloat(diameter) : undefined,
      meshSize: meshSize ? parseFloat(meshSize) : undefined,
      usedFor: usedFor ? usedFor.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      installationDate: installationDate || undefined,
      expectedLifespan: expectedLifespan ? parseInt(expectedLifespan) : undefined,
    };
    if (category === 'Support' && supportType) {
      accessory.supportType = supportType;
    }
    if (category === 'Netting' && nettingType) {
      accessory.nettingType = nettingType;
    }
    if (category === 'Wire' && wireType) {
      accessory.wireType = wireType;
    }
    onSubmit(accessory);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome Accessorio *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
          required
          placeholder="es. Paletti per pomodori"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Categoria *
        </label>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value as AccessoryCategory);
            // Reset tipo quando cambia categoria
            setSupportType('');
            setNettingType('');
            setWireType('');
          }}
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
          required
        >
          <option value="Support">Supporto</option>
          <option value="Netting">Rete</option>
          <option value="Wire">Filo</option>
          <option value="Structure">Struttura</option>
        </select>
      </div>

      {category === 'Support' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo Supporto
          </label>
          <select
            value={supportType}
            onChange={(e) => setSupportType(e.target.value as SupportType)}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
          >
            <option value="">Seleziona...</option>
            <option value="Stake">Paletto</option>
            <option value="Tutor">Tutore</option>
            <option value="Trellis">Spalliera</option>
            <option value="Cage">Gabbia</option>
            <option value="Espalier">Spalliera a parete</option>
          </select>
        </div>
      )}

      {category === 'Netting' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo Rete
          </label>
          <select
            value={nettingType}
            onChange={(e) => setNettingType(e.target.value as NettingType)}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
          >
            <option value="">Seleziona...</option>
            <option value="Shade">Ombreggiante</option>
            <option value="Hail">Antigrandine</option>
            <option value="Insect">Antinsetto</option>
            <option value="Harvest">Raccolta</option>
          </select>
        </div>
      )}

      {category === 'Wire' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo Filo
          </label>
          <select
            value={wireType}
            onChange={(e) => setWireType(e.target.value as WireType)}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
          >
            <option value="">Seleziona...</option>
            <option value="Steel">Acciaio</option>
            <option value="Plastic">Plastica</option>
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Materiale *
        </label>
        <select
          value={material}
          onChange={(e) => setMaterial(e.target.value as AccessoryMaterial)}
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
          required
        >
          <option value="Wood">Legno</option>
          <option value="Steel">Acciaio/Ferro</option>
          <option value="Plastic">Plastica/PVC</option>
          <option value="Bamboo">Bambù</option>
          <option value="Cane">Canna</option>
          <option value="Aluminum">Alluminio</option>
          <option value="Polyethylene">Polietilene</option>
          <option value="Polypropylene">Polipropilene</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantità
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
            min="1"
          />
        </div>
        {category === 'Netting' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dimensione Maglia (mm)
            </label>
            <input
              type="number"
              value={meshSize}
              onChange={(e) => setMeshSize(e.target.value)}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
              min="0.1"
              step="0.1"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(category === 'Support' || category === 'Structure') && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lunghezza (cm)
              </label>
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Altezza (cm)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diametro (cm)
              </label>
              <input
                type="number"
                value={diameter}
                onChange={(e) => setDiameter(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                min="0"
                step="0.1"
              />
            </div>
          </>
        )}
        {category === 'Netting' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Larghezza (cm)
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Altezza (cm)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                min="0"
              />
            </div>
          </>
        )}
        {category === 'Wire' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lunghezza (cm)
            </label>
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
              min="0"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Utilizzato per (piante, separate da virgola)
        </label>
        <input
          type="text"
          value={usedFor}
          onChange={(e) => setUsedFor(e.target.value)}
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
          placeholder="es. Pomodori, Peperoni"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Installazione
          </label>
          <input
            type="date"
            value={installationDate}
            onChange={(e) => setInstallationDate(e.target.value)}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Durata Prevista (anni)
          </label>
          <input
            type="number"
            value={expectedLifespan}
            onChange={(e) => setExpectedLifespan(e.target.value)}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
            min="1"
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
          {initialAccessory ? 'Aggiorna' : 'Aggiungi'} Accessorio
        </button>
      </div>
    </form>
  );
};

