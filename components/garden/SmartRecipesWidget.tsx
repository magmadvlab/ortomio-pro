import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ChefHat, Clock } from 'lucide-react'

import { getRecipesForHarvest, type Recipe } from '@/services/recipeService'
import type { GardenTask } from '@/types'

interface SmartRecipesWidgetProps {
  tasks: GardenTask[]
  className?: string
}

export default function SmartRecipesWidget({
  tasks,
  className = '',
}: SmartRecipesWidgetProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const recentHarvest = useMemo(() => {
    const threshold = Date.now() - 3 * 24 * 60 * 60 * 1000
    return tasks
      .flatMap(task => (task.harvestHistory || []).map(harvest => ({
        ...harvest,
        plantName: task.plantName,
      })))
      .filter(harvest => {
        const time = new Date(harvest.date).getTime()
        return Number.isFinite(time) && time >= threshold && time <= Date.now()
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
  }, [tasks])

  useEffect(() => {
    let active = true
    if (!recentHarvest) {
      setRecipes([])
      return
    }
    setLoading(true)
    getRecipesForHarvest(recentHarvest.plantName, recentHarvest.quantity, recentHarvest.unit)
      .then(result => {
        if (active) setRecipes(result.slice(0, 2))
      })
      .catch(error => {
        console.error('Errore caricamento ricette:', error)
        if (active) setRecipes([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [recentHarvest])

  if (!recentHarvest) return null

  return (
    <div className={`rounded-xl border border-orange-200 bg-orange-50 p-5 ${className}`}>
      <div className="mb-3 flex items-center gap-2 text-orange-900">
        <ChefHat size={20} />
        <h3 className="font-semibold">
          Idee per {recentHarvest.plantName} ({recentHarvest.quantity} {recentHarvest.unit})
        </h3>
      </div>
      {loading ? (
        <p className="text-sm text-orange-700">Cerco ricette adatte al raccolto...</p>
      ) : recipes.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {recipes.map(recipe => (
            <div key={recipe.name} className="rounded-lg border border-orange-100 bg-white p-3">
              <p className="font-medium text-gray-900">{recipe.name}</p>
              {recipe.prepTime && (
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-600">
                  <Clock size={12} /> {recipe.prepTime}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-orange-700">Nessuna ricetta disponibile per questo raccolto.</p>
      )}
      <Link href="/app/recipes" className="mt-3 inline-block text-sm font-medium text-orange-700">
        Esplora tutte le ricette →
      </Link>
    </div>
  )
}
