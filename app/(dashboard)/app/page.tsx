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
import { UserOnboardingWizard } from '@/components/onboarding/UserOnboardingWizard'
import type { OnboardingData } from '@/components/onboarding/UserOnboardingWizard'
import { Garden, GardenTask } from '@/types'
import { useRouter } from 'next/navigation'
import { attemptAutoRestore, AutoRestoreResult } from '@/services/autoRestoreService'
import { CheckCircle, Loader2, LogIn, UserPlus } from 'lucide-react'
import { getSupabaseClient } from '@/config/supabase'
import Link from 'next/link'
import { isBypassActive } from '@/lib/auth-bypass'

export default function DashboardPage() {
  const { tier, isPro } = useTier()
  const { storageProvider, isInitialized } = useStorage()
  const router = useRouter()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [tasks, setTasks] = useState<GardenTask[]>([])
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showUserOnboarding, setShowUserOnboarding] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [restoreResult, setRestoreResult] = useState<AutoRestoreResult | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  // Verifica autenticazione - DISABILITATO BYPASS ONLINE
  useEffect(() => {
    const checkAuth = async () => {
      // Controlla se siamo online (non localhost)
      const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
      const isOnline = hostname !== 'localhost' && 
        hostname !== '127.0.0.1' &&
        hostname !== '[::1]' &&
        !hostname.includes('localhost') &&
        hostname !== ''
      
      console.log('[Dashboard Auth] Hostname:', hostname, 'isOnline:', isOnline)

      // Se siamo online, bypass disabilitato - richiedi sempre autenticazione
      if (isOnline) {
        console.log('[Dashboard Auth] Online mode - requiring authentication')
        try {
          const supabase = getSupabaseClient()
          if (supabase) {
            const { data: { session }, error } = await supabase.auth.getSession()
            if (error) {
              console.error('[Dashboard Auth] Error checking session:', error)
              // Rimuovi sessione invalida
              await supabase.auth.signOut()
              setIsAuthenticated(false)
              return
            }
            // Verifica che la sessione sia valida e non scaduta
            const now = Math.floor(Date.now() / 1000)
            const isValidSession = session?.user && 
              session.expires_at && 
              session.expires_at > now
            
            console.log('[Dashboard Auth] Session exists:', !!session, 'Valid:', isValidSession, 'Expires at:', session?.expires_at, 'Now:', now)
            
            if (!isValidSession && session) {
              // Sessione scaduta, rimuovila
              console.log('[Dashboard Auth] Invalid session, signing out')
              await supabase.auth.signOut()
            }
            
            setIsAuthenticated(isValidSession || false)
          } else {
            console.log('[Dashboard Auth] Supabase not configured')
            setIsAuthenticated(false)
          }
        } catch (error) {
          console.error('[Dashboard Auth] Error checking auth:', error)
          setIsAuthenticated(false)
        }
        return
      }

      // In locale, controlla bypass solo se esplicitamente configurato
      if (isBypassActive()) {
        setIsAuthenticated(true)
        return
      }

      try {
        const supabase = getSupabaseClient()
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession()
          setIsAuthenticated(!!session?.user)
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        setIsAuthenticated(false)
      }
    }
    
    checkAuth()
    
    // Ascolta cambiamenti autenticazione
    const isOnline = typeof window !== 'undefined' && 
      window.location.hostname !== 'localhost' && 
      window.location.hostname !== '127.0.0.1' &&
      window.location.hostname !== '[::1]'

    if (!isBypassActive() || isOnline) {
      const supabase = getSupabaseClient()
      if (supabase) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          setIsAuthenticated(!!session?.user)
        })
        
        return () => {
          subscription.unsubscribe()
        }
      }
    }
  }, [])

  // Reindirizza al login se non autenticato
  useEffect(() => {
    const isOnline = typeof window !== 'undefined' && 
      window.location.hostname !== 'localhost' && 
      window.location.hostname !== '127.0.0.1' &&
      window.location.hostname !== '[::1]'

    // Online: sempre richiedi autenticazione
    // Locale: richiedi autenticazione a meno che bypass non sia esplicitamente attivo
    const shouldRequireAuth = isOnline || !isBypassActive()
    
    if (isAuthenticated === false && !loading && shouldRequireAuth) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

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
        
        // Check if user has completed onboarding
        const hasCompletedUserOnboarding = localStorage.getItem('ortomio_user_onboarding_completed') === 'true'
        
        // Mostra dashboard anche senza giardino - wizard inline invece di modal
        // User onboarding solo se primo accesso
        if (loadedGardens.length === 0 && isAuthenticated !== false && !hasCompletedUserOnboarding) {
          setShowUserOnboarding(true)
        }
        // Non mostrare più garden onboarding come modal - sarà inline nella dashboard
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
      console.log('Starting garden creation...', garden.name);
      const createdGarden = await storageProvider.createGarden(garden)
      console.log('Garden created successfully:', createdGarden.id);
      
      // Ricarica esplicitamente i giardini dal database invece di fare refresh completo
      const updatedGardens = await storageProvider.getGardens()
      console.log('Loaded gardens after creation:', updatedGardens.length);
      setGardens(updatedGardens)
      
      // Se ci sono giardini, carica anche i task del primo giardino
      if (updatedGardens.length > 0) {
        try {
          const gardenTasks = await storageProvider.getTasks(updatedGardens[0].id)
          setTasks(gardenTasks || [])
          console.log('Loaded tasks for garden:', gardenTasks?.length || 0);
        } catch (taskError) {
          console.error('Error loading tasks after garden creation:', taskError);
          // Non bloccare il flusso se il caricamento dei task fallisce
        }
      }
      
      setShowOnboarding(false)
      // Non usare router.refresh() - aggiorna solo lo stato locale
      // router.refresh() può causare problemi con il caricamento e mostrare di nuovo il wizard
    } catch (error: any) {
      console.error('Error creating garden:', error)
      const errorMessage = error?.message || 'Errore nella creazione dell\'orto'
      
      // Se è un errore di autenticazione, prova con LocalStorageProvider
      if (errorMessage.includes('not authenticated') || errorMessage.includes('User not authenticated')) {
        try {
          // Ottieni LocalStorageProvider direttamente
          const { getLocalStorageProvider } = await import('@/packages/core/storage/factory')
          const localProvider = getLocalStorageProvider()
          
          // Prova a creare con LocalStorageProvider
          await localProvider.createGarden(garden)
          const updatedGardens = await localProvider.getGardens()
          setGardens(updatedGardens)
          
          // Carica task se ci sono giardini
          if (updatedGardens.length > 0) {
            const gardenTasks = await localProvider.getTasks(updatedGardens[0].id)
            setTasks(gardenTasks || [])
          }
          
          setShowOnboarding(false)
          
          // Mostra messaggio informativo
          alert('Orto creato e salvato localmente. Per sincronizzare su più dispositivi, effettua il login.')
          // Non usare router.refresh() qui
        } catch (localError: any) {
          console.error('Error creating garden with LocalStorageProvider:', localError)
          alert(`Errore nella creazione dell'orto: ${localError?.message || 'Errore sconosciuto'}`)
          // Mantieni showOnboarding a true per permettere di riprovare
          setShowOnboarding(true)
        }
      } else {
        alert(`Errore nella creazione dell'orto: ${errorMessage}`)
        // Mantieni showOnboarding a true per permettere di riprovare
        setShowOnboarding(true)
      }
    }
  }

  const handleOnboardingCancel = () => {
    setShowOnboarding(false)
  }

  const handleUserOnboardingComplete = async (data: OnboardingData) => {
    try {
      // Save user name
      if (data.userName) {
        localStorage.setItem('ortomio_user_name', data.userName)
      }
      
      // Mark onboarding as completed
      localStorage.setItem('ortomio_user_onboarding_completed', 'true')
      
      // If garden was created in step 6, reload gardens
      if (data.garden) {
        const updatedGardens = await storageProvider.getGardens()
        setGardens(updatedGardens)
        if (updatedGardens.length > 0) {
          const gardenTasks = await storageProvider.getTasks(updatedGardens[0].id)
          setTasks(gardenTasks || [])
        }
      }
      
      setShowUserOnboarding(false)
      
      // If no garden was created, show garden onboarding
      if (!data.garden) {
        setShowOnboarding(true)
      }
    } catch (error) {
      console.error('Error completing user onboarding:', error)
      alert('Errore nel completamento dell\'onboarding. Riprova.')
    }
  }

  const handleUserOnboardingCancel = () => {
    // Allow user to skip onboarding
    localStorage.setItem('ortomio_user_onboarding_completed', 'true')
    setShowUserOnboarding(false)
    if (gardens.length === 0) {
      setShowOnboarding(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    )
  }

  // Se utente non autenticato, mostra messaggio di attesa durante reindirizzamento
  const isOnline = typeof window !== 'undefined' && 
    window.location.hostname !== 'localhost' && 
    window.location.hostname !== '127.0.0.1' &&
    window.location.hostname !== '[::1]'
  
  const shouldRequireAuth = isOnline || !isBypassActive()
  
  if (isAuthenticated === false && !loading && shouldRequireAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Benvenuto in OrtoMio</h1>
          <p className="text-gray-600 mb-6">
            Reindirizzamento al login...
          </p>
        </div>
      </div>
    )
  }

  // Mostra user onboarding se primo accesso
  if (showUserOnboarding) {
    return (
      <div className="min-h-screen">
        <UserOnboardingWizard
          onComplete={handleUserOnboardingComplete}
          onCancel={handleUserOnboardingCancel}
        />
      </div>
    )
  }

  // Mostra garden onboarding se non ci sono giardini (e utente autenticato o ha scelto di continuare)
  if (showOnboarding || (gardens.length === 0 && isAuthenticated !== false && !loading && !showUserOnboarding)) {
    return (
      <div className="min-h-screen">
        <GardenOnboarding
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
            // Se l'orto aggiornato è quello attivo, ricarica i task
            if (updatedGarden.id === gardens[0]?.id) {
              const updatedTasks = await storageProvider.getTasks(updatedGarden.id)
              setTasks(updatedTasks || [])
            }
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
      {isPro && gardens.length === 0 && (
        <ProfessionalDashboard />
      )}
    </>
  )
}

