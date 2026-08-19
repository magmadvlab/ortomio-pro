import type { Metadata } from 'next'
import LandingHeader from '@/components/landing/LandingHeader'
import LandingFooter from '@/components/landing/LandingFooter'
import FinalCta from '@/components/landing/sections/FinalCta'

export const metadata: Metadata = {
  title: 'Come funziona OrtoMio | Dal satellite alla singola pianta',
  description:
    'Come OrtoMio trasforma satellite, suolo, acqua e storia delle piante in una coda di azioni punteggiate e spiegate.',
  alternates: { canonical: '/come-funziona' },
}

const reasoningQuestions = [
  {
    question: 'Cosa propone?',
    answer: 'L’intervento da valutare, il luogo interessato e il momento in cui può essere utile.',
  },
  {
    question: 'Su cosa si basa?',
    answer: 'Campo, sensori, meteo, coltura, storico disponibile e informazioni ancora da completare.',
  },
  {
    question: 'Perché viene prima?',
    answer: 'Urgenza agronomica, conseguenze del ritardo, costi e qualità delle informazioni raccolte.',
  },
  {
    question: 'Quali alternative ha considerato?',
    answer: 'Intervenire, programmare, continuare a osservare oppure richiedere un controllo sul campo.',
  },
] as const

const plantHistory = [
  {
    label: 'Identità',
    text: 'Codice, varietà e posizione esatta accompagnano la pianta dal vivaio al filare.',
  },
  {
    label: 'Ciò che riceve',
    text: 'Acqua, nutrimenti e trattamenti restano associati alla pianta con quantità, data e operatore.',
  },
  {
    label: 'Come risponde',
    text: 'Stato di salute prima e dopo, lavorazioni ed efficacia osservata completano la lettura.',
  },
  {
    label: 'Ciò che produce',
    text: 'Quantità, qualità, destinazione e valore mantengono il raccolto collegato alla sua origine.',
  },
] as const

const certificationEvidence = [
  'Storia delle lavorazioni e dei prodotti utilizzati.',
  'Collegamento tra lotto, pianta, raccolto e destinazione.',
  'Autocontrolli, piani di gestione dei rischi e procedure di richiamo.',
  'Bozze AI iniziali da completare e verificare prima dell’uso.',
] as const

const fieldContext = [
  {
    label: 'Meteo e terreno',
    text: 'Pioggia, temperatura, acqua disponibile, tipo di suolo ed esposizione.',
  },
  {
    label: 'Coltura',
    text: 'Varietà, momento del ciclo, stato delle piante e necessità di acqua o nutrimento.',
  },
  {
    label: 'Lavori e persone',
    text: 'Interventi svolti o programmati, operatori coinvolti e risposta osservata.',
  },
  {
    label: 'Costi e raccolto',
    text: 'Costo dell’intervento, conseguenze di un ritardo e risultato produttivo.',
  },
] as const

const cropPlanning = [
  {
    id: 'orticole',
    label: 'Orticole e seminativi',
    proof: 'Semine, successioni, rotazioni, irrigazioni e raccolti',
    detail: 'Il piano collega periodi, appezzamenti e lavori, poi confronta quanto previsto con ciò che è avvenuto.',
  },
  {
    id: 'vigneto',
    label: 'Vigneto',
    proof: 'Dal filare alla singola vite',
    detail: 'Potature, carico di gemme, trattamenti e produzione restano legati alla posizione corretta.',
  },
  {
    id: 'oliveto',
    label: 'Oliveto',
    proof: 'Una storia per ogni albero',
    detail: 'Posizione, varietà, interventi, stato vegetativo e raccolti accompagnano ogni olivo nel tempo.',
  },
  {
    id: 'frutteto',
    label: 'Frutteto',
    proof: 'Sviluppo e produzione per zona o albero',
    detail: 'Varietà, fioritura, salute, trattamenti, qualità e produzione possono essere letti alla scala utile.',
  },
  {
    id: 'vivaio',
    label: 'Vivaio',
    proof: 'Dal seme alla posizione nel filare',
    detail: 'Germinazione, crescita e preparazione al trapianto seguono la piantina fino alla sua posizione in campo.',
  },
] as const

