/**
 * Fertilization Suggestion Card
 * Card standalone per suggerimenti fertilizzazione basati su analisi foto
 */

'use client';

import React from 'react';
import { AlertTriangle, FlaskConical, Calendar, Plus } from 'lucide-react';
import { FertilizationSuggestion as FertilizationSuggestionType } from '@/services/fertilizationAdvisor';

interface FertilizationSuggestionProps {
  suggestion: FertilizationSuggestionType;
  plantName: string;
  taskId: string;
  onAddTask?: (taskId: string, suggestion: FertilizationSuggestionType) => void;
  className?: string;
}

export const FertilizationSuggestion: React.FC<FertilizationSuggestionProps> = ({
  suggestion,
  plantName,
  taskId,
  onAddTask,
  className = ''
}) => {
  if (!suggestion.needed) {
    return null;
  }

  const priorityColors = {
    high: 'bg-red-50 border-red-300 text-red-900',
    medium: 'bg-orange-50 border-orange-300 text-orange-900',
    low: 'bg-yellow-50 border-yellow-300 text-yellow-900'
  };

  const urgencyColors = {
    immediate: 'bg-red-100 text-red-800',
    soon: 'bg-orange-100 text-orange-800',
    planned: 'bg-yellow-100 text-yellow-800'
  };

  const handleAddFertilizationTask = () => {
    if (onAddTask) {
      onAddTask(taskId, suggestion);
    } else {
      // Default: naviga al journal per aggiungere task
      window.location.href = `/app/journal?taskId=${taskId}&action=fertilize`;
    }
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${priorityColors[suggestion.priority]} ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <FlaskConical size={20} />
          <h3 className="font-semibold">
            Fertilizzazione Consigliata: {plantName}
          </h3>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${urgencyColors[suggestion.timing.urgency]}`}>
          {suggestion.timing.urgency === 'immediate' ? 'Urgente' :
           suggestion.timing.urgency === 'soon' ? 'Presto' :
           'Pianificato'}
        </span>
      </div>

      <p className="text-sm mb-3">
        {suggestion.reason}
      </p>

      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
        <div>
          <p className="font-medium mb-1">Nutrienti:</p>
          <div className="space-y-1">
            {suggestion.recommendedNutrients.nitrogen && (
              <span className="inline-block px-2 py-0.5 bg-white rounded text-xs mr-1">N</span>
            )}
            {suggestion.recommendedNutrients.phosphorus && (
              <span className="inline-block px-2 py-0.5 bg-white rounded text-xs mr-1">P</span>
            )}
            {suggestion.recommendedNutrients.potassium && (
              <span className="inline-block px-2 py-0.5 bg-white rounded text-xs mr-1">K</span>
            )}
            {suggestion.recommendedNutrients.micro && (
              <span className="inline-block px-2 py-0.5 bg-white rounded text-xs">Micro</span>
            )}
          </div>
        </div>

        <div>
          <p className="font-medium mb-1">Dosaggio:</p>
          <p className="text-xs">
            {suggestion.dosage.amount}g/m²<br />
            {suggestion.dosage.frequency}
          </p>
        </div>
      </div>

      {suggestion.notes && suggestion.notes.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium mb-1">Note:</p>
          <ul className="text-xs space-y-1">
            {suggestion.notes.map((note, idx) => (
              <li key={idx}>• {note}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleAddFertilizationTask}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-current rounded-lg hover:bg-opacity-80 transition-colors font-medium text-sm"
      >
        <Plus size={16} />
        Aggiungi Task Fertilizzazione
      </button>
    </div>
  );
};

export default FertilizationSuggestion;




