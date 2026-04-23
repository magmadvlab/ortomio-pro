import React, { useState } from 'react'
import type { Sapling, SaplingBatch } from '../types/sapling'
import { addPhotoToLog, isReadyToOrchard, recordPlanting } from '../services/saplingService'
import type { Garden } from '../types'
import { TreePine, Camera, MapPin } from 'lucide-react'
import { useTier } from '../packages/core/hooks/useTier'
import UpgradePrompt from './UpgradePrompt'
import { fruitTreeMasterSheets } from '../data/fruitTreeMasterSheets'
import { oliveMasterSheets } from '../data/oliveMasterSheets'
import { vineMasterSheets } from '../data/vineMasterSheets'

type SaplingBatchType = NonNullable<SaplingBatch['saplingType']>

const SAPLING_TYPE_OPTIONS = ['FruitTree', 'Olive', 'Vine'] as const satisfies readonly SaplingBatchType[]

interface SaplingManagerProps {
  garden: Garden
  batches: SaplingBatch[]
  onBatchUpdate: (batch: SaplingBatch) => void | Promise<void>
  onBatchCreate: (batch: Omit<SaplingBatch, 'id' | 'saplings'>) => void | Promise<void>
  onCreateOrchard?: (batch: SaplingBatch) => void | Promise<void>
}

const isSaplingBatchType = (value: string): value is SaplingBatchType =>
  SAPLING_TYPE_OPTIONS.includes(value as SaplingBatchType)

const parseSpacing = (value: string): number | undefined => {
  const normalized = value.replace(',', '.').trim()
  if (!normalized) return undefined

  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : undefined
}

const buildSaplingFromBatch = (batch: SaplingBatch): Sapling => ({
  id: batch.saplings[0]?.id || batch.id,
  plantName: batch.plantName,
  variety: batch.variety,
  source: batch.source,
  status:
    batch.saplings.some((sapling) => sapling.status === 'ready_to_plant')
      ? 'ready_to_plant'
      : batch.saplings.some((sapling) => sapling.status === 'planted')
        ? 'planted'
        : 'nursery',
  purchaseDate: batch.purchaseDate,
  quantity: batch.remainingQuantity || batch.totalQuantity || batch.quantity || 1,
  supplier: batch.supplier,
  rootstockType: batch.rootstockType || batch.rootstock,
  plantingDate: batch.plantingDate,
  location: batch.location,
  notes: batch.notes,
  gardenId: batch.gardenId,
})

const getPrimarySaplingId = (batch: SaplingBatch): string | undefined => batch.saplings[0]?.id

