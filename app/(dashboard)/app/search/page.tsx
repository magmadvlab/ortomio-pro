'use client';

/**
 * Global Search Results Page
 * Displays comprehensive search results with filters and sorting
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStorage } from '@/packages/core/hooks/useStorage';
import { searchAll, SearchResult } from '@/services/globalSearchService';
import { Calendar, Package, Sprout, Home, Wrench, Droplet, Filter, ArrowUpDown } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';

const SearchPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { storageProvider } = useStorage();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Set<SearchResult['type']>>(new Set());
  const [sortBy, setSortBy] = useState<'relevance' | 'date'>('relevance');

  useEffect(() => {
    if (query.trim()) {
      performSearch();
    }
  }, [query, storageProvider]);

  const performSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const searchResults = await searchAll(query, storageProvider);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter((result) => {
    if (selectedTypes.size === 0) return true;
    return selectedTypes.has(result.type);
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    }
    return b.relevanceScore - a.relevanceScore;
  });

  const toggleTypeFilter = (type: SearchResult['type']) => {
    const newSet = new Set(selectedTypes);
    if (newSet.has(type)) {
      newSet.delete(type);
    } else {
      newSet.add(type);
    }
    setSelectedTypes(newSet);
  };

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'task':
        return <Calendar size={20} className="text-blue-600" />;
      case 'harvest':
        return <Package size={20} className="text-green-600" />;
      case 'seed':
        return <Sprout size={20} className="text-yellow-600" />;
      case 'garden':
        return <Home size={20} className="text-purple-600" />;
      case 'treatment':
        return <Droplet size={20} className="text-red-600" />;
      case 'mechanical':
        return <Wrench size={20} className="text-gray-600" />;
      default:
        return <Calendar size={20} />;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'task':
        return 'Task';
      case 'harvest':
        return 'Raccolti';
      case 'seed':
        return 'Semi';
      case 'garden':
        return 'Orti';
      case 'treatment':
        return 'Trattamenti';
      case 'mechanical':
        return 'Lavorazioni';
      default:
        return type;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'task':
        router.push(`/app/journal`);
        break;
      case 'harvest':
        router.push(`/app/harvest`);
        break;
      case 'seed':
        router.push(`/app/seeds`);
        break;
      case 'garden':
        router.push(`/app/gardens`);
        break;
      case 'treatment':
        router.push(`/app/advice`);
        break;
      case 'mechanical':
        router.push(`/app/mechanical-work`);
        break;
    }
  };

  const typeCounts = results.reduce((acc, result) => {
    acc[result.type] = (acc[result.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const allTypes: SearchResult['type'][] = ['task', 'harvest', 'seed', 'garden', 'treatment', 'mechanical'];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Risultati Ricerca" 
        subtitle={query ? `Risultati per "${query}"` : 'Cerca nell\'app'}
        showBack
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {!query ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Inserisci una query di ricerca per iniziare</p>
          </div>
        ) : (
          <>
            {/* Filters and Sort */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-gray-500" />
                  <span className="text-sm font-semibold text-gray-700">Filtra per tipo:</span>
                </div>
                {allTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleTypeFilter(type)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedTypes.has(type)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {getTypeLabel(type)} ({typeCounts[type] || 0})
                  </button>
                ))}
                
                <div className="ml-auto flex items-center gap-2">
                  <ArrowUpDown size={18} className="text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'relevance' | 'date')}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  >
                    <option value="relevance">Rilevanza</option>
                    <option value="date">Data</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <p className="mt-4 text-gray-600">Ricerca in corso...</p>
              </div>
            ) : sortedResults.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Trovati {sortedResults.length} risultato{sortedResults.length !== 1 ? 'i' : ''}
                </p>
                {sortedResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1">{getTypeIcon(result.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg text-gray-900">{result.title}</h3>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {getTypeLabel(result.type)}
                          </span>
                        </div>
                        {result.description && (
                          <p className="text-gray-600 mb-2">{result.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {result.date && (
                            <span>
                              {new Date(result.date).toLocaleDateString('it-IT', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </span>
                          )}
                          {result.plantName && (
                            <span className="text-green-600">• {result.plantName}</span>
                          )}
                          <span className="ml-auto">
                            Rilevanza: {result.relevanceScore}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                <p className="text-gray-600 mb-2">Nessun risultato trovato</p>
                <p className="text-sm text-gray-500">
                  Prova con termini di ricerca diversi
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;






