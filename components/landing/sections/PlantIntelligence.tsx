const PLANT_AI = [
  [
    'Analisi fotografica',
    'Esposizione, salute, ritmo di crescita e fase fenologica: dalla foto dell’appezzamento o della singola pianta, con la confidenza dichiarata.',
  ],
  [
    'Allerte salute',
    'Rischio malattia dal meteo, parassiti stagionali, deficit idrico e soglie dei sensori: l’attenzione arriva prima del danno.',
  ],
  [
    'Storia per individuo',
    'Codice, filare, posizione: potature, trattamenti e raccolte restano legati alla pianta, non alla media dell’appezzamento.',
  ],
] as const

export default function PlantIntelligence() {
  return (
    <section className="border-b border-ortomio-earth/30 bg-white px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-ortomio-green-700">
            Piante e alberi
          </p>
          <h2 className="font-display text-4xl font-extrabold leading-tight text-ortomio-green-900 sm:text-5xl">
            Ogni pianta ha un codice, una storia — e un occhio AI.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-700">
            Scatta una foto: OrtoMio la analizza per esposizione solare, stato di salute, ritmo di
            crescita e fase. Ogni pianta e ogni albero mantiene codice, posizione, varietà e la
            sequenza di ciò che ha ricevuto e prodotto.
          </p>
        </div>

        <div className="mt-14 grid border-y border-ortomio-earth/30 md:grid-cols-3 md:divide-x md:divide-ortomio-earth/30">
          {PLANT_AI.map(([title, text], index) => (
            <article
              key={title}
              className="border-b border-ortomio-earth/30 py-8 last:border-b-0 md:border-b-0 md:px-8 md:first:pl-0 md:last:pr-0"
            >
              <span className="font-mono text-xs font-bold text-ortomio-green-700">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-4 font-display text-2xl font-bold text-ortomio-green-900">
                {title}
              </h3>
              <p className="mt-4 leading-relaxed text-gray-700">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
