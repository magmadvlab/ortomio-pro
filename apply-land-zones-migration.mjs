#!/usr/bin/env node

/**
 * Applica migrazione Land Zones e Soil Memory al database Supabase
 * Usa le credenziali da .env.local
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://qhmujoivfxftlrcrluaj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFobXVqb2l2ZnhmdGxyY3JsdWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NzAzOTIsImV4cCI6MjA4MTM0NjM5Mn0.lRzjMzXLJ5XOmDmC62FaJCYtz4689VSDKLNesqaQ2FY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🚀 Applicazione Migrazione Land Zones e Soil Memory\n');
console.log('=' .repeat(60));

async function applyMigration() {
  try {
    console.log('\n📖 Lettura file migrazione...');
    const migrationSQL = readFileSync(
      'supabase/migrations/20260204120000_add_land_zones_and_soil_memory.sql',
      'utf-8'
    );
    
    console.log('✅ File letto correttamente\n');
    console.log('⚠️  ATTENZIONE: La chiave ANON non ha permessi per eseguire DDL.\n');
    console.log('📋 ISTRUZIONI PER APPLICARE LA MIGRAZIONE:\n');
    console.log('1. Apri il SQL Editor di Supabase:');
    console.log('   https://supabase.com/dashboard/project/qhmujoivfxftlrcrluaj/editor\n');
    console.log('2. Copia il contenuto del file:');
    console.log('   supabase/migrations/20260204120000_add_land_zones_and_soil_memory.sql\n');
    console.log('3. Incolla nel SQL Editor\n');
    console.log('4. Clicca "Run" (o premi Cmd+Enter)\n');
    console.log('5. Aspetta il messaggio: "✅ Migration completed successfully!"\n');
    console.log('6. Esegui di nuovo: node verify-migrations-status.mjs\n');
    
    console.log('=' .repeat(60));
    console.log('\n💡 ALTERNATIVA: Usa Supabase CLI\n');
    console.log('Se hai Supabase CLI installato:');
    console.log('  supabase link --project-ref qhmujoivfxftlrcrluaj');
    console.log('  supabase db push\n');
    
    // Salva il SQL in un file separato per comodità
    console.log('📝 Ho salvato la migrazione anche in: apply-land-zones-migration.sql');
    console.log('   Puoi copiare da lì se preferisci.\n');
    
    return migrationSQL;
    
  } catch (error) {
    console.error('\n❌ ERRORE:', error.message);
    process.exit(1);
  }
}

async function main() {
  const sql = await applyMigration();
  
  // Salva in un file separato per comodità
  const fs = await import('fs');
  fs.writeFileSync('apply-land-zones-migration.sql', sql);
  
  console.log('✅ Pronto! Segui le istruzioni sopra per applicare la migrazione.\n');
}

main();
