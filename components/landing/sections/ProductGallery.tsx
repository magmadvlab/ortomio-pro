'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'

const GALLERY = [
  {
    id: 'orchard',
    src: '/landing/orchard.webp',
    alt: 'Schermata OrtoMio: gestione di 273 alberi in un frutteto, organizzati per fila e posizione, con stato di vigoria di ogni pianta',
    title: '273 alberi, ognuno con la sua storia',
    text: 'Ogni albero ha fila, posizione e stato di vigoria, letti pianta per pianta.',
  },
  {
    id: 'plants',
    src: '/landing/plants.webp',
    alt: 'Schermata OrtoMio: monitoraggio piante con 231 piante sane e 29 malate su un totale di 273, sincronizzazione al 100%',
    title: 'Sano o malato, per ogni pianta',
    text: '231 sane, 29 da controllare. Il sistema separa i numeri: sai sempre dove intervenire.',
  },
  {
    id: 'briefing-ai',
    src: '/landing/briefing-ai.webp',
    alt: 'Schermata OrtoMio: briefing giornaliero AI con azione consigliata, ROI stimato di 1043 euro e impatto netto calcolato',
    title: 'Ogni consiglio, con il suo perché',
    text: 'Costo, ritardo, impatto netto stimato: ogni consiglio nasce da un calcolo che puoi aprire e verificare.',
  },
  {
    id: 'consigli-ai',
    src: '/landing/consigli-ai.webp',
    alt: 'Schermata OrtoMio: elenco di consigli AI con livello di priorità e percentuale di confidenza per ciascun suggerimento',
    title: 'Suggerimenti ordinati per quanto dato hanno dietro',
    text: 'Rotazione, nutrizione, filare per filare: chi ha più dati misurati sale in cima, gli altri ti dicono cosa manca per confermarli.',
  },
  {
    id: 'semenzaio',
    src: '/landing/semenzaio.webp',
    alt: 'Schermata OrtoMio: gestione semenzaio con batch di pomodori, 10 piantine e sopravvivenza al 100%',
    title: 'Dal seme al trapianto',
    text: 'Lotto, germinazione, sopravvivenza: il semenzaio resta collegato a ciò che nasce in campo.',
  },
  {
    id: 'intervento',
    src: '/landing/intervento.webp',
    alt: 'Schermata OrtoMio: registrazione di un intervento su una singola pianta (pomodoro datterino) tramite l’orchestratore interventi, con campi prodotto, note e pulsante salva intervento',
    title: 'Ogni pianta ha il suo diario',
    text: 'Irrigazione, concimazione, trattamento: ogni intervento finisce sulla scheda di quella pianta, pronto da riusare.',
  },
] as const

export default function ProductGallery() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Array<HTMLElement | null>>([])
  const [activeIndex, setActiveIndex] = useState(0)

  const onScroll = () => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const scrollerCenter = scroller.scrollLeft + scroller.clientWidth / 2
    let closest = 0
    let closestDistance = Infinity
    cardRefs.current.forEach((card, index) => {
      if (!card) return
      const cardCenter = card.offsetLeft + card.offsetWidth / 2
      const distance = Math.abs(cardCenter - scrollerCenter)
      if (distance < closestDistance) {
        closestDistance = distance
        closest = index
      }
    })
    setActiveIndex(closest)
  }

  const scrollToIndex = (index: number) => {
    cardRefs.current[index]?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
  }

  return (
    <section className="border-b border-ortomio-earth/30 bg-white px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-ortomio-green-700">
            L&rsquo;applicazione
          </p>
          <h2 className="font-display text-3xl font-extrabold leading-tight text-ortomio-green-900 sm:text-5xl">
            Ogni pianta ha fila, posizione e una storia propria: dalla semina al raccolto.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-700">
            Queste schermate arrivano da un&rsquo;azienda che usa OrtoMio ogni giorno: alberi, piante,
            consigli, semenzaio e interventi, con i numeri veri che il sistema mostra a chi lavora in campo.
          </p>
        </div>

        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="mt-14 -mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 [scrollbar-width:thin] sm:mx-0 sm:px-0"
          role="list"
        >
          {GALLERY.map(({ id, src, alt, title, text }, index) => (
            <article
              key={id}
              ref={(el) => { cardRefs.current[index] = el }}
              role="listitem"
              className="w-[85%] flex-none snap-start border border-ortomio-earth/30 bg-ortomio-paper sm:w-[60%] lg:w-[38%]"
            >
              <figure className="relative aspect-[16/10] overflow-hidden border-b border-ortomio-earth/30 bg-ortomio-green-50">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  sizes="(min-width: 1024px) 38vw, (min-width: 640px) 60vw, 85vw"
                  className="object-cover object-top"
                />
              </figure>
              <div className="p-6">
                <h3 className="font-display text-lg font-bold text-ortomio-green-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-700">{text}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex gap-2" role="tablist" aria-label="Schermata selezionata">
            {GALLERY.map(({ id }, index) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={`Vai alla schermata ${index + 1} di ${GALLERY.length}`}
                onClick={() => scrollToIndex(index)}
                className={
                  index === activeIndex
                    ? 'h-2 w-6 bg-ortomio-green-700 transition-all'
                    : 'h-2 w-2 bg-ortomio-earth-200 transition-all hover:bg-ortomio-earth-300'
                }
              />
            ))}
          </div>
          <span className="font-mono text-xs text-gray-500" aria-hidden="true">
            {activeIndex + 1} / {GALLERY.length}
          </span>
        </div>
      </div>
    </section>
  )
}
