import React from 'react';
import { PlantMasterSheet } from '../types';
import { checkPHCompatibility, PHAdvice } from '../logic/soilPHEngine';
import { FlaskConical, AlertTriangle, CheckCircle, XCircle, Lightbulb } from 'lucide-react';

interface PHCompatibilityCheckerProps {
  plant: PlantMasterSheet;
  soilPH: number;
  onSelectAlternative?: (plant: PlantMasterSheet) => void;
}

const PHCompatibilityChecker: React.FC<PHCompatibilityCheckerProps> = ({
  plant,
  soilPH,
  onSelectAlternative,
}) => {
  const advice = checkPHCompatibility(plant, soilPH);

  const getSeverityStyles = () => {
    switch (advice.severity) {
      case 'OPTIMAL':
        return {
          bg: 'bg-green-50',
          border: 'border-green-400',
          text: 'text-green-800',
          icon: <CheckCircle size={20} className="text-green-600" />,
        };
      case 'ACCEPTABLE':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-400',
          text: 'text-blue-800',
          icon: <FlaskConical size={20} className="text-blue-600" />,
        };
      case 'WARNING':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-400',
          text: 'text-orange-800',
          icon: <AlertTriangle size={20} className="text-orange-600" />,
        };
      case 'CRITICAL':
        return {
          bg: 'bg-red-50',
          border: 'border-red-400',
          text: 'text-red-800',
          icon: <XCircle size={20} className="text-red-600" />,
        };
    }
  };

  const styles = getSeverityStyles();
  const phReq = advice.alternatives ? checkPHCompatibility(plant, soilPH) : null;

  return (
    <div className={`${styles.bg} ${styles.border} border-l-4 rounded-lg p-4 mb-4`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {styles.icon}
        </div>
        <div className="flex-1">
          <h4 className={`font-bold text-lg mb-2 flex items-center gap-2 ${styles.text}`}>
            <FlaskConical size={18} />
            Compatibilità pH
          </h4>

          {/* Scala pH visiva */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">pH Terreno: <span className="font-bold text-gray-800">{soilPH.toFixed(1)}</span></span>
              <span className="text-xs text-gray-600">Pianta: <span className="font-bold text-gray-800">{plant.commonName}</span></span>
            </div>
            <div className="relative h-4 bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 to-blue-400 rounded-full">
              <div
                className="absolute top-0 bottom-0 w-1 bg-black rounded-full"
                style={{ left: `${((soilPH - 0) / 14) * 100}%` }}
                title={`pH ${soilPH.toFixed(1)}`}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 mt-1">
              <span>0</span>
              <span>7 (neutro)</span>
              <span>14</span>
            </div>
          </div>

          {/* Messaggio */}
          <div className={`${styles.bg} rounded-lg p-3 mb-3`}>
            <p className={`text-sm ${styles.text} whitespace-pre-line`}>
              {advice.message}
            </p>
          </div>

          {/* Suggerimento */}
          {advice.suggestion && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
              <div className="flex items-start gap-2">
                <Lightbulb size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">💡 Suggerimento:</span> {advice.suggestion}
                </p>
              </div>
            </div>
          )}

          {/* Alternative */}
          {advice.alternatives && advice.alternatives.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm font-semibold text-gray-800 mb-2">
                Piante alternative compatibili con pH {soilPH.toFixed(1)}:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {advice.alternatives.slice(0, 6).map((alt) => (
                  <button
                    key={alt.id}
                    onClick={() => onSelectAlternative?.(alt)}
                    className="text-left px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors text-sm"
                  >
                    <p className="font-medium text-gray-800">{alt.commonName}</p>
                    <p className="text-xs text-gray-600">{alt.family}</p>
                  </button>
                ))}
              </div>
              {advice.alternatives.length > 6 && (
                <p className="text-xs text-gray-500 mt-2">
                  + {advice.alternatives.length - 6} altre piante compatibili
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PHCompatibilityChecker;

