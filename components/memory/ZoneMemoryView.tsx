/**
 * Zone Memory View Component
 * Visualizza memoria contestuale completa di una zona/aiuola
 */

import React, { useState, useEffect } from 'react';
import { ZoneMemory } from '../../types/memory';
import { getZoneMemory } from '../../services/gardenMemoryService';
import { Calendar, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import { useStorage } from '@/packages/core/hooks/useStorage';
import {
  buildAgronomicQualityLearningAdjustment,
  getAgronomicProfileLearningSnapshots,
  type AgronomicQualityLearningAdjustment,
} from '@/services/agronomicProfileLearningService';

interface ZoneMemoryViewProps {
  zoneId: string;
  gardenId: string;
  zoneName?: string;
}

const ZoneMemoryView: React.FC<ZoneMemoryViewProps> = ({
  zoneId,
  gardenId,
  zoneName,
}) => {
  const { storageProvider } = useStorage();
  const [memory, setMemory] = useState<ZoneMemory | null>(null);
  const [loading, setLoading] = useState(true);
  const [qualityAdjustment, setQualityAdjustment] = useState<AgronomicQualityLearningAdjustment | null>(null);

  useEffect(() => {
    loadMemory();
  }, [zoneId, gardenId]);

  useEffect(() => {
    const loadQualityAdjustment = async () => {
      if (!storageProvider?.getUserPreference) {
        setQualityAdjustment(buildAgronomicQualityLearningAdjustment([], { zoneId }));
        return;
      }

      try {
        const snapshots = await getAgronomicProfileLearningSnapshots(storageProvider, gardenId);
        setQualityAdjustment(buildAgronomicQualityLearningAdjustment(snapshots, { zoneId }));
      } catch (error) {
        console.error('Error loading zone adaptive quality benchmark:', error);
        setQualityAdjustment(buildAgronomicQualityLearningAdjustment([], { zoneId }));
      }
    };

    void loadQualityAdjustment();
  }, [gardenId, storageProvider, zoneId]);

  const loadMemory = async () => {
    setLoading(true);
    try {
      const mem = await getZoneMemory(zoneId, gardenId);
      setMemory(mem);
    } catch (error) {
      console.error('Error loading zone memory:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!memory || memory.plantingHistory.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <BarChart3 size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Nessuna memoria disponibile
        </h3>
        <p className="text-gray-600">
          Questa zona non ha ancora una storia registrata. Le piantagioni future verranno tracciate automaticamente.
        </p>
      </div>
    );
  }

  // Calcola statistiche
  const totalPlantings = memory.plantingHistory.length;
  const avgYield = memory.plantingHistory.reduce((sum, r) => sum + r.result.yield, 0) / totalPlantings;
  const avgQuality = memory.plantingHistory.reduce((sum, r) => sum + r.result.quality, 0) / totalPlantings;
  const totalProblems = memory.plantingHistory.reduce((sum, r) => sum + r.result.problems.length, 0);
  const qualityTargetRating = qualityAdjustment?.qualityTargetRating ?? 4;
  const qualityAlertFloorRating = qualityAdjustment?.qualityAlertFloorRating ?? 3;
  const qualityGap = Number((avgQuality - qualityTargetRating).toFixed(1));
  const qualityStatus = avgQuality >= qualityTargetRating
    ? 'above_target'
    : avgQuality < qualityAlertFloorRating
      ? 'below_target'
      : 'watch';
  const qualityStatusCopy = qualityStatus === 'above_target'
    ? {
        badge: 'Sopra benchmark',
        badgeClassName: 'bg-green-100 text-green-700',
      }
    : qualityStatus === 'watch'
      ? {
          badge: 'Zona da osservare',
          badgeClassName: 'bg-yellow-100 text-yellow-800',
        }
      : {
          badge: 'Sotto soglia sito',
          badgeClassName: 'bg-red-100 text-red-700',
        };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-3">
          <BarChart3 size={24} />
          Memoria Zona: {zoneName || zoneId}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {totalPlantings} piantagioni registrate
        </p>
      </div>

      {/* Statistiche Generali */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-sm text-blue-600 font-medium">Resa Media</div>
          <div className="text-xl md:text-2xl font-bold text-blue-800">{avgYield.toFixed(2)} kg/m²</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-sm text-green-600 font-medium">Qualità Media</div>
          <div className="text-xl md:text-2xl font-bold text-green-800">{avgQuality.toFixed(1)}/5</div>
          <div className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-medium ${qualityStatusCopy.badgeClassName}`}>
            {qualityStatusCopy.badge}
          </div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="text-sm text-orange-600 font-medium">Problemi Totali</div>
          <div className="text-xl md:text-2xl font-bold text-orange-800">{totalProblems}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
          <div className="text-sm text-emerald-700 font-medium">Target sito</div>
          <div className="text-xl md:text-2xl font-bold text-emerald-800">{qualityTargetRating.toFixed(1)}/5</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <div className="text-sm text-amber-700 font-medium">Soglia allerta</div>
          <div className="text-xl md:text-2xl font-bold text-amber-800">{qualityAlertFloorRating.toFixed(1)}/5</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="text-sm text-slate-600 font-medium">Gap medio</div>
          <div className={`text-xl md:text-2xl font-bold ${qualityGap >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {qualityGap >= 0 ? '+' : ''}{qualityGap.toFixed(1)}
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="text-sm text-purple-700 font-medium">Target Brix</div>
          <div className="text-xl md:text-2xl font-bold text-purple-800">
            {qualityAdjustment?.brixTarget ? `${qualityAdjustment.brixTarget}°` : 'n/d'}
          </div>
        </div>
      </div>

      {qualityAdjustment?.notes?.length ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="text-sm font-medium text-gray-800 mb-2">Memoria sito-specifica</div>
          <div className="space-y-1">
            {qualityAdjustment.notes.map((note, idx) => (
              <p key={idx} className="text-sm text-gray-600">{note}</p>
            ))}
          </div>
        </div>
      ) : null}

      {/* Pattern Riconosciuti */}
      {memory.patterns && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-3">
            <TrendingUp size={20} />
            Pattern Riconosciuti
          </h3>

          {memory.patterns.bestPlantingDate && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle size={18} className="text-green-600" />
                <span className="font-medium text-green-800">Data Migliore Storica</span>
              </div>
              <p className="text-sm text-green-700">
                {memory.patterns.bestPlantingDate.toLocaleDateString('it-IT', {
                  month: 'long',
                  day: 'numeric',
                })}{' '}
                - Media delle date con migliori risultati
              </p>
            </div>
          )}

          {memory.patterns.worstPlantingDate && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle size={18} className="text-red-600" />
                <span className="font-medium text-red-800">Data Peggiore Storica</span>
              </div>
              <p className="text-sm text-red-700">
                {memory.patterns.worstPlantingDate.toLocaleDateString('it-IT', {
                  month: 'long',
                  day: 'numeric',
                })}{' '}
                - Media delle date con peggiori risultati
              </p>
            </div>
          )}

          {memory.patterns.recurringProblems.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-full max-w-sm rounded-lg p-4">
              <div className="font-medium text-yellow-full max-w-sm mb-2">Problemi Ricorrenti</div>
              <ul className="space-y-1">
                {memory.patterns.recurringProblems.map((p, idx) => (
                  <li key={idx} className="text-sm text-yellow-full max-w-sm">
                    • {p.problem} - {p.frequency} volte (mesi: {p.months.join(', ')})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {memory.patterns.successfulTreatments.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="font-medium text-blue-800 mb-2">Trattamenti Efficaci</div>
              <ul className="space-y-1">
                {memory.patterns.successfulTreatments.map((t, idx) => (
                  <li key={idx} className="text-sm text-blue-700">
                    • {t.problem}: {t.treatment} ({Math.round(t.successRate * 100)}% successo)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Storia Piantagioni */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-3">
          <Calendar size={20} />
          Storia Piantagioni
        </h3>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {memory.plantingHistory
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .map((record, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-800">
                      {record.plant} {record.variety && `(${record.variety})`}
                    </div>
                    <div className="text-sm text-gray-600">
                      {record.date.toLocaleDateString('it-IT')} - {record.year}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800">{record.result.yield} kg/m²</div>
                    <div className={`text-sm ${
                      record.result.quality >= qualityTargetRating
                        ? 'text-green-700'
                        : record.result.quality < qualityAlertFloorRating
                          ? 'text-red-700'
                          : 'text-yellow-700'
                    }`}>
                      Qualità: {record.result.quality}/5
                    </div>
                  </div>
                </div>

                {record.result.problems.length > 0 && (
                  <div className="mt-2 text-sm">
                    <span className="text-red-600 font-medium">Problemi: </span>
                    <span className="text-gray-700">{record.result.problems.join(', ')}</span>
                  </div>
                )}

                {record.result.treatments.length > 0 && (
                  <div className="mt-2 text-sm">
                    <span className="text-blue-600 font-medium">Trattamenti: </span>
                    <span className="text-gray-700">
                      {record.result.treatments
                        .map((t) => `${t.product} (${t.effective ? 'efficace' : 'inefficace'})`)
                        .join(', ')}
                    </span>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Correlazioni */}
      {memory.correlations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Correlazioni Scoperte</h3>
          <div className="space-y-2">
            {memory.correlations.map((corr, idx) => (
              <div
                key={idx}
                className={`border rounded-lg p-3 ${
                  corr.impactType === 'positive'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {corr.impactType === 'positive' ? (
                    <TrendingUp size={16} className="text-green-600" />
                  ) : (
                    <TrendingDown size={16} className="text-red-600" />
                  )}
                  <span className="font-medium">
                    {corr.factorDescription || corr.factorType}
                  </span>
                  <span className="text-sm opacity-75">
                    (Forza: {Math.round(corr.strength * 100)}%, {corr.examplesCount} esempi)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoneMemoryView;
