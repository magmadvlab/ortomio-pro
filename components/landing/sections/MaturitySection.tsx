import { landingContent } from '../content'

export default function MaturitySection() {
  return (
    <section id="maturita" className="bg-ortomio-paper px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr]">
          <div><p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-ortomio-harvest">Maturità verificabile</p><h2 className="mt-5 font-display text-4xl font-extrabold leading-tight sm:text-5xl">Una piattaforma valutabile funzione per funzione.</h2><p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-700">OrtoMio espone nell’interfaccia lo stato delle proprie capacità. La release attuale è una candidate tecnica; la validazione commerciale 1.0 richiede pilot reali e prove in produzione.</p><p className="mt-6 border-l-2 border-ortomio-harvest pl-4 font-mono text-xs font-bold uppercase tracking-wider text-ortomio-green-900">{landingContent.commercialState}</p></div>
          <div className="divide-y divide-ortomio-earth/20 border-y border-ortomio-earth/20">
            {[['15','Stabili','Utilizzo pieno nelle condizioni documentate.'],['14','Beta','Complete in locale, in attesa delle evidenze previste in produzione.'],['2','In simulazione','Drone e blockchain restano laboratori isolati.']].map(([value,label,text]) => <div key={label} className="grid grid-cols-[4rem_1fr] gap-5 py-6"><span className="font-display text-4xl font-extrabold text-ortomio-green-700">{value}</span><div><h3 className="font-bold">{label}</h3><p className="mt-1 text-sm leading-relaxed text-gray-600">{text}</p></div></div>)}
          </div>
        </div>
      </div>
    </section>
  )
}
