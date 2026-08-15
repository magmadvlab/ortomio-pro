const STEPS = [
  {
    title: 'Configuri il contesto reale',
    text: 'Garden, zone, filari, colture, suolo, esposizione, acqua.',
  },
  {
    title: 'Il sistema costruisce priorità spiegabili',
    text: 'Meteo, storico e fattibilità diventano una coda di azioni, ognuna con la motivazione scritta accanto: dati usati, calcolo, convenienza.',
  },
  {
    title: 'Approvi o pianifichi il task',
    text: 'La decisione resta umana: il sistema propone e argomenta.',
  },
  {
    title: 'L\u2019esito aggiorna la memoria',
    text: 'Ogni lavorazione registrata rende più precisa la proposta successiva.',
  },
] as const

export default function HowItWorks() {
  return (
    <section className="border-b border-ortomio-earth-200 bg-ortomio-earth-50 px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-10 font-display text-2xl font-extrabold text-ortomio-green-900 sm:text-3xl">
          Da osservazione a decisione, in un unico filo
        </h2>
        <ol className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="border-t-2 border-ortomio-green-600 pt-4">
              <div className="mb-2 flex items-baseline gap-2">
                <span className="font-display text-sm font-bold text-ortomio-earth-600">
                  {i + 1}
                </span>
                <h3 className="font-display text-base font-bold text-ortomio-green-900">
                  {step.title}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-gray-700">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
