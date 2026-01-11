import React, { useState, useEffect } from 'react';
import { Garden } from '@/types';
import { GardenBed, BedType, StructureType } from '@/types/gardenBed';
import { GardenRow } from '@/types';
import { useStorage } from '@/packages/core/hooks/useStorage';
import { BedForm } from './BedForm';
import { BulkBedCreator } from './BulkBedCreator';
import { RowManagerModal } from './RowManagerModal';
import { calculateBedSpace } from '@/logic/spaceCalculator';
import { getMasterSheetByName } from '@/data/plantMasterSheets';
import { X, Plus, Edit2, Trash2, Grid, AlertTriangle, Layers } from 'lucide-react';

interface BedManagerProps {
  garden: Garden;
  tasks?: any[]; // GardenTask[]
  onClose?: () => void;
}

export const BedManager: React.FC<BedManagerProps> = ({
  garden,
  tasks = [],
  onClose
}) => {
  const { storageProvider } = useStorage();
  const [beds, setBeds] = useState<GardenBed[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBulkCreator, setShowBulkCreator] = useState(false);
  const [editingBed, setEditingBed] = useState<GardenBed | null>(null);
  const [filterType, setFilterType] = useState<BedType | 'All'>('All');
  const [spaceCalculations, setSpaceCalculations] = useState<Record<string, any>>({});
  const [rowsByBedId, setRowsByBedId] = useState<Record<string, GardenRow[]>>({});
  const [rowsModalBed, setRowsModalBed] = useState<GardenBed | null>(null);

  useEffect(() => {
    loadBeds();
  }, [garden.id]);

  useEffect(() => {
    const loadRows = async () => {
      try {
        const entries = await Promise.all(
          beds.map(async (b) => {
            try {
              const rows = await storageProvider.getGardenRows(b.id);
              return [b.id, rows] as const;
            } catch {
              return [b.id, []] as const;
            }
          })
        );
        setRowsByBedId(Object.fromEntries(entries));
      } catch {
        setRowsByBedId({});
      }
    };

    if (beds.length > 0) {
      loadRows();
    } else {
      setRowsByBedId({});
    }
  }, [beds, storageProvider]);

  const refreshRowsByBed = async () => {
    try {
      const entries = await Promise.all(
        beds.map(async (b) => {
          try {
            const rows = await storageProvider.getGardenRows(b.id);
            return [b.id, rows] as const;
          } catch {
            return [b.id, []] as const;
          }
        })
      );
      setRowsByBedId(Object.fromEntries(entries));
    } catch {
      setRowsByBedId({});
    }
  };

  const isRowIrrigationConfigured = (row: GardenRow): boolean => {
    const line = row.irrigationLine;
    if (!line) return false;
    if (typeof line.flowRatePerMeterLph === 'number' && line.flowRatePerMeterLph > 0) return true;
    if (
      typeof line.emitterSpacingCm === 'number' &&
      line.emitterSpacingCm > 0 &&
      typeof line.emitterFlowRateLph === 'number' &&
      line.emitterFlowRateLph > 0
    ) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (beds.length > 0 && tasks.length > 0) {
      calculateSpaces();
    }
  }, [beds, tasks]);

  const loadBeds = async () => {
    try {
      setLoading(true);
      const gardenBeds = await storageProvider.getGardenBeds(garden.id);
      setBeds(gardenBeds);
    } catch (error) {
      console.error('Error loading beds:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSpaces = () => {
    const masterSheets = new Map();
    tasks.forEach(task => {
      if (task.plantName) {
        const master = getMasterSheetByName(task.plantName);
        if (master) {
          masterSheets.set(task.plantName.toLowerCase(), master);
        }
      }
    });

    const calculations: Record<string, any> = {};
    beds.forEach(bed => {
      calculations[bed.id] = calculateBedSpace(bed, tasks, masterSheets);
    });
    setSpaceCalculations(calculations);
  };

  const handleSubmit = async (bedData: Omit<GardenBed, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingBed) {
        await storageProvider.updateGardenBed(editingBed.id, bedData);
      } else {
        await storageProvider.createGardenBed(bedData);
      }
      await loadBeds();
      setShowForm(false);
      setEditingBed(null);
    } catch (error) {
      console.error('Error saving bed:', error);
      alert('Errore nel salvare il letto');
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo letto? Le piante associate perderanno l\'associazione al letto.')) return;
    try {
      await storageProvider.deleteGardenBed(id);
      await loadBeds();
    } catch (error) {
      console.error('Error deleting bed:', error);
      alert('Errore nell\'eliminare il letto');
    }
  };

  const handleEdit = (bed: GardenBed) => {
    setEditingBed(bed);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingBed(null);
    setShowForm(true);
    setShowBulkCreator(false);
  };

  const handleBulkAdd = () => {
    setShowBulkCreator(true);
    setShowForm(false);
    setEditingBed(null);
  };

  const handleBulkSubmit = async (bedsToCreate: Omit<GardenBed, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    try {
      for (const bedData of bedsToCreate) {
        await storageProvider.createGardenBed(bedData);
      }
      await loadBeds();
      setShowBulkCreator(false);
    } catch (error) {
      console.error('Error creating bulk beds:', error);
      alert('Errore nella creazione multipla');
      throw error;
    }
  };

  // Ottieni strutture disponibili (serre/tunnel nel giardino)
  const getAvailableStructures = () => {
    // Se il giardino stesso è una serra, includilo
    const structures: Array<{ id: string; name: string; type: StructureType }> = [];
    if (garden.gardenType === 'Greenhouse' || garden.gardenType === 'Tunnel') {
      structures.push({
        id: garden.id,
        name: garden.name,
        type: 'Greenhouse'
      });
    }
    // Potremmo anche cercare altri giardini con strutture, ma per ora usiamo solo il giardino corrente
    return structures;
  };

  const getBedTypeLabel = (type: BedType): string => {
    const labels: Record<BedType, string> = {
      RaisedBed: 'Cassone',
      Container: 'Contenitore',
      Pot: 'Vaso',
      Ground: 'Piena terra',
      Greenhouse: 'Serra',
      Hydroponic: 'Idroponico',
      Aquaponic: 'Acquaponico',
      Aeroponic: 'Aeroponico',
      Indoor: 'Indoor',
    };
    return labels[type] || type;
  };

  const filteredBeds = beds.filter(bed => {
    if (filterType !== 'All' && bed.bedType !== filterType) return false;
    return true;
  });

  const byType = {
    RaisedBed: beds.filter(b => b.bedType === 'RaisedBed').length,
    Container: beds.filter(b => b.bedType === 'Container').length,
    Pot: beds.filter(b => b.bedType === 'Pot').length,
    Greenhouse: beds.filter(b => b.bedType === 'Greenhouse').length,
    Hydroponic: beds.filter(b => b.bedType === 'Hydroponic').length,
  };

  const totalArea = beds.reduce((sum, bed) => sum + (bed.areaSqMeters || 0), 0);
  const totalOccupied = Object.values(spaceCalculations).reduce(
    (sum: number, calc: any) => sum + (calc?.occupiedArea || 0),
    0
  );

  if (showBulkCreator) {
    return (
      <div className="p-4">
        <BulkBedCreator
          garden={garden}
          onAddMultiple={handleBulkSubmit}
          onCancel={() => setShowBulkCreator(false)}
          existingStructures={getAvailableStructures()}
        />
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="p-4">
        <BedForm
          garden={garden}
          bed={editingBed}
          onSave={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingBed(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-3">
          <Grid size={24} />
          Gestione Zone di Coltivazione
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        )}
      </div>

      {/* Statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-xl md:text-2xl font-bold text-green-600">{byType.RaisedBed}</div>
          <div className="text-xs text-gray-600">Cassoni</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-xl md:text-2xl font-bold text-blue-600">{byType.Container}</div>
          <div className="text-xs text-gray-600">Contenitori</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-xl md:text-2xl font-bold text-purple-600">{byType.Pot}</div>
          <div className="text-xs text-gray-600">Vasi</div>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg">
          <div className="text-xl md:text-2xl font-bold text-orange-600">{byType.Greenhouse + byType.Hydroponic}</div>
          <div className="text-xs text-gray-600">Strutture</div>
        </div>
      </div>

      {/* Riepilogo spazio */}
      {garden.sizeSqMeters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700">Spazio totale giardino</div>
              <div className="text-lg font-bold text-gray-800">{garden.sizeSqMeters.toFixed(2)} m²</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-700">Spazio letti definiti</div>
              <div className="text-lg font-bold text-gray-800">{totalArea.toFixed(2)} m²</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-700">Spazio occupato</div>
              <div className="text-lg font-bold text-green-600">{totalOccupied.toFixed(2)} m²</div>
            </div>
          </div>
        </div>
      )}

      {/* Filtri */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-sm font-medium text-gray-700">Filtra:</span>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as BedType | 'All')}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
        >
          <option value="All">Tutti</option>
          <option value="RaisedBed">Cassoni</option>
          <option value="Container">Contenitori</option>
          <option value="Pot">Vasi</option>
          <option value="Ground">Piena terra</option>
          <option value="Greenhouse">Serre</option>
          <option value="Hydroponic">Idroponico</option>
          <option value="Aquaponic">Acquaponico</option>
          <option value="Aeroponic">Aeroponico</option>
          <option value="Indoor">Indoor</option>
        </select>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={handleBulkAdd}
            className="flex items-center gap-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Layers size={18} />
            Aggiungi Multipli
          </button>
          <button
            onClick={handleNew}
            className="flex items-center gap-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus size={18} />
            Nuovo Letto
          </button>
        </div>
      </div>

      {/* Lista Letti */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Caricamento...</div>
      ) : filteredBeds.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nessun letto definito. Aggiungi il primo letto per organizzare meglio il tuo giardino!
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBeds.map((bed) => {
            const calc = spaceCalculations[bed.id];
            const occupancyPercentage = calc?.occupancyPercentage || 0;
            const isFull = occupancyPercentage >= 90;
            const isAlmostFull = occupancyPercentage >= 80;

            const rows = rowsByBedId[bed.id] || [];
            const configuredRowsCount = rows.filter(isRowIrrigationConfigured).length;

            return (
              <div
                key={bed.id}
                className={`p-4 border rounded-lg ${
                  isFull ? 'border-red-300 bg-red-50' : 
                  isAlmostFull ? 'border-yellow-300 bg-yellow-50' : 
                  'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-gray-800">{bed.name}</h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {getBedTypeLabel(bed.bedType)}
                      </span>
                      {rows.length > 0 && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-semibold ${
                            configuredRowsCount === rows.length
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                          title={
                            configuredRowsCount === rows.length
                              ? 'Tutti i filari hanno configurazione irrigua'
                              : 'Alcuni filari non hanno configurazione irrigua'
                          }
                        >
                          Filari: {configuredRowsCount}/{rows.length} configurati
                        </span>
                      )}
                      {bed.shape === 'Rectangle' && bed.lengthCm && bed.widthCm && (
                        <span className="text-xs text-gray-500">
                          {bed.lengthCm}×{bed.widthCm} cm
                        </span>
                      )}
                      {bed.shape === 'Circle' && bed.diameterCm && (
                        <span className="text-xs text-gray-500">
                          Ø{bed.diameterCm} cm
                        </span>
                      )}
                      {bed.areaSqMeters && (
                        <span className="text-xs text-gray-500 font-medium">
                          {bed.areaSqMeters.toFixed(2)} m²
                        </span>
                      )}
                    </div>
                    
                    {/* Spazio occupato */}
                    {calc && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Occupazione:</span>
                          <span className={`font-semibold ${
                            isFull ? 'text-red-600' : 
                            isAlmostFull ? 'text-yellow-600' : 
                            'text-green-600'
                          }`}>
                            {occupancyPercentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isFull ? 'bg-red-500' : 
                              isAlmostFull ? 'bg-yellow-500' : 
                              'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(100, occupancyPercentage)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Occupato: {calc.occupiedArea.toFixed(2)} m²</span>
                          <span>Disponibile: {calc.availableArea.toFixed(2)} m²</span>
                        </div>
                        {calc.plants.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            Piante: {calc.plants.map((p: { plantName: string; quantity: number }) => `${p.plantName} (${p.quantity})`).join(', ')}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Caratteristiche */}
                    <div className="text-xs text-gray-500 mt-2 space-y-1">
                      {bed.soilType && <div>Tipo terreno: {bed.soilType}</div>}
                      {bed.sunExposure && <div>Esposizione: {bed.sunExposure}</div>}
                      {bed.dailySunHours && <div>Ore sole: {bed.dailySunHours}h</div>}
                      {bed.structureType && <div>Struttura: {bed.structureType}</div>}
                      {bed.notes && <div className="italic">{bed.notes}</div>}
                    </div>

                    {isFull && (
                      <div className="mt-2 flex items-center gap-3 text-xs text-red-700">
                        <AlertTriangle size={14} />
                        <span>Letto pieno! Considera di aggiungere un nuovo letto.</span>
                      </div>
                    )}
                    {isAlmostFull && !isFull && (
                      <div className="mt-2 flex items-center gap-3 text-xs text-yellow-full max-w-sm">
                        <AlertTriangle size={14} />
                        <span>Letto quasi pieno.</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <button
                      onClick={() => setRowsModalBed(bed)}
                      className="p-3 text-gray-700 hover:bg-gray-50 rounded"
                      title="Gestisci Filari"
                    >
                      <Layers size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(bed)}
                      className="p-3 text-blue-600 hover:bg-blue-50 rounded"
                      title="Modifica"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(bed.id)}
                      className="p-3 text-red-600 hover:bg-red-50 rounded"
                      title="Elimina"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {rowsModalBed && (
        <RowManagerModal
          bed={rowsModalBed}
          open={true}
          onClose={() => {
            setRowsModalBed(null)
            refreshRowsByBed().catch(() => {})
          }}
        />
      )}
    </div>
  );
};

