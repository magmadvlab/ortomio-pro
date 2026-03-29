/**
 * Zone Management Panel
 * Pannello per gestione avanzata delle zone prescription maps
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  PrescriptionMap, 
  PrescriptionZone,
  PrescriptionExecutionStatus,
} from '../../types/prescriptionMaps';
import { createZoneManagementService, ZoneAnalysis } from '../../services/zoneManagementService';
import { createPrescriptionMapsService } from '../../services/prescriptionMapsService';
import type { PrescriptionMapFieldOpsSummary } from '../../services/prescriptionMapsService';
import type {
  PrescriptionExecutionEfficacySummary,
  PrescriptionExecutionOutcomeSummary,
  PrescriptionExecutionSummary,
  PrescriptionExecutionVarianceSummary,
} from '../../services/prescriptionExecutionService';
import type { PrescriptionAgronomicIntelligenceSummary } from '../../services/prescriptionAgronomicIntelligenceService';
import { useStorage } from '../../packages/core/hooks/useStorage';
import { 
  Layers, 
  Target, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle,
  Settings,
  Merge,
  Split,
  Eye,
  X
} from 'lucide-react';

interface ZoneManagementPanelProps {
  prescriptionMap: PrescriptionMap;
  onClose: () => void;
  onUpdate: () => void;
}

const TABS: Array<{
  key: 'zones' | 'analysis' | 'optimization'
  label: string
  icon: typeof Layers
}> = [
  { key: 'zones', label: 'Dettagli Zona', icon: Layers },
  { key: 'analysis', label: 'Analisi', icon: BarChart3 },
  { key: 'optimization', label: 'Ottimizzazione', icon: Target },
];

const ZoneManagementPanel: React.FC<ZoneManagementPanelProps> = ({
  prescriptionMap,
  onClose,
  onUpdate
}) => {
  const { storageProvider } = useStorage();
  const zoneService = createZoneManagementService(storageProvider);
  const prescriptionService = createPrescriptionMapsService(storageProvider);
  
  // State
  const [zones, setZones] = useState<PrescriptionZone[]>(prescriptionMap.zones);
  const [selectedZone, setSelectedZone] = useState<PrescriptionZone | null>(null);
  const [zoneAnalysis, setZoneAnalysis] = useState<ZoneAnalysis | null>(null);
  const [executionSummary, setExecutionSummary] = useState<PrescriptionExecutionSummary | null>(null);
  const [executionVarianceSummary, setExecutionVarianceSummary] = useState<PrescriptionExecutionVarianceSummary | null>(null);
  const [executionOutcomeSummary, setExecutionOutcomeSummary] = useState<PrescriptionExecutionOutcomeSummary | null>(null);
  const [executionEfficacySummary, setExecutionEfficacySummary] = useState<PrescriptionExecutionEfficacySummary | null>(null);
  const [agronomicIntelligenceSummary, setAgronomicIntelligenceSummary] = useState<PrescriptionAgronomicIntelligenceSummary | null>(null);
  const [fieldOpsSummary, setFieldOpsSummary] = useState<PrescriptionMapFieldOpsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [executionLoading, setExecutionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'zones' | 'analysis' | 'optimization'>('zones');

  useEffect(() => {
    setZones(prescriptionMap.zones);
  }, [prescriptionMap.zones]);

  const loadExecutionSummary = useCallback(async () => {
    try {
      const summary = await prescriptionService.getPrescriptionExecutionSummary({
        ...prescriptionMap,
        zones,
      });
      setExecutionSummary(summary);
      const varianceSummary = await prescriptionService.getPrescriptionExecutionVarianceSummary({
        ...prescriptionMap,
        zones,
      });
      setExecutionVarianceSummary(varianceSummary);
      const outcomeSummary = await prescriptionService.getPrescriptionExecutionOutcomeSummary({
        ...prescriptionMap,
        zones,
      });
      setExecutionOutcomeSummary(outcomeSummary);
      const efficacySummary = await prescriptionService.getPrescriptionExecutionEfficacySummary({
        ...prescriptionMap,
        zones,
      });
      setExecutionEfficacySummary(efficacySummary);
      const intelligenceSummary = await prescriptionService.getPrescriptionAgronomicIntelligenceSummary({
        ...prescriptionMap,
        zones,
      });
      setAgronomicIntelligenceSummary(intelligenceSummary);
      const opsSummary = await prescriptionService.getPrescriptionMapFieldOpsSummary({
        ...prescriptionMap,
        zones,
      });
      setFieldOpsSummary(opsSummary);
    } catch (error) {
      console.error('Error loading execution summary:', error);
      setExecutionSummary(null);
      setExecutionVarianceSummary(null);
      setExecutionOutcomeSummary(null);
      setExecutionEfficacySummary(null);
      setAgronomicIntelligenceSummary(null);
      setFieldOpsSummary(null);
    }
  }, [prescriptionMap, prescriptionService, zones]);

  useEffect(() => {
    loadExecutionSummary();
  }, [loadExecutionSummary]);

  const loadZoneAnalysis = useCallback(async (zone: PrescriptionZone) => {
    try {
      setLoading(true);
      const analysis = await zoneService.analyzeZone(zone.id);
      setZoneAnalysis(analysis);
    } catch (error) {
      console.error('Error loading zone analysis:', error);
    } finally {
      setLoading(false);
    }
  }, [zoneService]);

  useEffect(() => {
    if (selectedZone) {
      loadZoneAnalysis(selectedZone);
    }
  }, [loadZoneAnalysis, selectedZone]);

  const handleOptimizeZones = async () => {
    try {
      setLoading(true);
      const mergeCandidates = zones.filter((zone) => zone.areaSqm < 500);
      const splitCandidates = zones.filter(
        (zone) => zone.areaSqm > 20000 || zone.dataQuality < 50 || zone.confidence < 50
      );

      if (mergeCandidates.length === 0 && splitCandidates.length === 0) {
        alert('Le zone risultano gia bilanciate. Nessuna ottimizzazione prioritaria rilevata.');
      } else {
        const lines = [
          'Ottimizzazione analitica completata.',
          '',
          `Zone da valutare per accorpamento: ${mergeCandidates.length}`,
          `Zone da valutare per suddivisione o rilievo aggiuntivo: ${splitCandidates.length}`
        ];

        if (mergeCandidates.length > 0) {
          lines.push('', `Accorpamento suggerito: ${mergeCandidates.map((zone) => zone.zoneName).join(', ')}`);
        }

        if (splitCandidates.length > 0) {
          lines.push('', `Approfondimento suggerito: ${splitCandidates.map((zone) => zone.zoneName).join(', ')}`);
        }

        alert(lines.join('\n'));
      }
    } catch (error) {
      console.error('Error optimizing zones:', error);
      alert('Errore durante l\'ottimizzazione');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateZones = async () => {
    try {
      setLoading(true);
      const errors: string[] = [];
      const warnings: string[] = [];
      const suggestions: string[] = [];

      zones.forEach((zone) => {
        if (!zone.prescription?.applicationRate || zone.prescription.applicationRate <= 0) {
          errors.push(`${zone.zoneName}: dose applicativa non valida`);
        }
        if (!zone.areaSqm || zone.areaSqm <= 0) {
          errors.push(`${zone.zoneName}: area non valida`);
        }
        if (zone.confidence < 50) {
          warnings.push(`${zone.zoneName}: confidenza bassa (${zone.confidence}%)`);
        }
        if (zone.dataQuality < 60) {
          warnings.push(`${zone.zoneName}: qualita dati bassa (${zone.dataQuality}%)`);
        }
        if (zone.areaSqm < 500) {
          suggestions.push(`${zone.zoneName}: area molto piccola, valutare accorpamento`);
        }
      });

      const isValid = errors.length === 0;
      
      let message = `Validazione completata!\n\n`;
      
      if (isValid) {
        message += '✅ Configurazione valida per l\'applicazione';
      } else {
        message += '⚠️ Problemi rilevati:';
      }
      
      if (errors.length > 0) {
        message += `\n\nErrori:\n${errors.join('\n')}`;
      }
      
      if (warnings.length > 0) {
        message += `\n\nAvvertenze:\n${warnings.join('\n')}`;
      }
      
      if (suggestions.length > 0) {
        message += `\n\nSuggerimenti:\n${suggestions.join('\n')}`;
      }
      
      alert(message);
    } catch (error) {
      console.error('Error validating zones:', error);
      alert('Errore durante la validazione');
    } finally {
      setLoading(false);
    }
  };

  const getZoneColor = (zone: PrescriptionZone) => {
    const rate = zone.prescription.applicationRate;
    const baseRate = 100; // TODO: Get from prescription map
    const ratio = rate / baseRate;
    
    if (ratio < 0.8) return 'bg-blue-100 border-blue-300 text-blue-800';
    if (ratio > 1.2) return 'bg-red-100 border-red-300 text-red-800';
    return 'bg-green-100 border-green-300 text-green-800';
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 80) return 'text-green-600';
    if (quality >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const selectedZoneExecution = selectedZone
    ? executionSummary?.zoneSummaries.find((summary) => summary.zoneId === selectedZone.id)
    : undefined;
  const selectedZoneVariance = selectedZone
    ? executionVarianceSummary?.zoneVariances.find((summary) => summary.zoneId === selectedZone.id)
    : undefined;
  const selectedZoneOutcome = selectedZone
    ? executionOutcomeSummary?.zoneOutcomes.find((summary) => summary.zoneId === selectedZone.id)
    : undefined;
  const selectedZoneEfficacy = selectedZone
    ? executionEfficacySummary?.zoneScores.find((summary) => summary.zoneId === selectedZone.id)
    : undefined;
  const selectedZoneRecommendations = selectedZone
    ? agronomicIntelligenceSummary?.recommendations.filter(
        (recommendation) => !recommendation.scopeLabel || recommendation.scopeLabel === selectedZone.zoneName
      ) || []
    : [];
  const selectedZonePriority = selectedZone
    ? agronomicIntelligenceSummary?.operationalPriorities.find(
        (priority) => priority.zoneId === selectedZone.id
      )
    : undefined;

  const getVarianceBadgeClasses = (varianceStatus: string | undefined) => {
    switch (varianceStatus) {
      case 'aligned':
        return 'bg-lime-100 text-lime-800 border-lime-300';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'off_target':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'missed':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getOutcomeBadgeClasses = (outcomeStatus: string | undefined) => {
    switch (outcomeStatus) {
      case 'positive':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'mixed':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getEfficacyBadgeClasses = (efficacyStatus: string | undefined) => {
    switch (efficacyStatus) {
      case 'high':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'low':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getPriorityClasses = (urgency: 'immediate' | 'next_cycle' | 'monitor' | undefined) => {
    switch (urgency) {
      case 'immediate':
        return 'bg-rose-100 text-rose-800 border-rose-300'
      case 'next_cycle':
        return 'bg-amber-100 text-amber-800 border-amber-300'
      default:
        return 'bg-sky-100 text-sky-800 border-sky-300'
    }
  };

  const handleRegisterExecution = async (executionStatus: PrescriptionExecutionStatus) => {
    if (!selectedZone) {
      return;
    }

    try {
      setExecutionLoading(true);
      await prescriptionService.recordZoneExecution(
        {
          ...prescriptionMap,
          zones,
        },
        selectedZone,
        {
          executionStatus,
          operatorName: 'Operatore OrtoMio',
          notes: `Registrazione manuale stato ${executionStatus}`,
          sourceOperationType: fieldOpsSummary?.latestExport ? 'export' : 'manual',
          sourceOperationId: fieldOpsSummary?.latestExport?.id,
          prescriptionExportId: fieldOpsSummary?.latestExport?.id,
        }
      );
      await loadExecutionSummary();
      await onUpdate();
    } catch (error) {
      console.error('Error recording prescription execution:', error);
      alert('Errore durante la registrazione dell esecuzione prescrittiva');
    } finally {
      setExecutionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Layers className="text-green-600" size={24} />
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Gestione Zone</h2>
              <p className="text-sm text-gray-600">{prescriptionMap.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleValidateZones}
              disabled={loading}
              className="px-4 py-3 text-base text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              <CheckCircle size={16} className="inline mr-2" />
              Valida
            </button>
            
            <button
              onClick={handleOptimizeZones}
              disabled={loading}
              className="px-4 py-3 text-base text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
            >
              <Target size={16} className="inline mr-2" />
              Ottimizza
            </button>
            
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Left Panel - Zones List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Zone ({zones.length})</h3>
              <div className="text-sm text-gray-600">
                Area totale: {(prescriptionMap.totalAreaSqm / 10000).toFixed(1)} ha
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedZone?.id === zone.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedZone(zone)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{zone.zoneName}</span>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getZoneColor(zone)}`}>
                      {zone.prescription.applicationRate} {zone.prescription.unit}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Area: {(zone.areaSqm / 10000).toFixed(2)} ha</div>
                    <div className="flex items-center justify-between">
                      <span>Qualità:</span>
                      <span className={`font-medium ${getQualityColor(zone.dataQuality)}`}>
                        {zone.dataQuality}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Confidenza:</span>
                      <span className={`font-medium ${getQualityColor(zone.confidence)}`}>
                        {zone.confidence}%
                      </span>
                    </div>
                  </div>

                  {/* Zone indicators */}
                  <div className="flex items-center gap-3 mt-2">
                    {zone.dataQuality < 60 && (
                      <AlertTriangle size={14} className="text-yellow-full max-w-sm" />
                    )}
                    {zone.areaSqm < 500 && (
                      <Target size={14} className="text-orange-500" />
                    )}
                    {zone.confidence > 90 && (
                      <CheckCircle size={14} className="text-green-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Zone Details */}
          <div className="flex-1 overflow-y-auto">
            {selectedZone ? (
              <div className="p-6">
                {/* Zone Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{selectedZone.zoneName}</h3>
                    <div className="flex items-center gap-3">
                      <button className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                        <Eye size={16} />
                      </button>
                      <button className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                        <Settings size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Zone Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-600">Area</p>
                      <p className="font-bold text-blue-700">{(selectedZone.areaSqm / 10000).toFixed(2)} ha</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-600">Dose</p>
                      <p className="font-bold text-green-700">
                        {selectedZone.prescription.applicationRate} {selectedZone.prescription.unit}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm text-purple-600">Qualità</p>
                      <p className="font-bold text-purple-700">{selectedZone.dataQuality}%</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-sm text-orange-600">Confidenza</p>
                      <p className="font-bold text-orange-700">{selectedZone.confidence}%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-emerald-50 p-3 rounded-lg">
                      <p className="text-sm text-emerald-600">Eseguite</p>
                      <p className="font-bold text-emerald-700">{executionSummary?.completedZones ?? 0}</p>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-lg">
                      <p className="text-sm text-amber-600">Parziali</p>
                      <p className="font-bold text-amber-700">{executionSummary?.partialZones ?? 0}</p>
                    </div>
                    <div className="bg-rose-50 p-3 rounded-lg">
                      <p className="text-sm text-rose-600">Mancate</p>
                      <p className="font-bold text-rose-700">{executionSummary?.missedZones ?? 0}</p>
                    </div>
                    <div className="bg-sky-50 p-3 rounded-lg">
                      <p className="text-sm text-sky-600">In attesa</p>
                      <p className="font-bold text-sky-700">{executionSummary?.pendingZones ?? zones.length}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-lime-50 p-3 rounded-lg">
                      <p className="text-sm text-lime-600">Aderenti</p>
                      <p className="font-bold text-lime-700">{executionVarianceSummary?.alignedZones ?? 0}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-sm text-yellow-600">Parziali</p>
                      <p className="font-bold text-yellow-700">{executionVarianceSummary?.partialZones ?? 0}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm text-red-600">Fuori soglia</p>
                      <p className="font-bold text-red-700">{executionVarianceSummary?.offTargetZones ?? 0}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-sm text-slate-600">Aderenza media</p>
                      <p className="font-bold text-slate-700">{executionVarianceSummary?.averageAdherenceScore ?? 0}%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-emerald-50 p-3 rounded-lg">
                      <p className="text-sm text-emerald-600">Outcome positivi</p>
                      <p className="font-bold text-emerald-700">{executionOutcomeSummary?.positiveZones ?? 0}</p>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-lg">
                      <p className="text-sm text-amber-600">Outcome misti</p>
                      <p className="font-bold text-amber-700">{executionOutcomeSummary?.mixedZones ?? 0}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm text-red-600">Outcome negativi</p>
                      <p className="font-bold text-red-700">{executionOutcomeSummary?.negativeZones ?? 0}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-sm text-slate-600">Score outcome</p>
                      <p className="font-bold text-slate-700">{executionOutcomeSummary?.averageOutcomeScore ?? 0}%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-teal-50 p-3 rounded-lg">
                      <p className="text-sm text-teal-600">Efficacia media</p>
                      <p className="font-bold text-teal-700">{executionEfficacySummary?.averageEfficacyScore ?? 0}%</p>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-lg">
                      <p className="text-sm text-emerald-600">Zone alte</p>
                      <p className="font-bold text-emerald-700">{executionEfficacySummary?.highZones ?? 0}</p>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-lg">
                      <p className="text-sm text-amber-600">Zone medie</p>
                      <p className="font-bold text-amber-700">{executionEfficacySummary?.mediumZones ?? 0}</p>
                    </div>
                    <div className="bg-rose-50 p-3 rounded-lg">
                      <p className="text-sm text-rose-600">Zone basse</p>
                      <p className="font-bold text-rose-700">{executionEfficacySummary?.lowZones ?? 0}</p>
                    </div>
                    <div className="bg-cyan-50 p-3 rounded-lg">
                      <p className="text-sm text-cyan-600">Microclima medio</p>
                      <p className="font-bold text-cyan-700">{executionEfficacySummary?.averageMicroclimateScore ?? 0}%</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-600">Risposta suolo</p>
                      <p className="font-bold text-blue-700">{executionEfficacySummary?.averageSoilResponseScore ?? 0}%</p>
                    </div>
                  </div>

                  {fieldOpsSummary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-violet-50 p-3 rounded-lg">
                        <p className="text-sm text-violet-600">Versione</p>
                        <p className="font-bold text-violet-700">{prescriptionMap.versionLabel || `v${prescriptionMap.versionNumber || 1}`}</p>
                      </div>
                      <div className="bg-indigo-50 p-3 rounded-lg">
                        <p className="text-sm text-indigo-600">Ultimo export</p>
                        <p className="font-bold text-indigo-700">{fieldOpsSummary.latestExport?.format?.toUpperCase() || 'N/D'}</p>
                      </div>
                      <div className="bg-cyan-50 p-3 rounded-lg">
                        <p className="text-sm text-cyan-600">Export tracciati</p>
                        <p className="font-bold text-cyan-700">{fieldOpsSummary.totalExports}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-sm text-slate-600">Exec collegate</p>
                        <p className="font-bold text-slate-700">{fieldOpsSummary.linkedExecutions}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="flex space-x-8">
                    {TABS.map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                          activeTab === key
                            ? 'border-green-500 text-green-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon size={16} />
                        {label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                {activeTab === 'zones' && (
                  <div className="space-y-6">
                    {/* Prescription Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Prescrizione</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Dose applicazione:</span>
                          <span className="ml-2 font-medium">
                            {selectedZone.prescription.applicationRate} {selectedZone.prescription.unit}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Metodo:</span>
                          <span className="ml-2 font-medium">{selectedZone.prescription.applicationMethod}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Prodotto:</span>
                          <span className="ml-2 font-medium">{selectedZone.prescription.productName || 'Non specificato'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tipo zona:</span>
                          <span className="ml-2 font-medium">{selectedZone.zoneType}</span>
                        </div>
                      </div>
                    </div>

                    {/* Source Data */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Dati Sorgente</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">NDVI medio:</span>
                          <span className="ml-2 font-medium">{selectedZone.sourceData.avgNdvi?.toFixed(3) || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Salute piante:</span>
                          <span className="ml-2 font-medium">{selectedZone.sourceData.avgPlantHealth?.toFixed(1) || 'N/A'}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Numero piante:</span>
                          <span className="ml-2 font-medium">{selectedZone.sourceData.plantCount || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tipo suolo:</span>
                          <span className="ml-2 font-medium">{selectedZone.sourceData.soilType || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Variable Rate Details */}
                    {selectedZone.prescription.variableRate && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Dose Variabile</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Dose minima:</span>
                            <span className="ml-2 font-medium">
                              {selectedZone.prescription.variableRate.minRate} {selectedZone.prescription.unit}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Dose massima:</span>
                            <span className="ml-2 font-medium">
                              {selectedZone.prescription.variableRate.maxRate} {selectedZone.prescription.unit}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Funzione:</span>
                            <span className="ml-2 font-medium">{selectedZone.prescription.variableRate.rateFunction}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900">Esecuzione zona</h4>
                          <p className="text-sm text-gray-600">
                            Stato corrente: <span className="font-medium text-gray-900">{selectedZoneExecution?.latestStatus || 'pending'}</span>
                          </p>
                          <div className="mt-2">
                            <span className={`inline-flex px-2 py-1 rounded-full border text-xs font-medium ${getVarianceBadgeClasses(selectedZoneVariance?.varianceStatus)}`}>
                              {selectedZoneVariance?.varianceStatus || 'pending'}
                            </span>
                            <span className={`inline-flex ml-2 px-2 py-1 rounded-full border text-xs font-medium ${getOutcomeBadgeClasses(selectedZoneOutcome?.outcomeStatus)}`}>
                              {selectedZoneOutcome?.outcomeStatus || 'no_data'}
                            </span>
                            <span className={`inline-flex ml-2 px-2 py-1 rounded-full border text-xs font-medium ${getEfficacyBadgeClasses(selectedZoneEfficacy?.efficacyStatus)}`}>
                              {selectedZoneEfficacy?.efficacyStatus || 'unknown'}
                            </span>
                          </div>
                          {selectedZoneExecution?.latestExecution?.applicationDate && (
                            <p className="text-xs text-gray-500 mt-1">
                              Ultimo aggiornamento: {new Date(selectedZoneExecution.latestExecution.applicationDate).toLocaleString('it-IT')}
                            </p>
                          )}
                          {fieldOpsSummary?.latestExport && (
                            <p className="text-xs text-violet-700 mt-1">
                              Export operativo attivo: {fieldOpsSummary.latestExport.format.toUpperCase()} • Trace {fieldOpsSummary.latestExport.id}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleRegisterExecution('completed')}
                            disabled={executionLoading}
                            className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            Segna completa
                          </button>
                          <button
                            onClick={() => handleRegisterExecution('partial')}
                            disabled={executionLoading}
                            className="px-3 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
                          >
                            Segna parziale
                          </button>
                          <button
                            onClick={() => handleRegisterExecution('missed')}
                            disabled={executionLoading}
                            className="px-3 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
                          >
                            Segna mancata
                          </button>
                        </div>
                      </div>

                      {selectedZoneExecution?.latestExecution && (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Dose pianificata:</span>
                            <span className="ml-2 font-medium">
                              {selectedZoneExecution.latestExecution.plannedRate} {selectedZoneExecution.latestExecution.unit}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Dose eseguita:</span>
                            <span className="ml-2 font-medium">
                              {selectedZoneExecution.latestExecution.actualRate ?? 0} {selectedZoneExecution.latestExecution.unit}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Area coperta:</span>
                            <span className="ml-2 font-medium">
                              {((selectedZoneExecution.latestExecution.areaAppliedSqm ?? 0) / 10000).toFixed(2)} ha
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Scostamento dose:</span>
                            <span className="ml-2 font-medium">
                              {selectedZoneVariance?.rateDeviationPercent ?? 0}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Copertura area:</span>
                            <span className="ml-2 font-medium">
                              {selectedZoneVariance?.areaCoveragePercent ?? 0}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Aderenza:</span>
                            <span className="ml-2 font-medium">
                              {selectedZoneVariance?.adherenceScore ?? 0}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Efficacia:</span>
                            <span className="ml-2 font-medium">
                              {selectedZoneEfficacy?.efficacyScore ?? 0}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Microclima:</span>
                            <span className="ml-2 font-medium">
                              {selectedZoneEfficacy?.microclimateScore ?? 0}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Suolo:</span>
                            <span className="ml-2 font-medium">
                              {selectedZoneEfficacy?.soilResponseScore ?? 0}%
                            </span>
                          </div>
                        </div>
                      )}

                      {selectedZoneOutcome?.latestQualityResult && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 text-sm border-t pt-4">
                          <div>
                            <span className="text-gray-600">Score qualità:</span>
                            <span className="ml-2 font-medium">
                              {selectedZoneOutcome.latestQualityResult.qualityScore ?? 'n/d'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Brix:</span>
                            <span className="ml-2 font-medium">
                              {selectedZoneOutcome.latestQualityResult.brix ?? 'n/d'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Difetti:</span>
                            <span className="ml-2 font-medium">
                              {selectedZoneOutcome.latestQualityResult.defectIncidencePercentage ?? 'n/d'}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Resa commerciabile:</span>
                            <span className="ml-2 font-medium">
                              {selectedZoneOutcome.latestQualityResult.marketableYieldKg ?? 'n/d'} kg
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Coltura:</span>
                            <span className="ml-2 font-medium">
                              {selectedZoneEfficacy?.cropContextId || 'n/d'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Stagione:</span>
                            <span className="ml-2 font-medium">
                              {selectedZoneEfficacy?.seasonLabel || 'n/d'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Fungino:</span>
                            <span className="ml-2 font-medium">
                              {selectedZoneEfficacy?.fungalPressure || 'n/d'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Idrico:</span>
                            <span className="ml-2 font-medium">
                              {selectedZoneEfficacy?.waterStress || 'n/d'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Termico:</span>
                            <span className="ml-2 font-medium">
                              {selectedZoneEfficacy?.heatStress || 'n/d'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Risposta suolo:</span>
                            <span className="ml-2 font-medium">
                              {selectedZoneEfficacy?.soilResponseStatus || 'n/d'}
                            </span>
                          </div>
                        </div>
                      )}

                      {selectedZonePriority && (
                        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4">
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-rose-900">Priorita operativa per questa zona</p>
                              <p className="text-xs text-rose-700">
                                Score {selectedZonePriority.priorityScore} • Efficacia {selectedZonePriority.efficacyScore}% • {selectedZonePriority.rationale}
                              </p>
                            </div>
                            <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${getPriorityClasses(selectedZonePriority.urgency)}`}>
                              {selectedZonePriority.urgency === 'immediate' ? 'intervento immediato' : selectedZonePriority.urgency === 'next_cycle' ? 'prossimo ciclo' : 'monitoraggio'}
                            </span>
                          </div>
                          <p className="mt-3 text-sm text-gray-700">{selectedZonePriority.recommendedAction}</p>
                          {selectedZonePriority.drivers.length > 0 && (
                            <p className="mt-2 text-xs text-rose-700">
                              Driver: {selectedZonePriority.drivers.join(' • ')}
                            </p>
                          )}
                        </div>
                      )}

                      {selectedZoneRecommendations.length > 0 && (
                        <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50 p-4">
                          <p className="text-sm font-semibold text-teal-900">Suggerimenti automatici per questa zona</p>
                          <div className="mt-3 space-y-2">
                            {selectedZoneRecommendations.slice(0, 3).map((recommendation) => (
                              <div key={recommendation.id} className="rounded-lg border border-white/80 bg-white/80 p-3 text-sm">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="font-medium text-gray-900">{recommendation.title}</p>
                                  <span className="rounded-full bg-teal-100 px-2 py-1 text-[11px] font-semibold text-teal-800">
                                    {recommendation.severity}
                                  </span>
                                </div>
                                <p className="mt-1 text-gray-700">{recommendation.message}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'analysis' && (
                  <div className="space-y-6">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Analisi in corso...</p>
                      </div>
                    ) : zoneAnalysis ? (
                      <>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-3">Raccomandazioni</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-green-700">Campi rilevati:</span>
                              <span className="font-bold text-green-800">{zoneAnalysis.statistics.fieldCount}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-green-700">Filari rilevati:</span>
                              <span className="font-bold text-green-800">{zoneAnalysis.statistics.rowCount}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <RecommendationCard
                            title="Ottimizzazione"
                            items={zoneAnalysis.recommendations.optimizationSuggestions}
                            accent="green"
                          />
                          <RecommendationCard
                            title="Irrigazione"
                            items={zoneAnalysis.recommendations.irrigationRecommendations}
                            accent="blue"
                          />
                          <RecommendationCard
                            title="Impianto"
                            items={zoneAnalysis.recommendations.plantingRecommendations}
                            accent="purple"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-600">Seleziona una zona per vedere l'analisi</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'optimization' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-3">Ottimizzazione Zone</h4>
                      <p className="text-sm text-blue-700 mb-4">
                        L'ottimizzazione può ridurre il numero di zone mantenendo la precisione dell'applicazione.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-blue-700">Zone attuali:</span>
                          <span className="ml-2 font-bold text-blue-800">{zones.length}</span>
                        </div>
                        <div>
                          <span className="text-blue-700">Area media zona:</span>
                          <span className="ml-2 font-bold text-blue-800">
                            {(prescriptionMap.totalAreaSqm / zones.length / 10000).toFixed(2)} ha
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleOptimizeZones}
                        disabled={loading}
                        className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Ottimizzazione...' : 'Avvia Ottimizzazione'}
                      </button>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Azioni Zone</h4>
                      <div className="space-y-3 text-sm text-gray-700">
                        <div className="flex items-start gap-3">
                          <Merge size={16} className="text-gray-500 mt-0.5" />
                          <span>Accorpa zone molto piccole o con prescrizioni quasi identiche prima dell'esportazione.</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <Split size={16} className="text-gray-500 mt-0.5" />
                          <span>Suddividi le zone molto estese o a bassa qualita dati dopo un nuovo rilievo NDVI o da campo.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Layers className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Seleziona una zona
                  </h3>
                  <p className="text-gray-600">
                    Clicca su una zona nella lista per vedere i dettagli
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const RecommendationCard: React.FC<{
  title: string;
  items: string[];
  accent: 'green' | 'blue' | 'purple';
}> = ({ title, items, accent }) => {
  const accentClasses = {
    green: 'bg-green-50 text-green-900',
    blue: 'bg-blue-50 text-blue-900',
    purple: 'bg-purple-50 text-purple-900'
  };

  return (
    <div className={`${accentClasses[accent]} p-4 rounded-lg`}>
      <h4 className="font-medium mb-3">{title}</h4>
      {items.length > 0 ? (
        <ul className="space-y-2 text-sm">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm opacity-75">Nessuna raccomandazione specifica.</p>
      )}
    </div>
  );
};

export default ZoneManagementPanel;
