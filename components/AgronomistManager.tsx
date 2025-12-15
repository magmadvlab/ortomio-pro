/**
 * Agronomist Manager Component
 * Manages trusted agronomists
 */

import React, { useState, useEffect } from 'react';
import { Agronomist } from '../types/agronomist';
import { useStorage } from '../packages/core/hooks/useStorage';
import { useTier } from '../packages/core/hooks/useTier';
import { getSupabaseClient } from '../config/supabase';
import { User, Mail, Phone, Plus, Edit2, Trash2, X } from 'lucide-react';

interface AgronomistManagerProps {
  onSelectAgronomist?: (agronomist: Agronomist) => void;
}

const AgronomistManager: React.FC<AgronomistManagerProps> = ({ onSelectAgronomist }) => {
  const { storageProvider } = useStorage();
  const { isPro } = useTier();
  const [agronomists, setAgronomists] = useState<Agronomist[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: [] as string[],
    notes: '',
    preferredContactMethod: 'Email' as 'Email' | 'Phone' | 'InPerson',
    consultationFrequency: 'OnDemand' as 'Weekly' | 'Monthly' | 'Seasonal' | 'OnDemand',
  });

  useEffect(() => {
    loadAgronomists();
  }, []);

  const getCurrentUserId = async (): Promise<string | null> => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      // Fallback to localStorage for local development
      return localStorage.getItem('user_id') || null;
    }
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        // Fallback to localStorage for local development
        return localStorage.getItem('user_id') || null;
      }
      return user.id;
    } catch (error) {
      console.error('Error getting current user:', error);
      // Fallback to localStorage for local development
      return localStorage.getItem('user_id') || null;
    }
  };

  const loadAgronomists = async () => {
    try {
      setLoading(true);
      const userId = await getCurrentUserId();
      if (!userId) {
        console.warn('No user ID available, skipping agronomist load');
        setAgronomists([]);
        return;
      }
      const loaded = await storageProvider.getAgronomists(userId);
      setAgronomists(loaded);
    } catch (error) {
      console.error('Error loading agronomists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Inserisci il nome dell\'agronomo');
      return;
    }

    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        alert('Devi essere autenticato per salvare un agronomo');
        return;
      }
      
      if (editingId) {
        await storageProvider.updateAgronomist(editingId, formData);
      } else {
        await storageProvider.createAgronomist({
          userId,
          ...formData,
          specialization: formData.specialization.filter(s => s.trim()),
        });
      }
      
      await loadAgronomists();
      setIsAdding(false);
      setEditingId(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        specialization: [],
        notes: '',
        preferredContactMethod: 'Email',
        consultationFrequency: 'OnDemand',
      });
    } catch (error) {
      console.error('Error saving agronomist:', error);
      alert('Errore nel salvataggio dell\'agronomo');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo agronomo?')) return;
    
    try {
      await storageProvider.deleteAgronomist(id);
      await loadAgronomists();
    } catch (error) {
      console.error('Error deleting agronomist:', error);
      alert('Errore nell\'eliminazione dell\'agronomo');
    }
  };

  const startEdit = (agronomist: Agronomist) => {
    setFormData({
      name: agronomist.name,
      email: agronomist.email || '',
      phone: agronomist.phone || '',
      specialization: agronomist.specialization || [],
      notes: agronomist.notes || '',
      preferredContactMethod: agronomist.preferredContactMethod,
      consultationFrequency: agronomist.consultationFrequency || 'OnDemand',
    });
    setEditingId(agronomist.id);
    setIsAdding(true);
  };

  if (!isPro) {
    return (
      <div className="bg-white p-6 rounded-xl border-2 border-purple-200">
        <p className="text-gray-600">La gestione agronomi è disponibile solo per utenti Pro.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Caricamento...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">Agronomi di Fiducia</h3>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setFormData({
              name: '',
              email: '',
              phone: '',
              specialization: [],
              notes: '',
              preferredContactMethod: 'Email',
              consultationFrequency: 'OnDemand',
            });
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Plus size={18} />
          Aggiungi
        </button>
      </div>

      {isAdding && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800">
              {editingId ? 'Modifica Agronomo' : 'Nuovo Agronomo'}
            </h4>
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Nome agronomo"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="+39 123 456 7890"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Metodo Contatto Preferito</label>
              <select
                value={formData.preferredContactMethod}
                onChange={(e) => setFormData({ ...formData, preferredContactMethod: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="Email">Email</option>
                <option value="Phone">Telefono</option>
                <option value="InPerson">Di Persona</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Salva
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {agronomists.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nessun agronomo registrato</p>
        ) : (
          agronomists.map(agronomist => (
            <div
              key={agronomist.id}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelectAgronomist?.(agronomist)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={20} className="text-green-600" />
                    <h4 className="font-semibold text-gray-800">{agronomist.name}</h4>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    {agronomist.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={14} />
                        <span>{agronomist.email}</span>
                      </div>
                    )}
                    {agronomist.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={14} />
                        <span>{agronomist.phone}</span>
                      </div>
                    )}
                    {agronomist.specialization && agronomist.specialization.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">Specializzazione: </span>
                        <span className="text-xs">{agronomist.specialization.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(agronomist);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(agronomist.id);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AgronomistManager;









