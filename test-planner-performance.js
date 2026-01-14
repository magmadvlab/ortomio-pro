/**
 * Test Performance Planner AI - Verifica Ottimizzazioni
 * 
 * Questo test verifica che le ottimizzazioni performance siano attive:
 * 1. Rimozione delay artificiale
 * 2. Cache delle risposte
 * 3. Caricamento lazy
 * 4. Caricamento parallelo
 */

const puppeteer = require('puppeteer')

async function testPlannerPerformance() {
  console.log('🚀 Avvio test performance Planner AI...')
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1200, height: 800 }
  })
  
  try {
    const page = await browser.newPage()
    
    // Monitora performance
    await page.evaluateOnNewDocument(() => {
      window.performanceMetrics = {
        chatOpenTime: 0,
        firstResponseTime: 0,
        cacheResponseTime: 0
      }
    })
    
    console.log('📱 Navigazione a OrtoMio...')
    await page.goto('http://localhost:3002/app/garden', { 
      waitUntil: 'networkidle0',
      timeout: 10000 
    })
    
    // Test 1: Apertura Chat AI (deve essere istantanea)
    console.log('\n🎯 Test 1: Apertura Chat AI')
    const chatOpenStart = Date.now()
    
    // Cerca il pulsante chat AI
    await page.waitForSelector('button[title*="Chat AI"]', { timeout: 5000 })
    await page.click('button[title*="Chat AI"]')
    
    // Aspetta che il chat si apra
    await page.waitForSelector('.fixed.bottom-6.right-6.w-96', { timeout: 2000 })
    
    const chatOpenTime = Date.now() - chatOpenStart
    console.log(`   ⏱️  Tempo apertura: ${chatOpenTime}ms`)
    console.log(`   ✅ Target: <100ms | Risultato: ${chatOpenTime < 100 ? 'PASS' : 'FAIL'}`)
    
    // Test 2: Prima risposta AI (deve essere veloce)
    console.log('\n🎯 Test 2: Prima Risposta AI')
    const firstResponseStart = Date.now()
    
    // Invia messaggio
    await page.type('input[placeholder*="Chiedi consigli"]', 'Cosa posso piantare questo mese?')
    await page.press('input[placeholder*="Chiedi consigli"]', 'Enter')
    
    // Aspetta risposta AI
    await page.waitForFunction(() => {
      const messages = document.querySelectorAll('.bg-gray-100')
      return messages.length > 1 // Messaggio iniziale + risposta
    }, { timeout: 5000 })
    
    const firstResponseTime = Date.now() - firstResponseStart
    console.log(`   ⏱️  Tempo prima risposta: ${firstResponseTime}ms`)
    console.log(`   ✅ Target: <200ms | Risultato: ${firstResponseTime < 200 ? 'PASS' : 'FAIL'}`)
    
    // Test 3: Risposta da Cache (deve essere immediata)
    console.log('\n🎯 Test 3: Risposta da Cache')
    const cacheResponseStart = Date.now()
    
    // Invia stesso messaggio per testare cache
    await page.type('input[placeholder*="Chiedi consigli"]', 'Cosa posso piantare questo mese?')
    await page.press('input[placeholder*="Chiedi consigli"]', 'Enter')
    
    // Aspetta risposta da cache
    await page.waitForFunction(() => {
      const messages = document.querySelectorAll('.bg-gray-100')
      return messages.length > 2 // Messaggio iniziale + 2 risposte
    }, { timeout: 2000 })
    
    const cacheResponseTime = Date.now() - cacheResponseStart
    console.log(`   ⏱️  Tempo risposta cache: ${cacheResponseTime}ms`)
    console.log(`   ✅ Target: <50ms | Risultato: ${cacheResponseTime < 50 ? 'PASS' : 'FAIL'}`)
    
    // Test 4: Verifica contenuto risposta
    console.log('\n🎯 Test 4: Verifica Contenuto Risposta')
    const responseContent = await page.evaluate(() => {
      const aiMessages = document.querySelectorAll('.bg-gray-100 .whitespace-pre-wrap')
      return aiMessages[aiMessages.length - 1]?.textContent || ''
    })
    
    const hasIntelligentContent = responseContent.includes('Gennaio 2026') && 
                                responseContent.includes('serra') &&
                                responseContent.includes('lattuga')
    
    console.log(`   📝 Contenuto intelligente: ${hasIntelligentContent ? 'PASS' : 'FAIL'}`)
    console.log(`   📄 Anteprima: "${responseContent.substring(0, 100)}..."`)
    
    // Test 5: Suggerimenti interattivi
    console.log('\n🎯 Test 5: Suggerimenti Interattivi')
    const suggestionsCount = await page.evaluate(() => {
      return document.querySelectorAll('button:contains("Come preparare")').length +
             document.querySelectorAll('button:contains("Quali varietà")').length +
             document.querySelectorAll('button:contains("Calendario")').length
    })
    
    console.log(`   🔗 Suggerimenti trovati: ${suggestionsCount}`)
    console.log(`   ✅ Interattività: ${suggestionsCount > 0 ? 'PASS' : 'FAIL'}`)
    
    // Risultati finali
    console.log('\n📊 RISULTATI PERFORMANCE:')
    console.log('=' .repeat(50))
    console.log(`🚀 Apertura Chat:     ${chatOpenTime}ms     (target: <100ms)`)
    console.log(`⚡ Prima Risposta:    ${firstResponseTime}ms     (target: <200ms)`)
    console.log(`💾 Cache Response:    ${cacheResponseTime}ms      (target: <50ms)`)
    console.log(`🧠 Contenuto AI:      ${hasIntelligentContent ? 'Intelligente' : 'Generico'}`)
    console.log(`🔗 Interattività:     ${suggestionsCount > 0 ? 'Attiva' : 'Mancante'}`)
    
    const overallPass = chatOpenTime < 100 && 
                       firstResponseTime < 200 && 
                       cacheResponseTime < 50 && 
                       hasIntelligentContent
    
    console.log(`\n🎯 RISULTATO FINALE: ${overallPass ? '✅ PASS - Ottimizzazioni Attive!' : '❌ FAIL - Serve ottimizzazione'}`)
    
    // Screenshot per debug
    await page.screenshot({ 
      path: 'planner-performance-test.png',
      fullPage: true 
    })
    console.log('📸 Screenshot salvato: planner-performance-test.png')
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error.message)
  } finally {
    await browser.close()
  }
}

// Esegui test se chiamato direttamente
if (require.main === module) {
  testPlannerPerformance().catch(console.error)
}

module.exports = { testPlannerPerformance }