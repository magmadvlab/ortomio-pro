import Link from 'next/link'

export default function ProductFilm() {
  return (
    <section aria-labelledby="product-film-title" className="bg-ortomio-green-900 text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 lg:grid-cols-[minmax(0,.72fr)_minmax(0,1.28fr)] lg:gap-16 lg:px-10 lg:py-28">
        <div>
          <h2 id="product-film-title" className="max-w-xl font-display text-4xl font-bold leading-tight sm:text-5xl">
            Dal segnale alla decisione, senza perdere il perché.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-ortomio-green-100 sm:text-lg">
            Guarda come OrtoMio riunisce priorità, contesto agronomico e memoria operativa per aiutarti a decidere cosa fare oggi e ricostruire ogni scelta domani.
          </p>
          <Link
            href="#prova-guidata"
            className="mt-8 inline-flex min-h-12 items-center justify-center bg-ortomio-harvest px-6 py-3 font-bold text-ortomio-green-900 transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Prenota la tua prova guidata
          </Link>
        </div>

        <figure className="m-0">
          <div className="overflow-hidden border border-white/20 bg-black shadow-[0_28px_80px_rgba(0,0,0,.28)]">
            <video
              className="block aspect-video w-full object-cover"
              controls
              playsInline
              preload="metadata"
              poster="/video/ortomio-orchestratore-poster.webp"
              aria-label="Video: OrtoMio come orchestratore delle decisioni agronomiche"
            >
              <source src="/video/ortomio-orchestratore.mp4" type="video/mp4" />
              Il browser non supporta la riproduzione video.
            </video>
          </div>
          <figcaption className="mt-3 text-sm text-ortomio-green-200">OrtoMio in 46 secondi.</figcaption>
        </figure>
      </div>
    </section>
  )
}
