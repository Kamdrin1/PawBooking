import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    // Get all appointments for tomorrow that haven't been reminded
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*, services(name, price), profiles(business_name, phone)')
      .eq('appointment_date', tomorrowStr)
      .eq('reminder_sent', false)
      .neq('status', 'cancelled')

    if (error) throw error

    let sent = 0

    for (const appt of appointments || []) {
      if (!appt.client_phone) continue

      const time = appt.appointment_time
      const [h, m] = time.split(':')
      const hour = parseInt(h)
      const formattedTime = `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`

      const message = `Hi ${appt.client_name}! 🐾 This is a reminder that ${appt.dog_name} has a grooming appointment tomorrow at ${formattedTime} with ${appt.profiles?.business_name || 'your groomer'}. See you then! Reply STOP to opt out.`

      // Send SMS
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: appt.client_phone,
          message,
        }),
      })

      // Mark reminder as sent
      await supabase
        .from('appointments')
        .update({ reminder_sent: true })
        .eq('id', appt.id)

      sent++
    }

    return NextResponse.json({ success: true, sent })
  } catch (error) {
    console.error('Reminder error:', error)
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 })
  }
}