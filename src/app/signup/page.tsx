'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    if (!data.user) { setError('Something went wrong. Please try again.'); setLoading(false); return }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) console.error('Sign in after signup failed:', signInError.message)

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      email,
      business_name: businessName,
    }, { onConflict: 'id' })
    if (profileError) { setError(profileError.message); setLoading(false); return }

    router.push(`/choose-plan?userId=${data.user.id}&email=${encodeURIComponent(email)}&businessName=${encodeURIComponent(businessName)}`)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'DM Sans', sans-serif; }
        .playfair { font-family: 'Playfair Display', serif; }
        body { background: #1A3329; }

        .signup-root {
          min-height: 100vh;
          min-height: 100dvh;
          background: #1A3329;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          position: relative;
          overflow: hidden;
        }

        .signup-card {
          background: white;
          border-radius: 24px;
          padding: 36px 32px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.3);
          position: relative;
          z-index: 10;
        }

        .input-field {
          width: 100%;
          border: 1.5px solid #E5E7EB;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 15px;
          color: #111827;
          background: white;
          transition: border-color 0.15s;
          -webkit-appearance: none;
        }
        .input-field:focus { outline: none; border-color: #2D6A4F; box-shadow: 0 0 0 3px rgba(45,106,79,0.1); }
        .input-field::placeholder { color: #9CA3AF; }
        .input-password { padding-right: 48px; }

        .btn-primary {
          width: 100%;
          background: linear-gradient(135deg, #1A3329, #2D6A4F);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 14px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 15px rgba(26,51,41,0.3);
          -webkit-appearance: none;
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(26,51,41,0.35); }
        .btn-primary:active { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.5; transform: none; cursor: not-allowed; }

        .eye-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #9CA3AF;
          display: flex;
          align-items: center;
          padding: 4px;
          transition: color 0.15s;
        }
        .eye-btn:hover { color: #6B7280; }

        @media (max-width: 480px) {
          .signup-card { padding: 28px 20px; border-radius: 20px; }
          .signup-logo-text { font-size: 26px !important; }
        }
      `}</style>

      <div className="signup-root">
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

        <div className="signup-card">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #1A3329, #2D6A4F)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(26,51,41,0.25)', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 100 100" fill="#D8F3DC">
                  <ellipse cx="50" cy="70" rx="26" ry="20"/>
                  <ellipse cx="20" cy="44" rx="12" ry="15"/>
                  <ellipse cx="38" cy="33" rx="12" ry="15"/>
                  <ellipse cx="62" cy="33" rx="12" ry="15"/>
                  <ellipse cx="80" cy="44" rx="12" ry="15"/>
                </svg>
              </div>
              <span className="playfair signup-logo-text" style={{ fontSize: '28px', fontWeight: 700, color: '#1A3329', letterSpacing: '-0.02em' }}>PawBooking</span>
            </div>
            <p style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '10px' }}>Create your free account</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #D8F3DC, #c8eacd)', color: '#1A5C36', fontSize: '12px', fontWeight: 700, padding: '5px 14px', borderRadius: '50px', border: '1px solid rgba(45,106,79,0.12)' }}>
              ✓ 30 days free · No credit card required
            </div>
          </div>

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Business Name</label>
              <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
                className="input-field" placeholder="Fluffy Paws Grooming" required
                autoComplete="organization" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input-field" placeholder="you@example.com" required
                autoComplete="email" inputMode="email" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="input-field input-password" placeholder="••••••••" required minLength={6}
                  autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="eye-btn">
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>Minimum 6 characters</p>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: '#FEE2E2', border: '1px solid #FECACA', fontSize: '13px', color: '#DC2626' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creating account...' : 'Continue →'}
            </button>
          </form>

          {/* Social proof */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
            <div style={{ display: 'flex' }}>
              {['#52B788', '#E76F51', '#2D6A4F', '#F4A261'].map((c, i) => (
                <div key={i} style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'white', background: c, marginLeft: i > 0 ? '-6px' : 0 }}>
                  {['S', 'M', 'J', 'R'][i]}
                </div>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Trusted by <span style={{ color: '#2D6A4F', fontWeight: 600 }}>37+ dog groomers</span></p>
          </div>

          <div style={{ borderTop: '1px solid #F3F4F6', marginTop: '20px', paddingTop: '16px' }}>
            <p style={{ textAlign: 'center', fontSize: '12px', color: '#9CA3AF', marginBottom: '8px' }}>No credit card required · Cancel anytime</p>
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#9CA3AF' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#2D6A4F', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
