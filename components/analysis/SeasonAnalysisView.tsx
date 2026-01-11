/**
 * Season Analysis View Component
 * Visualizza analisi completa di una stagione con successi, fallimenti, insights e raccomandazioni
 */

import React, { useState, useEffect } from 'react';
import { Garden } from '../../types';
import { SeasonAnalysis } from '../../types/memory';
import { analyzeSeason } from '../../logic/seasonAnalysisEngine';
import {
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Calendar,
  BarChart3,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

interface SeasonAnalysisViewProps {
  garden: Garden;
  year: number;
  season: 'Summer' | 'Winter';
  onAdjustmentsAccepted?: (adjustments: SeasonAnalysis['nextYearAdjustments']) => void;
}

const SeasonAnalysisView: React.FC<SeasonAnalysisViewProps> = ({
  garden,
  year,
  season,
  onAdjustmentsAccepted,
}) => {
  const [analysis, setAnalysis] = useState<SeasonAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'successes' | 'failures' | 'insights' | 'adjustments'>('overview');

  useEffect(() => {
    loadAnalysis();
  }, [garden.id, year, season]);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const result = await analyzeSeason(garden, year, season);
      setAnalysis(result);
    } catch (error) {
      console.error('Error loading season analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAdjustments = () => {
    if (analysis && onAdjustmentsAccepted) {
      onAdjustmentsAccepted(analysis.nextYearAdjustments);
      setAnalysis({ ...analysis, userReviewed: true });
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

  if (!analysis) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <BarChart3 size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Analisi non disponibile
        </h3>
        <p className="text-gray-600 mb-4">
          Non ci sono dati sufficienti per analizzare questa stagione.
        </p>
        <button
          onClick={loadAnalysis}
          className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw size={16} />
          Riprova
        </button>
      </div>
    );
  }

  const seasonLabel = season === 'Summer' ? 'Estate' : 'Inverno';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-3">
            <BarChart3 size={24} />
            Analisi Stagione {seasonLabel} {year}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Analizzata il {analysis.analyzedAt?.toLocaleDateString('it-IT')}
          </p>
        </div>
        {!analysis.userReviewed && (
          <button
            onClick={handleAcceptAdjustments}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            Accetta Aggiustamenti
          </button>
        )}
      </div>

      {/* Statistiche Generali */}
      {analysis.statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-sm text-blue-600 font-medium">Resa Totale</div>
            <div className="text-xl md:text-2xl font-bold text-blue-800">
              {analysis.statistics.totalYield.toFixed(1)} kg
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-sm text-green-600 font-medium">Qualità Media</div>
            <div className="text-xl md:text-2xl font-bold text-green-800">
              {analysis.statistics.avgQuality.toFixed(1)}/5
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="text-sm text-orange-600 font-medium">Problemi Totali</div>
            <div className="text-xl md:text-2xl font-bold text-orange-800">
              {analysis.statistics.totalProblems}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4">
          {[
            { id: 'overview', label: 'Panoramica' },
            { id: 'successes', label: `Successi (${analysis.successes.length})` },
            { id: 'failures', label: `Criticità (${analysis.failures.length})` },
            { id: 'insights', label: `Insights (${analysis.insights.length})` },
            { id: 'adjustments', label: `Aggiustamenti (${analysis.nextYearAdjustments.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                selectedTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {selectedTab === 'overview' && <OverviewTab analysis={analysis} />}
        {selectedTab === 'successes' && <SuccessesTab successes={analysis.successes} />}
        {selectedTab === 'failures' && <FailuresTab failures={analysis.failures} />}
        {selectedTab === 'insights' && <InsightsTab insights={analysis.insights} />}
        {selectedTab === 'adjustments' && (
          <AdjustmentsTab adjustments={analysis.nextYearAdjustments} />
        )}
      </div>
    </div>
  );
};

// Overview Tab
const OverviewTab: React.FC<{ analysis: SeasonAnalysis }> = ({ analysis }) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle size={20} className="text-green-600" />
            <h3 className="font-semibold text-green-800">Successi</h3>
          </div>
          <p className="text-sm text-green-700">
            {analysis.successes.length} colture hanno mostrato miglioramenti significativi rispetto
            all'anno precedente.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <XCircle size={20} className="text-red-600" />
            <h3 className="font-semibold text-red-800">Criticità</h3>
          </div>
          <p className="text-sm text-red-700">
            {analysis.failures.length} colture hanno mostrato perdite significative. Analizza le
            cause per evitare ripetizioni.
          </p>
        </div>
      </div>

      {/* Top Successes */}
      {analysis.successes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-3">
            <TrendingUp size={20} />
            Migliori Successi
          </h3>
          <div className="space-y-2">
            {analysis.successes
              .sort((a, b) => b.improvement - a.improvement)
              .slice(0, 3)
              .map((success, idx) => (
                <div
                  key={idx}
                  className="bg-green-50 border border-green-200 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-green-800">{success.plant}</span>
                      <span className="text-sm text-green-600 ml-2">({success.zone})</span>
                    </div>
                    <span className="text-lg font-bold text-green-800">
                      +{success.improvement}%
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">{success.likelyCause}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Top Failures */}
      {analysis.failures.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-3">
            <TrendingDown size={20} />
            Criticità Principali
          </h3>
          <div className="space-y-2">
            {analysis.failures
              .sort((a, b) => b.loss - a.loss)
              .slice(0, 3)
              .map((failure, idx) => (
                <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-red-800">{failure.plant}</span>
                      <span className="text-sm text-red-600 ml-2">({failure.zone})</span>
                    </div>
                    <span className="text-lg font-bold text-red-800">-{failure.loss}%</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">{failure.likelyCause}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Successes Tab
const SuccessesTab: React.FC<{ successes: SeasonAnalysis['successes'] }> = ({ successes }) => {
  if (successes.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle size={48} className="text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Nessun successo significativo registrato.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {successes.map((success, idx) => (
        <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="font-semibold text-green-800 text-lg">{success.plant}</div>
              <div className="text-sm text-green-600">Zona: {success.zone}</div>
            </div>
            <div className="text-right">
              <div className="text-xl md:text-2xl font-bold text-green-800">+{success.improvement}%</div>
              <div className="text-xs text-green-600">vs anno precedente</div>
            </div>
          </div>
          <div className="bg-white rounded p-3 mb-2">
            <div className="text-sm font-medium text-gray-700 mb-1">Causa Probabile</div>
            <p className="text-sm text-gray-600">{success.likelyCause}</p>
          </div>
          <div className="bg-white rounded p-3">
            <div className="text-sm font-medium text-gray-700 mb-1">Raccomandazione</div>
            <p className="text-sm text-gray-600">{success.recommendation}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Failures Tab
const FailuresTab: React.FC<{ failures: SeasonAnalysis['failures'] }> = ({ failures }) => {
  if (failures.length === 0) {
    return (
      <div className="text-center py-12">
        <XCircle size={48} className="text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Nessuna criticità significativa registrata.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {failures.map((failure, idx) => (
        <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="font-semibold text-red-800 text-lg">{failure.plant}</div>
              <div className="text-sm text-red-600">Zona: {failure.zone}</div>
            </div>
            <div className="text-right">
              <div className="text-xl md:text-2xl font-bold text-red-800">-{failure.loss}%</div>
              <div className="text-xs text-red-600">vs previsto</div>
            </div>
          </div>
          <div className="bg-white rounded p-3 mb-2">
            <div className="text-sm font-medium text-gray-700 mb-1">Causa Probabile</div>
            <p className="text-sm text-gray-600">{failure.likelyCause}</p>
          </div>
          {failure.correlation.length > 0 && (
            <div className="bg-white rounded p-3 mb-2">
              <div className="text-sm font-medium text-gray-700 mb-1">Correlazioni</div>
              <ul className="space-y-1">
                {failure.correlation.map((corr, corrIdx) => (
                  <li key={corrIdx} className="text-sm text-gray-600">
                    • {corr.factor}: -{corr.impact}%
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="bg-white rounded p-3">
            <div className="text-sm font-medium text-gray-700 mb-1">Raccomandazione</div>
            <p className="text-sm text-gray-600">{failure.recommendation}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Insights Tab
const InsightsTab: React.FC<{ insights: SeasonAnalysis['insights'] }> = ({ insights }) => {
  if (insights.length === 0) {
    return (
      <div className="text-center py-12">
        <Lightbulb size={48} className="text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Nessun insight disponibile.</p>
      </div>
    );
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'correlation':
        return <TrendingUp size={20} className="text-blue-600" />;
      case 'timing':
        return <Calendar size={20} className="text-purple-600" />;
      default:
        return <Lightbulb size={20} className="text-yellow-full max-w-sm" />;
    }
  };

  return (
    <div className="space-y-4">
      {insights.map((insight, idx) => (
        <div key={idx} className="bg-yellow-50 border border-yellow-full max-w-sm rounded-lg p-4">
          <div className="flex items-start gap-3">
            {getInsightIcon(insight.type)}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs px-2 py-1 bg-white rounded-full border border-yellow-full max-w-sm">
                  {insight.type}
                </span>
                <span className="text-xs text-gray-600">
                  Confidence: {Math.round(insight.confidence * 100)}%
                </span>
              </div>
              <p className="text-sm font-medium text-gray-800 mb-2">{insight.finding}</p>
              <div className="bg-white rounded p-3">
                <div className="text-xs font-medium text-gray-700 mb-1">Azione Suggerita</div>
                <p className="text-xs text-gray-600">{insight.action}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Adjustments Tab
const AdjustmentsTab: React.FC<{
  adjustments: SeasonAnalysis['nextYearAdjustments'];
}> = ({ adjustments }) => {
  if (adjustments.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Nessun aggiustamento suggerito.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {adjustments.map((adjustment, idx) => (
        <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-blue-600 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-blue-800 mb-1">
                {adjustment.plant} - Zona {adjustment.zone}
              </div>
              <div className="bg-white rounded p-3 mb-2">
                <div className="text-sm font-medium text-gray-700 mb-1">Cambio Suggerito</div>
                <p className="text-sm text-gray-800">{adjustment.change}</p>
              </div>
              <div className="text-xs text-gray-600">
                <span className="font-medium">Motivo:</span> {adjustment.reason}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SeasonAnalysisView;

