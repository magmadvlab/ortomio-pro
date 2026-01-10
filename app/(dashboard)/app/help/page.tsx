'use client'

import React, { useState } from 'react'
import { Sun, HelpCircle, BookOpen, Camera, Compass, BarChart3, Calendar, ChevronRight, ChevronDown, Droplets, Sprout, TreePine, Grape, Leaf, Layers, Zap, Clock, Factory, Gauge, Edit, Trash2, X, AlertCircle, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function HelpPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId)
  }

  const sections = [
    {
      id: 'getting-started',
      title: 'Primi Passi',
      icon: <BookOpen className="text-green-600" size={24} />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Configurazione Iniziale</h4>
            <p className="text-gray-700 mb-3">
              Al primo avvio, OrtoMio ti chiederà di configurare il tuo orto:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Nome dell'orto e dimensioni (m², are, ettari)</li>
              <li>Tipo di terreno (Argilloso, Sabbioso, Limoso, etc.)</li>
              <li>Posizione GPS per suggerimenti personalizzati</li>
              <li>Esposizione solare e orientamento</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Navigazione</h4>
            <p className="text-gray-700">
              L'app è organizzata in sezioni principali accessibili dalla barra di navigazione:
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <span className="text-sm bg-green-50 p-2 rounded">🏠 Home - Dashboard</span>
              <span className="text-sm bg-blue-50 p-2 rounded">🌱 Semina - Pianificazione</span>
              <span className="text-sm bg-yellow-50 p-2 rounded">📔 Diario - Monitoraggio</span>
              <span className="text-sm bg-purple-50 p-2 rounded">🛡️ Cura - Trattamenti</span>
              <span className="text-sm bg-orange-50 p-2 rounded">🧺 Raccolto - Statistiche</span>
              <span className="text-sm bg-gray-50 p-2 rounded">📡 Smart - Sensori IoT</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'individual-plant-tracking',
      title: 'Tracking Piante Individuali',
      icon: <Sprout className="text-green-600" size={24} />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Sistema Rivoluzionario</h4>
            <p className="text-gray-700 mb-3">
              OrtoMio offre un sistema professionale di tracking pianta-per-pianta che permette di monitorare 
              e gestire ogni singola pianta con precisione millimetrica.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-medium text-green-900 mb-2">Caratteristiche Principali:</h5>
              <ul className="list-disc list-inside text-green-800 space-y-1 text-sm">
                <li>Codici automatici per ogni pianta (F1-P001, F1-P002...)</li>
                <li>Operazioni di massa con foto strategiche intelligenti</li>
                <li>Heatmap salute per visualizzazione rapida stato campo</li>
                <li>Scalabile da 20 piante a 10.000+ piante professionali</li>
              </ul>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Due Modalità di Gestione</h4>
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h5 className="font-medium text-blue-900 mb-1">Smart Plant Manager</h5>
                <p className="text-sm text-blue-800">
                  Per professionisti con 100+ piante. Selezione multipla intelligente, operazioni di massa, 
                  vista heatmap e statistiche avanzate.
                </p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <h5 className="font-medium text-purple-900 mb-1">Field Plant Manager</h5>
                <p className="text-sm text-purple-800">
                  Wizard guidato per configurazione automatica. Calcoli spaziature, generazione codici 
                  e setup completo campo.
                </p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Operazioni di Massa</h4>
            <p className="text-gray-700 mb-2">4 tipi di operazioni principali:</p>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-sm bg-blue-50 p-2 rounded">💧 Irrigazione</span>
              <span className="text-sm bg-green-50 p-2 rounded">⚡ Fertilizzazione</span>
              <span className="text-sm bg-yellow-50 p-2 rounded">✂️ Trattamento</span>
              <span className="text-sm bg-purple-50 p-2 rounded">📸 Aggiornamento Salute</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'microirrigation',
      title: 'Microirrigazione Avanzata',
      icon: <Droplets className="text-blue-600" size={24} />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Sistemi Supportati</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h5 className="font-medium text-blue-900 mb-1">💦 Goccia (Drip)</h5>
                <p className="text-sm text-blue-800">Ideale per orto: risparmio idrico e irrigazione localizzata</p>
              </div>
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                <h5 className="font-medium text-cyan-900 mb-1">🌊 Micro-irrigazione</h5>
                <p className="text-sm text-cyan-800">Perfetto per vasi e aiuole, controllo preciso</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <h5 className="font-medium text-gray-900 mb-1">🌧️ Irrigatori (Sprinkler)</h5>
                <p className="text-sm text-gray-800">Adatto per prati e aree grandi</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h5 className="font-medium text-green-900 mb-1">🚿 Tubo Poroso</h5>
                <p className="text-sm text-green-800">Economico per piccole aree, distribuzione uniforme</p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Configurazione per Tipo Coltivazione</h4>
            <p className="text-gray-700 mb-2">Il wizard ti guida nella configurazione ottimale:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li><strong>Orto:</strong> Drip/Micro (efficienza Alta), pressione 1.5-3 bar</li>
              <li><strong>Frutteto:</strong> Drip per adulti, Micro per giovani, pressione 2-4 bar</li>
              <li><strong>Vigneto/Uliveto:</strong> Drip standard per qualità, controllo preciso</li>
              <li><strong>Serra:</strong> Micro per vasi e bancali, controllo umidità</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Calcoli Automatici</h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Esempio:</strong> Filare 50m con ala gocciolante 2 L/h/metro
              </p>
              <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm ml-4">
                <li>Per 20L: sistema calcola 20min automaticamente</li>
                <li>100 piante = 0.2L per pianta</li>
                <li>Portata totale: 100 L/h</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'fertilization',
      title: 'Fertilizzazione Professionale',
      icon: <Zap className="text-yellow-600" size={24} />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Prodotti Concreti con Dosaggi</h4>
            <p className="text-gray-700 mb-3">
              OrtoMio converte i fabbisogni NPK in prodotti fertilizzanti specifici con dosaggi precisi:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h5 className="font-medium text-green-900 mb-1">🌿 Organici</h5>
                <p className="text-sm text-green-800">Compost, letame, humus di lombrico</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h5 className="font-medium text-blue-900 mb-1">⚗️ Minerali</h5>
                <p className="text-sm text-blue-800">NPK, solfato di potassio, fosfato</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <h5 className="font-medium text-purple-900 mb-1">🧪 Correttivi</h5>
                <p className="text-sm text-purple-800">Calce, gesso, zeolite</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <h5 className="font-medium text-orange-900 mb-1">🔬 Microelementi</h5>
                <p className="text-sm text-orange-800">Ferro, magnesio, boro</p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Calcoli Intelligenti</h4>
            <p className="text-gray-700 mb-2">Il sistema considera:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Tipo terreno (argilloso trattiene più, sabbioso perde)</li>
              <li>Fase pianta (pre-impianto, crescita, fioritura)</li>
              <li>Area da fertilizzare per filare</li>
              <li>pH terreno (alcuni prodotti non funzionano a pH sbagliato)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Autoproduzione Compost</h4>
            <div className="space-y-2">
              <div className="bg-brown-50 border border-brown-200 rounded-lg p-3">
                <h5 className="font-medium text-brown-900 mb-1">🍂 Compost Tradizionale</h5>
                <p className="text-sm text-brown-800">Rapporto C/N 25-30:1, maturazione 6-12 mesi</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <h5 className="font-medium text-red-900 mb-1">🪱 Lombricompost</h5>
                <p className="text-sm text-red-800">Più ricco, rapporto C/N 15-20:1, tempo 3-6 mesi</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h5 className="font-medium text-yellow-900 mb-1">🦠 Bokashi</h5>
                <p className="text-sm text-yellow-800">Fermentazione anaerobica, più veloce: 2-4 settimane</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'phyto-management',
      title: 'Gestione Fitofarmaci',
      icon: <AlertCircle className="text-red-600" size={24} />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Timing Critico</h4>
            <p className="text-gray-700 mb-3">
              Il sistema verifica automaticamente le condizioni ottimali per i trattamenti:
            </p>
            <div className="space-y-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h5 className="font-medium text-blue-900 mb-1">🌧️ Condizioni Meteo</h5>
                <p className="text-sm text-blue-800">
                  Pioggia prevista, temperatura min/max, vento massimo consentito
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <h5 className="font-medium text-orange-900 mb-1">⏰ Periodo Carenza</h5>
                <p className="text-sm text-orange-800">
                  Verifica automatica conflitti con raccolta, suggerisce alternative
                </p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Registro Professionale</h4>
            <p className="text-gray-700 mb-2">Per compliance e certificazioni:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Registrazione automatica ogni trattamento</li>
              <li>Export in CSV/PDF per audit</li>
              <li>Tracciabilità completa prodotto</li>
              <li>Documentazione per certificazioni biologiche</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Preparati Naturali</h4>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-sm bg-green-50 p-2 rounded">🌿 Macerato Ortica</span>
              <span className="text-sm bg-purple-50 p-2 rounded">🧄 Macerato Aglio</span>
              <span className="text-sm bg-brown-50 p-2 rounded">🌾 Decotto Equiseto</span>
              <span className="text-sm bg-yellow-50 p-2 rounded">🌼 Infuso Tanaceto</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'seed-bank',
      title: 'Banca Semi Intelligente',
      icon: <Layers className="text-brown-600" size={24} />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Tracciamento Automatico</h4>
            <p className="text-gray-700 mb-3">
              La banca semi traccia automaticamente quantità e consumi:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Quantità numerica precisa con aggiornamento automatico</li>
              <li>Calcolo percentuale utilizzata vs disponibile</li>
              <li>Stato dinamico (Alto/Medio/Basso/Vuoto)</li>
              <li>Collegamento diretto con semine</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Statistiche Germinazione</h4>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 mb-2">
                <strong>Tracciamento Completo:</strong>
              </p>
              <ul className="list-disc list-inside text-green-800 space-y-1 text-sm ml-4">
                <li>Semi piantati vs piantine nate</li>
                <li>Tasso germinazione per varietà</li>
                <li>Identificazione semi di qualità migliore</li>
                <li>Storico performance per fornitore</li>
              </ul>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Alert e Promemoria</h4>
            <div className="space-y-2">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h5 className="font-medium text-yellow-900 mb-1">⚠️ Scadenze Semi</h5>
                <p className="text-sm text-yellow-800">Alert per semi in scadenza quest'anno</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <h5 className="font-medium text-red-900 mb-1">📉 Scorte Basse</h5>
                <p className="text-sm text-red-800">Notifica quando semi &lt; 20% necessità stagionale</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'vivaio',
      title: 'Vivaio Completo (3 Sezioni)',
      icon: <TreePine className="text-green-600" size={24} />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Struttura Modulare</h4>
            <div className="space-y-3">
              <div className="bg-brown-50 border border-brown-200 rounded-lg p-3">
                <h5 className="font-medium text-brown-900 mb-1">📦 Semi</h5>
                <p className="text-sm text-brown-800">
                  Inventario completo con tracciabilità, scorte, scadenze e fornitori
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h5 className="font-medium text-green-900 mb-1">🌱 Piantine</h5>
                <p className="text-sm text-green-800">
                  Gestione lotti con fasi crescita: germinazione → nursing → hardening
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h5 className="font-medium text-blue-900 mb-1">🌳 Alberelli</h5>
                <p className="text-sm text-blue-800">
                  Piante legnose giovani, crescita pluriennale, preparazione trapianto
                </p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Gestione Lotti Avanzata</h4>
            <p className="text-gray-700 mb-2">Collegamento automatico semi → piantine:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Calcolo semi necessari per lotto</li>
              <li>Previsione date trapianto automatiche</li>
              <li>Monitoraggio fasi crescita con foto</li>
              <li>Tasso successo e statistiche</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'multi-garden',
      title: 'Multi-Orto Intelligente',
      icon: <MapPin className="text-purple-600" size={24} />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Scenari Tipici</h4>
            <div className="space-y-2">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  🥕 <strong>Orto domestico</strong> + 🍎 <strong>Frutteto in campagna</strong> (30km distanza)
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  🌱 <strong>Serra</strong> + 🌾 <strong>Campo aperto</strong> (condizioni diverse)
                </p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-sm text-purple-800">
                  🏠 <strong>Giardino casa</strong> + 🏔️ <strong>Orto montano</strong> (altitudini diverse)
                </p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Meteo Localizzato</h4>
            <p className="text-gray-700 mb-2">Ogni orto ha previsioni specifiche:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Previsioni 7 giorni per coordinate GPS specifiche</li>
              <li>Cache separata per ogni posizione</li>
              <li>Allarmi meteo localizzati (gelo, caldo, pioggia)</li>
              <li>Selettore intelligente desktop/mobile</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Gestione Separata</h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Per ogni orto:</strong>
              </p>
              <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm ml-4">
                <li>Task e calendario indipendenti</li>
                <li>Strutture (aiuole/filari) separate</li>
                <li>Inventari dedicati (semi, fertilizzanti)</li>
                <li>Storico operazioni completo</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'lunar-calendar',
      title: 'Calendario Lunare e Tradizioni',
      icon: <Calendar className="text-indigo-600" size={24} />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Integrazione Completa</h4>
            <p className="text-gray-700 mb-3">
              OrtoMio integra il calendario lunare tradizionale con la pianificazione moderna:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h5 className="font-medium text-yellow-900 mb-1">🌕 Luna Crescente</h5>
                <p className="text-sm text-yellow-800">Semine foglie e frutti, trapianti</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h5 className="font-medium text-blue-900 mb-1">🌑 Luna Calante</h5>
                <p className="text-sm text-blue-800">Semine radici, potature, raccolti</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <h5 className="font-medium text-purple-900 mb-1">🌝 Luna Piena</h5>
                <p className="text-sm text-purple-800">Raccolta erbe officinali, conserve</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <h5 className="font-medium text-gray-900 mb-1">🌚 Luna Nuova</h5>
                <p className="text-sm text-gray-800">Riposo, pianificazione, preparazione</p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Saggezza Tradizionale</h4>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 mb-2">
                <strong>Detti Contadini Italiani:</strong>
              </p>
              <ul className="list-disc list-inside text-green-800 space-y-1 text-sm ml-4">
                <li>Detti del giorno con varianti regionali</li>
                <li>Consigli stagionali tradizionali</li>
                <li>Challenge giornaliere per mantenere attivo l'orto</li>
                <li>Eventi stagionali (equinozi, solstizi)</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ai-features',
      title: 'AI e Smart Features',
      icon: <BarChart3 className="text-cyan-600" size={24} />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Query AI Personalizzate</h4>
            <p className="text-gray-700 mb-3">
              Chiedi consigli specifici per la tua situazione con contesto orto completo:
            </p>
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
              <p className="text-sm text-cyan-800 mb-2">
                <strong>Esempi di domande:</strong>
              </p>
              <ul className="list-disc list-inside text-cyan-800 space-y-1 text-sm ml-4">
                <li>"Le foglie dei pomodori sono gialle, cosa faccio?"</li>
                <li>"Quando seminare basilico nella mia zona?"</li>
                <li>"Come ottimizzare la rotazione per il prossimo anno?"</li>
                <li>"Quale varietà di peperone per il mio clima?"</li>
              </ul>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Diagnosi da Foto</h4>
            <p className="text-gray-700 mb-2">Riconoscimento automatico problemi:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Identificazione malattie e parassiti</li>
              <li>Valutazione gravità problema</li>
              <li>Suggerimenti trattamento immediato</li>
              <li>Prevenzione futura</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Smart Features (IoT Simulation)</h4>
            <div className="space-y-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h5 className="font-medium text-blue-900 mb-1">🌡️ Sensori Virtuali</h5>
                <p className="text-sm text-blue-800">Umidità, temperatura, luce simulati</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h5 className="font-medium text-green-900 mb-1">💧 Controllo Irrigazione</h5>
                <p className="text-sm text-green-800">Automazione basata su soglie</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <h5 className="font-medium text-purple-900 mb-1">📈 Analisi Predittiva</h5>
                <p className="text-sm text-purple-800">Previsioni resa e malattie</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <HelpCircle className="text-green-600" size={32} />
          Manuale Utente OrtoMio
        </h1>
        <p className="text-gray-600">
          Guida completa a tutte le funzionalità di OrtoMio AI - Dal principiante al professionista
        </p>
      </div>

      {/* Indice rapido */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-green-900 mb-4">📚 Indice Rapido</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => toggleSection(section.id)}
              className="flex items-center gap-2 p-3 bg-white rounded-lg hover:shadow-md transition-all text-left"
            >
              {section.icon}
              <span className="text-sm font-medium text-gray-900">{section.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sezioni espandibili */}
      <div className="space-y-6">
        {sections.map((section) => (
          <section key={section.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {section.icon}
                <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
              </div>
              {expandedSection === section.id ? (
                <ChevronDown className="text-gray-500" size={24} />
              ) : (
                <ChevronRight className="text-gray-500" size={24} />
              )}
            </button>
            
            {expandedSection === section.id && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="pt-6">
                  {section.content}
                </div>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Sezione Esposizione Solare (mantenuta dall'originale) */}
      <section className="bg-white rounded-lg shadow-md p-6 mt-8">
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
        </div>
      </section>

      {/* Link a sezioni correlate */}
      <section className="bg-gray-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔗 Sezioni Correlate</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <Link
            href="/app/plants"
            className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <Sprout className="text-green-600" size={20} />
            <span className="text-gray-700">Tracking Piante</span>
          </Link>
        </div>
      </section>

      {/* Footer con informazioni aggiuntive */}
      <div className="mt-12 p-6 bg-green-50 border border-green-200 rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-green-900 mb-2">🌱 Hai bisogno di aiuto?</h3>
          <p className="text-green-800 mb-4">
            Questo manuale copre tutte le funzionalità principali di OrtoMio AI. 
            Per domande specifiche, usa la funzione AI integrata nell'app.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/app/settings"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Impostazioni
            </Link>
            <Link
              href="/app"
              className="px-4 py-2 bg-white text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
            >
              Torna alla Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
