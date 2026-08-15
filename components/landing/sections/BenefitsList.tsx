import { Check } from 'lucide-react'

const BENEFITS = [
  'Dove serve attenzione prima di organizzare la giornata.',
  'Perché viene proposto un intervento.',
  'Cosa ha ricevuto ogni pianta e come ha risposto.',
  'Come piano, lavorazioni, costi e raccolto si confrontano.',
  'Quali informazioni sono pronte per registri e certificazioni.',
  'Come la storia aziendale continua tra una stagione e la successiva.',
] as const

export default function BenefitsList() {
  return (
    <section className="border-b border-ortomio-earth-200 px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-8 font-display text-2xl font-extrabold text-ortomio-green-900 sm:text-3xl">
          Cosa puoi verificare
        </h2>
        <ul className="divide-y divide-ortomio-earth-200 border-t border-ortomio-earth-200">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-3 py-4 text-gray-800">
              <Check className="mt-1 h-5 w-5 flex-shrink-0 text-ortomio-green-600" aria-hidden="true" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
