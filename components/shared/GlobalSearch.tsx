'use client';

/**
 * Global Search Component
 * Provides a search bar with real-time results dropdown
 */

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, X, Calendar, Package, Sprout, Home, Wrench, Droplet } from 'lucide-react';
import { useStorage } from '../../packages/core/hooks/useStorage';
import { searchAll, SearchResult } from '../../services/globalSearchService';
import { getEnabledFeatures } from '@/config/features';
import { getSearchResultRoute, getVisibleCapabilities } from '@/config/capabilities';
import { useCapabilities } from '@/components/capabilities/CapabilityProvider';

const GlobalSearch: React.FC = () => {
  const { storageProvider } = useStorage();
  const { access } = useCapabilities();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const searchResults = await searchAll(query, storageProvider);
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, storageProvider]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    setQuery('');
    
    router.push(getSearchResultRoute(result.type));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const destination = navigationMatches[0]?.route ?? (results[0] ? getSearchResultRoute(results[0].type) : '/app/help');
      router.push(destination);
      setShowResults(false);
    }
  };

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'task':
        return <Calendar size={16} className="text-blue-600" />;
      case 'harvest':
        return <Package size={16} className="text-green-600" />;
      case 'seed':
        return <Sprout size={16} className="text-yellow-full max-w-sm" />;
      case 'garden':
        return <Home size={16} className="text-purple-600" />;
      case 'treatment':
        return <Droplet size={16} className="text-red-600" />;
      case 'mechanical':
        return <Wrench size={16} className="text-gray-600" />;
      default:
        return <Search size={16} />;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'task':
        return 'Task';
      case 'harvest':
        return 'Raccolto';
      case 'seed':
        return 'Seme';
      case 'garden':
        return 'Orto';
      case 'treatment':
        return 'Trattamento';
      case 'mechanical':
        return 'Lavorazione';
      default:
        return type;
    }
  };

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const normalizedQuery = query.trim().toLocaleLowerCase('it-IT');
  const navigationMatches = normalizedQuery.length < 2 ? [] : getVisibleCapabilities(access, 'search', new Set(getEnabledFeatures()))
    .filter(capability => capability.route && `${capability.label} ${capability.description}`.toLocaleLowerCase('it-IT').includes(normalizedQuery))
    .slice(0, 5);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Cerca in task, raccolti, semi..."
          className="w-full px-4 py-2 pl-10 pr-10 rounded-xl border border-green-200 shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
        <Search
          size={18}
          className="absolute left-3 top-3/2 -translate-y-1/2 text-gray-400"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
              setShowResults(false);
            }}
            className="absolute right-3 top-3/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={16} className="text-gray-400" />
          </button>
        )}
      </form>

      {/* Results Dropdown */}
      {showResults && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
          {isSearching ? (
            <div className="p-8 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-green-600" />
            </div>
          ) : results.length > 0 || navigationMatches.length > 0 ? (
            <div className="p-3">
              {navigationMatches.length > 0 && <div className="mb-4">
                <h4 className="px-4 py-3 text-xs font-bold uppercase text-gray-500">Navigazione</h4>
                {navigationMatches.map(capability => <button key={capability.id} onClick={() => { router.push(capability.route!); setShowResults(false); setQuery('') }} className="w-full rounded-lg px-4 py-3 text-left hover:bg-green-50">
                  <p className="text-sm font-semibold text-gray-900">{capability.label}</p>
                  <p className="mt-0.5 truncate text-xs text-gray-600">{capability.description}</p>
                </button>)}
              </div>}
              {Object.entries(groupedResults).map(([type, typeResults]) => (
                <div key={type} className="mb-4">
                  <h4 className="px-4 py-3 text-base text-xs font-bold text-gray-500 uppercase">
                    {getTypeLabel(type as SearchResult['type'])} ({typeResults.length})
                  </h4>
                  <div className="space-y-1">
                    {typeResults.slice(0, 5).map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className="w-full text-left px-4 py-3 text-base hover:bg-green-50 rounded-lg transition-colors flex items-start gap-3"
                      >
                        <div className="mt-0.5">{getTypeIcon(result.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">
                            {result.title}
                          </p>
                          {result.description && (
                            <p className="text-xs text-gray-600 truncate mt-0.5">
                              {result.description}
                            </p>
                          )}
                          {result.date && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(result.date).toLocaleDateString('it-IT')}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {results.length > 10 && (
                <button
                  onClick={handleSearchSubmit}
                  className="w-full mt-2 px-4 py-2 text-sm font-semibold text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  Vedi tutti i risultati ({results.length})
                </button>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm">Nessun risultato trovato</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;














