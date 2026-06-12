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
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
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
    if (!userId || !email) router.push('/signup')
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
      if (result.url) { window.location.href = result.url }
      else { setError('Could not create checkout session.'); setLoading(false) }
    } catch (err) {
      console.error('Checkout failed:', err)
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'DM Sans', sans-serif; }
        .playfair { font-family: 'Playfair Display', serif; }
        body { background: #1A3329; }

        .choose-root {
          min-height: 100vh;
          min-height: 100dvh;
          background: #1A3329;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 24px 16px 40px;
          position: relative;
          overflow: hidden;
        }

        .plan-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }

        .plan-card {
          text-align: left;
          border-radius: 20px;
          padding: 24px 20px;
          transition: all 0.2s;
          position: relative;
          cursor: pointer;
          border: 3px solid transparent;
          width: 100%;
        }

        .plan-card-selected {
          background: white !important;
          border-color: white !important;
          transform: scale(1.02);
        }

        .plan-card-unselected {
          background: rgba(255,255,255,0.08);
          border-color: transparent;
        }

        .cta-btn {
          width: 100%;
          padding: 16px;
          border-radius: 16px;
          font-size: 15px;
          font-weight: 700;
          background: white;
          color: #1A3329;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          -webkit-appearance: none;
        }
        .cta-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(0,0,0,0.25); }
        .cta-btn:disabled { opacity: 0.5; transform: none; cursor: not-allowed; }

        @media (max-width: 580px) {
          .plan-grid { grid-template-columns: 1fr !important; }
          .plan-card { padding: 20px 18px; }
          .choose-root { padding: 20px 14px 40px; align-items: flex-start; }
          .header-title { font-size: 24px !important; }
        }

        @media (max-width: 380px) {
          .plan-card { padding: 16px 14px; }
        }
      `}</style>

      <div className="choose-root">
        {/* Paw background */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', userSelect: 'none' }} aria-hidden="true">
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

        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '680px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(216,243,220,0.15)', border: '1px solid rgba(216,243,220,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 100 100" fill="#D8F3DC">
                  <ellipse cx="50" cy="70" rx="26" ry="20"/>
                  <ellipse cx="20" cy="44" rx="12" ry="15"/>
                  <ellipse cx="38" cy="33" rx="12" ry="15"/>
                  <ellipse cx="62" cy="33" rx="12" ry="15"/>
                  <ellipse cx="80" cy="44" rx="12" ry="15"/>
                </svg>
              </div>
              <span className="playfair" style={{ color: 'white', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em' }}>PawBooking</span>
            </div>
            <h1 className="header-title playfair" style={{ color: 'white', fontSize: '28px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.02em' }}>Choose your plan</h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', marginBottom: '16px' }}>Start free for 30 days — pick the plan that fits you best.</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '50px', fontWeight: 700, fontSize: '13px', background: '#D8F3DC', color: '#1A3329' }}>
              🔒 Your card will NOT be charged for 30 days
            </div>
          </div>

          {/* Plan Cards */}
          <div className="plan-grid">

            {/* Basic */}
            <button onClick={() => setSelectedPlan('basic')}
              className={`plan-card ${selectedPlan === 'basic' ? 'plan-card-selected' : 'plan-card-unselected'}`}>
              {selectedPlan === 'basic' && (
                <div style={{ position: 'absolute', top: '14px', right: '14px', width: '24px', height: '24px', borderRadius: '50%', background: '#1A3329', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10l5 5 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px', color: selectedPlan === 'basic' ? '#9CA3AF' : 'rgba(255,255,255,0.5)' }}>Basic</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
                <span className="playfair" style={{ fontSize: '36px', fontWeight: 700, color: selectedPlan === 'basic' ? '#1A3329' : 'white' }}>$30</span>
                <span style={{ fontSize: '13px', color: selectedPlan === 'basic' ? '#9CA3AF' : 'rgba(255,255,255,0.5)' }}>/mo</span>
              </div>
              <p style={{ fontSize: '12px', marginBottom: '16px', color: selectedPlan === 'basic' ? '#6B7280' : 'rgba(255,255,255,0.45)' }}>Perfect for getting started</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {basicFeatures.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <CheckIcon light={selectedPlan !== 'basic'} />
                    <span style={{ fontSize: '13px', color: selectedPlan === 'basic' ? '#374151' : 'rgba(255,255,255,0.75)' }}>{f}</span>
                  </div>
                ))}
              </div>
            </button>

            {/* Pro */}
            <button onClick={() => setSelectedPlan('pro')}
              className={`plan-card ${selectedPlan === 'pro' ? 'plan-card-selected' : 'plan-card-unselected'}`}>
              {/* Popular badge */}
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', padding: '4px 12px', borderRadius: '50px', fontSize: '11px', fontWeight: 700, background: '#E76F51', color: 'white', whiteSpace: 'nowrap' }}>
                ⭐ Most Popular
              </div>
              {selectedPlan === 'pro' && (
                <div style={{ position: 'absolute', top: '14px', right: '14px', width: '24px', height: '24px', borderRadius: '50%', background: '#1A3329', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10l5 5 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px', marginTop: '8px', color: selectedPlan === 'pro' ? '#9CA3AF' : 'rgba(255,255,255,0.5)' }}>Pro</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
                <span className="playfair" style={{ fontSize: '36px', fontWeight: 700, color: selectedPlan === 'pro' ? '#1A3329' : 'white' }}>$50</span>
                <span style={{ fontSize: '13px', color: selectedPlan === 'pro' ? '#9CA3AF' : 'rgba(255,255,255,0.5)' }}>/mo</span>
              </div>
              <p style={{ fontSize: '12px', marginBottom: '16px', color: selectedPlan === 'pro' ? '#6B7280' : 'rgba(255,255,255,0.45)' }}>For groomers serious about growth</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {proFeatures.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <CheckIcon light={selectedPlan !== 'pro'} />
                    <span style={{ fontSize: '13px', color: selectedPlan === 'pro' ? '#374151' : 'rgba(255,255,255,0.75)' }}>{f}</span>
                  </div>
                ))}
              </div>
            </button>

          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: '10px 16px', borderRadius: '10px', background: 'rgba(254,226,226,0.15)', border: '1px solid rgba(252,165,165,0.3)', fontSize: '13px', color: '#FCA5A5', marginBottom: '12px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          {/* CTA */}
          <button onClick={handleContinue} disabled={loading} className="cta-btn">
            {loading
              ? 'Redirecting to Stripe...'
              : `Start Free — ${selectedPlan === 'pro' ? '$50' : '$30'}/mo after 30 days →`}
          </button>

          {/* Reassurance */}
          <div style={{ marginTop: '16px', borderRadius: '16px', padding: '16px 20px', textAlign: 'center', background: 'rgba(216,243,220,0.1)', border: '1px solid rgba(216,243,220,0.2)' }}>
            <p style={{ color: 'white', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
              🔒 No charge today. Your 30-day free trial starts now.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>
              After 30 days you'll be billed {selectedPlan === 'pro' ? '$50' : '$30'}/mo. Cancel anytime before then and you pay absolutely nothing.
            </p>
          </div>

        </div>
      </div>
    </>
  )
}

export default function ChoosePlanPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#1A3329', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'white', borderTopColor: 'transparent' }} />
      </div>
    }>
      <ChoosePlanContent />
    </Suspense>
  )
}
