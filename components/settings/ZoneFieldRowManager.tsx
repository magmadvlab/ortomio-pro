'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Grid, Rows, Save, X, AlertCircle } from 'lucide-react'
import { Garden } from '@/types'
import { getSupabaseClient } from '@/config/supabase'

interface Zone {
  id: string
  name: string
  description?: string
  area_sqm?: number
}

interface FieldRow {
  id: string
  name: string
  length_meters: number
  plant_spacing_cm?: number
  zone_id?: string
  row_number?: number
  zone_name?: string
}

interface ZoneFieldRowManagerProps {
  garden: Garden
}

export default function ZoneFieldRowManager({ garden }: ZoneFieldRowManagerProps) {
  const [zones, setZones] = useState<Zone[]>([])
  const [fieldRows, setFieldRows] = useState<FieldRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Form states
  const [showZoneForm, setShowZoneForm] = useState(false)
  const [showFieldRowForm, setShowFieldRowForm] = useState(false)
  const [editingZone, setEditingZone] = useState<Zone | null>(null)
  const [editingFieldRow, setEditingFieldRow] = useState<FieldRow | null>(null)
  
  const [zoneForm, setZoneForm] = useState({
    name: '',
    description: '',
    area_sqm: ''
  })
  
  const [fieldRowForm, setFieldRowForm] = useState({
    name: '',
    length_meters: '',
    plant_spacing_cm: '',
    zone_id: '',
    row_number: ''
  })

  // Carica zone e filari
  useEffect(() => {
    loadData()
  }, [garden.id])

  const loadData = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) return
    
    try {
      setLoading(true)
      
      // Carica zone
      const { data: zonesData, error: zonesError } = await supabase
        .from('garden_zones')
        .select('*')
        .eq('garden_id', garden.id)
        .order('name')

      if (zonesError) throw zonesError
      setZones(zonesData || [])

      // Carica filari
      const { data: rowsData, error: rowsError } = await supabase
        .from('field_rows')
        .select(`
          id,
          name,
          length_meters,
          plant_spacing_cm,
          zone_id,
          row_number,
          garden_zones (
            name
          )
        `)
        .eq('garden_id', garden.id)
        .order('row_number', { ascending: true, nullsFirst: false })
        .order('name')

      if (rowsError) throw rowsError
      
      const transformedRows = (rowsData || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        length_meters: row.length_meters,
        plant_spacing_cm: row.plant_spacing_cm,
        zone_id: row.zone_id,
        row_number: row.row_number,
        zone_name: row.garden_zones?.name
      }))
      
      setFieldRows(transformedRows)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Gestione Zone
  const handleCreateZone = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) return
    
    try {
      setError(null)
      setLoading(true)

      const { error } = await supabase
        .from('garden_zones')
        .insert({
          garden_id: garden.id,
          name: zoneForm.name,
          description: zoneForm.description || null,
          area_sqm: zoneForm.area_sqm ? parseFloat(zoneForm.area_sqm) : null
        })

      if (error) throw error

      setSuccess('Zona creata con successo!')
      setShowZoneForm(false)
      setZoneForm({ name: '', description: '', area_sqm: '' })
      await loadData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateZone = async () => {
    if (!editingZone) return
    
    const supabase = getSupabaseClient()
    if (!supabase) return

    try {
      setError(null)
      setLoading(true)

      const { error } = await supabase
        .from('garden_zones')
        .update({
          name: zoneForm.name,
          description: zoneForm.description || null,
          area_sqm: zoneForm.area_sqm ? parseFloat(zoneForm.area_sqm) : null
        })
        .eq('id', editingZone.id)

      if (error) throw error

      setSuccess('Zona aggiornata con successo!')
      setEditingZone(null)
      setZoneForm({ name: '', description: '', area_sqm: '' })
      await loadData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteZone = async (zoneId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa zona? I filari associati non verranno eliminati ma perderanno il riferimento alla zona.')) {
      return
    }

    const supabase = getSupabaseClient()
    if (!supabase) return

    try {
      setError(null)
      setLoading(true)

      const { error } = await supabase
        .from('garden_zones')
        .delete()
        .eq('id', zoneId)

      if (error) throw error

      setSuccess('Zona eliminata con successo!')
      await loadData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Gestione Filari
  const handleCreateFieldRow = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) return
    
    try {
      setError(null)
      setLoading(true)

      const { error } = await supabase
        .from('field_rows')
        .insert({
          garden_id: garden.id,
          name: fieldRowForm.name,
          length_meters: parseFloat(fieldRowForm.length_meters),
          plant_spacing_cm: fieldRowForm.plant_spacing_cm ? parseInt(fieldRowForm.plant_spacing_cm) : null,
          zone_id: fieldRowForm.zone_id || null,
          row_number: fieldRowForm.row_number ? parseInt(fieldRowForm.row_number) : null
        })

      if (error) throw error

      setSuccess('Filare creato con successo!')
      setShowFieldRowForm(false)
      setFieldRowForm({ name: '', length_meters: '', plant_spacing_cm: '', zone_id: '', row_number: '' })
      await loadData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateFieldRow = async () => {
    if (!editingFieldRow) return

    const supabase = getSupabaseClient()
    if (!supabase) return

    try {
      setError(null)
      setLoading(true)

      const { error } = await supabase
        .from('field_rows')
        .update({
          name: fieldRowForm.name,
          length_meters: parseFloat(fieldRowForm.length_meters),
          plant_spacing_cm: fieldRowForm.plant_spacing_cm ? parseInt(fieldRowForm.plant_spacing_cm) : null,
          zone_id: fieldRowForm.zone_id || null,
          row_number: fieldRowForm.row_number ? parseInt(fieldRowForm.row_number) : null
        })
        .eq('id', editingFieldRow.id)

      if (error) throw error

      setSuccess('Filare aggiornato con successo!')
      setEditingFieldRow(null)
      setFieldRowForm({ name: '', length_meters: '', plant_spacing_cm: '', zone_id: '', row_number: '' })
      await loadData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFieldRow = async (rowId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo filare? Tutte le operazioni associate verranno mantenute ma perderanno il riferimento al filare.')) {
      return
    }

    const supabase = getSupabaseClient()
    if (!supabase) return

    try {
      setError(null)
      setLoading(true)

      const { error } = await supabase
        .from('field_rows')
        .delete()
        .eq('id', rowId)

      if (error) throw error

      setSuccess('Filare eliminato con successo!')
      await loadData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const startEditZone = (zone: Zone) => {
    setEditingZone(zone)
    setZoneForm({
      name: zone.name,
      description: zone.description || '',
      area_sqm: zone.area_sqm?.toString() || ''
    })
    setShowZoneForm(false)
  }

  const startEditFieldRow = (row: FieldRow) => {
    setEditingFieldRow(row)
    setFieldRowForm({
      name: row.name,
      length_meters: row.length_meters.toString(),
      plant_spacing_cm: row.plant_spacing_cm?.toString() || '',
      zone_id: row.zone_id || '',
      row_number: row.row_number?.toString() || ''
    })
    setShowFieldRowForm(false)
  }

  const cancelEdit = () => {
    setEditingZone(null)
    setEditingFieldRow(null)
    setZoneForm({ name: '', description: '', area_sqm: '' })
    setFieldRowForm({ name: '', length_meters: '', plant_spacing_cm: '', zone_id: '', row_number: '' })
  }

  return (
    <div className="space-y-6">
      {/* Messaggi */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-red-800">Errore</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <div className="text-green-500 flex-shrink-0 mt-0.5">✓</div>
          <div>
            <p className="text-sm font-medium text-green-800">{success}</p>
          </div>
          <button onClick={() => setSuccess(null)} className="ml-auto text-green-400 hover:text-green-600">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Sezione Zone */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Grid className="text-blue-500" size={24} />
            <h3 className="text-lg font-semibold">Zone dell'Orto</h3>
          </div>
          <button
            onClick={() => {
              setShowZoneForm(!showZoneForm)
              setEditingZone(null)
              setZoneForm({ name: '', description: '', area_sqm: '' })
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus size={16} />
            Nuova Zona
          </button>
        </div>

        {/* Form Zona */}
        {(showZoneForm || editingZone) && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium mb-3">{editingZone ? 'Modifica Zona' : 'Nuova Zona'}</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Zona *
                </label>
                <input
                  type="text"
                  value={zoneForm.name}
                  onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                  placeholder="es. Zona Nord, Serra 1, ecc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrizione
                </label>
                <input
                  type="text"
                  value={zoneForm.description}
                  onChange={(e) => setZoneForm({ ...zoneForm, description: e.target.value })}
                  placeholder="es. Area settentrionale"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Superficie (m²) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={zoneForm.area_sqm}
                  onChange={(e) => setZoneForm({ ...zoneForm, area_sqm: e.target.value })}
                  placeholder="es. 300"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={editingZone ? handleUpdateZone : handleCreateZone}
                  disabled={!zoneForm.name || loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  <Save size={16} />
                  {editingZone ? 'Aggiorna' : 'Crea'}
                </button>
                <button
                  onClick={() => {
                    setShowZoneForm(false)
                    cancelEdit()
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista Zone */}
        {zones.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nessuna zona creata. Crea la prima zona per organizzare il tuo orto.
          </p>
        ) : (
          <div className="space-y-2">
            {zones.map((zone) => {
              const zoneRows = fieldRows.filter(fr => fr.zone_id === zone.id)
              return (
                <div key={zone.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{zone.name}</h4>
                      {zone.description && (
                        <p className="text-sm text-gray-600">{zone.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        {zone.area_sqm && (
                          <span>📐 {zone.area_sqm} m²</span>
                        )}
                        <span className="text-green-600 font-medium">
                          {zoneRows.length} {zoneRows.length === 1 ? 'filare' : 'filari'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditZone(zone)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteZone(zone.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Sezione Filari */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Rows className="text-green-500" size={24} />
            <h3 className="text-lg font-semibold">Filari</h3>
          </div>
          <button
            onClick={() => {
              setShowFieldRowForm(!showFieldRowForm)
              setEditingFieldRow(null)
              setFieldRowForm({ name: '', length_meters: '', plant_spacing_cm: '', zone_id: '', row_number: '' })
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Plus size={16} />
            Nuovo Filare
          </button>
        </div>

        {/* Form Filare */}
        {(showFieldRowForm || editingFieldRow) && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium mb-3">{editingFieldRow ? 'Modifica Filare' : 'Nuovo Filare'}</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Filare *
                </label>
                <input
                  type="text"
                  value={fieldRowForm.name}
                  onChange={(e) => setFieldRowForm({ ...fieldRowForm, name: e.target.value })}
                  placeholder="es. Filare 1, Filare Pomodori, ecc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lunghezza (m) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={fieldRowForm.length_meters}
                    onChange={(e) => setFieldRowForm({ ...fieldRowForm, length_meters: e.target.value })}
                    placeholder="es. 100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sesto Impianto (cm)
                  </label>
                  <input
                    type="number"
                    value={fieldRowForm.plant_spacing_cm}
                    onChange={(e) => setFieldRowForm({ ...fieldRowForm, plant_spacing_cm: e.target.value })}
                    placeholder="es. 50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zona
                  </label>
                  <select
                    value={fieldRowForm.zone_id}
                    onChange={(e) => setFieldRowForm({ ...fieldRowForm, zone_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Nessuna zona</option>
                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numero Filare
                  </label>
                  <input
                    type="number"
                    value={fieldRowForm.row_number}
                    onChange={(e) => setFieldRowForm({ ...fieldRowForm, row_number: e.target.value })}
                    placeholder="es. 1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={editingFieldRow ? handleUpdateFieldRow : handleCreateFieldRow}
                  disabled={!fieldRowForm.name || !fieldRowForm.length_meters || loading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  <Save size={16} />
                  {editingFieldRow ? 'Aggiorna' : 'Crea'}
                </button>
                <button
                  onClick={() => {
                    setShowFieldRowForm(false)
                    cancelEdit()
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista Filari */}
        {fieldRows.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nessun filare creato. Crea il primo filare per tracciare le tue operazioni.
          </p>
        ) : (
          <div className="space-y-2">
            {fieldRows.map((row) => (
              <div key={row.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {row.name}
                      {row.row_number && (
                        <span className="text-gray-400 ml-2">#{row.row_number}</span>
                      )}
                    </h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>📏 {row.length_meters}m</span>
                      {row.plant_spacing_cm && (
                        <span>Sesto {row.plant_spacing_cm}cm</span>
                      )}
                      {row.zone_name && (
                        <span className="text-blue-600">📍 {row.zone_name}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditFieldRow(row)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteFieldRow(row.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
