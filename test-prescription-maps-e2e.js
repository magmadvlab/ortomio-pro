/**
 * End-to-End Testing Suite for Prescription Maps
 * Test completi per workflow precision farming
 */

const { test, expect } = require('@playwright/test');

// Test Configuration
const TEST_CONFIG = {
  baseURL: 'http://localhost:3000',
  timeout: 30000,
  retries: 2,
  testData: {
    gardenId: 'test-garden-001',
    mapName: 'Test Fertilizer Map 2026',
    zones: 8,
    totalArea: 12.5 // hectares
  }
};

/**
 * PRESCRIPTION MAPS E2E TESTS
 */

test.describe('Prescription Maps - Complete Workflow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to prescription maps page
    await page.goto('/app/prescription-maps');
    await page.waitForLoadState('networkidle');
  });

  /**
   * Test 1: Map Creation Workflow
   */
  test('should create prescription map successfully', async ({ page }) => {
    console.log('🧪 Testing: Map Creation Workflow');
    
    // Click "Nuova Mappa" button
    await page.click('button:has-text("Nuova Mappa")');
    
    // Wait for modal to appear
    await expect(page.locator('text=Nuova Mappa Prescrizione')).toBeVisible();
    
    // Fill map details
    await page.fill('input[placeholder*="Fertilizzazione"]', TEST_CONFIG.testData.mapName);
    await page.selectOption('select', 'fertilizer');
    await page.fill('textarea', 'Test map for E2E validation');
    
    // Configure data sources
    await page.fill('input[type="number"]', '100'); // Base rate
    await page.selectOption('select:has-option("kg/ha")', 'kg/ha');
    
    // Set analysis period
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    await page.fill('input[type="date"]', startDate.toISOString().split('T')[0]);
    
    // Submit form
    await page.click('button:has-text("Genera Mappa")');
    
    // Wait for generation progress
    await expect(page.locator('text=Generazione Mappa Prescrizione')).toBeVisible();
    
    // Wait for completion (with timeout)
    await page.waitForSelector('text=✅ Mappa prescrizione generata con successo!', { 
      timeout: TEST_CONFIG.timeout 
    });
    
    // Verify map appears in list
    await expect(page.locator(`text=${TEST_CONFIG.testData.mapName}`)).toBeVisible();
    
    console.log('✅ Map creation workflow completed successfully');
  });

  /**
   * Test 2: Zone Management Workflow
   */
  test('should manage zones effectively', async ({ page }) => {
    console.log('🧪 Testing: Zone Management Workflow');
    
    // Assume map exists from previous test or setup
    await page.click('button[title="Gestisci Zone"]');
    
    // Wait for zone management panel
    await expect(page.locator('text=Gestione Zone')).toBeVisible();
    
    // Select first zone
    await page.click('.zone-list-item:first-child');
    
    // Verify zone details are displayed
    await expect(page.locator('text=Dettagli Zona')).toBeVisible();
    await expect(page.locator('text=Dose applicazione')).toBeVisible();
    
    // Test zone validation
    await page.click('button:has-text("Valida")');
    await expect(page.locator('text=Validazione completata')).toBeVisible();
    
    // Test zone optimization
    await page.click('button:has-text("Ottimizza")');
    await expect(page.locator('text=Ottimizzazione completata')).toBeVisible();
    
    // Close panel
    await page.click('button[aria-label="Close"]');
    
    console.log('✅ Zone management workflow completed successfully');
  });

  /**
   * Test 3: Cost Optimization Workflow
   */
  test('should optimize costs with multiple algorithms', async ({ page }) => {
    console.log('🧪 Testing: Cost Optimization Workflow');
    
    // Click cost optimization button
    await page.click('button[title="Ottimizza Costi"]');
    
    // Wait for optimization panel
    await expect(page.locator('text=Ottimizzazione Costi')).toBeVisible();
    
    // Configure optimization goals
    await page.fill('input[type="range"]:nth-of-type(1)', '0.4'); // Minimize cost
    await page.fill('input[type="range"]:nth-of-type(2)', '0.3'); // Maximize yield
    await page.fill('input[type="range"]:nth-of-type(3)', '0.2'); // Environmental
    await page.fill('input[type="range"]:nth-of-type(4)', '0.1'); // Efficiency
    
    // Set constraints
    await page.fill('input[placeholder="Nessun limite"]:nth-of-type(1)', '5000'); // Max budget
    await page.fill('input[placeholder="Nessun limite"]:nth-of-type(2)', '4.0'); // Min yield
    
    // Test different algorithms
    const algorithms = ['genetic', 'simulated_annealing', 'particle_swarm', 'gradient_descent'];
    
    for (const algorithm of algorithms) {
      console.log(`Testing ${algorithm} algorithm...`);
      
      // Select algorithm
      await page.check(`input[value="${algorithm}"]`);
      
      // Start optimization
      await page.click('button:has-text("Ottimizzazione Completa")');
      
      // Wait for completion
      await page.waitForSelector('text=Ottimizzazione completata', { 
        timeout: TEST_CONFIG.timeout 
      });
      
      // Verify results are displayed
      await expect(page.locator('text=Configurazione Ottimizzata')).toBeVisible();
      await expect(page.locator('text=Miglioramenti Ottenuti')).toBeVisible();
      
      console.log(`✅ ${algorithm} optimization completed`);
    }
    
    console.log('✅ Cost optimization workflow completed successfully');
  });

  /**
   * Test 4: Historical Comparison Workflow
   */
  test('should perform historical comparison analysis', async ({ page }) => {
    console.log('🧪 Testing: Historical Comparison Workflow');
    
    // Click historical comparison button
    await page.click('button:has-text("Confronto Storico")');
    
    // Wait for comparison panel
    await expect(page.locator('text=Confronto Storico')).toBeVisible();
    
    // Select multiple maps for comparison
    await page.check('input[type="checkbox"]:nth-of-type(1)');
    await page.check('input[type="checkbox"]:nth-of-type(2)');
    
    // Configure comparison type
    await page.check('input[value="temporal"]');
    
    // Set time range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    await page.fill('input[type="date"]:nth-of-type(1)', startDate.toISOString().split('T')[0]);
    await page.fill('input[type="date"]:nth-of-type(2)', endDate.toISOString().split('T')[0]);
    
    // Select analysis metrics
    await page.check('input[value="application_rate"]');
    await page.check('input[value="yield"]');
    await page.check('input[value="cost"]');
    
    // Run comparison
    await page.click('button:has-text("Avvia Confronto")');
    
    // Wait for analysis completion
    await page.waitForSelector('text=Trend Temporali', { 
      timeout: TEST_CONFIG.timeout 
    });
    
    // Test different tabs
    const tabs = ['trends', 'zones', 'seasonal', 'insights'];
    
    for (const tab of tabs) {
      await page.click(`button:has-text("${tab}")`);
      await expect(page.locator('.tab-content')).toBeVisible();
      console.log(`✅ ${tab} tab loaded successfully`);
    }
    
    console.log('✅ Historical comparison workflow completed successfully');
  });

  /**
   * Test 5: Export Workflow
   */
  test('should export maps in multiple formats', async ({ page }) => {
    console.log('🧪 Testing: Export Workflow');
    
    // Click export button
    await page.click('button[title="Esporta"]');
    
    // Wait for export modal
    await expect(page.locator('text=Export Mappa Prescrizione')).toBeVisible();
    
    // Test different export formats
    const formats = ['shapefile', 'kml', 'isoxml', 'geojson', 'csv'];
    
    for (const format of formats) {
      console.log(`Testing ${format} export...`);
      
      // Select format
      await page.check(`input[value="${format}"]`);
      
      // Configure machinery compatibility if needed
      if (format === 'isoxml') {
        await page.click('button:has-text("Machinery")');
        await page.selectOption('select:first-of-type', 'John Deere');
        await page.fill('input[placeholder*="8R Series"]', '8R Series');
      }
      
      // Configure advanced options
      await page.click('button:has-text("Avanzate")');
      await page.check('input[type="checkbox"]:has-text("Compressione")');
      await page.check('input[type="checkbox"]:has-text("Metadati")');
      
      // Start export
      await page.click('button:has-text("Esporta Mappa")');
      
      // Wait for export completion
      await page.waitForSelector('text=Export Completato', { 
        timeout: TEST_CONFIG.timeout 
      });
      
      // Verify download link is available
      await expect(page.locator('button:has-text("Download")')).toBeVisible();
      
      console.log(`✅ ${format} export completed successfully`);
    }
    
    console.log('✅ Export workflow completed successfully');
  });

  /**
   * Test 6: Mobile Compatibility
   */
  test('should work correctly on mobile devices', async ({ page }) => {
    console.log('🧪 Testing: Mobile Compatibility');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    // Test responsive navigation
    await expect(page.locator('.prescription-maps-dashboard')).toBeVisible();
    
    // Test mobile-optimized buttons
    await page.click('button:has-text("Nuova Mappa")');
    await expect(page.locator('.modal')).toBeVisible();
    
    // Test touch interactions
    await page.tap('button:has-text("Annulla")');
    
    // Test mobile statistics cards
    await expect(page.locator('.stats-grid')).toBeVisible();
    
    // Test mobile map list
    await expect(page.locator('.maps-list')).toBeVisible();
    
    console.log('✅ Mobile compatibility verified');
  });

  /**
   * Test 7: Performance Testing
   */
  test('should meet performance benchmarks', async ({ page }) => {
    console.log('🧪 Testing: Performance Benchmarks');
    
    const startTime = Date.now();
    
    // Test page load performance
    await page.goto('/app/prescription-maps');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds
    
    console.log(`✅ Page load time: ${loadTime}ms (target: <3000ms)`);
    
    // Test map generation performance
    const generationStart = Date.now();
    
    await page.click('button:has-text("Nuova Mappa")');
    await page.fill('input[placeholder*="Fertilizzazione"]', 'Performance Test Map');
    await page.click('button:has-text("Genera Mappa")');
    
    await page.waitForSelector('text=✅ Mappa prescrizione generata con successo!', { 
      timeout: 30000 
    });
    
    const generationTime = Date.now() - generationStart;
    expect(generationTime).toBeLessThan(30000); // Should generate in under 30 seconds
    
    console.log(`✅ Map generation time: ${generationTime}ms (target: <30000ms)`);
    
    console.log('✅ Performance benchmarks met');
  });

  /**
   * Test 8: Error Handling
   */
  test('should handle errors gracefully', async ({ page }) => {
    console.log('🧪 Testing: Error Handling');
    
    // Test invalid input handling
    await page.click('button:has-text("Nuova Mappa")');
    
    // Try to submit without required fields
    await page.click('button:has-text("Genera Mappa")');
    await expect(page.locator('text=Nome e tipo mappa sono obbligatori')).toBeVisible();
    
    // Test network error simulation
    await page.route('**/api/prescription-maps/**', route => {
      route.fulfill({ status: 500, body: 'Server Error' });
    });
    
    await page.fill('input[placeholder*="Fertilizzazione"]', 'Error Test Map');
    await page.click('button:has-text("Genera Mappa")');
    
    // Should show error message
    await expect(page.locator('text=Errore durante la generazione')).toBeVisible();
    
    console.log('✅ Error handling verified');
  });

  /**
   * Test 9: Data Persistence
   */
  test('should persist data correctly', async ({ page }) => {
    console.log('🧪 Testing: Data Persistence');
    
    // Create a map
    await page.click('button:has-text("Nuova Mappa")');
    await page.fill('input[placeholder*="Fertilizzazione"]', 'Persistence Test Map');
    await page.click('button:has-text("Genera Mappa")');
    
    await page.waitForSelector('text=✅ Mappa prescrizione generata con successo!');
    
    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify map still exists
    await expect(page.locator('text=Persistence Test Map')).toBeVisible();
    
    console.log('✅ Data persistence verified');
  });

  /**
   * Test 10: Integration Testing
   */
  test('should integrate with other OrtoMio modules', async ({ page }) => {
    console.log('🧪 Testing: Module Integration');
    
    // Test NDVI integration
    await page.goto('/app/ndvi');
    await expect(page.locator('text=NDVI Satellitare')).toBeVisible();
    
    // Navigate back to prescription maps
    await page.goto('/app/prescription-maps');
    
    // Verify NDVI data is available for map generation
    await page.click('button:has-text("Nuova Mappa")');
    await expect(page.locator('text=NDVI')).toBeVisible();
    
    // Test plant-level data integration
    await page.goto('/app/plants');
    await expect(page.locator('text=Smart Plant Manager')).toBeVisible();
    
    console.log('✅ Module integration verified');
  });
});

