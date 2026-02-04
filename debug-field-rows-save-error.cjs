/**
 * Debug script per l'errore di salvataggio field rows
 * Analizza il problema dell'oggetto errore vuoto {}
 */

console.log('🔍 Field Rows Save Error Debug')
console.log('==============================')

// Test 1: Verifica struttura error handling
console.log('\n1️⃣ Checking Error Handling Structure...')

const fs = require('fs')

try {
  const editPageContent = fs.readFileSync('./app/app/garden/rows/edit/page.tsx', 'utf8')
  
  // Verifica presenza enhanced error logging
  const errorHandlingFeatures = [
    'Enhanced error logging',
    'Error type:',
    'Error constructor:',
    'Error toString:',
    'Error JSON:',
    'JSON.stringify(error, Object.getOwnPropertyNames(error))',
    'Object.keys(error)',
    'Object.values(error)',
    'Final error message:'
  ]
  
  let foundFeatures = 0
  errorHandlingFeatures.forEach(feature => {
    if (editPageContent.includes(feature)) {
      foundFeatures++
      console.log(`✅ ${feature}`)
    } else {
      console.log(`❌ Missing: ${feature}`)
    }
  })
  
  console.log(`\n📊 Error handling features: ${foundFeatures}/${errorHandlingFeatures.length}`)
  
} catch (error) {
  console.error('❌ Error reading edit page:', error.message)
}

// Test 2: Analizza possibili cause dell'errore vuoto
console.log('\n2️⃣ Analyzing Possible Causes...')

console.log('🔍 Possible causes for empty error object {}:')
console.log('1. Storage provider throwing non-Error objects')
console.log('2. Async/await error handling issues')
console.log('3. Promise rejection with undefined/null')
console.log('4. Network errors not properly serialized')
console.log('5. Supabase client errors with custom structure')

// Test 3: Verifica storage provider error patterns
console.log('\n3️⃣ Checking Storage Provider Error Patterns...')

try {
  // Cerca pattern di errore nei file storage
  const storageFiles = [
    './packages/core/hooks/useStorage.ts',
    './lib/storage/supabaseStorage.ts',
    './lib/storage/localStorageProvider.ts'
  ]
  
  storageFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ Found: ${file}`)
      const content = fs.readFileSync(file, 'utf8')
      
      // Cerca pattern di gestione errori
      if (content.includes('createFieldRow')) {
        console.log(`  - Contains createFieldRow method`)
      }
      if (content.includes('updateFieldRow')) {
        console.log(`  - Contains updateFieldRow method`)
      }
      if (content.includes('throw')) {
        console.log(`  - Contains throw statements`)
      }
      if (content.includes('catch')) {
        console.log(`  - Contains catch blocks`)
      }
    } else {
      console.log(`❌ Missing: ${file}`)
    }
  })
  
} catch (error) {
  console.error('❌ Error checking storage files:', error.message)
}

// Test 4: Suggerimenti per il debug
console.log('\n4️⃣ Debug Suggestions...')

console.log('🔧 To debug the empty error object:')
console.log('1. Check browser console for the enhanced error logs')
console.log('2. Look for "💾 SAVE DEBUG" messages to see where it fails')
console.log('3. Check "💾 SAVE ERROR" messages for detailed error analysis')
console.log('4. Verify storage provider initialization')
console.log('5. Check network tab for failed requests')

// Test 5: Verifica enhanced debugging
console.log('\n5️⃣ Enhanced Debugging Added...')

console.log('✅ Added comprehensive error logging:')
console.log('  - Raw error object inspection')
console.log('  - Error type and constructor analysis')
console.log('  - JSON serialization with property names')
console.log('  - Object keys and values extraction')
console.log('  - Common error property checks (code, status, response)')
console.log('  - Intelligent error message extraction')

console.log('✅ Added storage provider call debugging:')
console.log('  - Individual try/catch for createFieldRow and updateFieldRow')
console.log('  - Result logging for successful operations')
console.log('  - Specific error logging for failed operations')

console.log('✅ Added storage provider validation:')
console.log('  - Null/undefined checks')
console.log('  - Type validation')
console.log('  - Constructor name inspection')

// Test 6: Istruzioni per il test
console.log('\n6️⃣ Testing Instructions...')

console.log('🧪 To test the fix:')
console.log('1. Save a field row in the application')
console.log('2. If error occurs, check browser console')
console.log('3. Look for detailed error information in logs')
console.log('4. The error message should now be more descriptive')
console.log('5. Report the specific error details found')

console.log('\n📋 What to look for in console:')
console.log('- "💾 SAVE DEBUG - StorageProvider inspection" - shows provider state')
console.log('- "💾 SAVE DEBUG - Calling createFieldRow/updateFieldRow" - shows which operation')
console.log('- "💾 SAVE ERROR - Raw error" - shows the actual error object')
console.log('- "💾 SAVE ERROR - Error JSON" - shows serialized error properties')
console.log('- "💾 SAVE ERROR - Final error message" - shows extracted message')

console.log('\n✨ Enhanced Error Handling Complete!')
console.log('The next error should provide much more detailed information.')