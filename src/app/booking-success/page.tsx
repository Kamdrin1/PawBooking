'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

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

interface BookingData {
  clientName: string
  dogName: string
  serviceName: string
  servicePrice: string
  date: string
  time: string
  businessName: string
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [booking, setBooking] = useState<BookingData | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function handleSuccess() {
      if (!sessionId) { setStatus('error'); return }
      try {
        const res = await fetch(`/api/verify-checkout?session_id=${sessionId}`)
        const data = await res.json()
        if (data.success) {
          await supabase.from('appointments').insert({
            profile_id: data.metadata.profileId,
            client_name: data.metadata.clientName,
            client_phone: data.metadata.clientPhone,
            client_email: data.metadata.clientEmail || null,
            dog_name: data.metadata.dogName,
            dog_breed: data.metadata.dogBreed || null,
            service_id: data.metadata.serviceId,
            appointment_date: data.metadata.date,
            appointment_time: data.metadata.time,
            notes: data.metadata.notes || null,
            status: 'confirmed',
            payment_status: 'paid',
            payment_method: 'online',
          })

          const [h, m] = (data.metadata.time || '').split(':')
          const hour = parseInt(h)
          const formattedTime = `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
          const formattedDate = new Date(data.metadata.date + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric'
          })

          setBooking({
            clientName: data.metadata.clientName,
            dogName: data.metadata.dogName,
            serviceName: data.metadata.serviceName,
            servicePrice: data.metadata.amount,
            date: formattedDate,
            time: formattedTime,
            businessName: data.metadata.businessName || 'your groomer',
          })
          setStatus('success')
        } else {
          setStatus('error')
        }
      } catch {
        setStatus('error')
      }
    }
    handleSuccess()
  }, [sessionId])

  if (status === 'loading') return (
    <div style={{ minHeight: '100vh', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F2EB' }}>
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#2D6A4F', borderTopColor: 'transparent' }} />
    </div>
  )

  if (status === 'error') return (
    <div style={{ minHeight: '100vh', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#F5F2EB' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1A3329', marginBottom: '8px', fontFamily: 'Playfair Display, serif' }}>Something went wrong</h1>
        <p style={{ color: '#9CA3AF', fontSize: '14px', lineHeight: 1.7 }}>Your payment may have been processed but we couldn&apos;t confirm your booking. Please contact the groomer directly.</p>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'DM Sans', sans-serif; }
        .playfair { font-family: 'Playfair Display', serif; }
        body { background: #F5F2EB; }

        .success-root {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          position: relative;
          overflow: hidden;
          background: #F5F2EB;
        }

        .success-card {
          text-align: center;
          max-width: 420px;
          width: 100%;
          position: relative;
          z-index: 10;
        }

        .booking-summary {
          border-radius: 20px;
          padding: 20px;
          text-align: left;
          background: linear-gradient(145deg, #FDFBF7, #F8F5EF);
          border: 1px solid rgba(237,233,223,0.8);
          box-shadow: 0 4px 20px rgba(26,51,41,0.06);
          margin-bottom: 16px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          border-bottom: 1px solid rgba(237,233,223,0.8);
          padding-bottom: 10px;
          margin-bottom: 10px;
        }

        @media (max-width: 480px) {
          .success-title { font-size: 26px !important; }
          .paw-icon { width: 68px !important; height: 68px !important; }
          .booking-summary { padding: 16px; }
          .summary-row { font-size: 13px; }
        }
      `}</style>

      <div className="success-root">
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

        <div className="success-card">
          <div className="paw-icon" style={{ width: '76px', height: '76px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', background: 'linear-gradient(135deg, #D8F3DC, #c8eacd)', boxShadow: '0 8px 24px rgba(45,106,79,0.2)' }}>
            <svg width="34" height="34" viewBox="0 0 100 100" fill="#1A3329">
              <ellipse cx="50" cy="70" rx="26" ry="20"/>
              <ellipse cx="20" cy="44" rx="12" ry="15"/>
              <ellipse cx="38" cy="33" rx="12" ry="15"/>
              <ellipse cx="62" cy="33" rx="12" ry="15"/>
              <ellipse cx="80" cy="44" rx="12" ry="15"/>
            </svg>
          </div>

          <h1 className="playfair success-title" style={{ fontSize: '30px', fontWeight: 700, color: '#1A3329', marginBottom: '12px', letterSpacing: '-0.02em' }}>
            You&apos;re booked!
          </h1>
          <p style={{ color: '#6B7280', marginBottom: '24px', lineHeight: 1.7, fontSize: '15px' }}>
            Your appointment request has been sent to <strong style={{ color: '#1A3329' }}>{booking?.businessName}</strong>. Your payment was successful and you&apos;ll receive an SMS reminder before your appointment.
          </p>

          {booking && (
            <div className="booking-summary">
              {[
                { label: 'Client', value: booking.clientName },
                { label: 'Dog', value: booking.dogName },
                { label: 'Service', value: booking.serviceName },
                { label: 'Date', value: booking.date },
                { label: 'Time', value: booking.time },
                { label: 'Payment', value: '💳 Paid Online' },
              ].map((row, i) => (
                <div key={i} className="summary-row">
                  <span style={{ color: '#9CA3AF' }}>{row.label}</span>
                  <span style={{ fontWeight: 600, color: '#1A3329' }}>{row.value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', paddingTop: '4px' }}>
                <span style={{ fontWeight: 600, color: '#9CA3AF' }}>Price</span>
                <span style={{ fontWeight: 700, fontSize: '18px', color: '#2D6A4F' }}>${booking.servicePrice}</span>
              </div>
            </div>
          )}

          <p style={{ fontSize: '12px', color: '#9CA3AF', lineHeight: 1.6 }}>You&apos;ll receive an SMS reminder 24 hours before your appointment.</p>
        </div>
      </div>
    </>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F2EB' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#2D6A4F', borderTopColor: 'transparent' }} />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
