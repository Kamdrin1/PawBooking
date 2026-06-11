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
  payment_method: string
  services: { name: string; price: number } | null
}

interface Profile {
  business_name: string
  plan: string
  payment_methods: string[]
  google_review_link: string
}

interface Service {
  id: string
  name: string
  price: number
  duration_minutes: number
  payment_type: 'none' | 'deposit' | 'full'
  deposit_amount: number
}

interface ReportData {
  monthlyRevenue: { month: string; revenue: number }[]
  topServices: { name: string; count: number; revenue: number }[]
  newVsReturning: { new: number; returning: number }
  avgRevenuePerAppt: number
  totalRevenue: number
  totalAppointments: number
}

// ─── REPORTS PAGE ─────────────────────────────────────────────────────────────
function ReportsPage({ profile, supabase, router }: {
  profile: Profile | null
  supabase: ReturnType<typeof createClient>
  router: ReturnType<typeof useRouter>
}) {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const isPro = profile?.plan === 'pro'

  useEffect(() => {
    if (!isPro) { setLoading(false); return }
    async function loadReports() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: allAppts } = await supabase
        .from('appointments')
        .select('*, services(name, price)')
        .eq('profile_id', user.id)
        .order('appointment_date', { ascending: true })
      if (!allAppts) { setLoading(false); return }

      const monthlyMap: Record<string, number> = {}
      const now = new Date()
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        monthlyMap[key] = 0
      }
      allAppts.forEach(a => {
        const d = new Date(a.appointment_date + 'T00:00:00')
        const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        if (key in monthlyMap) monthlyMap[key] += a.services?.price || 0
      })
      const monthlyRevenue = Object.entries(monthlyMap).map(([month, revenue]) => ({ month, revenue }))

      const serviceMap: Record<string, { count: number; revenue: number }> = {}
      allAppts.forEach(a => {
        const name = a.services?.name || 'Unknown'
        if (!serviceMap[name]) serviceMap[name] = { count: 0, revenue: 0 }
        serviceMap[name].count++
        serviceMap[name].revenue += a.services?.price || 0
      })
      const topServices = Object.entries(serviceMap)
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

      const phoneSeen = new Set<string>()
      let newClients = 0, returningClients = 0
      allAppts.forEach(a => {
        if (!a.client_phone) return
        if (phoneSeen.has(a.client_phone)) { returningClients++ }
        else { newClients++; phoneSeen.add(a.client_phone) }
      })

      const totalRevenue = allAppts.reduce((sum, a) => sum + (a.services?.price || 0), 0)
      const totalAppointments = allAppts.length
      const avgRevenuePerAppt = totalAppointments > 0 ? Math.round(totalRevenue / totalAppointments) : 0

      setReportData({ monthlyRevenue, topServices, newVsReturning: { new: newClients, returning: returningClients }, avgRevenuePerAppt, totalRevenue, totalAppointments })
      setLoading(false)
    }
    loadReports()
  }, [isPro])

  const maxRevenue = reportData ? Math.max(...reportData.monthlyRevenue.map(m => m.revenue), 1) : 1
  const totalClients = reportData ? reportData.newVsReturning.new + reportData.newVsReturning.returning : 0

  const BlurredContent = () => (
    <div className="relative">
      <div style={{ filter: 'blur(6px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.6 }}>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[['Total Revenue', '$2,840'], ['Appointments', '38'], ['Avg per Appt', '$74']].map(([label, val]) => (
            <div key={label} className="rounded-2xl p-6" style={{ background: '#FDFBF7', border: '1px solid #EDE9DF' }}>
              <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>{label}</div>
              <div className="text-4xl font-bold mb-1" style={{ color: '#1A3329', fontFamily: 'Playfair Display, serif' }}>{val}</div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl p-6 mb-6" style={{ background: '#FDFBF7', border: '1px solid #EDE9DF' }}>
          <div className="text-sm font-semibold mb-4" style={{ color: '#1A3329' }}>Monthly Revenue</div>
          <div className="flex items-end gap-3 h-32">
            {[40, 65, 45, 80, 55, 90].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-lg" style={{ height: `${h}%`, background: '#1A3329', opacity: 0.7 }} />
            ))}
          </div>
        </div>
        <div className="rounded-2xl p-6" style={{ background: '#FDFBF7', border: '1px solid #EDE9DF' }}>
          <div className="text-sm font-semibold mb-4" style={{ color: '#1A3329' }}>Top Services</div>
          {['Full Groom', 'Bath & Brush', 'Nail Trim'].map((s, i) => (
            <div key={s} className="flex items-center justify-between py-2">
              <span className="text-sm" style={{ color: '#374151' }}>{s}</span>
              <span className="text-sm font-semibold" style={{ color: '#2D6A4F' }}>${[840, 620, 380][i]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl" style={{ background: 'rgba(253,251,247,0.75)' }}>
        <div className="text-4xl mb-4">🔒</div>
        <div className="text-xl font-bold mb-2 text-center" style={{ color: '#1A3329', fontFamily: 'Playfair Display, serif' }}>Reports & Analytics</div>
        <div className="text-sm mb-6 text-center max-w-xs" style={{ color: '#6B7280' }}>
          See your revenue trends, top services, and client retention — upgrade to Pro to unlock.
        </div>
        <button onClick={() => router.push('/pricing')}
          className="px-6 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ background: '#1A3329' }}>
          Upgrade to Pro — $50/mo →
        </button>
      </div>
    </div>
  )

  return (
    <>
      <header className="px-8 py-6" style={{ borderBottom: '1px solid #EDE9DF', background: '#FDFBF7' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="playfair text-2xl font-semibold" style={{ color: '#1A3329', fontFamily: 'Playfair Display, serif' }}>Reports</h1>
            <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>Your business performance at a glance</p>
          </div>
          {isPro && <div className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: '#D8F3DC', color: '#1A5C36' }}>⭐ Pro</div>}
        </div>
      </header>
      <div className="px-8 py-7 max-w-5xl">
        {!isPro ? <BlurredContent /> : loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#2D6A4F', borderTopColor: 'transparent' }} />
          </div>
        ) : reportData ? (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="stat-card rounded-2xl p-6" style={{ background: '#1A3329' }}>
                <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(216,243,220,0.6)' }}>Total Revenue</div>
                <div className="playfair text-4xl font-semibold mb-1 text-white" style={{ fontFamily: 'Playfair Display, serif' }}>${reportData.totalRevenue}</div>
                <div className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>All time</div>
              </div>
              <div className="stat-card rounded-2xl p-6" style={{ background: '#FDFBF7', border: '1px solid #EDE9DF' }}>
                <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>Total Appointments</div>
                <div className="playfair text-4xl font-semibold mb-1" style={{ color: '#1A3329', fontFamily: 'Playfair Display, serif' }}>{reportData.totalAppointments}</div>
                <div className="text-sm" style={{ color: '#6B7280' }}>All time</div>
              </div>
              <div className="stat-card rounded-2xl p-6" style={{ background: '#FDFBF7', border: '1px solid #EDE9DF' }}>
                <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>Avg per Appointment</div>
                <div className="playfair text-4xl font-semibold mb-1" style={{ color: '#1A3329', fontFamily: 'Playfair Display, serif' }}>${reportData.avgRevenuePerAppt}</div>
                <div className="text-sm" style={{ color: '#6B7280' }}>All time</div>
              </div>
            </div>
            <div className="rounded-2xl p-6" style={{ background: '#FDFBF7', border: '1px solid #EDE9DF' }}>
              <div className="text-sm font-semibold mb-6" style={{ color: '#1A3329' }}>Monthly Revenue — Last 6 Months</div>
              <div className="flex items-end gap-3 h-40">
                {reportData.monthlyRevenue.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-xs font-semibold" style={{ color: '#2D6A4F' }}>{m.revenue > 0 ? `$${m.revenue}` : ''}</div>
                    <div className="w-full rounded-t-lg transition-all" style={{
                      height: `${Math.max((m.revenue / maxRevenue) * 130, m.revenue > 0 ? 8 : 2)}px`,
                      background: i === reportData.monthlyRevenue.length - 1 ? '#1A3329' : '#D8F3DC',
                    }} />
                    <div className="text-xs" style={{ color: '#9CA3AF' }}>{m.month}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl p-6" style={{ background: '#FDFBF7', border: '1px solid #EDE9DF' }}>
                <div className="text-sm font-semibold mb-4" style={{ color: '#1A3329' }}>Top Services by Revenue</div>
                {reportData.topServices.length === 0 ? (
                  <div className="text-sm py-4 text-center" style={{ color: '#9CA3AF' }}>No service data yet</div>
                ) : (
                  <div className="space-y-3">
                    {reportData.topServices.map((s, i) => (
                      <div key={s.name}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{ background: i === 0 ? '#1A3329' : '#D8F3DC', color: i === 0 ? 'white' : '#1A5C36' }}>{i + 1}</div>
                            <span className="text-sm font-medium" style={{ color: '#374151' }}>{s.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold" style={{ color: '#2D6A4F' }}>${s.revenue}</div>
                            <div className="text-xs" style={{ color: '#9CA3AF' }}>{s.count} bookings</div>
                          </div>
                        </div>
                        <div className="w-full rounded-full h-1.5" style={{ background: '#EDE9DF' }}>
                          <div className="h-1.5 rounded-full" style={{ width: `${(s.revenue / reportData.topServices[0].revenue) * 100}%`, background: '#2D6A4F' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded-2xl p-6" style={{ background: '#FDFBF7', border: '1px solid #EDE9DF' }}>
                <div className="text-sm font-semibold mb-4" style={{ color: '#1A3329' }}>New vs Returning Clients</div>
                {totalClients === 0 ? (
                  <div className="text-sm py-4 text-center" style={{ color: '#9CA3AF' }}>No client data yet</div>
                ) : (
                  <>
                    <div className="flex items-end gap-4 mb-6">
                      <div className="flex-1 text-center">
                        <div className="playfair text-4xl font-bold mb-1" style={{ color: '#1A3329', fontFamily: 'Playfair Display, serif' }}>{reportData.newVsReturning.new}</div>
                        <div className="text-xs font-semibold" style={{ color: '#6B7280' }}>New Clients</div>
                      </div>
                      <div className="w-px h-12" style={{ background: '#EDE9DF' }} />
                      <div className="flex-1 text-center">
                        <div className="playfair text-4xl font-bold mb-1" style={{ color: '#2D6A4F', fontFamily: 'Playfair Display, serif' }}>{reportData.newVsReturning.returning}</div>
                        <div className="text-xs font-semibold" style={{ color: '#6B7280' }}>Returning</div>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1.5" style={{ color: '#9CA3AF' }}>
                        <span>Retention rate</span>
                        <span style={{ color: '#2D6A4F', fontWeight: 600 }}>
                          {totalClients > 0 ? Math.round((reportData.newVsReturning.returning / totalClients) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: '#EDE9DF' }}>
                        <div className="h-2.5 rounded-full" style={{
                          width: `${totalClients > 0 ? (reportData.newVsReturning.returning / totalClients) * 100 : 0}%`,
                          background: '#2D6A4F',
                        }} />
                      </div>
                    </div>
                    <p className="text-xs mt-3" style={{ color: '#9CA3AF' }}>
                      {reportData.newVsReturning.returning > 0
                        ? `${reportData.newVsReturning.returning} clients have booked more than once 🐾`
                        : 'Build repeat business with rebooking reminders'}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20" style={{ color: '#9CA3AF' }}>No data available yet</div>
        )}
      </div>
    </>
  )
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
function SettingsPage({ profile, onBusinessNameUpdate, onReviewLinkUpdate, supabase, router }: {
  profile: Profile | null
  onBusinessNameUpdate: (name: string) => void
  onReviewLinkUpdate: (link: string) => void
  supabase: ReturnType<typeof createClient>
  router: ReturnType<typeof useRouter>
}) {
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState(profile?.business_name || '')
  const [savingName, setSavingName] = useState(false)
  const [nameError, setNameError] = useState('')
  const [portalLoading, setPortalLoading] = useState(false)
  const [editingReviewLink, setEditingReviewLink] = useState(false)
  const [newReviewLink, setNewReviewLink] = useState(profile?.google_review_link || '')
  const [savingReviewLink, setSavingReviewLink] = useState(false)
  const [reviewLinkError, setReviewLinkError] = useState('')

  async function handleSaveName() {
    if (!newName.trim()) { setNameError('Business name is required'); return }
    setSavingName(true)
    setNameError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').update({ business_name: newName.trim() }).eq('id', user.id)
    if (error) { setNameError(error.message); setSavingName(false); return }
    onBusinessNameUpdate(newName.trim())
    setEditingName(false)
    setSavingName(false)
  }

  async function handleSaveReviewLink() {
    setSavingReviewLink(true)
    setReviewLinkError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').update({ google_review_link: newReviewLink.trim() }).eq('id', user.id)
    if (error) { setReviewLinkError(error.message); setSavingReviewLink(false); return }
    onReviewLinkUpdate(newReviewLink.trim())
    setEditingReviewLink(false)
    setSavingReviewLink(false)
  }

  async function handleManagePlan() {
    setPortalLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setPortalLoading(false); return }
    const res = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      console.error('Portal error:', data.error)
      setPortalLoading(false)
    }
  }

  const isPro = profile?.plan === 'pro'
  const basicIncluded = ['Online booking page', 'Up to 30 appointments/mo', 'SMS appointment reminders', 'Instant booking notifications', 'Client history']
  const basicLocked = ['Unlimited appointments', 'Rebooking reminders', 'Auto review requests after every job', 'Monthly revenue & booking reports', 'Early access to new features', 'Priority support']
  const proFeatures = ['Everything in Basic', 'Unlimited appointments', 'Rebooking reminders', 'Auto review requests after every job', 'Monthly revenue & booking reports', 'Early access to new features', 'Priority support']

  return (
    <>
      <header className="px-8 py-6" style={{ borderBottom: '1px solid #EDE9DF', background: '#FDFBF7' }}>
        <h1 className="playfair text-2xl font-semibold" style={{ color: '#1A3329', fontFamily: 'Playfair Display, serif' }}>Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>Manage your account and preferences</p>
      </header>
      <div className="px-8 py-7 max-w-2xl space-y-4">

        {/* Business Name */}
        <div className="rounded-2xl p-6" style={{ background: '#FDFBF7', border: '1px solid #EDE9DF' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold" style={{ color: '#1A3329' }}>Business Name</div>
            {!editingName && (
              <button onClick={() => { setEditingName(true); setNewName(profile?.business_name || '') }}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{ background: '#F5F2EB', color: '#6B7280', border: '1px solid #EDE9DF' }}>✏️</button>
            )}
          </div>
          {editingName ? (
            <div className="space-y-3">
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ background: '#F5F2EB', border: '1px solid #EDE9DF', color: '#1A3329' }}
                onKeyDown={e => e.key === 'Enter' && handleSaveName()} />
              {nameError && <p className="text-xs" style={{ color: '#DC2626' }}>{nameError}</p>}
              <div className="flex gap-2">
                <button onClick={handleSaveName} disabled={savingName}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: '#1A3329' }}>{savingName ? 'Saving...' : 'Save'}</button>
                <button onClick={() => { setEditingName(false); setNameError('') }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: '#F5F2EB', color: '#6B7280' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="text-sm" style={{ color: '#6B7280' }}>{profile?.business_name}</div>
          )}
        </div>

        {/* Google Review Link — Pro only */}
        {isPro && (
          <div className="rounded-2xl p-6" style={{ background: '#FDFBF7', border: '1px solid #EDE9DF' }}>
            <div className="flex items-center justify-between mb-1">
              <div>
                <div className="text-sm font-semibold" style={{ color: '#1A3329' }}>Google Review Link</div>
                <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Sent to clients automatically after every completed appointment</div>
              </div>
              {!editingReviewLink && (
                <button onClick={() => { setEditingReviewLink(true); setNewReviewLink(profile?.google_review_link || '') }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ml-3"
                  style={{ background: '#F5F2EB', color: '#6B7280', border: '1px solid #EDE9DF' }}>✏️</button>
              )}
            </div>
            {editingReviewLink ? (
              <div className="space-y-3 mt-3">
                <input type="url" value={newReviewLink} onChange={e => setNewReviewLink(e.target.value)}
                  placeholder="https://g.page/r/your-review-link"
                  className="w-full px-4 py-3 rounded-xl text-sm"
                  style={{ background: '#F5F2EB', border: '1px solid #EDE9DF', color: '#1A3329' }}
                  onKeyDown={e => e.key === 'Enter' && handleSaveReviewLink()} />
                <p className="text-xs" style={{ color: '#9CA3AF' }}>
                  Find your link: Google Maps → your business → Share → Copy link
                </p>
                {reviewLinkError && <p className="text-xs" style={{ color: '#DC2626' }}>{reviewLinkError}</p>}
                <div className="flex gap-2">
                  <button onClick={handleSaveReviewLink} disabled={savingReviewLink}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                    style={{ background: '#1A3329' }}>{savingReviewLink ? 'Saving...' : 'Save'}</button>
                  <button onClick={() => { setEditingReviewLink(false); setReviewLinkError('') }}
                    className="px-4 py-2 rounded-xl text-sm font-semibold"
                    style={{ background: '#F5F2EB', color: '#6B7280' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="mt-2">
                {profile?.google_review_link ? (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⭐</span>
                    <a href={profile.google_review_link} target="_blank" rel="noreferrer"
                      className="text-sm truncate" style={{ color: '#2D6A4F' }}>{profile.google_review_link}</a>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
                    <span>⚠️</span>
                    <span className="text-xs font-medium" style={{ color: '#92400E' }}>Add your Google review link to enable auto review requests</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Plan Cards */}
        <div className="rounded-2xl p-6" style={{ background: '#FDFBF7', border: '1px solid #EDE9DF' }}>
          <div className="text-sm font-semibold mb-4" style={{ color: '#1A3329' }}>Your Plan</div>
          <div className="grid grid-cols-2 gap-3 mb-4">

            {/* Basic */}
            <div className="rounded-2xl p-5 relative flex flex-col" style={{ background: !isPro ? '#1A3329' : '#FFFFFF', border: !isPro ? '2px solid #1A3329' : '1.5px solid #EDE9DF' }}>
              {!isPro && <div className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>Current</div>}
              <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: !isPro ? 'rgba(255,255,255,0.5)' : '#9CA3AF' }}>Basic</div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold" style={{ color: !isPro ? 'white' : '#1A3329', fontFamily: 'Playfair Display, serif' }}>$30</span>
                <span className="text-xs" style={{ color: !isPro ? 'rgba(255,255,255,0.45)' : '#9CA3AF' }}>/mo</span>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                {basicIncluded.map(f => (
                  <div key={f} className="flex items-start gap-2">
                    <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="10" fill={!isPro ? 'rgba(255,255,255,0.15)' : '#D8F3DC'} />
                      <path d="M6 10l3 3 5-5" stroke={!isPro ? 'white' : '#1A5C36'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs leading-relaxed" style={{ color: !isPro ? 'rgba(255,255,255,0.8)' : '#374151' }}>{f}</span>
                  </div>
                ))}
                <div className="my-1" style={{ borderTop: !isPro ? '1px solid rgba(255,255,255,0.1)' : '1px solid #EDE9DF' }} />
                {basicLocked.map(f => (
                  <div key={f} className="flex items-start gap-2">
                    <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="10" fill={!isPro ? 'rgba(255,255,255,0.06)' : '#F3F4F6'} />
                      <path d="M7 7l6 6M13 7l-6 6" stroke={!isPro ? 'rgba(255,255,255,0.25)' : '#D1D5DB'} strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span className="text-xs leading-relaxed line-through" style={{ color: !isPro ? 'rgba(255,255,255,0.25)' : '#C4C9D1' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro */}
            <div className="rounded-2xl p-5 relative flex flex-col" style={{ background: isPro ? '#1A3329' : '#FFFFFF', border: isPro ? '2px solid #1A3329' : '1.5px solid #EDE9DF' }}>
              <div className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: isPro ? 'rgba(255,255,255,0.15)' : '#1A3329', color: 'white' }}>
                ⭐ Most Popular
              </div>
              <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: isPro ? 'rgba(255,255,255,0.5)' : '#9CA3AF' }}>Pro</div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold" style={{ color: isPro ? 'white' : '#1A3329', fontFamily: 'Playfair Display, serif' }}>$50</span>
                <span className="text-xs" style={{ color: isPro ? 'rgba(255,255,255,0.45)' : '#9CA3AF' }}>/mo</span>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                {proFeatures.map(f => (
                  <div key={f} className="flex items-start gap-2">
                    <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="10" fill={isPro ? 'rgba(255,255,255,0.15)' : '#D8F3DC'} />
                      <path d="M6 10l3 3 5-5" stroke={isPro ? 'white' : '#1A5C36'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs leading-relaxed" style={{ color: isPro ? 'rgba(255,255,255,0.8)' : '#374151' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {!isPro ? (
            <button onClick={() => router.push('/pricing')}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: '#1A3329' }}>
              Upgrade to Pro — $50/mo →
            </button>
          ) : (
            <button
              onClick={handleManagePlan}
              disabled={portalLoading}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: '#F5F2EB', color: '#6B7280', border: '1px solid #EDE9DF' }}>
              {portalLoading ? 'Opening...' : 'Manage Plan'}
            </button>
          )}
        </div>
      </div>
    </>
  )
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming'>('today')
  const [activePage, setActivePage] = useState<'dashboard' | 'appointments' | 'clients' | 'services' | 'reports' | 'settings'>('dashboard')
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null)
  const [newServiceName, setNewServiceName] = useState('')
  const [newServicePrice, setNewServicePrice] = useState('')
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [serviceError, setServiceError] = useState('')
  const [monthlyApptCount, setMonthlyApptCount] = useState(0)
  const [newPaymentTypes, setNewPaymentTypes] = useState<string[]>([])
  const [completingAppt, setCompletingAppt] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profileData)
      const { data: apptData } = await supabase
        .from('appointments').select('*, services(name, price)').eq('profile_id', user.id)
        .gte('appointment_date', new Date().toISOString().split('T')[0])
        .order('appointment_date', { ascending: true }).order('appointment_time', { ascending: true })
      setAppointments(apptData || [])
      const monthStart = new Date(); monthStart.setDate(1)
      const { count } = await supabase.from('appointments').select('id', { count: 'exact', head: true })
        .eq('profile_id', user.id).gte('appointment_date', monthStart.toISOString().split('T')[0])
      setMonthlyApptCount(count || 0)
      const { data: serviceData } = await supabase.from('services').select('*').eq('profile_id', user.id).order('name', { ascending: true })
      setServices(serviceData || [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleSignOut() { await supabase.auth.signOut(); router.push('/login') }

  async function handleDelete(id: string) {
    await supabase.from('appointments').delete().eq('id', id)
    setAppointments(prev => prev.filter(a => a.id !== id))
    setSelectedAppt(null)
  }

  async function handleMarkComplete(id: string) {
    setCompletingAppt(id)
    const { error } = await supabase.from('appointments').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', id)
    if (!error) {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'completed' } : a))
      setSelectedAppt(prev => prev?.id === id ? { ...prev, status: 'completed' } : prev)
    }
    setCompletingAppt(null)
  }

  async function handleAddService() {
    setServiceError('')
    if (!newServiceName.trim()) { setServiceError('Service name is required'); return }
    if (newPaymentTypes.length === 0) { setServiceError('Select at least one payment type'); return }
    const duplicate = services.find(s => s.name.toLowerCase() === newServiceName.toLowerCase().trim())
    if (duplicate) { setServiceError(`"${newServiceName}" already exists`); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase.from('services').insert({
      profile_id: user.id, name: newServiceName.trim(), price: parseFloat(newServicePrice) || 0,
      duration_minutes: 60,
      payment_type: newPaymentTypes.includes('online') && newPaymentTypes.includes('in_person') ? 'full' : newPaymentTypes.includes('online') ? 'full' : 'none',
      deposit_amount: 0,
    }).select().single()
    if (error) { setServiceError(error.message); return }
    setServices(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    setNewServiceName(''); setNewServicePrice(''); setNewPaymentTypes([])
  }

  async function handleUpdateService() {
    if (!editingService) return
    setServiceError('')
    const duplicate = services.find(s => s.name.toLowerCase() === editingService.name.toLowerCase().trim() && s.id !== editingService.id)
    if (duplicate) { setServiceError(`"${editingService.name}" already exists`); return }
    const { error } = await supabase.from('services').update({ name: editingService.name.trim(), price: editingService.price }).eq('id', editingService.id)
    if (error) { setServiceError(error.message); return }
    setServices(prev => prev.map(s => s.id === editingService.id ? editingService : s).sort((a, b) => a.name.localeCompare(b.name)))
    setEditingService(null)
  }

  async function handleDeleteService(id: string) {
    if (!confirm('Delete this service?')) return
    await supabase.from('services').delete().eq('id', id)
    setServices(prev => prev.filter(s => s.id !== id))
  }

  function getServicePaymentLabel(service: Service) {
    const hasInPerson = service.payment_type === 'none' || (service.payment_type === 'full' && profile?.payment_methods?.includes('in_person'))
    const hasOnline = service.payment_type === 'full'
    if (hasOnline && hasInPerson) return '💵 Pay in Person · 💳 Pay Online'
    if (hasOnline) return '💳 Pay Online'
    return '💵 Pay in Person'
  }

  const today = new Date().toISOString().split('T')[0]
  const todayAppts = appointments.filter(a => a.appointment_date === today)
  const upcomingAppts = appointments.filter(a => a.appointment_date > today)
  const thisMonthAppts = appointments.filter(a => a.appointment_date.startsWith(new Date().toISOString().slice(0, 7)))
  const monthRevenue = thisMonthAppts.reduce((sum, a) => sum + (a.services?.price || 0), 0)
  const isBasic = profile?.plan !== 'pro'
  const apptLimitPct = Math.min((monthlyApptCount / 30) * 100, 100)

  function formatTime(time: string) {
    const [h, m] = time.split(':'); const hour = parseInt(h)
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
  }
  function formatDate(date: string) {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }
  function getInitials(name: string) { return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) }
  function getPaymentLabel(method: string) { return method === 'online' ? '💳 Pay Online' : '💵 Pay in Person' }

  const avatarColors = [
    { bg: '#D8F3DC', text: '#1A3329' }, { bg: '#FDE8D8', text: '#7C2D12' },
    { bg: '#E8E4F8', text: '#3730A3' }, { bg: '#FEF3C7', text: '#78350F' }, { bg: '#FCE7F3', text: '#831843' },
  ]
  function getAvatarColor(name: string) { return avatarColors[name.charCodeAt(0) % avatarColors.length] }

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
        .service-row { border-bottom: 1px solid #EDE9DF; transition: background 0.15s; }
        .service-row:hover { background: #F5F2EB; }
        .service-row:last-child { border-bottom: none; }
        input:focus, textarea:focus { outline: none; border-color: #2D6A4F !important; box-shadow: 0 0 0 3px rgba(45,106,79,0.08); }
      `}</style>

      <div className="min-h-screen flex" style={{ background: '#F5F2EB' }}>
        {/* SIDEBAR */}
        <aside className="w-60 flex-shrink-0 flex flex-col sticky top-0 h-screen" style={{ background: '#FDFBF7', borderRight: '1px solid #EDE9DF' }}>
          <div className="px-6 pt-8 pb-6" style={{ borderBottom: '1px solid #EDE9DF' }}>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#1A3329' }}>
                <svg width="16" height="16" viewBox="0 0 100 100" fill="#D8F3DC">
                  <ellipse cx="50" cy="70" rx="26" ry="20"/><ellipse cx="20" cy="44" rx="12" ry="15"/>
                  <ellipse cx="38" cy="33" rx="12" ry="15"/><ellipse cx="62" cy="33" rx="12" ry="15"/><ellipse cx="80" cy="44" rx="12" ry="15"/>
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

          <nav className="flex-1 px-4 py-5 space-y-1">
            {[
              { label: 'Dashboard', emoji: '▤', page: 'dashboard' },
              { label: 'Appointments', emoji: '📅', page: 'appointments' },
              { label: 'Clients', emoji: '👥', page: 'clients' },
              { label: 'Edit Services', emoji: '✂️', page: 'services' },
              { label: 'Reports', emoji: '📊', page: 'reports' },
              { label: 'Settings', emoji: '⚙', page: 'settings' },
            ].map((item, i) => (
              <button key={i}
                onClick={() => setActivePage(item.page as typeof activePage)}
                className={`nav-item w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-left ${activePage === item.page ? 'nav-active' : ''}`}
                style={{ color: activePage === item.page ? 'white' : '#6B7280' }}>
                <span className="text-base">{item.emoji}</span>
                <span className="flex-1">{item.label}</span>
                {item.page === 'reports' && isBasic && <span className="text-xs" style={{ color: '#D1D5DB' }}>🔒</span>}
              </button>
            ))}
          </nav>

          {isBasic && (
            <div className="px-4 pb-4">
              <div className="rounded-xl p-3" style={{ background: monthlyApptCount >= 30 ? '#FEE2E2' : '#F5F2EB', border: `1px solid ${monthlyApptCount >= 30 ? '#FECACA' : '#EDE9DF'}` }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold" style={{ color: monthlyApptCount >= 30 ? '#DC2626' : '#1A3329' }}>Appointments</div>
                  <div className="text-xs font-bold" style={{ color: monthlyApptCount >= 30 ? '#DC2626' : '#2D6A4F' }}>{monthlyApptCount}/30</div>
                </div>
                <div className="w-full rounded-full h-1.5" style={{ background: '#EDE9DF' }}>
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${apptLimitPct}%`, background: monthlyApptCount >= 30 ? '#DC2626' : monthlyApptCount >= 24 ? '#F59E0B' : '#2D6A4F' }} />
                </div>
                <div className="text-xs mt-1.5" style={{ color: '#9CA3AF' }}>
                  {monthlyApptCount >= 30 ? 'Limit reached · Upgrade for unlimited' : `${30 - monthlyApptCount} remaining this month`}
                </div>
              </div>
            </div>
          )}

          <div className="px-4 pb-6" style={{ borderTop: '1px solid #EDE9DF', paddingTop: '16px' }}>
            <button onClick={handleSignOut} className="nav-item w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-left" style={{ color: '#9CA3AF' }}>
              <span>↪</span> Sign out
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 overflow-auto scrollbar-none">

          {/* DASHBOARD */}
          {activePage === 'dashboard' && (
            <>
              <header className="flex items-center justify-between px-8 py-6" style={{ borderBottom: '1px solid #EDE9DF', background: '#FDFBF7' }}>
                <div>
                  <h1 className="playfair text-2xl font-semibold" style={{ color: '#1A3329', fontFamily: 'Playfair Display, serif' }}>
                    {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}
                  </h1>
                  <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </header>
              <div className="px-8 py-7 space-y-6 max-w-5xl">
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl p-5 flex items-center justify-between" style={{ background: '#FDFBF7', border: '1px solid #EDE9DF' }}>
                    <div>
                      <div className="font-semibold text-sm mb-0.5" style={{ color: '#1A3329' }}>Your Booking Link</div>
                      <div className="text-xs" style={{ color: '#9CA3AF' }}>Share this with clients</div>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/book/${profile?.business_name?.toLowerCase().replace(/\s+/g, '-')}`); alert('Copied!') }}
                      className="action-btn px-4 py-2 rounded-xl text-sm font-semibold"
                      style={{ background: '#F5F2EB', color: '#2D6A4F', border: '1px solid #D8F3DC' }}>Copy Link</button>
                  </div>
                  <div className="rounded-2xl p-5 flex items-center justify-between" style={{ background: '#FDFBF7', border: '1px solid #EDE9DF' }}>
                    <div>
                      <div className="font-semibold text-sm mb-0.5" style={{ color: '#1A3329' }}>SMS Reminders</div>
                      <div className="text-xs" style={{ color: '#9CA3AF' }}>Auto-sending 24hr before</div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: '#D8F3DC', color: '#1A5C36' }}>
                      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#2D6A4F' }} />Active
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden" style={{ background: '#FDFBF7', border: '1px solid #EDE9DF' }}>
                  <div className="flex" style={{ borderBottom: '1px solid #EDE9DF' }}>
                    {(['today', 'upcoming'] as const).map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`tab-btn flex-1 py-4 text-sm px-6 text-left ${activeTab === tab ? 'tab-active-style' : ''}`}
                        style={{ color: activeTab === tab ? '#1A3329' : '#9CA3AF' }}>
                        {tab === 'today' ? `Today  ·  ${todayAppts.length}` : `Upcoming  ·  ${upcomingAppts.length}`}
                      </button>
                    ))}
                  </div>
                  {displayAppts.length === 0 ? (
                    <div className="py-20 text-center">
                      <div className="text-4xl mb-4">🐾</div>
                      <div className="font-medium mb-1" style={{ color: '#6B7280' }}>No appointments {activeTab === 'today' ? 'today' : 'coming up'}</div>
                      <div className="text-sm mb-6" style={{ color: '#9CA3AF' }}>Add one to fill your schedule</div>
                      <button onClick={() => router.push('/appointments/new')} className="btn-new px-6 py-2.5 rounded-xl text-white text-sm font-semibold">Add Appointment</button>
                    </div>
                  ) : displayAppts.map(appt => {
                    const color = getAvatarColor(appt.client_name)
                    return (
                      <div key={appt.id} onClick={() => setSelectedAppt(appt)} className="appt-row flex items-center justify-between px-6 py-4 cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: color.bg, color: color.text }}>{getInitials(appt.client_name)}</div>
                          <div>
                            <div className="font-semibold text-sm" style={{ color: '#1A3329' }}>{appt.client_name}</div>
                            <div className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: '#9CA3AF' }}>
                              <span>{appt.dog_name}</span>
                              {appt.services?.name && <><span>·</span><span>{appt.services.name}</span></>}
                              <span>·</span><span>{getPaymentLabel(appt.payment_method)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          {activeTab === 'upcoming' && <div className="text-sm" style={{ color: '#6B7280' }}>{formatDate(appt.appointment_date)}</div>}
                          <div className="text-right">
                            <div className="font-semibold text-sm" style={{ color: '#1A3329' }}>{formatTime(appt.appointment_time)}</div>
                            {appt.services?.price ? <div className="text-xs font-semibold mt-0.5" style={{ color: '#2D6A4F' }}>${appt.services.price}</div> : null}
                          </div>
                          <div style={{ color: '#D1D5DB' }}>›</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* APPOINTMENTS */}
          {activePage === 'appointments' && (
            <>
              <header className="flex items-center justify-between px-8 py-6" style={{ borderBottom: '1px solid #EDE9DF', background: '#FDFBF7' }}>
                <div>
                  <h1 className="playfair text-2xl font-semibold" style={{ color: '#1A3329', fontFamily: 'Playfair Display, serif' }}>Appointments</h1>
                  <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>All your upcoming appointments</p>
                </div>
                <button onClick={() => router.push('/appointments/new')} className="btn-new flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold">+ New Appointment</button>
              </header>
              <div className="px-8 py-7 max-w-5xl">
                <div className="rounded-2xl overflow-hidden" style={{ background: '#FDFBF7', border: '1px solid #EDE9DF' }}>
                  {appointments.length === 0 ? (
                    <div className="py-20 text-center">
                      <div className="text-4xl mb-4">📅</div>
                      <div className="font-medium mb-1" style={{ color: '#6B7280' }}>No appointments yet</div>
                      <div className="text-sm mb-6" style={{ color: '#9CA3AF' }}>Add one to get started</div>
                      <button onClick={() => router.push('/appointments/new')} className="btn-new px-6 py-2.5 rounded-xl text-white text-sm font-semibold">Add Appointment</button>
                    </div>
                  ) : appointments.map(appt => {
                    const color = getAvatarColor(appt.client_name)
                    return (
                      <div key={appt.id} onClick={() => setSelectedAppt(appt)} className="appt-row flex items-center justify-between px-6 py-4 cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: color.bg, color: color.text }}>{getInitials(appt.client_name)}</div>
                          <div>
                            <div className="font-semibold text-sm" style={{ color: '#1A3329' }}>{appt.client_name}</div>
                            <div className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: '#9CA3AF' }}>
                              <span>{appt.dog_name}</span>
                              {appt.services?.name && <><span>·</span><span>{appt.services.name}</span></>}
                              <span>·</span><span>{getPaymentLabel(appt.payment_method)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-sm" style={{ color: '#6B7280' }}>{formatDate(appt.appointment_date)}</div>
                          <div className="text-right">
                            <div className="font-semibold text-sm" style={{ color: '#1A3329' }}>{formatTime(appt.appointment_time)}</div>
                            {appt.services?.price ? <div className="text-xs font-semibold mt-0.5" style={{ color: '#2D6A4F' }}>${appt.services.price}</div> : null}
                          </div>
                          {appt.status === 'completed'
                            ? <div className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: '#D8F3DC', color: '#1A5C36' }}>✓ Done</div>
                            : <div style={{ color: '#D1D5DB' }}>›</div>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* CLIENTS */}
          {activePage === 'clients' && (
            <>
              <header className="px-8 py-6" style={{ borderBottom: '1px solid #EDE9DF', background: '#FDFBF7' }}>
                <h1 className="playfair text-2xl font-semibold" style={{ color: '#1A3329', fontFamily: 'Playfair Display, serif' }}>Clients</h1>
                <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>Your client list and their dogs</p>
              </header>
              <div className="px-8 py-7 max-w-5xl">
                <div className="rounded-2xl overflow-hidden" style={{ background: '#FDFBF7', border: '1px solid #EDE9DF' }}>
                  {appointments.length === 0 ? (
                    <div className="py-20 text-center">
                      <div className="text-4xl mb-4">👥</div>
                      <div className="font-medium mb-1" style={{ color: '#6B7280' }}>No clients yet</div>
                      <div className="text-sm" style={{ color: '#9CA3AF' }}>Clients appear here once they book an appointment</div>
                    </div>
                  ) : [...new Map(appointments.map(a => [a.client_name, a])).values()].map(appt => {
                    const color = getAvatarColor(appt.client_name)
                    const clientAppts = appointments.filter(a => a.client_name === appt.client_name)
                    return (
                      <div key={appt.client_name} className="appt-row flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: color.bg, color: color.text }}>{getInitials(appt.client_name)}</div>
                          <div>
                            <div className="font-semibold text-sm" style={{ color: '#1A3329' }}>{appt.client_name}</div>
                            <div className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: '#9CA3AF' }}>
                              <span>🐾 {appt.dog_name}</span>
                              {appt.dog_breed && <><span>·</span><span>{appt.dog_breed}</span></>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-sm" style={{ color: '#6B7280' }}>{clientAppts.length} appointment{clientAppts.length !== 1 ? 's' : ''}</div>
                          <div className="flex flex-col items-end gap-1">
                            <a href={`tel:${appt.client_phone}`} className="text-sm font-medium" style={{ color: '#2D6A4F' }}>{appt.client_phone}</a>
                            {appt.client_email && <a href={`mailto:${appt.client_email}`} className="text-xs" style={{ color: '#9CA3AF' }}>{appt.client_email}</a>}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* REPORTS */}
          {activePage === 'reports' && <ReportsPage profile={profile} supabase={supabase} router={router} />}

          {/* SETTINGS */}
          {activePage === 'settings' && (
            <SettingsPage
              profile={profile}
              onBusinessNameUpdate={(name) => setProfile(prev => prev ? { ...prev, business_name: name } : prev)}
              onReviewLinkUpdate={(link) => setProfile(prev => prev ? { ...prev, google_review_link: link } : prev)}
              supabase={supabase}
              router={router}
            />
          )}

          {/* SERVICES */}
          {activePage === 'services' && (
            <>
              <header className="flex items-center justify-between px-8 py-6" style={{ borderBottom: '1px solid #EDE9DF', background: '#FDFBF7' }}>
                <div>
                  <h1 className="playfair text-2xl font-semibold" style={{ color: '#1A3329', fontFamily: 'Playfair Display, serif' }}>Edit Services</h1>
                  <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>Manage the services you offer and their prices</p>
                </div>
              </header>
              <div className="px-8 py-7 max-w-2xl space-y-6">
                <div className="rounded-2xl p-6" style={{ background: '#FDFBF7', border: '1px solid #EDE9DF' }}>
                  <h2 className="font-semibold mb-4" style={{ color: '#1A3329' }}>Add a Service</h2>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>Service Name</label>
                      <input type="text" value={newServiceName} onChange={e => setNewServiceName(e.target.value)} placeholder="Full Groom"
                        className="w-full px-4 py-3 rounded-xl text-sm" style={{ background: '#F5F2EB', border: '1px solid #EDE9DF', color: '#1A3329' }}
                        onKeyDown={e => e.key === 'Enter' && handleAddService()} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>Price ($)</label>
                      <input type="number" value={newServicePrice} onChange={e => setNewServicePrice(e.target.value)} placeholder="65"
                        className="w-full px-4 py-3 rounded-xl text-sm" style={{ background: '#F5F2EB', border: '1px solid #EDE9DF', color: '#1A3329' }}
                        onKeyDown={e => e.key === 'Enter' && handleAddService()} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>Payment Options <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(select all that apply)</span></label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        ...(profile?.payment_methods?.includes('in_person') ? [{ value: 'in_person', label: '💵 Pay in Person', desc: 'Cash or Card' }] : []),
                        ...(profile?.payment_methods?.includes('online') ? [{ value: 'online', label: '💳 Pay Online', desc: 'Client pays upfront' }] : []),
                      ].map(opt => (
                        <button key={opt.value} type="button"
                          onClick={() => setNewPaymentTypes(prev => prev.includes(opt.value) ? prev.filter(p => p !== opt.value) : [...prev, opt.value])}
                          className="p-3 rounded-xl text-left transition-all"
                          style={{ border: newPaymentTypes.includes(opt.value) ? '2px solid #1A3329' : '2px solid #EDE9DF', background: newPaymentTypes.includes(opt.value) ? '#D8F3DC' : '#F5F2EB' }}>
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-semibold" style={{ color: '#1A3329' }}>{opt.label}</div>
                            <div className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0"
                              style={{ borderColor: newPaymentTypes.includes(opt.value) ? '#1A3329' : '#D1C9B8', background: newPaymentTypes.includes(opt.value) ? '#1A3329' : 'transparent' }}>
                              {newPaymentTypes.includes(opt.value) && <span className="text-white" style={{ fontSize: '10px' }}>✓</span>}
                            </div>
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  {serviceError && <p className="text-xs mb-3" style={{ color: '#DC2626' }}>{serviceError}</p>}
                  <button onClick={handleAddService} className="btn-new px-5 py-2.5 rounded-xl text-white text-sm font-semibold">+ Add Service</button>
                </div>
                <div className="rounded-2xl overflow-hidden" style={{ background: '#FDFBF7', border: '1px solid #EDE9DF' }}>
                  <div className="px-6 py-4" style={{ borderBottom: '1px solid #EDE9DF' }}>
                    <h2 className="font-semibold text-sm" style={{ color: '#1A3329' }}>Your Services ({services.length})</h2>
                  </div>
                  {services.length === 0 ? (
                    <div className="py-12 text-center"><div className="text-3xl mb-3">✂️</div><div className="text-sm" style={{ color: '#9CA3AF' }}>No services added yet</div></div>
                  ) : services.map(service => (
                    <div key={service.id} className="service-row px-6 py-4">
                      {editingService?.id === service.id ? (
                        <div className="flex items-center gap-3">
                          <input type="text" value={editingService.name} onChange={e => setEditingService({ ...editingService, name: e.target.value })}
                            className="flex-1 px-3 py-2 rounded-lg text-sm" style={{ background: '#F5F2EB', border: '1px solid #EDE9DF', color: '#1A3329' }} />
                          <input type="number" value={editingService.price} onChange={e => setEditingService({ ...editingService, price: parseFloat(e.target.value) || 0 })}
                            className="w-24 px-3 py-2 rounded-lg text-sm" style={{ background: '#F5F2EB', border: '1px solid #EDE9DF', color: '#1A3329' }} />
                          <button onClick={handleUpdateService} className="px-4 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: '#1A3329' }}>Save</button>
                          <button onClick={() => setEditingService(null)} className="px-4 py-2 rounded-lg text-xs font-semibold" style={{ background: '#F5F2EB', color: '#6B7280' }}>Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: '#D8F3DC' }}>✂️</div>
                            <div>
                              <div className="font-semibold text-sm" style={{ color: '#1A3329' }}>{service.name}</div>
                              <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{getServicePaymentLabel(service)}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-sm" style={{ color: '#2D6A4F' }}>${service.price}</span>
                            <button onClick={() => setEditingService(service)} className="text-xs px-3 py-1.5 rounded-lg transition-all" style={{ background: '#F5F2EB', color: '#6B7280', border: '1px solid #EDE9DF' }}>Edit</button>
                            <button onClick={() => handleDeleteService(service.id)} className="text-xs px-3 py-1.5 rounded-lg transition-all" style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }}>Delete</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>💡 These services appear as options when adding appointments and on your public booking page. Prices are locked for clients.</p>
              </div>
            </>
          )}

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
              <div className="flex items-center gap-2">
                {selectedAppt.status === 'completed' && (
                  <div className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: '#D8F3DC', color: '#1A5C36' }}>✓ Completed</div>
                )}
                <button onClick={() => setSelectedAppt(null)} className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: '#F5F2EB', color: '#6B7280' }}>✕</button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#F5F2EB' }}>
                <div>
                  <div className="text-xs uppercase tracking-widest font-medium mb-1" style={{ color: '#9CA3AF' }}>Service</div>
                  <div className="font-semibold" style={{ color: '#1A3329' }}>{selectedAppt.services?.name || 'Appointment'}</div>
                </div>
                <div className="playfair text-2xl font-semibold" style={{ color: '#2D6A4F', fontFamily: 'Playfair Display, serif' }}>${selectedAppt.services?.price || 0}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest font-medium mb-2" style={{ color: '#9CA3AF' }}>Dog</div>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1.5 rounded-full text-sm font-medium" style={{ background: '#D8F3DC', color: '#1A5C36' }}>🐾 {selectedAppt.dog_name}</span>
                  {selectedAppt.dog_breed && <span className="px-3 py-1.5 rounded-full text-sm" style={{ background: '#F5F2EB', color: '#6B7280' }}>{selectedAppt.dog_breed}</span>}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest font-medium mb-2" style={{ color: '#9CA3AF' }}>Contact</div>
                <div className="space-y-2">
                  <a href={`tel:${selectedAppt.client_phone}`} className="action-btn flex items-center gap-3 p-3 rounded-xl" style={{ background: '#F5F2EB', border: '1px solid #EDE9DF' }}>
                    <span>📞</span><span className="text-sm font-medium" style={{ color: '#1A3329' }}>{selectedAppt.client_phone}</span>
                  </a>
                  {selectedAppt.client_email && (
                    <a href={`mailto:${selectedAppt.client_email}`} className="action-btn flex items-center gap-3 p-3 rounded-xl" style={{ background: '#F5F2EB', border: '1px solid #EDE9DF' }}>
                      <span>✉️</span><span className="text-sm font-medium" style={{ color: '#1A3329' }}>{selectedAppt.client_email}</span>
                    </a>
                  )}
                </div>
              </div>
              {selectedAppt.notes && (
                <div>
                  <div className="text-xs uppercase tracking-widest font-medium mb-2" style={{ color: '#9CA3AF' }}>Notes</div>
                  <div className="p-3 rounded-xl text-sm" style={{ background: '#F5F2EB', color: '#6B7280', border: '1px solid #EDE9DF' }}>{selectedAppt.notes}</div>
                </div>
              )}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              {selectedAppt.status !== 'completed' && (
                <button onClick={() => handleMarkComplete(selectedAppt.id)} disabled={completingAppt === selectedAppt.id}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 transition-all"
                  style={{ background: '#D8F3DC', color: '#1A5C36', border: '1px solid #B7E4C7' }}>
                  {completingAppt === selectedAppt.id ? 'Saving...' : '✓ Mark Complete'}
                </button>
              )}
              {selectedAppt.status !== 'completed' && (
                <button onClick={() => router.push(`/appointments/new?edit=${selectedAppt.id}`)}
                  className="py-3 px-4 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: '#1A3329', color: 'white' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#2D6A4F')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#1A3329')}>
                  Edit
                </button>
              )}
              <button onClick={() => { if (confirm('Delete this appointment?')) handleDelete(selectedAppt.id) }}
                className="py-3 px-4 rounded-xl text-sm font-semibold"
                style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
