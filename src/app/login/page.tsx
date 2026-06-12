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

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (!error) setResetSent(true)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'DM Sans', sans-serif; }
        .playfair { font-family: 'Playfair Display', serif; }
        body { background: #1A3329; }

        .login-root {
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

        .login-card {
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

        .btn-ghost {
          width: 100%;
          background: none;
          border: none;
          color: #9CA3AF;
          font-size: 14px;
          padding: 8px;
          cursor: pointer;
          transition: color 0.15s;
        }
        .btn-ghost:hover { color: #6B7280; }

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
          .login-card { padding: 28px 20px; border-radius: 20px; }
          .login-logo-text { font-size: 26px !important; }
        }
      `}</style>

      <div className="login-root">
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

        <div className="login-card">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #1A3329, #2D6A4F)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(26,51,41,0.25)' }}>
                <svg width="18" height="18" viewBox="0 0 100 100" fill="#D8F3DC">
                  <ellipse cx="50" cy="70" rx="26" ry="20"/>
                  <ellipse cx="20" cy="44" rx="12" ry="15"/>
                  <ellipse cx="38" cy="33" rx="12" ry="15"/>
                  <ellipse cx="62" cy="33" rx="12" ry="15"/>
                  <ellipse cx="80" cy="44" rx="12" ry="15"/>
                </svg>
              </div>
              <span className="playfair login-logo-text" style={{ fontSize: '28px', fontWeight: 700, color: '#1A3329', letterSpacing: '-0.02em' }}>PawBooking</span>
            </div>
            <p style={{ fontSize: '14px', color: '#9CA3AF' }}>Sign in to your grooming dashboard</p>
          </div>

          {showReset ? (
            <div>
              {resetSent ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📧</div>
                  <h3 style={{ fontWeight: 700, color: '#1A3329', marginBottom: '8px' }}>Check your email</h3>
                  <p style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '24px' }}>We sent a reset link to <strong style={{ color: '#1A3329' }}>{resetEmail}</strong></p>
                  <button onClick={() => { setShowReset(false); setResetSent(false) }}
                    style={{ background: 'none', border: 'none', color: '#2D6A4F', fontSize: '14px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                    Back to sign in
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontWeight: 700, color: '#1A3329', marginBottom: '4px' }}>Reset your password</h3>
                    <p style={{ fontSize: '14px', color: '#9CA3AF' }}>Enter your email and we&apos;ll send you a reset link.</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Email</label>
                    <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                      className="input-field" placeholder="you@example.com" required />
                  </div>
                  <button onClick={handleReset as unknown as React.MouseEventHandler} className="btn-primary">Send Reset Link →</button>
                  <button type="button" onClick={() => setShowReset(false)} className="btn-ghost">← Back to sign in</button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="input-field" placeholder="you@example.com" required
                  autoComplete="email" inputMode="email" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Password</label>
                  <button type="button" onClick={() => setShowReset(true)}
                    style={{ background: 'none', border: 'none', fontSize: '12px', color: '#2D6A4F', fontWeight: 600, cursor: 'pointer' }}>
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    className="input-field input-password" placeholder="••••••••" required
                    autoComplete="current-password" />
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
              </div>

              {error && (
                <div style={{ padding: '10px 14px', borderRadius: '10px', background: '#FEE2E2', border: '1px solid #FECACA', fontSize: '13px', color: '#DC2626' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
            </form>
          )}

          <div style={{ borderTop: '1px solid #F3F4F6', marginTop: '24px', paddingTop: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#9CA3AF' }}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" style={{ color: '#2D6A4F', fontWeight: 600, textDecoration: 'none' }}>Sign up free</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
