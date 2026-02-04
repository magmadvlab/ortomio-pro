#!/usr/bin/env node

/**
 * Verifica stato migrazioni Land Zones e Soil Memory
 * Usa le credenziali da .env.local
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qhmujoivfxftlrcrluaj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFobXVqb2l2ZnhmdGxyY3JsdWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NzAzOTIsImV4cCI6MjA4MTM0NjM5Mn0.lRzjMzXLJ5XOmDmC62FaJCYtz4689VSDKLNesqaQ2FY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔍 Verifica Migrazioni Land Zones e Soil Memory\n');
console.log('=' .repeat(60));

async function checkTables() {
  console.log('\n📋 1. Verifica Tabelle...\n');
  
  const tables = ['land_zones', 'soil_memory', 'garden_rows'];
  const results = [];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        if (error.message.includes('does not exist') || error.code === '42P01') {
          results.push({ table, status: '❌ MANCANTE', error: error.message });
        } else {
          results.push({ table, status: '⚠️  ERRORE', error: error.message });
        }
      } else {
        results.push({ table, status: '✅ ESISTE', records: data?.length || 0 });
      }
    } catch (err) {
      results.push({ table, status: '⚠️  ERRORE', error: err.message });
    }
  }
  
  results.forEach(r => {
    console.log(`  ${r.status} ${r.table}`);
    if (r.error) {
      console.log(`     └─ ${r.error.substring(0, 80)}...`);
    }
  });
  
  return results;
}

async function checkColumns() {
  console.log('\n📋 2. Verifica Colonna land_zone_id in garden_rows...\n');
  
  try {
    // Prova a fare una query che usa la colonna
    const { data, error } = await supabase
      .from('garden_rows')
      .select('id, land_zone_id')
      .limit(1);
    
    if (error) {
      if (error.message.includes('land_zone_id') || error.message.includes('column')) {
        console.log('  ❌ MANCANTE colonna land_zone_id');
        return false;
      } else {
        console.log('  ⚠️  ERRORE:', error.message);
        return false;
      }
    } else {
      console.log('  ✅ ESISTE colonna land_zone_id');
      return true;
    }
  } catch (err) {
    console.log('  ⚠️  ERRORE:', err.message);
    return false;
  }
}

async function checkData() {
  console.log('\n📊 3. Verifica Dati Esistenti...\n');
  
  try {
    const { count: zonesCount } = await supabase
      .from('land_zones')
      .select('*', { count: 'exact', head: true });
    
    const { count: memoryCount } = await supabase
      .from('soil_memory')
      .select('*', { count: 'exact', head: true });
    
    const { count: rowsWithZone } = await supabase
      .from('garden_rows')
      .select('*', { count: 'exact', head: true })
      .not('land_zone_id', 'is', null);
    
    console.log(`  📍 Land Zones: ${zonesCount || 0} record`);
    console.log(`  🧠 Soil Memory: ${memoryCount || 0} record`);
    console.log(`  🌱 Filari con zona: ${rowsWithZone || 0} record`);
    
    return { zonesCount, memoryCount, rowsWithZone };
  } catch (err) {
    console.log('  ⚠️  Non posso contare i record (tabelle potrebbero non esistere)');
    return null;
  }
}

async function main() {
  try {
    const tableResults = await checkTables();
    const columnExists = await checkColumns();
    const dataStats = await checkData();
    
    console.log('\n' + '='.repeat(60));
    console.log('\n📝 RIEPILOGO:\n');
    
    const landZonesExists = tableResults.find(r => r.table === 'land_zones')?.status.includes('✅');
    const soilMemoryExists = tableResults.find(r => r.table === 'soil_memory')?.status.includes('✅');
    
    if (landZonesExists && soilMemoryExists && columnExists) {
      console.log('✅ MIGRAZIONE APPLICATA CORRETTAMENTE!\n');
      console.log('Puoi procedere con:');
      console.log('  1. Vai su http://localhost:3000/app/garden/zones');
      console.log('  2. Crea le tue macro-zone (es. "Zona A 2 ha", "Zona B 2 ha")');
      console.log('  3. Assegna i filari alle zone quando li crei\n');
      
      if (dataStats && dataStats.zonesCount === 0) {
        console.log('💡 Suggerimento: Non hai ancora zone create. Inizia creandone una!');
      }
    } else {
      console.log('❌ MIGRAZIONE NON APPLICATA\n');
      console.log('Devi applicare la migrazione:');
      console.log('  1. Apri: https://supabase.com/dashboard/project/qhmujoivfxftlrcrluaj/editor');
      console.log('  2. Copia il contenuto di: supabase/migrations/20260204120000_add_land_zones_and_soil_memory.sql');
      console.log('  3. Incolla nel SQL Editor e clicca "Run"\n');
      console.log('Oppure usa: node apply-land-zones-migration.mjs\n');
    }
    
  } catch (error) {
    console.error('\n❌ ERRORE:', error.message);
    process.exit(1);
  }
}

main();
