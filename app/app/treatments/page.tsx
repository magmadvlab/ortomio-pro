'use client'

import Link from 'next/link'
import { FlaskConical, ArrowRight, AlertTriangle } from 'lucide-react'

export default function TreatmentsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white border border-amber-200 rounded-2xl shadow-sm p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="text-amber-600" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestione trattamenti legacy congelata</h1>
              <p className="text-gray-600 mt-2">
                Questa sezione scriveva su un circuito storico separato e non allineato al ledger operativo principale.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <FlaskConical className="text-blue-600" size={20} />
              <h2 className="font-semibold text-gray-900">Percorso corretto</h2>
            </div>
            <p className="text-sm text-gray-700">
              Usa la sezione Nutrizione &amp; Trattamenti, che sarà il punto unico di pianificazione e progressivo allineamento con l&apos;orchestratore operativo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/app/nutrition"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
            >
              Vai a Nutrizione &amp; Trattamenti
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/app"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Torna alla dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
