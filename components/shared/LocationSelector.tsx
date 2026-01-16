'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, MapPin, Grid, Rows, Scissors, Plus } from 'lucide-react'
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
  zone_name?: string
  row_number?: number
}

interface FieldRowSection {
  id: string
  field_row_id: string
  section_name: string
  section_number?: number
  start_position_meters: number
  end_position_meters: number
  length_meters: number
  plant_count?: number
}

interface LocationSelectorProps {
  garden: Garden
  selectedZoneId?: string
  selectedFieldRowId?: string
  selectedSectionId?: string
  onLocationChange: (location: {
    zoneId?: string
    zoneName?: string
    fieldRowId?: string
    fieldRowName?: string
    sectionId?: string
    sectionName?: string
    fullLocationName: string
  }) => void
  placeholder?: string
  className?: string
}

export default function LocationSelector({
  garden,
  selectedZoneId,
  selectedFieldRowId,
  selectedSectionId,
  onLocationChange,
  placeholder = "Seleziona zona, filare o porzione...",
  className = ""
}: LocationSelectorProps) {
  const [zones, setZones] = useState<Zone[]>([])
  const [fieldRows, setFieldRows] = useState<FieldRow[]>([])
  const [sections, setSections] = useState<FieldRowSection[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Carica zone dal database
  useEffect(() => {
    const loadZones = async () => {
      if (!garden?.id) return
      
      try {
        setLoading(true)
        const supabase = getSupabaseClient()
        if (!supabase) return
        
        const { data, error } = await supabase
          .from('garden_zones')
          .select('id, name, description, area_sqm')
          .eq('garden_id', garden.id)
          .order('name')

        if (error) throw error
        setZones(data || [])
      } catch (error) {
        console.error('Errore caricamento zone:', error)
        setZones([])
      } finally {
        setLoading(false)
      }
    }

    loadZones()
  }, [garden?.id])

  // Carica filari dal database
  useEffect(() => {
    const loadFieldRows = async () => {
      if (!garden?.id) return
      
      try {
        setLoading(true)
        const supabase = getSupabaseClient()
        if (!supabase) return
        
        const { data, error } = await supabase
          .from('field_rows')
          .select(`
            id,
            name,
            length_meters,
            plant_spacing_cm,
            row_number,
            zone_id,
            garden_zones (
              name
            )
          `)
          .eq('garden_id', garden.id)
          .order('row_number', { ascending: true, nullsFirst: false })
          .order('name')

        if (error) throw error
        
        // Trasforma i dati per includere zone_name
        const transformedData = (data || []).map((row: any) => ({
          id: row.id,
          name: row.name,
          length_meters: row.length_meters,
          plant_spacing_cm: row.plant_spacing_cm,
          row_number: row.row_number,
          zone_id: row.zone_id,
          zone_name: row.garden_zones?.name
        }))
        
        setFieldRows(transformedData)
      } catch (error) {
        console.error('Errore caricamento filari:', error)
        setFieldRows([])
      } finally {
        setLoading(false)
      }
    }

    loadFieldRows()
  }, [garden?.id])

  // Carica porzioni quando viene selezionato un filare
  useEffect(() => {
    const loadSections = async () => {
      if (!selectedFieldRowId) {
        setSections([])
        return
      }

      try {
        setLoading(true)
        const supabase = getSupabaseClient()
        if (!supabase) return
        
        const { data, error } = await supabase
          .from('field_row_sections')
          .select('*')
          .eq('field_row_id', selectedFieldRowId)
          .order('section_number', { ascending: true, nullsFirst: false })
          .order('start_position_meters')

        if (error) throw error
        setSections(data || [])
      } catch (error) {
        console.error('Errore caricamento porzioni:', error)
        setSections([])
      } finally {
        setLoading(false)
      }
    }

    loadSections()
  }, [selectedFieldRowId])

  const handleZoneSelect = (zone: Zone) => {
    onLocationChange({
      zoneId: zone.id,
      zoneName: zone.name,
      fullLocationName: zone.name
    })
    setIsOpen(false)
  }

  const handleFieldRowSelect = (fieldRow: FieldRow) => {
    onLocationChange({
      zoneId: fieldRow.zone_id,
      zoneName: fieldRow.zone_name,
      fieldRowId: fieldRow.id,
      fieldRowName: fieldRow.name,
      fullLocationName: `${fieldRow.zone_name ? fieldRow.zone_name + ' - ' : ''}${fieldRow.name} (${fieldRow.length_meters}m)`
    })
    setIsOpen(false)
  }

  const handleSectionSelect = (section: FieldRowSection) => {
    const fieldRow = fieldRows.find(fr => fr.id === section.field_row_id)
    onLocationChange({
      zoneId: fieldRow?.zone_id,
      zoneName: fieldRow?.zone_name,
      fieldRowId: section.field_row_id,
      fieldRowName: fieldRow?.name,
      sectionId: section.id,
      sectionName: section.section_name,
      fullLocationName: `${fieldRow?.zone_name ? fieldRow.zone_name + ' - ' : ''}${fieldRow?.name} - ${section.section_name} (${section.start_position_meters}-${section.end_position_meters}m)`
    })
    setIsOpen(false)
  }

  const getCurrentLocationName = () => {
    if (selectedSectionId) {
      const section = sections.find(s => s.id === selectedSectionId)
      const fieldRow = fieldRows.find(fr => fr.id === section?.field_row_id)
      if (section && fieldRow) {
        return `${fieldRow.zone_name ? fieldRow.zone_name + ' - ' : ''}${fieldRow.name} - ${section.section_name} (${section.start_position_meters}-${section.end_position_meters}m)`
      }
    }
    
    if (selectedFieldRowId) {
      const fieldRow = fieldRows.find(fr => fr.id === selectedFieldRowId)
      if (fieldRow) {
        return `${fieldRow.zone_name ? fieldRow.zone_name + ' - ' : ''}${fieldRow.name} (${fieldRow.length_meters}m)`
      }
    }
    
    if (selectedZoneId) {
      const zone = zones.find(z => z.id === selectedZoneId)
      if (zone) {
        return zone.name
      }
    }
    
    return placeholder
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-gray-400" />
          <span className={selectedZoneId || selectedFieldRowId || selectedSectionId ? 'text-gray-900' : 'text-gray-500'}>
            {getCurrentLocationName()}
          </span>
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              Caricamento...
            </div>
          ) : (
            <div className="py-2">
              {/* Zone con dimensioni e filari */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b flex items-center justify-between">
                <span>Zone</span>
                {zones.length === 0 && (
                  <button
                    onClick={() => {
                      setIsOpen(false)
                      // TODO: Aprire modal creazione zona
                      alert('Funzionalità creazione zone in arrivo. Per ora crea zone tramite Settings.')
                    }}
                    className="text-green-600 hover:text-green-700 flex items-center gap-1"
                  >
                    <Plus size={12} />
                    <span className="text-xs normal-case">Crea zona</span>
                  </button>
                )}
              </div>
              
              {zones.length === 0 ? (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">
                  <p>Nessuna zona creata.</p>
                  <p className="text-xs mt-1">Vai in Impostazioni per creare zone e filari.</p>
                </div>
              ) : (
                zones.map((zone) => {
                  const zoneFieldRows = fieldRows.filter(fr => fr.zone_id === zone.id)
                  return (
                    <div key={zone.id} className="border-b last:border-b-0">
                      <button
                        onClick={() => handleZoneSelect(zone)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-start gap-3"
                      >
                        <Grid size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900">{zone.name}</div>
                          <div className="text-xs text-gray-500 space-y-0.5">
                            {zone.area_sqm && (
                              <div>📐 {zone.area_sqm} m²</div>
                            )}
                            {zone.description && (
                              <div>{zone.description}</div>
                            )}
                            {zoneFieldRows.length > 0 && (
                              <div className="text-green-600 font-medium">
                                {zoneFieldRows.length} {zoneFieldRows.length === 1 ? 'filare' : 'filari'}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                      
                      {/* Filari di questa zona */}
                      {zoneFieldRows.length > 0 && (
                        <div className="bg-gray-50 border-t">
                          {zoneFieldRows.map((fieldRow) => (
                            <button
                              key={fieldRow.id}
                              onClick={() => handleFieldRowSelect(fieldRow)}
                              className="w-full px-3 py-2 pl-10 text-left hover:bg-gray-100 flex items-center gap-3 border-b last:border-b-0"
                            >
                              <Rows size={14} className="text-green-500 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 text-sm">
                                  {fieldRow.name}
                                  {fieldRow.row_number && (
                                    <span className="text-gray-400 ml-1">#{fieldRow.row_number}</span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">
                                  📏 {fieldRow.length_meters}m
                                  {fieldRow.plant_spacing_cm && ` • Sesto ${fieldRow.plant_spacing_cm}cm`}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })
              )}

              {/* Filari senza zona assegnata */}
              {fieldRows.filter(fr => !fr.zone_id).length > 0 && (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-t mt-2">
                    Filari senza zona
                  </div>
                  {fieldRows.filter(fr => !fr.zone_id).map((fieldRow) => (
                    <button
                      key={fieldRow.id}
                      onClick={() => handleFieldRowSelect(fieldRow)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                    >
                      <Rows size={16} className="text-orange-500" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {fieldRow.name}
                          {fieldRow.row_number && (
                            <span className="text-gray-400 ml-1">#{fieldRow.row_number}</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {fieldRow.length_meters}m
                          {fieldRow.plant_spacing_cm && ` • Sesto ${fieldRow.plant_spacing_cm}cm`}
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {/* Porzioni di Filari (solo se un filare è selezionato) */}
              {selectedFieldRowId && sections.length > 0 && (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-t mt-2">
                    Porzioni di Filare
                  </div>
                  {sections.map((section) => {
                    const fieldRow = fieldRows.find(fr => fr.id === section.field_row_id)
                    return (
                      <button
                        key={section.id}
                        onClick={() => handleSectionSelect(section)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                      >
                        <Scissors size={16} className="text-orange-500" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {fieldRow?.zone_name && (
                              <span className="text-gray-500 text-sm">{fieldRow.zone_name} - </span>
                            )}
                            {fieldRow?.name} - {section.section_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {section.start_position_meters}-{section.end_position_meters}m 
                            ({section.length_meters.toFixed(1)}m)
                            {section.plant_count && ` • ${section.plant_count} piante`}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </>
              )}

              {/* Opzione per tutto l'orto */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-t mt-2">
                Generale
              </div>
              <button
                onClick={() => {
                  onLocationChange({
                    fullLocationName: `Tutto l'orto: ${garden.name}`
                  })
                  setIsOpen(false)
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
              >
                <MapPin size={16} className="text-gray-500" />
                <div>
                  <div className="font-medium text-gray-900">Tutto l'orto</div>
                  <div className="text-xs text-gray-500">{garden.name}</div>
                </div>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}