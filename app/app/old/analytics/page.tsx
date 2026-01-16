'use client'

import React, { useState, useEffect } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { useTier } from '@/packages/core/hooks/useTier'
import { AppTier } from '@/packages/core/config/tiers'
import { ProFeatureGate } from '@/components/shared/ProFeatureGate'
import { AnalyticsTable } from '@/components/professional/AnalyticsTable'
import { ROISummary } from '@/components/professional/ROISummary'
import HarvestAnalytics from '@/components/HarvestAnalytics'
import { HarvestLogData, Garden } from '@/types'
import { BarChart3, TrendingUp } from 'lucide-react'
import { getMarketPrice } from '@/data/marketPrices'

export default function AnalyticsPage() {
  const { storageProvider } = useStorage()
  const { tier, isPro, isPlus } = useTier()
  const [harvests, setHarvests] = useState<HarvestLogData[]>([])
  const [gardens, setGardens] = useState<Garden[]>([])
  const [selectedGarden, setSelectedGarden] = useState<Garden | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedGardens = await storageProvider.getGardens()
        setGardens(loadedGardens)
        if (loadedGardens.length > 0) {
          const garden = loadedGardens[0]
          setSelectedGarden(garden)
          const harvestLogs = await storageProvider.getHarvestLogs(garden.id)
          setHarvests(harvestLogs || [])
        }
      } catch (error) {
        console.error('Error loading analytics data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [storageProvider])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    )
  }

  // PRO: mostra analytics avanzate dettagliate (solo PRO, non PLUS)
  if (isPro && tier === 'PRO') {
    // Calcola dati per ROI Summary e Analytics Table dai raccolti
    const analyticsData = harvests.map(h => {
      // Calcola kg dalla quantità e unità
      let kg = 0;
      if (h.unit === 'kg') {
        kg = h.quantity || 0;
      } else if (h.unit === 'g') {
        kg = (h.quantity || 0) / 1000;
      } else {
        kg = (h.quantity || 0) * 0.1; // stima per units
      }
      
      // Calcola marketValue dal prezzo di mercato
      const harvestDate = new Date(h.date);
      const month = harvestDate.getMonth();
      const season = (month >= 5 && month <= 8) ? 'Summer' : 'Winter';
      const marketValue = h.plantName ? getMarketPrice(h.plantName, season) : 0;
      
      // Stima costi (simplificato)
      const costPerKg = 0.15; // €0.15 per kg (acqua + concime)
      
      // Calcola revenue e costs
      const revenue = marketValue * kg;
      const costs = costPerKg * kg;
      const roi = costs > 0 ? ((revenue - costs) / costs) * 100 : 0;
      
      return {
        crop: h.plantName || 'Unknown',
        kg: kg,
        revenue: revenue,
        costs: costs,
        roi: roi,
        yieldPerSqm: 0, // Non disponibile senza areaSqm
      };
    })

    const totalRevenue = analyticsData.reduce((sum, d) => sum + d.revenue, 0)
    const totalCosts = analyticsData.reduce((sum, d) => sum + d.costs, 0)
    const roiPercentage = totalCosts > 0 ? ((totalRevenue - totalCosts) / totalCosts) * 100 : 0
    const totalYield = analyticsData.reduce((sum, d) => sum + d.kg, 0)

    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <BarChart3 className="text-green-600" size={32} />
              Analytics Dettagliate
            </h1>
            <p className="text-gray-600">
              Analisi approfondite dei raccolti, trend temporali e performance per coltura
            </p>
          </div>

          {/* Selezione Giardino */}
          {gardens.length > 1 && (
            <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleziona Giardino
              </label>
              <select
                value={selectedGarden?.id || ''}
                onChange={(e) => {
                  const garden = gardens.find(g => g.id === e.target.value)
                  setSelectedGarden(garden || null)
                  if (garden) {
                    storageProvider.getHarvestLogs(garden.id).then(logs => {
                      setHarvests(logs || [])
                    })
                  }
                }}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {gardens.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Harvest Analytics Detail - Grafici e Trend */}
          {selectedGarden && harvests.length > 0 ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="text-green-600" size={24} />
                  Analisi Raccolti e Trend
                </h2>
                <HarvestAnalytics 
                  harvests={harvests} 
                  gardenId={selectedGarden.id}
                />
              </div>

              {/* ROI Summary con dati calcolati */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">ROI e Metriche Finanziarie</h2>
                <ROISummary 
                  data={{
                    totalRevenue,
                    totalCosts,
                    roiPercentage,
                    totalYield,
                  }}
                />
              </div>

              {/* Analytics Table con dati calcolati */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance per Coltura</h2>
                <AnalyticsTable data={analyticsData} />
              </div>
            </>
          ) : selectedGarden && harvests.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nessun dato di raccolto disponibile
              </h3>
              <p className="text-gray-600">
                Inizia a registrare i tuoi raccolti per vedere le analisi dettagliate
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Seleziona un giardino
              </h3>
              <p className="text-gray-600">
                Seleziona un giardino per visualizzare le analisi
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // PLUS: mostra analytics raccolti
  if (isPlus) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Analytics Raccolti</h1>
          {selectedGarden && (
            <HarvestAnalytics 
              harvests={harvests} 
              gardenId={selectedGarden.id}
            />
          )}
        </div>
      </div>
    )
  }

  // FREE: mostra feature gate
  return (
    <div className="min-h-screen">
      <ProFeatureGate
        feature="analytics"
        title="Analytics Avanzate"
        description="Visualizza analisi dettagliate dei tuoi raccolti, ROI e performance"
        requiredTier="PLUS"
        showPreview={true}
      >
        {selectedGarden && (
          <div className="p-6">
            <HarvestAnalytics 
              harvests={harvests} 
              gardenId={selectedGarden.id}
            />
          </div>
        )}
      </ProFeatureGate>
    </div>
  )
}

