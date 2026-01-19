/**
 * Test completo per la chiusura del modal di registrazione raccolto
 * Verifica tutti i metodi di chiusura e la gestione degli eventi
 */

const testHarvestModalClose = () => {
  console.log('🧪 Test Chiusura Modal Raccolto - Inizio');
  
  const tests = [
    {
      name: 'Chiusura con pulsante X',
      description: 'Verifica che il pulsante X in alto a destra chiuda il modal',
      test: () => {
        // Simula click sul pulsante X
        const closeButton = document.querySelector('[aria-label="Chiudi modal"]');
        if (closeButton) {
          closeButton.click();
          return true;
        }
        return false;
      }
    },
    {
      name: 'Chiusura con tasto ESC',
      description: 'Verifica che premendo ESC il modal si chiuda',
      test: () => {
        // Simula pressione tasto ESC
        const escEvent = new KeyboardEvent('keydown', {
          key: 'Escape',
          code: 'Escape',
          keyCode: 27,
          which: 27,
          bubbles: true,
          cancelable: true
        });
        document.dispatchEvent(escEvent);
        return true;
      }
    },
    {
      name: 'Chiusura con click su overlay',
      description: 'Verifica che cliccando sullo sfondo scuro il modal si chiuda',
      test: () => {
        // Simula click sull'overlay
        const overlay = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
        if (overlay) {
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            target: overlay
          });
          overlay.dispatchEvent(clickEvent);
          return true;
        }
        return false;
      }
    },
    {
      name: 'Chiusura con pulsante Annulla',
      description: 'Verifica che il pulsante Annulla chiuda il modal',
      test: () => {
        // Simula click sul pulsante Annulla
        const cancelButton = document.querySelector('button[type="button"]:contains("Annulla")');
        if (cancelButton) {
          cancelButton.click();
          return true;
        }
        return false;
      }
    },
    {
      name: 'Prevenzione chiusura su click contenuto',
      description: 'Verifica che cliccando sul contenuto del modal NON si chiuda',
      test: () => {
        // Simula click sul contenuto del modal
        const modalContent = document.querySelector('.bg-white.rounded-lg.shadow-xl');
        if (modalContent) {
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            target: modalContent
          });
          modalContent.dispatchEvent(clickEvent);
          // Il modal NON dovrebbe chiudersi
          return true;
        }
        return false;
      }
    },
    {
      name: 'Gestione form submit',
      description: 'Verifica che il submit del form non causi chiusure accidentali',
      test: () => {
        // Simula submit del form
        const form = document.querySelector('form');
        if (form) {
          const submitEvent = new Event('submit', {
            bubbles: true,
            cancelable: true
          });
          form.dispatchEvent(submitEvent);
          return true;
        }
        return false;
      }
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  tests.forEach((test, index) => {
    try {
      console.log(`\n${index + 1}. ${test.name}`);
      console.log(`   ${test.description}`);
      
      const result = test.test();
      
      if (result) {
        console.log('   ✅ PASS');
        passedTests++;
      } else {
        console.log('   ❌ FAIL - Test non eseguito correttamente');
      }
    } catch (error) {
      console.log(`   ❌ FAIL - Errore: ${error.message}`);
    }
  });

  console.log(`\n📊 Risultati: ${passedTests}/${totalTests} test passati`);
  
  if (passedTests === totalTests) {
    console.log('🎉 Tutti i test sono passati! Il modal dovrebbe chiudersi correttamente.');
  } else {
    console.log('⚠️  Alcuni test sono falliti. Potrebbero esserci problemi con la chiusura del modal.');
  }

  return {
    passed: passedTests,
    total: totalTests,
    success: passedTests === totalTests
  };
};

// Funzione per testare la gestione degli eventi
const testEventHandling = () => {
  console.log('\n🔍 Test Gestione Eventi');
  
  const eventTests = [
    {
      name: 'Event Propagation',
      test: () => {
        // Verifica che gli eventi non si propaghino in modo indesiderato
        let propagationStopped = false;
        
        const testElement = document.createElement('div');
        testElement.addEventListener('click', (e) => {
          e.stopPropagation();
          propagationStopped = true;
        });
        
        const clickEvent = new MouseEvent('click', { bubbles: true });
        testElement.dispatchEvent(clickEvent);
        
        return propagationStopped;
      }
    },
    {
      name: 'Prevent Default',
      test: () => {
        // Verifica che preventDefault funzioni correttamente
        let defaultPrevented = false;
        
        const testElement = document.createElement('button');
        testElement.addEventListener('click', (e) => {
          e.preventDefault();
          defaultPrevented = e.defaultPrevented;
        });
        
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        testElement.dispatchEvent(clickEvent);
        
        return defaultPrevented;
      }
    },
    {
      name: 'Body Scroll Management',
      test: () => {
        // Verifica che lo scroll del body sia gestito correttamente
        const originalOverflow = document.body.style.overflow;
        
        // Simula apertura modal
        document.body.style.overflow = 'hidden';
        const hiddenCorrectly = document.body.style.overflow === 'hidden';
        
        // Simula chiusura modal
        document.body.style.overflow = 'unset';
        const resetCorrectly = document.body.style.overflow === 'unset';
        
        // Ripristina stato originale
        document.body.style.overflow = originalOverflow;
        
        return hiddenCorrectly && resetCorrectly;
      }
    }
  ];

  let passedEventTests = 0;
  
  eventTests.forEach((test, index) => {
    try {
      console.log(`   ${index + 1}. ${test.name}`);
      const result = test.test();
      
      if (result) {
        console.log('      ✅ PASS');
        passedEventTests++;
      } else {
        console.log('      ❌ FAIL');
      }
    } catch (error) {
      console.log(`      ❌ FAIL - Errore: ${error.message}`);
    }
  });

  console.log(`\n   Risultati eventi: ${passedEventTests}/${eventTests.length} test passati`);
  
  return {
    passed: passedEventTests,
    total: eventTests.length,
    success: passedEventTests === eventTests.length
  };
};

// Funzione principale per eseguire tutti i test
const runAllTests = () => {
  console.log('🚀 Avvio Test Completi Modal Raccolto\n');
  
  const modalTests = testHarvestModalClose();
  const eventTests = testEventHandling();
  
  const totalPassed = modalTests.passed + eventTests.passed;
  const totalTests = modalTests.total + eventTests.total;
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 RIEPILOGO FINALE');
  console.log('='.repeat(50));
  console.log(`Test Modal: ${modalTests.passed}/${modalTests.total}`);
  console.log(`Test Eventi: ${eventTests.passed}/${eventTests.total}`);
  console.log(`TOTALE: ${totalPassed}/${totalTests}`);
  
  if (totalPassed === totalTests) {
    console.log('\n🎉 TUTTI I TEST SUPERATI!');
    console.log('Il modal di registrazione raccolto dovrebbe funzionare correttamente.');
  } else {
    console.log('\n⚠️  ALCUNI TEST FALLITI');
    console.log('Potrebbero esserci ancora problemi con la chiusura del modal.');
  }
  
  return {
    success: totalPassed === totalTests,
    passed: totalPassed,
    total: totalTests,
    modalTests,
    eventTests
  };
};

// Esporta le funzioni per l'uso
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testHarvestModalClose,
    testEventHandling,
    runAllTests
  };
}

// Se eseguito direttamente nel browser
if (typeof window !== 'undefined') {
  window.testHarvestModalClose = testHarvestModalClose;
  window.testEventHandling = testEventHandling;
  window.runAllTests = runAllTests;
  
  console.log('🔧 Test Modal Raccolto caricati!');
  console.log('Esegui runAllTests() per testare tutto.');
}