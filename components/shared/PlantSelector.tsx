'use client';

import { useState } from 'react';
import { PlantFuzzySearch } from './PlantFuzzySearch';
import { FuzzySearchResult } from '@/services/plantFuzzySearchService';
import { ArchetypeId } from '@/types/archetypes';
import { getMainArchetypes } from '@/data/archetypes';

interface PlantSelectorProps {
  onSelect: (plantId: string, result: FuzzySearchResult) => void;
  locale?: string;
  className?: string;
}

export function PlantSelector({
  onSelect,
  locale = 'it',
  className = ''
}: PlantSelectorProps) {
  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeId | undefined>();
  const [showSearch, setShowSearch] = useState(false);

  const mainArchetypes = getMainArchetypes();

  const handleArchetypeSelect = (archetypeId: ArchetypeId) => {
    setSelectedArchetype(archetypeId);
    setShowSearch(true);
  };

  const handlePlantSelect = (plantId: string, result: FuzzySearchResult) => {
    onSelect(plantId, result);
    setSelectedArchetype(undefined);
    setShowSearch(false);
  };

  return (
    <div className={className}>
      {!showSearch ? (
        <>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Seleziona tipo di pianta</h3>
            <p className="text-sm text-gray-600 mb-4">
              Scegli un archetipo o cerca direttamente una pianta
            </p>
          </div>

          {/* Griglia icone archetipi */}
          <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-4">
            {mainArchetypes.map((archetype) => (
              <button
                key={archetype.id}
                type="button"
                onClick={() => handleArchetypeSelect(archetype.id)}
                className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-500 transition-colors"
              >
                <span className="text-3xl mb-2">{archetype.icon}</span>
                <span className="text-xs text-center text-gray-700">
                  {archetype.label}
                </span>
              </button>
            ))}
          </div>

          {/* Oppure cerca direttamente */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowSearch(true)}
              className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              🔍 Oppure cerca direttamente una pianta...
            </button>
          </div>
        </>
      ) : (
        <div>
          <div className="mb-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setShowSearch(false);
                setSelectedArchetype(undefined);
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Torna alla selezione
            </button>
            {selectedArchetype && (
              <span className="text-sm text-gray-500">
                Archetipo selezionato: {mainArchetypes.find(a => a.id === selectedArchetype)?.label}
              </span>
            )}
          </div>

          <PlantFuzzySearch
            onSelect={handlePlantSelect}
            archetypeId={selectedArchetype}
            locale={locale}
            placeholder={selectedArchetype 
              ? `Cerca in ${mainArchetypes.find(a => a.id === selectedArchetype)?.label}...`
              : 'Cerca pianta (es. barattiere, pummador...)'
            }
          />
        </div>
      )}
    </div>
  );
}

