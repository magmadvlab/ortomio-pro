'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { AppModal } from '@/components/shared/AppModal'
import { OrchardConfiguration, OrchardTree } from '@/types/orchard'
import type { FieldRow, FieldRowOrdering } from '@/types/fieldRow'
import { orchardService } from '@/services/orchardService'
import {
  TreePine,
  Eye,
  Plus,
  X,
  AlertCircle,
  Rows3,
  Droplets,
  Lock
} from 'lucide-react'

// ============================================================================
// ORCHARD ROWS VIEW - Gestione Filari del Frutteto (riusata anche per l'Oliveto,
// che modella i propri orchards con gli stessi tipi OrchardConfiguration/OrchardTree)
// ============================================================================
interface OrchardRowsViewProps {
  orchard: OrchardConfiguration
  orchardId: string
  gardenId: string
  onOrchardUpdate: (orchard: OrchardConfiguration) => void
  onNavigateToTree: () => void
  onSelectTree: (treeId: string) => void
}

type FieldRowAxis = '' | 'N-S' | 'E-W' | 'NE-SW' | 'NW-SE'
type IrrigationLineType = NonNullable<FieldRow['irrigationLine']>['lineType']

const FIELD_ROW_ORDERING_OPTIONS: Array<{ value: FieldRowOrdering; label: string }> = [
  { value: 'west_to_east', label: 'Ovest -> Est' },
  { value: 'east_to_west', label: 'Est -> Ovest' },
  { value: 'north_to_south', label: 'Nord -> Sud' },
  { value: 'south_to_north', label: 'Sud -> Nord' },
]

