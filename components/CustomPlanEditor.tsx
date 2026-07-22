/**
 * Custom Plan Editor Component
 * Allows expert farmers to create and edit custom plans
 */

import React, { useState, useEffect } from 'react';
import { CustomPlan } from '../types/customPlan';
import { PlantMasterSheet } from '../types';
import { getAllMasterSheets } from '../services/plantMasterService';
import { useStorage } from '../packages/core/hooks/useStorage';
import { useTier } from '../packages/core/hooks/useTier';
import { useAuth } from '../packages/core/hooks/useAuth';
import { X, Save, Edit2, Plus } from 'lucide-react';

interface CustomPlanEditorProps {
  baseMasterSheet?: PlantMasterSheet;
  existingPlan?: CustomPlan;
  onSave: (plan: CustomPlan) => void;
  onCancel: () => void;
}

const CustomPlanEditor: React.FC<CustomPlanEditorProps> = ({
  baseMasterSheet,
  existingPlan,
  onSave,
  onCancel
}) => {
  const { storageProvider } = useStorage();
  const { isPro } = useTier();
  const { user } = useAuth();
  const [masterSheets, setMasterSheets] = useState<PlantMasterSheet[]>([]);
  const [selectedBaseId, setSelectedBaseId] = useState<string>(baseMasterSheet?.id || existingPlan?.baseMasterSheetId || '');
  const [name, setName] = useState<string>(existingPlan?.name || '');
  const [description, setDescription] = useState<string>(existingPlan?.description || '');

  useEffect(() => {
    const loadMasterSheets = () => {
      const sheets = getAllMasterSheets();
      setMasterSheets(sheets);
    };
    loadMasterSheets();
  }, []);

  if (!isPro) {
    return (
      <div className="bg-white p-6 rounded-xl border-2 border-purple-200">
        <p className="text-gray-600">I piani personalizzati sono disponibili solo per utenti Pro.</p>
      </div>
    );
  }

  const handleSave = async () => {
    if (!selectedBaseId || !name.trim()) {
      alert('Inserisci nome e seleziona un master sheet base');
      return;
    }

    if (!user) {
      alert('Devi essere autenticato per salvare un piano personalizzato');
      return;
    }
    const userId = user.id;

    // Get the selected master sheet to include all PlantMasterSheet properties
    const selectedBase = masterSheets.find(s => s.id === selectedBaseId) || baseMasterSheet;
    if (!selectedBase) {
      alert('Master sheet non trovato');
      return;
    }

    const plan: Omit<CustomPlan, 'id' | 'createdAt' | 'updatedAt'> = {
      // Include all PlantMasterSheet properties from the base
      ...selectedBase,
      // Override with existing plan properties if editing
      ...(existingPlan || {}),
      // Override with form values
      baseMasterSheetId: selectedBaseId,
      userId,
      name: name.trim(),
      description: description.trim() || undefined,
      overrides: existingPlan?.overrides || {},
      customNotes: existingPlan?.customNotes || [],
      customMethods: existingPlan?.customMethods || [],
      isPublic: false,
    };

    try {
      const saved = existingPlan
        ? await storageProvider.updateCustomPlan(existingPlan.id, plan)
        : await storageProvider.createCustomPlan(plan);
      onSave(saved);
    } catch (error) {
      console.error('Error saving custom plan:', error);
      alert('Errore nel salvataggio del piano personalizzato');
    }
  };

  const selectedBase = masterSheets.find(s => s.id === selectedBaseId);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg md:text-xl font-bold text-gray-800">
          {existingPlan ? 'Modifica Piano Personalizzato' : 'Nuovo Piano Personalizzato'}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Master Sheet Base *
          </label>
          <select
            value={selectedBaseId}
            onChange={(e) => setSelectedBaseId(e.target.value)}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={!!existingPlan}
          >
            <option value="">Seleziona un master sheet...</option>
            {masterSheets.map(sheet => (
              <option key={sheet.id} value={sheet.id}>
                {sheet.commonName}
              </option>
            ))}
          </select>
          {selectedBase && (
            <p className="mt-1 text-xs text-gray-500">
              Base: {selectedBase.commonName} ({selectedBase.scientificName})
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome Piano *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="es. Metodo Basilicata - Fragole Precoci"
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrizione
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrizione del piano personalizzato..."
            rows={3}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-3"
          >
            <Save size={18} />
            Salva
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Annulla
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          * Nota: La modifica di parametri specifici (germinazione, trapianto, etc.) sarà disponibile in una versione futura.
        </p>
      </div>
    </div>
  );
};

export default CustomPlanEditor;








