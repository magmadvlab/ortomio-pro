'use client'

import React from 'react'
import { Calendar } from 'lucide-react'
import Link from 'next/link'

export default function AlmanaccoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Calendar className="w-8 h-8 text-green-600" />
            Almanacco del Contadino
          </h1>
          <p className="text-gray-600">
            L'almanacco è ora integrato nel calendario del planner
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <Calendar className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Funzionalità Spostata
          </h2>
          <p className="text-gray-600 mb-6">
            L'almanacco del contadino con consigli lunari e stagionali è ora completamente integrato 
            nel calendario del planner per una migliore esperienza utente.
          </p>
          
          <div className="space-y-3">
            <Link
              href="/app/planner"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Calendar size={20} />
              Vai al Planner con Almanacco
            </Link>
            
            <div className="text-sm text-gray-500">
              Troverai tutti i consigli lunari e stagionali nella sezione calendario
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}