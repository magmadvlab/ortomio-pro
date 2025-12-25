'use client'

import React from 'react'
import { Sun, HelpCircle, BookOpen, Camera, Compass, BarChart3, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function HelpPage() {
  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <HelpCircle className="text-green-600" size={32} />
          Guida e Aiuto
        </h1>
        <p className="text-gray-600">
          Trova risposte alle domande più comuni e impara a usare tutte le funzionalità di OrtoMio
        </p>
      </div>

      <div className="space-y-8">
        {/* Sezione Esposizione Solare */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Sun className="text-yellow-500" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Esposizione Solare</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cos'è l'esposizione solare?</h3>
              <p className="text-gray-700 mb-3">
                L'esposizione solare indica quante ore di sole diretto riceve il tuo orto ogni giorno. 
                Questo valore è fondamentale per decidere quali piante coltivare e quando piantarle.
              </p>
              <p className="text-gray-700">
                OrtoMio calcola l'esposizione solare considerando:
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1 ml-4">
                <li>La posizione geografica (latitudine e longitudine)</li>
                <li>La data e la stagione (il sole cambia altezza durante l'anno)</li>
                <li>Gli ostacoli circostanti (palazzi, alberi, montagne)</li>
                <li>L'orientamento del terreno</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Come viene calcolata?</h3>
              <p className="text-gray-700 mb-3">
                Il sistema calcola la posizione del sole ogni 10 minuti durante il giorno (dalle 6:00 alle 18:00) 
                e verifica se è bloccato da ostacoli. Le ore di sole diretto vengono poi sommate per ottenere 
                il totale giornaliero.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
                <p className="text-sm text-blue-800">
                  <strong>Formula:</strong> Per ogni ostacolo, viene calcolato l'angolo di elevazione 
                  (arctan(altezza/distanza)). Se il sole ha un'elevazione più bassa dell'ostacolo nella stessa 
                  direzione, viene considerato bloccato.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Come aggiungere ostacoli?</h3>
              <p className="text-gray-700 mb-3">
                Puoi aggiungere ostacoli in due modi:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Camera className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Foto 360° (Consigliato)</h4>
                    <p className="text-sm text-gray-700">
                      Scatta una foto panoramica 360° dal punto centrale del tuo orto. Il sistema analizzerà 
                      automaticamente la foto e identificherà gli ostacoli (edifici, alberi, montagne) con 
                      direzione, altezza e distanza stimata.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Compass className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Input Manuale</h4>
                    <p className="text-sm text-gray-700">
                      Inserisci manualmente direzione (Nord, Sud, Est, Ovest), altezza in metri, distanza in metri 
                      e larghezza angolare. Utile se conosci già le misure precise.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Come interpretare i risultati?</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    Pieno Sole (8+ ore)
                  </span>
                  <span className="text-sm text-gray-700">
                    Ideale per pomodori, peperoni, zucchine, melanzane
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                    Sole Parziale (5-7 ore)
                  </span>
                  <span className="text-sm text-gray-700">
                    Buono per molte verdure: fagiolini, piselli, carote, cipolle
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Mezz'Ombra (3-4 ore)
                  </span>
                  <span className="text-sm text-gray-700">
                    Ideale per lattughe, spinaci, rucola, bietole, cavoli
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                    Ombra (&lt;3 ore)
                  </span>
                  <span className="text-sm text-gray-700">
                    Solo piante da ombra o considera di spostare l'orto
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Grafico Mensile</h3>
              <p className="text-gray-700 mb-3">
                Il grafico mostra le ore medie di sole per ogni mese dell'anno. Il periodo ottimale 
                (evidenziato in verde) indica i mesi con almeno 6 ore di sole, ideali per la maggior parte 
                delle colture.
              </p>
              <p className="text-gray-700">
                Usa questo grafico per pianificare quando piantare le tue colture in base al periodo migliore 
                dell'anno.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">FAQ</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    Perché l'esposizione cambia durante l'anno?
                  </h4>
                  <p className="text-sm text-gray-700">
                    Il sole cambia altezza nel cielo durante l'anno. In estate è più alto e le ombre sono più corte, 
                    in inverno è più basso e le ombre sono più lunghe. Questo significa che un ostacolo che blocca 
                    il sole in inverno potrebbe non bloccarlo in estate.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    Come misurare altezza e distanza di un ostacolo?
                  </h4>
                  <p className="text-sm text-gray-700">
                    <strong>Altezza:</strong> Puoi stimare confrontando con oggetti di riferimento (es. un palazzo 
                    di 3 piani ≈ 9-10m). Oppure usa un'app di misurazione con il telefono.
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>Distanza:</strong> Misura la distanza orizzontale dal punto centrale del tuo orto 
                    all'ostacolo. Puoi usare Google Maps per misurare distanze approssimative.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    Gli alberi caducifoglie cambiano l'esposizione?
                  </h4>
                  <p className="text-sm text-gray-700">
                    Sì! Gli alberi che perdono le foglie in inverno cambiano drasticamente l'esposizione. 
                    In estate bloccano più sole, in inverno meno. Considera di aggiungere due set di ostacoli 
                    diversi per estate e inverno, oppure usa una media.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sezione Matching Geografico */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Compass className="text-blue-500" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Matching Geografico e Fattibilità</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cos'è il Matching Geografico?</h3>
              <p className="text-gray-700 mb-3">
                Il sistema di matching geografico analizza la tua posizione e calcola automaticamente quali piante 
                sono ideali, possibili o difficili da coltivare nella tua zona. Questo è particolarmente utile per 
                frutti esotici e piante che richiedono condizioni climatiche specifiche.
              </p>
              <p className="text-gray-700">
                Il sistema considera:
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1 ml-4">
                <li>Zona climatica USDA (basata su temperature minime invernali)</li>
                <li>Altitudine del tuo orto</li>
                <li>Distanza dal mare (per piante che beneficiano del clima marittimo)</li>
                <li>Temperature medie e estreme della tua zona</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Come funziona?</h3>
              <p className="text-gray-700 mb-3">
                Quando cerchi una pianta nel Planner, specialmente frutti esotici come mango, avocado o papaya, 
                OrtoMio calcola automaticamente un <strong>score di fattibilità</strong> da 0 a 100 basato sulla 
                tua posizione geografica.
              </p>
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Ideale (80-100)
                  </span>
                  <span className="text-sm text-gray-700">
                    La pianta è perfettamente adatta alla tua zona. Puoi coltivarla senza particolari protezioni.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    Possibile (50-79)
                  </span>
                  <span className="text-sm text-gray-700">
                    La pianta può crescere nella tua zona con alcune accortezze o protezioni.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                    Difficile (20-49)
                  </span>
                  <span className="text-sm text-gray-700">
                    Richiede protezioni significative o sistemi di coltivazione controllati (serra riscaldata).
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    Sconsigliato (0-19)
                  </span>
                  <span className="text-sm text-gray-700">
                    Il clima della tua zona non è adatto. Considera alternative o sistemi completamente controllati.
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Selezione Varietà</h3>
              <p className="text-gray-700 mb-3">
                Per ogni pianta esotica, OrtoMio suggerisce automaticamente la <strong>varietà più adatta</strong> 
                alla tua zona climatica. Le varietà differiscono per:
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1 ml-4">
                <li><strong>Resistenza al freddo:</strong> Alcune varietà tollerano temperature più basse</li>
                <li><strong>Adattabilità al vaso:</strong> Varietà nane sono ideali per coltivazione in contenitore</li>
                <li><strong>Tempi di maturazione:</strong> Alcune varietà maturano più velocemente</li>
                <li><strong>Zone USDA ideali:</strong> Ogni varietà ha zone climatiche preferite</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sistemi di Coltivazione</h3>
              <p className="text-gray-700 mb-3">
                Il sistema suggerisce automaticamente il metodo di coltivazione più adatto:
              </p>
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 mb-1">🌱 Piena Terra</h4>
                  <p className="text-sm text-gray-700">
                    Per zone climatiche ideali. La pianta può crescere direttamente nel terreno senza protezioni 
                    particolari o con protezioni temporanee (TNT in inverno).
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 mb-1">🪴 Vaso</h4>
                  <p className="text-sm text-gray-700">
                    Ideale per zone borderline. Il vaso può essere spostato in serra o indoor durante l'inverno 
                    per proteggere la pianta dal freddo. Richiede varietà nane o compatte.
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 mb-1">🏠 Serra</h4>
                  <p className="text-sm text-gray-700">
                    Necessaria per zone con clima non ideale. Può essere serra fredda (senza riscaldamento), 
                    serra temperata o serra tropicale (con riscaldamento) a seconda delle esigenze della pianta.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Widget Dashboard</h3>
              <p className="text-gray-700 mb-3">
                Nella Dashboard principale trovi il widget <strong>"Matching Geografico"</strong> che mostra:
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1 ml-4">
                <li><strong>Piante Ideali:</strong> Frutti esotici perfettamente adatti alla tua zona</li>
                <li><strong>Nuove Opportunità:</strong> Piante possibili con qualche accortezza</li>
                <li><strong>Attenzione Clima:</strong> Piante difficili o sconsigliate per la tua zona</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Filtri Categoria Visual</h3>
              <p className="text-gray-700 mb-3">
                Nel Planner puoi filtrare le piante per categoria visual:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm text-center">🥬 Orto</span>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm text-center">🍎 Frutteto</span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm text-center">🌴 Esotici</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm text-center">🌿 Aromatiche</span>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Questi filtri ti aiutano a trovare rapidamente il tipo di pianta che stai cercando.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">FAQ</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    Come viene rilevata la mia posizione?
                  </h4>
                  <p className="text-sm text-gray-700">
                    OrtoMio usa il GPS del tuo dispositivo per rilevare automaticamente la posizione. 
                    Se non permetti l'accesso al GPS, puoi inserire manualmente le coordinate o la città.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    Posso cambiare la mia zona climatica?
                  </h4>
                  <p className="text-sm text-gray-700">
                    La zona climatica viene calcolata automaticamente dalla posizione. Se hai un microclima 
                    particolare (es. zona riparata, vicino al mare), il sistema lo considera nei calcoli.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    Perché alcune piante hanno score basso?
                  </h4>
                  <p className="text-sm text-gray-700">
                    Lo score considera le condizioni climatiche medie della tua zona. Se hai una serra riscaldata 
                    o un ambiente controllato, puoi comunque coltivare piante con score basso seguendo i suggerimenti 
                    del sistema.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Link a sezioni correlate */}
        <section className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sezioni Correlate</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/app"
              className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <BarChart3 className="text-green-600" size={20} />
              <span className="text-gray-700">Dashboard</span>
            </Link>
            <Link
              href="/app/garden?tab=timeline"
              className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <Calendar className="text-blue-600" size={20} />
              <span className="text-gray-700">Il Mio Orto</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
