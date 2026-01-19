#!/usr/bin/env node

// Script to apply the irrigation migration
// Run with: node apply-irrigation-migration.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables')
  console.error('You need the service role key to run migrations')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyIrrigationMigration() {
  try {
    console.log('Checking if irrigation tables exist...')
    
    // Check if irrigation_zones table exists
    const { data, error } = await supabase
      .from('irrigation_zones')
      .select('id')
      .limit(1)
    
    if (!error) {
      console.log('✅ Irrigation tables already exist. No migration needed.')
      return
    }
    
    if (!error.message.includes('relation') || !error.message.includes('does not exist')) {
      console.error('❌ Unexpected error checking tables:', error.message)
      return
    }
    
    console.log('📦 Reading migration file...')
    const migrationSQL = readFileSync('supabase/migrations/20260117010000_create_advanced_irrigation_system.sql', 'utf8')
    
    console.log('🚀 Applying irrigation migration...')
    const { error: migrationError } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (migrationError) {
      console.error('❌ Migration failed:', migrationError.message)
      return
    }
    
    console.log('✅ Irrigation migration applied successfully!')
    console.log('🎉 You can now use the irrigation dashboard.')
    
  } catch (err) {
    console.error('❌ Error applying migration:', err.message)
  }
}

applyIrrigationMigration()