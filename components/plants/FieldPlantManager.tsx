/**
 * Field Plant Manager
 * Componente principale per gestire piante individuali nei filari
 */

import React, { useState, useEffect } from 'react';
import { Garden } from '../../types';
import { GardenPlant, FieldConfiguration, FieldWizardConfig } from '../../types/individualPlant';
import { useStorage } from '../../packages/core/hooks/useStorage';
import { 
  plantCalculations, 
  calculateFieldConfiguration, 
  validateFieldConfiguration,
  analyzeFieldPerformance 
} from '../../services/individualPlantService';
import { 
  TreePine, 
  Plus, 
  Grid3X3, 
  Calculator, 
  Eye, 
  Settings, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Droplets,
  Scissors,
  Zap
} from 'lucide-react';

interface FieldPlantManagerProps {
  garden: Garden;
  onPlantSelect?: (plant: GardenPlant) => void;
}

const FieldPlantManager: React.FC<FieldPlantManagerProps> = ({ 
  garden, 
  onPlantSelect 
}) => {
  const { storageProvider } = useStorage();
  
  // State
  const [plants, setPlants] = useState<GardenPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list' | 'stats'>('grid');
  const [showWizard, setShowWizard] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string>('');
  
  // Wizard state
  const [wizardConfig, setWizardConfig] = useState<FieldWizardConfig>({
    rowCount: 10,
    rowLengthMeters: 40,
    plantSpacingCm: 40,
    rowSpacingCm: 150,
    plantName: 'Pomodoro',
    variety: 'San Marzano',
    plantingDate: new Date().toISOString().split('T')[0],
    zoneName: 'Campo Principale',
    orientation: 'N-S'
  });

  useEffect(() => {
    loadPlants();
  }, [garden.id]);

  const loadPlants = async () => {
    try {
      setLoading(true);
      // TODO: Implementare caricamento piante dal storage
      // const loadedPlants = await storageProvider.getGardenPlants?.(garden.id) || [];
      // setPlants(loadedPlants);
      setPlants([]); // Placeholder
    } catch (error) {
      console.error('Error loading plants:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcoli automatici per wizard
  const calculatedConfig = calculateFieldConfiguration(wizardConfig);
  const validationErrors = validateFieldConfiguration(wizardConfig);

  const handleCreateField = async () => {
    if (validationErrors.length > 0) {
      alert('Correggi gli errori prima di procedere:\n' + validationErrors.join('\n'));
      return;
    }

    try {
      // TODO: Implementare creazione campo con storage provider
      console.log('Creating field with config:', calculatedConfig);
      alert(`Campo creato con successo!\n${calculatedConfig.totalPlants} piante in ${calculatedConfig.rowCount} filari`);
      setShowWizard(false);
      await loadPlants();
    } catch (error) {
      console.error('Error creating field:', error);
      alert('Errore nella creazione del campo');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento piante...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <TreePine className="text-green-600" size={28} />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestione Piante Individuali</h2>
            <p className="text-gray-600">
              {plants.length > 0 
                ? `${plants.length} piante tracciate individualmente`
                : 'Nessuna pianta tracciata'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => setView('stats')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'stats'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 size={16} />
            </button>
          </div>
          
          <button
            onClick={() => setShowWizard(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Crea Campo
          </button>
        </div>
      </div>

      {/* Empty State */}
      {plants.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <TreePine className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nessuna pianta tracciata individualmente
          </h3>
          <p className="text-gray-600 mb-6">
            Crea il tuo primo campo con tracking pianta-per-pianta per monitorare ogni singola pianta
          </p>
          <button
            onClick={() => setShowWizard(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <Calculator size={20} />
            Configura Campo Automatico
          </button>
        </div>
      )}

      {/* Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calculator className="text-green-600" size={24} />
                <h3 className="text-xl font-bold text-gray-900">
                  Configuratore Campo Automatico
                </h3>
              </div>
              <button
                onClick={() => setShowWizard(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Configurazione */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-900">Configurazione</h4>
                  
                  {/* Dimensioni Campo */}
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-700">Dimensioni Campo</h5>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Numero Filari
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={wizardConfig.rowCount}
                          onChange={(e) => setWizardConfig({
                            ...wizardConfig,
                            rowCount: parseInt(e.target.value) || 1
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Lunghezza Filare (m)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="200"
                          step="0.5"
                          value={wizardConfig.rowLengthMeters}
                          onChange={(e) => setWizardConfig({
                            ...wizardConfig,
                            rowLengthMeters: parseFloat(e.target.value) || 1
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Distanza Piante (cm)
                        </label>
                        <input
                          type="number"
                          min="10"
                          max="200"
                          value={wizardConfig.plantSpacingCm}
                          onChange={(e) => setWizardConfig({
                            ...wizardConfig,
                            plantSpacingCm: parseInt(e.target.value) || 30
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Distanza Filari (cm)
                        </label>
                        <input
                          type="number"
                          min="30"
                          max="500"
                          value={wizardConfig.rowSpacingCm}
                          onChange={(e) => setWizardConfig({
                            ...wizardConfig,
                            rowSpacingCm: parseInt(e.target.value) || 150
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Coltura */}
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-700">Coltura</h5>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pianta
                        </label>
                        <input
                          type="text"
                          value={wizardConfig.plantName}
                          onChange={(e) => setWizardConfig({
                            ...wizardConfig,
                            plantName: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="es. Pomodoro"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Varietà (opzionale)
                        </label>
                        <input
                          type="text"
                          value={wizardConfig.variety || ''}
                          onChange={(e) => setWizardConfig({
                            ...wizardConfig,
                            variety: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="es. San Marzano"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Data Piantagione
                        </label>
                        <input
                          type="date"
                          value={wizardConfig.plantingDate}
                          onChange={(e) => setWizardConfig({
                            ...wizardConfig,
                            plantingDate: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome Zona
                        </label>
                        <input
                          type="text"
                          value={wizardConfig.zoneName}
                          onChange={(e) => setWizardConfig({
                            ...wizardConfig,
                            zoneName: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="es. Campo Principale"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calcoli Automatici */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-900">Calcoli Automatici</h4>
                  
                  {/* Risultati */}
                  <div className="bg-green-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Piante Totali:</span>
                      <span className="text-lg font-bold text-green-600">
                        {calculatedConfig.totalPlants.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Piante per Filare:</span>
                      <span className="text-lg font-bold text-green-600">
                        {calculatedConfig.plantsPerRow}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Area Totale:</span>
                      <span className="text-lg font-bold text-green-600">
                        {calculatedConfig.totalAreaSqm} m²
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Densità:</span>
                      <span className="text-lg font-bold text-green-600">
                        {calculatedConfig.plantsPerSqMeter} piante/m²
                      </span>
                    </div>
                  </div>

                  {/* Validazione */}
                  {validationErrors.length > 0 && (
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="text-red-600" size={20} />
                        <h5 className="font-medium text-red-900">Errori Configurazione</h5>
                      </div>
                      <ul className="space-y-1">
                        {validationErrors.map((error, idx) => (
                          <li key={idx} className="text-sm text-red-700">• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validationErrors.length === 0 && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="text-green-600" size={20} />
                        <h5 className="font-medium text-green-900">Configurazione Valida</h5>
                      </div>
                      <p className="text-sm text-green-700">
                        La configurazione è corretta e pronta per la creazione del campo.
                      </p>
                    </div>
                  )}

                  {/* Esempio Scenario */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h5 className="font-medium text-blue-900 mb-2">Il Tuo Scenario</h5>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>• {calculatedConfig.rowCount} filari di {calculatedConfig.rowLengthMeters}m ciascuno</p>
                      <p>• {calculatedConfig.plantsPerRow} piante per filare (ogni {wizardConfig.plantSpacingCm}cm)</p>
                      <p>• Filari distanti {wizardConfig.rowSpacingCm}cm l'uno dall'altro</p>
                      <p>• <strong>{calculatedConfig.totalPlants} piante totali</strong> da tracciare individualmente</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowWizard(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleCreateField}
                  disabled={validationErrors.length > 0}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <TreePine size={20} />
                  Crea Campo ({calculatedConfig.totalPlants} piante)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldPlantManager;