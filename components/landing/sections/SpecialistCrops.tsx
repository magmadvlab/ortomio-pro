'use client'

import Image from 'next/image'
import { Reveal } from '../motion'
import SectionHeader from '../SectionHeader'
import { specialistCrops } from '../content'

export default function SpecialistCrops() {
  return (
    <section id="colture" className="bg-ortomio-green-900 text-white">
      <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
        <div className="relative min-h-[30rem] overflow-hidden lg:min-h-full"><Image src="/landing/vineyard-rows.webp" alt="Filari di vigneto che seguono il profilo del terreno" fill sizes="100vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-ortomio-green-900/50 via-transparent to-transparent" /></div>
        <div className="px-6 py-20 sm:px-12 sm:py-28 lg:px-16">
          <Reveal className="max-w-3xl"><SectionHeader index="09" label="verticals" dark /><p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-ortomio-harvest">Colture e contesti</p><h2 className="font-display text-3xl font-extrabold leading-tight sm:text-5xl">Non pagine generiche: verticali con i dati del tuo mestiere.</h2><p className="mt-6 text-lg leading-relaxed text-ortomio-green-100">Pianificazione, interventi e risultati cambiano con il modello della coltura: dalle orticole ai verticali legnosi, con gli indicatori che chi lavora in campo riconosce.</p></Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">{specialistCrops.map((crop,index)=><article key={crop.id} className="border border-white/15 bg-white/5 p-5"><span className="font-mono text-xs text-ortomio-harvest">0{index+1}</span><h3 className="mt-2 font-display text-xl font-bold">{crop.label}</h3><p className="mt-1 text-xs font-semibold text-ortomio-green-200">{crop.proof}</p><p className="mt-3 text-sm leading-relaxed text-ortomio-green-100">{crop.detail}</p></article>)}</div>
        </div>
      </div>
    </section>
  )
}
