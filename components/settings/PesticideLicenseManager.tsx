'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Info } from 'lucide-react'

interface PesticideLicense {
  number: string
  expiryDate: string
  isValid: boolean
}

interface PesticideLicenseManagerProps {
  userId?: string
  onSave?: () => void
}

export default function PesticideLicenseManager({ userId, onSave }: PesticideLicenseManagerProps) {
  const [licenseNumber, setLicenseNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [preferredType, setPreferredType] = useState<'organic' | 'classic' | 'mixed'>('organic')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [licenseValid, setLicenseValid] = useState<boolean | null>(null)

  useEffect(() => {
    // Carica dati esistenti
    loadProfile()
  }, [userId])

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        if (data.pesticideLicense) {
          setLicenseNumber(data.pesticideLicense.number || '')
          setExpiryDate(data.pesticideLicense.expiryDate || '')
          setLicenseValid(data.pesticideLicense.isValid || false)
        }
        if (data.preferredTreatmentType) {
          setPreferredType(data.preferredTreatmentType)
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err)
    }
  }

  const validateLicense = (): boolean => {
    if (!expiryDate) {
      setLicenseValid(null)
      return false
    }

    const expiry = new Date(expiryDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    expiry.setHours(0, 0, 0, 0)

    const isValid = expiry >= today
    setLicenseValid(isValid)
    return isValid
  }

  useEffect(() => {
    if (expiryDate) {
      validateLicense()
    }
  }, [expiryDate])

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const isValid = validateLicense()
      
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pesticideLicense: {
            number: licenseNumber,
            expiryDate: expiryDate,
            isValid: isValid,
          },
          preferredTreatmentType: preferredType,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Errore nel salvataggio')
      }

      setSuccess(true)
      if (onSave) {
        onSave()
      }

      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Errore nel salvataggio del profilo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Gestione Patentino Fitosanitario
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Il patentino fitosanitario è necessario per utilizzare prodotti chimici classici.
          Se non hai un patentino valido, verranno suggeriti solo prodotti biologici.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numero Patentino
          </label>
          <input
            type="text"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            placeholder="Es. PAT-12345"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Scadenza
          </label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          {licenseValid !== null && (
            <div className={`mt-2 flex items-center gap-2 text-sm ${
              licenseValid ? 'text-green-600' : 'text-red-600'
            }`}>
              {licenseValid ? (
                <>
                  <CheckCircle size={16} />
                  <span>Patentino valido</span>
                </>
              ) : (
                <>
                  <AlertCircle size={16} />
                  <span>Patentino scaduto o non valido</span>
                </>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preferenza Trattamenti
          </label>
          <select
            value={preferredType}
            onChange={(e) => setPreferredType(e.target.value as 'organic' | 'classic' | 'mixed')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="organic">Solo Biologici</option>
            <option value="classic">Chimici Classici (richiede patentino)</option>
            <option value="mixed">Misti (bio e chimici)</option>
          </select>
          <div className="mt-2 flex items-start gap-3 text-sm text-gray-600">
            <Info size={16} className="mt-0.5 flex-shrink-0" />
            <span>
              {preferredType === 'organic' && 'Verranno suggeriti solo prodotti biologici approvati.'}
              {preferredType === 'classic' && 'Verranno suggeriti solo prodotti chimici che richiedono patentino. Assicurati di avere un patentino valido.'}
              {preferredType === 'mixed' && 'Verranno suggeriti sia prodotti biologici che chimici, in base alla disponibilità del patentino.'}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
            <CheckCircle size={16} />
            <span>Profilo salvato con successo!</span>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Salvataggio...' : 'Salva Impostazioni'}
        </button>
      </div>
    </div>
  )
}

