/**
 * Test Almanacco SOLO nel Calendario
 * Verifica che l'almanacco sia integrato SOLO nel calendario e NON come tab separato
 */

const testAlmanaccoCalendarOnly = () => {
  console.log('🧪 Testing Almanacco Calendar-Only Integration...')
  
  const results = []
  
  // Test 1: Verifica che NON ci sia il tab almanacco
  try {
    const almanaccoTab = Array.from(document.querySelectorAll('button, a')).find(el => 
      el.textContent?.toLowerCase().includes('almanacco') &&
      (el.getAttribute('role') === 'menuitem' || el.className?.includes('tab'))
    )
    
    results.push({
      test: 'NO Almanacco Tab',
      status: !almanaccoTab ? 'PASS' : 'FAIL',
      message: !almanaccoTab ? 'Almanacco tab correctly removed' : 'ERRORE: Almanacco tab still present!'
    })
  } catch (error) {
    results.push({
      test: 'NO Almanacco Tab',
      status: 'ERROR',
      message: `Error checking almanacco tab: ${error.message}`
    })
  }
  
  // Test 2: Verifica che il calendario sia presente
  try {
    const calendarTab = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent?.toLowerCase().includes('calendario')
    )
    
    results.push({
      test: 'Calendar Tab Present',
      status: calendarTab ? 'PASS' : 'FAIL',
      message: calendarTab ? 'Calendar tab found' : 'Calendar tab not found'
    })
  } catch (error) {
    results.push({
      test: 'Calendar Tab Present',
      status: 'ERROR',
      message: `Error checking calendar tab: ${error.message}`
    })
  }
  
  // Test 3: Verifica navigazione mobile touch-friendly
  try {
    const mobileButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
      btn.className?.includes('touch-manipulation') ||
      btn.style.minHeight === '56px'
    )
    
    results.push({
      test: 'Mobile Touch Navigation',
      status: mobileButtons.length > 0 ? 'PASS' : 'WARN',
      message: mobileButtons.length > 0 ? 
        `Found ${mobileButtons.length} touch-optimized button(s)` : 
        'No touch-optimized buttons found'
    })
  } catch (error) {
    results.push({
      test: 'Mobile Touch Navigation',
      status: 'ERROR',
      message: `Error checking mobile navigation: ${error.message}`
    })
  }
  
  // Test 4: Verifica che l'almanacco sia nel calendario quando attivo
  try {
    // Simula click su calendario
    const calendarTab = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent?.toLowerCase().includes('calendario')
    )
    
    if (calendarTab) {
      calendarTab.click()
      
      setTimeout(() => {
        const almanaccoInCalendar = Array.from(document.querySelectorAll('*')).find(el => 
          el.textContent?.includes('Almanacco del Contadino') ||
          el.textContent?.includes('Fase Lunare') ||
          el.textContent?.includes('Consigli per Oggi')
        )
        
        results.push({
          test: 'Almanacco in Calendar',
          status: almanaccoInCalendar ? 'PASS' : 'WARN',
          message: almanaccoInCalendar ? 
            'Almanacco content found in calendar' : 
            'Almanacco content not found in calendar (may need to load)'
        })
      }, 1000)
    } else {
      results.push({
        test: 'Almanacco in Calendar',
        status: 'SKIP',
        message: 'Calendar tab not found for testing'
      })
    }
  } catch (error) {
    results.push({
      test: 'Almanacco in Calendar',
      status: 'ERROR',
      message: `Error testing almanacco in calendar: ${error.message}`
    })
  }
  
  // Test 5: Verifica link dal widget
  try {
    const widgetLinks = Array.from(document.querySelectorAll('a')).filter(link => 
      link.href?.includes('/app/planner?tab=calendar') ||
      link.textContent?.includes('Vai al Calendario')
    )
    
    results.push({
      test: 'Widget Links to Calendar',
      status: widgetLinks.length > 0 ? 'PASS' : 'WARN',
      message: widgetLinks.length > 0 ? 
        `Found ${widgetLinks.length} correct widget link(s)` : 
        'No widget links to calendar found (may not be on dashboard)'
    })
  } catch (error) {
    results.push({
      test: 'Widget Links to Calendar',
      status: 'ERROR',
      message: `Error checking widget links: ${error.message}`
    })
  }
  
  // Test 6: Verifica mobile dropdown funzionante
  try {
    const mobileDropdown = document.querySelector('[aria-haspopup="true"]')
    const dropdownButton = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.getAttribute('aria-haspopup') === 'true'
    )
    
    if (dropdownButton) {
      // Test click
      dropdownButton.click()
      
      setTimeout(() => {
        const dropdownMenu = document.querySelector('[role="menuitem"]')
        results.push({
          test: 'Mobile Dropdown Functional',
          status: dropdownMenu ? 'PASS' : 'WARN',
          message: dropdownMenu ? 
            'Mobile dropdown opens correctly' : 
            'Mobile dropdown may not be working'
        })
        
        // Chiudi dropdown
        if (dropdownMenu) {
          dropdownButton.click()
        }
      }, 500)
    } else {
      results.push({
        test: 'Mobile Dropdown Functional',
        status: 'SKIP',
        message: 'Mobile dropdown not found'
      })
    }
  } catch (error) {
    results.push({
      test: 'Mobile Dropdown Functional',
      status: 'ERROR',
      message: `Error testing mobile dropdown: ${error.message}`
    })
  }
  
  // Stampa risultati dopo 2 secondi per permettere test asincroni
  setTimeout(() => {
    console.log('\n📊 Test Results:')
    console.log('================')
    
    results.forEach((result, index) => {
      const icon = result.status === 'PASS' ? '✅' : 
                  result.status === 'FAIL' ? '❌' : 
                  result.status === 'WARN' ? '⚠️' : 
                  result.status === 'SKIP' ? '⏭️' : '🔥'
      
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
      console.log('\n🎉 SUCCESS! Almanacco is correctly integrated ONLY in calendar!')
    } else if (failCount > 0) {
      console.log('\n🚨 FAILED! Some critical issues found.')
    } else {
      console.log('\n⚠️ Some warnings found. Check integration.')
    }
  }, 2000)
  
  return results
}

