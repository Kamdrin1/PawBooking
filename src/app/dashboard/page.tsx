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

  const avatarColors = [
    { bg: '#D8F3DC', text: '#1A3329' },
    { bg: '#FDE8D8', text: '#7C2D12' },
    { bg: '#E8E4F8', text: '#3730A3' },
    { bg: '#FEF3C7', text: '#78350F' },
    { bg: '#FCE7F3', text: '#831843' },
  ]

  function getAvatarColor(name: string) {
    return avatarColors[name.charCodeAt(0) % avatarColors.length]
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F2EB' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#2D6A4F', borderTopColor: 'transparent' }} />
        <span className="text-sm font-medium" style={{ color: '#2D6A4F' }}>Loading...</span>
      </div>
    </div>
  )

  const displayAppts = activeTab === 'today' ? todayAppts : upcomingAppts

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
        body { background: #F5F2EB; }
        .playfair { font-family: 'Playfair Display', serif; }
        .dm-sans { font-family: 'DM Sans', sans-serif; }
        * { font-family: 'DM Sans', sans-serif; }
        .nav-item { transition: all 0.15s ease; }
        .nav-item:hover { background: rgba(45,106,79,0.08); color: #1A3329; }
        .nav-active { background: #1A3329 !important; color: white !important; }
        .appt-row { transition: all 0.15s ease; border-bottom: 1px solid #EDE9DF; }
        .appt-row:hover { background: #FDFBF7; }
        .appt-row:last-child { border-bottom: none; }
        .stat-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(26,51,41,0.08); }
        .btn-new { background: #1A3329; transition: all 0.2s ease; }
        .btn-new:hover { background: #2D6A4F; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(26,51,41,0.25); }
        .modal-bg { animation: fadeIn 0.15s ease; }
        .modal-box { animation: scaleIn 0.2s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .tab-btn { transition: all 0.15s ease; border-bottom: 2px solid transparent; }
        .tab-active-style { border-bottom: 2px solid #1A3329; color: #1A3329; font-weight: 600; }
        .action-btn { transition: all 0.15s ease; }
        .action-btn:hover { background: #EDE9DF; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="min-h-screen flex dm-sans" style={{ background: '#F5F2EB' }}>

        {/* SIDEBAR */}
        <aside className="w-60 flex-shrink-0 flex flex-col sticky top-0 h-screen" style={{ background: '#FDFBF7', borderRight: '1px solid #EDE9DF' }}>
          
          {/* Logo area */}
          <div className="px-6 pt-8 pb-6" style={{ borderBottom: '1px solid #EDE9DF' }}>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#1A3329' }}>
                <svg width="16" height="16" viewBox="0 0 100 100" fill="#D8F3DC">
                  <ellipse cx="50" cy="70" rx="26" ry="20"/>
                  <ellipse cx="20" cy="44" rx="12" ry="15"/>
                  <ellipse cx="38" cy="33" rx="12" ry="15"/>
                  <ellipse cx="62" cy="33" rx="12" ry="15"/>
                  <ellipse cx="80" cy="44" rx="12" ry="15"/>
                </svg>
              </div>
              <span className="font-semibold text-base playfair" style={{ color: '#1A3329', fontFamily: 'Playfair Display, serif' }}>PawBooking</span>
            </div>
            <div style={{ background: '#F5F2EB', borderRadius: '10px', padding: '10px 12px' }}>
              <div className="text-xs font-medium uppercase tracking-wider mb-0.5" style={{ color: '#9CA3AF' }}>Business</div>
              <div className="font-semibold text-sm truncate" style={{ color: '#1A3329' }}>{profile?.business_name || 'My Grooming'}</div>
              <div className="text-xs mt-0.5 capitalize" style={{ color: '#2D6A4F' }}>{profile?.plan || 'Basic'} Plan</div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex-1 px-4 py-5 space-y-1">
            {[
              { label: 'Dashboard', emoji: '▤', active: true },
              { label: 'Appointments', emoji: '📅', active: false },
              { label: 'Clients', emoji: '👥', active: false },
              { label: 'Settings', emoji: '⚙', active: false },
            ].map((item, i) => (
              <button key={i}
                className={`nav-item w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-left ${item.active ? 'nav-active' : ''}`}
                style={{ color: item.active ? 'white' : '#6B7280' }}>
                <span className="text-base">{item.emoji}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Sign out */}
          <div className="px-4 pb-6" style={{ borderTop: '1px solid #EDE9DF', paddingTop: '16px' }}>
            <button onClick={handleSignOut}
              className="nav-item w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-left"
              style={{ color: '#9CA3AF' }}>
              <span>↪</span> Sign out
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 overflow-auto scrollbar-none">

          {/* Header */}
          <header className="flex items-center justify-between px-8 py-6" style={{ borderBottom: '1px solid #EDE9DF', background: '#FDFBF7' }}>
            <div>
              <h1 className="playfair text-2xl font-semibold" style={{ color: '#1A3329', fontFamily: 'Playfair Display, serif' }}>
                {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <button onClick={() => router.push('/appointments/new')}
              className="btn-new flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold">
              + New Appointment
            </button>
          </header>

          <div className="px-8 py-7 space-y-6 max-w-5xl">

            {/* STAT CARDS */}
            <div className="grid grid-cols-3 gap-4">
              <div className="stat-card rounded-2xl p-6" style={{ background: '#FDFBF7', border: '1px solid #EDE9DF' }}>
                <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>Today</div>
                <div className="playfair text-5xl font-semibold mb-1" style={{ color: '#1A3329', fontFamily: 'Playfair Display, serif' }}>{todayAppts.length}</div>
                <div className="text-sm" style={{ color: '#6B7280' }}>Appointments</div>
              </div>

              <div className="stat-card rounded-2xl p-6" style={{ background: '#FDFBF7', border: '1px solid #EDE9DF' }}>
                <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>This Month</div>
                <div className="playfair text-5xl font-semibold mb-1" style={{ color: '#1A3329', fontFamily: 'Playfair Display, serif' }}>{thisMonthAppts.length}</div>
                <div className="text-sm" style={{ color: '#6B7280' }}>Total bookings</div>
              </div>

              <div className="stat-card rounded-2xl p-6" style={{ background: '#1A3329', border: '1px solid #1A3329' }}>
                <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(216,243,220,0.6)' }}>Revenue</div>
                <div className="playfair text-5xl font-semibold mb-1 text-white" style={{ fontFamily: 'Playfair Display, serif' }}>${monthRevenue}</div>
                <div className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Est. this month</div>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl p-5 flex items-center justify-between" style={{ background: '#FDFBF7', border: '1px solid #EDE9DF' }}>
                <div>
                  <div className="font-semibold text-sm mb-0.5" style={{ color: '#1A3329' }}>Your Booking Link</div>
                  <div className="text-xs" style={{ color: '#9CA3AF' }}>Share this with clients</div>
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/book/${profile?.business_name?.toLowerCase().replace(/\s+/g, '-')}`); alert('Copied!') }}
                  className="action-btn px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: '#F5F2EB', color: '#2D6A4F', border: '1px solid #D8F3DC' }}>
                  Copy Link
                </button>
              </div>

              <div className="rounded-2xl p-5 flex items-center justify-between" style={{ background: '#FDFBF7', border: '1px solid #EDE9DF' }}>
                <div>
                  <div className="font-semibold text-sm mb-0.5" style={{ color: '#1A3329' }}>SMS Reminders</div>
                  <div className="text-xs" style={{ color: '#9CA3AF' }}>Auto-sending 24hr before</div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: '#D8F3DC', color: '#1A5C36' }}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#2D6A4F' }} />
                  Active
                </div>
              </div>
            </div>

            {/* APPOINTMENTS TABLE */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#FDFBF7', border: '1px solid #EDE9DF' }}>
              
              {/* Tabs */}
              <div className="flex" style={{ borderBottom: '1px solid #EDE9DF' }}>
                {(['today', 'upcoming'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`tab-btn flex-1 py-4 text-sm px-6 text-left ${activeTab === tab ? 'tab-active-style' : ''}`}
                    style={{ color: activeTab === tab ? '#1A3329' : '#9CA3AF' }}>
                    {tab === 'today' ? `Today  ·  ${todayAppts.length}` : `Upcoming  ·  ${upcomingAppts.length}`}
                  </button>
                ))}
              </div>

              {/* Rows */}
              {displayAppts.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="text-4xl mb-4">🐾</div>
                  <div className="font-medium mb-1" style={{ color: '#6B7280' }}>No appointments {activeTab === 'today' ? 'today' : 'coming up'}</div>
                  <div className="text-sm mb-6" style={{ color: '#9CA3AF' }}>Add one to fill your schedule</div>
                  <button onClick={() => router.push('/appointments/new')}
                    className="btn-new px-6 py-2.5 rounded-xl text-white text-sm font-semibold">
                    Add Appointment
                  </button>
                </div>
              ) : (
                displayAppts.map(appt => {
                  const color = getAvatarColor(appt.client_name)
                  return (
                    <div key={appt.id} onClick={() => setSelectedAppt(appt)}
                      className="appt-row flex items-center justify-between px-6 py-4 cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: color.bg, color: color.text }}>
                          {getInitials(appt.client_name)}
                        </div>
                        <div>
                          <div className="font-semibold text-sm" style={{ color: '#1A3329' }}>{appt.client_name}</div>
                          <div className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: '#9CA3AF' }}>
                            <span>{appt.dog_name}</span>
                            {appt.services?.name && <><span>·</span><span>{appt.services.name}</span></>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        {activeTab === 'upcoming' && (
                          <div className="text-sm" style={{ color: '#6B7280' }}>{formatDate(appt.appointment_date)}</div>
                        )}
                        <div className="text-right">
                          <div className="font-semibold text-sm" style={{ color: '#1A3329' }}>{formatTime(appt.appointment_time)}</div>
                          {appt.services?.price ? <div className="text-xs font-semibold mt-0.5" style={{ color: '#2D6A4F' }}>${appt.services.price}</div> : null}
                        </div>
                        <div style={{ color: '#D1D5DB' }}>›</div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </main>
      </div>

      {/* MODAL */}
      {selectedAppt && (
        <div className="modal-bg fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(26,51,41,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelectedAppt(null)}>
          <div className="modal-box w-full max-w-md rounded-2xl overflow-hidden"
            style={{ background: '#FDFBF7', border: '1px solid #EDE9DF' }}
            onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid #EDE9DF' }}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: getAvatarColor(selectedAppt.client_name).bg, color: getAvatarColor(selectedAppt.client_name).text }}>
                  {getInitials(selectedAppt.client_name)}
                </div>
                <div>
                  <div className="font-semibold" style={{ color: '#1A3329' }}>{selectedAppt.client_name}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{formatDate(selectedAppt.appointment_date)} · {formatTime(selectedAppt.appointment_time)}</div>
                </div>
              </div>
              <button onClick={() => setSelectedAppt(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all"
                style={{ background: '#F5F2EB', color: '#6B7280' }}>✕</button>
            </div>

            <div className="p-6 space-y-5">
              {/* Service */}
              <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#F5F2EB' }}>
                <div>
                  <div className="text-xs uppercase tracking-widest font-medium mb-1" style={{ color: '#9CA3AF' }}>Service</div>
                  <div className="font-semibold" style={{ color: '#1A3329' }}>{selectedAppt.services?.name || 'Appointment'}</div>
                </div>
                <div className="playfair text-2xl font-semibold" style={{ color: '#2D6A4F', fontFamily: 'Playfair Display, serif' }}>${selectedAppt.services?.price || 0}</div>
              </div>

              {/* Dog */}
              <div>
                <div className="text-xs uppercase tracking-widest font-medium mb-2" style={{ color: '#9CA3AF' }}>Dog</div>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1.5 rounded-full text-sm font-medium" style={{ background: '#D8F3DC', color: '#1A5C36' }}>🐾 {selectedAppt.dog_name}</span>
                  {selectedAppt.dog_breed && <span className="px-3 py-1.5 rounded-full text-sm" style={{ background: '#F5F2EB', color: '#6B7280' }}>{selectedAppt.dog_breed}</span>}
                </div>
              </div>

              {/* Contact */}
              <div>
                <div className="text-xs uppercase tracking-widest font-medium mb-2" style={{ color: '#9CA3AF' }}>Contact</div>
                <div className="space-y-2">
                  <a href={`tel:${selectedAppt.client_phone}`}
                    className="action-btn flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: '#F5F2EB', border: '1px solid #EDE9DF' }}>
                    <span>📞</span>
                    <span className="text-sm font-medium" style={{ color: '#1A3329' }}>{selectedAppt.client_phone}</span>
                  </a>
                  {selectedAppt.client_email && (
                    <a href={`mailto:${selectedAppt.client_email}`}
                      className="action-btn flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: '#F5F2EB', border: '1px solid #EDE9DF' }}>
                      <span>✉️</span>
                      <span className="text-sm font-medium" style={{ color: '#1A3329' }}>{selectedAppt.client_email}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedAppt.notes && (
                <div>
                  <div className="text-xs uppercase tracking-widest font-medium mb-2" style={{ color: '#9CA3AF' }}>Notes</div>
                  <div className="p-3 rounded-xl text-sm" style={{ background: '#F5F2EB', color: '#6B7280', border: '1px solid #EDE9DF' }}>
                    {selectedAppt.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => router.push(`/appointments/new?edit=${selectedAppt.id}`)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{ background: '#1A3329', color: 'white' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#2D6A4F')}
                onMouseLeave={e => (e.currentTarget.style.background = '#1A3329')}>
                Edit Appointment
              </button>
              <button onClick={() => { if (confirm('Delete this appointment?')) handleDelete(selectedAppt.id) }}
                className="px-5 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#FECACA')}
                onMouseLeave={e => (e.currentTarget.style.background = '#FEE2E2')}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}