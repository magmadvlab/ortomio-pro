/**
 * Bulk Operation Modal
 * Modal per operazioni di massa su piante con foto intelligenti
 */

import React, { useState } from 'react';
import { GardenPlant, BulkRowOperation } from '../../types/individualPlant';
import { 
  X, 
  Droplets, 
  Zap, 
  Scissors, 
  Camera, 
  Upload, 
  AlertTriangle,
  CheckCircle,
  Users,
  Target
} from 'lucide-react';

interface BulkOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  operationType: 'watering' | 'fertilizing' | 'treatment' | 'health';
  selectedPlants: GardenPlant[];
  onSubmit: (operation: BulkRowOperation, photos?: File[]) => Promise<void>;
}

const BulkOperationModal: React.FC<BulkOperationModalProps> = ({
  isOpen,
  onClose,
  operationType,
  selectedPlants,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    quantityPerPlant: '',
    unit: '',
    productName: '',
    notes: '',
    requirePhotos: false,
    photoStrategy: 'sample' as 'none' | 'sample' | 'problems' | 'all'
  });
  
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const getOperationInfo = () => {
    switch (operationType) {
      case 'watering':
        return {
          title: 'Irrigazione di Massa',
          icon: Droplets,
          color: 'blue',
          defaultUnit: 'L',
          defaultQuantity: '3',
          placeholder: 'Litri per pianta'
        };
      case 'fertilizing':
        return {
          title: 'Fertilizzazione di Massa',
          icon: Zap,
          color: 'green',
          defaultUnit: 'g',
          defaultQuantity: '25',
          placeholder: 'Grammi per pianta'
        };
      case 'treatment':
        return {
          title: 'Trattamento di Massa',
          icon: Scissors,
          color: 'orange',
          defaultUnit: 'ml',
          defaultQuantity: '10',
          placeholder: 'Millilitri per pianta'
        };
      case 'health':
        return {
          title: 'Aggiornamento Salute',
          icon: Camera,
          color: 'purple',
          defaultUnit: '',
          defaultQuantity: '',
          placeholder: 'Note sulla salute'
        };
    }
  };

  const operationInfo = getOperationInfo();
  const Icon = operationInfo.icon;

  // Calcola statistiche piante selezionate
  const healthyPlants = selectedPlants.filter(p => p.status === 'healthy').length;
  const problemPlants = selectedPlants.filter(p => p.status === 'diseased' || p.healthScore < 70).length;
  const avgHealth = selectedPlants.reduce((sum, p) => sum + p.healthScore, 0) / selectedPlants.length;

  const getPhotoStrategy = () => {
    switch (formData.photoStrategy) {
      case 'none':
        return {
          label: 'Nessuna Foto',
          description: 'Non scattare foto',
          recommended: selectedPlants.length > 100
        };
      case 'sample':
        return {
          label: 'Foto Campione',
          description: `5-10 piante rappresentative (${Math.min(10, Math.ceil(selectedPlants.length / 20))} foto)`,
          recommended: selectedPlants.length > 20 && selectedPlants.length <= 500
        };
      case 'problems':
        return {
          label: 'Solo Problemi',
          description: `Foto solo per piante malate (${problemPlants} foto)`,
          recommended: problemPlants > 0 && problemPlants < 50
        };
      case 'all':
        return {
          label: 'Tutte le Piante',
          description: `Foto per ogni pianta (${selectedPlants.length} foto)`,
          recommended: selectedPlants.length <= 20
        };
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setPhotos(prev => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const operation: BulkRowOperation = {
        operationType: operationType as any,
        operationDate: new Date().toISOString().split('T')[0],
        quantityPerPlant: parseFloat(formData.quantityPerPlant) || undefined,
        unit: formData.unit || undefined,
        productName: formData.productName || undefined,
        plantIds: selectedPlants.map(p => p.id),
        notes: formData.notes
      };

      await onSubmit(operation, photos);
      onClose();
    } catch (error) {
      console.error('Error submitting bulk operation:', error);
      alert('Errore nell\'operazione');
    } finally {
      setLoading(false);
    }
  };

  const photoStrategyInfo = getPhotoStrategy();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className={`text-${operationInfo.color}-600`} size={24} />
            <h3 className="text-xl font-bold text-gray-900">
              {operationInfo.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Statistiche Selezione */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Piante Selezionate</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{selectedPlants.length}</p>
                <p className="text-sm text-gray-600">Totali</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{healthyPlants}</p>
                <p className="text-sm text-gray-600">Sane</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{problemPlants}</p>
                <p className="text-sm text-gray-600">Problemi</p>
              </div>
            </div>
            <div className="mt-3 text-center">
              <p className="text-sm text-gray-600">
                Salute media: <span className="font-semibold">{Math.round(avgHealth)}%</span>
              </p>
            </div>
          </div>

          {/* Form Fields */}
          {operationType !== 'health' && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {operationInfo.placeholder}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.quantityPerPlant}
                  onChange={(e) => setFormData({
                    ...formData,
                    quantityPerPlant: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder={operationInfo.defaultQuantity}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unità
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({
                    ...formData,
                    unit: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">{operationInfo.defaultUnit}</option>
                  {operationType === 'watering' && (
                    <>
                      <option value="L">Litri</option>
                      <option value="ml">Millilitri</option>
                    </>
                  )}
                  {operationType === 'fertilizing' && (
                    <>
                      <option value="g">Grammi</option>
                      <option value="kg">Chilogrammi</option>
                    </>
                  )}
                  {operationType === 'treatment' && (
                    <>
                      <option value="ml">Millilitri</option>
                      <option value="L">Litri</option>
                      <option value="g">Grammi</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          )}

          {/* Product Name */}
          {(operationType === 'fertilizing' || operationType === 'treatment') && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {operationType === 'fertilizing' ? 'Nome Fertilizzante' : 'Nome Prodotto'}
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => setFormData({
                  ...formData,
                  productName: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder={operationType === 'fertilizing' ? 'es. NPK 10-10-10' : 'es. Fungicida Rame'}
              />
            </div>
          )}

          {/* Photo Strategy */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Strategia Foto</h4>
            <div className="grid grid-cols-2 gap-3">
              {(['none', 'sample', 'problems', 'all'] as const).map((strategy) => {
                const strategyInfo = getPhotoStrategy();
                const isRecommended = strategy === 'sample' && selectedPlants.length > 20 && selectedPlants.length <= 500;
                
                return (
                  <button
                    key={strategy}
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      photoStrategy: strategy
                    })}
                    className={`p-3 border-2 rounded-lg text-left transition-all ${
                      formData.photoStrategy === strategy
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${isRecommended ? 'ring-2 ring-green-200' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">
                        {strategy === 'none' && 'Nessuna'}
                        {strategy === 'sample' && 'Campione'}
                        {strategy === 'problems' && 'Problemi'}
                        {strategy === 'all' && 'Tutte'}
                      </span>
                      {isRecommended && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Consigliata
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      {strategy === 'none' && 'Nessuna foto'}
                      {strategy === 'sample' && `${Math.min(10, Math.ceil(selectedPlants.length / 20))} foto rappresentative`}
                      {strategy === 'problems' && `${problemPlants} foto (solo problemi)`}
                      {strategy === 'all' && `${selectedPlants.length} foto (tutte)`}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photo Upload */}
          {formData.photoStrategy !== 'none' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Carica Foto {formData.photoStrategy === 'sample' && '(Rappresentative)'}
              </label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-gray-600">
                    Clicca per caricare foto o trascina qui
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG fino a 10MB ciascuna
                  </p>
                </label>
              </div>

              {/* Photo Preview */}
              {photos.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Foto caricate ({photos.length})
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({
                ...formData,
                notes: e.target.value
              })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Note sull'operazione..."
            />
          </div>

          {/* Summary */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">Riepilogo Operazione</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• <strong>{selectedPlants.length} piante</strong> coinvolte</p>
              {operationType !== 'health' && (
                <p>• <strong>{formData.quantityPerPlant} {formData.unit}</strong> per pianta</p>
              )}
              {formData.productName && (
                <p>• Prodotto: <strong>{formData.productName}</strong></p>
              )}
              <p>• Foto: <strong>{photoStrategyInfo.label}</strong></p>
              {operationType !== 'health' && formData.quantityPerPlant && (
                <p>• Totale: <strong>
                  {(parseFloat(formData.quantityPerPlant) * selectedPlants.length).toFixed(1)} {formData.unit}
                </strong></p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2 bg-${operationInfo.color}-600 text-white rounded-lg hover:bg-${operationInfo.color}-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Icon size={20} />
                  Applica a {selectedPlants.length} piante
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkOperationModal;