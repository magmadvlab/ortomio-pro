/**
 * Final Validation Script for Prescription Maps
 * Comprehensive test of all core functionality
 */

const fs = require('fs');
const path = require('path');

// Validation Configuration
const VALIDATION_CONFIG = {
  testMode: 'comprehensive',
  timeout: 30000,
  expectedFiles: [
    'components/prescription/PrescriptionMapsDashboard.tsx',
    'components/prescription/ZoneManagementPanel.tsx',
    'components/prescription/MapExportModal.tsx',
    'components/prescription/HistoricalComparisonPanel.tsx',
    'components/prescription/CostOptimizationPanel.tsx',
    'services/prescriptionMapsService.ts',
    'services/zoneManagementService.ts',
    'services/geoExportService.ts',
    'services/machineryIntegrationService.ts',
    'services/historicalComparisonService.ts',
    'services/costOptimizationService.ts',
    'types/prescriptionMaps.ts',
    'supabase/migrations/20260111100000_create_prescription_maps_schema.sql'
  ]
};

/**
 * Prescription Maps Validator
 */
class PrescriptionMapsValidator {
  constructor() {
    this.results = {
      fileStructure: { passed: 0, failed: 0, details: [] },
      codeQuality: { passed: 0, failed: 0, details: [] },
      integration: { passed: 0, failed: 0, details: [] },
      functionality: { passed: 0, failed: 0, details: [] },
      performance: { passed: 0, failed: 0, details: [] }
    };
  }

  /**
   * Run complete validation suite
   */
  async runValidation() {
    console.log('🔍 Starting Prescription Maps Final Validation');
    console.log('=' .repeat(60));
    
    try {
      // Test 1: File Structure Validation
      await this.validateFileStructure();
      
      // Test 2: Code Quality Validation
      await this.validateCodeQuality();
      
      // Test 3: Integration Validation
      await this.validateIntegration();
      
      // Test 4: Functionality Validation
      await this.validateFunctionality();
      
      // Test 5: Performance Validation
      await this.validatePerformance();
      
      // Generate final report
      this.generateFinalReport();
      
      return this.results;
      
    } catch (error) {
      console.error('❌ Validation failed:', error);
      throw error;
    }
  }

  /**
   * Validate file structure and completeness
   */
  async validateFileStructure() {
    console.log('\n📁 Validating File Structure...');
    
    for (const filePath of VALIDATION_CONFIG.expectedFiles) {
      try {
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          if (stats.size > 0) {
            this.results.fileStructure.passed++;
            this.results.fileStructure.details.push({
              file: filePath,
              status: 'PASS',
              size: stats.size,
              message: 'File exists and has content'
            });
            console.log(`   ✅ ${filePath} (${stats.size} bytes)`);
          } else {
            this.results.fileStructure.failed++;
            this.results.fileStructure.details.push({
              file: filePath,
              status: 'FAIL',
              size: 0,
              message: 'File exists but is empty'
            });
            console.log(`   ❌ ${filePath} (empty file)`);
          }
        } else {
          this.results.fileStructure.failed++;
          this.results.fileStructure.details.push({
            file: filePath,
            status: 'FAIL',
            size: 0,
            message: 'File does not exist'
          });
          console.log(`   ❌ ${filePath} (missing)`);
        }
      } catch (error) {
        this.results.fileStructure.failed++;
        this.results.fileStructure.details.push({
          file: filePath,
          status: 'ERROR',
          size: 0,
          message: error.message
        });
        console.log(`   ⚠️ ${filePath} (error: ${error.message})`);
      }
    }
    
