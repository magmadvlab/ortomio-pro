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
import { CheckCircle, Loader2, LogIn, UserPlus } from 'lucide-react'
import { getSupabaseClient } from '@/config/supabase'
import Link from 'next/link'

export default function DashboardPage() {
  const { tier, isProfessional, isConsumer } = useTier()
  const { storageProvider, isInitialized } = useStorage()
  const router = useRouter()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [tasks, setTasks] = useState<GardenTask[]>([])
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [restoreResult, setRestoreResult] = useState<AutoRestoreResult | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  // Verifica autenticazione
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = getSupabaseClient()
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession()
          setIsAuthenticated(!!session?.user)
        } else {
          setIsAuthenticated(false) // Supabase non configurato = offline mode
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        setIsAuthenticated(false)
      }
    }
    
    checkAuth()
    
    // Ascolta cambiamenti autenticazione
    const supabase = getSupabaseClient()
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setIsAuthenticated(!!session?.user)
      })
      
      return () => {
        subscription.unsubscribe()
      }
    }
  }, [])

  useEffect(() => {
    // Aspetta che il provider sia inizializzato prima di usarlo
    if (!isInitialized) {
      return
    }
    
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
        
        // Mostra onboarding solo se ci sono giardini (non mostrare se utente non autenticato)
        if (loadedGardens.length === 0 && isAuthenticated !== false) {
          setShowOnboarding(true)
        }
      } catch (error) {
        console.error('Error initializing app:', error)
      } finally {
        setLoading(false)
      }
    }
    
    initializeApp()
  }, [storageProvider, tier, isInitialized, isAuthenticated])

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

  // Se utente non autenticato e nessun giardino, mostra opzione login
  if (isAuthenticated === false && gardens.length === 0 && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Benvenuto in OrtoMio</h1>
          <p className="text-gray-600 mb-6">
            Per iniziare, puoi registrarti per sincronizzare i tuoi dati su più dispositivi, 
            oppure continuare senza account usando solo il browser.
          </p>
          
          <div className="space-y-3 mb-6">
            <Link
              href="/register"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <UserPlus size={20} />
              Registrati
            </Link>
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <LogIn size={20} />
              Accedi
            </Link>
          </div>
          
          <button
            onClick={() => setShowOnboarding(true)}
            className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
          >
            Continua senza account →
          </button>
        </div>
      </div>
    )
  }

  // Mostra onboarding se non ci sono giardini (e utente autenticato o ha scelto di continuare)
  if (showOnboarding || (gardens.length === 0 && isAuthenticated !== false && !loading)) {
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

