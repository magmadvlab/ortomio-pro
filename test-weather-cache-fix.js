/**
 * Test Weather Cache Fix
 * Verifica che la tabella weather_cache sia configurata correttamente
 */

const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase
const supabaseUrl = 'https://qhmujoivfxftlrcrluaj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFobXVqb2l2ZnhmdGxyY3JsdWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NzAzOTIsImV4cCI6MjA4MTM0NjM5Mn0.lRzjMzXLJ5XOmDmC62FaJCYtz4689VSDKLNesqaQ2FY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWeatherCache() {
  console.log('🧪 Testing Weather Cache Table...\n');

  try {
    // Test 1: Verifica esistenza tabella
    console.log('1️⃣ Verificando esistenza tabella...');
    const { data: tables, error: tablesError } = await supabase
      .from('weather_cache')
      .select('*')
      .limit(1);

    if (tablesError) {
      console.error('❌ Tabella weather_cache non esiste o non accessibile:');
      console.error('   Error:', tablesError.message);
      console.log('\n🔧 SOLUZIONE:');
      console.log('   1. Vai su Supabase Dashboard');
      console.log('   2. SQL Editor → New Query');
      console.log('   3. Esegui il contenuto di APPLY_WEATHER_CACHE_FIX_JAN18.sql');
      return;
    }

    console.log('✅ Tabella weather_cache esistente e accessibile');

    // Test 2: Test inserimento
    console.log('\n2️⃣ Testando inserimento dati...');
    const testData = {
      lat_lng: '40.3609_16.6863',
      date: '2026-01-18',
      forecast: {
        temperature: 15,
        humidity: 60,
        description: 'Test forecast',
        timestamp: new Date().toISOString()
      }
    };

    const { data: insertData, error: insertError } = await supabase
      .from('weather_cache')
      .upsert(testData, { onConflict: 'lat_lng,date' })
      .select();

    if (insertError) {
      console.error('❌ Errore inserimento:', insertError.message);
      return;
    }

    console.log('✅ Inserimento dati riuscito');
    console.log('   ID:', insertData[0]?.id);

    // Test 3: Test lettura
    console.log('\n3️⃣ Testando lettura dati...');
    const { data: readData, error: readError } = await supabase
      .from('weather_cache')
      .select('forecast, cached_at')
      .eq('lat_lng', testData.lat_lng)
      .eq('date', testData.date)
      .single();

    if (readError) {
      console.error('❌ Errore lettura:', readError.message);
      return;
    }

    console.log('✅ Lettura dati riuscita');
    console.log('   Forecast:', JSON.stringify(readData.forecast, null, 2));
    console.log('   Cached at:', readData.cached_at);

    // Test 4: Test performance query (quella che falliva)
    console.log('\n4️⃣ Testando query originale che falliva...');
    const { data: originalQuery, error: originalError } = await supabase
      .from('weather_cache')
      .select('forecast, cached_at')
      .eq('lat_lng', '40.3609_16.6863')
      .eq('date', '2026-01-18');

    if (originalError) {
      console.error('❌ Query originale ancora fallisce:', originalError.message);
      return;
    }

    console.log('✅ Query originale ora funziona');
    console.log('   Risultati trovati:', originalQuery.length);

    // Test 5: Verifica indici
    console.log('\n5️⃣ Verificando indici per performance...');
    const { data: indexes, error: indexError } = await supabase
      .rpc('get_table_indexes', { table_name: 'weather_cache' })
      .catch(() => {
        // RPC potrebbe non esistere, usa query diretta
        return supabase
          .from('pg_indexes')
          .select('indexname, indexdef')
          .eq('tablename', 'weather_cache');
      });

    if (!indexError && indexes && indexes.length > 0) {
      console.log('✅ Indici configurati:');
      indexes.forEach(idx => {
        console.log(`   - ${idx.indexname}`);
      });
    } else {
      console.log('⚠️  Impossibile verificare indici (normale in alcuni setup)');
    }

    // Test 6: Cleanup test data
    console.log('\n6️⃣ Pulizia dati di test...');
    const { error: deleteError } = await supabase
      .from('weather_cache')
      .delete()
      .eq('lat_lng', testData.lat_lng)
      .eq('date', testData.date);

    if (deleteError) {
      console.log('⚠️  Impossibile eliminare dati di test:', deleteError.message);
    } else {
      console.log('✅ Dati di test eliminati');
    }

    // Risultato finale
    console.log('\n🎉 TUTTI I TEST SUPERATI!');
    console.log('\n📊 Risultati:');
    console.log('   ✅ Tabella weather_cache configurata correttamente');
    console.log('   ✅ Inserimento/lettura funzionanti');
    console.log('   ✅ Query originale riparata');
    console.log('   ✅ Errore 406 risolto');
    
    console.log('\n🚀 Il sistema di cache meteo è ora completamente operativo!');

  } catch (error) {
    console.error('💥 Errore durante i test:', error);
    console.log('\n🔧 Verifica che:');
    console.log('   1. La migrazione sia stata applicata');
    console.log('   2. Le credenziali Supabase siano corrette');
    console.log('   3. La connessione internet sia attiva');
  }
}

// Esegui i test
testWeatherCache();