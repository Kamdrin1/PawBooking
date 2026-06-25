export default function Contact() {
  return (
    <div style={{ background: '#F5F2EB', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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

        .contact-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
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

        .divider {
          height: 1px;
          background: rgba(237,233,223,0.6);
          margin: 24px 0;
        }

        .sms-section {
          padding: 16px 18px;
          background: rgba(216,243,220,0.06);
          border-radius: 14px;
          border: 1px solid rgba(45,106,79,0.06);
          text-align: left;
        }

        .sms-section p {
          font-size: 13px;
          color: #6B7280;
          line-height: 1.7;
          margin: 0;
        }

        .sms-section strong {
          color: #1A3329;
          font-weight: 600;
        }

        .legal-footer {
          background: #1A3329;
          padding: 24px;
          display: flex;
          justify-content: center;
          gap: 24px;
          flex-wrap: wrap;
          margin-top: auto;
        }

        @media (max-width: 480px) {
          .legal-nav { padding: 14px 16px; }
          .contact-content { padding: 20px 16px; }
          .contact-h1 { font-size: 28px !important; }
          .contact-desc { font-size: 15px !important; }
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

          <div className="divider" />

          {/* SMS Info */}
          <div className="sms-section">
            <p>
              To stop SMS reminders, reply <strong>STOP</strong>. Reply <strong>START</strong> to resume, or <strong>HELP</strong> for assistance.
            </p>
          </div>
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