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
import { DatabaseConnectionStatus } from '@/components/debug/DatabaseConnectionStatus'
import type { GardenBed } from '@/types/gardenBed'
import type { GardenRow } from '@/types'

type TabKey = 'advice' | 'history' | 'inventory'

interface TreatmentRecordDB {
  id: string
  garden_id: string
  bed_id?: string
  bed_row_id?: string
  field_row_id?: string
  crop_name: string
  treatment_date: string
  product_name: string
  active_ingredient?: string
  dosage?: number
  dosage_unit?: string
  method: 'spray' | 'dust' | 'granular' | 'injection' | 'soil_drench'
  reason?: 'preventive' | 'curative' | 'pest_control' | 'disease_control' | 'nutrient'
  
  // Nuovi campi per Bio/Tradizionale
  treatment_type?: 'organic' | 'conventional' | 'integrated'
  organic_approved?: boolean
  pre_harvest_interval_days?: number
  registration_number?: string
  notes?: string
  created_at: string
  updated_at: string
}

interface FertilizerApplicationLogDB {
  id: string
  garden_id: string
  bed_id?: string
  bed_row_id?: string
  field_row_id?: string
  fertilizer_product_name: string
  application_date: string
  dosage_amount: number
  dosage_unit: string
  area_sqm?: number
  method: 'surface' | 'incorporated' | 'fertigation' | 'foliar'
  notes?: string
  next_application_date?: string

  // Nuovo campo per tipo fertilizzante
  fertilizer_type?: 'organic' | 'mineral' | 'chemical' | 'mixed' | 'corrective' | 'microelement'

  area_mode: 'area' | 'pots'
  pot_count?: number
  pot_shape?: 'round' | 'rect'
  pot_length_cm?: number
  pot_width_cm?: number
  pot_diameter_cm?: number
  created_at: string
  updated_at: string
}

