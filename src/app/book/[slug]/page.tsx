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
  stripe_account_id?: string
  payment_methods: string[]
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
  const [paymentMethod, setPaymentMethod] = useState('in_person')

  useEffect(() => {
    async function load() {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, business_name, service_area, payment_methods')
        .ilike('business_name', slug.replace(/-/g, ' '))
        .single()

      if (!profiles) { setNotFound(true); return }
      setProfile(profiles)

      if (profiles.payment_methods?.length === 1) {
        setPaymentMethod(profiles.payment_methods[0])
      }

      const { data: serviceData } = await supabase
        .from('services')
        .select('*')
        .eq('profile_id', profiles.id)
        .order('name', { ascending: true })

      setServices(serviceData || [])
      if (serviceData && serviceData.length > 0) setServiceId(serviceData[0].id)
    }
    load()
  }, [slug])

  const selectedService = services.find(s => s.id === serviceId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const selectedSvc = services.find(s => s.id === serviceId)

// If payment method is online, go to Stripe checkout
if (paymentMethod === 'online' && selectedSvc) {
  const res = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      serviceId,
      serviceName: selectedSvc.name,
      amount: selectedSvc.price,
      groomerStripeId: profile?.stripe_account_id || null,
      bookingData: {
  clientName, clientPhone, clientEmail,
  dogName, dogBreed, date, time, notes,
  profileId: profile!.id,
  slug,
  businessName: profile!.business_name,
}
    })
  })

  const data = await res.json()
  if (data.url) {
    window.location.href = data.url
    return
  }
  setError('Failed to start checkout. Please try again.')
  setLoading(false)
  return
}

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
      payment_method: paymentMethod,
    })

    if (error) { setError(error.message); setLoading(false); return }
    setSubmitted(true)
    setLoading(false)
  }

  if (notFound) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
      `}</style>
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F2EB' }}>
        <div className="text-center">
          <div className="text-5xl mb-4">🐾</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#1A3329', fontFamily: 'Playfair Display, serif' }}>Groomer not found</h1>
          <p style={{ color: '#9CA3AF' }}>This booking link doesn't exist or has been removed.</p>
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
            { top: '3%',  left: '2%',  rotate: '-25deg', size: 100, opacity: 0.06 },
            { top: '8%',  left: '78%', rotate: '40deg',  size: 70,  opacity: 0.05 },
            { top: '5%',  left: '42%', rotate: '-10deg', size: 50,  opacity: 0.04 },
            { top: '20%', left: '88%', rotate: '20deg',  size: 120, opacity: 0.06 },
            { top: '25%', left: '4%',  rotate: '35deg',  size: 85,  opacity: 0.05 },
            { top: '35%', left: '58%', rotate: '-40deg', size: 60,  opacity: 0.04 },
            { top: '42%', left: '18%', rotate: '15deg',  size: 40,  opacity: 0.05 },
            { top: '48%', left: '85%', rotate: '-20deg', size: 95,  opacity: 0.06 },
            { top: '55%', left: '2%',  rotate: '50deg',  size: 75,  opacity: 0.05 },
            { top: '62%', left: '68%', rotate: '-35deg', size: 50,  opacity: 0.04 },
            { top: '68%', left: '32%', rotate: '25deg',  size: 110, opacity: 0.06 },
            { top: '75%', left: '92%', rotate: '-15deg', size: 65,  opacity: 0.05 },
            { top: '78%', left: '10%', rotate: '45deg',  size: 45,  opacity: 0.04 },
            { top: '85%', left: '52%', rotate: '-30deg', size: 90,  opacity: 0.05 },
            { top: '90%', left: '75%', rotate: '10deg',  size: 55,  opacity: 0.04 },
            { top: '93%', left: '22%', rotate: '-45deg', size: 80,  opacity: 0.06 },
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
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#D8F3DC' }}>
            <svg width="36" height="36" viewBox="0 0 100 100" fill="#1A3329">
              <ellipse cx="50" cy="70" rx="26" ry="20"/>
              <ellipse cx="20" cy="44" rx="12" ry="15"/>
              <ellipse cx="38" cy="33" rx="12" ry="15"/>
              <ellipse cx="62" cy="33" rx="12" ry="15"/>
              <ellipse cx="80" cy="44" rx="12" ry="15"/>
            </svg>
          </div>

          <h1 className="playfair text-3xl font-bold mb-3" style={{ color: '#1A3329', fontFamily: 'Playfair Display, serif' }}>You're booked!</h1>
          <p className="text-base mb-6" style={{ color: '#6B7280' }}>
            Your appointment request has been sent to <strong style={{ color: '#1A3329' }}>{profile.business_name}</strong>. They'll confirm shortly and you'll receive a reminder before your appointment.
          </p>

          <div className="rounded-2xl p-5 text-left space-y-3" style={{ background: '#FDFBF7', border: '1px solid #EDE9DF' }}>
            {[
              { label: 'Client', value: clientName },
              { label: 'Dog', value: dogName },
              { label: 'Service', value: selectedService?.name },
              { label: 'Date', value: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) },
              { label: 'Time', value: (() => { const [h, m] = time.split(':'); const hour = parseInt(h); return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}` })() },
              { label: 'Payment', value: paymentMethod === 'online' ? '💳 Pay Online' : '💵 Pay in Person' },
            ].map((row, i) => (
              <div key={i} className="flex justify-between text-sm" style={{ borderBottom: '1px solid #EDE9DF', paddingBottom: '10px' }}>
                <span style={{ color: '#9CA3AF' }}>{row.label}</span>
                <span className="font-semibold" style={{ color: '#1A3329' }}>{row.value}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm pt-1">
              <span className="font-semibold" style={{ color: '#9CA3AF' }}>Price</span>
              <span className="font-bold text-lg" style={{ color: '#2D6A4F' }}>${selectedService?.price}</span>
            </div>
          </div>

          <p className="text-xs mt-4" style={{ color: '#9CA3AF' }}>You'll receive an SMS reminder 24 hours before your appointment.</p>
        </div>
      </div>
    </>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .playfair { font-family: 'Playfair Display', serif; }
        input, textarea, select { color: #1A3329 !important; }
        input::placeholder, textarea::placeholder { color: #9CA3AF !important; }
        input:focus, textarea:focus, select:focus { outline: none; border-color: #2D6A4F !important; box-shadow: 0 0 0 3px rgba(45,106,79,0.08); }
        .service-card { border: 2px solid #EDE9DF; border-radius: 16px; padding: 16px; cursor: pointer; transition: all 0.15s ease; background: #FDFBF7; }
        .service-card:hover { border-color: #2D6A4F; background: #F5F2EB; }
        .service-card.selected { border-color: #1A3329; background: #D8F3DC; }
        .submit-btn { background: #1A3329; color: white; transition: all 0.2s ease; }
        .submit-btn:hover { background: #2D6A4F; transform: translateY(-1px); box-shadow: 0 8px 25px rgba(26,51,41,0.2); }
        .submit-btn:disabled { opacity: 0.5; transform: none; box-shadow: none; }
        label { color: #6B7280; font-size: 13px; font-weight: 500; display: block; margin-bottom: 6px; }
      `}</style>

      <div className="min-h-screen" style={{ background: '#F5F2EB' }}>

        <div style={{ background: '#1A3329', padding: '32px 24px', textAlign: 'center' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(216,243,220,0.15)' }}>
            <svg width="24" height="24" viewBox="0 0 100 100" fill="#D8F3DC">
              <ellipse cx="50" cy="70" rx="26" ry="20"/>
              <ellipse cx="20" cy="44" rx="12" ry="15"/>
              <ellipse cx="38" cy="33" rx="12" ry="15"/>
              <ellipse cx="62" cy="33" rx="12" ry="15"/>
              <ellipse cx="80" cy="44" rx="12" ry="15"/>
            </svg>
          </div>
          <h1 className="playfair text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
            {profile.business_name}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
            {profile.service_area || 'Professional Dog Grooming'}
          </p>
          <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: 'rgba(216,243,220,0.15)', color: '#D8F3DC' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            Accepting bookings
          </div>
        </div>

        <div className="max-w-lg mx-auto px-6 py-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Service Selection */}
            {services.length > 0 && (
              <div>
                <h2 className="font-semibold mb-3" style={{ color: '#1A3329' }}>Select a Service</h2>
                <div className="space-y-2">
                  {services.map(s => (
                    <div key={s.id}
                      onClick={() => setServiceId(s.id)}
                      className={`service-card ${serviceId === s.id ? 'selected' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-sm" style={{ color: '#1A3329' }}>{s.name}</div>
                          <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{s.duration_minutes} min</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold" style={{ color: '#2D6A4F' }}>${s.price}</span>
                          <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                            style={{ borderColor: serviceId === s.id ? '#1A3329' : '#D1C9B8', background: serviceId === s.id ? '#1A3329' : 'transparent' }}>
                            {serviceId === s.id && <span className="text-white text-xs">✓</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Date & Time */}
            <div className="rounded-2xl p-5" style={{ background: '#FDFBF7', border: '1px solid #EDE9DF' }}>
              <h2 className="font-semibold mb-4" style={{ color: '#1A3329' }}>Date & Time</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>Preferred Date *</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    required min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{ background: '#F5F2EB', border: '1px solid #EDE9DF' }} />
                </div>
                <div>
                  <label>Preferred Time *</label>
                  <input type="time" value={time} onChange={e => setTime(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{ background: '#F5F2EB', border: '1px solid #EDE9DF' }} />
                </div>
              </div>
            </div>

            {/* Your Info */}
            <div className="rounded-2xl p-5" style={{ background: '#FDFBF7', border: '1px solid #EDE9DF' }}>
              <h2 className="font-semibold mb-4" style={{ color: '#1A3329' }}>Your Info</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label>Your Name *</label>
                    <input type="text" value={clientName} onChange={e => setClientName(e.target.value)}
                      placeholder="Jane Smith" required
                      className="w-full px-4 py-3 rounded-xl text-sm"
                      style={{ background: '#F5F2EB', border: '1px solid #EDE9DF' }} />
                  </div>
                  <div>
                    <label>Phone Number *</label>
                    <input type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)}
                      placeholder="(208) 555-0000" required
                      className="w-full px-4 py-3 rounded-xl text-sm"
                      style={{ background: '#F5F2EB', border: '1px solid #EDE9DF' }} />
                  </div>
                </div>
                <div>
                  <label>Email <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional — for confirmation)</span></label>
                  <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)}
                    placeholder="jane@email.com"
                    className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{ background: '#F5F2EB', border: '1px solid #EDE9DF' }} />
                </div>
              </div>
            </div>

            {/* Dog Info */}
            <div className="rounded-2xl p-5" style={{ background: '#FDFBF7', border: '1px solid #EDE9DF' }}>
              <h2 className="font-semibold mb-4" style={{ color: '#1A3329' }}>Dog Info</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>Dog&apos;s Name *</label>
                  <input type="text" value={dogName} onChange={e => setDogName(e.target.value)}
                    placeholder="Buddy" required
                    className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{ background: '#F5F2EB', border: '1px solid #EDE9DF' }} />
                </div>
                <div>
                  <label>Breed</label>
                  <input type="text" value={dogBreed} onChange={e => setDogBreed(e.target.value)}
                    placeholder="Golden Retriever"
                    className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{ background: '#F5F2EB', border: '1px solid #EDE9DF' }} />
                </div>
              </div>
            </div>

            {/* Payment Method — only shows if groomer accepts both */}
            {profile?.payment_methods?.includes('in_person') && profile?.payment_methods?.includes('online') && (
              <div className="rounded-2xl p-5" style={{ background: '#FDFBF7', border: '1px solid #EDE9DF' }}>
                <h2 className="font-semibold mb-4" style={{ color: '#1A3329' }}>How would you like to pay?</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'in_person', label: '💵 Pay in Person', desc: 'Cash or Card at appointment' },
                    { id: 'online', label: '💳 Pay Online', desc: 'Pay securely before appointment' },
                  ].map(opt => (
                    <button key={opt.id} type="button"
                      onClick={() => setPaymentMethod(opt.id)}
                      className="p-4 rounded-xl text-left transition-all"
                      style={{
                        border: paymentMethod === opt.id ? '2px solid #1A3329' : '2px solid #EDE9DF',
                        background: paymentMethod === opt.id ? '#D8F3DC' : '#F5F2EB',
                      }}>
                      <div className="font-semibold text-sm mb-0.5" style={{ color: '#1A3329' }}>{opt.label}</div>
                      <div className="text-xs" style={{ color: '#6B7280' }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="rounded-2xl p-5" style={{ background: '#FDFBF7', border: '1px solid #EDE9DF' }}>
              <h2 className="font-semibold mb-4" style={{ color: '#1A3329' }}>Additional Notes <span className="font-normal text-sm" style={{ color: '#9CA3AF' }}>(optional)</span></h2>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                placeholder="Allergies, special instructions, temperament notes..."
                className="w-full px-4 py-3 rounded-xl text-sm resize-none"
                style={{ background: '#F5F2EB', border: '1px solid #EDE9DF' }} />
            </div>

            {/* Summary */}
            {selectedService && date && time && (
              <div className="rounded-2xl p-5" style={{ background: '#D8F3DC', border: '1px solid #B7E4C7' }}>
                <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide" style={{ color: '#1A5C36' }}>Booking Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#2D6A4F' }}>Service</span>
                    <span className="font-semibold" style={{ color: '#1A3329' }}>{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#2D6A4F' }}>Date</span>
                    <span className="font-semibold" style={{ color: '#1A3329' }}>{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#2D6A4F' }}>Time</span>
                    <span className="font-semibold" style={{ color: '#1A3329' }}>{(() => { const [h, m] = time.split(':'); const hour = parseInt(h); return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}` })()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#2D6A4F' }}>Payment</span>
                    <span className="font-semibold" style={{ color: '#1A3329' }}>{paymentMethod === 'online' ? '💳 Pay Online' : '💵 Pay in Person'}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2" style={{ borderTop: '1px solid #B7E4C7' }}>
                    <span className="font-semibold" style={{ color: '#2D6A4F' }}>Total</span>
                    <span className="font-bold text-base" style={{ color: '#1A3329' }}>${selectedService.price}</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm" style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="submit-btn w-full py-4 rounded-xl font-semibold text-sm">
              {loading ? 'Sending request...' : `Request Appointment${selectedService ? ` — $${selectedService.price}` : ''}`}
            </button>

            <p className="text-center text-xs" style={{ color: '#9CA3AF' }}>
              Your request will be confirmed by {profile.business_name}. You'll receive an SMS reminder before your appointment.
            </p>

          </form>
        </div>
      </div>
    </>
  )
}