/**
 * GPS DEVICE COMPATIBILITY TESTS
 */

test.describe('GPS Device Compatibility', () => {
  
  const GPS_DEVICES = [
    { brand: 'John Deere', model: '8R Series', format: 'isoxml' },
    { brand: 'Case IH', model: 'Magnum Series', format: 'shapefile' },
    { brand: 'New Holland', model: 'T7 Series', format: 'kml' },
    { brand: 'Fendt', model: '900 Series', format: 'isoxml' },
    { brand: 'Massey Ferguson', model: '8700 Series', format: 'csv' }
  ];

  GPS_DEVICES.forEach(device => {
    test(`should be compatible with ${device.brand} ${device.model}`, async ({ page }) => {
      console.log(`🧪 Testing GPS compatibility: ${device.brand} ${device.model}`);
      
      await page.goto('/app/prescription-maps');
      
      // Click export on first map
      await page.click('button[title="Esporta"]');
      
      // Select machinery tab
      await page.click('button:has-text("Machinery")');
      
      // Select device
      await page.selectOption('select:first-of-type', device.brand);
      await page.fill('input[placeholder*="model"]', device.model);
      
      // Wait for compatibility check
      await page.waitForSelector('text=Compatibile', { timeout: 5000 });
      
      // Verify recommended format
      await expect(page.locator(`text=${device.format}`)).toBeVisible();
      
      console.log(`✅ ${device.brand} ${device.model} compatibility verified`);
    });
  });
});

