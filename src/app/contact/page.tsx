export default function Contact() {
  return (
    <div style={{ background: '#F5F2EB', minHeight: '100vh' }}>
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
        }

        .contact-content {
          max-width: 600px;
          margin: 0 auto;
          padding: 48px 24px 80px;
          text-align: center;
        }

        .contact-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          border-radius: 16px;
          background: linear-gradient(145deg, #FDFBF7, #F8F5EF);
          border: 1px solid rgba(237,233,223,0.8);
          text-align: left;
          transition: all 0.15s;
          text-decoration: none;
          margin-bottom: 12px;
          display: flex;
        }
        .contact-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(26,51,41,0.08); }

        .legal-footer {
          background: #1A3329;
          padding: 24px;
          display: flex;
          justify-content: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        @media (max-width: 480px) {
          .legal-nav { padding: 14px 16px; }
          .contact-content { padding: 32px 16px 60px; }
          .contact-h1 { font-size: 28px !important; }
          .contact-desc { font-size: 15px !important; }
          .contact-card { padding: 16px 18px; gap: 12px; }
          .contact-icon { width: 38px !important; height: 38px !important; font-size: 17px !important; }
        }
      `}</style>

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

      <div className="contact-content">
        <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'linear-gradient(135deg, #1A3329, #2D6A4F)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 24px rgba(26,51,41,0.2)' }}>
          <svg width="28" height="28" viewBox="0 0 100 100" fill="#D8F3DC">
            <ellipse cx="50" cy="70" rx="26" ry="20"/>
            <ellipse cx="20" cy="44" rx="12" ry="15"/>
            <ellipse cx="38" cy="33" rx="12" ry="15"/>
            <ellipse cx="62" cy="33" rx="12" ry="15"/>
            <ellipse cx="80" cy="44" rx="12" ry="15"/>
          </svg>
        </div>

        <h1 className="playfair contact-h1" style={{ fontSize: '34px', fontWeight: 700, color: '#1A3329', marginBottom: '12px', letterSpacing: '-0.02em' }}>Get in Touch</h1>
        <p className="contact-desc" style={{ color: '#6B7280', fontSize: '16px', lineHeight: 1.7, marginBottom: '40px' }}>
          Have a question about PawBooking? We're here to help. Reach out and we'll get back to you as soon as possible.
        </p>

        {/* Contact Cards */}
        <div style={{ marginBottom: '24px' }}>
          <a href="mailto:team@pawbooking.net" className="contact-card">
            <div className="contact-icon" style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #D8F3DC, #c8eacd)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '20px' }}>
              ✉️
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '15px', color: '#1A3329', marginBottom: '2px' }}>Email Support</div>
              <div style={{ fontSize: '14px', color: '#2D6A4F' }}>team@pawbooking.net</div>
              <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>We typically respond within 24 hours</div>
            </div>
          </a>

          <a href="https://pawbooking.net" className="contact-card">
            <div className="contact-icon" style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #D8F3DC, #c8eacd)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '20px' }}>
              🌐
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '15px', color: '#1A3329', marginBottom: '2px' }}>Website</div>
              <div style={{ fontSize: '14px', color: '#2D6A4F' }}>pawbooking.net</div>
              <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>Learn more about PawBooking</div>
            </div>
          </a>
        </div>

        {/* SMS Opt-out */}
        <div style={{ padding: '20px 24px', borderRadius: '16px', background: 'linear-gradient(145deg, #FDFBF7, #F8F5EF)', border: '1px solid rgba(237,233,223,0.8)', textAlign: 'left' }}>
          <div style={{ fontWeight: 600, fontSize: '14px', color: '#1A3329', marginBottom: '8px' }}>📱 SMS Opt-Out</div>
          <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.7, margin: 0 }}>
            To stop receiving SMS appointment reminders, reply <strong style={{ color: '#1A3329' }}>STOP</strong> to any message. To resume, reply <strong style={{ color: '#1A3329' }}>START</strong>. For help, reply <strong style={{ color: '#1A3329' }}>HELP</strong> or email us at team@pawbooking.net.
          </p>
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