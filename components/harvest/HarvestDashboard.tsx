'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Weight, TrendingUp, Package, Edit2, Trash2 } from 'lucide-react';
import { getSupabaseClient } from '../../config/supabase';
import { HarvestRegistrationModal } from './HarvestRegistrationModal';

interface Harvest {
  id: string;
  plant_name: string;
  variety?: string;
  quantity: number;
  unit: string;
  harvest_date: string;
  quality_rating?: number;
  notes?: string;
  garden_id: string;
  zone_id?: string;
  field_id?: string;
  created_at: string;
}

export const HarvestDashboard: React.FC = () => {
  const supabase = getSupabaseClient();
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHarvest, setEditingHarvest] = useState<Harvest | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<'week' | 'month' | 'year' | 'all'>('month');

  useEffect(() => {
    if (user) {
      loadHarvests();
    }
  }, [user, filterPeriod]);

  const loadHarvests = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('harvests')
        .select('*')
        .order('harvest_date', { ascending: false });

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
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHarvest = async (harvestData: Omit<Harvest, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('harvests')
        .insert([harvestData])
        .select()
        .single();

      if (error) throw error;

      setHarvests([data, ...harvests]);
      setShowModal(false);
    } catch (error) {
      console.error('Error creating harvest:', error);
      alert('Errore nella registrazione del raccolto');
    }
  };

  const handleUpdateHarvest = async (harvestData: Omit<Harvest, 'id' | 'created_at'>) => {
    if (!editingHarvest) return;

    try {
      const { data, error } = await supabase
        .from('harvests')
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

    try {
      const { error } = await supabase
        .from('harvests')
        .delete()
        .eq('id', harvestId);

      if (error) throw error;

      setHarvests(harvests.filter(h => h.id !== harvestId));
    } catch (error) {
      console.error('Error deleting harvest:', error);
      alert('Errore nell\'eliminazione del raccolto');
    }
  };

  // Calculate statistics
  const totalQuantity = harvests.reduce((sum, h) => sum + h.quantity, 0);
  const uniquePlants = new Set(harvests.map(h => h.plant_name)).size;
  const averageQuality = harvests.length > 0 
    ? harvests.filter(h => h.quality_rating).reduce((sum, h) => sum + (h.quality_rating || 0), 0) / harvests.filter(h => h.quality_rating).length
    : 0;

  // Group harvests by plant
  const harvestsByPlant = harvests.reduce((acc, harvest) => {
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
              <div className="text-2xl font-bold text-blue-600">{harvests.length}</div>
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
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Calendar className="text-yellow-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {averageQuality > 0 ? averageQuality.toFixed(1) : '-'}
              </div>
              <div className="text-sm text-gray-600">Qualità Media</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
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

      {/* Harvests List */}
      {harvests.length === 0 ? (
        <div className="text-center py-12">
          <Package size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun raccolto registrato</h3>
          <p className="text-gray-600 mb-4">
            Inizia a registrare i tuoi raccolti per monitorare la produzione
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
                <h3 className="text-lg font-semibold text-gray-900">{plantName}</h3>
                <div className="text-sm text-gray-600">
                  {plantHarvests.length} raccolti • {plantHarvests.reduce((sum, h) => sum + h.quantity, 0).toFixed(1)} kg totali
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
                          {harvest.quality_rating && (
                            <div className={`text-sm font-medium ${getQualityColor(harvest.quality_rating)}`}>
                              ★ {harvest.quality_rating}/5
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