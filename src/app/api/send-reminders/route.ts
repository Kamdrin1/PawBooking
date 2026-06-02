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

    return NextResponse.json({ success: true, sent })
  } catch (error) {
    console.error('Reminder error:', error)
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 })
  }
}