export default function PlanningMemory() {
  return (
    <section className="bg-white px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-ortomio-green-700">Pianificazione</p>
            <h2 className="font-display text-3xl font-extrabold leading-tight text-ortomio-green-900 sm:text-5xl">Il piano non finisce quando comincia la stagione.</h2>
          </div>
          <p className="self-end text-lg leading-relaxed text-gray-700">Le regole agronomiche formano la base; l’AI aiuta a confrontare scenari e alternative. Il responsabile mantiene il controllo e sceglie come costruire il piano aziendale.</p>
        </div>
        <div className="mt-12 grid border-y border-ortomio-earth/30 md:grid-cols-2 md:divide-x md:divide-ortomio-earth/30">
          <article className="py-8 md:pr-10"><span className="font-mono text-xs text-ortomio-green-700">01 · REGOLE AGRONOMICHE</span><h3 className="mt-4 font-display text-2xl font-bold text-ortomio-green-900">Pianificazione agronomica</h3><p className="mt-3 leading-relaxed text-gray-700">Rotazioni, famiglie botaniche, periodi di semina e compatibilità costruiscono una base chiara, con la motivazione di ogni indicazione.</p></article>
          <article className="py-8 md:pl-10"><span className="font-mono text-xs text-ortomio-green-700">02 · CONFRONTO SCENARI</span><h3 className="mt-4 font-display text-2xl font-bold text-ortomio-green-900">Pianificazione assistita dall’AI</h3><p className="mt-3 leading-relaxed text-gray-700">Confronti periodi, scaglionamento, investimento e ricavo potenziale, considerando rischi legati a meteo, malattie e ritardi prima di decidere.</p></article>
        </div>
        <p className="mt-8 max-w-3xl text-lg leading-relaxed text-gray-700">Quando la stagione procede, rese e costi registrati si confrontano con il piano per preparare il ciclo successivo.</p>
      </div>
    </section>
  )
}
