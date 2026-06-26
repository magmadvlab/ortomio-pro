/**
 * Smart Plant Manager
 * Sistema scalabile per gestione piante individuali e di gruppo
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Garden } from '../../types';
import { GardenPlant, BulkRowOperation } from '../../types/individualPlant';
import { useStorage } from '../../packages/core/hooks/useStorage';
import BulkOperationModal from './BulkOperationModal';
import PlantHealthHeatmap from './PlantHealthHeatmap';
import PlantDetailModal from './PlantDetailModal';
import { createBulkOperation } from '../../services/plantOperationsService';
import { createUnifiedOperationsService, UnifiedOperationRequest } from '../../services/unifiedOperationsService';
import { createPlantRowSyncService } from '../../services/plantRowSyncService';
import { 
  TreePine, 
  Camera, 
  AlertTriangle, 
  CheckCircle, 
  Droplets, 
  Zap, 
  Scissors,
  Eye,
  Grid3X3,
  Users,
  Target,
  TrendingUp,
  Filter,
  Search,
  Link,
  Unlink,
  Layers,
  BarChart3
} from 'lucide-react';

interface SmartPlantManagerProps {
  garden: Garden;
  fieldRow?: string; // Optional field row ID for filtering
}

type SelectionMode = 'single' | 'group' | 'row' | 'problems' | 'healthy';
type ViewMode = 'grid' | 'heatmap' | 'list';

interface PlantSelection {
  mode: SelectionMode;
  plantIds: string[];
  rowId?: string;
  fieldRowId?: string;
  criteria?: {
    healthScoreMin?: number;
    healthScoreMax?: number;
    status?: string[];
    positionRange?: { from: number; to: number };
  };
}

const SmartPlantManager: React.FC<SmartPlantManagerProps> = ({ garden, fieldRow }) => {
  const { storageProvider } = useStorage();
  
  // Services — memoized to prevent recreation on every render
  const unifiedOperationsService = useMemo(
    () => createUnifiedOperationsService(storageProvider),
    [storageProvider]
  );
  const plantRowSyncService = useMemo(
    () => createPlantRowSyncService(storageProvider),
    [storageProvider]
  );
  
  // State
  const [plants, setPlants] = useState<GardenPlant[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<GardenPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>(fieldRow ? 'list' : 'grid');
  const [selection, setSelection] = useState<PlantSelection>({
    mode: 'single',
    plantIds: []
  });
  
  // Row integration state
  const [availableRows, setAvailableRows] = useState<Array<{ id: string; name: string; type: 'garden_row' | 'field_row' }>>([]);
  const [plantRowMappings, setPlantRowMappings] = useState<any[]>([]);
  const [showRowAssignment, setShowRowAssignment] = useState(false);
  const [selectedRowForAssignment, setSelectedRowForAssignment] = useState<string>('');
  const [syncStatistics, setSyncStatistics] = useState<any>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [healthFilter, setHealthFilter] = useState<string>('all');
  const [rowFilter, setRowFilter] = useState<string>(fieldRow || 'all'); // Use prop for initial filter
  
  // Set fieldRow filter from prop
  const [fieldRowFilter, setFieldRowFilter] = useState<string | null>(fieldRow || null);
  
  useEffect(() => {
    // Update filter when fieldRow prop changes
    if (fieldRow) {
      setFieldRowFilter(fieldRow);
      setRowFilter(fieldRow);
      setViewMode('list');
    } else {
      setFieldRowFilter(null);
      setRowFilter('all');
    }
  }, [fieldRow]);
  
  // Modal states
  const [showOperationModal, setShowOperationModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showUnifiedOperationModal, setShowUnifiedOperationModal] = useState(false);
  const [showPlantDetailModal, setShowPlantDetailModal] = useState(false);
  const [selectedPlantForDetail, setSelectedPlantForDetail] = useState<GardenPlant | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<'watering' | 'fertilizing' | 'treatment' | 'health'>('watering');

  useEffect(() => {
    if (garden?.id) {
      loadPlants();
      loadRowsAndMappings();
      loadSyncStatistics();
    }
  }, [garden?.id]);

  useEffect(() => {
    applyFilters();
  }, [plants, plantRowMappings, fieldRowFilter, searchTerm, statusFilter, healthFilter, rowFilter]);

  const loadPlants = async () => {
    if (!garden?.id) {
      setPlants([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // 1. Carica piante individuali esistenti dal database (trapiantate dal vivaio)
      let existingPlants: GardenPlant[] = [];
      try {
        existingPlants = await storageProvider.getIndividualPlants?.(garden.id) || [];
      } catch (error) {
        existingPlants = [];
      }
      
      // 2. Se ci sono piante nel database, usale
      if (existingPlants.length > 0) {
        setPlants(existingPlants);
        return;
      }
      
      // 3. Fallback: genera piante demo dai filari (per compatibilità)
      const fieldRows = await storageProvider.getFieldRows?.(garden.id) || [];
      if (fieldRows.length > 0) {
        const { fieldRowPlantIntegrationService } = await import('@/services/fieldRowPlantIntegrationService');
        const generatedPlants = await fieldRowPlantIntegrationService.initializePlantsFromFieldRows(
          garden.id,
          fieldRows
        );
        setPlants(generatedPlants);
      } else {
        setPlants([]);
      }
    } catch (error) {
      console.error('Error loading plants:', error);
      setPlants([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRowsAndMappings = async () => {
    if (!garden?.id) {
      setAvailableRows([]);
      setPlantRowMappings([]);
      return;
    }
    
    try {
      // Load available rows (garden rows + field rows) with proper error handling
      let gardenRows: any[] = [];
      try {
        if (storageProvider.getGardenRows) {
          gardenRows = await storageProvider.getGardenRows(garden.id);
        }
      } catch (gardenRowsError) {
        console.error('Failed to load garden rows:', gardenRowsError)
        gardenRows = [];
      }

      let fieldRows: any[] = [];
      try {
        if (storageProvider.getFieldRows) {
          fieldRows = await storageProvider.getFieldRows(garden.id);
        }
      } catch (fieldRowsError) {
        console.error('Failed to load field rows:', fieldRowsError)
        fieldRows = [];
      }

      const allRows = [
        ...gardenRows.map((r: any) => ({ id: r.id, name: r.name, type: 'garden_row' as const })),
        ...fieldRows.map((r: any) => ({ id: r.id, name: r.name, type: 'field_row' as const }))
      ];

      setAvailableRows(allRows);

      // Load plant-row mappings
      try {
        const mappings = await plantRowSyncService.getPlantRowMappings(garden.id);
        setPlantRowMappings(mappings);
      } catch (mappingsError) {
        console.error('Failed to load plant-row mappings:', mappingsError)
        setPlantRowMappings([]);
      }
    } catch (error: any) {
      console.error('loadRowsAndMappings failed:', error?.message || error);
      // Set empty arrays to prevent UI issues
      setAvailableRows([]);
      setPlantRowMappings([]);
    }
  };

  const loadSyncStatistics = async () => {
    if (!garden?.id) {
      setSyncStatistics(null);
      return;
    }
    
    try {
      const stats = await plantRowSyncService.getSyncStatistics(garden.id);
      setSyncStatistics(stats);
    } catch (error) {
      console.error('Error loading sync statistics:', error);
      setSyncStatistics(null);
    }
  };

  const applyFilters = () => {
    let filtered = [...plants];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(plant => 
        plant.plantCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.plantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.variety?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(plant => plant.status === statusFilter);
    }

    // Health filter
    if (healthFilter !== 'all') {
      switch (healthFilter) {
        case 'excellent':
          filtered = filtered.filter(plant => plant.healthScore >= 90);
          break;
        case 'good':
          filtered = filtered.filter(plant => plant.healthScore >= 70 && plant.healthScore < 90);
          break;
        case 'fair':
          filtered = filtered.filter(plant => plant.healthScore >= 50 && plant.healthScore < 70);
          break;
        case 'poor':
          filtered = filtered.filter(plant => plant.healthScore < 50);
          break;
      }
    }

    const beforeRowFilter = [...filtered];

    // Row filter (IMPROVED - Handle fieldRow parameter from URL)
    if (rowFilter !== 'all') {
      if (rowFilter === 'assigned') {
        filtered = filtered.filter(plant => {
          const mapping = plantRowMappings.find(m => m.plantId === plant.id);
          return mapping && (mapping.gardenRowId || mapping.fieldRowId);
        });
      } else if (rowFilter === 'unassigned') {
        filtered = filtered.filter(plant => {
          const mapping = plantRowMappings.find(m => m.plantId === plant.id);
          return !mapping || (!mapping.gardenRowId && !mapping.fieldRowId);
        });
      } else {
        // Specific row filter - check both fieldRowId property and mappings
        filtered = filtered.filter(plant => {
          // First check direct fieldRowId property (for plants created from transplant)
          if (plant.fieldRowId === rowFilter) {
            return true;
          }
          
          // Then check mappings (for legacy plants)
          const mapping = plantRowMappings.find(m => m.plantId === plant.id);
          return mapping && (mapping.gardenRowId === rowFilter || mapping.fieldRowId === rowFilter);
        });

        // Compatibility fallback:
        // if user entered from a specific row but legacy plants have no mapping,
        // keep showing filtered plants instead of an empty screen.
        if (filtered.length === 0 && fieldRowFilter && rowFilter === fieldRowFilter && beforeRowFilter.length > 0) {
          filtered = beforeRowFilter;
        }
      }
    }

    setFilteredPlants(filtered);
  };

  const getSelectionModeInfo = (mode: SelectionMode) => {
    const modes = {
      single: { 
        label: 'Pianta Singola', 
        icon: Target, 
        color: 'blue',
        description: 'Seleziona una pianta specifica'
      },
      group: { 
        label: 'Gruppo Piante', 
        icon: Users, 
        color: 'green',
        description: 'Seleziona un range di piante (es. F1-P001 → F1-P020)'
      },
      row: { 
        label: 'Filare Completo', 
        icon: Grid3X3, 
        color: 'purple',
        description: 'Tutte le piante del filare'
      },
      problems: { 
        label: 'Solo Problemi', 
        icon: AlertTriangle, 
        color: 'red',
        description: 'Piante malate o con problemi (health < 70)'
      },
      healthy: { 
        label: 'Solo Sane', 
        icon: CheckCircle, 
        color: 'green',
        description: 'Piante in buona salute (health > 80)'
      }
    };
    return modes[mode];
  };

  const getHealthColor = (healthScore: number) => {
    if (healthScore >= 90) return 'bg-green-500';
    if (healthScore >= 70) return 'bg-yellow-500';
    if (healthScore >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="text-green-600" size={16} />;
      case 'diseased': return <AlertTriangle className="text-orange-600" size={16} />;
      case 'dead': return <span className="text-red-600">💀</span>;
      case 'harvested': return <span className="text-blue-600">🌾</span>;
      default: return <span className="text-gray-600">❓</span>;
    }
  };

  const handleSelectionModeChange = (mode: SelectionMode) => {
    setSelection({
      mode,
      plantIds: [],
      criteria: mode === 'problems' ? { healthScoreMax: 70 } :
                mode === 'healthy' ? { healthScoreMin: 80 } : undefined
    });
  };

  const handleBulkOperation = async (operation: BulkRowOperation, photos?: File[]) => {
    try {
      const result = await createBulkOperation(operation, photos);
      
      if (result.success) {
        alert(`✅ Operazione completata!\n${result.operationsCreated} operazioni create su ${result.plantsAffected} piante`);
        
        // Ricarica piante per aggiornare lo stato
        await loadPlants();
        
        // Reset selezione
        setSelection({
          mode: 'single',
          plantIds: []
        });
      } else {
        alert(`❌ Errore nell'operazione:\n${result.errors?.join('\n')}`);
      }
    } catch (error) {
      console.error('Error in bulk operation:', error);
      alert('Errore nell\'operazione');
    }
  };

  const handleUnifiedOperation = async (request: UnifiedOperationRequest) => {
    try {
      const result = await unifiedOperationsService.executeUnifiedOperation(request);
      
      if (result.success) {
        alert(`✅ Operazione unificata completata!\n${result.operationsCreated} operazioni create\n${result.plantsAffected} piante coinvolte\n${result.rowsAffected} filari coinvolti`);
        
        // Ricarica dati
        await Promise.all([
          loadPlants(),
          loadRowsAndMappings(),
          loadSyncStatistics()
        ]);
        
        // Reset selezione
        setSelection({
          mode: 'single',
          plantIds: []
        });
      } else {
        alert(`❌ Errore nell'operazione unificata:\n${result.errors?.join('\n')}`);
      }
    } catch (error) {
      console.error('Error in unified operation:', error);
      alert('Errore nell\'operazione unificata');
    }
  };

  const handleAssignPlantsToRow = async () => {
    if (!selectedRowForAssignment || selection.plantIds.length === 0) {
      alert('Seleziona un filare e almeno una pianta');
      return;
    }

    try {
      const selectedRow = availableRows.find(r => r.id === selectedRowForAssignment);
      if (!selectedRow) {
        alert('Filare non trovato');
        return;
      }

      const result = await plantRowSyncService.assignPlantsToRow(
        selection.plantIds,
        selectedRow.id,
        selectedRow.type
      );

      if (result.success) {
        alert(`✅ ${result.plantsAssigned} piante assegnate al filare ${selectedRow.name}`);
        
        // Ricarica mappings
        await loadRowsAndMappings();
        
        // Reset
        setShowRowAssignment(false);
        setSelectedRowForAssignment('');
        setSelection({ mode: 'single', plantIds: [] });
      } else {
        alert(`❌ Errore nell'assegnazione:\n${result.errors.join('\n')}`);
      }
    } catch (error) {
      console.error('Error assigning plants to row:', error);
      alert('Errore nell\'assegnazione');
    }
  };

  const handleRemovePlantsFromRow = async () => {
    if (selection.plantIds.length === 0) {
      alert('Seleziona almeno una pianta');
      return;
    }

    try {
      const result = await plantRowSyncService.removePlantsFromRow(selection.plantIds);

      if (result.success) {
        alert(`✅ ${result.plantsRemoved} piante rimosse dai filari`);
        
        // Ricarica mappings
        await loadRowsAndMappings();
        
        // Reset
        setSelection({ mode: 'single', plantIds: [] });
      } else {
        alert(`❌ Errore nella rimozione:\n${result.errors.join('\n')}`);
      }
    } catch (error) {
      console.error('Error removing plants from row:', error);
      alert('Errore nella rimozione');
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

  if (!garden) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <TreePine className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nessun orto selezionato
          </h3>
          <p className="text-gray-600">
            Seleziona un orto per gestire le piante individuali
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con statistiche rapide */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <TreePine className="text-green-600" size={28} />
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Smart Plant Manager</h2>
              <p className="text-gray-600">
                {plants.length} piante • {filteredPlants.length} visualizzate
              </p>
            </div>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-3">
            <button
              onClick={() => setViewMode('heatmap')}
              className={`px-3 py-2 min-h-[44px] touch-manipulation rounded-md text-sm font-medium transition-colors ${
                viewMode === 'heatmap'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TrendingUp size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 min-h-[44px] touch-manipulation rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 min-h-[44px] touch-manipulation rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye size={16} />
            </button>
          </div>
        </div>

        {/* Statistiche rapide con integrazione filari */}
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Sane</p>
                <p className="text-lg md:text-xl font-bold text-green-700">
                  {plants.filter(p => p.status === 'healthy').length}
                </p>
              </div>
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Malate</p>
                <p className="text-lg md:text-xl font-bold text-orange-700">
                  {plants.filter(p => p.status === 'diseased').length}
                </p>
              </div>
              <AlertTriangle className="text-orange-600" size={24} />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">In Filari</p>
                <p className="text-lg md:text-xl font-bold text-blue-700">
                  {syncStatistics?.plantsInRows || 0}
                </p>
              </div>
              <Link className="text-blue-600" size={24} />
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Senza Filare</p>
                <p className="text-lg md:text-xl font-bold text-yellow-700">
                  {syncStatistics?.plantsWithoutRows || 0}
                </p>
              </div>
              <Unlink className="text-yellow-600" size={24} />
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Selezionate</p>
                <p className="text-lg md:text-xl font-bold text-purple-700">
                  {selection.plantIds.length}
                </p>
              </div>
              <Target className="text-purple-600" size={24} />
            </div>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-600">Sync Rate</p>
                <p className="text-lg md:text-xl font-bold text-indigo-700">
                  {syncStatistics?.syncSuccessRate?.toFixed(0) || 0}%
                </p>
              </div>
              <BarChart3 className="text-indigo-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filtri e Selezione */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtri e Selezione</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cerca pianta (F1-P001, Pomodoro...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 min-h-[44px] touch-manipulation border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Tutti gli stati</option>
            <option value="healthy">Sane</option>
            <option value="diseased">Malate</option>
            <option value="dead">Morte</option>
            <option value="harvested">Raccolte</option>
          </select>

          {/* Health Filter */}
          <select
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
            className="px-4 py-2 min-h-[44px] touch-manipulation border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Tutte le saluti</option>
            <option value="excellent">Eccellente (90-100%)</option>
            <option value="good">Buona (70-89%)</option>
            <option value="fair">Discreta (50-69%)</option>
            <option value="poor">Scarsa (&lt;50%)</option>
          </select>

          {/* Row Filter (NEW) */}
          <select
            value={rowFilter}
            onChange={(e) => setRowFilter(e.target.value)}
            className="px-4 py-2 min-h-[44px] touch-manipulation border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Tutti i filari</option>
            <option value="assigned">Con filare assegnato</option>
            <option value="unassigned">Senza filare</option>
            {availableRows.map(row => (
              <option key={row.id} value={row.id}>
                {row.name} ({row.type === 'garden_row' ? 'Aiuola' : 'Campo'})
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setHealthFilter('all');
              setRowFilter('all');
            }}
            className="px-4 py-2 min-h-[44px] touch-manipulation border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter size={20} className="inline mr-2" />
            Reset Filtri
          </button>
        </div>

        {/* Selection Mode */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Modalità Selezione</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-5 gap-3">
            {(['single', 'group', 'row', 'problems', 'healthy'] as SelectionMode[]).map((mode) => {
              const modeInfo = getSelectionModeInfo(mode);
              const Icon = modeInfo.icon;
              
              return (
                <button
                  key={mode}
                  onClick={() => handleSelectionModeChange(mode)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selection.mode === mode
                      ? `border-${modeInfo.color}-500 bg-${modeInfo.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon size={20} className={`mx-auto mb-2 ${
                    selection.mode === mode ? `text-${modeInfo.color}-600` : 'text-gray-600'
                  }`} />
                  <p className={`text-xs font-medium ${
                    selection.mode === mode ? `text-${modeInfo.color}-700` : 'text-gray-700'
                  }`}>
                    {modeInfo.label}
                  </p>
                </button>
              );
            })}
          </div>
          
          {selection.mode !== 'single' && (
            <p className="text-sm text-gray-600 mt-2">
              {getSelectionModeInfo(selection.mode).description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {selection.plantIds.length > 0 && (
          <div className="space-y-4">
            {/* Primary Operations */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setSelectedOperation('watering');
                  setShowOperationModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 min-h-[44px] touch-manipulation rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-3"
              >
                <Droplets size={20} />
                Irrigazione ({selection.plantIds.length})
              </button>
              
              <button
                onClick={() => {
                  setSelectedOperation('fertilizing');
                  setShowOperationModal(true);
                }}
                className="bg-green-600 text-white px-4 py-2 min-h-[44px] touch-manipulation rounded-lg hover:bg-green-700 transition-colors flex items-center gap-3"
              >
                <Zap size={20} />
                Fertilizzazione ({selection.plantIds.length})
              </button>
              
              <button
                onClick={() => {
                  setSelectedOperation('treatment');
                  setShowOperationModal(true);
                }}
                className="bg-orange-600 text-white px-4 py-2 min-h-[44px] touch-manipulation rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-3"
              >
                <Scissors size={20} />
                Trattamento ({selection.plantIds.length})
              </button>
              
              <button
                onClick={() => setShowHealthModal(true)}
                className="bg-purple-600 text-white px-4 py-2 min-h-[44px] touch-manipulation rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-3"
              >
                <Camera size={20} />
                Aggiorna Salute ({selection.plantIds.length})
              </button>
            </div>

            {/* Row Management Actions */}
            <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-200">
              <button
                onClick={() => setShowRowAssignment(true)}
                className="bg-indigo-600 text-white px-4 py-2 min-h-[44px] touch-manipulation rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-3"
              >
                <Link size={20} />
                Assegna a Filare ({selection.plantIds.length})
              </button>
              
              <button
                onClick={handleRemovePlantsFromRow}
                className="bg-gray-600 text-white px-4 py-2 min-h-[44px] touch-manipulation rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-3"
              >
                <Unlink size={20} />
                Rimuovi da Filare ({selection.plantIds.length})
              </button>

              <button
                onClick={() => setShowUnifiedOperationModal(true)}
                className="bg-teal-600 text-white px-4 py-2 min-h-[44px] touch-manipulation rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-3"
              >
                <Layers size={20} />
                Operazione Unificata ({selection.plantIds.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Plant Display Area */}
      <div className="bg-white rounded-lg shadow-md">
        {filteredPlants.length === 0 ? (
          <div className="text-center py-12">
            <TreePine className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nessuna pianta trovata
            </h3>
            <p className="text-gray-600">
              Modifica i filtri per visualizzare le piante
            </p>
          </div>
        ) : (
          <>
            {/* Heatmap View */}
            {viewMode === 'heatmap' && (
              <PlantHealthHeatmap
                plants={filteredPlants}
                onPlantSelect={(plant) => {
                  if (selection.mode === 'single') {
                    setSelection({
                      ...selection,
                      plantIds: [plant.id]
                    });
                  }
                }}
                onShowDetails={(plant) => {
                  setSelectedPlantForDetail(plant);
                  setShowPlantDetailModal(true);
                }}
                gardenCoordinates={garden.coordinates}
              />
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {filteredPlants.slice(0, 50).map((plant) => {
                    // Calcola info tooltip per filare
                    const fieldRowInfo = plant.fieldRowId ? {
                      fieldRowName: plant.fieldRowName || `Filare ${plant.fieldRowId}`,
                      position: plant.positionInRow || 0,
                      distanceFromStart: plant.positionInRow ? `${(plant.positionInRow * 0.5).toFixed(1)}m` : 'N/A'
                    } : null;

                    const tooltipContent = fieldRowInfo 
                      ? `${fieldRowInfo.fieldRowName} - Posizione ${fieldRowInfo.position} (${fieldRowInfo.distanceFromStart} dall'inizio)`
                      : `Pianta ${plant.plantCode} - ${plant.variety}`;

                    return (
                      <div
                        key={plant.id}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          selection.plantIds.includes(plant.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        title={tooltipContent}
                        onClick={() => {
                          if (selection.mode === 'single') {
                            setSelection({
                              ...selection,
                              plantIds: selection.plantIds.includes(plant.id) 
                                ? selection.plantIds.filter(id => id !== plant.id)
                                : [plant.id]
                            });
                          }
                        }}
                        onDoubleClick={() => {
                          setSelectedPlantForDetail(plant);
                          setShowPlantDetailModal(true);
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{plant.plantCode}</span>
                            {fieldRowInfo && (
                              <span className="text-xs text-blue-600">
                                📍 Pos. {fieldRowInfo.position}
                              </span>
                            )}
                          </div>
                          {getStatusIcon(plant.status)}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getHealthColor(plant.healthScore)}`} />
                          <span className="text-xs text-gray-600">{plant.healthScore}%</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{plant.variety}</p>
                        {fieldRowInfo && (
                          <p className="text-xs text-blue-500 mt-1">
                            🌾 {fieldRowInfo.fieldRowName}
                          </p>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlantForDetail(plant);
                            setShowPlantDetailModal(true);
                          }}
                          className="mt-2 w-full px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                        >
                          Dettagli
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="p-4 sm:p-6 space-y-2">
                {filteredPlants.slice(0, 100).map((plant) => {
                  // Calcola info tooltip per filare
                  const fieldRowInfo = plant.fieldRowId ? {
                    fieldRowName: plant.fieldRowName || `Filare ${plant.fieldRowId}`,
                    position: plant.positionInRow || 0,
                    distanceFromStart: plant.positionInRow ? `${(plant.positionInRow * 0.5).toFixed(1)}m` : 'N/A'
                  } : null;

                  const tooltipContent = fieldRowInfo 
                    ? `${fieldRowInfo.fieldRowName} - Posizione ${fieldRowInfo.position} (${fieldRowInfo.distanceFromStart} dall'inizio) - Salute: ${plant.healthScore}%`
                    : `Pianta ${plant.plantCode} - ${plant.variety} - Salute: ${plant.healthScore}%`;

                  return (
                    <div
                      key={plant.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selection.plantIds.includes(plant.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      title={tooltipContent}
                      onClick={() => {
                        if (selection.mode === 'single') {
                          setSelection({
                            ...selection,
                            plantIds: selection.plantIds.includes(plant.id) 
                              ? selection.plantIds.filter(id => id !== plant.id)
                              : [plant.id]
                          });
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <span className="font-medium">{plant.plantCode}</span>
                            {fieldRowInfo && (
                              <span className="text-xs text-blue-600">
                                🌾 {fieldRowInfo.fieldRowName} - Pos. {fieldRowInfo.position} ({fieldRowInfo.distanceFromStart})
                              </span>
                            )}
                          </div>
                          <span className="text-gray-600">{plant.plantName}</span>
                          <span className="text-sm text-gray-500">{plant.variety}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${getHealthColor(plant.healthScore)}`} />
                            <span className="text-sm">{plant.healthScore}%</span>
                          </div>
                          {getStatusIcon(plant.status)}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPlantForDetail(plant);
                              setShowPlantDetailModal(true);
                            }}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                          >
                            Dettagli
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <BulkOperationModal
        isOpen={showOperationModal}
        onClose={() => setShowOperationModal(false)}
        operationType={selectedOperation}
        selectedPlants={filteredPlants.filter(p => selection.plantIds.includes(p.id))}
        onSubmit={handleBulkOperation}
      />

      {/* Row Assignment Modal */}
      {showRowAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-[90vw] md:max-w-md max-h-[95vh] sm:max-h-[95vh] sm:max-h-[90vh] overflow-y-auto w-full">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Assegna Piante a Filare
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                Assegna {selection.plantIds.length} piante selezionate a un filare
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleziona Filare
                </label>
                <select
                  value={selectedRowForAssignment}
                  onChange={(e) => setSelectedRowForAssignment(e.target.value)}
                  className="w-full px-4 py-3 min-h-[44px] touch-manipulation text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Seleziona un filare...</option>
                  {availableRows.map(row => (
                    <option key={row.id} value={row.id}>
                      {row.name} ({row.type === 'garden_row' ? 'Aiuola' : 'Campo Aperto'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowRowAssignment(false);
                    setSelectedRowForAssignment('');
                  }}
                  className="px-4 py-2 min-h-[44px] touch-manipulation text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  onClick={handleAssignPlantsToRow}
                  disabled={!selectedRowForAssignment}
                  className="px-4 py-2 min-h-[44px] touch-manipulation bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assegna
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unified Operation Modal */}
      {showUnifiedOperationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-[95vw] sm:max-w-[95vw] sm:max-w-lg w-full">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Operazione Unificata Multi-Livello
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                Esegui operazione che si propaga automaticamente dai filari alle piante individuali
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo Operazione
                  </label>
                  <select
                    value={selectedOperation}
                    onChange={(e) => setSelectedOperation(e.target.value as any)}
                    className="w-full px-4 py-3 min-h-[44px] touch-manipulation text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="watering">Irrigazione</option>
                    <option value="fertilizing">Fertilizzazione</option>
                    <option value="treatment">Trattamento</option>
                  </select>
                </div>

                <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <Layers className="text-teal-600" size={16} />
                    <span className="text-sm font-medium text-teal-800">Propagazione Automatica</span>
                  </div>
                  <p className="text-xs text-teal-700">
                    L'operazione verrà registrata a livello filare e automaticamente propagata 
                    alle {selection.plantIds.length} piante selezionate con calcolo automatico delle dosi.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowUnifiedOperationModal(false)}
                  className="px-4 py-2 min-h-[44px] touch-manipulation text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  onClick={() => {
                    // This would trigger the unified operation
                    // For now, just close the modal
                    setShowUnifiedOperationModal(false);
                    alert('Funzionalità in sviluppo - sarà disponibile nella prossima versione');
                  }}
                  className="px-4 py-2 min-h-[44px] touch-manipulation bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Esegui Operazione
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Plant Detail Modal */}
      <PlantDetailModal
        plant={selectedPlantForDetail || {
          id: '',
          gardenId: garden.id,
          positionInRow: 1,
          plantCode: '',
          plantName: '',
          variety: '',
          plantedDate: new Date().toISOString(),
          status: 'healthy',
          healthScore: 100,
          photos: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as GardenPlant}
        isOpen={showPlantDetailModal && selectedPlantForDetail !== null}
        onClose={() => {
          setShowPlantDetailModal(false);
          setSelectedPlantForDetail(null);
        }}
      />
    </div>
  );
};

export default SmartPlantManager;
