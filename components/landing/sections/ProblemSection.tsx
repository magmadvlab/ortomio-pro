const PROBLEM_ITEMS = [
  'Non sai più perché un intervento è stato deciso tre settimane fa.',
  'Coordinare zone, filari, colture e operatori diversi resta a voce o su carta.',
  "Non distingui a colpo d'occhio un dato misurato da una stima o da un dato mancante.",
  'Confrontare previsione ed esito richiede di rimettere insieme fonti diverse.',
  'I registri esistono, ma nessuno li rilegge davvero.',
]

export default function ProblemSection() {
  return (
    <section className="border-b border-ortomio-earth-200 px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-4 font-display text-2xl font-extrabold text-ortomio-green-900 sm:text-3xl">
          Il campo genera più informazione di quanta ne riesci a trattenere
        </h2>
        <p className="mb-8 max-w-2xl text-gray-700">
          In molte aziende agricole le informazioni vivono in quaderni, fogli Excel, foto sul
          telefono, promemoria a voce e app meteo separate. Quando serve ricostruire perché è
          stato fatto un trattamento, la risposta dipende da chi se lo ricorda meglio.
        </p>
        <ul className="grid gap-px overflow-hidden rounded-md border border-ortomio-earth-200 bg-ortomio-earth-200 sm:grid-cols-2">
          {PROBLEM_ITEMS.map((item) => (
            <li key={item} className="bg-white p-4 text-sm text-gray-800">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
