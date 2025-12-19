/**
 * Script per applicare la migrazione SQL al database Supabase online
 * 
 * Uso:
 *   npm run apply:plant-migration
 * 
 * Richiede variabili d'ambiente:
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY (o SUPABASE_ANON_KEY)
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Errore: Variabili d\'ambiente mancanti!');
  console.error('   Richiesto: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (o SUPABASE_ANON_KEY)');
  console.error('\n   Esempio:');
  console.error('   SUPABASE_URL=https://xxx.supabase.co');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=xxx');
  console.error('   npm run apply:plant-migration');
  process.exit(1);
}

async function applyMigration(): Promise<void> {
  console.log('🌱 Applicazione migrazione plant_taxonomy al database online...\n');

  // Leggi il file SQL
  const sqlPath = join(process.cwd(), 'database', 'migrations', 'update_plant_taxonomy_from_local.sql');
  let sql: string;
  
  try {
    sql = readFileSync(sqlPath, 'utf-8');
  } catch (error: any) {
    console.error(`❌ Errore: Impossibile leggere il file SQL: ${sqlPath}`);
    console.error(`   ${error.message}`);
    process.exit(1);
  }

  // Crea client Supabase
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Dividi SQL in statement separati (semplificato - per statement complessi usa RPC)
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`📝 Trovati ${statements.length} statement SQL da eseguire\n`);

  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  // Esegui ogni statement
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    
    // Salta commenti e statement vuoti
    if (statement.startsWith('--') || statement.length < 10) {
      continue;
    }

    try {
      // Usa RPC per eseguire SQL raw (richiede funzione custom o uso diretto di PostgREST)
      // Nota: Supabase JS client non supporta direttamente SQL raw
      // Opzione 1: Usa REST API direttamente
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ sql: statement + ';' }),
      });

      if (!response.ok) {
        // Se RPC non esiste, usa approccio alternativo
        // Per ora, logga e continua
        console.warn(`⚠️  Statement ${i + 1}: RPC non disponibile, usa Supabase Dashboard o psql`);
        console.warn(`   SQL: ${statement.substring(0, 100)}...`);
        continue;
      }

      successCount++;
      if ((i + 1) % 10 === 0) {
        console.log(`   ✅ Eseguiti ${i + 1}/${statements.length} statement...`);
      }
    } catch (error: any) {
      errorCount++;
      const errorMsg = `Statement ${i + 1}: ${error.message}`;
      errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }
  }

  console.log('\n📊 Risultati:');
  console.log(`   ✅ Successi: ${successCount}`);
  console.log(`   ❌ Errori: ${errorCount}`);

  if (errors.length > 0) {
    console.log('\n⚠️  Errori dettagliati:');
    errors.forEach(err => console.log(`   - ${err}`));
  }

  if (errorCount === 0 && successCount > 0) {
    console.log('\n✅ Migrazione completata con successo!');
  } else if (errorCount > 0) {
    console.log('\n⚠️  Migrazione completata con errori. Verifica i log sopra.');
    console.log('\n💡 Suggerimento: Usa Supabase Dashboard (SQL Editor) per eseguire il file SQL manualmente.');
    process.exit(1);
  } else {
    console.log('\n⚠️  Nessuno statement eseguito. Verifica il file SQL.');
    console.log('\n💡 Suggerimento: Usa Supabase Dashboard (SQL Editor) per eseguire il file SQL manualmente.');
  }
}

// Esegui
applyMigration().catch(error => {
  console.error('❌ Errore fatale:', error);
  process.exit(1);
});

