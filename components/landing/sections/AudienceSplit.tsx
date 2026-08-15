export default function AudienceSplit() {
  return (
    <section className="border-b border-ortomio-earth-200 px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-8 font-display text-2xl font-extrabold text-ortomio-green-900 sm:text-3xl">
          Pensato per chi decide sul campo, tutti i giorni
        </h2>
        <div className="grid overflow-hidden rounded-md border border-ortomio-earth-200 sm:grid-cols-2">
          <div className="border-b border-ortomio-earth-200 p-7 sm:border-b-0 sm:border-r">
            <h3 className="mb-1 text-sm font-bold text-ortomio-green-700">Aziende agricole</h3>
            <p className="mb-4 font-display text-lg font-bold text-ortomio-green-900">
              Coordini zone, filari e operatori con un contesto condiviso.
            </p>
            <p className="max-w-sm text-sm text-gray-700">
              Ogni zona ha la sua storia: colture, trattamenti, irrigazioni, esiti. Chi lavora in
              campo trova il contesto già pronto, chi coordina vede tutto in un unico posto.
            </p>
          </div>
          <div className="bg-ortomio-green-50 p-7">
            <h3 className="mb-1 text-sm font-bold text-ortomio-green-700">Tecnici e consulenti</h3>
            <p className="mb-4 font-display text-lg font-bold text-ortomio-green-900">
              Segui più aziende con dati che si possono confrontare.
            </p>
            <p className="max-w-sm text-sm text-gray-700">
              Stessa struttura, stessi criteri, stessa provenienza del dato per ogni cliente che
              segui. Ogni visita parte da una storia aggiornata e confrontabile.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
