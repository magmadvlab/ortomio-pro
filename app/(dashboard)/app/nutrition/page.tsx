'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { useTier } from '@/packages/core/hooks/useTier'
import { ProFeatureGate } from '@/components/shared/ProFeatureGate'
import { FlaskConical, Plus, Calendar, Package, Droplet, FileText, X, Edit2 } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { getMasterSheet } from '@/services/plantMasterService'
import { calculatePlantDaysActive } from '@/services/taskCalculationService'
import { calculateNutrientNeeds } from '@/logic/nutrientEngine'
import { calculateFertigationPlan } from '@/logic/fertigationEngine'
import { calculateFertilizerDosage, suggestFertilizerProduct } from '@/logic/fertilizerEngine'
import { allFertilizers, type FertilizerProduct } from '@/data/fertilizers'
import { NutritionStatsWidget } from '@/components/nutrition/NutritionStatsWidget'
import type { GardenBed } from '@/types/gardenBed'
import type { GardenRow } from '@/types'

type TabKey = 'advice' | 'history' | 'inventory'

type FertilizationAreaMode = 'area' | 'pots'
type PotShape = 'round' | 'rect'

interface FertilizationFormState {
  application_date: string
  product_name: string
  dosage_amount?: number
  dosage_unit?: 'ml' | 'g' | 'kg' | 'L'
  area_sqm?: number
  method?: 'incorporated' | 'surface' | 'fertigation' | 'foliar'
  notes?: string
  next_application_date?: string

  // ⭐ Nuovo campo per tipo fertilizzante
  fertilizer_type?: 'organic' | 'mineral' | 'chemical' | 'mixed' | 'corrective' | 'microelement'

  area_mode?: FertilizationAreaMode
  pot_shape?: PotShape
  pot_diameter_cm?: number
  pot_length_cm?: number
  pot_width_cm?: number
  pot_count?: number
}

interface TreatmentFormState {
  crop_name: string
  treatment_date: string
  product_name: string
  active_ingredient?: string
  dosage?: number
  dosage_unit?: 'ml' | 'g' | 'kg' | 'L'
  area_treated?: number
  method?: 'spray' | 'soil' | 'seed' | 'foliar'
  reason?: 'preventive' | 'curative' | 'pest_control' | 'disease_control' | 'nutrient'
  
  // ⭐ Nuovi campi per Bio/Tradizionale
  treatment_type?: 'organic' | 'conventional' | 'integrated'
  organic_approved?: boolean
  registration_number?: string
  pre_harvest_interval_days?: number
  
  operator_name?: string
  notes?: string
  weather_conditions?: {
    temp?: number
    humidity?: number
    wind?: string
  }
}

