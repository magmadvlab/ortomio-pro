#!/usr/bin/env node

/**
 * Test connessione database remoto
 * Verifica se l'app riesce a connettersi e recuperare dati dal database remoto
 */

import { createClient } from '@supabase/supabase-js'

// Configurazione database remoto
const REMOTE_SUPABASE_URL = 'https://qhmujoivfxftlrcrluaj.supabase.co'
const REMOTE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFobXVqb2l2ZnhmdGxyY3JsdWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NzAzOTIsImV4cCI6MjA4MTM0NjM5Mn0.lRzjMzXLJ5XOmDmC62FaJCYtz4689VSDKLNesqaQ2FY'

console.log('🔍 TEST CONNESSIONE DATABASE REMOTO')
console.log('=====================================')

async function testRemoteConnection() {
  try {
    // Crea client Supabase remoto
    const supabase = createClient(REMOTE_SUPABASE_URL, REMOTE_SUPABASE_ANON_KEY)
    
    console.log('✅ Client Supabase creato')
    console.log(`📡 URL: ${REMOTE_SUPABASE_URL}`)
    
    // Test 1: Verifica connessione base
    console.log('\n🔍 Test 1: Verifica connessione base...')
    const { data: healthCheck, error: healthError } = await supabase
      .from('gardens')
      .select('count')
      .limit(1)
    
    if (healthError) {
      console.error('❌ Errore connessione:', healthError.message)
      return false
    }
    
    console.log('✅ Connessione al database remoto OK')
    
    // Test 2: Recupera orti
    console.log('\n🔍 Test 2: Recupero orti...')
    const { data: gardens, error: gardensError } = await supabase
      .from('gardens')
      .select('*')
    
    if (gardensError) {
      console.error('❌ Errore recupero orti:', gardensError.message)
      return false
    }
    
    console.log(`✅ Trovati ${gardens?.length || 0} orti:`)
    gardens?.forEach((garden, index) => {
      console.log(`   ${index + 1}. ${garden.name} (ID: ${garden.id})`)
      console.log(`      📍 Località: ${garden.location || 'Non specificata'}`)
      console.log(`      📏 Dimensione: ${garden.size || 'Non specificata'}`)
      console.log(`      📅 Creato: ${new Date(garden.created_at).toLocaleDateString('it-IT')}`)
    })
    
    // Test 3: Recupera task
    console.log('\n🔍 Test 3: Recupero task...')
    const { data: tasks, error: tasksError } = await supabase
      .from('garden_tasks')
      .select('*')
      .limit(10)
    
    if (tasksError) {
      console.error('❌ Errore recupero task:', tasksError.message)
      console.log('ℹ️  Questo potrebbe essere normale se la tabella non esiste')
    } else {
      console.log(`✅ Trovati ${tasks?.length || 0} task`)
      tasks?.slice(0, 3).forEach((task, index) => {
        console.log(`   ${index + 1}. ${task.plant_name || task.plantName} - ${task.task_type || task.taskType}`)
      })
    }
    
    // Test 4: Verifica autenticazione
    console.log('\n🔍 Test 4: Verifica stato autenticazione...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log('⚠️  Nessun utente autenticato (normale per test anonimo)')
    } else if (user) {
      console.log(`✅ Utente autenticato: ${user.email}`)
    } else {
      console.log('ℹ️  Nessun utente autenticato')
    }
    
    // Test 5: Verifica tabelle esistenti
    console.log('\n🔍 Test 5: Verifica struttura database...')
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_names')
      .catch(() => null)
    
    if (!tablesError && tables) {
      console.log('✅ Tabelle disponibili:', tables.join(', '))
    } else {
      console.log('ℹ️  Non è possibile verificare le tabelle (normale)')
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Errore generale:', error.message)
    return false
  }
}

async function main() {
  const success = await testRemoteConnection()
  
  console.log('\n📊 RISULTATO TEST')
  console.log('==================')
  
  if (success) {
    console.log('✅ Connessione al database remoto FUNZIONANTE')
    console.log('💡 Se l\'app non recupera i dati, il problema potrebbe essere:')
    console.log('   - Cache del browser')
    console.log('   - Configurazione environment variables')
    console.log('   - Problemi di autenticazione nell\'app')
  } else {
    console.log('❌ Problemi con la connessione al database remoto')
    console.log('💡 Possibili soluzioni:')
    console.log('   - Verificare le credenziali Supabase')
    console.log('   - Controllare la connessione internet')
    console.log('   - Verificare che il progetto Supabase sia attivo')
  }
  
  console.log('\n🔧 PROSSIMI PASSI:')
  console.log('1. Se il test è OK, pulire cache browser (Ctrl+Shift+R)')
  console.log('2. Verificare console browser per errori JavaScript')
  console.log('3. Controllare Network tab per richieste fallite')
}

main().catch(console.error)