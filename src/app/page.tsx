'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleProSignup() {
    router.push('/signup?plan=pro')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
        * { font-family: 'DM Sans', sans-serif; margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        .playfair { font-family: 'Playfair Display', serif; }
        body { background: #F5F2EB; }

        .nav-link { color: #1A3329; font-size: 14px; font-weight: 500; text-decoration: none; transition: color 0.15s; }
        .nav-link:hover { color: #2D6A4F; }
        .sticky-nav {
          position: sticky; top: 0; z-index: 50;
          background: rgba(245,242,235,0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(237,233,223,0.8);
        }

        .btn-primary {
          background: linear-gradient(135deg, #1A3329 0%, #2D6A4F 100%);
          color: white; font-weight: 600; font-size: 14px; padding: 14px 28px;
          border-radius: 50px; text-decoration: none; display: inline-block;
          transition: all 0.25s; border: none; cursor: pointer;
          box-shadow: 0 4px 15px rgba(26,51,41,0.2);
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(26,51,41,0.35), 0 0 0 1px rgba(45,106,79,0.3); }

        .btn-cta {
          background: linear-gradient(135deg, #E8704A 0%, #d4603a 100%);
          color: white; font-weight: 700; font-size: 16px; padding: 18px 42px;
          border-radius: 50px; text-decoration: none; display: inline-block;
          transition: all 0.25s; border: none; cursor: pointer;
          box-shadow: 0 4px 20px rgba(232,112,74,0.4); letter-spacing: 0.01em;
        }
        .btn-cta:hover { transform: translateY(-2px); box-shadow: 0 12px 35px rgba(232,112,74,0.5); }

        .section-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; color: #2D6A4F;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .section-label::before { content: ''; display: inline-block; width: 20px; height: 1.5px; background: linear-gradient(90deg, #2D6A4F, transparent); }
        .section-label::after { content: ''; display: inline-block; width: 20px; height: 1.5px; background: linear-gradient(270deg, #2D6A4F, transparent); }

        .pill-basic {
          font-size: 11px; font-weight: 700; padding: 5px 12px; border-radius: 50px;
          background: linear-gradient(135deg, #D8F3DC, #c8eacd); color: #1A5C36;
          box-shadow: 0 2px 8px rgba(45,106,79,0.15), inset 0 1px 0 rgba(255,255,255,0.6);
          border: 1px solid rgba(45,106,79,0.12);
        }
        .pill-pro {
          font-size: 11px; font-weight: 700; padding: 5px 12px; border-radius: 50px;
          background: linear-gradient(135deg, #FDE8D8, #fad9c4); color: #C25B2E;
          box-shadow: 0 2px 8px rgba(232,112,74,0.15), inset 0 1px 0 rgba(255,255,255,0.6);
          border: 1px solid rgba(232,112,74,0.15);
        }

        .divider { height: 1px; background: linear-gradient(90deg, transparent, #EDE9DF 20%, #EDE9DF 80%, transparent); }
        .price-large { font-family: 'Playfair Display', serif; font-size: 56px; font-weight: 700; color: #1A3329; line-height: 1; }
        .testimonial-quote { font-style: italic; color: #4B5563; font-size: 14px; line-height: 1.8; }

        .pro-card {
          background: linear-gradient(145deg, #1A3329 0%, #0f2218 100%);
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(15,34,24,0.4), inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .pro-btn {
          display: block; width: 100%; text-align: center; padding: 14px;
          border-radius: 14px; font-weight: 700; font-size: 14px;
          background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85));
          color: #1A3329; border: none; cursor: pointer; transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.9);
        }
        .pro-btn:hover { background: linear-gradient(135deg, #D8F3DC, #c8eacd); transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,0,0,0.2); }

        .step-circle {
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(216,243,220,0.12); border: 1px solid rgba(216,243,220,0.2);
          color: #D8F3DC; font-weight: 700; font-size: 15px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          box-shadow: 0 0 20px rgba(216,243,220,0.1);
        }

        .star { color: #F59E0B; }

        .hero-glow {
          position: absolute; width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(45,106,79,0.08) 0%, transparent 70%);
          pointer-events: none; top: 50%; left: 50%; transform: translate(-50%, -50%);
        }

        .glow-card {
          position: relative;
          background: linear-gradient(145deg, #FDFBF7, #F8F5EF);
          border-radius: 24px; border: 1px solid rgba(237,233,223,0.6);
          transition: all 0.25s ease;
        }
        .glow-card:hover { transform: translateY(-4px); border-color: rgba(45,106,79,0.2); box-shadow: 0 20px 50px rgba(26,51,41,0.1), 0 0 30px rgba(45,106,79,0.06); }

        .testimonial-card {
          background: linear-gradient(145deg, #FDFBF7, #FAF7F2);
          border: 1px solid rgba(237,233,223,0.8); border-radius: 24px;
          transition: all 0.25s ease; position: relative; overflow: hidden;
        }
        .testimonial-card::before {
          content: '"'; position: absolute; top: -10px; left: 20px;
          font-size: 120px; font-family: 'Playfair Display', serif;
          color: rgba(45,106,79,0.05); line-height: 1; pointer-events: none;
        }
        .testimonial-card:hover { transform: translateY(-4px); box-shadow: 0 20px 50px rgba(26,51,41,0.1); border-color: rgba(45,106,79,0.15); }

        .feature-icon {
          width: 52px; height: 52px; border-radius: 16px;
          display: flex; align-items: center; justify-content: center; font-size: 24px;
          background: linear-gradient(135deg, #F0F9F2, #E8F5EB);
          border: 1px solid rgba(45,106,79,0.1); box-shadow: 0 4px 12px rgba(45,106,79,0.08);
        }

        .problem-icon {
          width: 48px; height: 48px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center; font-size: 22px;
          background: linear-gradient(135deg, #FEF3EE, #FDEADE);
          border: 1px solid rgba(232,112,74,0.1); margin-bottom: 20px;
        }

        .cost-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 600; color: #C25B2E;
          background: linear-gradient(135deg, #FEF0EB, #FDE5D8);
          border: 1px solid rgba(232,112,74,0.15);
          padding: 6px 12px; border-radius: 50px; margin-top: 16px;
        }

        .logo-link { display: flex; align-items: center; gap: 10px; text-decoration: none; cursor: pointer; }

        /* HAMBURGER */
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 4px; background: none; border: none; }
        .hamburger span { display: block; width: 22px; height: 2px; background: #1A3329; border-radius: 2px; transition: all 0.2s; }

        /* MOBILE NAV DRAWER */
        .mobile-nav {
          display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 100;
          background: rgba(245,242,235,0.98); backdrop-filter: blur(16px);
          flex-direction: column; align-items: center; justify-content: center; gap: 32px;
        }
        .mobile-nav.open { display: flex; }
        .mobile-nav-link { font-size: 24px; font-weight: 600; color: #1A3329; text-decoration: none; }
        .mobile-close { position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 24px; cursor: pointer; color: #1A3329; padding: 8px; }

        /* STAT ITEM */
        .stat-item { position: relative; padding: 0 24px; }
        .stat-item:not(:last-child)::after {
          content: ''; position: absolute; right: 0; top: 50%; transform: translateY(-50%);
          width: 1px; height: 32px; background: rgba(255,255,255,0.08);
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .desktop-cta { display: none !important; }
          .hamburger { display: flex !important; }

          .nav-pad { padding: 14px 20px !important; }

          .hero-pad { padding: 60px 20px 48px !important; }
          .hero-glow { width: 300px; height: 300px; }

          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0 !important; }
          .stat-item { padding: 20px 16px !important; }
          .stat-item:not(:last-child)::after { display: none; }
          .stat-item:nth-child(1), .stat-item:nth-child(2) { border-bottom: 1px solid rgba(255,255,255,0.08); }
          .stat-item:nth-child(1) { border-right: 1px solid rgba(255,255,255,0.08); }
          .stat-item:nth-child(3) { border-right: 1px solid rgba(255,255,255,0.08); }

          .section-pad { padding: 64px 20px !important; }
          .section-pad-sm { padding: 48px 20px !important; }

          .cards-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; gap: 32px !important; }

          .pricing-grid { grid-template-columns: 1fr !important; }
          .price-large { font-size: 48px !important; }

          .footer-pad { padding: 24px 20px !important; }
          .footer-inner { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }

          .cta-btn-full { width: 100% !important; text-align: center !important; display: block !important; }
          .hero-subtext { font-size: 16px !important; }
          .problem-h2 br { display: none; }
        }

        @media (max-width: 480px) {
          .stat-stat { font-size: 26px !important; }
          .stat-label { font-size: 11px !important; }
        }
      `}</style>

      {/* MOBILE NAV DRAWER */}
      <div className={`mobile-nav ${menuOpen ? 'open' : ''}`}>
        <button className="mobile-close" onClick={() => setMenuOpen(false)}>✕</button>
        <a href="#features" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Features</a>
        <a href="#how" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>How It Works</a>
        <a href="#pricing" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Pricing</a>
        <Link href="/login" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Log in</Link>
        <Link href="/signup" className="btn-primary" onClick={() => setMenuOpen(false)} style={{ fontSize: '15px', padding: '14px 32px' }}>Start Free Trial</Link>
      </div>

      <div style={{ background: '#F5F2EB' }}>

        {/* NAVBAR */}
        <nav className="sticky-nav">
          <div className="nav-pad" style={{ width: '100%', padding: '16px 80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            <a href="#" className="logo-link">
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #1A3329, #2D6A4F)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(26,51,41,0.25)' }}>
                <svg width="16" height="16" viewBox="0 0 100 100" fill="#D8F3DC">
                  <ellipse cx="50" cy="70" rx="26" ry="20"/>
                  <ellipse cx="20" cy="44" rx="12" ry="15"/>
                  <ellipse cx="38" cy="33" rx="12" ry="15"/>
                  <ellipse cx="62" cy="33" rx="12" ry="15"/>
                  <ellipse cx="80" cy="44" rx="12" ry="15"/>
                </svg>
              </div>
              <span className="playfair" style={{ fontWeight: 700, fontSize: '17px', color: '#1A3329', letterSpacing: '-0.02em' }}>PawBooking</span>
            </a>

            {/* Desktop nav */}
            <div className="desktop-nav" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '56px' }}>
              <a href="#features" className="nav-link">Features</a>
              <a href="#how" className="nav-link">How It Works</a>
              <a href="#pricing" className="nav-link">Pricing</a>
            </div>
            <div className="desktop-cta" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <Link href="/login" className="nav-link">Log in</Link>
              <Link href="/signup" className="btn-primary" style={{ padding: '10px 24px', fontSize: '13px' }}>Start Free Trial</Link>
            </div>

            {/* Hamburger */}
            <button className="hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <span /><span /><span />
            </button>
          </div>
        </nav>

        {/* HERO */}
        <section className="hero-pad" style={{ textAlign: 'center', maxWidth: '860px', margin: '0 auto', padding: '96px 24px 80px', position: 'relative' }}>
          <div className="hero-glow" />
          <h1 className="playfair" style={{ fontSize: 'clamp(40px, 8vw, 88px)', fontWeight: 800, color: '#1A3329', lineHeight: 1.05, marginBottom: '28px', letterSpacing: '-0.02em' }}>
            Stop losing <span style={{ color: '#2D6A4F', background: 'linear-gradient(135deg, #2D6A4F, #45a070)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>$85</span> every<br />
            time a client <span style={{ color: '#E8704A', fontStyle: 'italic' }}>forgets.</span>
          </h1>
          <p className="hero-subtext" style={{ fontSize: '19px', color: '#5A6672', maxWidth: '540px', margin: '0 auto 40px', lineHeight: 1.75, fontWeight: 400 }}>
            PawBooking handles your bookings, sends automatic SMS reminders before every appointment, and requests Google reviews after every job — completely on autopilot.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
            <Link href="/signup" className="btn-primary cta-btn-full" style={{ fontSize: '15px', padding: '16px 36px' }}>
              Start Free Trial →
            </Link>
          </div>
          <p style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: 500 }}>
            30 days free · No credit card charged today · Cancel anytime
          </p>
        </section>

        {/* STATS BAR */}
        <div style={{ background: 'linear-gradient(135deg, #1A3329 0%, #0f2218 100%)', padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '600px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(216,243,220,0.3), transparent)' }} />
          <div className="stats-grid" style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', textAlign: 'center' }}>
            {[
              { stat: '−34%', label: 'Fewer no-shows' },
              { stat: '$85+', label: 'Saved per no-show' },
              { stat: '4.9★', label: 'Avg Google rating' },
              { stat: '5min', label: 'To get set up' },
            ].map((s, i) => (
              <div key={i} className="stat-item">
                <div className="playfair stat-stat" style={{ fontSize: '32px', fontWeight: 700, color: 'white', marginBottom: '6px', letterSpacing: '-0.02em' }}>{s.stat}</div>
                <div className="stat-label" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* PROBLEM SECTION */}
        <section className="section-pad" style={{ background: '#F5F2EB', padding: '96px 24px' }}>
          <div style={{ maxWidth: '940px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div className="section-label" style={{ marginBottom: '16px' }}>The Real Cost</div>
              <h2 className="playfair problem-h2" style={{ fontSize: 'clamp(26px, 5vw, 44px)', fontWeight: 700, color: '#1A3329', marginBottom: '18px', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                You're running a grooming business solo.<br />Admin shouldn't eat your day.
              </h2>
              <p style={{ color: '#6B7280', maxWidth: '500px', margin: '0 auto', fontSize: '16px', lineHeight: 1.75 }}>
                Every no-show, every forgotten review request, every booking taken over text — it adds up to real money and real hours out of your week.
              </p>
            </div>
            <div className="cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {[
                { icon: '📵', title: 'No-shows kill your day', desc: "You drove there. You set up. They forgot. That's 2 hours and a full appointment slot gone.", cost: '↑ $85–$150 lost per no-show' },
                { icon: '⭐', title: "Reviews don't ask themselves", desc: 'Happy clients mean to leave a review. They never do. Meanwhile your competitor has 200 more than you.', cost: '↓ Losing clients to groomers with more reviews' },
                { icon: '📱', title: 'Booking over text is chaos', desc: "Back-and-forth messages, double bookings, missed requests. There's a better way.", cost: '↑ Hours of admin every single week' },
              ].map((p, i) => (
                <div key={i} className="glow-card" style={{ padding: '28px' }}>
                  <div className="problem-icon">{p.icon}</div>
                  <h3 style={{ fontWeight: 700, color: '#1A3329', marginBottom: '12px', fontSize: '17px', letterSpacing: '-0.01em' }}>{p.title}</h3>
                  <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: 1.75 }}>{p.desc}</p>
                  <div className="cost-badge">{p.cost}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* FEATURES */}
        <section id="features" className="section-pad" style={{ background: '#FDFBF7', padding: '96px 24px' }}>
          <div style={{ maxWidth: '940px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div className="section-label" style={{ marginBottom: '16px' }}>What You Get</div>
              <h2 className="playfair" style={{ fontSize: 'clamp(26px, 5vw, 44px)', fontWeight: 700, color: '#1A3329', marginBottom: '18px', letterSpacing: '-0.02em' }}>
                Everything you need. Nothing you don't.
              </h2>
              <p style={{ color: '#6B7280', maxWidth: '480px', margin: '0 auto', fontSize: '16px', lineHeight: 1.75 }}>
                Three tools that work together to save you time, cut no-shows, and grow your reputation — automatically.
              </p>
            </div>
            <div className="cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {[
                { icon: '📅', tag: 'Basic + Pro', tagClass: 'pill-basic', title: 'Smart Online Booking', desc: 'Your own booking page clients can use 24/7. They pick a service, pick a time, and confirm — without texting you.', bullets: ['Custom booking link you share anywhere', 'You set your hours & services', 'Instant SMS when someone books', 'Up to 30 appointments/mo on Basic'] },
                { icon: '💬', tag: 'Basic + Pro', tagClass: 'pill-basic', title: 'Automatic SMS Reminders', desc: 'PawBooking texts your clients automatically 24 hours before their appointment.', bullets: ['24hr reminder by default', 'Proven to cut no-shows by 34%', 'Clients can confirm or cancel by reply', 'Auto rebooking reminders on Pro'] },
                { icon: '⭐', tag: 'Pro Only', tagClass: 'pill-pro', title: 'Auto Review Requests', desc: 'After every completed appointment, PawBooking sends a friendly text asking for a Google review. Completely automatic.', bullets: ['Sent automatically after each job', 'Smart personalized messages', 'Direct link to your Google review page', 'More reviews = more new clients'] },
              ].map((f, i) => (
                <div key={i} className="glow-card" style={{ padding: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div className="feature-icon">{f.icon}</div>
                    <span className={f.tagClass}>{f.tag}</span>
                  </div>
                  <h3 style={{ fontWeight: 700, color: '#1A3329', marginBottom: '12px', fontSize: '17px', letterSpacing: '-0.01em' }}>{f.title}</h3>
                  <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: 1.75, marginBottom: '16px' }}>{f.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {f.bullets.map((b, j) => (
                      <div key={j} style={{ fontSize: '13px', color: '#6B7280', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ color: '#2D6A4F', fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>✓</span>
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* HOW IT WORKS */}
        <section id="how" className="section-pad" style={{ background: 'linear-gradient(145deg, #1A3329 0%, #0f2218 100%)', padding: '96px 24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '400px', background: 'radial-gradient(ellipse, rgba(45,106,79,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
            <div className="section-label" style={{ marginBottom: '16px', color: 'rgba(216,243,220,0.7)' }}>Simple Setup</div>
            <h2 className="playfair" style={{ fontSize: 'clamp(26px, 5vw, 44px)', fontWeight: 700, color: 'white', marginBottom: '48px', letterSpacing: '-0.02em' }}>
              Up and running in 5 minutes.
            </h2>
            <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '40px', textAlign: 'left' }}>
              {[
                { step: '1', title: 'Set up your profile', desc: 'Add your services, prices, and availability. We walk you through every step — takes about 5 minutes.' },
                { step: '2', title: 'Share your booking link', desc: "Put it in your Instagram bio, Facebook page, and anywhere clients look for you. That's your whole marketing setup." },
                { step: '3', title: 'PawBooking handles the rest', desc: 'Reminders go out automatically. Reviews get requested automatically. You just show up and groom.' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="step-circle" style={{ marginBottom: '20px' }}>{s.step}</div>
                  <h3 style={{ fontWeight: 700, color: 'white', marginBottom: '10px', fontSize: '16px', letterSpacing: '-0.01em' }}>{s.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', lineHeight: 1.75 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="section-pad" style={{ background: '#F5F2EB', padding: '96px 24px' }}>
          <div style={{ maxWidth: '940px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div className="section-label" style={{ marginBottom: '16px' }}>Early Feedback</div>
              <h2 className="playfair" style={{ fontSize: 'clamp(26px, 5vw, 44px)', fontWeight: 700, color: '#1A3329', letterSpacing: '-0.02em' }}>
                Groomers love it.
              </h2>
            </div>
            <div className="cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {[
                { name: 'Sarah M.', role: 'Mobile Dog Groomer · Portland, OR', quote: "I was losing two or three appointments a week to no-shows. Since using PawBooking I've had maybe two in two months. The math is insane." },
                { name: 'Jamie R.', role: 'Solo Groomer · Austin, TX', quote: 'The review thing is genius. I gained 26 Google reviews in my first month. My phone is ringing from people who found me because of my rating.' },
                { name: 'Maria T.', role: 'Mobile Groomer · Denver, CO', quote: 'I used to take bookings over text like an animal. Now clients book themselves and I wake up to a full schedule. Worth every penny.' },
              ].map((t, i) => (
                <div key={i} className="testimonial-card" style={{ padding: '28px' }}>
                  <div className="star" style={{ fontSize: '14px', marginBottom: '16px', letterSpacing: '2px' }}>★★★★★</div>
                  <p className="testimonial-quote" style={{ marginBottom: '20px', fontSize: '15px' }}>"{t.quote}"</p>
                  <div style={{ borderTop: '1px solid rgba(237,233,223,0.8)', paddingTop: '16px' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#1A3329' }}>{t.name}</div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '3px' }}>{t.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* PRICING */}
        <section id="pricing" className="section-pad" style={{ background: '#FDFBF7', padding: '96px 24px' }}>
          <div style={{ maxWidth: '780px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div className="section-label" style={{ marginBottom: '16px' }}>Simple Pricing</div>
              <h2 className="playfair" style={{ fontSize: 'clamp(26px, 5vw, 44px)', fontWeight: 700, color: '#1A3329', marginBottom: '14px', letterSpacing: '-0.02em' }}>
                One app. Two plans. No surprises.
              </h2>
              <p style={{ color: '#6B7280', fontSize: '15px' }}>Cancel anytime. No contracts.</p>
            </div>
            <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'stretch' }}>

              {/* Basic */}
              <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', background: 'linear-gradient(145deg, #FDFBF7, #F8F5EF)', borderRadius: '24px', border: '1px solid rgba(237,233,223,0.8)', boxShadow: '0 4px 20px rgba(26,51,41,0.04)' }}>
                <h3 style={{ fontWeight: 700, color: '#1A3329', fontSize: '22px', marginBottom: '4px', letterSpacing: '-0.01em' }}>Basic</h3>
                <p style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '24px' }}>Perfect for getting started</p>
                <div style={{ marginBottom: '24px' }}>
                  <span className="playfair price-large">$30</span>
                  <span style={{ color: '#9CA3AF', fontSize: '14px' }}>/mo</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px', flex: 1 }}>
                  {[
                    { text: 'Online booking page', included: true },
                    { text: 'SMS appointment reminders', included: true },
                    { text: 'Up to 30 appointments/mo', included: true },
                    { text: 'Instant booking notifications', included: true },
                    { text: 'Client history', included: true },
                    { text: 'Rebooking reminders', included: false },
                    { text: 'Auto review requests', included: false },
                    { text: 'Monthly reports', included: false },
                    { text: 'Unlimited appointments', included: false },
                  ].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: f.included ? '#1A3329' : '#C4BDB0', textDecoration: f.included ? 'none' : 'line-through' }}>
                      <span style={{ marginRight: '8px', color: f.included ? '#2D6A4F' : '#C4BDB0', fontWeight: 700, fontSize: '12px' }}>{f.included ? '✓' : '✗'}</span>
                      {f.text}
                    </div>
                  ))}
                </div>
                <Link href="/signup?plan=basic" style={{ display: 'block', textAlign: 'center', padding: '13px', borderRadius: '12px', fontWeight: 600, fontSize: '14px', border: '1.5px solid #1A3329', color: '#1A3329', textDecoration: 'none', transition: 'all 0.2s', background: 'transparent' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1A3329'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#1A3329'; }}>
                  Start Free Trial
                </Link>
              </div>

              {/* Pro */}
              <div className="pro-card" style={{ padding: '32px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,106,79,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'linear-gradient(135deg, #E8704A, #d4603a)', color: 'white', fontSize: '11px', fontWeight: 700, padding: '5px 10px', borderRadius: '50px', boxShadow: '0 4px 12px rgba(232,112,74,0.35)', letterSpacing: '0.02em' }}>
                  ⭐ Most Popular
                </div>
                <h3 style={{ fontWeight: 700, color: 'white', fontSize: '22px', marginBottom: '4px', letterSpacing: '-0.01em' }}>Pro</h3>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginBottom: '24px' }}>For groomers serious about growth</p>
                <div style={{ marginBottom: '24px' }}>
                  <span className="playfair" style={{ fontSize: '56px', fontWeight: 700, color: 'white', lineHeight: 1, letterSpacing: '-0.02em' }}>$50</span>
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>/mo</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px', flex: 1 }}>
                  {['Everything in Basic', 'Unlimited appointments', 'Rebooking reminders', 'Auto review requests after every job', 'Monthly revenue & booking reports', 'Early access to new features', 'Priority support'].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>
                      <span style={{ marginRight: '8px', color: '#7DD3A0', fontWeight: 700, fontSize: '12px' }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>
                <button onClick={handleProSignup} className="pro-btn">Start Free Trial</button>
              </div>
            </div>
            <p style={{ textAlign: 'center', fontSize: '13px', color: '#9CA3AF', marginTop: '20px' }}>
              🐾 Both plans include a <strong style={{ color: '#1A3329' }}>30-day free trial</strong>.
            </p>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="section-pad" style={{ background: 'linear-gradient(145deg, #1A3329 0%, #0f2218 100%)', padding: '96px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '700px', height: '400px', background: 'radial-gradient(ellipse, rgba(45,106,79,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: '540px', margin: '0 auto', position: 'relative' }}>
            <h2 className="playfair" style={{ fontSize: 'clamp(26px, 5vw, 46px)', fontWeight: 700, color: 'white', marginBottom: '18px', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
              Ready to stop losing money to no-shows?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '36px', fontSize: '16px', lineHeight: 1.75 }}>
              Join PawBooking today. 30 days free, cancel anytime.
            </p>
            <Link href="/signup" className="btn-cta cta-btn-full">Start Your Free Trial →</Link>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '24px', flexWrap: 'wrap' }}>
              {['✓ 30 days free', '✓ Cancel anytime', '✓ Setup in 5 minutes'].map((t, i) => (
                <span key={i} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>{t}</span>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer-pad" style={{ background: '#0f2218', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '28px 40px' }}>
          <div className="footer-inner" style={{ maxWidth: '940px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'rgba(216,243,220,0.1)', width: '26px', height: '26px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(216,243,220,0.08)' }}>
                <svg width="12" height="12" viewBox="0 0 100 100" fill="#D8F3DC">
                  <ellipse cx="50" cy="70" rx="26" ry="20"/>
                  <ellipse cx="20" cy="44" rx="12" ry="15"/>
                  <ellipse cx="38" cy="33" rx="12" ry="15"/>
                  <ellipse cx="62" cy="33" rx="12" ry="15"/>
                  <ellipse cx="80" cy="44" rx="12" ry="15"/>
                </svg>
              </div>
              <span className="playfair" style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '14px' }}>PawBooking</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>© 2026 PawBooking. Built for dog groomers everywhere.</p>
            <div style={{ display: 'flex', gap: '20px' }}>
              {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Contact', '/contact']].map(([label, href], i) => (
                <a key={i} href={href} style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}>
                  {label}
                </a>
              ))}
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
