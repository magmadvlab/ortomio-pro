import React, { useState } from 'react';
import { Garden } from '@/types';
import { GardenBed, BedType, BedShape, StructureType } from '@/types/gardenBed';
import { X, Plus, Trash2, CheckCircle } from 'lucide-react';

interface BulkBedCreatorProps {
  garden: Garden;
  onAddMultiple: (beds: Omit<GardenBed, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  onCancel: () => void;
  existingStructures?: Array<{ id: string; name: string; type: StructureType }>;
}

interface BedSeries {
  id: string;
  bedType: BedType;
  shape: BedShape;
  quantity: number;
  baseName: string;
  // Dimensioni
  diameterCm?: number; // Per vasi circolari
  lengthCm?: number; // Per letti rettangolari
  widthCm?: number;
  heightCm?: number; // Per cassoni
  // Associazione struttura
  structureId?: string;
  isCovered?: boolean;
}

interface PreviewBed {
  name: string;
  bedType: BedType;
  shape: BedShape;
  areaSqMeters: number;
  dimensions: string;
}

export const BulkBedCreator: React.FC<BulkBedCreatorProps> = ({
  garden,
  onAddMultiple,
  onCancel,
  existingStructures = []
}) => {
  const [series, setSeries] = useState<BedSeries[]>([{
    id: '1',
    bedType: 'Pot',
    shape: 'Circle',
    quantity: 1,
    baseName: '',
    diameterCm: undefined,
  }]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const addSeries = () => {
    const newSeries: BedSeries = {
      id: Date.now().toString(),
      bedType: 'Pot',
      shape: 'Circle',
      quantity: 1,
      baseName: '',
      diameterCm: undefined,
    };
    setSeries([...series, newSeries]);
  };

  const removeSeries = (id: string) => {
    if (series.length > 1) {
      setSeries(series.filter(s => s.id !== id));
    }
  };

  const updateSeries = (id: string, updates: Partial<BedSeries>) => {
    setSeries(series.map(s => {
      if (s.id === id) {
        const updated = { ...s, ...updates };
        // Reset dimensioni quando cambia forma
        if (updates.shape) {
          if (updates.shape === 'Circle') {
            updated.lengthCm = undefined;
            updated.widthCm = undefined;
            updated.heightCm = undefined;
          } else {
            updated.diameterCm = undefined;
          }
        }
        return updated;
      }
      return s;
    }));
  };

  const calculateArea = (series: BedSeries): number => {
    if (series.shape === 'Circle' && series.diameterCm) {
      return (Math.PI * Math.pow(series.diameterCm / 2, 2)) / 10000; // m²
    } else if (series.shape === 'Rectangle' && series.lengthCm && series.widthCm) {
      return (series.lengthCm * series.widthCm) / 10000; // m²
    }
    return 0;
  };

  const generatePreview = (): PreviewBed[] => {
    const preview: PreviewBed[] = [];
    
    series.forEach(s => {
      const area = calculateArea(s);
      const typeLabel = getBedTypeLabel(s.bedType);
      const nameBase = s.baseName.trim() || typeLabel;
      
      let dimensions = '';
      if (s.shape === 'Circle' && s.diameterCm) {
        dimensions = `Ø${s.diameterCm} cm`;
      } else if (s.shape === 'Rectangle' && s.lengthCm && s.widthCm) {
        dimensions = `${s.lengthCm}×${s.widthCm}${s.heightCm ? `×${s.heightCm}` : ''} cm`;
      }
      
      for (let i = 1; i <= s.quantity; i++) {
        preview.push({
          name: `${nameBase} ${i}`,
          bedType: s.bedType,
          shape: s.shape,
          areaSqMeters: area,
          dimensions,
        });
      }
    });
    
    return preview;
  };

  const getBedTypeLabel = (type: BedType): string => {
    const labels: Record<BedType, string> = {
      RaisedBed: 'Cassone',
      Container: 'Contenitore',
      Pot: 'Vaso',
      Ground: 'Letto',
      Greenhouse: 'Serra',
      Hydroponic: 'Idroponico',
      Aquaponic: 'Acquaponico',
      Aeroponic: 'Aeroponico',
      Indoor: 'Indoor',
    };
    return labels[type] || 'Letto';
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    series.forEach((s, index) => {
      const prefix = `series_${index}`;
      
      if (s.quantity <= 0 || s.quantity > 100) {
        newErrors[`${prefix}_quantity`] = 'Quantità deve essere tra 1 e 100';
      }
      
      if (s.shape === 'Circle') {
        if (!s.diameterCm || s.diameterCm <= 0) {
          newErrors[`${prefix}_diameter`] = 'Diametro obbligatorio per forma circolare';
        }
      } else if (s.shape === 'Rectangle') {
        if (!s.lengthCm || s.lengthCm <= 0) {
          newErrors[`${prefix}_length`] = 'Lunghezza obbligatoria';
        }
        if (!s.widthCm || s.widthCm <= 0) {
          newErrors[`${prefix}_width`] = 'Larghezza obbligatoria';
        }
      }
    });
    
    // Validazione area totale
    const totalArea = generatePreview().reduce((sum, bed) => sum + bed.areaSqMeters, 0);
    if (garden.sizeSqMeters && totalArea > garden.sizeSqMeters) {
      newErrors.total = `L'area totale (${totalArea.toFixed(2)} m²) supera l'area del giardino (${garden.sizeSqMeters.toFixed(2)} m²)`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) {
      return;
    }

    const bedsToCreate: Omit<GardenBed, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    
    series.forEach(s => {
      const area = calculateArea(s);
      const typeLabel = getBedTypeLabel(s.bedType);
      const nameBase = s.baseName.trim() || typeLabel;
      
      for (let i = 1; i <= s.quantity; i++) {
        const bed: Omit<GardenBed, 'id' | 'createdAt' | 'updatedAt'> = {
          gardenId: garden.id,
          name: `${nameBase} ${i}`,
          bedType: s.bedType,
          shape: s.shape,
          areaSqMeters: area,
          diameterCm: s.shape === 'Circle' ? s.diameterCm : undefined,
          lengthCm: s.shape === 'Rectangle' ? s.lengthCm : undefined,
          widthCm: s.shape === 'Rectangle' ? s.widthCm : undefined,
          structureId: s.structureId,
          structureType: s.structureId ? existingStructures.find(st => st.id === s.structureId)?.type : undefined,
          isCovered: s.isCovered,
          coveringStructureId: s.isCovered && s.structureId ? s.structureId : undefined,
        };
        bedsToCreate.push(bed);
      }
    });

    onAddMultiple(bedsToCreate);
  };

  const preview = generatePreview();
  const totalArea = preview.reduce((sum, bed) => sum + bed.areaSqMeters, 0);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Aggiungi Elementi Multipli</h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-6">
        {/* Serie */}
        {series.map((s, index) => (
          <div key={s.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Serie {index + 1}</h3>
              {series.length > 1 && (
                <button
                  onClick={() => removeSeries(s.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <select
                  value={s.bedType}
                  onChange={(e) => updateSeries(s.id, { bedType: e.target.value as BedType })}
                  className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                >
                  <option value="Pot">Vaso</option>
                  <option value="RaisedBed">Cassone/Letto rialzato</option>
                  <option value="Container">Contenitore</option>
                  <option value="Ground">Piena terra</option>
                </select>
              </div>

              {/* Forma */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forma *
                </label>
                <select
                  value={s.shape}
                  onChange={(e) => updateSeries(s.id, { shape: e.target.value as BedShape })}
                  className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                >
                  <option value="Circle">Circolare</option>
                  <option value="Rectangle">Rettangolare</option>
                </select>
              </div>

              {/* Quantità */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantità *
                </label>
                <input
                  type="number"
                  value={s.quantity}
                  onChange={(e) => updateSeries(s.id, { quantity: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="100"
                  className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                />
                {errors[`series_${index}_quantity`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`series_${index}_quantity`]}</p>
                )}
              </div>

              {/* Nome base */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Base *
                </label>
                <input
                  type="text"
                  value={s.baseName}
                  onChange={(e) => updateSeries(s.id, { baseName: e.target.value })}
                  placeholder={`Es: ${getBedTypeLabel(s.bedType)} Piccolo`}
                  className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Genererà: "{s.baseName || getBedTypeLabel(s.bedType)} 1", "{s.baseName || getBedTypeLabel(s.bedType)} 2", ecc.
                </p>
              </div>

              {/* Dimensioni */}
              {s.shape === 'Circle' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Diametro (cm) *
                  </label>
                  <input
                    type="number"
                    value={s.diameterCm || ''}
                    onChange={(e) => updateSeries(s.id, { diameterCm: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="Es: 29"
                    min="1"
                    step="1"
                    className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                  />
                  {errors[`series_${index}_diameter`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`series_${index}_diameter`]}</p>
                  )}
                  {s.diameterCm && (
                    <p className="text-xs text-gray-500 mt-1">
                      Area per elemento: {((Math.PI * Math.pow(s.diameterCm / 2, 2)) / 10000).toFixed(2)} m²
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lunghezza (cm) *
                    </label>
                    <input
                      type="number"
                      value={s.lengthCm || ''}
                      onChange={(e) => updateSeries(s.id, { lengthCm: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="Es: 30"
                      min="1"
                      step="1"
                      className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                    />
                    {errors[`series_${index}_length`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`series_${index}_length`]}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Larghezza (cm) *
                    </label>
                    <input
                      type="number"
                      value={s.widthCm || ''}
                      onChange={(e) => updateSeries(s.id, { widthCm: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="Es: 30"
                      min="1"
                      step="1"
                      className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                    />
                    {errors[`series_${index}_width`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`series_${index}_width`]}</p>
                    )}
                  </div>
                  {s.bedType === 'RaisedBed' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Altezza (cm) - Opzionale
                      </label>
                      <input
                        type="number"
                        value={s.heightCm || ''}
                        onChange={(e) => updateSeries(s.id, { heightCm: e.target.value ? parseFloat(e.target.value) : undefined })}
                        placeholder="Es: 40"
                        min="1"
                        step="1"
                        className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  )}
                  {s.lengthCm && s.widthCm && (
                    <div className="col-span-2 text-xs text-gray-500">
                      Area per elemento: {((s.lengthCm * s.widthCm) / 10000).toFixed(2)} m²
                    </div>
                  )}
                </>
              )}

              {/* Associazione struttura (se esistono serre) */}
              {existingStructures.length > 0 && (
                <div className="col-span-2 space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={s.isCovered || false}
                      onChange={(e) => {
                        updateSeries(s.id, { 
                          isCovered: e.target.checked,
                          structureId: e.target.checked ? (s.structureId || existingStructures[0].id) : undefined
                        });
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700">Dentro serra/struttura</span>
                  </label>
                  {s.isCovered && (
                    <select
                      value={s.structureId || ''}
                      onChange={(e) => updateSeries(s.id, { structureId: e.target.value })}
                      className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Seleziona struttura...</option>
                      {existingStructures.map(st => (
                        <option key={st.id} value={st.id}>{st.name} ({st.type})</option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Aggiungi Altra Serie */}
        <button
          onClick={addSeries}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors"
        >
          <Plus size={18} />
          Aggiungi Altra Serie
        </button>

        {/* Preview */}
        {preview.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-gray-800 mb-3">Anteprima ({preview.length} elementi)</h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
              <div className="space-y-2">
                {preview.map((bed, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm py-1 border-b border-gray-200 last:border-0">
                    <span className="font-medium text-gray-700">{bed.name}</span>
                    <div className="flex items-center gap-3 text-gray-600">
                      <span>{bed.dimensions}</span>
                      <span className="font-medium">{bed.areaSqMeters.toFixed(2)} m²</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-gray-600">Area totale:</span>
              <span className="font-bold text-gray-800">{totalArea.toFixed(2)} m²</span>
            </div>
            {garden.sizeSqMeters && (
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-gray-500">Area giardino:</span>
                <span className={`font-medium ${totalArea > garden.sizeSqMeters ? 'text-red-600' : 'text-gray-600'}`}>
                  {garden.sizeSqMeters.toFixed(2)} m²
                </span>
              </div>
            )}
          </div>
        )}

        {errors.total && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
            {errors.total}
          </div>
        )}

        {/* Bottoni */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={handleCreate}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            <CheckCircle size={18} />
            Crea Tutti ({preview.length} elementi)
          </button>
        </div>
      </div>
    </div>
  );
};

