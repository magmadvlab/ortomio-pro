import Image from 'next/image'
import { landingContent } from '../content'

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-ortomio-green-900 text-white">
      <div className="mx-auto grid min-h-[82vh] max-w-[96rem] lg:grid-cols-[1.08fr_0.92fr]">
        <div className="flex items-end px-6 py-24 sm:px-12 sm:py-32 lg:px-16">
          <div className="max-w-4xl">
            <p className="mb-6 text-xs font-bold uppercase tracking-[0.22em] text-ortomio-harvest">{landingContent.eyebrow}</p>
            <h1 className="font-display text-5xl font-extrabold leading-[0.98] tracking-[-0.04em] sm:text-7xl lg:text-[5.35rem]">{landingContent.title}</h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ortomio-green-100">{landingContent.summary}</p>
          </div>
        </div>
        <figure className="relative min-h-[28rem] overflow-hidden lg:min-h-full">
          <Image src="/landing/field-decision.webp" alt="Responsabile di vivaio che controlla le colture con un tablet" fill priority sizes="(min-width: 1024px) 46vw, 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ortomio-green-900/50 via-transparent to-transparent" aria-hidden="true" />
        </figure>
      </div>
    </section>
  )
}
