'use client';

import { useState, useEffect, useCallback } from 'react';
import { FuzzySearchResult } from '@/services/plantFuzzySearchService';
import { ArchetypeId } from '@/types/archetypes';

interface PlantFuzzySearchProps {
  onSelect: (plantId: string, result: FuzzySearchResult) => void;
  archetypeId?: ArchetypeId;
  locale?: string;
  placeholder?: string;
  className?: string;
}

export function PlantFuzzySearch({
  onSelect,
  archetypeId,
  locale = 'it',
  placeholder = 'Cerca pianta (es. barattiere, pummador...)',
  className = ''
}: PlantFuzzySearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<FuzzySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce per evitare troppe chiamate API
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/plants/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            locale,
            archetypeId
          }),
        });

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = await response.json();
        setSuggestions(data.results || []);
      } catch (err) {
        console.error('Error searching plants:', err);
        setError('Errore nella ricerca');
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [query, locale, archetypeId]);

  const handleSelect = useCallback((result: FuzzySearchResult) => {
    onSelect(result.plantId, result);
    setQuery('');
    setSuggestions([]);
  }, [onSelect]);

  const getArchetypeIcon = (archetypeId: string): string => {
    const icons: Record<string, string> = {
      'A1': '🍅',
      'A2': '🥒',
      'A3': '🥦',
      'A4': '🫘',
      'A5': '🧅',
      'A6': '🥕',
      'A7': '🥬',
      'A8': '🥬',
      'A9': '🌿',
      'A10': '🍑',
      'A11': '🍎',
      'A12': '🍊'
    };
    return icons[archetypeId] || '🌱';
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {loading && (
          <div className="absolute right-3 top-3/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <li key={`${suggestion.plantId}-${index}`}>
              <button
                type="button"
                onClick={() => handleSelect(suggestion)}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg md:text-xl">{getArchetypeIcon(suggestion.archetypeId)}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {suggestion.plantName}
                    </div>
                    {suggestion.matchType === 'synonym' && (
                      <div className="text-sm text-gray-500">
                        Intendevi: {suggestion.plantName}?
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {suggestion.archetypeId}
                      </span>
                      <span className="text-xs text-gray-500">
                        {suggestion.familyId}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {query.length >= 2 && suggestions.length === 0 && !loading && !error && (
        <div className="mt-2 text-sm text-gray-500">
          Nessun risultato trovato per "{query}"
        </div>
      )}
    </div>
  );
}

