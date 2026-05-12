'use client';

/**
 * Field Row Crop History Panel
 * Visualizza lo storico delle colture e suggerimenti di rotazione
 */

import React, { useState, useEffect } from 'react';
import { 
  fieldRowCropHistoryService,
  CropHistoryEntry,
  RotationSuggestion 
} from '@/services/fieldRowCropHistoryService';

interface FieldRowCropHistoryPanelProps {
  rowId: string;
  rowName: string;
  zoneId?: string;
}

export default function FieldRowCropHistoryPanel({
  rowId,
  rowName,
  zoneId
}: FieldRowCropHistoryPanelProps) {
  const [history, setHistory] = useState<CropHistoryEntry[]>([]);
  const [suggestions, setSuggestions] = useState<RotationSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'suggestions'>('history');

  useEffect(() => {
    loadData();
  }, [rowId, zoneId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [historyData, suggestionsData] = await Promise.all([
        fieldRowCropHistoryService.getFieldRowHistory(rowId),
        fieldRowCropHistoryService.getRotationSuggestions(rowId)
      ]);
      
      setHistory(historyData);
      setSuggestions(suggestionsData);
    } catch (error) {
      console.error('Error loading crop history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getRotationScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRotationScoreLabel = (score?: number) => {
    if (!score) return 'N/D';
    if (score >= 80) return 'Ottimo';
    if (score >= 50) return 'Accettabile';
    return 'Sconsigliato';
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Caricamento storico...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          📊 Storico Colture - {rowName}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Tracciamento completo e suggerimenti di rotazione
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          📜 Storico ({history.length})
        </button>
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'suggestions'
              ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          💡 Suggerimenti ({suggestions.length})
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'history' ? (
          <HistoryTab history={history} />
        ) : (
          <SuggestionsTab suggestions={suggestions} />
        )}
      </div>
    </div>
  );
}

// ============================================
// HISTORY TAB
// ============================================

function HistoryTab({ history }: { history: CropHistoryEntry[] }) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">🌱</div>
        <p className="text-gray-600">Nessuna coltura registrata</p>
        <p className="text-sm text-gray-500 mt-1">
          Lo storico verrà popolato automaticamente quando trapianti
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((entry, index) => (
        <CropHistoryCard key={entry.id} entry={entry} isLatest={index === 0} />
      ))}
    </div>
  );
}

