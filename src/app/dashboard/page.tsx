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
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
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
  const thisMonthAppts = appointments.filter(a => a.appointment_date.startsWith(new Date().toISOString().slice(0, 7)))
  const monthRevenue = thisMonthAppts.reduce((sum, a) => sum + (a.services?.price || 0), 0)

  function formatTime(time: string) {
    const [h, m] = time.split(':')
    const hour = parseInt(h)
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
  }

  function formatDate(date: string) {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A1628' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-emerald-400 text-sm font-medium">Loading your dashboard...</span>
      </div>
    </div>
  )

  const displayAppts = activeTab === 'today' ? todayAppts : upcomingAppts

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Syne', sans-serif; }
        .glass { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.06); }
        .glass-light { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); }
        .stat-glow { box-shadow: 0 0 40px rgba(52,211,153,0.08); }
        .appt-row:hover { background: rgba(255,255,255,0.04); }
        .modal-overlay { animation: fadeIn 0.15s ease; }
        .modal-card { animation: slideUp 0.2s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .btn-primary { background: linear-gradient(135deg, #34D399, #059669); transition: all 0.2s; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(52,211,153,0.3); }
        .tab-active { background: rgba(52,211,153,0.1); color: #34D399; border-bottom: 2px solid #34D399; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="min-h-screen flex" style={{ background: '#0A1628' }}>

        {/* SIDEBAR */}
        <aside className="w-64 flex-shrink-0 flex flex-col" style={{ background: '#0D1F2D', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Logo */}
          <div className="px-6 py-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #34D399, #059669)' }}>
                <svg width="18" height="18" viewBox="0 0 100 100" fill="white">
                  <ellipse cx="50" cy="70" rx="26" ry="20"/>
                  <ellipse cx="20" cy="44" rx="12" ry="15"/>
                  <ellipse cx="38" cy="33" rx="12" ry="15"/>
                  <ellipse cx="62" cy="33" rx="12" ry="15"/>
                  <ellipse cx="80" cy="44" rx="12" ry="15"/>
                </svg>
              </div>
              <div>
                <div className="font-display font-700 text-white text-sm" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>PawBooking</div>
                <div className="text-xs capitalize" style={{ color: '#34D399' }}>{profile?.plan || 'Basic'} Plan</div>
              </div>
            </div>
          </div>

          {/* Business name */}
          <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Business</div>
            <div className="text-white font-medium text-sm truncate">{profile?.business_name || 'My Grooming'}</div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {[
              { icon: '⊞', label: 'Dashboard', active: true },
              { icon: '📅', label: 'Appointments', active: false },
              { icon: '👥', label: 'Clients', active: false },
              { icon: '⚙️', label: 'Settings', active: false },
            ].map((item, i) => (
              <button key={i}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150"
                style={{
                  background: item.active ? 'rgba(52,211,153,0.1)' : 'transparent',
                  color: item.active ? '#34D399' : 'rgba(255,255,255,0.4)',
                  border: item.active ? '1px solid rgba(52,211,153,0.2)' : '1px solid transparent'
                }}>
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Sign out */}
          <div className="px-4 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <button onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-150"
              style={{ color: 'rgba(255,255,255,0.3)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
              <span>→</span> Sign out
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-auto scrollbar-hide">

          {/* Top bar */}
          <header className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div>
              <h1 className="text-white font-semibold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'} 👋
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <button onClick={() => router.push('/appointments/new')}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold">
              <span className="text-lg leading-none">+</span> New Appointment
            </button>
          </header>

          <div className="px-8 py-6 space-y-6">

            {/* STAT CARDS */}
            <div className="grid grid-cols-3 gap-4">
              {/* Today */}
              <div className="glass rounded-2xl p-6 stat-glow">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: 'rgba(52,211,153,0.1)' }}>📅</div>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(52,211,153,0.1)', color: '#34D399' }}>Today</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>{todayAppts.length}</div>
                <div className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Appointments today</div>
              </div>

              {/* This month */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: 'rgba(99,179,237,0.1)' }}>📊</div>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(99,179,237,0.1)', color: '#63B3ED' }}>Month</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>{thisMonthAppts.length}</div>
                <div className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Total this month</div>
              </div>

              {/* Revenue */}
              <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, #065F46, #047857)', border: '1px solid rgba(52,211,153,0.2)' }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: 'rgba(255,255,255,0.1)' }}>💰</div>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>Revenue</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>${monthRevenue}</div>
                <div className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Est. this month</div>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.1)' }}>🔗</div>
                  <div>
                    <div className="text-white font-medium text-sm">Your Booking Link</div>
                    <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Share this with clients</div>
                  </div>
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/book/${profile?.business_name?.toLowerCase().replace(/\s+/g, '-')}`); alert('Link copied!') }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'rgba(52,211,153,0.15)', color: '#34D399', border: '1px solid rgba(52,211,153,0.2)' }}>
                  Copy Link
                </button>
              </div>

              <div className="glass rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(251,191,36,0.1)' }}>💬</div>
                  <div>
                    <div className="text-white font-medium text-sm">SMS Reminders</div>
                    <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Auto-sending 24hr before</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(52,211,153,0.1)', color: '#34D399', border: '1px solid rgba(52,211,153,0.2)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  Active
                </div>
              </div>
            </div>

            {/* APPOINTMENTS */}
            <div className="glass rounded-2xl overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                {(['today', 'upcoming'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className="flex-1 py-4 text-sm font-semibold transition-all duration-150"
                    style={{
                      color: activeTab === tab ? '#34D399' : 'rgba(255,255,255,0.3)',
                      borderBottom: activeTab === tab ? '2px solid #34D399' : '2px solid transparent',
                      background: activeTab === tab ? 'rgba(52,211,153,0.04)' : 'transparent'
                    }}>
                    {tab === 'today' ? `Today (${todayAppts.length})` : `Upcoming (${upcomingAppts.length})`}
                  </button>
                ))}
              </div>

              {/* List */}
              <div>
                {displayAppts.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="text-5xl mb-4">🐾</div>
                    <div className="text-sm font-medium mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      No appointments {activeTab === 'today' ? 'today' : 'coming up'}
                    </div>
                    <div className="text-xs mb-6" style={{ color: 'rgba(255,255,255,0.3)' }}>Add one to get started</div>
                    <button onClick={() => router.push('/appointments/new')}
                      className="btn-primary px-6 py-2.5 rounded-xl text-white text-sm font-semibold">
                      Add Appointment
                    </button>
                  </div>
                ) : (
                  displayAppts.map((appt, i) => (
                    <div key={appt.id} onClick={() => setSelectedAppt(appt)}
                      className="appt-row flex items-center justify-between px-6 py-4 cursor-pointer transition-all duration-150"
                      style={{ borderBottom: i < displayAppts.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                          style={{ background: `hsl(${appt.client_name.charCodeAt(0) * 17 % 360}, 50%, 25%)`, color: `hsl(${appt.client_name.charCodeAt(0) * 17 % 360}, 70%, 70%)` }}>
                          {getInitials(appt.client_name)}
                        </div>
                        <div>
                          <div className="text-white font-semibold text-sm">{appt.client_name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>🐾 {appt.dog_name}</span>
                            {appt.services?.name && (
                              <>
                                <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{appt.services.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {activeTab === 'upcoming' && (
                          <div className="text-right">
                            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{formatDate(appt.appointment_date)}</div>
                          </div>
                        )}
                        <div className="text-right">
                          <div className="text-white font-semibold text-sm">{formatTime(appt.appointment_time)}</div>
                          {appt.services?.price ? (
                            <div className="text-xs font-semibold mt-0.5" style={{ color: '#34D399' }}>${appt.services.price}</div>
                          ) : null}
                        </div>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ color: 'rgba(255,255,255,0.2)' }}>›</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* APPOINTMENT DETAIL MODAL */}
      {selectedAppt && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setSelectedAppt(null)}>
          <div className="modal-card w-full max-w-md rounded-2xl overflow-hidden"
            style={{ background: '#0D1F2D', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: `hsl(${selectedAppt.client_name.charCodeAt(0) * 17 % 360}, 50%, 25%)`, color: `hsl(${selectedAppt.client_name.charCodeAt(0) * 17 % 360}, 70%, 70%)` }}>
                  {getInitials(selectedAppt.client_name)}
                </div>
                <div>
                  <div className="text-white font-bold">{selectedAppt.client_name}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {formatDate(selectedAppt.appointment_date)} at {formatTime(selectedAppt.appointment_time)}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedAppt(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>✕</button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">

              {/* Service & Price */}
              <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.12)' }}>
                <div>
                  <div className="text-xs uppercase tracking-wide mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Service</div>
                  <div className="text-white font-semibold">{selectedAppt.services?.name || 'Appointment'}</div>
                </div>
                <div className="text-2xl font-bold" style={{ color: '#34D399', fontFamily: 'Syne, sans-serif' }}>${selectedAppt.services?.price || 0}</div>
              </div>

              {/* Dog */}
              <div>
                <div className="text-xs uppercase tracking-wide mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Dog</div>
                <div className="flex gap-2">
                  <span className="px-3 py-1.5 rounded-full text-sm font-medium" style={{ background: 'rgba(52,211,153,0.1)', color: '#34D399' }}>🐾 {selectedAppt.dog_name}</span>
                  {selectedAppt.dog_breed && <span className="px-3 py-1.5 rounded-full text-sm" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>{selectedAppt.dog_breed}</span>}
                </div>
              </div>

              {/* Contact */}
              <div>
                <div className="text-xs uppercase tracking-wide mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Contact</div>
                <div className="space-y-2">
                  <a href={`tel:${selectedAppt.client_phone}`}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}>
                    <span>📞</span>
                    <span className="text-sm text-white">{selectedAppt.client_phone}</span>
                  </a>
                  {selectedAppt.client_email && (
                    <a href={`mailto:${selectedAppt.client_email}`}
                      className="flex items-center gap-3 p-3 rounded-xl transition-all"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}>
                      <span>✉️</span>
                      <span className="text-sm text-white">{selectedAppt.client_email}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedAppt.notes && (
                <div>
                  <div className="text-xs uppercase tracking-wide mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Notes</div>
                  <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {selectedAppt.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => router.push(`/appointments/new?edit=${selectedAppt.id}`)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{ background: 'rgba(52,211,153,0.1)', color: '#34D399', border: '1px solid rgba(52,211,153,0.2)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(52,211,153,0.2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(52,211,153,0.1)')}>
                Edit
              </button>
              <button onClick={() => { if (confirm('Delete this appointment?')) handleDelete(selectedAppt.id) }}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{ background: 'rgba(239,68,68,0.08)', color: 'rgba(239,68,68,0.7)', border: '1px solid rgba(239,68,68,0.15)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}