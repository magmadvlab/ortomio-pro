'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { IrrigationZone } from '@/types/irrigation'
import { GardenBed } from '@/types/gardenBed'
import { Info, CheckCircle2, AlertCircle, Layers } from 'lucide-react'

interface ZoneBedRelationshipGuideProps {
  zones: IrrigationZone[]
  beds: GardenBed[]
}

export function ZoneBedRelationshipGuide({ zones, beds }: ZoneBedRelationshipGuideProps) {
  // Beds assegnati a zone
  const assignedBedIds = new Set<string>()
  zones.forEach(zone => {
    if (zone.bedIds) {
      zone.bedIds.forEach(bedId => assignedBedIds.add(bedId))
    }
  })

  // Beds non assegnati
  const unassignedBeds = beds.filter(bed => !assignedBedIds.has(bed.id))

  // Zone senza beds
  const zonesWithoutBeds = zones.filter(zone => !zone.bedIds || zone.bedIds.length === 0)

  // Relazioni zone → beds
  const zoneRelations = zones.map(zone => {
    const zoneBeds = beds.filter(bed => zone.bedIds?.includes(bed.id))
    return {
      zone,
      beds: zoneBeds,
      bedCount: zoneBeds.length
    }
  })

  return (
    <div className="space-y-4">
      {/* Guida concettuale */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="text-blue-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">
              Come funziona: Zone Irrigue e Letti
            </h3>
            <p className="text-blue-800 text-sm mb-3">
              Una <strong>zona irrigua</strong> è un gruppo di letti/aiuole che condividono lo stesso impianto di irrigazione
              (stessa linea d'acqua, stesso timer, stessa configurazione).
            </p>
            <div className="bg-blue-100 p-3 rounded-lg text-sm text-blue-900 space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5 text-blue-700" />
                <span>
                  <strong>Esempio 1:</strong> Tutti i letti del "Settore Nord" irrigati con lo stesso impianto a goccia → 1 zona
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5 text-blue-700" />
                <span>
                  <strong>Esempio 2:</strong> Serra idroponica con 4 letti → 1 zona (stesso sistema circolante)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5 text-blue-700" />
                <span>
                  <strong>Esempio 3:</strong> 2 aiuole rialzate + 3 letti in campo → 2 zone separate (diversi impianti)
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Mappa relazioni zone → beds */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Layers size={20} className="text-gray-700" />
          Configurazione Attuale
        </h3>

        {zones.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nessuna zona irrigua configurata</p>
            <p className="text-sm mt-1">Crea la tua prima zona per iniziare</p>
          </div>
        ) : (
          <div className="space-y-4">
            {zoneRelations.map(({ zone, beds: zoneBeds, bedCount }) => (
              <div
                key={zone.id}
                className={`p-4 rounded-lg border-2 ${
                  bedCount === 0
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-green-50 border-green-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{zone.name}</h4>
                    <p className="text-sm text-gray-600">
                      Metodo: {zone.method} • Portata: {zone.flowRateLph}L/h
                      {zone.areaSqm ? ` • Area: ${zone.areaSqm}m²` : ''}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    bedCount === 0
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-green-200 text-green-900'
                  }`}>
                    {bedCount} {bedCount === 1 ? 'letto' : 'letti'}
                  </div>
                </div>

                {bedCount === 0 ? (
                  <div className="flex items-center gap-2 text-amber-800 text-sm mt-3">
                    <AlertCircle size={16} />
                    <span>Nessun letto assegnato a questa zona</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {zoneBeds.map(bed => (
                      <div
                        key={bed.id}
                        className="px-3 py-1 bg-white border border-green-300 rounded-lg text-sm flex items-center gap-2"
                      >
                        <CheckCircle2 size={14} className="text-green-600" />
                        <span className="font-medium text-gray-900">{bed.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Warning per beds non assegnati */}
      {unassignedBeds.length > 0 && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-medium text-amber-900 mb-1">
                {unassignedBeds.length} {unassignedBeds.length === 1 ? 'letto non assegnato' : 'letti non assegnati'}
              </h4>
              <p className="text-sm text-amber-800 mb-3">
                I seguenti letti non sono assegnati a nessuna zona irrigua. Per tracciare i consumi d'acqua per letto,
                assegnali a una zona (o creane una nuova).
              </p>
              <div className="flex flex-wrap gap-2">
                {unassignedBeds.map(bed => (
                  <span
                    key={bed.id}
                    className="px-3 py-1 bg-amber-100 border border-amber-300 rounded-lg text-sm font-medium text-amber-900"
                  >
                    {bed.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Warning per zone senza beds */}
      {zonesWithoutBeds.length > 0 && (
        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-medium text-orange-900 mb-1">
                {zonesWithoutBeds.length} {zonesWithoutBeds.length === 1 ? 'zona senza letti' : 'zone senza letti'}
              </h4>
              <p className="text-sm text-orange-800 mb-2">
                Le seguenti zone non hanno letti assegnati. Modifica la zona per assegnare dei letti:
              </p>
              <div className="flex flex-wrap gap-2">
                {zonesWithoutBeds.map(zone => (
                  <span
                    key={zone.id}
                    className="px-3 py-1 bg-orange-100 border border-orange-300 rounded-lg text-sm font-medium text-orange-900"
                  >
                    {zone.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Riepilogo status */}
      {zones.length > 0 && beds.length > 0 && unassignedBeds.length === 0 && zonesWithoutBeds.length === 0 && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-green-600" size={24} />
            <div>
              <h4 className="font-medium text-green-900">Configurazione completa!</h4>
              <p className="text-sm text-green-800">
                Tutti i letti sono assegnati a zone irrigue. Puoi tracciare i consumi d'acqua per ogni zona e letto.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
