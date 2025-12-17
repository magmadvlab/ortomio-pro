'use client'

import React, { useState, useEffect } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { useTier } from '@/packages/core/hooks/useTier'
import { ProFeatureGate } from '@/components/shared/ProFeatureGate'
import { ChefHat, Search, Loader2, Sparkles } from 'lucide-react'
import { HarvestLogData } from '@/types'

export default function RecipesPage() {
  const { storageProvider } = useStorage()
  const { isPro } = useTier()
  const [harvests, setHarvests] = useState<HarvestLogData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [generating, setGenerating] = useState(false)
  const [recipe, setRecipe] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadHarvests()
  }, [storageProvider])

  const loadHarvests = async () => {
    try {
      setLoading(true)
      const gardens = await storageProvider.getGardens()
      if (gardens.length > 0) {
        const harvestLogs = await storageProvider.getHarvestLogs(gardens[0].id)
        setHarvests(harvestLogs || [])
      }
    } catch (error) {
      console.error('Error loading harvests:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateRecipe = async () => {
    if (!searchQuery.trim()) {
      setError('Inserisci almeno un ingrediente')
      return
    }

    try {
      setGenerating(true)
      setError(null)
      setRecipe(null)

      const response = await fetch('/api/ai/recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: searchQuery,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Errore nella generazione ricetta')
      }

      setRecipe(data.recipe)
    } catch (err: any) {
      setError(err.message || 'Errore nella generazione ricetta')
    } finally {
      setGenerating(false)
    }
  }

  const suggestedIngredients = harvests
    .filter(h => h.quantity && h.quantity > 0 && h.plantName)
    .slice(0, 10)
    .map(h => h.plantName!)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto">
      <ProFeatureGate
        feature="recipes"
        title="Ricette AI"
        description="Genera ricette personalizzate con i tuoi raccolti"
        requiredTier="PRO"
      >
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <ChefHat className="text-orange-600" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ricette AI</h1>
              <p className="text-gray-600">Genera ricette personalizzate con i tuoi raccolti</p>
            </div>
          </div>
        </div>

        {/* Ricerca Ingredienti */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ingredienti Disponibili
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Es: pomodori, basilico, aglio..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                onKeyPress={(e) => e.key === 'Enter' && generateRecipe()}
              />
              <button
                onClick={generateRecipe}
                disabled={generating}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Genera Ricetta
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Ingredienti Suggeriti */}
          {suggestedIngredients.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Dai tuoi raccolti:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedIngredients.map((ingredient, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const current = searchQuery.split(',').map(s => s.trim()).filter(Boolean)
                      if (!current.includes(ingredient)) {
                        setSearchQuery([...current, ingredient].join(', '))
                      }
                    }}
                    className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm hover:bg-green-100 transition-colors"
                  >
                    + {ingredient}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Errore */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Ricetta Generata */}
        {recipe && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ricetta Generata</h2>
            <div className="prose max-w-none">
              {typeof recipe === 'string' ? (
                <pre className="whitespace-pre-wrap text-gray-700">{recipe}</pre>
              ) : (
                <div>
                  {recipe.name && <h3 className="text-xl font-semibold mb-2">{recipe.name}</h3>}
                  {recipe.ingredients && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Ingredienti:</h4>
                      <ul className="list-disc list-inside">
                        {Array.isArray(recipe.ingredients) ? (
                          recipe.ingredients.map((ing: string, idx: number) => (
                            <li key={idx}>{ing}</li>
                          ))
                        ) : (
                          <li>{recipe.ingredients}</li>
                        )}
                      </ul>
                    </div>
                  )}
                  {recipe.preparation && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Preparazione:</h4>
                      <p className="whitespace-pre-wrap">{recipe.preparation}</p>
                    </div>
                  )}
                  {recipe.time && (
                    <p className="text-sm text-gray-600">Tempo: {recipe.time}</p>
                  )}
                  {recipe.difficulty && (
                    <p className="text-sm text-gray-600">Difficoltà: {recipe.difficulty}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Placeholder quando non c'è ricetta */}
        {!recipe && !error && !generating && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <ChefHat className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Genera la tua prima ricetta
            </h3>
            <p className="text-gray-600">
              Inserisci gli ingredienti che hai disponibili e genera una ricetta personalizzata
            </p>
          </div>
        )}
      </ProFeatureGate>
    </div>
  )
}

