export default function TermsOfService() {
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
        <h1 className="playfair legal-h1" style={{ fontSize: '34px', fontWeight: 700, color: '#1A3329', marginBottom: '8px' }}>Terms of Service</h1>
        <p style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '36px' }}>Last updated: June 9, 2026</p>

        <p>By accessing or using PawBooking ("the Service"), you agree to be bound by these Terms of Service. Please read them carefully.</p>

        <h2>1. Acceptance of Terms</h2>
        <p>By creating an account or using PawBooking, you agree to these Terms of Service and our Privacy Policy. If you do not agree, do not use the Service.</p>

        <h2>2. Description of Service</h2>
        <p>PawBooking is a SaaS platform that provides independent dog groomers with online booking management, automated SMS appointment reminders, client management, and business analytics tools.</p>

        <h2>3. Account Registration</h2>
        <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the security of your account credentials and for all activity that occurs under your account.</p>

        <h2>4. Subscription and Billing</h2>
        <ul>
          <li>PawBooking offers a 30-day free trial. No charge is made during the trial period.</li>
          <li>After the trial, you will be billed monthly at the rate of your selected plan ($30/mo for Basic, $50/mo for Pro).</li>
          <li>All payments are processed securely through Stripe.</li>
          <li>You may cancel your subscription at any time through your account settings.</li>
          <li>Cancellations take effect at the end of the current billing period.</li>
          <li>We do not offer refunds for partial billing periods.</li>
        </ul>

        <h2>5. SMS Messaging</h2>
        <p>By using PawBooking's SMS reminder features, you agree to:</p>
        <ul>
          <li>Only send messages to clients who have explicitly opted in to receive SMS communications</li>
          <li>Comply with all applicable laws and regulations regarding SMS marketing and communications</li>
          <li>Not use the SMS features for spam, harassment, or any unlawful purpose</li>
        </ul>
        <p>Message and data rates may apply to SMS recipients. PawBooking is not responsible for carrier charges incurred by your clients.</p>

        <h2>6. Acceptable Use</h2>
        <p>You agree not to use PawBooking to:</p>
        <ul>
          <li>Violate any applicable laws or regulations</li>
          <li>Infringe on the intellectual property rights of others</li>
          <li>Transmit spam, unsolicited messages, or harmful content</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Resell or sublicense the Service without our written permission</li>
        </ul>

        <h2>7. Data and Privacy</h2>
        <p>Your use of PawBooking is subject to our Privacy Policy. You retain ownership of all client data you enter into the platform. By using the Service, you grant PawBooking a limited license to process this data solely to provide the Service.</p>

        <h2>8. Service Availability</h2>
        <p>We strive to maintain high availability but do not guarantee uninterrupted access to the Service. We may perform maintenance that temporarily affects availability and will provide reasonable notice when possible.</p>

        <h2>9. Limitation of Liability</h2>
        <p>PawBooking is provided "as is" without warranties of any kind. To the maximum extent permitted by law, PawBooking shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.</p>

        <h2>10. Termination</h2>
        <p>We reserve the right to suspend or terminate accounts that violate these Terms of Service. You may terminate your account at any time by cancelling your subscription and deleting your account.</p>

        <h2>11. Changes to Terms</h2>
        <p>We may update these Terms of Service from time to time. Continued use of the Service after changes constitutes acceptance of the new terms.</p>

        <h2>12. Contact</h2>
        <p>For questions about these Terms, contact us at:<br />
        <a href="mailto:kamdrinoverholt@gmail.com">kamdrinoverholt@gmail.com</a></p>
      </div>

      <footer className="legal-footer">
        {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Contact', '/contact']].map(([label, href]) => (
          <a key={label} href={href} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textDecoration: 'none' }}>{label}</a>
        ))}
      </footer>
    </div>
  )
}
