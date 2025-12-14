/**
 * Challenges Page - Next.js Route
 * Lista tutte challenge disponibili (passate, presenti, future)
 * Filtro per tipo, badge collection, streak widget
 */

'use client'

import React, { useState } from 'react';
import { getChallengesForMonth, getChallengesByType, challengeStats } from '@/data/giornateSpeciali';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Trophy, Filter, Calendar, Award } from 'lucide-react';
import { getUserBadges, getBadgeStats } from '@/lib/challenges/badgeSystem';
import { getStreak } from '@/lib/challenges/streakCalculator';

export default function ChallengesPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [userId] = useState<string | null>(() => {
    // TODO: Get from auth context
    return localStorage.getItem('user_id') || 'demo-user';
  });
  
  const challenges = selectedType === 'all'
    ? getChallengesForMonth(selectedMonth)
    : getChallengesByType(selectedType as any);
  
  const badges = userId ? getUserBadges(userId) : [];
  const badgeStats = userId ? getBadgeStats(userId) : { total: 0, byType: { challenge: 0, streak: 0, other: 0 }, recent: [] };
  const streak = userId ? getStreak(userId) : { current: 0, longest: 0, lastDate: null };
  
  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Trophy className="text-purple-600" size={32} />
          Challenge & Badge
        </h1>
        <p className="text-gray-600">
          Completa challenge giornaliere, guadagna badge e mantieni lo streak!
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Streak */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-500 rounded-full p-2">
              <span className="text-2xl">🔥</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Streak Corrente</p>
              <p className="text-2xl font-bold text-orange-900">{streak.current} giorni</p>
            </div>
          </div>
          <p className="text-xs text-gray-600">
            Record: {streak.longest} giorni
          </p>
        </div>
        
        {/* Badge Total */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-500 rounded-full p-2">
              <Award className="text-white" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Badge Totali</p>
              <p className="text-2xl font-bold text-purple-900">{badgeStats.total}</p>
            </div>
          </div>
          <p className="text-xs text-gray-600">
            {badgeStats.byType.challenge} challenge, {badgeStats.byType.streak} streak
          </p>
        </div>
        
        {/* Challenge Disponibili */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-500 rounded-full p-2">
              <Calendar className="text-white" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Challenge Totali</p>
              <p className="text-2xl font-bold text-green-900">{challengeStats.totale}</p>
            </div>
          </div>
          <p className="text-xs text-gray-600">
            {challengeStats.puntiTotaliDisponibili} punti disponibili
          </p>
        </div>
      </div>
      
      {/* Filtri */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-2" />
              Mese
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>
                  {format(new Date(2024, month - 1, 1), 'MMMM', { locale: it })}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter size={16} className="inline mr-2" />
              Tipo
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Tutti</option>
              <option value="mondiale">🌍 Mondiale</option>
              <option value="nazionale">🇮🇹 Nazionale</option>
              <option value="ambiente">🌿 Ambiente</option>
              <option value="benessere">💚 Benessere</option>
              <option value="sociale">🤝 Sociale</option>
              <option value="stagionale">📅 Stagionale</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Lista Challenge */}
      <div className="space-y-4">
        {challenges.map((challenge, idx) => {
          const challengeId = `${challenge.giorno}-${challenge.mese}`;
          const isCompleted = userId && badges.some(b => b.id === `challenge_${challengeId.replace('-', '_')}`);
          
          return (
            <div
              key={idx}
              className={`bg-white rounded-lg shadow-md p-6 border-2 ${
                isCompleted ? 'border-green-500 bg-green-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      challenge.tipo === 'mondiale' ? 'bg-blue-100 text-blue-800' :
                      challenge.tipo === 'nazionale' ? 'bg-green-100 text-green-800' :
                      challenge.tipo === 'ambiente' ? 'bg-emerald-100 text-emerald-800' :
                      challenge.tipo === 'benessere' ? 'bg-pink-100 text-pink-800' :
                      challenge.tipo === 'sociale' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {challenge.tipo}
                    </span>
                    {isCompleted && (
                      <span className="px-2 py-1 bg-green-500 text-white rounded text-xs font-semibold">
                        ✓ Completata
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {challenge.evento}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {format(new Date(2024, challenge.mese - 1, challenge.giorno), 'EEEE d MMMM', { locale: it })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Trophy size={14} />
                    +{challenge.challenge.punti} punti
                  </span>
                </div>
              </div>
              
              <h4 className="font-bold text-lg text-purple-900 mb-2">
                {challenge.challenge.titolo}
              </h4>
              
              <p className="text-gray-700 mb-4">
                {challenge.challenge.descrizione}
              </p>
              
              {!isCompleted && (
                <a
                  href={`/app/challenges/${challengeId}`}
                  className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Vedi Challenge
                </a>
              )}
            </div>
          );
        })}
      </div>
      
      {challenges.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>Nessuna challenge disponibile per questo mese/tipo</p>
        </div>
      )}
    </div>
  );
}
