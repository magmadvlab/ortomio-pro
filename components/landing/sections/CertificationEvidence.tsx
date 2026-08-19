import SectionHeader from '../SectionHeader'

const CERTIFICATION_EVIDENCE = [
  'Lavorazioni e prodotti utilizzati',
  'Lotto, pianta, raccolto e destinazione',
  'Autocontrolli e gestione dei rischi',
  'Procedure di richiamo e documenti di supporto',
  'Bozze AI da completare e verificare',
] as const

export default function CertificationEvidence() {
  return (
    <section className="border-b border-ortomio-earth/30 bg-ortomio-green-50 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeader index="07" label="compliance" />
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-ortomio-green-700">
              Registri e certificazioni
            </p>
            <h2 className="font-display text-3xl font-extrabold leading-tight text-ortomio-green-900 sm:text-5xl">
              Il lavoro che registri oggi è la prova che ti serve domani.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-700">
              OrtoMio prepara e organizza le evidenze utili ai percorsi per il biologico e
              GlobalG.A.P., collegando il lavoro svolto in campo ai registri e ai documenti
              dell’azienda. Ogni evidenza resta collegata alla lavorazione che l’ha generata:
              vedi subito cosa è già documentato e cosa deve essere completato.
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
              Le bozze AI iniziali da completare e verificare sono un punto di partenza. La decisione resta al responsabile; valutazione e rilascio restano alle persone e agli organismi competenti.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
