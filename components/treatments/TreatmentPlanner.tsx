'use client';

import React, { useState } from 'react';
import { ArrowLeft, Calendar, Droplets, Leaf, Shield } from 'lucide-react';
import { getSupabaseClient } from '../../config/supabase';

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

interface TreatmentPlannerProps {
  onSave: (treatment: Treatment) => void;
  onClose: () => void;
}

export const TreatmentPlanner: React.FC<TreatmentPlannerProps> = ({
  onSave,
  onClose
}) => {
  const supabase = getSupabaseClient();
  const [plantName, setPlantName] = useState('');
  const [productName, setProductName] = useState('');
  const [productType, setProductType] = useState<Treatment['product_type']>('fertilizer');
  const [applicationDate, setApplicationDate] = useState(new Date().toISOString().split('T')[0]);
  const [dosage, setDosage] = useState('');
  const [method, setMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!plantName.trim() || !productName.trim() || !dosage.trim() || !method.trim()) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    setLoading(true);
    
    try {
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      const treatmentData = {
        plant_name: plantName.trim(),
        product_name: productName.trim(),
        product_type: productType,
        application_date: applicationDate,
        dosage: dosage.trim(),
        method: method.trim(),
        notes: notes.trim() || undefined,
        garden_id: 'default', // In a real app, this would be the actual garden ID
        completed: false
      };

      const { data, error } = await supabase
        .from('treatments')
        .insert([treatmentData])
        .select()
        .single();

      if (error) throw error;

      onSave(data);
    } catch (error) {
      console.error('Error saving treatment:', error);
      alert('Errore nel salvare il trattamento');
    } finally {
      setLoading(false);
    }
  };

  const commonPlants = [
    'Pomodoro', 'Zucchina', 'Melanzana', 'Peperone', 'Cetriolo',
    'Lattuga', 'Spinaci', 'Rucola', 'Basilico', 'Prezzemolo',
    'Rosa', 'Geranio', 'Lavanda', 'Rosmarino', 'Salvia'
  ];

  const commonProducts = {
    fertilizer: ['Concime NPK', 'Humus di lombrico', 'Compost', 'Fertilizzante liquido', 'Concime organico'],
    pesticide: ['Olio di neem', 'Sapone molle', 'Piretro', 'Bacillus thuringiensis'],
    fungicide: ['Rame', 'Zolfo', 'Bicarbonato di potassio', 'Propoli'],
    herbicide: ['Aceto bianco', 'Acqua bollente', 'Pacciamatura'],
    other: ['Stimolante radicale', 'Corroborante', 'Induttore di resistenza']
  };

  const applicationMethods = [
    'Irrigazione', 'Nebulizzazione fogliare', 'Spargimento al suolo', 
    'Iniezione nel terreno', 'Pennellatura', 'Immersione radici'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pianifica Trattamento</h2>
          <p className="text-gray-600">Programma un nuovo trattamento per le tue piante</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Plant Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pianta da Trattare *
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

        {/* Product Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo di Prodotto *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { value: 'fertilizer', label: 'Fertilizzante', icon: <Leaf size={20} />, color: 'green' },
              { value: 'pesticide', label: 'Pesticida', icon: <Shield size={20} />, color: 'red' },
              { value: 'fungicide', label: 'Fungicida', icon: <Droplets size={20} />, color: 'blue' },
              { value: 'herbicide', label: 'Erbicida', icon: <Shield size={20} />, color: 'orange' },
              { value: 'other', label: 'Altro', icon: <Calendar size={20} />, color: 'gray' }
            ].map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => setProductType(type.value as Treatment['product_type'])}
                className={`p-3 border-2 rounded-lg text-center transition-all ${
                  productType === type.value
                    ? `border-${type.color}-500 bg-${type.color}-50 text-${type.color}-700`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  {type.icon}
                  <span className="text-sm font-medium">{type.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome Prodotto *
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            list="products"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Nome del prodotto"
            required
          />
          <datalist id="products">
            {commonProducts[productType].map(product => (
              <option key={product} value={product} />
            ))}
          </datalist>
        </div>

        {/* Application Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Applicazione *
            </label>
            <input
              type="date"
              value={applicationDate}
              onChange={(e) => setApplicationDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dosaggio *
            </label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="es. 10ml/L, 50g/m²"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metodo Applicazione *
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="">Seleziona metodo</option>
              {applicationMethods.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note Aggiuntive
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Note, precauzioni, condizioni meteo, ecc."
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
            {loading ? 'Salvando...' : 'Salva Trattamento'}
          </button>
        </div>
      </form>
    </div>
  );
};
