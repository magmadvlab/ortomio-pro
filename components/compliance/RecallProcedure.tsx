'use client'

import React, { useState, useEffect } from 'react'
import { 
  RotateCcw, 
  AlertTriangle, 
  Phone, 
  Clock, 
  Play, 
  CheckCircle,
  XCircle,
  FileText,
  Users,
  MessageSquare,
  Timer,
  Target,
  TrendingUp
} from 'lucide-react'
import { globalGapComplianceService } from '../../services/globalGapComplianceService'
import type { 
  GlobalGapRecallProcedure, 
  GlobalGapRecallTest,
  TracedProduct,
  CommunicationTestResult
} from '../../types/globalGapCompliance'

interface RecallProcedureProps {
  gardenId: string
  procedureId?: string
  onSave?: (procedure: GlobalGapRecallProcedure) => void
}

export default function RecallProcedure({ gardenId, procedureId, onSave }: RecallProcedureProps) {
  const [procedure, setProcedure] = useState<Partial<GlobalGapRecallProcedure>>({
    garden_id: gardenId,
    procedure_version: '1.0',
    last_updated: new Date().toISOString().split('T')[0],
    trigger_events: [
      {
        event_type: 'Contaminazione Microbiologica',
        description: 'Rilevamento di patogeni nei prodotti',
        severity_level: 'critical',
        automatic_trigger: true,
        notification_required: true
      },
      {
        event_type: 'Residui Fitofarmaci',
        description: 'Superamento limiti massimi residui',
        severity_level: 'high',
        automatic_trigger: true,
        notification_required: true
      }
    ],
    decision_makers: [
      {
        name: '',
        position: 'Responsabile Qualità',
        contact_info: { phone: '', email: '' },
        authority_level: 'local',
        backup_person: ''
      }
    ],
    communication_plan: {
      internal_contacts: [],
      external_contacts: [],
      notification_methods: ['phone', 'email', 'sms'],
      escalation_timeline: [
        {
          time_from_detection: 30,
          action_required: 'Notifica immediata team interno',
          responsible_person: 'Responsabile Qualità',
          notification_targets: ['Team Qualità', 'Direzione']
        },
        {
          time_from_detection: 60,
          action_required: 'Notifica clienti diretti',
          responsible_person: 'Responsabile Commerciale',
          notification_targets: ['Clienti Diretti']
        },
        {
          time_from_detection: 120,
          action_required: 'Notifica autorità competenti',
          responsible_person: 'Responsabile Qualità',
          notification_targets: ['ASL', 'Organismo Certificazione']
        }
      ],
      template_messages: [
        {
          message_type: 'initial_alert',
          template_text: 'ALLERTA RICHIAMO: Rilevato problema qualità prodotto [PRODOTTO] lotto [LOTTO]. Procedura richiamo attivata.',
          required_fields: ['PRODOTTO', 'LOTTO', 'DATA', 'PROBLEMA']
        }
      ]
    },
    traceability_method: 'Codici lotto per filare con registri digitali OrtoMio',
    stock_reconciliation_method: 'Inventario fisico vs registri vendite',
    status: 'active'
  })

  const [activeTest, setActiveTest] = useState<Partial<GlobalGapRecallTest> | null>(null)
  const [testResults, setTestResults] = useState<GlobalGapRecallTest[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'procedure' | 'simulation' | 'history'>('procedure')

  useEffect(() => {
    if (procedureId) {
      loadProcedure()
    }
    loadTestHistory()
  }, [procedureId, gardenId])

  const loadProcedure = async () => {
    try {
      setLoading(true)
      const procedures = await globalGapComplianceService.getRecallProcedures(gardenId)
      const existingProcedure = procedures.find(p => p.id === procedureId)
      if (existingProcedure) {
        setProcedure(existingProcedure)
      }
    } catch (error) {
      console.error('Error loading procedure:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTestHistory = async () => {
    try {
      const tests = await globalGapComplianceService.getRecallTests(gardenId)
      setTestResults(tests)
    } catch (error) {
      console.error('Error loading test history:', error)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      let savedProcedure
      if (procedureId) {
        savedProcedure = await globalGapComplianceService.updateRecallProcedure(procedureId, procedure)
      } else {
        savedProcedure = await globalGapComplianceService.createRecallProcedure(procedure as any)
      }

      setProcedure(savedProcedure)
      onSave?.(savedProcedure)
    } catch (error) {
      console.error('Error saving procedure:', error)
    } finally {
      setSaving(false)
    }
  }

  const startSimulation = () => {
    const simulatedLotCode = `F${Math.floor(Math.random() * 10) + 1}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 365) + 1).padStart(3, '0')}`
    
    setActiveTest({
      garden_id: gardenId,
      procedure_id: procedureId || 'temp',
      test_date: new Date().toISOString().split('T')[0],
      test_scenario: 'Simulazione richiamo per contaminazione microbiologica',
      simulated_lot_code: simulatedLotCode,
      trace_start_time: new Date().toISOString(),
      test_conducted_by: 'Sistema OrtoMio',
      status: 'in_progress'
    })
  }

  const completeSimulation = async () => {
    if (!activeTest) return

    // Simulate tracing results
    const tracedProducts: TracedProduct[] = [
      {
        product_name: 'Pomodori San Marzano',
        lot_code: activeTest.simulated_lot_code!,
        production_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        field_location: 'Filare 3, Settore A',
        quantity: 150,
        destination: 'Mercato Locale',
        trace_time_minutes: Math.floor(Math.random() * 10) + 5,
        trace_successful: true
      },
      {
        product_name: 'Pomodori San Marzano',
        lot_code: activeTest.simulated_lot_code!,
        production_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        field_location: 'Filare 3, Settore A',
        quantity: 75,
        destination: 'Ristorante Da Mario',
        trace_time_minutes: Math.floor(Math.random() * 15) + 8,
        trace_successful: true
      }
    ]

    // Simulate communication test results
    const communicationResults: CommunicationTestResult[] = [
      {
        contact_type: 'internal',
        contact_name: 'Team Qualità',
        notification_method: 'email',
        response_time_minutes: 5,
        response_received: true,
        message_clarity_score: 9
      },
      {
        contact_type: 'external',
        contact_name: 'Mercato Locale',
        notification_method: 'phone',
        response_time_minutes: 12,
        response_received: true,
        message_clarity_score: 8
      }
    ]

    const effectivenessScore = Math.floor(
      (tracedProducts.filter(p => p.trace_successful).length / tracedProducts.length) * 50 +
      (communicationResults.filter(c => c.response_received).length / communicationResults.length) * 50
    )

    try {
      const completedTest = await globalGapComplianceService.completeRecallTest(
        activeTest.id || 'temp',
        {
          trace_end_time: new Date().toISOString(),
          traced_products: tracedProducts,
          communication_test_results: communicationResults,
          effectiveness_score: effectivenessScore,
          improvements_identified: effectivenessScore < 90 ? 'Migliorare tempi di risposta comunicazioni esterne' : undefined
        }
      )

      setTestResults(prev => [completedTest, ...prev])
      setActiveTest(null)
    } catch (error) {
      console.error('Error completing simulation:', error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getEffectivenessColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50'
    if (score >= 70) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <RotateCcw className="h-8 w-8 text-red-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Procedura Ritiro/Ritirata Prodotti (AF 9.1)
              </h1>
              <p className="text-gray-600">
                Gestione richiami con test annuale di efficacia
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={startSimulation}
              disabled={!!activeTest}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              <Play size={16} />
              Simula Richiamo
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <FileText size={16} />
              {saving ? 'Salvando...' : 'Salva Procedura'}
            </button>
          </div>
        </div>

        {/* Procedure Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Versione Procedura
            </label>
            <input
              type="text"
              value={procedure.procedure_version || ''}
              onChange={(e) => setProcedure(prev => ({ ...prev, procedure_version: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ultimo Aggiornamento
            </label>
            <input
              type="date"
              value={procedure.last_updated || ''}
              onChange={(e) => setProcedure(prev => ({ ...prev, last_updated: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prossimo Test Annuale
            </label>
            <input
              type="date"
              value={procedure.annual_test_date || ''}
              onChange={(e) => setProcedure(prev => ({ ...prev, annual_test_date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Active Simulation Alert */}
      {activeTest && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Timer className="h-6 w-6 text-orange-600 animate-pulse" />
              <div>
                <h3 className="text-lg font-semibold text-orange-900">
                  Simulazione Richiamo in Corso
                </h3>
                <p className="text-orange-800">
                  Lotto simulato: <strong>{activeTest.simulated_lot_code}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={completeSimulation}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <CheckCircle size={16} />
              Completa Test
            </button>
          </div>
          <div className="bg-white rounded p-4">
            <p className="text-sm text-gray-700">
              <strong>Scenario:</strong> {activeTest.test_scenario}
            </p>
            <p className="text-sm text-gray-700 mt-1">
              <strong>Avviato:</strong> {new Date(activeTest.trace_start_time!).toLocaleString('it-IT')}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'procedure', label: 'Procedura', icon: FileText },
              { id: 'simulation', label: 'Simulazione', icon: Play },
              { id: 'history', label: 'Storico Test', icon: Clock }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
                {tab.id === 'history' && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {testResults.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'procedure' && (
            <div className="space-y-6">
              {/* Trigger Events */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Eventi Scatenanti
                </h3>
                <div className="space-y-3">
                  {procedure.trigger_events?.map((event, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 ${getSeverityColor(event.severity_level)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{event.event_type}</h4>
                          <p className="text-sm mb-2">{event.description}</p>
                          <div className="flex items-center gap-4 text-xs">
                            <span>Gravità: {event.severity_level}</span>
                            <span>Trigger automatico: {event.automatic_trigger ? 'Sì' : 'No'}</span>
                            <span>Notifica richiesta: {event.notification_required ? 'Sì' : 'No'}</span>
                          </div>
                        </div>
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decision Makers */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Responsabili Decisioni
                </h3>
                <div className="space-y-3">
                  {procedure.decision_makers?.map((maker, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome
                          </label>
                          <input
                            type="text"
                            value={maker.name}
                            onChange={(e) => {
                              const updatedMakers = [...(procedure.decision_makers || [])]
                              updatedMakers[index] = { ...maker, name: e.target.value }
                              setProcedure(prev => ({ ...prev, decision_makers: updatedMakers }))
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Posizione
                          </label>
                          <input
                            type="text"
                            value={maker.position}
                            onChange={(e) => {
                              const updatedMakers = [...(procedure.decision_makers || [])]
                              updatedMakers[index] = { ...maker, position: e.target.value }
                              setProcedure(prev => ({ ...prev, decision_makers: updatedMakers }))
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Telefono
                          </label>
                          <input
                            type="tel"
                            value={maker.contact_info.phone || ''}
                            onChange={(e) => {
                              const updatedMakers = [...(procedure.decision_makers || [])]
                              updatedMakers[index] = { 
                                ...maker, 
                                contact_info: { ...maker.contact_info, phone: e.target.value }
                              }
                              setProcedure(prev => ({ ...prev, decision_makers: updatedMakers }))
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={maker.contact_info.email || ''}
                            onChange={(e) => {
                              const updatedMakers = [...(procedure.decision_makers || [])]
                              updatedMakers[index] = { 
                                ...maker, 
                                contact_info: { ...maker.contact_info, email: e.target.value }
                              }
                              setProcedure(prev => ({ ...prev, decision_makers: updatedMakers }))
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Escalation Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Timeline di Escalation
                </h3>
                <div className="space-y-3">
                  {procedure.communication_plan?.escalation_timeline?.map((step, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold text-blue-900">
                          {step.time_from_detection} minuti dalla rilevazione
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">
                        <strong>Azione:</strong> {step.action_required}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <strong>Responsabile:</strong> {step.responsible_person}
                        </div>
                        <div>
                          <strong>Target:</strong> {step.notification_targets.join(', ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Traceability Method */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Metodo di Tracciabilità
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <textarea
                    value={procedure.traceability_method || ''}
                    onChange={(e) => setProcedure(prev => ({ ...prev, traceability_method: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descrivi come vengono tracciati i prodotti dal campo al cliente..."
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'simulation' && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <Target className="mx-auto h-16 w-16 text-orange-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Simulazione Test Richiamo
                </h3>
                <p className="text-gray-600 mb-6">
                  Testa l'efficacia della procedura di richiamo con uno scenario simulato
                </p>
                
                {!activeTest ? (
                  <button
                    onClick={startSimulation}
                    className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors mx-auto"
                  >
                    <Play size={20} />
                    Avvia Simulazione
                  </button>
                ) : (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 max-w-2xl mx-auto">
                    <h4 className="font-semibold text-orange-900 mb-4">
                      Test in Corso
                    </h4>
                    <div className="space-y-3 text-left">
                      <div className="flex justify-between">
                        <span className="text-orange-800">Lotto simulato:</span>
                        <span className="font-mono text-orange-900">{activeTest.simulated_lot_code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-orange-800">Scenario:</span>
                        <span className="text-orange-900">{activeTest.test_scenario}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-orange-800">Avviato:</span>
                        <span className="text-orange-900">
                          {new Date(activeTest.trace_start_time!).toLocaleTimeString('it-IT')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={completeSimulation}
                      className="mt-4 flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors mx-auto"
                    >
                      <CheckCircle size={16} />
                      Completa Test
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Cosa viene testato:
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Tempo di tracciamento prodotti dal lotto al cliente
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Efficacia delle comunicazioni interne ed esterne
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Risposta dei contatti nella timeline di escalation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Completezza della documentazione di tracciabilità
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Storico Test Annuali
              </h3>

              {testResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Nessun test eseguito. Avvia la prima simulazione per iniziare.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {testResults.map((test) => (
                    <div key={test.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            Test del {new Date(test.test_date).toLocaleDateString('it-IT')}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Lotto: {test.simulated_lot_code} • Condotto da: {test.test_conducted_by}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getEffectivenessColor(test.effectiveness_score || 0)}`}>
                          {test.effectiveness_score}% efficacia
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-blue-50 rounded p-3">
                          <div className="text-sm text-blue-800 font-medium">Tempo Tracciamento</div>
                          <div className="text-lg font-bold text-blue-900">
                            {test.trace_duration_minutes} min
                          </div>
                        </div>
                        <div className="bg-green-50 rounded p-3">
                          <div className="text-sm text-green-800 font-medium">Prodotti Tracciati</div>
                          <div className="text-lg font-bold text-green-900">
                            {test.traced_products?.length || 0}
                          </div>
                        </div>
                        <div className="bg-purple-50 rounded p-3">
                          <div className="text-sm text-purple-800 font-medium">Comunicazioni</div>
                          <div className="text-lg font-bold text-purple-900">
                            {test.communication_test_results?.length || 0}
                          </div>
                        </div>
                      </div>

                      {test.improvements_identified && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                          <div className="text-sm font-medium text-yellow-800 mb-1">
                            Miglioramenti Identificati:
                          </div>
                          <div className="text-sm text-yellow-700">
                            {test.improvements_identified}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}