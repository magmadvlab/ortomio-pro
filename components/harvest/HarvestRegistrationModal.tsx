'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Weight, Star } from 'lucide-react';

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

interface HarvestRegistrationModalProps {
  harvest?: Harvest | null;
  onSave: (harvest: Omit<Harvest, 'id' | 'created_at'>) => void;
  onClose: () => void;
}

export const HarvestRegistrationModal: React.FC<HarvestRegistrationModalProps> = ({
  harvest,
  onSave,
  onClose
}) => {
  const [plantName, setPlantName] = useState('');
  const [variety, setVariety] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [harvestDate, setHarvestDate] = useState('');
  const [qualityRating, setQualityRating] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (harvest) {
      setPlantName(harvest.plant_name);
      setVariety(harvest.variety || '');
      setQuantity(harvest.quantity.toString());
      setUnit(harvest.unit);
      setHarvestDate(harvest.harvest_date);
      setQualityRating(harvest.quality_rating || null);
      setNotes(harvest.notes || '');
    } else {
      // Set default date to today
      setHarvestDate(new Date().toISOString().split('T')[0]);
    }
  }, [harvest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!plantName.trim() || !quantity || !harvestDate) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    setLoading(true);
    
    try {
      const harvestData = {
        plant_name: plantName.trim(),
        variety: variety.trim() || undefined,
        quantity: parseFloat(quantity),
        unit,
        harvest_date: harvestDate,
        quality_rating: qualityRating,
        notes: notes.trim() || undefined,
        garden_id: 'default', // In a real app, this would be the actual garden ID
        zone_id: undefined,
        field_id: undefined
      };

      await onSave(harvestData);
    } catch (error) {
      console.error('Error saving harvest:', error);
    } finally {
      setLoading(false);
    }
  };

  const commonPlants = [
    'Pomodoro', 'Zucchina', 'Melanzana', 'Peperone', 'Cetriolo',
    'Lattuga', 'Spinaci', 'Rucola', 'Basilico', 'Prezzemolo',
    'Carota', 'Ravanello', 'Cipolla', 'Aglio', 'Patata',
    'Fagiolo', 'Pisello', 'Fava', 'Fragola', 'Mela'
  ];

  const units = ['kg', 'g', 'pz', 'mazzi', 'cassette'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {harvest ? 'Modifica Raccolto' : 'Nuovo Raccolto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Plant Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pianta *
            </label>
            <input
              type="text"
              value={plantName}
              onChange={(e) => setPlantName(e.target.value)}
              list="plants"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Nome della pianta"
              required
            />
            <datalist id="plants">
              {commonPlants.map(plant => (
                <option key={plant} value={plant} />
              ))}
            </datalist>
          </div>

          {/* Variety */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Varietà
            </label>
            <input
              type="text"
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Varietà (opzionale)"
            />
          </div>

          {/* Quantity and Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantità *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0.0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unità *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {units.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Harvest Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Raccolto *
            </label>
            <input
              type="date"
              value={harvestDate}
              onChange={(e) => setHarvestDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Quality Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qualità
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setQualityRating(qualityRating === rating ? null : rating)}
                  className={`p-1 rounded ${
                    qualityRating && qualityRating >= rating
                      ? 'text-yellow-500'
                      : 'text-gray-300 hover:text-yellow-400'
                  }`}
                >
                  <Star size={24} fill={qualityRating && qualityRating >= rating ? 'currentColor' : 'none'} />
                </button>
              ))}
              {qualityRating && (
                <span className="text-sm text-gray-600 ml-2">
                  {qualityRating}/5
                </span>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Note aggiuntive (opzionale)"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Salvando...' : harvest ? 'Aggiorna' : 'Salva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};