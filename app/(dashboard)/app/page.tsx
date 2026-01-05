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
import { GardenTypeWizard } from '@/components/GardenTypeWizard'
import { Garden, GardenTask } from '@/types'
import { useRouter } from 'next/navigation'
import { attemptAutoRestore, AutoRestoreResult } from '@/services/autoRestoreService'
import { CheckCircle, Loader2, Plus, ArrowRight, Sparkles } from 'lucide-react'
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
  const [showGardenConfigWizard, setShowGardenConfigWizard] = useState(false)
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
      
      console.debug('[Dashboard Auth] Hostname:', hostname, 'isOnline:', isOnline)

      // Se siamo online, bypass disabilitato - richiedi sempre autenticazione
      if (isOnline) {
        console.debug('[Dashboard Auth] Online mode - requiring authentication')
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
              session.expires_at > now &&
              session.user.email_confirmed_at // Email deve essere verificata

            console.debug('[Dashboard Auth] Session exists:', !!session, 'Valid:', isValidSession, 'Email confirmed:', !!session?.user?.email_confirmed_at, 'Expires at:', session?.expires_at, 'Now:', now)

            if (!isValidSession && session) {
              // Sessione scaduta o email non verificata, rimuovila
              console.debug('[Dashboard Auth] Invalid session, signing out')
              await supabase.auth.signOut()
            }

            setIsAuthenticated(isValidSession ? true : false)
          } else {
            console.debug('[Dashboard Auth] Supabase not configured')
            setIsAuthenticated(false)
          }
        } catch (error) {
          console.error('[Dashboard Auth] Error checking auth:', error)
          setIsAuthenticated(false)
        }
        return
      }

      // In locale, controlla bypass solo se esplicitamente configurato
      // MA la verifica email è SEMPRE richiesta
      try {
        const supabase = getSupabaseClient()
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession()
          
          // Se c'è sessione ma email NON verificata, reindirizza a verify-email
          if (session?.user && !session.user.email_confirmed_at) {
            console.debug('[Dashboard Auth] Local mode - email not verified, redirecting')
            localStorage.setItem('ortomio_pending_verification_email', session.user.email || '')
            router.push(`/verify-email?email=${encodeURIComponent(session.user.email || '')}`)
            return
          }
          
          // Bypass attivo E email verificata (o nessuna sessione)
          if (isBypassActive() && (!session || session.user?.email_confirmed_at)) {
            setIsAuthenticated(true)
            return
          }
          
          setIsAuthenticated(!!session?.user && !!session.user.email_confirmed_at)
        } else {
          // Nessun Supabase configurato - bypass solo se attivo
          if (isBypassActive()) {
            setIsAuthenticated(true)
            return
          }
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        setIsAuthenticated(false)
      }
    }
    
    checkAuth()
    
    // Ascolta cambiamenti autenticazione - SEMPRE attivo per verificare email
    const supabase = getSupabaseClient()
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        // Se utente si autentica ma email non verificata, reindirizza
        if (session?.user && !session.user.email_confirmed_at) {
          console.debug('[Dashboard Auth] Auth state change - email not verified')
          localStorage.setItem('ortomio_pending_verification_email', session.user.email || '')
          router.push(`/verify-email?email=${encodeURIComponent(session.user.email || '')}`)
          return
        }
        setIsAuthenticated(!!session?.user && !!session?.user?.email_confirmed_at)
      })
      
      return () => {
        subscription.unsubscribe()
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
      router.push('/auth')
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
        
        // Carica giardini
        const loadedGardens = await storageProvider.getGardens()
        setGardens(loadedGardens)

        // 3. Carica tasks per il primo giardino
        if (loadedGardens.length > 0) {
          const gardenTasks = await storageProvider.getTasks(loadedGardens[0].id)
          setTasks(gardenTasks || [])
        }

        // 4. Controlla se è il primo accesso (mostra UserOnboarding)
        // Per utenti autenticati: controlla preferences nel database
        // Per utenti offline: controlla localStorage
        let hasCompletedOnboarding = false

        if (isAuthenticated) {
          // Utente autenticato: controlla nel database
          const supabase = getSupabaseClient()
          if (supabase) {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('preferences')
                .eq('id', user.id)
                .single()

              hasCompletedOnboarding = profile?.preferences?.onboarding_completed === true
            }
          }
        } else {
          // Utente offline: controlla localStorage
          hasCompletedOnboarding = localStorage.getItem('ortomio_user_onboarding_completed') === 'true'
        }

        if (!hasCompletedOnboarding && loadedGardens.length === 0) {
          setShowUserOnboarding(true)
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
      // Per utenti autenticati: salva nel database
      // Per utenti offline: salva in localStorage
      if (isAuthenticated) {
        const supabase = getSupabaseClient()
        if (supabase) {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            // Salva preferences nel database
            await supabase
              .from('profiles')
              .update({
                preferences: {
                  onboarding_completed: true,
                  user_name: data.userName,
                  user_type: data.userType,
                  garden_types: data.gardenTypes,
                  goals: data.goals
                }
              })
              .eq('id', user.id)
          }
        }
      } else {
        // Utente offline: salva in localStorage
        if (data.userName) {
          localStorage.setItem('ortomio_user_name', data.userName)
        }
        localStorage.setItem('ortomio_user_onboarding_completed', 'true')
      }

      // Save garden name for later use in GardenTypeWizard
      if (data.gardenName) {
        localStorage.setItem('ortomio_pending_garden_name', data.gardenName)
      }

      // Se l'utente vuole creare un orto (shouldCreateGarden = true), apri il wizard configurazione
      if (data.shouldCreateGarden) {
        setShowUserOnboarding(false)
        setShowGardenConfigWizard(true)
      } else {
        // Altrimenti vai direttamente alla dashboard
        setShowUserOnboarding(false)
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

  // Mostra loading durante redirect (il redirect vero è in useEffect linea 140)
  if (isAuthenticated === false && !loading && shouldRequireAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <Loader2 className="animate-spin text-green-600 mx-auto mb-4" size={48} />
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

  // Mostra wizard configurazione orto completa dopo user onboarding
  if (showGardenConfigWizard) {
    return (
      <div className="min-h-screen">
        <GardenTypeWizard
          onComplete={async (garden) => {
            // Garden già creato nello step 6, qui viene solo configurato
            // Ricarica gardens per avere dati aggiornati
            const updatedGardens = await storageProvider.getGardens()
            setGardens(updatedGardens)
            if (updatedGardens.length > 0) {
              const gardenTasks = await storageProvider.getTasks(updatedGardens[0].id)
              setTasks(gardenTasks || [])
            }
            setShowGardenConfigWizard(false)
          }}
          onCancel={() => {
            // Permetti di saltare la configurazione avanzata
            setShowGardenConfigWizard(false)
          }}
        />
      </div>
    )
  }

  // Mostra garden onboarding SOLO se esplicitamente richiesto (non automaticamente)
  if (showOnboarding) {
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
      
      {/* Dashboard vuota - Messaggio di benvenuto per utenti che hanno già fatto onboarding */}
      {/* Mostra questo SOLO se l'utente ha completato l'onboarding ma non ha orti */}
      {gardens.length === 0 && !isPro && !showUserOnboarding && (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <Sparkles className="text-green-600" size={40} />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Benvenuto in OrtoMio! 🌱
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Il tuo assistente intelligente per la coltivazione
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Inizia subito a coltivare
              </h2>
              <p className="text-gray-600 mb-4">
                Crea il tuo primo spazio di coltivazione e ricevi consigli personalizzati
                per ogni pianta, calendario delle attività e molto altro.
              </p>
              <ul className="text-left text-gray-700 space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                  <span>Pianificazione automatica delle semine</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                  <span>Calendario lunare e meteo integrato</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                  <span>Gestione completa di orto, frutteto e molto altro</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setShowGardenConfigWizard(true)}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700
                text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl
                transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Plus size={24} />
              <span className="text-lg">Crea il tuo primo spazio</span>
              <ArrowRight size={20} />
            </button>

            <p className="text-sm text-gray-500 mt-4">
              Potrai sempre modificare e aggiungere nuovi spazi in seguito
            </p>
          </div>
        </div>
      )}

      {/* Dashboard alternative per PRO (se necessario) */}
      {isPro && gardens.length === 0 && (
        <ProfessionalDashboard />
      )}
    </>
  )
}

