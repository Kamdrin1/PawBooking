export default function Contact() {
  const pawPositions = [
    { top: '3%',  left: '2%',  rotate: '-25deg', size: 90,  opacity: 0.06 },
    { top: '8%',  left: '78%', rotate: '40deg',  size: 65,  opacity: 0.05 },
    { top: '5%',  left: '42%', rotate: '-10deg', size: 50,  opacity: 0.04 },
    { top: '15%', left: '88%', rotate: '20deg',  size: 110, opacity: 0.06 },
    { top: '20%', left: '4%',  rotate: '35deg',  size: 80,  opacity: 0.05 },
    { top: '28%', left: '58%', rotate: '-40deg', size: 55,  opacity: 0.04 },
    { top: '35%', left: '18%', rotate: '15deg',  size: 40,  opacity: 0.05 },
    { top: '42%', left: '85%', rotate: '-20deg', size: 95,  opacity: 0.06 },
    { top: '50%', left: '2%',  rotate: '50deg',  size: 70,  opacity: 0.05 },
    { top: '55%', left: '65%', rotate: '-35deg', size: 50,  opacity: 0.04 },
    { top: '62%', left: '32%', rotate: '25deg',  size: 110, opacity: 0.06 },
    { top: '68%', left: '90%', rotate: '-15deg', size: 60,  opacity: 0.05 },
    { top: '72%', left: '10%', rotate: '45deg',  size: 45,  opacity: 0.04 },
    { top: '78%', left: '52%', rotate: '-30deg', size: 85,  opacity: 0.05 },
    { top: '83%', left: '75%', rotate: '10deg',  size: 55,  opacity: 0.04 },
    { top: '88%', left: '22%', rotate: '-45deg', size: 80,  opacity: 0.06 },
    { top: '93%', left: '60%', rotate: '30deg',  size: 45,  opacity: 0.05 },
    { top: '96%', left: '8%',  rotate: '-20deg', size: 100, opacity: 0.06 },
  ]

  return (
    <div style={{ background: '#F5F2EB', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        .playfair { font-family: 'Playfair Display', serif; }
        a { color: #2D6A4F; text-decoration: none; }

        .legal-nav {
          background: #FDFBF7;
          border-bottom: 1px solid #EDE9DF;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
          z-index: 10;
        }

        .contact-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 10;
        }

        .contact-content {
          max-width: 500px;
          width: 100%;
          padding: 24px;
          text-align: center;
        }

        .contact-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 20px;
          border-radius: 16px;
          background: linear-gradient(145deg, #FDFBF7, #F8F5EF);
          border: 1px solid rgba(237,233,223,0.8);
          text-align: left;
          transition: all 0.15s;
          text-decoration: none;
          margin-bottom: 16px;
          display: flex;
        }
        .contact-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(26,51,41,0.08); }

        .contact-icon {
          width: 42px; height: 42px; border-radius: 12px;
          background: linear-gradient(135deg, #D8F3DC, #c8eacd);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; font-size: 18px;
        }

        .contact-text h3 {
          font-weight: 600;
          font-size: 15px;
          color: #1A3329;
          margin-bottom: 3px;
        }

        .contact-text p {
          font-size: 13px;
          color: #6B7280;
          margin: 0;
        }

        .legal-footer {
          background: #1A3329;
          padding: 24px;
          display: flex;
          justify-content: center;
          gap: 24px;
          flex-wrap: wrap;
          position: relative;
          z-index: 10;
        }

        @media (max-width: 480px) {
          .legal-nav { padding: 14px 16px; }
          .contact-content { padding: 20px 16px; }
          .contact-h1 { font-size: 28px !important; }
          .contact-desc { font-size: 15px !important; }
        }
      `}</style>

      {/* Paw background */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} aria-hidden="true">
        {pawPositions.map((paw, i) => (
          <svg key={i} width={paw.size} height={paw.size} viewBox="0 0 100 100"
            style={{ position: 'absolute', top: paw.top, left: paw.left, transform: `rotate(${paw.rotate})`, opacity: paw.opacity }}
            fill="#1A3329">
            <ellipse cx="50" cy="70" rx="26" ry="20"/>
            <ellipse cx="20" cy="44" rx="12" ry="15"/>
            <ellipse cx="38" cy="33" rx="12" ry="15"/>
            <ellipse cx="62" cy="33" rx="12" ry="15"/>
            <ellipse cx="80" cy="44" rx="12" ry="15"/>
          </svg>
        ))}
      </div>

      {/* Nav */}
      <nav className="legal-nav">
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, #1A3329, #2D6A4F)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 3px 8px rgba(26,51,41,0.2)' }}>
            <svg width="14" height="14" viewBox="0 0 100 100" fill="#D8F3DC">
              <ellipse cx="50" cy="70" rx="26" ry="20"/>
              <ellipse cx="20" cy="44" rx="12" ry="15"/>
              <ellipse cx="38" cy="33" rx="12" ry="15"/>
              <ellipse cx="62" cy="33" rx="12" ry="15"/>
              <ellipse cx="80" cy="44" rx="12" ry="15"/>
            </svg>
          </div>
          <span className="playfair" style={{ fontWeight: 700, fontSize: '16px', color: '#1A3329', letterSpacing: '-0.01em' }}>PawBooking</span>
        </a>
      </nav>

      <div className="contact-wrapper">
        <div className="contact-content">
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, #1A3329, #2D6A4F)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(26,51,41,0.15)' }}>
            <svg width="22" height="22" viewBox="0 0 100 100" fill="#D8F3DC">
              <ellipse cx="50" cy="70" rx="26" ry="20"/>
              <ellipse cx="20" cy="44" rx="12" ry="15"/>
              <ellipse cx="38" cy="33" rx="12" ry="15"/>
              <ellipse cx="62" cy="33" rx="12" ry="15"/>
              <ellipse cx="80" cy="44" rx="12" ry="15"/>
            </svg>
          </div>

          <h1 className="playfair contact-h1" style={{ fontSize: '32px', fontWeight: 700, color: '#1A3329', marginBottom: '12px', letterSpacing: '-0.02em' }}>Get in Touch</h1>
          <p className="contact-desc" style={{ color: '#6B7280', fontSize: '16px', lineHeight: 1.7, marginBottom: '32px' }}>
            Questions about PawBooking? Reach out and we'll get back to you within 24 hours.
          </p>

          {/* Email Card */}
          <a href="mailto:team@pawbooking.net" className="contact-card">
            <div className="contact-icon">✉️</div>
            <div className="contact-text">
              <h3>team@pawbooking.net</h3>
              <p>Email us anytime</p>
            </div>
          </a>
        </div>
      </div>

      <footer className="legal-footer">
        {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Contact', '/contact']].map(([label, href]) => (
          <a key={label} href={href} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textDecoration: 'none' }}>{label}</a>
        ))}
      </footer>
    </div>
  )
}