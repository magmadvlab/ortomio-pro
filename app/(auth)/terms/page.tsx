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

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Termini e condizioni di servizio</h1>

        <div className="prose prose-green max-w-none">
          <p className="text-gray-600 mb-4">
            Ultimo aggiornamento: 29 agosto 2026 — versione 1.0
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">1. Oggetto</h2>
          <p className="text-gray-700 mb-4">
            OrtoMio è una piattaforma software di supporto alla gestione agronomica, fornita da
            Roberto Lalinga <em>[o dalla ragione sociale che risulterà titolare al momento della pubblicazione]</em>.
            L'accesso e l'uso della piattaforma implicano l'accettazione dei presenti termini.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2. Natura del servizio — limite dichiarato</h2>
          <p className="text-gray-700 mb-4">
            OrtoMio fornisce informazioni, priorità calcolate e suggerimenti a supporto della decisione
            agronomica. <strong>Non sostituisce procedure, normative, formazione o giudizio professionale</strong>:
            ogni decisione operativa (fitosanitaria, di certificazione, agronomica) resta responsabilità
            dell'utente e dei professionisti da lui incaricati. Il servizio non elimina la variabilità
            propria dell'agricoltura e <strong>non garantisce alcun risultato agronomico o economico</strong>.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3. Account e responsabilità dell'utente</h2>
          <p className="text-gray-700 mb-4">
            L'utente è responsabile dell'accuratezza dei dati inseriti (colture, appezzamenti,
            interventi) e della riservatezza delle proprie credenziali. Alcune funzioni (es.
            monitoraggio satellitare, funzioni AI) dipendono da servizi di terze parti e dalla
            disponibilità delle relative credenziali/API: la loro disponibilità non è garantita al 100%.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4. Funzioni in fase beta o non attive</h2>
          <p className="text-gray-700 mb-4">
            Alcune funzionalità sono etichettate come beta o non ancora distribuite (es.
            geolocalizzazione, alcune predizioni AI): il loro utilizzo è fornito "così com'è", senza
            garanzia di continuità o accuratezza, finché non sono formalmente promosse a stabili.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5. Certificazioni e conformità</h2>
          <p className="text-gray-700 mb-4">
            Le funzioni relative a bio/GlobalG.A.P. organizzano evidenze e dossier a supporto
            dell'utente. <strong>Non costituiscono certificazione</strong>, non sostituiscono l'ente
            certificatore e non garantiscono l'esito di un audit.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6. Prezzo</h2>
          <p className="text-gray-700 mb-4">
            <em>[da inserire quando il prezzo del piano PRO sarà approvato]</em>. Fino a quel momento
            il servizio è offerto secondo le modalità di prova guidata descritte sulla landing.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">7. Proprietà dei dati</h2>
          <p className="text-gray-700 mb-4">
            I dati aziendali e agronomici inseriti dall'utente restano di sua proprietà. OrtoMio li
            tratta secondo l'informativa privacy per fornire il servizio richiesto.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">8. Limitazione di responsabilità</h2>
          <p className="text-gray-700 mb-4">
            Nei limiti consentiti dalla legge applicabile, OrtoMio non risponde per danni indiretti
            derivanti da decisioni agronomiche assunte sulla base delle informazioni fornite dalla
            piattaforma, fermo restando quanto indicato al punto 2.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">9. Sospensione e cessazione</h2>
          <p className="text-gray-700 mb-4">
            <em>[da definire: condizioni di sospensione per mancato pagamento una volta approvato il
            prezzo, modalità di recesso, portabilità/esportazione dei dati alla cessazione]</em>.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">10. Legge applicabile e foro competente</h2>
          <p className="text-gray-700 mb-4">
            Legge italiana. Foro competente: <em>[da inserire in base alla sede legale definitiva]</em>.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">11. Modifiche</h2>
          <p className="text-gray-700 mb-4">
            I presenti termini possono essere aggiornati; la versione in vigore è quella pubblicata su
            questa pagina con indicazione della data.
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
