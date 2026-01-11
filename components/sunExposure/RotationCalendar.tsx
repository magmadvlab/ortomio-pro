/**
 * Rotation Calendar Component
 * Mostra calendario mensile con blocchi colorati per coltura nella rotazione
 */

import React from 'react';
import { RotationPlan } from '../../services/pointRotationGenerator';
import { Calendar, Info } from 'lucide-react';

interface RotationCalendarProps {
  rotation: RotationPlan[];
  pointName?: string;
}

const RotationCalendar: React.FC<RotationCalendarProps> = ({
  rotation,
  pointName,
}) => {
  const months = [
    'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu',
    'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'
  ];

  const getCategoryColor = (categoria: RotationPlan['categoria']): string => {
    switch (categoria) {
      case 'Estivo':
        return 'bg-orange-500';
      case 'Primaverile':
        return 'bg-green-500';
      case 'Autunnale':
        return 'bg-yellow-500';
      case 'FogliaEstiva':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryLabel = (categoria: RotationPlan['categoria']): string => {
    switch (categoria) {
      case 'Estivo':
        return 'Estivo';
      case 'Primaverile':
        return 'Primaverile';
      case 'Autunnale':
        return 'Autunnale';
      case 'FogliaEstiva':
        return 'Foglia Estate';
      default:
        return categoria;
    }
  };

  // Calcola posizione e larghezza di ogni coltura nel calendario
  const getCropPosition = (plan: RotationPlan) => {
    const startMonth = plan.inizio.getMonth();
    const endMonth = plan.fine.getMonth();
    const startDay = plan.inizio.getDate();
    const endDay = plan.fine.getDate();
    
    // Calcola giorni totali dall'inizio dell'anno
    const startOfYear = new Date(plan.inizio.getFullYear(), 0, 1);
    const startDays = Math.floor((plan.inizio.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    const endDays = Math.floor((plan.fine.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    const totalDays = endDays - startDays;
    
    // Converti in percentuale dell'anno (365 giorni)
    const startPercent = (startDays / 365) * 100;
    const widthPercent = (totalDays / 365) * 100;

    return {
      startPercent,
      widthPercent,
      startMonth,
      endMonth,
      startDay,
      endDay,
    };
  };

  // Raggruppa rotazioni per riga (evita sovrapposizioni)
  const rows: RotationPlan[][] = [];
  rotation.forEach((plan) => {
    let placed = false;
    for (const row of rows) {
      const lastPlan = row[row.length - 1];
      const lastEnd = lastPlan.fine.getTime();
      const currentStart = plan.inizio.getTime();
      
      // Se c'è spazio nella riga (almeno 7 giorni di gap)
      if (currentStart >= lastEnd + 7 * 24 * 60 * 60 * 1000) {
        row.push(plan);
        placed = true;
        break;
      }
    }
    
    if (!placed) {
      rows.push([plan]);
    }
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {pointName && (
        <div className="flex items-center gap-3">
          <Calendar size={18} className="text-gray-600" />
          <h3 className="text-lg font-bold text-gray-800">{pointName} - Piano Annuale</h3>
        </div>
      )}

      {/* Header Mesi */}
      <div className="flex border-b border-gray-300 pb-2">
        {months.map((month, idx) => (
          <div
            key={idx}
            className="flex-1 text-center text-xs font-medium text-gray-600"
          >
            {month}
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative space-y-2">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="relative h-12">
            {row.map((plan, planIdx) => {
              const pos = getCropPosition(plan);
              return (
                <div
                  key={planIdx}
                  className={`absolute top-0 h-10 rounded ${getCategoryColor(plan.categoria)} text-white text-xs font-medium flex items-center justify-center px-2 cursor-pointer hover:opacity-80 transition-opacity`}
                  style={{
                    left: `${pos.startPercent}%`,
                    width: `${pos.widthPercent}%`,
                  }}
                  title={`${plan.coltura} (${plan.inizio.toLocaleDateString('it-IT')} - ${plan.fine.toLocaleDateString('it-IT')}) | Resa: ${plan.resaStimata}kg | ${getCategoryLabel(plan.categoria)}`}
                >
                  <span className="truncate">{plan.coltura}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-200">
        {(['Estivo', 'Primaverile', 'Autunnale', 'FogliaEstiva'] as RotationPlan['categoria'][]).map((cat) => {
          if (!rotation.some((r) => r.categoria === cat)) return null;
          return (
            <div key={cat} className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded ${getCategoryColor(cat)}`} />
              <span className="text-xs text-gray-600">{getCategoryLabel(cat)}</span>
            </div>
          );
        })}
      </div>

      {/* Statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-gray-200 text-sm">
        <div>
          <div className="text-gray-500">Raccolti previsti</div>
          <div className="font-bold text-gray-800">{rotation.length} cicli</div>
        </div>
        <div>
          <div className="text-gray-500">Resa stimata</div>
          <div className="font-bold text-gray-800">
            {Math.round(rotation.reduce((sum, r) => sum + r.resaStimata, 0) * 10) / 10} kg
          </div>
        </div>
        <div>
          <div className="text-gray-500">Colture</div>
          <div className="font-bold text-gray-800">
            {new Set(rotation.map((r) => r.coltura)).size} specie
          </div>
        </div>
      </div>
    </div>
  );
};

export default RotationCalendar;

