import { NextResponse } from 'next/server'

export async function GET() {
  // Test environment variables access
  const hasGeminiKey = !!process.env.GEMINI_API_KEY
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  
  return NextResponse.json({
    message: 'API route test',
    env: {
      hasGeminiKey,
      hasSupabaseUrl,
    },
  })
}







