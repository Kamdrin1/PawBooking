'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Appointment {
  id: string
  client_name: string
  client_phone: string
  client_email: string
  dog_name: string
  dog_breed: string
  appointment_date: string
  appointment_time: string
  status: string
  notes: string
  services: { name: string; price: number } | null
}

interface Profile {
  business_name: string
  plan: string
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming'>('today')
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profileData } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()
      setProfile(profileData)

      const { data: apptData } = await supabase
        .from('appointments')
        .select('*, services(name, price)')
        .eq('profile_id', user.id)
        .gte('appointment_date', new Date().toISOString().split('T')[0])
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })

      setAppointments(apptData || [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function handleDelete(id: string) {
    await supabase.from('appointments').delete().eq('id', id)
    setAppointments(prev => prev.filter(a => a.id !== id))
    setSelectedAppt(null)
  }

  const today = new Date().toISOString().split('T')[0]
  const todayAppts = appointments.filter(a => a.appointment_date === today)
  const upcomingAppts = appointments.filter(a => a.appointment_date > today)

  const thisMonthAppts = appointments.filter(a => {
    const month = new Date().toISOString().slice(0, 7)
    return a.appointment_date.startsWith(month)
  })

  function formatTime(time: string) {
    const [h, m] = time.split(':')
    const hour = parseInt(h)
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
  }

  function formatDate(date: string) {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F4F1EA] flex items-center justify-center">
      <div className="text-[#2D6A4F] font-semibold">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F4F1EA]">

      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#2D6A4F] rounded-lg flex items-center justify-center text-white text-sm font-bold">P</div>
          <div>
            <div className="font-bold text-[#1A3329] text-sm">{profile?.business_name || 'PawBooking'}</div>
            <div className="text-xs text-[#2D6A4F] font-medium capitalize">{profile?.plan} plan</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/appointments/new')}
            className="bg-[#2D6A4F] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#1A3329] transition">
            + New Appointment
          </button>
          <button onClick={handleSignOut}
            className="text-gray-400 hover:text-gray-600 text-sm transition">
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="text-3xl font-bold text-[#1A3329]">{todayAppts.length}</div>
            <div className="text-sm text-gray-500 mt-1">Today&apos;s appointments</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="text-3xl font-bold text-[#2D6A4F]">{thisMonthAppts.length}</div>
            <div className="text-sm text-gray-500 mt-1">This month</div>
          </div>
          <div className="bg-[#2D6A4F] rounded-2xl p-5 shadow-sm">
            <div className="text-3xl font-bold text-white">
              ${thisMonthAppts.reduce((sum, a) => sum + (a.services?.price || 0), 0).toFixed(0)}
            </div>
            <div className="text-sm text-green-200 mt-1">Est. revenue this month</div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <div className="font-semibold text-[#1A3329] text-sm">Your Booking Link</div>
              <div className="text-xs text-gray-400 mt-1">Share this with clients</div>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/book/${profile?.business_name?.toLowerCase().replace(/\s+/g, '-')}`); alert('Link copied!') }}
              className="bg-[#D8F3DC] text-[#2D6A4F] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#C8F135] hover:text-[#1A3329] transition">
              Copy Link
            </button>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <div className="font-semibold text-[#1A3329] text-sm">SMS Reminders</div>
              <div className="text-xs text-gray-400 mt-1">Auto-sending 24hr before</div>
            </div>
            <div className="bg-[#D8F3DC] text-[#2D6A4F] px-3 py-1 rounded-full text-xs font-bold">Active</div>
          </div>
        </div>

        {/* Appointments */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button onClick={() => setActiveTab('today')}
              className={`flex-1 py-4 text-sm font-semibold transition ${activeTab === 'today' ? 'text-[#2D6A4F] border-b-2 border-[#2D6A4F]' : 'text-gray-400'}`}>
              Today ({todayAppts.length})
            </button>
            <button onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-4 text-sm font-semibold transition ${activeTab === 'upcoming' ? 'text-[#2D6A4F] border-b-2 border-[#2D6A4F]' : 'text-gray-400'}`}>
              Upcoming ({upcomingAppts.length})
            </button>
          </div>

          <div className="divide-y divide-gray-50">
            {(activeTab === 'today' ? todayAppts : upcomingAppts).length === 0 ? (
              <div className="py-16 text-center">
                <div className="text-4xl mb-3">🐾</div>
                <div className="text-gray-400 text-sm">No appointments {activeTab === 'today' ? 'today' : 'coming up'}</div>
                <button onClick={() => router.push('/appointments/new')}
                  className="mt-4 bg-[#2D6A4F] text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-[#1A3329] transition">
                  Add Appointment
                </button>
              </div>
            ) : (
              (activeTab === 'today' ? todayAppts : upcomingAppts).map(appt => (
                <div key={appt.id}
                  onClick={() => setSelectedAppt(appt)}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#D8F3DC] rounded-full flex items-center justify-center text-[#2D6A4F] font-bold text-sm">
                      {appt.client_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-[#1A3329] text-sm">{appt.client_name}</div>
                      <div className="text-xs text-gray-400">{appt.dog_name} · {appt.services?.name || 'Appointment'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-[#1A3329]">{formatTime(appt.appointment_time)}</div>
                    {activeTab === 'upcoming' && <div className="text-xs text-gray-400">{formatDate(appt.appointment_date)}</div>}
                    <div className="text-xs text-[#2D6A4F] font-medium mt-1">${appt.services?.price || 0}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAppt(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl"
            onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#D8F3DC] rounded-full flex items-center justify-center text-[#2D6A4F] font-bold">
                  {selectedAppt.client_name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-[#1A3329]">{selectedAppt.client_name}</div>
                  <div className="text-xs text-gray-400">{formatDate(selectedAppt.appointment_date)} at {formatTime(selectedAppt.appointment_time)}</div>
                </div>
              </div>
              <button onClick={() => setSelectedAppt(null)}
                className="text-gray-400 hover:text-gray-600 transition text-xl font-light">✕</button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">

              {/* Service */}
              <div className="bg-[#F4F1EA] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Service</div>
                  <div className="font-semibold text-[#1A3329]">{selectedAppt.services?.name || 'Appointment'}</div>
                </div>
                <div className="text-xl font-bold text-[#2D6A4F]">${selectedAppt.services?.price || 0}</div>
              </div>

              {/* Dog Info */}
              <div>
                <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-medium">Dog</div>
                <div className="flex gap-2">
                  <span className="bg-[#D8F3DC] text-[#2D6A4F] text-sm font-semibold px-3 py-1 rounded-full">{selectedAppt.dog_name}</span>
                  {selectedAppt.dog_breed && <span className="bg-gray-100 text-gray-500 text-sm px-3 py-1 rounded-full">{selectedAppt.dog_breed}</span>}
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-medium">Contact</div>
                <div className="space-y-2">
                  <a href={`tel:${selectedAppt.client_phone}`}
                    className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 hover:bg-gray-100 transition">
                    <span className="text-lg">📞</span>
                    <span className="text-sm font-medium text-[#1A3329]">{selectedAppt.client_phone}</span>
                  </a>
                  {selectedAppt.client_email && (
                    <a href={`mailto:${selectedAppt.client_email}`}
                      className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 hover:bg-gray-100 transition">
                      <span className="text-lg">✉️</span>
                      <span className="text-sm font-medium text-[#1A3329]">{selectedAppt.client_email}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedAppt.notes && (
                <div>
                  <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-medium">Notes</div>
                  <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600">{selectedAppt.notes}</div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => router.push(`/appointments/new?edit=${selectedAppt.id}`)}
                className="flex-1 border border-[#2D6A4F] text-[#2D6A4F] font-semibold py-3 rounded-xl hover:bg-[#D8F3DC] transition text-sm">
                Edit
              </button>
              <button
                onClick={() => { if (confirm('Delete this appointment?')) handleDelete(selectedAppt.id) }}
                className="flex-1 border border-red-200 text-red-400 font-semibold py-3 rounded-xl hover:bg-red-50 transition text-sm">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}