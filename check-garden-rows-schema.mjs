#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qhmujoivfxftlrcrluaj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFobXVqb2l2ZnhmdGxyY3JsdWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NzAzOTIsImV4cCI6MjA4MTM0NjM5Mn0.lRzjMzXLJ5XOmDmC62FaJCYtz4689VSDKLNesqaQ2FY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔍 Verifica Schema garden_rows\n');

async function checkSchema() {
  try {
    const { data, error } = await supabase
      .from('garden_rows')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Errore:', error.message);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Colonne disponibili in garden_rows:\n');
      Object.keys(data[0]).forEach(col => {
        console.log(`  - ${col}`);
      });
    } else {
      console.log('⚠️  Tabella vuota, provo a vedere lo schema...');
    }
  } catch (err) {
    console.error('❌ Errore:', err.message);
  }
}

checkSchema();
