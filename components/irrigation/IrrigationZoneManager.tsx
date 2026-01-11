'use client'

import React, { useState } from 'react';
import { IrrigationZone, IrrigationComponent, WateringMethod } from '@/types/irrigation';
import { Garden } from '@/types';
import { calculateZoneFlowRate, updateZoneFlowRateFromComponents } from '@/services/irrigationService';
import { Droplets, Edit, Trash2, Plus, X, Save, Clock, AlertCircle } from 'lucide-react';
import { IrrigationZoneWizard } from './IrrigationZoneWizard';

interface IrrigationZoneManagerProps {
  garden: Garden;
  zones: IrrigationZone[];
  onZoneUpdate: (zone: IrrigationZone) => void;
  onZoneDelete: (zoneId: string) => void;
  onZoneCreate: (zone: IrrigationZone) => void;
}

export const IrrigationZoneManager: React.FC<IrrigationZoneManagerProps> = ({
  garden,
  zones,
  onZoneUpdate,
  onZoneDelete,
  onZoneCreate
}) => {
  const [editingZone, setEditingZone] = useState<IrrigationZone | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [editingComponents, setEditingComponents] = useState(false);
  const [components, setComponents] = useState<IrrigationComponent[]>([]);

  const handleEdit = (zone: IrrigationZone) => {
    setEditingZone(zone);
    setComponents([]); // TODO: Caricare componenti da storage
  };

  const handleSave = () => {
    if (!editingZone) return;
    
    let updatedZone = { ...editingZone };
    
    // Se editing components, calcola portata
    if (editingComponents && components.length > 0) {
      updatedZone = updateZoneFlowRateFromComponents(editingZone, components);
    }
    
    onZoneUpdate(updatedZone);
    setEditingZone(null);
    setEditingComponents(false);
    setComponents([]);
  };

  const handleAddComponent = () => {
    const newComponent: IrrigationComponent = {
      id: crypto.randomUUID(),
      zoneId: editingZone!.id,
      type: 'Dripper',
      quantity: 1,
      flowRateLph: 4,
      createdAt: new Date().toISOString()
    };
    setComponents([...components, newComponent]);
  };

  const handleComponentUpdate = (id: string, updates: Partial<IrrigationComponent>) => {
    setComponents(components.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleComponentDelete = (id: string) => {
    setComponents(components.filter(c => c.id !== id));
  };

  const getMethodLabel = (method: WateringMethod) => {
    const labels = {
      'Manual': 'Manuale',
      'Hose': 'Tubo + Lancia',
      'Dripline': 'Ala Gocciolante',
      'Drippers': 'Gocciolatori',
      'MicroSprinkler': 'Micro-Sprinkler',
      'Sprinkler': 'Sprinkler',
      'Mixed': 'Misto'
    };
    return labels[method];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Droplets size={24} className="text-blue-600" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Gestione Zone Irrigue</h2>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-3"
        >
          <Plus size={20} />
          Nuova Zona
        </button>
      </div>

      {zones.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-xl text-center">
          <Droplets size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Nessuna zona configurata. Crea una nuova zona per iniziare!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {zones.map(zone => (
            <div key={zone.id} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              {editingZone?.id === zone.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome Zona</label>
                    <input
                      type="text"
                      value={editingZone.name}
                      onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Portata (L/h)</label>
                    <input
                      type="number"
                      value={editingZone.flowRateLph}
                      onChange={(e) => setEditingZone({ ...editingZone, flowRateLph: parseFloat(e.target.value) || 0 })}
                      className="w-full p-3 border rounded-lg"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-3 mb-2">
                      <input
                        type="checkbox"
                        checked={editingComponents}
                        onChange={(e) => setEditingComponents(e.target.checked)}
                      />
                      <span>Calcola da componenti (Livello Pro)</span>
                    </label>
                    
                    {editingComponents && (
                      <div className="mt-2 space-y-2">
                        {components.map(comp => (
                          <div key={comp.id} className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                            <select
                              value={comp.type}
                              onChange={(e) => handleComponentUpdate(comp.id, { type: e.target.value as any })}
                              className="flex-1 p-3 border rounded"
                            >
                              <option value="Dripline">Ala Gocciolante</option>
                              <option value="Dripper">Gocciolatore</option>
                              <option value="MicroSprinkler">Micro-Sprinkler</option>
                            </select>
                            {comp.type === 'Dripline' && (
                              <>
                                <input
                                  type="number"
                                  placeholder="Metri"
                                  value={comp.lengthMeters || ''}
                                  onChange={(e) => handleComponentUpdate(comp.id, { lengthMeters: parseFloat(e.target.value) || 0 })}
                                  className="w-24 p-3 border rounded"
                                />
                                <input
                                  type="number"
                                  placeholder="L/h per metro"
                                  value={comp.flowRatePerMeterLph || ''}
                                  onChange={(e) => handleComponentUpdate(comp.id, { flowRatePerMeterLph: parseFloat(e.target.value) || 0 })}
                                  className="w-32 p-3 border rounded"
                                />
                              </>
                            )}
                            {(comp.type === 'Dripper' || comp.type === 'MicroSprinkler') && (
                              <>
                                <input
                                  type="number"
                                  placeholder="Quantità"
                                  value={comp.quantity || ''}
                                  onChange={(e) => handleComponentUpdate(comp.id, { quantity: parseInt(e.target.value) || 0 })}
                                  className="w-24 p-3 border rounded"
                                />
                                <input
                                  type="number"
                                  placeholder="L/h per unità"
                                  value={comp.flowRateLph || ''}
                                  onChange={(e) => handleComponentUpdate(comp.id, { flowRateLph: parseFloat(e.target.value) || 0 })}
                                  className="w-32 p-3 border rounded"
                                />
                              </>
                            )}
                            <button
                              onClick={() => handleComponentDelete(comp.id)}
                              className="p-3 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={handleAddComponent}
                          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 text-sm"
                        >
                          + Aggiungi Componente
                        </button>
                        {components.length > 0 && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              Portata calcolata: <strong>{calculateZoneFlowRate(components).toFixed(1)} L/h</strong>
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-3"
                    >
                      <Save size={18} />
                      Salva
                    </button>
                    <button
                      onClick={() => {
                        setEditingZone(null);
                        setEditingComponents(false);
                        setComponents([]);
                      }}
                      className="px-4 py-2 border rounded-lg"
                    >
                      Annulla
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{zone.name}</h3>
                      <p className="text-sm text-gray-600">
                        {getMethodLabel(zone.method)} • {zone.flowRateLph} L/h
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(zone)}
                        className="p-3 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Eliminare la zona "${zone.name}"?`)) {
                            onZoneDelete(zone.id);
                          }
                        }}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Aiuole associate:</span>
                      <span className="ml-2 font-semibold">{zone.bedIds.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Piante associate:</span>
                      <span className="ml-2 font-semibold">{zone.plantTaskIds.length}</span>
                    </div>
                    {zone.valveId && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Valvola Smart:</span>
                        <span className="ml-2 font-semibold">{zone.valveId}</span>
                      </div>
                    )}
                    {zone.calculatedFromComponents && (
                      <div className="col-span-2">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Portata calcolata da componenti
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {zone.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{zone.notes}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {showWizard && (
        <IrrigationZoneWizard
          garden={garden}
          beds={[]} // TODO: Caricare da storage
          systemId={garden.id}
          onComplete={(zone) => {
            onZoneCreate(zone);
            setShowWizard(false);
          }}
          onCancel={() => setShowWizard(false)}
        />
      )}
    </div>
  );
};

