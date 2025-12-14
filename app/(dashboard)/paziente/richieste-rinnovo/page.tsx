'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { RefreshCw, Clock, CheckCircle, XCircle, Filter } from 'lucide-react'

interface RichiestaRinnovo {
  id: string
  pazienteId: string
  pazienteNome: string
  dataRichiesta: string
  dataScadenza: string
  stato: 'in_attesa' | 'approvata' | 'rifiutata' | 'scaduta'
  note?: string
}

export default function RichiesteRinnovoPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [richieste, setRichieste] = useState<RichiestaRinnovo[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStato, setFilterStato] = useState<string>(
    searchParams.get('stato') || 'tutti'
  )

  useEffect(() => {
    // Update URL when filter changes
    if (filterStato !== 'tutti') {
      router.push(`/paziente/richieste-rinnovo?stato=${filterStato}`)
    } else {
      router.push('/paziente/richieste-rinnovo')
    }
  }, [filterStato, router])

  useEffect(() => {
    // Load renewal requests
    const loadRichieste = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (filterStato !== 'tutti') {
          params.append('stato', filterStato)
        }
        
        const response = await fetch(`/api/paziente/richieste-rinnovo?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setRichieste(data.richieste || [])
      } catch (error) {
        console.error('Error loading richieste:', error)
        // Fallback to empty array on error
        setRichieste([])
      } finally {
        setLoading(false)
      }
    }

    loadRichieste()
  }, [filterStato])

  const getStatoIcon = (stato: string) => {
    switch (stato) {
      case 'in_attesa':
        return <Clock className="text-yellow-500" size={20} />
      case 'approvata':
        return <CheckCircle className="text-green-500" size={20} />
      case 'rifiutata':
        return <XCircle className="text-red-500" size={20} />
      case 'scaduta':
        return <XCircle className="text-gray-500" size={20} />
      default:
        return null
    }
  }

  const getStatoLabel = (stato: string) => {
    switch (stato) {
      case 'in_attesa':
        return 'In Attesa'
      case 'approvata':
        return 'Approvata'
      case 'rifiutata':
        return 'Rifiutata'
      case 'scaduta':
        return 'Scaduta'
      default:
        return stato
    }
  }

  const getStatoBadgeClass = (stato: string) => {
    switch (stato) {
      case 'in_attesa':
        return 'bg-yellow-100 text-yellow-800'
      case 'approvata':
        return 'bg-green-100 text-green-800'
      case 'rifiutata':
        return 'bg-red-100 text-red-800'
      case 'scaduta':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch('/api/paziente/richieste-rinnovo', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, azione: 'approva' }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      if (data.success) {
        setRichieste(prev =>
          prev.map(r => (r.id === id ? { ...r, stato: 'approvata' as const } : r))
        )
      }
    } catch (error) {
      console.error('Error approving request:', error)
      alert('Errore durante l\'approvazione della richiesta')
    }
  }

  const handleReject = async (id: string) => {
    try {
      const response = await fetch('/api/paziente/richieste-rinnovo', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, azione: 'rifiuta' }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      if (data.success) {
        setRichieste(prev =>
          prev.map(r => (r.id === id ? { ...r, stato: 'rifiutata' as const } : r))
        )
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
      alert('Errore durante il rifiuto della richiesta')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="animate-spin text-gray-600" size={24} />
          <p className="text-gray-600">Caricamento richieste...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Richieste di Rinnovo
        </h1>
        <p className="text-gray-600">
          Gestisci le richieste di rinnovo abbonamento dei pazienti
        </p>
      </div>

      {/* Filter Section */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center gap-4">
          <Filter className="text-gray-600" size={20} />
          <span className="text-sm font-medium text-gray-700">Filtra per stato:</span>
          <div className="flex gap-2 flex-wrap">
            {['tutti', 'in_attesa', 'approvata', 'rifiutata', 'scaduta'].map((stato) => (
              <button
                key={stato}
                onClick={() => setFilterStato(stato)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStato === stato
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {stato === 'tutti' ? 'Tutte' : getStatoLabel(stato)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {richieste.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">
              Nessuna richiesta trovata
              {filterStato !== 'tutti' && ` con stato "${getStatoLabel(filterStato)}"`}
            </p>
          </div>
        ) : (
          richieste.map((richiesta) => (
            <div
              key={richiesta.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {getStatoIcon(richiesta.stato)}
                    <h3 className="text-xl font-semibold text-gray-900">
                      {richiesta.pazienteNome}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatoBadgeClass(
                        richiesta.stato
                      )}`}
                    >
                      {getStatoLabel(richiesta.stato)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Data Richiesta</p>
                      <p className="text-gray-900 font-medium">
                        {new Date(richiesta.dataRichiesta).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Data Scadenza</p>
                      <p className="text-gray-900 font-medium">
                        {new Date(richiesta.dataScadenza).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                  </div>

                  {richiesta.note && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">Note</p>
                      <p className="text-gray-900">{richiesta.note}</p>
                    </div>
                  )}
                </div>

                {richiesta.stato === 'in_attesa' && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleApprove(richiesta.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Approva
                    </button>
                    <button
                      onClick={() => handleReject(richiesta.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Rifiuta
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

