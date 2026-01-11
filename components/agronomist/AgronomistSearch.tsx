import React, { useState } from 'react'
import { Agronomist } from '@/types/agronomist'
import { Search, User, Mail, Phone, Plus, MapPin } from 'lucide-react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { getSupabaseClient } from '@/config/supabase'

interface AgronomistSearchProps {
  onSelectAgronomist?: (agronomist: Agronomist) => void
  existingAgronomists?: Agronomist[]
}

const AgronomistSearch: React.FC<AgronomistSearchProps> = ({
  onSelectAgronomist,
  existingAgronomists = []
}) => {
  const { storageProvider } = useStorage()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Agronomist[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [specializationFilter, setSpecializationFilter] = useState<string>('')

  // Lista specializzazioni comuni per filtro
  const commonSpecializations = [
    'Fragole', 'Pomodori', 'Olive', 'Vite', 'Frutteti', 
    'Ortaggi', 'Erbe Aromatiche', 'Colture Protette', 'Idroponica'
  ]

  const handleSearch = async () => {
    if (!searchQuery.trim() && !specializationFilter) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    
    try {
      // Per ora, cerchiamo solo tra gli agronomi di fiducia esistenti
      // In futuro, qui si può implementare ricerca su database pubblico
      let results = existingAgronomists

      // Filtro per nome
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        results = results.filter(agronomist => 
          agronomist.name.toLowerCase().includes(query) ||
          agronomist.email?.toLowerCase().includes(query) ||
          agronomist.phone?.includes(query) ||
          agronomist.specialization?.some(s => s.toLowerCase().includes(query))
        )
      }

      // Filtro per specializzazione
      if (specializationFilter) {
        results = results.filter(agronomist =>
          agronomist.specialization?.includes(specializationFilter)
        )
      }

      setSearchResults(results)
    } catch (error) {
      console.error('Error searching agronomists:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddToTrusted = async (agronomist: Agronomist) => {
    try {
      const supabase = getSupabaseClient()
      let userId: string | null = null

      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser()
        userId = user?.id || null
      }

      if (!userId) {
        userId = localStorage.getItem('user_id')
      }

      if (!userId) {
        alert('Devi essere autenticato per aggiungere un agronomo')
        return
      }

      // Verifica se già esiste
      const existing = existingAgronomists.find(a => 
        a.name === agronomist.name && 
        (a.email === agronomist.email || a.phone === agronomist.phone)
      )

      if (existing) {
        alert('Questo agronomo è già nei tuoi contatti di fiducia')
        return
      }

      // Aggiungi ai fiducia
      await storageProvider.createAgronomist({
        userId,
        name: agronomist.name,
        email: agronomist.email,
        phone: agronomist.phone,
        specialization: agronomist.specialization,
        preferredContactMethod: agronomist.preferredContactMethod || 'Email',
        consultationFrequency: agronomist.consultationFrequency
      })

      alert('Agronomo aggiunto ai tuoi contatti di fiducia!')
      onSelectAgronomist?.(agronomist)
    } catch (error) {
      console.error('Error adding agronomist:', error)
      alert('Errore nell\'aggiunta dell\'agronomo')
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
    <div className="space-y-6">
      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Cerca Agronomo
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cerca per nome, email, telefono o specializzazione
            </label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Cerca agronomo..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isSearching ? 'Cercando...' : 'Cerca'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtra per Specializzazione
            </label>
            <select
              value={specializationFilter}
              onChange={(e) => {
                setSpecializationFilter(e.target.value)
                handleSearch()
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Tutte le specializzazioni</option>
              {commonSpecializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Risultati ({searchResults.length})
          </h3>
          <div className="space-y-4">
            {searchResults.map(agronomist => {
              const isAlreadyTrusted = existingAgronomists.some(a => a.id === agronomist.id)
              
              return (
                <div
                  key={agronomist.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="text-green-600" size={24} />
                        <h4 className="text-lg md:text-xl font-semibold text-gray-800">
                          {agronomist.name}
                        </h4>
                        {isAlreadyTrusted && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            Nei Fiducia
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        {agronomist.email && (
                          <div className="flex items-center gap-3">
                            <Mail size={14} />
                            <span>{agronomist.email}</span>
                          </div>
                        )}
                        {agronomist.phone && (
                          <div className="flex items-center gap-3">
                            <Phone size={14} />
                            <span>{agronomist.phone}</span>
                          </div>
                        )}
                        {agronomist.specialization && agronomist.specialization.length > 0 && (
                          <div className="flex items-center gap-3 flex-wrap">
                            <MapPin size={14} />
                            <span className="text-xs">
                              {agronomist.specialization.join(', ')}
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

                    <div className="flex gap-3">
                      {!isAlreadyTrusted && (
                        <button
                          onClick={() => handleAddToTrusted(agronomist)}
                          className="flex items-center gap-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Plus size={16} />
                          Aggiungi ai Fiducia
                        </button>
                      )}
                      {onSelectAgronomist && (
                        <button
                          onClick={() => onSelectAgronomist(agronomist)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Seleziona
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {searchQuery && !isSearching && searchResults.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-32 text-center">
          <Search className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 mb-2">Nessun risultato trovato</p>
          <p className="text-sm text-gray-500">
            Prova a modificare i criteri di ricerca
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> La ricerca attualmente cerca solo tra i tuoi agronomi di fiducia. 
          In futuro sarà disponibile un database pubblico di agronomi verificati.
        </p>
      </div>
    </div>
  )
}

export default AgronomistSearch


