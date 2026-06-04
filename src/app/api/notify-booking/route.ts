import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { clientName, clientPhone, clientEmail, dogName, dogBreed, serviceName, servicePrice, date, time, paymentMethod, businessName, notes } = await req.json()

    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    })

    const [h, m] = time.split(':')
    const hour = parseInt(h)
    const formattedTime = `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`

    await resend.emails.send({
      from: 'PawBooking <onboarding@resend.dev>',
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

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Email notification error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}