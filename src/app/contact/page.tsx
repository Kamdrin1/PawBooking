export default function Contact() {
  return (
    <div style={{ background: '#F5F2EB', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        .playfair { font-family: 'Playfair Display', serif; }
        a { color: #2D6A4F; text-decoration: none; }
      `}</style>

      {/* Nav */}
      <nav style={{ background: '#FDFBF7', borderBottom: '1px solid #EDE9DF', padding: '16px 40px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#1A3329', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 100 100" fill="#D8F3DC">
            <ellipse cx="50" cy="70" rx="26" ry="20"/>
            <ellipse cx="20" cy="44" rx="12" ry="15"/>
            <ellipse cx="38" cy="33" rx="12" ry="15"/>
            <ellipse cx="62" cy="33" rx="12" ry="15"/>
            <ellipse cx="80" cy="44" rx="12" ry="15"/>
          </svg>
        </div>
        <span className="playfair" style={{ fontWeight: 600, fontSize: '16px', color: '#1A3329' }}>PawBooking</span>
      </nav>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#1A3329', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="28" height="28" viewBox="0 0 100 100" fill="#D8F3DC">
            <ellipse cx="50" cy="70" rx="26" ry="20"/>
            <ellipse cx="20" cy="44" rx="12" ry="15"/>
            <ellipse cx="38" cy="33" rx="12" ry="15"/>
            <ellipse cx="62" cy="33" rx="12" ry="15"/>
            <ellipse cx="80" cy="44" rx="12" ry="15"/>
          </svg>
        </div>

        <h1 className="playfair" style={{ fontSize: '36px', fontWeight: 700, color: '#1A3329', marginBottom: '12px' }}>Get in Touch</h1>
        <p style={{ color: '#6B7280', fontSize: '16px', lineHeight: 1.7, marginBottom: '48px' }}>
          Have a question about PawBooking? We're here to help. Reach out and we'll get back to you as soon as possible.
        </p>

        {/* Contact Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>

          {/* Email */}
          <a href="mailto:kamdrinoverholt@gmail.com"
            style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px', borderRadius: '16px', background: '#FDFBF7', border: '1px solid #EDE9DF', textAlign: 'left', transition: 'all 0.15s' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#D8F3DC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '20px' }}>
              ✉️
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '15px', color: '#1A3329', marginBottom: '2px' }}>Email Support</div>
              <div style={{ fontSize: '14px', color: '#2D6A4F' }}>kamdrinoverholt@gmail.com</div>
              <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>We typically respond within 24 hours</div>
            </div>
          </a>

          {/* Website */}
          <a href="https://pawbooking.net"
            style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px', borderRadius: '16px', background: '#FDFBF7', border: '1px solid #EDE9DF', textAlign: 'left' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#D8F3DC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '20px' }}>
              🌐
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '15px', color: '#1A3329', marginBottom: '2px' }}>Website</div>
              <div style={{ fontSize: '14px', color: '#2D6A4F' }}>pawbooking.net</div>
              <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>Learn more about PawBooking</div>
            </div>
          </a>

        </div>

        {/* SMS Opt-out note */}
        <div style={{ padding: '20px 24px', borderRadius: '16px', background: '#FDFBF7', border: '1px solid #EDE9DF', textAlign: 'left' }}>
          <div style={{ fontWeight: 600, fontSize: '14px', color: '#1A3329', marginBottom: '6px' }}>📱 SMS Opt-Out</div>
          <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.7, margin: 0 }}>
            To stop receiving SMS appointment reminders, reply <strong style={{ color: '#1A3329' }}>STOP</strong> to any message. To resume, reply <strong style={{ color: '#1A3329' }}>START</strong>. For help, reply <strong style={{ color: '#1A3329' }}>HELP</strong> or email us at kamdrinoverholt@gmail.com.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#1A3329', padding: '24px 40px', display: 'flex', justifyContent: 'center', gap: '24px' }}>
        <a href="/privacy" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Privacy</a>
        <a href="/terms" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Terms</a>
        <a href="/contact" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Contact</a>
      </footer>
    </div>
  )
}
