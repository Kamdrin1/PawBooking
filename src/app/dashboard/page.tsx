'use client'
import { useEffect, useState, useRef } from 'react'
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

interface Dog {
  id: string
  profile_id: string
  name: string
  breed: string | null
  owner_name: string
  owner_phone: string | null
  owner_email: string | null
  care_notes: string | null
  reminder_status: string | null
  created_at: string
}

interface Profile {
  business_name: string
  plan: string
  payment_methods: string[]
  google_review_link: string
  slug: string
  availability: { days: Record<string, boolean>; startTime: string; endTime: string }
}

interface Service {
  id: string
  name: string
  price: number
  duration_minutes: number
  payment_type: 'none' | 'deposit' | 'full'
  deposit_amount: number
}

interface UnavailableDate {
  id: string
  date: string
  reason: string | null
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

// ─── SHARED HELPERS ───────────────────────────────────────────────────────────
const avatarColors = [
  { bg: '#D8F3DC', text: '#1A3329' }, { bg: '#FDE8D8', text: '#7C2D12' },
  { bg: '#E8E4F8', text: '#3730A3' }, { bg: '#FEF3C7', text: '#78350F' }, { bg: '#FCE7F3', text: '#831843' },
]
function getAvatarColor(name: string) {
  if (!name) return avatarColors[0]
  return avatarColors[name.charCodeAt(0) % avatarColors.length]
}
function getInitials(name: string) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
function formatTime(time: string | null | undefined) {
  if (!time) return ''
  const [h, m] = time.split(':'); const hour = parseInt(h)
  return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
}
function formatDate(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
function formatLongDate(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── DOG PROFILE PAGE ─────────────────────────────────────────────────────────
type DogTab = 'overview' | 'appointments' | 'photos' | 'care' | 'timeline' | 'documents'

function DogProfilePage({ supabase }: { supabase: ReturnType<typeof createClient> }) {
  const [dogs, setDogs] = useState<Dog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null)
  const [dogAppts, setDogAppts] = useState<Appointment[]>([])
  const [apptsLoading, setApptsLoading] = useState(false)
  const [tab, setTab] = useState<DogTab>('overview')

  // editing the dog profile
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', breed: '', owner_name: '', owner_phone: '', owner_email: '' })
  const [saving, setSaving] = useState(false)

  // care notes (autosave)
  const [notes, setNotes] = useState('')
  const [notesStatus, setNotesStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    async function loadDogs() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('dogs').select('*').eq('profile_id', user.id).order('name')
      setDogs(data || [])
      setLoading(false)
    }
    loadDogs()
  }, [])

  async function openDog(dog: Dog) {
    setSelectedDog(dog)
    setTab('overview')
    setEditing(false)
    setNotes(dog.care_notes || '')
    setNotesStatus('idle')
    setApptsLoading(true)
    const { data } = await supabase
      .from('appointments').select('*, services(name, price)')
      .eq('dog_id', dog.id)
      .order('appointment_date', { ascending: false })
    setDogAppts(data || [])
    setApptsLoading(false)
  }

  function closeDog() {
    if (notesTimer.current) clearTimeout(notesTimer.current)
    setSelectedDog(null)
    setDogAppts([])
  }

  async function handleSaveProfile() {
    if (!selectedDog || !form.name.trim() || !form.owner_name.trim()) return
    setSaving(true)
    const patch = {
      name: form.name.trim(),
      breed: form.breed.trim() || null,
      owner_name: form.owner_name.trim(),
      owner_phone: form.owner_phone.trim() || null,
      owner_email: form.owner_email.trim() || null,
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabase.from('dogs').update(patch).eq('id', selectedDog.id)
    if (!error) {
      const updated = { ...selectedDog, ...patch }
      setSelectedDog(updated)
      setDogs(prev => prev.map(d => d.id === updated.id ? updated : d).sort((a, b) => a.name.localeCompare(b.name)))
      setEditing(false)
    }
    setSaving(false)
  }

  function handleNotesChange(value: string) {
    setNotes(value)
    setNotesStatus('saving')
    if (notesTimer.current) clearTimeout(notesTimer.current)
    notesTimer.current = setTimeout(async () => {
      if (!selectedDog) return
      const { error } = await supabase.from('dogs')
        .update({ care_notes: value, updated_at: new Date().toISOString() })
        .eq('id', selectedDog.id)
      if (!error) {
        setSelectedDog(prev => prev ? { ...prev, care_notes: value } : prev)
        setDogs(prev => prev.map(d => d.id === selectedDog.id ? { ...d, care_notes: value } : d))
        setNotesStatus('saved')
        setTimeout(() => setNotesStatus('idle'), 1600)
      }
    }, 800)
  }

  async function toggleReminder() {
    if (!selectedDog) return
    const next = selectedDog.reminder_status === 'active' ? 'paused' : 'active'
    const { error } = await supabase.from('dogs').update({ reminder_status: next }).eq('id', selectedDog.id)
    if (!error) {
      setSelectedDog(prev => prev ? { ...prev, reminder_status: next } : prev)
      setDogs(prev => prev.map(d => d.id === selectedDog.id ? { ...d, reminder_status: next } : d))
    }
  }

  // ── derived stats for Overview ──
  const today = new Date().toISOString().split('T')[0]
  const activeAppts = dogAppts.filter(a => a.status !== 'cancelled')
  const pastAppts = activeAppts.filter(a => a.appointment_date <= today)
  const futureAppts = activeAppts.filter(a => a.appointment_date > today)
  const lastGroom = pastAppts.length > 0 ? pastAppts[0] : null
  const nextAppt = futureAppts.length > 0 ? futureAppts[futureAppts.length - 1] : null
  const lifetimeVisits = activeAppts.length
  const totalSpend = activeAppts.reduce((sum, a) => sum + (a.services?.price || 0), 0)
  const avgSpend = lifetimeVisits > 0 ? Math.round(totalSpend / lifetimeVisits) : 0

  const serviceCounts: Record<string, number> = {}
  activeAppts.forEach(a => {
    const n = a.services?.name
    if (n) serviceCounts[n] = (serviceCounts[n] || 0) + 1
  })
  const favoriteService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

  const filteredDogs = dogs.filter(d => {
    const q = search.toLowerCase().trim()
    if (!q) return true
    return d.name.toLowerCase().includes(q)
      || d.owner_name.toLowerCase().includes(q)
      || (d.breed || '').toLowerCase().includes(q)
  })

  const tabs: { id: DogTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'appointments', label: 'Appointments' },
    { id: 'photos', label: 'Photos' },
    { id: 'care', label: 'Care Notes' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'documents', label: 'Documents' },
  ]

