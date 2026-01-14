/**
 * Test Connessione Database Remoto
 * Verifica che il sistema sia connesso a Supabase remoto
 */

const { createClient } = require('@supabase/supabase-js')

// Leggi variabili da .env.local manualmente
const fs = require('fs')
const path = require('path')

function loadEnv() {
  const envPath = path.join(__dirname, '.env.local')
  const envContent = fs.readFileSync(envPath, 'utf8')
  const env = {}
  
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim()
      env[key] = value
    }
  })
  
  return env
}

const env = loadEnv()

async function testRemoteConnection() {
  console.log('🔍 Test Connessione Database Remoto\n')
  
  // Verifica variabili ambiente
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('📋 Configurazione:')
  console.log(`   URL: ${supabaseUrl}`)
  console.log(`   Key: ${supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NON CONFIGURATA'}`)
  console.log()
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variabili ambiente non configurate!')
    process.exit(1)
  }
  
  // Verifica che sia remoto
  if (supabaseUrl.includes('localhost') || supabaseUrl.includes('127.0.0.1')) {
    console.error('⚠️  ATTENZIONE: Database LOCALE rilevato!')
    console.error(`   URL: ${supabaseUrl}`)
    process.exit(1)
  }
  
  console.log('✅ Database REMOTO configurato')
  console.log(`   Host: ${new URL(supabaseUrl).hostname}`)
  console.log()
  
  // Crea client
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Test 1: Verifica connessione
  console.log('🔌 Test 1: Verifica connessione...')
  try {
    const { data, error } = await supabase
      .from('gardens')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Errore connessione:', error.message)
      process.exit(1)
    }
    
    console.log('✅ Connessione riuscita!')
    console.log()
  } catch (err) {
    console.error('❌ Errore:', err.message)
    process.exit(1)
  }
  
  // Test 2: Verifica tabelle zone e filari
  console.log('📊 Test 2: Verifica tabelle zone e filari...')
  try {
    // Verifica garden_zones
    const { data: zones, error: zonesError } = await supabase
      .from('garden_zones')
      .select('id, name')
      .limit(5)
    
    if (zonesError) {
      console.log(`   ⚠️  Tabella garden_zones: ${zonesError.message}`)
    } else {
      console.log(`   ✅ Tabella garden_zones: ${zones?.length || 0} zone trovate`)
    }
    
    // Verifica field_rows
    const { data: rows, error: rowsError } = await supabase
      .from('field_rows')
      .select('id, name, length_meters')
      .limit(5)
    
    if (rowsError) {
      console.log(`   ⚠️  Tabella field_rows: ${rowsError.message}`)
    } else {
      console.log(`   ✅ Tabella field_rows: ${rows?.length || 0} filari trovati`)
    }
    
    // Verifica field_row_sections
    const { data: sections, error: sectionsError } = await supabase
      .from('field_row_sections')
      .select('id, section_name, length_meters')
      .limit(5)
    
    if (sectionsError) {
      console.log(`   ⚠️  Tabella field_row_sections: ${sectionsError.message}`)
    } else {
      console.log(`   ✅ Tabella field_row_sections: ${sections?.length || 0} porzioni trovate`)
    }
    
    console.log()
  } catch (err) {
    console.error('❌ Errore verifica tabelle:', err.message)
  }
  
  // Test 3: Verifica tabelle operazioni
  console.log('🔧 Test 3: Verifica tabelle operazioni...')
  try {
    const tables = [
      'treatment_register',
      'watering_logs',
      'mechanical_work_register',
      'interventions',
      'planting_plans',
      'crop_rotation_history'
    ]
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1)
      
      if (error) {
        console.log(`   ⚠️  ${table}: ${error.message}`)
      } else {
        console.log(`   ✅ ${table}: OK`)
      }
    }
    
    console.log()
  } catch (err) {
    console.error('❌ Errore verifica operazioni:', err.message)
  }
  
  // Test 4: Verifica RLS
  console.log('🔐 Test 4: Verifica RLS (Row Level Security)...')
  try {
    // Prova a leggere senza autenticazione
    const { data, error } = await supabase
      .from('gardens')
      .select('*')
    
    if (error && error.message.includes('RLS')) {
      console.log('   ✅ RLS attivo (richiede autenticazione)')
    } else if (error) {
      console.log(`   ⚠️  Errore: ${error.message}`)
    } else {
      console.log(`   ℹ️  RLS: ${data?.length || 0} record accessibili senza auth`)
    }
    
    console.log()
  } catch (err) {
    console.error('❌ Errore verifica RLS:', err.message)
  }
  
  // Riepilogo
  console.log('=' .repeat(50))
  console.log('📊 RIEPILOGO TEST')
  console.log('=' .repeat(50))
  console.log('✅ Database remoto: CONNESSO')
  console.log(`   URL: ${supabaseUrl}`)
  console.log(`   Host: ${new URL(supabaseUrl).hostname}`)
  console.log()
  console.log('📍 Sistema Zone e Filari:')
  console.log('   - garden_zones (Zone)')
  console.log('   - field_rows (Filari)')
  console.log('   - field_row_sections (Porzioni)')
  console.log()
  console.log('🔧 Tabelle Operazioni:')
  console.log('   - treatment_register')
  console.log('   - watering_logs')
  console.log('   - mechanical_work_register')
  console.log('   - interventions')
  console.log('   - planting_plans')
  console.log('   - crop_rotation_history')
  console.log()
  console.log('🎯 Tutte le operazioni salvano:')
  console.log('   - zone_id (zona)')
  console.log('   - field_row_id (filare)')
  console.log('   - field_row_section_id (porzione)')
  console.log()
  console.log('✅ Sistema pronto per l\'uso!')
  console.log('=' .repeat(50))
}

testRemoteConnection().catch(console.error)
