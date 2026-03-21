'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import {
  ChevronLeft, MapPin, Star, Calendar, Clock,
  FileText, CheckCircle, AlertCircle, Navigation,
  Lock, Loader2, Briefcase, MessageCircle
} from 'lucide-react'

// Firebase
import { db, auth } from '@/lib/firebase'
import {
  doc, getDoc, addDoc, collection,
  serverTimestamp, Timestamp
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import toast, { Toaster } from 'react-hot-toast'

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Worker {
  id: string
  name: string
  initials: string
  skill: string
  location: string
  rating: number
  price: number
  currency: string
  jobs: number
  avatarBg: string
  avatarColor: string
  responseTime?: string
  available?: boolean
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const timeSlots = [
  '08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM',
  '01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM',
]

// ─── STYLES ───────────────────────────────────────────────────────────────────

const S = `
  .book-page { min-height: 100vh; background: #F5F4F1; }

  .book-topbar {
    background: white; border-bottom: 1px solid #E8E6E1;
    padding: 0 40px; height: 64px;
    display: flex; align-items: center; gap: 16px;
    position: sticky; top: 0; z-index: 40;
  }
  .back-link {
    display: inline-flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; border-radius: 10px;
    color: #6B6B6B; text-decoration: none;
    border: 1.5px solid #E8E6E1; transition: all 0.2s; flex-shrink: 0;
  }
  .back-link:hover { border-color: #0F0F0F; color: #0F0F0F; }
  .book-page-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; flex: 1; }

  .book-body { max-width: 960px; margin: 0 auto; padding: 32px 40px; display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }

  /* FORM CARD */
  .book-card { background: white; border: 1px solid #E8E6E1; border-radius: 20px; overflow: hidden; }
  .book-section { padding: 26px 28px; border-bottom: 1px solid #E8E6E1; }
  .book-section:last-child { border-bottom: none; }
  .book-section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; margin-bottom: 18px; display: flex; align-items: center; gap: 10px; }
  .book-section-num { width: 26px; height: 26px; border-radius: 50%; background: #FF5C1A; color: white; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .book-section-num.done { background: #22C55E; }

  /* FIELDS */
  .field { margin-bottom: 16px; }
  .field:last-child { margin-bottom: 0; }
  .field-label { display: block; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #0F0F0F; margin-bottom: 6px; }
  .field-label span { color: #FF5C1A; }
  .field-input {
    width: 100%; background: #F5F4F1; border: 1.5px solid #E8E6E1;
    border-radius: 12px; padding: 12px 16px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F;
    outline: none; box-sizing: border-box; transition: border-color 0.2s;
  }
  .field-input:focus { border-color: #FF5C1A; background: white; box-shadow: 0 0 0 3px rgba(255,92,26,0.08); }
  .field-input::placeholder { color: #AFAFAF; }
  .field-textarea { min-height: 100px; resize: vertical; font-family: 'DM Sans', sans-serif; }
  .field-icon-wrap { position: relative; }
  .field-icon-inner { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #AFAFAF; pointer-events: none; }
  .field-error { border-color: #EF4444 !important; box-shadow: none !important; }
  .error-msg { font-size: 12px; color: #EF4444; margin-top: 4px; display: flex; align-items: center; gap: 4px; }

  /* TIME SLOTS */
  .time-slots { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
  .time-slot { background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 9px; padding: 9px 4px; text-align: center; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; color: #6B6B6B; cursor: pointer; transition: all 0.2s; }
  .time-slot:hover { border-color: #FF5C1A; color: #FF5C1A; }
  .time-slot.selected { background: #FF5C1A; border-color: #FF5C1A; color: white; }

  /* PRICE INPUT */
  .price-wrap { position: relative; }
  .price-prefix { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-family: 'Syne', sans-serif; font-weight: 700; color: #0F0F0F; font-size: 15px; pointer-events: none; }
  .price-input-padded { padding-left: 28px !important; }

  /* SIDEBAR */
  .book-sidebar { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 80px; }

  .worker-summary { background: white; border: 1px solid #E8E6E1; border-radius: 20px; padding: 22px; }
  .ws-top { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #E8E6E1; }
  .ws-avatar { width: 54px; height: 54px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 19px; flex-shrink: 0; }
  .ws-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; }
  .ws-skill { display: inline-block; font-size: 11px; font-weight: 600; background: #FFF3EE; color: #FF5C1A; padding: 3px 9px; border-radius: 100px; margin: 3px 0; }
  .ws-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; font-size: 13px; }
  .ws-row-label { color: #6B6B6B; display: flex; align-items: center; gap: 6px; }
  .ws-row-val { font-family: 'Syne', sans-serif; font-weight: 600; color: #0F0F0F; font-size: 13px; }
  .ws-price-big { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: #FF5C1A; letter-spacing: -1px; }
  .ws-avail { display: flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; }

  .submit-card { background: white; border: 1px solid #E8E6E1; border-radius: 20px; padding: 22px; }
  .submit-btn {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
    background: #FF5C1A; color: white;
    font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 600;
    border: none; border-radius: 12px; padding: 15px;
    cursor: pointer; transition: all 0.2s; text-decoration: none;
  }
  .submit-btn:hover:not(:disabled) { background: #FF7A40; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(255,92,26,0.25); }
  .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }

  /* LOADING */
  .loading-screen { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; background: #F5F4F1; }
  .loading-spinner { width: 40px; height: 40px; border-radius: 50%; border: 3px solid #E8E6E1; border-top-color: #FF5C1A; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* SUCCESS MODAL */
  .success-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); }
  .success-modal { background: white; border-radius: 24px; padding: 48px 40px; max-width: 420px; width: 100%; text-align: center; box-shadow: 0 24px 80px rgba(0,0,0,0.2); animation: popIn 0.35s cubic-bezier(0.175,0.885,0.32,1.275); }
  @keyframes popIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .success-icon { width: 80px; height: 80px; border-radius: 50%; background: #F0FDF4; border: 3px solid #22C55E; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
  .success-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; color: #0F0F0F; margin-bottom: 10px; }
  .success-sub { font-size: 14px; color: #6B6B6B; font-weight: 300; line-height: 1.7; margin-bottom: 28px; }
  .success-btns { display: flex; gap: 10px; }
  .success-btn-primary { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; background: #FF5C1A; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; border: none; border-radius: 11px; padding: 13px; text-decoration: none; transition: background 0.2s; }
  .success-btn-primary:hover { background: #FF7A40; }
  .success-btn-secondary { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; background: #0F0F0F; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; border: none; border-radius: 11px; padding: 13px; text-decoration: none; transition: background 0.2s; }
  .success-btn-secondary:hover { background: #1A1A1A; }

  @media (max-width: 860px) {
    .book-body { grid-template-columns: 1fr; padding: 20px 16px; }
    .book-topbar { padding: 0 16px; }
    .book-sidebar { position: static; }
    .time-slots { grid-template-columns: repeat(4, 1fr); }
  }
  @media (max-width: 480px) {
    .time-slots { grid-template-columns: repeat(3, 1fr); }
  }
`

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function BookingPage() {
  const router = useRouter()
  const params = useParams()
  const workerId = params?.id as string

  // Auth
  const [user, setUser]             = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Worker data from Firestore
  const [worker, setWorker]         = useState<Worker | null>(null)
  const [workerLoading, setWorkerLoading] = useState(true)

  // Form
  const [description, setDescription]     = useState('')
  const [proposedPrice, setProposedPrice] = useState('')
  const [location, setLocation]           = useState('')
  const [date, setDate]                   = useState('')
  const [selectedTime, setSelectedTime]   = useState('')
  const [errors, setErrors]               = useState<Record<string, string>>({})

  // Submission
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [bookingId, setBookingId]   = useState('')

  // ── 1. Auth listener ────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthLoading(false)
    })
    return () => unsub()
  }, [])

  // ── 2. Fetch worker from Firestore ──────────────────────────────────────────
  useEffect(() => {
    if (!workerId) return
    const fetchWorker = async () => {
      try {
        const snap = await getDoc(doc(db, 'workers', workerId))
        if (snap.exists()) {
          const d = snap.data() as any
          setWorker({
            id:           snap.id,
            name:         d.name         || 'Unknown Worker',
            initials:     d.initials     || d.name?.charAt(0) || 'W',
            skill:        d.skill        || 'General',
            location:     d.location     || '',
            rating:       d.rating       || 5.0,
            price:        d.price        || 0,
            currency:     d.currency     || '$',
            jobs:         d.jobs         || 0,
            avatarBg:     d.avatarBg     || '#FFF3EE',
            avatarColor:  d.avatarColor  || '#FF5C1A',
            responseTime: d.responseTime || '< 1 hour',
            available:    d.available    ?? true,
          })
        } else {
          toast.error('Worker not found.')
          router.push('/explore')
        }
      } catch (err) {
        console.error('Error fetching worker:', err)
        toast.error('Could not load worker details.')
      } finally {
        setWorkerLoading(false)
      }
    }
    fetchWorker()
  }, [workerId, router])

  // ── 3. Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {}
    if (!description.trim())  e.description = 'Please describe the job'
    if (!location.trim())     e.location    = 'Job location is required'
    if (!date)                e.date        = 'Please select a date'
    if (!selectedTime)        e.time        = 'Please select a time slot'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── 4. Submit booking to Firestore ──────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate() || !worker || !user) return
    setSubmitting(true)

    try {
      // Convert date string + time string to a Firestore Timestamp
      const [hours, minutesPeriod] = selectedTime.split(':')
      const [minutes, period] = minutesPeriod.split(' ')
      let h = parseInt(hours)
      if (period === 'PM' && h !== 12) h += 12
      if (period === 'AM' && h === 12) h = 0

      const scheduledDate = new Date(date)
      scheduledDate.setHours(h, parseInt(minutes), 0, 0)

      // Build the booking document
      const bookingData = {
        // ── Parties ────────────────────────────────────────────────────────────
        clientId:          user.uid,
        clientName:        user.displayName  || user.email || 'Client',
        clientEmail:       user.email        || '',
        workerId:          worker.id,
        workerName:        worker.name,
        workerInitials:    worker.initials,
        workerAvatarBg:    worker.avatarBg,
        workerAvatarColor: worker.avatarColor,

        // ── Job details ────────────────────────────────────────────────────────
        skill:             worker.skill,
        description:       description.trim(),
        location:          location.trim(),

        // ── Pricing ────────────────────────────────────────────────────────────
        price:             proposedPrice ? Number(proposedPrice) : worker.price,
        currency:          worker.currency,
        ratePerHour:       worker.price,

        // ── Scheduling ─────────────────────────────────────────────────────────
        scheduledAt:       Timestamp.fromDate(scheduledDate),
        timeSlot:          selectedTime,
        dateString:        date,

        // ── Status & metadata ──────────────────────────────────────────────────
        status:            'pending',   // pending → accepted → completed / cancelled
        createdAt:         serverTimestamp(),
        updatedAt:         serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, 'bookings'), bookingData)
      setBookingId(docRef.id)
      setSubmitted(true)
      toast.success('Booking request sent!')

    } catch (err: any) {
      console.error('Booking error:', err)
      toast.error(err.message || 'Failed to send booking. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── LOADING STATE ───────────────────────────────────────────────────────────
  if (authLoading || workerLoading) {
    return (
      <>
        <style>{S}</style>
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#6B6B6B' }}>
            Loading booking page…
          </p>
        </div>
      </>
    )
  }

  // ── NOT LOGGED IN ───────────────────────────────────────────────────────────
  if (!user) {
    // Save intended destination and redirect to login
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('authRedirect', `/booking/${workerId}`)
    }
    return (
      <>
        <style>{S}</style>
        <div className="book-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 20 }}>
          <div style={{ background: 'white', border: '1px solid #E8E6E1', borderRadius: 22, padding: 44, maxWidth: 400, width: '100%', textAlign: 'center' }}>
            <div style={{ background: '#FFF3EE', width: 68, height: 68, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>
              <Lock size={30} color="#FF5C1A" />
            </div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#0F0F0F', marginBottom: 10 }}>
              Sign in to Book
            </h2>
            <p style={{ color: '#6B6B6B', fontSize: 14, fontWeight: 300, lineHeight: 1.7, marginBottom: 28 }}>
              Please sign in to book <strong>{worker?.name || 'this worker'}</strong>. It only takes a minute.
            </p>
            <Link href="/login" className="submit-btn" style={{ display: 'flex' }}>
              Sign In to Continue
            </Link>
            <Link href="/register" style={{ display: 'block', marginTop: 12, fontSize: 13, color: '#6B6B6B', textDecoration: 'none', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
              No account? Create one free →
            </Link>
          </div>
        </div>
      </>
    )
  }

  const totalEst = proposedPrice ? Number(proposedPrice) : (worker?.price || 0)

  return (
    <>
      <style>{S}</style>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <div className="book-page">

        {/* ── SUCCESS MODAL ── */}
        {submitted && worker && (
          <div className="success-overlay">
            <div className="success-modal">
              <div className="success-icon">
                <CheckCircle size={40} color="#22C55E" />
              </div>
              <h2 className="success-title">Booking Sent!</h2>
              <p className="success-sub">
                Your request for <strong>{worker.skill}</strong> services has been sent to <strong>{worker.name}</strong>.
                They typically respond {worker.responseTime || 'within 1 hour'}.
              </p>
              <div className="success-btns">
                <Link href="/orders" className="success-btn-primary">
                  <Briefcase size={15} /> View Orders
                </Link>
                <Link href={`/chat/${workerId}`} className="success-btn-secondary">
                  <MessageCircle size={15} /> Message Worker
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── TOPBAR ── */}
        <div className="book-topbar">
          <Link href={`/explore/${workerId}`} className="back-link">
            <ChevronLeft size={18} />
          </Link>
          <p className="book-page-title">
            Book {worker?.name || '…'}
          </p>
        </div>

        {/* ── BODY ── */}
        <div className="book-body">
          <div className="book-card">

            {/* Section 1 — Job Details */}
            <div className="book-section">
              <p className="book-section-title">
                <span className={`book-section-num${description && location ? ' done' : ''}`}>1</span>
                Job Details
              </p>
              <div className="field">
                <label className="field-label">Job description <span>*</span></label>
                <textarea
                  className={`field-input field-textarea${errors.description ? ' field-error' : ''}`}
                  placeholder={`Describe what you need ${worker?.name?.split(' ')[0] || 'the worker'} to do in as much detail as possible…`}
                  value={description}
                  onChange={e => { setDescription(e.target.value); setErrors(p => ({ ...p, description: '' })) }}
                />
                {errors.description && <p className="error-msg"><AlertCircle size={11} /> {errors.description}</p>}
              </div>
              <div className="field">
                <label className="field-label">Proposed budget <span style={{ color: '#AFAFAF', fontWeight: 400 }}>(optional)</span></label>
                <div className="price-wrap">
                  <span className="price-prefix">{worker?.currency}</span>
                  <input
                    type="number"
                    min="0"
                    className="field-input price-input-padded"
                    placeholder={String(worker?.price || 0)}
                    value={proposedPrice}
                    onChange={e => setProposedPrice(e.target.value)}
                  />
                </div>
                <p style={{ fontSize: 12, color: '#AFAFAF', marginTop: 5 }}>
                  Leave blank to use {worker?.name?.split(' ')[0]}'s standard rate of {worker?.currency}{worker?.price}/hr
                </p>
              </div>
            </div>

            {/* Section 2 — Location */}
            <div className="book-section">
              <p className="book-section-title">
                <span className={`book-section-num${location ? ' done' : ''}`}>2</span>
                Service Location
              </p>
              <div className="field">
                <label className="field-label">Job address <span>*</span></label>
                <div className="field-icon-wrap">
                  <Navigation size={15} className="field-icon-inner" />
                  <input
                    type="text"
                    className={`field-input${errors.location ? ' field-error' : ''}`}
                    style={{ paddingLeft: 42 }}
                    placeholder="Full address where the job will take place"
                    value={location}
                    onChange={e => { setLocation(e.target.value); setErrors(p => ({ ...p, location: '' })) }}
                  />
                </div>
                {errors.location && <p className="error-msg"><AlertCircle size={11} /> {errors.location}</p>}
              </div>
            </div>

            {/* Section 3 — Schedule */}
            <div className="book-section">
              <p className="book-section-title">
                <span className={`book-section-num${date && selectedTime ? ' done' : ''}`}>3</span>
                Schedule
              </p>
              <div className="field">
                <label className="field-label">Preferred date <span>*</span></label>
                <div className="field-icon-wrap">
                  <Calendar size={15} className="field-icon-inner" />
                  <input
                    type="date"
                    className={`field-input${errors.date ? ' field-error' : ''}`}
                    style={{ paddingLeft: 42 }}
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => { setDate(e.target.value); setErrors(p => ({ ...p, date: '' })) }}
                  />
                </div>
                {errors.date && <p className="error-msg"><AlertCircle size={11} /> {errors.date}</p>}
              </div>
              <div className="field">
                <label className="field-label">Preferred arrival time <span>*</span></label>
                <div className="time-slots">
                  {timeSlots.map(t => (
                    <div
                      key={t}
                      className={`time-slot${selectedTime === t ? ' selected' : ''}`}
                      onClick={() => { setSelectedTime(t); setErrors(p => ({ ...p, time: '' })) }}
                    >
                      {t}
                    </div>
                  ))}
                </div>
                {errors.time && <p className="error-msg" style={{ marginTop: 8 }}><AlertCircle size={11} /> {errors.time}</p>}
              </div>
            </div>

          </div>

          {/* ── SIDEBAR ── */}
          {worker && (
            <div className="book-sidebar">

              {/* Worker summary */}
              <div className="worker-summary">
                <div className="ws-top">
                  <div className="ws-avatar" style={{ background: worker.avatarBg, color: worker.avatarColor }}>
                    {worker.initials}
                  </div>
                  <div>
                    <p className="ws-name">{worker.name}</p>
                    <span className="ws-skill">{worker.skill}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                      <Star size={12} color="#F59E0B" fill="#F59E0B" />
                      <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'Syne, sans-serif' }}>{worker.rating}</span>
                      <span style={{ fontSize: 12, color: '#6B6B6B' }}>· {worker.jobs} jobs</span>
                    </div>
                  </div>
                </div>

                <div className="ws-row">
                  <span className="ws-row-label"><MapPin size={13} />Location</span>
                  <span className="ws-row-val">{worker.location}</span>
                </div>
                <div className="ws-row">
                  <span className="ws-row-label"><Clock size={13} />Responds in</span>
                  <span className="ws-row-val">{worker.responseTime || '< 1 hour'}</span>
                </div>
                <div className="ws-row">
                  <span className="ws-row-label">Availability</span>
                  <span className="ws-avail" style={{ color: worker.available ? '#16A34A' : '#D97706' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: worker.available ? '#22C55E' : '#D97706', display: 'inline-block' }} />
                    {worker.available ? 'Available' : 'Limited'}
                  </span>
                </div>

                <div style={{ height: 1, background: '#E8E6E1', margin: '14px 0' }} />

                <div>
                  <p style={{ fontSize: 12, color: '#6B6B6B', marginBottom: 4 }}>Estimated total</p>
                  <p className="ws-price-big">{worker.currency}{totalEst}</p>
                  <p style={{ fontSize: 12, color: '#AFAFAF', marginTop: 3 }}>Final price agreed on job completion</p>
                </div>
              </div>

              {/* Submit */}
              <div className="submit-card">
                <button
                  className="submit-btn"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting
                    ? <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> Sending…</>
                    : <><FileText size={17} /> Send Booking Request</>
                  }
                </button>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, color: '#6B6B6B', marginTop: 12 }}>
                  <AlertCircle size={13} color="#AFAFAF" /> No payment charged until job is complete
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  )
}