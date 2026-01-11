'use client'

import React, { useState, useEffect } from 'react'
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Users, 
  RotateCcw, 
  Download,
  Plus,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  Target
} from 'lucide-react'
import { globalGapComplianceService } from '../../services/globalGapComplianceService'
import { globalGapCbFvService } from '../../services/globalGapCbFvService'
import type { ComplianceOverview } from '../../types/globalGapCompliance'
import type { CompleteComplianceOverview } from '../../types/globalGapCbFv'

interface GlobalGapDashboardProps {
  gardenId: string
}

export default function GlobalGapDashboard({ gardenId }: GlobalGapDashboardProps) {
  const [overview, setOverview] = useState<ComplianceOverview | null>(null)
  const [completeOverview, setCompleteOverview] = useState<CompleteComplianceOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'actions'>('overview')

  useEffect(() => {
    loadComplianceOverview()
  }, [gardenId])

  const loadComplianceOverview = async () => {
    try {
      setLoading(true)
      const [afOverview, completeData] = await Promise.all([
        globalGapComplianceService.getComplianceOverview(gardenId),
        globalGapCbFvService.getCompleteComplianceOverview(gardenId)
      ])
      setOverview(afOverview)
      setCompleteOverview(completeData)
    } catch (error) {
      console.error('Error loading compliance overview:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportAuditPackage = async () => {
    try {
      const auditPackage = await globalGapCbFvService.exportComplianceReport(gardenId, 'csv')
      
      // Check if data is an array before processing
      if (!Array.isArray(auditPackage.data)) {
        console.error('Audit package data is not an array:', auditPackage.data)
        return
      }
      
      // Create downloadable file
      const csvContent = auditPackage.data.map((row: any) => 
        row.map((cell: any) => `"${cell}"`).join(',')
      ).join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = auditPackage.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting audit package:', error)
    }
  }

  const getReadinessColor = (readiness: string) => {
    switch (readiness) {
      case 'ready': return 'text-green-600 bg-green-50 border-green-200'
      case 'partially_ready': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'not_ready': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getReadinessText = (readiness: string) => {
    switch (readiness) {
      case 'ready': return 'Pronto per Certificazione'
      case 'partially_ready': return 'Parzialmente Pronto'
      case 'not_ready': return 'Richiede Lavoro'
      default: return 'Non Valutato'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!overview) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-full max-w-sm mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Dati Compliance Non Disponibili
          </h3>
          <p className="text-gray-600 mb-4">
            Non è stato possibile caricare i dati di compliance GlobalG.A.P.
          </p>
          <button
            onClick={loadComplianceOverview}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Riprova
          </button>
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
            <Shield className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                GlobalG.A.P. IFA V5.2 Compliance
              </h1>
              <p className="text-gray-600">
                Monitoraggio conformità ai requisiti maggiori
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportAuditPackage}
              className="flex items-center gap-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={16} />
              Export Audit
            </button>
            <button
              onClick={loadComplianceOverview}
              className="flex items-center gap-3 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RotateCcw size={16} />
              Aggiorna
            </button>
          </div>
        </div>

        {/* Compliance Score */}
        <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Compliance Totale</p>
                <p className="text-3xl font-bold text-green-900">
                  {completeOverview?.overall_compliance || overview?.overall_percentage || 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Moduli Completi</p>
                <p className="text-3xl font-bold text-blue-900">
                  {completeOverview ? 
                    `${[completeOverview.af_module, completeOverview.cb_module, completeOverview.fv_module]
                      .filter(m => m.compliance_percentage >= 95).length}/3` :
                    `${overview?.completed_requirements || 0}/${overview?.total_requirements || 5}`
                  }
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-yellow-full max-w-sm rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-full max-w-sm">Gap Critici</p>
                <p className="text-3xl font-bold text-yellow-full max-w-sm">
                  {completeOverview ? 
                    (completeOverview.af_module.critical_gaps.length + 
                     completeOverview.cb_module.critical_gaps.length + 
                     completeOverview.fv_module.critical_gaps.length) :
                    (overview?.critical_gaps.length || 0)
                  }
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-full max-w-sm" />
            </div>
          </div>

          <div className={`rounded-lg p-4 border ${getReadinessColor(
            completeOverview?.certification_readiness || overview?.certification_readiness || 'not_ready'
          )}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Stato Certificazione</p>
                <p className="text-lg font-bold">
                  {getReadinessText(completeOverview?.certification_readiness || overview?.certification_readiness || 'not_ready')}
                </p>
              </div>
              <Award className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Panoramica', icon: TrendingUp },
              { id: 'requirements', label: 'Requisiti', icon: FileText },
              { id: 'actions', label: 'Azioni', icon: Target }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                  <span>Progresso Compliance</span>
                  <span>{overview.overall_percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${overview.overall_percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Critical Gaps */}
              {overview.critical_gaps.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center gap-3">
                    <AlertTriangle size={20} />
                    Gap Critici da Risolvere
                  </h3>
                  <div className="space-y-2">
                    {overview.critical_gaps.map((gap, index) => (
                      <div key={index} className="flex items-center gap-3 text-red-800">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm">{gap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certification Readiness */}
              <div className={`border rounded-lg p-4 ${getReadinessColor(overview.certification_readiness)}`}>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-3">
                  <Award size={20} />
                  Stato Certificazione
                </h3>
                <p className="text-sm mb-3">
                  {overview.certification_readiness === 'ready' && 
                    'Il tuo orto è pronto per la certificazione GlobalG.A.P.! Tutti i requisiti maggiori sono soddisfatti.'}
                  {overview.certification_readiness === 'partially_ready' && 
                    'Il tuo orto è quasi pronto per la certificazione. Completa i gap rimanenti per essere completamente conforme.'}
                  {overview.certification_readiness === 'not_ready' && 
                    'Il tuo orto richiede ancora lavoro per raggiungere la conformità GlobalG.A.P. Segui le azioni consigliate.'}
                </p>
                <div className="text-xs opacity-75">
                  Ultima valutazione: {new Date().toLocaleDateString('it-IT')}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requirements' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Requisiti Maggiori GlobalG.A.P. IFA V5.2
              </h3>
              
              {[
                {
                  id: 'AF1.2.2',
                  title: 'Piano Gestione Rischi Sito',
                  description: 'Piano documentato per minimizzare i rischi identificati nella valutazione del sito',
                  status: overview.critical_gaps.includes('AF 1.2.2 - Risk Management Plan') ? 'missing' : 'completed',
                  action: 'Crea Piano Gestione Rischi'
                },
                {
                  id: 'AF2.2',
                  title: 'Autocontrollo Annuale',
                  description: 'Checklist autocontrollo interno annuale con tutti i 163 punti di controllo',
                  status: overview.critical_gaps.includes('AF 2.2 - Annual Self-Assessment') ? 'missing' : 'completed',
                  action: 'Completa Autocontrollo'
                },
                {
                  id: 'AF4.5.1',
                  title: 'Responsabile Salute e Sicurezza',
                  description: 'Persona della direzione identificata come responsabile H&S dei lavoratori',
                  status: overview.critical_gaps.includes('AF 4.5.1 - Health & Safety Manager') ? 'missing' : 'completed',
                  action: 'Nomina Responsabile H&S'
                },
                {
                  id: 'AF9.1',
                  title: 'Procedura Ritiro Prodotti',
                  description: 'Procedura documentata per gestire ritiri/ritirate con test annuale di efficacia',
                  status: overview.critical_gaps.includes('AF 9.1 - Recall Procedures') ? 'missing' : 'completed',
                  action: 'Crea Procedura Ritiro'
                },
                {
                  id: 'AF11.1',
                  title: 'Codice GGN su Documenti',
                  description: 'Codice GGN e riferimento status certificato su tutti i documenti di transazione',
                  status: overview.critical_gaps.includes('AF 11.1 - GGN Code') ? 'missing' : 'completed',
                  action: 'Genera Codice GGN'
                }
              ].map((requirement) => (
                <div
                  key={requirement.id}
                  className={`border rounded-lg p-4 ${
                    requirement.status === 'completed' 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {requirement.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        )}
                        <h4 className="font-semibold text-gray-900">
                          {requirement.id} - {requirement.title}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">
                        {requirement.description}
                      </p>
                    </div>
                    {requirement.status === 'missing' && (
                      <button className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                        {requirement.action}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Azioni Consigliate
              </h3>
              
              {overview.next_actions.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Complimenti! Nessuna azione richiesta
                  </h4>
                  <p className="text-gray-600">
                    Tutti i requisiti maggiori GlobalG.A.P. sono soddisfatti.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {overview.next_actions.map((action, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 ${getPriorityColor(action.priority)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Clock className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wide">
                              {action.priority} Priority
                            </span>
                            {action.due_date && (
                              <span className="text-xs">
                                • Scadenza: {new Date(action.due_date).toLocaleDateString('it-IT')}
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold mb-1">
                            {action.requirement_id}
                          </h4>
                          <p className="text-sm mb-2">
                            {action.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs">
                            <span>⏱️ Tempo stimato: {action.estimated_completion_time}</span>
                            {action.responsible_person && (
                              <span>👤 Responsabile: {action.responsible_person}</span>
                            )}
                          </div>
                        </div>
                        <button className="ml-4 px-3 py-1 bg-white border border-current rounded text-sm hover:bg-opacity-10 transition-colors">
                          Inizia
                        </button>
                      </div>
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