/**
 * Prescription Maps Dashboard
 * Dashboard principale per gestione mappe prescrizione
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useStorage } from '../../packages/core/hooks/useStorage';
import { 
  PrescriptionMap, 
  PrescriptionGenerationRequest,
  PrescriptionMapStats
} from '../../types/prescriptionMaps';
import { createPrescriptionMapsService } from '../../services/prescriptionMapsService';
import type { PrescriptionMapFieldOpsSummary } from '../../services/prescriptionMapsService';
import type {
  PrescriptionExecutionEfficacySummary,
  PrescriptionExecutionSummary,
  PrescriptionExecutionOutcomeSummary,
  PrescriptionExecutionVarianceSummary,
} from '../../services/prescriptionExecutionService';
import type { PrescriptionAgronomicIntelligenceSummary } from '../../services/prescriptionAgronomicIntelligenceService';
import ZoneManagementPanel from './ZoneManagementPanel';
import MapExportModal from './MapExportModal';
import HistoricalComparisonPanel from './HistoricalComparisonPanel';
import CostOptimizationPanel from './CostOptimizationPanel';
import PrescriptionMapsIntro from './PrescriptionMapsIntro';
import { 
  Map, 
  Plus, 
  Download, 
  Eye, 
  Settings, 
  BarChart3,
  Layers,
  Target,
  Zap,
  CheckCircle,
  TrendingUp,
  History,
  DollarSign,
  X
} from 'lucide-react';

interface PrescriptionMapsDashboardProps {
  gardenId: string;
}

type PrescriptionMapType = PrescriptionMap['mapType'];

const PrescriptionMapsDashboard: React.FC<PrescriptionMapsDashboardProps> = ({ gardenId }) => {
  const { storageProvider } = useStorage();
  
  // Services
  const prescriptionService = useMemo(
    () => createPrescriptionMapsService(storageProvider),
    [storageProvider]
  );
  
  // State
  const [prescriptionMaps, setPrescriptionMaps] = useState<PrescriptionMap[]>([]);
  const [executionSummaries, setExecutionSummaries] = useState<Record<string, PrescriptionExecutionSummary>>({});
  const [executionVarianceSummaries, setExecutionVarianceSummaries] = useState<Record<string, PrescriptionExecutionVarianceSummary>>({});
  const [executionOutcomeSummaries, setExecutionOutcomeSummaries] = useState<Record<string, PrescriptionExecutionOutcomeSummary>>({});
  const [executionEfficacySummaries, setExecutionEfficacySummaries] = useState<Record<string, PrescriptionExecutionEfficacySummary>>({});
  const [agronomicIntelligenceSummaries, setAgronomicIntelligenceSummaries] = useState<Record<string, PrescriptionAgronomicIntelligenceSummary>>({});
  const [fieldOpsSummaries, setFieldOpsSummaries] = useState<Record<string, PrescriptionMapFieldOpsSummary>>({});
  const [stats, setStats] = useState<PrescriptionMapStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMap, setSelectedMap] = useState<PrescriptionMap | null>(null);
  
  // Modal states
  const [showIntro, setShowIntro] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showZoneManagement, setShowZoneManagement] = useState(false);
  const [showHistoricalComparison, setShowHistoricalComparison] = useState(false);
  const [showCostOptimization, setShowCostOptimization] = useState(false);
  
  // Generation state
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const loadPrescriptionMaps = useCallback(async () => {
    try {
      setLoading(true);
      const maps = await prescriptionService.getPrescriptionMaps(gardenId);
      setPrescriptionMaps(maps);
      const executionBundles = await Promise.all(
        maps.map(async (map) => ([
          map.id,
          {
            summary: await prescriptionService.getPrescriptionExecutionSummary(map),
            variance: await prescriptionService.getPrescriptionExecutionVarianceSummary(map),
            outcome: await prescriptionService.getPrescriptionExecutionOutcomeSummary(map),
            efficacy: await prescriptionService.getPrescriptionExecutionEfficacySummary(map),
            intelligence: await prescriptionService.getPrescriptionAgronomicIntelligenceSummary(map),
            fieldOps: await prescriptionService.getPrescriptionMapFieldOpsSummary(map),
          }
        ] as const))
      );

      setExecutionSummaries(
        Object.fromEntries(executionBundles.map(([mapId, bundle]) => [mapId, bundle.summary]))
      );
      setExecutionVarianceSummaries(
        Object.fromEntries(executionBundles.map(([mapId, bundle]) => [mapId, bundle.variance]))
      );
      setExecutionOutcomeSummaries(
        Object.fromEntries(executionBundles.map(([mapId, bundle]) => [mapId, bundle.outcome]))
      );
      setExecutionEfficacySummaries(
        Object.fromEntries(executionBundles.map(([mapId, bundle]) => [mapId, bundle.efficacy]))
      );
      setAgronomicIntelligenceSummaries(
        Object.fromEntries(executionBundles.map(([mapId, bundle]) => [mapId, bundle.intelligence]))
      );
      setFieldOpsSummaries(
        Object.fromEntries(executionBundles.map(([mapId, bundle]) => [mapId, bundle.fieldOps]))
      );
    } catch (error) {
      console.error('Error loading prescription maps:', error);
      setExecutionSummaries({});
      setExecutionVarianceSummaries({});
      setExecutionOutcomeSummaries({});
      setExecutionEfficacySummaries({});
      setAgronomicIntelligenceSummaries({});
      setFieldOpsSummaries({});
    } finally {
      setLoading(false);
    }
  }, [gardenId, prescriptionService]);

  const loadStats = useCallback(async () => {
    try {
      const computedStats = await prescriptionService.getPrescriptionMapStats(gardenId);
      setStats(computedStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [gardenId, prescriptionService]);

  useEffect(() => {
    loadPrescriptionMaps();
    loadStats();
    
    // Show intro on first visit
    const hasSeenIntro = localStorage.getItem('prescriptionMapsIntroSeen');
    if (!hasSeenIntro) {
      setShowIntro(true);
    }
  }, [gardenId, loadPrescriptionMaps, loadStats]);

  const handleCreateMap = async (request: PrescriptionGenerationRequest) => {
    try {
      setGenerating(true);
      setGenerationProgress(0);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 500);
      
      const result = await prescriptionService.generatePrescriptionMap(request);
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      if (result.success) {
        alert(`✅ Mappa prescrizione generata con successo!\n${result.stats.zonesGenerated} zone create\nQualità: ${result.quality.overallScore}%`);
        await loadPrescriptionMaps();
        await loadStats();
        setShowCreateModal(false);
      } else {
        alert(`❌ Errore nella generazione:\n${result.errors?.join('\n')}`);
      }
    } catch (error) {
      console.error('Error creating prescription map:', error);
      alert('Errore nella generazione della mappa');
    } finally {
      setGenerating(false);
      setGenerationProgress(0);
    }
  };

  const getMapTypeIcon = (mapType: string) => {
    switch (mapType) {
      case 'fertilizer': return <Zap className="text-green-600" size={20} />;
      case 'seeding': return <Target className="text-blue-600" size={20} />;
      case 'irrigation': return <Layers className="text-cyan-600" size={20} />;
      case 'treatment': return <CheckCircle className="text-orange-600" size={20} />;
      case 'harvest': return <TrendingUp className="text-purple-600" size={20} />;
      default: return <Map className="text-gray-600" size={20} />;
    }
  };

  const getValidationStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'invalid': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityClasses = (urgency: 'immediate' | 'next_cycle' | 'monitor') => {
    switch (urgency) {
      case 'immediate':
        return 'bg-rose-100 text-rose-800'
      case 'next_cycle':
        return 'bg-amber-100 text-amber-800'
      default:
        return 'bg-sky-100 text-sky-800'
    }
  }

  const handleCreateRevision = async (map: PrescriptionMap) => {
    try {
      const revision = await prescriptionService.createPrescriptionMapRevision(map.id)
      alert(`✅ Revisione creata: ${revision.name}`)
      await loadPrescriptionMaps()
      await loadStats()
    } catch (error) {
      console.error('Error creating prescription map revision:', error)
      alert('Errore durante la creazione della revisione')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento mappe prescrizione...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Map className="text-green-600" size={24} />
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Mappe Prescrizione</h2>
              <p className="text-sm sm:text-base text-gray-600">
                Mappe prescrizione per precision farming
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 sm:gap-3 font-medium shadow-sm text-sm sm:text-base touch-manipulation"
            >
              <Plus size={18} />
              <span className="sm:inline">Crea Nuova Mappa</span>
            </button>
            
            <button
              onClick={() => setShowHistoricalComparison(true)}
              className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base touch-manipulation"
            >
              <History size={16} />
              <span className="hidden sm:inline">Confronto Storico</span>
              <span className="sm:hidden">Confronto</span>
            </button>
          </div>
        </div>

        {/* Statistics Dashboard */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-blue-600">Mappe Totali</p>
                  <p className="text-base sm:text-lg md:text-xl font-bold text-blue-700">{stats.totalMapsGenerated}</p>
                </div>
                <Map className="text-blue-600" size={20} />
              </div>
            </div>

            <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-green-600">Area Coperta</p>
                  <p className="text-base sm:text-lg md:text-xl font-bold text-green-700">{stats.totalAreaCovered} ha</p>
                </div>
                <Layers className="text-green-600" size={20} />
              </div>
            </div>

            <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-purple-600">Qualità Media</p>
                  <p className="text-base sm:text-lg md:text-xl font-bold text-purple-700">{stats.averageQualityScore}%</p>
                </div>
                <BarChart3 className="text-purple-600" size={20} />
              </div>
            </div>

            <div className="bg-orange-50 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-orange-600">Risparmio</p>
                  <p className="text-base sm:text-lg md:text-xl font-bold text-orange-700">€{stats.totalCostSavings}</p>
                </div>
                <TrendingUp className="text-orange-600" size={20} />
              </div>
            </div>

            <div className="bg-cyan-50 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-cyan-600">ROI Medio</p>
                  <p className="text-base sm:text-lg md:text-xl font-bold text-cyan-700">{stats.averageRoi}%</p>
                </div>
                <Target className="text-cyan-600" size={20} />
              </div>
            </div>

            <div className="bg-indigo-50 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-indigo-600">Riduzione Input</p>
                  <p className="text-base sm:text-lg md:text-xl font-bold text-indigo-700">{stats.inputReductionAchieved}%</p>
                </div>
                <CheckCircle className="text-indigo-600" size={20} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Maps List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Mappe Prescrizione</h3>
        </div>

        {prescriptionMaps.length === 0 ? (
          <div className="text-center py-12">
            <Map className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nessuna mappa prescrizione
            </h3>
            <p className="text-gray-600 mb-4">
              Crea la tua prima mappa prescrizione per iniziare con il precision farming
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowIntro(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                📚 Guida Introduttiva
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Crea Prima Mappa
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {prescriptionMaps.map((map) => {
              const executionSummary = executionSummaries[map.id];
              const varianceSummary = executionVarianceSummaries[map.id];
              const outcomeSummary = executionOutcomeSummaries[map.id];
              const efficacySummary = executionEfficacySummaries[map.id];
              const intelligenceSummary = agronomicIntelligenceSummaries[map.id];
              const fieldOpsSummary = fieldOpsSummaries[map.id];

              return (
              <div key={map.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getMapTypeIcon(map.mapType)}
                    <div>
                      <h4 className="font-semibold text-gray-900">{map.name}</h4>
                      <p className="text-sm text-gray-600">{map.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{map.totalZones} zone</span>
                        <span>{(map.totalAreaSqm / 10000).toFixed(1)} ha</span>
                        <span>{map.versionLabel || `v${map.versionNumber || 1}`}</span>
                        <span>Qualità: {map.qualityScore}%</span>
                        <span className={`px-2 py-1 rounded-full ${getValidationStatusColor(map.validationStatus)}`}>
                          {map.validationStatus}
                        </span>
                      </div>
                      {map.algorithmMetadata && map.contentChecksum ? (
                        <p className="mt-2 text-xs text-emerald-700">
                          {map.algorithmMetadata.algorithmVersion} · fonte {map.algorithmMetadata.sourceQuality} · checksum {map.contentChecksum.slice(0, 12)}… · prescrizione separata dall’esecuzione
                        </p>
                      ) : (
                        <p className="mt-2 text-xs text-amber-700">Mappa legacy senza provenance/checksum: export operativo bloccato fino a nuova revisione.</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleCreateRevision(map)}
                      className="p-3 text-violet-600 hover:text-violet-900 hover:bg-violet-100 rounded-lg transition-colors"
                      title="Nuova revisione"
                    >
                      <History size={16} />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedMap(map);
                        setShowCostOptimization(true);
                      }}
                      className="p-3 text-orange-600 hover:text-orange-900 hover:bg-orange-100 rounded-lg transition-colors"
                      title="Ottimizza Costi"
                    >
                      <DollarSign size={16} />
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedMap(map);
                        setShowZoneManagement(true);
                      }}
                      className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Gestisci Zone"
                    >
                      <Settings size={16} />
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedMap(map);
                        setShowExportModal(true);
                      }}
                      className="p-3 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Esporta"
                    >
                      <Download size={16} />
                    </button>
                    
                    <button
                      onClick={() => {
                        // TODO: Implement map preview
                        alert('Anteprima mappa - funzionalità in sviluppo');
                      }}
                      className="p-3 text-green-600 hover:text-green-900 hover:bg-green-100 rounded-lg transition-colors"
                      title="Anteprima"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>

                {/* Cost Analysis Summary */}
                {map.costAnalysis && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-green-600 font-medium">Risparmio vs Uniforme</p>
                      <p className="text-green-700 font-bold">€{map.costAnalysis.savingsVsUniform}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-blue-600 font-medium">ROI Stimato</p>
                      <p className="text-blue-700 font-bold">{map.costAnalysis.roi}%</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-purple-600 font-medium">Riduzione Input</p>
                      <p className="text-purple-700 font-bold">{map.costAnalysis.inputReduction}%</p>
                    </div>
                  </div>
                )}

                {fieldOpsSummary && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-violet-50 p-3 rounded-lg">
                      <p className="text-violet-600 font-medium">Export totali</p>
                      <p className="text-violet-700 font-bold">{fieldOpsSummary.totalExports}</p>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded-lg">
                      <p className="text-indigo-600 font-medium">Ultimo export</p>
                      <p className="text-indigo-700 font-bold">{fieldOpsSummary.latestExport?.format?.toUpperCase() || 'N/D'}</p>
                    </div>
                    <div className="bg-cyan-50 p-3 rounded-lg">
                      <p className="text-cyan-600 font-medium">Macchina/field import</p>
                      <p className="text-cyan-700 font-bold">{fieldOpsSummary.downloadedExports + fieldOpsSummary.importedExports}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-slate-600 font-medium">Esecuzioni collegate</p>
                      <p className="text-slate-700 font-bold">{fieldOpsSummary.linkedExecutions}</p>
                    </div>
                  </div>
                )}

                {executionSummary && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-emerald-50 p-3 rounded-lg">
                      <p className="text-emerald-600 font-medium">Eseguite</p>
                      <p className="text-emerald-700 font-bold">
                        {executionSummary.completedZones}/{executionSummary.totalZones}
                      </p>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-lg">
                      <p className="text-amber-600 font-medium">Parziali</p>
                      <p className="text-amber-700 font-bold">{executionSummary.partialZones}</p>
                    </div>
                    <div className="bg-rose-50 p-3 rounded-lg">
                      <p className="text-rose-600 font-medium">Mancate</p>
                      <p className="text-rose-700 font-bold">{executionSummary.missedZones}</p>
                    </div>
                    <div className="bg-sky-50 p-3 rounded-lg">
                      <p className="text-sky-600 font-medium">In attesa</p>
                      <p className="text-sky-700 font-bold">{executionSummary.pendingZones}</p>
                    </div>
                  </div>
                )}

                {varianceSummary && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-lime-50 p-3 rounded-lg">
                      <p className="text-lime-600 font-medium">Aderenti</p>
                      <p className="text-lime-700 font-bold">{varianceSummary.alignedZones}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-yellow-600 font-medium">Scostamento parziale</p>
                      <p className="text-yellow-700 font-bold">{varianceSummary.partialZones}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-red-600 font-medium">Fuori soglia</p>
                      <p className="text-red-700 font-bold">{varianceSummary.offTargetZones}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-slate-600 font-medium">Aderenza media</p>
                      <p className="text-slate-700 font-bold">{varianceSummary.averageAdherenceScore}%</p>
                    </div>
                  </div>
                )}

                {outcomeSummary && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-emerald-50 p-3 rounded-lg">
                      <p className="text-emerald-600 font-medium">Outcome positivi</p>
                      <p className="text-emerald-700 font-bold">{outcomeSummary.positiveZones}</p>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-lg">
                      <p className="text-amber-600 font-medium">Outcome misti</p>
                      <p className="text-amber-700 font-bold">{outcomeSummary.mixedZones}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-red-600 font-medium">Outcome negativi</p>
                      <p className="text-red-700 font-bold">{outcomeSummary.negativeZones}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-slate-600 font-medium">Score outcome</p>
                      <p className="text-slate-700 font-bold">{outcomeSummary.averageOutcomeScore}%</p>
                    </div>
                  </div>
                )}

                {efficacySummary && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-teal-50 p-3 rounded-lg">
                      <p className="text-teal-600 font-medium">Efficacia media</p>
                      <p className="text-teal-700 font-bold">{efficacySummary.averageEfficacyScore}%</p>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-lg">
                      <p className="text-emerald-600 font-medium">Zone alte</p>
                      <p className="text-emerald-700 font-bold">{efficacySummary.highZones}</p>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-lg">
                      <p className="text-amber-600 font-medium">Zone medie</p>
                      <p className="text-amber-700 font-bold">{efficacySummary.mediumZones}</p>
                    </div>
                    <div className="bg-rose-50 p-3 rounded-lg">
                      <p className="text-rose-600 font-medium">Zone deboli</p>
                      <p className="text-rose-700 font-bold">{efficacySummary.lowZones}</p>
                    </div>
                    <div className="bg-cyan-50 p-3 rounded-lg">
                      <p className="text-cyan-600 font-medium">Microclima medio</p>
                      <p className="text-cyan-700 font-bold">{efficacySummary.averageMicroclimateScore}%</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-blue-600 font-medium">Risposta suolo</p>
                      <p className="text-blue-700 font-bold">{efficacySummary.averageSoilResponseScore}%</p>
                    </div>
                    <div className="md:col-span-4 text-xs text-gray-500">
                      Coltura prevalente: {efficacySummary.cropContextScores[0]?.label || 'non classificata'} • Stagione: {efficacySummary.seasonScores[0]?.label || 'n/d'}
                    </div>
                  </div>
                )}

                {intelligenceSummary && intelligenceSummary.recommendations.length > 0 && (
                  <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50 p-4">
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-teal-900">Intelligenza Agronomica</p>
                      <p className="text-xs text-teal-700">
                        Benchmark: {intelligenceSummary.bestZoneLabel || 'n/d'} • Zona da recuperare: {intelligenceSummary.worstZoneLabel || 'n/d'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {intelligenceSummary.recommendations.slice(0, 3).map(recommendation => (
                        <div key={recommendation.id} className="rounded-lg border border-white/80 bg-white/80 p-3 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium text-gray-900">{recommendation.title}</p>
                            <span className="rounded-full bg-teal-100 px-2 py-1 text-[11px] font-semibold text-teal-800">
                              {recommendation.severity}
                            </span>
                          </div>
                          {recommendation.scopeLabel && (
                            <p className="mt-1 text-xs font-medium text-teal-700">{recommendation.scopeLabel}</p>
                          )}
                          <p className="mt-1 text-gray-700">{recommendation.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {intelligenceSummary && intelligenceSummary.operationalPriorities.length > 0 && (
                  <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4">
                    <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-rose-900">Priorita operative</p>
                        <p className="text-xs text-rose-700">
                          Top priorita: {intelligenceSummary.topPriorityLabel || 'n/d'} • Immediate: {intelligenceSummary.immediatePriorities} • Prossimo ciclo: {intelligenceSummary.nextCyclePriorities}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {intelligenceSummary.operationalPriorities.slice(0, 3).map((priority) => (
                        <div key={priority.id} className="rounded-lg border border-white/80 bg-white/90 p-3 text-sm">
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{priority.scopeLabel}</p>
                              <p className="text-xs text-gray-500">Score priorita {priority.priorityScore} • Efficacia {priority.efficacyScore}%</p>
                            </div>
                            <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${getPriorityClasses(priority.urgency)}`}>
                              {priority.urgency === 'immediate' ? 'subito' : priority.urgency === 'next_cycle' ? 'prossimo ciclo' : 'monitor'}
                            </span>
                          </div>
                          <p className="mt-2 text-gray-700">{priority.recommendedAction}</p>
                          {priority.drivers.length > 0 && (
                            <p className="mt-1 text-xs text-rose-700">
                              Driver: {priority.drivers.join(' • ')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )})}
          </div>
        )}
      </div>

      {/* Generation Progress Modal */}
      {generating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-[90vw] sm:max-w-md max-h-[90vh] overflow-y-auto w-full p-4 sm:p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                Generazione Mappa Prescrizione
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Elaborazione dati e calcolo zone in corso...
              </p>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>
              
              <p className="text-sm text-gray-500">
                {generationProgress}% completato
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showIntro && (
        <PrescriptionMapsIntro
          onClose={() => {
            setShowIntro(false);
            localStorage.setItem('prescriptionMapsIntroSeen', 'true');
          }}
          onStartWizard={() => {
            setShowIntro(false);
            localStorage.setItem('prescriptionMapsIntroSeen', 'true');
            setShowCreateModal(true);
          }}
        />
      )}

      {showCreateModal && (
        <CreatePrescriptionMapModal
          gardenId={gardenId}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateMap}
        />
      )}

      {showExportModal && selectedMap && (
        <MapExportModal
          prescriptionMap={selectedMap}
          onClose={() => {
            setShowExportModal(false);
            setSelectedMap(null);
          }}
        />
      )}

      {showZoneManagement && selectedMap && (
        <ZoneManagementPanel
          prescriptionMap={selectedMap}
          onClose={() => {
            setShowZoneManagement(false);
            setSelectedMap(null);
          }}
          onUpdate={async () => {
            await loadPrescriptionMaps();
            await loadStats();
          }}
        />
      )}

      {showHistoricalComparison && (
        <HistoricalComparisonPanel
          gardenId={gardenId}
          availableMaps={prescriptionMaps}
          onClose={() => setShowHistoricalComparison(false)}
        />
      )}

      {showCostOptimization && selectedMap && (
        <CostOptimizationPanel
          prescriptionMap={selectedMap}
          onClose={() => {
            setShowCostOptimization(false);
            setSelectedMap(null);
          }}
          onOptimizationComplete={(result) => {
            // Handle optimization completion
            console.log('Optimization completed:', result);
            loadPrescriptionMaps();
          }}
        />
      )}
    </div>
  );
};

/**
 * Create Prescription Map Modal Component
 */
interface CreatePrescriptionMapModalProps {
  gardenId: string;
  onClose: () => void;
  onSubmit: (request: PrescriptionGenerationRequest) => void;
}

const CreatePrescriptionMapModal: React.FC<CreatePrescriptionMapModalProps> = ({
  gardenId,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<Partial<PrescriptionGenerationRequest>>({
    gardenId,
    mapType: 'fertilizer',
    name: '',
    description: '',
    dataSources: {
      ndviWeight: 0.4,
      plantHealthWeight: 0.3,
      soilWeight: 0.2,
      historicalWeight: 0.1
    },
    zoneConfig: {
      minZoneSize: 500,
      maxZones: 15,
      similarityThreshold: 0.8,
      smoothingFactor: 0.3
    },
    prescriptionConfig: {
      baseRate: 100,
      unit: 'kg/ha',
      productName: '',
      variableRateEnabled: true,
      maxVariation: 30
    },
    exportFormats: ['shapefile', 'kml'],
    analysisPeriod: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.mapType) {
      alert('Nome e tipo mappa sono obbligatori');
      return;
    }
    
    onSubmit(formData as PrescriptionGenerationRequest);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Nuova Mappa Prescrizione</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-2 -m-2 touch-manipulation"
            aria-label="Chiudi"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Mappa *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="es. Fertilizzazione Primavera 2026"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo Mappa *
              </label>
              <select
                value={formData.mapType || 'fertilizer'}
                onChange={(e) => setFormData(prev => ({ ...prev, mapType: e.target.value as PrescriptionMapType }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="fertilizer">Fertilizzazione</option>
                <option value="seeding">Semina</option>
                <option value="irrigation">Irrigazione</option>
                <option value="treatment">Trattamento</option>
                <option value="harvest">Raccolta</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrizione
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              placeholder="Descrizione opzionale della mappa..."
            />
          </div>

          {/* Prescription Config */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dose Base
              </label>
              <input
                type="number"
                value={formData.prescriptionConfig?.baseRate || 100}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  prescriptionConfig: {
                    ...prev.prescriptionConfig!,
                    baseRate: parseFloat(e.target.value) || 100
                  }
                }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min="0"
                step="0.1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unità
              </label>
              <select
                value={formData.prescriptionConfig?.unit || 'kg/ha'}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  prescriptionConfig: {
                    ...prev.prescriptionConfig!,
                    unit: e.target.value
                  }
                }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="kg/ha">kg/ha</option>
                <option value="L/ha">L/ha</option>
                <option value="g/m²">g/m²</option>
                <option value="ml/m²">ml/m²</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variazione Max (%)
              </label>
              <input
                type="number"
                value={formData.prescriptionConfig?.maxVariation || 30}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  prescriptionConfig: {
                    ...prev.prescriptionConfig!,
                    maxVariation: parseFloat(e.target.value) || 30
                  }
                }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors touch-manipulation"
            >
              Genera Mappa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionMapsDashboard;
