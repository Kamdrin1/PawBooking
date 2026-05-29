import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { userId, email, businessName } = await req.json()

    if (!userId || !email) {
      return NextResponse.json({ error: 'Missing userId or email' }, { status: 400 })
    }

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email,
      name: businessName,
      metadata: { supabase_user_id: userId },
    })

    // Save stripe_customer_id to profile
    await supabase.from('profiles').update({
      stripe_customer_id: customer.id,
    }).eq('id', userId)

    // Create Stripe Checkout session with 30-day trial
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: 'price_1TbwBnE12BO3MSKAMUPsrCqn',
        quantity: 1,
      }],
      subscription_data: {
        trial_period_days: 30,
        metadata: { supabase_user_id: userId },
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/signup`,
    })

    return NextResponse.json({ url: session.url })

  } catch (err: any) {
    console.error('Stripe checkout error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}