export default function ComeFunzionaPage() {
  return (
    <div className="min-h-screen bg-ortomio-paper text-ortomio-green-900">
      <LandingHeader />
      <main>
        <header className="relative overflow-hidden bg-ortomio-green-900 px-6 py-24 text-white sm:py-32">
          <div
            className="absolute inset-y-0 right-0 hidden w-1/3 border-l border-white/10 bg-[linear-gradient(90deg,transparent_49%,rgba(255,255,255,0.08)_50%)] bg-[length:3rem_100%] lg:block"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-5xl">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-ortomio-harvest">
              Dal campo alla decisione, senza perdere nessun passaggio
            </p>
            <h1 className="mt-6 max-w-5xl font-display text-5xl font-extrabold leading-[1.05] sm:text-7xl">
              Dal satellite alla singola pianta: come OrtoMio costruisce una decisione.
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-ortomio-green-100 sm:text-xl">
              OrtoMio avvicina livelli che di solito restano separati: osservazione dall’alto,
              misure sul campo, storia delle piante e lavoro svolto. L’AI li mette in relazione,
              mostra il proprio ragionamento e lascia la decisione al responsabile.
            </p>
          </div>
        </header>

        <section aria-labelledby="osservazione-title" className="px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-8 lg:grid-cols-[0.7fr_1fr] lg:items-end">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-ortomio-green-700">
                  Osservare e misurare
                </p>
                <h2 id="osservazione-title" className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">
                  Parte dalla situazione reale del campo.
                </h2>
              </div>
              <p className="text-lg leading-relaxed text-gray-700">
                Ti mostra cosa richiede attenzione mettendo vicini dati satellitari, misure IoT,
                meteo, colture e lavori già registrati. Ogni informazione mantiene chiara la propria
                origine e i propri limiti.
              </p>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden border border-ortomio-earth/20 bg-ortomio-earth/20 lg:grid-cols-2">
              <article className="bg-white p-7 sm:p-9">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-ortomio-green-700">Vista ampia · NDVI</p>
                <h3 className="mt-4 font-display text-2xl font-bold">Indica dove andare a controllare.</h3>
                <p className="mt-4 leading-relaxed text-gray-700">
                  Quando i dati satellitari sono disponibili, le differenze di vigore diventano
                  aree da verificare e vengono collegate a filari, irrigazioni e interventi passati.
                  NDVI supporta lo scouting: orienta il controllo in campo, non formula diagnosi.
                </p>
              </article>
              <article className="bg-white p-7 sm:p-9">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-ortomio-green-700">Vista vicina · IoT</p>
                <h3 className="mt-4 font-display text-2xl font-bold">Distingue una misura da una previsione.</h3>
                <p className="mt-4 leading-relaxed text-gray-700">
                  Con un dispositivo associato alla singola pianta, la telemetria può registrare
                  portata e litri erogati. I valori misurati restano distinti da quelli inseriti
                  manualmente, pianificati o calcolati: un comando non dimostra da solo quanta acqua
                  sia arrivata alle radici.
                </p>
              </article>
            </div>

            <div className="mt-12">
              <h3 className="max-w-3xl font-display text-2xl font-bold sm:text-3xl">
                Condizioni del campo, colture, lavori e costi nello stesso quadro.
              </h3>
              <div className="mt-7 grid gap-x-8 gap-y-7 sm:grid-cols-2">
                {fieldContext.map((item) => (
                  <article key={item.label} className="border-t-2 border-ortomio-green-600 pt-4">
                    <h4 className="font-bold">{item.label}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-gray-700">{item.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="reasoning-title" className="bg-ortomio-green-900 px-6 py-20 text-white sm:py-28">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1fr]">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-ortomio-harvest">
                  Ragionamento visibile
                </p>
                <h2 id="reasoning-title" className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">
                  Quattro domande aprono ogni proposta.
                </h2>
              </div>
              <div>
                <p className="text-lg leading-relaxed text-ortomio-green-100">
                  Spiega perché propone un intervento senza nascondere informazioni mancanti o
                  possibilità diverse. La decisione resta al responsabile: OrtoMio prepara una
                  lettura motivata e conserva il motivo della scelta.
                </p>
              </div>
            </div>

            <ol className="mt-12 grid gap-px border border-white/15 bg-white/15 sm:grid-cols-2">
              {reasoningQuestions.map((item, index) => (
                <li key={item.question} className="bg-ortomio-green-900 p-7 sm:p-9">
                  <span className="font-mono text-xs text-ortomio-harvest">0{index + 1}</span>
                  <h3 className="mt-5 font-display text-2xl font-bold">{item.question}</h3>
                  <p className="mt-3 leading-relaxed text-ortomio-green-100">{item.answer}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="plant-title" className="px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-5xl">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-ortomio-green-700">
              Una storia per ogni pianta
            </p>
            <h2 id="plant-title" className="mt-4 max-w-4xl font-display text-4xl font-extrabold sm:text-5xl">
              Da ciò che riceve a ciò che raccogli.
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-gray-700">
              Ogni pianta, vite o albero può mantenere codice e posizione. Collega il lavoro al risultato e permette di
              confrontare lo stato prima e dopo ogni intervento.
            </p>

            <ol className="mt-12 border-y border-ortomio-earth/20">
              {plantHistory.map((item, index) => (
                <li
                  key={item.label}
                  className="grid gap-3 border-b border-ortomio-earth/20 py-7 last:border-b-0 sm:grid-cols-[4rem_0.7fr_1.3fr] sm:items-start"
                >
                  <span className="font-mono text-xs text-ortomio-green-700">0{index + 1}</span>
                  <h3 className="font-display text-xl font-bold">{item.label}</h3>
                  <p className="leading-relaxed text-gray-700">{item.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="certification-title" className="bg-white px-6 py-20 sm:py-28">
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.8fr_1fr] lg:gap-16">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-ortomio-green-700">
                Evidenze recuperabili
              </p>
              <h2 id="certification-title" className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">
                Il lavoro documentato prepara la verifica.
              </h2>
              <p className="mt-6 leading-relaxed text-gray-700">
                Per biologico e GlobalG.A.P., OrtoMio aiuta a organizzare ciò che è già documentato
                e a vedere cosa deve essere completato. Prepara evidenze; il certificato e la
                valutazione restano agli organismi competenti.
              </p>
            </div>
            <ul className="border-t border-ortomio-earth/20">
              {certificationEvidence.map((item) => (
                <li key={item} className="flex gap-4 border-b border-ortomio-earth/20 py-5 leading-relaxed text-gray-700">
                  <span className="mt-2 h-2 w-2 shrink-0 bg-ortomio-harvest" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="planning-title" className="px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-8 lg:grid-cols-[0.7fr_1fr]">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-ortomio-green-700">
                  Pianificare e imparare
                </p>
                <h2 id="planning-title" className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">
                  Il piano continua anche dopo l’inizio della stagione.
                </h2>
              </div>
              <div className="space-y-5 text-lg leading-relaxed text-gray-700">
                <p>
                  Regole agronomiche, rotazioni, periodi di semina e compatibilità costruiscono la
                  base. L’AI confronta periodi, costi, ricavi potenziali e rischi senza sostituire
                  l’esperienza di chi conduce l’azienda.
                </p>
                <p>
                  Quando lavorazioni, rese e costi reali vengono registrati, il confronto con il
                  piano aiuta a preparare il ciclo successivo.
                </p>
              </div>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-2">
              {cropPlanning.map((crop) => (
                <article key={crop.id} className="border border-ortomio-earth/20 bg-white p-6 sm:p-7">
                  <h3 className="font-display text-2xl font-bold">{crop.label}</h3>
                  <p className="mt-3 font-semibold text-ortomio-green-700">{crop.proof}</p>
                  <p className="mt-3 text-sm leading-relaxed text-gray-700">{crop.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  )
}
