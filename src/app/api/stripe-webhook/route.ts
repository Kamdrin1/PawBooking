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

  async function updateProfileByCustomer(customerId: string, updates: Record<string, any>) {
    await supabase.from('profiles').update(updates).eq('stripe_customer_id', customerId)
  }

  switch (event.type) {
    case 'customer.subscription.created': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = getCustomerId(sub)
      if (!customerId) break
      await updateProfileByCustomer(customerId, {
        stripe_subscription_id: sub.id,
        subscription_status: sub.status,
        trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
        plan: 'basic',
      })
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = getCustomerId(sub)
      if (!customerId) break
      await updateProfileByCustomer(customerId, {
        stripe_subscription_id: sub.id,
        subscription_status: sub.status,
        trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
        plan: sub.status === 'active' ? 'basic' : sub.status === 'past_due' ? 'basic' : 'basic',
      })
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = getCustomerId(sub)
      if (!customerId) break
      await updateProfileByCustomer(customerId, {
        subscription_status: 'canceled',
        plan: 'free',
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