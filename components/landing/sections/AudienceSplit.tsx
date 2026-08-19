import SectionHeader from '../SectionHeader'

export default function AudienceSplit() {
  return (
    <section className="border-b border-ortomio-earth-200 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <SectionHeader index="10" label="audience" />
        <h2 className="mb-8 font-display text-2xl font-extrabold text-ortomio-green-900 sm:text-3xl">
          Pensato per chi decide sul campo, tutti i giorni
        </h2>
        <div className="grid overflow-hidden rounded-md border border-ortomio-earth-200 sm:grid-cols-2">
          <div className="border-b border-ortomio-earth-200 p-7 sm:border-b-0 sm:border-r">
            <h3 className="mb-1 text-sm font-bold text-ortomio-green-700">Aziende agricole</h3>
            <p className="mb-4 font-display text-lg font-bold text-ortomio-green-900">
              Coordina il lavoro con una memoria condivisa, dalla decisione alla verifica.
            </p>
            <p className="max-w-sm text-sm text-gray-700">
              Chi decide, chi esegue e chi verifica lavora sulla stessa storia di zone, filari,
              colture e piante. Interventi e risultati restano collegati anche quando cambiano
              operatori e stagioni.
            </p>
          </div>
          <div className="bg-ortomio-green-50 p-7">
            <h3 className="mb-1 text-sm font-bold text-ortomio-green-700">Tecnici e consulenti</h3>
            <p className="mb-4 font-display text-lg font-bold text-ortomio-green-900">
              Confronta i clienti e prepara ogni visita con il contesto già pronto.
            </p>
            <p className="max-w-sm text-sm text-gray-700">
              Vedi dove approfondire prima di arrivare in azienda e conserva la storia del
              consiglio, dell’esecuzione e del risultato per ogni cliente.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
