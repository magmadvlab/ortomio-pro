/**
 * Plant Photo & Health Modal
 * Modal compatto per foto e aggiornamento stato salute
 */

import React, { useState, useRef } from 'react';
import { GardenPlant } from '../../types/individualPlant';
import { Camera, Upload, X, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useStorage } from '../../packages/core/hooks/useStorage';
import { createOperationContextService } from '../../services/operationContextService';

interface PlantPhotoHealthModalProps {
  plant: GardenPlant;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  gardenCoordinates?: { latitude: number; longitude: number };
}

const PlantPhotoHealthModal: React.FC<PlantPhotoHealthModalProps> = ({
  plant,
  isOpen,
  onClose,
  onSuccess,
  gardenCoordinates
}) => {
  const { storageProvider } = useStorage();
  const contextService = createOperationContextService();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [healthScore, setHealthScore] = useState(plant.healthScore);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos(prev => [...prev, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Get operation context
      const context = gardenCoordinates
        ? await contextService.getOperationContext(
            gardenCoordinates.latitude,
            gardenCoordinates.longitude
          )
        : undefined;

      // Upload photos
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const url = plant.gardenId
          ? await storageProvider.uploadPhoto?.(photo, plant.id, plant.gardenId)
          : undefined;
        if (url) photoUrls.push(url);
      }

      // Create health update operation
      const operation = {
        id: `health-${Date.now()}`,
        plantId: plant.id,
        operationType: 'health' as const,
        date: new Date().toISOString(),
        healthScoreBefore: plant.healthScore,
        healthScoreAfter: healthScore,
        photos: photoUrls,
        notes,
        context,
      };

      await storageProvider.createPlantOperation?.(operation);

      // Update plant health score
      await storageProvider.updateIndividualPlant?.(plant.id, {
        ...plant,
        healthScore,
        photos: [...(plant.photos || []), ...photoUrls],
      });

      alert('✅ Foto e stato salute salvati con successo!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving photo and health:', error);
      alert('❌ Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getHealthIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="text-green-600" />;
    if (score >= 70) return <TrendingUp className="text-yellow-600" />;
    return <AlertTriangle className="text-orange-600" />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">📸 Foto & Salute</h3>
            <p className="text-sm text-blue-100">{plant.plantCode} - {plant.plantName}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto Pianta
            </label>
            <div className="space-y-3">
              {/* Upload Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Camera size={20} />
                  Scatta Foto
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Upload size={20} />
                  Carica
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Photo Previews */}
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Health Score */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stato di Salute
            </label>
            <div className="space-y-3">
              {/* Current vs New */}
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">Attuale</div>
                  <div className={`text-2xl font-bold ${getHealthColor(plant.healthScore)}`}>
                    {plant.healthScore}%
                  </div>
                </div>
                <div className="text-gray-400">→</div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">Nuovo</div>
                  <div className={`text-2xl font-bold ${getHealthColor(healthScore)}`}>
                    {healthScore}%
                  </div>
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={healthScore}
                  onChange={(e) => setHealthScore(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, 
                      ${healthScore >= 90 ? '#10b981' : 
                        healthScore >= 70 ? '#eab308' : 
                        healthScore >= 50 ? '#f97316' : '#ef4444'} 0%, 
                      ${healthScore >= 90 ? '#10b981' : 
                        healthScore >= 70 ? '#eab308' : 
                        healthScore >= 50 ? '#f97316' : '#ef4444'} ${healthScore}%, 
                      #e5e7eb ${healthScore}%, 
                      #e5e7eb 100%)`
                  }}
                />
                <div className="flex items-center justify-center gap-2">
                  {getHealthIcon(healthScore)}
                  <span className={`font-medium ${getHealthColor(healthScore)}`}>
                    {healthScore >= 90 ? 'Eccellente' :
                     healthScore >= 70 ? 'Buona' :
                     healthScore >= 50 ? 'Discreta' : 'Scarsa'}
                  </span>
                </div>
              </div>
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
              placeholder="Descrivi lo stato della pianta, eventuali problemi o osservazioni..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Context Info */}
          {gardenCoordinates && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
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
            disabled={saving || (photos.length === 0 && healthScore === plant.healthScore)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvataggio...' : 'Salva'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlantPhotoHealthModal;
