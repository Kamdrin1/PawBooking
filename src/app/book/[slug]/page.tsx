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
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').replace(/^1/, '')
  if (digits.length === 0) return ''
  if (digits.length <= 3) return `+1 (${digits}`
  if (digits.length <= 6) return `+1 (${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}

export default function BookingPage() {
  const params = useParams()
  const slug = params.slug as string
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [notFound, setNotFound] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
        .select('id, business_name, service_area, payment_methods')
        .ilike('business_name', slug.replace(/-/g, ' '))
        .single()

      if (!profiles) { setNotFound(true); return }
      setProfile(profiles)

      const { data: serviceData } = await supabase
        .from('services').select('*').eq('profile_id', profiles.id).order('name', { ascending: true })

      setServices(serviceData || [])
      if (serviceData && serviceData.length > 0) setServiceId(serviceData[0].id)
    }
    load()
  }, [slug])

  const selectedService = services.find(s => s.id === serviceId)

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '').replace(/^1/, '').slice(0, 10)
    setClientPhone(formatPhone(digits))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!smsConsent) { setError('Please agree to receive SMS reminders to complete your booking.'); return }
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F2EB' }}>
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
        * { font-family: 'DM Sans', sans-serif; }
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
        <div className="text-center max-w-md relative z-10">
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
              { label: 'Time', value: (() => { const [h, m] = time.split(':'); const hour = parseInt(h); return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}` })() },
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
        .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(26,51,41,0.35); }
        .submit-btn:disabled { opacity: 0.5; transform: none; box-shadow: none; }
        label { color: #6B7280; font-size: 13px; font-weight: 500; display: block; margin-bottom: 6px; }
      `}</style>

      <div className="min-h-screen" style={{ background: '#F5F2EB' }}>

        {/* HEADER */}
        <div style={{ background: 'linear-gradient(145deg, #1A3329, #0f2218)', padding: '40px 24px 36px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '200px', background: 'radial-gradient(ellipse, rgba(45,106,79,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '600px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(216,243,220,0.2), transparent)' }} />

          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(216,243,220,0.12)', border: '1px solid rgba(216,243,220,0.15)', boxShadow: '0 0 24px rgba(45,106,79,0.15)' }}>
            <svg width="26" height="26" viewBox="0 0 100 100" fill="#D8F3DC">
              <ellipse cx="50" cy="70" rx="26" ry="20"/>
              <ellipse cx="20" cy="44" rx="12" ry="15"/>
              <ellipse cx="38" cy="33" rx="12" ry="15"/>
              <ellipse cx="62" cy="33" rx="12" ry="15"/>
              <ellipse cx="80" cy="44" rx="12" ry="15"/>
            </svg>
          </div>
          <h1 className="playfair text-2xl font-bold text-white mb-1.5" style={{ letterSpacing: '-0.02em' }}>
            {profile.business_name}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>
            {profile.service_area || 'Professional Dog Grooming'}
          </p>
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(216,243,220,0.12)', color: '#D8F3DC', border: '1px solid rgba(216,243,220,0.15)', backdropFilter: 'blur(8px)' }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#4ade80', boxShadow: '0 0 6px rgba(74,222,128,0.6)' }} />
            Accepting bookings
          </div>
        </div>

        <div className="max-w-lg mx-auto px-5 py-8">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* SERVICES */}
            {services.length > 0 && (
              <div>
                <h2 className="font-semibold mb-3" style={{ color: '#1A3329', fontSize: '15px', letterSpacing: '-0.01em' }}>Select a Service</h2>
                <div className="space-y-2">
                  {services.map(s => (
                    <div key={s.id} onClick={() => setServiceId(s.id)} className={`service-card ${serviceId === s.id ? 'selected' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-sm" style={{ color: '#1A3329', letterSpacing: '-0.01em' }}>{s.name}</div>
                          <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{s.duration_minutes} min</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm" style={{ color: '#2D6A4F' }}>${s.price}</span>
                          <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                            style={{ borderColor: serviceId === s.id ? '#1A3329' : '#D1C9B8', background: serviceId === s.id ? 'linear-gradient(135deg, #1A3329, #2D6A4F)' : 'transparent' }}>
                            {serviceId === s.id && <span className="text-white text-xs">✓</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DATE & TIME */}
            <div className="form-card p-5">
              <h2 className="font-semibold mb-4" style={{ color: '#1A3329', fontSize: '15px', letterSpacing: '-0.01em' }}>Date & Time</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>Preferred Date *</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    required min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{ background: '#F5F2EB', border: '1px solid rgba(237,233,223,0.8)' }} />
                </div>
                <div>
                  <label>Preferred Time *</label>
                  <input type="time" value={time} onChange={e => setTime(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{ background: '#F5F2EB', border: '1px solid rgba(237,233,223,0.8)' }} />
                </div>
              </div>
            </div>

            {/* YOUR INFO */}
            <div className="form-card p-5">
              <h2 className="font-semibold mb-4" style={{ color: '#1A3329', fontSize: '15px', letterSpacing: '-0.01em' }}>Your Info</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label>Your Name *</label>
                    <input type="text" value={clientName} onChange={e => setClientName(e.target.value)}
                      placeholder="Jane Smith" required
                      className="w-full px-4 py-3 rounded-xl text-sm"
                      style={{ background: '#F5F2EB', border: '1px solid rgba(237,233,223,0.8)' }} />
                  </div>
                  <div>
                    <label>Phone Number *</label>
                    <input type="tel" value={clientPhone} onChange={handlePhoneChange}
                      placeholder="+1 (208) 555-0000" required
                      className="w-full px-4 py-3 rounded-xl text-sm"
                      style={{ background: '#F5F2EB', border: '1px solid rgba(237,233,223,0.8)' }} />
                  </div>
                </div>
                <div>
                  <label>Email <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional — for confirmation)</span></label>
                  <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)}
                    placeholder="jane@email.com"
                    className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{ background: '#F5F2EB', border: '1px solid rgba(237,233,223,0.8)' }} />
                </div>
              </div>
            </div>

            {/* DOG INFO */}
            <div className="form-card p-5">
              <h2 className="font-semibold mb-4" style={{ color: '#1A3329', fontSize: '15px', letterSpacing: '-0.01em' }}>Dog Info</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>Dog&apos;s Name *</label>
                  <input type="text" value={dogName} onChange={e => setDogName(e.target.value)}
                    placeholder="Buddy" required
                    className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{ background: '#F5F2EB', border: '1px solid rgba(237,233,223,0.8)' }} />
                </div>
                <div>
                  <label>Breed</label>
                  <input type="text" value={dogBreed} onChange={e => setDogBreed(e.target.value)}
                    placeholder="Golden Retriever"
                    className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{ background: '#F5F2EB', border: '1px solid rgba(237,233,223,0.8)' }} />
                </div>
              </div>
            </div>

            {/* NOTES */}
            <div className="form-card p-5">
              <h2 className="font-semibold mb-4" style={{ color: '#1A3329', fontSize: '15px', letterSpacing: '-0.01em' }}>
                Additional Notes <span className="font-normal text-sm" style={{ color: '#9CA3AF' }}>(optional)</span>
              </h2>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                placeholder="Allergies, special instructions, temperament notes..."
                className="w-full px-4 py-3 rounded-xl text-sm resize-none"
                style={{ background: '#F5F2EB', border: '1px solid rgba(237,233,223,0.8)' }} />
            </div>

            {/* BOOKING SUMMARY */}
            {selectedService && date && time && (
              <div className="rounded-2xl p-5"
                style={{ background: 'linear-gradient(135deg, #D8F3DC, #c8eacd)', border: '1px solid rgba(45,106,79,0.15)', boxShadow: '0 4px 16px rgba(45,106,79,0.1)' }}>
                <h2 className="font-semibold mb-3 text-sm uppercase tracking-widest" style={{ color: '#1A5C36', letterSpacing: '0.1em' }}>Booking Summary</h2>
                <div className="space-y-2">
                  {[
                    { label: 'Service', value: selectedService.name },
                    { label: 'Date', value: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) },
                    { label: 'Time', value: (() => { const [h, m] = time.split(':'); const hour = parseInt(h); return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}` })() },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span style={{ color: '#2D6A4F' }}>{row.label}</span>
                      <span className="font-semibold" style={{ color: '#1A3329' }}>{row.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm pt-2" style={{ borderTop: '1px solid rgba(45,106,79,0.2)' }}>
                    <span className="font-semibold" style={{ color: '#2D6A4F' }}>Total</span>
                    <span className="font-bold text-base" style={{ color: '#1A3329' }}>${selectedService.price}</span>
                  </div>
                </div>
              </div>
            )}

            {/* SMS CONSENT */}
            <div className="rounded-2xl p-4 flex items-start gap-3 transition-all"
              style={{ background: 'linear-gradient(145deg, #FDFBF7, #F8F5EF)', border: `2px solid ${smsConsent ? 'rgba(45,106,79,0.3)' : 'rgba(237,233,223,0.8)'}`, boxShadow: smsConsent ? '0 4px 12px rgba(45,106,79,0.08)' : 'none' }}>
              <input type="checkbox" id="sms-consent" checked={smsConsent}
                onChange={e => setSmsConsent(e.target.checked)}
                className="mt-0.5 flex-shrink-0"
                style={{ width: '16px', height: '16px', accentColor: '#1A3329', cursor: 'pointer' }} />
              <label htmlFor="sms-consent" style={{ color: '#4B5563', fontSize: '12px', fontWeight: 400, marginBottom: 0, cursor: 'pointer', lineHeight: 1.7 }}>
                I agree to receive SMS appointment reminders from {profile.business_name} via PawBooking. Message frequency varies. Message & data rates may apply. Reply <strong>STOP</strong> to opt out at any time.
              </label>
            </div>

            {/* ERROR */}
            {error && (
              <div className="px-4 py-3 rounded-xl text-sm" style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }}>
                {error}
              </div>
            )}

            {/* SUBMIT */}
            <button type="submit" disabled={loading || !smsConsent}
              className="submit-btn w-full py-4 rounded-xl font-semibold text-sm">
              {loading ? 'Sending request...' : `Request Appointment${selectedService ? ` — $${selectedService.price}` : ''}`}
            </button>

            <p className="text-center text-xs" style={{ color: '#9CA3AF', lineHeight: 1.7 }}>
              Your request will be confirmed by {profile.business_name}. You&apos;ll receive an SMS reminder before your appointment.
            </p>

          </form>
        </div>
      </div>
    </>
  )
}
