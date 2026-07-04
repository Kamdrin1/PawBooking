'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'

interface Service {
  id: string
  name: string
  price: number
  duration_minutes: number
  payment_type: 'none' | 'deposit' | 'full'
  deposit_amount: number
}

interface Profile {
  id: string
  business_name: string
  phone: string
  email: string
  payment_methods: string[]
  availability: { days: Record<string, boolean>; startTime: string; endTime: string }
  slug: string
}

export default function BookingPage() {
  const params = useParams()
  const slug = params?.slug as string
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    dogName: '',
    dogBreed: '',
    date: '',
    time: '',
    serviceId: '',
    notes: '',
    paymentMethod: '',
    smsConsent: false,
  })

  const [unavailableDates, setUnavailableDates] = useState<Set<string>>(new Set())
  const [bookedTimes, setBookedTimes] = useState<Map<string, Set<string>>>(new Map())

  useEffect(() => {
    async function load() {
      if (!slug) return
      const { data: profileData } = await supabase.from('profiles').select('*').eq('slug', slug).single()
      if (!profileData) {
        setError('Business not found')
        setLoading(false)
        return
      }
      setProfile(profileData)

      const { data: serviceData } = await supabase.from('services').select('*').eq('profile_id', profileData.id).order('name')
      setServices(serviceData || [])

      const { data: apptData } = await supabase
        .from('appointments')
        .select('appointment_date, appointment_time')
        .eq('profile_id', profileData.id)
        .neq('status', 'cancelled')

      const booked = new Map<string, Set<string>>()
      apptData?.forEach(a => {
        if (!booked.has(a.appointment_date)) booked.set(a.appointment_date, new Set())
        booked.get(a.appointment_date)!.add(a.appointment_time)
      })
      setBookedTimes(booked)

      const { data: unavailData } = await supabase.from('unavailable_dates').select('date').eq('profile_id', profileData.id)
      setUnavailableDates(new Set(unavailData?.map(u => u.date) || []))

      setLoading(false)
    }
    load()
  }, [slug])

  const availability = profile?.availability || { days: {}, startTime: '09:00', endTime: '17:00' }
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const availableDays = availability.days
    ? Object.entries(availability.days)
        .filter(([_, available]) => available)
        .map(([day]) => dayNames.indexOf(day))
    : []

  function isDateAvailable(dateStr: string) {
    if (unavailableDates.has(dateStr)) return false
    const d = new Date(dateStr + 'T00:00:00')
    return availableDays.includes(d.getDay()) && dateStr >= new Date().toISOString().split('T')[0]
  }

  function getAvailableTimes(dateStr: string) {
    if (!isDateAvailable(dateStr)) return []
    const booked = bookedTimes.get(dateStr) || new Set()
    const times: string[] = []
    const [startH, startM] = availability.startTime.split(':').map(Number)
    const [endH, endM] = availability.endTime.split(':').map(Number)
    let current = new Date(dateStr + 'T' + availability.startTime)
    const end = new Date(dateStr + 'T' + availability.endTime)
    while (current < end) {
      const h = String(current.getHours()).padStart(2, '0')
      const m = String(current.getMinutes()).padStart(2, '0')
      const timeStr = `${h}:${m}`
      if (!booked.has(timeStr)) times.push(timeStr)
      current.setMinutes(current.getMinutes() + 30)
    }
    return times
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.clientName || !formData.clientPhone || !formData.dogName || !formData.date || !formData.time || !formData.serviceId) {
      setError('Please fill all required fields')
      return
    }

    if (!formData.smsConsent) {
      setError('Please consent to SMS communications')
      return
    }

    setSubmitting(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    const profileId = profile?.id || user?.id

    if (!profileId) {
      setError('Unable to process booking')
      setSubmitting(false)
      return
    }

    const { error: insertError } = await supabase.from('appointments').insert({
      profile_id: profileId,
      client_name: formData.clientName,
      client_phone: formData.clientPhone,
      client_email: formData.clientEmail,
      dog_name: formData.dogName,
      dog_breed: formData.dogBreed,
      appointment_date: formData.date,
      appointment_time: formData.time,
      service_id: formData.serviceId,
      notes: formData.notes,
      payment_method: formData.paymentMethod || 'none',
      status: 'confirmed',
    })

    if (insertError) {
      setError('Booking failed: ' + insertError.message)
      setSubmitting(false)
      return
    }

    setDate(formData.date)
    setTime(formData.time)
    setSubmitted(true)
    setSubmitting(false)
  }

  if (loading)
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #D8F3DC 0%, #E8F5E9 100%)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#9CA3AF' }}>Loading your booking form...</div>
        </div>
      </div>
    )

  if (!profile)
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #D8F3DC 0%, #E8F5E9 100%)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#1A3329' }}>Business not found</div>
        </div>
      </div>
    )

  if (submitted) {
    const details = [
      { label: 'Name', value: formData.clientName },
      { label: 'Dog', value: formData.dogName + (formData.dogBreed ? ` (${formData.dogBreed})` : '') },
      { label: 'Date', value: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) },
      { label: 'Time', value: time ? (() => { const [h, m] = time.split(':'); const hour = parseInt(h); return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}` })() : '' },
      { label: 'Service', value: services.find(s => s.id === formData.serviceId)?.name || '' },
      { label: 'Phone', value: formData.clientPhone },
    ]

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #D8F3DC 0%, #E8F5E9 100%)', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '500px', background: 'white', borderRadius: '20px', padding: '48px 32px', textAlign: 'center', boxShadow: '0 16px 48px rgba(26, 51, 41, 0.15)' }}>
          <div style={{ fontSize: '80px', lineHeight: 1, marginBottom: '20px' }}>✓</div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1A3329', margin: '0 0 12px', fontFamily: "'Playfair Display', serif", letterSpacing: '-0.02em' }}>Booking Confirmed!</h1>
          <p style={{ fontSize: '15px', color: '#6B7280', margin: '0 0 32px' }}>We'll send a confirmation SMS to {formData.clientPhone}</p>

          <div style={{ background: 'linear-gradient(135deg, #F5F2EB 0%, #FAF7F2 100%)', borderRadius: '16px', padding: '24px', marginBottom: '32px', textAlign: 'left' }}>
            {details.map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(237, 233, 223, 0.5)' }}>
                <span style={{ color: '#9CA3AF', fontWeight: 500 }}>{label}</span>
                <span style={{ color: '#1A3329', fontWeight: 600, textAlign: 'right' }}>{value}</span>
              </div>
            ))}
          </div>

          <a href="/" style={{ display: 'inline-block', padding: '14px 32px', background: 'linear-gradient(135deg, #1A3329 0%, #2D6A4F 100%)', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '14px', marginBottom: '12px', boxShadow: '0 8px 20px rgba(26, 51, 41, 0.25)', cursor: 'pointer' }}>
            Home
          </a>
          <br />
          <a href={`/book/${slug}`} style={{ display: 'inline-block', padding: '14px 32px', background: 'white', color: '#1A3329', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '14px', border: '2px solid #2D6A4F', cursor: 'pointer' }}>
            Book Another
          </a>
        </div>
      </div>
    )
  }

  const availableTimes = formData.date ? getAvailableTimes(formData.date) : []

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #D8F3DC 0%, #E8F5E9 100%)', padding: '20px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        input, select, textarea { font-family: 'DM Sans', sans-serif; }
      `}</style>
      <div style={{ width: '100%', maxWidth: '520px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#1A3329', margin: 0, fontFamily: "'Playfair Display', serif", letterSpacing: '-0.02em' }}>Book a Grooming</h1>
          <p style={{ fontSize: '15px', color: '#6B7280', margin: '8px 0 0', fontWeight: 500 }}>{profile.business_name}</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 16px 48px rgba(26, 51, 41, 0.1)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="text"
              placeholder="Your name"
              value={formData.clientName}
              onChange={e => setFormData({ ...formData, clientName: e.target.value })}
              style={{ padding: '14px 16px', borderRadius: '10px', border: '1px solid #EDE9DF', fontSize: '15px', color: '#1A3329' }}
              required
            />

            <input
              type="tel"
              placeholder="Phone number"
              value={formData.clientPhone}
              onChange={e => setFormData({ ...formData, clientPhone: e.target.value })}
              style={{ padding: '14px 16px', borderRadius: '10px', border: '1px solid #EDE9DF', fontSize: '15px', color: '#1A3329' }}
              required
            />

            <input
              type="email"
              placeholder="Email (optional)"
              value={formData.clientEmail}
              onChange={e => setFormData({ ...formData, clientEmail: e.target.value })}
              style={{ padding: '14px 16px', borderRadius: '10px', border: '1px solid #EDE9DF', fontSize: '15px', color: '#1A3329' }}
            />

            <div style={{ paddingTop: '8px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9CA3AF', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Dog</label>
              <input
                type="text"
                placeholder="Dog's name"
                value={formData.dogName}
                onChange={e => setFormData({ ...formData, dogName: e.target.value })}
                style={{ padding: '14px 16px', borderRadius: '10px', border: '1px solid #EDE9DF', fontSize: '15px', color: '#1A3329', width: '100%', marginBottom: '10px', boxSizing: 'border-box' }}
                required
              />
              <input
                type="text"
                placeholder="Breed (optional)"
                value={formData.dogBreed}
                onChange={e => setFormData({ ...formData, dogBreed: e.target.value })}
                style={{ padding: '14px 16px', borderRadius: '10px', border: '1px solid #EDE9DF', fontSize: '15px', color: '#1A3329', width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9CA3AF', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Service</label>
              <select
                value={formData.serviceId}
                onChange={e => setFormData({ ...formData, serviceId: e.target.value })}
                style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: '1px solid #EDE9DF',
                  fontSize: '15px',
                  color: '#1A3329',
                  width: '100%',
                  boxSizing: 'border-box',
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%236B7280%22 stroke-width=%222%22%3e%3cpolyline points=%226 9 12 15 18 9%22%3e%3c/polyline%3e%3c/svg%3e")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  backgroundSize: '20px',
                  paddingRight: '32px',
                }}
                required
              >
                <option value="">Select a service</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} - ${s.price}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9CA3AF', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value, time: '' })}
                style={{ padding: '14px 16px', borderRadius: '10px', border: '1px solid #EDE9DF', fontSize: '15px', color: '#1A3329', width: '100%', boxSizing: 'border-box' }}
                required
              />
            </div>

            {formData.date && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9CA3AF', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time</label>
                <select
                  value={formData.time}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1px solid #EDE9DF',
                    fontSize: '15px',
                    color: '#1A3329',
                    width: '100%',
                    boxSizing: 'border-box',
                    appearance: 'none',
                    backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%236B7280%22 stroke-width=%222%22%3e%3cpolyline points=%226 9 12 15 18 9%22%3e%3c/polyline%3e%3c/svg%3e")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 8px center',
                    backgroundSize: '20px',
                    paddingRight: '32px',
                  }}
                  required
                >
                  <option value="">Select a time</option>
                  {availableTimes.map(t => (
                    <option key={t} value={t}>
                      {(() => {
                        const [h, m] = t.split(':')
                        const hour = parseInt(h)
                        return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
                      })()}{' '}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <textarea
              placeholder="Notes (optional)"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              style={{ padding: '14px 16px', borderRadius: '10px', border: '1px solid #EDE9DF', fontSize: '15px', color: '#1A3329', minHeight: '100px', resize: 'none' }}
            />

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', borderRadius: '10px', background: '#FEF9E7', border: '1px solid #FDF4D1', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.smsConsent}
                onChange={e => setFormData({ ...formData, smsConsent: e.target.checked })}
                style={{ width: '20px', height: '20px', marginTop: '2px', cursor: 'pointer', accentColor: '#92400E' }}
                required
              />
              <span style={{ fontSize: '13px', color: '#78350F', lineHeight: 1.5, fontWeight: 500 }}>
                I'd like to receive SMS reminders for my appointment to <strong>{formData.clientPhone || '(your number)'}</strong>. Message & data rates apply.{' '}
                <a href="/privacy" style={{ color: '#92400E', textDecoration: 'underline' }}>
                  See our privacy policy.
                </a>
              </span>
            </label>

            {error && <div style={{ padding: '14px 16px', borderRadius: '10px', background: '#FEE2E2', border: '1px solid #FECACA', color: '#991B1B', fontSize: '13px', fontWeight: 500 }}>{error}</div>}

            <button
              type="submit"
              disabled={submitting || (!!formData.date && !formData.time)}
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: submitting ? '#C6E9DD' : 'linear-gradient(135deg, #1A3329 0%, #2D6A4F 100%)',
                color: submitting ? '#6B7280' : 'white',
                fontWeight: 700,
                fontSize: '15px',
                border: 'none',
                cursor: submitting || (!!formData.date && !formData.time) ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 20px rgba(26, 51, 41, 0.25)',
                transition: 'all 0.2s ease',
              }}
            >
              {submitting ? 'Confirming...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
