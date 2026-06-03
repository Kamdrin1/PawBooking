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

  function addService() {
    setServices([...services, { name: '', price: '', duration: '60' }])
  }

  function updateService(index: number, field: string, value: string) {
    const updated = [...services]
    updated[index] = { ...updated[index], [field]: value }
    setServices(updated)
  }

  function removeService(index: number) {
    setServices(services.filter((_, i) => i !== index))
  }

  function togglePayment(method: string) {
    setPaymentMethods(prev =>
      prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
    )
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
      } catch {
        console.error('Failed to recover user from Stripe session')
      }
    }
  }

  if (!userId) {
    router.push('/login')
    return
  }

  const validServices = services
    .filter(s => s.name.trim() && s.price)
    .map(s => ({ name: s.name.trim(), price: s.price, duration: s.duration }))

  const res = await fetch('/api/save-onboarding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      phone: toE164(phone),
      serviceArea,
      availability: { days: availability, startTime, endTime },
      paymentMethods,
      services: validServices,
    }),
  })

  if (!res.ok) {
    console.error('Failed to save onboarding data')
  }

  router.push('/dashboard')
}

  return (
    <div className="min-h-screen bg-[#1A3329] flex items-center justify-center p-4 relative overflow-hidden">

      {/* Paw prints */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
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

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 relative z-10">

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1,2,3,4].map(n => (
            <div key={n} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= n ? 'bg-[#2D6A4F] text-white' : 'bg-gray-100 text-gray-400'}`}>{n}</div>
              {n < 4 && <div className={`flex-1 h-1 rounded transition-all ${step > n ? 'bg-[#2D6A4F]' : 'bg-gray-100'}`}/>}
            </div>
          ))}
        </div>

        {/* Step 1 - Business Info */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-[#1A3329] mb-1">Your business info</h2>
            <p className="text-gray-500 text-sm mb-6">Just the basics to get you set up.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" value={phone} onChange={e => setPhone(formatPhone(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2D6A4F]"
                  placeholder="(208) 555-0000" />
                <p className="text-xs text-gray-400 mt-1">Enter your 10-digit US number — we'll format it automatically.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Area</label>
                <input type="text" value={serviceArea} onChange={e => setServiceArea(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2D6A4F]"
                  placeholder="Hayden, ID & surrounding areas" />
              </div>
            </div>
            <button onClick={() => setStep(2)}
              className="w-full mt-6 bg-[#2D6A4F] text-white rounded-xl py-3 font-semibold hover:bg-[#1A3329] transition">
              Continue →
            </button>
          </div>
        )}

        {/* Step 2 - Services */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-[#1A3329] mb-1">Your services</h2>
            <p className="text-gray-500 text-sm mb-6">Add the services you offer and what you charge.</p>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {services.map((service, i) => (
                <div key={i} className="flex gap-2 items-start bg-gray-50 rounded-xl p-3">
                  <div className="flex-1 space-y-2">
                    <input type="text" placeholder="Service name (e.g. Full Groom)"
                      value={service.name} onChange={e => updateService(i, 'name', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2D6A4F]" />
                    <div className="flex gap-2">
                      <input type="number" placeholder="Price $"
                        value={service.price} onChange={e => updateService(i, 'price', e.target.value)}
                        className="w-1/2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2D6A4F]" />
                      <select value={service.duration} onChange={e => updateService(i, 'duration', e.target.value)}
                        className="w-1/2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2D6A4F]">
                        <option value="30">30 min</option>
                        <option value="45">45 min</option>
                        <option value="60">1 hour</option>
                        <option value="90">1.5 hours</option>
                        <option value="120">2 hours</option>
                      </select>
                    </div>
                  </div>
                  {services.length > 1 && (
                    <button onClick={() => removeService(i)} className="text-gray-300 hover:text-red-400 mt-1 text-lg">✕</button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addService}
              className="w-full mt-3 border-2 border-dashed border-gray-200 rounded-xl py-2 text-sm text-gray-400 hover:border-[#2D6A4F] hover:text-[#2D6A4F] transition">
              + Add another service
            </button>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)}
                className="flex-1 border border-gray-200 text-gray-500 rounded-xl py-3 font-semibold hover:bg-gray-50 transition">
                ← Back
              </button>
              <button onClick={() => setStep(3)}
                className="flex-1 bg-[#2D6A4F] text-white rounded-xl py-3 font-semibold hover:bg-[#1A3329] transition">
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 - Availability */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-[#1A3329] mb-1">Your availability</h2>
            <p className="text-gray-500 text-sm mb-6">When are you available for appointments?</p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {DAYS.map(day => (
                <button key={day} onClick={() => setAvailability(prev => ({ ...prev, [day]: !prev[day as keyof typeof prev] }))}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border-2 transition ${availability[day as keyof typeof availability] ? 'border-[#2D6A4F] bg-[#D8F3DC] text-[#1A3329]' : 'border-gray-200 text-gray-400'}`}>
                  {day}
                </button>
              ))}
            </div>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2D6A4F]" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2D6A4F]" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)}
                className="flex-1 border border-gray-200 text-gray-500 rounded-xl py-3 font-semibold hover:bg-gray-50 transition">
                ← Back
              </button>
              <button onClick={() => setStep(4)}
                className="flex-1 bg-[#2D6A4F] text-white rounded-xl py-3 font-semibold hover:bg-[#1A3329] transition">
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 4 - Payment Methods */}
        {step === 4 && (
          <div>
            <h2 className="text-2xl font-bold text-[#1A3329] mb-1">How do you accept payment?</h2>
            <p className="text-gray-500 text-sm mb-6">Select all that apply — you can change this anytime.</p>

            <div className="space-y-3 mb-6">
              {[
                { id: 'in_person', label: 'Pay in Person', desc: 'Cash or Card — client pays at the appointment', icon: '💵' },
                { id: 'online', label: 'Pay Online', desc: 'Client pays before the appointment online', icon: '💳' },
              ].map(method => (
                <button key={method.id}
                  onClick={() => togglePayment(method.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all"
                  style={{
                    border: paymentMethods.includes(method.id) ? '2px solid #2D6A4F' : '2px solid #E5E7EB',
                    background: paymentMethods.includes(method.id) ? '#D8F3DC' : '#F9FAFB',
                  }}>
                  <div className="text-3xl">{method.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-[#1A3329]">{method.label}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{method.desc}</div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethods.includes(method.id) ? 'border-[#2D6A4F] bg-[#2D6A4F]' : 'border-gray-300'}`}>
                    {paymentMethods.includes(method.id) && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              ))}
            </div>

            {paymentMethods.length === 0 && (
              <p className="text-xs text-red-400 mb-4">Please select at least one payment method.</p>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(3)}
                className="flex-1 border border-gray-200 text-gray-500 rounded-xl py-3 font-semibold hover:bg-gray-50 transition">
                ← Back
              </button>
              <button onClick={handleFinish} disabled={loading || paymentMethods.length === 0}
                className="flex-1 bg-[#2D6A4F] text-white rounded-xl py-3 font-semibold hover:bg-[#1A3329] transition disabled:opacity-50">
                {loading ? 'Setting up...' : 'Finish Setup 🐾'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}