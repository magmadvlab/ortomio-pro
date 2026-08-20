import SectionHeader from '../SectionHeader'

export default function AudienceSplit() {
  return (
    <section className="border-b border-ortomio-earth-200 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <SectionHeader index="10" label="audience" />
        <h2 className="mb-8 font-display text-2xl font-extrabold text-ortomio-green-900 sm:text-3xl">
          Costruito per chi lavora la terra e per chi ne guida la crescita.
        </h2>
        <div className="grid overflow-hidden rounded-md border border-ortomio-earth-200 sm:grid-cols-2">
          <div className="border-b border-ortomio-earth-200 p-7 sm:border-b-0 sm:border-r">
            <h3 className="mb-1 text-sm font-bold text-ortomio-green-700">Aziende agricole · Una regia unica per tutta la squadra</h3>
            <p className="mb-4 font-display text-lg font-bold text-ortomio-green-900">
              Elimina il passaggio di consegne a voce o su carta.
            </p>
            <p className="max-w-sm text-sm text-gray-700">
              Chi pianifica, chi lavora nei filari e chi controlla i registri condivide lo stesso
              quadro operativo: la storia di ogni lotto, filare e pianta resta protetta e
              accessibile, anche al cambio di stagione o di personale.
            </p>
          </div>
          <div className="bg-ortomio-green-50 p-7">
            <h3 className="mb-1 text-sm font-bold text-ortomio-green-700">Agronomi e consulenti · Valorizza ogni visita sul campo</h3>
            <p className="mb-4 font-display text-lg font-bold text-ortomio-green-900">
              Prepara ogni sopralluogo in un clic, monitora da remoto.
            </p>
            <p className="max-w-sm text-sm text-gray-700">
              Monitora lo stato delle aziende clienti da remoto e dimostra l’impatto dei tuoi
              consigli agronomici con dati chiari, aumentando l’autorevolezza della tua consulenza.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
