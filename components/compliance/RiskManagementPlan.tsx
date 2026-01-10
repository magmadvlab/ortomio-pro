'use client'

import React, { useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Download,
  Calendar,
  User,
  FileText,
  TrendingUp,
  Clock
} from 'lucide-react'
import { globalGapComplianceService } from '../../services/globalGapComplianceService'
import type { 
  GlobalGapRiskManagementPlan, 
  RiskItem, 
  ControlProcedure 
} from '../../types/globalGapCompliance'

interface RiskManagementPlanProps {
  gardenId: string
  planId?: string
  onSave?: (plan: GlobalGapRiskManagementPlan) => void
}

export default function RiskManagementPlan({ gardenId, planId, onSave }: RiskManagementPlanProps) {
  const [plan, setPlan] = useState<Partial<GlobalGapRiskManagementPlan>>({
    garden_id: gardenId,
    plan_name: 'Piano Gestione Rischi Sito',
    risk_assessment_date: new Date().toISOString().split('T')[0],
    plan_implementation_date: new Date().toISOString().split('T')[0],
    responsible_person: '',
    next_review_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
    ...globalGapComplianceService.getDefaultRiskManagementTemplate()
  })

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'risks' | 'procedures' | 'monitoring'>('risks')
  const [editingRisk, setEditingRisk] = useState<RiskItem | null>(null)
  const [editingProcedure, setEditingProcedure] = useState<ControlProcedure | null>(null)

  useEffect(() => {
    if (planId) {
      loadPlan()
    }
  }, [planId])

  const loadPlan = async () => {
    try {
      setLoading(true)
      const plans = await globalGapComplianceService.getRiskManagementPlans(gardenId)
      const existingPlan = plans.find(p => p.id === planId)
      if (existingPlan) {
        setPlan(existingPlan)
      }
    } catch (error) {
      console.error('Error loading plan:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      let savedPlan
      if (planId) {
        savedPlan = await globalGapComplianceService.updateRiskManagementPlan(planId, plan)
      } else {
        savedPlan = await globalGapComplianceService.createRiskManagementPlan(plan as any)
      }

      setPlan(savedPlan)
      onSave?.(savedPlan)
    } catch (error) {
      console.error('Error saving plan:', error)
    } finally {
      setSaving(false)
    }
  }

  const addRisk = () => {
    const newRisk: RiskItem = {
      id: `risk-${Date.now()}`,
      category: 'environmental',
      description: '',
      severity: 'medium',
      probability: 'possible',
      risk_score: 6,
      source: 'Site assessment'
    }
    setEditingRisk(newRisk)
  }

  const saveRisk = (risk: RiskItem) => {
    setPlan(prev => ({
      ...prev,
      identified_risks: prev.identified_risks?.some(r => r.id === risk.id)
        ? prev.identified_risks.map(r => r.id === risk.id ? risk : r)
        : [...(prev.identified_risks || []), risk]
    }))
    setEditingRisk(null)
  }

  const deleteRisk = (riskId: string) => {
    setPlan(prev => ({
      ...prev,
      identified_risks: prev.identified_risks?.filter(r => r.id !== riskId) || [],
      control_procedures: prev.control_procedures?.filter(p => p.risk_id !== riskId) || []
    }))
  }

  const addProcedure = (riskId: string) => {
    const newProcedure: ControlProcedure = {
      risk_id: riskId,
      procedure_description: '',
      responsible_person: '',
      implementation_date: new Date().toISOString().split('T')[0],
      monitoring_frequency: 'monthly',
      effectiveness_indicators: [],
      documentation_required: []
    }
    setEditingProcedure(newProcedure)
  }

  const saveProcedure = (procedure: ControlProcedure) => {
    setPlan(prev => ({
      ...prev,
      control_procedures: prev.control_procedures?.some(p => p.risk_id === procedure.risk_id)
        ? prev.control_procedures.map(p => 
            p.risk_id === procedure.risk_id ? procedure : p
          )
        : [...(prev.control_procedures || []), procedure]
    }))
    setEditingProcedure(null)
  }

  const getRiskColor = (severity: string, probability: string) => {
    const severityScore = { low: 1, medium: 2, high: 3, critical: 4 }[severity] || 2
    const probabilityScore = { unlikely: 1, possible: 2, likely: 3, certain: 4 }[probability] || 2
    const riskScore = severityScore * probabilityScore

    if (riskScore >= 12) return 'border-red-500 bg-red-50 text-red-900'
    if (riskScore >= 8) return 'border-orange-500 bg-orange-50 text-orange-900'
    if (riskScore >= 4) return 'border-yellow-500 bg-yellow-50 text-yellow-900'
    return 'border-green-500 bg-green-50 text-green-900'
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 12) return 'text-red-600 bg-red-100'
    if (score >= 8) return 'text-orange-600 bg-orange-100'
    if (score >= 4) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const exportPDF = () => {
    // This would generate a PDF report
    const reportData = {
      plan_name: plan.plan_name,
      assessment_date: plan.risk_assessment_date,
      responsible_person: plan.responsible_person,
      risks: plan.identified_risks,
      procedures: plan.control_procedures,
      monitoring: plan.monitoring_schedule
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `risk-management-plan-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
            <Shield className="h-8 w-8 text-orange-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Piano Gestione Rischi Sito (AF 1.2.2)
              </h1>
              <p className="text-gray-600">
                Strategie per minimizzare i rischi identificati nella valutazione del sito
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download size={16} />
              Export PDF
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Salvando...' : 'Salva Piano'}
            </button>
          </div>
        </div>

        {/* Plan Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Piano
            </label>
            <input
              type="text"
              value={plan.plan_name || ''}
              onChange={(e) => setPlan(prev => ({ ...prev, plan_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Valutazione Rischi
            </label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={plan.risk_assessment_date || ''}
                onChange={(e) => setPlan(prev => ({ ...prev, risk_assessment_date: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Responsabile Piano
            </label>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={plan.responsible_person || ''}
                onChange={(e) => setPlan(prev => ({ ...prev, responsible_person: e.target.value }))}
                placeholder="Nome responsabile"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prossima Revisione
            </label>
            <input
              type="date"
              value={plan.next_review_date || ''}
              onChange={(e) => setPlan(prev => ({ ...prev, next_review_date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'risks', label: 'Rischi Identificati', icon: AlertTriangle },
              { id: 'procedures', label: 'Procedure di Controllo', icon: Shield },
              { id: 'monitoring', label: 'Monitoraggio', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {tab.id === 'risks' && (plan.identified_risks?.length || 0)}
                  {tab.id === 'procedures' && (plan.control_procedures?.length || 0)}
                  {tab.id === 'monitoring' && (plan.monitoring_schedule?.length || 0)}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'risks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Rischi Identificati
                </h3>
                <button
                  onClick={addRisk}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Plus size={16} />
                  Aggiungi Rischio
                </button>
              </div>

              {plan.identified_risks?.map((risk) => (
                <div
                  key={risk.id}
                  className={`border rounded-lg p-4 ${getRiskColor(risk.severity, risk.probability)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-medium uppercase tracking-wide">
                          {risk.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskScoreColor(risk.risk_score)}`}>
                          Score: {risk.risk_score}
                        </span>
                        <span className="text-xs text-gray-600">
                          {risk.severity} × {risk.probability}
                        </span>
                      </div>
                      <h4 className="font-semibold mb-2">{risk.description}</h4>
                      <p className="text-sm opacity-75">Fonte: {risk.source}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingRisk(risk)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white hover:bg-opacity-50 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteRisk(risk.id)}
                        className="p-2 text-red-600 hover:text-red-900 hover:bg-white hover:bg-opacity-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {(!plan.identified_risks || plan.identified_risks.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Nessun rischio identificato. Aggiungi il primo rischio per iniziare.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'procedures' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Procedure di Controllo
              </h3>

              {plan.identified_risks?.map((risk) => {
                const procedure = plan.control_procedures?.find(p => p.risk_id === risk.id)
                
                return (
                  <div key={risk.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          Rischio: {risk.description}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskScoreColor(risk.risk_score)}`}>
                          Score: {risk.risk_score}
                        </span>
                      </div>
                      {!procedure && (
                        <button
                          onClick={() => addProcedure(risk.id)}
                          className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                        >
                          <Plus size={14} />
                          Aggiungi Procedura
                        </button>
                      )}
                    </div>

                    {procedure ? (
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-green-800 mb-2">
                              <strong>Procedura:</strong> {procedure.procedure_description}
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-xs text-green-700">
                              <div>
                                <strong>Responsabile:</strong> {procedure.responsible_person}
                              </div>
                              <div>
                                <strong>Frequenza:</strong> {procedure.monitoring_frequency}
                              </div>
                              <div>
                                <strong>Implementazione:</strong> {procedure.implementation_date}
                              </div>
                              <div>
                                <strong>Indicatori:</strong> {procedure.effectiveness_indicators.join(', ')}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setEditingProcedure(procedure)}
                            className="p-1 text-green-600 hover:text-green-900 hover:bg-green-100 rounded"
                          >
                            <Edit size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                        <p className="text-sm text-yellow-800">
                          ⚠️ Nessuna procedura di controllo definita per questo rischio
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Programma di Monitoraggio
              </h3>

              {plan.monitoring_schedule?.map((schedule, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">
                      {schedule.frequency} - {schedule.responsible_person}
                    </h4>
                    <span className="text-sm text-gray-600">
                      Prossimo controllo: {schedule.next_check_date}
                    </span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <h5 className="font-medium text-blue-900 mb-2">Checklist:</h5>
                    <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                      {schedule.checklist_items.map((item, itemIndex) => (
                        <li key={itemIndex}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}

              {(!plan.monitoring_schedule || plan.monitoring_schedule.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Nessun programma di monitoraggio definito.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Risk Edit Modal */}
      {editingRisk && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {plan.identified_risks?.some(r => r.id === editingRisk.id) ? 'Modifica' : 'Aggiungi'} Rischio
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={editingRisk.category}
                    onChange={(e) => setEditingRisk(prev => prev ? { ...prev, category: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="environmental">Ambientale</option>
                    <option value="contamination">Contaminazione</option>
                    <option value="physical">Fisico</option>
                    <option value="biological">Biologico</option>
                    <option value="chemical">Chimico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fonte
                  </label>
                  <input
                    type="text"
                    value={editingRisk.source}
                    onChange={(e) => setEditingRisk(prev => prev ? { ...prev, source: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrizione Rischio
                </label>
                <textarea
                  value={editingRisk.description}
                  onChange={(e) => setEditingRisk(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gravità
                  </label>
                  <select
                    value={editingRisk.severity}
                    onChange={(e) => {
                      const severity = e.target.value as 'low' | 'medium' | 'high' | 'critical'
                      const severityScore = { low: 1, medium: 2, high: 3, critical: 4 }[severity] || 2
                      const probabilityScore = { unlikely: 1, possible: 2, likely: 3, certain: 4 }[editingRisk.probability] || 2
                      setEditingRisk(prev => prev ? { 
                        ...prev, 
                        severity, 
                        risk_score: severityScore * probabilityScore 
                      } : null)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="low">Bassa</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="critical">Critica</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Probabilità
                  </label>
                  <select
                    value={editingRisk.probability}
                    onChange={(e) => {
                      const probability = e.target.value as 'unlikely' | 'possible' | 'likely' | 'certain'
                      const severityScore = { low: 1, medium: 2, high: 3, critical: 4 }[editingRisk.severity] || 2
                      const probabilityScore = { unlikely: 1, possible: 2, likely: 3, certain: 4 }[probability] || 2
                      setEditingRisk(prev => prev ? { 
                        ...prev, 
                        probability, 
                        risk_score: severityScore * probabilityScore 
                      } : null)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="unlikely">Improbabile</option>
                    <option value="possible">Possibile</option>
                    <option value="likely">Probabile</option>
                    <option value="certain">Certa</option>
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 rounded p-3">
                <p className="text-sm text-gray-700">
                  <strong>Score Rischio:</strong> {editingRisk.risk_score} 
                  <span className="ml-2 text-xs">
                    ({editingRisk.severity} × {editingRisk.probability})
                  </span>
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingRisk(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={() => editingRisk && saveRisk(editingRisk)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Salva Rischio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Procedure Edit Modal */}
      {editingProcedure && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Procedura di Controllo
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrizione Procedura
                </label>
                <textarea
                  value={editingProcedure.procedure_description}
                  onChange={(e) => setEditingProcedure(prev => prev ? { ...prev, procedure_description: e.target.value } : null)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Responsabile
                  </label>
                  <input
                    type="text"
                    value={editingProcedure.responsible_person}
                    onChange={(e) => setEditingProcedure(prev => prev ? { ...prev, responsible_person: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Implementazione
                  </label>
                  <input
                    type="date"
                    value={editingProcedure.implementation_date}
                    onChange={(e) => setEditingProcedure(prev => prev ? { ...prev, implementation_date: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequenza Monitoraggio
                </label>
                <select
                  value={editingProcedure.monitoring_frequency}
                  onChange={(e) => setEditingProcedure(prev => prev ? { ...prev, monitoring_frequency: e.target.value as any } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="daily">Giornaliera</option>
                  <option value="weekly">Settimanale</option>
                  <option value="monthly">Mensile</option>
                  <option value="quarterly">Trimestrale</option>
                  <option value="annually">Annuale</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Indicatori di Efficacia (uno per riga)
                </label>
                <textarea
                  value={editingProcedure.effectiveness_indicators.join('\n')}
                  onChange={(e) => setEditingProcedure(prev => prev ? { 
                    ...prev, 
                    effectiveness_indicators: e.target.value.split('\n').filter(line => line.trim()) 
                  } : null)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Documentazione Richiesta (una per riga)
                </label>
                <textarea
                  value={editingProcedure.documentation_required.join('\n')}
                  onChange={(e) => setEditingProcedure(prev => prev ? { 
                    ...prev, 
                    documentation_required: e.target.value.split('\n').filter(line => line.trim()) 
                  } : null)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingProcedure(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={() => editingProcedure && saveProcedure(editingProcedure)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Salva Procedura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}