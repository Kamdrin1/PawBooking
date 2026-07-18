import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TELNYX_API_KEY = process.env.TELNYX_API_KEY!
const TELNYX_PHONE_NUMBER = process.env.TELNYX_PHONE_NUMBER!

// Paid tiers that receive automated retention + review messages.
const PAID_PLANS = ['essential', 'professional']

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pawbooking.net'
}

async function sendSMS(to: string, message: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
      },
      body: JSON.stringify({ from: TELNYX_PHONE_NUMBER, to, text: message }),
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
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    let sent = 0
    let rebookSent = 0
    let reviewSent = 0

    // ─── 1. 24HR APPOINTMENT REMINDERS ────────────────────────────────────────
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

    for (const appt of appointments || []) {
      if (!appt.client_phone) continue
      const [h, m] = appt.appointment_time.split(':')
      const hour = parseInt(h)
      const formattedTime = `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
      const business = appt.profiles?.business_name || 'PawBooking'
      const message = `${business}: ${appt.dog_name} has a grooming appointment tomorrow at ${formattedTime}. Reply CONFIRM or CANCEL.`
      const ok = await sendSMS(appt.client_phone, message)
      if (ok) {
        await supabase.from('appointments').update({ reminder_sent: true }).eq('id', appt.id)
        sent++
      }
    }

    // ─── 2. REBOOKING / WIN-BACK SEQUENCE (paid plans) ─────────────────────────
    // Each groomer's cadence comes from Settings → Typical Grooming Schedule.
    // milestone 1 = at their cycle, 2 = +2 weeks, 3 = 12 weeks (final).
    // Tracked in sent_reminders so nobody is texted twice and a missed cron day
    // never produces a burst.
    const { data: dueDogs, error: dogErr } = await supabase
      .from('dogs')
      .select('id, profile_id, name, owner_phone, reminder_status, profiles(business_name, slug, plan, automation)')
      .eq('reminder_status', 'active')
    if (dogErr) throw dogErr

    for (const dog of dueDogs || []) {
      if (!dog.owner_phone) continue
      const prof = dog.profiles as unknown as { business_name: string; slug: string; plan: string; automation: { grooming_weeks: number } | null } | null
      if (!prof || !PAID_PLANS.includes(prof.plan) || !prof.slug) continue

      // last completed groom starts the clock
      const { data: lastGroom } = await supabase
        .from('appointments')
        .select('id, appointment_date')
        .eq('dog_id', dog.id)
        .eq('status', 'completed')
        .order('appointment_date', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (!lastGroom) continue

      // already rebooked? then not overdue
      const { data: upcoming } = await supabase
        .from('appointments')
        .select('id')
        .eq('dog_id', dog.id)
        .gte('appointment_date', today)
        .neq('status', 'cancelled')
        .limit(1)
      if (upcoming && upcoming.length > 0) continue

      const daysSince = Math.floor(
        (now.getTime() - new Date(lastGroom.appointment_date + 'T00:00:00').getTime()) / 86400000
      )

      const weeks = prof.automation?.grooming_weeks || 6
      const milestones = [
        { days: 84, key: 3 },                 // 12 weeks, final
        { days: (weeks + 2) * 7, key: 2 },    // follow-up
        { days: weeks * 7, key: 1 },          // first nudge at their cycle
      ].filter((mst, i, arr) => arr.findIndex(x => x.days === mst.days) === i)

      const { data: already } = await supabase
        .from('sent_reminders')
        .select('milestone')
        .eq('dog_id', dog.id)
        .eq('appointment_id', lastGroom.id)
      const sentKeys = new Set((already || []).map(r => r.milestone))

      const due = milestones.find(mst => daysSince >= mst.days && !sentKeys.has(mst.key))
      if (!due) continue

      const link = `${siteUrl()}/book/${prof.slug}`
      let text: string
      if (due.key === 1) {
        text = `${prof.business_name}: ${dog.name} is due for a groom! Book here: ${link} — Reply STOP to opt out.`
      } else if (due.key === 2) {
        text = `${prof.business_name}: Just checking in! ${dog.name} is now overdue for a groom. Book here: ${link} — Reply STOP to opt out.`
      } else {
        text = `${prof.business_name}: It's been a while since we've seen ${dog.name}! We'd love to see you both again. Book here: ${link} — Reply STOP to opt out.`
      }

      const ok = await sendSMS(dog.owner_phone, text)
      if (ok) {
        // record this milestone AND any lower ones, so a missed day never bursts
        const toMark = milestones
          .filter(mst => mst.days <= due.days && !sentKeys.has(mst.key))
          .map(mst => ({
            profile_id: dog.profile_id,
            dog_id: dog.id,
            appointment_id: lastGroom.id,
            milestone: mst.key,
          }))
        await supabase.from('sent_reminders').insert(toMark)
        rebookSent++
      }
    }

    // ─── 3. AUTO REVIEW REQUESTS (paid plans) ──────────────────────────────────
    // Timing comes from Settings → Review Request Timing (automation.review_hours).
    // We look back a generous window and let review_request_sent dedupe, so the
    // cadence of the cron doesn't cause misses.
    const { data: reviewAppts, error: reviewError } = await supabase
      .from('appointments')
      .select('*, profiles(business_name, plan, google_review_link, automation)')
      .eq('status', 'completed')
      .eq('review_request_sent', false)
      .not('completed_at', 'is', null)
    if (reviewError) throw reviewError

    for (const appt of reviewAppts || []) {
      const prof = appt.profiles as unknown as { business_name: string; plan: string; google_review_link: string | null; automation: { review_hours: number } | null } | null
      if (!prof || !PAID_PLANS.includes(prof.plan)) continue
      if (!appt.client_phone || !prof.google_review_link) continue

      const reviewHours = prof.automation?.review_hours ?? 1
      const hoursSince = (now.getTime() - new Date(appt.completed_at).getTime()) / 3600000
      if (hoursSince < reviewHours) continue   // not time yet

      const message = `${prof.business_name}: Thanks for visiting today! If you have a moment, we'd love a Google review: ${prof.google_review_link} — Reply STOP to opt out.`
      const ok = await sendSMS(appt.client_phone, message)
      if (ok) {
        await supabase.from('appointments').update({ review_request_sent: true }).eq('id', appt.id)
        reviewSent++
      }
    }

    return NextResponse.json({ success: true, sent, rebookSent, reviewSent })
  } catch (error) {
    console.error('Reminder error:', error)
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 })
  }
}