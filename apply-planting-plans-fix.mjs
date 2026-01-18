/**
 * Apply Planting Plans Table Fix
 * Applica il fix per creare la tabella planting_plans
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qhmujoivfxftlrcrluaj.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFobXVqb2l2ZnhmdGxyY3JsdWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NzAzOTIsImV4cCI6MjA4MTM0NjM5Mn0.lRzjMzXLJ5XOmDmC62FaJCYtz4689VSDKLNesqaQ2FY'

console.log('🔧 Applying Planting Plans Table Fix...\n')

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyFix() {
  try {
    // Prima verifica se la tabella esiste già
    console.log('1️⃣ Checking if planting_plans table exists...')
    
    const { data: existingTable, error: checkError } = await supabase
      .from('planting_plans')
      .select('id')
      .limit(1)
    
    if (!checkError) {
      console.log('✅ planting_plans table already exists!')
      console.log('📊 Table is accessible and working')
      return
    }
    
    if (checkError.code !== 'PGRST205') {
      console.log('⚠️ Unexpected error:', checkError.message)
      return
    }
    
    console.log('❌ planting_plans table not found (PGRST205)')
    console.log('🔧 Applying fix...\n')
    
    // Leggi il file SQL
    const sqlContent = readFileSync('APPLY_PLANTING_PLANS_TABLE_SIMPLE_FIX_JAN18.sql', 'utf8')
    
    // Dividi in statement separati (evita problemi con funzioni)
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && !s.startsWith('/*'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    // Esegui ogni statement separatamente
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (!statement) continue
      
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`)
      
      try {
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: statement + ';' 
        })
        
        if (error) {
          console.log(`⚠️ Statement ${i + 1} error:`, error.message)
          // Continua con gli altri statement
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
        }
      } catch (err) {
        console.log(`⚠️ Statement ${i + 1} failed:`, err.message)
      }
    }
    
    // Verifica finale
    console.log('\n🧪 Testing table creation...')
    
    const { data: finalTest, error: finalError } = await supabase
      .from('planting_plans')
      .select('id')
      .limit(1)
    
    if (finalError) {
      if (finalError.code === 'PGRST205') {
        console.log('❌ Table still not found. Manual intervention required.')
        console.log('📋 Please apply the SQL fix manually in Supabase Dashboard:')
        console.log('   1. Go to https://supabase.com/dashboard')
        console.log('   2. Open SQL Editor')
        console.log('   3. Copy and paste APPLY_PLANTING_PLANS_TABLE_SIMPLE_FIX_JAN18.sql')
        console.log('   4. Run the query')
      } else {
        console.log('⚠️ Unexpected error:', finalError.message)
      }
    } else {
      console.log('🎉 SUCCESS! planting_plans table created and accessible!')
      console.log('✅ The PGRST205 error should now be resolved')
    }
    
  } catch (error) {
    console.error('❌ Fix application failed:', error.message)
    console.log('\n📋 Manual fix required:')
    console.log('   1. Open Supabase Dashboard SQL Editor')
    console.log('   2. Execute: APPLY_PLANTING_PLANS_TABLE_SIMPLE_FIX_JAN18.sql')
  }
}

applyFix()