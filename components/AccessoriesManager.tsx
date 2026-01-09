import React, { useState, useEffect } from 'react';
import { Garden } from '@/types';
import { GardenAccessory, AccessoryCategory } from '@/types/accessories';
import { useStorage } from '@/packages/core/hooks/useStorage';
import { AccessoryForm } from './accessories/AccessoryForm';
import { X, Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';

interface AccessoriesManagerProps {
  garden: Garden;
  onClose?: () => void;
}

export const AccessoriesManager: React.FC<AccessoriesManagerProps> = ({
  garden,
  onClose
}) => {
  const { storageProvider } = useStorage();
  const [accessories, setAccessories] = useState<GardenAccessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState<GardenAccessory | null>(null);
  const [filterCategory, setFilterCategory] = useState<AccessoryCategory | 'All'>('All');
  const [filterPlant, setFilterPlant] = useState<string>(''); // Filtro per pianta

  useEffect(() => {
    loadAccessories();
  }, [garden.id]);

  const loadAccessories = async () => {
    try {
      setLoading(true);
      const allAccessories = await storageProvider.getAccessories(garden.id);
      setAccessories(allAccessories);
    } catch (error) {
      console.error('Error loading accessories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (accessoryData: Omit<GardenAccessory, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingAccessory) {
        await storageProvider.updateAccessory(editingAccessory.id, accessoryData);
      } else {
        await storageProvider.createAccessory(accessoryData);
      }
      await loadAccessories();
      setShowForm(false);
      setEditingAccessory(null);
    } catch (error) {
      console.error('Error saving accessory:', error);
      alert('Errore nel salvare l\'accessorio');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo accessorio?')) return;
    try {
      await storageProvider.deleteAccessory(id);
      await loadAccessories();
    } catch (error) {
      console.error('Error deleting accessory:', error);
      alert('Errore nell\'eliminare l\'accessorio');
    }
  };

  const handleEdit = (accessory: GardenAccessory) => {
    setEditingAccessory(accessory);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingAccessory(null);
    setShowForm(true);
  };

  // Estrai lista piante uniche dagli accessori per il filtro
  const uniquePlants = Array.from(new Set(
    accessories.flatMap(a => a.usedFor || [])
  )).sort();

  const filteredAccessories = accessories.filter(a => {
    if (filterCategory !== 'All' && a.category !== filterCategory) return false;
    if (filterPlant && !a.usedFor?.some(plant => 
      plant.toLowerCase().includes(filterPlant.toLowerCase()) ||
      filterPlant.toLowerCase().includes(plant.toLowerCase())
    )) return false;
    return true;
  });

  const needsReplacement = accessories.filter(a => a.needsReplacement);
  const byCategory = {
    Support: accessories.filter(a => a.category === 'Support').length,
    Netting: accessories.filter(a => a.category === 'Netting').length,
    Wire: accessories.filter(a => a.category === 'Wire').length,
    Structure: accessories.filter(a => a.category === 'Structure').length,
  };

  if (showForm) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">
            {editingAccessory ? 'Modifica Accessorio' : 'Nuovo Accessorio'}
          </h3>
          <button
            onClick={() => {
              setShowForm(false);
              setEditingAccessory(null);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        <AccessoryForm
          gardenId={garden.id}
          initialAccessory={editingAccessory || undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingAccessory(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Gestione Accessori</h2>
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
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{byCategory.Support}</div>
          <div className="text-xs text-gray-600">Supporti</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{byCategory.Netting}</div>
          <div className="text-xs text-gray-600">Reti</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{byCategory.Wire}</div>
          <div className="text-xs text-gray-600">Fili</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{byCategory.Structure}</div>
          <div className="text-xs text-gray-600">Strutture</div>
        </div>
      </div>

      {needsReplacement.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle size={20} />
            <span className="font-semibold">{needsReplacement.length} accessorio/i da sostituire</span>
          </div>
        </div>
      )}

      {/* Filtri */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Filtra:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as AccessoryCategory | 'All')}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="All">Tutti</option>
            <option value="Support">Supporti</option>
            <option value="Netting">Reti</option>
            <option value="Wire">Fili</option>
            <option value="Structure">Strutture</option>
          </select>
          {uniquePlants.length > 0 && (
            <select
              value={filterPlant}
              onChange={(e) => setFilterPlant(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Tutte le piante</option>
              {uniquePlants.map(plant => (
                <option key={plant} value={plant}>{plant}</option>
              ))}
            </select>
          )}
          <button
            onClick={handleNew}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus size={18} />
            Nuovo Accessorio
          </button>
        </div>
        {filterPlant && (
          <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-2">
            Mostrando accessori per: <strong>{filterPlant}</strong>
            <button
              onClick={() => setFilterPlant('')}
              className="ml-2 text-blue-600 hover:text-blue-800 underline"
            >
              Rimuovi filtro
            </button>
          </div>
        )}
      </div>

      {/* Lista Accessori */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Caricamento...</div>
      ) : filteredAccessories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nessun accessorio trovato. Aggiungi il primo accessorio!
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAccessories.map((accessory) => (
            <div
              key={accessory.id}
              className={`p-4 border rounded-lg ${
                accessory.needsReplacement ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800">{accessory.name}</h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {accessory.category}
                    </span>
                    {accessory.needsReplacement && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                        Da sostituire
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span>Materiale: {accessory.material}</span>
                    {accessory.quantity && <span className="ml-3">Quantità: {accessory.quantity}</span>}
                    {accessory.usedFor && accessory.usedFor.length > 0 && (
                      <span className="ml-3">Per: {accessory.usedFor.join(', ')}</span>
                    )}
                  </div>
                  {accessory.installationDate && (
                    <div className="text-xs text-gray-500 mt-1">
                      Installato: {new Date(accessory.installationDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(accessory)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Modifica"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(accessory.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Elimina"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

