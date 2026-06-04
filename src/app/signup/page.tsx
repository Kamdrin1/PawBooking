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

    // Step 1 — Create Supabase auth account
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    if (!data.user) { setError('Something went wrong. Please try again.'); setLoading(false); return }

    // Step 2 — Sign in immediately to establish session
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      console.error('Sign in after signup failed:', signInError.message)
    }

    // Step 3 — Create profile (no plan yet — set after plan selection)
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      email,
      business_name: businessName,
    }, { onConflict: 'id' })
    if (profileError) { setError(profileError.message); setLoading(false); return }

    // Step 4 — Redirect to plan selection
    router.push(`/choose-plan?userId=${data.user.id}&email=${encodeURIComponent(email)}&businessName=${encodeURIComponent(businessName)}`)
  }

  return (
    <div className="min-h-screen bg-[#1A3329] flex items-center justify-center p-4 relative overflow-hidden">
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

      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg width="32" height="32" viewBox="0 0 100 100" fill="#2D6A4F">
              <ellipse cx="50" cy="70" rx="26" ry="20"/>
              <ellipse cx="20" cy="44" rx="12" ry="15"/>
              <ellipse cx="38" cy="33" rx="12" ry="15"/>
              <ellipse cx="62" cy="33" rx="12" ry="15"/>
              <ellipse cx="80" cy="44" rx="12" ry="15"/>
            </svg>
            <h1 className="text-3xl font-bold text-[#1A3329]">PawBooking</h1>
          </div>
          <p className="text-gray-500 mt-1">Create your free account</p>
          <span className="inline-flex items-center gap-1 bg-[#D8F3DC] text-[#2D6A4F] text-xs font-semibold px-3 py-1 rounded-full mt-2">
            ✓ 30 days free · No credit card required
          </span>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
            <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2D6A4F] text-gray-900"
              placeholder="Fluffy Paws Grooming" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2D6A4F] text-gray-900"
              placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-[#2D6A4F] text-gray-900"
                placeholder="••••••••" required minLength={6} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
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

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-[#2D6A4F] text-white rounded-xl py-3 font-semibold hover:bg-[#1A3329] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 disabled:opacity-50 shadow-md hover:shadow-lg">
            {loading ? 'Creating account...' : 'Continue →'}
          </button>
        </form>

        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="flex -space-x-1">
            {['#52B788','#E76F51','#2D6A4F','#F4A261'].map((c, i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold" style={{ background: c }}>
                {['S','M','J','R'][i]}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400">Trusted by <span className="text-[#2D6A4F] font-semibold">37+ dog groomers</span></p>
        </div>

        <div className="border-t border-gray-100 mt-5 pt-4">
          <p className="text-center text-xs text-gray-400">No credit card required · Cancel anytime</p>
          <p className="text-center text-sm text-gray-500 mt-2">
            Already have an account?{' '}
            <Link href="/login" className="text-[#2D6A4F] font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
