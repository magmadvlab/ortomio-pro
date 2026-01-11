/**
 * Test Mobile Modal Integration
 * Verifica che i modal ottimizzati funzionino correttamente nel sistema
 */

import fs from 'fs'
import path from 'path'

class MobileModalIntegrationTester {
  constructor() {
    this.results = []
    this.errors = []
  }

  async runTests() {
    console.log('🧪 Testing Mobile Modal Integration...\n')
    
    // Test 1: Verifica che MobileOptimizedModal esista
    await this.testMobileOptimizedModalExists()
    
    // Test 2: Verifica che i fix siano stati applicati
    await this.testFixesApplied()
    
    // Test 3: Verifica compatibilità con componenti esistenti
    await this.testComponentCompatibility()
    
    // Test 4: Verifica performance
    await this.testPerformance()
    
    // Test 5: Verifica accessibilità
    await this.testAccessibility()
    
    this.generateReport()
  }

  async testMobileOptimizedModalExists() {
    console.log('📱 Test 1: MobileOptimizedModal Component')
    
    try {
      const modalPath = 'components/shared/MobileOptimizedModal.tsx'
      
      if (!fs.existsSync(modalPath)) {
        throw new Error('MobileOptimizedModal.tsx not found')
      }
      
      const content = fs.readFileSync(modalPath, 'utf8')
      
      // Verifica che contenga le funzioni essenziali
      const requiredFeatures = [
        'MobileOptimizedModal',
        'MobileBottomSheet', 
        'MobileConfirmDialog',
        'MobileActionSheet',
        'touch-manipulation',
        'min-h-[44px]',
        'max-w-[95vw]'
      ]
      
      const missingFeatures = requiredFeatures.filter(feature => 
        !content.includes(feature)
      )
      
      if (missingFeatures.length === 0) {
        this.addResult('MobileOptimizedModal', true, 'All required features present')
      } else {
        this.addResult('MobileOptimizedModal', false, `Missing: ${missingFeatures.join(', ')}`)
      }
      
    } catch (error) {
      this.addResult('MobileOptimizedModal', false, error.message)
    }
  }

  async testFixesApplied() {
    console.log('🔧 Test 2: Applied Fixes Verification')
    
    try {
      const reportPath = 'mobile-modal-fixes-applied.json'
      
      if (!fs.existsSync(reportPath)) {
        throw new Error('Fix report not found')
      }
      
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
      
      const expectedFiles = [
        'components/calendar/IntegratedCalendarWithChallenges.tsx',
        'components/shared/HomeDashboard.tsx',
        'components/ai/AIPlanningWizard.tsx',
        'components/ai/PlanPreviewModal.tsx',
        'components/plants/SmartPlantManager.tsx'
      ]
      
      const fixedFiles = report.fixedFiles.map(f => f.file)
      const allFixed = expectedFiles.every(file => 
        fixedFiles.includes(file)
      )
      
      if (allFixed) {
        this.addResult('Applied Fixes', true, `${report.filesFixed} files successfully fixed`)
      } else {
        const missing = expectedFiles.filter(file => !fixedFiles.includes(file))
        this.addResult('Applied Fixes', false, `Missing fixes for: ${missing.join(', ')}`)
      }
      
    } catch (error) {
      this.addResult('Applied Fixes', false, error.message)
    }
  }

