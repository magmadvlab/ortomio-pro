'use client'

import React, { useState, useEffect } from 'react'
import { Bug, Plus, AlertTriangle, TrendingUp, Calendar } from 'lucide-react'
import { OliveFlyTrap, OliveFlyMonitoring } from '@/types/olive'
import { getSupabaseClient } from '@/config/supabase'

interface OliveFlyMonitorProps {
  oliveGroveId: string
  oliveGroveName?: string
}

export default function OliveFlyMonitor({ oliveGroveId, oliveGroveName }: OliveFlyMonitorProps) {
  const [traps, setTraps] = useState<OliveFlyTrap[]>([])
  const [monitorings, setMonitorings] = useState<OliveFlyMonitoring[]>([])
  const [showAddTrapModal, setShowAddTrapModal] = useState(false)
  const [showAddMonitoringModal, setShowAddMonitoringModal] = useState(false)
  const [selectedTrap, setSelectedTrap] = useState<string>('')

  useEffect(() => {
    loadData()
  }, [oliveGroveId])

  const loadData = async () => {
    try {
      const supabase = getSupabaseClient()
      
      const [trapsData, monitoringsData] = await Promise.all([
        supabase.from('olive_fly_traps').select('*').eq('olive_grove_id', oliveGroveId).eq('is_active', true),
        supabase.from('olive_fly_monitoring').select('*, olive_fly_traps(trap_type, location)').eq('olive_fly_traps.olive_grove_id', oliveGroveId).order('inspection_date', { ascending: false }).limit(20)
      ])

      if (trapsData.error) throw trapsData.error
      if (monitoringsData.error) throw monitoringsData.error

      setTraps(trapsData.data || [])
      setMonitorings(monitoringsData.data || [])
    } catch (error) {
      console.error('Error loading fly monitoring data:', error)
    }
  }

  const calculateInfestationPercentage = (infested: number, inspected: number): number => {
    if (inspected === 0) return 0
    return (infested / inspected) * 100
  }

  const getInterventionUrgency = (fliesCaptured: number, infestationPercentage: number): { level: string, color: string, text: string } => {
    if (fliesCaptured > 2 || infestationPercentage > 10) {
      return { level: 'immediate', color: 'bg-red-100 text-red-800', text: '🚨 Intervento Immediato' }
    } else if (fliesCaptured > 1 || infestationPercentage > 5) {
      return { level: 'plan', color: 'bg-orange-100 text-orange-800', text: '⚠️ Pianificare Intervento' }
    } else if (fliesCaptured > 0 || infestationPercentage > 2) {
      return { level: 'monitor', color: 'bg-yellow-100 text-yellow-800', text: '👁️ Monitorare' }
    }
    return { level: 'none', color: 'bg-green-100 text-green-800', text: '✅ Nessun Intervento' }
  }

  const latestMonitoring = monitorings[0]
  const avgFliesPerWeek = monitorings.length > 0 
    ? monitorings.slice(0, 4).reduce((sum, m) => sum + m.flies_captured, 0) / Math.min(4, monitorings.length)
    : 0
  const avgInfestation = monitorings.length > 0
    ? monitorings.slice(0, 4).reduce((sum, m) => sum + m.infestation_percentage, 0) / Math.min(4, monitorings.length)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bug className="text-orange-600" size={20} />
            Monitoraggio Mosca dell'Olivo
          </h3>
          {oliveGroveName && <p className="text-sm text-gray-600">{oliveGroveName}</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddTrapModal(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            <Plus size={18} />
            Nuova Trappola
          </button>
          <button onClick={() => setShowAddMonitoringModal(true)} disabled={traps.length === 0} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
            <Plus size={18} />
            Ispezione
          </button>
        </div>
      </div>

      {/* Stats */}
      {latestMonitoring && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Trappole Attive</p>
            <p className="text-3xl font-bold text-gray-900">{traps.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Media Catture/Settimana</p>
            <p className="text-3xl font-bold text-orange-600">{avgFliesPerWeek.toFixed(1)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Infestazione Media</p>
            <p className="text-3xl font-bold text-red-600">{avgInfestation.toFixed(1)}%</p>
          </div>
          <div className={`border rounded-lg p-4 ${getInterventionUrgency(avgFliesPerWeek, avgInfestation).color}`}>
            <p className="text-sm font-medium mb-1">Urgenza</p>
            <p className="text-sm font-bold">{getInterventionUrgency(avgFliesPerWeek, avgInfestation).text}</p>
          </div>
        </div>
      )}

      {/* Traps */}
      {traps.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4">Trappole Installate</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {traps.map((trap) => (
              <div key={trap.id} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 capitalize">{trap.trap_type}</p>
                <p className="text-xs text-gray-600">{trap.location}</p>
                <p className="text-xs text-gray-500">Installata: {new Date(trap.installation_date).toLocaleDateString('it-IT')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Monitorings */}
      {monitorings.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4">Ispezioni Recenti</h4>
          <div className="space-y-3">
            {monitorings.slice(0, 10).map((monitoring) => {
              const urgency = getInterventionUrgency(monitoring.flies_captured, monitoring.infestation_percentage)
              return (
                <div key={monitoring.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-orange-100 rounded-lg flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-orange-700">{monitoring.flies_captured}</span>
                      <span className="text-xs text-gray-600">mosche</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{new Date(monitoring.inspection_date).toLocaleDateString('it-IT')}</p>
                      <p className="text-xs text-gray-600">Infestazione: {monitoring.infestation_percentage.toFixed(1)}% ({monitoring.infested_olives}/{monitoring.olives_inspected} olive)</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${urgency.color}`}>{urgency.level === 'immediate' ? 'Urgente' : urgency.level === 'plan' ? 'Pianifica' : urgency.level === 'monitor' ? 'Monitora' : 'OK'}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* No Data */}
      {traps.length === 0 && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <Bug size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium mb-2">Nessuna trappola installata</p>
          <p className="text-sm text-gray-500 mb-4">Inizia installando trappole per monitorare la mosca dell'olivo</p>
          <button onClick={() => setShowAddTrapModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            <Plus size={18} />
            Installa Prima Trappola
          </button>
        </div>
      )}

      {/* Add Trap Modal */}
      {showAddTrapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Nuova Trappola</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Trappola *</label>
                <select id="trap-type" className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="chromotropic">Cromotrop (gialla)</option>
                  <option value="pheromone">Feromoni</option>
                  <option value="food-bait">Esca alimentare</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Posizione *</label>
                <input type="text" id="trap-location" placeholder="es. Zona Nord, Filare 3" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Installazione *</label>
                <input type="date" id="trap-date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button onClick={() => setShowAddTrapModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Annulla</button>
                <button onClick={async () => {
                  const type = (document.getElementById('trap-type') as HTMLSelectElement).value
                  const location = (document.getElementById('trap-location') as HTMLInputElement).value
                  const date = (document.getElementById('trap-date') as HTMLInputElement).value
                  if (!location) { alert('Inserisci posizione'); return }
                  try {
                    const supabase = getSupabaseClient()
                    await supabase.from('olive_fly_traps').insert({ olive_grove_id: oliveGroveId, trap_type: type, location, installation_date: date, is_active: true })
                    await loadData()
                    setShowAddTrapModal(false)
                  } catch (error) {
                    console.error('Error saving trap:', error)
                    alert('Errore nel salvataggio')
                  }
                }} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">Salva</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Monitoring Modal */}
      {showAddMonitoringModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Nuova Ispezione</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trappola *</label>
                <select id="monitoring-trap" value={selectedTrap} onChange={(e) => setSelectedTrap(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">Seleziona trappola...</option>
                  {traps.map(trap => <option key={trap.id} value={trap.id}>{trap.trap_type} - {trap.location}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Ispezione *</label>
                <input type="date" id="monitoring-date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mosche Catturate *</label>
                <input type="number" id="monitoring-flies" min="0" defaultValue="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Olive Ispezionate *</label>
                <input type="number" id="monitoring-inspected" min="0" defaultValue="100" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Olive Infestate *</label>
                <input type="number" id="monitoring-infested" min="0" defaultValue="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button onClick={() => setShowAddMonitoringModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Annulla</button>
                <button onClick={async () => {
                  const trapId = selectedTrap
                  const date = (document.getElementById('monitoring-date') as HTMLInputElement).value
                  const flies = parseInt((document.getElementById('monitoring-flies') as HTMLInputElement).value)
                  const inspected = parseInt((document.getElementById('monitoring-inspected') as HTMLInputElement).value)
                  const infested = parseInt((document.getElementById('monitoring-infested') as HTMLInputElement).value)
                  if (!trapId || inspected === 0) { alert('Compila tutti i campi'); return }
                  const infestationPct = calculateInfestationPercentage(infested, inspected)
                  const urgency = getInterventionUrgency(flies, infestationPct)
                  try {
                    const supabase = getSupabaseClient()
                    await supabase.from('olive_fly_monitoring').insert({ trap_id: trapId, inspection_date: date, flies_captured: flies, olives_inspected: inspected, infested_olives: infested, infestation_percentage: infestationPct, intervention_urgency: urgency.level })
                    await loadData()
                    setShowAddMonitoringModal(false)
                    setSelectedTrap('')
                  } catch (error) {
                    console.error('Error saving monitoring:', error)
                    alert('Errore nel salvataggio')
                  }
                }} disabled={!selectedTrap} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">Salva</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
