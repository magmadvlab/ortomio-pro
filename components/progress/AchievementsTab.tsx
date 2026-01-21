'use client'

import React from 'react'
import { Trophy, Target } from 'lucide-react'

export function AchievementsTab() {
  return (
    <div className="space-y-6">
      {/* Messaggio Professionale */}
      <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl border-2 border-blue-200 p-8 text-center">
        <Trophy size={64} className="mx-auto text-blue-600 mb-4" />
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
          Modalità Professionale
        </h2>
        <p className="text-gray-700 max-w-2xl mx-auto mb-6">
          OrtoMio si concentra ora su funzionalità professionali per la gestione agricola avanzata.
          Le statistiche e i progressi sono integrati nelle sezioni operative specifiche.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <Target className="mx-auto text-green-600 mb-2" size={32} />
            <h3 className="font-semibold text-gray-900 mb-1">Analytics</h3>
            <p className="text-sm text-gray-600">Report e statistiche dettagliate</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <Trophy className="mx-auto text-orange-600 mb-2" size={32} />
            <h3 className="font-semibold text-gray-900 mb-1">Certificazioni</h3>
            <p className="text-sm text-gray-600">Compliance e standard qualità</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <Target className="mx-auto text-blue-600 mb-2" size={32} />
            <h3 className="font-semibold text-gray-900 mb-1">Obiettivi</h3>
            <p className="text-sm text-gray-600">KPI e target produttivi</p>
          </div>
        </div>
      </div>

      {/* Link Rapidi */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Accesso Rapido</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <a
            href="/app/analytics"
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-xl md:text-2xl">📊</span>
            <div>
              <div className="font-medium text-gray-900">Analytics</div>
              <div className="text-xs text-gray-500">Report e statistiche</div>
            </div>
          </a>
          
          <a
            href="/app/certifications"
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-xl md:text-2xl">🏆</span>
            <div>
              <div className="font-medium text-gray-900">Certificazioni</div>
              <div className="text-xs text-gray-500">GlobalG.A.P., Bio, HACCP</div>
            </div>
          </a>
          
          <a
            href="/app/reports"
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-xl md:text-2xl">📈</span>
            <div>
              <div className="font-medium text-gray-900">Report Piante</div>
              <div className="text-xs text-gray-500">Storico e analisi</div>
            </div>
          </a>
          
          <a
            href="/app/diary"
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-xl md:text-2xl">📝</span>
            <div>
              <div className="font-medium text-gray-900">Diario Operativo</div>
              <div className="text-xs text-gray-500">Cronologia attività</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}

