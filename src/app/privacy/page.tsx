export default function PrivacyPolicy() {
  return (
    <div style={{ background: '#F5F2EB', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        .playfair { font-family: 'Playfair Display', serif; }
        h2 { color: #1A3329; font-size: 17px; font-weight: 600; margin-top: 32px; margin-bottom: 10px; }
        p, li { color: #4B5563; font-size: 15px; line-height: 1.8; margin-bottom: 10px; }
        ul { padding-left: 20px; margin-bottom: 10px; }
        a { color: #2D6A4F; }

        .legal-nav {
          background: #FDFBF7;
          border-bottom: 1px solid #EDE9DF;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .legal-content {
          max-width: 720px;
          margin: 0 auto;
          padding: 48px 24px 80px;
        }

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
          .legal-content { padding: 32px 16px 60px; }
          .legal-h1 { font-size: 28px !important; }
          h2 { font-size: 16px; margin-top: 24px; }
          p, li { font-size: 14px; }
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

      <div className="legal-content">
        <h1 className="playfair legal-h1" style={{ fontSize: '34px', fontWeight: 700, color: '#1A3329', marginBottom: '8px' }}>Privacy Policy</h1>
        <p style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '36px' }}>Last updated: June 9, 2026</p>

        <p>PawBooking ("we," "us," or "our") operates the PawBooking platform accessible at pawbooking.net. This Privacy Policy explains how we collect, use, and protect your information.</p>

        <h2>1. Information We Collect</h2>
        <p>We collect information you provide directly to us, including:</p>
        <ul>
          <li>Name, email address, phone number, and business name when you create an account</li>
          <li>Client information entered by groomers including client names, phone numbers, email addresses, and dog information</li>
          <li>Payment information processed securely through Stripe</li>
          <li>Appointment details including dates, times, and service information</li>
        </ul>

        <h2>2. SMS Communications</h2>
        <p>PawBooking sends automated SMS appointment reminders to dog grooming clients who have explicitly opted in via a checkbox on the booking form. By checking the opt-in box, clients consent to receive:</p>
        <ul>
          <li>Appointment reminder messages sent 24 hours before scheduled appointments</li>
          <li>Rebooking reminder messages sent approximately 28 days after a completed appointment</li>
        </ul>
        <p>Message frequency varies based on appointment activity. Message and data rates may apply. You can opt out at any time by replying <strong>STOP</strong> to any message. Reply <strong>HELP</strong> for help.</p>

        <h2>3. How We Use Your Information</h2>
        <ul>
          <li>To provide and operate the PawBooking platform</li>
          <li>To send appointment reminders and notifications</li>
          <li>To process payments through Stripe</li>
          <li>To communicate with you about your account</li>
          <li>To improve our services</li>
        </ul>

        <h2>4. Information Sharing</h2>
        <p>We do not sell your personal information. We share information only with trusted service providers who help us operate our platform, including:</p>
        <ul>
          <li>Stripe for payment processing</li>
          <li>Telnyx for SMS delivery</li>
          <li>Supabase for secure data storage</li>
          <li>Vercel for platform hosting</li>
        </ul>

        <h2>5. Data Security</h2>
        <p>We implement industry-standard security measures to protect your information. All payment data is handled by Stripe and never stored on our servers.</p>

        <h2>6. Data Retention</h2>
        <p>We retain your information for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data by contacting us.</p>

        <h2>7. Your Rights</h2>
        <p>You have the right to access, correct, or delete your personal information. To exercise these rights, contact us at kamdrinoverholt@gmail.com.</p>

        <h2>8. Children's Privacy</h2>
        <p>PawBooking is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children.</p>

        <h2>9. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated date.</p>

        <h2>10. Contact Us</h2>
        <p>If you have questions about this Privacy Policy, please contact us at:</p>
        <p><strong>PawBooking</strong><br />
        Email: <a href="mailto:kamdrinoverholt@gmail.com">kamdrinoverholt@gmail.com</a><br />
        Website: <a href="https://pawbooking.net">pawbooking.net</a></p>
      </div>

      {/* Footer */}
      <footer className="legal-footer">
        {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Contact', '/contact']].map(([label, href]) => (
          <a key={label} href={href} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textDecoration: 'none' }}>{label}</a>
        ))}
      </footer>
    </div>
  )
}
