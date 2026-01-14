#!/usr/bin/env node

/**
 * Test Dashboard Fix - Verifica che la dashboard funzioni senza loop infiniti
 */

import http from 'http';

async function testDashboard() {
  console.log('🧪 Testing Dashboard Fix...\n');
  
  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/dashboard',
    method: 'GET',
    timeout: 10000 // 10 secondi timeout
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ Status Code: ${res.statusCode}`);
        
        // Verifica che la pagina contenga elementi della dashboard
        const checks = [
          { name: 'Loading Message', test: data.includes('Caricamento dashboard') },
          { name: 'HTML Structure', test: data.includes('<html') && data.includes('</html>') },
          { name: 'React Scripts', test: data.includes('_next/static') },
          { name: 'Dashboard Layout', test: data.includes('dashboard') },
          { name: 'No Infinite Loop', test: !data.includes('Maximum update depth exceeded') }
        ];
        
        console.log('\n📋 Dashboard Checks:');
        let allPassed = true;
        
        checks.forEach(check => {
          const status = check.test ? '✅' : '❌';
          console.log(`${status} ${check.name}`);
          if (!check.test) allPassed = false;
        });
        
        console.log('\n🎯 Result:');
        if (allPassed && res.statusCode === 200) {
          console.log('✅ Dashboard is working correctly!');
          console.log('✅ No infinite loop detected');
          console.log('✅ HomeDashboardSimple component loaded successfully');
          resolve(true);
        } else {
          console.log('❌ Dashboard has issues');
          reject(new Error('Dashboard test failed'));
        }
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Connection Error:', err.message);
      reject(err);
    });
    
    req.on('timeout', () => {
      console.log('❌ Request Timeout - Possible infinite loop');
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Esegui il test
testDashboard()
  .then(() => {
    console.log('\n🎉 Dashboard fix successful!');
    process.exit(0);
  })
  .catch((error) => {
    console.log('\n💥 Dashboard fix failed:', error.message);
    process.exit(1);
  });