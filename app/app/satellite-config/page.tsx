'use client'

import React from 'react'
import { Satellite, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import SatelliteConfigStatus from '@/components/ndvi/SatelliteConfigStatus'

export default function SatelliteConfigPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/app/ndvi"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna alla Dashboard NDVI
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Satellite className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Configurazione Dati Satellitari
              </h1>
              <p className="text-gray-600">
                Setup e gestione integrazione Copernicus/Sentinel Hub
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Status */}
        <SatelliteConfigStatus />

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Informazioni Sistema Satellitare
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Specifiche Tecniche</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• <strong>Satellite:</strong> Sentinel-2 ESA</li>
                <li>• <strong>Risoluzione:</strong> 10m per pixel</li>
                <li>• <strong>Frequenza:</strong> Ogni 5 giorni</li>
                <li>• <strong>Copertura:</strong> Globale</li>
                <li>• <strong>Indici:</strong> NDVI, EVI, SAVI</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Funzionalità Attive</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• <strong>Monitoraggio:</strong> Salute vegetazione</li>
                <li>• <strong>Alert:</strong> Stress automatici</li>
                <li>• <strong>Trend:</strong> Analisi temporale</li>
                <li>• <strong>Zone:</strong> Analisi per aree</li>
                <li>• <strong>Mappe:</strong> Visualizzazione interattiva</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}