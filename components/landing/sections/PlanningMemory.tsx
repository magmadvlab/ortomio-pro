export default function PlanningMemory() {
  return (
    <section className="bg-white px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-ortomio-green-700">Pianificazione</p>
            <h2 className="font-display text-3xl font-extrabold leading-tight text-ortomio-green-900 sm:text-5xl">Due modi di pianificare. Un solo piano che ricorda gli esiti.</h2>
          </div>
          <p className="self-end text-lg leading-relaxed text-gray-700">Le regole agronomiche deterministiche e la lettura predittiva lavorano sullo stesso anno colturale. Rese, costi e risultati registrati permettono di confrontare previsione ed esito e preparare correzioni per il ciclo successivo.</p>
        </div>
        <div className="mt-12 grid border-y border-ortomio-earth/30 md:grid-cols-2 md:divide-x md:divide-ortomio-earth/30">
          <article className="py-8 md:pr-10"><span className="font-mono text-xs text-ortomio-harvest">01 · CLASSICO</span><h3 className="mt-4 font-display text-2xl font-bold text-ortomio-green-900">Regole leggibili riga per riga</h3><p className="mt-3 leading-relaxed text-gray-700">Rotazioni, motivazioni botaniche, avvisi e finestre di semina costruiscono una base prevedibile e verificabile.</p></article>
          <article className="py-8 md:pl-10"><span className="font-mono text-xs text-ortomio-harvest">02 · ASSISTITO</span><h3 className="mt-4 font-display text-2xl font-bold text-ortomio-green-900">Scenari, rischio e sostenibilità economica</h3><p className="mt-3 leading-relaxed text-gray-700">Scaglionamento, investimento, ricavo atteso e rischi tipizzati aiutano a valutare alternative calibrate sul contesto aziendale. Funzione in beta.</p></article>
        </div>
      </div>
    </section>
  )
}
