'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Droplets, Shield, Leaf, Edit2, Trash2 } from 'lucide-react';
import { getSupabaseClient } from '../../config/supabase';
import { TreatmentPlanner } from './TreatmentPlanner';
import { useAuth } from '@/packages/core/hooks/useAuth';

interface Treatment {
  id: string;
  plant_name: string;
  product_name: string;
  product_type: 'fertilizer' | 'pesticide' | 'fungicide' | 'herbicide' | 'other';
  application_date: string;
  dosage: string;
  method: string;
  notes?: string;
  garden_id: string;
  zone_id?: string;
  completed: boolean;
  created_at: string;
}

export const TreatmentDashboard: React.FC = () => {
  const { user } = useAuth();
  const supabase = getSupabaseClient();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPlanner, setShowPlanner] = useState(false);
  const [filterType, setFilterType] = useState<'all' | Treatment['product_type']>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    if (user) {
      loadTreatments();
    }
  }, [user]);

  const loadTreatments = async () => {
    try {
      setLoading(true);
      if (!supabase) {
        throw new Error('Supabase client not available');
      }
      
      const { data, error } = await supabase
        .from('treatments')
        .select('*')
        .order('application_date', { ascending: false });

      if (error) throw error;
      setTreatments(data || []);

    } catch (error) {
      console.error('Error loading treatments:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleToggleComplete = async (treatmentId: string, completed: boolean) => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      const { error } = await supabase
        .from('treatments')
        .update({ completed: !completed })
        .eq('id', treatmentId);

      if (error) throw error;

      setTreatments(treatments.map(t => 
        t.id === treatmentId ? { ...t, completed: !completed } : t
      ));
    } catch (error) {
      console.error('Error updating treatment:', error);
    }
  };

  const handleDeleteTreatment = async (treatmentId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo trattamento?')) return;

    try {
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      const { error } = await supabase
        .from('treatments')
        .delete()
        .eq('id', treatmentId);

      if (error) throw error;

      setTreatments((treatments || []).filter(t => t.id !== treatmentId));
    } catch (error) {
      console.error('Error deleting treatment:', error);
      alert('Errore nell\'eliminazione del trattamento');
    }
  };

  const getProductTypeIcon = (type: Treatment['product_type']) => {
    const icons = {
      fertilizer: <Leaf className="text-green-600" size={20} />,
      pesticide: <Shield className="text-red-600" size={20} />,
      fungicide: <Droplets className="text-blue-600" size={20} />,
      herbicide: <Shield className="text-orange-600" size={20} />,
      other: <Calendar className="text-gray-600" size={20} />
    };
    return icons[type];
  };

  const getProductTypeLabel = (type: Treatment['product_type']) => {
    const labels = {
      fertilizer: 'Fertilizzante',
      pesticide: 'Pesticida',
      fungicide: 'Fungicida',
      herbicide: 'Erbicida',
      other: 'Altro'
    };
    return labels[type];
  };

  const filteredTreatments = (treatments || []).filter(treatment => {
    if (filterType !== 'all' && treatment.product_type !== filterType) return false;
    if (filterStatus === 'pending' && treatment.completed) return false;
    if (filterStatus === 'completed' && !treatment.completed) return false;
    return true;
  });

  // Calculate statistics
  const totalTreatments = treatments.length;
  const pendingTreatments = treatments.filter(t => !t.completed).length;
  const completedTreatments = treatments.filter(t => t.completed).length;
  const treatmentsByType = treatments.reduce((acc, t) => {
    acc[t.product_type] = (acc[t.product_type] || 0) + 1;
    return acc;
  }, {} as Record<Treatment['product_type'], number>);

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
  if (showPlanner) {
    return (
      <TreatmentPlanner
        onSave={(treatmentData) => {
          setTreatments([treatmentData, ...treatments]);
          setShowPlanner(false);
        }}
        onClose={() => setShowPlanner(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Calendar className="text-blue-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-blue-600">{totalTreatments}</div>
              <div className="text-sm text-gray-600">Totali</div>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Calendar className="text-yellow-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-yellow-600">{pendingTreatments}</div>
              <div className="text-sm text-gray-600">In Programma</div>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Calendar className="text-green-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-green-600">{completedTreatments}</div>
              <div className="text-sm text-gray-600">Completati</div>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Leaf className="text-purple-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-purple-600">{treatmentsByType.fertilizer || 0}</div>
              <div className="text-sm text-gray-600">Fertilizzanti</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Tipo:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Tutti</option>
              <option value="fertilizer">Fertilizzanti</option>
              <option value="pesticide">Pesticidi</option>
              <option value="fungicide">Fungicidi</option>
              <option value="herbicide">Erbicidi</option>
              <option value="other">Altri</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Stato:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Tutti</option>
              <option value="pending">In Programma</option>
              <option value="completed">Completati</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => setShowPlanner(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus size={20} />
          Nuovo Trattamento
        </button>
      </div>
      {/* Treatments List */}
      {filteredTreatments.length === 0 ? (
        <div className="text-center py-12">
          <Shield size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun trattamento trovato</h3>
          <p className="text-gray-600 mb-4">
            {treatments.length === 0 
              ? 'Inizia a pianificare i tuoi trattamenti per mantenere le piante in salute'
              : 'Nessun trattamento corrisponde ai filtri selezionati'
            }
          </p>
          {treatments.length === 0 && (
            <button
              onClick={() => setShowPlanner(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Pianifica Primo Trattamento
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredTreatments.map((treatment) => (
              <div key={treatment.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={treatment.completed}
                      onChange={() => handleToggleComplete(treatment.id, treatment.completed)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <div className="flex items-center gap-3">
                      {getProductTypeIcon(treatment.product_type)}
                      <div>
                        <h3 className={`font-semibold ${
                          treatment.completed ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}>
                          {treatment.product_name}
                        </h3>
                        <div className="text-sm text-gray-600">
                          {treatment.plant_name} • {new Date(treatment.application_date).toLocaleDateString('it-IT')}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{treatment.dosage}</div>
                      <div className="text-sm text-gray-600">{treatment.method}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      treatment.product_type === 'fertilizer' ? 'bg-green-100 text-green-800' :
                      treatment.product_type === 'pesticide' ? 'bg-red-100 text-red-800' :
                      treatment.product_type === 'fungicide' ? 'bg-blue-100 text-blue-800' :
                      treatment.product_type === 'herbicide' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getProductTypeLabel(treatment.product_type)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteTreatment(treatment.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Elimina"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                {treatment.notes && (
                  <div className="mt-3 text-sm text-gray-600 italic pl-8">
                    {treatment.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
