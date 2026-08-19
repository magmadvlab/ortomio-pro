const SCORING_FACTORS = [
  [
    'Confidenza dei dati',
    'Più i tuoi dati sono misurati, più la proposta sale. Un valore stimato non si finge una misura.',
  ],
  [
    'Copertura dei segnali',
    'Satellite, suolo a tre profondità, acqua, pianta: il punteggio cresce con i segnali che hai davvero — e ti dice quali mancano.',
  ],
  [
    'Fase fenologica',
    'GDD accumulati e fase della coltura: lo stesso intervento vale di più in una fase delicata.',
  ],
  [
    'Pressione ambientale',
    'Giorni recenti di stress idrico o di pressione malattia pesano su irrigazione, nutrizione e difesa.',
  ],
  [
    'Feedback misurato',
    'Come ha risposto il tuo campo le volte scorse modifica la proposta di oggi.',
  ],
  [
    'Economia',
    'Perdite attese e costi a confronto: anche non intervenire è una scelta con un prezzo.',
  ],
] as const

type ScoringFactor = (typeof SCORING_FACTORS)[number]

function FactorRow({ factors, startIndex, separated }: { factors: ScoringFactor[]; startIndex: number; separated: boolean }) {
  return (
    <div className={`grid md:grid-cols-3 md:divide-x md:divide-ortomio-earth/30 ${separated ? 'border-b border-ortomio-earth/30' : ''}`}>
      {factors.map(([title, text], index) => (
        <article
          key={title}
          className={`py-8 md:px-8 md:first:pl-0 md:last:pr-0 ${separated ? 'border-b border-ortomio-earth/30 md:border-b-0' : ''}`}
        >
          <span className="font-mono text-xs font-bold text-ortomio-green-700">
            {String(startIndex + index + 1).padStart(2, '0')}
          </span>
          <h3 className="mt-5 font-display text-2xl font-bold text-ortomio-green-900">{title}</h3>
          <p className="mt-3 leading-relaxed text-gray-700">{text}</p>
        </article>
      ))}
    </div>
  )
}

export default function ReasonWhySection() {
  return (
    <section id="perche-ortomio" className="border-b border-ortomio-earth/30 bg-ortomio-earth-50 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <h2 className="font-display text-4xl font-extrabold leading-tight text-ortomio-green-900 sm:text-5xl">
            Le tue giornate non sono una lista di avvisi. Sono una coda punteggiata.
          </h2>
          <p className="max-w-2xl text-lg leading-relaxed text-gray-700">
            Ogni proposta nasce da un calcolo esplicito, non da un punteggio opaco. Il Director
            combina profilo colturale, fenologia, pressione ambientale e storia dei tuoi
            interventi: il punteggio finale somma fattori che puoi leggere uno a uno.
          </p>
        </div>

        <div className="mt-14 border-y border-ortomio-earth/30">
          <FactorRow factors={SCORING_FACTORS.slice(0, 3)} startIndex={0} separated />
          <FactorRow factors={SCORING_FACTORS.slice(3)} startIndex={3} separated={false} />
        </div>
      </div>
    </section>
  )
}
