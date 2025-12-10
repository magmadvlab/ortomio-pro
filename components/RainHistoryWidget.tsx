import React from 'react';
import { RainHistorySummary } from '../services/rainHistoryService';
import { CloudRain, Droplets, Calendar, TrendingUp } from 'lucide-react';

interface RainHistoryWidgetProps {
  history: RainHistorySummary;
  gardenName?: string;
}

const RainHistoryWidget: React.FC<RainHistoryWidgetProps> = ({ history, gardenName }) => {
  const getIntensityColor = (intensity: 'light' | 'moderate' | 'heavy') => {
    switch (intensity) {
      case 'heavy':
        return 'bg-blue-600';
      case 'moderate':
        return 'bg-blue-400';
      case 'light':
        return 'bg-blue-200';
    }
  };

  const getIntensityLabel = (intensity: 'light' | 'moderate' | 'heavy') => {
    switch (intensity) {
      case 'heavy':
        return 'Intensa';
      case 'moderate':
        return 'Moderata';
      case 'light':
        return 'Leggera';
    }
  };

  const getInsight = () => {
    if (history.totalEffectiveWater > 30) {
      return {
        message: '🌊 Terreno ben idratato. Sospendi irrigazione.',
        color: 'text-green-700',
        bg: 'bg-green-50',
        border: 'border-green-200',
      };
    }
    if (history.totalEffectiveWater > 10) {
      return {
        message: '💧 Irrigazione parziale sufficiente.',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
      };
    }
    if (history.daysSinceLastRain > 5) {
      return {
        message: '🏜️ Terreno asciutto. Irrigazione necessaria.',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
      };
    }
    return {
      message: '✅ Condizioni normali.',
      color: 'text-gray-700',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
    };
  };

  const insight = getInsight();

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <CloudRain size={20} className="text-blue-600" />
        <h3 className="text-lg font-bold text-gray-800">
          Precipitazioni Ultimi {history.totalDays} Giorni
        </h3>
      </div>

      {/* Statistiche principali */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 mb-1">
            <Droplets size={18} className="text-blue-600" />
            <p className="text-sm text-gray-600">Pioggia Totale</p>
          </div>
          <p className="text-2xl font-bold text-blue-800">{history.totalRainfall.toFixed(1)} mm</p>
        </div>

        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={18} className="text-green-600" />
            <p className="text-sm text-gray-600">Acqua Effettiva</p>
          </div>
          <p className="text-2xl font-bold text-green-800">{history.totalEffectiveWater.toFixed(1)} mm</p>
        </div>
      </div>

      {/* Grafico barre */}
      {history.days.length > 0 ? (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-600 mb-2">Distribuzione Giornaliera</p>
          <div className="flex items-end gap-2 h-32">
            {history.days.map((day, idx) => {
              const maxRain = Math.max(...history.days.map(d => d.precipitationMM), 1);
              const height = (day.precipitationMM / maxRain) * 100;
              
              return (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full ${getIntensityColor(day.intensity)} rounded-t transition-all relative group`}
                    style={{ height: `${height}%` }}
                    title={`${day.date}: ${day.precipitationMM}mm (${day.effectiveWaterMM.toFixed(1)}mm effettivi)`}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                      {day.precipitationMM}mm
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 text-center">
                    {new Date(day.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500 mb-4">
          <Calendar size={24} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nessuna pioggia negli ultimi {history.totalDays} giorni</p>
        </div>
      )}

      {/* Insight */}
      <div className={`${insight.bg} ${insight.border} border rounded-lg p-3`}>
        <p className={`text-sm font-semibold ${insight.color}`}>{insight.message}</p>
        {history.lastRainDate && (
          <p className="text-xs text-gray-600 mt-1">
            Ultima pioggia: {new Date(history.lastRainDate).toLocaleDateString('it-IT')} 
            ({history.daysSinceLastRain} giorni fa)
          </p>
        )}
      </div>

      {/* Media giornaliera */}
      {history.days.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            Media giornaliera: <span className="font-bold">{history.averageDaily.toFixed(1)} mm</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default RainHistoryWidget;

