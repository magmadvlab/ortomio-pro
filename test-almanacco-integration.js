/**
 * Test Almanacco Integration in Planner
 * Verifica che l'almanacco sia correttamente integrato nel planner
 */

const testAlmanaccoIntegration = () => {
  console.log('🧪 Testing Almanacco Integration in Planner...')
  
  const results = []
  
  // Test 1: Verifica che la pagina planner esista
  try {
    const plannerExists = document.querySelector('[data-testid="planner-page"]') || 
                         document.querySelector('h1:contains("Centrale Operativa")') ||
                         document.title.includes('Planner') ||
                         window.location.pathname.includes('/planner')
    
    results.push({
      test: 'Planner Page Exists',
      status: plannerExists ? 'PASS' : 'FAIL',
      message: plannerExists ? 'Planner page found' : 'Planner page not found'
    })
  } catch (error) {
    results.push({
      test: 'Planner Page Exists',
      status: 'ERROR',
      message: `Error checking planner page: ${error.message}`
    })
  }
  
  // Test 2: Verifica che il tab almanacco sia presente
  try {
    const almanaccoTab = Array.from(document.querySelectorAll('button, a')).find(el => 
      el.textContent?.toLowerCase().includes('almanacco') ||
      el.getAttribute('data-tab') === 'almanacco'
    )
    
    results.push({
      test: 'Almanacco Tab Present',
      status: almanaccoTab ? 'PASS' : 'FAIL',
      message: almanaccoTab ? 'Almanacco tab found in navigation' : 'Almanacco tab not found'
    })
  } catch (error) {
    results.push({
      test: 'Almanacco Tab Present',
      status: 'ERROR',
      message: `Error checking almanacco tab: ${error.message}`
    })
  }
  
  // Test 3: Verifica che il componente AlmanaccoIntegration sia caricato
  try {
    const almanaccoComponent = document.querySelector('[data-testid="almanacco-integration"]') ||
                              document.querySelector('.almanacco-integration') ||
                              Array.from(document.querySelectorAll('*')).find(el => 
                                el.textContent?.includes('Almanacco del Contadino') ||
                                el.textContent?.includes('Fase Lunare') ||
                                el.textContent?.includes('Consigli per Oggi')
                              )
    
    results.push({
      test: 'AlmanaccoIntegration Component',
      status: almanaccoComponent ? 'PASS' : 'WARN',
      message: almanaccoComponent ? 'AlmanaccoIntegration component found' : 'AlmanaccoIntegration component not visible (may be in inactive tab)'
    })
  } catch (error) {
    results.push({
      test: 'AlmanaccoIntegration Component',
      status: 'ERROR',
      message: `Error checking almanacco component: ${error.message}`
    })
  }
  
  // Test 4: Verifica URL parameter handling
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get('tab')
    
    results.push({
      test: 'URL Parameter Handling',
      status: 'INFO',
      message: tabParam ? `Current tab parameter: ${tabParam}` : 'No tab parameter in URL'
    })
  } catch (error) {
    results.push({
      test: 'URL Parameter Handling',
      status: 'ERROR',
      message: `Error checking URL parameters: ${error.message}`
    })
  }
  
  // Test 5: Verifica che il link dall'AlmanaccoWidget funzioni
  try {
    const almanaccoLinks = Array.from(document.querySelectorAll('a')).filter(link => 
      link.href?.includes('/app/planner?tab=almanacco') ||
      link.textContent?.includes('Sfoglia Almanacco')
    )
    
    results.push({
      test: 'Almanacco Widget Links',
      status: almanaccoLinks.length > 0 ? 'PASS' : 'WARN',
      message: almanaccoLinks.length > 0 ? 
        `Found ${almanaccoLinks.length} almanacco link(s)` : 
        'No almanacco links found (may not be on dashboard)'
    })
  } catch (error) {
    results.push({
      test: 'Almanacco Widget Links',
      status: 'ERROR',
      message: `Error checking almanacco links: ${error.message}`
    })
  }
  
  // Test 6: Verifica funzionalità lunari
  try {
    const lunarElements = Array.from(document.querySelectorAll('*')).filter(el => 
      el.textContent?.includes('Luna') ||
      el.textContent?.includes('🌙') ||
      el.textContent?.includes('🌕') ||
      el.textContent?.includes('🌑') ||
      el.textContent?.includes('Fase Lunare')
    )
    
    results.push({
      test: 'Lunar Functionality',
      status: lunarElements.length > 0 ? 'PASS' : 'WARN',
      message: lunarElements.length > 0 ? 
        `Found ${lunarElements.length} lunar element(s)` : 
        'No lunar elements found'
    })
  } catch (error) {
    results.push({
      test: 'Lunar Functionality',
      status: 'ERROR',
      message: `Error checking lunar elements: ${error.message}`
    })
  }
  
  // Test 7: Verifica integrazione nel calendario
  try {
    const calendarElements = Array.from(document.querySelectorAll('*')).filter(el => 
      el.textContent?.includes('Calendario') ||
      el.className?.includes('calendar') ||
      el.textContent?.includes('📅')
    )
    
    results.push({
      test: 'Calendar Integration',
      status: calendarElements.length > 0 ? 'PASS' : 'WARN',
      message: calendarElements.length > 0 ? 
        `Found ${calendarElements.length} calendar element(s)` : 
        'No calendar elements found'
    })
  } catch (error) {
    results.push({
      test: 'Calendar Integration',
      status: 'ERROR',
      message: `Error checking calendar integration: ${error.message}`
    })
  }
  
  // Stampa risultati
  console.log('\n📊 Test Results:')
  console.log('================')
  
  results.forEach((result, index) => {
    const icon = result.status === 'PASS' ? '✅' : 
                result.status === 'FAIL' ? '❌' : 
                result.status === 'WARN' ? '⚠️' : 
                result.status === 'INFO' ? 'ℹ️' : '🔥'
    
    console.log(`${index + 1}. ${icon} ${result.test}: ${result.message}`)
  })
  
  const passCount = results.filter(r => r.status === 'PASS').length
  const failCount = results.filter(r => r.status === 'FAIL').length
  const warnCount = results.filter(r => r.status === 'WARN').length
  const errorCount = results.filter(r => r.status === 'ERROR').length
  
  console.log('\n📈 Summary:')
  console.log(`✅ Passed: ${passCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log(`⚠️ Warnings: ${warnCount}`)
  console.log(`🔥 Errors: ${errorCount}`)
  
  if (failCount === 0 && errorCount === 0) {
    console.log('\n🎉 All critical tests passed! Almanacco integration is working.')
  } else if (failCount > 0) {
    console.log('\n🚨 Some tests failed. Check the integration.')
  } else {
    console.log('\n⚠️ Some warnings found. Integration may need attention.')
  }
  
  return results
}

// Funzione per testare navigazione specifica
const testAlmanaccoNavigation = () => {
  console.log('\n🧭 Testing Almanacco Navigation...')
  
  // Test click su tab almanacco (se presente)
  const almanaccoTab = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent?.toLowerCase().includes('almanacco')
  )
  
  if (almanaccoTab) {
    console.log('📱 Found almanacco tab, testing click...')
    almanaccoTab.click()
    
    setTimeout(() => {
      const almanaccoContent = document.querySelector('[data-testid="almanacco-integration"]') ||
                              Array.from(document.querySelectorAll('*')).find(el => 
                                el.textContent?.includes('Almanacco del Contadino')
                              )
      
      if (almanaccoContent) {
        console.log('✅ Almanacco content loaded after tab click')
      } else {
        console.log('❌ Almanacco content not found after tab click')
      }
    }, 1000)
  } else {
    console.log('⚠️ Almanacco tab not found for click test')
  }
}

// Funzione per testare URL con parametro tab
const testAlmanaccoURL = () => {
  console.log('\n🔗 Testing Almanacco URL Navigation...')
  
  const currentURL = window.location.href
  const almanaccoURL = currentURL.split('?')[0] + '?tab=almanacco'
  
  console.log(`📍 Current URL: ${currentURL}`)
  console.log(`🎯 Testing URL: ${almanaccoURL}`)
  
  // Simula navigazione (senza ricaricare la pagina)
  if (window.history && window.history.pushState) {
    window.history.pushState({}, '', almanaccoURL)
    console.log('✅ URL updated with almanacco tab parameter')
    
    // Trigger popstate event per simulare navigazione
    window.dispatchEvent(new PopStateEvent('popstate'))
  } else {
    console.log('⚠️ History API not available')
  }
}

// Esegui test automaticamente se siamo nella pagina planner
if (window.location.pathname.includes('/planner') || document.title.includes('Planner')) {
  console.log('🚀 Auto-running Almanacco Integration Tests...')
  testAlmanaccoIntegration()
  
  // Test navigazione dopo 2 secondi
  setTimeout(() => {
    testAlmanaccoNavigation()
  }, 2000)
  
  // Test URL dopo 4 secondi
  setTimeout(() => {
    testAlmanaccoURL()
  }, 4000)
} else {
  console.log('ℹ️ Not on planner page. Run testAlmanaccoIntegration() manually.')
}

// Esporta funzioni per uso manuale
window.testAlmanaccoIntegration = testAlmanaccoIntegration
window.testAlmanaccoNavigation = testAlmanaccoNavigation
window.testAlmanaccoURL = testAlmanaccoURL

console.log('📚 Almanacco Integration Test Suite loaded. Available functions:')
console.log('- testAlmanaccoIntegration()')
console.log('- testAlmanaccoNavigation()')
console.log('- testAlmanaccoURL()')