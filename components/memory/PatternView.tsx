/**
 * Pattern View Component
 * Visualizza pattern riconosciuti con confidence e predizioni
 */

import React, { useState, useEffect } from 'react';
import { LocalPattern } from '../../types/memory';
import { analyzeHistoricalData } from '../../logic/patternRecognitionEngine';
import { Garden } from '../../types';
import { CheckCircle, XCircle, AlertTriangle, Calendar, TrendingUp } from 'lucide-react';

interface PatternViewProps {
  garden: Garden;
  years?: number; // Anni di storia da analizzare
}

const PatternView: React.FC<PatternViewProps> = ({ garden, years = 3 }) => {
  const [patterns, setPatterns] = useState<LocalPattern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatterns();
  }, [garden.id, years]);

  const loadPatterns = async () => {
    setLoading(true);
    try {
      const detectedPatterns = await analyzeHistoricalData(garden, years);
      setPatterns(detectedPatterns);
    } catch (error) {
      console.error('Error loading patterns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPattern = (patternId: string) => {
    setPatterns((prev) =>
      prev.map((p) =>
        p.id === patternId ? { ...p, userConfirmed: true, status: 'confirmed' as const } : p
      )
    );
    // TODO: Salvare conferma in database
  };

  const handleRejectPattern = (patternId: string) => {
    setPatterns((prev) =>
      prev.map((p) =>
        p.id === patternId ? { ...p, userConfirmed: false, status: 'rejected' as const } : p
      )
    );
    // TODO: Salvare rifiuto in database
  };

  const getPatternIcon = (patternType: LocalPattern['patternType']) => {
    switch (patternType) {
      case 'weather':
        return <AlertTriangle size={20} className="text-blue-600" />;
      case 'disease':
        return <AlertTriangle size={20} className="text-red-600" />;
      case 'yield':
        return <TrendingUp size={20} className="text-green-600" />;
      case 'timing':
        return <Calendar size={20} className="text-purple-600" />;
      default:
        return <AlertTriangle size={20} />;
    }
  };

  const getPatternColor = (patternType: LocalPattern['patternType']) => {
    switch (patternType) {
      case 'weather':
        return 'bg-blue-50 border-blue-200';
      case 'disease':
        return 'bg-red-50 border-red-200';
      case 'yield':
        return 'bg-green-50 border-green-200';
      case 'timing':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
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

  if (patterns.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <TrendingUp size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Nessun pattern riconosciuto
        </h3>
        <p className="text-gray-600">
          Con più dati storici, il sistema riconoscerà automaticamente pattern locali
          (gelate tardive, malattie ricorrenti, date migliori per piantagioni).
        </p>
      </div>
    );
  }

  // Filtra pattern attivi
  const activePatterns = patterns.filter((p) => p.status !== 'rejected' && p.status !== 'expired');

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp size={24} />
          Pattern Locali Riconosciuti
        </h2>
        <span className="text-sm text-gray-600">
          {activePatterns.length} pattern attivi
        </span>
      </div>

      <div className="space-y-4">
        {activePatterns.map((pattern) => (
          <div
            key={pattern.id || pattern.patternName}
            className={`border rounded-lg p-4 ${getPatternColor(pattern.patternType)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                {getPatternIcon(pattern.patternType)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800">
                      {pattern.patternDescription || pattern.patternName}
                    </h3>
                    <span className="text-xs px-2 py-1 bg-white rounded-full border">
                      {pattern.patternType}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Osservato {pattern.patternData.occurrences} volte
                  </p>
                </div>
              </div>

              {/* Confidence Bar */}
              <div className="text-right">
                <div className="text-sm font-medium text-gray-700">
                  {Math.round(pattern.patternData.confidence * 100)}%
                </div>
                <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                  <div
                    className={`h-full rounded-full ${
                      pattern.patternData.confidence >= 0.7
                        ? 'bg-green-500'
                        : pattern.patternData.confidence >= 0.5
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${pattern.patternData.confidence * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Prediction */}
            {pattern.prediction && (
              <div className="bg-white rounded p-3 mb-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={16} className="text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Predizione</span>
                </div>
                <p className="text-sm text-gray-600">
                  Prossima occorrenza prevista:{' '}
                  <span className="font-medium">
                    {pattern.prediction.nextLikelyDate?.toLocaleDateString('it-IT')}
                  </span>{' '}
                  (probabilità: {Math.round(pattern.prediction.probability * 100)}%)
                </p>
              </div>
            )}

            {/* Affected Zones */}
            {pattern.affectedZones && pattern.affectedZones.length > 0 && (
              <div className="text-xs text-gray-600 mb-3">
                Zone interessate: {pattern.affectedZones.join(', ')}
              </div>
            )}

            {/* Actions */}
            {!pattern.userConfirmed && (
              <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                <button
                  onClick={() => handleConfirmPattern(pattern.id || pattern.patternName)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                >
                  <CheckCircle size={16} />
                  Conferma Pattern
                </button>
                <button
                  onClick={() => handleRejectPattern(pattern.id || pattern.patternName)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                >
                  <XCircle size={16} />
                  Rifiuta
                </button>
              </div>
            )}

            {pattern.userConfirmed && (
              <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-sm text-green-700 font-medium">Pattern confermato</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatternView;

