import React, { useState } from 'react'
import { Agronomist } from '@/types/agronomist'
import { Mail, Phone, MessageSquare, Calendar, User, MapPin } from 'lucide-react'
import ConsultationForm from './ConsultationForm'

interface ContactAgronomistProps {
  agronomist: Agronomist
  onRequestConsultation?: (agronomist: Agronomist) => void
}

const ContactAgronomist: React.FC<ContactAgronomistProps> = ({
  agronomist,
  onRequestConsultation
}) => {
  const [showConsultationForm, setShowConsultationForm] = useState(false)

  const handleEmail = () => {
    if (agronomist.email) {
      window.location.href = `mailto:${agronomist.email}`
    } else {
      alert('Email non disponibile per questo agronomo')
    }
  }

  const handlePhone = () => {
    if (agronomist.phone) {
      window.location.href = `tel:${agronomist.phone}`
    } else {
      alert('Telefono non disponibile per questo agronomo')
    }
  }

  const handleRequestConsultation = () => {
    if (onRequestConsultation) {
      onRequestConsultation(agronomist)
    } else {
      setShowConsultationForm(true)
    }
  }

  const getContactMethodLabel = (method: string): string => {
    const labels: Record<string, string> = {
      'Email': 'Email',
      'Phone': 'Telefono',
      'InPerson': 'Di Persona'
    }
    return labels[method] || method
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="bg-green-100 rounded-full p-3">
          <User className="text-green-600" size={32} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            {agronomist.name}
          </h3>
          
          <div className="space-y-2 text-sm text-gray-600">
            {agronomist.email && (
              <div className="flex items-center gap-3">
                <Mail size={16} />
                <span>{agronomist.email}</span>
              </div>
            )}
            {agronomist.phone && (
              <div className="flex items-center gap-3">
                <Phone size={16} />
                <span>{agronomist.phone}</span>
              </div>
            )}
            {agronomist.specialization && agronomist.specialization.length > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
                <MapPin size={16} />
                <span className="text-xs">
                  Specializzazione: {agronomist.specialization.join(', ')}
                </span>
              </div>
            )}
            {agronomist.preferredContactMethod && (
              <div className="text-xs text-gray-500">
                Metodo preferito: {getContactMethodLabel(agronomist.preferredContactMethod)}
              </div>
            )}
          </div>
        </div>
      </div>

      {agronomist.notes && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Note</h4>
          <p className="text-sm text-gray-600">{agronomist.notes}</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Azioni Rapide</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-3">
          {agronomist.email && (
            <button
              onClick={handleEmail}
              className="flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mail size={18} />
              Invia Email
            </button>
          )}

          {agronomist.phone && (
            <button
              onClick={handlePhone}
              className="flex items-center justify-center gap-3 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Phone size={18} />
              Chiama
            </button>
          )}

          <button
            onClick={handleRequestConsultation}
            className="flex items-center justify-center gap-3 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Calendar size={18} />
            Richiedi Consultazione
          </button>

          <button
            onClick={() => setShowConsultationForm(true)}
            className="flex items-center justify-center gap-3 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <MessageSquare size={18} />
            Registra Consultazione
          </button>
        </div>
      </div>

      {showConsultationForm && (
        <div className="mt-6">
          <ConsultationForm
            agronomists={[agronomist]}
            onSave={async (consultation) => {
              // Questo sarà gestito dal componente padre
              setShowConsultationForm(false)
            }}
            onCancel={() => setShowConsultationForm(false)}
          />
        </div>
      )}
    </div>
  )
}

export default ContactAgronomist


