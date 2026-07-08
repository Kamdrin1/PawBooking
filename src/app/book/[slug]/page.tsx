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
  payment_methods: string[]
  availability: { days: Record<string, boolean>; startTime: string; endTime: string }
}

interface UnavailableDate {
  date: string
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').replace(/^1/, '')
  if (digits.length === 0) return ''
  if (digits.length <= 3) return `+1 (${digits}`
  if (digits.length <= 6) return `+1 (${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}

function generateTimeSlots(startTime: string, endTime: string): string[] {
  const slots: string[] = []
  const [startH, startM] = startTime.split(':').map(Number)
  const [endH, endM] = endTime.split(':').map(Number)
  
  let current = new Date(2000, 0, 1, startH, startM)
  const end = new Date(2000, 0, 1, endH, endM)
  
  while (current < end) {
    const h = String(current.getHours()).padStart(2, '0')
    const m = String(current.getMinutes()).padStart(2, '0')
    slots.push(`${h}:${m}`)
    current.setMinutes(current.getMinutes() + 30)
  }
  
  return slots
}

export default function BookingPage() {
  const params = useParams()
  const slug = params.slug as string
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [notFound, setNotFound] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [unavailableDates, setUnavailableDates] = useState<Set<string>>(new Set())

  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [dogName, setDogName] = useState('')
  const [dogBreed, setDogBreed] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [smsConsent, setSmsConsent] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, business_name, service_area, payment_methods, availability')
        .eq('slug', slug)
        .single()

      if (!profiles) { setNotFound(true); return }
      setProfile(profiles)

      const { data: serviceData } = await supabase
        .from('services').select('*').eq('profile_id', profiles.id).order('name', { ascending: true })

      setServices(serviceData || [])
      if (serviceData && serviceData.length > 0) setServiceId(serviceData[0].id)

      // Load unavailable dates
      const { data: unavailData } = await supabase
        .from('unavailable_dates')
        .select('date')
        .eq('profile_id', profiles.id)
      
      if (unavailData) {
        setUnavailableDates(new Set(unavailData.map(d => d.date)))
      }

      // Subscribe to real-time unavailable dates updates
      const subscription = supabase
        .channel(`unavailable_dates:profile_id=eq.${profiles.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'unavailable_dates',
            filter: `profile_id=eq.${profiles.id}`
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setUnavailableDates(prev => new Set([...prev, (payload.new as { date: string }).date]))
            } else if (payload.eventType === 'DELETE') {
              setUnavailableDates(prev => {
                const updated = new Set(prev)
                updated.delete((payload.old as { date: string }).date)
                return updated
              })
            }
          }
        )
        .subscribe()

      setLoading(false)

      return () => {
        subscription.unsubscribe()
      }
    }
    load()
  }, [slug])

  const selectedService = services.find(s => s.id === serviceId)
  const availability = profile?.availability || { days: {}, startTime: '09:00', endTime: '17:00' }
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const timeSlots = generateTimeSlots(availability.startTime, availability.endTime)

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '').replace(/^1/, '').slice(0, 10)
    setClientPhone(formatPhone(digits))
  }

  function isDateDisabled(dateStr: string): boolean {
    // Check if date is in unavailable dates
    if (unavailableDates.has(dateStr)) return true
    
    // Check if day of week is available
    const dayOfWeek = new Date(dateStr + 'T00:00:00').getDay()
    const dayName = dayNames[dayOfWeek]
    if (!availability.days[dayName]) return true
    
    // Check if date is in the past
    const today = new Date().toISOString().split('T')[0]
    if (dateStr < today) return true
    
    return false
  }

  function getDateStatus(dateStr: string): string {
    if (dateStr < new Date().toISOString().split('T')[0]) return 'past'
    if (unavailableDates.has(dateStr)) return 'unavailable'
    const dayOfWeek = new Date(dateStr + 'T00:00:00').getDay()
    const dayName = dayNames[dayOfWeek]
    if (!availability.days[dayName]) return 'closed'
    return 'available'
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!smsConsent) { setError('Please agree to receive SMS reminders to complete your booking.'); return }
    if (date && isDateDisabled(date)) { setError('This date is not available. Please select another.'); return }
    
    setLoading(true); setError('')

    const { error } = await supabase.from('appointments').insert({
      profile_id: profile!.id,
      client_name: clientName,
      client_phone: clientPhone,
      client_email: clientEmail,
      dog_name: dogName,
      dog_breed: dogBreed,
      service_id: serviceId || null,
      appointment_date: date,
      appointment_time: time,
      notes,
      status: 'pending',
      payment_method: 'in_person',
    })

    if (error) { setError(error.message); setLoading(false); return }

    fetch('/api/notify-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientName, clientPhone, clientEmail, dogName, dogBreed,
        serviceName: selectedService?.name || 'Appointment',
        servicePrice: selectedService?.price || 0,
        date, time, notes,
        paymentMethod: 'in_person',
        businessName: profile!.business_name,
      })
    })

    setSubmitted(true); setLoading(false)
  }

  if (notFound) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .playfair { font-family: 'Playfair Display', serif; }
      `}</style>
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#F5F2EB' }}>
        <div className="text-center">
          <div className="text-5xl mb-4">🐾</div>
          <h1 className="playfair text-2xl font-bold mb-2" style={{ color: '#1A3329' }}>Groomer not found</h1>
          <p style={{ color: '#9CA3AF' }}>This booking link doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    </>
  )

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F2EB' }}>
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#2D6A4F', borderTopColor: 'transparent' }} />
    </div>
  )

  if (submitted) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .playfair { font-family: 'Playfair Display', serif; }
      `}</style>
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: '#F5F2EB' }}>
        <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
          {[
            { top: '3%', left: '2%', rotate: '-25deg', size: 100, opacity: 0.06 },
            { top: '8%', left: '78%', rotate: '40deg', size: 70, opacity: 0.05 },
            { top: '20%', left: '88%', rotate: '20deg', size: 120, opacity: 0.06 },
            { top: '25%', left: '4%', rotate: '35deg', size: 85, opacity: 0.05 },
            { top: '48%', left: '85%', rotate: '-20deg', size: 95, opacity: 0.06 },
            { top: '68%', left: '32%', rotate: '25deg', size: 110, opacity: 0.06 },
            { top: '85%', left: '52%', rotate: '-30deg', size: 90, opacity: 0.05 },
            { top: '93%', left: '22%', rotate: '-45deg', size: 80, opacity: 0.06 },
          ].map((paw, i) => (
            <svg key={i} width={paw.size} height={paw.size} viewBox="0 0 100 100"
              style={{ position: 'absolute', top: paw.top, left: paw.left, transform: `rotate(${paw.rotate})`, opacity: paw.opacity }}
              fill="#1A3329">
              <ellipse cx="50" cy="70" rx="26" ry="20"/>
              <ellipse cx="20" cy="44" rx="12" ry="15"/>
              <ellipse cx="38" cy="33" rx="12" ry="15"/>
              <ellipse cx="62" cy="33" rx="12" ry="15"/>
              <ellipse cx="80" cy="44" rx="12" ry="15"/>
            </svg>
          ))}
        </div>
        <div className="text-center max-w-sm w-full relative z-10">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'linear-gradient(135deg, #D8F3DC, #c8eacd)', boxShadow: '0 8px 24px rgba(45,106,79,0.2)' }}>
            <svg width="36" height="36" viewBox="0 0 100 100" fill="#1A3329">
              <ellipse cx="50" cy="70" rx="26" ry="20"/>
              <ellipse cx="20" cy="44" rx="12" ry="15"/>
              <ellipse cx="38" cy="33" rx="12" ry="15"/>
              <ellipse cx="62" cy="33" rx="12" ry="15"/>
              <ellipse cx="80" cy="44" rx="12" ry="15"/>
            </svg>
          </div>
          <h1 className="playfair text-3xl font-bold mb-3" style={{ color: '#1A3329', letterSpacing: '-0.02em' }}>You&apos;re booked!</h1>
          <p className="text-base mb-6" style={{ color: '#6B7280', lineHeight: 1.7 }}>
            Your appointment request has been sent to <strong style={{ color: '#1A3329' }}>{profile.business_name}</strong>. They&apos;ll confirm shortly and you&apos;ll receive a reminder before your appointment.
          </p>
          <div className="rounded-2xl p-5 text-left space-y-3"
            style={{ background: 'linear-gradient(145deg, #FDFBF7, #F8F5EF)', border: '1px solid rgba(237,233,223,0.8)', boxShadow: '0 4px 20px rgba(26,51,41,0.06)' }}>
            {[
              { label: 'Client', value: clientName },
              { label: 'Dog', value: dogName },
              { label: 'Service', value: selectedService?.name },
              { label: 'Date', value: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) },
              { label: 'Time', value: time ? (() => { const [h, m] = time.split(':'); const hour = parseInt(h); return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}` })() : '' },
            ].map((row, i) => (
              <div key={i} className="flex justify-between text-sm" style={{ borderBottom: '1px solid rgba(237,233,223,0.8)', paddingBottom: '10px' }}>
                <span style={{ color: '#9CA3AF' }}>{row.label}</span>
                <span className="font-semibold" style={{ color: '#1A3329' }}>{row.value}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm pt-1">
              <span className="font-semibold" style={{ color: '#9CA3AF' }}>Price</span>
              <span className="font-bold text-lg" style={{ color: '#2D6A4F' }}>${selectedService?.price}</span>
            </div>
          </div>
          <p className="text-xs mt-4" style={{ color: '#9CA3AF' }}>You&apos;ll receive an SMS reminder 24 hours before your appointment.</p>
        </div>
      </div>
    </>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        .playfair { font-family: 'Playfair Display', serif; }
        input, textarea, select { color: #1A3329 !important; }
        input::placeholder, textarea::placeholder { color: #9CA3AF !important; }
        input:focus, textarea:focus, select:focus {
          outline: none; border-color: #2D6A4F !important;
          box-shadow: 0 0 0 3px rgba(45,106,79,0.1);
        }
        input:disabled, select:disabled {
          opacity: 0.5; cursor: not-allowed !important;
        }
        .service-card {
          border: 2px solid rgba(237,233,223,0.8); border-radius: 18px; padding: 16px;
          cursor: pointer; transition: all 0.2s ease;
          background: linear-gradient(145deg, #FDFBF7, #F8F5EF);
        }
        .service-card:hover { border-color: rgba(45,106,79,0.3); box-shadow: 0 4px 16px rgba(26,51,41,0.08); transform: translateY(-1px); }
        .service-card.selected {
          border-color: #1A3329;
          background: linear-gradient(135deg, #D8F3DC, #c8eacd);
          box-shadow: 0 4px 16px rgba(26,51,41,0.12);
        }
        .form-card {
          background: linear-gradient(145deg, #FDFBF7, #F8F5EF);
          border: 1px solid rgba(237,233,223,0.8);
          border-radius: 20px;
          box-shadow: 0 2px 12px rgba(26,51,41,0.04);
        }
        .submit-btn {
          background: linear-gradient(135deg, #1A3329, #2D6A4F);
          color: white; transition: all 0.25s ease;
          box-shadow: 0 4px 15px rgba(26,51,41,0.25);
        }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(26,51,41,0.35); }
        .submit-btn:disabled { opacity: 0.5; transform: none; box-shadow: none; cursor: not-allowed; }
        label { color: #6B7280; font-size: 13px; font-weight: 500; display: block; margin-bottom: 6px; }
        .two-col { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        @media (max-width: 480px) {
          .two-col { grid-template-columns: 1fr !important; }
          .booking-header { padding: 28px 20px 24px !important; }
          .booking-header-icon { width: 48px !important; height: 48px !important; margin-bottom: 16px !important; }
          .booking-header-title { font-size: 20px !important; }
        }
      `}</style>

      <div className="min-h-screen" style={{ background: '#F5F2EB' }}>

        {/* HEADER */}
        <div className="booking-header" style={{ background: 'linear-gradient(145deg, #1A3329, #0f2218)', padding: '40px 24px 36px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '200px', background: 'radial-gradient(ellipse, rgba(45,106,79,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '600px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(216,243,220,0.2), transparent)' }} />

          <div className="booking-header-icon" style={{ width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', background: 'rgba(216,243,220,0.12)', border: '1px solid rgba(216,243,220,0.15)', boxShadow: '0 0 24px rgba(45,106,79,0.15)' }}>
            <svg width="26" height="26" viewBox="0 0 100 100" fill="#D8F3DC">
              <ellipse cx="50" cy="70" rx="26" ry="20"/>
              <ellipse cx="20" cy="44" rx="12" ry="15"/>
              <ellipse cx="38" cy="33" rx="12" ry="15"/>
              <ellipse cx="62" cy="33" rx="12" ry="15"/>
              <ellipse cx="80" cy="44" rx="12" ry="15"/>
            </svg>
          </div>
          <h1 className="playfair booking-header-title font-bold text-white mb-1.5" style={{ fontSize: '24px', letterSpacing: '-0.02em' }}>
            {profile.business_name}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>
            {profile.service_area || 'Professional Dog Grooming'}
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '16px', padding: '6px 16px', borderRadius: '50px', background: 'rgba(216,243,220,0.12)', color: '#D8F3DC', border: '1px solid rgba(216,243,220,0.15)', backdropFilter: 'blur(8px)', fontSize: '12px', fontWeight: 600 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px rgba(74,222,128,0.6)' }} />
            Accepting bookings
          </div>
        </div>

        <div style={{ maxWidth: '520px', margin: '0 auto', padding: '24px 16px 40px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* SERVICES */}
            {services.length > 0 && (
              <div>
                <h2 className="font-semibold mb-3" style={{ color: '#1A3329', fontSize: '15px', letterSpacing: '-0.01em' }}>Select a Service</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {services.map(s => (
                    <div key={s.id} onClick={() => setServiceId(s.id)} className={`service-card ${serviceId === s.id ? 'selected' : ''}`}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div className="font-semibold text-sm" style={{ color: '#1A3329', letterSpacing: '-0.01em' }}>{s.name}</div>
                          <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{s.duration_minutes} min</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span className="font-bold text-sm" style={{ color: '#2D6A4F' }}>${s.price}</span>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${serviceId === s.id ? '#1A3329' : '#D1C9B8'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: serviceId === s.id ? 'linear-gradient(135deg, #1A3329, #2D6A4F)' : 'transparent' }}>
                            {serviceId === s.id && <span style={{ color: 'white', fontSize: '11px' }}>✓</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DATE & TIME */}
            <div className="form-card" style={{ padding: '20px' }}>
              <h2 className="font-semibold mb-4" style={{ color: '#1A3329', fontSize: '15px', letterSpacing: '-0.01em' }}>Date & Time</h2>
              <div className="two-col">
                <div>
                  <label>Preferred Date *</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    required min={new Date().toISOString().split('T')[0]}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', background: '#F5F2EB', border: '1px solid rgba(237,233,223,0.8)', color: '#1A3329' }} />
                  {date && isDateDisabled(date) && (
                    <div style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>
                      ⚠️ {getDateStatus(date) === 'unavailable' ? 'Groomer unavailable' : 'Not available'}
                    </div>
                  )}
                </div>
                <div>
                  <label>Preferred Time *</label>
                  <select value={time} onChange={e => setTime(e.target.value)}
                    required disabled={!date}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', background: '#F5F2EB', border: '1px solid rgba(237,233,223,0.8)', color: '#1A3329' }}>
                    <option value="">{!date ? 'Select date first' : 'Select time'}</option>
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>{(() => { const [h, m] = slot.split(':'); const hour = parseInt(h); return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}` })()} ({slot})</option>
                    ))}
                  </select>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
                    {availability.startTime} - {availability.endTime}
                  </div>
                </div>
              </div>
            </div>

            {/* YOUR INFO */}
            <div className="form-card" style={{ padding: '20px' }}>
              <h2 className="font-semibold mb-4" style={{ color: '#1A3329', fontSize: '15px', letterSpacing: '-0.01em' }}>Your Info</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="two-col">
                  <div>
                    <label>Your Name *</label>
                    <input type="text" value={clientName} onChange={e => setClientName(e.target.value)}
                      placeholder="Jane Smith" required
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', background: '#F5F2EB', border: '1px solid rgba(237,233,223,0.8)' }} />
                  </div>
                  <div>
                    <label>Phone Number *</label>
                    <input type="tel" value={clientPhone} onChange={handlePhoneChange}
                      placeholder="+1 (208) 555-0000" required
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', background: '#F5F2EB', border: '1px solid rgba(237,233,223,0.8)' }} />
                  </div>
                </div>
                <div>
                  <label>Email <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional — for confirmation)</span></label>
                  <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)}
                    placeholder="jane@email.com"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', background: '#F5F2EB', border: '1px solid rgba(237,233,223,0.8)' }} />
                </div>
              </div>
            </div>

            {/* DOG INFO */}
            <div className="form-card" style={{ padding: '20px' }}>
              <h2 className="font-semibold mb-4" style={{ color: '#1A3329', fontSize: '15px', letterSpacing: '-0.01em' }}>Dog Info</h2>
              <div className="two-col">
                <div>
                  <label>Dog&apos;s Name *</label>
                  <input type="text" value={dogName} onChange={e => setDogName(e.target.value)}
                    placeholder="Buddy" required
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', background: '#F5F2EB', border: '1px solid rgba(237,233,223,0.8)' }} />
                </div>
                <div>
                  <label>Breed</label>
                  <input type="text" value={dogBreed} onChange={e => setDogBreed(e.target.value)}
                    placeholder="Golden Retriever"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', background: '#F5F2EB', border: '1px solid rgba(237,233,223,0.8)' }} />
                </div>
              </div>
            </div>

            {/* NOTES */}
            <div className="form-card" style={{ padding: '20px' }}>
              <h2 className="font-semibold mb-4" style={{ color: '#1A3329', fontSize: '15px', letterSpacing: '-0.01em' }}>
                Additional Notes <span style={{ fontWeight: 400, fontSize: '13px', color: '#9CA3AF' }}>(optional)</span>
              </h2>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                placeholder="Allergies, special instructions, temperament notes..."
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', background: '#F5F2EB', border: '1px solid rgba(237,233,223,0.8)', resize: 'none', color: '#1A3329' }} />
            </div>

            {/* BOOKING SUMMARY */}
            {selectedService && date && time && !isDateDisabled(date) && (
              <div style={{ borderRadius: '20px', padding: '20px', background: 'linear-gradient(135deg, #D8F3DC, #c8eacd)', border: '1px solid rgba(45,106,79,0.15)', boxShadow: '0 4px 16px rgba(45,106,79,0.1)' }}>
                <h2 style={{ fontWeight: 700, marginBottom: '12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1A5C36' }}>Booking Summary</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Service', value: selectedService.name },
                    { label: 'Date', value: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) },
                    { label: 'Time', value: time ? (() => { const [h, m] = time.split(':'); const hour = parseInt(h); return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}` })() : '' },
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span style={{ color: '#2D6A4F' }}>{row.label}</span>
                      <span style={{ fontWeight: 600, color: '#1A3329' }}>{row.value}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', paddingTop: '8px', borderTop: '1px solid rgba(45,106,79,0.2)' }}>
                    <span style={{ fontWeight: 600, color: '#2D6A4F' }}>Total</span>
                    <span style={{ fontWeight: 700, fontSize: '16px', color: '#1A3329' }}>${selectedService.price}</span>
                  </div>
                </div>
              </div>
            )}

            {/* SMS CONSENT */}
            <div style={{ borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'linear-gradient(145deg, #FDFBF7, #F8F5EF)', border: `2px solid ${smsConsent ? 'rgba(45,106,79,0.3)' : 'rgba(237,233,223,0.8)'}`, boxShadow: smsConsent ? '0 4px 12px rgba(45,106,79,0.08)' : 'none', transition: 'all 0.2s' }}>
              <input type="checkbox" id="sms-consent" checked={smsConsent}
                onChange={e => setSmsConsent(e.target.checked)}
                style={{ width: '18px', height: '18px', marginTop: '2px', flexShrink: 0, accentColor: '#1A3329', cursor: 'pointer' }} />
              <label htmlFor="sms-consent" style={{ color: '#4B5563', fontSize: '12px', fontWeight: 400, marginBottom: 0, cursor: 'pointer', lineHeight: 1.7 }}>
                I agree to receive SMS appointment reminders from PawBooking. Message frequency varies. Message & data rates may apply. Your mobile information will not be sold or shared with third parties for promotional or marketing purposes. Reply <strong>STOP</strong> to opt out at any time.
              </label>
            </div>

            {/* ERROR */}
            {error && (
              <div style={{ padding: '12px 16px', borderRadius: '12px', fontSize: '14px', background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }}>
                {error}
              </div>
            )}

            {/* SUBMIT */}
            <button type="submit" disabled={(loading || !smsConsent || (date ? isDateDisabled(date) : false))} className="submit-btn"
              style={{ width: '100%', padding: '16px', borderRadius: '14px', fontWeight: 700, fontSize: '15px', border: 'none', cursor: (loading || !smsConsent || (date ? isDateDisabled(date) : false)) ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Sending request...' : `Request Appointment${selectedService ? ` — $${selectedService.price}` : ''}`}
            </button>

            <p style={{ textAlign: 'center', fontSize: '12px', color: '#9CA3AF', lineHeight: 1.7 }}>
              Your request will be confirmed by {profile.business_name}. You&apos;ll receive an SMS reminder before your appointment.
            </p>

          </form>
        </div>
      </div>
    </>
  )
}
