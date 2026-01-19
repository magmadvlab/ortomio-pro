'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Weight, TrendingUp, Package, Edit2, Trash2, Sprout, AlertCircle } from 'lucide-react';
import { getSupabaseClient } from '../../config/supabase';
import { HarvestRegistrationModal } from './HarvestRegistrationModal';
import { GardenTask } from '@/types';
import { useStorage } from '@/packages/core/hooks/useStorage';

interface Harvest {
  id: string;
  plant_name: string;
  variety?: string;
  quantity: number;
  unit: string;
  harvest_date: string;
  rating?: number; // Changed from quality_rating to match database
  notes?: string;
  garden_id: string;
  zone_id?: string;
  field_id?: string;
  task_id?: string; // Collegamento al task di coltivazione
  is_tracked?: boolean; // true se collegato a una coltura tracciata
  created_at: string;
}

interface HarvestDashboardProps {
  gardenId?: string;
}

export const HarvestDashboard: React.FC<HarvestDashboardProps> = ({ gardenId }) => {
  const supabase = getSupabaseClient();
  const { storageProvider } = useStorage();
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [plantedCrops, setPlantedCrops] = useState<GardenTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHarvest, setEditingHarvest] = useState<Harvest | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<'week' | 'month' | 'year' | 'all'>('month');
  const [filterType, setFilterType] = useState<'all' | 'tracked' | 'manual'>('all');

  useEffect(() => {
    loadData();
  }, [gardenId, filterPeriod]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carica raccolti
      await loadHarvests();
      
      // Carica colture piantate se abbiamo un gardenId
      if (gardenId && storageProvider) {
        const tasks = await storageProvider.getTasks(gardenId);
        setPlantedCrops(tasks);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHarvests = async () => {
    if (!supabase) {
      // Fallback per sviluppo locale senza Supabase
      setHarvests([]);
      return;
    }

    try {
      let query = supabase
        .from('harvest_logs')
        .select('*')
        .order('harvest_date', { ascending: false });

      // Filtra per giardino se specificato
      if (gardenId) {
        query = query.eq('garden_id', gardenId);
      }

      // Apply date filter
      if (filterPeriod !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        switch (filterPeriod) {
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        query = query.gte('harvest_date', startDate.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) throw error;
      setHarvests(data || []);

    } catch (error) {
      console.error('Error loading harvests:', error);
      setHarvests([]);
    }
  };

  const handleCreateHarvest = async (harvestData: Omit<Harvest, 'id' | 'created_at'>) => {
    if (!supabase) {
      // Fallback per sviluppo locale
      const newHarvest = {
        ...harvestData,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString()
      };
      setHarvests([newHarvest, ...harvests]);
      setShowModal(false);
      
      // Se è collegato a un task, aggiorna lo stage del task
      if (harvestData.task_id && storageProvider) {
        try {
          const task = plantedCrops.find(t => t.id === harvestData.task_id);
          if (task) {
            await storageProvider.updateTask(task.id, {
              ...task,
              stage: 'Harvested'
            });
            // Ricarica i task
            if (gardenId) {
              const updatedTasks = await storageProvider.getTasks(gardenId);
              setPlantedCrops(updatedTasks);
            }
          }
        } catch (error) {
          console.error('Error updating task stage:', error);
        }
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('harvest_logs')
        .insert([harvestData])
        .select()
        .single();

      if (error) throw error;

      setHarvests([data, ...harvests]);
      setShowModal(false);
      
      // Se è collegato a un task, aggiorna lo stage del task
      if (harvestData.task_id && storageProvider) {
        try {
          const task = plantedCrops.find(t => t.id === harvestData.task_id);
          if (task) {
            await storageProvider.updateTask(task.id, {
              ...task,
              stage: 'Harvested'
            });
            // Ricarica i task
            if (gardenId) {
              const updatedTasks = await storageProvider.getTasks(gardenId);
              setPlantedCrops(updatedTasks);
            }
          }
        } catch (error) {
          console.error('Error updating task stage:', error);
        }
      }
    } catch (error) {
      console.error('Error creating harvest:', error);
      alert('Errore nella registrazione del raccolto');
    }
  };

  const handleUpdateHarvest = async (harvestData: Omit<Harvest, 'id' | 'created_at'>) => {
    if (!editingHarvest) return;

    if (!supabase) {
      // Fallback per sviluppo locale
      const updatedHarvest = { ...editingHarvest, ...harvestData };
      setHarvests(harvests.map(h => h.id === editingHarvest.id ? updatedHarvest : h));
      setEditingHarvest(null);
      setShowModal(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('harvest_logs')
        .update(harvestData)
        .eq('id', editingHarvest.id)
        .select()
        .single();

      if (error) throw error;

      setHarvests(harvests.map(h => h.id === editingHarvest.id ? data : h));
      setEditingHarvest(null);
      setShowModal(false);
    } catch (error) {
      console.error('Error updating harvest:', error);
      alert('Errore nell\'aggiornamento del raccolto');
    }
  };

  const handleDeleteHarvest = async (harvestId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo raccolto?')) return;

    if (!supabase) {
      // Fallback per sviluppo locale
      setHarvests(harvests.filter(h => h.id !== harvestId));
      return;
    }

    try {
      const { error } = await supabase
        .from('harvest_logs')
        .delete()
        .eq('id', harvestId);

      if (error) throw error;

      setHarvests(harvests.filter(h => h.id !== harvestId));
    } catch (error) {
      console.error('Error deleting harvest:', error);
      alert('Errore nell\'eliminazione del raccolto');
    }
  };

  // Filtra raccolti per tipo
  const filteredHarvests = harvests.filter(harvest => {
    if (filterType === 'all') return true;
    if (filterType === 'tracked') return harvest.is_tracked;
    if (filterType === 'manual') return !harvest.is_tracked;
    return true;
  });

  // Calculate statistics
  const totalQuantity = filteredHarvests.reduce((sum, h) => sum + h.quantity, 0);
  const uniquePlants = new Set(filteredHarvests.map(h => h.plant_name)).size;
  const averageQuality = filteredHarvests.length > 0 
    ? filteredHarvests.filter(h => h.rating).reduce((sum, h) => sum + (h.rating || 0), 0) / filteredHarvests.filter(h => h.rating).length
    : 0;
  const trackedHarvests = filteredHarvests.filter(h => h.is_tracked).length;

  // Group harvests by plant
  const harvestsByPlant = filteredHarvests.reduce((acc, harvest) => {
    const key = harvest.plant_name;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(harvest);
    return acc;
  }, {} as Record<string, Harvest[]>);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getQualityColor = (rating?: number) => {
    if (!rating) return 'text-gray-400';
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Weight className="text-green-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-green-600">{totalQuantity.toFixed(1)}</div>
              <div className="text-sm text-gray-600">kg Totali</div>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Package className="text-blue-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-blue-600">{filteredHarvests.length}</div>
              <div className="text-sm text-gray-600">Raccolti</div>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-purple-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-purple-600">{uniquePlants}</div>
              <div className="text-sm text-gray-600">Varietà</div>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Sprout className="text-orange-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-orange-600">{trackedHarvests}</div>
              <div className="text-sm text-gray-600">Tracciati</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Periodo:</label>
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="week">Ultima settimana</option>
              <option value="month">Ultimo mese</option>
              <option value="year">Ultimo anno</option>
              <option value="all">Tutti</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Tipo:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Tutti</option>
              <option value="tracked">Solo tracciati</option>
              <option value="manual">Solo manuali</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={() => {
            setEditingHarvest(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus size={20} />
          Nuovo Raccolto
        </button>
      </div>

      {/* Info Box per sistema di tracciamento */}
      {plantedCrops.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Sprout className="text-blue-600 mt-0.5" size={20} />
            <div>
              <h4 className="font-medium text-blue-900">Sistema di Tracciamento Attivo</h4>
              <p className="text-sm text-blue-800 mt-1">
                Hai <strong>{plantedCrops.filter(t => t.completed && ['Sowing', 'Transplant'].includes(t.taskType)).length} colture piantate</strong> che possono essere collegate ai raccolti.
                I raccolti tracciati permettono di analizzare rese e performance delle tue coltivazioni.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Harvests List */}
      {filteredHarvests.length === 0 ? (
        <div className="text-center py-12">
          <Package size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filterType === 'all' ? 'Nessun raccolto registrato' : 
             filterType === 'tracked' ? 'Nessun raccolto tracciato' :
             'Nessun raccolto manuale'}
          </h3>
          <p className="text-gray-600 mb-4">
            {filterType === 'all' ? 'Inizia a registrare i tuoi raccolti per monitorare la produzione' :
             filterType === 'tracked' ? 'I raccolti tracciati sono collegati alle colture che hai piantato' :
             'I raccolti manuali sono inserimenti liberi non collegati al sistema di pianificazione'}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Registra Primo Raccolto
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(harvestsByPlant).map(([plantName, plantHarvests]) => (
            <div key={plantName} className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{plantName}</h3>
                    <div className="text-sm text-gray-600">
                      {plantHarvests.length} raccolti • {plantHarvests.reduce((sum, h) => sum + h.quantity, 0).toFixed(1)} kg totali
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {plantHarvests.some(h => h.is_tracked) && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Tracciato
                      </span>
                    )}
                    {plantHarvests.some(h => !h.is_tracked) && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                        Manuale
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {plantHarvests.map((harvest) => (
                  <div key={harvest.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {harvest.quantity} {harvest.unit}
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatDate(harvest.harvest_date)}
                            </div>
                          </div>
                          {harvest.variety && (
                            <div className="text-sm text-gray-500">
                              Varietà: {harvest.variety}
                            </div>
                          )}
                          {harvest.rating && (
                            <div className={`text-sm font-medium ${getQualityColor(harvest.rating)}`}>
                              ★ {harvest.rating}/5
                            </div>
                          )}
                          {harvest.is_tracked && (
                            <div className="flex items-center gap-1 text-xs text-green-600">
                              <Sprout size={12} />
                              Tracciato
                            </div>
                          )}
                        </div>
                        {harvest.notes && (
                          <div className="mt-2 text-sm text-gray-600 italic">
                            {harvest.notes}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingHarvest(harvest);
                            setShowModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Modifica"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteHarvest(harvest.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Elimina"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <HarvestRegistrationModal
          harvest={editingHarvest}
          gardenId={gardenId || 'default'}
          plantedCrops={plantedCrops}
          onSave={editingHarvest ? handleUpdateHarvest : handleCreateHarvest}
          onClose={() => {
            setShowModal(false);
            setEditingHarvest(null);
          }}
        />
      )}
    </div>
  );
};