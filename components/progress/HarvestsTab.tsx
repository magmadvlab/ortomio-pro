'use client'

import React, { useState, useEffect } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { calculateHarvestAnalytics } from '@/logic/harvestAnalyticsEngine'
import { HarvestLogData } from '@/types'
import { ShoppingBasket, TrendingUp, Euro, Calendar } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'
import { getMarketPrice } from '@/data/marketPrices'
import {
  calculateAdaptiveQualityPrice,
  resolveAdaptiveQualityPricingBenchmark,
} from '@/services/adaptiveMarketPricingService'

export function HarvestsTab() {
  const { storageProvider } = useStorage()
  const [harvests, setHarvests] = useState<HarvestLogData[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [adaptiveMarketValue, setAdaptiveMarketValue] = useState(0)
  const [adaptiveCoverage, setAdaptiveCoverage] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHarvests = async () => {
      try {
        const gardens = await storageProvider.getGardens()
        if (gardens.length > 0) {
          // Carica harvest logs per tutti i giardini
          const allHarvests: HarvestLogData[] = []
          for (const garden of gardens) {
            try {
              const gardenHarvests = await storageProvider.getHarvestLogs?.(garden.id) || []
              allHarvests.push(...gardenHarvests.map((harvest) => ({
                ...harvest,
                gardenId: harvest.gardenId || garden.id,
              })))
            } catch (error) {
              console.error(`Error loading harvests for garden ${garden.id}:`, error)
            }
          }
          
          setHarvests(allHarvests)
          const pricingSummary = await calculateAdaptiveMarketValue(allHarvests)
          setAdaptiveMarketValue(pricingSummary.marketValueEuro)
          setAdaptiveCoverage(pricingSummary.adaptiveCoverage)
          
          // Calcola analytics
          const now = new Date()
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          const analyticsData = calculateHarvestAnalytics(allHarvests, startOfMonth, now)
          setAnalytics(analyticsData)
        }
      } catch (error) {
        console.error('Error loading harvests:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadHarvests()
  }, [storageProvider])

  const normalizeQuantityKg = (harvest: HarvestLogData) => {
    if (harvest.unit === 'g') return harvest.quantity / 1000
    return harvest.quantity
  }

  const calculateAdaptiveMarketValue = async (harvestLogs: HarvestLogData[]) => {
    const benchmarkCache = new Map<string, Awaited<ReturnType<typeof resolveAdaptiveQualityPricingBenchmark>>>()
    let marketValueEuro = 0
    let adaptiveCoverageCount = 0

    for (const harvest of harvestLogs) {
      const quantityKg = normalizeQuantityKg(harvest)
      const plantName = harvest.plantName?.trim()
      const gardenId = harvest.gardenId
      const season = (() => {
        const month = new Date(harvest.date).getMonth()
        return month >= 5 && month <= 8 ? 'Summer' : 'Winter'
      })()
      const basePrice = getMarketPrice((plantName || 'GENERIC').toUpperCase(), season)

      if (!storageProvider?.getUserPreference || !plantName || !gardenId) {
        marketValueEuro += quantityKg * basePrice
        continue
      }

      const cacheKey = `${gardenId}::${plantName.toLowerCase()}`
      let benchmark = benchmarkCache.get(cacheKey)
      if (!benchmark) {
        benchmark = await resolveAdaptiveQualityPricingBenchmark(storageProvider, gardenId, {
          plantName,
        })
        benchmarkCache.set(cacheKey, benchmark)
      }

      const adaptivePrice = calculateAdaptiveQualityPrice(basePrice, {
        qualityScore: harvest.rating * 20,
        benchmark,
      }).adjustedPrice

      marketValueEuro += quantityKg * adaptivePrice
      adaptiveCoverageCount += 1
    }

    return {
      marketValueEuro: Number(marketValueEuro.toFixed(0)),
      adaptiveCoverage: adaptiveCoverageCount,
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Caricamento raccolti...</p>
      </div>
    )
  }

  // Stats mese corrente
  const currentMonthHarvests = harvests.filter(h => {
    const harvestDate = new Date(h.date)
    const now = new Date()
    return harvestDate.getMonth() === now.getMonth() && harvestDate.getFullYear() === now.getFullYear()
  })

  const totalKgThisMonth = currentMonthHarvests.reduce((sum, h) => {
    if (h.unit === 'kg') return sum + h.quantity
    if (h.unit === 'g') return sum + h.quantity / 1000
    return sum + h.quantity * 0.1
  }, 0)

  // Grafico annuale (semplificato)
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthHarvests = harvests.filter(h => {
      const harvestDate = new Date(h.date)
      return harvestDate.getMonth() === i
    })
    const totalKg = monthHarvests.reduce((sum, h) => {
      if (h.unit === 'kg') return sum + h.quantity
      if (h.unit === 'g') return sum + h.quantity / 1000
      return sum + h.quantity * 0.1
    }, 0)
    return totalKg
  })

  const maxKg = Math.max(...monthlyData, 1)

  const getQualityEmoji = (rating?: number) => {
    if (!rating) return '😐'
    if (rating >= 5) return '😊'
    if (rating >= 4) return '🙂'
    if (rating >= 3) return '😐'
    return '😟'
  }

  return (
    <div className="space-y-6">
      {/* Stats Mese Corrente */}
      <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBasket size={24} className="text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Questo Mese</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {totalKgThisMonth.toFixed(1)} kg
          </div>
          <p className="text-sm text-gray-600">
            {currentMonthHarvests.length} raccolti
          </p>
          {analytics && (
            <div className="mt-3 flex items-center gap-3 text-sm">
              <TrendingUp size={16} className="text-green-600" />
              <span className="text-green-700 font-medium">
                +15% vs mese scorso
              </span>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-full max-w-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Euro size={24} className="text-yellow-full max-w-sm" />
            <h3 className="text-lg font-semibold text-gray-900">Valore Stimato</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            €{adaptiveMarketValue.toFixed(0)}
          </div>
          <p className="text-sm text-gray-600">
            {adaptiveCoverage > 0
              ? `Benchmark-aware su ${adaptiveCoverage} raccolti`
              : 'Risparmiati al supermercato'}
          </p>
        </div>
      </div>

      {/* Grafico Andamento Annuale */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
          <TrendingUp size={20} className="text-blue-600" />
          Andamento Annuale
        </h3>
        
        <div className="space-y-2">
          {monthlyData.map((kg, monthIdx) => {
            const monthName = format(new Date(2024, monthIdx, 1), 'MMM', { locale: it })
            const heightPercent = (kg / maxKg) * 100
            
            return (
              <div key={monthIdx} className="flex items-center gap-3">
                <div className="w-12 text-xs text-gray-600 font-medium">{monthName}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                  {kg > 0 && (
                    <div
                      className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${heightPercent}%` }}
                    />
                  )}
                </div>
                <div className="w-16 text-xs text-gray-700 font-medium text-right">
                  {kg > 0 ? `${kg.toFixed(1)}kg` : '-'}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Ultimi Raccolti */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Ultimi Raccolti</h3>
        
        {harvests.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingBasket size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Nessun raccolto registrato</p>
            <p className="text-sm text-gray-400 mt-1">Registra il tuo primo raccolto!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {harvests
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 10)
              .map((harvest, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-xl md:text-2xl">
                      {harvest.plantName === 'Pomodoro' ? '🍅' :
                       harvest.plantName === 'Lattuga' ? '🥬' :
                       harvest.plantName === 'Basilico' ? '🌿' :
                       harvest.plantName === 'Zucchine' ? '🥒' :
                       '🌱'}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{harvest.plantName}</div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-3">
                          <Calendar size={14} />
                          {format(parseISO(harvest.date), 'dd MMM yyyy', { locale: it })}
                        </span>
                        <span className="font-medium">{harvest.quantity} {harvest.unit}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xl md:text-2xl">
                    {getQualityEmoji(harvest.rating)}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
