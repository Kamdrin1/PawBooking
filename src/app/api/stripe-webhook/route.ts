import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const getCustomerId = (obj: any): string | null => obj?.customer ?? null

  // Read plan from subscription metadata, fallback to 'basic'
  function getPlanFromMetadata(metadata: Stripe.Metadata | null): string {
    const plan = metadata?.plan
    return plan === 'pro' ? 'pro' : 'basic'
  }

  async function updateProfileByCustomer(customerId: string, updates: Record<string, any>) {
    await supabase.from('profiles').update(updates).eq('stripe_customer_id', customerId)
  }

  switch (event.type) {

    case 'checkout.session.completed': {
      // Fired when the user completes Stripe checkout — most reliable place to set plan
      const session = event.data.object as Stripe.Checkout.Session
      const customerId = getCustomerId(session)
      if (!customerId) break
      const plan = getPlanFromMetadata(session.metadata)
      await updateProfileByCustomer(customerId, {
        plan,
        subscription_status: 'trialing',
      })
      break
    }

    case 'customer.subscription.created': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = getCustomerId(sub)
      if (!customerId) break
      const plan = getPlanFromMetadata(sub.metadata)
      await updateProfileByCustomer(customerId, {
        stripe_subscription_id: sub.id,
        subscription_status: sub.status,
        trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
        plan,
      })
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = getCustomerId(sub)
      if (!customerId) break
      const plan = getPlanFromMetadata(sub.metadata)
      await updateProfileByCustomer(customerId, {
        stripe_subscription_id: sub.id,
        subscription_status: sub.status,
        trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
        plan,
      })
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = getCustomerId(sub)
      if (!customerId) break
      await updateProfileByCustomer(customerId, {
        subscription_status: 'canceled',
        plan: 'basic',
      })
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = getCustomerId(invoice)
      if (!customerId) break
      await updateProfileByCustomer(customerId, {
        subscription_status: 'active',
      })
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = getCustomerId(invoice)
      if (!customerId) break
      await updateProfileByCustomer(customerId, {
        subscription_status: 'past_due',
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}