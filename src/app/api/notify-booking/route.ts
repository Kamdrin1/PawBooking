import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { clientName, clientPhone, clientEmail, dogName, dogBreed, serviceName, servicePrice, date, time, paymentMethod, businessName, notes } = body

    console.log('notify-booking called for:', clientName, dogName)
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)

    const resend = new Resend(process.env.RESEND_API_KEY)

    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    })

    const [h, m] = time.split(':')
    const hour = parseInt(h)
    const formattedTime = `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`

    // ── GROOMER NOTIFICATION (goes to you — has View Dashboard) ────────────────
    const result = await resend.emails.send({
      from: 'PawBooking <notifications@pawbooking.net>',
      to: 'monchigameing@gmail.com',
      subject: `🐾 New Booking — ${clientName} & ${dogName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; background: #F5F2EB; padding: 32px; border-radius: 16px;">
          <div style="background: #1A3329; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: white; margin: 0; font-size: 22px;">🐾 New Appointment Booked</h1>
            <p style="color: rgba(255,255,255,0.6); margin: 8px 0 0; font-size: 14px;">${businessName}</p>
          </div>
          <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #EDE9DF;">
                <td style="padding: 10px 0; color: #9CA3AF; font-size: 13px;">Client</td>
                <td style="padding: 10px 0; color: #1A3329; font-size: 13px; font-weight: 600; text-align: right;">${clientName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #EDE9DF;">
                <td style="padding: 10px 0; color: #9CA3AF; font-size: 13px;">Phone</td>
                <td style="padding: 10px 0; color: #1A3329; font-size: 13px; font-weight: 600; text-align: right;">${clientPhone}</td>
              </tr>
              ${clientEmail ? `<tr style="border-bottom: 1px solid #EDE9DF;">
                <td style="padding: 10px 0; color: #9CA3AF; font-size: 13px;">Email</td>
                <td style="padding: 10px 0; color: #1A3329; font-size: 13px; font-weight: 600; text-align: right;">${clientEmail}</td>
              </tr>` : ''}
              <tr style="border-bottom: 1px solid #EDE9DF;">
                <td style="padding: 10px 0; color: #9CA3AF; font-size: 13px;">Dog</td>
                <td style="padding: 10px 0; color: #1A3329; font-size: 13px; font-weight: 600; text-align: right;">${dogName}${dogBreed ? ` (${dogBreed})` : ''}</td>
              </tr>
              <tr style="border-bottom: 1px solid #EDE9DF;">
                <td style="padding: 10px 0; color: #9CA3AF; font-size: 13px;">Service</td>
                <td style="padding: 10px 0; color: #1A3329; font-size: 13px; font-weight: 600; text-align: right;">${serviceName} — $${servicePrice}</td>
              </tr>
              <tr style="border-bottom: 1px solid #EDE9DF;">
                <td style="padding: 10px 0; color: #9CA3AF; font-size: 13px;">Date</td>
                <td style="padding: 10px 0; color: #1A3329; font-size: 13px; font-weight: 600; text-align: right;">${formattedDate}</td>
              </tr>
              <tr style="border-bottom: 1px solid #EDE9DF;">
                <td style="padding: 10px 0; color: #9CA3AF; font-size: 13px;">Time</td>
                <td style="padding: 10px 0; color: #1A3329; font-size: 13px; font-weight: 600; text-align: right;">${formattedTime}</td>
              </tr>
              <tr style="border-bottom: 1px solid #EDE9DF;">
                <td style="padding: 10px 0; color: #9CA3AF; font-size: 13px;">Payment</td>
                <td style="padding: 10px 0; color: #1A3329; font-size: 13px; font-weight: 600; text-align: right;">${paymentMethod === 'online' ? '💳 Pay Online' : '💵 Pay in Person'}</td>
              </tr>
              ${notes ? `<tr>
                <td style="padding: 10px 0; color: #9CA3AF; font-size: 13px;">Notes</td>
                <td style="padding: 10px 0; color: #1A3329; font-size: 13px; font-weight: 600; text-align: right;">${notes}</td>
              </tr>` : ''}
            </table>
          </div>
          <div style="text-align: center;">
            <a href="https://www.pawbooking.net/dashboard" style="background: #1A3329; color: white; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600;">View Dashboard</a>
          </div>
          <p style="text-align: center; color: #9CA3AF; font-size: 11px; margin-top: 24px;">PawBooking · Automated appointment reminders for dog groomers</p>
        </div>
      `
    })

    // ── CLIENT CONFIRMATION (goes to the client — no dashboard button) ─────────
    let clientResult = null
    if (clientEmail) {
      clientResult = await resend.emails.send({
        from: `${businessName} <notifications@pawbooking.net>`,
        to: clientEmail,
        subject: `Your booking request with ${businessName} 🐾`,
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; background: #F5F2EB; padding: 32px; border-radius: 16px;">
            <div style="background: #1A3329; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <h1 style="color: white; margin: 0; font-size: 22px;">🐾 Booking Request Received</h1>
              <p style="color: rgba(255,255,255,0.6); margin: 8px 0 0; font-size: 14px;">${businessName}</p>
            </div>
            <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
              <p style="color: #1A3329; font-size: 15px; margin: 0 0 20px; line-height: 1.6;">
                Hi ${clientName}, thanks for booking with <strong>${businessName}</strong>! Your request has been received and will be confirmed shortly. Here are your details:
              </p>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #EDE9DF;">
                  <td style="padding: 10px 0; color: #9CA3AF; font-size: 13px;">Dog</td>
                  <td style="padding: 10px 0; color: #1A3329; font-size: 13px; font-weight: 600; text-align: right;">${dogName}${dogBreed ? ` (${dogBreed})` : ''}</td>
                </tr>
                <tr style="border-bottom: 1px solid #EDE9DF;">
                  <td style="padding: 10px 0; color: #9CA3AF; font-size: 13px;">Service</td>
                  <td style="padding: 10px 0; color: #1A3329; font-size: 13px; font-weight: 600; text-align: right;">${serviceName} — $${servicePrice}</td>
                </tr>
                <tr style="border-bottom: 1px solid #EDE9DF;">
                  <td style="padding: 10px 0; color: #9CA3AF; font-size: 13px;">Date</td>
                  <td style="padding: 10px 0; color: #1A3329; font-size: 13px; font-weight: 600; text-align: right;">${formattedDate}</td>
                </tr>
                <tr style="border-bottom: 1px solid #EDE9DF;">
                  <td style="padding: 10px 0; color: #9CA3AF; font-size: 13px;">Time</td>
                  <td style="padding: 10px 0; color: #1A3329; font-size: 13px; font-weight: 600; text-align: right;">${formattedTime}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #9CA3AF; font-size: 13px;">Payment</td>
                  <td style="padding: 10px 0; color: #1A3329; font-size: 13px; font-weight: 600; text-align: right;">${paymentMethod === 'online' ? '💳 Pay Online' : '💵 Pay in Person'}</td>
                </tr>
              </table>
            </div>
            <p style="text-align: center; color: #6B7280; font-size: 13px; line-height: 1.6; margin: 0 0 8px;">
              This is a request — <strong>${businessName}</strong> will confirm your appointment shortly. You'll get an SMS reminder before your visit.
            </p>
            <p style="text-align: center; color: #9CA3AF; font-size: 11px; margin-top: 20px;">Sent via PawBooking on behalf of ${businessName}</p>
          </div>
        `
      })
    }

    // ── SMS confirmation to client ────────────────────────────────────────────
    const smsMessage = `PawBooking: Your booking request with ${businessName} is in — ${dogName} on ${formattedDate} at ${formattedTime}. They'll confirm shortly. Reply STOP to opt out.`

    const smsResponse = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TELNYX_API_KEY!}`,
      },
      body: JSON.stringify({
        from: process.env.TELNYX_PHONE_NUMBER!,
        to: clientPhone,
        text: smsMessage,
      }),
    })

    const smsData = await smsResponse.json()
    console.log('SMS sent:', smsData)

    console.log('Resend result:', JSON.stringify(result))
    return NextResponse.json({ success: true, result, clientResult, sms: smsData })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Notification error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}