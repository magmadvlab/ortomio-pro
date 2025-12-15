'use client'

import React, { useState, useEffect } from 'react'
import { useTier } from '@/packages/core/hooks/useTier'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { AppTier } from '@/packages/core/config/tiers'
import { ConsumerDashboard } from '@/components/consumer/Dashboard'
import { ProfessionalDashboard } from '@/components/professional/Dashboard'
import { FreeDashboard } from '@/components/shared/FreeDashboard'
import { HomeDashboard } from '@/components/shared/HomeDashboard'
import GardenOnboarding from '@/components/GardenOnboarding'
import { Garden, GardenTask } from '@/types'
import { useRouter } from 'next/navigation'
import { attemptAutoRestore, AutoRestoreResult } from '@/services/autoRestoreService'
import { CheckCircle, Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { tier, isProfessional, isConsumer } = useTier()
  const { storageProvider } = useStorage()
  const router = useRouter()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [tasks, setTasks] = useState<GardenTask[]>([])
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [restoreResult, setRestoreResult] = useState<AutoRestoreResult | null>(null)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true)
        
        // 1. TENTA RIPRISTINO AUTOMATICO (se primo avvio e nessun dato locale)
        // Solo per FREE tier (PRO usa Supabase che sincronizza automaticamente)
        if (tier === AppTier.FREE) {
          try {
            const restoreAttempt = await attemptAutoRestore(storageProvider)
            
            if (restoreAttempt.restored) {
              setRestoring(true)
              setRestoreResult(restoreAttempt)
              
              // Nascondi banner dopo 3 secondi
              setTimeout(() => {
                setRestoring(false)
              }, 3000)
            }
          } catch (error) {
            console.error('Error attempting auto restore:', error)
            // Continua comunque con caricamento normale
          }
        }
        
        // 2. Carica giardini (dopo restore o normalmente)
        const loadedGardens = await storageProvider.getGardens()
        setGardens(loadedGardens)
        
        // 3. Carica tasks per il primo giardino
        if (loadedGardens.length > 0) {
          const gardenTasks = await storageProvider.getTasks(loadedGardens[0].id)
          setTasks(gardenTasks || [])
        }
        
        if (loadedGardens.length === 0) {
          setShowOnboarding(true)
        }
      } catch (error) {
        console.error('Error initializing app:', error)
      } finally {
        setLoading(false)
      }
    }
    
    initializeApp()
  }, [storageProvider, tier])

  const handleOnboardingComplete = async (garden: Garden) => {
    try {
      await storageProvider.createGarden(garden)
      const updatedGardens = await storageProvider.getGardens()
      setGardens(updatedGardens)
      setShowOnboarding(false)
      // Ricarica la pagina per aggiornare i dati
      router.refresh()
    } catch (error: any) {
      console.error('Error creating garden:', error)
      const errorMessage = error?.message || 'Errore nella creazione dell\'orto'
      
      // Se è un errore di autenticazione, suggerisci di autenticarsi o usa localStorage
      if (errorMessage.includes('not authenticated')) {
        alert('Per sincronizzare i dati su più dispositivi, effettua il login. Altrimenti i dati verranno salvati localmente.')
        // Riprova con il provider corrente (dovrebbe essere già LocalStorageProvider)
        // Il StorageContext dovrebbe aver già fatto il fallback
        router.refresh()
      } else {
        alert(`Errore nella creazione dell'orto: ${errorMessage}`)
      }
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

  // Mostra onboarding se non ci sono giardini
  if (showOnboarding || gardens.length === 0) {
    return (
      <div className="min-h-screen">
        <GardenOnboarding
          existingGardensCount={gardens.length}
          onComplete={handleOnboardingComplete}
          onCancel={handleOnboardingCancel}
        />
      </div>
    )
  }

  return (
    <>
      {/* Banner di ripristino automatico (se presente) */}
      {restoreResult?.restored && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 mx-4 mt-4 rounded-r-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-600" size={20} />
            <div className="flex-1">
              <p className="font-semibold text-green-800">
                Dati ripristinati automaticamente!
              </p>
              <p className="text-sm text-green-700">
                Ripristinati {restoreResult.gardensRestored || 0} giardino/i,{' '}
                {restoreResult.tasksRestored || 0} task,{' '}
                {restoreResult.harvestsRestored || 0} raccolti
                {restoreResult.backupUsed && (
                  <> dal backup del {new Date(restoreResult.backupUsed.timestamp).toLocaleDateString('it-IT')}</>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading durante restore */}
      {restoring && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <Loader2 className="animate-spin text-green-600 mx-auto mb-4" size={48} />
            <p className="text-center text-gray-700 font-semibold">
              Ripristino dati in corso...
            </p>
            <p className="text-center text-sm text-gray-500 mt-2">
              I tuoi progressi stanno essere ripristinati dal backup cloud
            </p>
          </div>
        </div>
      )}
      
      {/* Dashboard Home - Usa la nuova HomeDashboard per tutti i tier */}
      {gardens.length > 0 && (
        <HomeDashboard
          garden={gardens[0]}
          tasks={tasks}
          onUpdateGarden={async (updatedGarden) => {
            await storageProvider.updateGarden(updatedGarden.id, updatedGarden)
            const updatedGardens = await storageProvider.getGardens()
            setGardens(updatedGardens)
          }}
          onUpdateTask={async (task) => {
            await storageProvider.updateTask(task.id, task)
            if (gardens[0]) {
              const updatedTasks = await storageProvider.getTasks(gardens[0].id)
              setTasks(updatedTasks || [])
            }
          }}
        />
      )}
      
      {/* Dashboard alternative per PRO (se necessario) */}
      {isProfessional && gardens.length === 0 && (
        <ProfessionalDashboard />
      )}
    </>
  )
}

