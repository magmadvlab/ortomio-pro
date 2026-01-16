#!/usr/bin/env node

/**
 * Test Sentinel Hub API - Local Development
 * 
 * Questo script testa la connessione all'API Sentinel Hub
 * usando le credenziali configurate in .env.local
 * 
 * Uso:
 *   node test-sentinel-hub-local.js
 */

import http from 'http';

// Configurazione
const API_URL = 'http://localhost:3002/api/ndvi/sentinel';
const TEST_BBOX = {
  north: 42.0,
  south: 41.9,
  east: 12.6,
  west: 12.5
};

// Colori per output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function testSentinelHub() {
  log('\n🧪 Test Sentinel Hub API - Local Development\n', 'cyan');
  log('━'.repeat(60), 'blue');
  
  const dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const dateTo = new Date().toISOString().split('T')[0];
  
  const requestBody = JSON.stringify({
    bbox: TEST_BBOX,
    dateFrom,
    dateTo,
    cloudCoverage: 20
  });

  log(`\n📍 Test Area: Roma (${TEST_BBOX.north}°N, ${TEST_BBOX.east}°E)`, 'blue');
  log(`📅 Periodo: ${dateFrom} → ${dateTo}`, 'blue');
  log(`☁️  Max Cloud Coverage: 20%\n`, 'blue');
  log('━'.repeat(60), 'blue');

  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/ndvi/sentinel',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestBody)
    }
  };

  log('\n🔄 Invio richiesta all\'API...', 'yellow');

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      log('\n━'.repeat(60), 'blue');
      log('📊 RISULTATO TEST\n', 'cyan');

      try {
        const response = JSON.parse(data);

        // Status HTTP
        if (res.statusCode === 200) {
          log(`✅ Status HTTP: ${res.statusCode} OK`, 'green');
        } else {
          log(`❌ Status HTTP: ${res.statusCode}`, 'red');
        }

        // Analisi risposta
        if (response.simulated) {
          log('\n⚠️  MODALITÀ SIMULATA', 'yellow');
          log('━'.repeat(60), 'yellow');
          log('\n❌ Le credenziali Sentinel Hub NON sono configurate correttamente', 'red');
          log('\n📋 Dettagli:', 'yellow');
          log(`   Source: ${response.source}`, 'yellow');
          log(`   NDVI: ${response.ndvi.toFixed(3)} (simulato)`, 'yellow');
          log(`   Cloud Coverage: ${response.cloudCoverage.toFixed(1)}% (simulato)`, 'yellow');
          
          if (response.error) {
            log(`\n🔍 Errore: ${response.error}`, 'red');
          }

          log('\n🔧 AZIONI NECESSARIE:', 'yellow');
          log('   1. Verifica che .env.local contenga:', 'yellow');
          log('      SH_CLIENT_ID=sh-ee976-0f29-4dca-a2ec-2ea8d9845042', 'yellow');
          log('      SH_CLIENT_SECRET=2Q19bh3GHbZ9ELQ5H5k7dc', 'yellow');
          log('   2. Riavvia il server Next.js:', 'yellow');
          log('      npm run dev', 'yellow');
          log('   3. Rilancia questo test', 'yellow');

        } else if (response.success) {
          log('\n✅ CONNESSIONE SENTINEL HUB ATTIVA!', 'green');
          log('━'.repeat(60), 'green');
          log('\n🎉 Le credenziali funzionano correttamente!', 'green');
          log('\n📊 Dati Ricevuti:', 'green');
          log(`   NDVI: ${response.ndvi.toFixed(3)}`, 'green');
          log(`   Cloud Coverage: ${response.cloudCoverage.toFixed(1)}%`, 'green');
          log(`   Source: ${response.source}`, 'green');
          log(`   Satellite: ${response.satellite}`, 'green');
          log(`   Resolution: ${response.resolution}`, 'green');
          log(`   Date: ${new Date(response.date).toLocaleString('it-IT')}`, 'green');

          log('\n✅ PROSSIMI PASSI:', 'green');
          log('   1. Apri http://localhost:3002', 'green');
          log('   2. Vai al Dashboard', 'green');
          log('   3. Cerca il widget "Sentinel Hub Status"', 'green');
          log('   4. Dovrebbe mostrare "Connesso" (verde)', 'green');
          log('   5. Vai a /app/ndvi per vedere le mappe satellitari', 'green');

        } else {
          log('\n⚠️  RISPOSTA INATTESA', 'yellow');
          log('━'.repeat(60), 'yellow');
          log('\n📋 Risposta completa:', 'yellow');
          log(JSON.stringify(response, null, 2), 'yellow');
        }

      } catch (error) {
        log('\n❌ ERRORE PARSING RISPOSTA', 'red');
        log('━'.repeat(60), 'red');
        log(`\nRisposta raw: ${data}`, 'red');
        log(`\nErrore: ${error.message}`, 'red');
      }

      log('\n━'.repeat(60), 'blue');
      log('', 'reset');
    });
  });

  req.on('error', (error) => {
    log('\n❌ ERRORE CONNESSIONE', 'red');
    log('━'.repeat(60), 'red');
    log(`\n${error.message}`, 'red');
    
    if (error.code === 'ECONNREFUSED') {
      log('\n🔧 SOLUZIONE:', 'yellow');
      log('   Il server Next.js non è in esecuzione!', 'yellow');
      log('   Avvia il server con:', 'yellow');
      log('   npm run dev', 'yellow');
    }
    
    log('\n━'.repeat(60), 'blue');
    log('', 'reset');
  });

  req.write(requestBody);
  req.end();
}

// Esegui test
testSentinelHub();
