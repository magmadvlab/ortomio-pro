'use client'

import SatelliteCredentialsManager from '@/components/settings/SatelliteCredentialsManager'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SatelliteConfigPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header con breadcrumb */}
        <div className="mb-6">
          <Link 
            href="/app/settings?section=satellite"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna alle Impostazioni
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurazione Dati Satellitari</h1>
            <p className="text-gray-600 mt-2">
              Configura l'accesso ai dati NDVI di Copernicus per monitoraggio satellitare avanzato
            </p>
          </div>
        </div>

        {/* Componente principale */}
        <SatelliteCredentialsManager />
      </div>
    </div>
  )
}