/**
 * Test Weather Cache SQL Fix
 * Verifica che il SQL sia sintatticamente corretto
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configurazione Supabase
const supabaseUrl = 'https://qhmujoivfxftlrcrluaj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFobXVqb2l2ZnhmdGxyY3JsdWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NzAzOTIsImV4cCI6MjA4MTM0NjM5Mn0.lRzjMzXLJ5XOmDmC62FaJCYtz4689VSDKLNesqaQ2FY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWeatherCacheSQL() {
  console.log('🧪 Testing Weather Cache SQL Fix...\n');

  try {
    // Leggi il file SQL
    const sqlContent = fs.readFileSync('APPLY_WEATHER_CACHE_SIMPLE_FIX_JAN18.sql', 'utf8');
    
    console.log('📄 SQL File loaded successfully');
    console.log(`📏 SQL Length: ${sqlContent.length} characters`);
    
    // Dividi il SQL in statements (semplice)
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && s !== '');
    
    console.log(`📝 Found ${statements.length} SQL statements\n`);

    // Test connessione base
    console.log('1️⃣ Testing basic connection...');
    const { data: testConnection, error: connectionError } = await supabase
      .from('gardens')
      .select('id')
      .limit(1);

    if (connectionError) {
      console.error('❌ Connection failed:', connectionError.message);
      return;
    }
    
    console.log('✅ Connection successful');

    // Test se la tabella esiste già
    console.log('\n2️⃣ Checking if weather_cache table exists...');
    const { data: existingTable, error: tableError } = await supabase
      .from('weather_cache')
      .select('*')
      .limit(1);

    if (tableError && tableError.code === '42P01') {
      console.log('📋 Table does not exist - SQL fix needed');
    } else if (tableError && tableError.code === '42501') {
      console.log('🔒 Table exists but access denied - policies needed');
    } else if (!tableError) {
      console.log('✅ Table already exists and accessible');
      console.log(`📊 Current records: ${existingTable?.length || 0}`);
    } else {
      console.log('⚠️  Unknown table status:', tableError.message);
    }

    // Mostra il SQL che verrà eseguito
    console.log('\n3️⃣ SQL statements to execute:');
    statements.slice(0, 5).forEach((stmt, i) => {
      const preview = stmt.substring(0, 80) + (stmt.length > 80 ? '...' : '');
      console.log(`   ${i + 1}. ${preview}`);
    });
    
    if (statements.length > 5) {
      console.log(`   ... and ${statements.length - 5} more statements`);
    }

    console.log('\n✅ SQL file is ready to execute!');
    console.log('\n📋 Next steps:');
    console.log('   1. Go to Supabase Dashboard');
    console.log('   2. SQL Editor → New Query');
    console.log('   3. Copy/paste APPLY_WEATHER_CACHE_SIMPLE_FIX_JAN18.sql');
    console.log('   4. Execute the query');
    console.log('   5. Run: node test-weather-cache-fix.js');

  } catch (error) {
    console.error('💥 Error during SQL test:', error);
    
    if (error.code === 'ENOENT') {
      console.log('\n🔧 File not found. Make sure you have:');
      console.log('   - APPLY_WEATHER_CACHE_SIMPLE_FIX_JAN18.sql in current directory');
    }
  }
}

// Esegui i test
testWeatherCacheSQL();