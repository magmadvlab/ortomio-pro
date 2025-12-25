'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Calendar, Droplets, Clock, Cloud, Thermometer } from 'lucide-react'
import { WateringLog } from '@/types/irrigation'
import { useStorage } from '@/packages/core/hooks/useStorage'
import type { GardenBed } from '@/types/gardenBed'
import type { GardenRow } from '@/types'

interface WateringHistoryProps {
  logs: WateringLog[]
}

export function WateringHistory({ logs }: WateringHistoryProps) {
  const { storageProvider } = useStorage()
  const [limit, setLimit] = useState(10)
  const [bedNameById, setBedNameById] = useState<Record<string, string>>({})
  const [rowNameById, setRowNameById] = useState<Record<string, string>>({})

  const getLogDateTime = (log: WateringLog) => {
    return log.wateredAt || log.date
  }

  const sortedLogs = useMemo(() => {
    return [...logs]
      .sort((a, b) => new Date(getLogDateTime(b)).getTime() - new Date(getLogDateTime(a)).getTime())
      .slice(0, limit)
  }, [logs, limit])

  useEffect(() => {
    const loadNames = async () => {
      const bedIds = Array.from(new Set(logs.map((l) => l.bedId).filter((id): id is string => Boolean(id))))
      const rowIds = Array.from(new Set(logs.map((l) => l.rowId).filter((id): id is string => Boolean(id))))

      try {
        if (bedIds.length > 0) {
          const beds = await Promise.all(bedIds.map((id) => storageProvider.getGardenBed(id)))
          const map: Record<string, string> = {}
          beds.filter((b): b is GardenBed => Boolean(b)).forEach((b) => {
            map[b.id] = b.name
          })
          setBedNameById(map)
        } else {
          setBedNameById({})
        }
      } catch {
        setBedNameById({})
      }

      try {
        if (rowIds.length > 0) {
          const rows = await Promise.all(rowIds.map((id) => storageProvider.getGardenRow(id)))
          const map: Record<string, string> = {}
          rows.filter((r): r is GardenRow => Boolean(r)).forEach((r) => {
            map[r.id] = r.name
          })
          setRowNameById(map)
        } else {
          setRowNameById({})
        }
      } catch {
        setRowNameById({})
      }
    }

    void loadNames()
  }, [logs, storageProvider])

  const totalStats = useMemo(() => {
    const total = logs.reduce((sum, log) => sum + (log.litersApplied || 0), 0)
    const avg = logs.length > 0 ? total / logs.length : 0
    return { total, avg }
  }, [logs])

  const methodLabels = {
    Manual: 'Manuale',
    Automatic: 'Automatico',
    Timer: 'Timer'
  }

  const weatherIcons = {
    Sunny: '☀️',
    Cloudy: '☁️',
    Rainy: '🌧️',
    Windy: '💨'
  }

  const getWeatherIcon = (weatherCondition?: string) => {
    if (!weatherCondition) return null
    const key = weatherCondition as keyof typeof weatherIcons
    return weatherIcons[key] || '🌤️'
  }

  if (logs.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="text-gray-400 mb-3">
          <Calendar size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Nessuna irrigazione registrata</h3>
        <p className="text-gray-600">Inizia a tracciare le tue irrigazioni</p>
      </Card>
    )
  }

  return (
    <Card>
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Storico Irrigazioni</h3>
            <p className="text-sm text-gray-600">
              {logs.length} irrigazioni registrate • {totalStats.total.toFixed(0)} L totali • {totalStats.avg.toFixed(1)} L media
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data/Ora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Letto/Filare
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durata
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Litri
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Metodo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Condizioni
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Note
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-gray-400" size={16} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(getLogDateTime(log)).toLocaleDateString('it-IT', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(getLogDateTime(log)).toLocaleTimeString('it-IT', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {log.bedId || log.rowId ? (
                    <div className="text-xs text-gray-700">
                      {log.bedId ? <div>Bed: {bedNameById[log.bedId] || log.bedId}</div> : null}
                      {log.rowId ? <div>Filare: {rowNameById[log.rowId] || log.rowId}</div> : null}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Clock className="text-orange-400" size={16} />
                    <span className="text-sm text-gray-900">{log.durationMinutes} min</span>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Droplets className="text-blue-400" size={16} />
                    <span className="text-sm font-medium text-blue-600">
                      {log.litersApplied.toFixed(1)} L
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                    {methodLabels[log.method]}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    {log.weatherCondition && (
                      <div className="flex items-center gap-1.5">
                        <Cloud className="text-gray-400" size={14} />
                        <span className="text-xs text-gray-600">
                          {getWeatherIcon(log.weatherCondition)} {log.weatherCondition}
                        </span>
                      </div>
                    )}
                    {log.airTemperatureC && (
                      <div className="flex items-center gap-1.5">
                        <Thermometer className="text-red-400" size={14} />
                        <span className="text-xs text-gray-600">{log.airTemperatureC}°C</span>
                      </div>
                    )}
                    {log.soilMoistureBefore !== undefined && log.soilMoistureAfter !== undefined && (
                      <span className="text-xs text-gray-600">
                        Umidità: {log.soilMoistureBefore}% → {log.soilMoistureAfter}%
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4">
                  {log.notes ? (
                    <p className="text-sm text-gray-600 max-w-xs truncate" title={log.notes}>
                      {log.notes}
                    </p>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {logs.length > limit && (
        <div className="px-6 py-4 border-t text-center">
          <button
            onClick={() => setLimit(limit + 10)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Mostra altre irrigazioni ({logs.length - limit} rimanenti)
          </button>
        </div>
      )}
    </Card>
  )
}