export default function NutritionPage() {
  const { storageProvider } = useStorage()
  const { isPro } = useTier()

  const [selectedGardenId, setSelectedGardenId] = useState<string>('')
  const [gardens, setGardens] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [treatments, setTreatments] = useState<TreatmentRecordDB[]>([])
  const [fertilizerLogs, setFertilizerLogs] = useState<FertilizerApplicationLogDB[]>([])
  const [fertilizerInventory, setFertilizerInventory] = useState<any[]>([])
  const [phytoInventory, setPhytoInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Nuovo state per filtri Bio/Tradizionale
  const [activeFilter, setActiveFilter] = useState<'all' | 'organic' | 'conventional'>('all')

  const [activeTab, setActiveTab] = useState<TabKey>('advice')
  const [showTreatmentForm, setShowTreatmentForm] = useState(false)
  const [showFertilizationForm, setShowFertilizationForm] = useState(false)
  const [editingFertilizationLog, setEditingFertilizationLog] = useState<any>(null)

  const [beds, setBeds] = useState<GardenBed[]>([])
  const [rowsForSelectedBed, setRowsForSelectedBed] = useState<GardenRow[]>([])
  const [fieldRows, setFieldRows] = useState<any[]>([]) // Field rows del garden
  const [selectedBedId, setSelectedBedId] = useState<string>('')
  const [selectedRowId, setSelectedRowId] = useState<string>('')
  const [selectedFieldRowId, setSelectedFieldRowId] = useState<string>('') // Nuovo: per field rows

  const [bedNameById, setBedNameById] = useState<Record<string, string>>({})
  const [rowNameById, setRowNameById] = useState<Record<string, string>>({})
  const [fieldRowNameById, setFieldRowNameById] = useState<Record<string, string>>({}) // Nuovo: per field rows

  // Form states
  const [treatmentForm, setTreatmentForm] = useState({
    crop_name: '',
    treatment_date: format(new Date(), 'yyyy-MM-dd'),
    product_name: '',
    active_ingredient: '',
    dosage: undefined as number | undefined,
    dosage_unit: 'ml',
    method: 'spray',
    reason: 'preventive',
    treatment_type: 'conventional', // Default tradizionale
    organic_approved: false,
    registration_number: '',
    pre_harvest_interval_days: undefined as number | undefined,
    notes: ''
  })

  const [fertilizationForm, setFertilizationForm] = useState({
    application_date: format(new Date(), 'yyyy-MM-dd'),
    product_name: '',
    dosage_amount: undefined as number | undefined,
    dosage_unit: 'g',
    area_sqm: undefined as number | undefined,
    method: 'surface',
    notes: '',
    next_application_date: '',
    fertilizer_type: 'organic', // Default organico

    area_mode: 'area',
    pot_count: undefined as number | undefined,
    pot_shape: 'round' as 'round' | 'rect',
    pot_length_cm: undefined as number | undefined,
    pot_width_cm: undefined as number | undefined,
    pot_diameter_cm: undefined as number | undefined
  })

  // Nuovo state per filtri Bio/Tradizionale
  const filteredTreatments = useMemo(() => {
    if (activeFilter === 'all') return treatments
    if (activeFilter === 'organic') return treatments.filter(t => t.treatment_type === 'organic' || t.organic_approved === true)
    if (activeFilter === 'conventional') return treatments.filter(t => t.treatment_type === 'conventional' && t.organic_approved !== true)
    return treatments
  }, [treatments, activeFilter])

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
              onClick={() => setShowFertilizationForm(true)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={16} />
              <span className="text-sm font-semibold">Nuova fertilizzazione</span>
            </button>
            <button
              onClick={() => setShowTreatmentForm(true)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              <span className="text-sm font-semibold">Nuovo trattamento</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="text-sm font-semibold text-gray-700">Giardino</div>
            <select
              value={selectedGardenId}
              onChange={(e) => setSelectedGardenId(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm min-w-[200px]"
            >
              <option value="">Seleziona…</option>
              {gardens.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('advice')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'advice' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Consigli
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'history' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Storico
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'inventory' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Inventari
              </button>
            </div>
          </div>
        </div>
        
        {/* Debug: Mostra stato filtri */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            Tab attiva: {activeTab} | Filtro: {activeFilter} | Trattamenti: {treatments.length} | Filtrati: {filteredTreatments.length}
          </p>
        </div>

        {/* Contenuto principale basato su tab */}
        {activeTab === 'advice' ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <FlaskConical size={18} className="text-green-700" />
              <h2 className="text-lg font-bold text-gray-900">Consigli automatici</h2>
            </div>
            <p className="text-sm text-gray-600">
              Seleziona un giardino per visualizzare i consigli personalizzati per le tue colture.
            </p>
          </div>
        ) : activeTab === 'history' ? (
          <div className="space-y-4">
            {/* Filtri Bio/Tradizionale */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-sm font-semibold text-gray-700">Filtri:</div>
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    activeFilter === 'all' ? 'bg-gray-100 text-gray-800' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Tutti
                </button>
                <button
                  onClick={() => setActiveFilter('organic')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    activeFilter === 'organic' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Solo Bio
                </button>
                <button
                  onClick={() => setActiveFilter('conventional')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    activeFilter === 'conventional' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Solo Tradizionale
                </button>
              </div>
            </div>

            {/* Sezioni Fertilizzazioni e Trattamenti */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Package size={18} className="text-green-700" />
                  <h2 className="text-lg font-bold text-gray-900">Fertilizzazioni</h2>
                </div>
                <p className="text-sm text-gray-600">
                  {fertilizerLogs.length === 0 ? 'Nessuna fertilizzazione registrata.' : `${fertilizerLogs.length} fertilizzazioni registrate.`}
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FlaskConical size={18} className="text-blue-700" />
                  <h2 className="text-lg font-bold text-gray-900">Trattamenti</h2>
                </div>
                <p className="text-sm text-gray-600">
                  {filteredTreatments.length === 0 ? 
                    (activeFilter === 'all' ? 'Nessun trattamento registrato.' : 
                     activeFilter === 'organic' ? 'Nessun trattamento biologico registrato.' :
                     'Nessun trattamento tradizionale registrato.') :
                    `${filteredTreatments.length} trattamenti trovati.`
                  }
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Widget Statistiche Bio/Tradizionale */}
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
                <p className="text-sm text-gray-600">
                  {fertilizerInventory.length === 0 ? 'Nessun elemento in inventario.' : `${fertilizerInventory.length} prodotti in inventario.`}
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Droplet size={18} className="text-blue-700" />
                  <h2 className="text-lg font-bold text-gray-900">Inventario fitosanitari</h2>
                </div>
                <p className="text-sm text-gray-600">
                  {phytoInventory.length === 0 ? 'Nessun elemento in inventario.' : `${phytoInventory.length} prodotti in inventario.`}
                </p>
              </div>
            </div>
          </div>
        )}

        <DatabaseConnectionStatus />

        {/* Treatment Modal */}
        {showTreatmentForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <FlaskConical size={18} className="text-blue-700" />
                  <h3 className="font-bold text-gray-900">Nuovo trattamento</h3>
                </div>
                <button onClick={() => setShowTreatmentForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={18} />
                </button>
              </div>

              <form className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Coltura</label>
                    <input
                      type="text"
                      value={treatmentForm.crop_name}
                      onChange={(e) => setTreatmentForm(prev => ({ ...prev, crop_name: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Data</label>
                    <input
                      type="date"
                      value={treatmentForm.treatment_date}
                      onChange={(e) => setTreatmentForm(prev => ({ ...prev, treatment_date: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Prodotto</label>
                    <input
                      type="text"
                      value={treatmentForm.product_name}
                      onChange={(e) => setTreatmentForm(prev => ({ ...prev, product_name: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Tipo trattamento</label>
                    <select
                      value={treatmentForm.treatment_type}
                      onChange={(e) => setTreatmentForm(prev => ({ ...prev, treatment_type: e.target.value as any }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                    >
                      <option value="conventional">Tradizionale</option>
                      <option value="organic">Biologico</option>
                      <option value="integrated">Integrato</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700">Note</label>
                  <textarea
                    value={treatmentForm.notes}
                    onChange={(e) => setTreatmentForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTreatmentForm(false)}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:bg-gray-50"
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
        )}

        {/* Fertilization Modal */}
        {showFertilizationForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Package size={18} className="text-green-700" />
                  <h3 className="font-bold text-gray-900">Nuova fertilizzazione</h3>
                </div>
                <button onClick={() => setShowFertilizationForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={18} />
                </button>
              </div>

              <form className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Data</label>
                    <input
                      type="date"
                      value={fertilizationForm.application_date}
                      onChange={(e) => setFertilizationForm(prev => ({ ...prev, application_date: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Prodotto</label>
                    <input
                      type="text"
                      value={fertilizationForm.product_name}
                      onChange={(e) => setFertilizationForm(prev => ({ ...prev, product_name: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Tipo fertilizzante</label>
                    <select
                      value={fertilizationForm.fertilizer_type}
                      onChange={(e) => setFertilizationForm(prev => ({ ...prev, fertilizer_type: e.target.value as any }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                    >
                      <option value="organic">Organico</option>
                      <option value="mineral">Minerale</option>
                      <option value="chemical">Chimico</option>
                      <option value="mixed">Misto</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Metodo applicazione</label>
                    <select
                      value={fertilizationForm.method}
                      onChange={(e) => setFertilizationForm(prev => ({ ...prev, method: e.target.value as any }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                    >
                      <option value="surface">Superficie</option>
                      <option value="incorporated">Interrato</option>
                      <option value="fertigation">Fertirrigazione</option>
                      <option value="foliar">Fogliare</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700">Note</label>
                  <textarea
                    value={fertilizationForm.notes}
                    onChange={(e) => setFertilizationForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowFertilizationForm(false)}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:bg-gray-50"
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
        )}
      </div>
    </ProFeatureGate>
  )
}