// Test specifico per mobile navigation
const testMobileNavigation = () => {
  console.log('\n📱 Testing Mobile Navigation...')
  
  const isMobile = window.innerWidth <= 768
  console.log(`📱 Screen width: ${window.innerWidth}px (${isMobile ? 'Mobile' : 'Desktop'})`)
  
  if (isMobile) {
    // Test touch events
    const touchButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
      btn.className?.includes('touch-manipulation')
    )
    
    console.log(`👆 Found ${touchButtons.length} touch-optimized buttons`)
    
    // Test dropdown
    const dropdownButton = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.getAttribute('aria-haspopup') === 'true'
    )
    
    if (dropdownButton) {
      console.log('📋 Testing mobile dropdown...')
      
      // Simula touch event
      const touchEvent = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{
          clientX: 100,
          clientY: 100,
          target: dropdownButton
        }]
      })
      
      dropdownButton.dispatchEvent(touchEvent)
      dropdownButton.click()
      
      setTimeout(() => {
        const isOpen = dropdownButton.getAttribute('aria-expanded') === 'true'
        console.log(`📋 Dropdown ${isOpen ? 'opened' : 'failed to open'}`)
      }, 100)
    }
  } else {
    console.log('🖥️ Desktop mode - mobile navigation not applicable')
  }
}

// Auto-run se siamo nella pagina planner
if (window.location.pathname.includes('/planner')) {
  console.log('🚀 Auto-running Almanacco Calendar-Only Tests...')
  testAlmanaccoCalendarOnly()
  
  setTimeout(() => {
    testMobileNavigation()
  }, 3000)
} else {
  console.log('ℹ️ Not on planner page. Run testAlmanaccoCalendarOnly() manually.')
}

// Esporta funzioni
window.testAlmanaccoCalendarOnly = testAlmanaccoCalendarOnly
window.testMobileNavigation = testMobileNavigation

console.log('📚 Almanacco Calendar-Only Test Suite loaded. Available functions:')
console.log('- testAlmanaccoCalendarOnly()')
console.log('- testMobileNavigation()')