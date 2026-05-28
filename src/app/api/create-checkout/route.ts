import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
})

export async function POST(req: NextRequest) {
  try {
    const { serviceId, serviceName, amount, groomerStripeId, bookingData } = await req.json()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: serviceName,
              description: `Grooming appointment for ${bookingData.dogName}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://www.pawbooking.net/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://www.pawbooking.net/book/${bookingData.slug}`,
      metadata: {
        serviceId,
        groomerStripeId: groomerStripeId || '',
        clientName: bookingData.clientName,
        clientPhone: bookingData.clientPhone,
        clientEmail: bookingData.clientEmail || '',
        dogName: bookingData.dogName,
        dogBreed: bookingData.dogBreed || '',
        date: bookingData.date,
        time: bookingData.time,
        notes: bookingData.notes || '',
        profileId: bookingData.profileId,
        slug: bookingData.slug,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error('Stripe error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}