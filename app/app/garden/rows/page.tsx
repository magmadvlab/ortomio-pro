'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { Garden } from '@/types'
import { ArrowLeft, Save, Trash2, Settings, Droplets, Sprout, Plus, Edit2 } from 'lucide-react'
import Link from 'next/link'

export default function GardenRowsPage() {
  const { storageProvider } = useStorage()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [gardens, setGardens] = useState<Garden[]>([])
  const [fieldRows, setFieldRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGarden, setSelectedGarden] = useState<Garden | null>(null)

  // URL parameters
  const gardenId = searchParams.get('garden')

  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedGardens = await storageProvider.getGardens()
        setGardens(loadedGardens)
        
        // Select garden from URL or first available
        const garden = gardenId 
          ? loadedGardens.find(g => g.id === gardenId)
          : loadedGardens[0]
        
        if (garden) {
          setSelectedGarden(garden)
          const rows = await storageProvider.getFieldRows(garden.id)
          setFieldRows(rows || [])
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [storageProvider, gardenId])

  const handleDeleteRow = async (rowId: string, rowName: string) => {
    if (!confirm(`Sei sicuro di voler eliminare il filare "${rowName}"?`)) return

    try {
      await storageProvider.deleteFieldRow(rowId)
      // Reload field rows
      if (selectedGarden) {
        const rows = await storageProvider.getFieldRows(selectedGarden.id)
        setFieldRows(rows || [])
      }
      alert('✅ Filare eliminato con successo')
    } catch (error) {
      console.error('Error deleting field row:', error)
      alert('❌ Errore durante l\'eliminazione del filare')
    }
  }

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
          <p className="text-gray-600 mb-6">Crea il tuo primo orto per gestire i filari</p>
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
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                href="/app"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  🌾 Filari Campo Aperto
                </h1>
                <p className="text-gray-600 mt-1">
                  {selectedGarden.name} • {fieldRows.length} filari configurati
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/app/garden/rows/edit?garden=${selectedGarden.id}`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                Nuovo Filare
              </Link>
              <Link
                href="/app/settings?section=gardens"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Settings size={16} />
                Impostazioni Orto
              </Link>
            </div>
          </div>

          {/* Garden Selector */}
          {gardens.length > 1 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Seleziona Orto:</label>
              <select
                value={selectedGarden.id}
                onChange={(e) => {
                  const newGarden = gardens.find(g => g.id === e.target.value)
                  if (newGarden) {
                    router.push(`/app/garden/rows?garden=${newGarden.id}`)
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

      {/* Content */}
      <main className="max-w-7xl mx-auto p-4">
        {fieldRows.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sprout className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nessun filare configurato</h3>
            <p className="text-gray-600 mb-6">
              Inizia creando il tuo primo filare per organizzare le coltivazioni del campo aperto
            </p>
            <Link
              href={`/app/garden/rows/edit?garden=${selectedGarden.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={20} />
              Crea Primo Filare
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <Sprout className="text-green-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Filari Totali</p>
                    <p className="text-2xl font-bold text-gray-900">{fieldRows.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <Droplets className="text-blue-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Con Irrigazione</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {fieldRows.filter(row => row.irrigationConfig?.enabled).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-purple-600 text-2xl">🌱</span>
                  <div>
                    <p className="text-sm text-gray-600">Coltivati</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {fieldRows.filter(row => row.cultivar).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-orange-600 text-2xl">📏</span>
                  <div>
                    <p className="text-sm text-gray-600">Lunghezza Tot.</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {fieldRows.reduce((sum, row) => sum + (row.length_meters || 0), 0)}m
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Field Rows List */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Lista Filari</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {fieldRows.map((row, index) => (
                  <div key={row.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="text-lg font-medium text-gray-900">{row.name}</h3>
                          <span className="text-sm text-gray-500">#{row.row_number || index + 1}</span>
                          
                          {/* Status Badges */}
                          <div className="flex gap-2">
                            {row.irrigationConfig?.enabled && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-100 text-cyan-700 text-xs font-medium rounded">
                                <Droplets size={12} />
                                Irrigato
                              </span>
                            )}
                            {row.cultivar && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                                <Sprout size={12} />
                                {row.cultivar}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Lunghezza:</span> {row.length_meters}m
                          </div>
                          {row.distance_from_previous_row && (
                            <div>
                              <span className="font-medium">Distanza:</span> {row.distance_from_previous_row}cm
                            </div>
                          )}
                          {row.plant_spacing && (
                            <div>
                              <span className="font-medium">Piante:</span> ~{Math.floor((row.length_meters * 100) / row.plant_spacing)}
                            </div>
                          )}
                          {row.planted_date && (
                            <div>
                              <span className="font-medium">Piantato:</span> {new Date(row.planted_date).toLocaleDateString('it-IT')}
                            </div>
                          )}
                        </div>

                        {/* Irrigation Details */}
                        {row.irrigationConfig?.enabled && (
                          <div className="mt-3 p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
                            <div className="text-sm text-cyan-800">
                              <strong>Irrigazione:</strong> {row.irrigationConfig.irrigationType === 'drip' ? 'Goccia a Goccia' : row.irrigationConfig.irrigationType}
                              {row.irrigationConfig.totalFlowRate > 0 && (
                                <span> • {row.irrigationConfig.totalFlowRate} L/h</span>
                              )}
                              {row.irrigationConfig.schedule && (
                                <span> • {row.irrigationConfig.schedule.frequency}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        <Link
                          href={`/app/plants?tab=plants&fieldRow=${row.id}`}
                          className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          🌱 Piante
                        </Link>
                        <Link
                          href={`/app/garden/rows/edit?garden=${selectedGarden.id}&id=${row.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifica filare"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button
                          onClick={() => handleDeleteRow(row.id, row.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Elimina filare"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}