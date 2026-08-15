'use client'

import { useState } from 'react'

const TABS = ['Panoramica', 'Dati usati', 'Calcoli', 'Alternative'] as const
type Tab = (typeof TABS)[number]

const CALC_ROWS: Array<[string, string]> = [
  ['Punteggio di partenza', '62'],
  ['+ Qualità dei dati disponibili', '+9'],
  ['+ Completezza dei segnali critici', '+6'],
  ['+ Momento della stagione (fase critica)', '+8'],
  ['+ Precisione del riconoscimento della pianta', '+4'],
]

const TAB_CONTENT: Record<Tab, React.ReactNode> = {
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
  Calcoli: null, // rendered by the calc-block below, not through this map
  Alternative: (
    <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
      <li><strong>Rimandare al prossimo ciclo</strong> — scartata: il costo del ritardo supera il valore protetto stimato.</li>
      <li><strong>Solo monitorare</strong> — scartata: la copertura dei segnali critici è sufficiente per agire, non solo osservare.</li>
    </ul>
  ),
}

export default function PillarTransparency() {
  const [activeTab, setActiveTab] = useState<Tab>('Panoramica')

  const onKeyDown = (e: React.KeyboardEvent) => {
    const idx = TABS.indexOf(activeTab)
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const next = TABS[(idx + 1) % TABS.length]
      setActiveTab(next)
      document.getElementById(`transparency-tab-${TABS.indexOf(next)}`)?.focus()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const prev = TABS[(idx - 1 + TABS.length) % TABS.length]
      setActiveTab(prev)
      document.getElementById(`transparency-tab-${TABS.indexOf(prev)}`)?.focus()
    }
  }

  const activeIndex = TABS.indexOf(activeTab)

  return (
    <section className="border-b border-ortomio-earth-200 px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-4 font-display text-2xl font-extrabold text-ortomio-green-900 sm:text-3xl">
          Ogni consiglio nasce da un&apos;analisi che puoi controllare.
        </h2>
        <p className="mb-6 max-w-2xl text-gray-700">
          Prima di proporti un intervento, OrtoMio valuta dati, stagione e convenienza
          economica. Tocchi il consiglio e vedi come è nato: quali dati ha usato (e quali
          mancavano), come è arrivato al punteggio, cosa ha scartato e perché. Non una demo
          costruita per il sito: è quello che leggi su ogni consiglio, tutti i giorni,
          nell&apos;app.
        </p>

        <div
          role="tablist"
          aria-label="Dettaglio del consiglio"
          onKeyDown={onKeyDown}
          className="mb-2 flex flex-nowrap gap-1 overflow-x-auto border-b border-ortomio-earth-200 text-sm"
        >
          {TABS.map((tab, i) => (
            <button
              key={tab}
              id={`transparency-tab-${i}`}
              type="button"
              role="tab"
              aria-selected={tab === activeTab}
              aria-controls={`transparency-panel-${i}`}
              tabIndex={tab === activeTab ? 0 : -1}
              onClick={() => setActiveTab(tab)}
              className={
                tab === activeTab
                  ? 'shrink-0 whitespace-nowrap border-b-2 border-ortomio-green-600 px-3 py-2.5 font-bold text-ortomio-green-700'
                  : 'shrink-0 whitespace-nowrap px-3 py-2.5 text-gray-600 hover:text-ortomio-green-700'
              }
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab !== 'Calcoli' && (
          <div
            id={`transparency-panel-${activeIndex}`}
            role="tabpanel"
            aria-labelledby={`transparency-tab-${activeIndex}`}
            className="mb-6"
          >
            {TAB_CONTENT[activeTab]}
          </div>
        )}

        {activeTab === 'Calcoli' && (
          <div
            id="transparency-panel-2"
            role="tabpanel"
            aria-labelledby="transparency-tab-2"
            className="rounded-md border border-ortomio-earth-200 bg-ortomio-green-50 p-5"
          >
            <p className="mb-3 text-sm text-gray-600">
              Esempio illustrativo: valori dimostrativi, meccanismo reale del pannello.
            </p>
            {CALC_ROWS.map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-dashed border-ortomio-earth-200 py-1.5 font-mono text-sm">
                <span className="text-gray-700">{label}</span>
                <span className="font-bold text-ortomio-green-700">{value}</span>
              </div>
            ))}
            <div className="flex justify-between border-b border-dashed border-ortomio-earth-200 py-1.5 font-mono text-sm">
              <span className="text-gray-700">Parziale</span>
              <span className="font-bold text-ortomio-green-700">89</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-ortomio-earth-200 py-1.5 font-mono text-sm">
              <span className="text-gray-700">Convenienza economica: conviene agire ora</span>
              <span className="text-gray-600">soglia ≥75</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-ortomio-green-900 pt-2 font-mono text-base font-bold text-ortomio-green-900">
              <span>Priorità finale</span>
              <span>89/100</span>
            </div>
            <div className="mt-1 flex justify-between font-mono text-sm">
              <span className="text-gray-700">Affidabilità del dato</span>
              <span className="font-bold">84%</span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
