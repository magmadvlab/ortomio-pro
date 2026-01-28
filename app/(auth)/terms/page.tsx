'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <Link
          href="/auth?mode=register"
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-6"
        >
          <ArrowLeft size={20} />
          Torna alla registrazione
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Termini e Condizioni di Utilizzo</h1>

        <div className="prose prose-green max-w-none">
          <p className="text-gray-600 mb-4">
            Ultimo aggiornamento: Gennaio 2026
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">1. Accettazione dei Termini</h2>
          <p className="text-gray-700 mb-4">
            Utilizzando OrtoMio AI, l'utente accetta di essere vincolato dai presenti Termini e Condizioni.
            Se non si accettano questi termini, si prega di non utilizzare il servizio.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2. Descrizione del Servizio</h2>
          <p className="text-gray-700 mb-4">
            OrtoMio AI è un'applicazione web per la gestione agricola che include funzionalità di
            pianificazione, monitoraggio delle colture, gestione dei trattamenti e analisi predittive
            basate sull'intelligenza artificiale.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3. Account Utente</h2>
          <p className="text-gray-700 mb-4">
            L'utente è responsabile della riservatezza delle proprie credenziali di accesso e di tutte
            le attività che si verificano sotto il proprio account. L'utente si impegna a notificare
            immediatamente qualsiasi uso non autorizzato del proprio account.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4. Utilizzo Consentito</h2>
          <p className="text-gray-700 mb-4">
            L'utente si impegna a utilizzare OrtoMio AI solo per scopi legittimi e in conformità con
            tutte le leggi applicabili. È vietato:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Utilizzare il servizio per scopi illegali</li>
            <li>Tentare di accedere a dati di altri utenti</li>
            <li>Interferire con il funzionamento del servizio</li>
            <li>Caricare contenuti dannosi o malware</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5. Proprietà Intellettuale</h2>
          <p className="text-gray-700 mb-4">
            Tutti i contenuti, il design, il codice e i materiali presenti su OrtoMio AI sono protetti
            da diritti di proprietà intellettuale. L'utente mantiene la proprietà dei propri dati
            inseriti nella piattaforma.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6. Limitazione di Responsabilità</h2>
          <p className="text-gray-700 mb-4">
            OrtoMio AI fornisce consigli e suggerimenti basati su algoritmi e intelligenza artificiale.
            Tali consigli non sostituiscono la consulenza di un agronomo professionista. L'utente
            utilizza i consigli a proprio rischio e discrezione.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">7. Modifiche ai Termini</h2>
          <p className="text-gray-700 mb-4">
            Ci riserviamo il diritto di modificare questi termini in qualsiasi momento. Le modifiche
            saranno comunicate tramite email o notifica nell'applicazione.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">8. Contatti</h2>
          <p className="text-gray-700 mb-4">
            Per domande relative ai presenti Termini e Condizioni, contattare il supporto tramite
            l'applicazione.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link
            href="/auth?mode=register"
            className="inline-flex items-center justify-center gap-2 w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            <ArrowLeft size={20} />
            Torna alla registrazione
          </Link>
        </div>
      </div>
    </div>
  )
}
