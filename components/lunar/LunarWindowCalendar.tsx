'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getNextLunarWindows, calculateMoonPhase, getMoonPhaseEmoji } from '@/logic/lunarCalendar'
import type { LunarWindow } from '@/logic/lunarCalendar'
import { Calendar, Sparkles } from 'lucide-react'

interface LunarWindowCalendarProps {
  operation: 'sowing' | 'transplant' | 'harvest' | 'pruning'
  plantCategory: 'LEAFY' | 'FRUITING' | 'ROOT' | 'LEGUME' | 'GENERIC'
  plantName?: string
  onSelectDate?: (date: Date, window: LunarWindow) => void
  maxWindows?: number
}

export function LunarWindowCalendar({
  operation,
  plantCategory,
  plantName,
  onSelectDate,
  maxWindows = 3
}: LunarWindowCalendarProps) {
  const windows = getNextLunarWindows(operation, plantCategory, new Date(), maxWindows)
  const currentMoon = calculateMoonPhase(new Date())

  const operationLabels = {
    sowing: 'semina',
    transplant: 'trapianto',
    harvest: 'raccolta',
    pruning: 'potatura'
  }

  const categoryLabels = {
    LEAFY: 'foglie',
    FRUITING: 'frutti',
    ROOT: 'radici',
    LEGUME: 'legumi',
    GENERIC: 'generica'
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-lg">
            <Calendar size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Calendario Lunare</h3>
            <p className="text-sm text-purple-100">
              Prossime finestre ideali per {operationLabels[operation]}
              {plantName && ` di ${plantName}`}
            </p>
          </div>
        </div>

        {/* Current Moon Phase */}
        <div className="mt-4 bg-white/10 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-purple-200 mb-1">Fase Lunare Oggi</div>
              <div className="text-lg font-semibold">{currentMoon.name}</div>
            </div>
            <div className="text-4xl">
              {getMoonPhaseEmoji(currentMoon.phase)}
            </div>
          </div>
        </div>
      </div>

      {/* Windows List */}
      <div className="p-6 space-y-4">
        {windows.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Calendar size={48} className="mx-auto mb-3 opacity-30" />
            <p>Nessuna finestra lunare trovata</p>
          </div>
        )}

        {windows.map((window, idx) => {
          const isActive = window.isActive
          const isPast = window.startDate < new Date() && !isActive

          return (
            <div
              key={idx}
              className={`rounded-xl border-2 p-4 transition-all ${
                isActive
                  ? 'bg-green-50 border-green-500 shadow-lg'
                  : isPast
                    ? 'bg-gray-50 border-gray-200 opacity-50'
                    : 'bg-purple-50 border-purple-200 hover:border-purple-400'
              }`}
            >
              {/* Window Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  {/* Active Badge */}
                  {isActive && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full mb-2">
                      <Sparkles size={14} />
                      IN CORSO ADESSO
                    </div>
                  )}

                  {/* Date Range */}
                  <div className="font-semibold text-gray-900 text-lg mb-1">
                    {window.startDate.toLocaleDateString('it-IT', {
                      day: 'numeric',
                      month: 'long',
                      year: window.startDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                    })}
                    {' - '}
                    {window.endDate.toLocaleDateString('it-IT', {
                      day: 'numeric',
                      month: 'long',
                      year: window.endDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                    })}
                  </div>

                  {/* Moon Phase */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{window.phase === 'waxing' ? '🌒' : '🌘'}</span>
                    <span>{window.phaseName}</span>
                    {!isActive && window.daysFromNow > 0 && (
                      <span className="text-xs text-gray-500">
                        (tra {window.daysFromNow} {window.daysFromNow === 1 ? 'giorno' : 'giorni'})
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                {onSelectDate && !isPast && (
                  <Button
                    onClick={() => onSelectDate(window.startDate, window)}
                    size="sm"
                    className={isActive ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'}
                  >
                    {isActive ? 'Pianifica Ora' : 'Pianifica'}
                  </Button>
                )}
              </div>

              {/* Ideal Operations */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs font-medium text-gray-600 mb-2">
                  Operazioni ideali:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {window.idealFor.slice(0, 3).map((op, opIdx) => (
                    <span
                      key={opIdx}
                      className={`px-2 py-1 text-xs rounded-md ${
                        isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {op}
                    </span>
                  ))}
                  {window.idealFor.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md">
                      +{window.idealFor.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer Info */}
      <div className="px-6 pb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-700">
          <div className="font-semibold mb-1 flex items-center gap-2">
            <Sparkles size={16} className="text-blue-600" />
            Perché seguire la luna?
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            {plantCategory === 'ROOT'
              ? 'Per le radici, la Luna Calante favorisce lo sviluppo sotterraneo e la conservazione.'
              : plantCategory === 'LEAFY'
                ? 'Per le foglie, la Luna Crescente favorisce germinazione, mentre la Calante rende le foglie più saporite alla raccolta.'
                : 'Per i frutti, la Luna Crescente favorisce germinazione e sviluppo aereo, rendendo i frutti più succosi.'}
          </p>
        </div>
      </div>
    </Card>
  )
}
