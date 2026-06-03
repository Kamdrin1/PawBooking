import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { userId, phone, serviceArea, availability, paymentMethods, services } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Update profile
    await supabase.from('profiles').update({
      phone,
      service_area: serviceArea,
      availability: JSON.stringify(availability),
      payment_methods: paymentMethods,
    }).eq('id', userId)

    // Get existing services
    const { data: existingServices } = await supabase
      .from('services')
      .select('id, name')
      .eq('profile_id', userId)

    // Save services
    for (const s of services) {
      const match = (existingServices || []).find(
        e => e.name.toLowerCase().trim() === s.name.toLowerCase().trim()
      )
      if (match) {
        await supabase.from('services').update({
          price: parseFloat(s.price),
          duration_minutes: parseInt(s.duration),
        }).eq('id', match.id)
      } else {
        await supabase.from('services').insert({
          profile_id: userId,
          name: s.name.trim(),
          price: parseFloat(s.price),
          duration_minutes: parseInt(s.duration),
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Save onboarding error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}