export default function OrchardRowsView({ orchard, orchardId, gardenId, onOrchardUpdate, onNavigateToTree, onSelectTree }: OrchardRowsViewProps) {
  const { storageProvider } = useStorage()
  const [trees, setTrees] = useState<OrchardTree[]>([])
  const [fieldRows, setFieldRows] = useState<FieldRow[]>([])
  const [loading, setLoading] = useState(true)
  const [rowsAnimated, setRowsAnimated] = useState(false)
  const [backfillLoading, setBackfillLoading] = useState(false)
  const [backfillMessage, setBackfillMessage] = useState<string | null>(null)
  const [irrigationMessage, setIrrigationMessage] = useState<string | null>(null)
  const [selectedRowForIrrigation, setSelectedRowForIrrigation] = useState<FieldRow | null>(null)
  const [irrigationReplacementMode, setIrrigationReplacementMode] = useState(false)
  const [irrigationSaving, setIrrigationSaving] = useState(false)
  const [orchardDefaultsSaving, setOrchardDefaultsSaving] = useState(false)
  const [applyDefaultsLoading, setApplyDefaultsLoading] = useState(false)
  const [backfillConfig, setBackfillConfig] = useState({
    plantSpacingCm: orchard.treeSpacingM ? String(Math.round(orchard.treeSpacingM * 100)) : '',
    distanceFromPreviousRowCm: orchard.rowSpacingM ? String(Math.round(orchard.rowSpacingM * 100)) : '',
    orientation: '' as FieldRowAxis,
    rowOrdering: '' as FieldRowOrdering | '',
    plantOrderingInRow: '' as FieldRowOrdering | '',
  })
  const [orchardDefaultsForm, setOrchardDefaultsForm] = useState({
    lineType: orchard.irrigationDefaults?.lineType || 'Dripline' as IrrigationLineType,
    pipeDiameterMm: String(orchard.irrigationDefaults?.pipeDiameterMm || 16),
    emitterSpacingCm: String(orchard.irrigationDefaults?.emitterSpacingCm || 30),
    emitterFlowRateLph: String(orchard.irrigationDefaults?.emitterFlowRateLph || 2),
  })
  const [irrigationForm, setIrrigationForm] = useState({
    lineType: 'Dripline' as IrrigationLineType,
    pipeDiameterMm: '16',
    emitterSpacingCm: '30',
    emitterFlowRateLph: '2',
  })

  const loadTrees = useCallback(async () => {
    try {
      setLoading(true)
      const fieldRowsPromise = storageProvider?.getFieldRows
        ? storageProvider.getFieldRows(gardenId).catch((error) => {
            console.error('Error loading field rows for rows view:', error)
            return []
          })
        : Promise.resolve([])

      const [treesData, fieldRowsData] = await Promise.all([
        orchardService.getOrchardTrees(orchardId),
        fieldRowsPromise
      ])
      setTrees(treesData)
      setFieldRows(fieldRowsData)
    } catch (error) {
      console.error('Error loading trees for rows view:', error)
    } finally {
      setLoading(false)
    }
  }, [orchardId, gardenId, storageProvider])

  useEffect(() => {
    loadTrees()
  }, [loadTrees])

  const formatRowOrderingLabel = (ordering?: FieldRow['rowOrdering']) => {
    switch (ordering) {
      case 'west_to_east': return 'Ovest -> Est'
      case 'east_to_west': return 'Est -> Ovest'
      case 'north_to_south': return 'Nord -> Sud'
      case 'south_to_north': return 'Sud -> Nord'
      default: return null
    }
  }

  const formatIrrigationSummary = (row?: FieldRow | null) => {
    if (!row?.irrigationLine) return null

    const details: string[] = [row.irrigationLine.lineType]
    if (row.irrigationLine.emitterSpacingCm) details.push(`${row.irrigationLine.emitterSpacingCm} cm`)
    if (row.irrigationLine.emitterFlowRateLph) details.push(`${row.irrigationLine.emitterFlowRateLph} L/h`)
    return details.join(' • ')
  }

  const getIrrigationStatus = (row?: FieldRow | null, isRealFieldRow?: boolean) => {
    if (!isRealFieldRow) {
      return {
        label: 'Da associare',
        className: 'bg-amber-50 text-amber-700 border-amber-200'
      }
    }

    if (row?.irrigationLine) {
      return {
        label: 'Configurato',
        className: 'bg-blue-50 text-blue-700 border-blue-200'
      }
    }

    return {
      label: 'Da configurare',
      className: 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  const getIrrigationTypeLabel = (lineType?: IrrigationLineType) => {
    switch (lineType) {
      case 'Dripline': return 'Goccia a goccia'
      case 'PipeWithDrippers': return 'Tubo con gocciolatori'
      case 'MicroSprinkler': return 'Micro-sprinkler'
      default: return 'Non impostato'
    }
  }

  const orchardRowIrrigationDefaults = orchard.irrigationDefaults

  const evaluateIrrigationFit = (row: FieldRow | null, rowTrees: OrchardTree[], isRealFieldRow: boolean) => {
    if (!isRealFieldRow || !row) {
      return {
        label: 'Da associare',
        reason: 'Il filare non e ancora collegato a un record reale.',
        className: 'bg-amber-50 text-amber-700 border-amber-200',
        estimatedEmitters: null as number | null,
        emittersPerTree: null as number | null,
        estimatedTotalFlowLph: null as number | null,
      }
    }

    if (!row.irrigationLine) {
      return {
        label: 'Da configurare',
        reason: 'Manca una configurazione irrigua sul filare.',
        className: 'bg-slate-50 text-slate-700 border-slate-200',
        estimatedEmitters: null as number | null,
        emittersPerTree: null as number | null,
        estimatedTotalFlowLph: null as number | null,
      }
    }

    const treeCount = Math.max(rowTrees.length, row.plantCount || 0, 1)
    const emitterSpacingCm = row.irrigationLine.emitterSpacingCm
    const emitterFlowRateLph = row.irrigationLine.emitterFlowRateLph
    const pipeDiameterMm = row.irrigationLine.pipeDiameterMm
    const estimatedEmitters =
      row.irrigationLine.lineType === 'MicroSprinkler'
        ? treeCount
        : row.lengthMeters && emitterSpacingCm
          ? Math.max(1, Math.floor((row.lengthMeters * 100) / emitterSpacingCm))
          : null
    const emittersPerTree =
      estimatedEmitters && treeCount > 0 ? Math.round((estimatedEmitters / treeCount) * 10) / 10 : null
    const estimatedTotalFlowLph =
      estimatedEmitters && emitterFlowRateLph ? Math.round(estimatedEmitters * emitterFlowRateLph * 10) / 10 : null

    const orchardLikeSpacingCm = row.plantSpacing || (orchard.treeSpacingM ? orchard.treeSpacingM * 100 : undefined)
    const isWideTreeSpacing = Boolean(orchardLikeSpacingCm && orchardLikeSpacingCm >= 250)

    if (!pipeDiameterMm || !emitterFlowRateLph) {
      return {
        label: 'Da verificare',
        reason: 'Diametro linea o portata erogatore mancanti.',
        className: 'bg-orange-50 text-orange-700 border-orange-200',
        estimatedEmitters,
        emittersPerTree,
        estimatedTotalFlowLph,
      }
    }

    if (
      row.irrigationLine.lineType !== 'MicroSprinkler' &&
      (!emitterSpacingCm || !estimatedEmitters || !emittersPerTree)
    ) {
      return {
        label: 'Da verificare',
        reason: 'Passo gocciolatori incompleto per stimare la copertura del filare.',
        className: 'bg-orange-50 text-orange-700 border-orange-200',
        estimatedEmitters,
        emittersPerTree,
        estimatedTotalFlowLph,
      }
    }

    if (pipeDiameterMm < 12) {
      return {
        label: 'Da verificare',
        reason: 'Diametro linea molto ridotto per un filare frutteto.',
        className: 'bg-orange-50 text-orange-700 border-orange-200',
        estimatedEmitters,
        emittersPerTree,
        estimatedTotalFlowLph,
      }
    }

    if (row.irrigationLine.lineType === 'MicroSprinkler') {
      return {
        label: 'Coerente',
        reason: 'Configurazione compatibile con una bagnatura piu ampia per pianta.',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        estimatedEmitters,
        emittersPerTree,
        estimatedTotalFlowLph,
      }
    }

    if (emittersPerTree !== null && emittersPerTree < 1) {
      return {
        label: 'Sottodimensionato',
        reason: 'Meno di un erogatore stimato per pianta sul filare.',
        className: 'bg-red-50 text-red-700 border-red-200',
        estimatedEmitters,
        emittersPerTree,
        estimatedTotalFlowLph,
      }
    }

    if (isWideTreeSpacing && emittersPerTree !== null && emittersPerTree < 2) {
      return {
        label: 'Da verificare',
        reason: 'Per sesti larghi la copertura idrica per pianta sembra minima.',
        className: 'bg-orange-50 text-orange-700 border-orange-200',
        estimatedEmitters,
        emittersPerTree,
        estimatedTotalFlowLph,
      }
    }

    return {
      label: 'Coerente',
      reason: 'Parametri irrigui completi e distribuzione compatibile col filare.',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      estimatedEmitters,
      emittersPerTree,
      estimatedTotalFlowLph,
    }
  }

  const fieldRowsById = new Map(fieldRows.map((row) => [row.id, row]))
  const fieldRowsByNumber = new Map<number, FieldRow>()
  fieldRows.forEach((row) => {
    if (!fieldRowsByNumber.has(row.rowNumber)) {
      fieldRowsByNumber.set(row.rowNumber, row)
    }
  })

  const assignedGroups = new Map<string, { row: FieldRow | null; rowNumber: number; trees: OrchardTree[] }>()
  const unassigned: OrchardTree[] = []

  trees.forEach((tree) => {
    const matchedFieldRow =
      (tree.fieldRowId ? fieldRowsById.get(tree.fieldRowId) : undefined) ||
      (tree.rowNumber ? fieldRowsByNumber.get(tree.rowNumber) : undefined)

    if (matchedFieldRow) {
      const key = matchedFieldRow.id
      if (!assignedGroups.has(key)) {
        assignedGroups.set(key, {
          row: matchedFieldRow,
          rowNumber: matchedFieldRow.rowNumber,
          trees: []
        })
      }
      assignedGroups.get(key)!.trees.push(tree)
      return
    }

    if (tree.rowNumber) {
      const key = `legacy-row-${tree.rowNumber}`
      if (!assignedGroups.has(key)) {
        assignedGroups.set(key, {
          row: null,
          rowNumber: tree.rowNumber,
          trees: []
        })
      }
      assignedGroups.get(key)!.trees.push(tree)
      return
    }

    unassigned.push(tree)
  })

  const sortedRows = Array.from(assignedGroups.entries())
    .map(([key, value]) => ({
      key,
      row: value.row,
      rowNumber: value.rowNumber,
      trees: value.trees.sort((a, b) => (a.positionInRow || 0) - (b.positionInRow || 0)),
      isRealFieldRow: Boolean(value.row)
    }))
    .sort((a, b) => a.rowNumber - b.rowNumber)

  const realRowsWithoutIrrigation = sortedRows.filter(({ row, isRealFieldRow }) =>
    Boolean(isRealFieldRow && row && !row.irrigationLine)
  )
  const realRowsWithIrrigation = sortedRows.filter(({ row, isRealFieldRow }) =>
    Boolean(isRealFieldRow && row?.irrigationLine)
  )

  const rowsNeedingAlignment = sortedRows.filter(({ row, trees: rowTrees }) =>
    !row || rowTrees.some((tree) => !tree.fieldRowId)
  )
  const rowsMissingFieldRowRecord = rowsNeedingAlignment.filter(({ row }) => !row).length
  const treesMissingFieldRowLink = rowsNeedingAlignment.reduce(
    (total, { trees: rowTrees }) => total + rowTrees.filter((tree) => !tree.fieldRowId).length,
    0
  )

  useEffect(() => {
    if (loading) {
      setRowsAnimated(false)
      return
    }

    const timeoutId = window.setTimeout(() => {
      setRowsAnimated(true)
    }, 40)

    return () => window.clearTimeout(timeoutId)
  }, [loading, sortedRows.length])

  useEffect(() => {
    setOrchardDefaultsForm({
      lineType: orchard.irrigationDefaults?.lineType || 'Dripline',
      pipeDiameterMm: String(orchard.irrigationDefaults?.pipeDiameterMm || 16),
      emitterSpacingCm: String(orchard.irrigationDefaults?.emitterSpacingCm || 30),
      emitterFlowRateLph: String(orchard.irrigationDefaults?.emitterFlowRateLph || 2),
    })

    setBackfillConfig((prev) => ({
      ...prev,
      plantSpacingCm: prev.plantSpacingCm || (orchard.treeSpacingM ? String(Math.round(orchard.treeSpacingM * 100)) : ''),
      distanceFromPreviousRowCm: prev.distanceFromPreviousRowCm || (orchard.rowSpacingM ? String(Math.round(orchard.rowSpacingM * 100)) : ''),
    }))
  }, [orchard.id, orchard.irrigationDefaults, orchard.treeSpacingM, orchard.rowSpacingM])

  const handleOpenIrrigationModal = (row: FieldRow) => {
    setIrrigationMessage(null)
    setSelectedRowForIrrigation(row)
    setIrrigationReplacementMode(false)
    setIrrigationForm({
      lineType: row.irrigationLine?.lineType || orchardRowIrrigationDefaults?.lineType || 'Dripline',
      pipeDiameterMm: String(row.irrigationLine?.pipeDiameterMm || orchardRowIrrigationDefaults?.pipeDiameterMm || 16),
      emitterSpacingCm: String(row.irrigationLine?.emitterSpacingCm || orchardRowIrrigationDefaults?.emitterSpacingCm || 30),
      emitterFlowRateLph: String(row.irrigationLine?.emitterFlowRateLph || orchardRowIrrigationDefaults?.emitterFlowRateLph || 2),
    })
  }

  const handleSaveOrchardDefaults = async () => {
    try {
      setOrchardDefaultsSaving(true)
      const updatedOrchard = await orchardService.updateOrchardConfiguration(orchard.id, {
        irrigationDefaults: {
          lineType: orchardDefaultsForm.lineType,
          pipeDiameterMm: parseFloat(orchardDefaultsForm.pipeDiameterMm) || undefined,
          emitterSpacingCm: parseFloat(orchardDefaultsForm.emitterSpacingCm) || undefined,
          emitterFlowRateLph: parseFloat(orchardDefaultsForm.emitterFlowRateLph) || undefined,
        }
      })
      onOrchardUpdate(updatedOrchard)
      setIrrigationMessage(`Default irrigui aggiornati per ${updatedOrchard.name}.`)
    } catch (error) {
      console.error('Error updating orchard irrigation defaults:', error)
      alert('Errore durante il salvataggio dei default irrigui del frutteto')
    } finally {
      setOrchardDefaultsSaving(false)
    }
  }

  const handleApplyDefaultsToRows = async () => {
    if (!storageProvider?.updateFieldRow) {
      alert('Aggiornamento filari non disponibile')
      return
    }

    if (!orchardRowIrrigationDefaults) {
      alert('Salva prima i default irrigui del frutteto')
      return
    }

    if (realRowsWithoutIrrigation.length === 0) {
      alert('Non ci sono filari reali senza irrigazione da aggiornare')
      return
    }

    try {
      setApplyDefaultsLoading(true)
      await Promise.all(
        realRowsWithoutIrrigation.map(({ row }) =>
          storageProvider.updateFieldRow(row!.id, {
            irrigationLine: orchardRowIrrigationDefaults
          })
        )
      )
      await loadTrees()
      setIrrigationMessage(`Default irrigui applicati a ${realRowsWithoutIrrigation.length} filari non configurati.`)
    } catch (error) {
      console.error('Error applying orchard defaults to field rows:', error)
      alert('Errore durante l’applicazione dei default irrigui ai filari')
    } finally {
      setApplyDefaultsLoading(false)
    }
  }

  const handleSaveIrrigationConfig = async () => {
    if (!selectedRowForIrrigation || !storageProvider?.updateFieldRow) {
      alert('Aggiornamento irrigazione non disponibile')
      return
    }

    const existingIrrigationLine = selectedRowForIrrigation.irrigationLine
    const shouldReplaceIrrigationLine = Boolean(existingIrrigationLine && irrigationReplacementMode)
    const fixedLineType = existingIrrigationLine && !shouldReplaceIrrigationLine
      ? existingIrrigationLine.lineType
      : irrigationForm.lineType

    try {
      setIrrigationSaving(true)
      await storageProvider.updateFieldRow(selectedRowForIrrigation.id, {
        irrigationLine: {
          lineType: fixedLineType,
          pipeDiameterMm: parseFloat(irrigationForm.pipeDiameterMm) || undefined,
          emitterSpacingCm: parseFloat(irrigationForm.emitterSpacingCm) || undefined,
          emitterFlowRateLph: parseFloat(irrigationForm.emitterFlowRateLph) || undefined,
        }
      })
      await loadTrees()
      setSelectedRowForIrrigation(null)
      setIrrigationReplacementMode(false)
      setIrrigationMessage(
        shouldReplaceIrrigationLine
          ? `Nuovo impianto irriguo creato per ${selectedRowForIrrigation.name}.`
          : `Parametri dell'impianto irriguo aggiornati per ${selectedRowForIrrigation.name}.`
      )
    } catch (error) {
      console.error('Error updating irrigation config:', error)
      alert('Errore durante il salvataggio della configurazione irrigua')
    } finally {
      setIrrigationSaving(false)
    }
  }

  // Statistiche
  const totalTrees = trees.length
  const totalRows = sortedRows.length
  const healthyTrees = trees.filter(t => t.healthStatus === 'healthy').length
  const needsAttention = trees.filter(t => t.needsPruning || t.needsTreatment).length

  // Varietà uniche
  const varieties = new Set(trees.map(t => t.variety).filter(Boolean))

  const chunk = <T,>(items: T[], size: number) => {
    const chunks: T[][] = []
    for (let index = 0; index < items.length; index += size) {
      chunks.push(items.slice(index, index + size))
    }
    return chunks
  }

  const handleBackfillLegacyRows = async () => {
    if (!storageProvider?.getFieldRows || !storageProvider?.createFieldRow) {
      alert('Provider storage non disponibile per allineare i filari legacy')
      return
    }

    const plantSpacingCm = parseFloat(backfillConfig.plantSpacingCm)
    if (!plantSpacingCm || plantSpacingCm <= 0) {
      alert('Inserisci una distanza piante valida per allineare i filari legacy')
      return
    }

    const distanceFromPreviousRowCm = backfillConfig.distanceFromPreviousRowCm
      ? parseFloat(backfillConfig.distanceFromPreviousRowCm)
      : undefined

    const inferPlantSlots = (rowTrees: OrchardTree[]) => {
      const maxPosition = rowTrees.reduce(
        (currentMax, tree) => Math.max(currentMax, Number(tree.positionInRow) || 0),
        0
      )
      return Math.max(maxPosition, rowTrees.length, 1)
    }

    const calculateRowLengthMeters = (rowTrees: OrchardTree[]) =>
      Math.round(((inferPlantSlots(rowTrees) * plantSpacingCm) / 100) * 100) / 100

    const getRowCultivar = (rowTrees: OrchardTree[]) => {
      const uniqueVarieties = [...new Set(rowTrees.map((tree) => tree.variety).filter(Boolean))]
      if (uniqueVarieties.length === 1) return uniqueVarieties[0]
      return undefined
    }

    const getRowPlantedDate = (rowTrees: OrchardTree[]) => {
      const dates = rowTrees.map((tree) => tree.plantingDate).filter(Boolean).sort()
      return dates[0] || undefined
    }

    try {
      setBackfillLoading(true)
      setBackfillMessage(null)

      const [latestTrees, latestFieldRows] = await Promise.all([
        orchardService.getOrchardTrees(orchardId),
        storageProvider.getFieldRows(gardenId)
      ])

      const latestFieldRowsById = new Map(latestFieldRows.map((row) => [row.id, row]))
      const latestFieldRowsByNumber = new Map<number, FieldRow>()
      latestFieldRows.forEach((row) => {
        if (!latestFieldRowsByNumber.has(row.rowNumber)) {
          latestFieldRowsByNumber.set(row.rowNumber, row)
        }
      })

      const latestGroups = new Map<number, { row: FieldRow | null; trees: OrchardTree[] }>()
      latestTrees.forEach((tree) => {
        if (!tree.rowNumber) return

        const linkedRow =
          (tree.fieldRowId ? latestFieldRowsById.get(tree.fieldRowId) : undefined) ||
          latestFieldRowsByNumber.get(tree.rowNumber) ||
          null

        if (!latestGroups.has(tree.rowNumber)) {
          latestGroups.set(tree.rowNumber, { row: linkedRow, trees: [] })
        }
        latestGroups.get(tree.rowNumber)!.trees.push(tree)
      })

      let createdRowsCount = 0
      let linkedTreesCount = 0

      const orderedGroups = Array.from(latestGroups.entries())
        .map(([rowNumber, value]) => ({
          rowNumber,
          row: value.row,
          trees: value.trees.sort((a, b) => (a.positionInRow || 0) - (b.positionInRow || 0))
        }))
        .filter(({ row, trees: rowTrees }) => !row || rowTrees.some((tree) => !tree.fieldRowId))
        .sort((a, b) => a.rowNumber - b.rowNumber)

      for (const group of orderedGroups) {
        let targetRow = group.row

        if (!targetRow) {
          targetRow = await storageProvider.createFieldRow({
            gardenId,
            name: `Fila ${group.rowNumber}`,
            rowNumber: group.rowNumber,
            lengthMeters: calculateRowLengthMeters(group.trees),
            distanceFromPreviousRow: distanceFromPreviousRowCm,
            plantSpacing: plantSpacingCm,
            cultivar: getRowCultivar(group.trees),
            plantCount: group.trees.length,
            orientation: backfillConfig.orientation || undefined,
            rowOrdering: backfillConfig.rowOrdering || undefined,
            plantOrderingInRow: backfillConfig.plantOrderingInRow || undefined,
            irrigationLine: orchardRowIrrigationDefaults,
            plantedDate: getRowPlantedDate(group.trees),
            isActive: true,
            notes: 'Creato automaticamente dal riallineamento filari legacy del frutteto'
          })
          createdRowsCount += 1
        } else if (storageProvider.updateFieldRow) {
          const updates: Partial<FieldRow> = {}

          if (!targetRow.plantSpacing) {
            updates.plantSpacing = plantSpacingCm
          }
          if (!targetRow.distanceFromPreviousRow && distanceFromPreviousRowCm) {
            updates.distanceFromPreviousRow = distanceFromPreviousRowCm
          }
          if (!targetRow.orientation && backfillConfig.orientation) {
            updates.orientation = backfillConfig.orientation
          }
          if (!targetRow.rowOrdering && backfillConfig.rowOrdering) {
            updates.rowOrdering = backfillConfig.rowOrdering
          }
          if (!targetRow.plantOrderingInRow && backfillConfig.plantOrderingInRow) {
            updates.plantOrderingInRow = backfillConfig.plantOrderingInRow
          }
          if (!targetRow.irrigationLine && orchardRowIrrigationDefaults) {
            updates.irrigationLine = orchardRowIrrigationDefaults
          }
          if (!targetRow.cultivar) {
            const cultivar = getRowCultivar(group.trees)
            if (cultivar) updates.cultivar = cultivar
          }
          if (!targetRow.plantedDate) {
            const plantedDate = getRowPlantedDate(group.trees)
            if (plantedDate) updates.plantedDate = plantedDate
          }
          if (!targetRow.plantCount || targetRow.plantCount < group.trees.length) {
            updates.plantCount = group.trees.length
          }
          const inferredLength = calculateRowLengthMeters(group.trees)
          if (!targetRow.lengthMeters || inferredLength > targetRow.lengthMeters) {
            updates.lengthMeters = inferredLength
          }

          if (Object.keys(updates).length > 0) {
            targetRow = await storageProvider.updateFieldRow(targetRow.id, updates)
          }
        }

        const treesToLink = group.trees.filter((tree) => tree.fieldRowId !== targetRow!.id)
        for (const treeBatch of chunk(treesToLink, 40)) {
          await Promise.all(
            treeBatch.map((tree) =>
              orchardService.updateTree(tree.id, { fieldRowId: targetRow!.id })
            )
          )
        }
        linkedTreesCount += treesToLink.length
      }

      await loadTrees()
      setBackfillMessage(`Allineamento completato: ${createdRowsCount} filari creati, ${linkedTreesCount} alberi collegati.`)
    } catch (error) {
      console.error('Error backfilling orchard rows:', error)
      alert('Errore durante l’allineamento dei filari legacy')
    } finally {
      setBackfillLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Rows3 className="mx-auto text-gray-400 mb-4 animate-pulse" size={48} />
          <p className="text-gray-600">Caricamento filari...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Filari del Frutteto</h2>
          <p className="text-gray-600">{totalRows} file, {totalTrees} alberi totali</p>
        </div>
        <button
          onClick={onNavigateToTree}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <TreePine size={16} />
          Gestisci Alberi
        </button>
      </div>

      {/* Statistiche rapide */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{totalRows}</div>
          <div className="text-sm text-gray-600">File</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{totalTrees}</div>
          <div className="text-sm text-gray-600">Alberi Totali</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{healthyTrees}</div>
          <div className="text-sm text-gray-600">Sani</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{needsAttention}</div>
          <div className="text-sm text-gray-600">Attenzione</div>
        </div>
      </div>

      {/* Varietà presenti */}
      {varieties.size > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Varietà presenti</h3>
          <div className="flex flex-wrap gap-2">
            {Array.from(varieties).map(v => (
              <span key={v} className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full border border-green-200">
                {v}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Eye className="text-blue-600 mt-0.5" size={18} />
          <div>
            <h3 className="font-medium text-blue-900">Vista per singolo albero</h3>
            <p className="text-sm text-blue-800">
              Clicca un riquadro nella fila per aprire il dettaglio dell&apos;albero selezionato.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-cyan-900">Profilo standard nuovi impianti</h3>
            <p className="text-sm text-cyan-800 mt-1">
              Viene usato solo per nuovi filari, riallineamento legacy e filari ancora senza impianto. Non modifica i filari gia configurati.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApplyDefaultsToRows}
              disabled={applyDefaultsLoading || !orchardRowIrrigationDefaults || realRowsWithoutIrrigation.length === 0}
              className="shrink-0 px-4 py-2 bg-white text-cyan-700 border border-cyan-300 rounded-lg hover:bg-cyan-100 disabled:opacity-50 transition-colors"
            >
              {applyDefaultsLoading ? 'Assegnazione...' : `Assegna a ${realRowsWithoutIrrigation.length} senza impianto`}
            </button>
            <button
              type="button"
              onClick={handleSaveOrchardDefaults}
              disabled={orchardDefaultsSaving}
              className="shrink-0 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 transition-colors"
            >
              {orchardDefaultsSaving ? 'Salvataggio...' : 'Salva Profilo'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-cyan-900 mb-1">Tipo linea</label>
            <select
              value={orchardDefaultsForm.lineType}
              onChange={(e) => setOrchardDefaultsForm((prev) => ({ ...prev, lineType: e.target.value as IrrigationLineType }))}
              className="w-full px-3 py-2 border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-white"
            >
              <option value="Dripline">Goccia a goccia</option>
              <option value="PipeWithDrippers">Tubo con gocciolatori</option>
              <option value="MicroSprinkler">Micro-sprinkler</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-900 mb-1">Diametro linea (mm)</label>
            <select
              value={orchardDefaultsForm.pipeDiameterMm}
              onChange={(e) => setOrchardDefaultsForm((prev) => ({ ...prev, pipeDiameterMm: e.target.value }))}
              className="w-full px-3 py-2 border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-white"
            >
              <option value="12">12 mm</option>
              <option value="16">16 mm</option>
              <option value="20">20 mm</option>
              <option value="25">25 mm</option>
              <option value="32">32 mm</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-900 mb-1">Passo erogatori (cm)</label>
            <input
              type="number"
              min="1"
              step="1"
              value={orchardDefaultsForm.emitterSpacingCm}
              onChange={(e) => setOrchardDefaultsForm((prev) => ({ ...prev, emitterSpacingCm: e.target.value }))}
              className="w-full px-3 py-2 border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-900 mb-1">Portata erogatore (L/h)</label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={orchardDefaultsForm.emitterFlowRateLph}
              onChange={(e) => setOrchardDefaultsForm((prev) => ({ ...prev, emitterFlowRateLph: e.target.value }))}
              className="w-full px-3 py-2 border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-white"
            />
          </div>
        </div>

        <div className="text-xs text-cyan-900 bg-white/80 border border-cyan-200 rounded-lg px-3 py-2">
          Profilo standard: <strong>{getIrrigationTypeLabel(orchardDefaultsForm.lineType)}</strong>
          {orchardDefaultsForm.emitterSpacingCm ? ` • ${orchardDefaultsForm.emitterSpacingCm} cm` : ''}
          {orchardDefaultsForm.emitterFlowRateLph ? ` • ${orchardDefaultsForm.emitterFlowRateLph} L/h` : ''}
          {orchardDefaultsForm.pipeDiameterMm ? ` • ${orchardDefaultsForm.pipeDiameterMm} mm` : ''}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-cyan-900">
          <div className="bg-white/80 border border-cyan-200 rounded-lg px-3 py-2">
            Filari reali senza impianto: <strong>{realRowsWithoutIrrigation.length}</strong>
          </div>
          <div className="bg-white/80 border border-cyan-200 rounded-lg px-3 py-2 flex items-center gap-2">
            <Lock size={13} className="text-cyan-700" />
            <span>Filari con impianto fisso: <strong>{realRowsWithIrrigation.length}</strong></span>
          </div>
        </div>
      </div>

      {irrigationMessage && (
        <div className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          {irrigationMessage}
        </div>
      )}

      {rowsNeedingAlignment.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-amber-900">Allineamento filari legacy</h3>
              <p className="text-sm text-amber-800 mt-1">
                {rowsMissingFieldRowRecord} filari senza record reale e {treesMissingFieldRowLink} alberi senza collegamento a `fieldRowId`.
              </p>
            </div>
            <button
              type="button"
              onClick={handleBackfillLegacyRows}
              disabled={backfillLoading}
              className="shrink-0 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              {backfillLoading ? 'Allineamento...' : 'Allinea Adesso'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">Passo piante (cm) *</label>
              <input
                type="number"
                value={backfillConfig.plantSpacingCm}
                onChange={(e) => setBackfillConfig((prev) => ({ ...prev, plantSpacingCm: e.target.value }))}
                className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
                min="1"
                step="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">Interfila (cm)</label>
              <input
                type="number"
                value={backfillConfig.distanceFromPreviousRowCm}
                onChange={(e) => setBackfillConfig((prev) => ({ ...prev, distanceFromPreviousRowCm: e.target.value }))}
                className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
                min="0"
                step="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">Orientamento</label>
              <select
                value={backfillConfig.orientation}
                onChange={(e) => setBackfillConfig((prev) => ({ ...prev, orientation: e.target.value as FieldRowAxis }))}
                className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="">Non specificato</option>
                <option value="N-S">Nord-Sud</option>
                <option value="E-W">Est-Ovest</option>
                <option value="NE-SW">NordEst-SudOvest</option>
                <option value="NW-SE">NordOvest-SudEst</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">Ordine filari</label>
              <select
                value={backfillConfig.rowOrdering}
                onChange={(e) => setBackfillConfig((prev) => ({ ...prev, rowOrdering: e.target.value as FieldRowOrdering | '' }))}
                className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="">Non specificato</option>
                {FIELD_ROW_ORDERING_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">Ordine piante</label>
              <select
                value={backfillConfig.plantOrderingInRow}
                onChange={(e) => setBackfillConfig((prev) => ({ ...prev, plantOrderingInRow: e.target.value as FieldRowOrdering | '' }))}
                className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="">Non specificato</option>
                {FIELD_ROW_ORDERING_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-xs text-amber-800">
            I filari mancanti verranno creati con questi parametri di base. Gli alberi già esistenti verranno solo collegati al `fieldRowId`, senza cambiare numerazione o posizione.
          </p>

          {backfillMessage && (
            <div className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {backfillMessage}
            </div>
          )}
        </div>
      )}

      {/* Nessun albero */}
      {totalTrees === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Rows3 className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun filare configurato</h3>
          <p className="text-gray-600 mb-4">
            Vai alla sezione &quot;Alberi&quot; e usa &quot;Crea Fila&quot; per aggiungere alberi in blocco
          </p>
          <button
            onClick={onNavigateToTree}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Crea Prima Fila
          </button>
        </div>
      )}

      {/* Lista Filari */}
      {sortedRows.map(({ key, row, rowNumber, trees: rowTrees, isRealFieldRow }, index) => {
        const rowHealthy = rowTrees.filter((tree) => tree.healthStatus === 'healthy').length
        const rowNeedsAttention = rowTrees.filter((tree) => tree.needsPruning || tree.needsTreatment).length
        const rowVarieties = [...new Set(rowTrees.map((tree) => tree.variety).filter(Boolean))]
        const avgYield = rowTrees.reduce((sum, tree) => sum + (tree.lastHarvestKg || 0), 0)
        const irrigationSummary = formatIrrigationSummary(row)
        const rowOrderingLabel = formatRowOrderingLabel(row?.rowOrdering)
        const plantOrderingLabel = formatRowOrderingLabel(row?.plantOrderingInRow)
        const irrigationStatus = getIrrigationStatus(row, isRealFieldRow)
        const irrigationFit = evaluateIrrigationFit(row, rowTrees, isRealFieldRow)

        return (
          <div
            key={key}
            className={`bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm transition-all duration-500 ${
              rowsAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
            style={{ transitionDelay: `${Math.min(index * 45, 360)}ms` }}
          >
            <div className="bg-green-50 border-b border-green-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold">
                  {rowNumber}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{row?.name || `Fila ${rowNumber}`}</h3>
                  <p className="text-sm text-gray-600">{rowTrees.length} alberi • {rowVarieties.join(', ') || 'N/D'}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {row?.orientation && (
                      <span className="px-2 py-1 bg-white text-gray-700 text-xs rounded-full border border-green-200">
                        Asse: {row.orientation}
                      </span>
                    )}
                    {rowOrderingLabel && (
                      <span className="px-2 py-1 bg-white text-gray-700 text-xs rounded-full border border-green-200">
                        Filari: {rowOrderingLabel}
                      </span>
                    )}
                    {plantOrderingLabel && (
                      <span className="px-2 py-1 bg-white text-gray-700 text-xs rounded-full border border-green-200">
                        Piante: {plantOrderingLabel}
                      </span>
                    )}
                    {irrigationSummary && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                        Irrigazione: {irrigationSummary}
                      </span>
                    )}
                    {!isRealFieldRow && (
                      <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-full border border-amber-200">
                        Filare legacy non ancora associato
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {rowNeedsAttention > 0 && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                    {rowNeedsAttention} da trattare
                  </span>
                )}
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  {rowHealthy}/{rowTrees.length} sani
                </span>
              </div>
            </div>

            <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/60">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Droplets className="text-blue-600" size={16} />
                  <h4 className="text-sm font-semibold text-gray-900">Impianto irriguo del filare</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-xs rounded-full border ${irrigationFit.className}`}>
                    {irrigationFit.label}
                  </span>
                  <span className={`px-2.5 py-1 text-xs rounded-full border ${irrigationStatus.className}`}>
                    {irrigationStatus.label}
                  </span>
                  {isRealFieldRow && (
                    <button
                      type="button"
                      onClick={() => handleOpenIrrigationModal(row!)}
                      className="px-3 py-1.5 text-xs font-medium rounded-full border border-blue-200 text-blue-700 bg-white hover:bg-blue-50 transition-colors"
                    >
                      {row?.irrigationLine ? 'Parametri' : 'Crea impianto'}
                    </button>
                  )}
                </div>
              </div>

              {isRealFieldRow ? (
                <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-white/90 border border-gray-200 rounded-xl px-3 py-3">
                    <div className="text-[11px] uppercase tracking-wide text-gray-500">Tipo</div>
                    <div className="mt-1 text-sm font-medium text-gray-900">
                      {getIrrigationTypeLabel(row?.irrigationLine?.lineType)}
                    </div>
                  </div>
                  <div className="bg-white/90 border border-gray-200 rounded-xl px-3 py-3">
                    <div className="text-[11px] uppercase tracking-wide text-gray-500">Passo gocciolatori</div>
                    <div className="mt-1 text-sm font-medium text-gray-900">
                      {row?.irrigationLine?.emitterSpacingCm ? `${row.irrigationLine.emitterSpacingCm} cm` : 'Non impostato'}
                    </div>
                  </div>
                  <div className="bg-white/90 border border-gray-200 rounded-xl px-3 py-3">
                    <div className="text-[11px] uppercase tracking-wide text-gray-500">Portata emettitore</div>
                    <div className="mt-1 text-sm font-medium text-gray-900">
                      {row?.irrigationLine?.emitterFlowRateLph ? `${row.irrigationLine.emitterFlowRateLph} L/h` : 'Non impostato'}
                    </div>
                  </div>
                  <div className="bg-white/90 border border-gray-200 rounded-xl px-3 py-3">
                    <div className="text-[11px] uppercase tracking-wide text-gray-500">Diametro linea</div>
                    <div className="mt-1 text-sm font-medium text-gray-900">
                      {row?.irrigationLine?.pipeDiameterMm ? `${row.irrigationLine.pipeDiameterMm} mm` : 'Non impostato'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-3">
                  Questo filare esiste ancora come raggruppamento storico. Allinealo per poter mostrare tipo di irrigazione e parametri reali.
                </div>
              )}

              <div className={`mt-3 rounded-xl border px-3 py-3 text-sm ${irrigationFit.className}`}>
                <div className="font-medium">{irrigationFit.reason}</div>
                {(irrigationFit.estimatedEmitters !== null || irrigationFit.emittersPerTree !== null || irrigationFit.estimatedTotalFlowLph !== null) && (
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {irrigationFit.estimatedEmitters !== null && (
                      <span className="px-2 py-1 rounded-full bg-white/80 border border-current/20">
                        Erogatori stimati: {irrigationFit.estimatedEmitters}
                      </span>
                    )}
                    {irrigationFit.emittersPerTree !== null && (
                      <span className="px-2 py-1 rounded-full bg-white/80 border border-current/20">
                        Erogatori/pianta: {irrigationFit.emittersPerTree}
                      </span>
                    )}
                    {irrigationFit.estimatedTotalFlowLph !== null && (
                      <span className="px-2 py-1 rounded-full bg-white/80 border border-current/20">
                        Portata stimata filare: {irrigationFit.estimatedTotalFlowLph} L/h
                      </span>
                    )}
                  </div>
                )}
              </div>

              {irrigationSummary && (
                <p className="mt-3 text-xs text-blue-800">
                  Riepilogo rapido: <strong>{irrigationSummary}</strong>
                </p>
              )}
            </div>

            {/* Alberi nella fila - visualizzazione compatta */}
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {rowTrees
                  .sort((a, b) => (a.positionInRow || 0) - (b.positionInRow || 0))
                  .map((tree) => {
                    const statusColor = tree.healthStatus === 'healthy' ? 'bg-green-100 border-green-300 text-green-800' :
                      tree.healthStatus === 'stressed' ? 'bg-yellow-100 border-yellow-300 text-yellow-800' :
                      tree.healthStatus === 'diseased' ? 'bg-red-100 border-red-300 text-red-800' :
                      'bg-gray-100 border-gray-300 text-gray-800'

                    return (
                      <button
                        key={tree.id}
                        type="button"
                        onClick={() => onSelectTree(tree.id)}
                        aria-label={`Apri dettaglio ${tree.treeNumber}`}
                        className={`group min-w-[84px] px-3 py-2 border rounded-lg text-sm text-left transition-all cursor-pointer hover:shadow-sm hover:-translate-y-0.5 hover:ring-2 hover:ring-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${statusColor}`}
                        title={`Apri ${tree.treeNumber} - ${tree.variety} (${tree.healthStatus})`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-medium">{tree.positionInRow || '?'}</div>
                            <div className="text-[11px] opacity-75">{tree.variety?.substring(0, 8)}</div>
                          </div>
                          <Eye size={12} className="opacity-60 group-hover:opacity-100 shrink-0" />
                        </div>
                        <div className="mt-1 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Apri
                        </div>
                      </button>
                    )
                  })}
              </div>
              {avgYield > 0 && (
                <div className="mt-3 text-sm text-gray-600">
                  Ultima raccolta totale fila: <strong>{avgYield.toFixed(1)} kg</strong>
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Alberi non assegnati a file */}
      {unassigned.length > 0 && (
        <div className="bg-white rounded-lg border border-orange-200 overflow-hidden">
          <div className="bg-orange-50 border-b border-orange-200 px-4 py-3 flex items-center gap-3">
            <AlertCircle className="text-orange-600" size={20} />
            <div>
              <h3 className="font-semibold text-gray-900">Alberi senza fila</h3>
              <p className="text-sm text-gray-600">{unassigned.length} alberi non assegnati a una fila</p>
            </div>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {unassigned.map((tree) => (
                <button
                  key={tree.id}
                  type="button"
                  onClick={() => onSelectTree(tree.id)}
                  aria-label={`Apri dettaglio ${tree.treeNumber}`}
                  className="group px-3 py-2 bg-orange-50 text-orange-700 text-sm rounded border border-orange-200 hover:bg-orange-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <div className="flex items-center gap-2">
                    <span>{tree.treeNumber} ({tree.variety})</span>
                    <Eye size={12} className="opacity-70 group-hover:opacity-100" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedRowForIrrigation && (
        <AppModal
          isOpen
          onClose={() => {
            setSelectedRowForIrrigation(null)
            setIrrigationReplacementMode(false)
          }}
          fullScreenOnMobile
          panelClassName="bg-white shadow-2xl w-full max-w-2xl sm:rounded-2xl"
        >
          <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 flex items-center justify-between sm:rounded-t-2xl">
            <div>
              <h2 className="text-xl font-bold">
                {selectedRowForIrrigation.irrigationLine ? 'Impianto irriguo del filare' : 'Crea impianto irriguo'}
              </h2>
              <p className="text-blue-100 text-sm">{selectedRowForIrrigation.name}</p>
            </div>
            <button
              onClick={() => {
                setSelectedRowForIrrigation(null)
                setIrrigationReplacementMode(false)
              }}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {selectedRowForIrrigation.irrigationLine && !irrigationReplacementMode && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                <div className="flex items-start gap-3">
                  <Lock className="mt-0.5 shrink-0 text-blue-700" size={18} />
                  <div>
                    <p className="font-semibold">
                      Tipo impianto fisso: {getIrrigationTypeLabel(selectedRowForIrrigation.irrigationLine.lineType)}
                    </p>
                    <p className="mt-1">
                      Puoi aggiornare diametro, passo e portata dell'impianto esistente. Per cambiare tipo devi creare un nuovo impianto per questo filare.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedRowForIrrigation.irrigationLine && irrigationReplacementMode && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Stai creando un nuovo impianto irriguo per il filare. Il tipo precedente verra sostituito solo al salvataggio.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo impianto</label>
                {selectedRowForIrrigation.irrigationLine && !irrigationReplacementMode ? (
                  <div className="flex min-h-[42px] items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900">
                    <Lock size={15} className="text-gray-500" />
                    <span>{getIrrigationTypeLabel(selectedRowForIrrigation.irrigationLine.lineType)}</span>
                  </div>
                ) : (
                  <select
                    value={irrigationForm.lineType}
                    onChange={(e) => setIrrigationForm((prev) => ({ ...prev, lineType: e.target.value as IrrigationLineType }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Dripline">Goccia a goccia</option>
                    <option value="PipeWithDrippers">Tubo con gocciolatori</option>
                    <option value="MicroSprinkler">Micro-sprinkler</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diametro linea (mm)</label>
                <select
                  value={irrigationForm.pipeDiameterMm}
                  onChange={(e) => setIrrigationForm((prev) => ({ ...prev, pipeDiameterMm: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="12">12 mm</option>
                  <option value="16">16 mm</option>
                  <option value="20">20 mm</option>
                  <option value="25">25 mm</option>
                  <option value="32">32 mm</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {irrigationForm.lineType === 'MicroSprinkler' ? 'Interasse erogatori (cm)' : 'Passo gocciolatori (cm)'}
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={irrigationForm.emitterSpacingCm}
                  onChange={(e) => setIrrigationForm((prev) => ({ ...prev, emitterSpacingCm: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {irrigationForm.lineType === 'MicroSprinkler' ? 'Portata erogatore (L/h)' : 'Portata gocciolatore (L/h)'}
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={irrigationForm.emitterFlowRateLph}
                  onChange={(e) => setIrrigationForm((prev) => ({ ...prev, emitterFlowRateLph: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
              Il salvataggio aggiorna direttamente il `field_row` collegato a questo filare. I risultati irrigui e le analisi successive useranno questa configurazione stabile.
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              {selectedRowForIrrigation.irrigationLine ? (
                <button
                  type="button"
                  onClick={() => {
                    if (irrigationReplacementMode) {
                      setIrrigationReplacementMode(false)
                      setIrrigationForm((prev) => ({
                        ...prev,
                        lineType: selectedRowForIrrigation.irrigationLine!.lineType
                      }))
                      return
                    }

                    setIrrigationReplacementMode(true)
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 transition-colors"
                >
                  <Droplets size={16} />
                  {irrigationReplacementMode ? 'Mantieni impianto esistente' : 'Crea nuovo impianto'}
                </button>
              ) : (
                <div />
              )}

              <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedRowForIrrigation(null)
                  setIrrigationReplacementMode(false)
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleSaveIrrigationConfig}
                disabled={irrigationSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {irrigationSaving
                  ? 'Salvataggio...'
                  : irrigationReplacementMode
                    ? 'Salva nuovo impianto'
                    : 'Salva parametri'}
              </button>
              </div>
            </div>
          </div>
        </AppModal>
      )}
    </div>
  )
}
