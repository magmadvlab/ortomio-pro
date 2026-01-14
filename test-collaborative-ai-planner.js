/**
 * Test Script per Sistema Collaborativo AI - Suggerimenti Planner
 * Popola il database con suggerimenti di pianificazione
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variabili ambiente mancanti!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createPlannerSuggestions() {
  console.log('🚀 Creazione suggerimenti AI per Planner...\n')

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

  // Suggerimenti di pianificazione
  const suggestions = [
    {
      user_id: garden.user_id,
      garden_id: garden.id,
      suggestion_type: 'PLANTING_PLAN',
      context: 'Analisi stagionale e condizioni ottimali',
      title: 'Pianifica Semina Pomodori - Finestra Ottimale',
      description: 'Le condizioni meteo e del suolo sono ideali per la semina dei pomodori. La finestra ottimale è nei prossimi 7 giorni.',
      reasoning: `Analisi completa delle condizioni:

1. Temperatura suolo: 16°C (ottimale: 15-18°C)
2. Temperatura aria: 18-22°C (ideale per germinazione)
3. Rischio gelate: 0% (ultima gelata prevista: passata)
4. Umidità suolo: 65% (perfetta per semina)
5. Fase lunare: Luna crescente (favorevole)

Storico: Semine in questo periodo hanno avuto:
- Tasso germinazione: 92%
- Tempo germinazione: 7-10 giorni
- Resa finale: +18% rispetto a semine tardive`,
      data_sources: JSON.stringify([
        { type: 'weather', timestamp: new Date().toISOString(), data: { temp_soil: 16, temp_air: 20 }, reliability: 0.95 },
        { type: 'soil', timestamp: new Date().toISOString(), data: { moisture: 65, ph: 6.5 }, reliability: 0.92 },
        { type: 'historical', timestamp: new Date().toISOString(), data: { success_rate: 0.92 }, reliability: 0.88 }
      ]),
      prediction_data: JSON.stringify({
        probability: 0.92,
        expectedYield: 4.5,
        confidence: 0.90
      }),
      confidence_score: 0.90,
      suggested_action: 'Semina pomodori varietà San Marzano entro 7 giorni. Prepara semenzaio protetto o semina diretta se clima stabile.',
      action_priority: 'HIGH',
      action_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      suggested_parameters: JSON.stringify({
        varieta: 'San Marzano',
        metodo: 'Semenzaio protetto',
        profondita: '1cm',
        distanza: '5cm tra semi',
        temperatura_germinazione: '20-25°C',
        giorni_germinazione: '7-10',
        trapianto_dopo: '30-40 giorni'
      }),
      alternatives: JSON.stringify([
        {
          title: 'Semina Diretta',
          description: 'Semina direttamente in campo, più semplice ma rischio maggiore',
          parameters: { metodo: 'Diretta', protezione: 'Tunnel' },
          pros: ['Meno lavoro', 'Piante più robuste'],
          cons: ['Rischio gelate tardive', 'Germinazione più lenta']
        },
        {
          title: 'Acquisto Piantine',
          description: 'Acquista piantine già pronte, più veloce',
          parameters: { fonte: 'Vivaio', età: '30 giorni' },
          pros: ['Risparmio tempo', 'Risultato garantito'],
          cons: ['Costo maggiore', 'Meno varietà disponibili']
        }
      ]),
      expected_outcomes: JSON.stringify([
        { metric: 'Tasso germinazione', expectedValue: 92, unit: '%', timeframe: '10 giorni', confidence: 0.90 },
        { metric: 'Resa finale', expectedValue: 4.5, unit: 'kg/pianta', timeframe: '120 giorni', confidence: 0.85 },
        { metric: 'Qualità frutti', expectedValue: 95, unit: 'score', timeframe: 'Raccolta', confidence: 0.88 }
      ]),
      status: 'PENDING'
    },
    {
      user_id: garden.user_id,
      garden_id: garden.id,
      suggestion_type: 'HARVEST_TIMING',
      context: 'Monitoraggio maturazione e finestra ottimale',
      title: 'Finestra Raccolta Lattuga - Qualità Massima',
      description: 'Le tue lattughe hanno raggiunto la maturazione ottimale. Raccogli nei prossimi 3 giorni per massimizzare qualità e croccantezza.',
      reasoning: `Analisi stato maturazione:

1. Giorni dalla semina: 45 (target: 40-50)
2. Dimensione cespo: 18cm diametro (ottimale: 15-20cm)
3. Compattezza: 85% (ideale per raccolta)
4. Colore foglie: Verde brillante (segno di freschezza)
5. Previsioni meteo: Temperature miti (ideale)

Finestra ottimale:
- Inizio: Oggi
- Fine: 3 giorni
- Giorno migliore: Domani mattina

Dopo questa finestra:
- Rischio montata a seme: +20%/giorno
- Perdita croccantezza: -10%/giorno
- Amarezza foglie: +15%/giorno`,
      data_sources: JSON.stringify([
        { type: 'plant_health', timestamp: new Date().toISOString(), data: { maturity: 90, size: 18 }, reliability: 0.93 },
        { type: 'weather', timestamp: new Date().toISOString(), data: { temp_forecast: [19, 21, 20] }, reliability: 0.90 }
      ]),
      prediction_data: JSON.stringify({
        confidence: 0.93
      }),
      confidence_score: 0.93,
      suggested_action: 'Raccogli lattughe domani mattina (6-8 AM) quando le foglie sono ancora fresche. Taglia alla base con coltello pulito.',
      action_priority: 'HIGH',
      action_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      suggested_parameters: JSON.stringify({
        data_ottimale: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        orario: '6-8 AM',
        metodo: 'Taglio alla base',
        strumento: 'Coltello affilato',
        conservazione: 'Frigorifero 4°C, consumo entro 5 giorni'
      }),
      expected_outcomes: JSON.stringify([
        { metric: 'Qualità lattuga', expectedValue: 95, unit: 'score', timeframe: 'Raccolta', confidence: 0.93 },
        { metric: 'Croccantezza', expectedValue: 90, unit: 'score', timeframe: 'Raccolta', confidence: 0.90 },
        { metric: 'Conservabilità', expectedValue: 5, unit: 'giorni', timeframe: 'Post-raccolta', confidence: 0.85 }
      ]),
      status: 'PENDING'
    },
    {
      user_id: garden.user_id,
      garden_id: garden.id,
      suggestion_type: 'ROTATION_PLAN',
      context: 'Analisi rotazione colture e salute suolo',
      title: 'Piano Rotazione - Leguminose dopo Solanacee',
      description: 'Dopo la raccolta dei pomodori, pianta leguminose (fagioli/piselli) per ripristinare l\'azoto nel suolo e migliorare la struttura.',
      reasoning: `Analisi rotazione ottimale:

1. Coltura precedente: Pomodori (Solanacee)
   - Consumo azoto: Alto
   - Livello azoto residuo: 18 mg/kg (basso)
   - Patogeni specifici: Presenti nel suolo

2. Coltura successiva consigliata: Leguminose
   - Fissano azoto: +40 kg/ha
   - Rompono ciclo patogeni
   - Migliorano struttura suolo

3. Benefici rotazione:
   - Ripristino azoto: +120%
   - Riduzione malattie: -75%
   - Miglioramento resa successiva: +30%

Storico: Rotazioni Solanacee → Leguminose hanno mostrato:
- Resa successiva: +28%
- Riduzione trattamenti: -60%
- Salute suolo: +45%`,
      data_sources: JSON.stringify([
        { type: 'soil', timestamp: new Date().toISOString(), data: { nitrogen: 18, ph: 6.8 }, reliability: 0.90 },
        { type: 'historical', timestamp: new Date().toISOString(), data: { rotation_success: 0.87 }, reliability: 0.85 }
      ]),
      prediction_data: JSON.stringify({
        expectedYield: 1.3,
        confidence: 0.87
      }),
      confidence_score: 0.87,
      suggested_action: 'Dopo raccolta pomodori, attendi 2 settimane, poi semina fagioli nani o piselli. Aggiungi compost maturo prima della semina.',
      action_priority: 'MEDIUM',
      action_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      suggested_parameters: JSON.stringify({
        coltura_successiva: 'Fagioli nani o Piselli',
        attesa_prima_semina: '14 giorni',
        preparazione_suolo: 'Compost maturo 3 kg/m²',
        semina: 'Diretta in campo',
        distanza: '30cm tra file, 10cm sulla fila',
        durata_ciclo: '60-70 giorni'
      }),
      alternatives: JSON.stringify([
        {
          title: 'Crucifere (Cavoli)',
          description: 'Alternativa valida, buona per rotazione',
          parameters: { coltura: 'Cavolo nero', preparazione: 'Letame maturo' },
          pros: ['Ciclo lungo', 'Resa elevata'],
          cons: ['Non fissa azoto', 'Richiede più nutrienti']
        },
        {
          title: 'Sovescio',
          description: 'Semina piante da sovescio per riposo suolo',
          parameters: { mix: 'Veccia + Segale', durata: '90 giorni' },
          pros: ['Massimo ripristino fertilità', 'Controllo infestanti'],
          cons: ['Nessun raccolto', 'Tempo più lungo']
        }
      ]),
      expected_outcomes: JSON.stringify([
        { metric: 'Azoto ripristinato', expectedValue: 40, unit: 'kg/ha', timeframe: '90 giorni', confidence: 0.87 },
        { metric: 'Resa coltura successiva', expectedValue: 30, unit: '% aumento', timeframe: 'Prossimo ciclo', confidence: 0.82 },
        { metric: 'Salute suolo', expectedValue: 45, unit: '% miglioramento', timeframe: '6 mesi', confidence: 0.85 }
      ]),
      status: 'PENDING'
    },
    {
      user_id: garden.user_id,
      garden_id: garden.id,
      suggestion_type: 'PLANTING_PLAN',
      context: 'Pianificazione semine scaglionate',
      title: 'Semina Scalare Basilico - Raccolto Continuo',
      description: 'Pianifica semine di basilico ogni 2 settimane per avere raccolto fresco continuo da Aprile a Settembre.',
      reasoning: `Strategia semina scalare:

1. Obiettivo: Raccolto continuo 6 mesi
2. Ciclo basilico: 40-50 giorni dalla semina
3. Finestra produttiva: 30 giorni per pianta

Piano semine:
- Semina 1: Ora (raccolto da metà Marzo)
- Semina 2: +14 giorni (raccolto da inizio Aprile)
- Semina 3: +28 giorni (raccolto da metà Aprile)
- Semina 4: +42 giorni (raccolto da Maggio)
- Semina 5: +56 giorni (raccolto da metà Maggio)

Vantaggi:
- Raccolto fresco sempre disponibile
- Nessun spreco (piante non montano a seme)
- Distribuzione lavoro nel tempo`,
      data_sources: JSON.stringify([
        { type: 'weather', timestamp: new Date().toISOString(), data: { temp_forecast_avg: 20 }, reliability: 0.88 },
        { type: 'historical', timestamp: new Date().toISOString(), data: { succession_success: 0.91 }, reliability: 0.86 }
      ]),
      prediction_data: JSON.stringify({
        expectedYield: 2.5,
        confidence: 0.89
      }),
      confidence_score: 0.89,
      suggested_action: 'Inizia prima semina ora, poi ripeti ogni 2 settimane. Usa semenzaio protetto per prime semine, poi diretta in campo.',
      action_priority: 'MEDIUM',
      action_deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      suggested_parameters: JSON.stringify({
        intervallo_semine: '14 giorni',
        numero_semine: 5,
        quantita_per_semina: '20 piante',
        metodo_prime_semine: 'Semenzaio protetto',
        metodo_semine_successive: 'Diretta in campo',
        varieta_consigliata: 'Genovese (classico)'
      }),
      expected_outcomes: JSON.stringify([
        { metric: 'Raccolto totale', expectedValue: 2.5, unit: 'kg', timeframe: '6 mesi', confidence: 0.89 },
        { metric: 'Continuità raccolto', expectedValue: 100, unit: '%', timeframe: '6 mesi', confidence: 0.91 },
        { metric: 'Qualità foglie', expectedValue: 92, unit: 'score', timeframe: 'Ogni raccolto', confidence: 0.87 }
      ]),
      status: 'PENDING'
    }
  ]

  // Inserisci suggerimenti
  console.log('📝 Inserimento suggerimenti pianificazione...\n')
  
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
          { condition: 'Condizioni ottimali', result: 'Finestra favorevole', weight: 0.4 },
          { condition: 'Storico positivo', result: 'Alta probabilità successo', weight: 0.3 },
          { condition: 'Fase lunare favorevole', result: 'Timing ottimale', weight: 0.3 }
        ]),
        data_inputs: JSON.stringify({
          weather: { temp: 20, humidity: 65 },
          soil: { moisture: 65, ph: 6.5 },
          lunar: { phase: 'crescente' }
        }),
        weights_applied: JSON.stringify({
          'Dati meteo': 0.40,
          'Dati suolo': 0.30,
          'Dati storici': 0.20,
          'Fase lunare': 0.10
        }),
        rules_triggered: JSON.stringify([
          { rule: 'Temperatura ottimale', triggered: true, impact: 0.4 },
          { rule: 'Umidità ideale', triggered: true, impact: 0.3 },
          { rule: 'Storico positivo', triggered: true, impact: 0.2 }
        ]),
        calculations: JSON.stringify([
          {
            step: 'Calcolo probabilità successo',
            formula: 'P = (weather_score * 0.4) + (soil_score * 0.3) + (history_score * 0.3)',
            inputs: { weather_score: 0.95, soil_score: 0.92, history_score: 0.88 },
            output: 0.92
          }
        ]),
        thresholds_used: JSON.stringify({
          'Temperatura minima': 15,
          'Umidità ottimale': 60,
          'Probabilità alert': 0.8
        }),
        alternatives_evaluated: JSON.stringify([
          { option: 'Attendi 2 settimane', score: 65, reason_not_chosen: 'Finestra ottimale è ora' },
          { option: 'Semina ora (scelto)', score: 92, reason_not_chosen: 'N/A - Opzione selezionata' }
        ]),
        models_used: JSON.stringify(['Planting Optimizer v1.8', 'Weather Pattern Analyzer v1.5']),
        model_versions: JSON.stringify(['1.8', '1.5'])
      }

      await supabase
        .from('ai_transparency_log')
        .insert([transparencyLog])
    }
  }

  console.log('\n✅ Test completato!')
  console.log('\n📍 Vai su: http://localhost:3002/app/planner')
  console.log('   poi click su tab "💡 Suggerimenti AI"\n')
}

// Esegui
createPlannerSuggestions().catch(console.error)
