'use client'

import { useState } from 'react'

const TABS = ['Panoramica', 'Dati usati', 'Calcoli', 'Alternative'] as const

const CALC_ROWS: Array<[string, string]> = [
  ['baseScore', '62'],
  ['+ confidenza segnali disponibili', '+9'],
  ['+ copertura segnali P0', '+6'],
  ['+ bonus fase critica', '+8'],
  ['+ fonte profilo (plant_id)', '+4'],
]

const TAB_CONTENT: Record<(typeof TABS)[number], React.ReactNode> = {
  Panoramica: (
    <p className="text-sm text-gray-700">
      OrtoMio propone di intervenire ora su questa zona perché il punteggio agronomico è alto
      e il ritardo avrebbe un costo economico stimato superiore al beneficio di aspettare.
    </p>
  ),
  'Dati usati': (
    <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
      <li>Storico irrigazioni e trattamenti della zona (misurato)</li>
      <li>Profilo colturale riconosciuto tramite <code className="font-mono text-xs">plant_id</code> (misurato)</li>
      <li>Previsione meteo a 72 ore (stimato)</li>
      <li>Umidità del suolo in tempo reale — segnale non disponibile su questa zona (assente)</li>
    </ul>
  ),
  Calcoli: null, // rendered by the existing calc-block below, not through this map
  Alternative: (
    <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
      <li><strong>Rimandare al prossimo ciclo</strong> — scartata: il costo del ritardo supera il valore protetto stimato.</li>
      <li><strong>Solo monitorare</strong> — scartata: la copertura dei segnali critici è sufficiente per agire, non solo osservare.</li>
    </ul>
  ),
}

export default function PillarTransparency() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('Calcoli')

  return (
    <section className="border-b border-ortomio-earth-200 px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-4 font-display text-2xl font-extrabold text-ortomio-green-900 sm:text-3xl">
          Non &quot;fidati di noi&quot;. Apri il pannello di trasparenza.
        </h2>
        <p className="mb-6 max-w-2xl text-gray-700">
          Ogni suggerimento AI si può aprire in un pannello dedicato — non una demo isolata, il
          componente reale che accompagna ogni proposta nel prodotto.
        </p>

        <div className="mb-6 flex flex-nowrap gap-1 overflow-x-auto border-b border-ortomio-earth-200 font-mono text-sm">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              aria-selected={tab === activeTab}
              className={
                tab === activeTab
                  ? 'shrink-0 whitespace-nowrap border-b-2 border-ortomio-green-600 px-3 py-2 font-bold text-ortomio-green-700'
                  : 'shrink-0 whitespace-nowrap px-3 py-2 text-gray-400 hover:text-gray-600'
              }
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab !== 'Calcoli' && <div className="mb-6">{TAB_CONTENT[activeTab]}</div>}

        {activeTab === 'Calcoli' && (
          <div className="rounded-md border border-ortomio-earth-200 bg-ortomio-green-50 p-5">
            <div className="mb-3 font-mono text-xs uppercase tracking-wide text-gray-500">
              tab &quot;calcoli&quot; — esempio illustrativo, meccanismo reale
            </div>
            {CALC_ROWS.map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-dashed border-ortomio-earth-200 py-1.5 font-mono text-sm">
                <span className="text-gray-600">{label}</span>
                <span className="font-bold text-ortomio-green-700">{value}</span>
              </div>
            ))}
            <div className="flex justify-between border-b border-dashed border-ortomio-earth-200 py-1.5 font-mono text-sm">
              <span className="text-gray-600">subtotale</span>
              <span className="font-bold text-ortomio-green-700">89</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-ortomio-earth-200 py-1.5 font-mono text-sm">
              <span className="text-gray-600">lettura economica (ROI alto → soglia minima)</span>
              <span className="text-gray-500">≥75</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-ortomio-green-900 pt-2 font-mono text-base font-bold text-ortomio-green-900">
              <span>punteggio finale</span>
              <span>89/100</span>
            </div>
            <div className="mt-1 flex justify-between font-mono text-sm">
              <span className="text-gray-600">confidenza dichiarata</span>
              <span className="font-bold">0.84</span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
