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

function NewAppointmentForm() {
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
  const serviceInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: servicesData } = await supabase
        .from('services').select('*').eq('profile_id', user.id)
      setServices(servicesData || [])

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
    const existing = services.find(s => s.name.toLowerCase() === serviceName.toLowerCase())
    if (existing) {
      serviceId = existing.id
    } else if (serviceName) {
      const { data: newService } = await supabase.from('services').insert({
        profile_id: user.id,
        name: serviceName,
        price: parseFloat(servicePrice) || 0,
        duration_minutes: 60,
      }).select().single()
      if (newService) serviceId = newService.id
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
      const { error } = await supabase
        .from('appointments')
        .update(apptData)
        .eq('id', editId)
      if (error) { setError(error.message); setLoading(false); return }
    } else {
      const { error } = await supabase
        .from('appointments')
        .insert({ ...apptData, profile_id: user.id })
      if (error) { setError(error.message); setLoading(false); return }
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => router.push('/dashboard')}
          className="text-gray-400 hover:text-gray-600 transition text-sm">
          ← Back
        </button>
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 100 100" fill="#2D6A4F">
            <ellipse cx="50" cy="70" rx="26" ry="20"/>
            <ellipse cx="20" cy="44" rx="12" ry="15"/>
            <ellipse cx="38" cy="33" rx="12" ry="15"/>
            <ellipse cx="62" cy="33" rx="12" ry="15"/>
            <ellipse cx="80" cy="44" rx="12" ry="15"/>
          </svg>
          <span className="font-bold text-[#1A3329]">{editId ? 'Edit Appointment' : 'New Appointment'}</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Client Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-[#1A3329] mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#D8F3DC] text-[#2D6A4F] rounded-full text-xs flex items-center justify-center font-bold">1</span>
              Client Info
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                <input type="text" value={clientName} onChange={e => setClientName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2D6A4F] text-gray-900"
                  placeholder="Jane Smith" required />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2D6A4F] text-gray-900"
                  placeholder="(208) 555-0000" required />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2D6A4F] text-gray-900"
                  placeholder="jane@email.com" />
              </div>
            </div>
          </div>

          {/* Dog Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-[#1A3329] mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#D8F3DC] text-[#2D6A4F] rounded-full text-xs flex items-center justify-center font-bold">2</span>
              Dog Info
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dog&apos;s Name *</label>
                <input type="text" value={dogName} onChange={e => setDogName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2D6A4F] text-gray-900"
                  placeholder="Buddy" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                <input type="text" value={dogBreed} onChange={e => setDogBreed(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2D6A4F] text-gray-900"
                  placeholder="Golden Retriever" />
              </div>
            </div>
          </div>

          {/* Service & Time */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-[#1A3329] mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#D8F3DC] text-[#2D6A4F] rounded-full text-xs flex items-center justify-center font-bold">3</span>
              Service & Time
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                  <input
                    ref={serviceInputRef}
                    type="text"
                    value={serviceName}
                    onChange={e => { setServiceName(e.target.value); setShowDropdown(true) }}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2D6A4F] text-gray-900"
                    placeholder="Full Groom, Bath..."
                  />
                  {showDropdown && filteredServices.length > 0 && (
                    <div ref={dropdownRef}
                      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                      {filteredServices.map(s => (
                        <button key={s.id} type="button"
                          onClick={() => selectService(s)}
                          className="w-full px-4 py-3 text-left hover:bg-[#F4F1EA] transition flex items-center justify-between">
                          <span className="text-sm font-medium text-[#1A3329]">{s.name}</span>
                          <span className="text-xs text-[#2D6A4F] font-semibold">${s.price}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input type="number" value={servicePrice} onChange={e => setServicePrice(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2D6A4F] text-gray-900"
                    placeholder="65" min="0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2D6A4F] text-gray-900"
                    required min={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                  <input type="time" value={time} onChange={e => setTime(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2D6A4F] text-gray-900"
                    required />
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-[#1A3329] mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#D8F3DC] text-[#2D6A4F] rounded-full text-xs flex items-center justify-center font-bold">4</span>
              Notes <span className="text-gray-400 font-normal text-sm">(optional)</span>
            </h2>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2D6A4F] text-gray-900 resize-none"
              placeholder="Allergies, special instructions, temperament notes..." />
          </div>

          {error && <p className="text-red-500 text-sm px-1">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-[#2D6A4F] text-white rounded-xl py-4 font-semibold text-base hover:bg-[#1A3329] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 disabled:opacity-50 shadow-md hover:shadow-lg">
            {loading ? 'Saving...' : editId ? 'Update Appointment 🐾' : 'Save Appointment 🐾'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function NewAppointmentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F1EA] flex items-center justify-center"><div className="text-[#2D6A4F] font-semibold">Loading...</div></div>}>
      <NewAppointmentForm />
    </Suspense>
  )
}