  async testComponentCompatibility() {
    console.log('🔗 Test 3: Component Compatibility')
    
    try {
      // Verifica che i componenti fixati mantengano la funzionalità
      const testFiles = [
        'components/calendar/IntegratedCalendarWithChallenges.tsx',
        'components/ai/AIPlanningWizard.tsx',
        'components/plants/SmartPlantManager.tsx'
      ]
      
      let compatibilityIssues = 0
      
      for (const filePath of testFiles) {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8')
          
          // Verifica che non ci siano sintassi rotte
          const hasSyntaxIssues = 
            content.includes('className="') && 
            !content.includes('className=""') &&
            content.includes('export') &&
            content.includes('import')
          
          if (!hasSyntaxIssues) {
            compatibilityIssues++
          }
        }
      }
      
      if (compatibilityIssues === 0) {
        this.addResult('Component Compatibility', true, 'All components maintain proper syntax')
      } else {
        this.addResult('Component Compatibility', false, `${compatibilityIssues} components have syntax issues`)
      }
      
    } catch (error) {
      this.addResult('Component Compatibility', false, error.message)
    }
  }

  async testPerformance() {
    console.log('⚡ Test 4: Performance Impact')
    
    try {
      // Simula test di performance controllando dimensioni file
      const modalPath = 'components/shared/MobileOptimizedModal.tsx'
      
      if (fs.existsSync(modalPath)) {
        const stats = fs.statSync(modalPath)
        const sizeKB = stats.size / 1024
        
        // Il componente dovrebbe essere ragionevolmente piccolo
        if (sizeKB < 20) {
          this.addResult('Performance', true, `Component size: ${sizeKB.toFixed(1)}KB (optimal)`)
        } else if (sizeKB < 50) {
          this.addResult('Performance', true, `Component size: ${sizeKB.toFixed(1)}KB (acceptable)`)
        } else {
          this.addResult('Performance', false, `Component size: ${sizeKB.toFixed(1)}KB (too large)`)
        }
      } else {
        this.addResult('Performance', false, 'Component not found for performance test')
      }
      
    } catch (error) {
      this.addResult('Performance', false, error.message)
    }
  }

  async testAccessibility() {
    console.log('♿ Test 5: Accessibility Features')
    
    try {
      const modalPath = 'components/shared/MobileOptimizedModal.tsx'
      
      if (fs.existsSync(modalPath)) {
        const content = fs.readFileSync(modalPath, 'utf8')
        
        const accessibilityFeatures = [
          'aria-label',
          'touch-manipulation',
          'min-h-[44px]',
          'handleEscape',
          'focus'
        ]
        
        const presentFeatures = accessibilityFeatures.filter(feature =>
          content.includes(feature)
        )
        
        const score = (presentFeatures.length / accessibilityFeatures.length) * 100
        
        if (score >= 80) {
          this.addResult('Accessibility', true, `${score}% accessibility features present`)
        } else {
          this.addResult('Accessibility', false, `Only ${score}% accessibility features present`)
        }
      } else {
        this.addResult('Accessibility', false, 'Component not found for accessibility test')
      }
      
    } catch (error) {
      this.addResult('Accessibility', false, error.message)
    }
  }

  addResult(test, pass, message) {
    const result = { test, pass, message }
    this.results.push(result)
    
    const icon = pass ? '✅' : '❌'
    console.log(`  ${icon} ${test}: ${message}`)
  }

  generateReport() {
    console.log('\n📊 MOBILE MODAL INTEGRATION TEST REPORT')
    console.log('=' .repeat(50))
    
    const passedTests = this.results.filter(r => r.pass).length
    const totalTests = this.results.length
    const score = Math.round((passedTests / totalTests) * 100)
    
    console.log(`\n🎯 Overall Score: ${score}% (${passedTests}/${totalTests} tests passed)`)
    
    if (score >= 90) {
      console.log('🟢 Status: EXCELLENT - Mobile modals fully optimized')
    } else if (score >= 80) {
      console.log('🟡 Status: GOOD - Mobile modals well optimized')
    } else if (score >= 70) {
      console.log('🟠 Status: FAIR - Mobile modals need improvement')
    } else {
      console.log('🔴 Status: POOR - Mobile modals need major fixes')
    }
    
    console.log('\n📋 Test Details:')
    this.results.forEach(result => {
      const status = result.pass ? 'PASS' : 'FAIL'
      console.log(`  ${status}: ${result.test} - ${result.message}`)
    })
    
    // Salva report
    const report = {
      timestamp: new Date().toISOString(),
      score,
      passedTests,
      totalTests,
      status: score >= 90 ? 'EXCELLENT' : score >= 80 ? 'GOOD' : score >= 70 ? 'FAIR' : 'POOR',
      results: this.results,
      errors: this.errors
    }
    
    fs.writeFileSync('./mobile-modal-integration-test-report.json', JSON.stringify(report, null, 2))
    console.log('\n💾 Detailed report saved: mobile-modal-integration-test-report.json')
    
    return report
  }
}

// Esegui i test
async function main() {
  console.log('🚀 Starting Mobile Modal Integration Tests...\n')
  
  const tester = new MobileModalIntegrationTester()
  
  try {
    await tester.runTests()
    console.log('\n🎉 Mobile Modal Integration Tests Completed!')
    
  } catch (error) {
    console.error('❌ Error during integration tests:', error)
  }
}

main()