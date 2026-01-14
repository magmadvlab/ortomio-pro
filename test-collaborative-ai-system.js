/**
 * Test Script per Sistema Collaborativo AI
 * Popola il database con suggerimenti di esempio
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variabili ambiente mancanti!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestSuggestions() {
  console.log('🚀 Creazione suggerimenti AI di test...\n')

  // Cerca l'orto "orto di rob" o il primo disponibile
  const { data: gardens } = await supabase
    .from('gardens')
    .select('*')
    .or('name.ilike.%orto di rob%,name.ilike.%rob%')
    .limit(1)

  if (!gardens || gardens.length === 0) {
    // Se non trova "orto di rob", prendi il primo orto disponibile
    const { data: allGardens } = await supabase
      .from('gardens')
      .select('*')
      .limit(1)
    
    if (!allGardens || allGardens.length === 0) {
      console.error('❌ Nessun orto trovato nel database.')
      console.error('   Crea prima un orto nell\'app.')
      return
    }
    
    gardens[0] = allGardens[0]
  }

  const garden = gardens[0]
  console.log(`✅ Orto trovato: ${garden.name}`)
  console.log(`✅ User ID: ${garden.user_id}\n`)

  // Suggerimenti di esempio
  const suggestions = [
    {
      user_id: garden.user_id,
      garden_id: garden.id,
      suggestion_type: 'DISEASE_PREVENTION',
      context: 'Analisi meteo e umidità elevata',
      title: 'Rischio Peronospora sui Pomodori',
      description: 'L\'AI ha rilevato condizioni favorevoli allo sviluppo della peronospora: umidità >80% e temperature 18-24°C per i prossimi 5 giorni.',
      reasoning: `Basandomi sui dati meteo degli ultimi 3 giorni e le previsioni, ho identificato un pattern ad alto rischio:
      
1. Umidità media: 85% (soglia critica: 80%)
2. Temperatura media: 21°C (range ottimale per peronospora: 15-25°C)
3. Piogge previste: 15mm nei prossimi 3 giorni
4. Ventilazione scarsa: velocità vento <5 km/h

Questi fattori combinati creano l'ambiente ideale per lo sviluppo della peronospora. 
Storico: Nel 2025 con condizioni simili, la peronospora si è sviluppata in 7 giorni.`,
      data_sources: JSON.stringify([
        { type: 'weather', timestamp: new Date().toISOString(), data: { humidity: 85, temp: 21 }, reliability: 0.95 },
        { type: 'plant_health', timestamp: new Date().toISOString(), data: { healthScore: 85 }, reliability: 0.90 },
        { type: 'historical', timestamp: new Date().toISOString(), data: { similar_conditions: 3 }, reliability: 0.85 }
      ]),
      prediction_data: JSON.stringify({
        probability: 0.78,
        riskLevel: 'HIGH',
        timeframe: '5-7 giorni',
        confidence: 0.85
      }),
      confidence_score: 0.85,
      suggested_action: 'Applicare trattamento preventivo con rame (200g/100L acqua) entro 48 ore. Migliorare ventilazione rimuovendo foglie basali.',
      action_priority: 'HIGH',
      action_deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      suggested_parameters: JSON.stringify({
        prodotto: 'Ossicloruro di rame',
        dosaggio: '200g/100L',
        volume_acqua: '100L',
        metodo_applicazione: 'Nebulizzazione fogliare',
        orario_consigliato: 'Mattina presto (6-8 AM)',
        ripetizione: 'Dopo 7 giorni se piove'
      }),
      alternatives: JSON.stringify([
        {
          title: 'Trattamento con Zolfo',
          description: 'Alternativa al rame, meno efficace ma più economica',
          parameters: { prodotto: 'Zolfo bagnabile', dosaggio: '300g/100L' },
          pros: ['Più economico', 'Meno impatto ambientale'],
          cons: ['Efficacia inferiore (65% vs 85%)', 'Richiede più applicazioni']
        },
        {
          title: 'Bicarbonato di Potassio',
          description: 'Soluzione biologica, efficace solo in prevenzione',
          parameters: { prodotto: 'Bicarbonato K', dosaggio: '500g/100L' },
          pros: ['100% biologico', 'Nessun tempo di carenza'],
          cons: ['Efficacia limitata (50%)', 'Solo preventivo']
        }
      ]),
      expected_outcomes: JSON.stringify([
        { metric: 'Riduzione rischio malattia', expectedValue: 85, unit: '%', timeframe: '7 giorni', confidence: 0.85 },
        { metric: 'Piante protette', expectedValue: 95, unit: '%', timeframe: '14 giorni', confidence: 0.80 }
      ]),
      status: 'PENDING'
    },
    {
      user_id: garden.user_id,
      garden_id: garden.id,
      suggestion_type: 'RESOURCE_SAVING',
      context: 'Analisi consumo idrico e previsioni meteo',
      title: 'Ottimizzazione Irrigazione - Risparmio 30%',
      description: 'Basandomi sulle previsioni meteo (piogge previste) e l\'umidità del suolo, puoi ridurre l\'irrigazione del 30% nei prossimi 7 giorni.',
      reasoning: `Analisi dei dati:

1. Previsioni meteo: 25mm di pioggia nei prossimi 5 giorni
2. Umidità suolo attuale: 65% (ottimale: 60-70%)
3. Evapotraspirazione prevista: 3.2mm/giorno
4. Capacità ritenzione suolo: Alta (terreno argilloso)

Calcolo risparmio:
- Fabbisogno normale: 150L/giorno
- Pioggia prevista: 25mm = ~40L/m² 
- Riduzione possibile: 45L/giorno per 7 giorni = 315L totali
- Risparmio: 30% (-€6.30/settimana)`,
      data_sources: JSON.stringify([
        { type: 'weather', timestamp: new Date().toISOString(), data: { precipitation_forecast: 25 }, reliability: 0.90 },
        { type: 'soil', timestamp: new Date().toISOString(), data: { moisture: 65 }, reliability: 0.95 }
      ]),
      prediction_data: JSON.stringify({
        expectedSavings: 6.30,
        confidence: 0.88
      }),
      confidence_score: 0.88,
      suggested_action: 'Riduci irrigazione a 105L/giorno (da 150L). Salta irrigazione nei giorni di pioggia prevista.',
      action_priority: 'MEDIUM',
      action_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      suggested_parameters: JSON.stringify({
        volume_giornaliero: '105L',
        riduzione_percentuale: '30%',
        giorni_skip: ['Martedì', 'Giovedì'],
        orario_irrigazione: '6:00-7:00 AM',
        monitoraggio: 'Controlla umidità suolo ogni 2 giorni'
      }),
      expected_outcomes: JSON.stringify([
        { metric: 'Risparmio acqua', expectedValue: 315, unit: 'litri', timeframe: '7 giorni', confidence: 0.88 },
        { metric: 'Risparmio economico', expectedValue: 6.30, unit: '€', timeframe: '7 giorni', confidence: 0.85 },
        { metric: 'Salute piante', expectedValue: 100, unit: '%', timeframe: '7 giorni', confidence: 0.90 }
      ]),
      status: 'PENDING'
    },
    {
      user_id: garden.user_id,
      garden_id: garden.id,
      suggestion_type: 'YIELD_OPTIMIZATION',
      context: 'Analisi fase crescita e condizioni ottimali',
      title: 'Aumenta Resa Lattuga +25%',
      description: 'Le tue lattughe sono in fase ottimale per un trattamento fogliare che può aumentare la resa del 25%.',
      reasoning: `Analisi situazione:

1. Fase crescita: Formazione cespo (settimana 4/6)
2. Salute piante: 88% (ottima)
3. Condizioni meteo: Ideali (18-22°C, sole)
4. Nutrizione: Azoto leggermente basso

Opportunità identificata:
Un trattamento fogliare con azoto organico in questa fase può:
- Accelerare formazione cespo: +15%
- Aumentare peso finale: +25%
- Migliorare qualità foglie: +20%

Storico: 8 utenti hanno ottenuto +23% resa media con questo trattamento.`,
      data_sources: JSON.stringify([
        { type: 'plant_health', timestamp: new Date().toISOString(), data: { healthScore: 88, growthStage: 'cespo' }, reliability: 0.92 },
        { type: 'soil', timestamp: new Date().toISOString(), data: { nitrogen: 18 }, reliability: 0.90 },
        { type: 'historical', timestamp: new Date().toISOString(), data: { success_rate: 0.87 }, reliability: 0.85 }
      ]),
      prediction_data: JSON.stringify({
        expectedYield: 2.8,
        confidence: 0.82
      }),
      confidence_score: 0.82,
      suggested_action: 'Applica fertilizzante fogliare azotato (NPK 20-5-5) alla dose di 150ml/10L acqua. Ripeti dopo 7 giorni.',
      action_priority: 'MEDIUM',
      action_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      suggested_parameters: JSON.stringify({
        prodotto: 'Fertilizzante fogliare NPK 20-5-5',
        dosaggio: '150ml/10L',
        applicazioni: 2,
        intervallo: '7 giorni',
        orario: 'Sera (18-20)',
        metodo: 'Nebulizzazione fogliare'
      }),
      alternatives: JSON.stringify([
        {
          title: 'Compost Tea',
          description: 'Alternativa biologica, effetto più lento',
          parameters: { prodotto: 'Compost tea', dosaggio: '1L/10L' },
          pros: ['100% biologico', 'Migliora microbioma'],
          cons: ['Effetto più lento', 'Aumento resa: +15% invece di +25%']
        }
      ]),
      expected_outcomes: JSON.stringify([
        { metric: 'Aumento resa', expectedValue: 25, unit: '%', timeframe: '14 giorni', confidence: 0.82 },
        { metric: 'Peso medio cespo', expectedValue: 350, unit: 'grammi', timeframe: 'Raccolta', confidence: 0.80 },
        { metric: 'Qualità foglie', expectedValue: 95, unit: 'score', timeframe: 'Raccolta', confidence: 0.85 }
      ]),
      status: 'PENDING'
    },
    {
      user_id: garden.user_id,
      garden_id: garden.id,
      suggestion_type: 'HARVEST_TIMING',
      context: 'Analisi maturazione e finestra ottimale',
      title: 'Finestra Raccolta Ottimale Pomodori',
      description: 'I tuoi pomodori San Marzano raggiungeranno la maturazione ottimale tra 5-7 giorni. Raccogli in questa finestra per massimizzare qualità.',
      reasoning: `Analisi maturazione:

1. Giorni dalla fioritura: 73 (target: 75-80)
2. Colore attuale: Verde-arancio (80% maturazione)
3. Dimensione: 95% della dimensione finale
4. Zuccheri (Brix): 4.2 (target: 4.5-5.0)

Previsione:
- Maturazione completa: 5-7 giorni
- Finestra ottimale: 18-22 Gennaio
- Qualità massima: 20 Gennaio (giorno ottimale)

Dopo questa finestra:
- Rischio sovramaturazione: +15%/giorno
- Perdita qualità: -5%/giorno
- Rischio spaccature: +10%/giorno`,
      data_sources: JSON.stringify([
        { type: 'plant_health', timestamp: new Date().toISOString(), data: { maturity: 80, brix: 4.2 }, reliability: 0.88 },
        { type: 'weather', timestamp: new Date().toISOString(), data: { temp_forecast: [22, 23, 21, 20, 22] }, reliability: 0.90 }
      ]),
      prediction_data: JSON.stringify({
        confidence: 0.88
      }),
      confidence_score: 0.88,
      suggested_action: 'Pianifica raccolta per 20 Gennaio (mattina presto). Prepara cassette e controlla ogni giorno il colore.',
      action_priority: 'HIGH',
      action_deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      suggested_parameters: JSON.stringify({
        data_ottimale: '20 Gennaio 2026',
        finestra_inizio: '18 Gennaio 2026',
        finestra_fine: '22 Gennaio 2026',
        orario_consigliato: '6-8 AM',
        metodo: 'Raccolta manuale con forbici',
        conservazione: 'Temperatura ambiente 18-20°C'
      }),
      expected_outcomes: JSON.stringify([
        { metric: 'Qualità pomodori', expectedValue: 95, unit: 'score', timeframe: 'Raccolta', confidence: 0.88 },
        { metric: 'Contenuto zuccheri', expectedValue: 4.8, unit: 'Brix', timeframe: 'Raccolta', confidence: 0.85 },
        { metric: 'Conservabilità', expectedValue: 14, unit: 'giorni', timeframe: 'Post-raccolta', confidence: 0.80 }
      ]),
      status: 'PENDING'
    }
  ]

  // Inserisci suggerimenti
  console.log('📝 Inserimento suggerimenti...\n')
  
  for (const suggestion of suggestions) {
    const { data, error } = await supabase
      .from('ai_suggestions')
      .insert([suggestion])
      .select()
      .single()

    if (error) {
      console.error(`❌ Errore inserimento: ${suggestion.title}`)
      console.error(error)
    } else {
      console.log(`✅ ${suggestion.title}`)
      console.log(`   Tipo: ${suggestion.suggestion_type}`)
      console.log(`   Priorità: ${suggestion.action_priority}`)
      console.log(`   Confidenza: ${(suggestion.confidence_score * 100).toFixed(0)}%\n`)

      // Crea anche transparency log
      const transparencyLog = {
        suggestion_id: data.id,
        decision_tree: JSON.stringify([
          { condition: 'Umidità > 80%', result: 'Rischio elevato', weight: 0.4 },
          { condition: 'Temperatura 18-24°C', result: 'Condizioni favorevoli', weight: 0.3 },
          { condition: 'Storico positivo', result: 'Pattern confermato', weight: 0.3 }
        ]),
        data_inputs: JSON.stringify({
          weather: { humidity: 85, temp: 21, wind: 4 },
          soil: { moisture: 65, ph: 6.8 },
          plants: { healthScore: 85, count: 12 }
        }),
        weights_applied: JSON.stringify({
          'Dati meteo': 0.40,
          'Salute piante': 0.30,
          'Dati storici': 0.20,
          'Preferenze utente': 0.10
        }),
        rules_triggered: JSON.stringify([
          { rule: 'Umidità critica', triggered: true, impact: 0.4 },
          { rule: 'Temperatura ottimale patogeno', triggered: true, impact: 0.3 },
          { rule: 'Ventilazione scarsa', triggered: true, impact: 0.2 }
        ]),
        calculations: JSON.stringify([
          {
            step: 'Calcolo probabilità base',
            formula: 'P = (humidity_factor * 0.4) + (temp_factor * 0.3) + (history_factor * 0.3)',
            inputs: { humidity_factor: 0.85, temp_factor: 0.75, history_factor: 0.80 },
            output: 0.805
          },
          {
            step: 'Aggiustamento per confidenza',
            formula: 'P_final = P_base * confidence_multiplier',
            inputs: { P_base: 0.805, confidence_multiplier: 0.97 },
            output: 0.78
          }
        ]),
        thresholds_used: JSON.stringify({
          'Umidità critica': 80,
          'Temperatura minima': 15,
          'Temperatura massima': 25,
          'Probabilità alert': 0.7
        }),
        alternatives_evaluated: JSON.stringify([
          { option: 'Nessun trattamento', score: 35, reason_not_chosen: 'Rischio troppo elevato (78%)' },
          { option: 'Trattamento biologico', score: 65, reason_not_chosen: 'Efficacia insufficiente per rischio HIGH' },
          { option: 'Trattamento rame (scelto)', score: 85, reason_not_chosen: 'N/A - Opzione selezionata' }
        ]),
        models_used: JSON.stringify(['Disease Prediction Model v2.1', 'Weather Pattern Analyzer v1.5']),
        model_versions: JSON.stringify(['2.1', '1.5'])
      }

      await supabase
        .from('ai_transparency_log')
        .insert([transparencyLog])
    }
  }

  console.log('\n✅ Test completato!')
  console.log('\n📍 Vai su: http://localhost:3002/app/ai-collaborative')
  console.log('   per vedere il sistema in azione!\n')
}

// Esegui
createTestSuggestions().catch(console.error)
