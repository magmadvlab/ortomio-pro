/**
 * Quick Database Check - Verifica Rapida Tabelle Mancanti
 * Genera SQL per controllo immediato
 */

import fs from 'fs';

const CRITICAL_TABLES = [
  'globalgap_compliance_checklist',
  'globalgap_self_assessments', 
  'individual_plants',
  'plant_operations',
  'prescription_maps',
  'prescription_zones',
  'operation_sync_log'
];

const CRITICAL_COLUMNS = [
  { table: 'watering_logs', column: 'field_row_id' },
  { table: 'fertilizer_application_logs', column: 'field_row_id' },
  { table: 'treatment_register', column: 'field_row_id' }
];

function generateQuickCheck() {
  let sql = `-- QUICK DATABASE CHECK - OrtoMio\n`;
  sql += `-- Esegui questo in Supabase per vedere cosa manca\n\n`;
  
  sql += `-- 🔍 CHECK TABELLE CRITICHE\n`;
  sql += `SELECT \n`;
  sql += `  '📊 TABELLE' as categoria,\n`;
  sql += `  table_name,\n`;
  sql += `  CASE \n`;
  sql += `    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = expected.table_name)\n`;
  sql += `    THEN '✅ EXISTS' \n`;
  sql += `    ELSE '❌ MISSING - MIGRAZIONE NECESSARIA'\n`;
  sql += `  END as status\n`;
  sql += `FROM (VALUES\n`;
  
  CRITICAL_TABLES.forEach((table, index) => {
    sql += `  ('${table}')`;
    if (index < CRITICAL_TABLES.length - 1) {
      sql += `,\n`;
    } else {
      sql += `\n`;
    }
  });
  
  sql += `) AS expected(table_name)\n\n`;
  
  sql += `UNION ALL\n\n`;
  
  sql += `-- 🔍 CHECK COLONNE CRITICHE\n`;
  sql += `SELECT \n`;
  sql += `  '📋 COLONNE' as categoria,\n`;
  sql += `  table_name || '.' || column_name as table_name,\n`;
  sql += `  CASE \n`;
  sql += `    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = expected.table_name AND column_name = expected.column_name)\n`;
  sql += `    THEN '✅ EXISTS' \n`;
  sql += `    ELSE '❌ MISSING - MIGRAZIONE NECESSARIA'\n`;
  sql += `  END as status\n`;
  sql += `FROM (VALUES\n`;
  
  CRITICAL_COLUMNS.forEach((col, index) => {
    sql += `  ('${col.table}', '${col.column}')`;
    if (index < CRITICAL_COLUMNS.length - 1) {
      sql += `,\n`;
    } else {
      sql += `\n`;
    }
  });
  
  sql += `) AS expected(table_name, column_name)\n\n`;
  
  sql += `ORDER BY categoria, table_name;\n\n`;
  
  sql += `-- 📊 RIEPILOGO STATO DATABASE\n`;
  sql += `SELECT \n`;
  sql += `  'RIEPILOGO' as tipo,\n`;
  sql += `  COUNT(*) FILTER (WHERE table_type = 'BASE TABLE') as tabelle_totali,\n`;
  sql += `  COUNT(*) FILTER (WHERE table_name LIKE 'globalgap_%') as tabelle_globalgap,\n`;
  sql += `  COUNT(*) FILTER (WHERE table_name LIKE '%plant%') as tabelle_plant,\n`;
  sql += `  COUNT(*) FILTER (WHERE table_name LIKE 'prescription_%') as tabelle_prescription\n`;
  sql += `FROM information_schema.tables \n`;
  sql += `WHERE table_schema = 'public';\n`;

  return sql;
}

// Genera il check rapido
const quickCheckSql = generateQuickCheck();
fs.writeFileSync('quick_db_check.sql', quickCheckSql);

console.log('🔍 Quick Database Check Generated!');
console.log('=====================================');
console.log('');
console.log('📋 File creato: quick_db_check.sql');
console.log('');
console.log('🚀 Come usare:');
console.log('1. Apri Supabase Dashboard → SQL Editor');
console.log('2. Copia/incolla contenuto di quick_db_check.sql');
console.log('3. Esegui query');
console.log('4. Vedi immediatamente cosa manca');
console.log('');
console.log('📊 Risultato atteso:');
console.log('✅ EXISTS = Tabella/colonna presente');
console.log('❌ MISSING = Migrazione necessaria');
console.log('');
console.log('🎯 Se vedi MISSING → Applica migrazioni in ordine:');
console.log('1. GlobalGAP (20260111200000)');
console.log('2. Plant Tracking (20260111210000)');
console.log('3. Prescription Maps (20260111220000)');
console.log('4. Integration (20260111230000)');
console.log('5. Row Columns (20260111240000)');