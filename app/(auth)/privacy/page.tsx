'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
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

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>

        <div className="prose prose-green max-w-none">
          <p className="text-gray-600 mb-4">
            Ultimo aggiornamento: Gennaio 2026
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">1. Titolare del Trattamento</h2>
          <p className="text-gray-700 mb-4">
            OrtoMio AI è il titolare del trattamento dei dati personali raccolti attraverso questa
            applicazione, in conformità al Regolamento (UE) 2016/679 (GDPR).
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2. Dati Raccolti</h2>
          <p className="text-gray-700 mb-4">
            Raccogliamo i seguenti tipi di dati:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li><strong>Dati di registrazione:</strong> nome, cognome, email, telefono (opzionale), data di nascita (opzionale), azienda (opzionale)</li>
            <li><strong>Dati del giardino:</strong> informazioni sulle colture, trattamenti, raccolti, foto</li>
            <li><strong>Dati di utilizzo:</strong> log di accesso, interazioni con l'applicazione</li>
            <li><strong>Dati di geolocalizzazione:</strong> posizione del giardino (se fornita dall'utente)</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3. Finalità del Trattamento</h2>
          <p className="text-gray-700 mb-4">
            I dati personali sono trattati per le seguenti finalità:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Fornitura del servizio OrtoMio AI</li>
            <li>Personalizzazione dei consigli agricoli</li>
            <li>Comunicazioni relative al servizio</li>
            <li>Miglioramento dell'applicazione</li>
            <li>Adempimento di obblighi legali</li>
            <li>Marketing (solo con consenso esplicito)</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4. Base Giuridica</h2>
          <p className="text-gray-700 mb-4">
            Il trattamento dei dati si basa su:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Esecuzione del contratto di servizio</li>
            <li>Consenso dell'utente (per marketing)</li>
            <li>Legittimo interesse (per miglioramento del servizio)</li>
            <li>Obblighi legali</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5. Conservazione dei Dati</h2>
          <p className="text-gray-700 mb-4">
            I dati personali sono conservati per la durata dell'account utente e per un periodo
            successivo necessario per adempiere agli obblighi legali. L'utente può richiedere la
            cancellazione dei propri dati in qualsiasi momento.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6. Condivisione dei Dati</h2>
          <p className="text-gray-700 mb-4">
            I dati possono essere condivisi con:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li><strong>Supabase:</strong> per l'archiviazione sicura dei dati</li>
            <li><strong>Google (Gemini AI):</strong> per le funzionalità di intelligenza artificiale</li>
            <li><strong>Autorità competenti:</strong> se richiesto dalla legge</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">7. Diritti dell'Utente</h2>
          <p className="text-gray-700 mb-4">
            In conformità al GDPR, l'utente ha diritto a:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Accedere ai propri dati personali</li>
            <li>Rettificare i dati inesatti</li>
            <li>Cancellare i propri dati ("diritto all'oblio")</li>
            <li>Limitare il trattamento</li>
            <li>Portabilità dei dati</li>
            <li>Opporsi al trattamento</li>
            <li>Revocare il consenso in qualsiasi momento</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">8. Sicurezza</h2>
          <p className="text-gray-700 mb-4">
            Adottiamo misure tecniche e organizzative appropriate per proteggere i dati personali
            da accessi non autorizzati, perdita o distruzione. I dati sono crittografati in transito
            e a riposo.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">9. Cookie</h2>
          <p className="text-gray-700 mb-4">
            L'applicazione utilizza cookie tecnici necessari per il funzionamento del servizio.
            Non utilizziamo cookie di profilazione senza consenso esplicito.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">10. Modifiche alla Privacy Policy</h2>
          <p className="text-gray-700 mb-4">
            Ci riserviamo il diritto di modificare questa Privacy Policy. Le modifiche significative
            saranno comunicate tramite email o notifica nell'applicazione.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">11. Contatti</h2>
          <p className="text-gray-700 mb-4">
            Per esercitare i propri diritti o per qualsiasi domanda relativa alla privacy,
            contattare il supporto tramite l'applicazione.
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
