import SectionHeader from '../SectionHeader'

export default function PlanningMemory() {
  return (
    <section className="bg-white px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
          <SectionHeader index="08" label="planning" />
          <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-ortomio-green-700">Come nasce il tuo piano colturale</p>
            <h2 className="font-display text-3xl font-extrabold leading-tight text-ortomio-green-900 sm:text-5xl">Pianificazione dinamica: le regole dell’agronomo, la potenza dell’AI.</h2>
          </div>
          <p className="self-end text-lg leading-relaxed text-gray-700">Il piano colturale non è un foglio di carta che si chiude a inizio stagione. OrtoMio combina le buone pratiche agronomiche con la simulazione di scenari previsionali, aiutandoti a pianificare ogni mossa, valutare i margini e correggere la rotta in tempo reale.</p>
        </div>
        <div className="mt-12 grid border-y border-ortomio-earth/30 md:grid-cols-2 md:divide-x md:divide-ortomio-earth/30">
          <article className="py-8 md:pr-10"><span className="font-mono text-xs text-ortomio-green-700">01 · BASE AGRONOMICA CERTIFICATA</span><h3 className="mt-4 font-display text-2xl font-bold text-ortomio-green-900">Pianificazione agronomica</h3><p className="mt-3 leading-relaxed text-gray-700">Imposta subito rotazioni corrette, compatibilità tra famiglie botaniche, epoche di semina e distanze di trapianto. Ogni suggerimento è accompagnato dalla motivazione agronomica che lo giustifica.</p></article>
          <article className="py-8 md:pl-10"><span className="font-mono text-xs text-ortomio-green-700">02 · SIMULAZIONE DI SCENARI CON AI</span><h3 className="mt-4 font-display text-2xl font-bold text-ortomio-green-900">Pianificazione assistita dall’AI</h3><p className="mt-3 leading-relaxed text-gray-700">Metti a confronto diverse finestre di trapianto, strategie di scaglionamento, costi di produzione e stime di ricavo. L’AI calcola l’impatto dei rischi climatici e delle malattie prima ancora di mettere la prima pianta a dimora.</p></article>
        </div>
        <p className="mt-8 max-w-3xl text-lg leading-relaxed text-gray-700"><strong className="text-ortomio-green-900">03 · Riconciliazione e apprendimento continuo.</strong> Man mano che la stagione avanza, il sistema confronta le rese e i costi reali con quelli preventivati. Impari cosa ha reso di più per pianificare la stagione successiva con margini sempre migliori.</p>
      </div>
    </section>
  )
}
