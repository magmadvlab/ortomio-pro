'use client'

import React, { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { IrrigationZone, WateringLog } from '@/types/irrigation'
import { GardenBed } from '@/types/gardenBed'
import { Droplets, TrendingUp, Calendar, BarChart3, AlertCircle } from 'lucide-react'
import { format, subDays, isAfter, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'

interface IrrigationZoneAnalyticsProps {
  zone: IrrigationZone
  logs: WateringLog[]
  beds: GardenBed[]
}

interface BedStats {
  bedId: string
  bedName: string
  totalLiters: number
  irrigationCount: number
  avgLitersPerIrrigation: number
  lastIrrigationDate: string | null
}

type TimePeriod = '7d' | '30d' | '90d' | 'all'

export function IrrigationZoneAnalytics({ zone, logs, beds }: IrrigationZoneAnalyticsProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d')

  // Filtra logs per periodo
  const filteredLogs = useMemo(() => {
    if (timePeriod === 'all') return logs

    const daysMap = { '7d': 7, '30d': 30, '90d': 90 }
    const cutoffDate = subDays(new Date(), daysMap[timePeriod])

    return logs.filter(log => {
      const logDate = parseISO(log.date)
      return isAfter(logDate, cutoffDate)
    })
  }, [logs, timePeriod])

  // Statistiche generali zona
  const zoneStats = useMemo(() => {
    const totalLiters = filteredLogs.reduce((sum, log) => sum + (log.litersApplied || 0), 0)
    const irrigationCount = filteredLogs.length
    const avgLitersPerIrrigation = irrigationCount > 0 ? totalLiters / irrigationCount : 0

    const lastLog = [...filteredLogs].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0]

    return {
      totalLiters: Math.round(totalLiters),
      irrigationCount,
      avgLitersPerIrrigation: Math.round(avgLitersPerIrrigation),
      lastIrrigationDate: lastLog ? lastLog.date : null
    }
  }, [filteredLogs])

  // Statistiche per bed
  const bedStats = useMemo(() => {
    const statsMap = new Map<string, BedStats>()

    // Inizializza tutti i beds della zona
    const zoneBedIds = zone.bedIds || []
    zoneBedIds.forEach(bedId => {
      const bed = beds.find(b => b.id === bedId)
      if (bed) {
        statsMap.set(bedId, {
          bedId,
          bedName: bed.name,
          totalLiters: 0,
          irrigationCount: 0,
          avgLitersPerIrrigation: 0,
          lastIrrigationDate: null
        })
      }
    })

    // Aggiungi dati dai logs
    filteredLogs.forEach(log => {
      if (!log.bedId) return

      const existing = statsMap.get(log.bedId)
      if (existing) {
        const liters = log.litersApplied || 0
        existing.totalLiters += liters
        existing.irrigationCount += 1

        if (!existing.lastIrrigationDate || log.date > existing.lastIrrigationDate) {
          existing.lastIrrigationDate = log.date
        }
      }
    })

    // Calcola medie
    statsMap.forEach(stats => {
      if (stats.irrigationCount > 0) {
        stats.avgLitersPerIrrigation = Math.round(stats.totalLiters / stats.irrigationCount)
      }
    })

    return Array.from(statsMap.values()).sort((a, b) => b.totalLiters - a.totalLiters)
  }, [filteredLogs, beds, zone.bedIds])

  // Beds non assegnati a questa zona
  const orphanBeds = useMemo(() => {
    const zoneBedIds = new Set(zone.bedIds || [])
    return beds.filter(bed => !zoneBedIds.has(bed.id))
  }, [beds, zone.bedIds])

  return (
    <div className="space-y-4">
      {/* Header con selettore periodo */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Analytics - {zone.name}
        </h3>

        <div className="flex gap-3">
          {(['7d', '30d', '90d', 'all'] as TimePeriod[]).map(period => (
            <button
              key={period}
              onClick={() => setTimePeriod(period)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                timePeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period === 'all' ? 'Tutto' : period}
            </button>
          ))}
        </div>
      </div>

      {/* Cards statistiche generali */}
      <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Droplets className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Consumo Totale</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{zoneStats.totalLiters}L</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <BarChart3 className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Irrigazioni</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{zoneStats.irrigationCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Media per Irrigazione</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{zoneStats.avgLitersPerIrrigation}L</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Calendar className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ultima Irrigazione</p>
              <p className="text-lg font-bold text-gray-900">
                {zoneStats.lastIrrigationDate
                  ? format(parseISO(zoneStats.lastIrrigationDate), 'd MMM', { locale: it })
                  : 'Mai'
                }
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Breakdown per Bed */}
      <Card className="p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-3">
          <BarChart3 size={20} className="text-blue-600" />
          Consumo per Aiuola/Letto
        </h4>

        {bedStats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle size={48} className="mx-auto mb-3 text-gray-400" />
            <p>Nessun letto assegnato a questa zona</p>
            <p className="text-sm mt-1">Assegna dei letti nella configurazione della zona</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bedStats.map(bedStat => {
              const percentage = zoneStats.totalLiters > 0
                ? (bedStat.totalLiters / zoneStats.totalLiters) * 100
                : 0

              return (
                <div key={bedStat.bedId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">{bedStat.bedName}</span>
                      <span className="text-sm text-gray-500">
                        {bedStat.irrigationCount} irrigazioni
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900">{bedStat.totalLiters}L</span>
                      <span className="text-sm text-gray-500 ml-2">({Math.round(percentage)}%)</span>
                    </div>
                  </div>

                  {/* Barra progresso */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Media: {bedStat.avgLitersPerIrrigation}L per irrigazione</span>
                    {bedStat.lastIrrigationDate && (
                      <span>
                        Ultima: {format(parseISO(bedStat.lastIrrigationDate), 'd MMM', { locale: it })}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Warning per beds orfani */}
      {orphanBeds.length > 0 && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-medium text-amber-900 mb-1">
                Letti non assegnati a nessuna zona
              </h4>
              <p className="text-sm text-amber-800 mb-2">
                I seguenti letti non sono assegnati a nessuna zona irrigua. Assegnali per tracciare i consumi:
              </p>
              <div className="flex flex-wrap gap-3">
                {orphanBeds.map(bed => (
                  <span
                    key={bed.id}
                    className="px-2 py-1 bg-amber-100 text-amber-900 rounded text-sm font-medium"
                  >
                    {bed.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
