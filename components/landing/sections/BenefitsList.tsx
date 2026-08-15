const BENEFITS = [
  { text: 'Dove serve attenzione prima di organizzare la giornata.', swatch: 'measured' },
  { text: 'Perché viene proposto un intervento.', swatch: 'measured' },
  { text: 'Cosa ha ricevuto ogni pianta e come ha risposto.', swatch: 'measured' },
  { text: 'Come piano, lavorazioni, costi e raccolto si confrontano.', swatch: 'measured' },
  { text: 'Quali informazioni sono pronte per registri e certificazioni.', swatch: 'measured' },
  { text: 'Come la storia aziendale continua tra una stagione e la successiva.', swatch: 'measured' },
] as const

function Swatch({ kind }: { kind: (typeof BENEFITS)[number]['swatch'] }) {
  const base = 'mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-sm'
  if (kind === 'measured') return <span className={`${base} bg-ortomio-green-600`} />
  if (kind === 'estimated') return <span className={`${base} border border-ortomio-green-600`} />
  return <span className={`${base} border border-ortomio-earth-500`} />
}

export default function BenefitsList() {
  return (
    <section className="border-b border-ortomio-earth-200 px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-8 font-display text-2xl font-extrabold text-ortomio-green-900 sm:text-3xl">
          Cosa puoi verificare
        </h2>
        <ul className="divide-y divide-ortomio-earth-200 border-t border-ortomio-earth-200">
          {BENEFITS.map((benefit) => (
            <li key={benefit.text} className="flex items-start gap-3 py-4 text-gray-800">
              <Swatch kind={benefit.swatch} />
              <span>{benefit.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
