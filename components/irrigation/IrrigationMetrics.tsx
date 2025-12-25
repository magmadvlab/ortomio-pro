'use client'

import React, { useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Droplets, TrendingUp, DollarSign, Calendar } from 'lucide-react'
import { IrrigationSystem, IrrigationZone, WateringLog } from '@/types/irrigation'

interface IrrigationMetricsProps {
  systems: IrrigationSystem[]
  zones: IrrigationZone[]
  logs: WateringLog[]
}

export function IrrigationMetrics({ systems, zones, logs }: IrrigationMetricsProps) {
  const metrics = useMemo(() => {
    const getLogDateTime = (log: WateringLog) => {
      return log.wateredAt || log.date
    }

    // Calcolo totale zone
    const totalZones = zones.length

    // Calcolo litri totali usati questo mese
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const logsThisMonth = logs.filter(log => {
      const logDate = new Date(getLogDateTime(log))
      return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear
    })
    const totalLitersMonth = logsThisMonth.reduce((sum, log) => sum + (log.litersApplied || 0), 0)

    // Calcolo costo acqua (€0.002/litro media Italia)
    const waterCostPerLiter = 0.002
    const totalCostMonth = totalLitersMonth * waterCostPerLiter

    // Calcolo zone irrigate oggi
    const today = new Date().toDateString()
    const zonesWateredToday = new Set(
      logs
        .filter(log => new Date(getLogDateTime(log)).toDateString() === today)
        .map(log => log.zoneId)
    ).size

    // Trend vs mese scorso
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    const logsLastMonth = logs.filter(log => {
      const logDate = new Date(getLogDateTime(log))
      return logDate.getMonth() === lastMonth.getMonth() && logDate.getFullYear() === lastMonth.getFullYear()
    })
    const totalLitersLastMonth = logsLastMonth.reduce((sum, log) => sum + (log.litersApplied || 0), 0)
    const percentChange = totalLitersLastMonth > 0
      ? ((totalLitersMonth - totalLitersLastMonth) / totalLitersLastMonth) * 100
      : 0

    return {
      totalZones,
      totalLitersMonth,
      totalCostMonth,
      zonesWateredToday,
      percentChange
    }
  }, [zones, logs])

  const kpis = [
    {
      label: 'Zone Attive',
      value: metrics.totalZones,
      icon: <Droplets className="text-blue-600" size={24} />,
      subtext: `${metrics.zonesWateredToday} irrigate oggi`,
      color: 'blue'
    },
    {
      label: 'Litri Questo Mese',
      value: `${metrics.totalLitersMonth.toFixed(0)} L`,
      icon: <TrendingUp className={metrics.percentChange >= 0 ? 'text-orange-600' : 'text-green-600'} size={24} />,
      subtext: `${metrics.percentChange >= 0 ? '+' : ''}${metrics.percentChange.toFixed(1)}% vs scorso mese`,
      color: metrics.percentChange >= 0 ? 'orange' : 'green'
    },
    {
      label: 'Costo Acqua',
      value: `€${metrics.totalCostMonth.toFixed(2)}`,
      icon: <DollarSign className="text-purple-600" size={24} />,
      subtext: 'Questo mese',
      color: 'purple'
    },
    {
      label: 'Irrigazioni',
      value: logs.length,
      icon: <Calendar className="text-teal-600" size={24} />,
      subtext: 'Totali registrate',
      color: 'teal'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">{kpi.label}</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{kpi.value}</p>
              <p className="text-xs text-gray-500">{kpi.subtext}</p>
            </div>
            <div className="flex-shrink-0">{kpi.icon}</div>
          </div>
        </Card>
      ))}
    </div>
  )
}