  return (
    <>
      <header className="page-header">
        <h1 className="playfair" style={{ fontSize: '22px', fontWeight: 600, color: '#1A3329', letterSpacing: '-0.02em' }}>Dog Profile</h1>
        <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>Every dog you&apos;ve groomed, with their full history</p>
      </header>

      <div className="page-content" style={{ maxWidth: '900px' }}>
        {/* SEARCH */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by dog, owner, or breed..."
          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', marginBottom: '16px', background: '#FDFBF7', border: '1px solid #EDE9DF', color: '#1A3329' }}
        />

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#2D6A4F', borderTopColor: 'transparent' }} />
          </div>
        ) : filteredDogs.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', background: 'linear-gradient(145deg, #FDFBF7, #F8F5EF)', borderRadius: '16px', border: '1px solid rgba(237,233,223,0.7)' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🐾</div>
            <div style={{ fontWeight: 500, color: '#6B7280', marginBottom: '4px' }}>
              {dogs.length === 0 ? 'No dog profiles yet' : 'No matches'}
            </div>
            <div style={{ fontSize: '13px', color: '#9CA3AF' }}>
              {dogs.length === 0 ? 'Profiles are created automatically when a booking comes in' : 'Try a different search'}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl" style={{ overflow: 'hidden', background: 'linear-gradient(145deg, #FDFBF7, #F8F5EF)', border: '1px solid rgba(237,233,223,0.7)' }}>
            {filteredDogs.map(dog => {
              const color = getAvatarColor(dog.name)
              return (
                <div key={dog.id} onClick={() => openDog(dog)} className="appt-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0, background: color.bg, color: color.text }}>
                      {getInitials(dog.name)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#1A3329', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {dog.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {dog.owner_name}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    {dog.breed && <div style={{ fontSize: '12px', color: '#6B7280' }}>{dog.breed}</div>}
                    <div style={{ color: '#D1D5DB', fontSize: '16px' }}>›</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── DOG DETAIL MODAL ── */}
      {selectedDog && (
        <div className="modal-bg" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(15,34,24,0.5)', backdropFilter: 'blur(6px)' }}
          onClick={closeDog}>
          <div className="modal-box" style={{ width: '100%', maxWidth: '560px', borderRadius: '24px 24px 0 0', overflow: 'hidden', background: 'linear-gradient(145deg, #FDFBF7, #FAF7F2)', border: '1px solid rgba(237,233,223,0.8)', boxShadow: '0 -8px 40px rgba(15,34,24,0.2)', maxHeight: '92vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>

            {/* HEADER */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid rgba(237,233,223,0.7)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 700, flexShrink: 0, background: getAvatarColor(selectedDog.name).bg, color: getAvatarColor(selectedDog.name).text }}>
                  {getInitials(selectedDog.name)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '18px', color: '#1A3329' }}>{selectedDog.name}</div>
                  <div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>{selectedDog.owner_name}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {!editing && (
                  <button onClick={() => { setForm({ name: selectedDog.name, breed: selectedDog.breed || '', owner_name: selectedDog.owner_name, owner_phone: selectedDog.owner_phone || '', owner_email: selectedDog.owner_email || '' }); setEditing(true) }}
                    title="Edit profile"
                    style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F2EB', border: '1px solid #EDE9DF', cursor: 'pointer' }}>✏️</button>
                )}
                <button onClick={closeDog} style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', background: '#F5F2EB', color: '#6B7280', border: 'none', cursor: 'pointer' }}>✕</button>
              </div>
            </div>

            {/* EDIT FORM */}
            {editing && (
              <div style={{ padding: '20px', borderBottom: '1px solid rgba(237,233,223,0.7)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9CA3AF' }}>Edit Profile</div>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Dog's name"
                  style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '14px', background: '#F5F2EB', border: '1px solid #EDE9DF', color: '#1A3329' }} />
                <input type="text" value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })} placeholder="Breed"
                  style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '14px', background: '#F5F2EB', border: '1px solid #EDE9DF', color: '#1A3329' }} />
                <input type="text" value={form.owner_name} onChange={e => setForm({ ...form, owner_name: e.target.value })} placeholder="Owner's full name"
                  style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '14px', background: '#F5F2EB', border: '1px solid #EDE9DF', color: '#1A3329' }} />
                <input type="tel" value={form.owner_phone} onChange={e => setForm({ ...form, owner_phone: e.target.value })} placeholder="Owner's phone"
                  style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '14px', background: '#F5F2EB', border: '1px solid #EDE9DF', color: '#1A3329' }} />
                <input type="email" value={form.owner_email} onChange={e => setForm({ ...form, owner_email: e.target.value })} placeholder="Owner's email"
                  style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '14px', background: '#F5F2EB', border: '1px solid #EDE9DF', color: '#1A3329' }} />
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button onClick={handleSaveProfile} disabled={saving || !form.name.trim() || !form.owner_name.trim()}
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: 'white', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #1A3329, #2D6A4F)', opacity: saving ? 0.5 : 1 }}>
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setEditing(false)}
                    style={{ padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#6B7280', border: 'none', cursor: 'pointer', background: '#F5F2EB' }}>Cancel</button>
                </div>
              </div>
            )}

            {/* TABS */}
            <div style={{ display: 'flex', gap: '4px', padding: '12px 16px', overflowX: 'auto', borderBottom: '1px solid rgba(237,233,223,0.7)' }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{
                    padding: '7px 14px', borderRadius: '50px', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap',
                    cursor: 'pointer', transition: 'all 0.15s',
                    border: tab === t.id ? '1px solid rgba(45,106,79,0.15)' : '1px solid transparent',
                    background: tab === t.id ? 'linear-gradient(135deg, #D8F3DC, #c8eacd)' : 'transparent',
                    color: tab === t.id ? '#1A5C36' : '#9CA3AF',
                  }}>
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{ padding: '20px' }}>
              {/* OVERVIEW */}
              {tab === 'overview' && (
                apptsLoading ? (
                  <div style={{ padding: '30px', textAlign: 'center', fontSize: '13px', color: '#9CA3AF' }}>Loading...</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {[
                      { label: 'Last Groom', value: lastGroom ? formatLongDate(lastGroom.appointment_date) : 'No visits yet' },
                      { label: 'Next Appointment', value: nextAppt ? `${formatLongDate(nextAppt.appointment_date)} · ${formatTime(nextAppt.appointment_time)}` : 'None scheduled' },
                      { label: 'Lifetime Visits', value: String(lifetimeVisits) },
                      { label: 'Favorite Service', value: favoriteService },
                      { label: 'Average Spend', value: avgSpend > 0 ? `$${avgSpend}` : '—' },
                    ].map(stat => (
                      <div key={stat.label} className="dash-card rounded-2xl" style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9CA3AF', marginBottom: '6px' }}>{stat.label}</div>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#1A3329' }}>{stat.value}</div>
                      </div>
                    ))}
                    {/* Reminder status — toggleable */}
                    <div className="dash-card rounded-2xl" style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9CA3AF', marginBottom: '6px' }}>Reminder Status</div>
                      <button onClick={toggleReminder}
                        style={{
                          padding: '4px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                          border: '1px solid ' + (selectedDog.reminder_status === 'paused' ? '#FDE68A' : 'rgba(45,106,79,0.15)'),
                          background: selectedDog.reminder_status === 'paused' ? '#FEF3C7' : 'linear-gradient(135deg, #D8F3DC, #c8eacd)',
                          color: selectedDog.reminder_status === 'paused' ? '#92400E' : '#1A5C36',
                        }}>
                        {selectedDog.reminder_status === 'paused' ? '⏸ Paused' : '✓ Active'}
                      </button>
                    </div>
                  </div>
                )
              )}

              {/* APPOINTMENTS */}
              {tab === 'appointments' && (
                apptsLoading ? (
                  <div style={{ padding: '30px', textAlign: 'center', fontSize: '13px', color: '#9CA3AF' }}>Loading...</div>
                ) : dogAppts.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>📅</div>
                    <div style={{ fontSize: '13px', color: '#9CA3AF' }}>No appointments yet</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {dogAppts.map(a => {
                      const isCancelled = a.status === 'cancelled'
                      const isCompleted = a.status === 'completed'
                      const isUpcoming = !isCancelled && !isCompleted && a.appointment_date > today
                      const badge = isCancelled
                        ? { text: 'Cancelled', bg: '#FEE2E2', color: '#DC2626', border: '#FECACA' }
                        : isCompleted
                          ? { text: 'Completed', bg: 'linear-gradient(135deg, #D8F3DC, #c8eacd)', color: '#1A5C36', border: 'rgba(45,106,79,0.15)' }
                          : isUpcoming
                            ? { text: 'Upcoming', bg: '#F5F2EB', color: '#6B7280', border: '#EDE9DF' }
                            : { text: 'Pending', bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' }
                      return (
                        <div key={a.id} className="dash-card rounded-2xl" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A3329' }}>{formatLongDate(a.appointment_date)}</div>
                            <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                              {formatTime(a.appointment_time)}{a.services?.name ? ` · ${a.services.name}` : ''}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                            {a.services?.price ? <div style={{ fontSize: '13px', fontWeight: 600, color: '#2D6A4F' }}>${a.services.price}</div> : null}
                            <span style={{ padding: '4px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: 700, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, whiteSpace: 'nowrap' }}>
                              {badge.text}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              )}

              {/* CARE NOTES */}
              {tab === 'care' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9CA3AF' }}>
                      ✏️ Care Notes
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: notesStatus === 'saved' ? '#2D6A4F' : '#9CA3AF' }}>
                      {notesStatus === 'saving' ? 'Saving...' : notesStatus === 'saved' ? '✓ Saved' : 'Saves automatically'}
                    </div>
                  </div>
                  <textarea
                    value={notes}
                    onChange={e => handleNotesChange(e.target.value)}
                    placeholder="Temperament, allergies, handling notes, coat condition, anything you want to remember about this dog..."
                    rows={9}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', fontSize: '14px', lineHeight: 1.7, background: '#F5F2EB', border: '1px solid #EDE9DF', color: '#1A3329', resize: 'vertical', fontFamily: 'inherit' }}
                  />
                  <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '8px' }}>
                    These notes are permanent and stay with {selectedDog.name}&apos;s profile across every visit.
                  </p>
                </div>
              )}

              {/* PLACEHOLDER TABS */}
              {(tab === 'photos' || tab === 'timeline' || tab === 'documents') && (
                <div style={{ padding: '50px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>
                    {tab === 'photos' ? '📸' : tab === 'timeline' ? '🕓' : '📄'}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#1A3329', marginBottom: '4px' }}>
                    {tab === 'photos' ? 'Photos' : tab === 'timeline' ? 'Timeline' : 'Documents'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#9CA3AF' }}>Coming soon</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── CALENDAR PAGE ────────────────────────────────────────────────────────────
function CalendarPage({ profile, supabase }: {
  profile: Profile | null
  supabase: ReturnType<typeof createClient>
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [unavailableDates, setUnavailableDates] = useState<UnavailableDate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [isDateUnavailable, setIsDateUnavailable] = useState(false)
  const [reason, setReason] = useState('')
  const [savingReason, setSavingReason] = useState(false)
  const [togglingDate, setTogglingDate] = useState(false)

  useEffect(() => {
    async function loadUnavailableDates() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('unavailable_dates').select('*').eq('profile_id', user.id)
      setUnavailableDates(data || [])
      setLoading(false)
    }
    loadUnavailableDates()
  }, [])

  if (!profile) return (
    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '14px', color: '#9CA3AF' }}>Loading calendar...</div>
    </div>
  )

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const availability = profile.availability || { days: {}, startTime: '09:00', endTime: '17:00' }

  const availableDaysOfWeek = availability.days ? Object.entries(availability.days)
    .filter(([, isAvailable]) => isAvailable)
    .map(([day]) => dayNames.indexOf(day)) : []

  async function handleToggleDates(newUnavailableState: boolean) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || selectedDates.length === 0) return
    setTogglingDate(true)

    let updatedUnavailable = [...unavailableDates]

    for (const dateStr of selectedDates) {
      const existing = updatedUnavailable.find(d => d.date === dateStr)

      if (newUnavailableState && !existing) {
        const { data, error } = await supabase.from('unavailable_dates').insert({
          profile_id: user.id,
          date: dateStr,
          reason: null,
        }).select().single()
        if (!error && data) {
          updatedUnavailable = [...updatedUnavailable, data]
        }
      } else if (!newUnavailableState && existing) {
        await supabase.from('unavailable_dates').delete().eq('id', existing.id)
        updatedUnavailable = updatedUnavailable.filter(d => d.id !== existing.id)
      }
    }

    setUnavailableDates(updatedUnavailable)

    if (selectedDates.length > 0) {
      const firstDate = selectedDates[0]
      const existing = updatedUnavailable.find(d => d.date === firstDate)
      setIsDateUnavailable(!!existing)
    }

    setTogglingDate(false)
  }

  async function handleSaveReason() {
    if (selectedDates.length === 0) return
    setSavingReason(true)

    for (const dateStr of selectedDates) {
      const existing = unavailableDates.find(d => d.date === dateStr)
      if (existing) {
        const { error } = await supabase.from('unavailable_dates').update({ reason: reason.trim() || null }).eq('id', existing.id)
        if (!error) {
          setUnavailableDates(prev => prev.map(d => d.id === existing.id ? { ...d, reason: reason.trim() || null } : d))
        }
      }
    }
    setSavingReason(false)
  }

  function handleDateClick(day: number, e: React.MouseEvent) {
    const dateStr = getDateString(day)
    const isCtrlOrCmd = e.ctrlKey || e.metaKey

    let newSelectedDates: string[]
    if (isCtrlOrCmd) {
      newSelectedDates = selectedDates.includes(dateStr)
        ? selectedDates.filter(d => d !== dateStr)
        : [...selectedDates, dateStr]
    } else {
      newSelectedDates = [dateStr]
      const existing = unavailableDates.find(d => d.date === dateStr)
      setReason(existing?.reason || '')
    }

    setSelectedDates(newSelectedDates)

    if (newSelectedDates.length > 0) {
      const firstDate = newSelectedDates[0]
      const existing = unavailableDates.find(d => d.date === firstDate)
      setIsDateUnavailable(!!existing)
    }
  }

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const calendarDays = []
  for (let i = 0; i < startingDayOfWeek; i++) calendarDays.push(null)
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i)

  const today = new Date().toISOString().split('T')[0]

  function getDateString(day: number) {
    return new Date(year, month, day).toISOString().split('T')[0]
  }

  function isDateMarkedUnavailable(day: number) {
    const dateStr = getDateString(day)
    return unavailableDates.some(d => d.date === dateStr)
  }

  function isDayAvailable(day: number) {
    const dayOfWeek = new Date(year, month, day).getDay()
    return availableDaysOfWeek.includes(dayOfWeek)
  }

  function isPastDate(day: number) {
    const dateStr = getDateString(day)
    return dateStr < today
  }

  return (
    <>
      <header className="page-header">
        <h1 className="playfair" style={{ fontSize: '22px', fontWeight: 600, color: '#1A3329', letterSpacing: '-0.02em' }}>Calendar</h1>
        <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>Mark dates when you&apos;re unavailable</p>
      </header>
      <div className="page-content" style={{ maxWidth: '1400px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
          <div className="dash-card rounded-2xl" style={{ padding: '32px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
              <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} style={{ width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', background: '#F5F2EB', border: '1px solid #EDE9DF', cursor: 'pointer' }}>‹</button>
              <h2 className="playfair" style={{ fontSize: '28px', fontWeight: 600, color: '#1A3329', letterSpacing: '-0.02em' }}>
                {new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} style={{ width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', background: '#F5F2EB', border: '1px solid #EDE9DF', cursor: 'pointer' }}>›</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px', marginBottom: '16px' }}>
              {daysOfWeek.map(day => (
                <div key={day} style={{ textAlign: 'center', fontSize: '14px', fontWeight: 700, color: '#9CA3AF', paddingBottom: '8px' }}>{day}</div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
              {calendarDays.map((day, i) => {
                if (day === null) return <div key={`empty-${i}`} />
                const dateStr = getDateString(day)
                const isMarkedUnavailable = isDateMarkedUnavailable(day)
                const isAvailable = isDayAvailable(day)
                const isPast = isPastDate(day)
                const isToday = dateStr === today
                const isSelected = selectedDates.includes(dateStr)

                return (
                  <button
                    key={day}
                    onClick={(e) => handleDateClick(day, e)}
                    title="Click to select, Ctrl+Click to multi-select"
                    style={{
                      padding: '16px 8px',
                      borderRadius: '12px',
                      fontSize: '18px',
                      fontWeight: 700,
                      border: isSelected ? '3px solid #1A3329' : isMarkedUnavailable ? '2px solid #DC2626' : isToday ? '2px solid #2D6A4F' : '1px solid #EDE9DF',
                      background: isMarkedUnavailable ? '#DC2626' : isPast ? '#EDE9DF' : isToday ? 'linear-gradient(135deg, #D8F3DC, #c8eacd)' : isSelected ? 'linear-gradient(135deg, #D8F3DC, #c8eacd)' : !isAvailable ? '#F5F2EB' : '#FDFBF7',
                      color: isMarkedUnavailable ? 'white' : isPast ? '#9CA3AF' : isToday ? '#1A3329' : !isAvailable ? '#9CA3AF' : '#1A3329',
                      cursor: 'pointer',
                      opacity: 1,
                      transition: 'all 0.15s',
                    }}>
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="dash-card rounded-2xl" style={{ padding: '20px', height: 'fit-content', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1A3329', marginBottom: '16px' }}>Notes</h3>

            {selectedDates.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>
                  {selectedDates.length === 1
                    ? new Date(selectedDates[0] + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                    : `${selectedDates.length} dates selected`}
                </div>

                {selectedDates.length > 1 && (
                  <div style={{ padding: '12px', borderRadius: '8px', background: '#F5F2EB', border: '1px solid #EDE9DF' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', marginBottom: '6px' }}>Selected:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {selectedDates.slice().sort().map(date => (
                        <span key={date} style={{ background: '#D8F3DC', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', color: '#1A5C36' }}>
                          {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', background: '#F5F2EB', border: '1px solid #EDE9DF' }}>
                  <input
                    type="checkbox"
                    checked={isDateUnavailable}
                    onChange={(e) => handleToggleDates(e.target.checked)}
                    disabled={togglingDate}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#DC2626' }}
                  />
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#1A3329', cursor: 'pointer', flex: 1 }}>
                    {selectedDates.length === 1 ? 'Unavailable' : `Mark all unavailable`}
                  </label>
                </div>

                {isDateUnavailable && selectedDates.length === 1 && (
                  <div style={{ padding: '12px', borderRadius: '8px', background: '#FEE2E2', border: '1px solid #FECACA' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#DC2626', marginBottom: '4px' }}>Status</div>
                    <div style={{ fontSize: '13px', color: '#991B1B' }}>
                      {reason || 'No reason provided'}
                    </div>
                  </div>
                )}

                {isDateUnavailable && selectedDates.length > 1 && (
                  <div style={{ padding: '12px', borderRadius: '8px', background: '#FEE2E2', border: '1px solid #FECACA' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#DC2626', marginBottom: '4px' }}>{selectedDates.length} dates will be marked unavailable</div>
                  </div>
                )}

                {isDateUnavailable && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '6px' }}>
                      {selectedDates.length === 1 ? 'Add note' : 'Add note (for first date)'}
                    </label>
                    <textarea
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      placeholder="Holiday, personal day, training..."
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        background: '#F5F2EB',
                        border: '1px solid #EDE9DF',
                        color: '#1A3329',
                        resize: 'none',
                        fontFamily: 'inherit',
                      }}
                      rows={3}
                    />
                    <button onClick={handleSaveReason} disabled={savingReason}
                      style={{
                        marginTop: '8px',
                        width: '100%',
                        padding: '6px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#1A5C36',
                        border: '1px solid rgba(45,106,79,0.15)',
                        background: 'linear-gradient(135deg, #D8F3DC, #c8eacd)',
                        cursor: 'pointer',
                        opacity: savingReason ? 0.5 : 1,
                      }}>
                      {savingReason ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}

                {!isDateUnavailable && (
                  <div style={{ padding: '16px', borderRadius: '8px', background: '#F5F2EB', border: '1px solid #EDE9DF', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>📅</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>
                      {selectedDates.length === 1 ? 'Available for bookings' : `All ${selectedDates.length} dates available`}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>📝</div>
                <div style={{ fontSize: '12px' }}>Click dates to select<br /><span style={{ fontSize: '11px', fontWeight: 500 }}>Ctrl+Click for multi-select</span></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ─── SERVICES PAGE ────────────────────────────────────────────────────────────
function ServicesPage({ supabase }: {
  supabase: ReturnType<typeof createClient>
}) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<{ name: string; price: number; duration_minutes: number; payment_type: 'none' | 'deposit' | 'full'; deposit_amount: number }>({ name: '', price: 0, duration_minutes: 30, payment_type: 'full', deposit_amount: 0 })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadServices() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('services').select('*').eq('profile_id', user.id).order('name')
      setServices(data || [])
      setLoading(false)
    }
    loadServices()
  }, [])

  async function handleSave() {
    if (!formData.name.trim()) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (editingId) {
      await supabase.from('services').update({ name: formData.name, price: formData.price, duration_minutes: formData.duration_minutes, payment_type: formData.payment_type, deposit_amount: formData.deposit_amount }).eq('id', editingId)
      setServices(prev => prev.map(s => s.id === editingId ? { ...s, name: formData.name, price: formData.price, duration_minutes: formData.duration_minutes, payment_type: formData.payment_type, deposit_amount: formData.deposit_amount } : s))
    } else {
      const { data } = await supabase.from('services').insert({ profile_id: user.id, name: formData.name, price: formData.price, duration_minutes: formData.duration_minutes, payment_type: formData.payment_type, deposit_amount: formData.deposit_amount }).select().single()
      if (data) setServices(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    }
    setEditingId(null)
    setFormData({ name: '', price: 0, duration_minutes: 30, payment_type: 'full' as const, deposit_amount: 0 })
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this service?')) return
    await supabase.from('services').delete().eq('id', id)
    setServices(prev => prev.filter(s => s.id !== id))
  }

  return (
    <>
      <header className="page-header">
        <h1 className="playfair" style={{ fontSize: '22px', fontWeight: 600, color: '#1A3329', letterSpacing: '-0.02em' }}>Services</h1>
        <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>Manage your grooming services and pricing</p>
      </header>
      <div className="page-content" style={{ maxWidth: '700px' }}>
        {/* ADD/EDIT FORM */}
        <div className="dash-card rounded-2xl" style={{ padding: '20px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1A3329', marginBottom: '16px' }}>{editingId ? 'Edit Service' : 'Add New Service'}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="text" placeholder="Service name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ padding: '12px', borderRadius: '10px', fontSize: '14px', background: '#F5F2EB', border: '1px solid #EDE9DF', color: '#1A3329' }} />
            <input type="number" placeholder="Price" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} style={{ padding: '12px', borderRadius: '10px', fontSize: '14px', background: '#F5F2EB', border: '1px solid #EDE9DF', color: '#1A3329' }} />
            <input type="number" placeholder="Duration (minutes)" value={formData.duration_minutes} onChange={e => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })} style={{ padding: '12px', borderRadius: '10px', fontSize: '14px', background: '#F5F2EB', border: '1px solid #EDE9DF', color: '#1A3329' }} />
            <select value={formData.payment_type} onChange={e => setFormData({ ...formData, payment_type: e.target.value as 'none' | 'deposit' | 'full' })} style={{ padding: '12px', borderRadius: '10px', fontSize: '14px', background: '#F5F2EB', border: '1px solid #EDE9DF', color: '#1A3329' }}>
              <option value="none">No payment required</option>
              <option value="deposit">Deposit required</option>
              <option value="full">Full payment required</option>
            </select>
            {formData.payment_type === 'deposit' && (
              <input type="number" placeholder="Deposit amount" value={formData.deposit_amount} onChange={e => setFormData({ ...formData, deposit_amount: parseFloat(e.target.value) })} style={{ padding: '12px', borderRadius: '10px', fontSize: '14px', background: '#F5F2EB', border: '1px solid #EDE9DF', color: '#1A3329' }} />
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: 'white', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #1A3329, #2D6A4F)', opacity: saving ? 0.5 : 1 }}>
                {saving ? 'Saving...' : editingId ? 'Update' : 'Add Service'}
              </button>
              {editingId && (
                <button onClick={() => { setEditingId(null); setFormData({ name: '', price: 0, duration_minutes: 30, payment_type: 'full' as const, deposit_amount: 0 }) }} style={{ padding: '12px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#6B7280', border: 'none', cursor: 'pointer', background: '#F5F2EB' }}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SERVICES LIST */}
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: '#9CA3AF' }}>Loading...</div>
          </div>
        ) : services.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', background: 'linear-gradient(145deg, #FDFBF7, #F8F5EF)', borderRadius: '16px', border: '1px solid rgba(237,233,223,0.7)' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>✂️</div>
            <div style={{ fontWeight: 500, color: '#6B7280', marginBottom: '4px' }}>No services yet</div>
            <div style={{ fontSize: '13px', color: '#9CA3AF' }}>Add your first service above</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {services.map(service => (
              <div key={service.id} className="dash-card rounded-2xl" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#1A3329' }}>{service.name}</div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>${service.price} · {service.duration_minutes} min</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => { setEditingId(service.id); setFormData({ name: service.name, price: service.price, duration_minutes: service.duration_minutes, payment_type: service.payment_type, deposit_amount: service.deposit_amount }) }} style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#1A5C36', border: '1px solid rgba(45,106,79,0.15)', background: 'linear-gradient(135deg, #D8F3DC, #c8eacd)', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDelete(service.id)} style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#DC2626', border: '1px solid #FECACA', background: '#FEE2E2', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
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

      setReportData({ monthlyRevenue, topServices, newVsReturning: { new: newClients, returning: returningClients }, avgRevenuePerAppt, totalRevenue, totalAppointments, noShowRate: 0, reviewsGenerated: 0 })
      setLoading(false)
    }
    loadReports()
  }, [canAccessReports])

  const maxRevenue = reportData ? Math.max(...reportData.monthlyRevenue.map(m => m.revenue), 1) : 1

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
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl" style={{ background: 'rgba(245,242,235,0.8)', backdropFilter: 'blur(2px)' }}>
        <div style={{ fontSize: '36px', marginBottom: '16px' }}>📊</div>
        <div className="playfair" style={{ fontSize: '20px', fontWeight: 700, color: '#1A3329', marginBottom: '8px', textAlign: 'center' }}>Advanced Analytics</div>
        <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px', textAlign: 'center', maxWidth: '280px' }}>
          Revenue trends, no-show rates, top services &amp; client retention — available on Essential and Professional plans.
        </div>
        <button onClick={() => router.push('/pricing')} style={{ padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: 'white', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #1A3329, #2D6A4F)', boxShadow: '0 4px 15px rgba(26,51,41,0.25)' }}>
          Upgrade to Essential — $44/mo →
        </button>
      </div>
    </div>
  )

  return (
    <>
      <header className="page-header">
        <h1 className="playfair" style={{ fontSize: '22px', fontWeight: 600, color: '#1A3329', letterSpacing: '-0.02em' }}>Reports</h1>
        <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>Your business performance at a glance</p>
      </header>
      <div className="page-content">
        {!canAccessReports ? <BlurredContent /> : loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#2D6A4F', borderTopColor: 'transparent' }} />
          </div>
        ) : reportData ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div className="dash-card rounded-2xl" style={{ padding: '20px', background: 'linear-gradient(145deg, #1A3329, #0f2218)', boxShadow: '0 8px 24px rgba(15,34,24,0.25)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(216,243,220,0.5)', marginBottom: '8px' }}>Total Revenue</div>
                <div className="playfair" style={{ fontSize: '32px', fontWeight: 600, color: 'white', letterSpacing: '-0.02em' }}>${reportData.totalRevenue}</div>
              </div>
              <div className="dash-card rounded-2xl" style={{ padding: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9CA3AF', marginBottom: '8px' }}>Appointments</div>
                <div className="playfair" style={{ fontSize: '32px', fontWeight: 600, color: '#1A3329', letterSpacing: '-0.02em' }}>{reportData.totalAppointments}</div>
              </div>
              <div className="dash-card rounded-2xl" style={{ padding: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9CA3AF', marginBottom: '8px' }}>Avg per Appt</div>
                <div className="playfair" style={{ fontSize: '32px', fontWeight: 600, color: '#1A3329', letterSpacing: '-0.02em' }}>${reportData.avgRevenuePerAppt}</div>
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
          </div>
        ) : null}
      </div>
    </>
  )
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
function SettingsPage({ profile, onBusinessNameUpdate, onReviewLinkUpdate, supabase }: {
  profile: Profile | null
  onBusinessNameUpdate: (name: string) => void
  onReviewLinkUpdate: (link: string) => void
  supabase: ReturnType<typeof createClient>
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
              <button onClick={() => { setEditingName(true); setNewName(profile?.business_name || '') }} style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F2EB', border: '1px solid #EDE9DF', cursor: 'pointer' }}>✏️</button>
            )}
          </div>
          {editingName ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', background: '#F5F2EB', border: '1px solid #EDE9DF', color: '#1A3329' }} onKeyDown={e => e.key === 'Enter' && handleSaveName()} />
              {nameError && <p style={{ fontSize: '12px', color: '#DC2626' }}>{nameError}</p>}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleSaveName} disabled={savingName} style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: 'white', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #1A3329, #2D6A4F)', opacity: savingName ? 0.5 : 1 }}>
                  {savingName ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => { setEditingName(false); setNameError('') }} style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#6B7280', border: 'none', cursor: 'pointer', background: '#F5F2EB' }}>Cancel</button>
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
                <button onClick={() => { setEditingReviewLink(true); setNewReviewLink(profile?.google_review_link || '') }} style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F2EB', border: '1px solid #EDE9DF', cursor: 'pointer', flexShrink: 0, marginLeft: '12px' }}>✏️</button>
              )}
            </div>
            {editingReviewLink ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                <input type="url" value={newReviewLink} onChange={e => setNewReviewLink(e.target.value)} placeholder="https://g.page/r/your-review-link" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', background: '#F5F2EB', border: '1px solid #EDE9DF', color: '#1A3329' }} onKeyDown={e => e.key === 'Enter' && handleSaveReviewLink()} />
                <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Google Maps → your business → Share → Copy link</p>
                {reviewLinkError && <p style={{ fontSize: '12px', color: '#DC2626' }}>{reviewLinkError}</p>}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleSaveReviewLink} disabled={savingReviewLink} style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: 'white', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #1A3329, #2D6A4F)', opacity: savingReviewLink ? 0.5 : 1 }}>
                    {savingReviewLink ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => { setEditingReviewLink(false); setReviewLinkError('') }} style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#6B7280', border: 'none', cursor: 'pointer', background: '#F5F2EB' }}>Cancel</button>
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
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <div className="playfair" style={{ fontSize: '24px', fontWeight: 700, color: '#1A3329', marginBottom: '8px', textTransform: 'capitalize' }}>{profile?.plan || 'Starter'} Plan</div>
            <button onClick={handleManagePlan} disabled={portalLoading} style={{ marginTop: '16px', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#6B7280', border: '1px solid #EDE9DF', cursor: 'pointer', background: '#F5F2EB', opacity: portalLoading ? 0.5 : 1 }}>
              {portalLoading ? 'Opening...' : 'Manage Plan'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── MAIN DASHBOARD PAGE ──────────────────────────────────────────────────────
type ActivePage = 'dashboard' | 'customers' | 'dogs' | 'services' | 'calendar' | 'reports' | 'settings'

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming'>('today')
  const [activePage, setActivePage] = useState<ActivePage>('dashboard')
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null)
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

  const today = new Date().toISOString().split('T')[0]
  const todayAppts = appointments.filter(a => a.appointment_date === today)
  const upcomingAppts = appointments.filter(a => a.appointment_date > today)
  const thisMonthAppts = appointments.filter(a => a.appointment_date.startsWith(new Date().toISOString().slice(0, 7)))
  const monthRevenue = thisMonthAppts.reduce((sum, a) => sum + (a.services?.price || 0), 0)
  const bookingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/book/${profile?.slug}`
    : `https://pawbooking.net/book/${profile?.slug}`

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F2EB' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#2D6A4F', borderTopColor: 'transparent' }} />
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#2D6A4F' }}>Loading...</span>
      </div>
    </div>
  )

  const displayAppts = activeTab === 'today' ? todayAppts : upcomingAppts

  const navItems: { label: string; emoji: string; page: ActivePage }[] = [
    { label: 'Home', emoji: '▤', page: 'dashboard' },
    { label: 'Customer Profile', emoji: '📅', page: 'customers' },
    { label: 'Dog Profile', emoji: '🐾', page: 'dogs' },
    { label: 'Services', emoji: '✂️', page: 'services' },
    { label: 'Calendar', emoji: '📆', page: 'calendar' },
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
        .dash-layout { display: flex; min-height: 100vh; }
        .sidebar { width: 240px; flex-shrink: 0; display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; background: linear-gradient(180deg, #FDFBF7 0%, #FAF7F2 100%); border-right: 1px solid rgba(237,233,223,0.8); }
        .sidebar-nav-item { width: 100%; display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-radius: 12px; font-size: 14px; font-weight: 500; text-align: left; cursor: pointer; border: none; background: none; transition: all 0.2s ease; color: #6B7280; }
        .sidebar-nav-item:hover { background: rgba(45,106,79,0.08); color: #1A3329; }
        .sidebar-nav-active { background: linear-gradient(135deg, #1A3329, #2D6A4F) !important; color: white !important; box-shadow: 0 4px 12px rgba(26,51,41,0.2); }
        .main-content { flex: 1; overflow-x: hidden; }
        .page-header { padding: 20px 32px; border-bottom: 1px solid rgba(237,233,223,0.8); background: rgba(253,251,247,0.9); backdrop-filter: blur(8px); position: sticky; top: 0; z-index: 20; }
        .page-content { padding: 24px 32px; }
        .p-5 { padding: 20px; }
        .rounded-2xl { border-radius: 16px; }
        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          .page-header { padding: 16px 16px; }
          .page-content { padding: 16px 16px; }
        }
      `}</style>

      <div className="dash-layout">
        <aside className="sidebar">
          <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(237,233,223,0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #1A3329, #2D6A4F)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(26,51,41,0.25)', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 100 100" fill="#D8F3DC">
                  <ellipse cx="50" cy="70" rx="26" ry="20" /><ellipse cx="20" cy="44" rx="12" ry="15" />
                  <ellipse cx="38" cy="33" rx="12" ry="15" /><ellipse cx="62" cy="33" rx="12" ry="15" /><ellipse cx="80" cy="44" rx="12" ry="15" />
                </svg>
              </div>
              <span className="playfair" style={{ fontWeight: 700, fontSize: '16px', color: '#1A3329', letterSpacing: '-0.02em' }}>PawBooking</span>
            </div>
            <div style={{ background: 'linear-gradient(135deg, rgba(216,243,220,0.3), rgba(216,243,220,0.1))', borderRadius: '10px', padding: '10px 12px', border: '1px solid rgba(45,106,79,0.08)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9CA3AF', marginBottom: '2px' }}>Business</div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#1A3329', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.business_name}</div>
              <div style={{ fontSize: '12px', color: '#2D6A4F', fontWeight: 500, marginTop: '2px', textTransform: 'capitalize' }}>{profile?.plan} Plan</div>
            </div>
          </div>

          <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {navItems.map((item, i) => (
              <button key={i} onClick={() => setActivePage(item.page)} className={`sidebar-nav-item ${activePage === item.page ? 'sidebar-nav-active' : ''}`}>
                <span style={{ fontSize: '16px' }}>{item.emoji}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
              </button>
            ))}
          </nav>

          <div style={{ padding: '12px', borderTop: '1px solid rgba(237,233,223,0.6)' }}>
            <button onClick={handleSignOut} className="sidebar-nav-item" style={{ color: '#9CA3AF' }}>
              <span>↪</span> Sign out
            </button>
          </div>
        </aside>

        <main className="main-content">
          {activePage === 'dashboard' && (
            <>
              <header className="page-header">
                <h1 className="playfair" style={{ fontSize: '22px', fontWeight: 600, color: '#1A3329', letterSpacing: '-0.02em' }}>
                  {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}
                </h1>
                <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </header>
              <div className="page-content">
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
                          {activeTab === 'upcoming' && <div style={{ fontSize: '13px', color: '#6B7280' }}>{formatDate(appt.appointment_date)}</div>}
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

          {activePage === 'dogs' && <DogProfilePage supabase={supabase} />}

          {activePage === 'customers' && (
            <>
              <header className="page-header">
                <h1 className="playfair" style={{ fontSize: '22px', fontWeight: 600, color: '#1A3329', letterSpacing: '-0.02em' }}>Customer Profile</h1>
                <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>Your clients and their booking history</p>
              </header>
              <div className="page-content">
                <div style={{ padding: '60px 20px', textAlign: 'center', background: 'linear-gradient(145deg, #FDFBF7, #F8F5EF)', borderRadius: '16px', border: '1px solid rgba(237,233,223,0.7)' }}>
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>👥</div>
                  <div style={{ fontWeight: 500, color: '#6B7280', marginBottom: '4px' }}>Customer Profile</div>
                  <div style={{ fontSize: '13px', color: '#9CA3AF' }}>Coming next — building Dog Profile first</div>
                </div>
              </div>
            </>
          )}

          {activePage === 'calendar' && <CalendarPage profile={profile} supabase={supabase} />}
          {activePage === 'services' && <ServicesPage supabase={supabase} />}
          {activePage === 'reports' && <ReportsPage profile={profile} supabase={supabase} router={router} />}
          {activePage === 'settings' && (
            <SettingsPage
              profile={profile}
              onBusinessNameUpdate={(name) => setProfile(prev => prev ? { ...prev, business_name: name } : prev)}
              onReviewLinkUpdate={(link) => setProfile(prev => prev ? { ...prev, google_review_link: link } : prev)}
              supabase={supabase}
            />
          )}
        </main>
      </div>

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
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            <div style={{ display: 'flex', gap: '10px', padding: '0 20px 24px' }}>
              {selectedAppt.status !== 'completed' && (
                <button onClick={() => handleMarkComplete(selectedAppt.id)} disabled={completingAppt === selectedAppt.id}
                  style={{ flex: 1, padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#1A5C36', border: '1px solid rgba(45,106,79,0.15)', cursor: 'pointer', background: 'linear-gradient(135deg, #D8F3DC, #c8eacd)', opacity: completingAppt === selectedAppt.id ? 0.5 : 1 }}>
                  {completingAppt === selectedAppt.id ? 'Saving...' : '✓ Mark Complete'}
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
