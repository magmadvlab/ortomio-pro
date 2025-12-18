'use client'

import React, { useState } from 'react';
import { useStorage } from '@/packages/core/hooks/useStorage';
import { createCustomCrop } from '@/services/customCropService';
import { Plus, X, Info } from 'lucide-react';

interface CustomCropFormProps {
  gardenId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const CustomCropForm: React.FC<CustomCropFormProps> = ({
  gardenId,
  onSuccess,
  onCancel
}) => {
  const { storageProvider } = useStorage();
  const [formData, setFormData] = useState({
    commonName: '',
    scientificName: '',
    family: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.commonName.trim()) {
      setError('Il nome della coltura è obbligatorio');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await createCustomCrop(
        storageProvider,
        formData.commonName.trim(),
        formData.scientificName.trim() || undefined,
        formData.family.trim() || undefined,
        gardenId,
        formData.notes.trim() ? { notes: formData.notes.trim() } : undefined
      );
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Errore nel salvataggio della coltura');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Plus className="text-green-600" size={24} />
          <h3 className="text-xl font-bold text-gray-800">
            Aggiungi Coltura Personalizzata
          </h3>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-2">
          <Info className="text-blue-600 mt-0.5" size={16} />
          <p className="text-sm text-blue-700">
            Il sistema imparerà dai tuoi lavori e ti suggerirà quando fare le operazioni.
            Più utilizzi questa coltura, più precisi saranno i suggerimenti.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome Coltura <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.commonName}
            onChange={(e) => setFormData({ ...formData, commonName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="Es. Fagiolo Rampicante Personalizzato"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome Scientifico (opzionale)
          </label>
          <input
            type="text"
            value={formData.scientificName}
            onChange={(e) => setFormData({ ...formData, scientificName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="Es. Phaseolus vulgaris"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Famiglia Botanica (opzionale)
          </label>
          <input
            type="text"
            value={formData.family}
            onChange={(e) => setFormData({ ...formData, family: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="Es. Fabaceae"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note Iniziali (opzionale)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="Aggiungi note sulla coltura..."
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Salvataggio...' : 'Aggiungi Coltura'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Annulla
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomCropForm;

