'use client'

import React, { useState, useEffect } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { ROISummary } from './ROISummary'
import { AnalyticsTable } from './AnalyticsTable'
import { TreatmentRegister } from './TreatmentRegister'
import GardenOnboarding from '@/components/GardenOnboarding'
import { Garden } from '@/types'
import { Plus, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function ProfessionalDashboard() {
  const { storageProvider } = useStorage()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const loadGardens = async () => {
      try {
        const loadedGardens = await storageProvider.getGardens()
        setGardens(loadedGardens)
        if (loadedGardens.length === 0) {
          setShowOnboarding(true)
        }
      } catch (error) {
        console.error('Error loading gardens:', error)
      } finally {
        setLoading(false)
      }
    }
    loadGardens()
  }, [storageProvider])

  const handleOnboardingComplete = async (garden: Garden) => {
    try {
      await storageProvider.createGarden(garden)
      const updatedGardens = await storageProvider.getGardens()
      setGardens(updatedGardens)
      setShowOnboarding(false)
    } catch (error) {
      console.error('Error creating garden:', error)
      alert('Errore nella creazione dell\'orto. Riprova.')
    }
  }

  const handleOnboardingCancel = () => {
    setShowOnboarding(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    )
  }

  if (showOnboarding || gardens.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GardenOnboarding
          existingGardensCount={gardens.length}
          onComplete={handleOnboardingComplete}
          onCancel={handleOnboardingCancel}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header minimale */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            Dashboard Aziendale
          </h1>
          <div className="flex gap-3">
            <a 
              href="/app/analytics" 
              className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded text-sm transition-colors"
            >
              Analytics Dettagliate →
            </a>
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm">
              Export CSV
            </button>
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm">
              Report PDF
            </button>
          </div>
        </div>
      </header>
      
      {/* Contenuto: riepilogo e overview */}
      <main className="p-6 space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Riepilogo:</strong> Questa è la dashboard principale con overview generale. 
            Per analisi dettagliate, grafici e trend temporali, visita la pagina <a href="/app/analytics" className="underline font-semibold">Analytics Dettagliate</a>.
          </p>
        </div>

        {/* ROI Summary - metriche immediate (riepilogo) */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Riepilogo ROI</h2>
          <ROISummary />
        </div>
        
        {/* Analytics Table - dati tabellari (riepilogo) */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Performance Colture (Riepilogo)</h2>
          <AnalyticsTable />
        </div>
        
        {/* Treatment Register - ultimi trattamenti */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Ultimi Trattamenti</h2>
          <TreatmentRegister limit={10} />
        </div>
      </main>
    </div>
  )
}