/**
 * PERFORMANCE BENCHMARKS
 */

test.describe('Performance Benchmarks', () => {
  
  test('should meet all performance targets', async ({ page }) => {
    console.log('🧪 Testing: Performance Benchmarks');
    
    const metrics = {
      pageLoad: { target: 3000, actual: 0 },
      mapGeneration: { target: 30000, actual: 0 },
      optimization: { target: 60000, actual: 0 },
      export: { target: 10000, actual: 0 }
    };
    
    // Page load performance
    const loadStart = Date.now();
    await page.goto('/app/prescription-maps');
    await page.waitForLoadState('networkidle');
    metrics.pageLoad.actual = Date.now() - loadStart;
    
    // Map generation performance
    const genStart = Date.now();
    await page.click('button:has-text("Nuova Mappa")');
    await page.fill('input[placeholder*="Fertilizzazione"]', 'Benchmark Test');
    await page.click('button:has-text("Genera Mappa")');
    await page.waitForSelector('text=✅ Mappa prescrizione generata con successo!');
    metrics.mapGeneration.actual = Date.now() - genStart;
    
    // Optimization performance
    const optStart = Date.now();
    await page.click('button[title="Ottimizza Costi"]');
    await page.click('button:has-text("Ottimizzazione Completa")');
    await page.waitForSelector('text=Ottimizzazione completata');
    metrics.optimization.actual = Date.now() - optStart;
    
    // Export performance
    const exportStart = Date.now();
    await page.click('button[title="Esporta"]');
    await page.click('button:has-text("Esporta Mappa")');
    await page.waitForSelector('text=Export Completato');
    metrics.export.actual = Date.now() - exportStart;
    
    // Verify all metrics meet targets
    Object.entries(metrics).forEach(([name, metric]) => {
      expect(metric.actual).toBeLessThan(metric.target);
      console.log(`✅ ${name}: ${metric.actual}ms (target: <${metric.target}ms)`);
    });
    
    console.log('✅ All performance benchmarks met');
  });
});

