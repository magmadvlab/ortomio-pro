'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { Garden, GardenTask } from '@/types'
import { ArrowLeft, Calendar } from 'lucide-react'
import Link from 'next/link'
import { EnvironmentalPlanningSection } from '@/components/sunExposure/EnvironmentalPlanningSection'

export default function GardenPlanningPage() {
  const { storageProvider } = useStorage()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [gardens, setGardens] = useState<Garden[]>([])
  const [selectedGarden, setSelectedGarden] = useState<Garden | null>(null)
  const [tasks, setTasks] = useState<GardenTask[]>([])
  const [loading, setLoading] = useState(true)

  const gardenId = searchParams.get('garden')

  useEffect(() => {
    const loadData = async () => {
      try {
        const allGardens = await storageProvider.getGardens()
        const specializedTypes = ['Orchard', 'OliveGrove', 'Vineyard']
        const loadedGardens = allGardens.filter(g => !specializedTypes.includes(g.gardenType || ''))
        setGardens(loadedGardens)

        const garden = gardenId
          ? loadedGardens.find(g => g.id === gardenId)
          : loadedGardens[0]

        if (garden) {
          setSelectedGarden(garden)
          const gardenTasks = await storageProvider.getTasks(garden.id)
          setTasks(gardenTasks || [])
        }
      } catch (error) {
        console.error('Error loading garden planning data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [storageProvider, gardenId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    )
  }

  if (!selectedGarden) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Nessun orto trovato</h2>
          <p className="text-gray-600 mb-6">Crea il tuo primo orto per vedere la pianificazione ambientale</p>
          <Link
            href="/app/settings?section=gardens"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Crea Orto
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href={`/app/garden?garden=${selectedGarden.id}`}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Calendar className="text-purple-600" size={24} />
                Pianificazione Ambientale
              </h1>
              <p className="text-gray-600 mt-1">{selectedGarden.name}</p>
            </div>
          </div>

          {gardens.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Seleziona Orto:</label>
              <select
                value={selectedGarden.id}
                onChange={(e) => {
                  const newGarden = gardens.find(g => g.id === e.target.value)
                  if (newGarden) {
                    router.push(`/app/garden/planning?garden=${newGarden.id}`)
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {gardens.map(garden => (
                  <option key={garden.id} value={garden.id}>
                    {garden.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8">
        <EnvironmentalPlanningSection garden={selectedGarden} tasks={tasks} />
      </main>
    </div>
  )
}
