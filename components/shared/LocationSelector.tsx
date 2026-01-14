'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown, MapPin, Grid, Rows, Scissors } from 'lucide-react'
import { Garden } from '@/types'

interface Zone {
  id: string
  name: string
  description?: string
}

interface FieldRow {
  id: string
  name: string
  length_meters: number
  plant_spacing_cm?: number
  zone_id?: string
  zone_name?: string
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

  // Carica zone
  useEffect(() => {
    const loadZones = async () => {
      try {
        setLoading(true)
        // Simula caricamento zone - sostituire con chiamata API reale
        const mockZones: Zone[] = [
          { id: 'zone-1', name: 'Zona Nord', description: 'Area settentrionale' },
          { id: 'zone-2', name: 'Zona Sud', description: 'Area meridionale' },
          { id: 'zone-3', name: 'Zona Est', description: 'Area orientale' },
          { id: 'zone-4', name: 'Zona Ovest', description: 'Area occidentale' }
        ]
        setZones(mockZones)
      } catch (error) {
        console.error('Errore caricamento zone:', error)
      } finally {
        setLoading(false)
      }
    }

    if (garden?.id) {
      loadZones()
    }
  }, [garden?.id])

  // Carica filari
  useEffect(() => {
    const loadFieldRows = async () => {
      try {
        setLoading(true)
        // Simula caricamento filari - sostituire con chiamata API reale
        const mockFieldRows: FieldRow[] = [
          { 
            id: 'row-1', 
            name: 'Filare 1', 
            length_meters: 100, 
            plant_spacing_cm: 50,
            zone_id: 'zone-1',
            zone_name: 'Zona Nord'
          },
          { 
            id: 'row-2', 
            name: 'Filare 2', 
            length_meters: 80, 
            plant_spacing_cm: 40,
            zone_id: 'zone-1',
            zone_name: 'Zona Nord'
          },
          { 
            id: 'row-3', 
            name: 'Filare 3', 
            length_meters: 120, 
            plant_spacing_cm: 60,
            zone_id: 'zone-2',
            zone_name: 'Zona Sud'
          }
        ]
        setFieldRows(mockFieldRows)
      } catch (error) {
        console.error('Errore caricamento filari:', error)
      } finally {
        setLoading(false)
      }
    }

    if (garden?.id) {
      loadFieldRows()
    }
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
        // Simula caricamento porzioni - sostituire con chiamata API reale
        const mockSections: FieldRowSection[] = [
          {
            id: 'section-1',
            field_row_id: selectedFieldRowId,
            section_name: 'Inizio',
            section_number: 1,
            start_position_meters: 0,
            end_position_meters: 33.33,
            length_meters: 33.33,
            plant_count: 67
          },
          {
            id: 'section-2',
            field_row_id: selectedFieldRowId,
            section_name: 'Centro',
            section_number: 2,
            start_position_meters: 33.33,
            end_position_meters: 66.66,
            length_meters: 33.33,
            plant_count: 67
          },
          {
            id: 'section-3',
            field_row_id: selectedFieldRowId,
            section_name: 'Fine',
            section_number: 3,
            start_position_meters: 66.66,
            end_position_meters: 100,
            length_meters: 33.34,
            plant_count: 67
          }
        ]
        setSections(mockSections)
      } catch (error) {
        console.error('Errore caricamento porzioni:', error)
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
              {/* Zone */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b">
                Zone
              </div>
              {zones.map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => handleZoneSelect(zone)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                >
                  <Grid size={16} className="text-blue-500" />
                  <div>
                    <div className="font-medium text-gray-900">{zone.name}</div>
                    {zone.description && (
                      <div className="text-xs text-gray-500">{zone.description}</div>
                    )}
                  </div>
                </button>
              ))}

              {/* Filari */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-t mt-2">
                Filari
              </div>
              {fieldRows.map((fieldRow) => (
                <button
                  key={fieldRow.id}
                  onClick={() => handleFieldRowSelect(fieldRow)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                >
                  <Rows size={16} className="text-green-500" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {fieldRow.zone_name && (
                        <span className="text-gray-500 text-sm">{fieldRow.zone_name} - </span>
                      )}
                      {fieldRow.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {fieldRow.length_meters}m
                      {fieldRow.plant_spacing_cm && ` • Sesto ${fieldRow.plant_spacing_cm}cm`}
                    </div>
                  </div>
                </button>
              ))}

              {/* Porzioni di Filari */}
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