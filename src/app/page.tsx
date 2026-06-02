'use client'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
        * { font-family: 'DM Sans', sans-serif; margin: 0; padding: 0; box-sizing: border-box; }
        .playfair { font-family: 'Playfair Display', serif; }
        body { background: #F5F2EB; }
        .nav-link { color: #1A3329; font-size: 14px; font-weight: 500; text-decoration: none; transition: color 0.15s; }
        .nav-link:hover { color: #2D6A4F; }
        .btn-primary { background: #1A3329; color: white; font-weight: 600; font-size: 14px; padding: 14px 28px; border-radius: 50px; text-decoration: none; display: inline-block; transition: all 0.2s; border: none; cursor: pointer; }
        .btn-primary:hover { background: #2D6A4F; transform: translateY(-1px); box-shadow: 0 8px 25px rgba(26,51,41,0.25); }
        .btn-outline { background: transparent; color: #1A3329; font-weight: 600; font-size: 14px; padding: 14px 28px; border-radius: 50px; text-decoration: none; display: inline-block; transition: all 0.2s; border: 1.5px solid #D1C9B8; }
        .btn-outline:hover { border-color: #1A3329; background: rgba(26,51,41,0.04); }
        .btn-cta { background: #E8704A; color: white; font-weight: 600; font-size: 15px; padding: 16px 36px; border-radius: 50px; text-decoration: none; display: inline-block; transition: all 0.2s; border: none; cursor: pointer; }
        .btn-cta:hover { background: #d4603a; transform: translateY(-1px); box-shadow: 0 8px 30px rgba(232,112,74,0.35); }
        .card { background: #FDFBF7; border: 1px solid #EDE9DF; border-radius: 20px; }
        .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 12px 35px rgba(26,51,41,0.08); }
        .section-label { font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #2D6A4F; }
        .divider { height: 1px; background: #EDE9DF; }
        .price-large { font-family: 'Playfair Display', serif; font-size: 56px; font-weight: 700; color: #1A3329; line-height: 1; }
        .testimonial-quote { font-style: italic; color: #4B5563; font-size: 14px; line-height: 1.7; }
        .sticky-nav { position: sticky; top: 0; z-index: 50; background: rgba(245,242,235,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid #EDE9DF; }
        .step-circle { width: 36px; height: 36px; border-radius: 50%; background: rgba(45,106,79,0.15); color: #2D6A4F; font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .pro-card { background: #1A3329; border-radius: 20px; }
        .star { color: #F59E0B; }
      `}</style>

      <div style={{ background: '#F5F2EB' }}>

        {/* NAVBAR */}
        <nav className="sticky-nav">
          <div style={{ width: '100%', padding: '16px 80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#1A3329', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 100 100" fill="#D8F3DC">
                  <ellipse cx="50" cy="70" rx="26" ry="20"/>
                  <ellipse cx="20" cy="44" rx="12" ry="15"/>
                  <ellipse cx="38" cy="33" rx="12" ry="15"/>
                  <ellipse cx="62" cy="33" rx="12" ry="15"/>
                  <ellipse cx="80" cy="44" rx="12" ry="15"/>
                </svg>
              </div>
              <span className="playfair" style={{ fontWeight: 600, fontSize: '16px', color: '#1A3329' }}>PawBooking</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '56px' }}>
              <a href="#features" className="nav-link">Features</a>
              <a href="#how" className="nav-link">How It Works</a>
              <a href="#pricing" className="nav-link">Pricing</a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
              <Link href="/login" className="nav-link">Log in</Link>
              <Link href="/signup" className="nav-link">Sign up</Link>
              <Link href="/signup" className="btn-primary" style={{ padding: '10px 22px' }}>Start Free Trial</Link>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', padding: '80px 24px' }}>
          <h1 className="playfair" style={{ fontSize: 'clamp(48px, 8vw, 80px)', fontWeight: 800, color: '#1A3329', lineHeight: 1.1, marginBottom: '24px' }}>
            Stop losing <span style={{ color: '#2D6A4F' }}>$85</span> every<br />
            time a client <span style={{ color: '#E8704A', fontStyle: 'italic' }}>forgets.</span>
          </h1>
          <p style={{ fontSize: '18px', color: '#6B7280', maxWidth: '520px', margin: '0 auto 40px', lineHeight: 1.7 }}>
            PawBooking handles your bookings, sends automatic SMS reminders before every appointment, and requests Google reviews after every job — completely on autopilot.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
            <Link href="/signup" className="btn-primary" style={{ fontSize: '15px', padding: '16px 32px' }}>
              Start Free Trial
            </Link>
            <Link href="/login" className="btn-outline" style={{ fontSize: '15px', padding: '16px 32px' }}>
              Log In →
            </Link>
          </div>
          <p style={{ fontSize: '13px', color: '#1A3329', fontWeight: 500 }}>30 days free. Cancel anytime.</p>
        </section>

        {/* STATS BAR */}
        <div style={{ background: '#1A3329', padding: '32px 24px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', textAlign: 'center' }}>
            {[
              { stat: '−34%', label: 'Fewer no-shows' },
              { stat: '$85+', label: 'Saved per no-show' },
              { stat: '4.9★', label: 'Avg Google rating' },
              { stat: '10min', label: 'To get set up' },
            ].map((s, i) => (
              <div key={i}>
                <div className="playfair" style={{ fontSize: '28px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>{s.stat}</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* PROBLEM SECTION */}
        <section style={{ background: '#F5F2EB', padding: '80px 24px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div className="section-label" style={{ marginBottom: '12px' }}>The Real Cost</div>
              <h2 className="playfair" style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 700, color: '#1A3329', marginBottom: '16px', lineHeight: 1.2 }}>
                You're running a grooming business solo.<br />Admin shouldn't eat your day.
              </h2>
              <p style={{ color: '#6B7280', maxWidth: '500px', margin: '0 auto', fontSize: '15px', lineHeight: 1.7 }}>
                Every no-show, every forgotten review request, every booking taken over text — it adds up to real money and real hours out of your week.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {[
                { icon: '📵', title: 'No-shows kill your day', desc: 'You drove there. You set up. They forgot. That\'s 2 hours and a full appointment slot gone.', cost: '↑ $85–$150 lost per no-show', costColor: '#E8704A' },
                { icon: '⭐', title: 'Reviews don\'t ask themselves', desc: 'Happy clients mean to leave a review. They never do. Meanwhile your competitor has 200 more than you.', cost: '↓ Losing clients to groomers with more reviews', costColor: '#E8704A' },
                { icon: '📱', title: 'Booking over text is chaos', desc: 'Back-and-forth messages, double bookings, missed requests. There\'s a better way.', cost: '↑ Hours of admin every single week', costColor: '#E8704A' },
              ].map((p, i) => (
                <div key={i} className="card card-hover" style={{ padding: '28px' }}>
                  <div style={{ fontSize: '28px', marginBottom: '16px' }}>{p.icon}</div>
                  <h3 style={{ fontWeight: 700, color: '#1A3329', marginBottom: '10px', fontSize: '16px' }}>{p.title}</h3>
                  <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: 1.7, marginBottom: '16px' }}>{p.desc}</p>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: p.costColor }}>{p.cost}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* FEATURES */}
        <section id="features" style={{ background: '#FDFBF7', padding: '80px 24px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div className="section-label" style={{ marginBottom: '12px' }}>What You Get</div>
              <h2 className="playfair" style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 700, color: '#1A3329', marginBottom: '16px' }}>
                Everything you need. Nothing you don't.
              </h2>
              <p style={{ color: '#6B7280', maxWidth: '480px', margin: '0 auto', fontSize: '15px', lineHeight: 1.7 }}>
                Three tools that work together to save you time, cut no-shows, and grow your reputation — automatically.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {[
                {
                  icon: '📅', tag: 'Basic + Pro', tagColor: '#2D6A4F', tagBg: '#D8F3DC',
                  title: 'Smart Online Booking',
                  desc: 'Your own booking page clients can use 24/7. They pick a service, pick a time, and confirm — without texting you.',
                  bullets: ['Custom booking link you share anywhere', 'You set your hours & services', 'Instant SMS when someone books', 'Up to 30 appointments/mo on Basic'],
                },
                {
                  icon: '💬', tag: 'Basic + Pro', tagColor: '#2D6A4F', tagBg: '#D8F3DC',
                  title: 'Automatic SMS Reminders',
                  desc: 'PawBooking texts your clients automatically — 24 hours before and 2 hours before their appointment.',
                  bullets: ['24hr + 2hr reminders by default', 'You choose the timing', 'Clients can confirm or cancel by reply', 'Proven to cut no-shows by 34%'],
                },
                {
                  icon: '⭐', tag: 'Pro Only', tagColor: '#E8704A', tagBg: '#FDE8D8',
                  title: 'Auto Review Requests',
                  desc: 'After every completed appointment, PawBooking sends a friendly text asking for a Google review. Completely automatic.',
                  bullets: ['Sent automatically after each job', 'Smart personalized messages', 'Direct link to your Google review page', 'More reviews = more new clients'],
                },
              ].map((f, i) => (
                <div key={i} className="card card-hover" style={{ padding: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <span style={{ fontSize: '28px' }}>{f.icon}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '50px', background: f.tagBg, color: f.tagColor }}>{f.tag}</span>
                  </div>
                  <h3 style={{ fontWeight: 700, color: '#1A3329', marginBottom: '10px', fontSize: '16px' }}>{f.title}</h3>
                  <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: 1.7, marginBottom: '16px' }}>{f.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {f.bullets.map((b, j) => (
                      <div key={j} style={{ fontSize: '13px', color: '#6B7280', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{ color: '#2D6A4F', fontWeight: 700, flexShrink: 0 }}>✓</span> {b}
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
        <section id="how" style={{ background: '#1A3329', padding: '80px 24px' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <div className="section-label" style={{ marginBottom: '12px', color: '#D8F3DC' }}>Simple Setup</div>
            <h2 className="playfair" style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 700, color: 'white', marginBottom: '48px' }}>
              Up and running in 10 minutes.
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px', textAlign: 'left' }}>
              {[
                { step: '1', title: 'Set up your profile', desc: 'Add your services, prices, and availability. We walk you through every step — takes about 10 minutes.' },
                { step: '2', title: 'Share your booking link', desc: 'Put it in your Instagram bio, Facebook page, and anywhere clients look for you. That\'s your whole marketing setup.' },
                { step: '3', title: 'PawBooking handles the rest', desc: 'Reminders go out automatically. Reviews get requested automatically. You just show up and groom.' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="step-circle" style={{ marginBottom: '16px', background: 'rgba(216,243,220,0.15)', color: '#D8F3DC' }}>{s.step}</div>
                  <h3 style={{ fontWeight: 700, color: 'white', marginBottom: '8px', fontSize: '15px' }}>{s.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section style={{ background: '#F5F2EB', padding: '80px 24px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div className="section-label" style={{ marginBottom: '12px' }}>Early Feedback</div>
              <h2 className="playfair" style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 700, color: '#1A3329' }}>
                Groomers love it.
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {[
                { name: 'Sarah M.', role: 'Mobile Dog Groomer · Portland, OR', quote: 'I was losing two or three appointments a week to no-shows. Since using PawBooking I\'ve had maybe two in two months. The math is insane.' },
                { name: 'Jamie R.', role: 'Solo Groomer · Austin, TX', quote: 'The review thing is genius. I gained 26 Google reviews in my first month. My phone is ringing from people who found me because of my rating.' },
                { name: 'Maria T.', role: 'Mobile Groomer · Denver, CO', quote: 'I used to take bookings over text like an animal. Now clients book themselves and I wake up to a full schedule. Worth every penny.' },
              ].map((t, i) => (
                <div key={i} className="card card-hover" style={{ padding: '28px' }}>
                  <div className="star" style={{ fontSize: '13px', marginBottom: '14px' }}>★★★★★</div>
                  <p className="testimonial-quote" style={{ marginBottom: '20px' }}>"{t.quote}"</p>
                  <div style={{ borderTop: '1px solid #EDE9DF', paddingTop: '16px' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#1A3329' }}>{t.name}</div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{t.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* PRICING */}
        <section id="pricing" style={{ background: '#FDFBF7', padding: '80px 24px' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div className="section-label" style={{ marginBottom: '12px' }}>Simple Pricing</div>
              <h2 className="playfair" style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 700, color: '#1A3329', marginBottom: '12px' }}>
                One app. Two plans. No surprises.
              </h2>
              <p style={{ color: '#6B7280', fontSize: '15px' }}>Cancel anytime. No contracts. Starts at less than $1 a day.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

              {/* Basic */}
              <div className="card" style={{ padding: '32px' }}>
                <h3 style={{ fontWeight: 700, color: '#1A3329', fontSize: '20px', marginBottom: '4px' }}>Basic</h3>
                <p style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '24px' }}>Perfect for getting started</p>
                <div style={{ marginBottom: '24px' }}>
                  <span className="playfair price-large">$29</span>
                  <span style={{ color: '#9CA3AF', fontSize: '14px' }}>/mo</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                  {[
                    { text: 'Online booking page', included: true },
                    { text: 'SMS appointment reminders', included: true },
                    { text: 'Up to 30 appointments/mo', included: true },
                    { text: 'Instant booking notifications', included: true },
                    { text: 'Auto review requests', included: false },
                    { text: 'Client history & dog notes', included: false },
                    { text: 'Unlimited appointments', included: false },
                  ].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: f.included ? '#1A3329' : '#D1C9B8', textDecoration: f.included ? 'none' : 'line-through' }}>
                      <span style={{ marginRight: '8px', color: f.included ? '#2D6A4F' : '#D1C9B8', fontWeight: 700 }}>{f.included ? '✓' : '✗'}</span>
                      {f.text}
                    </div>
                  ))}
                </div>
                <Link href="/signup" style={{ display: 'block', textAlign: 'center', padding: '13px', borderRadius: '12px', fontWeight: 600, fontSize: '14px', border: '1.5px solid #1A3329', color: '#1A3329', textDecoration: 'none', transition: 'all 0.15s' }}>
                  Start Free Trial
                </Link>
              </div>

              {/* Pro */}
              <div className="pro-card" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
                <h3 style={{ fontWeight: 700, color: 'white', fontSize: '20px', marginBottom: '4px' }}>Pro</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '24px' }}>For groomers serious about growth</p>
                <div style={{ marginBottom: '24px' }}>
                  <span className="playfair" style={{ fontSize: '56px', fontWeight: 700, color: 'white', lineHeight: 1 }}>$49</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>/mo</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                  {[
                    'Everything in Basic',
                    'Unlimited appointments',
                    'Auto review requests after every job',
                    'Client history & dog notes',
                    'Smart personalized messages',
                    'Priority support',
                    'Early access to new features',
                  ].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                      <span style={{ marginRight: '8px', color: '#D8F3DC', fontWeight: 700 }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>
                <button disabled style={{ display: 'block', width: '100%', textAlign: 'center', padding: '13px', borderRadius: '12px', fontWeight: 600, fontSize: '14px', background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)', border: 'none', cursor: 'not-allowed' }}>
                  Coming Soon
                </button>
              </div>

            </div>
            <p style={{ textAlign: 'center', fontSize: '13px', color: '#9CA3AF', marginTop: '20px' }}>
              🐾 Both plans include a <strong style={{ color: '#1A3329' }}>30-day free trial</strong>. No credit card required to start.
            </p>
          </div>
        </section>

        {/* FINAL CTA */}
        <section style={{ background: '#1A3329', padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: '520px', margin: '0 auto' }}>
            <h2 className="playfair" style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 700, color: 'white', marginBottom: '16px', lineHeight: 1.2 }}>
              Ready to stop losing money to no-shows?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '32px', fontSize: '15px', lineHeight: 1.7 }}>
              Join PawBooking today. 30 days free, cancel anytime.
            </p>
            <Link href="/signup" className="btn-cta">
              Start Your Free Trial →
            </Link>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '24px', flexWrap: 'wrap' }}>
              {['✓ 30 days free', '✓ Cancel anytime', '✓ Setup in 10 minutes'].map((t, i) => (
                <span key={i} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>{t}</span>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ background: '#1A3329', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '24px 32px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'rgba(216,243,220,0.15)', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 100 100" fill="#D8F3DC">
                  <ellipse cx="50" cy="70" rx="26" ry="20"/>
                  <ellipse cx="20" cy="44" rx="12" ry="15"/>
                  <ellipse cx="38" cy="33" rx="12" ry="15"/>
                  <ellipse cx="62" cy="33" rx="12" ry="15"/>
                  <ellipse cx="80" cy="44" rx="12" ry="15"/>
                </svg>
              </div>
              <span className="playfair" style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>PawBooking</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>© 2026 PawBooking. Built for dog groomers everywhere.</p>
            <div style={{ display: 'flex', gap: '20px' }}>
              {['Privacy', 'Terms', 'Contact'].map((l, i) => (
                <a key={i} href="#" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', textDecoration: 'none', transition: 'color 0.15s' }}>{l}</a>
              ))}
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}