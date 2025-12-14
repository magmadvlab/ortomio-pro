import React, { useState, useEffect } from 'react';
import { PlantMasterSheet, Garden } from '@/types';
import { GardenAccessory } from '@/types/accessories';
import { suggestAccessoriesForPlant } from '@/logic/accessoriesEngine';
import { useStorage } from '@/packages/core/hooks/useStorage';
import { Package, Plus, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { AccessoryForm } from '../accessories/AccessoryForm';

interface AccessoriesSuggestionsSectionProps {
  plantName: string;
  masterData: PlantMasterSheet | null;
  garden: Garden;
  onAddAccessory?: (accessory: Partial<GardenAccessory>) => void;
  existingAccessories?: GardenAccessory[];
}

export const AccessoriesSuggestionsSection: React.FC<AccessoriesSuggestionsSectionProps> = ({
  plantName,
  masterData,
  garden,
  onAddAccessory,
  existingAccessories: propExistingAccessories
}) => {
  const { storageProvider } = useStorage();
  const [suggestions, setSuggestions] = useState(suggestAccessoriesForPlant(plantName, masterData));
  const [existingAccessories, setExistingAccessories] = useState<GardenAccessory[]>(
    propExistingAccessories || []
  );
  const [showForm, setShowForm] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<typeof suggestions[0] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExistingAccessories();
  }, [garden.id, plantName]);

  const loadExistingAccessories = async () => {
    try {
      setLoading(true);
      const allAccessories = await storageProvider.getAccessories(garden.id);
      // Filtra accessori associati a questa pianta
      const plantAccessories = allAccessories.filter(acc => 
        acc.usedFor?.some(plant => 
          plant.toLowerCase().includes(plantName.toLowerCase()) ||
          plantName.toLowerCase().includes(plant.toLowerCase())
        )
      );
      setExistingAccessories(plantAccessories);
    } catch (error) {
      console.error('Error loading accessories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccessory = async (accessoryData: Omit<GardenAccessory, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await storageProvider.createAccessory(accessoryData);
      await loadExistingAccessories();
      setShowForm(false);
      setSelectedSuggestion(null);
      if (onAddAccessory) {
        onAddAccessory(accessoryData);
      }
    } catch (error) {
      console.error('Error creating accessory:', error);
      alert('Errore nel salvare l\'accessorio');
    }
  };

  const isAccessoryAlreadyPresent = (suggestion: typeof suggestions[0]): boolean => {
    if (!suggestion.suggestedAccessory) return false;
    
    const { category, type } = suggestion.suggestedAccessory;
    
    return existingAccessories.some(acc => {
      if (acc.category !== category) return false;
      
      if (category === 'Support') {
        return acc.supportType === type;
      } else if (category === 'Netting') {
        return acc.nettingType === type;
      }
      
      return false;
    });
  };

  const getAccessoryIcon = (category: string, type?: string) => {
    if (category === 'Support') {
      return '🪴';
    } else if (category === 'Netting') {
      if (type === 'Insect') return '🕸️';
      if (type === 'Shade') return '☂️';
      if (type === 'Harvest') return '🧺';
      return '🕸️';
    }
    return '📦';
  };

  const getPriorityColor = (priority: 'High' | 'Medium' | 'Low') => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (suggestions.length === 0) {
    return null; // Non mostrare sezione se non ci sono suggerimenti
  }

  if (showForm && selectedSuggestion) {
    const suggestedAcc = selectedSuggestion.suggestedAccessory;
    if (!suggestedAcc) return null;

    const prefillData: Partial<GardenAccessory> = {
      gardenId: garden.id,
      name: `${suggestedAcc.type || 'Accessorio'} per ${plantName}`,
      category: suggestedAcc.category,
      material: (suggestedAcc.material || 'Wood') as any,
      height: suggestedAcc.heightCm,
      quantity: suggestedAcc.quantity || 1,
      usedFor: suggestedAcc.usedFor || [plantName],
    };

    // Map type based on category
    if (suggestedAcc.category === 'Support' && suggestedAcc.type) {
      if (suggestedAcc.type === 'Stake') prefillData.supportType = 'Stake';
      if (suggestedAcc.type === 'Trellis') prefillData.supportType = 'Trellis';
      if (suggestedAcc.type === 'Cage') prefillData.supportType = 'Cage';
    } else if (suggestedAcc.category === 'Netting' && suggestedAcc.type) {
      if (suggestedAcc.type === 'Insect') prefillData.nettingType = 'Insect';
      if (suggestedAcc.type === 'Shade') prefillData.nettingType = 'Shade';
      if (suggestedAcc.type === 'Harvest') prefillData.nettingType = 'Harvest';
    }

    return (
      <div className="bg-white p-4 rounded-xl border-2 border-green-200 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Package size={20} className="text-green-600" />
            Aggiungi Accessorio Suggerito
          </h3>
          <button
            onClick={() => {
              setShowForm(false);
              setSelectedSuggestion(null);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-green-800">
            <strong>Suggerito per:</strong> {plantName}
          </p>
          <p className="text-xs text-green-700 mt-1">
            {selectedSuggestion.message}
          </p>
        </div>
        <AccessoryForm
          gardenId={garden.id}
          initialAccessory={prefillData as GardenAccessory}
          onSubmit={handleAddAccessory}
          onCancel={() => {
            setShowForm(false);
            setSelectedSuggestion(null);
          }}
          suggestedFor={plantName}
        />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Package size={20} className="text-purple-600" />
        <h3 className="text-lg font-bold text-gray-800">Accessori Consigliati</h3>
        <Info size={16} className="text-gray-500" />
      </div>
      
      <p className="text-sm text-gray-700 mb-4">
        Per coltivare al meglio <strong>{plantName}</strong>, considera questi accessori:
      </p>

      <div className="space-y-3">
        {suggestions.map((suggestion, index) => {
          const alreadyPresent = isAccessoryAlreadyPresent(suggestion);
          const suggestedAcc = suggestion.suggestedAccessory;
          
          return (
            <div
              key={index}
              className={`bg-white rounded-lg border-2 p-4 ${
                alreadyPresent ? 'border-green-300 bg-green-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl">
                    {suggestedAcc ? getAccessoryIcon(suggestedAcc.category, suggestedAcc.type) : '📦'}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-800">{suggestion.message}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(suggestion.priority)}`}>
                        {suggestion.priority === 'High' ? 'Importante' : suggestion.priority === 'Medium' ? 'Consigliato' : 'Opzionale'}
                      </span>
                      {alreadyPresent && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-300 flex items-center gap-1">
                          <CheckCircle size={12} />
                          Già presente
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {suggestion.instructions.slice(0, 2).map((instruction, idx) => (
                        <p key={idx} className="flex items-start gap-2">
                          <span className="text-purple-500 mt-0.5">•</span>
                          <span>{instruction}</span>
                        </p>
                      ))}
                      {suggestedAcc && suggestedAcc.heightCm && (
                        <p className="text-xs text-gray-500 mt-2">
                          Altezza consigliata: {suggestedAcc.heightCm}cm
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {!alreadyPresent && (
                <button
                  onClick={() => {
                    setSelectedSuggestion(suggestion);
                    setShowForm(true);
                  }}
                  className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  <Plus size={16} />
                  Aggiungi Accessorio
                </button>
              )}
            </div>
          );
        })}
      </div>

      {existingAccessories.length > 0 && (
        <div className="mt-4 pt-4 border-t border-purple-200">
          <p className="text-xs text-gray-600 mb-2">
            Accessori già presenti per questa pianta:
          </p>
          <div className="flex flex-wrap gap-2">
            {existingAccessories.map(acc => (
              <span
                key={acc.id}
                className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-700"
              >
                {acc.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

