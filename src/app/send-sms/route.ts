import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

export async function POST(req: NextRequest) {
  try {
    const { to, message } = await req.json()

    if (!to || !message) {
      return NextResponse.json({ error: 'Missing phone or message' }, { status: 400 })
    }

    const msg = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to,
    })

    return NextResponse.json({ success: true, sid: msg.sid })
  } catch (error: unknown) {
    console.error('Twilio error:', error)
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 })
  }
}