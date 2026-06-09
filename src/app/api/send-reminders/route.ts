import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TELNYX_API_KEY = process.env.TELNYX_API_KEY!
const TELNYX_PHONE_NUMBER = process.env.TELNYX_PHONE_NUMBER!

async function sendSMS(to: string, message: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
      },
      body: JSON.stringify({
        from: TELNYX_PHONE_NUMBER,
        to,
        text: message,
      }),
    })
    if (!res.ok) {
      const err = await res.json()
      console.error('Telnyx SMS error:', err)
      return false
    }
    return true
  } catch (err) {
    console.error('Telnyx fetch error:', err)
    return false
  }
}

export async function GET() {
  try {
    // ─── 24HR APPOINTMENT REMINDERS ───────────────────────────────────
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*, services(name, price), profiles(business_name)')
      .eq('appointment_date', tomorrowStr)
      .eq('reminder_sent', false)
      .neq('status', 'cancelled')

    if (error) throw error

    let sent = 0

    for (const appt of appointments || []) {
      if (!appt.client_phone) continue

      const [h, m] = appt.appointment_time.split(':')
      const hour = parseInt(h)
      const formattedTime = `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`

      const message = `Hi ${appt.client_name}! 🐾 This is a reminder that ${appt.dog_name} has a grooming appointment tomorrow at ${formattedTime} with ${appt.profiles?.business_name || 'your groomer'}. See you then! Reply STOP to opt out.`

      const ok = await sendSMS(appt.client_phone, message)
      if (ok) {
        await supabase.from('appointments').update({ reminder_sent: true }).eq('id', appt.id)
        sent++
      }
    }

    // ─── REBOOKING REMINDERS (Pro only — 28 days after completed) ─────
    const twentyEightDaysAgo = new Date()
    twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28)
    const windowStart = new Date(twentyEightDaysAgo)
    windowStart.setHours(0, 0, 0, 0)
    const windowEnd = new Date(twentyEightDaysAgo)
    windowEnd.setHours(23, 59, 59, 999)

    const { data: completedAppts, error: rebookError } = await supabase
      .from('appointments')
      .select('*, profiles(business_name, plan)')
      .eq('status', 'completed')
      .eq('rebooking_reminder_sent', false)
      .gte('completed_at', windowStart.toISOString())
      .lte('completed_at', windowEnd.toISOString())

    if (rebookError) throw rebookError

    let rebookSent = 0

    for (const appt of completedAppts || []) {
      if (appt.profiles?.plan !== 'pro') continue
      if (!appt.client_phone) continue

      // Skip if client already has a future appointment
      const today = new Date().toISOString().split('T')[0]
      const { data: futureAppts } = await supabase
        .from('appointments')
        .select('id')
        .eq('profile_id', appt.profile_id)
        .eq('client_phone', appt.client_phone)
        .gt('appointment_date', today)
        .neq('status', 'cancelled')
        .limit(1)

      if (futureAppts && futureAppts.length > 0) {
        await supabase.from('appointments').update({ rebooking_reminder_sent: true }).eq('id', appt.id)
        continue
      }

      const businessName = appt.profiles?.business_name || 'your groomer'
      const bookingSlug = businessName.toLowerCase().replace(/\s+/g, '-')
      const bookingLink = `${process.env.NEXT_PUBLIC_SITE_URL}/book/${bookingSlug}`

      const message = `Hi ${appt.client_name}! 🐾 It's been about a month since ${appt.dog_name}'s last groom at ${businessName}. Time to book again? ${bookingLink} Reply STOP to opt out.`

      const ok = await sendSMS(appt.client_phone, message)
      if (ok) {
        await supabase.from('appointments').update({ rebooking_reminder_sent: true }).eq('id', appt.id)
        rebookSent++
      }
    }

    return NextResponse.json({ success: true, sent, rebookSent })
  } catch (error) {
    console.error('Reminder error:', error)
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 })
  }
}