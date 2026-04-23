/**
 * Plant Harvest Modal
 * Modal compatto per registrare raccolto
 */

import React, { useState } from 'react';
import { GardenPlant } from '../../types/individualPlant';
import { X, Scale, Star, Calendar } from 'lucide-react';
import { useStorage } from '../../packages/core/hooks/useStorage';
import { createOperationContextService } from '../../services/operationContextService';

interface PlantHarvestModalProps {
  plant: GardenPlant;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  gardenCoordinates?: { latitude: number; longitude: number };
}

const PlantHarvestModal: React.FC<PlantHarvestModalProps> = ({
  plant,
  isOpen,
  onClose,
  onSuccess,
  gardenCoordinates
}) => {
  const { storageProvider } = useStorage();
  const contextService = createOperationContextService();
  
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [quality, setQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!quantity || Number(quantity) <= 0) {
      alert('Inserisci una quantità valida');
      return;
    }

    try {
      setSaving(true);

      // Get operation context
      const context = gardenCoordinates
        ? await contextService.getOperationContext(
            gardenCoordinates.latitude,
            gardenCoordinates.longitude
          )
        : undefined;

      // Create harvest operation
      const operation = {
        id: `harvest-${Date.now()}`,
        plantId: plant.id,
        operationType: 'harvest' as const,
        date: new Date().toISOString(),
        quantity: Number(quantity),
        unit,
        quality,
        notes,
        context,
      };

      await storageProvider.createPlantOperation?.(operation);

      // Update plant status to harvested if fully harvested
      if (notes.toLowerCase().includes('completo') || notes.toLowerCase().includes('finale')) {
        await storageProvider.updateIndividualPlant?.(plant.id, {
          ...plant,
          status: 'harvested',
        });
      }

      alert(`✅ Raccolto registrato: ${quantity}${unit} di ${plant.plantName}!`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving harvest:', error);
      alert('❌ Errore nel salvataggio del raccolto');
    } finally {
      setSaving(false);
    }
  };

  const qualityOptions = [
    { value: 'excellent', label: 'Eccellente', emoji: '⭐⭐⭐', color: 'bg-green-100 text-green-700 border-green-300' },
    { value: 'good', label: 'Buona', emoji: '⭐⭐', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { value: 'fair', label: 'Discreta', emoji: '⭐', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    { value: 'poor', label: 'Scarsa', emoji: '❌', color: 'bg-red-100 text-red-700 border-red-300' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">🌾 Registra Raccolto</h3>
            <p className="text-sm text-green-100">{plant.plantCode} - {plant.plantName}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Scale size={16} className="inline mr-2" />
              Quantità Raccolta
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.0"
                step="0.1"
                min="0"
                className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="pz">pezzi</option>
                <option value="l">litri</option>
                <option value="mazzi">mazzi</option>
              </select>
            </div>
          </div>

          {/* Quality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Star size={16} className="inline mr-2" />
              Qualità
            </label>
            <div className="grid grid-cols-2 gap-2">
              {qualityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setQuality(option.value as any)}
                  className={`p-3 border-2 rounded-lg transition-all ${
                    quality === option.value
                      ? option.color + ' border-current'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-lg mb-1">{option.emoji}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Calendar size={16} />
              <span className="font-medium">Data raccolto:</span>
              <span>{new Date().toLocaleDateString('it-IT', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note (opzionale)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Es: Raccolto completo, frutti maturi, ottimo sapore..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Scrivi "completo" o "finale" per segnare la pianta come raccolta
            </p>
          </div>

          {/* Context Info */}
          {gardenCoordinates && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-700">
              <div className="font-medium mb-1">📊 Contesto Automatico</div>
              <div>Verranno registrati: data/ora, meteo, temperatura, fase lunare</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !quantity || Number(quantity) <= 0}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvataggio...' : '🌾 Registra Raccolto'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlantHarvestModal;
