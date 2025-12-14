/**
 * Script to generate AI responses database for FREE users
 * Run: npx tsx scripts/generateAIDatabase.ts
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import * as fs from 'fs'
import * as path from 'path'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '')

const plants = [
  'pomodoro', 'basilico', 'zucchine', 'melanzane', 'peperoni',
  'lattuga', 'carote', 'cipolle', 'aglio', 'prezzemolo',
  'fagioli', 'piselli', 'patate', 'cavolo', 'broccoli',
  'spinaci', 'ravanelli', 'sedano', 'finocchio', 'rucola'
]

const issues = [
  'foglie-gialle',
  'macchie-scure',
  'crescita-lenta',
  'insetti',
  'frutti-cadono',
  'marciume',
  'muffa',
  'secchezza',
  'macchie-bianche',
  'buchi-foglie'
]

interface AdviceResponse {
  plant: string
  issue: string
  cause: string
  solution: string
  prevention: string
  products?: string[]
  tags?: string[]
  generated?: string
}

async function generateDatabase() {
  console.log('Starting AI database generation...')
  console.log(`Plants: ${plants.length}, Issues: ${issues.length}`)
  console.log(`Total combinations: ${plants.length * issues.length}`)
  
  const responses: Record<string, AdviceResponse> = {}
  let successCount = 0
  let errorCount = 0
  
  for (const plant of plants) {
    for (const issue of issues) {
      const key = `${plant}_${issue}`
      
      try {
        const prompt = `
Sei un agronomo esperto italiano. 
Problema: ${issue} su ${plant}

Fornisci una risposta in italiano, max 150 parole, linguaggio semplice per hobbisti:
1. Causa probabile
2. Soluzione immediata
3. Prevenzione futura

Formato JSON:
{
  "cause": "...",
  "solution": "...",
  "prevention": "...",
  "products": ["prodotto1", "prodotto2"],
  "tags": ["tag1", "tag2"]
}
        `
        
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
        const result = await model.generateContent(prompt)
        const text = result.response.text()
        
        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const json = JSON.parse(jsonMatch[0])
          
          responses[key] = {
            plant,
            issue,
            cause: json.cause || text,
            solution: json.solution || '',
            prevention: json.prevention || '',
            products: json.products || [],
            tags: json.tags || [issue, plant],
            generated: new Date().toISOString(),
          }
          
          successCount++
          console.log(`✓ Generated: ${plant} - ${issue} (${successCount}/${plants.length * issues.length})`)
        } else {
          // Fallback if JSON not found
          responses[key] = {
            plant,
            issue,
            cause: text.substring(0, 200),
            solution: 'Consulta un agronomo per soluzione specifica.',
            prevention: 'Mantieni buone pratiche agronomiche.',
            products: [],
            tags: [issue, plant],
            generated: new Date().toISOString(),
          }
          successCount++
        }
        
        // Rate limiting - wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error: any) {
        console.error(`✗ Error: ${plant} - ${issue}`, error.message)
        errorCount++
        
        // Continue with next combination
        continue
      }
    }
  }
  
  // Save to file
  const outputPath = path.join(process.cwd(), 'data', 'aiResponses.json')
  fs.writeFileSync(
    outputPath,
    JSON.stringify(responses, null, 2),
    'utf-8'
  )
  
  console.log(`\n✅ Generation complete!`)
  console.log(`Success: ${successCount}`)
  console.log(`Errors: ${errorCount}`)
  console.log(`Total: ${Object.keys(responses).length} responses`)
  console.log(`Saved to: ${outputPath}`)
}

// Run if executed directly
if (require.main === module) {
  generateDatabase().catch(console.error)
}

export { generateDatabase }