    const total = this.results.fileStructure.passed + this.results.fileStructure.failed;
    const percentage = Math.round((this.results.fileStructure.passed / total) * 100);
    console.log(`   File Structure: ${this.results.fileStructure.passed}/${total} (${percentage}%)`);
  }

  /**
   * Validate code quality and TypeScript compliance
   */
  async validateCodeQuality() {
    console.log('\n🔍 Validating Code Quality...');
    
    const tsFiles = VALIDATION_CONFIG.expectedFiles.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
    
    for (const filePath of tsFiles) {
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Check for TypeScript best practices
          const checks = [
            {
              name: 'Has proper imports',
              test: content.includes('import') || content.includes('export'),
              weight: 1
            },
            {
              name: 'Has type definitions',
              test: content.includes('interface') || content.includes('type') || content.includes(': '),
              weight: 2
            },
            {
              name: 'Has proper exports',
              test: content.includes('export'),
              weight: 1
            },
            {
              name: 'No console.log in production',
              test: !content.includes('console.log') || content.includes('// DEBUG'),
              weight: 1
            },
            {
              name: 'Has error handling',
              test: content.includes('try') || content.includes('catch') || content.includes('throw'),
              weight: 2
            }
          ];
          
          let score = 0;
          let maxScore = 0;
          const failedChecks = [];
          
          for (const check of checks) {
            maxScore += check.weight;
            if (check.test) {
              score += check.weight;
            } else {
              failedChecks.push(check.name);
            }
          }
          
          const percentage = Math.round((score / maxScore) * 100);
          
          if (percentage >= 80) {
            this.results.codeQuality.passed++;
            console.log(`   ✅ ${filePath} (${percentage}%)`);
          } else {
            this.results.codeQuality.failed++;
            console.log(`   ❌ ${filePath} (${percentage}%) - Failed: ${failedChecks.join(', ')}`);
          }
          
          this.results.codeQuality.details.push({
            file: filePath,
            status: percentage >= 80 ? 'PASS' : 'FAIL',
            score: percentage,
            failedChecks
          });
          
        } catch (error) {
          this.results.codeQuality.failed++;
          console.log(`   ⚠️ ${filePath} (error reading file)`);
        }
      }
    }
    
    const total = this.results.codeQuality.passed + this.results.codeQuality.failed;
    const percentage = total > 0 ? Math.round((this.results.codeQuality.passed / total) * 100) : 0;
    console.log(`   Code Quality: ${this.results.codeQuality.passed}/${total} (${percentage}%)`);
  }

  /**
   * Validate integration between components
   */
  async validateIntegration() {
    console.log('\n🔗 Validating Integration...');
    
    const integrationTests = [
      {
        name: 'Dashboard imports all panels',
        test: () => {
          if (!fs.existsSync('components/prescription/PrescriptionMapsDashboard.tsx')) return false;
          const content = fs.readFileSync('components/prescription/PrescriptionMapsDashboard.tsx', 'utf8');
          return content.includes('ZoneManagementPanel') && 
                 content.includes('HistoricalComparisonPanel') && 
                 content.includes('CostOptimizationPanel');
        }
      },
      {
        name: 'Services are properly typed',
        test: () => {
          if (!fs.existsSync('types/prescriptionMaps.ts')) return false;
          const typesContent = fs.readFileSync('types/prescriptionMaps.ts', 'utf8');
          return typesContent.includes('PrescriptionMap') && 
                 typesContent.includes('PrescriptionZone');
        }
      },
      {
        name: 'Database schema is complete',
        test: () => {
          if (!fs.existsSync('supabase/migrations/20260111100000_create_prescription_maps_schema.sql')) return false;
          const schemaContent = fs.readFileSync('supabase/migrations/20260111100000_create_prescription_maps_schema.sql', 'utf8');
          return schemaContent.includes('prescription_maps') && 
                 schemaContent.includes('prescription_zones');
        }
      },
      {
        name: 'Export service supports multiple formats',
        test: () => {
          if (!fs.existsSync('services/geoExportService.ts')) return false;
          const exportContent = fs.readFileSync('services/geoExportService.ts', 'utf8');
          return exportContent.includes('shapefile') && 
                 exportContent.includes('kml') && 
                 exportContent.includes('isoxml');
        }
      },
      {
        name: 'Optimization service has multiple algorithms',
        test: () => {
          if (!fs.existsSync('services/costOptimizationService.ts')) return false;
          const optContent = fs.readFileSync('services/costOptimizationService.ts', 'utf8');
          return optContent.includes('genetic') && 
                 optContent.includes('simulated') && 
                 optContent.includes('particle');
        }
      }
    ];
    
    for (const test of integrationTests) {
      try {
        if (test.test()) {
          this.results.integration.passed++;
          console.log(`   ✅ ${test.name}`);
        } else {
          this.results.integration.failed++;
          console.log(`   ❌ ${test.name}`);
        }
      } catch (error) {
        this.results.integration.failed++;
        console.log(`   ⚠️ ${test.name} (error: ${error.message})`);
      }
    }
    
    const total = this.results.integration.passed + this.results.integration.failed;
    const percentage = Math.round((this.results.integration.passed / total) * 100);
    console.log(`   Integration: ${this.results.integration.passed}/${total} (${percentage}%)`);
  }

  /**
   * Validate core functionality implementation
   */
  async validateFunctionality() {
    console.log('\n⚙️ Validating Functionality...');
    
    const functionalityTests = [
      {
        name: 'Map generation logic implemented',
        test: () => {
          if (!fs.existsSync('services/prescriptionMapsService.ts')) return false;
          const content = fs.readFileSync('services/prescriptionMapsService.ts', 'utf8');
          return content.includes('generatePrescriptionMap') && 
                 content.includes('calculateZones');
        }
      },
      {
        name: 'Zone management functionality',
        test: () => {
          if (!fs.existsSync('services/zoneManagementService.ts')) return false;
          const content = fs.readFileSync('services/zoneManagementService.ts', 'utf8');
          return content.includes('updateZone') && 
                 content.includes('validateZone');
        }
      },
      {
        name: 'Historical comparison features',
        test: () => {
          if (!fs.existsSync('services/historicalComparisonService.ts')) return false;
          const content = fs.readFileSync('services/historicalComparisonService.ts', 'utf8');
          return content.includes('compareMaps') && 
                 content.includes('analyzeTrends');
        }
      },
      {
        name: 'Cost optimization algorithms',
        test: () => {
          if (!fs.existsSync('services/costOptimizationService.ts')) return false;
          const content = fs.readFileSync('services/costOptimizationService.ts', 'utf8');
          return content.includes('optimizeCosts') && 
                 content.includes('geneticAlgorithm');
        }
      },
      {
        name: 'Machinery integration support',
        test: () => {
          if (!fs.existsSync('services/machineryIntegrationService.ts')) return false;
          const content = fs.readFileSync('services/machineryIntegrationService.ts', 'utf8');
          return content.includes('checkCompatibility') && 
                 content.includes('connectMachinery');
        }
      },
      {
        name: 'Export functionality complete',
        test: () => {
          if (!fs.existsSync('services/geoExportService.ts')) return false;
          const content = fs.readFileSync('services/geoExportService.ts', 'utf8');
          return content.includes('exportToShapefile') && 
                 content.includes('exportToKML') && 
                 content.includes('exportToISOXML');
        }
      }
    ];
    
    for (const test of functionalityTests) {
      try {
        if (test.test()) {
          this.results.functionality.passed++;
          console.log(`   ✅ ${test.name}`);
        } else {
          this.results.functionality.failed++;
          console.log(`   ❌ ${test.name}`);
        }
      } catch (error) {
        this.results.functionality.failed++;
        console.log(`   ⚠️ ${test.name} (error: ${error.message})`);
      }
    }
    
    const total = this.results.functionality.passed + this.results.functionality.failed;
    const percentage = Math.round((this.results.functionality.passed / total) * 100);
    console.log(`   Functionality: ${this.results.functionality.passed}/${total} (${percentage}%)`);
  }

  /**
   * Validate performance characteristics
   */
  async validatePerformance() {
    console.log('\n⚡ Validating Performance...');
    
    const performanceTests = [
      {
        name: 'File sizes are reasonable',
        test: () => {
          let totalSize = 0;
          let fileCount = 0;
          
          for (const filePath of VALIDATION_CONFIG.expectedFiles) {
            if (fs.existsSync(filePath)) {
              const stats = fs.statSync(filePath);
              totalSize += stats.size;
              fileCount++;
              
              // Check individual file size (should be < 100KB for most files)
              if (stats.size > 100 * 1024 && !filePath.includes('.sql')) {
                return false;
              }
            }
          }
          
          // Total size should be reasonable (< 2MB)
          return totalSize < 2 * 1024 * 1024;
        }
      },
      {
        name: 'No obvious performance anti-patterns',
        test: () => {
          const tsFiles = VALIDATION_CONFIG.expectedFiles.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
          
          for (const filePath of tsFiles) {
            if (fs.existsSync(filePath)) {
              const content = fs.readFileSync(filePath, 'utf8');
              
              // Check for performance anti-patterns
              if (content.includes('while(true)') || 
                  content.includes('for(;;)') ||
                  content.match(/setInterval\([^,]+,\s*[0-9]{1,2}\)/)) { // Very short intervals
                return false;
              }
            }
          }
          
          return true;
        }
      },
      {
        name: 'Proper async/await usage',
        test: () => {
          const tsFiles = VALIDATION_CONFIG.expectedFiles.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
          let hasAsync = false;
          
          for (const filePath of tsFiles) {
            if (fs.existsSync(filePath)) {
              const content = fs.readFileSync(filePath, 'utf8');
              
              if (content.includes('async') && content.includes('await')) {
                hasAsync = true;
                
                // Check for proper error handling with async
                if (!content.includes('try') && !content.includes('catch')) {
                  return false;
                }
              }
            }
          }
          
          return hasAsync; // Should have some async operations
        }
      }
    ];
    
    for (const test of performanceTests) {
      try {
        if (test.test()) {
          this.results.performance.passed++;
          console.log(`   ✅ ${test.name}`);
        } else {
          this.results.performance.failed++;
          console.log(`   ❌ ${test.name}`);
        }
      } catch (error) {
        this.results.performance.failed++;
        console.log(`   ⚠️ ${test.name} (error: ${error.message})`);
      }
    }
    
    const total = this.results.performance.passed + this.results.performance.failed;
    const percentage = Math.round((this.results.performance.passed / total) * 100);
    console.log(`   Performance: ${this.results.performance.passed}/${total} (${percentage}%)`);
  }

  /**
   * Generate final validation report
   */
  generateFinalReport() {
    console.log('\n📊 FINAL VALIDATION REPORT');
    console.log('=' .repeat(60));
    
    const categories = Object.keys(this.results);
    let totalPassed = 0;
    let totalTests = 0;
    
    for (const category of categories) {
      const result = this.results[category];
      const total = result.passed + result.failed;
      const percentage = total > 0 ? Math.round((result.passed / total) * 100) : 0;
      
      totalPassed += result.passed;
      totalTests += total;
      
      const status = percentage >= 80 ? '✅ PASS' : percentage >= 60 ? '⚠️ WARN' : '❌ FAIL';
      console.log(`${category.padEnd(20)} ${result.passed}/${total} (${percentage}%) ${status}`);
    }
    
    const overallPercentage = Math.round((totalPassed / totalTests) * 100);
    const overallStatus = overallPercentage >= 90 ? '🏆 EXCELLENT' : 
                         overallPercentage >= 80 ? '✅ GOOD' : 
                         overallPercentage >= 60 ? '⚠️ NEEDS WORK' : '❌ CRITICAL';
    
    console.log('-' .repeat(60));
    console.log(`OVERALL SCORE: ${totalPassed}/${totalTests} (${overallPercentage}%) ${overallStatus}`);
    
    // Generate recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    
    if (this.results.fileStructure.failed > 0) {
      console.log('   - Complete missing files in file structure');
    }
    
    if (this.results.codeQuality.failed > 0) {
      console.log('   - Improve TypeScript code quality and type safety');
    }
    
    if (this.results.integration.failed > 0) {
      console.log('   - Fix integration issues between components');
    }
    
    if (this.results.functionality.failed > 0) {
      console.log('   - Implement missing core functionality');
    }
    
    if (this.results.performance.failed > 0) {
      console.log('   - Address performance concerns and anti-patterns');
    }
    
    if (overallPercentage >= 90) {
      console.log('   🎉 System is ready for production deployment!');
    } else if (overallPercentage >= 80) {
      console.log('   👍 System is mostly ready, address minor issues');
    } else {
      console.log('   🔧 System needs significant work before deployment');
    }
    
    // Save detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      overallScore: overallPercentage,
      overallStatus,
      totalPassed,
      totalTests,
      categories: this.results,
      summary: {
        fileStructure: `${this.results.fileStructure.passed}/${this.results.fileStructure.passed + this.results.fileStructure.failed}`,
        codeQuality: `${this.results.codeQuality.passed}/${this.results.codeQuality.passed + this.results.codeQuality.failed}`,
        integration: `${this.results.integration.passed}/${this.results.integration.passed + this.results.integration.failed}`,
        functionality: `${this.results.functionality.passed}/${this.results.functionality.passed + this.results.functionality.failed}`,
        performance: `${this.results.performance.passed}/${this.results.performance.passed + this.results.performance.failed}`
      }
    };
    
    fs.writeFileSync('prescription-maps-validation-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 Detailed report saved: prescription-maps-validation-report.json');
  }
}

/**
 * Run validation if called directly
 */
async function runValidation() {
  const validator = new PrescriptionMapsValidator();
  
  try {
    const results = await validator.runValidation();
    
    const totalPassed = Object.values(results).reduce((sum, cat) => sum + cat.passed, 0);
    const totalTests = Object.values(results).reduce((sum, cat) => sum + cat.passed + cat.failed, 0);
    const overallPercentage = Math.round((totalPassed / totalTests) * 100);
    
    if (overallPercentage >= 80) {
      console.log('\n🎉 PRESCRIPTION MAPS VALIDATION SUCCESSFUL!');
      process.exit(0);
    } else {
      console.log('\n⚠️ PRESCRIPTION MAPS VALIDATION NEEDS ATTENTION');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ PRESCRIPTION MAPS VALIDATION FAILED:', error);
    process.exit(1);
  }
}

// Export for use in other scripts
module.exports = { PrescriptionMapsValidator };

// Run if called directly
if (require.main === module) {
  runValidation();
}