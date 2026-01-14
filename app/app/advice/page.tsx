'use client'

import { useState, useEffect } from 'react'
import { 
  Heart, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Droplets, 
  Bug, 
  Leaf, 
  Sun, 
  Calendar, 
  Bot,
  RefreshCw,
  Recycle,
  Snowflake
} from 'lucide-react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { Garden, GardenTask } from '@/types'
import CropRotationPlanner from '@/components/advice/CropRotationPlanner'
import BiologicalControlDashboard from '@/components/advice/BiologicalControlDashboard'

interface HealthAlert {
  id: string
  type: 'disease' | 'pest' | 'nutrient' | 'water' | 'weather'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  plant?: string
  action: string
  date: string
}

interface HealthTip {
  id: string
  category: 'prevention' | 'treatment' | 'nutrition' | 'seasonal'
  title: string
  description: string
  icon: React.ComponentType<any>
}

export default function AdvicePage() {
  const { storageProvider } = useStorage()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [tasks, setTasks] = useState<GardenTask[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'rotation' | 'biological' | 'composter' | 'winter'>('rotation')

  // Mock data per le allerte di salute
  const healthAlerts: HealthAlert[] = [
    {
      id: '1',
      type: 'disease',
      severity: 'high',
      title: 'Possibile Peronospora',
      description: 'Macchie giallastre sulle foglie di pomodoro rilevate',
      plant: 'Pomodori',
      action: 'Applicare fungicida preventivo e migliorare aerazione',
      date: '2024-01-12'
    },
    {
      id: '2',
      type: 'pest',
      severity: 'medium',
      title: 'Afidi su Peperoni',
      description: 'Presenza di afidi verdi sulle foglie giovani',
      plant: 'Peperoni',
      action: 'Trattamento con sapone molle o olio di neem',
      date: '2024-01-11'
    },
    {
      id: '3',
      type: 'nutrient',
      severity: 'low',
      title: 'Carenza di Azoto',
      description: 'Foglie basali ingiallite su lattuga',
      plant: 'Lattuga',
      action: 'Fertilizzazione con concime ricco di azoto',
      date: '2024-01-10'
    }
  ]

  // Active advice cards with action tracking
  const activeAdviceCards = [
    {
      id: 'rotation',
      title: 'Rotazione delle Colture',
      description: 'Pianifica la rotazione basata sulla memoria storica dei filari',
      icon: RefreshCw,
      color: 'green',
      actionRequired: true,
      actionText: 'Pianifica Rotazione',
      features: [
        'Memoria storica colture per filare',
        'Suggerimenti AI basati su famiglia botanica',
        'Prevenzione malattie del suolo',
        'Ottimizzazione fertilità'
      ]
    },
    {
      id: 'biological',
      title: 'Controllo Biologico',
      description: 'Checklist pratiche biologiche per certificazioni',
      icon: Bug,
      color: 'blue',
      actionRequired: true,
      actionText: 'Gestisci Checklist',
      features: [
        'Checklist insetti benefici',
        'Monitoraggio trappole',
        'Tracking per certificazioni BIO',
        'Report automatici per audit'
      ]
    },
    {
      id: 'composter',
      title: 'Compost Fatto in Casa',
      description: 'Gestione compostiera con validazione AI materiali',
      icon: Recycle,
      color: 'amber',
      actionRequired: false,
      actionText: 'Gestisci Compostiera',
      features: [
        'Validazione AI materiali',
        'Blocco materiale infetto',
        'Monitoraggio temperatura/umidità',
        'Health score e raccomandazioni'
      ]
    },
    {
      id: 'winter',
      title: 'Protezione Invernale',
      description: 'Alert automatici gelate con checklist protezione',
      icon: Snowflake,
      color: 'cyan',
      actionRequired: false,
      actionText: 'Vedi Protezioni',
      features: [
        'Trigger automatico da meteo',
        'Checklist urgenti per gelate',
        'Task con materiali necessari',
        'Valutazione efficacia'
      ]
    }
  ]

  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedGardens, loadedTasks] = await Promise.all([
          storageProvider.getGardens(),
          storageProvider.getTasks()
        ])
        setGardens(loadedGardens)
        setTasks(loadedTasks)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [storageProvider])

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string, text: string, border: string, hover: string }> = {
      green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        border: 'border-green-200',
        hover: 'hover:bg-green-100'
      },
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200',
        hover: 'hover:bg-blue-100'
      },
      amber: {
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        border: 'border-amber-200',
        hover: 'hover:bg-amber-100'
      },
      cyan: {
        bg: 'bg-cyan-50',
        text: 'text-cyan-600',
        border: 'border-cyan-200',
        hover: 'hover:bg-cyan-100'
      }
    }
    return colors[color] || colors.green
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Heart className="text-red-500" size={28} />
          Consigli AI Attivi
        </h1>
        <p className="text-gray-600 mt-1">Consigli azionabili integrati con il sistema</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'rotation', label: 'Rotazione Colture', icon: RefreshCw },
              { id: 'biological', label: 'Controllo Biologico', icon: Bug },
              { id: 'composter', label: 'Compostiera', icon: Recycle },
              { id: 'winter', label: 'Protezione Invernale', icon: Snowflake }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'rotation' && (
        <CropRotationPlanner />
      )}

      {activeTab === 'biological' && (
        <BiologicalControlDashboard />
      )}

      {activeTab === 'composter' && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Recycle className="mx-auto h-16 w-16 text-amber-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Gestione Compostiera</h2>
          <p className="text-gray-600 mb-6">
            Tracking compost con validazione AI materiali
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-amber-900 mb-2">Funzionalità:</h3>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>⚠️ Validazione AI - blocca materiale infetto</li>
              <li>⚠️ Warning materiale trattato chimicamente</li>
              <li>🌡️ Monitoraggio temperatura e umidità</li>
              <li>📊 Health score 0-100 con raccomandazioni</li>
              <li>⚖️ Bilanciamento rapporto C/N</li>
              <li>📅 Stima data maturazione</li>
            </ul>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Componente UI in sviluppo - Database e service già implementati
          </p>
        </div>
      )}

      {activeTab === 'winter' && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Snowflake className="mx-auto h-16 w-16 text-cyan-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Protezione Invernale</h2>
          <p className="text-gray-600 mb-6">
            Alert automatici gelate con checklist protezione
          </p>
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-cyan-900 mb-2">Funzionalità:</h3>
            <ul className="text-sm text-cyan-800 space-y-1">
              <li>🌡️ Trigger automatico da previsioni meteo</li>
              <li>⚠️ Urgenza automatica basata su temperatura</li>
              <li>📋 Checklist con task e materiali necessari</li>
              <li>📸 Foto protezioni applicate</li>
              <li>📊 Valutazione efficacia post-gelata</li>
              <li>📈 Report stagionale</li>
            </ul>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Componente UI in sviluppo - Database e service già implementati
          </p>
        </div>
      )}

      {/* Info Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeAdviceCards.map((card) => {
          const Icon = card.icon
          const colors = getColorClasses(card.color)
          
          return (
            <div
              key={card.id}
              className={`${colors.bg} border ${colors.border} rounded-lg p-6 ${colors.hover} transition-colors`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 ${colors.bg} rounded-lg`}>
                  <Icon className={colors.text} size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{card.title}</h3>
                    {card.actionRequired && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                        Azione richiesta
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{card.description}</p>
                  <ul className="text-xs text-gray-600 space-y-1 mb-4">
                    {card.features.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setActiveTab(card.id as any)}
                    className={`text-sm font-medium ${colors.text} hover:underline`}
                  >
                    {card.actionText} →
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}