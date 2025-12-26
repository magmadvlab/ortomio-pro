'use client'

import React, { useState, useEffect } from 'react'
import { Trash2, Edit, MapPin, Calendar, Plus, Home } from 'lucide-react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { useGarden } from '@/packages/core/hooks/useGarden'
import { Garden } from '@/types'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

export function GardenManager() {
  const { storageProvider } = useStorage()
  const { activeGarden, setActiveGarden } = useGarden()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadGardens()
  }, [])

  const loadGardens = async () => {
    try {
      setLoading(true)
      const allGardens = await storageProvider.getGardens()
      setGardens(allGardens || [])
    } catch (error) {
      console.error('Error loading gardens:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (gardenId: string, gardenName: string) => {
    const confirmed = confirm(
      `Sei sicuro di voler eliminare "${gardenName}"?\n\n` +
      `Questa azione eliminerà anche:\n` +
      `- Tutte le piante\n` +
      `- Tutti i task\n` +
      `- Tutte le raccolte\n` +
      `- Tutte le aiuole e file\n\n` +
      `Questa azione è IRREVERSIBILE!`
    )

    if (!confirmed) return

    // Double confirmation for extra safety
    const doubleConfirm = confirm(
      `⚠️ ULTIMA CONFERMA ⚠️\n\n` +
      `Stai per eliminare definitivamente "${gardenName}" e tutti i suoi dati.\n\n` +
      `Confermi?`
    )

    if (!doubleConfirm) return

    try {
      setDeleting(gardenId)
      await storageProvider.deleteGarden(gardenId)

      // Se l'orto eliminato era quello attivo, switcha al primo disponibile
      if (activeGarden?.id === gardenId) {
        const remainingGardens = gardens.filter(g => g.id !== gardenId)
        if (remainingGardens.length > 0) {
          setActiveGarden(remainingGardens[0])
        } else {
          setActiveGarden(null)
        }
      }

      // Ricarica lista
      await loadGardens()
      alert(`✅ "${gardenName}" eliminato con successo`)
    } catch (error) {
      console.error('Error deleting garden:', error)
      alert('❌ Errore durante l\'eliminazione dell\'orto')
    } finally {
      setDeleting(null)
    }
  }

  const handleSetActive = async (garden: Garden) => {
    try {
      setActiveGarden(garden)
      alert(`✅ Orto attivo: ${garden.name}`)
    } catch (error) {
      console.error('Error setting active garden:', error)
    }
  }

  const formatArea = (sizeSqMeters: number, sizeUnit?: string): string => {
    const unit = sizeUnit || 'sqm'

    if (unit === 'hectare') {
      return `${(sizeSqMeters / 10000).toFixed(2)} ha`
    }
    if (unit === 'are') {
      return `${(sizeSqMeters / 100).toFixed(1)} are`
    }
    return `${sizeSqMeters.toFixed(0)} m²`
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Caricamento orti...</p>
      </div>
    )
  }

  if (gardens.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-8 text-center">
        <Home size={48} className="mx-auto text-gray-400 mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nessun orto configurato
        </h3>
        <p className="text-gray-600 mb-4">
          Crea il tuo primo orto per iniziare a pianificare
        </p>
        <button
          onClick={() => window.location.href = '/app'}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={18} />
          Crea Orto
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          I Tuoi Orti ({gardens.length})
        </h3>
      </div>

      <div className="space-y-3">
        {gardens.map(garden => {
          const isActive = activeGarden?.id === garden.id
          const isDeleting = deleting === garden.id

          return (
            <div
              key={garden.id}
              className={`
                relative rounded-xl border-2 p-4 transition-all
                ${isActive
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
                ${isDeleting ? 'opacity-50' : ''}
              `}
            >
              {isActive && (
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs rounded-full font-medium">
                    ✓ Attivo
                  </span>
                </div>
              )}

              <div className="mb-3">
                <h4 className="text-lg font-bold text-gray-900 mb-1">
                  {garden.name}
                </h4>
                {garden.primaryCrop && (
                  <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {garden.primaryCrop.label}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={14} />
                  <span>{formatArea(garden.sizeSqMeters, garden.sizeUnit)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={14} />
                  <span>
                    {format(new Date(garden.createdAt), 'd MMM yyyy', { locale: it })}
                  </span>
                </div>
              </div>

              {garden.coordinates && (
                <div className="text-xs text-gray-500 mb-4">
                  📍 {garden.coordinates.latitude.toFixed(4)}, {garden.coordinates.longitude.toFixed(4)}
                </div>
              )}

              <div className="flex gap-2 pt-3 border-t border-gray-200">
                {!isActive && (
                  <button
                    onClick={() => handleSetActive(garden)}
                    disabled={isDeleting}
                    className="flex-1 px-3 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50 text-sm font-medium"
                  >
                    Rendi Attivo
                  </button>
                )}

                <button
                  onClick={() => handleDelete(garden.id, garden.name)}
                  disabled={isDeleting}
                  className="px-3 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                  title="Elimina orto"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      Eliminazione...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Elimina
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          ⚠️ Attenzione
        </h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• L'eliminazione di un orto è <strong>irreversibile</strong></li>
          <li>• Tutti i dati associati verranno eliminati permanentemente</li>
          <li>• Prima di eliminare, considera di fare un backup se necessario</li>
        </ul>
      </div>
    </div>
  )
}
