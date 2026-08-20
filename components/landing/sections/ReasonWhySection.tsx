'use client'

import { motion, staggerItem } from '../motion'
import SectionHeader from '../SectionHeader'

const SCORING_FACTORS = [
  [
    'Confidenza dei dati',
    'I dati misurati dai tuoi sensori hanno sempre priorità. Se un valore è stimato, il sistema lo dichiara chiaramente.',
  ],
  [
    'Copertura dei segnali',
    'Satellite, suolo a tre profondità, acqua e stato della pianta. Più segnali reali raccogli, più precisa è la raccomandazione — e ti segnala subito cosa manca per affinarla.',
  ],
  [
    'Fase fenologica e GDD',
    'Gradi giorno accumulati e stadio di sviluppo della coltura: lo stesso intervento pesa di più in un momento delicato.',
  ],
  [
    'Pressione ambientale',
    'Stress idrico, sbalzi termici e rischio malattie degli ultimi giorni guidano le priorità su irrigazione, nutrizione e difesa.',
  ],
  [
    'Risposta reale del terreno',
    'OrtoMio impara dal tuo campo: la risposta registrata dopo gli interventi precedenti calibra le proposte di oggi.',
  ],
  [
    'Impatto economico',
    'Costi e benefici a confronto: il sistema stima le perdite potenziali, così sai quanto costa rinviare o non intervenire.',
  ],
] as const

type ScoringFactor = (typeof SCORING_FACTORS)[number]

function FactorRow({ factors, startIndex, separated }: { factors: ScoringFactor[]; startIndex: number; separated: boolean }) {
  return (
    <div className={`grid md:grid-cols-3 md:divide-x md:divide-ortomio-earth/30 ${separated ? 'border-b border-ortomio-earth/30' : ''}`}>
      {factors.map(([title, text], index) => (
        <motion.article
          key={title}
          variants={staggerItem()}
          className={`py-8 md:px-8 md:first:pl-0 md:last:pr-0 ${separated ? 'border-b border-ortomio-earth/30 md:border-b-0' : ''}`}
        >
          <span className="font-mono text-xs font-bold text-ortomio-green-700">
            {String(startIndex + index + 1).padStart(2, '0')}
          </span>
          <h3 className="mt-5 font-display text-2xl font-bold text-ortomio-green-900">{title}</h3>
          <p className="mt-3 leading-relaxed text-gray-700">{text}</p>
        </motion.article>
      ))}
    </div>
  )
}

export default function ReasonWhySection() {
  return (
    <section id="perche-ortomio" className="border-b border-ortomio-earth/30 bg-ortomio-earth-50 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeader index="01" label="score" />
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <h2 className="font-display text-4xl font-extrabold leading-tight text-ortomio-green-900 sm:text-5xl">
            Niente più dubbi su cosa fare prima: OrtoMio ti mostra le priorità del giorno, spiegate passo dopo passo.
          </h2>
          <p className="max-w-2xl text-lg leading-relaxed text-gray-700">
            Ogni proposta nasce da un calcolo esplicito: il sistema combina profilo colturale,
            fenologia, pressione ambientale e storia dei tuoi interventi, e il punteggio finale
            somma fattori che puoi leggere uno a uno. Margine di errore azzerato: decidi vedendo
            gli stessi numeri che ha visto il sistema.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
          className="mt-14 border-y border-ortomio-earth/30"
        >
          <FactorRow factors={SCORING_FACTORS.slice(0, 3)} startIndex={0} separated />
          <FactorRow factors={SCORING_FACTORS.slice(3)} startIndex={3} separated={false} />
        </motion.div>
      </div>
    </section>
  )
}
