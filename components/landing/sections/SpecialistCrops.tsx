import Image from 'next/image'
import { specialistCrops } from '../content'

export default function SpecialistCrops() {
  return (
    <section id="colture" className="bg-ortomio-green-900 text-white">
      <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
        <div className="relative min-h-[30rem] overflow-hidden lg:min-h-full"><Image src="/landing/vineyard-rows.webp" alt="Filari di vigneto che seguono il profilo del terreno" fill sizes="(min-width: 1024px) 36vw, 100vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-ortomio-green-900/50 via-transparent to-transparent" /></div>
        <div className="px-6 py-20 sm:px-12 sm:py-28 lg:px-16">
          <div className="max-w-3xl"><p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-ortomio-harvest">Colture e contesti</p><h2 className="font-display text-3xl font-extrabold leading-tight sm:text-5xl">Lo stesso controllo, su misura per la coltura che segui.</h2><p className="mt-6 text-lg leading-relaxed text-ortomio-green-100">OrtoMio collega pianificazione, interventi e risultati, adattandoli alle esigenze di orticole, vigneti, oliveti, frutteti e vivai.</p></div>
          <div className="mt-12 divide-y divide-white/15 border-y border-white/15">{specialistCrops.map((crop,index)=><article key={crop.id} className="grid gap-3 py-6 md:grid-cols-[2.5rem_1fr_1.25fr] md:gap-5"><span className="font-mono text-xs text-ortomio-harvest">0{index+1}</span><div><h3 className="font-display text-xl font-bold">{crop.label}</h3><p className="mt-1 text-xs font-semibold text-ortomio-green-200">{crop.proof}</p></div><p className="text-sm leading-relaxed text-ortomio-green-100">{crop.detail}</p></article>)}</div>
        </div>
      </div>
    </section>
  )
}
