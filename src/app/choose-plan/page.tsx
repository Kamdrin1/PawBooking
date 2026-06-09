'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

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

const basicFeatures = [
  'Online booking page',
  'Up to 30 appointments/mo',
  'SMS appointment reminders',
  'Instant booking notifications',
  'Client history',
]

const proFeatures = [
  'Everything in Basic',
  'Unlimited appointments',
  'Rebooking reminders',
  'Auto review requests after every job',
  'Monthly revenue & booking reports',
  'Early access to new features',
  'Priority support',
]

function CheckIcon({ light }: { light?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-0.5">
      <circle cx="10" cy="10" r="10" fill={light ? 'rgba(255,255,255,0.15)' : '#D8F3DC'} />
      <path d="M6 10l3 3 5-5" stroke={light ? 'white' : '#1A5C36'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChoosePlanContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro'>('basic')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const userId = searchParams.get('userId') || ''
  const email = searchParams.get('email') || ''
  const businessName = searchParams.get('businessName') || ''

  useEffect(() => {
    if (!userId || !email) {
      router.push('/signup')
    }
  }, [userId, email, router])

  async function handleContinue() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/create-subscription-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email, businessName, plan: selectedPlan }),
      })

      if (!res.ok) {
        const errData = await res.json()
        console.error('Stripe checkout error:', errData)
        setError('Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      const result = await res.json()
      if (result.url) {
        window.location.href = result.url
      } else {
        setError('Could not create checkout session.')
        setLoading(false)
      }
    } catch (err) {
      console.error('Checkout failed:', err)
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
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

      <div className="relative z-10 w-full max-w-3xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <svg width="28" height="28" viewBox="0 0 100 100" fill="#D8F3DC">
              <ellipse cx="50" cy="70" rx="26" ry="20"/>
              <ellipse cx="20" cy="44" rx="12" ry="15"/>
              <ellipse cx="38" cy="33" rx="12" ry="15"/>
              <ellipse cx="62" cy="33" rx="12" ry="15"/>
              <ellipse cx="80" cy="44" rx="12" ry="15"/>
            </svg>
            <span className="text-white text-2xl font-bold" style={{ fontFamily: 'serif' }}>PawBooking</span>
          </div>
          <h1 className="text-white text-3xl font-bold mb-2">Choose your plan</h1>
          <p className="text-white/60 text-sm mb-4">Start free for 30 days — pick the plan that fits you best.</p>

          {/* Prominent no-charge badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm" style={{ background: '#D8F3DC', color: '#1A3329' }}>
            🔒 Your card will NOT be charged for 30 days
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">

          {/* Basic Card */}
          <button
            onClick={() => setSelectedPlan('basic')}
            className="text-left rounded-2xl p-6 transition-all duration-200 relative"
            style={{
              background: selectedPlan === 'basic' ? 'white' : 'rgba(255,255,255,0.08)',
              border: selectedPlan === 'basic' ? '3px solid white' : '3px solid transparent',
              transform: selectedPlan === 'basic' ? 'scale(1.02)' : 'scale(1)',
            }}>
            {selectedPlan === 'basic' && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#1A3329] flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10l5 5 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
            <div className="text-xs font-bold uppercase tracking-widest mb-1"
              style={{ color: selectedPlan === 'basic' ? '#9CA3AF' : 'rgba(255,255,255,0.5)' }}>
              Basic
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold" style={{ color: selectedPlan === 'basic' ? '#1A3329' : 'white', fontFamily: 'serif' }}>$30</span>
              <span className="text-sm" style={{ color: selectedPlan === 'basic' ? '#9CA3AF' : 'rgba(255,255,255,0.5)' }}>/mo</span>
            </div>
            <p className="text-xs mb-5" style={{ color: selectedPlan === 'basic' ? '#6B7280' : 'rgba(255,255,255,0.45)' }}>
              Perfect for getting started
            </p>
            <div className="flex flex-col gap-2.5">
              {basicFeatures.map(f => (
                <div key={f} className="flex items-start gap-2.5">
                  <CheckIcon light={selectedPlan !== 'basic'} />
                  <span className="text-sm" style={{ color: selectedPlan === 'basic' ? '#374151' : 'rgba(255,255,255,0.75)' }}>{f}</span>
                </div>
              ))}
            </div>
          </button>

          {/* Pro Card */}
          <button
            onClick={() => setSelectedPlan('pro')}
            className="text-left rounded-2xl p-6 transition-all duration-200 relative"
            style={{
              background: selectedPlan === 'pro' ? 'white' : 'rgba(255,255,255,0.08)',
              border: selectedPlan === 'pro' ? '3px solid white' : '3px solid transparent',
              transform: selectedPlan === 'pro' ? 'scale(1.02)' : 'scale(1)',
            }}>
            {/* Popular badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: '#E76F51', color: 'white' }}>
              ⭐ Most Popular
            </div>
            {selectedPlan === 'pro' && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#1A3329] flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10l5 5 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
            <div className="text-xs font-bold uppercase tracking-widest mb-1 mt-2"
              style={{ color: selectedPlan === 'pro' ? '#9CA3AF' : 'rgba(255,255,255,0.5)' }}>
              Pro
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold" style={{ color: selectedPlan === 'pro' ? '#1A3329' : 'white', fontFamily: 'serif' }}>$50</span>
              <span className="text-sm" style={{ color: selectedPlan === 'pro' ? '#9CA3AF' : 'rgba(255,255,255,0.5)' }}>/mo</span>
            </div>
            <p className="text-xs mb-5" style={{ color: selectedPlan === 'pro' ? '#6B7280' : 'rgba(255,255,255,0.45)' }}>
              For groomers serious about growth
            </p>
            <div className="flex flex-col gap-2.5">
              {proFeatures.map(f => (
                <div key={f} className="flex items-start gap-2.5">
                  <CheckIcon light={selectedPlan !== 'pro'} />
                  <span className="text-sm" style={{ color: selectedPlan === 'pro' ? '#374151' : 'rgba(255,255,255,0.75)' }}>{f}</span>
                </div>
              ))}
            </div>
          </button>

        </div>

        {/* CTA */}
        {error && <p className="text-red-300 text-sm text-center mb-3">{error}</p>}

        <button
          onClick={handleContinue}
          disabled={loading}
          className="w-full py-4 rounded-2xl text-base font-bold transition-all disabled:opacity-50"
          style={{ background: 'white', color: '#1A3329' }}>
          {loading
            ? 'Redirecting to Stripe...'
            : `Start Free — ${selectedPlan === 'pro' ? '$50' : '$30'}/mo after 30 days →`}
        </button>

        {/* Clear no-charge reassurance below button */}
        <div className="mt-4 rounded-2xl px-5 py-4 text-center" style={{ background: 'rgba(216,243,220,0.1)', border: '1px solid rgba(216,243,220,0.25)' }}>
          <p className="text-white font-semibold text-sm">
            🔒 No charge today. Your 30-day free trial starts now.
          </p>
          <p className="text-white/50 text-xs mt-1">
            After 30 days you'll be billed {selectedPlan === 'pro' ? '$50' : '$30'}/mo. Cancel anytime before then and you pay absolutely nothing.
          </p>
        </div>

      </div>
    </div>
  )
}

export default function ChoosePlanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1A3329] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin border-white" />
      </div>
    }>
      <ChoosePlanContent />
    </Suspense>
  )
}
