import React, { useState } from 'react';
import { ArchetypeId, CropArchetype } from '../../types/archetypes';
import { getAllArchetypes, getSubArchetypesForParent, archetypeHasSubArchetypes } from '../../services/archetypeService';
import { ChevronLeft } from 'lucide-react';

interface ArchetypeGridProps {
  onSelect: (archetypeId: ArchetypeId) => void;
  showSubGrid?: boolean;
  parentArchetypeId?: ArchetypeId;
  onBack?: () => void;
}

export const ArchetypeGrid: React.FC<ArchetypeGridProps> = ({
  onSelect,
  showSubGrid = false,
  parentArchetypeId,
  onBack
}) => {
  const [selectedParent, setSelectedParent] = useState<ArchetypeId | null>(null);
  
  // Determina quali archetipi mostrare
  let archetypesToShow: CropArchetype[] = [];
  
  if (showSubGrid && parentArchetypeId) {
    // Mostra sub-griglia per archetipo padre
    archetypesToShow = getSubArchetypesForParent(parentArchetypeId);
  } else if (selectedParent) {
    // Utente ha selezionato un archetipo padre, mostra sub-griglia
    archetypesToShow = getSubArchetypesForParent(selectedParent);
  } else {
    // Mostra griglia principale (A1-A12)
    archetypesToShow = getAllArchetypes();
  }
  
  const handleArchetypeClick = (archetype: CropArchetype) => {
    // Se ha sub-griglie, mostra sub-griglia invece di selezionare
    if (archetypeHasSubArchetypes(archetype.id)) {
      setSelectedParent(archetype.id);
    } else {
      // Seleziona direttamente
      onSelect(archetype.id);
    }
  };
  
  const handleBack = () => {
    if (selectedParent) {
      setSelectedParent(null);
    } else if (onBack) {
      onBack();
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Header con titolo e back button */}
      {(selectedParent || showSubGrid) && (
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleBack}
            className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Indietro"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <h3 className="text-lg font-bold text-gray-800">
            {showSubGrid ? 'Seleziona tipo coltura legnosa' : 'Seleziona tipo'}
          </h3>
        </div>
      )}
      
      {/* Griglia responsive: 3 colonne mobile, 4 desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
        {archetypesToShow.map((archetype) => (
          <button
            key={archetype.id}
            onClick={() => handleArchetypeClick(archetype)}
            className="flex flex-col items-center justify-center p-4 sm:p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
            aria-label={archetype.label}
            title={archetype.examples && archetype.examples.length > 0 ? `Esempi: ${archetype.examples.join(', ')}` : undefined}
          >
            <span className="text-4xl sm:text-5xl mb-2 group-hover:scale-110 transition-transform">
              {archetype.icon}
            </span>
            <span className="text-xs sm:text-sm font-medium text-gray-700 text-center leading-tight mb-1">
              {archetype.label}
            </span>
            
            {/* Mostra esempi sotto l'etichetta */}
            {archetype.examples && archetype.examples.length > 0 && (
              <div className="mt-1 px-2">
                <p className="text-[10px] sm:text-xs text-gray-500 text-center leading-tight line-clamp-3">
                  {archetype.examples.slice(0, 4).join(', ')}
                  {archetype.examples.length > 4 && '...'}
                </p>
              </div>
            )}
            
            {archetypeHasSubArchetypes(archetype.id) && (
              <span className="text-xs text-gray-400 mt-1">→</span>
            )}
          </button>
        ))}
      </div>
      
      {/* Info box con esempi */}
      {!selectedParent && !showSubGrid && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
          <p className="text-xs text-blue-800">
            <strong>💡 Non trovi il nome?</strong> Seleziona il tipo più simile. 
            Il sistema imparerà dai tuoi inserimenti.
          </p>
        </div>
      )}
    </div>
  );
};

