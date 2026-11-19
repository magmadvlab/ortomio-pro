/**
 * Plant Photo & Health Modal
 * Modal compatto per foto e aggiornamento stato salute
 */

import React, { useState } from 'react';
import { GardenPlant } from '../../types/individualPlant';
import PlantObservationJournal from './PlantObservationJournal';
import { X, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { getSupabaseClient } from '@/config/supabase';


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
  onSuccess
}) => {

  const [healthScore, setHealthScore] = useState(plant.healthScore);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setSaving(true);

      const db = getSupabaseClient()
      if (!db) throw new Error('Archivio non disponibile.')
      const {error} = await db.rpc('record_plant_health_observation', {p_plant:plant.id,p_score:healthScore,p_notes:notes})
      if (error) throw error
      alert('✅ Stato salute salvato con successo!');
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
          <PlantObservationJournal key={plant.id} plant={plant} />
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
            disabled={saving || (healthScore === plant.healthScore && !notes.trim())}
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
