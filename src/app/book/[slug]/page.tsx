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
  service_area: string
  phone: string
  email: string
  payment_methods: string[]
  availability: { days: Record<string, boolean>; startTime: string; endTime: string }
  slug: string
}

interface Appointment {
  id: string
  client_name: string
  client_phone: string
  client_email: string
  dog_name: string
  dog_breed: string
  appointment_date: string
  appointment_time: string
  service_id: string
  notes: string
  payment_method: string
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
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  useEffect(() => {
    async function load() {
      if (!slug) return
      const { data: profileData } = await supabase.from('profiles').select('*').eq('slug', slug).single()
      if (!profileData) { setError('Business not found'); setLoading(false); return }
      setProfile(profileData)

      const { data: serviceData } = await supabase.from('services').select('*').eq('profile_id', profileData.id).order('name')
      setServices(serviceData || [])

      const { data: apptData } = await supabase.from('appointments').select('appointment_date, appointment_time').eq('profile_id', profileData.id).neq('status', 'cancelled')
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
  const availableDays = availability.days ? Object.entries(availability.days).filter(([_, available]) => available).map(([day]) => dayNames.indexOf(day)) : []

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
    if (!formData.smsConsent) { setError('Please consent to SMS communications'); return }

    setSubmitting(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    const profileId = profile?.id || user?.id
    if (!profileId) { setError('Unable to process booking'); setSubmitting(false); return }

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

    if (insertError) { setError('Booking failed: ' + insertError.message); setSubmitting(false); return }

    setDate(formData.date)
    setTime(formData.time)
    setSubmitted(true)
    setSubmitting(false)
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F2EB' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '8px' }}>Loading...</div></div></div>

  if (!profile) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F2EB' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 600, color: '#1A3329' }}>Business not found</div></div></div>

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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #D8F3DC, #c8eacd)', padding: '16px' }}>
        <div style={{ maxWidth: '480px', width: '100%', background: 'white', borderRadius: '16px', padding: '40px 24px', textAlign: 'center', boxShadow: '0 8px 32px rgba(26,51,41,0.15)' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✓</div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1A3329', marginBottom: '8px', fontFamily: "'Playfair Display', serif" }}>Booking Confirmed!</h1>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '32px' }}>We'll send a confirmation to {formData.clientPhone}</p>

          <div style={{ background: '#F5F2EB', borderRadius: '12px', padding: '20px', marginBottom: '24px', textAlign: 'left' }}>
            {details.map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '12px' }}>
                <span style={{ color: '#9CA3AF', fontWeight: 500 }}>{label}</span>
                <span style={{ color: '#1A3329', fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>

          <a href="/" style={{ display: 'block', padding: '14px', borderRadius: '10px', background: 'linear-gradient(135deg, #1A3329, #2D6A4F)', color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '14px', marginBottom: '12px' }}>Back Home</a>
          <a href={`/book/${slug}`} style={{ display: 'block', padding: '14px', borderRadius: '10px', background: '#F5F2EB', color: '#1A3329', textDecoration: 'none', fontWeight: 600, fontSize: '14px', border: '1px solid #EDE9DF' }}>Make Another Booking</a>
        </div>
      </div>
    )
  }

  const serviceOptions = services.map(s => ({ id: s.id, name: s.name, price: s.price, paymentType: s.payment_type, depositAmount: s.deposit_amount }))
  const selectedService = serviceOptions.find(s => s.id === formData.serviceId)
  const availableTimes = formData.date ? getAvailableTimes(formData.date) : []
  const canBookOnline = selectedService && (selectedService.paymentType === 'none' || selectedService.paymentType === 'deposit' || selectedService.paymentType === 'full')
  const showPaymentMethod = canBookOnline

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FDFBF7, #F8F5EF)', padding: '24px 16px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #1A3329, #2D6A4F)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', fontWeight: 700 }}>🐾</div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1A3329', margin: 0, fontFamily: "'Playfair Display', serif" }}>{profile.business_name}</h1>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid rgba(237,233,223,0.8)', boxShadow: '0 4px 12px rgba(26,51,41,0.08)' }}>
          <div style={{ display: 'grid', gap: '16px' }}>
            <input type="text" placeholder="Your name *" value={formData.clientName} onChange={e => setFormData({ ...formData, clientName: e.target.value })} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #EDE9DF', fontSize: '14px', fontFamily: 'inherit' }} required />
            <input type="tel" placeholder="Phone *" value={formData.clientPhone} onChange={e => setFormData({ ...formData, clientPhone: e.target.value })} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #EDE9DF', fontSize: '14px', fontFamily: 'inherit' }} required />
            <input type="email" placeholder="Email" value={formData.clientEmail} onChange={e => setFormData({ ...formData, clientEmail: e.target.value })} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #EDE9DF', fontSize: '14px', fontFamily: 'inherit' }} />
            <input type="text" placeholder="Dog name *" value={formData.dogName} onChange={e => setFormData({ ...formData, dogName: e.target.value })} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #EDE9DF', fontSize: '14px', fontFamily: 'inherit' }} required />
            <input type="text" placeholder="Breed" value={formData.dogBreed} onChange={e => setFormData({ ...formData, dogBreed: e.target.value })} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #EDE9DF', fontSize: '14px', fontFamily: 'inherit' }} />

            <select value={formData.serviceId} onChange={e => setFormData({ ...formData, serviceId: e.target.value })} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #EDE9DF', fontSize: '14px', fontFamily: 'inherit' }} required>
              <option value="">Select service *</option>
              {serviceOptions.map(s => <option key={s.id} value={s.id}>{s.name} · ${s.price}</option>)}
            </select>

            <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value, time: '' })} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #EDE9DF', fontSize: '14px', fontFamily: 'inherit' }} required />

            {formData.date && (
              <select value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #EDE9DF', fontSize: '14px', fontFamily: 'inherit' }} required>
                <option value="">Select time *</option>
                {availableTimes.map(t => <option key={t} value={t}>{(() => { const [h, m] = t.split(':'); const hour = parseInt(h); return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}` })()} </option>)}
              </select>
            )}

            <textarea placeholder="Notes" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #EDE9DF', fontSize: '14px', fontFamily: 'inherit', resize: 'none', minHeight: '80px' }} />

            {showPaymentMethod && profile.payment_methods && profile.payment_methods.length > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '8px' }}>How do you prefer to pay?</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {profile.payment_methods.includes('online') && (
                    <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '10px', border: formData.paymentMethod === 'online' ? '2px solid #2D6A4F' : '1px solid #EDE9DF', background: formData.paymentMethod === 'online' ? '#D8F3DC' : '#FDFBF7', cursor: 'pointer' }}>
                      <input type="radio" name="payment" value="online" checked={formData.paymentMethod === 'online'} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#1A3329' }}>Online</span>
                    </label>
                  )}
                  {profile.payment_methods.includes('in-person') && (
                    <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '10px', border: formData.paymentMethod === 'in-person' ? '2px solid #2D6A4F' : '1px solid #EDE9DF', background: formData.paymentMethod === 'in-person' ? '#D8F3DC' : '#FDFBF7', cursor: 'pointer' }}>
                      <input type="radio" name="payment" value="in-person" checked={formData.paymentMethod === 'in-person'} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#1A3329' }}>In-person</span>
                    </label>
                  )}
                </div>
              </div>
            )}

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', borderRadius: '10px', background: '#FEF3C7', border: '1px solid #FDE68A', cursor: 'pointer' }}>
              <input type="checkbox" checked={formData.smsConsent} onChange={e => setFormData({ ...formData, smsConsent: e.target.checked })} style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer', accentColor: '#92400E' }} required />
              <span style={{ fontSize: '12px', color: '#78350F', lineHeight: 1.4 }}>
                I consent to receive SMS appointment reminders & updates to <strong>{formData.clientPhone || '(your phone)'}</strong>. Message & data rates may apply. <a href="/privacy" style={{ color: '#92400E', textDecoration: 'underline' }}>Privacy Policy</a>.
              </span>
            </label>

            {error && <div style={{ padding: '12px', borderRadius: '10px', background: '#FEE2E2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '13px' }}>{error}</div>}

            <button type="submit" disabled={submitting || (formData.date && !formData.time)} style={{ padding: '14px', borderRadius: '10px', background: 'linear-gradient(135deg, #1A3329, #2D6A4F)', color: 'white', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer', opacity: submitting || (formData.date && !formData.time) ? 0.6 : 1, boxShadow: '0 4px 12px rgba(26,51,41,0.2)' }}>
              {submitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
