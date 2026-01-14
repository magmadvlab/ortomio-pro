'use client'

import React, { useState } from 'react'
import { Sprout, ArrowRight, ArrowLeft, CheckCircle, Lightbulb, MapPin, Calendar, Target, Wand2 } from 'lucide-react'

interface PlannerWizardProps {
  garden: any
  tasks: any[]
  onAddToJournal: (plantName: string, notes: string, variety?: string, method?: 'Seed' | 'Seedling', date?: string, taskType?: any, additionalData?: any) => void
  onUpdateTask: (task: any) => void
}

interface WizardStep {
  id: string
  title: string
  description: string
  completed: boolean
}

interface WizardData {
  objective: 'productivity' | 'variety' | 'sustainability' | 'beginner'
  space: 'small' | 'medium' | 'large'
  experience: 'beginner' | 'intermediate' | 'expert'
  preferences: string[]
  season: 'current' | 'next' | 'year'
  budget: 'low' | 'medium' | 'high'
}

export default function PlannerWizard({ garden, onAddToJournal }: PlannerWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [wizardData, setWizardData] = useState<WizardData>({
    objective: 'productivity',
    space: 'medium',
    experience: 'intermediate',
    preferences: [],
    season: 'current',
    budget: 'medium'
  })
  const [generatedPlan, setGeneratedPlan] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const steps: WizardStep[] = [
    {
      id: 'objective',
      title: 'Obiettivo',
      description: 'Qual è il tuo obiettivo principale?',
      completed: false
    },
    {
      id: 'space',
      title: 'Spazio',
      description: 'Quanto spazio hai a disposizione?',
      completed: false
    },
    {
      id: 'experience',
      title: 'Esperienza',
      description: 'Qual è il tuo livello di esperienza?',
      completed: false
    },
    {
      id: 'preferences',
      title: 'Preferenze',
      description: 'Che tipo di piante preferisci?',
      completed: false
    },
    {
      id: 'timing',
      title: 'Tempistiche',
      description: 'Quando vuoi iniziare?',
      completed: false
    },
    {
      id: 'budget',
      title: 'Budget',
      description: 'Qual è il tuo budget?',
      completed: false
    }
  ]

  const generatePlan = async () => {
    setIsGenerating(true)
    
    // Simula generazione piano AI
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const plan = {
      title: getPlanTitle(),
      description: getPlanDescription(),
      plants: getRecommendedPlants(),
      timeline: getTimeline(),
      budget: getBudgetBreakdown(),
      tips: getTips()
    }
    
    setGeneratedPlan(plan)
    setIsGenerating(false)
  }

  const getPlanTitle = () => {
    const objectives = {
      productivity: 'Piano Produttività Massima',
      variety: 'Piano Varietà e Biodiversità',
      sustainability: 'Piano Sostenibile ed Ecologico',
      beginner: 'Piano per Principianti'
    }
    return objectives[wizardData.objective]
  }

  const getPlanDescription = () => {
    return `Piano personalizzato per il tuo orto ${garden.name}, ottimizzato per ${wizardData.objective === 'productivity' ? 'massimizzare la produzione' : wizardData.objective === 'variety' ? 'diversificare le colture' : wizardData.objective === 'sustainability' ? 'pratiche sostenibili' : 'facilità di gestione'}.`
  }

  const getRecommendedPlants = () => {
    const basePlants = [
      { name: 'Lattuga', difficulty: 'Facile', season: 'Inverno-Primavera', yield: 'Alto' },
      { name: 'Ravanelli', difficulty: 'Facile', season: 'Tutto l\'anno', yield: 'Medio' },
      { name: 'Spinaci', difficulty: 'Facile', season: 'Inverno', yield: 'Alto' },
      { name: 'Pomodori', difficulty: 'Medio', season: 'Primavera-Estate', yield: 'Alto' },
      { name: 'Basilico', difficulty: 'Facile', season: 'Primavera-Estate', yield: 'Medio' },
      { name: 'Carote', difficulty: 'Medio', season: 'Primavera-Autunno', yield: 'Medio' }
    ]

    // Filtra in base alle preferenze
    let filteredPlants = basePlants

    if (wizardData.experience === 'beginner') {
      filteredPlants = filteredPlants.filter(p => p.difficulty === 'Facile')
    }

    if (wizardData.objective === 'productivity') {
      filteredPlants = filteredPlants.filter(p => p.yield === 'Alto')
    }

    return filteredPlants.slice(0, wizardData.space === 'small' ? 3 : wizardData.space === 'medium' ? 5 : 8)
  }

  const getTimeline = () => {
    const now = new Date()
    const timeline = []
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(now)
      date.setMonth(date.getMonth() + i)
      
      timeline.push({
        month: date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }),
        activities: i === 0 ? ['Preparazione terreno', 'Prime semine'] : 
                   i === 1 ? ['Trapianti', 'Semine successive'] :
                   i === 2 ? ['Manutenzione', 'Prime raccolte'] :
                   ['Raccolte', 'Nuove piantagioni']
      })
    }
    
    return timeline
  }

  const getBudgetBreakdown = () => {
    const budgets = {
      low: { total: '€50-100', seeds: '€20-30', tools: '€20-40', soil: '€10-30' },
      medium: { total: '€100-200', seeds: '€40-60', tools: '€40-80', soil: '€20-60' },
      high: { total: '€200-500', seeds: '€60-100', tools: '€80-200', soil: '€60-200' }
    }
    return budgets[wizardData.budget]
  }

  const getTips = () => [
    'Inizia con piante facili per acquisire esperienza',
    'Pianifica le rotazioni per mantenere il terreno fertile',
    'Tieni un diario delle attività per migliorare nel tempo',
    'Considera le consociazioni per ottimizzare lo spazio',
    'Prepara il terreno con anticipo per migliori risultati'
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      generatePlan()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleAddPlantToPlan = (plant: any) => {
    const today = new Date().toISOString().split('T')[0]
    const notes = `Piano AI: ${plant.name} - Difficoltà: ${plant.difficulty}
    
Stagione ottimale: ${plant.season}
Resa prevista: ${plant.yield}

Questo suggerimento è stato generato dal Wizard AI basandosi sulle tue preferenze:
- Obiettivo: ${wizardData.objective}
- Spazio: ${wizardData.space}
- Esperienza: ${wizardData.experience}
- Budget: ${wizardData.budget}`

    onAddToJournal(
      plant.name,
      notes,
      undefined,
      'Seed',
      today,
      'Sowing',
      {
        wizardGenerated: true,
        difficulty: plant.difficulty,
        expectedYield: plant.yield,
        season: plant.season
      }
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Objective
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Qual è il tuo obiettivo principale?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'productivity', title: 'Massima Produttività', desc: 'Ottenere il massimo raccolto', icon: '🎯' },
                { key: 'variety', title: 'Varietà e Biodiversità', desc: 'Coltivare molte specie diverse', icon: '🌈' },
                { key: 'sustainability', title: 'Sostenibilità', desc: 'Pratiche ecologiche e naturali', icon: '🌱' },
                { key: 'beginner', title: 'Facilità di Gestione', desc: 'Approccio semplice per iniziare', icon: '👶' }
              ].map(option => (
                <button
                  key={option.key}
                  onClick={() => setWizardData(prev => ({ ...prev, objective: option.key as any }))}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    wizardData.objective === option.key
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-2">{option.icon}</div>
                  <h4 className="font-medium text-gray-900">{option.title}</h4>
                  <p className="text-sm text-gray-600">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )

      case 1: // Space
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Quanto spazio hai a disposizione?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: 'small', title: 'Piccolo', desc: 'Balcone o piccolo giardino (<10m²)', icon: '🏠' },
                { key: 'medium', title: 'Medio', desc: 'Giardino di casa (10-50m²)', icon: '🏡' },
                { key: 'large', title: 'Grande', desc: 'Terreno ampio (>50m²)', icon: '🏞️' }
              ].map(option => (
                <button
                  key={option.key}
                  onClick={() => setWizardData(prev => ({ ...prev, space: option.key as any }))}
                  className={`p-4 border rounded-lg text-center transition-colors ${
                    wizardData.space === option.key
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-3xl mb-2">{option.icon}</div>
                  <h4 className="font-medium text-gray-900">{option.title}</h4>
                  <p className="text-sm text-gray-600">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )

      case 2: // Experience
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Qual è il tuo livello di esperienza?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: 'beginner', title: 'Principiante', desc: 'Prima esperienza con l\'orto', icon: '🌱' },
                { key: 'intermediate', title: 'Intermedio', desc: 'Qualche anno di esperienza', icon: '🌿' },
                { key: 'expert', title: 'Esperto', desc: 'Molti anni di coltivazione', icon: '🌳' }
              ].map(option => (
                <button
                  key={option.key}
                  onClick={() => setWizardData(prev => ({ ...prev, experience: option.key as any }))}
                  className={`p-4 border rounded-lg text-center transition-colors ${
                    wizardData.experience === option.key
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-3xl mb-2">{option.icon}</div>
                  <h4 className="font-medium text-gray-900">{option.title}</h4>
                  <p className="text-sm text-gray-600">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )

      case 3: // Preferences
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Che tipo di piante preferisci?</h3>
            <p className="text-gray-600">Seleziona tutte le opzioni che ti interessano</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { key: 'vegetables', title: 'Ortaggi', icon: '🥕' },
                { key: 'herbs', title: 'Erbe aromatiche', icon: '🌿' },
                { key: 'fruits', title: 'Frutti', icon: '🍅' },
                { key: 'flowers', title: 'Fiori commestibili', icon: '🌸' },
                { key: 'legumes', title: 'Legumi', icon: '🫘' },
                { key: 'leafy', title: 'Verdure a foglia', icon: '🥬' }
              ].map(option => (
                <button
                  key={option.key}
                  onClick={() => {
                    const newPrefs = wizardData.preferences.includes(option.key)
                      ? wizardData.preferences.filter(p => p !== option.key)
                      : [...wizardData.preferences, option.key]
                    setWizardData(prev => ({ ...prev, preferences: newPrefs }))
                  }}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    wizardData.preferences.includes(option.key)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <p className="text-sm font-medium text-gray-900">{option.title}</p>
                </button>
              ))}
            </div>
          </div>
        )

      case 4: // Timing
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Quando vuoi iniziare?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: 'current', title: 'Subito', desc: 'Iniziare con la stagione attuale', icon: '⚡' },
                { key: 'next', title: 'Prossima Stagione', desc: 'Pianificare per la primavera', icon: '🌸' },
                { key: 'year', title: 'Piano Annuale', desc: 'Pianificazione per tutto l\'anno', icon: '📅' }
              ].map(option => (
                <button
                  key={option.key}
                  onClick={() => setWizardData(prev => ({ ...prev, season: option.key as any }))}
                  className={`p-4 border rounded-lg text-center transition-colors ${
                    wizardData.season === option.key
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-3xl mb-2">{option.icon}</div>
                  <h4 className="font-medium text-gray-900">{option.title}</h4>
                  <p className="text-sm text-gray-600">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )

      case 5: // Budget
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Qual è il tuo budget?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: 'low', title: 'Economico', desc: '€50-100 per iniziare', icon: '💰' },
                { key: 'medium', title: 'Medio', desc: '€100-200 per un buon setup', icon: '💵' },
                { key: 'high', title: 'Investimento', desc: '€200+ per il massimo', icon: '💎' }
              ].map(option => (
                <button
                  key={option.key}
                  onClick={() => setWizardData(prev => ({ ...prev, budget: option.key as any }))}
                  className={`p-4 border rounded-lg text-center transition-colors ${
                    wizardData.budget === option.key
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-3xl mb-2">{option.icon}</div>
                  <h4 className="font-medium text-gray-900">{option.title}</h4>
                  <p className="text-sm text-gray-600">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (generatedPlan) {
    return (
      <div className="space-y-6">
        {/* Plan Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle size={24} />
            <h2 className="text-2xl font-bold">Piano Generato con Successo!</h2>
          </div>
          <h3 className="text-xl font-semibold mb-2">{generatedPlan.title}</h3>
          <p className="opacity-90">{generatedPlan.description}</p>
        </div>

        {/* Recommended Plants */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sprout size={16} />
            Piante Consigliate
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedPlan.plants.map((plant: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{plant.name}</h4>
                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <p>Difficoltà: {plant.difficulty}</p>
                  <p>Stagione: {plant.season}</p>
                  <p>Resa: {plant.yield}</p>
                </div>
                <button
                  onClick={() => handleAddPlantToPlan(plant)}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Aggiungi al Piano
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={16} />
            Timeline Consigliata
          </h3>
          
          <div className="space-y-4">
            {generatedPlan.timeline.map((period: any, index: number) => (
              <div key={index} className="flex items-start gap-4">
                <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium min-w-fit">
                  {period.month}
                </div>
                <div className="flex-1">
                  <ul className="text-sm text-gray-600 space-y-1">
                    {period.activities.map((activity: string, actIndex: number) => (
                      <li key={actIndex}>• {activity}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Budget & Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target size={16} />
              Budget Stimato
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Totale:</span>
                <span className="font-medium">{generatedPlan.budget.total}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Semi:</span>
                <span>{generatedPlan.budget.seeds}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Attrezzi:</span>
                <span>{generatedPlan.budget.tools}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Terreno/Vasi:</span>
                <span>{generatedPlan.budget.soil}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Lightbulb size={16} />
              Consigli del Wizard
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {generatedPlan.tips.map((tip: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">💡</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => {
              setGeneratedPlan(null)
              setCurrentStep(0)
            }}
            className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Genera Nuovo Piano
          </button>
        </div>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Wand2 className="animate-spin mx-auto text-purple-500 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Generando il tuo piano personalizzato...</h3>
          <p className="text-gray-600">L'AI sta analizzando le tue preferenze</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Wand2 className="text-purple-500" size={24} />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Wizard AI - Piano Personalizzato</h2>
            <p className="text-gray-600">Rispondi ad alcune domande per ottenere un piano su misura</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Passo {currentStep + 1} di {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="flex flex-wrap gap-2 mb-6">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                index < currentStep
                  ? 'bg-green-100 text-green-700'
                  : index === currentStep
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {index < currentStep && <CheckCircle size={12} className="inline mr-1" />}
              {step.title}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft size={16} />
          Indietro
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          {currentStep === steps.length - 1 ? (
            <>
              <Wand2 size={16} />
              Genera Piano AI
            </>
          ) : (
            <>
              Avanti
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}