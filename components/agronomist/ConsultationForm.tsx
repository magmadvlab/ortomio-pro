import React, { useState, useEffect } from 'react'
import { AgronomistConsultation, Agronomist } from '@/types/agronomist'
import { format } from 'date-fns'
import { X, Plus, Trash2 } from 'lucide-react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { getSupabaseClient } from '@/config/supabase'

interface ConsultationFormProps {
  agronomists: Agronomist[]
  consultation?: AgronomistConsultation
  onSave: (consultation: Omit<AgronomistConsultation, 'id' | 'createdAt'>) => void
  onCancel: () => void
}

const ConsultationForm: React.FC<ConsultationFormProps> = ({
  agronomists,
  consultation,
  onSave,
  onCancel
}) => {
  const { storageProvider } = useStorage()
  const [gardens, setGardens] = useState<any[]>([])
  const [formData, setFormData] = useState({
    agronomistId: consultation?.agronomistId || '',
    date: consultation?.date || format(new Date(), 'yyyy-MM-dd'),
    consultationType: consultation?.consultationType || 'InPerson' as 'InPerson' | 'Phone' | 'Email' | 'Video',
    topic: consultation?.topic || '',
    gardenId: consultation?.gardenId || '',
    taskId: consultation?.taskId || '',
    notes: consultation?.notes || '',
    advice: consultation?.advice || [] as AgronomistConsultation['advice'],
    attachments: consultation?.attachments || [] as string[]
  })

  useEffect(() => {
    loadGardens()
  }, [])

  const loadGardens = async () => {
    try {
      const loadedGardens = await storageProvider.getGardens()
      setGardens(loadedGardens)
    } catch (error) {
      console.error('Error loading gardens:', error)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.agronomistId) {
      alert('Seleziona un agronomo')
      return
    }

    if (!formData.topic.trim()) {
      alert('Inserisci un argomento per la consultazione')
      return
    }

    const getCurrentUserId = async (): Promise<string | null> => {
      const supabase = getSupabaseClient()
      if (!supabase) {
        return localStorage.getItem('user_id') || null
      }
      
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) {
          return localStorage.getItem('user_id') || null
        }
        return user.id
      } catch (error) {
        return localStorage.getItem('user_id') || null
      }
    }

    getCurrentUserId().then(userId => {
      if (!userId) {
        alert('Errore: utente non autenticato')
        return
      }

      onSave({
        agronomistId: formData.agronomistId,
        userId,
        date: formData.date,
        consultationType: formData.consultationType,
        topic: formData.topic,
        gardenId: formData.gardenId || undefined,
        taskId: formData.taskId || undefined,
        notes: formData.notes || undefined,
        advice: formData.advice,
        attachments: formData.attachments
      })
    })
  }

  const addAdvice = () => {
    setFormData({
      ...formData,
      advice: [
        ...formData.advice,
        {
          recommendation: '',
          priority: 'Medium' as 'High' | 'Medium' | 'Low'
        }
      ]
    })
  }

  const removeAdvice = (index: number) => {
    setFormData({
      ...formData,
      advice: formData.advice.filter((_, i) => i !== index)
    })
  }

  const updateAdvice = (index: number, field: string, value: any) => {
    const updatedAdvice = [...formData.advice]
    updatedAdvice[index] = { ...updatedAdvice[index], [field]: value }
    setFormData({ ...formData, advice: updatedAdvice })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-2 border-green-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          {consultation ? 'Modifica Consultazione' : 'Nuova Consultazione'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Agronomo *
          </label>
          <select
            required
            value={formData.agronomistId}
            onChange={(e) => setFormData({ ...formData, agronomistId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">Seleziona agronomo</option>
            {agronomists.map(agronomist => (
              <option key={agronomist.id} value={agronomist.id}>
                {agronomist.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Consultazione *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo Consultazione *
            </label>
            <select
              required
              value={formData.consultationType}
              onChange={(e) => setFormData({ ...formData, consultationType: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="InPerson">In Persona</option>
              <option value="Phone">Telefono</option>
              <option value="Email">Email</option>
              <option value="Video">Video</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Argomento / Topic *
          </label>
          <input
            type="text"
            required
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            placeholder="es. Problema con pomodori, consigli su fertilizzazione..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        {gardens.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Orto (opzionale)
            </label>
            <select
              value={formData.gardenId}
              onChange={(e) => setFormData({ ...formData, gardenId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Nessun orto specifico</option>
              {gardens.map(garden => (
                <option key={garden.id} value={garden.id}>
                  {garden.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Consigli Ricevuti
          </label>
          <button
            type="button"
            onClick={addAdvice}
            className="mb-2 flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
          >
            <Plus size={16} />
            Aggiungi Consiglio
          </button>

          <div className="space-y-3">
            {formData.advice.map((advice, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Consiglio {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeAdvice(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Pianta (opzionale)</label>
                    <input
                      type="text"
                      value={advice.plantName || ''}
                      onChange={(e) => updateAdvice(index, 'plantName', e.target.value)}
                      placeholder="es. Pomodoro"
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Problema (opzionale)</label>
                    <input
                      type="text"
                      value={advice.issue || ''}
                      onChange={(e) => updateAdvice(index, 'issue', e.target.value)}
                      placeholder="es. Foglie gialle"
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Raccomandazione *</label>
                    <textarea
                      required
                      value={advice.recommendation}
                      onChange={(e) => updateAdvice(index, 'recommendation', e.target.value)}
                      placeholder="Consiglio ricevuto dall'agronomo..."
                      rows={3}
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Priorità</label>
                      <select
                        value={advice.priority}
                        onChange={(e) => updateAdvice(index, 'priority', e.target.value)}
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded"
                      >
                        <option value="High">Alta</option>
                        <option value="Medium">Media</option>
                        <option value="Low">Bassa</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Follow-up (opzionale)</label>
                      <input
                        type="date"
                        value={advice.followUpDate || ''}
                        onChange={(e) => updateAdvice(index, 'followUpDate', e.target.value)}
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note Personali
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Note aggiuntive sulla consultazione..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Salva Consultazione
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Annulla
          </button>
        </div>
      </form>
    </div>
  )
}

export default ConsultationForm

