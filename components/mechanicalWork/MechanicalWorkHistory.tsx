'use client'

import React, { useState } from 'react'
import { Tractor, Calendar, MapPin, Clock, Euro, User, Eye, Trash2, Edit, Filter } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'
import { MechanicalWorkLog } from '@/services/mechanicalWorkService'
import { WorkType, EquipmentType } from '@/logic/mechanicalWorkEngine'

interface MechanicalWorkHistoryProps {
  logs: MechanicalWorkLog[]
  onEdit?: (log: MechanicalWorkLog) => void
  onDelete?: (logId: string) => Promise<void>
  onView?: (log: MechanicalWorkLog) => void
}

export function MechanicalWorkHistory({
  logs,
  onEdit,
  onDelete,
  onView
}: MechanicalWorkHistoryProps) {
  const [filterType, setFilterType] = useState<WorkType | 'all'>('all')
  const [filterEquipment, setFilterEquipment] = useState<EquipmentType | 'all'>('all')

  // Filtra logs
  const filteredLogs = logs.filter(log => {
    if (filterType !== 'all' && log.workType !== filterType) return false
    if (filterEquipment !== 'all' && log.equipmentType !== filterEquipment) return false
    return true
  })

  // Ordina per data (più recenti prima)
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    return new Date(b.workDate).getTime() - new Date(a.workDate).getTime()
  })

  // Calcola statistiche
  const stats = {
    totalWorks: filteredLogs.length,
    totalArea: filteredLogs.reduce((sum, log) => sum + (log.areaCoveredSqm || 0), 0),
    totalCost: filteredLogs.reduce((sum, log) => sum + (log.cost || 0), 0),
    totalHours: filteredLogs.reduce((sum, log) => sum + (log.durationMinutes || 0), 0) / 60
  }

  // Labels traduzione
  const getWorkTypeLabel = (type: WorkType): string => {
    const labels: Record<WorkType, string> = {
      Plowing: 'Aratura',
      Subsoiling: 'Ripuntatura',
      Harrowing: 'Erpicatura',
      Tilling: 'Fresatura',
      Rolling: 'Rullatura',
      Hoeing: 'Sarchiatura',
      EarthingUp: 'Rincalzatura',
      Mulching: 'Pacciamatura',
      PostSowingRolling: 'Rullatura Post-Semina',
      Clearing: 'Dissodamento',
      Stumping: 'Estirpazione Ceppi',
      StoneRemoval: 'Spietramento',
      Leveling: 'Livellamento',
      DeepSubsoiling: 'Ripuntatura Profonda',
      Digging: 'Vangatura',
      DeepHarrowing: 'Erpicatura Profonda',
      Crumbling: 'Frangizollatura',
      Scraping: 'Scarifica',
      SurfaceLeveling: 'Livellamento Superficiale',
      MinimumTillage: 'Minima Lavorazione',
      StripTillage: 'Strip-Till',
      NoTill: 'Semina su Sodo',
      FormativePruning: 'Potatura Formazione',
      MaintenancePruning: 'Potatura Mantenimento',
      RejuvenationPruning: 'Potatura Ringiovanimento',
      SummerPruning: 'Potatura Verde',
      WinterPruning: 'Potatura Invernale',
      Thinning: 'Diradamento',
      Suckering: 'Scacchiatura',
      Defoliation: 'Defogliazione',
      Tying: 'Legatura',
      OliveShredding: 'Trinciatura Olivo',
      RunnerManagement: 'Gestione Stoloni',
      StrawberryMulching: 'Pacciamatura Fragole',
      StrawberryCleaning: 'Pulizia Fragole',
      CaneRemoval: 'Rimozione Canne',
      TipPruning: 'Cimatura',
      RaspberryTying: 'Legatura Lamponi',
      SuckerThinning: 'Diradamento Polloni',
      FruitBagging: 'Insacchettamento Frutti',
      ExoticThinning: 'Diradamento Esotici',
      Shredding: 'Trinciatura',
      Topping: 'Spollonatura',
      Pruning: 'Potatura'
    }
    return labels[type] || type
  }

  const getEquipmentLabel = (type: EquipmentType): string => {
    const labels: Record<EquipmentType, string> = {
      Tractor: 'Trattore',
      RotaryHarrow: 'Erpice Rotativo',
      Shredder: 'Trincia',
      FertilizerSpreader: 'Spandiconcime',
      Seeder: 'Seminatrice',
      Topper: 'Cimafrusto',
      Defoliator: 'Defogliatrice',
      PrePruner: 'Pre-Potatrice',
      Thinner: 'Diradatrice',
      Rototiller: 'Motozappa',
      Cultivator: 'Cultivatore',
      Mower: 'Falciatrice',
      BrushCutter: 'Decespugliatore',
      TrackedCart: 'Cingolato',
      BackpackSprayer: 'Pompa a Spalla',
      ElectricTier: 'Legatrice Elettrica',
      ElectricPruner: 'Forbici Elettriche',
      TelescopicPruner: 'Potatore Telescopico',
      Manual: 'Manuale'
    }
    return labels[type] || type
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <Tractor size={48} className="mx-auto text-gray-400 mb-3" />
        <p className="text-gray-600 font-medium">Nessuna lavorazione registrata</p>
        <p className="text-sm text-gray-500 mt-1">
          Inizia a tracciare le lavorazioni del tuo orto
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* STATISTICHE RIEPILOGO */}
      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-sm text-gray-600 mb-1">Totale Lavorazioni</div>
          <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.totalWorks}</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-sm text-gray-600 mb-1">Area Lavorata</div>
          <div className="text-xl md:text-2xl font-bold text-gray-900">
            {stats.totalArea.toFixed(0)} <span className="text-sm">m²</span>
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="text-sm text-gray-600 mb-1">Ore Lavorate</div>
          <div className="text-xl md:text-2xl font-bold text-gray-900">
            {stats.totalHours.toFixed(1)} <span className="text-sm">h</span>
          </div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="text-sm text-gray-600 mb-1">Costo Totale</div>
          <div className="text-xl md:text-2xl font-bold text-gray-900">
            {stats.totalCost.toFixed(0)} <span className="text-sm">€</span>
          </div>
        </div>
      </div>

      {/* FILTRI */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <Filter size={18} className="text-gray-600" />
          <span className="font-semibold text-gray-900">Filtri</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Tipo Lavorazione</label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as WorkType | 'all')}
              className="w-full border border-gray-300 rounded px-4 py-3 text-base text-sm"
            >
              <option value="all">Tutte</option>
              <option value="Plowing">Aratura</option>
              <option value="Tilling">Fresatura</option>
              <option value="Hoeing">Sarchiatura</option>
              <option value="Digging">Vangatura</option>
              <option value="Mulching">Pacciamatura</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Attrezzatura</label>
            <select
              value={filterEquipment}
              onChange={e => setFilterEquipment(e.target.value as EquipmentType | 'all')}
              className="w-full border border-gray-300 rounded px-4 py-3 text-base text-sm"
            >
              <option value="all">Tutte</option>
              <option value="Tractor">Trattore</option>
              <option value="Rototiller">Motozappa</option>
              <option value="Manual">Manuale</option>
            </select>
          </div>
        </div>
      </div>

      {/* LISTA LAVORAZIONI */}
      <div className="space-y-3">
        {sortedLogs.map(log => (
          <div
            key={log.id}
            className="bg-white rounded-xl border-2 border-gray-200 p-4 hover:border-green-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-gray-900 text-lg">
                    {getWorkTypeLabel(log.workType)}
                  </h3>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                    {getEquipmentLabel(log.equipmentType)}
                  </span>
                </div>
                {log.description && (
                  <p className="text-sm text-gray-600">{log.description}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {onView && (
                  <button
                    onClick={() => onView(log)}
                    className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Visualizza dettagli"
                  >
                    <Eye size={18} className="text-gray-600" />
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => onEdit(log)}
                    className="p-3 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Modifica"
                  >
                    <Edit size={18} className="text-blue-600" />
                  </button>
                )}
                {onDelete && log.id && (
                  <button
                    onClick={async () => {
                      if (confirm('Eliminare questa lavorazione?')) {
                        await onDelete(log.id!)
                      }
                    }}
                    className="p-3 hover:bg-red-100 rounded-lg transition-colors"
                    title="Elimina"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                )}
              </div>
            </div>

            {/* INFO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-gray-500" />
                <div>
                  <div className="text-xs text-gray-500">Data</div>
                  <div className="font-medium text-gray-900">
                    {format(parseISO(log.workDate), 'd MMM yyyy', { locale: it })}
                  </div>
                </div>
              </div>

              {log.areaCoveredSqm && (
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-gray-500" />
                  <div>
                    <div className="text-xs text-gray-500">Area</div>
                    <div className="font-medium text-gray-900">
                      {log.areaCoveredSqm.toFixed(0)} m²
                    </div>
                  </div>
                </div>
              )}

              {log.durationMinutes && (
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-gray-500" />
                  <div>
                    <div className="text-xs text-gray-500">Durata</div>
                    <div className="font-medium text-gray-900">
                      {log.durationMinutes >= 60
                        ? `${(log.durationMinutes / 60).toFixed(1)}h`
                        : `${log.durationMinutes}min`}
                    </div>
                  </div>
                </div>
              )}

              {log.cost && (
                <div className="flex items-center gap-3">
                  <Euro size={16} className="text-gray-500" />
                  <div>
                    <div className="text-xs text-gray-500">Costo</div>
                    <div className="font-medium text-gray-900">
                      €{log.cost.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* DETTAGLI AGGIUNTIVI */}
            {(log.depthCm || log.operatorName || log.weatherConditions) && (
              <div className="mt-3 pt-3 border-t border-gray-200 text-sm space-y-1">
                {log.depthCm && (
                  <div className="text-gray-600">
                    <span className="font-medium">Profondità:</span> {log.depthCm} cm
                  </div>
                )}
                {log.operatorName && (
                  <div className="text-gray-600 flex items-center gap-3.5">
                    <User size={14} />
                    <span className="font-medium">Operatore:</span> {log.operatorName}
                  </div>
                )}
                {log.weatherConditions?.soilMoisture && (
                  <div className="text-gray-600">
                    <span className="font-medium">Terreno:</span>{' '}
                    {log.weatherConditions.soilMoisture === 'optimal'
                      ? '✅ In tempera'
                      : log.weatherConditions.soilMoisture === 'wet'
                      ? '💧 Bagnato'
                      : '☀️ Asciutto'}
                  </div>
                )}
              </div>
            )}

            {/* NOTE */}
            {log.notes && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                <span className="font-medium text-gray-900">Note:</span> {log.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <p className="text-gray-600">Nessuna lavorazione corrisponde ai filtri selezionati</p>
        </div>
      )}
    </div>
  )
}