export default function NutritionPage() {
  const { storageProvider } = useStorage()
  const { isPro } = useTier()

  const loadedRowBedIdsRef = useRef<Set<string>>(new Set())

  const [activeTab, setActiveTab] = useState<TabKey>('advice')
  const [gardens, setGardens] = useState<any[]>([])
  const [selectedGardenId, setSelectedGardenId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // ⭐ Nuovo state per filtri Bio/Tradizionale
  const [activeFilter, setActiveFilter] = useState<'all' | 'organic' | 'conventional'>('all')

  const [tasks, setTasks] = useState<GardenTask[]>([])
  const [treatments, setTreatments] = useState<TreatmentRecordDB[]>([])
  const [fertilizerLogs, setFertilizerLogs] = useState<FertilizerApplicationLogDB[]>([])
  const [fertilizerInventory, setFertilizerInventory] = useState<any[]>([])
  const [phytoInventory, setPhytoInventory] = useState<any[]>([])

  const [beds, setBeds] = useState<GardenBed[]>([])
  const [rowsForSelectedBed, setRowsForSelectedBed] = useState<GardenRow[]>([])
  const [fieldRows, setFieldRows] = useState<any[]>([]) // Field rows del garden
  const [selectedBedId, setSelectedBedId] = useState<string>('')
  const [selectedRowId, setSelectedRowId] = useState<string>('')
  const [selectedFieldRowId, setSelectedFieldRowId] = useState<string>('') // Nuovo: per field rows

  const [bedNameById, setBedNameById] = useState<Record<string, string>>({})
  const [rowNameById, setRowNameById] = useState<Record<string, string>>({})
  const [fieldRowNameById, setFieldRowNameById] = useState<Record<string, string>>({}) // Nuovo: per field rows

  const [showTreatmentForm, setShowTreatmentForm] = useState(false)
  const [showFertilizationForm, setShowFertilizationForm] = useState(false)
  const [editingFertilizationLog, setEditingFertilizationLog] = useState<FertilizerApplicationLogDB | null>(null)

  const [treatmentForm, setTreatmentForm] = useState<TreatmentFormState>({
    crop_name: '',
    treatment_date: format(new Date(), 'yyyy-MM-dd'),
    product_name: '',
    active_ingredient: '',
    dosage: undefined,
    dosage_unit: 'ml',
    area_treated: undefined,
    method: 'spray',
    reason: 'preventive',
    treatment_type: 'conventional', // Default tradizionale
    organic_approved: false,
    registration_number: '',
    pre_harvest_interval_days: undefined,
    operator_name: '',
    notes: '',
    weather_conditions: {},
  })

  const [fertilizationForm, setFertilizationForm] = useState<FertilizationFormState>({
    application_date: format(new Date(), 'yyyy-MM-dd'),
    product_name: '',
    dosage_amount: undefined,
    dosage_unit: 'g',
    area_sqm: undefined,
    method: 'surface',
    notes: '',
    next_application_date: '',
    fertilizer_type: 'organic', // Default organico

    area_mode: 'area',
    pot_shape: 'round',
    pot_diameter_cm: undefined,
    pot_length_cm: undefined,
    pot_width_cm: undefined,
    pot_count: 1,
  })

  const computeEffectiveAreaSqm = (f: FertilizationFormState): number | undefined => {
    if (f.area_mode === 'pots') {
      const count = typeof f.pot_count === 'number' && f.pot_count > 0 ? f.pot_count : 1

      if (f.pot_shape === 'rect') {
        const lengthCm = typeof f.pot_length_cm === 'number' ? f.pot_length_cm : undefined
        const widthCm = typeof f.pot_width_cm === 'number' ? f.pot_width_cm : undefined
        if (!lengthCm || !widthCm || lengthCm <= 0 || widthCm <= 0) return undefined
        const one = (lengthCm / 100) * (widthCm / 100)
        return one * count
      }

      const diameterCm = typeof f.pot_diameter_cm === 'number' ? f.pot_diameter_cm : undefined
      if (!diameterCm || diameterCm <= 0) return undefined
      const r = (diameterCm / 100) / 2
      const one = Math.PI * r * r
      return one * count
    }

    if (typeof f.area_sqm === 'number' && f.area_sqm > 0) return f.area_sqm
    return undefined
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageProvider, selectedGardenId])

  useEffect(() => {
    loadedRowBedIdsRef.current = new Set()
    setBedNameById({})
    setRowNameById({})
    setFieldRowNameById({}) // Reset field row names
  }, [selectedGardenId])

  useEffect(() => {
    const loadBeds = async () => {
      if (!selectedGardenId) {
        setBeds([])
        setFieldRows([])
        setSelectedBedId('')
        setSelectedRowId('')
        setSelectedFieldRowId('')
        return
      }
      try {
        const b = await storageProvider.getGardenBeds(selectedGardenId)
        setBeds(b || [])
        
        // Carica field rows del garden
        try {
          const fieldRowsData = await storageProvider.getFieldRows(selectedGardenId)
          setFieldRows(fieldRowsData || [])
        } catch (error) {
          console.warn('Field rows not available:', error)
          setFieldRows([])
        }
      } catch {
        setBeds([])
        setFieldRows([])
      }
    }
    void loadBeds()
  }, [selectedGardenId, storageProvider])

  useEffect(() => {
    const mapBeds = async () => {
      const map: Record<string, string> = {}
      beds.forEach((b) => {
        map[b.id] = b.name
      })
      setBedNameById(map)

      // Mappa field rows
      const fieldRowsMap: Record<string, string> = {}
      fieldRows.forEach((r) => {
        fieldRowsMap[r.id] = r.name
      })
      setFieldRowNameById(fieldRowsMap)

      const bedIdsInHistory = new Set<string>()
      fertilizerLogs.forEach((l) => {
        if (l.bedId) bedIdsInHistory.add(l.bedId)
      })
      treatments.forEach((t) => {
        if ((t as any).bed_id) bedIdsInHistory.add((t as any).bed_id)
      })

      const bedIdsToFetch = Array.from(bedIdsInHistory).filter((id) => !loadedRowBedIdsRef.current.has(id))
      if (bedIdsToFetch.length === 0) return

      const rowsMap: Record<string, string> = {}
      await Promise.all(
        bedIdsToFetch.map(async (bedId) => {
          try {
            const rows = await storageProvider.getGardenRows(bedId)
            ;(rows || []).forEach((r) => {
              rowsMap[r.id] = r.name
            })
            loadedRowBedIdsRef.current.add(bedId)
          } catch {
            // ignore
          }
        })
      )

      if (Object.keys(rowsMap).length > 0) {
        setRowNameById((prev) => ({ ...prev, ...rowsMap }))
      }
    }

    void mapBeds()
  }, [beds, fertilizerLogs, treatments, fieldRows, storageProvider])

  useEffect(() => {
    const loadRows = async () => {
      setRowsForSelectedBed([])
      setSelectedRowId('')
      if (!selectedBedId) return
      try {
        const rows = await storageProvider.getGardenRows(selectedBedId)
        setRowsForSelectedBed(rows || [])
      } catch {
        setRowsForSelectedBed([])
      }
    }
    void loadRows()
  }, [selectedBedId, storageProvider])

  const loadData = async () => {
    try {
      setLoading(true)
      const gardensList = await storageProvider.getGardens()
      setGardens(gardensList)

      if (gardensList.length > 0 && !selectedGardenId) {
        setSelectedGardenId(gardensList[0].id)
        return
      }

      if (!selectedGardenId) {
        setTasks([])
        setTreatments([])
        setFertilizerLogs([])
        setFertilizerInventory([])
        setPhytoInventory([])
        return
      }

      const [taskList, treatmentList, fertLogs, fertInv, phytoInv] = await Promise.all([
        storageProvider.getTasks(selectedGardenId),
        storageProvider.getTreatments(selectedGardenId),
        storageProvider.getFertilizerApplicationLogs?.(selectedGardenId).catch(() => []) ?? Promise.resolve([]),
        storageProvider.getFertilizerInventory?.(selectedGardenId).catch(() => []) ?? Promise.resolve([]),
        storageProvider.getPhytoInventory?.(selectedGardenId).catch(() => []) ?? Promise.resolve([]),
      ])

      setTasks(taskList || [])
      setTreatments(treatmentList || [])
      setFertilizerLogs((fertLogs || []) as any)
      setFertilizerInventory(fertInv || [])
      setPhytoInventory(phytoInv || [])
    } catch (error) {
      console.error('Error loading nutrition page data:', error)
      setTasks([])
      setTreatments([])
      setFertilizerLogs([])
      setFertilizerInventory([])
      setPhytoInventory([])
    } finally {
      setLoading(false)
    }
  }

  const activePlantingTasks = useMemo(() => {
    return (tasks || []).filter(
      (t) => t.gardenId === selectedGardenId && !t.completed && (t.taskType === 'Sowing' || t.taskType === 'Transplant')
    )
  }, [tasks, selectedGardenId])

  const [adviceRows, setAdviceRows] = useState<
    Array<{
      taskId: string
      plantName: string
      variety?: string
      daysActive: number | null
      nutrientAdvice?: ReturnType<typeof calculateNutrientNeeds>
      fertilizerText?: string
      fertigationText?: string
    }>
  >([])

  useEffect(() => {
    const run = async () => {
      if (!selectedGardenId) {
        setAdviceRows([])
        return
      }

      const garden = gardens.find((g) => g.id === selectedGardenId)
      if (!garden) {
        setAdviceRows([])
        return
      }

      const rows: Array<any> = []

      const normalizeName = (s: string) => s.toLowerCase().trim()
      const availableById = new Map<string, any>()
      const availableByName = new Map<string, any>()
      for (const inv of fertilizerInventory || []) {
        const pid = (inv.product_id || inv.productId || inv.catalog_product_id) as string | undefined
        const pname = (inv.product_name || inv.productName) as string | undefined
        if (pid) availableById.set(String(pid), inv)
        if (pname) availableByName.set(normalizeName(String(pname)), inv)
      }

      const availableCatalogProducts: FertilizerProduct[] = allFertilizers.filter((p) => {
        if (availableById.has(p.id)) return true
        const key = normalizeName(p.name)
        if (availableByName.has(key)) return true
        // fallback fuzzy: inventory name contains product name or vice versa
        for (const [invName] of availableByName.entries()) {
          if (invName.includes(key) || key.includes(invName)) return true
        }
        return false
      })

      for (const t of activePlantingTasks) {
        const master = (await getMasterSheet(t.plantName)) as PlantMasterSheet | null
        const daysActive = calculatePlantDaysActive(tasks, t.plantName, t.variety)

        if (!master || daysActive === null) {
          rows.push({
            taskId: t.id,
            plantName: t.plantName,
            variety: t.variety,
            daysActive,
            fertilizerText: 'Dati insufficienti per calcolare consigli (master sheet o data di semina/trapianto mancante).',
            fertigationText: undefined,
          })
          continue
        }

        const nutrientAdvice = calculateNutrientNeeds(master, daysActive, garden.soilType, t.taskType)

        let fertilizerText = `${nutrientAdvice.adviceTitle}: ${nutrientAdvice.adviceBody}`
        if (nutrientAdvice.soilNote) {
          fertilizerText += `\n${nutrientAdvice.soilNote}`
        }

        if (nutrientAdvice.shouldFertilize) {
          const timing = daysActive < 10 ? 'pre_planting' : 'top_dressing'
          const rec = suggestFertilizerProduct(
            nutrientAdvice.elementFocus,
            garden.soilType,
            timing,
            availableCatalogProducts.length > 0 ? availableCatalogProducts : undefined
          )

          if (rec) {
            const invMatch =
              availableById.get(rec.product.id) ||
              availableByName.get(normalizeName(rec.product.name)) ||
              (() => {
                const key = normalizeName(rec.product.name)
                for (const [invName, inv] of availableByName.entries()) {
                  if (invName.includes(key) || key.includes(invName)) return inv
                }
                return undefined
              })()

            const areaSqm = typeof garden.sizeSqMeters === 'number' ? garden.sizeSqMeters : 1
            const dosage = calculateFertilizerDosage(master, nutrientAdvice, garden.soilType, rec.product, areaSqm)
            if (dosage) {
              fertilizerText += `\n\nProdotto consigliato: ${dosage.product.name}`

              if (!invMatch) {
                fertilizerText += `\n⚠️ Non presente in inventario: da comprare.`
              } else {
                const qty = typeof invMatch.quantity === 'number' ? invMatch.quantity : undefined
                const unit = (invMatch.unit as string | undefined) || (invMatch.quantity_unit as string | undefined)
                if (qty !== undefined) {
                  const isLow =
                    (unit === 'kg' && qty < 1) ||
                    (unit === 'L' && qty < 1) ||
                    (unit === 'bags' && qty < 1) ||
                    (unit === 'units' && qty < 1)
                  if (isLow) {
                    fertilizerText += `\n⚠️ Scorta bassa in inventario: ${qty} ${unit || ''}`
                  }
                }
              }

              fertilizerText += `\nDose: ${dosage.dosage.amount} ${dosage.dosage.unit}${dosage.dosage.perSqm ? '/m²' : ''}`
              if (dosage.totalQuantityNeeded) {
                fertilizerText += `\nTotale stimato: ${dosage.totalQuantityNeeded} ${dosage.dosage.unit}`

                const plantCount =
                  typeof t.currentQuantity === 'number'
                    ? t.currentQuantity
                    : typeof t.quantity === 'number'
                      ? t.quantity
                      : undefined
                if (plantCount && plantCount > 0) {
                  const perPlant = dosage.totalQuantityNeeded / plantCount
                  fertilizerText += `\nStima per pianta: ${perPlant.toFixed(2)} ${dosage.dosage.unit}/pianta (${plantCount} piante)`
                }
              }
              if (dosage.method) {
                fertilizerText += `\nMetodo: ${dosage.method}`
              }
              if (dosage.warnings && dosage.warnings.length > 0) {
                fertilizerText += `\nAvvertenze: ${dosage.warnings.join(' | ')}`
              }
            }
          }
          if (!rec) {
            fertilizerText += `\n\n⚠️ Nessun prodotto in inventario adatto: valuta acquisto prodotto per fabbisogno ${nutrientAdvice.elementFocus}.`
          }
        }

        const fertigationPlan = calculateFertigationPlan(t, master, garden)
        let fertigationText: string | undefined
        if (fertigationPlan.shouldFertigate) {
          fertigationText = `Fertirrigazione: ${fertigationPlan.product?.name}\nDose: ${fertigationPlan.dosage.perLiter.toFixed(1)} ${fertigationPlan.dosage.unit}/L (totale ${fertigationPlan.dosage.totalForIrrigation.toFixed(1)} ${fertigationPlan.dosage.unit})\nFrequenza: ogni ${fertigationPlan.timing.frequency} gg (prossima: ${fertigationPlan.timing.nextDate.toLocaleDateString('it-IT')})`
        }

        rows.push({
          taskId: t.id,
          plantName: t.plantName,
          variety: t.variety,
          daysActive,
          nutrientAdvice,
          fertilizerText,
          fertigationText,
        })
      }

      setAdviceRows(rows)
    }

    run().catch((e) => {
      console.error('Error calculating nutrition advice:', e)
      setAdviceRows([])
    })
  }, [activePlantingTasks, gardens, selectedGardenId, tasks])

  const handleSubmitTreatment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGardenId) return

    try {
      const created = await storageProvider.createTreatment({
        garden_id: selectedGardenId,
        bed_id: selectedBedId || undefined,
        bed_row_id: selectedRowId || undefined,
        field_row_id: selectedFieldRowId || undefined, // Nuovo: supporto field rows
        crop_name: treatmentForm.crop_name,
        treatment_date: treatmentForm.treatment_date,
        product_name: treatmentForm.product_name,
        active_ingredient: treatmentForm.active_ingredient,
        dosage: treatmentForm.dosage ? parseFloat(String(treatmentForm.dosage)) : undefined,
        dosage_unit: treatmentForm.dosage_unit,
        area_treated: treatmentForm.area_treated ? parseFloat(String(treatmentForm.area_treated)) : undefined,
        method: treatmentForm.method,
        reason: treatmentForm.reason,
        
        // ⭐ Nuovi campi Bio/Tradizionale
        treatment_type: treatmentForm.treatment_type,
        organic_approved: treatmentForm.organic_approved,
        registration_number: treatmentForm.registration_number || undefined,
        pre_harvest_interval_days: treatmentForm.pre_harvest_interval_days,
        
        weather_conditions: treatmentForm.weather_conditions,
        operator_name: treatmentForm.operator_name,
        notes: treatmentForm.notes,
      })

      setTreatments([created, ...treatments])
      setShowTreatmentForm(false)
      setSelectedBedId('')
      setSelectedRowId('')
      setSelectedFieldRowId('') // Reset field row selection
      setTreatmentForm({
        crop_name: '',
        treatment_date: format(new Date(), 'yyyy-MM-dd'),
        product_name: '',
        active_ingredient: '',
        dosage: undefined,
        dosage_unit: 'ml',
        area_treated: undefined,
        method: 'spray',
        reason: 'preventive',
        treatment_type: 'conventional',
        organic_approved: false,
        registration_number: '',
        pre_harvest_interval_days: undefined,
        operator_name: '',
        notes: '',
        weather_conditions: {},
      })
    } catch (error: any) {
      console.error('Error saving treatment:', error)
      alert(`Errore: ${error.message || 'Impossibile salvare il trattamento'}`)
    }
  }

  const handleSubmitFertilization = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGardenId) return

    if (!storageProvider.createFertilizerApplicationLog) {
      alert('Persistenza fertilizzazioni non disponibile su questo provider.')
      return
    }

    if (!fertilizationForm.product_name.trim()) {
      alert('Inserisci il nome del prodotto.')
      return
    }
    if (typeof fertilizationForm.dosage_amount !== 'number' || Number.isNaN(fertilizationForm.dosage_amount)) {
      alert('Inserisci una dose valida.')
      return
    }

    const effectiveAreaSqm = computeEffectiveAreaSqm(fertilizationForm)
    if (effectiveAreaSqm === undefined) {
      alert('Inserisci un\'area valida (m²) oppure i parametri del vaso.')
      return
    }

    const dosagePerSqm = fertilizationForm.dosage_amount
    const totalDosage = dosagePerSqm * effectiveAreaSqm

    const autoNote = `Dose per m²: ${dosagePerSqm} ${fertilizationForm.dosage_unit || 'g'}/m²\nArea stimata: ${effectiveAreaSqm.toFixed(3)} m²\nDose totale: ${totalDosage.toFixed(2)} ${fertilizationForm.dosage_unit || 'g'}`
    const mergedNotes = fertilizationForm.notes && fertilizationForm.notes.trim().length > 0
      ? `${fertilizationForm.notes.trim()}\n\n${autoNote}`
      : autoNote

    try {
      if (editingFertilizationLog) {
        if (!storageProvider.updateFertilizerApplicationLog) {
          alert('Aggiornamento fertilizzazioni non disponibile su questo provider.')
          return
        }

        const updated = await storageProvider.updateFertilizerApplicationLog(editingFertilizationLog.id, {
          bedId: selectedBedId || null,
          bedRowId: selectedRowId || null,
          fieldRowId: selectedFieldRowId || null, // Nuovo: supporto field rows
          fertilizerProductName: fertilizationForm.product_name,
          applicationDate: fertilizationForm.application_date,
          areaSqm: Number(effectiveAreaSqm.toFixed(4)),
          dosageAmount: Number(totalDosage.toFixed(4)),
          dosageUnit: fertilizationForm.dosage_unit || 'g',
          method: fertilizationForm.method || 'foliar',
          notes: mergedNotes,
          nextApplicationDate: fertilizationForm.next_application_date || null,
        })

        setFertilizerLogs((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
      } else {
        const created = await storageProvider.createFertilizerApplicationLog({
          gardenId: selectedGardenId,
          taskId: null,
          bedId: selectedBedId || null,
          bedRowId: selectedRowId || null,
          fieldRowId: selectedFieldRowId || null, // Nuovo: supporto field rows
          fertilizerProductId: 'manual',
          fertilizerProductName: fertilizationForm.product_name,
          fertilizerType: fertilizationForm.fertilizer_type || 'organic', // ⭐ Nuovo campo
          dosageAmount: Number(totalDosage.toFixed(4)),
          dosageUnit: fertilizationForm.dosage_unit || 'g',
          applicationDate: fertilizationForm.application_date,
          method: fertilizationForm.method || 'surface',
          areaSqm: Number(effectiveAreaSqm.toFixed(4)),
          notes: mergedNotes,
          nextApplicationDate: fertilizationForm.next_application_date || null,
        })

        setFertilizerLogs([created, ...fertilizerLogs])
      }
      setShowFertilizationForm(false)
      setEditingFertilizationLog(null)
      setSelectedBedId('')
      setSelectedRowId('')
      setSelectedFieldRowId('') // Reset field row selection
      setFertilizationForm({
        application_date: format(new Date(), 'yyyy-MM-dd'),
        product_name: '',
        dosage_amount: undefined,
        dosage_unit: 'g',
        area_sqm: undefined,
        method: 'surface',
        notes: '',
        next_application_date: '',
        fertilizer_type: 'organic',

        area_mode: 'area',
        pot_shape: 'round',
        pot_diameter_cm: undefined,
        pot_length_cm: undefined,
        pot_width_cm: undefined,
        pot_count: 1,
      })
    } catch (error: any) {
      console.error('Error saving fertilization log:', error)
      alert(`Errore: ${error.message || 'Impossibile salvare la fertilizzazione'}`)
    }
  }

  const effectiveAreaSqmPreview = useMemo(() => computeEffectiveAreaSqm(fertilizationForm), [fertilizationForm])
  const totalDosagePreview = useMemo(() => {
    if (typeof fertilizationForm.dosage_amount !== 'number') return undefined
    if (effectiveAreaSqmPreview === undefined) return undefined
    return fertilizationForm.dosage_amount * effectiveAreaSqmPreview
  }, [effectiveAreaSqmPreview, fertilizationForm.dosage_amount])

  const perPotDosagePreview = useMemo(() => {
    if ((fertilizationForm.area_mode || 'area') !== 'pots') return undefined
    if (totalDosagePreview === undefined) return undefined
    const count = typeof fertilizationForm.pot_count === 'number' && fertilizationForm.pot_count > 0 ? fertilizationForm.pot_count : 1
    return totalDosagePreview / count
  }, [fertilizationForm.area_mode, fertilizationForm.pot_count, totalDosagePreview])

  // ⭐ Filtri per Bio/Tradizionale
  const filteredTreatments = useMemo(() => {
    if (activeFilter === 'all') return treatments
    if (activeFilter === 'organic') {
      return treatments.filter(t => t.treatment_type === 'organic' || t.organic_approved)
    }
    if (activeFilter === 'conventional') {
      return treatments.filter(t => t.treatment_type === 'conventional' || (!t.treatment_type && !t.organic_approved))
    }
    return treatments
  }, [treatments, activeFilter])

  const filteredFertilizers = useMemo(() => {
    if (activeFilter === 'all') return fertilizerLogs
    if (activeFilter === 'organic') {
      return fertilizerLogs.filter(f => f.fertilizerType === 'organic')
    }
    if (activeFilter === 'conventional') {
      return fertilizerLogs.filter(f => f.fertilizerType === 'chemical' || f.fertilizerType === 'mineral' || (!f.fertilizerType))
    }
    return fertilizerLogs
  }, [fertilizerLogs, activeFilter])

  return (
    <ProFeatureGate feature="Nutrizione & Trattamenti" requiredTier="PRO">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nutrizione & Trattamenti</h1>
            <p className="text-sm text-gray-600 mt-1">
              Consigli automatici per coltura e fase + registro (fertilizzazioni e trattamenti) + inventari.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingFertilizationLog(null)
                setSelectedBedId('')
                setSelectedRowId('')
                setSelectedFieldRowId('') // Reset field row selection
                setShowFertilizationForm(true)
              }}
              className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={16} />
              <span className="text-sm font-semibold">Nuova fertilizzazione</span>
            </button>
            <button
              onClick={() => {
                setSelectedBedId('')
                setSelectedRowId('')
                setSelectedFieldRowId('')
                setShowTreatmentForm(true)
              }}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              <span className="text-sm font-semibold">Nuovo trattamento</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="text-sm font-semibold text-gray-700">Giardino</div>
            <select
              value={selectedGardenId}
              onChange={(e) => setSelectedGardenId(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
            >
              <option value="">Seleziona…</option>
              {gardens.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name || g.id}
                </option>
              ))}
            </select>

            <div className="sm:ml-auto flex items-center gap-2">
              <button
                onClick={() => setActiveTab('advice')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'advice' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Consigli
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'history' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Storico
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'inventory' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Inventari
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-gray-700">
            Caricamento…
          </div>
        ) : activeTab === 'advice' ? (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <FlaskConical size={18} className="text-blue-700" />
                <h2 className="text-lg font-bold text-gray-900">Consigli automatici</h2>
              </div>

              {activePlantingTasks.length === 0 ? (
                <p className="text-sm text-gray-600">Nessuna coltura attiva (semina/trapianto non completati) nel giardino selezionato.</p>
              ) : (
                <div className="space-y-4">
                  {adviceRows.map((r) => (
                    <div key={r.taskId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {r.plantName}
                            {r.variety ? <span className="text-gray-500"> — {r.variety}</span> : null}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Giorni attivi: {typeof r.daysActive === 'number' ? r.daysActive : '—'}
                          </div>
                        </div>
                        {r.nutrientAdvice?.elementFocus && r.nutrientAdvice.elementFocus !== 'None' ? (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-semibold">
                            Focus: {r.nutrientAdvice.elementFocus}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-3 whitespace-pre-line text-sm text-gray-700">{r.fertilizerText}</div>
                      {r.fertigationText ? (
                        <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200 whitespace-pre-line text-sm text-blue-900">
                          {r.fertigationText}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'history' ? (
          <div className="space-y-4">
            {/* ⭐ Filtri Bio/Tradizionale */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-sm font-semibold text-gray-700">Filtri:</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      activeFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Tutti
                  </button>
                  <button
                    onClick={() => setActiveFilter('organic')}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      activeFilter === 'organic' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    🌱 Solo Bio
                  </button>
                  <button
                    onClick={() => setActiveFilter('conventional')}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      activeFilter === 'conventional' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    🧪 Solo Tradizionale
                  </button>
                </div>
                <div className="ml-auto text-xs text-gray-500">
                  {filteredTreatments.length} trattamenti · {filteredFertilizers.length} fertilizzazioni
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={18} className="text-green-700" />
                <h2 className="text-lg font-bold text-gray-900">Fertilizzazioni</h2>
              </div>

              {filteredFertilizers.length === 0 ? (
                <p className="text-sm text-gray-600">
                  {activeFilter === 'all' ? 'Nessuna fertilizzazione registrata.' : 
                   activeFilter === 'organic' ? 'Nessuna fertilizzazione biologica registrata.' :
                   'Nessuna fertilizzazione tradizionale registrata.'}
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredFertilizers.slice(0, 50).map((l) => (
                    <div key={l.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-gray-900">{l.fertilizerProductName || '—'}</div>
                          {/* ⭐ Badge per tipo fertilizzante */}
                          {l.fertilizerType && (
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                              l.fertilizerType === 'organic' 
                                ? 'bg-green-100 text-green-800' 
                                : l.fertilizerType === 'mineral'
                                ? 'bg-blue-100 text-blue-800'
                                : l.fertilizerType === 'mixed'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {l.fertilizerType === 'organic' ? '🌱 Organico' : 
                               l.fertilizerType === 'mineral' ? '⚡ Minerale' : 
                               l.fertilizerType === 'mixed' ? '🔄 Misto' :
                               l.fertilizerType === 'chemical' ? '🧪 Chimico' : '📦 Altro'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-gray-500">
                            {l.applicationDate ? format(new Date(l.applicationDate), 'd MMM yyyy', { locale: it }) : '—'}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingFertilizationLog(l)
                              setSelectedBedId(l.bedId || '')
                              setSelectedRowId(l.bedRowId || '')
                              setSelectedFieldRowId((l as any).fieldRowId || '') // Nuovo: supporto field rows
                              setFertilizationForm((p) => ({
                                ...p,
                                application_date: l.applicationDate || format(new Date(), 'yyyy-MM-dd'),
                                product_name: l.fertilizerProductName || '',
                                dosage_amount: typeof l.areaSqm === 'number' && l.areaSqm > 0 ? l.dosageAmount / l.areaSqm : undefined,
                                dosage_unit: (l.dosageUnit as any) || 'g',
                                area_sqm: l.areaSqm || undefined,
                                method: (l.method as any) || 'surface',
                                notes: l.notes || '',
                                next_application_date: l.nextApplicationDate || '',
                                area_mode: 'area',
                              }))
                              setShowFertilizationForm(true)
                            }}
                            className="p-1 rounded hover:bg-gray-100 text-gray-600"
                            title="Modifica"
                          >
                            <Edit2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700 mt-1">
                        {typeof l.dosageAmount === 'number' ? `${l.dosageAmount} ${l.dosageUnit || ''}` : 'Dose: —'}
                        {typeof l.areaSqm === 'number' ? ` · Area: ${l.areaSqm} m²` : ''}
                      </div>
                      {l.bedId || l.bedRowId || (l as any).fieldRowId ? (
                        <div className="text-xs text-gray-600 mt-1">
                          {l.bedId ? `Letto: ${bedNameById[l.bedId] || l.bedId}` : ''}
                          {l.bedRowId ? ` · Filare: ${rowNameById[l.bedRowId] || l.bedRowId}` : ''}
                          {(l as any).fieldRowId ? ` · Filare Campo: ${fieldRowNameById[(l as any).fieldRowId] || (l as any).fieldRowId}` : ''}
                        </div>
                      ) : null}
                      {l.nextApplicationDate ? (
                        <div className="text-xs text-gray-600 mt-1">
                          Prossima: {format(new Date(l.nextApplicationDate), 'd MMM yyyy', { locale: it })}
                        </div>
                      ) : null}
                      {l.notes ? <div className="text-xs text-gray-600 mt-2 whitespace-pre-line">{l.notes}</div> : null}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <FlaskConical size={18} className="text-blue-700" />
                <h2 className="text-lg font-bold text-gray-900">Trattamenti</h2>
              </div>

              {filteredTreatments.length === 0 ? (
                <p className="text-sm text-gray-600">
                  {activeFilter === 'all' ? 'Nessun trattamento registrato.' : 
                   activeFilter === 'organic' ? 'Nessun trattamento biologico registrato.' :
                   'Nessun trattamento tradizionale registrato.'}
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredTreatments.slice(0, 50).map((t) => (
                    <div key={t.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-gray-900">{t.product_name || '—'}</div>
                          {/* ⭐ Badge per tipo trattamento */}
                          {t.treatment_type && (
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                              t.treatment_type === 'organic' 
                                ? 'bg-green-100 text-green-800' 
                                : t.treatment_type === 'integrated'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {t.treatment_type === 'organic' ? '🌱 Bio' : 
                               t.treatment_type === 'integrated' ? '🔄 Integrato' : '🧪 Tradizionale'}
                            </span>
                          )}
                          {t.organic_approved && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-semibold">
                              ✓ Ammesso Bio
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t.treatment_date ? format(new Date(t.treatment_date), 'd MMM yyyy', { locale: it }) : '—'}
                        </div>
                      </div>
                      <div className="text-sm text-gray-700 mt-1">
                        {t.crop_name ? `Coltura: ${t.crop_name}` : ''}
                        {t.reason ? ` · Motivo: ${t.reason}` : ''}
                        {t.pre_harvest_interval_days ? ` · Carenza: ${t.pre_harvest_interval_days}gg` : ''}
                      </div>
                      {(t as any).bed_id || (t as any).row_id || (t as any).field_row_id ? (
                        <div className="text-xs text-gray-600 mt-1">
                          {(t as any).bed_id ? `Letto: ${bedNameById[(t as any).bed_id] || (t as any).bed_id}` : ''}
                          {(t as any).row_id ? ` · Filare: ${rowNameById[(t as any).row_id] || (t as any).row_id}` : ''}
                          {(t as any).field_row_id ? ` · Filare Campo: ${fieldRowNameById[(t as any).field_row_id] || (t as any).field_row_id}` : ''}
                        </div>
                      ) : null}
                      {t.dosage ? (
                        <div className="text-xs text-gray-600 mt-1">
                          Dose: {t.dosage} {t.dosage_unit || ''}
                          {t.registration_number ? ` · Reg: ${t.registration_number}` : ''}
                        </div>
                      ) : null}
                      {t.notes ? <div className="text-xs text-gray-600 mt-2 whitespace-pre-line">{t.notes}</div> : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* ⭐ Widget Statistiche Bio/Tradizionale */}
            <NutritionStatsWidget 
              treatments={treatments} 
              fertilizers={fertilizerLogs} 
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package size={18} className="text-green-700" />
                <h2 className="text-lg font-bold text-gray-900">Inventario fertilizzanti</h2>
              </div>

              {fertilizerInventory.length === 0 ? (
                <p className="text-sm text-gray-600">Nessun elemento in inventario.</p>
              ) : (
                <div className="space-y-2">
                  {fertilizerInventory.map((i: any) => (
                    <div key={i.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="font-semibold text-gray-900">{i.product_name || i.productName || '—'}</div>
                      <div className="text-sm text-gray-700 mt-1">
                        Quantità: {i.quantity ?? i.current_quantity ?? '—'} {i.unit || ''}
                      </div>
                      {i.notes ? <div className="text-xs text-gray-600 mt-2 whitespace-pre-line">{i.notes}</div> : null}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Droplet size={18} className="text-blue-700" />
                <h2 className="text-lg font-bold text-gray-900">Inventario fitosanitari</h2>
              </div>

              {phytoInventory.length === 0 ? (
                <p className="text-sm text-gray-600">Nessun elemento in inventario.</p>
              ) : (
                <div className="space-y-2">
                  {phytoInventory.map((i: any) => (
                    <div key={i.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="font-semibold text-gray-900">{i.product_name || i.productName || '—'}</div>
                      <div className="text-sm text-gray-700 mt-1">
                        Quantità: {i.quantity ?? i.current_quantity ?? '—'} {i.unit || ''}
                      </div>
                      {i.expiry_date ? (
                        <div className="text-xs text-gray-600 mt-1">
                          Scadenza: {format(new Date(i.expiry_date), 'd MMM yyyy', { locale: it })}
                        </div>
                      ) : null}
                      {i.notes ? <div className="text-xs text-gray-600 mt-2 whitespace-pre-line">{i.notes}</div> : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Treatment Modal */}
        {showTreatmentForm ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <FlaskConical size={18} className="text-blue-700" />
                  <h3 className="font-bold text-gray-900">Nuovo trattamento</h3>
                </div>
                <button onClick={() => setShowTreatmentForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitTreatment} className="p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Letto (opzionale)</label>
                    <select
                      value={selectedBedId}
                      onChange={(e) => setSelectedBedId(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                    >
                      <option value="">—</option>
                      {beds.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Filare (opzionale)</label>
                    <select
                      value={selectedRowId}
                      onChange={(e) => setSelectedRowId(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                      disabled={!selectedBedId || rowsForSelectedBed.length === 0}
                    >
                      <option value="">—</option>
                      {rowsForSelectedBed.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Filare Campo (opzionale)</label>
                    <select
                      value={selectedFieldRowId}
                      onChange={(e) => setSelectedFieldRowId(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                      disabled={fieldRows.length === 0}
                    >
                      <option value="">—</option>
                      {fieldRows.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.cropName || 'Nessuna coltura'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Coltura</label>
                    <input
                      value={treatmentForm.crop_name}
                      onChange={(e) => setTreatmentForm((p) => ({ ...p, crop_name: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Data</label>
                    <input
                      type="date"
                      value={treatmentForm.treatment_date}
                      onChange={(e) => setTreatmentForm((p) => ({ ...p, treatment_date: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Prodotto</label>
                    <input
                      value={treatmentForm.product_name}
                      onChange={(e) => setTreatmentForm((p) => ({ ...p, product_name: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Principio attivo (opz.)</label>
                    <input
                      value={treatmentForm.active_ingredient || ''}
                      onChange={(e) => setTreatmentForm((p) => ({ ...p, active_ingredient: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Dose</label>
                    <input
                      type="number"
                      value={treatmentForm.dosage ?? ''}
                      onChange={(e) => setTreatmentForm((p) => ({ ...p, dosage: e.target.value ? Number(e.target.value) : undefined }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Unità</label>
                    <select
                      value={treatmentForm.dosage_unit}
                      onChange={(e) => setTreatmentForm((p) => ({ ...p, dosage_unit: e.target.value as any }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                    >
                      <option value="ml">ml</option>
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="L">L</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Motivo</label>
                    <select
                      value={treatmentForm.reason}
                      onChange={(e) => setTreatmentForm((p) => ({ ...p, reason: e.target.value as any }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                    >
                      <option value="preventive">preventivo</option>
                      <option value="curative">curativo</option>
                      <option value="pest_control">parassiti</option>
                      <option value="disease_control">malattie</option>
                      <option value="nutrient">nutriente</option>
                    </select>
                  </div>
                </div>

                {/* ⭐ Nuova sezione Bio/Tradizionale */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Tipo trattamento</label>
                    <select
                      value={treatmentForm.treatment_type || 'conventional'}
                      onChange={(e) => setTreatmentForm((p) => ({ 
                        ...p, 
                        treatment_type: e.target.value as any,
                        // Reset organic_approved se non è organic
                        organic_approved: e.target.value === 'organic' ? p.organic_approved : false
                      }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                    >
                      <option value="conventional">🧪 Tradizionale</option>
                      <option value="organic">🌱 Biologico</option>
                      <option value="integrated">🔄 Integrato</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Ammesso Bio</label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="checkbox"
                        checked={treatmentForm.organic_approved || false}
                        onChange={(e) => setTreatmentForm((p) => ({ ...p, organic_approved: e.target.checked }))}
                        disabled={treatmentForm.treatment_type !== 'organic'}
                        className="mr-2 rounded border-gray-300"
                      />
                      <span className="text-xs text-gray-600">
                        {treatmentForm.treatment_type === 'organic' ? 'Prodotto ammesso' : 'Solo per bio'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700">N. Registrazione</label>
                    <input
                      value={treatmentForm.registration_number || ''}
                      onChange={(e) => setTreatmentForm((p) => ({ ...p, registration_number: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                      placeholder="es. 12345"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Carenza (giorni)</label>
                    <input
                      type="number"
                      value={treatmentForm.pre_harvest_interval_days ?? ''}
                      onChange={(e) => setTreatmentForm((p) => ({ ...p, pre_harvest_interval_days: e.target.value ? Number(e.target.value) : undefined }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                {/* Alert per compatibilità certificazioni */}
                {treatmentForm.treatment_type === 'conventional' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <div className="text-yellow-600 mt-0.5">⚠️</div>
                      <div className="text-xs text-yellow-800">
                        <strong>Attenzione:</strong> Trattamento tradizionale. Verificare compatibilità con eventuali certificazioni biologiche.
                      </div>
                    </div>
                  </div>
                )}

                {treatmentForm.treatment_type === 'organic' && !treatmentForm.organic_approved && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <div className="text-red-600 mt-0.5">❌</div>
                      <div className="text-xs text-red-800">
                        <strong>Errore:</strong> Per trattamenti biologici è necessario confermare che il prodotto sia ammesso in agricoltura biologica.
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-gray-700">Note</label>
                  <textarea
                    value={treatmentForm.notes || ''}
                    onChange={(e) => setTreatmentForm((p) => ({ ...p, notes: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTreatmentForm(false)}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                  >
                    Salva
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {/* Fertilization Modal */}
        {showFertilizationForm ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-green-700" />
                  <h3 className="font-bold text-gray-900">{editingFertilizationLog ? 'Modifica fertilizzazione' : 'Nuova fertilizzazione'}</h3>
                </div>
                <button
                  onClick={() => {
                    setShowFertilizationForm(false)
                    setEditingFertilizationLog(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitFertilization} className="p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Letto (opzionale)</label>
                    <select
                      value={selectedBedId}
                      onChange={(e) => setSelectedBedId(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                    >
                      <option value="">—</option>
                      {beds.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Filare (opzionale)</label>
                    <select
                      value={selectedRowId}
                      onChange={(e) => setSelectedRowId(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                      disabled={!selectedBedId || rowsForSelectedBed.length === 0}
                    >
                      <option value="">—</option>
                      {rowsForSelectedBed.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Filare Campo (opzionale)</label>
                    <select
                      value={selectedFieldRowId}
                      onChange={(e) => setSelectedFieldRowId(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                      disabled={fieldRows.length === 0}
                    >
                      <option value="">—</option>
                      {fieldRows.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.cropName || 'Nessuna coltura'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Data</label>
                    <input
                      type="date"
                      value={fertilizationForm.application_date}
                      onChange={(e) => setFertilizationForm((p) => ({ ...p, application_date: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Prodotto</label>
                    <input
                      value={fertilizationForm.product_name}
                      onChange={(e) => setFertilizationForm((p) => ({ ...p, product_name: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                      required
                    />
                  </div>
                </div>

                {/* ⭐ Nuova sezione per tipo fertilizzante */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Tipo fertilizzante</label>
                    <select
                      value={fertilizationForm.fertilizer_type || 'organic'}
                      onChange={(e) => setFertilizationForm((p) => ({ ...p, fertilizer_type: e.target.value as any }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                    >
                      <option value="organic">🌱 Organico</option>
                      <option value="mineral">⚡ Minerale</option>
                      <option value="chemical">🧪 Chimico</option>
                      <option value="mixed">🔄 Misto</option>
                      <option value="corrective">🔧 Correttivo</option>
                      <option value="microelement">🔬 Microelementi</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Metodo applicazione</label>
                    <select
                      value={fertilizationForm.method || 'surface'}
                      onChange={(e) => setFertilizationForm((p) => ({ ...p, method: e.target.value as any }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                    >
                      <option value="surface">Superficie</option>
                      <option value="incorporated">Interrato</option>
                      <option value="fertigation">Fertirrigazione</option>
                      <option value="foliar">Fogliare</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Dose (per m²)</label>
                    <input
                      type="number"
                      value={fertilizationForm.dosage_amount ?? ''}
                      onChange={(e) => setFertilizationForm((p) => ({ ...p, dosage_amount: e.target.value ? Number(e.target.value) : undefined }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Unità</label>
                    <select
                      value={fertilizationForm.dosage_unit}
                      onChange={(e) => setFertilizationForm((p) => ({ ...p, dosage_unit: e.target.value as any }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                    >
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="ml">ml</option>
                      <option value="L">L</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Modalità area</label>
                    <select
                      value={fertilizationForm.area_mode || 'area'}
                      onChange={(e) => setFertilizationForm((p) => ({ ...p, area_mode: e.target.value as FertilizationAreaMode }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                    >
                      <option value="area">Area (m²)</option>
                      <option value="pots">Vaso</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Area (m²)</label>
                    <input
                      type="number"
                      value={fertilizationForm.area_sqm ?? ''}
                      onChange={(e) => setFertilizationForm((p) => ({ ...p, area_sqm: e.target.value ? Number(e.target.value) : undefined }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                      disabled={(fertilizationForm.area_mode || 'area') !== 'area'}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Prossima (opz.)</label>
                    <input
                      type="date"
                      value={fertilizationForm.next_application_date || ''}
                      onChange={(e) => setFertilizationForm((p) => ({ ...p, next_application_date: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                    />
                  </div>
                </div>

                {(fertilizationForm.area_mode || 'area') === 'pots' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-700">Forma vaso</label>
                      <select
                        value={fertilizationForm.pot_shape || 'round'}
                        onChange={(e) => setFertilizationForm((p) => ({ ...p, pot_shape: e.target.value as PotShape }))}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                      >
                        <option value="round">Tondo</option>
                        <option value="rect">Rettangolare</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700">N. vasi</label>
                      <input
                        type="number"
                        value={fertilizationForm.pot_count ?? 1}
                        onChange={(e) => setFertilizationForm((p) => ({ ...p, pot_count: e.target.value ? Number(e.target.value) : 1 }))}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                        min={1}
                      />
                    </div>
                    {(fertilizationForm.pot_shape || 'round') === 'rect' ? (
                      <>
                        <div>
                          <label className="text-xs font-semibold text-gray-700">Lunghezza (cm)</label>
                          <input
                            type="number"
                            value={fertilizationForm.pot_length_cm ?? ''}
                            onChange={(e) => setFertilizationForm((p) => ({ ...p, pot_length_cm: e.target.value ? Number(e.target.value) : undefined }))}
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-700">Larghezza (cm)</label>
                          <input
                            type="number"
                            value={fertilizationForm.pot_width_cm ?? ''}
                            onChange={(e) => setFertilizationForm((p) => ({ ...p, pot_width_cm: e.target.value ? Number(e.target.value) : undefined }))}
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                          />
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="text-xs font-semibold text-gray-700">Diametro (cm)</label>
                        <input
                          type="number"
                          value={fertilizationForm.pot_diameter_cm ?? ''}
                          onChange={(e) => setFertilizationForm((p) => ({ ...p, pot_diameter_cm: e.target.value ? Number(e.target.value) : undefined }))}
                          className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                        />
                      </div>
                    )}
                  </div>
                ) : null}

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
                  <div>
                    Area effettiva: <span className="font-semibold">{effectiveAreaSqmPreview !== undefined ? `${effectiveAreaSqmPreview.toFixed(3)} m²` : '—'}</span>
                  </div>
                  <div className="mt-1">
                    Dose totale stimata: <span className="font-semibold">{totalDosagePreview !== undefined ? `${totalDosagePreview.toFixed(2)} ${fertilizationForm.dosage_unit || 'g'}` : '—'}</span>
                  </div>
                  {(fertilizationForm.area_mode || 'area') === 'pots' ? (
                    <div className="mt-1">
                      Dose per vaso (stima): <span className="font-semibold">{perPotDosagePreview !== undefined ? `${perPotDosagePreview.toFixed(2)} ${fertilizationForm.dosage_unit || 'g'}/vaso` : '—'}</span>
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700">Note</label>
                  <textarea
                    value={fertilizationForm.notes || ''}
                    onChange={(e) => setFertilizationForm((p) => ({ ...p, notes: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFertilizationForm(false)}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
                  >
                    Salva
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

      </div>
    </ProFeatureGate>
  )
}
