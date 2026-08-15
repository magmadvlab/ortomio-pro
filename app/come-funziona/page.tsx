import type { Metadata } from 'next'
import Link from 'next/link'
import LandingHeader from '@/components/landing/LandingHeader'
import LandingFooter from '@/components/landing/LandingFooter'
import { documentationLinks, orchestratorSignals, specialistCrops } from '@/components/landing/content'

export const metadata: Metadata = {
  title: 'Come funziona OrtoMio | Decisioni agronomiche verificabili',
  description: 'Scopri come OrtoMio collega dati di campo, priorità, attività ed esiti per aziende agricole e consulenti agronomici.',
  alternates: { canonical: '/come-funziona' },
}

const chapters = [
  { number: '01', title: 'Dal segnale al briefing', text: 'Ogni dato viene collegato a un contesto preciso: azienda, zona, coltura, fase agronomica e momento operativo. Il briefing ordina ciò che merita attenzione e mostra la ragione della priorità.' },
  { number: '02', title: 'Dati con una provenienza visibile', text: 'Misurato, stimato, assente e simulato rimangono stati distinti. Il livello di affidabilità accompagna la lettura e permette al responsabile di valutare la solidità del suggerimento.' },
  { number: '03', title: 'Decisione, esecuzione ed esito', text: 'Il sistema conserva il contesto della scelta, collega il task eseguito e registra il risultato osservato. Questa storia rende confrontabili previsione e realtà.' },
  { number: '04', title: 'Pianificazione che ricorda', text: 'Regole agronomiche e scenari assistiti confluiscono in un piano annuale. Rese e costi registrati permettono di preparare correzioni per il ciclo successivo.' },
] as const

export default function ComeFunzionaPage() {
  return (
    <div className="min-h-screen bg-ortomio-paper text-ortomio-green-900">
      <LandingHeader />
      <main>
        <header className="bg-ortomio-green-900 px-6 py-24 text-white sm:py-32">
          <div className="mx-auto max-w-5xl"><p className="font-mono text-xs uppercase tracking-[0.2em] text-ortomio-harvest">Dentro OrtoMio</p><h1 className="mt-6 max-w-4xl font-display text-5xl font-extrabold leading-tight sm:text-7xl">Una decisione si può usare meglio quando si può ricostruire.</h1><p className="mt-8 max-w-2xl text-lg leading-relaxed text-ortomio-green-100">Questa guida raccoglie i meccanismi che trasformano osservazioni, attività e risultati in una memoria agronomica verificabile.</p></div>
        </header>

        <section className="px-6 py-20 sm:py-28"><div className="mx-auto max-w-5xl divide-y divide-ortomio-earth/20 border-y border-ortomio-earth/20">{chapters.map((chapter) => <article key={chapter.number} className="grid gap-4 py-9 md:grid-cols-[4rem_1fr_1fr]"><span className="font-mono text-xs text-ortomio-harvest">{chapter.number}</span><h2 className="font-display text-2xl font-bold">{chapter.title}</h2><p className="leading-relaxed text-gray-700">{chapter.text}</p></article>)}</div></section>

        <section className="bg-white px-6 py-20 sm:py-28"><div className="mx-auto max-w-5xl"><p className="font-mono text-xs uppercase tracking-[0.2em] text-ortomio-harvest">Cosa coordina</p><h2 className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">Una lettura comune per segnali diversi.</h2><div className="mt-10 grid gap-6 sm:grid-cols-2">{orchestratorSignals.map((signal) => <article key={signal.label} className="border-t-2 border-ortomio-green-600 pt-5"><h3 className="font-bold">{signal.label}</h3><p className="mt-2 text-gray-700">{signal.value}</p></article>)}</div></div></section>

        <section className="px-6 py-20 sm:py-28"><div className="mx-auto max-w-5xl"><p className="font-mono text-xs uppercase tracking-[0.2em] text-ortomio-harvest">Colture specialistiche</p><h2 className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">Dal filare alla singola pianta.</h2><div className="mt-10 grid gap-5 md:grid-cols-2">{specialistCrops.map((crop) => <article key={crop.id} className="border border-ortomio-earth/20 bg-white p-6"><div className="flex justify-between gap-4"><h3 className="font-display text-2xl font-bold">{crop.label}</h3><span className="font-mono text-[10px] uppercase text-ortomio-harvest">{crop.maturity}</span></div><p className="mt-3 font-semibold text-ortomio-green-700">{crop.proof}</p><p className="mt-3 text-sm leading-relaxed text-gray-700">{crop.detail}</p></article>)}</div></div></section>

        <section className="bg-ortomio-green-900 px-6 py-20 text-white sm:py-28"><div className="mx-auto max-w-5xl"><p className="font-mono text-xs uppercase tracking-[0.2em] text-ortomio-harvest">Documentazione completa</p><h2 className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">Approfondisci metodi, flussi e limiti.</h2><div className="mt-10 grid gap-px bg-white/15 sm:grid-cols-2">{documentationLinks.map((item) => <Link key={item.href} href={item.href} className="min-h-32 bg-ortomio-green-900 p-6 transition hover:bg-ortomio-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ortomio-harvest"><h3 className="font-bold">{item.label} →</h3><p className="mt-2 text-sm text-ortomio-green-100">{item.description}</p></Link>)}</div></div></section>
      </main>
      <LandingFooter />
    </div>
  )
}
