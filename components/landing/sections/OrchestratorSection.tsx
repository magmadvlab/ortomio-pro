import { ArrowDown, CircleCheck, Database, GitBranch, ListFilter } from 'lucide-react'
import { orchestratorSignals } from '../content'

export default function OrchestratorSection() {
  return (
    <section id="come-funziona" className="relative overflow-hidden bg-ortomio-paper px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-ortomio-green-700">Il motore orchestratore</p>
            <h2 className="font-display text-3xl font-extrabold leading-tight text-ortomio-green-900 sm:text-5xl">
              Tutto ciò che accade nel campo, coordinato in un’unica lettura.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-700">
              OrtoMio collega ogni segnale alla zona, alla coltura e al momento del ciclo agronomico. Il risultato è un briefing ordinato per urgenza, impatto, costo e affidabilità, pronto per la decisione del responsabile.
            </p>
          </div>

          <div className="relative border-l border-ortomio-earth/30 pl-6 sm:pl-10">
            <div className="space-y-4">
              {orchestratorSignals.map((signal) => (
                <article key={signal.label} className="grid gap-2 border-b border-ortomio-earth/20 pb-5 sm:grid-cols-[8rem_1fr]">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-ortomio-harvest">{signal.label}</span>
                  <p className="text-base leading-relaxed text-ortomio-green-900">{signal.value}</p>
                </article>
              ))}
            </div>

            <div className="my-7 flex items-center gap-3 text-sm text-ortomio-green-700"><ArrowDown className="h-5 w-5" /> Collegati allo stesso contesto operativo</div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: Database, title: 'Distingue', text: 'Misurato, stimato, assente e simulato.' },
                { icon: GitBranch, title: 'Mette in relazione', text: 'Individua le condizioni che agiscono insieme.' },
                { icon: ListFilter, title: 'Ordina', text: 'Consegna una sequenza di priorità motivate.' },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="border-t-2 border-ortomio-green-600 pt-4">
                  <Icon className="mb-4 h-5 w-5 text-ortomio-green-600" aria-hidden="true" />
                  <h3 className="font-bold text-ortomio-green-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-ortomio-green-900 p-6 text-white sm:p-8">
              <div className="flex items-center gap-3 text-ortomio-green-200"><CircleCheck className="h-5 w-5" /> Briefing operativo</div>
              <p className="mt-4 font-display text-2xl font-bold">Una lettura pronta per decidere, con le ragioni visibili.</p>
              <p className="mt-3 text-sm leading-relaxed text-ortomio-green-100">La decisione, l’attività e l’esito entrano nella storia della zona e aggiornano il contesto del ciclo successivo.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
