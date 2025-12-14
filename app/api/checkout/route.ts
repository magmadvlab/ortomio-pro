import { NextRequest, NextResponse } from 'next/server'
import { verifyTier } from '@/lib/auth'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const TIER_PRICES: Record<string, number> = {
  'pro-consumer': 999, // €9.99 in centesimi
  'pro-professional': 2999, // €29.99 in centesimi
}

export async function POST(request: NextRequest) {
  try {
    const { tier } = await request.json()
    
    if (!tier || !TIER_PRICES[tier]) {
      return NextResponse.json(
        { error: 'invalid_tier' },
        { status: 400 }
      )
    }
    
    // Get user (optional - can be anonymous checkout)
    let userId: string | null = null
    try {
      const result = await verifyTier(request)
      if (!('error' in result)) {
        userId = result.user.id
      }
    } catch {
      // User not logged in - allow anonymous checkout
    }
    
    const price = TIER_PRICES[tier]
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `OrtoMio ${tier === 'pro-consumer' ? 'PRO Consumer' : 'PRO Professional'}`,
              description: `Abbonamento mensile ${tier === 'pro-consumer' ? 'PRO Consumer' : 'PRO Professional'}`,
            },
            unit_amount: price,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      metadata: {
        tier,
        user_id: userId || 'anonymous',
      },
    })
    
    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    )
  }
}

