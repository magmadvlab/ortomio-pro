const MORNING_OUTPUTS = [
  {
    label: 'Briefing',
    text: 'Meteo sintetico, stress idrico e termico, fotoperiodo, fase lunare, GDD accumulati: il quadro del giorno, con la qualità dichiarata di ogni fonte.',
  },
  {
    label: 'Coda delle azioni',
    text: 'Cosa fare prima, perché, con quale confidenza — e quali segnali mancano per decidere meglio.',
  },
  {
    label: 'Task eseguibili',
    text: 'Dalla proposta all’azione: link diretti a irrigazione, nutrizione, raccolta e lavorazioni.',
  },
  {
    label: 'Previsioni firmate',
    text: 'Rischio malattie, resa e risorse: ogni previsione porta versione del modello, dati usati e finestra di validità.',
  },
  {
    label: 'Memoria',
    text: 'Perché hai deciso, cosa è stato fatto, com’è andata: la storia che vale anche la prossima stagione.',
  },
] as const

export default function DecisionScenario() {
  return (
    <section id="come-funziona" className="border-b border-ortomio-earth/30 bg-ortomio-paper px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <h2 className="font-display text-4xl font-extrabold leading-tight text-ortomio-green-900 sm:text-5xl">
            Dal briefing al campo, senza passaggi persi.
          </h2>
          <p className="max-w-2xl text-lg leading-relaxed text-gray-700">
            Ogni mattina il Director compone ciò che serve in un unico flusso: il quadro del
            giorno, le azioni in ordine di priorità, i task pronti da eseguire, le previsioni
            firmate e la memoria di ogni decisione. Niente si perde tra uno strumento e l’altro,
            perché tutto nasce dallo stesso contesto.
          </p>
        </div>

        <ol className="mt-14 grid border-y border-ortomio-earth/30 md:grid-cols-2 lg:grid-cols-5 lg:divide-x lg:divide-ortomio-earth/30">
          {MORNING_OUTPUTS.map(({ label, text }, index) => (
            <li
              key={label}
              className="border-b border-ortomio-earth/30 py-7 last:border-b-0 md:border-b-0 lg:px-5 lg:first:pl-0 lg:last:pr-0"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-ortomio-green-700">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-lg font-bold text-ortomio-green-900">{label}</h3>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-gray-700">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
