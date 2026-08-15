'use client'

import { useState } from 'react'

const TABS = ['Cosa propone', 'Su cosa si basa', 'Perché viene prima', 'Alternative'] as const
type Tab = (typeof TABS)[number]

const CALC_ROWS: Array<[string, string]> = [
  ['Punteggio di partenza', '62'],
  ['+ Qualità delle informazioni disponibili', '+9'],
  ['+ Conseguenze del ritardo', '+6'],
  ['+ Momento della stagione', '+8'],
  ['+ Costi dell’intervento', '+4'],
]

const TAB_CONTENT: Record<Tab, React.ReactNode> = {
  'Cosa propone': (
    <p className="text-sm text-gray-700">
      Controllare la zona interessata e valutare l&apos;intervento nel momento indicato, prima che
      il ritardo possa incidere sulla coltura.
    </p>
  ),
  'Su cosa si basa': (
    <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
      <li>Condizioni osservate nella zona e stato della coltura.</li>
      <li>Misure disponibili dai sensori collegati.</li>
      <li>Previsioni meteo e momento della stagione.</li>
      <li>Storico di irrigazioni e trattamenti, con le informazioni mancanti rese visibili.</li>
    </ul>
  ),
  'Perché viene prima': null, // rendered by the illustrative calculation below
  Alternative: (
    <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
      <li><strong>Intervenire</strong> — preparare il lavoro dopo il controllo del responsabile.</li>
      <li><strong>Programmare</strong> — inserire l&apos;intervento nel momento più adatto.</li>
      <li><strong>Continuare a osservare</strong> — attendere nuove informazioni prima di agire.</li>
      <li><strong>Richiedere un controllo sul campo</strong> — verificare direttamente la situazione.</li>
    </ul>
  ),
}

export default function PillarTransparency() {
  const [activeTab, setActiveTab] = useState<Tab>('Cosa propone')

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
          Ogni indicazione mostra il proprio ragionamento.
        </h2>
        <p className="mb-6 max-w-2xl text-gray-700">
          L&apos;AI di OrtoMio non restituisce soltanto una risposta. Ogni proposta può essere
          aperta per verificare quali informazioni ha considerato, come è arrivata alla priorità
          e quali alternative ha valutato. La decisione resta al responsabile: OrtoMio prepara
          una lettura motivata e conserva il motivo della scelta.
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

        {activeTab !== 'Perché viene prima' && (
          <div
            id={`transparency-panel-${activeIndex}`}
            role="tabpanel"
            aria-labelledby={`transparency-tab-${activeIndex}`}
            className="mb-6"
          >
            {TAB_CONTENT[activeTab]}
          </div>
        )}

        {activeTab === 'Perché viene prima' && (
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
