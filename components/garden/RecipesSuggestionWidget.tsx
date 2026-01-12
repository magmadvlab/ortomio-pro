/**
 * RecipesSuggestionWidget - Widget per suggerimenti ricette integrato
 * Appare automaticamente quando si registra un raccolto
 */

import React, { useState, useEffect } from 'react'
import { ChefHat, Clock, Users, Sparkles, X, ExternalLink } from 'lucide-react'
import { getRecipesForHarvest, Recipe } from '@/services/recipeService'
import Link from 'next/link'

interface RecipesSuggestionWidgetProps {
  plantName: string
  quantity: number
  unit: string
  onClose?: () => void
  compact?: boolean
}

export default function RecipesSuggestionWidget({
  plantName,
  quantity,
  unit,
  onClose,
  compact = false
}: RecipesSuggestionWidgetProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRecipes()
  }, [plantName, quantity, unit])

  const loadRecipes = async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedRecipes = await getRecipesForHarvest(plantName, quantity, unit)
      setRecipes(fetchedRecipes.slice(0, compact ? 2 : 3)) // Limita per versione compatta
    } catch (err) {
      console.error('Errore caricamento ricette:', err)
      setError('Impossibile caricare le ricette')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4 ${compact ? 'mb-4' : 'mb-6'}`}>
        <div className="flex items-center gap-2 mb-2">
          <ChefHat className="text-orange-600" size={20} />
          <span className="text-sm font-medium text-orange-800">Caricamento ricette...</span>
        </div>
        <div className="animate-pulse">
          <div className="h-3 bg-orange-200 rounded mb-2"></div>
          <div className="h-3 bg-orange-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (error || recipes.length === 0) {
    return null // Non mostrare nulla se non ci sono ricette
  }

  return (
    <div className={`bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4 ${compact ? 'mb-4' : 'mb-6'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ChefHat className="text-orange-600" size={20} />
          <h3 className="font-semibold text-orange-800">
            {compact ? 'Ricette suggerite' : `Ricette per ${plantName}`}
          </h3>
          <Sparkles className="text-yellow-500" size={16} />
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-orange-400 hover:text-orange-600 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className={`space-y-3 ${compact ? 'max-h-32 overflow-y-auto' : ''}`}>
        {recipes.map((recipe, index) => (
          <div key={index} className="bg-white rounded-lg p-3 shadow-sm border border-orange-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{recipe.name}</h4>
                <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                  {recipe.prepTime && (
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{recipe.prepTime}</span>
                    </div>
                  )}
                  {recipe.servings && (
                    <div className="flex items-center gap-1">
                      <Users size={12} />
                      <span>{recipe.servings} porzioni</span>
                    </div>
                  )}
                </div>
                {!compact && (
                  <div className="text-xs text-gray-600">
                    <strong>Ingredienti principali:</strong> {recipe.ingredients.slice(0, 3).join(', ')}
                    {recipe.ingredients.length > 3 && '...'}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-orange-200">
        <div className="flex items-center justify-between">
          <span className="text-xs text-orange-700">
            💡 Valorizza il tuo raccolto con ricette tradizionali
          </span>
          <Link
            href="/app/recipes"
            className="text-xs text-orange-600 hover:text-orange-800 font-medium flex items-center gap-1"
          >
            Vedi tutte <ExternalLink size={12} />
          </Link>
        </div>
      </div>
    </div>
  )
}