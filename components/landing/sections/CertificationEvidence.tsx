import SectionHeader from '../SectionHeader'

const CERTIFICATION_EVIDENCE = [
  'Registro dei trattamenti e ingressi',
  'Tracciabilità del lotto e del raccoglitore',
  'Autocontrolli e valutazione rischi',
  'Prontezza nei richiami e audit',
] as const

export default function CertificationEvidence() {
  return (
    <section className="border-b border-ortomio-earth/30 bg-ortomio-green-50 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeader index="07" label="compliance" />
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-ortomio-green-700">
              Cosa trovi già organizzato nel tuo archivio
            </p>
            <h2 className="font-display text-3xl font-extrabold leading-tight text-ortomio-green-900 sm:text-5xl">
              I tuoi dati di campo già pronti per ispezioni e certificazioni.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-700">
              Elimina lo stress da burocrazia e le corse a fine stagione. OrtoMio trasforma ogni
              operazione quotidiana in documentazione pronta all’uso per il biologico,
              GlobalG.A.P. e per i controlli di filiera. Tutto viene archiviato all’istante,
              esattamente nel momento in cui viene fatto in campo.
            </p>
          </div>

          <div>
            <ol className="divide-y divide-ortomio-earth/30 border-y border-ortomio-earth/30">
              {CERTIFICATION_EVIDENCE.map((item, index) => (
                <li key={item} className="grid grid-cols-[2.5rem_1fr] gap-4 py-4">
                  <span className="font-mono text-xs font-bold text-ortomio-green-700">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="font-semibold leading-relaxed text-ortomio-green-900">
                    {item}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-6 border-l-2 border-ortomio-harvest pl-4 text-sm leading-relaxed text-gray-700">
              <strong className="text-ortomio-green-900">Nota di trasparenza.</strong> OrtoMio
              compila e organizza automaticamente tutte le bozze documentali basandosi sui tuoi
              dati di campo. La verifica finale e il rilascio ufficiale della certificazione
              restano a cura dell’ente di controllo preposto.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
