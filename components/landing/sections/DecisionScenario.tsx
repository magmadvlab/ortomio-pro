const DECISION_STEPS = [
  {
    label: 'Osservazione',
    text: 'Il satellite evidenzia una zona con vigore diverso e i sensori mostrano poca umidità nel terreno.',
  },
  {
    label: 'Contesto',
    text: 'La coltura è in una fase delicata e le previsioni non indicano pioggia.',
  },
  {
    label: 'Confronto',
    text: 'OrtoMio confronta lo storico delle irrigazioni, lo stato delle piante e i costi dell’intervento.',
  },
  {
    label: 'Decisione motivata',
    text: 'Il responsabile vede dove controllare prima, perché e con quale urgenza.',
  },
] as const

export default function DecisionScenario() {
  return (
    <section id="come-funziona" className="border-b border-ortomio-earth/30 bg-ortomio-paper px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <h2 className="font-display text-4xl font-extrabold leading-tight text-ortomio-green-900 sm:text-5xl">
            Un dato isolato dice poco. È la relazione tra i dati che cambia la decisione.
          </h2>
          <p className="max-w-2xl text-lg leading-relaxed text-gray-700">
            In un’azienda con NDVI e sensori collegati, il satellite evidenzia una zona con vigore
            diverso e i sensori mostrano poca umidità nel terreno. La coltura è in una fase delicata
            e le previsioni non indicano pioggia. OrtoMio collega queste informazioni allo storico
            delle irrigazioni, allo stato delle piante e ai costi dell’intervento.
          </p>
        </div>

        <ol className="mt-14 grid border-y border-ortomio-earth/30 lg:grid-cols-4 lg:divide-x lg:divide-ortomio-earth/30">
          {DECISION_STEPS.map(({ label, text }, index) => (
            <li
              key={label}
              className="border-b border-ortomio-earth/30 py-7 last:border-b-0 lg:border-b-0 lg:px-6 lg:first:pl-0 lg:last:pr-0"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-ortomio-harvest">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-xl font-bold text-ortomio-green-900">{label}</h3>
              </div>
              <p className="mt-4 leading-relaxed text-gray-700">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
