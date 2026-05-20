'use client'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F2EB] font-sans">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-8 py-5 bg-[#F5F2EB] sticky top-0 z-50 border-b border-black/5">
        <div className="flex items-center gap-2">
          <span className="text-[#2D6A4F] text-xl">🐾</span>
          <span className="font-bold text-[#1A3329] text-lg">PawBooking</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#1A3329]">
          <a href="#features" className="hover:text-[#2D6A4F] transition">Features</a>
          <a href="#how" className="hover:text-[#2D6A4F] transition">How It Works</a>
          <a href="#pricing" className="hover:text-[#2D6A4F] transition">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-[#1A3329] hover:text-[#2D6A4F] transition">Log in</Link>
          <Link href="/signup" className="bg-[#2D6A4F] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#1A3329] transition">Start Free Trial</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="flex flex-col items-center text-center px-6 pt-20 pb-16">
        <div className="bg-[#2D6A4F]/10 text-[#2D6A4F] text-sm font-medium px-4 py-1.5 rounded-full mb-8">
          🐾 Now live — start your free 30-day trial today
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-[#1A3329] leading-tight max-w-4xl mb-6">
          Stop losing <span className="text-[#2D6A4F]">$85</span> every time<br />
          a client <span className="text-[#E8704A] italic">forgets.</span>
        </h1>
        <p className="text-lg text-[#4A5568] max-w-xl mb-10">
          PawBooking handles your bookings, sends automatic SMS reminders before every appointment, and requests Google reviews after every job — completely on autopilot.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/signup" className="bg-[#2D6A4F] text-white font-semibold px-8 py-4 rounded-full hover:bg-[#1A3329] transition text-sm">
            Start Free Trial — No Card Required
          </Link>
          <Link href="/login" className="border border-[#1A3329]/20 text-[#1A3329] font-semibold px-8 py-4 rounded-full hover:bg-[#1A3329]/5 transition text-sm">
            Log In →
          </Link>
        </div>
        <p className="text-xs text-[#4A5568] mt-4">30 days free. No credit card needed. Cancel anytime.</p>
      </section>

      {/* STATS BAR */}
      <section className="bg-[#1A3329] py-8 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { stat: '−34%', label: 'Fewer no-shows' },
            { stat: '$85+', label: 'Saved per no-show' },
            { stat: '4.9★', label: 'Avg Google rating' },
            { stat: '10min', label: 'To get set up' },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-2xl font-black text-white">{s.stat}</div>
              <div className="text-white/50 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <p className="text-center text-sm font-semibold text-[#2D6A4F] uppercase tracking-widest mb-4">The Real Cost</p>
        <h2 className="text-3xl md:text-4xl font-black text-[#1A3329] text-center mb-4">
          You're running a grooming business solo.<br />Admin shouldn't eat your day.
        </h2>
        <p className="text-center text-[#4A5568] max-w-xl mx-auto mb-12">
          Every no-show, every forgotten review request, every booking taken over text — it adds up to real money and real hours out of your week.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '📵', title: 'No-shows kill your day', desc: 'You drove there. You set up. They forgot. That\'s 2 hours and a full appointment slot gone.', cost: '↑ $85–$150 lost per no-show' },
            { icon: '⭐', title: 'Reviews don\'t ask themselves', desc: 'Happy clients mean to leave a review. They never do. Meanwhile your competitor has 200 more than you.', cost: '↓ Losing clients to groomers with more reviews' },
            { icon: '📱', title: 'Booking over text is chaos', desc: 'Back-and-forth messages, double bookings, missed requests. There\'s a better way.', cost: '↑ Hours of admin every single week' },
          ].map((p, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
              <div className="text-3xl mb-4">{p.icon}</div>
              <h3 className="font-bold text-[#1A3329] text-lg mb-2">{p.title}</h3>
              <p className="text-[#4A5568] text-sm mb-4">{p.desc}</p>
              <span className="text-xs font-semibold text-[#E8704A]">{p.cost}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="bg-white px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm font-semibold text-[#2D6A4F] uppercase tracking-widest mb-4">What You Get</p>
          <h2 className="text-3xl md:text-4xl font-black text-[#1A3329] text-center mb-4">Everything you need. Nothing you don't.</h2>
          <p className="text-center text-[#4A5568] max-w-xl mx-auto mb-12">Three tools that work together to save you time, cut no-shows, and grow your reputation — automatically.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '📅',
                tag: 'Basic + Pro',
                title: 'Smart Online Booking',
                desc: 'Your own booking page clients can use 24/7. They pick a service, pick a time, and confirm — without texting you.',
                bullets: ['Custom booking link you share anywhere', 'You set your hours & services', 'Instant SMS when someone books', 'Up to 30 appointments/mo on Basic'],
              },
              {
                icon: '💬',
                tag: 'Basic + Pro',
                title: 'Automatic SMS Reminders',
                desc: 'PawBooking texts your clients automatically — 24 hours before and 2 hours before their appointment.',
                bullets: ['24hr + 2hr reminders by default', 'You choose the timing', 'Clients can confirm or cancel by reply', 'Proven to cut no-shows by 34%'],
              },
              {
                icon: '⭐',
                tag: 'Pro Only',
                title: 'Auto Review Requests',
                desc: 'After every completed appointment, PawBooking sends a friendly text asking for a Google review. Smart and completely automatic.',
                bullets: ['Sent automatically after each job', 'Smart personalized messages', 'Direct link to your Google review page', 'More reviews = more new clients'],
              },
            ].map((f, i) => (
              <div key={i} className="bg-[#F5F2EB] rounded-2xl p-6 border border-black/5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{f.icon}</span>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${f.tag === 'Pro Only' ? 'bg-[#E8704A]/10 text-[#E8704A]' : 'bg-[#2D6A4F]/10 text-[#2D6A4F]'}`}>{f.tag}</span>
                </div>
                <h3 className="font-bold text-[#1A3329] text-lg mb-2">{f.title}</h3>
                <p className="text-[#4A5568] text-sm mb-4">{f.desc}</p>
                <ul className="space-y-1">
                  {f.bullets.map((b, j) => (
                    <li key={j} className="text-xs text-[#4A5568] flex items-start gap-2">
                      <span className="text-[#2D6A4F] mt-0.5">✓</span> {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-[#1A3329] px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#2D6A4F] text-sm font-semibold uppercase tracking-widest mb-4">Simple Setup</p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-12">Up and running in 10 minutes.</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            {[
              { step: '1', title: 'Set up your profile', desc: 'Add your services, prices, and availability. We walk you through every step — takes about 10 minutes.' },
              { step: '2', title: 'Share your booking link', desc: 'Put it in your Instagram bio, Facebook page, and anywhere clients look for you. That\'s your whole marketing setup.' },
              { step: '3', title: 'PawBooking handles the rest', desc: 'Reminders go out automatically. Reviews get requested automatically. You just show up and groom.' },
            ].map((s, i) => (
              <div key={i}>
                <div className="w-10 h-10 rounded-full bg-[#2D6A4F] text-white font-bold flex items-center justify-center mb-4">{s.step}</div>
                <h3 className="font-bold text-white text-lg mb-2">{s.title}</h3>
                <p className="text-white/60 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <p className="text-center text-sm font-semibold text-[#2D6A4F] uppercase tracking-widest mb-4">Early Feedback</p>
        <h2 className="text-3xl md:text-4xl font-black text-[#1A3329] text-center mb-12">Groomers love it.</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Sarah M.', role: 'Mobile Dog Groomer · Portland, OR', quote: 'I was losing two or three appointments a week to no-shows. Since using PawBooking I\'ve had maybe two in two months. The math is insane.' },
            { name: 'Jamie R.', role: 'Solo Groomer · Austin, TX', quote: 'The review thing is genius. I gained 26 Google reviews in my first month. My phone is ringing from people who found me because of my rating.' },
            { name: 'Maria T.', role: 'Mobile Groomer · Denver, CO', quote: 'I used to take bookings over text like an animal. Now clients book themselves and I wake up to a full schedule. Worth every penny.' },
          ].map((t, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
              <div className="text-yellow-400 mb-3 text-sm">⭐⭐⭐⭐⭐</div>
              <p className="text-[#4A5568] text-sm mb-4 italic">"{t.quote}"</p>
              <div>
                <div className="font-bold text-[#1A3329] text-sm">{t.name}</div>
                <div className="text-xs text-[#4A5568]">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="bg-white px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm font-semibold text-[#2D6A4F] uppercase tracking-widest mb-4">Simple Pricing</p>
          <h2 className="text-3xl md:text-4xl font-black text-[#1A3329] text-center mb-4">One app. Two plans. No surprises.</h2>
          <p className="text-center text-[#4A5568] mb-12">Cancel anytime. No contracts. Starts at less than $1 a day.</p>
          <div className="grid md:grid-cols-2 gap-6">

            {/* Basic */}
            <div className="bg-[#F5F2EB] rounded-2xl p-8 border border-black/5">
              <h3 className="font-bold text-[#1A3329] text-xl mb-1">Basic</h3>
              <p className="text-[#4A5568] text-sm mb-4">Perfect for getting started</p>
              <div className="text-5xl font-black text-[#1A3329] mb-6">$29<span className="text-base font-normal text-[#4A5568]">/mo</span></div>
              <div className="space-y-2 mb-6">
                {[
                  { text: 'Online booking page', included: true },
                  { text: 'SMS appointment reminders', included: true },
                  { text: 'Up to 30 appointments/mo', included: true },
                  { text: 'Instant booking notifications', included: true },
                  { text: 'Auto review requests', included: false },
                  { text: 'Client history & dog notes', included: false },
                  { text: 'Smart personalized messages', included: false },
                  { text: 'Unlimited appointments', included: false },
                ].map((f, i) => (
                  <div key={i} className={`flex items-center gap-2 text-sm ${f.included ? 'text-[#1A3329]' : 'text-[#4A5568]/40 line-through'}`}>
                    <span className={f.included ? 'text-[#2D6A4F]' : 'text-[#4A5568]/40'}>
                      {f.included ? '✓' : '✗'}
                    </span>
                    {f.text}
                  </div>
                ))}
              </div>
              <Link href="/signup" className="block text-center border-2 border-[#2D6A4F] text-[#2D6A4F] font-semibold py-3 rounded-xl hover:bg-[#2D6A4F] hover:text-white transition">
                Start Free Trial
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-[#2D6A4F] rounded-2xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E8704A] text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                ⭐ Most Popular
              </div>
              <h3 className="font-bold text-white text-xl mb-1">Pro</h3>
              <p className="text-white/60 text-sm mb-4">For groomers serious about growth</p>
              <div className="text-5xl font-black text-white mb-6">$49<span className="text-base font-normal text-white/60">/mo</span></div>
              <div className="space-y-2 mb-6">
                {[
                  'Everything in Basic',
                  'Unlimited appointments',
                  'Auto review requests after every job',
                  'Client history & dog notes',
                  'Smart personalized reminder messages',
                  'Priority support',
                  'Early access to new features',
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-white/80">
                    <span className="text-white">✓</span> {f}
                  </div>
                ))}
              </div>
              <Link href="/signup" className="block text-center bg-white text-[#2D6A4F] font-semibold py-3 rounded-xl hover:bg-[#F5F2EB] transition">
                Start Free Trial
              </Link>
            </div>

          </div>
          <p className="text-center text-sm text-[#4A5568] mt-6">
            🐾 Both plans include a <strong>30-day free trial</strong>. No credit card required to start.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#1A3329] px-6 py-20">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Ready to stop losing money to no-shows?
          </h2>
          <p className="text-white/60 mb-8">
            Join PawBooking today. 30 days free, no credit card needed, cancel anytime.
          </p>
          <Link href="/signup" className="inline-block bg-[#E8704A] text-white font-semibold px-10 py-4 rounded-full hover:bg-[#d4603a] transition text-sm">
            Start Your Free Trial →
          </Link>
          <div className="flex flex-wrap justify-center gap-6 mt-6 text-white/40 text-xs">
            <span>✓ 30 days free</span>
            <span>✓ No credit card needed</span>
            <span>✓ Cancel anytime</span>
            <span>✓ Setup in 10 minutes</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1A3329] border-t border-white/10 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[#2D6A4F]">🐾</span>
            <span className="font-bold text-white">PawBooking</span>
          </div>
          <p className="text-white/40 text-xs">© 2026 PawBooking. Built for dog groomers everywhere.</p>
          <div className="flex gap-6 text-white/40 text-xs">
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="mailto:hello@pawbooking.com" className="hover:text-white transition">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  )
}