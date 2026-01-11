import React, { useState, useEffect } from 'react';
import { GardenBed, BedType, BedShape } from '@/types/gardenBed';
import { Garden } from '@/types';
import { X } from 'lucide-react';

interface BedFormProps {
  garden: Garden;
  bed?: GardenBed | null;
  onSave: (bedData: Omit<GardenBed, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

export const BedForm: React.FC<BedFormProps> = ({
  garden,
  bed,
  onSave,
  onCancel
}) => {
  const [name, setName] = useState(bed?.name || '');
  const [bedType, setBedType] = useState<BedType>(bed?.bedType || 'RaisedBed');
  const [shape, setShape] = useState<BedShape>(bed?.shape || 'Rectangle');
  const [lengthCm, setLengthCm] = useState<number | undefined>(bed?.lengthCm);
  const [widthCm, setWidthCm] = useState<number | undefined>(bed?.widthCm);
  const [diameterCm, setDiameterCm] = useState<number | undefined>(bed?.diameterCm);
  const [soilType, setSoilType] = useState(bed?.soilType || '');
  const [sunExposure, setSunExposure] = useState(bed?.sunExposure || '');
  const [dailySunHours, setDailySunHours] = useState<number | undefined>(bed?.dailySunHours);
  const [structureId, setStructureId] = useState(bed?.structureId || '');
  const [structureType, setStructureType] = useState(bed?.structureType);
  const [isCovered, setIsCovered] = useState(bed?.isCovered || bed?.structureId ? true : false);
  const [coveringStructureId, setCoveringStructureId] = useState(bed?.coveringStructureId || bed?.structureId || '');
  const [notes, setNotes] = useState(bed?.notes || '');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-set structureType quando cambia bedType
  useEffect(() => {
    if (bedType === 'Greenhouse') {
      setStructureType('Greenhouse');
    } else if (bedType === 'Hydroponic') {
      setStructureType('Hydroponic');
    } else if (bedType === 'Aquaponic') {
      setStructureType('Aquaponic');
    } else if (bedType === 'Aeroponic') {
      setStructureType('Aeroponic');
    } else if (bedType === 'Indoor') {
      setStructureType('Indoor');
    } else {
      setStructureType(undefined);
    }
  }, [bedType]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Il nome è obbligatorio';
    }

    if (shape === 'Rectangle') {
      if (!lengthCm || lengthCm <= 0) {
        newErrors.lengthCm = 'La lunghezza deve essere maggiore di 0';
      }
      if (!widthCm || widthCm <= 0) {
        newErrors.widthCm = 'La larghezza deve essere maggiore di 0';
      }
    } else if (shape === 'Circle') {
      if (!diameterCm || diameterCm <= 0) {
        newErrors.diameterCm = 'Il diametro deve essere maggiore di 0';
      }
    }

    // Validazione area totale vs area giardino
    if (garden.sizeSqMeters) {
      let bedArea = 0;
      if (shape === 'Rectangle' && lengthCm && widthCm) {
        bedArea = (lengthCm * widthCm) / 10000;
      } else if (shape === 'Circle' && diameterCm) {
        bedArea = (Math.PI * Math.pow(diameterCm / 2, 2)) / 10000;
      }

      if (bedArea > garden.sizeSqMeters) {
        newErrors.area = `L'area del letto (${bedArea.toFixed(2)} m²) supera l'area totale del giardino (${garden.sizeSqMeters.toFixed(2)} m²)`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setSaving(true);
    try {
      await onSave({
        gardenId: garden.id,
        name: name.trim(),
        bedType,
        shape,
        lengthCm: shape === 'Rectangle' ? lengthCm : undefined,
        widthCm: shape === 'Rectangle' ? widthCm : undefined,
        diameterCm: shape === 'Circle' ? diameterCm : undefined,
        soilType: soilType || undefined,
        sunExposure: sunExposure || undefined,
        dailySunHours,
        structureId: structureId || undefined,
        structureType,
        isCovered: isCovered || undefined,
        coveringStructureId: coveringStructureId || undefined,
        notes: notes || undefined,
      });
    } catch (error) {
      console.error('Error saving bed:', error);
      alert('Errore nel salvare il letto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-bold text-gray-800">
          {bed ? 'Modifica Letto' : 'Nuovo Letto'}
        </h2>
        <button
          onClick={onCancel}
          className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Es: Cassone 1, Letto Nord, Vaso Grande"
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo *
          </label>
          <select
            value={bedType}
            onChange={(e) => setBedType(e.target.value as BedType)}
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          >
            <option value="RaisedBed">Cassone/Letto rialzato</option>
            <option value="Container">Contenitore</option>
            <option value="Pot">Vaso</option>
            <option value="Ground">Piena terra</option>
            <option value="Greenhouse">Serra</option>
            <option value="Hydroponic">Idroponico</option>
            <option value="Aquaponic">Acquaponico</option>
            <option value="Aeroponic">Aeroponico</option>
            <option value="Indoor">Indoor</option>
          </select>
        </div>

        {/* Forma */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Forma *
          </label>
          <select
            value={shape}
            onChange={(e) => {
              setShape(e.target.value as BedShape);
              // Reset dimensioni quando cambia forma
              if (e.target.value === 'Circle') {
                setLengthCm(undefined);
                setWidthCm(undefined);
              } else {
                setDiameterCm(undefined);
              }
            }}
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          >
            <option value="Rectangle">Rettangolare</option>
            <option value="Circle">Circolare</option>
          </select>
        </div>

        {/* Dimensioni */}
        {shape === 'Rectangle' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lunghezza (cm) *
              </label>
              <input
                type="number"
                value={lengthCm || ''}
                onChange={(e) => setLengthCm(e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="Es: 200"
                min="1"
                step="1"
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              {errors.lengthCm && <p className="text-red-500 text-sm mt-1">{errors.lengthCm}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Larghezza (cm) *
              </label>
              <input
                type="number"
                value={widthCm || ''}
                onChange={(e) => setWidthCm(e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="Es: 100"
                min="1"
                step="1"
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              {errors.widthCm && <p className="text-red-500 text-sm mt-1">{errors.widthCm}</p>}
            </div>
            {lengthCm && widthCm && (
              <div className="col-span-2 text-sm text-gray-600">
                Area: {((lengthCm * widthCm) / 10000).toFixed(2)} m²
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diametro (cm) *
            </label>
            <input
              type="number"
              value={diameterCm || ''}
              onChange={(e) => setDiameterCm(e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="Es: 50"
              min="1"
              step="1"
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
            {errors.diameterCm && <p className="text-red-500 text-sm mt-1">{errors.diameterCm}</p>}
            {diameterCm && (
              <div className="text-sm text-gray-600 mt-1">
                Area: {((Math.PI * Math.pow(diameterCm / 2, 2)) / 10000).toFixed(2)} m²
              </div>
            )}
          </div>
        )}

        {errors.area && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
            {errors.area}
          </div>
        )}

        {/* Caratteristiche opzionali */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo terreno
            </label>
            <input
              type="text"
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              placeholder="Es: Argilloso, Sabbioso"
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Esposizione solare
            </label>
            <select
              value={sunExposure}
              onChange={(e) => setSunExposure(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Non specificato</option>
              <option value="Full">Pieno sole</option>
              <option value="Partial">Mezz'ombra</option>
              <option value="Shade">Ombra</option>
            </select>
          </div>
        </div>

        {sunExposure && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ore di sole al giorno
            </label>
            <input
              type="number"
              value={dailySunHours || ''}
              onChange={(e) => setDailySunHours(e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="Es: 6"
              min="0"
              max="24"
              step="0.5"
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Associazione a struttura (serra/tunnel) */}
        {(garden.gardenType === 'Greenhouse' || garden.gardenType === 'Tunnel') && (
          <div className="border-t border-gray-200 pt-4">
            <label className="flex items-center gap-3 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isCovered}
                onChange={(e) => {
                  setIsCovered(e.target.checked);
                  if (e.target.checked) {
                    // Se il giardino stesso è una serra, associa automaticamente
                    setCoveringStructureId(garden.id);
                    setStructureId(garden.id);
                    setStructureType('Greenhouse');
                  } else {
                    setCoveringStructureId('');
                    setStructureId('');
                    setStructureType(undefined);
                  }
                }}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Dentro serra/tunnel
              </span>
            </label>
            {isCovered && (
              <p className="text-xs text-gray-500 ml-7">
                Questo letto sarà associato alla serra "{garden.name}"
              </p>
            )}
          </div>
        )}

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Note aggiuntive sul letto..."
            rows={3}
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Bottoni */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvataggio...' : bed ? 'Salva modifiche' : 'Crea letto'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Annulla
          </button>
        </div>
      </form>
    </div>
  );
};

