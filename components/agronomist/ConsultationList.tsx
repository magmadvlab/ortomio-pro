import React from 'react'
import { AgronomistConsultation, Agronomist } from '@/types/agronomist'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Calendar, User, MessageSquare, FileText, Edit2, AlertCircle } from 'lucide-react'

interface ConsultationListProps {
  consultations: AgronomistConsultation[]
  agronomists: Agronomist[]
  onEdit?: (consultation: AgronomistConsultation) => void
  onSelectAgronomist?: (agronomist: Agronomist) => void
}

const ConsultationList: React.FC<ConsultationListProps> = ({
  consultations,
  agronomists,
  onEdit,
  onSelectAgronomist
}) => {
  const getAgronomistName = (agronomistId: string): string => {
    const agronomist = agronomists.find(a => a.id === agronomistId)
    return agronomist?.name || 'Agronomo sconosciuto'
  }

  const getConsultationTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'InPerson': 'In Persona',
      'Phone': 'Telefono',
      'Email': 'Email',
      'Video': 'Video'
    }
    return labels[type] || type
  }

  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      'High': 'bg-red-100 text-red-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-green-100 text-green-800'
    }
    return colors[priority] || 'bg-gray-100 text-gray-800'
  }

  if (consultations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-32 text-center">
        <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-600 mb-2">Nessuna consultazione registrata</p>
        <p className="text-sm text-gray-500">
          Crea la tua prima consultazione per iniziare
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {consultations.map((consultation) => {
        const agronomist = agronomists.find(a => a.id === consultation.agronomistId)
        
        return (
          <div
            key={consultation.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <User className="text-green-600" size={20} />
                  <button
                    onClick={() => agronomist && onSelectAgronomist?.(agronomist)}
                    className="font-semibold text-gray-800 hover:text-green-600 transition-colors"
                  >
                    {getAgronomistName(consultation.agronomistId)}
                  </button>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {getConsultationTypeLabel(consultation.consultationType)}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center gap-3">
                    <Calendar size={14} />
                    <span>
                      {format(new Date(consultation.date), 'dd MMMM yyyy', { locale: it })}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {consultation.topic}
                </h3>
              </div>

              {onEdit && (
                <button
                  onClick={() => onEdit(consultation)}
                  className="p-3 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Modifica consultazione"
                >
                  <Edit2 size={18} />
                </button>
              )}
            </div>

            {consultation.advice && consultation.advice.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-3">
                  <AlertCircle size={14} />
                  Consigli Ricevuti
                </h4>
                <div className="space-y-2">
                  {consultation.advice.map((advice, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 rounded-lg p-3 border-l-4 border-green-500"
                    >
                      {advice.plantName && (
                        <div className="text-sm font-medium text-gray-800 mb-1">
                          Pianta: {advice.plantName}
                        </div>
                      )}
                      {advice.issue && (
                        <div className="text-sm text-gray-600 mb-1">
                          Problema: {advice.issue}
                        </div>
                      )}
                      <div className="text-sm text-gray-800 mb-2">
                        {advice.recommendation}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(advice.priority)}`}>
                          {advice.priority}
                        </span>
                        {advice.followUpDate && (
                          <span className="text-xs text-gray-500">
                            Follow-up: {format(new Date(advice.followUpDate), 'dd/MM/yyyy', { locale: it })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {consultation.notes && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-3">
                  <FileText size={14} />
                  Note
                </h4>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  {consultation.notes}
                </p>
              </div>
            )}

            {consultation.attachments && consultation.attachments.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Allegati ({consultation.attachments.length})
                </h4>
                <div className="flex flex-wrap gap-3">
                  {consultation.attachments.map((attachment, idx) => (
                    <a
                      key={idx}
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Allegato {idx + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default ConsultationList


