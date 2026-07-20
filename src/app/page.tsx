'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

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

        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 4px; background: none; border: none; }
        .hamburger span { display: block; width: 22px; height: 2px; background: #1A3329; border-radius: 2px; transition: all 0.2s; }

        .mobile-nav {
          display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 100;
          background: rgba(245,242,235,0.98); backdrop-filter: blur(16px);
          flex-direction: column; align-items: center; justify-content: center; gap: 32px;
        }
        .mobile-nav.open { display: flex; }
        .mobile-nav-link { font-size: 24px; font-weight: 600; color: #1A3329; text-decoration: none; }
        .mobile-close { position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 24px; cursor: pointer; color: #1A3329; padding: 8px; }

        .stat-item { position: relative; padding: 0 24px; }
        .stat-item:not(:last-child)::after {
          content: ''; position: absolute; right: 0; top: 50%; transform: translateY(-50%);
          width: 1px; height: 32px; background: rgba(255,255,255,0.08);
        }

        details summary {
          list-style: none;
        }
        details summary::-webkit-details-marker {
          display: none;
        }
        details[open] summary::after {
          content: '−';
        }
        details summary::after {
          content: '+';
          float: right;
          font-weight: 700;
          color: #2D6A4F;
          font-size: 20px;
        }

        .page-wrapper {
          position: relative;
          z-index: 1;
        }

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

      <div className="page-wrapper" style={{ position: 'relative' }}>
        {/* MOBILE NAV DRAWER */}
        <div className={`mobile-nav ${menuOpen ? 'open' : ''}`}>
          <button className="mobile-close" onClick={() => setMenuOpen(false)}>✕</button>
          <a href="#features" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#how" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>How It Works</a>
          <a href="#pricing" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Pricing</a>
          <a href="/contact" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Contact</a>
          <Link href="/login" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Log in</Link>
          <Link href="/signup" className="btn-primary" onClick={() => setMenuOpen(false)} style={{ fontSize: '15px', padding: '14px 32px' }}>Start Free Trial</Link>
        </div>

        <div style={{ background: '#F5F2EB', position: 'relative', zIndex: 1 }}>

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

              <div className="desktop-nav" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '56px' }}>
                <a href="#features" className="nav-link">Features</a>
                <a href="#how" className="nav-link">How It Works</a>
                <a href="#pricing" className="nav-link">Pricing</a>
                <a href="/contact" className="nav-link">Contact</a>
              </div>
              <div className="desktop-cta" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                <Link href="/login" className="nav-link">Log in</Link>
                <Link href="/signup" className="btn-primary" style={{ padding: '10px 24px', fontSize: '13px' }}>Start Free Trial</Link>
              </div>

              <button className="hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu">
                <span /><span /><span />
              </button>
            </div>
          </nav>

          {/* HERO */}
          <section className="hero-pad" style={{ textAlign: 'center', maxWidth: '860px', margin: '0 auto', padding: '96px 24px 80px', position: 'relative' }}>
            <div className="hero-glow" />
            <h1 className="playfair" style={{ fontSize: 'clamp(40px, 8vw, 88px)', fontWeight: 800, color: '#1A3329', lineHeight: 1.05, marginBottom: '28px', letterSpacing: '-0.02em' }}>
              Stop texting clients back<br />
              all day. Let them <span style={{ color: '#E8704A', fontStyle: 'italic' }}>book themselves.</span>
            </h1>
            <p className="hero-subtext" style={{ fontSize: '19px', color: '#5A6672', maxWidth: '540px', margin: '0 auto 40px', lineHeight: 1.75, fontWeight: 400 }}>
              Your clients book themselves online. Reminders and review requests go out on their own. You just show up and groom.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
              <Link href="/signup" className="btn-primary cta-btn-full" style={{ fontSize: '15px', padding: '16px 36px' }}>
                Start Free Trial →
              </Link>
            </div>
            <p style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: 500 }}>
              30 days free · Nothing charged today · Cancel anytime
            </p>
          </section>

          {/* STATS BAR */}
          <div style={{ background: 'linear-gradient(135deg, #1A3329 0%, #0f2218 100%)', padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '600px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(216,243,220,0.3), transparent)' }} />
            <div className="stats-grid" style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', textAlign: 'center' }}>
              {[
                { stat: 'Solo', label: 'Built for solo groomers' },
                { stat: 'No app', label: 'Nothing for clients to download' },
                { stat: 'Auto', label: 'Reminders & reviews on autopilot' },
                { stat: '1 day', label: 'Set up in an afternoon' },
              ].map((s, i) => (
                <div key={i} className="stat-item">
                  <div className="playfair stat-stat" style={{ fontSize: '32px', fontWeight: 700, color: 'white', marginBottom: '6px', letterSpacing: '-0.02em' }}>{s.stat}</div>
                  <div className="stat-label" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* PROBLEM SECTION */}
          <section className="section-pad" style={{ background: '#F5F2EB', padding: '96px 24px', position: 'relative', zIndex: 1 }}>
            <div style={{ maxWidth: '940px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <div className="section-label" style={{ marginBottom: '16px' }}>Sound Familiar?</div>
                <h2 className="playfair problem-h2" style={{ fontSize: 'clamp(26px, 5vw, 44px)', fontWeight: 700, color: '#1A3329', marginBottom: '18px', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                  You're running the whole thing solo.<br />The admin shouldn't run you.
                </h2>
                <p style={{ color: '#6B7280', maxWidth: '500px', margin: '0 auto', fontSize: '16px', lineHeight: 1.75 }}>
                  The texts that never stop. The no-shows. The reviews you meant to ask for. It piles up into hours you don't have.
                </p>
              </div>
              <div className="cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {[
                  { icon: '📱', title: 'The texting never stops', desc: "\"Any openings Saturday?\" — again. You're mid-groom, hands full, and the phone won't quit. Every booking is a conversation you have to have.", cost: 'Hours of back-and-forth every week' },
                  { icon: '📵', title: 'No-shows wreck your day', desc: "You set aside the time. They forgot. That's a slot you could've filled and can't get back.", cost: 'A full slot, gone' },
                  { icon: '⭐', title: "Reviews don't ask themselves", desc: 'Happy clients mean to leave a review. They never do — and the groomer down the road keeps pulling ahead.', cost: 'Clients pick whoever has more reviews' },
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
          <section id="features" className="section-pad" style={{ background: '#FDFBF7', padding: '96px 24px', position: 'relative', zIndex: 1 }}>
            <div style={{ maxWidth: '940px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <div className="section-label" style={{ marginBottom: '16px' }}>What Changes</div>
                <h2 className="playfair" style={{ fontSize: 'clamp(26px, 5vw, 44px)', fontWeight: 700, color: '#1A3329', marginBottom: '18px', letterSpacing: '-0.02em' }}>
                  Everything you need. Nothing you don't.
                </h2>
                <p style={{ color: '#6B7280', maxWidth: '480px', margin: '0 auto', fontSize: '16px', lineHeight: 1.75 }}>
                  Three things working quietly in the background so your day gets simpler, not busier.
                </p>
              </div>
              <div className="cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {[
                  { icon: '📅', tag: 'All Plans', tagClass: 'pill-basic', title: 'Clients book themselves', desc: 'Your own booking page, open 24/7. They pick a service and a time and confirm — no texting you, no waiting on a reply.', bullets: ['A booking link you share anywhere', 'You set your hours & services', 'A text lands the second someone books', 'Works on any phone or computer'] },
                  { icon: '💬', tag: 'All Plans', tagClass: 'pill-basic', title: 'Reminders send themselves', desc: 'PawBooking texts every client the day before, so far fewer people simply forget — and you never make an awkward follow-up call.', bullets: ['24-hour reminder, automatically', 'Clients reply to confirm or cancel', 'You hear about cancellations early', 'Win-back nudges on Essential+'] },
                  { icon: '⭐', tag: 'Essential + Professional', tagClass: 'pill-pro', title: 'More reviews, without asking', desc: 'After every finished groom, PawBooking texts a friendly review request for you — so happy clients actually leave the review they meant to.', bullets: ['Sent automatically after each job', 'Direct link to your Google page', 'No awkward in-person asking', 'More reviews means more new calls'] },
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
          <section id="how" className="section-pad" style={{ background: 'linear-gradient(145deg, #1A3329 0%, #0f2218 100%)', padding: '96px 24px', position: 'relative', overflow: 'hidden', zIndex: 1 }}>
            <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '400px', background: 'radial-gradient(ellipse, rgba(45,106,79,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
              <div className="section-label" style={{ marginBottom: '16px', color: 'rgba(216,243,220,0.7)' }}>Simple Setup</div>
              <h2 className="playfair" style={{ fontSize: 'clamp(26px, 5vw, 44px)', fontWeight: 700, color: 'white', marginBottom: '48px', letterSpacing: '-0.02em' }}>
                You could set this up today.
              </h2>
              <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '40px', textAlign: 'left' }}>
                {[
                  { step: '1', title: 'Add your services', desc: 'Your services, your prices, your hours. We walk you through it — takes about an afternoon.' },
                  { step: '2', title: 'Share your link', desc: "Drop it in your Instagram bio and Facebook page. That's your whole booking setup, done." },
                  { step: '3', title: 'Let it run', desc: 'Reminders and review requests go out on their own. You just show up and groom.' },
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

          {/* EXPERIENCE */}
          <section className="section-pad" style={{ background: '#FDFBF7', padding: '96px 24px', position: 'relative', zIndex: 1 }}>
            <div style={{ maxWidth: '940px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '56px' }}>
                <div className="section-label" style={{ marginBottom: '16px' }}>The Experience</div>
                <h2 className="playfair" style={{ fontSize: 'clamp(26px, 5vw, 44px)', fontWeight: 700, color: '#1A3329', letterSpacing: '-0.02em', marginBottom: '16px' }}>
                  Booking with you feels effortless.
                </h2>
                <p style={{ color: '#6B7280', maxWidth: '520px', margin: '0 auto', fontSize: '15px', lineHeight: 1.75 }}>
                  Clients don't see "PawBooking." They see your grooming service, your prices, your open times — ready whenever they are.
                </p>
              </div>

              <div style={{ background: 'linear-gradient(145deg, #1A3329, #0f2218)', borderRadius: '24px', padding: '40px', textAlign: 'center', position: 'relative', overflow: 'hidden', border: '1px solid rgba(216,243,220,0.1)' }}>
                <div style={{ position: 'absolute', top: '-50px', right: '-100px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,106,79,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
                
                <div style={{ maxWidth: '320px', margin: '0 auto', position: 'relative' }}>
                  <div style={{ background: '#000', borderRadius: '40px', padding: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                    <div style={{ background: '#000', height: '28px', borderRadius: '0 0 20px 20px', marginBottom: '8px' }} />
                    
                    <div style={{ background: '#F5F2EB', borderRadius: '32px', padding: '28px 20px', textAlign: 'center', minHeight: '500px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                      <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600, marginBottom: '20px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Saturday · 2:45 PM</div>
                      <div style={{ marginBottom: '28px' }}>
                        <div className="playfair" style={{ fontSize: '24px', fontWeight: 700, color: '#1A3329', marginBottom: '4px' }}>Book with Sarah</div>
                        <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Mobile Dog Grooming</div>
                      </div>
                      <div style={{ borderTop: '1px solid rgba(237,233,223,0.6)', paddingTop: '20px', marginBottom: '20px' }}>
                        <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, marginBottom: '12px', textAlign: 'left' }}>Select Service</div>
                        {['Standard Groom — $65', 'Bath & Dry — $45', 'Full Spa Package — $95'].map((service, i) => (
                          <div key={i} style={{ padding: '10px 12px', background: i === 0 ? 'linear-gradient(135deg, #D8F3DC, #c8eacd)' : '#FDFBF7', borderRadius: '10px', fontSize: '13px', color: '#1A3329', fontWeight: i === 0 ? 600 : 400, marginBottom: '8px', border: i === 0 ? '1px solid rgba(45,106,79,0.2)' : '1px solid rgba(237,233,223,0.6)', textAlign: 'left' }}>
                            {service}
                          </div>
                        ))}
                      </div>
                      <div style={{ borderTop: '1px solid rgba(237,233,223,0.6)', paddingTop: '20px' }}>
                        <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, marginBottom: '12px', textAlign: 'left' }}>Pick a Time</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          {['10:00 AM', '2:00 PM', '3:30 PM', '4:45 PM'].map((time, i) => (
                            <div key={i} style={{ padding: '10px', background: i === 1 ? 'linear-gradient(135deg, #E8704A, #d4603a)' : '#FDFBF7', borderRadius: '10px', fontSize: '12px', color: i === 1 ? 'white' : '#1A3329', fontWeight: 600, border: i === 1 ? 'none' : '1px solid rgba(237,233,223,0.6)', cursor: 'pointer' }}>
                              {time}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(237,233,223,0.6)' }}>
                        <button style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #1A3329, #2D6A4F)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                          Confirm Booking →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginTop: '32px', position: 'relative', zIndex: 1 }}>
                  A few taps and they're booked — no calls, no waiting on you.
                </p>
              </div>
            </div>
          </section>

          <div className="divider" />

          {/* FAQ */}
          <section className="section-pad" style={{ background: '#FDFBF7', padding: '96px 24px', position: 'relative', zIndex: 1 }}>
            <div style={{ maxWidth: '720px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <div className="section-label" style={{ marginBottom: '16px' }}>Questions?</div>
                <h2 className="playfair" style={{ fontSize: 'clamp(26px, 5vw, 44px)', fontWeight: 700, color: '#1A3329', letterSpacing: '-0.02em' }}>
                  The stuff groomers actually ask.
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                {[
                  { q: 'How do my clients actually book?', a: 'You get your own booking link (like pawbooking.net/book/sarah). Share it on Instagram, Facebook, or text it to a client. They tap it, pick a service and time, and confirm with their phone number. You get a text the moment they book.' },
                  { q: 'What if someone texts me instead of booking online?', a: 'No problem — you can still take that booking however you normally would. PawBooking never locks you out of your own clients. Most people, though, are happy to just book themselves once they have the link.' },
                  { q: 'Can clients book at night or on weekends?', a: 'Yes. Your booking page is open 24/7. Clients can book at midnight if they want — you wake up to a full schedule instead of a pile of texts.' },
                  { q: 'Will the reminders really send on their own?', a: 'Yes. Once you set your grooming schedule and timing in Settings, the 24-hour reminders and review requests go out automatically. You don\'t press a button.' },
                  { q: 'Can I block off vacation or a day off?', a: 'Yes. Mark any dates as unavailable in your calendar and clients simply can\'t book them. Take the week off without worrying about a surprise appointment.' },
                  { q: 'Do you connect with Instagram, Google, or Facebook?', a: 'Your booking link works everywhere you already post. Deeper Instagram and Google connections are on our roadmap.' },
                  { q: 'How do clients pay?', a: 'Booking is free for them. They pay you at the appointment — cash, card, Venmo, however you already take payment.' },
                  { q: 'How long does setup really take?', a: 'About an afternoon. Add your services, prices, and hours, grab your booking link, and share it. That\'s the whole thing.' },
                  { q: 'What if I have assistants or a small team?', a: 'Right now PawBooking is built for solo groomers. Multi-person team support is on our roadmap.' },
                ].map((item, i) => (
                  <details key={i} style={{ background: 'linear-gradient(145deg, #FDFBF7, #F8F5EF)', border: '1px solid rgba(237,233,223,0.8)', borderRadius: '16px', padding: '20px 24px', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <summary style={{ fontWeight: 600, color: '#1A3329', fontSize: '15px', outline: 'none', userSelect: 'none', cursor: 'pointer' }}>
                      {item.q}
                    </summary>
                    <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: 1.75, marginTop: '12px' }}>
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>

              <div style={{ background: 'linear-gradient(135deg, rgba(232,112,74,0.05), rgba(232,112,74,0.02))', border: '1px solid rgba(232,112,74,0.1)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '12px' }}>Still wondering about something?</p>
                <a href="mailto:team@pawbooking.net" style={{ color: '#E8704A', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
                  Get in touch →
                </a>
              </div>
            </div>
          </section>

          <div className="divider" />

          {/* PRICING */}
          <section id="pricing" className="section-pad" style={{ background: '#FDFBF7', padding: '96px 24px', position: 'relative', zIndex: 1 }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <div className="section-label" style={{ marginBottom: '16px' }}>Simple Pricing</div>
                <h2 className="playfair" style={{ fontSize: 'clamp(26px, 5vw, 44px)', fontWeight: 700, color: '#1A3329', marginBottom: '14px', letterSpacing: '-0.02em' }}>
                  Pick the plan that fits your week.
                </h2>
                <p style={{ color: '#6B7280', fontSize: '15px' }}>Cancel anytime. No contracts. Every plan starts with a 30-day free trial.</p>
              </div>

              <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'stretch' }}>
                {/* Starter */}
                <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', background: 'linear-gradient(145deg, #FDFBF7, #F8F5EF)', borderRadius: '24px', border: '1px solid rgba(237,233,223,0.8)' }}>
                  <h3 style={{ fontWeight: 700, color: '#1A3329', fontSize: '22px', marginBottom: '4px' }}>Starter</h3>
                  <p style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '24px' }}>For groomers just getting off the texts</p>
                  <div style={{ marginBottom: '24px' }}>
                    <span className="playfair price-large">$24</span>
                    <span style={{ color: '#9CA3AF', fontSize: '14px' }}>/mo</span>
                  </div>
                  <div style={{ flex: 1, marginBottom: '28px' }}>
                    {['Online booking page', 'SMS reminders', 'Up to 25 appointments/mo', 'Instant notifications'].map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: '#1A3329', marginBottom: '10px' }}>
                        <span style={{ marginRight: '8px', color: '#2D6A4F', fontWeight: 700 }}>✓</span> {f}
                      </div>
                    ))}
                  </div>
                  <Link href="/signup?plan=starter" style={{ display: 'block', textAlign: 'center', padding: '13px', borderRadius: '12px', fontWeight: 600, fontSize: '14px', border: '1.5px solid #1A3329', color: '#1A3329', textDecoration: 'none', background: 'transparent' }}>
                    Start Free Trial
                  </Link>
                </div>

                {/* Essential */}
                <div className="pro-card" style={{ padding: '32px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'linear-gradient(135deg, #E8704A, #d4603a)', color: 'white', fontSize: '11px', fontWeight: 700, padding: '5px 10px', borderRadius: '50px' }}>
                    ⭐ Most Popular
                  </div>
                  <h3 style={{ fontWeight: 700, color: 'white', fontSize: '22px', marginBottom: '4px' }}>Essential</h3>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginBottom: '24px' }}>For the busy solo groomer</p>
                  <div style={{ marginBottom: '24px' }}>
                    <span className="playfair" style={{ fontSize: '56px', fontWeight: 700, color: 'white' }}>$44</span>
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>/mo</span>
                  </div>
                  <div style={{ flex: 1, marginBottom: '28px' }}>
                    {['Everything in Starter', 'Unlimited appointments', 'Auto review requests', 'Smart rebooking reminders', 'Monthly reports'].map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.75)', marginBottom: '10px' }}>
                        <span style={{ marginRight: '8px', color: '#7DD3A0', fontWeight: 700 }}>✓</span> {f}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => router.push('/signup?plan=essential')} className="pro-btn">Start Free Trial</button>
                </div>

                {/* Pro */}
                <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', background: 'linear-gradient(145deg, #FDFBF7, #F8F5EF)', borderRadius: '24px', border: '1px solid rgba(237,233,223,0.8)' }}>
                  <h3 style={{ fontWeight: 700, color: '#1A3329', fontSize: '22px', marginBottom: '4px' }}>Professional</h3>
                  <p style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '24px' }}>For a growing grooming business</p>
                  <div style={{ marginBottom: '24px' }}>
                    <span className="playfair price-large">$79</span>
                    <span style={{ color: '#9CA3AF', fontSize: '14px' }}>/mo</span>
                  </div>
                  <div style={{ flex: 1, marginBottom: '28px' }}>
                    {['Everything in Essential', 'Priority phone support', 'Custom branding', 'Advanced analytics', 'Team support on our roadmap'].map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: '#1A3329', marginBottom: '10px' }}>
                        <span style={{ marginRight: '8px', color: '#E8704A', fontWeight: 700 }}>✓</span> {f}
                      </div>
                    ))}
                  </div>
                  <Link href="/signup?plan=pro" style={{ display: 'block', textAlign: 'center', padding: '13px', borderRadius: '12px', fontWeight: 600, fontSize: '14px', border: '1.5px solid #1A3329', color: '#1A3329', textDecoration: 'none', background: 'transparent' }}>
                    Start Free Trial
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* FINAL CTA */}
          <section className="section-pad" style={{ background: 'linear-gradient(145deg, #1A3329 0%, #0f2218 100%)', padding: '96px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden', zIndex: 1 }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '700px', height: '400px', background: 'radial-gradient(ellipse, rgba(45,106,79,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ maxWidth: '540px', margin: '0 auto', position: 'relative' }}>
              <h2 className="playfair" style={{ fontSize: 'clamp(26px, 5vw, 46px)', fontWeight: 700, color: 'white', marginBottom: '18px' }}>
                Less admin. More grooming.
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '36px', fontSize: '16px' }}>
                Your first month is on us. Set up this afternoon, cancel anytime.
              </p>
              <Link href="/signup" className="btn-cta cta-btn-full">Start Your Free Trial →</Link>
            </div>
          </section>

          {/* FOOTER */}
          <footer style={{ background: '#0f2218', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '28px 40px', position: 'relative', zIndex: 1 }}>
            <div style={{ maxWidth: '940px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="playfair" style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '14px' }}>© 2026 PawBooking</span>
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Contact', '/contact']].map(([label, href], i) => (
                  <a key={i} href={href} style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', textDecoration: 'none' }}>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </footer>

        </div>
      </div>
    </>
  )
}
