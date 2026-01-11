import React from 'react';
import { NightTempAnalysis } from '../logic/nightTempAnalysis';
import { PlantMasterSheet } from '../types';
import { Moon, Thermometer, AlertTriangle, CheckCircle, Snowflake } from 'lucide-react';

interface NightTempAlertProps {
  analysis: NightTempAnalysis;
  plant: PlantMasterSheet;
  onSetReminder?: () => void;
}

const NightTempAlert: React.FC<NightTempAlertProps> = ({ analysis, plant, onSetReminder }) => {
  const severity = analysis.frostRiskDays > 0 
    ? 'error' 
    : !analysis.safeForTransplant 
    ? 'warning' 
    : 'success';

  const getSeverityStyles = () => {
    switch (severity) {
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-400',
          text: 'text-red-800',
          icon: <AlertTriangle size={20} className="text-red-600" />,
        };
      case 'warning':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-400',
          text: 'text-orange-800',
          icon: <AlertTriangle size={20} className="text-orange-600" />,
        };
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-400',
          text: 'text-green-800',
          icon: <CheckCircle size={20} className="text-green-600" />,
        };
    }
  };

  const styles = getSeverityStyles();
  const plantMinTemp = plant.transplanting?.minTemp || 10;

  return (
    <div className={`${styles.bg} ${styles.border} border-l-4 rounded-lg p-4 mb-4`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {styles.icon}
        </div>
        <div className="flex-1">
          <h4 className={`font-bold text-lg mb-2 flex items-center gap-2 ${styles.text}`}>
            <Moon size={18} />
            Analisi Temperature Notturne
          </h4>

          {/* Statistiche */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="bg-white/50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-3 mb-1">
                <Thermometer size={14} className={analysis.minNightTemp < 5 ? 'text-red-600' : 'text-gray-600'} />
                <p className="text-xs text-gray-600">Min Notturna</p>
              </div>
              <p className={`text-lg font-bold ${analysis.minNightTemp < plantMinTemp ? 'text-red-600' : 'text-gray-800'}`}>
                {analysis.minNightTemp}°C
              </p>
            </div>

            <div className="bg-white/50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600 mb-1">Media Notti</p>
              <p className="text-lg font-bold text-gray-800">{analysis.avgNightTemp}°C</p>
            </div>

            <div className="bg-white/50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-3 mb-1">
                <Snowflake size={14} className={analysis.frostRiskDays > 0 ? 'text-red-600' : 'text-gray-600'} />
                <p className="text-xs text-gray-600">Rischio Gelo</p>
              </div>
              <p className={`text-lg font-bold ${analysis.frostRiskDays > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {analysis.frostRiskDays} notti
              </p>
            </div>
          </div>

          {/* Notti consecutive sicure */}
          <div className="mb-3">
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-semibold">Notti consecutive sicure:</span>{' '}
              <span className={analysis.consecutiveSafeNights >= 3 ? 'text-green-600 font-bold' : 'text-orange-600 font-bold'}>
                {analysis.consecutiveSafeNights} / 3 (minimo richiesto)
              </span>
            </p>
            {analysis.consecutiveSafeNights < 3 && (
              <p className="text-xs text-orange-600">
                ⚠️ Necessarie almeno 3 notti consecutive sopra {plantMinTemp}°C per trapianto sicuro
              </p>
            )}
          </div>

          {/* Raccomandazione */}
          <div className={`${styles.bg} rounded-lg p-3 mb-3`}>
            <p className={`text-sm ${styles.text} whitespace-pre-line`}>
              {analysis.recommendation}
            </p>
          </div>

          {/* Azione */}
          {!analysis.safeForTransplant && onSetReminder && (
            <button
              onClick={onSetReminder}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors"
            >
              Ricordami tra 1 settimana
            </button>
          )}

          {/* Info aggiuntiva */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              <span className="font-semibold">Temperatura minima richiesta:</span> {plantMinTemp}°C per {plant.commonName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NightTempAlert;

