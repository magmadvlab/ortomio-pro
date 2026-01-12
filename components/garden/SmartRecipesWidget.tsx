/**
 * SmartRecipesWidget - Widget intelligente per ricette
 * Si attiva automaticamente quando ci sono raccolti recenti
 */

import React, { useState, useEffect } from 'react'
import { ChefHat, Clock, Users, Sparkles, TrendingUp, ExternalLink, X } from 'lucide-react'
import { getRecipesForHarvest, Recipe } from '@/services/recipeService'
import { GardenTask, HarvestLogData } from '@/types'
import { format, isWithinInterval, subDays } from 'date-fns'
import { it } from 'date-fns/locale'
import Link from 'next/link'

interface SmartRecipesWidgetProps {
  tasks: GardenTask[]
  className?: string
  onDismiss?: () => void
}

interface RecentHarvest {
  plantName: string
  quantity: number
  unit: string
  date: string
  taskId: string
}

export default function SmartRecipesWidget({ 
  tasks, 
  className = '',
  onDismiss 
}: SmartRecipesWidgetProps) {
  const [recentHarvests, setRecentHarvests] = useState<RecentHarvest[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedHarvest, setSelectedHarvest] = useState<RecentHarvest | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    findRecentHarvests()
  }, [tasks])

  useEffect(() => {
    if (recentHarvests.length > 0 && !selectedHarvest) {
      // Seleziona automaticamente il raccolto più recente
      setSelectedHarvest(recentHarvests[0])
    }
  }, [recentHarvests])

  useEffect(() => {
    if (selectedHarvest) {
      loadRecipesForHarvest(selectedHarvest)
    }
  }, [selectedHarvest])

  const findRecentHarvests = () => {
    const now = new Date()
    const threeDaysAgo = subDays(now, 3)
    
    const harvests: RecentHarvest[] = []
    
    tasks.forEach(task => {
      if (task.harvestHistory && task.harvestHistory.length > 0) {
        task.harvestHistory.forEach(harvest => {
          const harvestDate = new Date(harvest.date)
          if (isWithinInterval(harvestDate, { start: threeDaysAgo, end: now })) {
            harvests.push({
              plantName: task.plantName,
              quantity: harvest.quantity,
              unit: harvest.unit,
              date: harvest.date,
              taskId: task.id
            })
          }
        })
      }
    })
    
    // Ordina per data più recente
    harvests.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    setRecentHarvests(harvests.slice(0, 5)) // Massimo 5 raccolti recenti
  }

  const loadRecipesForHarvest = async (harvest: RecentHarvest) => {
    try {
      setLoading(true)
      const fetchedRecipes = await getRecipesForHarvest(
        harvest.plantName,
        harvest.quantity,
        harvest.unit
      )
      setRecipes(fetchedRecipes.slice(0, 2)) // Massimo 2 ricette per il widget
    } catch (error) {
      console.error('Errore caricamento ricette:', error)
      setRecipes([])
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  // Non mostrare se non ci sono raccolti recenti o è stato dismisso
  if (recentHarvests.length === 0 || dismissed) {
    return null
  }

  return (
    <div className={`bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-5 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-2 rounded-lg">
            <ChefHat className="text-orange-600" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-orange-900">Ricette per i tuoi raccolti</h3>
            <p className="text-sm text-orange-700">
              Hai raccolto di recente, ecco alcune idee!
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-orange-400 hover:text-orange-600 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Selezione raccolto */}
      {recentHarvests.length > 1 && (
        <div className="mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {recentHarvests.map((harvest, index) => (
              <button
                key={`${harvest.taskId}-${index}`}
                onClick={() => setSelectedHarvest(harvest)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedHarvest === harvest
                    ? 'bg-orange-200 text-orange-800'
                    : 'bg-white text-orange-600 hover:bg-orange-100'
                }`}
              >
                {harvest.plantName} ({harvest.quantity}{harvest.unit})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ricette */}
      {loading ? (
        <div className="space-y-3">
          <div className="animate-pulse">
            <div className="h-4 bg-orange-200 rounded mb-2"></div>
            <div className="h-3 bg-orange-200 rounded w-3/4"></div>
          </div>
        </div>
      ) : recipes.length > 0 ? (
        <div className="space-y-3 mb-4">
          {recipes.map((recipe, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-orange-100">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">{recipe.name}</h4>
                <Sparkles className="text-yellow-500 flex-shrink-0" size={16} />
              </div>
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
              <p className="text-sm text-gray-600">
                <strong>Ingredienti:</strong> {recipe.ingredients.slice(0, 3).join(', ')}
                {recipe.ingredients.length > 3 && '...'}
              </p>
            </div>
          ))}
        </div>
      ) : selectedHarvest && (
        <div className="text-center py-4">
          <ChefHat className="mx-auto text-orange-300 mb-2" size={32} />
          <p className="text-sm text-orange-600">
            Nessuna ricetta trovata per {selectedHarvest.plantName}
          </p>
        </div>
      )}

      {/* Footer con link */}
      <div className="flex items-center justify-between pt-3 border-t border-orange-200">
        <div className="flex items-center gap-2 text-xs text-orange-700">
          <TrendingUp size={12} />
          <span>Valorizza i tuoi raccolti</span>
        </div>
        <Link
          href="/app/recipes"
          className="text-sm text-orange-600 hover:text-orange-800 font-medium flex items-center gap-1 transition-colors"
        >
          Esplora tutte <ExternalLink size={12} />
        </Link>
      </div>
    </div>
  )
}