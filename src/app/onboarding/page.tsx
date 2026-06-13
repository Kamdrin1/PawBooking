'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

const pawPositions = [
  { top: '2%',  left: '1%',  rotate: '-25deg', size: 110, opacity: 0.18 },
  { top: '8%',  left: '75%', rotate: '40deg',  size: 75,  opacity: 0.14 },
  { top: '3%',  left: '40%', rotate: '-10deg', size: 55,  opacity: 0.12 },
  { top: '18%', left: '88%', rotate: '20deg',  size: 130, opacity: 0.16 },
  { top: '22%', left: '5%',  rotate: '35deg',  size: 90,  opacity: 0.15 },
  { top: '30%', left: '55%', rotate: '-40deg', size: 65,  opacity: 0.11 },
  { top: '38%', left: '20%', rotate: '15deg',  size: 45,  opacity: 0.13 },
  { top: '42%', left: '82%', rotate: '-20deg', size: 100, opacity: 0.17 },
  { top: '52%', left: '3%',  rotate: '50deg',  size: 80,  opacity: 0.14 },
  { top: '58%', left: '65%', rotate: '-35deg', size: 55,  opacity: 0.12 },
  { top: '63%', left: '35%', rotate: '25deg',  size: 120, opacity: 0.15 },
  { top: '68%', left: '90%', rotate: '-15deg', size: 70,  opacity: 0.16 },
  { top: '72%', left: '12%', rotate: '45deg',  size: 50,  opacity: 0.13 },
  { top: '78%', left: '50%', rotate: '-30deg', size: 95,  opacity: 0.14 },
  { top: '82%', left: '78%', rotate: '10deg',  size: 60,  opacity: 0.12 },
  { top: '88%', left: '25%', rotate: '-45deg', size: 85,  opacity: 0.16 },
  { top: '92%', left: '60%', rotate: '30deg',  size: 45,  opacity: 0.13 },
  { top: '95%', left: '5%',  rotate: '-20deg', size: 115, opacity: 0.15 },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [serviceArea, setServiceArea] = useState('')
  const [services, setServices] = useState([{ name: '', price: '', duration: '60' }])
  const [availability, setAvailability] = useState({ Monday: true, Tuesday: true, Wednesday: true, Thursday: true, Friday: true, Saturday: false, Sunday: false })
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [paymentMethods, setPaymentMethods] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 10)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `(${digits.slice(0,3)}) ${digits.slice(3)}`
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`
  }

  function toE164(value: string) {
    const digits = value.replace(/\D/g, '')
    return digits.length === 10 ? `+1${digits}` : digits.length === 11 ? `+${digits}` : value
  }

  function addService() { setServices([...services, { name: '', price: '', duration: '60' }]) }

  function updateService(index: number, field: string, value: string) {
    const updated = [...services]
    updated[index] = { ...updated[index], [field]: value }
    setServices(updated)
  }

  function removeService(index: number) { setServices(services.filter((_, i) => i !== index)) }

  function togglePayment(method: string) {
    setPaymentMethods(prev => prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method])
  }

  async function handleFinish() {
    setLoading(true)
    let userId: string | null = null
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      userId = user.id
    } else {
      const params = new URLSearchParams(window.location.search)
      const sessionId = params.get('session_id')
      if (sessionId) {
        try {
          const res = await fetch(`/api/get-session-user?session_id=${sessionId}`)
          const data = await res.json()
          if (data.userId) userId = data.userId
        } catch { console.error('Failed to recover user from Stripe session') }
      }
    }
    if (!userId) { router.push('/login'); return }

    const validServices = services
      .filter(s => s.name.trim() && s.price)
      .map(s => ({ name: s.name.trim(), price: s.price, duration: s.duration }))

    const res = await fetch('/api/save-onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, phone: toE164(phone), serviceArea, availability: { days: availability, startTime, endTime }, paymentMethods, services: validServices }),
    })
    if (!res.ok) console.error('Failed to save onboarding data')
    router.push('/dashboard')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'DM Sans', sans-serif; }
        body { background: #1A3329; }

        .onboard-root {
          min-height: 100dvh;
          background: #1A3329;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 24px 16px 40px;
          position: relative;
          overflow: hidden;
        }

        .onboard-card {
          background: white;
          border-radius: 24px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.3);
          width: 100%;
          max-width: 520px;
          padding: 32px 28px;
          position: relative;
          z-index: 10;
        }

        .input-field {
          width: 100%;
          border: 1.5px solid #E5E7EB;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 15px;
          color: #111827;
          background: white;
          transition: border-color 0.15s;
          -webkit-appearance: none;
        }
        .input-field:focus { outline: none; border-color: #2D6A4F; box-shadow: 0 0 0 3px rgba(45,106,79,0.1); }
        .input-field::placeholder { color: #9CA3AF; }

        .btn-primary {
          flex: 1;
          background: linear-gradient(135deg, #1A3329, #2D6A4F);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 13px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          -webkit-appearance: none;
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(26,51,41,0.3); }
        .btn-primary:disabled { opacity: 0.5; transform: none; cursor: not-allowed; }

        .btn-back {
          flex: 1;
          background: none;
          border: 1.5px solid #E5E7EB;
          border-radius: 12px;
          padding: 13px;
          font-size: 15px;
          font-weight: 600;
          color: #6B7280;
          cursor: pointer;
          transition: all 0.15s;
          -webkit-appearance: none;
        }
        .btn-back:hover { background: #F9FAFB; }

        .progress-dot {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .progress-line {
          flex: 1;
          height: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .day-btn {
          padding: 10px 8px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          border: 2px solid;
          cursor: pointer;
          transition: all 0.15s;
          background: none;
          -webkit-appearance: none;
        }

        .service-row {
          background: #F9FAFB;
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 10px;
        }

        .service-input {
          width: 100%;
          border: 1.5px solid #E5E7EB;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
          color: #111827;
          background: white;
          margin-bottom: 8px;
          -webkit-appearance: none;
        }
        .service-input:focus { outline: none; border-color: #2D6A4F; }
        .service-input::placeholder { color: #9CA3AF; }

        .add-service-btn {
          width: 100%;
          border: 2px dashed #E5E7EB;
          border-radius: 12px;
          padding: 10px;
          font-size: 14px;
          color: #9CA3AF;
          background: none;
          cursor: pointer;
          transition: all 0.15s;
          margin-top: 4px;
        }
        .add-service-btn:hover { border-color: #2D6A4F; color: #2D6A4F; }

        .payment-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px;
          border-radius: 14px;
          border: 2px solid;
          text-align: left;
          cursor: pointer;
          transition: all 0.15s;
          background: none;
          margin-bottom: 10px;
          -webkit-appearance: none;
        }

        @media (max-width: 480px) {
          .onboard-root { padding: 16px 12px 32px; }
          .onboard-card { padding: 24px 18px; border-radius: 20px; }
          .onboard-h2 { font-size: 20px !important; }
          .day-btn { font-size: 11px !important; padding: 8px 4px !important; }
          .progress-dot { width: 28px; height: 28px; font-size: 12px; }
        }
      `}</style>

      <div className="onboard-root">
        {/* Paw background */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', userSelect: 'none' }} aria-hidden="true">
          {pawPositions.map((paw, i) => (
            <svg key={i} width={paw.size} height={paw.size} viewBox="0 0 100 100"
              style={{ position: 'absolute', top: paw.top, left: paw.left, transform: `rotate(${paw.rotate})`, opacity: paw.opacity }}
              fill="#000000">
              <ellipse cx="50" cy="70" rx="26" ry="20"/>
              <ellipse cx="20" cy="44" rx="12" ry="15"/>
              <ellipse cx="38" cy="33" rx="12" ry="15"/>
              <ellipse cx="62" cy="33" rx="12" ry="15"/>
              <ellipse cx="80" cy="44" rx="12" ry="15"/>
            </svg>
          ))}
        </div>

        <div className="onboard-card">

          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
            {[1,2,3,4].map(n => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: n < 4 ? 1 : 'none' }}>
                <div className="progress-dot" style={{ background: step >= n ? '#2D6A4F' : '#F3F4F6', color: step >= n ? 'white' : '#9CA3AF' }}>{n}</div>
                {n < 4 && <div className="progress-line" style={{ background: step > n ? '#2D6A4F' : '#F3F4F6' }} />}
              </div>
            ))}
          </div>

          {/* STEP 1 — Business Info */}
          {step === 1 && (
            <div>
              <h2 className="onboard-h2" style={{ fontSize: '22px', fontWeight: 700, color: '#1A3329', marginBottom: '4px' }}>Your business info</h2>
              <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '24px' }}>Just the basics to get you set up.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Phone Number</label>
                  <input type="tel" value={phone} onChange={e => setPhone(formatPhone(e.target.value))}
                    className="input-field" placeholder="(208) 555-0000" inputMode="tel" autoComplete="tel" />
                  <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>Enter your 10-digit US number — we'll format it automatically.</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Service Area</label>
                  <input type="text" value={serviceArea} onChange={e => setServiceArea(e.target.value)}
                    className="input-field" placeholder="Hayden, ID & surrounding areas" />
                </div>
              </div>
              <button onClick={() => setStep(2)} className="btn-primary" style={{ width: '100%', marginTop: '24px' }}>Continue →</button>
            </div>
          )}

          {/* STEP 2 — Services */}
          {step === 2 && (
            <div>
              <h2 className="onboard-h2" style={{ fontSize: '22px', fontWeight: 700, color: '#1A3329', marginBottom: '4px' }}>Your services</h2>
              <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '20px' }}>Add the services you offer and what you charge.</p>
              <div style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: '2px' }}>
                {services.map((service, i) => (
                  <div key={i} className="service-row">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <input type="text" placeholder="Service name (e.g. Full Groom)"
                          value={service.name} onChange={e => updateService(i, 'name', e.target.value)}
                          className="service-input" />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <input type="number" placeholder="Price $"
                            value={service.price} onChange={e => updateService(i, 'price', e.target.value)}
                            className="service-input" style={{ marginBottom: 0 }} />
                          <select value={service.duration} onChange={e => updateService(i, 'duration', e.target.value)}
                            className="service-input" style={{ marginBottom: 0 }}>
                            <option value="30">30 min</option>
                            <option value="45">45 min</option>
                            <option value="60">1 hour</option>
                            <option value="90">1.5 hours</option>
                            <option value="120">2 hours</option>
                          </select>
                        </div>
                      </div>
                      {services.length > 1 && (
                        <button onClick={() => removeService(i)} style={{ background: 'none', border: 'none', color: '#D1D5DB', cursor: 'pointer', fontSize: '18px', padding: '2px', marginTop: '2px' }}>✕</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={addService} className="add-service-btn">+ Add another service</button>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button onClick={() => setStep(1)} className="btn-back">← Back</button>
                <button onClick={() => setStep(3)} className="btn-primary">Continue →</button>
              </div>
            </div>
          )}

          {/* STEP 3 — Availability */}
          {step === 3 && (
            <div>
              <h2 className="onboard-h2" style={{ fontSize: '22px', fontWeight: 700, color: '#1A3329', marginBottom: '4px' }}>Your availability</h2>
              <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '20px' }}>When are you available for appointments?</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '20px' }}>
                {DAYS.map(day => (
                  <button key={day} onClick={() => setAvailability(prev => ({ ...prev, [day]: !prev[day as keyof typeof prev] }))}
                    className="day-btn"
                    style={{ borderColor: availability[day as keyof typeof availability] ? '#2D6A4F' : '#E5E7EB', background: availability[day as keyof typeof availability] ? '#D8F3DC' : 'transparent', color: availability[day as keyof typeof availability] ? '#1A3329' : '#9CA3AF' }}>
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Start Time</label>
                  <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>End Time</label>
                  <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="input-field" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(2)} className="btn-back">← Back</button>
                <button onClick={() => setStep(4)} className="btn-primary">Continue →</button>
              </div>
            </div>
          )}

          {/* STEP 4 — Payment */}
          {step === 4 && (
            <div>
              <h2 className="onboard-h2" style={{ fontSize: '22px', fontWeight: 700, color: '#1A3329', marginBottom: '4px' }}>How do you accept payment?</h2>
              <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '20px' }}>Select all that apply — you can change this anytime.</p>
              <div style={{ marginBottom: '8px' }}>
                {[
                  { id: 'in_person', label: 'Pay in Person', desc: 'Cash or Card — client pays at the appointment', icon: '💵' },
                  { id: 'online', label: 'Pay Online', desc: 'Client pays before the appointment online', icon: '💳' },
                ].map(method => (
                  <button key={method.id} onClick={() => togglePayment(method.id)} className="payment-btn"
                    style={{ borderColor: paymentMethods.includes(method.id) ? '#2D6A4F' : '#E5E7EB', background: paymentMethods.includes(method.id) ? '#D8F3DC' : '#F9FAFB' }}>
                    <span style={{ fontSize: '28px', flexShrink: 0 }}>{method.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '15px', color: '#1A3329' }}>{method.label}</div>
                      <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>{method.desc}</div>
                    </div>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${paymentMethods.includes(method.id) ? '#2D6A4F' : '#D1D5DB'}`, background: paymentMethods.includes(method.id) ? '#2D6A4F' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {paymentMethods.includes(method.id) && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                    </div>
                  </button>
                ))}
              </div>
              {paymentMethods.length === 0 && (
                <p style={{ fontSize: '12px', color: '#EF4444', marginBottom: '12px' }}>Please select at least one payment method.</p>
              )}
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button onClick={() => setStep(3)} className="btn-back">← Back</button>
                <button onClick={handleFinish} disabled={loading || paymentMethods.length === 0} className="btn-primary">
                  {loading ? 'Setting up...' : 'Finish Setup 🐾'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
