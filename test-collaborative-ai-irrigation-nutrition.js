/**
 * Test Script per Sistema Collaborativo AI - Irrigazione e Nutrizione
 * Popola il database con suggerimenti per risparmio idrico e trattamenti
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variabili ambiente mancanti!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createIrrigationNutritionSuggestions() {
  console.log('🚀 Creazione suggerimenti AI per Irrigazione e Nutrizione...\n')

  // Cerca l'orto "orto di rob" o il primo disponibile
  const { data: gardens } = await supabase
    .from('gardens')
    .select('*')
    .or('name.ilike.%orto di rob%,name.ilike.%rob%')
    .limit(1)

  if (!gardens || gardens.length === 0) {
    const { data: allGardens } = await supabase
      .from('gardens')
      .select('*')
      .limit(1)
    
    if (!allGardens || allGardens.length === 0) {
      console.error('❌ Nessun orto trovato nel database.')
      return
    }
    
    gardens[0] = allGardens[0]
  }

  const garden = gardens[0]
  console.log(`✅ Orto trovato: ${garden.name}`)
  console.log(`✅ User ID: ${garden.user_id}\n`)

  // Suggerimenti
  const suggestions = [
    // IRRIGAZIONE - Risparmio Idrico
    {
      user_id: garden.user_id,
      garden_id: garden.id,
      suggestion_type: 'RESOURCE_SAVING',
      context: 'Analisi consumo idrico e previsioni meteo',
      title: 'Ottimizza Irrigazione - Risparmio 30% Acqua',
      description: 'Basandomi sulle previsioni meteo (piogge previste) e l\'umidità del suolo, puoi ridurre l\'irrigazione del 30% nei prossimi 7 giorni risparmiando 315 litri.',
      reasoning: `Analisi completa:

1. Previsioni meteo: 25mm di pioggia nei prossimi 5 giorni
2. Umidità suolo attuale: 65% (ottimale: 60-70%)
3. Evapotraspirazione prevista: 3.2mm/giorno
4. Capacità ritenzione suolo: Alta (terreno argilloso)

Calcolo risparmio:
- Fabbisogno normale: 150L/giorno
- Pioggia prevista: 25mm = ~40L/m²
- Riduzione possibile: 45L/giorno per 7 giorni = 315L totali
- Risparmio economico: €6.30/settimana
- Risparmio percentuale: 30%`,
      data_sources: JSON.stringify([
        { type: 'weather', timestamp: new Date().toISOString(), data: { precipitation_forecast: 25 }, reliability: 0.90 },
        { type: 'soil', timestamp: new Date().toISOString(), data: { moisture: 65 }, reliability: 0.95 }
      ]),
      prediction_data: JSON.stringify({
        expectedSavings: 6.30,
        confidence: 0.88
      }),
      confidence_score: 0.88,
      suggested_action: 'Riduci irrigazione a 105L/giorno (da 150L). Salta irrigazione nei giorni di pioggia prevista (Martedì e Giovedì).',
      action_priority: 'HIGH',
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
      suggestion_type: 'IRRIGATION',
      context: 'Ottimizzazione orari irrigazione',
      title: 'Cambia Orario Irrigazione - Risparmio 20%',
      description: 'Irrigando alle 5:00 AM invece che alle 8:00 AM, riduci l\'evaporazione del 20% risparmiando 180 litri/settimana.',
      reasoning: `Analisi evaporazione:

1. Orario attuale: 8:00 AM
   - Temperatura: 22°C
   - Evaporazione: 25%
   - Efficienza: 75%

2. Orario ottimale: 5:00 AM
   - Temperatura: 16°C
   - Evaporazione: 5%
   - Efficienza: 95%

Benefici cambio orario:
- Riduzione evaporazione: 20%
- Risparmio acqua: 180L/settimana
- Migliore assorbimento radicale
- Riduzione stress idrico piante`,
      data_sources: JSON.stringify([
        { type: 'weather', timestamp: new Date().toISOString(), data: { temp_morning: 16, temp_8am: 22 }, reliability: 0.92 }
      ]),
      prediction_data: JSON.stringify({
        expectedSavings: 180,
        confidence: 0.85
      }),
      confidence_score: 0.85,
      suggested_action: 'Riprogramma timer irrigazione per le 5:00 AM. Mantieni stessa quantità acqua ma con maggiore efficienza.',
      action_priority: 'MEDIUM',
      action_deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      suggested_parameters: JSON.stringify({
        nuovo_orario: '5:00 AM',
        durata: '30 minuti',
        frequenza: 'Ogni 2 giorni',
        beneficio: 'Riduzione evaporazione 20%'
      }),
      expected_outcomes: JSON.stringify([
        { metric: 'Risparmio acqua', expectedValue: 180, unit: 'litri', timeframe: '7 giorni', confidence: 0.85 },
        { metric: 'Efficienza irrigazione', expectedValue: 95, unit: '%', timeframe: 'Immediato', confidence: 0.90 }
      ]),
      status: 'PENDING'
    },
    // NUTRIZIONE - Prevenzione Malattie
    {
      user_id: garden.user_id,
      garden_id: garden.id,
      suggestion_type: 'DISEASE_PREVENTION',
      context: 'Analisi meteo e rischio peronospora',
      title: 'Previeni Peronospora Pomodori - Trattamento Urgente',
      description: 'Condizioni meteo favorevoli alla peronospora (umidità 85%, temp 21°C). Trattamento preventivo con rame entro 48 ore riduce rischio del 85%.',
      reasoning: `Analisi rischio malattia:

1. Condizioni attuali:
   - Umidità: 85% (soglia critica: 80%)
   - Temperatura: 21°C (range ottimale patogeno: 15-25°C)
   - Piogge previste: 15mm nei prossimi 3 giorni
   - Ventilazione: Scarsa (<5 km/h)

2. Probabilità sviluppo peronospora: 78%

3. Efficacia trattamento preventivo:
   - Rame: 85% riduzione rischio
   - Finestra intervento: 48 ore
   - Costo: €12 vs €80 trattamento curativo

Storico: Nel 2025 con condizioni simili, peronospora si è sviluppata in 7 giorni causando perdita 40% raccolto.`,
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
      suggested_action: 'Applicare trattamento preventivo con ossicloruro di rame (200g/100L acqua) entro 48 ore. Migliorare ventilazione rimuovendo foglie basali.',
      action_priority: 'CRITICAL',
      action_deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      suggested_parameters: JSON.stringify({
        prodotto: 'Ossicloruro di rame',
        dosaggio: '200g/100L',
        volume_acqua: '100L',
        metodo_applicazione: 'Nebulizzazione fogliare',
        orario_consigliato: 'Mattina presto (6-8 AM)',
        ripetizione: 'Dopo 7 giorni se piove'
      }),
      expected_outcomes: JSON.stringify([
        { metric: 'Riduzione rischio malattia', expectedValue: 85, unit: '%', timeframe: '7 giorni', confidence: 0.85 },
        { metric: 'Piante protette', expectedValue: 95, unit: '%', timeframe: '14 giorni', confidence: 0.80 },
        { metric: 'Risparmio economico', expectedValue: 68, unit: '€', timeframe: 'Stagione', confidence: 0.75 }
      ]),
      status: 'PENDING'
    },
    // NUTRIZIONE - Ottimizzazione Resa
    {
      user_id: garden.user_id,
      garden_id: garden.id,
      suggestion_type: 'YIELD_OPTIMIZATION',
      context: 'Fase crescita ottimale per boost nutrizionale',
      title: 'Aumenta Resa Lattuga +25% - Trattamento Fogliare',
      description: 'Le lattughe sono in fase ottimale (settimana 4/6) per trattamento fogliare azotato. Può aumentare resa del 25% e peso cespo di 80g.',
      reasoning: `Analisi opportunità:

1. Fase crescita: Formazione cespo (settimana 4/6)
2. Salute piante: 88% (ottima)
3. Condizioni meteo: Ideali (18-22°C, sole)
4. Nutrizione: Azoto leggermente basso (18 mg/kg)

Opportunità identificata:
Trattamento fogliare con azoto organico in questa fase può:
- Accelerare formazione cespo: +15%
- Aumentare peso finale: +25% (+80g per cespo)
- Migliorare qualità foglie: +20%
- Aumentare croccantezza: +15%

Storico: 8 utenti hanno ottenuto +23% resa media con questo trattamento.
Costo: €8 vs valore raccolto extra: €35`,
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
      suggested_action: 'Applica fertilizzante fogliare azotato (NPK 20-5-5) alla dose di 150ml/10L acqua. Ripeti dopo 7 giorni per risultati ottimali.',
      action_priority: 'HIGH',
      action_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      suggested_parameters: JSON.stringify({
        prodotto: 'Fertilizzante fogliare NPK 20-5-5',
        dosaggio: '150ml/10L',
        applicazioni: 2,
        intervallo: '7 giorni',
        orario: 'Sera (18-20)',
        metodo: 'Nebulizzazione fogliare'
      }),
      expected_outcomes: JSON.stringify([
        { metric: 'Aumento resa', expectedValue: 25, unit: '%', timeframe: '14 giorni', confidence: 0.82 },
        { metric: 'Peso medio cespo', expectedValue: 350, unit: 'grammi', timeframe: 'Raccolta', confidence: 0.80 },
        { metric: 'Qualità foglie', expectedValue: 95, unit: 'score', timeframe: 'Raccolta', confidence: 0.85 },
        { metric: 'ROI', expectedValue: 337, unit: '%', timeframe: 'Stagione', confidence: 0.78 }
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
          { condition: 'Analisi condizioni', result: 'Opportunità identificata', weight: 0.4 },
          { condition: 'Storico positivo', result: 'Alta probabilità successo', weight: 0.3 },
          { condition: 'Timing ottimale', result: 'Finestra favorevole', weight: 0.3 }
        ]),
        data_inputs: JSON.stringify({
          weather: { temp: 20, humidity: 65 },
          soil: { moisture: 65, nitrogen: 18 },
          plants: { healthScore: 88 }
        }),
        weights_applied: JSON.stringify({
          'Dati meteo': 0.40,
          'Dati suolo': 0.30,
          'Salute piante': 0.20,
          'Dati storici': 0.10
        }),
        rules_triggered: JSON.stringify([
          { rule: 'Condizioni ottimali', triggered: true, impact: 0.4 },
          { rule: 'Fase crescita ideale', triggered: true, impact: 0.3 }
        ]),
        calculations: JSON.stringify([
          {
            step: 'Calcolo beneficio',
            formula: 'Benefit = (condition_score * 0.4) + (timing_score * 0.3) + (history_score * 0.3)',
            inputs: { condition_score: 0.90, timing_score: 0.85, history_score: 0.82 },
            output: 0.86
          }
        ]),
        thresholds_used: JSON.stringify({
          'Confidenza minima': 0.75,
          'ROI minimo': 200
        }),
        alternatives_evaluated: JSON.stringify([
          { option: 'Nessun intervento', score: 45, reason_not_chosen: 'Opportunità persa' },
          { option: 'Intervento proposto', score: 86, reason_not_chosen: 'N/A - Selezionato' }
        ]),
        models_used: JSON.stringify(['Resource Optimizer v2.0', 'Disease Predictor v1.8']),
        model_versions: JSON.stringify(['2.0', '1.8'])
      }

      await supabase
        .from('ai_transparency_log')
        .insert([transparencyLog])
    }
  }

  console.log('\n✅ Test completato!')
  console.log('\n📍 Vai su:')
  console.log('   - http://localhost:3002/app/irrigation (Suggerimenti Irrigazione)')
  console.log('   - http://localhost:3002/app/nutrition (Suggerimenti Nutrizione)\n')
}

// Esegui
createIrrigationNutritionSuggestions().catch(console.error)
