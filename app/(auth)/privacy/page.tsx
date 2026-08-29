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

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Informativa sulla privacy</h1>

        <div className="prose prose-green max-w-none">
          <p className="text-gray-600 mb-4">
            Ultimo aggiornamento: 29 agosto 2026 — versione 1.0
          </p>
          <p className="text-gray-500 text-sm mb-4 italic">
            Alcuni dati in questa pagina (indirizzo, regione dei fornitori cloud, periodo di
            conservazione esatto) sono contrassegnati [da confermare]: sono in corso di verifica
            e verranno aggiornati non appena disponibili, senza inventare valori nel frattempo.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">1. Titolare del trattamento</h2>
          <p className="text-gray-700 mb-4">
            Roberto Lalinga, titolare di OrtoMio.<br />
            Contatto: roberto.lalinga@gmail.com <em>[provvisorio — sarà sostituito con l'email professionale su dominio]</em><br />
            Sede/domicilio: <em>[da inserire]</em><br />
            Partita IVA/Codice Fiscale: <em>[da inserire, se e quando esiste una posizione fiscale dedicata]</em>
          </p>
          <p className="text-gray-700 mb-4">
            Non è nominato un Responsabile della Protezione dei Dati (DPO): l'attività non rientra,
            allo stato, nei casi di nomina obbligatoria ex art. 37 GDPR. <em>[da riconfermare quando il volume di trattamento cambia scala]</em>
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2. Quali dati raccogliamo e perché</h2>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li><strong>Nome, email, azienda, coltura/esigenza indicata</strong> — dal modulo "prova guidata" sulla landing, per rispondere alla richiesta e organizzare la demo (consenso / misure precontrattuali).</li>
            <li><strong>Email e credenziali di accesso</strong> — creazione account, per erogare il servizio (esecuzione di un contratto).</li>
            <li><strong>Dati aziendali e agronomici</strong> (colture, appezzamenti, interventi, foto, dati di raccolto, tracciabilità) — uso quotidiano della piattaforma, per fornire registro decisionale e memoria operativa (esecuzione di un contratto).</li>
            <li><strong>Dati inviati alle funzioni di intelligenza artificiale</strong> (richieste di analisi, priorità, diagnosi) — per generare i suggerimenti richiesti (esecuzione di un contratto).</li>
            <li><strong>Dati geografici/immagini satellitari delle particelle</strong> (funzione NDVI, beta) — solo se l'utente attiva il monitoraggio satellitare, per calcolare gli indici di vigoria/stress idrico (esecuzione di un contratto).</li>
            <li><strong>Dati tecnici di navigazione</strong> (log server, indirizzo IP, cookie strettamente necessari) — sicurezza e funzionamento tecnico (legittimo interesse).</li>
          </ul>
          <p className="text-gray-500 text-sm mb-4 italic">
            Non raccogliamo, allo stato, dati tramite cookie di profilazione o strumenti di analisi
            del traffico. Questa riga va aggiornata nello stesso commit in cui si installa un analytics.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3. A chi vengono comunicati i dati (responsabili del trattamento)</h2>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li><strong>Supabase</strong> — hosting del database applicativo, tutti i dati di account e piattaforma. Regione del progetto: <em>[da confermare]</em>.</li>
            <li><strong>Vercel</strong> (o hosting equivalente) — hosting dell'applicazione web, log tecnici e dati in transito. <em>[da confermare]</em>.</li>
            <li><strong>Google (Gemini API)</strong> — elaborazione delle funzioni AI, contenuto delle richieste inviate. Google dichiara proprie garanzie per i trasferimenti extra-SEE (clausole contrattuali tipo): <em>il testo esatto va verificato sui termini attuali di Google Cloud/Gemini API</em>.</li>
            <li><strong>Sentinel Hub</strong> (o fornitore satellitare beta) — calcolo indici NDVI/NDMI, coordinate geografiche delle particelle se il modulo satellitare è attivo. Basato su dati Copernicus (UE): <em>fornitore contrattuale esatto e sede da confermare</em>.</li>
          </ul>
          <p className="text-gray-700 mb-4">Non vendiamo né comunichiamo i dati a terzi per finalità commerciali di terzi.</p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4. Trasferimento dei dati fuori dall'Unione Europea</h2>
          <p className="text-gray-700 mb-4">
            Alcuni fornitori indicati al punto 3 (in particolare i servizi AI) possono comportare un
            trasferimento verso paesi extra-SEE, soggetto alle garanzie previste dal fornitore
            (tipicamente clausole contrattuali standard approvate dalla Commissione Europea).
            <em> Il riferimento contrattuale preciso sarà aggiunto non appena verificato.</em>
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5. Periodo di conservazione</h2>
          <p className="text-gray-700 mb-4">
            I dati sono conservati per la durata del rapporto contrattuale e, successivamente, per il
            tempo necessario ad adempiere a obblighi di legge (es. fiscali/contabili) o a far valere
            un diritto in sede giudiziaria. <em>Il periodo esatto in anni per ciascuna categoria di dato è in fase di definizione formale.</em>
            L'utente può richiedere la cancellazione dei propri dati in qualsiasi momento (vedi punto 6).
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6. Diritti dell'interessato</h2>
          <p className="text-gray-700 mb-4">
            In qualsiasi momento puoi richiedere: accesso ai tuoi dati, rettifica, cancellazione,
            limitazione del trattamento, portabilità dei dati, opposizione al trattamento basato su
            legittimo interesse, revoca del consenso. Puoi esercitare questi diritti scrivendo a{' '}
            <a href="mailto:roberto.lalinga@gmail.com" className="text-green-700 underline">roberto.lalinga@gmail.com</a>{' '}
            <em>[provvisorio]</em> oppure dalla pagina Impostazioni del tuo account. Hai inoltre diritto
            di proporre reclamo al Garante per la Protezione dei Dati Personali (www.garanteprivacy.it).
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">7. Sicurezza</h2>
          <p className="text-gray-700 mb-4">
            Adottiamo misure tecniche e organizzative appropriate per proteggere i dati personali da
            accessi non autorizzati, perdita o distruzione.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">8. Minori</h2>
          <p className="text-gray-700 mb-4">
            Il servizio è rivolto ad attività professionali (aziende agricole, tecnici/consulenti) e
            non è destinato a persone minori di 18 anni.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">9. Modifiche a questa informativa</h2>
          <p className="text-gray-700 mb-4">
            Questa informativa può essere aggiornata. La versione in vigore è sempre quella
            pubblicata su questa pagina, con indicazione della data di ultima modifica.
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