const SaplingManager: React.FC<SaplingManagerProps> = ({
  garden,
  batches,
  onBatchUpdate,
  onBatchCreate,
  onCreateOrchard,
}) => {
  const { isPro, checkLimit, limit } = useTier()
  const [isCreating, setIsCreating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<SaplingBatch | null>(null)
  const [newBatch, setNewBatch] = useState({
    plantName: '',
    variety: '',
    saplingType: 'FruitTree' as SaplingBatchType,
    purchaseDate: new Date().toISOString().split('T')[0],
    quantity: 1,
    location: '',
    rootstock: '',
    spacing: '',
  })

  const batchesLimit = checkLimit('maxSaplingBatches', batches.length)
  const canCreateBatch = isPro || batchesLimit.allowed

  const getAvailablePlants = (type: SaplingBatchType) => {
    switch (type) {
      case 'FruitTree':
        return fruitTreeMasterSheets
      case 'Olive':
        return oliveMasterSheets
      case 'Vine':
        return vineMasterSheets
    }
  }

  const resetForm = () => {
    setNewBatch({
      plantName: '',
      variety: '',
      saplingType: 'FruitTree',
      purchaseDate: new Date().toISOString().split('T')[0],
      quantity: 1,
      location: '',
      rootstock: '',
      spacing: '',
    })
    setIsCreating(false)
  }

  const handleCreateBatch = async () => {
    if (!canCreateBatch) {
      alert(
        `Limite raggiunto: massimo ${limit('maxSaplingBatches')} batch alberelli in versione Free. Passa a Pro per batch illimitati.`
      )
      return
    }

    if (!newBatch.plantName.trim()) {
      alert('Seleziona la pianta del batch')
      return
    }

    if (!newBatch.location.trim()) {
      alert('Inserisci la posizione dove piantare gli alberelli')
      return
    }

    const spacingValue = parseSpacing(newBatch.spacing)

    try {
      setIsSubmitting(true)

      await onBatchCreate({
        plantName: newBatch.plantName,
        variety: newBatch.variety || undefined,
        source: 'nursery',
        totalQuantity: newBatch.quantity,
        remainingQuantity: newBatch.quantity,
        purchaseDate: newBatch.purchaseDate,
        rootstockType: newBatch.rootstock || undefined,
        notes: undefined,
        gardenId: garden.id,
        initialQuantity: newBatch.quantity,
        quantity: newBatch.quantity,
        currentQuantity: newBatch.quantity,
        phase: 'Purchased',
        location: newBatch.location,
        rootstock: newBatch.rootstock || undefined,
        spacing: spacingValue,
        saplingType: newBatch.saplingType,
      })

      resetForm()
    } catch (error) {
      alert((error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePhotoUpload = async (
    batch: SaplingBatch,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    const saplingId = getPrimarySaplingId(batch)
    if (!saplingId) {
      alert('Nessun alberello individuale disponibile per registrare la foto')
      return
    }

    const currentPhotos = batch.photoLog?.length || 0
    const photosLimit = checkLimit('maxPhotosPerBatch', currentPhotos)

    if (!isPro && !photosLimit.allowed) {
      alert(`Limite raggiunto: massimo ${limit('maxPhotosPerBatch')} foto per batch in versione Free.`)
      return
    }

    const reader = new FileReader()
    reader.onload = async (loadEvent) => {
      try {
        const base64 = loadEvent.target?.result
        if (typeof base64 !== 'string') {
          throw new Error('Impossibile leggere il file selezionato')
        }

        await addPhotoToLog(saplingId, base64, `Foto batch ${batch.plantName}`)
        await onBatchUpdate(batch)
      } catch (error) {
        console.error('Error uploading sapling photo:', error)
        alert('Errore durante il salvataggio della foto')
      } finally {
        event.target.value = ''
      }
    }

    reader.readAsDataURL(file)
  }

  const handleRecordPlanting = async (batch: SaplingBatch) => {
    const saplingId = getPrimarySaplingId(batch)
    if (!saplingId) {
      alert('Nessun alberello individuale disponibile per registrare la messa a dimora')
      return
    }

    const plantingDate = prompt(
      'Inserisci data messa a dimora (YYYY-MM-DD):',
      new Date().toISOString().split('T')[0]
    )

    if (!plantingDate) {
      return
    }

    try {
      await recordPlanting(saplingId, {
        plantingDate,
        location: batch.location || newBatch.location || 'Da assegnare',
        spacing: batch.spacing,
        gardenId: garden.id,
      })
      await onBatchUpdate(batch)
    } catch (error) {
      console.error('Error recording sapling planting:', error)
      alert('Errore durante la registrazione della messa a dimora')
    }
  }

  const handleCreateOrchard = async (batch: SaplingBatch) => {
    if (!onCreateOrchard) return

    try {
      await onCreateOrchard(batch)
    } catch (error) {
      console.error('Error creating orchard from sapling batch:', error)
      alert('Errore durante la creazione dell’impianto')
    }
  }

  const getPhaseColor = (phase?: SaplingBatch['phase']) => {
    switch (phase) {
      case 'Purchased':
        return 'bg-gray-100 text-gray-700'
      case 'Nursery':
        return 'bg-yellow-100 text-yellow-700'
      case 'ReadyToPlant':
        return 'bg-purple-100 text-purple-700'
      case 'Planted':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getPhaseLabel = (phase?: SaplingBatch['phase']) => {
    const labels: Record<NonNullable<SaplingBatch['phase']>, string> = {
      Purchased: 'Acquistato',
      Nursery: 'In vivaio',
      ReadyToPlant: 'Pronto per impianto',
      Planted: 'Messo a dimora',
    }

    return phase ? labels[phase] : 'Da classificare'
  }

  const getTypeLabel = (type?: SaplingBatchType) => {
    const labels: Record<SaplingBatchType, string> = {
      FruitTree: 'Albero da Frutto',
      Olive: 'Olivo',
      Vine: 'Vite',
    }

    return type ? labels[type] : 'Non classificato'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-col md:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <TreePine size={24} className="text-green-600" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Gestione Alberelli</h2>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!isPro && (
            <div className="text-xs text-gray-500">
              {batches.length}/{limit('maxSaplingBatches')} batch
            </div>
          )}
          <button
            onClick={() => setIsCreating(!isCreating)}
            disabled={!canCreateBatch || isSubmitting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex-1 sm:flex-none"
          >
            + Nuovo Alberello
          </button>
        </div>
      </div>

      {!isPro && !batchesLimit.allowed && (
        <UpgradePrompt
          feature="Batch Alberelli Illimitati"
          limit={`Massimo ${limit('maxSaplingBatches')} batch in versione Free`}
          variant="inline"
          onUpgrade={() => console.log('Upgrade to Pro')}
        />
      )}

      {isCreating && (
        <div className="bg-white p-4 sm:p-6 rounded-xl border-2 border-green-200">
          <h3 className="font-bold text-lg mb-4">Nuovo Alberello</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Tipo</label>
              <select
                className="w-full p-3 border rounded-lg"
                value={newBatch.saplingType}
                onChange={(event) => {
                  const nextType = event.target.value
                  if (!isSaplingBatchType(nextType)) return
                  setNewBatch({ ...newBatch, saplingType: nextType, plantName: '' })
                }}
              >
                {SAPLING_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {getTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Pianta</label>
              <select
                className="w-full p-3 border rounded-lg"
                value={newBatch.plantName}
                onChange={(event) => setNewBatch({ ...newBatch, plantName: event.target.value })}
              >
                <option value="">Seleziona pianta</option>
                {getAvailablePlants(newBatch.saplingType).map((plant) => (
                  <option key={plant.id} value={plant.commonName}>
                    {plant.commonName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Varietà (opzionale)</label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg"
                  value={newBatch.variety}
                  onChange={(event) => setNewBatch({ ...newBatch, variety: event.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Data Acquisto</label>
                <input
                  type="date"
                  className="w-full p-3 border rounded-lg"
                  value={newBatch.purchaseDate}
                  onChange={(event) => setNewBatch({ ...newBatch, purchaseDate: event.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Quantità</label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-3 border rounded-lg"
                  value={newBatch.quantity}
                  onChange={(event) =>
                    setNewBatch({
                      ...newBatch,
                      quantity: Number.parseInt(event.target.value, 10) || 1,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Posizione *</label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg"
                  value={newBatch.location}
                  onChange={(event) => setNewBatch({ ...newBatch, location: event.target.value })}
                  placeholder="Es: Frutteto Nord, Zona A..."
                />
              </div>
            </div>

            {(newBatch.saplingType === 'FruitTree' || newBatch.saplingType === 'Vine') && (
              <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Portinnesto (opzionale)</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-lg"
                    value={newBatch.rootstock}
                    onChange={(event) => setNewBatch({ ...newBatch, rootstock: event.target.value })}
                    placeholder="Es: M9, 1103P..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Distanza in metri (opzionale)</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-lg"
                    value={newBatch.spacing}
                    onChange={(event) => setNewBatch({ ...newBatch, spacing: event.target.value })}
                    placeholder="Es: 3.5"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCreateBatch}
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400"
              >
                Crea
              </button>
              <button
                onClick={resetForm}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 disabled:bg-gray-200"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {batches.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-xl text-center">
          <TreePine size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Nessun alberello registrato. Crea un nuovo batch per iniziare.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {batches.map((batch) => {
            const readiness = isReadyToOrchard(buildSaplingFromBatch(batch))

            return (
              <div
                key={batch.id}
                className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-col md:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">{batch.plantName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPhaseColor(batch.phase)}`}>
                        {getPhaseLabel(batch.phase)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">Tipo:</span>
                        <span>{getTypeLabel(batch.saplingType)}</span>
                      </div>
                      {batch.variety && (
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">Varietà:</span>
                          <span>{batch.variety}</span>
                        </div>
                      )}
                      {batch.location && (
                        <div className="flex items-center gap-3">
                          <MapPin size={14} />
                          <span>{batch.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">Quantità:</span>
                        <span>
                          {String(batch.currentQuantity ?? batch.remainingQuantity ?? batch.quantity ?? 0)}/
                          {String(batch.quantity ?? batch.totalQuantity)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {!batch.plantingDate && batch.phase === 'Purchased' && (
                      <button
                        onClick={() => void handleRecordPlanting(batch)}
                        className="px-4 py-3 text-base bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                      >
                        Registra Messa a Dimora
                      </button>
                    )}
                    {readiness && !batch.specializedCropId && onCreateOrchard && (
                      <button
                        onClick={() => void handleCreateOrchard(batch)}
                        className="px-4 py-3 text-base bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700"
                      >
                        Crea Impianto
                      </button>
                    )}
                    {batch.specializedCropId && (
                      <div className="px-4 py-3 text-base bg-green-100 text-green-800 rounded-lg text-sm font-semibold text-center">
                        Impianto Creato
                      </div>
                    )}
                  </div>
                </div>

                {!readiness && batch.phase !== 'Planted' && (
                  <div className="mb-4 p-3 bg-orange-50 rounded-lg text-sm text-orange-800">
                    Gli alberelli non risultano ancora pronti per l’impianto specializzato.
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                  <label className="flex items-center gap-3 text-sm cursor-pointer">
                    <Camera size={16} className="text-gray-600" />
                    <span className="text-gray-600">Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(event) => void handlePhotoUpload(batch, event)}
                    />
                  </label>
                  <button
                    onClick={() => setSelectedBatch(selectedBatch?.id === batch.id ? null : batch)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {selectedBatch?.id === batch.id ? 'Nascondi' : 'Dettagli'}
                  </button>
                </div>

                {selectedBatch?.id === batch.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                    <div>
                      <strong>Data acquisto:</strong> {new Date(batch.purchaseDate).toLocaleDateString('it-IT')}
                    </div>
                    {batch.plantingDate && (
                      <div>
                        <strong>Data messa a dimora:</strong> {new Date(batch.plantingDate).toLocaleDateString('it-IT')}
                      </div>
                    )}
                    {batch.expectedEstablishmentDate && (
                      <div>
                        <strong>Attecchimento previsto:</strong>{' '}
                        {new Date(batch.expectedEstablishmentDate).toLocaleDateString('it-IT')}
                      </div>
                    )}
                    {(batch.rootstock || batch.rootstockType) && (
                      <div>
                        <strong>Portinnesto:</strong> {batch.rootstock || batch.rootstockType}
                      </div>
                    )}
                    {batch.spacing !== undefined && (
                      <div>
                        <strong>Distanza:</strong> {batch.spacing} m
                      </div>
                    )}
                    {batch.notes && (
                      <div>
                        <strong>Note:</strong> {batch.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SaplingManager
