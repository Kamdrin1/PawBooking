import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { to, message } = await req.json()

    if (!to || !message) {
      return NextResponse.json({ error: 'Missing phone or message' }, { status: 400 })
    }

    const response = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TELNYX_API_KEY!}`,
      },
      body: JSON.stringify({
        from: process.env.TELNYX_PHONE_NUMBER!,
        to: to,
        text: message,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Telnyx error:', error)
      return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({ success: true, id: data.data.id })
  } catch (error: unknown) {
    console.error('SMS error:', error)
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 })
  }
}