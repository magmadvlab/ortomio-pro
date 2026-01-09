/**
 * Almanacco Page - Next.js Route
 * Browse completo 365 giorni almanacco
 * Filtro per mese/stagione, ricerca, dettaglio giorno
 */

'use client'

import React, { useState } from 'react';
import { getAlmanaccoForMonth, getAlmanaccoForDate } from '@/data/almanacco-database';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { BookOpen, Search, Calendar } from 'lucide-react';

export default function AlmanaccoPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const entries = getAlmanaccoForMonth(selectedMonth);
  const filteredEntries = searchQuery
    ? entries.filter(e => 
        e.nazionale.proverbio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.evento?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.santo?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : entries;
  
  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <BookOpen className="text-amber-600" size={32} />
          Almanacco del Contadino
        </h1>
        <p className="text-gray-600">
          Sfoglia 365 giorni di proverbi agricoli italiani con varianti regionali
        </p>
      </div>
      
      {/* Filtri */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Selezione Mese */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-2" />
              Mese
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>
                  {format(new Date(2024, month - 1, 1), 'MMMM', { locale: it })}
                </option>
              ))}
            </select>
          </div>
          
          {/* Ricerca */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search size={16} className="inline mr-2" />
              Cerca
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca per proverbio, evento, santo..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>
      
      {/* Lista Entries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEntries.map((entry, idx) => {
          const date = new Date(2024, entry.mese - 1, entry.giorno);
          const isSelected = selectedDate && 
            selectedDate.getDate() === entry.giorno && 
            selectedDate.getMonth() + 1 === entry.mese;
          
          return (
            <div
              key={idx}
              onClick={() => setSelectedDate(date)}
              className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all hover:shadow-lg border-2 ${
                isSelected ? 'border-green-500' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-600">
                    {format(date, 'EEEE d', { locale: it })}
                  </p>
                  {entry.evento && (
                    <p className="text-xs text-amber-600 font-medium mt-1">
                      🗓️ {entry.evento}
                    </p>
                  )}
                </div>
                {entry.santo && (
                  <span className="text-xs text-gray-500">🙏 {entry.santo}</span>
                )}
              </div>
              
              <blockquote className="border-l-4 border-amber-400 pl-3 my-3">
                <p className="text-sm font-serif italic text-gray-800">
                  "{entry.nazionale.proverbio}"
                </p>
              </blockquote>
              
              <p className="text-xs text-gray-600 line-clamp-2">
                {entry.nazionale.spiegazione}
              </p>
            </div>
          );
        })}
      </div>
      
      {filteredEntries.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>Nessun risultato trovato per "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}
