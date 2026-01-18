/**
 * Test Mobile Garden Layout Fixes
 * Tests the mobile responsiveness improvements for the garden page
 */

import puppeteer from 'puppeteer';

async function testMobileGardenLayout() {
  console.log('🧪 Testing Mobile Garden Layout Fixes...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // Test different mobile viewport sizes
    const viewports = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'Samsung Galaxy S21', width: 360, height: 800 },
      { name: 'iPad Mini', width: 768, height: 1024 }
    ];
    
    for (const viewport of viewports) {
      console.log(`📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      await page.setViewport({
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor: 2
      });
      
      // Navigate to garden page
      await page.goto('http://localhost:3002/app/garden', { 
        waitUntil: 'networkidle0',
        timeout: 15000 
      });
      
      // Wait for page to load
      await page.waitForSelector('header', { timeout: 10000 });
      
      // Test 1: Check if priority badge is properly positioned
      console.log('  ✓ Testing priority badge positioning...');
      const priorityBadge = await page.$('[class*="rounded-full"][class*="border-2"]');
      if (priorityBadge) {
        const boundingBox = await priorityBadge.boundingBox();
        const isVisible = boundingBox && boundingBox.width > 0 && boundingBox.height > 0;
        console.log(`    Priority badge visible: ${isVisible ? '✅' : '❌'}`);
        
        // Check if it's not cut off
        if (boundingBox) {
          const isWithinViewport = boundingBox.x >= 0 && 
                                 boundingBox.y >= 0 && 
                                 (boundingBox.x + boundingBox.width) <= viewport.width;
          console.log(`    Priority badge within viewport: ${isWithinViewport ? '✅' : '❌'}`);
        }
      }
      
      // Test 2: Check tab navigation accessibility
      console.log('  ✓ Testing tab navigation...');
      const tabs = await page.$$('button[class*="border-b-2"]');
      console.log(`    Found ${tabs.length} tabs`);
      
      if (tabs.length > 0) {
        // Check if tabs are horizontally scrollable on mobile
        const tabContainer = await page.$('div[class*="overflow-x-auto"]');
        if (tabContainer) {
          const containerBox = await tabContainer.boundingBox();
          const scrollWidth = await page.evaluate(el => el.scrollWidth, tabContainer);
          const clientWidth = await page.evaluate(el => el.clientWidth, tabContainer);
          
          console.log(`    Tab container scrollable: ${scrollWidth > clientWidth ? '✅' : '✅ (not needed)'}`);
          console.log(`    Scroll width: ${scrollWidth}px, Client width: ${clientWidth}px`);
        }
        
        // Test clicking each tab
        for (let i = 0; i < Math.min(tabs.length, 3); i++) {
          try {
            await tabs[i].click();
            await page.waitForTimeout(500);
            console.log(`    Tab ${i + 1} clickable: ✅`);
          } catch (error) {
            console.log(`    Tab ${i + 1} clickable: ❌ (${error.message})`);
          }
        }
      }
      
      // Test 3: Check header button accessibility
      console.log('  ✓ Testing header buttons...');
      const headerButtons = await page.$$('header button, header a');
      console.log(`    Found ${headerButtons.length} header buttons/links`);
      
      for (let i = 0; i < headerButtons.length; i++) {
        const button = headerButtons[i];
        const boundingBox = await button.boundingBox();
        
        if (boundingBox) {
          const isVisible = boundingBox.width > 0 && boundingBox.height > 0;
          const isAccessible = boundingBox.width >= 44 && boundingBox.height >= 44; // iOS accessibility guidelines
          
          console.log(`    Button ${i + 1} visible: ${isVisible ? '✅' : '❌'}`);
          console.log(`    Button ${i + 1} accessible size: ${isAccessible ? '✅' : '⚠️'} (${Math.round(boundingBox.width)}x${Math.round(boundingBox.height)})`);
        }
      }
      
      // Test 4: Check responsive text visibility
      console.log('  ✓ Testing responsive text...');
      const hiddenOnMobile = await page.$$('.hidden.sm\\:inline');
      const visibleOnMobile = await page.$$('.sm\\:hidden');
      
      console.log(`    Elements hidden on mobile: ${hiddenOnMobile.length}`);
      console.log(`    Elements visible only on mobile: ${visibleOnMobile.length}`);
      
      // Test 5: Check for horizontal overflow
      console.log('  ✓ Testing horizontal overflow...');
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = viewport.width;
      const hasHorizontalOverflow = bodyWidth > viewportWidth;
      
      console.log(`    Horizontal overflow: ${hasHorizontalOverflow ? '❌' : '✅'}`);
      console.log(`    Body width: ${bodyWidth}px, Viewport: ${viewportWidth}px`);
      
      console.log(`  📱 ${viewport.name} test completed\n`);
    }
    
    // Test desktop view for comparison
    console.log('🖥️  Testing Desktop View (1920x1080)');
    await page.setViewport({ width: 1920, height: 1080 });
    await page.reload({ waitUntil: 'networkidle0' });
    
    // Check if all elements are visible on desktop
    const desktopTabs = await page.$$('button[class*="border-b-2"] span:not(.hidden)');
    console.log(`  Desktop tabs with visible text: ${desktopTabs.length}`);
    
    const desktopButtons = await page.$$('header button span:not(.hidden), header a span:not(.hidden)');
    console.log(`  Desktop buttons with visible text: ${desktopButtons.length}`);
    
    console.log('\n✅ Mobile Garden Layout Test Completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testMobileGardenLayout().catch(console.error);

export { testMobileGardenLayout };