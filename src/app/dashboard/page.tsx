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
  noShowRate: number
  reviewsGenerated: number
}

// ─── REPORTS PAGE ─────────────────────────────────────────────────────────────
function ReportsPage({ profile, supabase, router }: {
  profile: Profile | null
  supabase: ReturnType<typeof createClient>
  router: ReturnType<typeof useRouter>
}) {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const canAccessReports = ['essential', 'professional'].includes(profile?.plan || '')

  useEffect(() => {
    if (!canAccessReports) { setLoading(false); return }
    async function loadReports() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: allAppts } = await supabase
        .from('appointments').select('*, services(name, price)').eq('profile_id', user.id)
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
        .sort((a, b) => b.revenue - a.revenue).slice(0, 5)

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
      const noShowRate = 0
      const reviewsGenerated = 0

      setReportData({ monthlyRevenue, topServices, newVsReturning: { new: newClients, returning: returningClients }, avgRevenuePerAppt, totalRevenue, totalAppointments, noShowRate, reviewsGenerated })
      setLoading(false)
    }
    loadReports()
  }, [canAccessReports])

  const maxRevenue = reportData ? Math.max(...reportData.monthlyRevenue.map(m => m.revenue), 1) : 1
  const totalClients = reportData ? reportData.newVsReturning.new + reportData.newVsReturning.returning : 0

  const BlurredContent = () => (
    <div className="relative">
      <div style={{ filter: 'blur(6px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.5 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
          {[['Total Revenue', '$2,840'], ['Appointments', '38'], ['Avg per Appt', '$74']].map(([label, val]) => (
            <div key={label} className="dash-card rounded-2xl p-5">
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9CA3AF', marginBottom: '8px' }}>{label}</div>
              <div className="playfair" style={{ fontSize: '32px', fontWeight: 700, color: '#1A3329' }}>{val}</div>
            </div>
          ))}
        </div>
        <div className="dash-card rounded-2xl p-6 mb-4">
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A3329', marginBottom: '16px' }}>Monthly Revenue</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px' }}>
            {[40, 65, 45, 80, 55, 90].map((h, i) => (
              <div key={i} style={{ flex: 1, borderRadius: '4px 4px 0 0', height: `${h}%`, background: 'linear-gradient(180deg, #2D6A4F, #1A3329)', opacity: 0.7 }} />
            ))}
          </div>
        </div>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl" style={{ background: 'rgba(245,242,235,0.8)', backdropFilter: 'blur(2px)' }}>
        <div style={{ fontSize: '36px', marginBottom: '16px' }}>📊</div>
        <div className="playfair" style={{ fontSize: '20px', fontWeight: 700, color: '#1A3329', marginBottom: '8px', textAlign: 'center' }}>Advanced Analytics</div>
        <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px', textAlign: 'center', maxWidth: '280px' }}>
          Revenue trends, no-show rates, top services & client retention — available on Essential and Professional plans.
        </div>
        <button onClick={() => router.push('/pricing')}
          style={{ padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: 'white', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #1A3329, #2D6A4F)', boxShadow: '0 4px 15px rgba(26,51,41,0.25)' }}>
          Upgrade to Essential — $44/mo →
        </button>
      </div>
    </div>
  )

  return (
    <>
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="playfair" style={{ fontSize: '22px', fontWeight: 600, color: '#1A3329', letterSpacing: '-0.02em' }}>Reports</h1>
            <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>Your business performance at a glance</p>
          </div>
          {canAccessReports && <div style={{ padding: '6px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: 700, background: profile?.plan === 'professional' ? 'linear-gradient(135deg, #FDE8D8, #fdd5b9)' : 'linear-gradient(135deg, #D8F3DC, #c8eacd)', color: profile?.plan === 'professional' ? '#7C2D12' : '#1A5C36', border: '1px solid rgba(45,106,79,0.12)' }}>⭐ {profile?.plan === 'professional' ? 'Professional' : 'Essential'}</div>}
        </div>
      </header>
      <div className="page-content">
        {!canAccessReports ? <BlurredContent /> : loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#2D6A4F', borderTopColor: 'transparent' }} />
          </div>
        ) : reportData ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="report-stats-grid">
              <div className="stat-card rounded-2xl p-5" style={{ background: 'linear-gradient(145deg, #1A3329, #0f2218)', boxShadow: '0 8px 24px rgba(15,34,24,0.25)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(216,243,220,0.5)', marginBottom: '8px' }}>Total Revenue</div>
                <div className="playfair" style={{ fontSize: '32px', fontWeight: 600, color: 'white', letterSpacing: '-0.02em' }}>${reportData.totalRevenue}</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>All time</div>
              </div>
              <div className="stat-card dash-card rounded-2xl p-5">
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9CA3AF', marginBottom: '8px' }}>Appointments</div>
                <div className="playfair" style={{ fontSize: '32px', fontWeight: 600, color: '#1A3329', letterSpacing: '-0.02em' }}>{reportData.totalAppointments}</div>
                <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>All time</div>
              </div>
              <div className="stat-card dash-card rounded-2xl p-5">
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9CA3AF', marginBottom: '8px' }}>Avg per Appt</div>
                <div className="playfair" style={{ fontSize: '32px', fontWeight: 600, color: '#1A3329', letterSpacing: '-0.02em' }}>${reportData.avgRevenuePerAppt}</div>
                <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>All time</div>
              </div>
            </div>
            <div className="dash-card rounded-2xl p-5">
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A3329', marginBottom: '20px' }}>Monthly Revenue — Last 6 Months</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '140px' }}>
                {reportData.monthlyRevenue.map((m, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#2D6A4F' }}>{m.revenue > 0 ? `$${m.revenue}` : ''}</div>
                    <div style={{ width: '100%', borderRadius: '4px 4px 0 0', height: `${Math.max((m.revenue / maxRevenue) * 110, m.revenue > 0 ? 8 : 2)}px`, background: i === reportData.monthlyRevenue.length - 1 ? 'linear-gradient(180deg, #2D6A4F, #1A3329)' : 'linear-gradient(180deg, #D8F3DC, #c8eacd)' }} />
                    <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{m.month}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="dash-card rounded-2xl p-5">
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A3329', marginBottom: '16px' }}>Top Services by Revenue</div>
              {reportData.topServices.length === 0 ? (
                <div style={{ fontSize: '14px', color: '#9CA3AF', textAlign: 'center', padding: '16px 0' }}>No service data yet</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {reportData.topServices.map((s, i) => (
                    <div key={s.name}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, background: i === 0 ? 'linear-gradient(135deg, #1A3329, #2D6A4F)' : '#D8F3DC', color: i === 0 ? 'white' : '#1A5C36' }}>{i + 1}</div>
                          <span style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>{s.name}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#2D6A4F' }}>${s.revenue}</div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{s.count} bookings</div>
                        </div>
                      </div>
                      <div style={{ width: '100%', height: '6px', borderRadius: '50px', background: '#EDE9DF' }}>
                        <div style={{ height: '6px', borderRadius: '50px', width: `${(s.revenue / reportData.topServices[0].revenue) * 100}%`, background: 'linear-gradient(90deg, #2D6A4F, #45a070)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="dash-card rounded-2xl p-5">
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A3329', marginBottom: '16px' }}>New vs Returning Clients</div>
              {totalClients === 0 ? (
                <div style={{ fontSize: '14px', color: '#9CA3AF', textAlign: 'center', padding: '16px 0' }}>No client data yet</div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div className="playfair" style={{ fontSize: '36px', fontWeight: 700, color: '#1A3329', letterSpacing: '-0.02em' }}>{reportData.newVsReturning.new}</div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>New Clients</div>
                    </div>
                    <div style={{ width: '1px', height: '40px', background: '#EDE9DF' }} />
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div className="playfair" style={{ fontSize: '36px', fontWeight: 700, color: '#2D6A4F', letterSpacing: '-0.02em' }}>{reportData.newVsReturning.returning}</div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Returning</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9CA3AF', marginBottom: '6px' }}>
                    <span>Retention rate</span>
                    <span style={{ color: '#2D6A4F', fontWeight: 600 }}>{totalClients > 0 ? Math.round((reportData.newVsReturning.returning / totalClients) * 100) : 0}%</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', borderRadius: '50px', background: '#EDE9DF', overflow: 'hidden' }}>
                    <div style={{ height: '10px', borderRadius: '50px', width: `${totalClients > 0 ? (reportData.newVsReturning.returning / totalClients) * 100 : 0}%`, background: 'linear-gradient(90deg, #2D6A4F, #45a070)' }} />
                  </div>
                  <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '10px' }}>
                    {reportData.newVsReturning.returning > 0 ? `${reportData.newVsReturning.returning} clients have booked more than once 🐾` : 'Build repeat business with rebooking reminders'}
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#9CA3AF' }}>No data available yet</div>
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
    setSavingName(true); setNameError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').update({ business_name: newName.trim() }).eq('id', user.id)
    if (error) { setNameError(error.message); setSavingName(false); return }
    onBusinessNameUpdate(newName.trim()); setEditingName(false); setSavingName(false)
  }

  async function handleSaveReviewLink() {
    setSavingReviewLink(true); setReviewLinkError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').update({ google_review_link: newReviewLink.trim() }).eq('id', user.id)
    if (error) { setReviewLinkError(error.message); setSavingReviewLink(false); return }
    onReviewLinkUpdate(newReviewLink.trim()); setEditingReviewLink(false); setSavingReviewLink(false)
  }

  async function handleManagePlan() {
    setPortalLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setPortalLoading(false); return }
    const res = await fetch('/api/create-portal-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id }) })
    const data = await res.json()
    if (data.url) { window.location.href = data.url } else { console.error('Portal error:', data.error); setPortalLoading(false) }
  }

  const isEssential = profile?.plan === 'essential'
  const isProfessional = profile?.plan === 'professional'
  const isStarter = profile?.plan === 'starter'

  const starterFeatures = ['Online booking page', 'Up to 25 appointments/mo', 'SMS appointment reminders', 'Instant booking notifications', 'Client history']
  const starterLocked = ['Unlimited appointments', 'Auto review requests', 'Monthly reports', 'Smart rebooking reminders', 'Priority support']
  const essentialFeatures = ['Online booking page', 'Unlimited appointments', 'SMS appointment reminders', 'Auto review requests after jobs', 'Monthly revenue & booking reports', 'Smart rebooking reminders', 'Instant booking notifications', 'Client history', 'Priority email support', 'Early access to new features']
  const essentialLocked = ['Priority phone support', 'Custom booking page branding', 'Team member support', 'Advanced analytics & insights', 'Custom integrations']
  const professionalFeatures = ['Everything in Essential', 'Priority phone support', 'Custom booking page branding', 'Team member support (Q3 2026)', 'Advanced analytics & insights', 'Custom integrations']

  return (
    <>
      <header className="page-header">
        <h1 className="playfair" style={{ fontSize: '22px', fontWeight: 600, color: '#1A3329', letterSpacing: '-0.02em' }}>Settings</h1>
        <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>Manage your account and preferences</p>
      </header>
      <div className="page-content">

        <div className="dash-card rounded-2xl p-5" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A3329' }}>Business Name</div>
            {!editingName && (
              <button onClick={() => { setEditingName(true); setNewName(profile?.business_name || '') }}
                style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F2EB', border: '1px solid #EDE9DF', cursor: 'pointer' }}>✏️</button>
            )}
          </div>
          {editingName ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', background: '#F5F2EB', border: '1px solid #EDE9DF', color: '#1A3329' }}
                onKeyDown={e => e.key === 'Enter' && handleSaveName()} />
              {nameError && <p style={{ fontSize: '12px', color: '#DC2626' }}>{nameError}</p>}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleSaveName} disabled={savingName}
                  style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: 'white', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #1A3329, #2D6A4F)', opacity: savingName ? 0.5 : 1 }}>
                  {savingName ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => { setEditingName(false); setNameError('') }}
                  style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#6B7280', border: 'none', cursor: 'pointer', background: '#F5F2EB' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '14px', color: '#6B7280' }}>{profile?.business_name}</div>
          )}
        </div>

        {(isEssential || isProfessional) && (
          <div className="dash-card rounded-2xl p-5" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A3329' }}>Google Review Link</div>
                <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>Sent to clients after every completed appointment</div>
              </div>
              {!editingReviewLink && (
                <button onClick={() => { setEditingReviewLink(true); setNewReviewLink(profile?.google_review_link || '') }}
                  style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F2EB', border: '1px solid #EDE9DF', cursor: 'pointer', flexShrink: 0, marginLeft: '12px' }}>✏️</button>
              )}
            </div>
            {editingReviewLink ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                <input type="url" value={newReviewLink} onChange={e => setNewReviewLink(e.target.value)}
                  placeholder="https://g.page/r/your-review-link"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', background: '#F5F2EB', border: '1px solid #EDE9DF', color: '#1A3329' }}
                  onKeyDown={e => e.key === 'Enter' && handleSaveReviewLink()} />
                <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Google Maps → your business → Share → Copy link</p>
                {reviewLinkError && <p style={{ fontSize: '12px', color: '#DC2626' }}>{reviewLinkError}</p>}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleSaveReviewLink} disabled={savingReviewLink}
                    style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: 'white', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #1A3329, #2D6A4F)', opacity: savingReviewLink ? 0.5 : 1 }}>
                    {savingReviewLink ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => { setEditingReviewLink(false); setReviewLinkError('') }}
                    style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#6B7280', border: 'none', cursor: 'pointer', background: '#F5F2EB' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: '8px' }}>
                {profile?.google_review_link ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⭐</span>
                    <a href={profile.google_review_link} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#2D6A4F', wordBreak: 'break-all' }}>{profile.google_review_link}</a>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '10px', background: '#FEF3C7', border: '1px solid #FDE68A' }}>
                    <span>⚠️</span>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#92400E' }}>Add your Google review link to enable auto review requests</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="dash-card rounded-2xl p-5">
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A3329', marginBottom: '24px' }}>Your Plan</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }} className="plan-grid">
            {/* STARTER CARD */}
            <div style={{ borderRadius: '16px', padding: '20px', position: 'relative', background: isStarter ? 'linear-gradient(145deg, #1A3329, #0f2218)' : '#FDFBF7', border: isStarter ? 'none' : '1.5px solid #EDE9DF', boxShadow: isStarter ? '0 8px 24px rgba(15,34,24,0.2)' : 'none', display: 'flex', flexDirection: 'column' }}>
              {isStarter && <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '50px', background: 'rgba(255,255,255,0.12)', color: 'white' }}>Current</div>}
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: isStarter ? 'rgba(255,255,255,0.45)' : '#9CA3AF', marginBottom: '8px' }}>Starter</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '16px' }}>
                <span className="playfair" style={{ fontSize: '32px', fontWeight: 700, color: isStarter ? 'white' : '#1A3329' }}>$24</span>
                <span style={{ fontSize: '12px', color: isStarter ? 'rgba(255,255,255,0.35)' : '#9CA3AF' }}>/mo</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {starterFeatures.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <svg style={{ marginTop: '3px', flexShrink: 0 }} width="14" height="14" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="10" fill={isStarter ? 'rgba(255,255,255,0.12)' : '#D8F3DC'} />
                      <path d="M6 10l3 3 5-5" stroke={isStarter ? 'white' : '#1A5C36'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontSize: '12px', color: isStarter ? 'rgba(255,255,255,0.8)' : '#374151', lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
                <div style={{ borderTop: isStarter ? '1px solid rgba(255,255,255,0.08)' : '1px solid #EDE9DF', margin: '8px 0' }} />
                {starterLocked.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <svg style={{ marginTop: '3px', flexShrink: 0 }} width="14" height="14" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="10" fill={isStarter ? 'rgba(255,255,255,0.05)' : '#F3F4F6'} />
                      <path d="M7 7l6 6M13 7l-6 6" stroke={isStarter ? 'rgba(255,255,255,0.2)' : '#D1D5DB'} strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span style={{ fontSize: '12px', color: isStarter ? 'rgba(255,255,255,0.2)' : '#C4C9D1', textDecoration: 'line-through', lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ESSENTIAL CARD */}
            <div style={{ borderRadius: '16px', padding: '20px', position: 'relative', background: isEssential ? 'linear-gradient(145deg, #1A3329, #0f2218)' : '#FDFBF7', border: isEssential ? 'none' : '1.5px solid #EDE9DF', boxShadow: isEssential ? '0 8px 24px rgba(15,34,24,0.2)' : 'none', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '50px', background: isEssential ? 'rgba(255,255,255,0.12)' : 'linear-gradient(135deg, #1A3329, #2D6A4F)', color: 'white' }}>⭐ Popular</div>
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: isEssential ? 'rgba(255,255,255,0.45)' : '#9CA3AF', marginBottom: '8px' }}>Essential</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '16px' }}>
                <span className="playfair" style={{ fontSize: '32px', fontWeight: 700, color: isEssential ? 'white' : '#1A3329' }}>$44</span>
                <span style={{ fontSize: '12px', color: isEssential ? 'rgba(255,255,255,0.35)' : '#9CA3AF' }}>/mo</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {essentialFeatures.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <svg style={{ marginTop: '3px', flexShrink: 0 }} width="14" height="14" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="10" fill={isEssential ? 'rgba(255,255,255,0.12)' : '#D8F3DC'} />
                      <path d="M6 10l3 3 5-5" stroke={isEssential ? 'white' : '#1A5C36'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontSize: '12px', color: isEssential ? 'rgba(255,255,255,0.8)' : '#374151', lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
                <div style={{ borderTop: isEssential ? '1px solid rgba(255,255,255,0.08)' : '1px solid #EDE9DF', margin: '8px 0' }} />
                {essentialLocked.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <svg style={{ marginTop: '3px', flexShrink: 0 }} width="14" height="14" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="10" fill={isEssential ? 'rgba(255,255,255,0.05)' : '#F3F4F6'} />
                      <path d="M7 7l6 6M13 7l-6 6" stroke={isEssential ? 'rgba(255,255,255,0.2)' : '#D1D5DB'} strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span style={{ fontSize: '12px', color: isEssential ? 'rgba(255,255,255,0.2)' : '#C4C9D1', textDecoration: 'line-through', lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PROFESSIONAL CARD */}
            <div style={{ borderRadius: '16px', padding: '20px', position: 'relative', background: isProfessional ? 'linear-gradient(145deg, #1A3329, #0f2218)' : '#FDFBF7', border: isProfessional ? 'none' : '1.5px solid #EDE9DF', boxShadow: isProfessional ? '0 8px 24px rgba(15,34,24,0.2)' : 'none', display: 'flex', flexDirection: 'column' }}>
              {isProfessional && <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '50px', background: 'rgba(255,255,255,0.12)', color: 'white' }}>Current</div>}
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: isProfessional ? 'rgba(255,255,255,0.45)' : '#9CA3AF', marginBottom: '8px' }}>Professional</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '16px' }}>
                <span className="playfair" style={{ fontSize: '32px', fontWeight: 700, color: isProfessional ? 'white' : '#1A3329' }}>$79</span>
                <span style={{ fontSize: '12px', color: isProfessional ? 'rgba(255,255,255,0.35)' : '#9CA3AF' }}>/mo</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {professionalFeatures.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <svg style={{ marginTop: '3px', flexShrink: 0 }} width="14" height="14" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="10" fill={isProfessional ? 'rgba(255,255,255,0.12)' : '#D8F3DC'} />
                      <path d="M6 10l3 3 5-5" stroke={isProfessional ? 'white' : '#1A5C36'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontSize: '12px', color: isProfessional ? 'rgba(255,255,255,0.8)' : '#374151', lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {!isEssential && !isProfessional ? (
            <button onClick={() => router.push('/pricing')}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: 'white', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #1A3329, #2D6A4F)', boxShadow: '0 4px 15px rgba(26,51,41,0.2)' }}>
              Upgrade to Essential — $44/mo →
            </button>
          ) : (
            <button onClick={handleManagePlan} disabled={portalLoading}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#6B7280', border: '1px solid #EDE9DF', cursor: 'pointer', background: '#F5F2EB', opacity: portalLoading ? 0.5 : 1 }}>
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
    setAppointments(prev => prev.filter(a => a.id !== id)); setSelectedAppt(null)
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
      profile_id: user.id, name: newServiceName.trim(), price: parseFloat(newServicePrice) || 0, duration_minutes: 60,
      payment_type: newPaymentTypes.includes('online') && newPaymentTypes.includes('in_person') ? 'full' : newPaymentTypes.includes('online') ? 'full' : 'none', deposit_amount: 0,
    }).select().single()
    if (error) { setServiceError(error.message); return }
    setServices(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    setNewServiceName(''); setNewServicePrice(''); setNewPaymentTypes([])
  }
  async function handleUpdateService() {
    if (!editingService) return; setServiceError('')
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
  const isStarter = profile?.plan === 'starter'
  const starterLimit = 25
  const apptLimitPct = Math.min((monthlyApptCount / starterLimit) * 100, 100)
  const bookingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/book/${profile?.business_name?.toLowerCase().replace(/\s+/g, '-')}`
    : `https://pawbooking.net/book/${profile?.business_name?.toLowerCase().replace(/\s+/g, '-')}`

  function formatTime(time: string) {
    const [h, m] = time.split(':'); const hour = parseInt(h)
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
  }
  function formatDate(date: string) {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }
  function getInitials(name: string) { return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) }
  function getPaymentLabel(method: string) { return method === 'online' ? '💳 Online' : '💵 In Person' }

  const avatarColors = [
    { bg: '#D8F3DC', text: '#1A3329' }, { bg: '#FDE8D8', text: '#7C2D12' },
    { bg: '#E8E4F8', text: '#3730A3' }, { bg: '#FEF3C7', text: '#78350F' }, { bg: '#FCE7F3', text: '#831843' },
  ]
  function getAvatarColor(name: string) { return avatarColors[name.charCodeAt(0) % avatarColors.length] }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F2EB' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#2D6A4F', borderTopColor: 'transparent' }} />
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#2D6A4F' }}>Loading...</span>
      </div>
    </div>
  )

  const displayAppts = activeTab === 'today' ? todayAppts : upcomingAppts

  const navItems = [
    { label: 'Home', emoji: '▤', page: 'dashboard' },
    { label: 'Appts', emoji: '📅', page: 'appointments' },
    { label: 'Clients', emoji: '👥', page: 'clients' },
    { label: 'Services', emoji: '✂️', page: 'services' },
    { label: 'Reports', emoji: '📊', page: 'reports' },
    { label: 'Settings', emoji: '⚙', page: 'settings' },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
        body { background: #F5F2EB; margin: 0; }
        .playfair { font-family: 'Playfair Display', serif; }
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }

        .dash-card { background: linear-gradient(145deg, #FDFBF7, #F8F5EF); border: 1px solid rgba(237,233,223,0.7); }
        .stat-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .appt-row { transition: all 0.15s ease; border-bottom: 1px solid rgba(237,233,223,0.7); cursor: pointer; }
        .appt-row:hover { background: linear-gradient(145deg, #FDFBF7, #F8F5EF); }
        .appt-row:last-child { border-bottom: none; }
        .btn-new { background: linear-gradient(135deg, #1A3329, #2D6A4F); transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(26,51,41,0.2); border: none; cursor: pointer; color: white; }
        .action-btn { transition: all 0.15s ease; cursor: pointer; }
        .modal-bg { animation: fadeIn 0.15s ease; }
        .modal-box { animation: scaleIn 0.2s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .tab-btn { transition: all 0.15s ease; border-bottom: 2px solid transparent; background: none; border-left: none; border-right: none; border-top: none; cursor: pointer; }
        .tab-active-style { border-bottom: 2px solid #1A3329 !important; color: #1A3329 !important; font-weight: 600; }
        .service-row { border-bottom: 1px solid rgba(237,233,223,0.7); transition: background 0.15s; }
        .service-row:hover { background: #F5F2EB; }
        .service-row:last-child { border-bottom: none; }
        input:focus, textarea:focus { outline: none; border-color: #2D6A4F !important; box-shadow: 0 0 0 3px rgba(45,106,79,0.1); }

        /* LAYOUT */
        .dash-layout { display: flex; min-height: 100vh; }

        /* SIDEBAR — desktop only */
        .sidebar {
          width: 240px; flex-shrink: 0; display: flex; flex-direction: column;
          position: sticky; top: 0; height: 100vh;
          background: linear-gradient(180deg, #FDFBF7 0%, #FAF7F2 100%);
          border-right: 1px solid rgba(237,233,223,0.8);
        }
        .sidebar-nav-item {
          width: 100%; display: flex; align-items: center; gap: 12px;
          padding: 10px 16px; border-radius: 12px; font-size: 14px; font-weight: 500;
          text-align: left; cursor: pointer; border: none; background: none;
          transition: all 0.2s ease; color: #6B7280;
        }
        .sidebar-nav-item:hover { background: rgba(45,106,79,0.08); color: #1A3329; }
        .sidebar-nav-active { background: linear-gradient(135deg, #1A3329, #2D6A4F) !important; color: white !important; box-shadow: 0 4px 12px rgba(26,51,41,0.2); }

        /* BOTTOM NAV — mobile only */
        .bottom-nav {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 40;
          background: rgba(253,251,247,0.96); backdrop-filter: blur(16px);
          border-top: 1px solid rgba(237,233,223,0.8);
          padding: 8px 0 max(8px, env(safe-area-inset-bottom));
        }
        .bottom-nav-inner { display: flex; justify-content: space-around; align-items: center; }
        .bottom-nav-btn {
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          padding: 6px 8px; border-radius: 10px; border: none; background: none;
          cursor: pointer; min-width: 48px; transition: all 0.15s;
        }
        .bottom-nav-btn-active .bottom-nav-emoji { 
          background: linear-gradient(135deg, #1A3329, #2D6A4F);
          border-radius: 8px; padding: 4px 8px;
        }
        .bottom-nav-emoji { font-size: 18px; line-height: 1; padding: 4px 8px; }
        .bottom-nav-label { font-size: 10px; font-weight: 500; color: #9CA3AF; }
        .bottom-nav-btn-active .bottom-nav-label { color: #1A3329; font-weight: 600; }

        /* MAIN CONTENT */
        .main-content { flex: 1; overflow-x: hidden; }
        .page-header {
          padding: 20px 32px;
          border-bottom: 1px solid rgba(237,233,223,0.8);
          background: rgba(253,251,247,0.9);
          backdrop-filter: blur(8px);
          position: sticky; top: 0; z-index: 20;
        }
        .page-content { padding: 24px 32px; }

        /* REPORT STATS GRID */
        .report-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          .bottom-nav { display: block !important; }
          .main-content { padding-bottom: 80px; }
          .page-header { padding: 16px 16px; position: sticky; top: 0; }
          .page-content { padding: 16px 16px; }
          .report-stats-grid { grid-template-columns: 1fr !important; }
          .dash-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .revenue-card { grid-column: span 2; }
          .appt-row { padding: 12px 16px !important; }
          .appt-meta { display: none !important; }
          .modal-inner { padding: 16px !important; }
          .modal-actions { padding: 0 16px 16px !important; }
          .service-edit-row { flex-wrap: wrap; gap: 8px; }
          .service-price-input { width: 100% !important; }
        }

        @media (max-width: 480px) {
          .bottom-nav-label { display: none; }
          .bottom-nav-emoji { font-size: 20px; }
        }

        .scrollbar-none::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="dash-layout">

        {/* DESKTOP SIDEBAR */}
        <aside className="sidebar">
          <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(237,233,223,0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #1A3329, #2D6A4F)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(26,51,41,0.25)', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 100 100" fill="#D8F3DC">
                  <ellipse cx="50" cy="70" rx="26" ry="20"/><ellipse cx="20" cy="44" rx="12" ry="15"/>
                  <ellipse cx="38" cy="33" rx="12" ry="15"/><ellipse cx="62" cy="33" rx="12" ry="15"/><ellipse cx="80" cy="44" rx="12" ry="15"/>
                </svg>
              </div>
              <span className="playfair" style={{ fontWeight: 700, fontSize: '16px', color: '#1A3329', letterSpacing: '-0.02em' }}>PawBooking</span>
            </div>
            <div style={{ background: 'linear-gradient(135deg, rgba(216,243,220,0.3), rgba(216,243,220,0.1))', borderRadius: '10px', padding: '10px 12px', border: '1px solid rgba(45,106,79,0.08)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9CA3AF', marginBottom: '2px' }}>Business</div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#1A3329', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.business_name || 'My Grooming'}</div>
              <div style={{ fontSize: '12px', color: '#2D6A4F', fontWeight: 500, marginTop: '2px', textTransform: 'capitalize' }}>{profile?.plan === 'starter' ? 'Starter' : profile?.plan === 'essential' ? 'Essential' : profile?.plan === 'professional' ? 'Professional' : 'Starter'} Plan</div>
            </div>
          </div>

          <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {navItems.map((item, i) => (
              <button key={i} onClick={() => setActivePage(item.page as typeof activePage)}
                className={`sidebar-nav-item ${activePage === item.page ? 'sidebar-nav-active' : ''}`}>
                <span style={{ fontSize: '16px' }}>{item.emoji}</span>
                <span style={{ flex: 1 }}>{item.label === 'Home' ? 'Dashboard' : item.label === 'Appts' ? 'Appointments' : item.label}</span>
                {item.page === 'reports' && isStarter && <span style={{ fontSize: '12px', color: '#D1D5DB' }}>🔒</span>}
              </button>
            ))}
          </nav>

          {isStarter && (
            <div style={{ padding: '0 12px 12px' }}>
              <div style={{ borderRadius: '10px', padding: '10px 12px', background: monthlyApptCount >= starterLimit ? 'linear-gradient(135deg, #FEE2E2, #FEF2F2)' : 'linear-gradient(135deg, rgba(216,243,220,0.3), rgba(216,243,220,0.1))', border: `1px solid ${monthlyApptCount >= starterLimit ? '#FECACA' : 'rgba(45,106,79,0.1)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: monthlyApptCount >= starterLimit ? '#DC2626' : '#1A3329' }}>Appointments</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: monthlyApptCount >= starterLimit ? '#DC2626' : '#2D6A4F' }}>{monthlyApptCount}/{starterLimit}</span>
                </div>
                <div style={{ width: '100%', height: '6px', borderRadius: '50px', background: 'rgba(237,233,223,0.8)' }}>
                  <div style={{ height: '6px', borderRadius: '50px', width: `${apptLimitPct}%`, background: monthlyApptCount >= starterLimit ? '#DC2626' : monthlyApptCount >= 20 ? '#F59E0B' : 'linear-gradient(90deg, #2D6A4F, #45a070)', transition: 'width 0.3s' }} />
                </div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
                  {monthlyApptCount >= starterLimit ? 'Limit reached · Upgrade' : `${starterLimit - monthlyApptCount} remaining`}
                </div>
              </div>
            </div>
          )}

          <div style={{ padding: '12px', borderTop: '1px solid rgba(237,233,223,0.6)' }}>
            <button onClick={handleSignOut} className="sidebar-nav-item" style={{ color: '#9CA3AF' }}>
              <span>↪</span> Sign out
            </button>
          </div>
        </aside>

        {/* MOBILE BOTTOM NAV */}
        <nav className="bottom-nav">
          <div className="bottom-nav-inner">
            {navItems.map((item, i) => (
              <button key={i} onClick={() => setActivePage(item.page as typeof activePage)}
                className={`bottom-nav-btn ${activePage === item.page ? 'bottom-nav-btn-active' : ''}`}>
                <span className="bottom-nav-emoji">{item.emoji}</span>
                <span className="bottom-nav-label">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* MAIN */}
        <main className="main-content scrollbar-none">

          {/* DASHBOARD */}
          {activePage === 'dashboard' && (
            <>
              <header className="page-header">
                <h1 className="playfair" style={{ fontSize: '22px', fontWeight: 600, color: '#1A3329', letterSpacing: '-0.02em' }}>
                  {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}
                </h1>
                <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </header>
              <div className="page-content">

                {/* STAT CARDS */}
                <div className="dash-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                  <div className="stat-card dash-card rounded-2xl" style={{ padding: '20px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9CA3AF', marginBottom: '8px' }}>Today</div>
                    <div className="playfair" style={{ fontSize: '40px', fontWeight: 600, color: '#1A3329', letterSpacing: '-0.02em', lineHeight: 1 }}>{todayAppts.length}</div>
                    <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>Appointments</div>
                  </div>
                  <div className="stat-card dash-card rounded-2xl" style={{ padding: '20px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9CA3AF', marginBottom: '8px' }}>Month</div>
                    <div className="playfair" style={{ fontSize: '40px', fontWeight: 600, color: '#1A3329', letterSpacing: '-0.02em', lineHeight: 1 }}>{thisMonthAppts.length}</div>
                    <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>Bookings</div>
                  </div>
                  <div className="stat-card revenue-card rounded-2xl" style={{ padding: '20px', background: 'linear-gradient(145deg, #1A3329, #0f2218)', boxShadow: '0 8px 24px rgba(15,34,24,0.25)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(216,243,220,0.5)', marginBottom: '8px' }}>Revenue</div>
                    <div className="playfair" style={{ fontSize: '40px', fontWeight: 600, color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>${monthRevenue}</div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Est. this month</div>
                  </div>
                </div>

                {/* BOOKING LINK */}
                <div className="dash-card rounded-2xl" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A3329', marginBottom: '4px' }}>Your Booking Link</div>
                    <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bookingUrl}</div>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(bookingUrl); alert('Copied!') }}
                    style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#1A5C36', border: '1px solid rgba(45,106,79,0.12)', background: 'linear-gradient(135deg, #D8F3DC, #c8eacd)', cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 8px rgba(45,106,79,0.1)' }}>
                    Copy
                  </button>
                </div>

                {/* APPOINTMENTS */}
                <div className="rounded-2xl" style={{ overflow: 'hidden', background: 'linear-gradient(145deg, #FDFBF7, #F8F5EF)', border: '1px solid rgba(237,233,223,0.7)' }}>
                  <div style={{ display: 'flex', borderBottom: '1px solid rgba(237,233,223,0.7)' }}>
                    {(['today', 'upcoming'] as const).map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`tab-btn ${activeTab === tab ? 'tab-active-style' : ''}`}
                        style={{ flex: 1, padding: '14px 16px', fontSize: '14px', textAlign: 'left', color: activeTab === tab ? '#1A3329' : '#9CA3AF' }}>
                        {tab === 'today' ? `Today · ${todayAppts.length}` : `Upcoming · ${upcomingAppts.length}`}
                      </button>
                    ))}
                  </div>
                  {displayAppts.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: '36px', marginBottom: '12px' }}>🐾</div>
                      <div style={{ fontWeight: 500, color: '#6B7280', marginBottom: '4px' }}>No appointments {activeTab === 'today' ? 'today' : 'coming up'}</div>
                      <div style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '20px' }}>Add one to fill your schedule</div>
                      <button onClick={() => router.push('/appointments/new')} className="btn-new" style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600 }}>Add Appointment</button>
                    </div>
                  ) : displayAppts.map(appt => {
                    const color = getAvatarColor(appt.client_name)
                    return (
                      <div key={appt.id} onClick={() => setSelectedAppt(appt)} className="appt-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0, background: color.bg, color: color.text }}>{getInitials(appt.client_name)}</div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '14px', color: '#1A3329', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{appt.client_name}</div>
                            <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {appt.dog_name}{appt.services?.name ? ` · ${appt.services.name}` : ''}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                          {activeTab === 'upcoming' && <div className="appt-meta" style={{ fontSize: '13px', color: '#6B7280' }}>{formatDate(appt.appointment_date)}</div>}
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 600, fontSize: '13px', color: '#1A3329' }}>{formatTime(appt.appointment_time)}</div>
                            {appt.services?.price ? <div style={{ fontSize: '12px', fontWeight: 600, color: '#2D6A4F' }}>${appt.services.price}</div> : null}
                          </div>
                          <div style={{ color: '#D1D5DB', fontSize: '16px' }}>›</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* APPOINTMENTS PAGE */}
          {activePage === 'appointments' && (
            <>
              <header className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h1 className="playfair" style={{ fontSize: '22px', fontWeight: 600, color: '#1A3329', letterSpacing: '-0.02em' }}>Appointments</h1>
                  <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>All your upcoming appointments</p>
                </div>
                <button onClick={() => router.push('/appointments/new')} className="btn-new" style={{ padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600 }}>+ New</button>
              </header>
              <div className="page-content">
                <div className="rounded-2xl" style={{ overflow: 'hidden', background: 'linear-gradient(145deg, #FDFBF7, #F8F5EF)', border: '1px solid rgba(237,233,223,0.7)' }}>
                  {appointments.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: '36px', marginBottom: '12px' }}>📅</div>
                      <div style={{ fontWeight: 500, color: '#6B7280', marginBottom: '4px' }}>No appointments yet</div>
                      <div style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '20px' }}>Add one to get started</div>
                      <button onClick={() => router.push('/appointments/new')} className="btn-new" style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600 }}>Add Appointment</button>
                    </div>
                  ) : appointments.map(appt => {
                    const color = getAvatarColor(appt.client_name)
                    return (
                      <div key={appt.id} onClick={() => setSelectedAppt(appt)} className="appt-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0, background: color.bg, color: color.text }}>{getInitials(appt.client_name)}</div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '14px', color: '#1A3329', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{appt.client_name}</div>
                            <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{formatDate(appt.appointment_date)}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 600, fontSize: '13px', color: '#1A3329' }}>{formatTime(appt.appointment_time)}</div>
                            {appt.services?.price ? <div style={{ fontSize: '12px', fontWeight: 600, color: '#2D6A4F' }}>${appt.services.price}</div> : null}
                          </div>
                          {appt.status === 'completed'
                            ? <div style={{ padding: '4px 8px', borderRadius: '50px', fontSize: '11px', fontWeight: 700, background: 'linear-gradient(135deg, #D8F3DC, #c8eacd)', color: '#1A5C36' }}>✓</div>
                            : <div style={{ color: '#D1D5DB', fontSize: '16px' }}>›</div>}
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
              <header className="page-header">
                <h1 className="playfair" style={{ fontSize: '22px', fontWeight: 600, color: '#1A3329', letterSpacing: '-0.02em' }}>Clients</h1>
                <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>Your client list and their dogs</p>
              </header>
              <div className="page-content">
                <div className="rounded-2xl" style={{ overflow: 'hidden', background: 'linear-gradient(145deg, #FDFBF7, #F8F5EF)', border: '1px solid rgba(237,233,223,0.7)' }}>
                  {appointments.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: '36px', marginBottom: '12px' }}>👥</div>
                      <div style={{ fontWeight: 500, color: '#6B7280', marginBottom: '4px' }}>No clients yet</div>
                      <div style={{ fontSize: '13px', color: '#9CA3AF' }}>Clients appear here once they book</div>
                    </div>
                  ) : [...new Map(appointments.map(a => [a.client_name, a])).values()].map(appt => {
                    const color = getAvatarColor(appt.client_name)
                    const clientAppts = appointments.filter(a => a.client_name === appt.client_name)
                    return (
                      <div key={appt.client_name} className="appt-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0, background: color.bg, color: color.text }}>{getInitials(appt.client_name)}</div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '14px', color: '#1A3329' }}>{appt.client_name}</div>
                            <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>🐾 {appt.dog_name}{appt.dog_breed ? ` · ${appt.dog_breed}` : ''}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', flexShrink: 0 }}>
                          <a href={`tel:${appt.client_phone}`} style={{ fontSize: '13px', fontWeight: 500, color: '#2D6A4F', textDecoration: 'none' }}>{appt.client_phone}</a>
                          <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{clientAppts.length} appt{clientAppts.length !== 1 ? 's' : ''}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {activePage === 'reports' && <ReportsPage profile={profile} supabase={supabase} router={router} />}
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
              <header className="page-header">
                <h1 className="playfair" style={{ fontSize: '22px', fontWeight: 600, color: '#1A3329', letterSpacing: '-0.02em' }}>Edit Services</h1>
                <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>Manage the services you offer and their prices</p>
              </header>
              <div className="page-content" style={{ maxWidth: '600px' }}>
                <div className="dash-card rounded-2xl" style={{ padding: '20px', marginBottom: '16px' }}>
                  <h2 style={{ fontWeight: 600, fontSize: '15px', color: '#1A3329', marginBottom: '16px' }}>Add a Service</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6B7280', marginBottom: '6px' }}>Service Name</label>
                      <input type="text" value={newServiceName} onChange={e => setNewServiceName(e.target.value)} placeholder="Full Groom"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '14px', background: '#F5F2EB', border: '1px solid #EDE9DF', color: '#1A3329' }}
                        onKeyDown={e => e.key === 'Enter' && handleAddService()} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6B7280', marginBottom: '6px' }}>Price ($)</label>
                      <input type="number" value={newServicePrice} onChange={e => setNewServicePrice(e.target.value)} placeholder="65"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '14px', background: '#F5F2EB', border: '1px solid #EDE9DF', color: '#1A3329' }}
                        onKeyDown={e => e.key === 'Enter' && handleAddService()} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6B7280', marginBottom: '6px' }}>Payment Options</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {[
                        ...(profile?.payment_methods?.includes('in_person') ? [{ value: 'in_person', label: '💵 Pay in Person', desc: 'Cash or Card' }] : []),
                        ...(profile?.payment_methods?.includes('online') ? [{ value: 'online', label: '💳 Pay Online', desc: 'Client pays upfront' }] : []),
                      ].map(opt => (
                        <button key={opt.value} type="button"
                          onClick={() => setNewPaymentTypes(prev => prev.includes(opt.value) ? prev.filter(p => p !== opt.value) : [...prev, opt.value])}
                          style={{ padding: '10px', borderRadius: '10px', textAlign: 'left', cursor: 'pointer', border: newPaymentTypes.includes(opt.value) ? '2px solid #1A3329' : '2px solid #EDE9DF', background: newPaymentTypes.includes(opt.value) ? 'linear-gradient(135deg, #D8F3DC, #c8eacd)' : '#F5F2EB' }}>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: '#1A3329' }}>{opt.label}</div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  {serviceError && <p style={{ fontSize: '12px', color: '#DC2626', marginBottom: '10px' }}>{serviceError}</p>}
                  <button onClick={handleAddService} className="btn-new" style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600 }}>+ Add Service</button>
                </div>
                <div className="rounded-2xl" style={{ overflow: 'hidden', background: 'linear-gradient(145deg, #FDFBF7, #F8F5EF)', border: '1px solid rgba(237,233,223,0.7)' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(237,233,223,0.7)' }}>
                    <h2 style={{ fontWeight: 600, fontSize: '14px', color: '#1A3329' }}>Your Services ({services.length})</h2>
                  </div>
                  {services.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', marginBottom: '8px' }}>✂️</div>
                      <div style={{ fontSize: '14px', color: '#9CA3AF' }}>No services added yet</div>
                    </div>
                  ) : services.map(service => (
                    <div key={service.id} className="service-row" style={{ padding: '14px 20px' }}>
                      {editingService?.id === service.id ? (
                        <div className="service-edit-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <input type="text" value={editingService.name} onChange={e => setEditingService({ ...editingService, name: e.target.value })}
                            style={{ flex: 1, minWidth: '120px', padding: '8px 12px', borderRadius: '8px', fontSize: '14px', background: '#F5F2EB', border: '1px solid #EDE9DF', color: '#1A3329' }} />
                          <input type="number" value={editingService.price} onChange={e => setEditingService({ ...editingService, price: parseFloat(e.target.value) || 0 })}
                            className="service-price-input" style={{ width: '80px', padding: '8px 12px', borderRadius: '8px', fontSize: '14px', background: '#F5F2EB', border: '1px solid #EDE9DF', color: '#1A3329' }} />
                          <button onClick={handleUpdateService} style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: 'white', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #1A3329, #2D6A4F)' }}>Save</button>
                          <button onClick={() => setEditingService(null)} style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#6B7280', border: 'none', cursor: 'pointer', background: '#F5F2EB' }}>Cancel</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #D8F3DC, #c8eacd)', flexShrink: 0 }}>✂️</div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: '14px', color: '#1A3329' }}>{service.name}</div>
                              <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{getServicePaymentLabel(service)}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            <span style={{ fontWeight: 700, fontSize: '14px', color: '#2D6A4F' }}>${service.price}</span>
                            <button onClick={() => setEditingService(service)} style={{ padding: '5px 10px', borderRadius: '7px', fontSize: '12px', color: '#6B7280', border: '1px solid #EDE9DF', cursor: 'pointer', background: '#F5F2EB' }}>Edit</button>
                            <button onClick={() => handleDeleteService(service.id)} style={{ padding: '5px 10px', borderRadius: '7px', fontSize: '12px', color: '#DC2626', border: '1px solid #FECACA', cursor: 'pointer', background: '#FEE2E2' }}>Delete</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '12px' }}>💡 These services appear on your public booking page.</p>
              </div>
            </>
          )}

        </main>
      </div>

      {/* MODAL */}
      {selectedAppt && (
        <div className="modal-bg" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0', background: 'rgba(15,34,24,0.5)', backdropFilter: 'blur(6px)' }}
          onClick={() => setSelectedAppt(null)}>
          <div className="modal-box" style={{ width: '100%', maxWidth: '480px', borderRadius: '24px 24px 0 0', overflow: 'hidden', background: 'linear-gradient(145deg, #FDFBF7, #FAF7F2)', border: '1px solid rgba(237,233,223,0.8)', boxShadow: '0 -8px 40px rgba(15,34,24,0.2)', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid rgba(237,233,223,0.7)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, background: getAvatarColor(selectedAppt.client_name).bg, color: getAvatarColor(selectedAppt.client_name).text }}>
                  {getInitials(selectedAppt.client_name)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '16px', color: '#1A3329' }}>{selectedAppt.client_name}</div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{formatDate(selectedAppt.appointment_date)} · {formatTime(selectedAppt.appointment_time)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {selectedAppt.status === 'completed' && (
                  <div style={{ padding: '4px 10px', borderRadius: '50px', fontSize: '12px', fontWeight: 700, background: 'linear-gradient(135deg, #D8F3DC, #c8eacd)', color: '#1A5C36' }}>✓ Done</div>
                )}
                <button onClick={() => setSelectedAppt(null)} style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', background: '#F5F2EB', color: '#6B7280', border: 'none', cursor: 'pointer' }}>✕</button>
              </div>
            </div>
            <div className="modal-inner" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '12px', background: 'linear-gradient(135deg, #F5F2EB, #F0EDE6)' }}>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9CA3AF', fontWeight: 500, marginBottom: '4px' }}>Service</div>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: '#1A3329' }}>{selectedAppt.services?.name || 'Appointment'}</div>
                </div>
                <div className="playfair" style={{ fontSize: '24px', fontWeight: 600, color: '#2D6A4F' }}>${selectedAppt.services?.price || 0}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9CA3AF', fontWeight: 500, marginBottom: '8px' }}>Dog</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ padding: '6px 12px', borderRadius: '50px', fontSize: '14px', fontWeight: 500, background: 'linear-gradient(135deg, #D8F3DC, #c8eacd)', color: '#1A5C36' }}>🐾 {selectedAppt.dog_name}</span>
                  {selectedAppt.dog_breed && <span style={{ padding: '6px 12px', borderRadius: '50px', fontSize: '14px', background: '#F5F2EB', color: '#6B7280' }}>{selectedAppt.dog_breed}</span>}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9CA3AF', fontWeight: 500, marginBottom: '8px' }}>Contact</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <a href={`tel:${selectedAppt.client_phone}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '10px', background: '#F5F2EB', border: '1px solid rgba(237,233,223,0.7)', textDecoration: 'none' }}>
                    <span>📞</span><span style={{ fontSize: '14px', fontWeight: 500, color: '#1A3329' }}>{selectedAppt.client_phone}</span>
                  </a>
                  {selectedAppt.client_email && (
                    <a href={`mailto:${selectedAppt.client_email}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '10px', background: '#F5F2EB', border: '1px solid rgba(237,233,223,0.7)', textDecoration: 'none' }}>
                      <span>✉️</span><span style={{ fontSize: '14px', fontWeight: 500, color: '#1A3329' }}>{selectedAppt.client_email}</span>
                    </a>
                  )}
                </div>
              </div>
              {selectedAppt.notes && (
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9CA3AF', fontWeight: 500, marginBottom: '8px' }}>Notes</div>
                  <div style={{ padding: '12px', borderRadius: '10px', fontSize: '14px', color: '#6B7280', background: '#F5F2EB', border: '1px solid rgba(237,233,223,0.7)' }}>{selectedAppt.notes}</div>
                </div>
              )}
            </div>
            <div className="modal-actions" style={{ display: 'flex', gap: '10px', padding: '0 20px 24px' }}>
              {selectedAppt.status !== 'completed' && (
                <button onClick={() => handleMarkComplete(selectedAppt.id)} disabled={completingAppt === selectedAppt.id}
                  style={{ flex: 1, padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#1A5C36', border: '1px solid rgba(45,106,79,0.15)', cursor: 'pointer', background: 'linear-gradient(135deg, #D8F3DC, #c8eacd)', opacity: completingAppt === selectedAppt.id ? 0.5 : 1 }}>
                  {completingAppt === selectedAppt.id ? 'Saving...' : '✓ Mark Complete'}
                </button>
              )}
              {selectedAppt.status !== 'completed' && (
                <button onClick={() => router.push(`/appointments/new?edit=${selectedAppt.id}`)}
                  style={{ padding: '14px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: 'white', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #1A3329, #2D6A4F)', boxShadow: '0 4px 12px rgba(26,51,41,0.2)' }}>
                  Edit
                </button>
              )}
              <button onClick={() => { if (confirm('Delete this appointment?')) handleDelete(selectedAppt.id) }}
                style={{ padding: '14px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#DC2626', border: '1px solid #FECACA', cursor: 'pointer', background: '#FEE2E2' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}