function CropHistoryCard({ 
  entry, 
  isLatest 
}: { 
  entry: CropHistoryEntry; 
  isLatest: boolean;
}) {
  const [expanded, setExpanded] = useState(isLatest);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getRotationScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-600';
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 50) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getQualityStars = (rating?: number) => {
    if (!rating) return '⭐️'.repeat(0);
    return '⭐️'.repeat(rating);
  };

  return (
    <div className={`border rounded-lg overflow-hidden ${
      isLatest ? 'border-green-500 shadow-md' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div 
        className={`p-4 cursor-pointer ${
          isLatest ? 'bg-green-50' : 'bg-gray-50'
        } hover:bg-opacity-80 transition-colors`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">
                {entry.crop_name}
              </h4>
              {entry.crop_variety && (
                <span className="text-sm text-gray-600">
                  ({entry.crop_variety})
                </span>
              )}
              {isLatest && (
                <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                  Attuale
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span>🌿 {entry.crop_family}</span>
              <span>📅 {formatDate(entry.planting_date)}</span>
              {entry.harvest_date && (
                <span>✅ {formatDate(entry.harvest_date)}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {entry.rotation_score !== undefined && (
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                getRotationScoreColor(entry.rotation_score)
              }`}>
                Rotazione: {entry.rotation_score}
              </div>
            )}
            <span className="text-gray-400">
              {expanded ? '▼' : '▶'}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-4 space-y-4 bg-white">
          {/* Performance */}
          {(entry.yield_kg || entry.quality_rating) && (
            <div className="grid grid-cols-2 gap-4">
              {entry.yield_kg && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-xs text-blue-600 font-medium">Raccolto</div>
                  <div className="text-lg font-bold text-blue-900">
                    {entry.yield_kg} kg
                  </div>
                </div>
              )}
              {entry.quality_rating && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="text-xs text-yellow-600 font-medium">Qualità</div>
                  <div className="text-lg">
                    {getQualityStars(entry.quality_rating)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Planting Context */}
          {entry.planting_context && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs font-medium text-gray-700 mb-2">
                📍 Contesto di Impianto
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {entry.planting_context.weather && (
                  <>
                    <div>
                      🌡️ {entry.planting_context.weather.temp}°C
                    </div>
                    <div>
                      💧 {entry.planting_context.weather.humidity}%
                    </div>
                  </>
                )}
                {entry.planting_context.moon && (
                  <div className="col-span-2">
                    {entry.planting_context.moon.emoji} {entry.planting_context.moon.phase}
                  </div>
                )}
                {entry.planting_context.season && (
                  <div>
                    🍂 {entry.planting_context.season}
                  </div>
                )}
                {entry.planting_context.daylight && (
                  <div>
                    ☀️ {entry.planting_context.daylight.hours.toFixed(1)}h luce
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Days to Harvest */}
          {entry.days_to_harvest && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>⏱️</span>
              <span>{entry.days_to_harvest} giorni al raccolto</span>
            </div>
          )}

          {/* Success Factors */}
          {entry.success_factors && entry.success_factors.length > 0 && (
            <div>
              <div className="text-xs font-medium text-green-700 mb-1">
                ✅ Fattori di Successo
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                {entry.success_factors.map((factor, i) => (
                  <li key={i}>• {factor}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Problems */}
          {entry.problems && entry.problems.length > 0 && (
            <div>
              <div className="text-xs font-medium text-red-700 mb-1">
                ⚠️ Problemi Riscontrati
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                {entry.problems.map((problem, i) => (
                  <li key={i}>• {problem}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Notes */}
          {entry.notes && (
            <div className="text-sm text-gray-700 bg-yellow-50 p-3 rounded">
              <span className="font-medium">📝 Note:</span> {entry.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// SUGGESTIONS TAB
// ============================================

function SuggestionsTab({ suggestions }: { suggestions: RotationSuggestion[] }) {
  if (suggestions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">💡</div>
        <p className="text-gray-600">Nessun suggerimento disponibile</p>
        <p className="text-sm text-gray-500 mt-1">
          Inizia a coltivare per ricevere suggerimenti personalizzati
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🔄</span>
          <div>
            <h4 className="font-semibold text-blue-900">Rotazione delle Colture</h4>
            <p className="text-sm text-blue-700 mt-1">
              La rotazione previene l'impoverimento del suolo e riduce malattie e parassiti.
              Segui questi suggerimenti per ottimizzare la produzione.
            </p>
          </div>
        </div>
      </div>

      {suggestions.map((suggestion, index) => (
        <SuggestionCard 
          key={index} 
          suggestion={suggestion} 
          rank={index + 1}
        />
      ))}

      {/* Rotation Guide */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">
          📚 Guida alla Rotazione Classica
        </h4>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <span className="font-medium">1️⃣ Leguminose</span>
            <span className="text-gray-500">→</span>
            <span className="text-gray-600">Arricchiscono il terreno di azoto</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">2️⃣ Crucifere</span>
            <span className="text-gray-500">→</span>
            <span className="text-gray-600">Sfruttano l'azoto disponibile</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">3️⃣ Cucurbitacee</span>
            <span className="text-gray-500">→</span>
            <span className="text-gray-600">Beneficiano del terreno fertile</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">4️⃣ Solanacee</span>
            <span className="text-gray-500">→</span>
            <span className="text-gray-600">Completano il ciclo</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuggestionCard({ 
  suggestion, 
  rank 
}: { 
  suggestion: RotationSuggestion; 
  rank: number;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 border-green-300 text-green-800';
    if (score >= 80) return 'bg-blue-100 border-blue-300 text-blue-800';
    return 'bg-yellow-100 border-yellow-300 text-yellow-800';
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}️⃣`;
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${getScoreColor(suggestion.score)}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{getMedalEmoji(rank)}</span>
            <h4 className="font-semibold text-lg">
              {suggestion.family}
            </h4>
          </div>
          <p className="text-sm opacity-90">
            {suggestion.reason}
          </p>
        </div>
        <div className="ml-4 text-center">
          <div className="text-2xl font-bold">
            {suggestion.score}
          </div>
          <div className="text-xs opacity-75">
            punteggio
          </div>
        </div>
      </div>
    </div>
  );
}
