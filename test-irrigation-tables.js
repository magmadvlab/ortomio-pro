// Test script to check if irrigation tables exist
// Run with: node test-irrigation-tables.js

import { createClient } from '@supabase/supabase-js'

// You'll need to set these environment variables or replace with your values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkIrrigationTables() {
  console.log('Checking irrigation tables...')
  
  const tablesToCheck = [
    'irrigation_zones',
    'irrigation_systems', 
    'irrigation_logs',
    'irrigation_schedules'
  ]
  
  for (const tableName of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (error) {
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          console.log(`❌ Table '${tableName}' does not exist`)
        } else {
          console.log(`⚠️  Table '${tableName}' exists but has error: ${error.message}`)
        }
      } else {
        console.log(`✅ Table '${tableName}' exists`)
      }
    } catch (err) {
      console.log(`❌ Error checking table '${tableName}': ${err.message}`)
    }
  }
  
  console.log('\nIf any tables are missing, run the irrigation migration:')
  console.log('supabase migration up --file supabase/migrations/20260117010000_create_advanced_irrigation_system.sql')
}

checkIrrigationTables().catch(console.error)