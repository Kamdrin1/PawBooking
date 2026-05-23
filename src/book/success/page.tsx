'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const supabase = createClient()

  useEffect(() => {
    async function handleSuccess() {
      if (!sessionId) { setStatus('error'); return }

      try {
        const res = await fetch(`/api/verify-checkout?session_id=${sessionId}`)
        const data = await res.json()

        if (data.success) {
          // Create the appointment in Supabase
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
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F2EB' }}>
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#2D6A4F', borderTopColor: 'transparent' }} />
    </div>
  )

  if (status === 'error') return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#F5F2EB' }}>
      <div className="text-center">
        <div className="text-5xl mb-4">❌</div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#1A3329' }}>Something went wrong</h1>
        <p style={{ color: '#9CA3AF' }}>Your payment may have been processed but we couldn't confirm your booking. Please contact the groomer directly.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: '#F5F2EB' }}>
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {[
          { top: '5%', left: '3%', rotate: '-25deg', size: 90, opacity: 0.06 },
          { top: '10%', left: '80%', rotate: '40deg', size: 65, opacity: 0.05 },
          { top: '25%', left: '90%', rotate: '20deg', size: 110, opacity: 0.06 },
          { top: '70%', left: '5%', rotate: '50deg', size: 75, opacity: 0.05 },
          { top: '85%', left: '60%', rotate: '-30deg', size: 85, opacity: 0.05 },
        ].map((paw, i) => (
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
      <div className="text-center max-w-md relative z-10">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#D8F3DC' }}>
          <svg width="36" height="36" viewBox="0 0 100 100" fill="#1A3329">
            <ellipse cx="50" cy="70" rx="26" ry="20"/>
            <ellipse cx="20" cy="44" rx="12" ry="15"/>
            <ellipse cx="38" cy="33" rx="12" ry="15"/>
            <ellipse cx="62" cy="33" rx="12" ry="15"/>
            <ellipse cx="80" cy="44" rx="12" ry="15"/>
          </svg>
        </div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '32px', fontWeight: 700, color: '#1A3329', marginBottom: '12px' }}>
          You're booked & paid!
        </h1>
        <p style={{ color: '#6B7280', marginBottom: '24px', lineHeight: 1.7 }}>
          Your payment was successful and your appointment is confirmed. You'll receive an SMS reminder before your appointment.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: '#D8F3DC', color: '#1A5C36' }}>
          ✓ Payment confirmed
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F2EB' }}><div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#2D6A4F', borderTopColor: 'transparent' }} /></div>}>
      <SuccessContent />
    </Suspense>
  )
}