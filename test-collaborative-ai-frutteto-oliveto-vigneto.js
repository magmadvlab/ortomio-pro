/**
 * Test Script per Sistema Collaborativo AI
 * Suggerimenti per Frutteto, Oliveto, Vigneto
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variabili ambiente mancanti!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestSuggestions() {
  console.log('🚀 Creazione suggerimenti AI per Frutteto/Oliveto/Vigneto...\n')

  // Cerca tutti i gardens
  const { data: gardens } = await supabase
    .from('gardens')
    .select('*')
  
  if (!gardens || gardens.length === 0) {
    console.error('❌ Nessun orto/frutteto/oliveto/vigneto trovato.')
    return
  }

  console.log(`✅ Trovati ${gardens.length} gardens:\n`)
  gardens.forEach((g, i) => {
    console.log(`${i + 1}. ${g.name} (ID: ${g.id})`)
  })
  console.log()

  // Usa il primo garden
  const garden = gardens[0]
  console.log(`📍 Creo suggerimenti per: ${garden.name}\n`)

  // Suggerimenti per FRUTTETO
  const fruttetoSuggestions = [
    {
      user_id: garden.user_id,
      garden_id: garden.id,
      suggestion_type: 'DISEASE_PREVENTION',
      context: 'Analisi meteo e umidità per ticchiolatura',
      title: 'Rischio Ticchiolatura su Meli',
      description: 'Le condizioni meteo favoriscono lo sviluppo della ticchiolatura: umidità >75% e temperature 15-20°C.',
      reasoning: `Analisi condizioni:
1. Umidità media: 78% (soglia critica: 75%)
2. Temperatura: 18°C (range ottimale ticchiolatura: 15-20°C)
3. Piogge recenti: 12mm negli ultimi 3 giorni
4. Fase fenologica: Bottoni rosa (fase critica)

La ticchiolatura è la malattia più grave del melo. In queste condizioni, le spore germinano in 6-8 ore.`,
      data_sources: JSON.stringify([
        { type: 'weather', timestamp: new Date().toISOString(), data: { humidity: 78, temp: 18 }, reliability: 0.95 },
        { type: 'plant_health', timestamp: new Date().toISOString(), data: { phenological_stage: 'pink_bud' }, reliability: 0.92 }
      ]),
      prediction_data: JSON.stringify({
        probability: 0.82,
        riskLevel: 'HIGH',
        timeframe: '6-8 ore',
        confidence: 0.88
      }),
      confidence_score: 0.88,
      suggested_action: 'Trattamento preventivo con zolfo bagnabile o dodina entro 12 ore. Ripetere dopo 7 giorni se piove.',
      action_priority: 'CRITICAL',
      action_deadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      suggested_parameters: JSON.stringify({
        prodotto_1: 'Zolfo bagnabile 80%',
        dosaggio_1: '400g/100L',
        prodotto_2_alternativo: 'Dodina 40%',
        dosaggio_2: '100ml/100L',
        volume_acqua: '100L per 10 piante adulte',
        bagnatura: 'Completa su foglie e germogli',
        orario: 'Mattina presto o sera',
        ripetizione: 'Dopo 7 giorni se piove >5mm'
      }),
      expected_outcomes: JSON.stringify([
        { metric: 'Riduzione infezioni', expectedValue: 90, unit: '%', timeframe: '14 giorni', confidence: 0.88 },
        { metric: 'Protezione foglie', expectedValue: 95, unit: '%', timeframe: '21 giorni', confidence: 0.85 }
      ]),
      status: 'PENDING'
    }
  ]

  // Suggerimenti per OLIVETO
  const olivetoSuggestions = [
    {
      user_id: garden.user_id,
      garden_id: garden.id,
      suggestion_type: 'DISEASE_PREVENTION',
      context: 'Monitoraggio mosca olearia',
      title: 'Rischio Mosca Olearia - Installare Trappole',
      description: 'Le temperature sono ottimali per la mosca olearia (20-28°C). Installare trappole cromotropiche per monitoraggio.',
      reasoning: `Analisi rischio mosca:
1. Temperatura: 24°C (range ottimale: 20-28°C)
2. Umidità: 65% (favorevole)
3. Fase fenologica: Indurimento nocciolo (inizio vulnerabilità)
4. Storico: Presenza mosca negli ultimi 2 anni

La mosca olearia è il principale parassita dell'olivo. Il monitoraggio precoce è essenziale.`,
      data_sources: JSON.stringify([
        { type: 'weather', timestamp: new Date().toISOString(), data: { temp: 24, humidity: 65 }, reliability: 0.95 },
        { type: 'historical', timestamp: new Date().toISOString(), data: { mosca_presence: true }, reliability: 0.88 }
      ]),
      prediction_data: JSON.stringify({
        probability: 0.75,
        riskLevel: 'HIGH',
        timeframe: '7-14 giorni',
        confidence: 0.85
      }),
      confidence_score: 0.85,
      suggested_action: 'Installare trappole Tap Trap cromotropiche entro 48h. Controllare settimanalmente.',
      action_priority: 'HIGH',
      action_deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      suggested_parameters: JSON.stringify({
        tipo_trappola: 'Tap Trap cromotropica gialla',
        numero_trappole: '1 ogni 3-4 piante (min 2 per oliveto)',
        posizionamento: 'Lato sud della chioma, altezza 1.5-2m',
        attrattivo: 'Fosfato biammonico 3%',
        controllo: 'Settimanale',
        soglia_intervento: '>2 mosche/trappola/settimana'
      }),
      expected_outcomes: JSON.stringify([
        { metric: 'Catture mosca', expectedValue: 80, unit: '%', timeframe: '30 giorni', confidence: 0.85 },
        { metric: 'Prevenzione danni', expectedValue: 90, unit: '%', timeframe: 'Stagione', confidence: 0.80 }
      ]),
      status: 'PENDING'
    },
    {
      user_id: garden.user_id,
      garden_id: garden.id,
      suggestion_type: 'HARVEST_TIMING',
      context: 'Analisi maturazione olive',
      title: 'Finestra Ottimale Raccolta Olive',
      description: 'Le olive raggiungeranno la maturazione ottimale tra 10-14 giorni. Invaiatura attuale: 75%.',
      reasoning: `Analisi maturazione:
1. Invaiatura: 75% (target: 80-90% per olio)
2. Indice maturazione: 3.5 (scala Jaen 0-7)
3. Acidità prevista: 0.3% (ottimale <0.5%)
4. Resa olio prevista: 18% (buona)

La finestra ottimale è critica per qualità olio. Raccolta troppo precoce: bassa resa. Troppo tardiva: alta acidità.`,
      data_sources: JSON.stringify([
        { type: 'plant_health', timestamp: new Date().toISOString(), data: { invaiatura: 75, maturity_index: 3.5 }, reliability: 0.92 },
        { type: 'weather', timestamp: new Date().toISOString(), data: { temp_forecast: [22, 21, 23, 20] }, reliability: 0.90 }
      ]),
      prediction_data: JSON.stringify({
        confidence: 0.90
      }),
      confidence_score: 0.90,
      suggested_action: 'Pianificare raccolta per 25-28 Ottobre. Preparare attrezzature e frantoio.',
      action_priority: 'HIGH',
      action_deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      suggested_parameters: JSON.stringify({
        data_ottimale: '26 Ottobre 2026',
        finestra_inizio: '25 Ottobre 2026',
        finestra_fine: '28 Ottobre 2026',
        invaiatura_target: '85%',
        metodo: 'Pettine elettrico o scuotitore',
        orario: 'Mattina (8-12), tempo asciutto',
        molitura: 'Entro 24h dalla raccolta'
      }),
      expected_outcomes: JSON.stringify([
        { metric: 'Resa olio', expectedValue: 18, unit: '%', timeframe: 'Raccolta', confidence: 0.88 },
        { metric: 'Acidità', expectedValue: 0.3, unit: '%', timeframe: 'Raccolta', confidence: 0.85 },
        { metric: 'Qualità olio', expectedValue: 95, unit: 'score', timeframe: 'Raccolta', confidence: 0.90 }
      ]),
      status: 'PENDING'
    }
  ]

  // Suggerimenti per VIGNETO
  const vignetoSuggestions = [
    {
      user_id: garden.user_id,
      garden_id: garden.id,
      suggestion_type: 'DISEASE_PREVENTION',
      context: 'Rischio peronospora su vite',
      title: 'Rischio Peronospora - Trattamento Preventivo',
      description: 'Condizioni favorevoli per peronospora: umidità >80% e temperature 18-25°C. Fase pre-fioritura critica.',
      reasoning: `Analisi rischio peronospora:
1. Umidità: 82% (soglia critica: 80%)
2. Temperatura: 21°C (range ottimale: 18-25°C)
3. Piogge: 18mm negli ultimi 2 giorni
4. Fase fenologica: Pre-fioritura (fase critica)
5. Germogli: 15-20cm (lunghezza vulnerabile)

La peronospora è la malattia più grave della vite. In pre-fioritura, un'infezione può compromettere l'intera produzione.`,
      data_sources: JSON.stringify([
        { type: 'weather', timestamp: new Date().toISOString(), data: { humidity: 82, temp: 21, rain: 18 }, reliability: 0.95 },
        { type: 'plant_health', timestamp: new Date().toISOString(), data: { phenological_stage: 'pre_flowering', shoot_length: 18 }, reliability: 0.92 }
      ]),
      prediction_data: JSON.stringify({
        probability: 0.85,
        riskLevel: 'CRITICAL',
        timeframe: '24-48 ore',
        confidence: 0.90
      }),
      confidence_score: 0.90,
      suggested_action: 'Trattamento rameico preventivo entro 24 ore. Bagnatura completa su grappoli e foglie.',
      action_priority: 'CRITICAL',
      action_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      suggested_parameters: JSON.stringify({
        prodotto: 'Ossicloruro di rame 50%',
        dosaggio: '300g/100L',
        volume_acqua: '100L per 100m² vigneto',
        bagnatura: 'Completa su grappoli, foglie, tralci',
        stadio_fenologico: 'Pre-fioritura (BBCH 55-57)',
        orario: 'Mattina presto o sera',
        ripetizione: 'Dopo 7-10 giorni o dopo pioggia >10mm'
      }),
      expected_outcomes: JSON.stringify([
        { metric: 'Protezione grappoli', expectedValue: 95, unit: '%', timeframe: '14 giorni', confidence: 0.90 },
        { metric: 'Riduzione infezioni', expectedValue: 92, unit: '%', timeframe: '21 giorni', confidence: 0.88 }
      ]),
      status: 'PENDING'
    },
    {
      user_id: garden.user_id,
      garden_id: garden.id,
      suggestion_type: 'HARVEST_TIMING',
      context: 'Analisi maturazione uva',
      title: 'Finestra Ottimale Vendemmia',
      description: 'L\'uva raggiungerà la maturazione ottimale tra 12-16 giorni. Grado zuccherino attuale: 20 Brix.',
      reasoning: `Analisi maturazione uva:
1. Grado zuccherino: 20 Brix (target: 22-24 Brix)
2. Acidità totale: 7.2 g/L (target: 6-7 g/L)
3. pH: 3.1 (target: 3.2-3.4)
4. Colore: 85% invaiatura
5. Previsioni meteo: Favorevoli (sole, no pioggia)

La maturazione tecnologica è quasi completa. La finestra ottimale è tra 12-16 giorni per equilibrio zuccheri/acidità.`,
      data_sources: JSON.stringify([
        { type: 'plant_health', timestamp: new Date().toISOString(), data: { brix: 20, acidity: 7.2, ph: 3.1 }, reliability: 0.95 },
        { type: 'weather', timestamp: new Date().toISOString(), data: { forecast: 'sunny', rain_probability: 10 }, reliability: 0.88 }
      ]),
      prediction_data: JSON.stringify({
        confidence: 0.92
      }),
      confidence_score: 0.92,
      suggested_action: 'Pianificare vendemmia per 15-18 Settembre. Preparare attrezzature e cantina.',
      action_priority: 'HIGH',
      action_deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      suggested_parameters: JSON.stringify({
        data_ottimale: '16 Settembre 2026',
        finestra_inizio: '15 Settembre 2026',
        finestra_fine: '18 Settembre 2026',
        brix_target: '22-23',
        acidita_target: '6.5 g/L',
        ph_target: '3.3',
        metodo: 'Manuale o vendemmiatrice',
        orario: 'Mattina presto (6-10), temperature fresche',
        vinificazione: 'Immediata'
      }),
      expected_outcomes: JSON.stringify([
        { metric: 'Grado zuccherino', expectedValue: 22.5, unit: 'Brix', timeframe: 'Vendemmia', confidence: 0.90 },
        { metric: 'Acidità', expectedValue: 6.5, unit: 'g/L', timeframe: 'Vendemmia', confidence: 0.88 },
        { metric: 'Qualità vino', expectedValue: 93, unit: 'score', timeframe: 'Vendemmia', confidence: 0.92 }
      ]),
      status: 'PENDING'
    }
  ]

  // Scegli suggerimenti in base al tipo di garden
  let suggestions = []
  const gardenName = garden.name.toLowerCase()
  
  if (gardenName.includes('frutt') || gardenName.includes('mel') || gardenName.includes('per')) {
    console.log('🍎 Tipo rilevato: FRUTTETO\n')
    suggestions = fruttetoSuggestions
  } else if (gardenName.includes('oliv') || gardenName.includes('uliveto')) {
    console.log('🫒 Tipo rilevato: OLIVETO\n')
    suggestions = olivetoSuggestions
  } else if (gardenName.includes('vign') || gardenName.includes('uva')) {
    console.log('🍇 Tipo rilevato: VIGNETO\n')
    suggestions = vignetoSuggestions
  } else {
    console.log('🌱 Tipo generico: Uso suggerimenti misti\n')
    suggestions = [...fruttetoSuggestions.slice(0, 1), ...olivetoSuggestions.slice(0, 1), ...vignetoSuggestions.slice(0, 1)]
  }

  // Inserisci suggerimenti
  console.log('📝 Inserimento suggerimenti...\n')
  
  for (const suggestion of suggestions) {
    const { data, error } = await supabase
      .from('ai_suggestions')
      .insert([suggestion])
      .select()
      .single()

    if (error) {
      console.error(`❌ Errore: ${suggestion.title}`)
      console.error(error)
    } else {
      console.log(`✅ ${suggestion.title}`)
      console.log(`   Tipo: ${suggestion.suggestion_type}`)
      console.log(`   Priorità: ${suggestion.action_priority}`)
      console.log(`   Confidenza: ${(suggestion.confidence_score * 100).toFixed(0)}%\n`)

      // Crea transparency log
      const transparencyLog = {
        suggestion_id: data.id,
        decision_tree: JSON.stringify([
          { condition: 'Condizioni meteo favorevoli', result: 'Rischio elevato', weight: 0.4 },
          { condition: 'Fase fenologica critica', result: 'Vulnerabilità alta', weight: 0.3 },
          { condition: 'Storico positivo', result: 'Pattern confermato', weight: 0.3 }
        ]),
        data_inputs: JSON.stringify({
          weather: { humidity: 80, temp: 22 },
          phenology: { stage: 'critical' },
          historical: { disease_presence: true }
        }),
        weights_applied: JSON.stringify({
          'Dati meteo': 0.40,
          'Fase fenologica': 0.30,
          'Dati storici': 0.20,
          'Preferenze utente': 0.10
        }),
        rules_triggered: JSON.stringify([
          { rule: 'Condizioni critiche', triggered: true, impact: 0.4 },
          { rule: 'Fase vulnerabile', triggered: true, impact: 0.3 }
        ]),
        calculations: JSON.stringify([
          {
            step: 'Calcolo probabilità',
            formula: 'P = (weather * 0.4) + (phenology * 0.3) + (history * 0.3)',
            inputs: { weather: 0.85, phenology: 0.80, history: 0.75 },
            output: 0.80
          }
        ]),
        thresholds_used: JSON.stringify({
          'Umidità critica': 75,
          'Temperatura minima': 15,
          'Probabilità alert': 0.7
        }),
        alternatives_evaluated: JSON.stringify([
          { option: 'Nessun trattamento', score: 30, reason_not_chosen: 'Rischio troppo elevato' },
          { option: 'Trattamento biologico', score: 70, reason_not_chosen: 'Efficacia insufficiente' },
          { option: 'Trattamento preventivo (scelto)', score: 90, reason_not_chosen: 'N/A' }
        ]),
        models_used: JSON.stringify(['Disease Prediction Model v2.1', 'Phenology Analyzer v1.3']),
        model_versions: JSON.stringify(['2.1', '1.3'])
      }

      await supabase
        .from('ai_transparency_log')
        .insert([transparencyLog])
    }
  }

  console.log('\n✅ Test completato!')
  console.log('\n📍 Vai su: http://localhost:3002/app/ai-collaborative\n')
}

// Esegui
createTestSuggestions().catch(console.error)
