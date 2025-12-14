import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!
  
  let event: Stripe.Event
  
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: 'invalid_signature' },
      { status: 400 }
    )
  }
  
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const tier = session.metadata?.tier
      const userId = session.metadata?.user_id
      
      if (!tier || !userId || userId === 'anonymous') {
        console.error('Missing tier or userId in session metadata')
        return NextResponse.json({ received: true })
      }
      
      // Map tier IDs to database tier values
      const dbTier = tier === 'pro-consumer' ? 'PRO_CONSUMER' : 'PRO_PROFESSIONAL'
      const initialCredits = tier === 'pro-consumer' ? 50 : 200
      
      const supabase = getSupabaseClient()
      
      // Update user tier
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ tier: dbTier })
        .eq('id', userId)
      
      if (updateError) {
        console.error('Error updating tier:', updateError)
        // Continue anyway - might be new user
      }
      
      // Grant initial credits
      await supabase.rpc('grant_credits', {
        p_user_id: userId,
        p_amount: initialCredits,
      })
      
      // Log transaction
      await supabase.from('ai_credit_transactions').insert({
        user_id: userId,
        amount: initialCredits,
        type: 'bonus',
        description: `Initial credits for ${dbTier} subscription`,
      })
      
      console.log(`✓ Upgraded user ${userId} to ${dbTier} with ${initialCredits} credits`)
    }
    
    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'processing_error', message: error.message },
      { status: 500 }
    )
  }
}

