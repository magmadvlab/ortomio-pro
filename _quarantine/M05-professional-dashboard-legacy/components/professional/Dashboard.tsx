'use client'

import React, { useState, useEffect } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { ROISummary } from './ROISummary'
import { AnalyticsTable } from './AnalyticsTable'
import { TreatmentRegister } from './TreatmentRegister'
import { GardenTypeWizard } from '@/components/GardenTypeWizard'
import { Garden } from '@/types'
import { Plus, Home, Scissors, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import Link from 'next/link'

export function ProfessionalDashboard() {
  const { storageProvider } = useStorage()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [upcomingPrunings, setUpcomingPrunings] = useState<any[]>([])

  useEffect(() => {
    const loadGardens = async () => {
      try {
        const loadedGardens = await storageProvider.getGardens()
        setGardens(loadedGardens)
        if (loadedGardens.length === 0) {
          setShowOnboarding(true)
        } else {
          // Carica prossime potature
          loadUpcomingPrunings(loadedGardens[0].id)
        }
      } catch (error) {
        console.error('Error loading gardens:', error)
      } finally {
        setLoading(false)
      }
    }
    loadGardens()
  }, [storageProvider])

  const loadUpcomingPrunings = async (gardenId: string) => {
    try {
      const mechanicalWorks = await storageProvider.getMechanicalWorks(gardenId)
      const pruningWorks = mechanicalWorks
        .filter(w => w.work_type.includes('Pruning') || w.work_type === 'OliveShredding')
        .map(w => ({
          ...w,
          work_date: new Date(w.work_date)
        }))
        .filter(w => w.work_date >= new Date())
        .sort((a, b) => a.work_date.getTime() - b.work_date.getTime())
        .slice(0, 5)
      
      setUpcomingPrunings(pruningWorks)
    } catch (error) {
      console.error('Error loading prunings:', error)
    }
  }

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
        <GardenTypeWizard
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
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
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
        {gardens.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Ultimi Trattamenti</h2>
            <TreatmentRegister garden={gardens[0]} limit={10} />
          </div>
        )}

        {/* Prossime Potature */}
        {upcomingPrunings.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                <Scissors className="text-green-600" size={20} />
                Prossime Potature
              </h2>
              <Link
                href="/app/mechanical-work?filter=Pruning"
                className="text-sm text-green-600 hover:text-green-800 flex items-center gap-3"
              >
                Vedi tutte
                <LinkIcon size={14} />
              </Link>
            </div>
            <div className="space-y-2">
              {upcomingPrunings.map((pruning, idx) => {
                const daysUntil = Math.ceil((pruning.work_date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                const isUrgent = daysUntil <= 7
                const isSoon = daysUntil <= 14
                
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border-2 flex items-center justify-between ${
                      isUrgent
                        ? 'bg-red-50 border-red-200'
                        : isSoon
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {pruning.work_metadata?.cropName || pruning.work_type}
                      </div>
                      <div className="text-sm text-gray-600">
                        {format(pruning.work_date, 'dd MMMM yyyy', { locale: it })}
                        {daysUntil > 0 && (
                          <span className="ml-2">
                            ({daysUntil} {daysUntil === 1 ? 'giorno' : 'giorni'})
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/app/mechanical-work?filter=Pruning`}
                      className="text-green-600 hover:text-green-800 text-sm flex items-center gap-3"
                    >
                      Dettagli
                      <LinkIcon size={14} />
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

