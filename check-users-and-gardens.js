/**
 * Verifica utenti e orti nel database remoto
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variabili ambiente mancanti!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
  console.log('🔍 Verifica Database Remoto\n')
  console.log('URL:', supabaseUrl)
  console.log('Auth richiesto: SÌ (BYPASS_AUTH=false)\n')
  console.log('─'.repeat(60))
  
  // Verifica utenti (tabella auth.users - potrebbe non essere accessibile)
  console.log('\n📊 VERIFICA ORTI:\n')
  
  const { data: gardens, error: gardensError } = await supabase
    .from('gardens')
    .select('*')
    .limit(10)
  
  if (gardensError) {
    console.log('❌ Errore accesso tabella gardens:', gardensError.message)
    console.log('\n⚠️  POSSIBILI CAUSE:')
    console.log('   1. RLS (Row Level Security) attivo - serve login')
    console.log('   2. Nessun orto nel database')
    console.log('   3. Permessi insufficienti\n')
  } else if (!gardens || gardens.length === 0) {
    console.log('❌ Nessun orto trovato nel database remoto\n')
    console.log('📝 COSA FARE:')
    console.log('   1. Apri: http://localhost:3002')
    console.log('   2. Registrati o fai login')
    console.log('   3. Crea un orto chiamato "orto di rob"')
    console.log('   4. Riesegui questo script\n')
  } else {
    console.log(`✅ Trovati ${gardens.length} orti:\n`)
    gardens.forEach((g, i) => {
      console.log(`${i + 1}. ${g.name}`)
      console.log(`   ID: ${g.id}`)
      console.log(`   User: ${g.user_id}`)
      console.log(`   Tipo: ${g.garden_type || 'N/A'}`)
      console.log(`   Creato: ${new Date(g.created_at).toLocaleString('it-IT')}\n`)
    })
  }
  
  console.log('─'.repeat(60))
  
  // Verifica tabelle AI
  console.log('\n🤖 VERIFICA TABELLE AI:\n')
  
  const tables = [
    'ai_suggestions',
    'user_decisions', 
    'success_metrics',
    'learning_feedback',
    'ai_transparency_log'
  ]
  
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('id')
      .limit(1)
    
    if (error) {
      console.log(`❌ ${table}: ${error.message}`)
    } else {
      console.log(`✅ ${table}: Accessibile`)
    }
  }
  
  console.log('\n─'.repeat(60))
  console.log('\n📋 RIEPILOGO:\n')
  
  if (gardensError || !gardens || gardens.length === 0) {
    console.log('❌ Database remoto NON pronto per test')
    console.log('\n🔐 AUTENTICAZIONE RICHIESTA:')
    console.log('   Il tuo .env.local ha BYPASS_AUTH=false')
    console.log('   Questo significa che DEVI fare login\n')
    console.log('🎯 PROSSIMI STEP:')
    console.log('   1. Apri http://localhost:3002')
    console.log('   2. Registrati/Login')
    console.log('   3. Crea orto "orto di rob"')
    console.log('   4. Poi esegui: node test-collaborative-ai-system.js\n')
  } else {
    console.log('✅ Database remoto pronto!')
    console.log(`✅ ${gardens.length} orti disponibili`)
    console.log('\n🎯 PROSSIMO STEP:')
    console.log('   node test-collaborative-ai-system.js\n')
  }
}

checkDatabase().catch(console.error)
