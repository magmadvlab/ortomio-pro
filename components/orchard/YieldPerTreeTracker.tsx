'use client'

import React, { useEffect, useState } from 'react'
import { Target, Calendar, TrendingUp, Plus, BarChart3, TreePine, Save } from 'lucide-react'
import { orchardService } from '@/services/orchardService'
import { OrchardTree, QualityClass } from '@/types/orchard'

interface YieldPerTreeTrackerProps {
  orchardId: string
  orchardName?: string
  onSelectTree?: (treeId: string) => void
}

interface TreeYieldRecord {
  id: string
  treeId: string
  treeNumber: string
  variety: string
  harvestDate: string
  year: number
  yieldKg: number
  qualityClass: QualityClass
  notes: string
}

const DEFAULT_HARVEST_DATE = new Date().toISOString().slice(0, 10)

export default function YieldPerTreeTracker({ orchardId, orchardName, onSelectTree }: YieldPerTreeTrackerProps) {
  const [trees, setTrees] = useState<OrchardTree[]>([])
  const [yields, setYields] = useState<TreeYieldRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [treeSearchTerm, setTreeSearchTerm] = useState('')
  const [newYield, setNewYield] = useState({
    treeId: '',
    harvestDate: DEFAULT_HARVEST_DATE,
    yieldKg: '',
    qualityClass: 'first' as QualityClass,
    notes: ''
  })

  useEffect(() => {
    void loadYieldData()
  }, [orchardId])

  const loadYieldData = async () => {
    if (!orchardId) {
      setTrees([])
      setYields([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const [treesData, harvestRecords] = await Promise.all([
        orchardService.getOrchardTrees(orchardId),
        orchardService.getOrchardHarvestRecords(orchardId)
      ])

      const treeMap = new Map(treesData.map((tree) => [tree.id, tree]))
      const mappedYields = harvestRecords
        .map((record) => {
          const tree = treeMap.get(record.treeId)
          const harvestDate = record.harvestDate || DEFAULT_HARVEST_DATE
          return {
            id: record.id,
            treeId: record.treeId,
            treeNumber: tree?.treeNumber || 'Albero',
            variety: tree?.variety || 'Varietà non definita',
            harvestDate,
            year: new Date(harvestDate).getFullYear(),
            yieldKg: Number(record.quantityKg || 0),
            qualityClass: record.qualityClass,
            notes: record.notes || ''
          }
        })
        .sort((left, right) => new Date(right.harvestDate).getTime() - new Date(left.harvestDate).getTime())

      setTrees(treesData)
      setYields(mappedYields)

      if (treesData.length === 1) {
        setNewYield((current) => ({
          ...current,
          treeId: current.treeId || treesData[0].id
        }))
      }
    } catch (loadError) {
      console.error('Error loading orchard yield tracker data:', loadError)
      setError('Impossibile caricare le rese del frutteto.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setNewYield({
      treeId: trees.length === 1 ? trees[0].id : '',
      harvestDate: DEFAULT_HARVEST_DATE,
      yieldKg: '',
      qualityClass: 'first',
      notes: ''
    })
  }

  const addYield = async () => {
    if (!newYield.treeId || !newYield.yieldKg || !newYield.harvestDate) return

    try {
      setSaving(true)
      setError(null)

      await orchardService.addTreeHarvestRecord({
        treeId: newYield.treeId,
        harvestDate: newYield.harvestDate,
        quantityKg: Number(newYield.yieldKg),
        qualityClass: newYield.qualityClass,
        notes: newYield.notes || undefined,
        photos: [],
        qualityPhotos: []
      })

      await loadYieldData()
      resetForm()
      setShowForm(false)
    } catch (saveError) {
      console.error('Error saving orchard yield record:', saveError)
      setError('Impossibile salvare la resa dell\'albero.')
    } finally {
      setSaving(false)
    }
  }

  const getQualityInfo = (qualityClass: QualityClass) => {
    switch (qualityClass) {
      case 'premium':
        return { color: 'text-green-700', bg: 'bg-green-50', label: 'Classe alta' }
      case 'first':
        return { color: 'text-blue-700', bg: 'bg-blue-50', label: 'Prima' }
      case 'second':
        return { color: 'text-amber-700', bg: 'bg-amber-50', label: 'Seconda' }
      case 'processing':
        return { color: 'text-orange-700', bg: 'bg-orange-50', label: 'Trasformazione' }
      case 'waste':
        return { color: 'text-red-700', bg: 'bg-red-50', label: 'Scarto' }
      default:
        return { color: 'text-gray-700', bg: 'bg-gray-50', label: 'N/D' }
    }
  }

  const currentYear = new Date().getFullYear()
  const currentYearYields = yields.filter((yieldRecord) => yieldRecord.year === currentYear)
  const avgYield = currentYearYields.length > 0
    ? currentYearYields.reduce((sum, yieldRecord) => sum + yieldRecord.yieldKg, 0) / currentYearYields.length
    : 0
  const totalYield = currentYearYields.reduce((sum, yieldRecord) => sum + yieldRecord.yieldKg, 0)
  const topPerformer = currentYearYields.length > 0
    ? currentYearYields.reduce((max, yieldRecord) => yieldRecord.yieldKg > max.yieldKg ? yieldRecord : max, currentYearYields[0])
    : null

  const yieldsByVariety = currentYearYields.reduce((acc, yieldRecord) => {
    if (!acc[yieldRecord.variety]) {
      acc[yieldRecord.variety] = []
    }
    acc[yieldRecord.variety].push(yieldRecord)
    return acc
  }, {} as Record<string, TreeYieldRecord[]>)

  const selectedTree = trees.find((tree) => tree.id === newYield.treeId)
  const treeSummaries = trees
    .map((tree) => {
      const treeYields = yields.filter((yieldRecord) => yieldRecord.treeId === tree.id)
      const treeCurrentYearYields = treeYields.filter((yieldRecord) => yieldRecord.year === currentYear)
      const totalYieldKg = treeYields.reduce((sum, yieldRecord) => sum + yieldRecord.yieldKg, 0)
      const currentYearYieldKg = treeCurrentYearYields.reduce((sum, yieldRecord) => sum + yieldRecord.yieldKg, 0)
      const harvestCount = treeYields.length
      const averageYieldKg = harvestCount > 0 ? totalYieldKg / harvestCount : 0
      const lastHarvest = treeYields[0]

      let performanceLabel = 'Nessun dato'
      let performanceClasses = 'bg-gray-100 text-gray-700'

      if (currentYearYieldKg > 0 && avgYield > 0) {
        if (currentYearYieldKg >= avgYield * 1.3) {
          performanceLabel = 'Top performer'
          performanceClasses = 'bg-green-100 text-green-700'
        } else if (currentYearYieldKg <= avgYield * 0.5) {
          performanceLabel = 'Sotto media'
          performanceClasses = 'bg-orange-100 text-orange-700'
        } else {
          performanceLabel = 'In media'
          performanceClasses = 'bg-blue-100 text-blue-700'
        }
      } else if (harvestCount > 0) {
        performanceLabel = 'Storico disponibile'
        performanceClasses = 'bg-purple-100 text-purple-700'
      }

      return {
        tree,
        totalYieldKg,
        currentYearYieldKg,
        harvestCount,
        averageYieldKg,
        lastHarvestDate: lastHarvest?.harvestDate,
        lastHarvestYieldKg: lastHarvest?.yieldKg,
        performanceLabel,
        performanceClasses
      }
    })
    .filter(({ tree }) => {
      if (!treeSearchTerm.trim()) return true

      const normalizedSearch = treeSearchTerm.trim().toLowerCase()
      return (
        tree.treeNumber.toLowerCase().includes(normalizedSearch) ||
        tree.variety.toLowerCase().includes(normalizedSearch)
      )
    })
    .sort((left, right) => {
      if (right.currentYearYieldKg !== left.currentYearYieldKg) {
        return right.currentYearYieldKg - left.currentYearYieldKg
      }
      return right.totalYieldKg - left.totalYieldKg
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Target className="mx-auto text-gray-400 mb-4 animate-pulse" size={48} />
          <p className="text-gray-600">Caricamento rese per pianta...</p>
        </div>
      </div>
    )
  }

  if (!orchardId) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <Target className="mx-auto text-gray-400 mb-4" size={40} />
        <p className="text-gray-600">Seleziona un frutteto per visualizzare la resa per pianta.</p>
      </div>
    )
  }

  if (trees.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <TreePine className="mx-auto text-gray-400 mb-4" size={40} />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun albero disponibile</h3>
        <p className="text-gray-600">Aggiungi prima gli alberi del frutteto per registrare le rese.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Target className="text-green-600" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Tracciamento Resa per Pianta</h2>
              <p className="text-gray-600">Rese registrate sui raccolti reali del frutteto</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm((current) => !current)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={16} />
            Nuova Registrazione
          </button>
        </div>

        {orchardName && (
          <div className="text-sm text-green-700 bg-green-100 px-3 py-2 rounded-lg inline-block">
            Frutteto: {orchardName}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {currentYearYields.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="text-blue-600" size={16} />
              <span className="text-sm font-medium text-gray-700">Resa Media</span>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {avgYield.toFixed(1)} kg
            </div>
            <div className="text-xs text-gray-500 mt-1">per albero raccolto</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-green-600" size={16} />
              <span className="text-sm font-medium text-gray-700">Produzione Totale</span>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {totalYield.toFixed(1)} kg
            </div>
            <div className="text-xs text-gray-500 mt-1">{currentYear}</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="text-purple-600" size={16} />
              <span className="text-sm font-medium text-gray-700">Alberi Monitorati</span>
            </div>
            <div className="text-3xl font-bold text-purple-600">
              {new Set(currentYearYields.map((yieldRecord) => yieldRecord.treeId)).size}
            </div>
            <div className="text-xs text-gray-500 mt-1">con raccolte registrate</div>
          </div>

          {topPerformer && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🏆</span>
                <span className="text-sm font-medium text-gray-700">Top Performer</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {topPerformer.treeNumber}
              </div>
              <div className="text-xs text-gray-500 mt-1">{topPerformer.yieldKg.toFixed(1)} kg</div>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registra Raccolta Albero</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Albero
              </label>
              <select
                value={newYield.treeId}
                onChange={(event) => setNewYield({ ...newYield, treeId: event.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Seleziona albero...</option>
                {trees.map((tree) => (
                  <option key={tree.id} value={tree.id}>
                    {tree.treeNumber} - {tree.variety}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data raccolta
              </label>
              <input
                type="date"
                value={newYield.harvestDate}
                onChange={(event) => setNewYield({ ...newYield, harvestDate: event.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {selectedTree && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              Albero selezionato: <strong>{selectedTree.treeNumber}</strong> · {selectedTree.variety}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantità raccolta (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={newYield.yieldKg}
                onChange={(event) => setNewYield({ ...newYield, yieldKg: event.target.value })}
                placeholder="es. 42.5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classe qualità
              </label>
              <select
                value={newYield.qualityClass}
                onChange={(event) => setNewYield({ ...newYield, qualityClass: event.target.value as QualityClass })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="premium">Premium</option>
                <option value="first">Prima</option>
                <option value="second">Seconda</option>
                <option value="processing">Trasformazione</option>
                <option value="waste">Scarto</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note
            </label>
            <textarea
              value={newYield.notes}
              onChange={(event) => setNewYield({ ...newYield, notes: event.target.value })}
              placeholder="Osservazioni sulla qualità, difetti, condizioni della raccolta..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={addYield}
              disabled={!newYield.treeId || !newYield.yieldKg || saving}
              className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300"
            >
              <Save size={16} />
              {saving ? 'Salvataggio...' : 'Salva Registrazione'}
            </button>
            <button
              onClick={() => {
                setShowForm(false)
                resetForm()
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annulla
            </button>
          </div>
        </div>
      )}

      {Object.keys(yieldsByVariety).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rese per Varietà ({currentYear})</h3>

          <div className="space-y-6">
            {Object.entries(yieldsByVariety).map(([variety, varietyYields]) => {
              const varietyAvg = varietyYields.reduce((sum, yieldRecord) => sum + yieldRecord.yieldKg, 0) / varietyYields.length
              const varietyTotal = varietyYields.reduce((sum, yieldRecord) => sum + yieldRecord.yieldKg, 0)

              return (
                <div key={variety} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{variety}</h4>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">
                        Media: <span className="font-semibold text-gray-900">{varietyAvg.toFixed(1)} kg</span>
                      </span>
                      <span className="text-gray-600">
                        Totale: <span className="font-semibold text-gray-900">{varietyTotal.toFixed(1)} kg</span>
                      </span>
                      <span className="text-gray-600">
                        Alberi: <span className="font-semibold text-gray-900">{varietyYields.length}</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {varietyYields.map((yieldRecord) => {
                      const qualityInfo = getQualityInfo(yieldRecord.qualityClass)
                      return (
                        <div key={yieldRecord.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-900">{yieldRecord.treeNumber}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${qualityInfo.color} ${qualityInfo.bg}`}>
                              {qualityInfo.label}
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            {yieldRecord.yieldKg.toFixed(1)} kg
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(yieldRecord.harvestDate).toLocaleDateString('it-IT')}
                          </div>
                          {yieldRecord.notes && (
                            <p className="text-xs text-gray-600 mt-2">{yieldRecord.notes}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Vista per Albero</h3>
            <p className="text-sm text-gray-600">
              Una riga per ogni albero, con resa aggregata e accesso diretto al dettaglio.
            </p>
          </div>

          <input
            type="text"
            value={treeSearchTerm}
            onChange={(event) => setTreeSearchTerm(event.target.value)}
            placeholder="Cerca albero o varietà..."
            className="w-full md:w-72 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        {treeSummaries.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 px-6 py-10 text-center">
            <TreePine className="mx-auto text-gray-400 mb-3" size={28} />
            <p className="text-gray-600">Nessun albero corrisponde al filtro corrente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Albero</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Posizione</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Resa {currentYear}</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Totale storico</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Raccolte</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Media</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Ultimo raccolto</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Performance</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {treeSummaries.map((summary) => (
                  <tr key={summary.tree.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{summary.tree.treeNumber}</div>
                      <div className="text-xs text-gray-500">{summary.tree.variety}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {summary.tree.rowNumber && summary.tree.positionInRow
                        ? `Fila ${summary.tree.rowNumber}, Pos. ${summary.tree.positionInRow}`
                        : 'Non assegnata'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-green-600">{summary.currentYearYieldKg.toFixed(1)} kg</td>
                    <td className="py-3 px-4 text-gray-700">{summary.totalYieldKg.toFixed(1)} kg</td>
                    <td className="py-3 px-4 text-gray-700">{summary.harvestCount}</td>
                    <td className="py-3 px-4 text-gray-700">{summary.averageYieldKg.toFixed(1)} kg</td>
                    <td className="py-3 px-4 text-gray-700">
                      {summary.lastHarvestDate ? (
                        <div>
                          <div>{new Date(summary.lastHarvestDate).toLocaleDateString('it-IT')}</div>
                          <div className="text-xs text-gray-500">{summary.lastHarvestYieldKg?.toFixed(1)} kg</div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${summary.performanceClasses}`}>
                        {summary.performanceLabel}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => onSelectTree?.(summary.tree.id)}
                        disabled={!onSelectTree}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Apri albero
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Tutte le Registrazioni</h3>
          <div className="text-sm text-gray-500">
            {yields.length} registrazioni
          </div>
        </div>

        {yields.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 px-6 py-10 text-center">
            <Calendar className="mx-auto text-gray-400 mb-3" size={28} />
            <p className="text-gray-600">Nessuna resa registrata per questo frutteto.</p>
            <p className="text-sm text-gray-500 mt-1">Usa “Nuova Registrazione” per iniziare a storicizzare i raccolti per albero.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Albero</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Varietà</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Data</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Anno</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Resa (kg)</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Qualità</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Note</th>
                </tr>
              </thead>
              <tbody>
                {yields.map((yieldRecord) => {
                  const qualityInfo = getQualityInfo(yieldRecord.qualityClass)
                  return (
                    <tr key={yieldRecord.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{yieldRecord.treeNumber}</td>
                      <td className="py-3 px-4 text-gray-700">{yieldRecord.variety}</td>
                      <td className="py-3 px-4 text-gray-700">
                        {new Date(yieldRecord.harvestDate).toLocaleDateString('it-IT')}
                      </td>
                      <td className="py-3 px-4 text-gray-700">{yieldRecord.year}</td>
                      <td className="py-3 px-4 font-semibold text-green-600">{yieldRecord.yieldKg.toFixed(1)} kg</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${qualityInfo.color} ${qualityInfo.bg}`}>
                          {qualityInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-xs">{yieldRecord.notes || '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Consigli per il tracciamento</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Registra le rese per albero nello stesso giorno della raccolta per mantenere i dati coerenti.</li>
          <li>• Usa sempre la classe qualità per confrontare resa e valore commerciale delle stesse piante negli anni.</li>
          <li>• Le rese persistite qui aggiornano anche l&apos;ultimo raccolto e la resa cumulativa dell&apos;albero.</li>
          <li>• Se un albero cala di anno in anno, confronta queste rese con potature, trattamenti e condizioni meteo.</li>
        </ul>
      </div>
    </div>
  )
}
