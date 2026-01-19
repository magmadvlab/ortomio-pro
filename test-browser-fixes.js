/**
 * Test script to verify browser error fixes
 * Run this in the browser console to test the fixes
 */

console.log('🧪 Testing Browser Error Fixes...')

// Test 1: Weather Service Functions
console.log('\n1. Testing Weather Service Functions...')
try {
  // Test if weather functions are available
  import('/services/weatherService.js').then(module => {
    if (module.getWeatherForecast && module.getWeatherForecast7Days) {
      console.log('✅ Weather functions exported correctly')
      
      // Test function calls (mock coordinates for Rome)
      module.getWeatherForecast(41.9028, 12.4964, 7)
        .then(data => console.log('✅ getWeatherForecast working:', data.length, 'days'))
        .catch(err => console.log('❌ getWeatherForecast error:', err.message))
      
      module.getWeatherForecast7Days(41.9028, 12.4964)
        .then(data => console.log('✅ getWeatherForecast7Days working:', data.length, 'days'))
        .catch(err => console.log('❌ getWeatherForecast7Days error:', err.message))
    } else {
      console.log('❌ Weather functions not exported')
    }
  }).catch(err => console.log('❌ Weather service import error:', err.message))
} catch (error) {
  console.log('❌ Weather service test failed:', error.message)
}

// Test 2: AI Suggestions API
console.log('\n2. Testing AI Suggestions API...')
fetch('/api/ai/suggestions?user_id=test-user&garden_id=test-garden')
  .then(response => {
    if (response.ok) {
      console.log('✅ AI Suggestions API responding')
      return response.json()
    } else {
      console.log('❌ AI Suggestions API error:', response.status)
    }
  })
  .then(data => {
    if (data) {
      console.log('✅ AI Suggestions data received:', data.length, 'suggestions')
    }
  })
  .catch(err => console.log('❌ AI Suggestions API error:', err.message))

// Test 3: Route Availability
console.log('\n3. Testing Route Availability...')
const routes = [
  '/app/export',
  '/app/almanacco', 
  '/pianifica'
]

routes.forEach(route => {
  fetch(route, { method: 'HEAD' })
    .then(response => {
      if (response.ok || response.status === 405) { // 405 = Method Not Allowed is OK for HEAD
        console.log(`✅ Route ${route} available`)
      } else {
        console.log(`❌ Route ${route} not found (${response.status})`)
      }
    })
    .catch(err => console.log(`❌ Route ${route} error:`, err.message))
})

// Test 4: Supabase Client Instances
console.log('\n4. Testing Supabase Client Management...')
try {
  import('/config/supabase.js').then(module => {
    const client1 = module.getSupabaseClient()
    const client2 = module.getSupabaseClient()
    
    if (client1 === client2) {
      console.log('✅ Supabase client singleton working correctly')
    } else {
      console.log('❌ Multiple Supabase client instances detected')
    }
  }).catch(err => console.log('❌ Supabase client test error:', err.message))
} catch (error) {
  console.log('❌ Supabase client test failed:', error.message)
}

// Test 5: Console Error Monitoring
console.log('\n5. Monitoring for specific errors...')
const originalError = console.error
let errorCount = 0

console.error = function(...args) {
  const message = args.join(' ')
  
  // Check for specific errors we fixed
  if (message.includes('getWeatherForecast') && message.includes('is not a function')) {
    console.log('❌ Weather function error still present:', message)
    errorCount++
  } else if (message.includes('Multiple GoTrueClient instances')) {
    console.log('❌ Multiple Supabase client error still present:', message)
    errorCount++
  } else if (message.includes('404') && (message.includes('export') || message.includes('almanacco') || message.includes('pianifica'))) {
    console.log('❌ Route 404 error still present:', message)
    errorCount++
  }
  
  // Call original console.error
  originalError.apply(console, args)
}

// Summary after 5 seconds
setTimeout(() => {
  console.log('\n📊 Test Summary:')
  if (errorCount === 0) {
    console.log('✅ No critical errors detected in the last 5 seconds')
  } else {
    console.log(`❌ ${errorCount} critical errors still present`)
  }
  
  console.log('\n🔧 If you still see errors:')
  console.log('1. Clear browser cache and reload')
  console.log('2. Check if Next.js dev server restarted')
  console.log('3. Verify all files were saved correctly')
  console.log('4. Check browser network tab for failed requests')
}, 5000)

console.log('\n⏳ Monitoring for 5 seconds...')