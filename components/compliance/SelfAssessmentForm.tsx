'use client'

import React, { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  MinusCircle, 
  Clock, 
  Save, 
  Download,
  AlertTriangle,
  FileText,
  User,
  Calendar
} from 'lucide-react'
import { globalGapComplianceService } from '../../services/globalGapComplianceService'
import type { GlobalGapSelfAssessment, ChecklistPoint } from '../../types/globalGapCompliance'

interface SelfAssessmentFormProps {
  gardenId: string
  assessmentId?: string
  onSave?: (assessment: GlobalGapSelfAssessment) => void
}

export default function SelfAssessmentForm({ gardenId, assessmentId, onSave }: SelfAssessmentFormProps) {
  const [assessment, setAssessment] = useState<Partial<GlobalGapSelfAssessment>>({
    garden_id: gardenId,
    assessment_date: new Date().toISOString().split('T')[0],
    assessor_name: '',
    assessor_role: '',
    total_control_points: 163,
    checklist_data: globalGapComplianceService.getDefaultSelfAssessmentTemplate(),
    status: 'in_progress'
  })
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('AF1')

  useEffect(() => {
    if (assessmentId) {
      loadAssessment()
    }
  }, [assessmentId])

  const loadAssessment = async () => {
    try {
      setLoading(true)
      const assessments = await globalGapComplianceService.getSelfAssessments(gardenId)
      const existingAssessment = assessments.find(a => a.id === assessmentId)
      if (existingAssessment) {
        setAssessment(existingAssessment)
      }
    } catch (error) {
      console.error('Error loading assessment:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateChecklistPoint = (sectionKey: string, pointIndex: number, updates: Partial<ChecklistPoint>) => {
    setAssessment(prev => ({
      ...prev,
      checklist_data: {
        ...prev.checklist_data,
        [sectionKey]: {
          ...prev.checklist_data![sectionKey],
          points: prev.checklist_data![sectionKey].points.map((point, index) =>
            index === pointIndex ? { ...point, ...updates } : point
          )
        }
      }
    }))
  }

  const calculateSectionStats = (sectionKey: string) => {
    const section = assessment.checklist_data?.[sectionKey]
    if (!section) return { compliant: 0, nonCompliant: 0, notApplicable: 0, pending: 0, total: 0 }

    const stats = section.points.reduce((acc, point) => {
      acc.total++
      switch (point.status) {
        case 'compliant': acc.compliant++; break
        case 'non_compliant': acc.nonCompliant++; break
        case 'not_applicable': acc.notApplicable++; break
        case 'pending': acc.pending++; break
      }
      return acc
    }, { compliant: 0, nonCompliant: 0, notApplicable: 0, pending: 0, total: 0 })

    return stats
  }

  const calculateOverallStats = () => {
    if (!assessment.checklist_data) return { compliant: 0, nonCompliant: 0, notApplicable: 0, pending: 0, total: 0 }

    return Object.keys(assessment.checklist_data).reduce((acc, sectionKey) => {
      const sectionStats = calculateSectionStats(sectionKey)
      acc.compliant += sectionStats.compliant
      acc.nonCompliant += sectionStats.nonCompliant
      acc.notApplicable += sectionStats.notApplicable
      acc.pending += sectionStats.pending
      acc.total += sectionStats.total
      return acc
    }, { compliant: 0, nonCompliant: 0, notApplicable: 0, pending: 0, total: 0 })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const overallStats = calculateOverallStats()
      const assessmentData = {
        ...assessment,
        compliant_points: overallStats.compliant,
        non_compliant_points: overallStats.nonCompliant,
        not_applicable_points: overallStats.notApplicable,
        status: (overallStats.pending === 0 ? 'completed' : 'in_progress') as 'completed' | 'in_progress',
        next_assessment_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }

      let savedAssessment
      if (assessmentId) {
        savedAssessment = await globalGapComplianceService.updateSelfAssessment(assessmentId, assessmentData)
      } else {
        savedAssessment = await globalGapComplianceService.createSelfAssessment(assessmentData as any)
      }

      setAssessment(savedAssessment)
      onSave?.(savedAssessment)
    } catch (error) {
      console.error('Error saving assessment:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleExportCSV = () => {
    const overallStats = calculateOverallStats()
    const csvData = [
      ['GlobalG.A.P. IFA V5.2 Self-Assessment'],
      ['Assessment Date', assessment.assessment_date || ''],
      ['Assessor', assessment.assessor_name || ''],
      ['Role', assessment.assessor_role || ''],
      [''],
      ['Section', 'Control Point', 'Description', 'Status', 'Comment', 'Evidence'],
      ...Object.entries(assessment.checklist_data || {}).flatMap(([sectionKey, section]) =>
        section.points.map(point => [
          section.name,
          point.id,
          point.description,
          point.status,
          point.comment || '',
          point.evidence || ''
        ])
      ),
      [''],
      ['Summary'],
      ['Total Control Points', overallStats.total.toString()],
      ['Compliant', overallStats.compliant.toString()],
      ['Non-Compliant', overallStats.nonCompliant.toString()],
      ['Not Applicable', overallStats.notApplicable.toString()],
      ['Pending', overallStats.pending.toString()],
      ['Compliance %', overallStats.total > 0 ? ((overallStats.compliant / (overallStats.total - overallStats.notApplicable)) * 100).toFixed(2) + '%' : '0%']
    ]

    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `globalgap-self-assessment-${assessment.assessment_date}.csv`
    link.click()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'non_compliant': return <XCircle className="h-5 w-5 text-red-600" />
      case 'not_applicable': return <MinusCircle className="h-5 w-5 text-gray-600" />
      case 'pending': return <Clock className="h-5 w-5 text-yellow-600" />
      default: return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'border-green-200 bg-green-50'
      case 'non_compliant': return 'border-red-200 bg-red-50'
      case 'not_applicable': return 'border-gray-200 bg-gray-50'
      case 'pending': return 'border-yellow-200 bg-yellow-50'
      default: return 'border-gray-200 bg-white'
    }
  }

  const overallStats = calculateOverallStats()
  const compliancePercentage = overallStats.total > 0 
    ? ((overallStats.compliant / (overallStats.total - overallStats.notApplicable)) * 100)
    : 0

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
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Autocontrollo GlobalG.A.P. (AF 2.2)
              </h1>
              <p className="text-gray-600">
                Checklist interna annuale - 163 punti di controllo
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download size={16} />
              Export CSV
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Salvando...' : 'Salva'}
            </button>
          </div>
        </div>

        {/* Assessment Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Valutazione
            </label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={assessment.assessment_date || ''}
                onChange={(e) => setAssessment(prev => ({ ...prev, assessment_date: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Valutatore
            </label>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={assessment.assessor_name || ''}
                onChange={(e) => setAssessment(prev => ({ ...prev, assessor_name: e.target.value }))}
                placeholder="Nome e cognome"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ruolo
            </label>
            <input
              type="text"
              value={assessment.assessor_role || ''}
              onChange={(e) => setAssessment(prev => ({ ...prev, assessor_role: e.target.value }))}
              placeholder="es. Responsabile Qualità"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Progresso Complessivo</h3>
            <span className="text-2xl font-bold text-green-600">
              {compliancePercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${compliancePercentage}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-green-600 font-semibold">{overallStats.compliant}</div>
              <div className="text-gray-600">Conformi</div>
            </div>
            <div className="text-center">
              <div className="text-red-600 font-semibold">{overallStats.nonCompliant}</div>
              <div className="text-gray-600">Non Conformi</div>
            </div>
            <div className="text-center">
              <div className="text-gray-600 font-semibold">{overallStats.notApplicable}</div>
              <div className="text-gray-600">N/A</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-600 font-semibold">{overallStats.pending}</div>
              <div className="text-gray-600">In Sospeso</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {Object.entries(assessment.checklist_data || {}).map(([sectionKey, section]) => {
              const stats = calculateSectionStats(sectionKey)
              const sectionPercentage = stats.total > 0 
                ? ((stats.compliant / (stats.total - stats.notApplicable)) * 100)
                : 0

              return (
                <button
                  key={sectionKey}
                  onClick={() => setActiveSection(sectionKey)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeSection === sectionKey
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{sectionKey}</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {sectionPercentage.toFixed(0)}%
                  </span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Section Content */}
        <div className="p-6">
          {assessment.checklist_data && assessment.checklist_data[activeSection] && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {activeSection} - {assessment.checklist_data[activeSection].name}
              </h2>
              
              <div className="space-y-4">
                {assessment.checklist_data[activeSection].points.map((point, index) => (
                  <div
                    key={point.id}
                    className={`border rounded-lg p-4 ${getStatusColor(point.status)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(point.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{point.id}</h3>
                          <select
                            value={point.status}
                            onChange={(e) => updateChecklistPoint(activeSection, index, { 
                              status: e.target.value as any 
                            })}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="pending">In Sospeso</option>
                            <option value="compliant">Conforme</option>
                            <option value="non_compliant">Non Conforme</option>
                            <option value="not_applicable">Non Applicabile</option>
                          </select>
                        </div>
                        <p className="text-gray-700 mb-3">{point.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Commenti/Note
                            </label>
                            <textarea
                              value={point.comment || ''}
                              onChange={(e) => updateChecklistPoint(activeSection, index, { 
                                comment: e.target.value 
                              })}
                              placeholder="Aggiungi commenti, evidenze osservate o note..."
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Evidenze/Documentazione
                            </label>
                            <input
                              type="text"
                              value={point.evidence || ''}
                              onChange={(e) => updateChecklistPoint(activeSection, index, { 
                                evidence: e.target.value 
                              })}
                              placeholder="Riferimenti a documenti, foto, registri..."
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        {point.status === 'non_compliant' && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                            <label className="block text-xs font-medium text-red-700 mb-1">
                              Azione Correttiva Richiesta
                            </label>
                            <textarea
                              value={point.corrective_action || ''}
                              onChange={(e) => updateChecklistPoint(activeSection, index, { 
                                corrective_action: e.target.value 
                              })}
                              placeholder="Descrivi l'azione correttiva necessaria per risolvere la non conformità..."
                              rows={2}
                              className="w-full px-3 py-2 border border-red-300 rounded text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Non-Compliant Summary */}
      {overallStats.nonCompliant > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">
              Punti Non Conformi ({overallStats.nonCompliant})
            </h3>
          </div>
          <p className="text-red-800 text-sm mb-4">
            I seguenti punti di controllo richiedono azioni correttive prima della certificazione:
          </p>
          <div className="space-y-2">
            {Object.entries(assessment.checklist_data || {}).map(([sectionKey, section]) =>
              section.points
                .filter(point => point.status === 'non_compliant')
                .map(point => (
                  <div key={point.id} className="flex items-center gap-2 text-red-800 text-sm">
                    <XCircle className="h-4 w-4" />
                    <span className="font-medium">{point.id}</span>
                    <span>-</span>
                    <span>{point.description}</span>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}