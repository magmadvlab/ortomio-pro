/**
 * Test Creazione Filare di Esempio
 * Crea un filare di esempio per testare il sistema
 */

console.log('🧪 TEST CREAZIONE FILARE DI ESEMPIO')
console.log('=' .repeat(50))

// Esempio di filare da creare
const filareEsempio = {
  id: `field_row_${Date.now()}`,
  garden_id: 'TUO_GARDEN_ID', // Sostituisci con il tuo garden ID
  name: 'Filare 1 - Pomodori',
  row_number: 1,
  length_meters: 10,
  distance_from_previous_row: 80, // cm
  cultivar: 'Pomodori San Marzano',
  plant_spacing: 50, // cm
  planted_date: new Date().toISOString().split('T')[0],
  orientation: 'N-S',
  
  // Configurazione irrigazione
  irrigation_enabled: true,
  irrigation_type: 'drip',
  tube_length: 10,
  tube_diameter: 16, // mm
  emitter_spacing: 30, // cm
  emitter_flow_rate: 2.0, // L/h
  flow_rate_per_meter: 6.67, // L/h per metro
  total_flow_rate: 66.7, // L/h totale
  pressure: 1.5, // bar
  
  // Programmazione irrigazione
  irrigation_frequency: 'daily',
  irrigation_times: ['08:00', '18:00'],
  irrigation_duration: 30, // minuti
  
  // Calcoli automatici
  plant_count: Math.floor((10 * 100) / 50), // 20 piante
  
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

console.log('✅ Filare di esempio configurato:')
console.log(`   - Nome: ${filareEsempio.name}`)
console.log(`   - Lunghezza: ${filareEsempio.length_meters}m`)
console.log(`   - Coltura: ${filareEsempio.cultivar}`)
console.log(`   - Piante: ${filareEsempio.plant_count} (spaziatura ${filareEsempio.plant_spacing}cm)`)
console.log(`   - Irrigazione: ${filareEsempio.irrigation_type} (${filareEsempio.total_flow_rate}L/h)`)
console.log(`   - Programmazione: ${filareEsempio.irrigation_frequency} alle ${filareEsempio.irrigation_times.join(', ')}`)

console.log('\n📋 SQL per creare il filare:')
console.log(`
INSERT INTO field_rows (
  id, garden_id, name, row_number, length_meters, 
  distance_from_previous_row, cultivar, plant_spacing, 
  planted_date, orientation, irrigation_enabled, 
  irrigation_type, tube_length, tube_diameter, 
  emitter_spacing, emitter_flow_rate, flow_rate_per_meter, 
  total_flow_rate, pressure, irrigation_frequency, 
  irrigation_times, irrigation_duration, plant_count, 
  is_active, created_at, updated_at
) VALUES (
  '${filareEsempio.id}',
  'TUO_GARDEN_ID', -- SOSTITUISCI CON IL TUO GARDEN ID
  '${filareEsempio.name}',
  ${filareEsempio.row_number},
  ${filareEsempio.length_meters},
  ${filareEsempio.distance_from_previous_row},
  '${filareEsempio.cultivar}',
  ${filareEsempio.plant_spacing},
  '${filareEsempio.planted_date}',
  '${filareEsempio.orientation}',
  ${filareEsempio.irrigation_enabled},
  '${filareEsempio.irrigation_type}',
  ${filareEsempio.tube_length},
  ${filareEsempio.tube_diameter},
  ${filareEsempio.emitter_spacing},
  ${filareEsempio.emitter_flow_rate},
  ${filareEsempio.flow_rate_per_meter},
  ${filareEsempio.total_flow_rate},
  ${filareEsempio.pressure},
  '${filareEsempio.irrigation_frequency}',
  ARRAY['${filareEsempio.irrigation_times.join("', '")}'],
  ${filareEsempio.irrigation_duration},
  ${filareEsempio.plant_count},
  ${filareEsempio.is_active},
  '${filareEsempio.created_at}',
  '${filareEsempio.updated_at}'
);
`)

console.log('\n🔧 ISTRUZIONI:')
console.log('1. Sostituisci TUO_GARDEN_ID con il tuo garden ID reale')
console.log('2. Esegui la query SQL nel tuo database')
console.log('3. Ricarica la dashboard')
console.log('4. Dovresti vedere il widget "Filari Campo Aperto"')

console.log('\n💡 ALTERNATIVA - Usa l\'interfaccia:')
console.log('1. Vai su Settings → Gardens → Modifica orto')
console.log('2. Scorri fino a "🌾 Filari Campo Aperto"')
console.log('3. Clicca "+ Aggiungi Filare"')
console.log('4. Compila i dati come nell\'esempio sopra')
console.log('5. Salva e torna alla dashboard')

console.log('\n🎯 RISULTATO ATTESO:')
console.log('Nella dashboard vedrai:')
console.log('• Widget "🌾 Filari Campo Aperto"')
console.log('• Informazioni complete del filare')
console.log('• Pulsanti operazioni rapide (⚡🛡️🔧)')
console.log('• Link navigazione (🔍💧)')
console.log('• Pulsante operazioni avanzate (⚙️)')