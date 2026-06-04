import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import twilio from 'twilio'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

export async function GET() {
  try {
    // ─── 24HR APPOINTMENT REMINDERS (existing) ───────────────────────
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

      try {
        await twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER!,
          to: appt.client_phone,
        })

        await supabase
          .from('appointments')
          .update({ reminder_sent: true })
          .eq('id', appt.id)

        sent++
      } catch (smsError: any) {
        console.error(`Failed to send SMS to ${appt.client_phone}:`, smsError.message)
      }
    }

    // ─── REBOOKING REMINDERS (Pro only — 28 days after completed) ────
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
      // Only send for Pro plan groomers
      if (appt.profiles?.plan !== 'pro') continue
      if (!appt.client_phone) continue

      // Skip if this client already has a future appointment at this business
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
        // Client already has a future booking — mark sent to avoid rechecking
        await supabase
          .from('appointments')
          .update({ rebooking_reminder_sent: true })
          .eq('id', appt.id)
        continue
      }

      const businessName = appt.profiles?.business_name || 'your groomer'
      const bookingSlug = businessName.toLowerCase().replace(/\s+/g, '-')
      const bookingLink = `${process.env.NEXT_PUBLIC_SITE_URL}/book/${bookingSlug}`

      const message = `Hi ${appt.client_name}! 🐾 It's been about a month since ${appt.dog_name}'s last groom at ${businessName}. Time to book again? ${bookingLink} Reply STOP to opt out.`

      try {
        await twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER!,
          to: appt.client_phone,
        })

        await supabase
          .from('appointments')
          .update({ rebooking_reminder_sent: true })
          .eq('id', appt.id)

        rebookSent++
      } catch (smsError: any) {
        console.error(`Failed to send rebooking SMS to ${appt.client_phone}:`, smsError.message)
      }
    }

    return NextResponse.json({ success: true, sent, rebookSent })
  } catch (error) {
    console.error('Reminder error:', error)
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 })
  }
}