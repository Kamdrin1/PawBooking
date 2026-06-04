import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── Stripe Price IDs ─────────────────────────────────────────────────────────
const PRICE_IDS = {
  basic: 'price_1TbwBnE12BO3MSKAMUPsrCqn',          // $30/mo
  pro:   'price_1TejNuE12BO3MSKAYAHT2gyJ',            // $50/mo
}

export async function POST(req: Request) {
  try {
    const { userId, email, businessName, plan } = await req.json()

    if (!userId || !email) {
      return NextResponse.json({ error: 'Missing userId or email' }, { status: 400 })
    }

    const selectedPlan = plan === 'pro' ? 'pro' : 'basic'
    const priceId = PRICE_IDS[selectedPlan]

    const customer = await stripe.customers.create({
      email,
      name: businessName,
      metadata: { supabase_user_id: userId },
    })

    await supabase.from('profiles').update({
      stripe_customer_id: customer.id,
      plan: selectedPlan,
    }).eq('id', userId)

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      subscription_data: {
        trial_period_days: 30,
        metadata: { supabase_user_id: userId, plan: selectedPlan },
      },
      metadata: {
        supabase_user_id: userId,
        plan: selectedPlan,
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/choose-plan?userId=${userId}&email=${encodeURIComponent(email)}&businessName=${encodeURIComponent(businessName || '')}`,
    })

    return NextResponse.json({ url: session.url })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Stripe checkout error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}