#!/usr/bin/env node

/**
 * Script per recuperare la lista dei dispositivi Tuya e i loro Device ID
 * Usa le credenziali del progetto Tuya Cloud
 */

const crypto = require('crypto');
const https = require('https');

// Configurazione
const config = {
  clientId: 'a4syyyy7y3p5dnjfcpee',
  clientSecret: '3b04319928f942a68cf3fbab4cc94dc0',
  region: 'eu', // Western Europe Data Center
  baseUrl: 'https://openapi.tuyaeu.com'
};

// Funzione per generare signature Tuya
function generateSignature(clientId, secret, t, nonce, stringToSign) {
  const str = clientId + t + nonce + stringToSign;
  return crypto
    .createHmac('sha256', secret)
    .update(str, 'utf8')
    .digest('hex')
    .toUpperCase();
}

// Funzione per fare richieste HTTP
function makeRequest(method, path, accessToken = null, body = null) {
  return new Promise((resolve, reject) => {
    const t = Date.now().toString();
    const nonce = crypto.randomBytes(16).toString('hex');
    
    let stringToSign = method + '\n';
    
    // Calcola hash del body se presente
    if (body) {
      const bodyHash = crypto.createHash('sha256').update(body, 'utf8').digest('hex');
      stringToSign += bodyHash + '\n';
    } else {
      stringToSign += crypto.createHash('sha256').update('', 'utf8').digest('hex') + '\n';
    }
    
    stringToSign += '\n' + path;
    
    const sign = generateSignature(
      config.clientId,
      config.clientSecret,
      t,
      nonce,
      stringToSign
    );
    
    const headers = {
      'client_id': config.clientId,
      't': t,
      'sign': sign,
      'nonce': nonce,
      'sign_method': 'HMAC-SHA256',
      'Content-Type': 'application/json'
    };
    
    if (accessToken) {
      headers['access_token'] = accessToken;
    }
    
    const url = new URL(config.baseUrl + path);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: headers
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success) {
            resolve(response.result);
          } else {
            reject(new Error(`API Error: ${response.msg || 'Unknown error'}`));
          }
        } catch (e) {
          reject(new Error(`Parse Error: ${e.message}`));
        }
      });
    });
    
    req.on('error', (e) => {
      reject(e);
    });
    
    if (body) {
      req.write(body);
    }
    
    req.end();
  });
}

// Funzione principale
async function main() {
  try {
    console.log('🔐 Autenticazione con Tuya Cloud...\n');
    
    // Step 1: Ottieni access token
    const tokenData = await makeRequest('GET', '/v1.0/token?grant_type=1');
    const accessToken = tokenData.access_token;
    
    console.log('✅ Autenticazione riuscita!\n');
    console.log(`Access Token: ${accessToken.substring(0, 20)}...\n`);
    
    // Step 2: Ottieni lista dispositivi
    console.log('📱 Recupero lista dispositivi...\n');
    
    // Prima ottieni l'UID dell'utente
    const userInfo = await makeRequest('GET', '/v1.0/users', accessToken);
    
    if (!userInfo || !userInfo.list || userInfo.list.length === 0) {
      console.log('⚠️  Nessun utente trovato. Prova a recuperare i dispositivi direttamente...\n');
      
      // Prova a ottenere dispositivi senza UID
      try {
        const devices = await makeRequest('GET', '/v1.0/devices', accessToken);
        printDevices(devices);
      } catch (e) {
        console.error('❌ Errore nel recupero dispositivi:', e.message);
        console.log('\n💡 Suggerimento: Assicurati di aver autorizzato il progetto Tuya Cloud ad accedere ai tuoi dispositivi.');
        console.log('   Vai su https://iot.tuya.com → Il tuo progetto → Link Devices');
      }
    } else {
      const uid = userInfo.list[0].uid;
      console.log(`User ID: ${uid}\n`);
      
      // Ottieni dispositivi dell'utente
      const devices = await makeRequest('GET', `/v1.0/users/${uid}/devices`, accessToken);
      printDevices(devices);
    }
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
    console.log('\n💡 Verifica che:');
    console.log('   1. Le credenziali siano corrette');
    console.log('   2. Il progetto Tuya Cloud sia attivo');
    console.log('   3. I dispositivi siano collegati all\'account Tuya');
  }
}

function printDevices(devices) {
  if (!devices || !devices.list || devices.list.length === 0) {
    console.log('⚠️  Nessun dispositivo trovato.\n');
    console.log('💡 Assicurati di:');
    console.log('   1. Aver aggiunto dispositivi all\'app Tuya Smart');
    console.log('   2. Aver collegato i dispositivi al progetto Cloud su iot.tuya.com');
    return;
  }
  
  console.log(`✅ Trovati ${devices.list.length} dispositivo/i:\n`);
  console.log('═'.repeat(80));
  
  devices.list.forEach((device, index) => {
    console.log(`\n📱 Dispositivo ${index + 1}:`);
    console.log(`   Nome: ${device.name}`);
    console.log(`   Device ID: ${device.id}`);
    console.log(`   Categoria: ${device.category}`);
    console.log(`   Product ID: ${device.product_id}`);
    console.log(`   Online: ${device.online ? '✅ Sì' : '❌ No'}`);
    
    if (device.status && device.status.length > 0) {
      console.log(`   Status:`);
      device.status.forEach(s => {
        console.log(`      - ${s.code}: ${s.value}`);
      });
    }
  });
  
  console.log('\n' + '═'.repeat(80));
  console.log('\n💾 Copia il Device ID del tuo water timer e usalo nell\'app OrtoMio!');
}

// Esegui
main();