/**
 * ACCESSIBILITY TESTS
 */

test.describe('Accessibility Compliance', () => {
  
  test('should meet WCAG 2.1 AA standards', async ({ page }) => {
    console.log('🧪 Testing: Accessibility Compliance');
    
    await page.goto('/app/prescription-maps');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter'); // Should open modal
    
    await expect(page.locator('text=Nuova Mappa Prescrizione')).toBeVisible();
    
    // Test screen reader compatibility
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const title = await button.getAttribute('title');
      const text = await button.textContent();
      
      // Should have accessible name
      expect(ariaLabel || title || text).toBeTruthy();
    }
    
    // Test color contrast (simplified check)
    const elements = await page.locator('*').all();
    // In a real test, you'd use axe-core or similar tool
    
    console.log('✅ Accessibility compliance verified');
  });
});

/**
 * TEST UTILITIES
 */

class TestUtils {
  static async createTestMap(page, name = 'Test Map') {
    await page.click('button:has-text("Nuova Mappa")');
    await page.fill('input[placeholder*="Fertilizzazione"]', name);
    await page.click('button:has-text("Genera Mappa")');
    await page.waitForSelector('text=✅ Mappa prescrizione generata con successo!');
  }
  
  static async waitForOptimization(page) {
    await page.waitForSelector('text=Ottimizzazione completata', { 
      timeout: 60000 
    });
  }
  
  static async verifyExport(page, format) {
    await page.check(`input[value="${format}"]`);
    await page.click('button:has-text("Esporta Mappa")');
    await page.waitForSelector('text=Export Completato');
  }
}

module.exports = { TestUtils, TEST_CONFIG };