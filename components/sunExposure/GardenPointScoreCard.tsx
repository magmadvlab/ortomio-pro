/**
 * Garden Point Score Card Component
 * Visualizza score per categoria coltura per un punto dell'orto
 */

import React from 'react';
import { GardenPointScore } from '../../services/gardenPointScorer';
import { Sun, Leaf, Sprout, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface GardenPointScoreCardProps {
  score: GardenPointScore;
  showDetails?: boolean;
}

const GardenPointScoreCard: React.FC<GardenPointScoreCardProps> = ({
  score,
  showDetails = true,
}) => {
  const getScoreColor = (scoreValue: number): string => {
    if (scoreValue >= 80) return 'text-green-700 bg-green-50 border-green-200';
    if (scoreValue >= 50) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const getScoreIcon = (scoreValue: number) => {
    if (scoreValue >= 80) return <CheckCircle size={16} className="text-green-600" />;
    if (scoreValue >= 50) return <AlertTriangle size={16} className="text-yellow-600" />;
    return <XCircle size={16} className="text-red-600" />;
  };

  const ScoreBar: React.FC<{ label: string; value: number; icon: React.ReactNode }> = ({
    label,
    value,
    icon,
  }) => {
    const percentage = Math.min(100, Math.max(0, value));
    const colorClass = getScoreColor(value);

    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </div>
          <span className={`text-sm font-bold ${colorClass.split(' ')[0]}`}>
            {percentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              percentage >= 80
                ? 'bg-green-500'
                : percentage >= 50
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">{score.pointName}</h3>
        {getScoreIcon(
          Math.max(
            score.scores.ortoEstivo,
            score.scores.fogliaPrimavera,
            score.scores.fogliaEstate,
            score.scores.aromatiche
          )
        )}
      </div>

      {/* Score Bars */}
      <div className="space-y-3">
        <ScoreBar
          label="🍅 Orto estivo"
          value={score.scores.ortoEstivo}
          icon={<Sun size={16} className="text-yellow-500" />}
        />
        <ScoreBar
          label="🥬 Foglia primavera"
          value={score.scores.fogliaPrimavera}
          icon={<Leaf size={16} className="text-green-500" />}
        />
        <ScoreBar
          label="🌿 Foglia estate"
          value={score.scores.fogliaEstate}
          icon={<Sprout size={16} className="text-blue-500" />}
        />
        <ScoreBar
          label="🌿 Aromatiche"
          value={score.scores.aromatiche}
          icon={<Sprout size={16} className="text-purple-500" />}
        />
      </div>

      {/* Recommendations */}
      {showDetails && score.recommendations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">Raccomandazioni</h4>
          {score.recommendations.map((rec, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border ${getScoreColor(rec.score)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium">{rec.category}</div>
                  <div className="text-xs mt-1">{rec.message}</div>
                  <div className="text-xs mt-1 opacity-75">
                    Cicli: {rec.cycles} | Resa: {rec.resaStimata} kg/m²
                  </div>
                </div>
                <div className="text-lg font-bold ml-2">{rec.score}%</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GardenPointScoreCard;

