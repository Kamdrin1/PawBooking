'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

interface Service {
  id: string
  name: string
  price: number
  duration_minutes: number
}

function AppointmentForm() {
  const [services, setServices] = useState<Service[]>([])
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [dogName, setDogName] = useState('')
  const [dogBreed, setDogBreed] = useState('')
  const [serviceName, setServiceName] = useState('')
  const [servicePrice, setServicePrice] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [limitReached, setLimitReached] = useState(false)
  const serviceInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: servicesData } = await supabase.from('services').select('*').eq('profile_id', user.id)
      setServices(servicesData || [])

      const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()

      const id = searchParams.get('edit')
      if (id) {
        setEditId(id)
        const { data: appt } = await supabase
          .from('appointments')
          .select('*, services(name, price)')
          .eq('id', id)
          .single()
        if (appt) {
          setClientName(appt.client_name || '')
          setClientPhone(appt.client_phone || '')
          setClientEmail(appt.client_email || '')
          setDogName(appt.dog_name || '')
          setDogBreed(appt.dog_breed || '')
          setServiceName(appt.services?.name || '')
          setServicePrice(appt.services?.price?.toString() || '')
          setDate(appt.appointment_date || '')
          setTime(appt.appointment_time || '')
          setNotes(appt.notes || '')
        }
      } else {
        // Only check limit for new appointments on Basic plan
        if (profile?.plan === 'basic') {
          const monthStart = new Date()
          monthStart.setDate(1)
          const monthStartStr = monthStart.toISOString().split('T')[0]
          const { count } = await supabase
            .from('appointments')
            .select('id', { count: 'exact', head: true })
            .eq('profile_id', user.id)
            .gte('appointment_date', monthStartStr)
          if ((count || 0) >= 30) setLimitReached(true)
        }
      }
    }
    load()
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        serviceInputRef.current && !serviceInputRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(serviceName.toLowerCase())
  )

  function selectService(service: Service) {
    setServiceName(service.name)
    setServicePrice(service.price.toString())
    setShowDropdown(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let serviceId = null
    const existing = services.find(s => s.name.toLowerCase().trim() === serviceName.toLowerCase().trim())
    if (existing) {
      if (parseFloat(servicePrice) !== existing.price) {
        await supabase.from('services').update({ price: parseFloat(servicePrice) || 0 }).eq('id', existing.id)
      }
      serviceId = existing.id
    } else if (serviceName.trim()) {
      const { data: doubleCheck } = await supabase
        .from('services')
        .select('id')
        .eq('profile_id', user.id)
        .ilike('name', serviceName.trim())
        .single()
      if (doubleCheck) {
        serviceId = doubleCheck.id
      } else {
        const { data: newService } = await supabase.from('services').insert({
          profile_id: user.id,
          name: serviceName.trim(),
          price: parseFloat(servicePrice) || 0,
          duration_minutes: 60,
        }).select().single()
        if (newService) serviceId = newService.id
      }
    }

    const apptData = {
      client_name: clientName,
      client_phone: clientPhone,
      client_email: clientEmail,
      dog_name: dogName,
      dog_breed: dogBreed,
      service_id: serviceId,
      appointment_date: date,
      appointment_time: time,
      notes,
      status: 'confirmed',
    }

    if (editId) {
      const { error } = await supabase.from('appointments').update(apptData).eq('id', editId)
      if (error) { setError(error.message); setLoading(false); return }
    } else {
      const { error } = await supabase.from('appointments').insert({ ...apptData, profile_id: user.id })
      if (error) { setError(error.message); setLoading(false); return }
    }
    router.push('/dashboard')
  }

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm font-medium transition-all outline-none"
  const inputStyle = { background: '#F5F2EB', border: '1px solid #EDE9DF', color: '#1A3329' }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .playfair { font-family: 'Playfair Display', serif; }
        input, textarea, select { color: #1A3329 !important; color-scheme: light; }
        input::placeholder, textarea::placeholder { color: #9CA3AF !important; }
        input:focus, textarea:focus { border-color: #2D6A4F !important; box-shadow: 0 0 0 3px rgba(45,106,79,0.08); }
        .form-card { background: #FDFBF7; border: 1px solid #EDE9DF; border-radius: 20px; }
        .step-num { width: 24px; height: 24px; border-radius: 50%; background: #1A3329; color: white; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .submit-btn { background: #1A3329; color: white; transition: all 0.2s ease; }
        .submit-btn:hover { background: #2D6A4F; transform: translateY(-1px); box-shadow: 0 8px 25px rgba(26,51,41,0.2); }
        .submit-btn:disabled { opacity: 0.5; transform: none; box-shadow: none; }
        .back-btn { transition: all 0.15s ease; color: #9CA3AF; }
        .back-btn:hover { color: #1A3329; }
        .dropdown-item { transition: background 0.1s ease; }
        .dropdown-item:hover { background: #F5F2EB; }
        label { color: #6B7280; font-size: 13px; font-weight: 500; display: block; margin-bottom: 6px; }
      `}</style>

      <div className="min-h-screen" style={{ background: '#F5F2EB' }}>

        <nav style={{ background: '#FDFBF7', borderBottom: '1px solid #EDE9DF' }}
          className="sticky top-0 z-10 px-6 py-4 flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="back-btn flex items-center gap-1.5 text-sm font-medium">
            ← Back
          </button>
          <div style={{ width: '1px', height: '20px', background: '#EDE9DF' }} />
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#1A3329' }}>
              <svg width="14" height="14" viewBox="0 0 100 100" fill="#D8F3DC">
                <ellipse cx="50" cy="70" rx="26" ry="20"/>
                <ellipse cx="20" cy="44" rx="12" ry="15"/>
                <ellipse cx="38" cy="33" rx="12" ry="15"/>
                <ellipse cx="62" cy="33" rx="12" ry="15"/>
                <ellipse cx="80" cy="44" rx="12" ry="15"/>
              </svg>
            </div>
            <span className="font-semibold text-sm playfair" style={{ color: '#1A3329', fontFamily: 'Playfair Display, serif' }}>
              {editId ? 'Edit Appointment' : 'New Appointment'}
            </span>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-6 py-8">

          {limitReached ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🐾</div>
              <h2 className="playfair text-2xl font-semibold mb-2" style={{ color: '#1A3329', fontFamily: 'Playfair Display, serif' }}>
                Monthly limit reached
              </h2>
              <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: '#6B7280' }}>
                You've used all 30 appointments included in your Basic plan this month. Upgrade to Pro for unlimited appointments.
              </p>
              <button onClick={() => router.push('/dashboard')}
                className="submit-btn px-8 py-3 rounded-xl font-semibold text-sm mr-3">
                Back to Dashboard
              </button>
              <button onClick={() => router.push('/pricing')}
                className="px-8 py-3 rounded-xl font-semibold text-sm"
                style={{ background: '#D8F3DC', color: '#1A3329' }}>
                Upgrade to Pro ⭐
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="playfair text-3xl font-semibold mb-1" style={{ color: '#1A3329', fontFamily: 'Playfair Display, serif' }}>
                  {editId ? 'Edit Appointment' : 'New Appointment'}
                </h1>
                <p className="text-sm" style={{ color: '#9CA3AF' }}>
                  {editId ? 'Update the details below' : 'Fill in the details to book an appointment'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                <div className="form-card p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="step-num">1</div>
                    <h2 className="font-semibold" style={{ color: '#1A3329' }}>Client Info</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label>Client Name *</label>
                      <input type="text" value={clientName} onChange={e => setClientName(e.target.value)}
                        className={inputClass} style={inputStyle} placeholder="Jane Smith" required />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label>Phone Number *</label>
                      <input type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)}
                        className={inputClass} style={inputStyle} placeholder="(208) 555-0000" required />
                    </div>
                    <div className="col-span-2">
                      <label>Email <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span></label>
                      <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)}
                        className={inputClass} style={inputStyle} placeholder="jane@email.com" />
                    </div>
                  </div>
                </div>

                <div className="form-card p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="step-num">2</div>
                    <h2 className="font-semibold" style={{ color: '#1A3329' }}>Dog Info</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label>Dog&apos;s Name *</label>
                      <input type="text" value={dogName} onChange={e => setDogName(e.target.value)}
                        className={inputClass} style={inputStyle} placeholder="Buddy" required />
                    </div>
                    <div>
                      <label>Breed</label>
                      <input type="text" value={dogBreed} onChange={e => setDogBreed(e.target.value)}
                        className={inputClass} style={inputStyle} placeholder="Golden Retriever" />
                    </div>
                  </div>
                </div>

                <div className="form-card p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="step-num">3</div>
                    <h2 className="font-semibold" style={{ color: '#1A3329' }}>Service & Time</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <label>Service</label>
                        <input
                          ref={serviceInputRef}
                          type="text"
                          value={serviceName}
                          onChange={e => { setServiceName(e.target.value); setShowDropdown(true) }}
                          onFocus={() => setShowDropdown(true)}
                          className={inputClass}
                          style={inputStyle}
                          placeholder="Full Groom, Bath..."
                        />
                        {showDropdown && filteredServices.length > 0 && (
                          <div ref={dropdownRef}
                            className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-20"
                            style={{ background: '#FDFBF7', border: '1px solid #EDE9DF', boxShadow: '0 8px 25px rgba(26,51,41,0.1)' }}>
                            {filteredServices.map(s => (
                              <button key={s.id} type="button" onClick={() => selectService(s)}
                                className="dropdown-item w-full px-4 py-3 text-left flex items-center justify-between"
                                style={{ borderBottom: '1px solid #EDE9DF' }}>
                                <span className="text-sm font-medium" style={{ color: '#1A3329' }}>{s.name}</span>
                                <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: '#D8F3DC', color: '#1A5C36' }}>${s.price}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <label>Price ($)</label>
                        <input type="number" value={servicePrice} onChange={e => setServicePrice(e.target.value)}
                          className={inputClass} style={inputStyle} placeholder="65" min="0" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label>Date *</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)}
                          className={inputClass} style={inputStyle}
                          required min={new Date().toISOString().split('T')[0]} />
                      </div>
                      <div>
                        <label>Time *</label>
                        <input type="time" value={time} onChange={e => setTime(e.target.value)}
                          className={inputClass} style={inputStyle} required />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-card p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="step-num">4</div>
                    <h2 className="font-semibold" style={{ color: '#1A3329' }}>Notes <span className="font-normal text-sm" style={{ color: '#9CA3AF' }}>(optional)</span></h2>
                  </div>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                    className={inputClass} style={{ ...inputStyle, resize: 'none' }}
                    placeholder="Allergies, special instructions, temperament notes..." />
                </div>

                {error && (
                  <div className="px-4 py-3 rounded-xl text-sm font-medium" style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="submit-btn w-full py-4 rounded-xl font-semibold text-sm">
                  {loading ? 'Saving...' : editId ? 'Update Appointment 🐾' : 'Save Appointment 🐾'}
                </button>

              </form>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default function NewAppointmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F2EB' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#2D6A4F', borderTopColor: 'transparent' }} />
      </div>
    }>
      <AppointmentForm />
    </Suspense>
  )
}