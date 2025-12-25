'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { calculateMoonPhase, getMoonPhaseEmoji, getNextIdealDate } from '@/logic/lunarCalendar'

interface LunarAdviceWidgetProps {
  operation?: 'sowing' | 'transplant' | 'harvest' | 'pruning'
  plantCategory?: 'LEAFY' | 'FRUITING' | 'ROOT' | 'LEGUME' | 'GENERIC'
  compact?: boolean
}

export function LunarAdviceWidget({
  operation = 'sowing',
  plantCategory = 'FRUITING',
  compact = false
}: LunarAdviceWidgetProps) {
  const currentMoon = calculateMoonPhase(new Date())
  const nextIdeal = getNextIdealDate(operation, plantCategory, new Date())

  const phaseColor = currentMoon.isWaxing
    ? 'from-blue-500 to-cyan-600'
    : 'from-purple-500 to-indigo-600'

  const idealOperations = currentMoon.isWaxing
    ? ['Semina foglie/frutti', 'Trapianto', 'Innesti']
    : ['Semina radici', 'Potatura', 'Raccolta foglie']

  if (compact) {
    return (
      <Card className="overflow-hidden">
        <div className={`bg-gradient-to-r ${phaseColor} text-white p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-xs opacity-90 mb-1">Fase Lunare</div>
              <div className="text-lg font-bold">{currentMoon.name}</div>
            </div>
            <div className="text-4xl">
              {getMoonPhaseEmoji(currentMoon.phase)}
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="text-sm text-gray-700">
            Ideale per: <span className="font-semibold">{idealOperations[0]}</span>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      {/* Header con fase lunare */}
      <div className={`bg-gradient-to-r ${phaseColor} text-white p-6`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="text-5xl">
            {getMoonPhaseEmoji(currentMoon.phase)}
          </div>
          <div className="flex-1">
            <div className="text-sm opacity-90 mb-1">Fase Lunare Oggi</div>
            <div className="text-2xl font-bold mb-1">{currentMoon.name}</div>
            <div className="text-sm opacity-80">
              {currentMoon.isWaxing ? 'Luna Crescente' : 'Luna Calante'}
              {' • '}
              Giorno {Math.floor(currentMoon.daysInCycle)} del ciclo
            </div>
          </div>
        </div>

        {/* Progress bar del ciclo lunare */}
        <div className="bg-white/20 rounded-full h-2 overflow-hidden">
          <div
            className="bg-white h-full transition-all duration-300"
            style={{ width: `${(currentMoon.daysInCycle / 29.53) * 100}%` }}
          />
        </div>
      </div>

      {/* Body con consigli */}
      <div className="p-6 space-y-4">
        {/* Operazioni ideali oggi */}
        <div>
          <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            ✅ Ideale oggi per:
          </div>
          <div className="flex flex-wrap gap-2">
            {idealOperations.map((op, idx) => (
              <span
                key={idx}
                className={`px-3 py-1.5 text-sm rounded-lg ${
                  currentMoon.isWaxing
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700'
                }`}
              >
                {op}
              </span>
            ))}
          </div>
        </div>

        {/* Prossima data ideale per operazione specifica */}
        {nextIdeal.daysFromNow > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="text-xs font-medium text-amber-800 mb-1">
              📅 Prossima finestra ideale
            </div>
            <div className="text-sm text-amber-900">
              {nextIdeal.reason}
            </div>
          </div>
        )}

        {/* Tradizione contadina */}
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 leading-relaxed">
          <div className="font-semibold mb-1">💡 Saggezza tradizionale</div>
          {currentMoon.isWaxing ? (
            <p>
              Durante la Luna Crescente, i liquidi risalgono verso la superficie.
              È il momento ideale per seminare e trapiantare piante da foglia e da frutto,
              favorendo germinazione e sviluppo aereo.
            </p>
          ) : (
            <p>
              Durante la Luna Calante, i liquidi si ritirano verso le radici.
              È il momento migliore per seminare ortaggi da radice, potare,
              e raccogliere foglie (più saporite e concentrate).
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
