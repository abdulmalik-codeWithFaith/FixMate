'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { db, auth } from '@/lib/firebase'
import {
  doc, getDoc, updateDoc, serverTimestamp, Timestamp
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import toast, { Toaster } from 'react-hot-toast'
import {
  ChevronLeft, MapPin, Clock, Calendar, Star,
  MessageCircle, CheckCircle, XCircle, AlertCircle,
  Navigation, FileText, Download, RotateCcw,
  Banknote, ShieldCheck, ChevronRight, Copy, Check, Loader2
} from 'lucide-react'

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface BookingData {
  id: string
  clientId: string
  workerId: string
  workerName: string
  workerInitials: string
  workerAvatarBg: string
  workerAvatarColor: string
  workerSkill: string
  workerRating: number
  workerJobs: number
  workerResponseTime: string
  description: string
  location: string
  scheduledDate: string
  scheduledTime: string
  price: number
  currency: string
  ratePerHour: number
  status: 'pending' | 'accepted' | 'completed' | 'cancelled'
  paymentStatus: string
  createdAt: string
  acceptedAt?: string
  rating?: number
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; bg: string; color: string; icon: React.ReactNode; desc: string }> = {
  pending:   { label: 'Pending',   bg: '#FFF8EE', color: '#D97706', icon: <Clock size={14} />,        desc: 'Waiting for the worker to respond to your booking request.' },
  accepted:  { label: 'Accepted',  bg: '#FFF3EE', color: '#FF5C1A', icon: <CheckCircle size={14} />,  desc: 'Worker has accepted. Your job is confirmed for the scheduled time.' },
  completed: { label: 'Completed', bg: '#F0FDF4', color: '#16A34A', icon: <CheckCircle size={14} />,  desc: 'Job has been completed successfully.' },
  cancelled: { label: 'Cancelled', bg: '#FEF2F2', color: '#EF4444', icon: <XCircle size={14} />,      desc: 'This booking was cancelled.' },
}

function formatTs(ts: any, fallback = '—'): string {
  if (!ts) return fallback
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function formatScheduled(ts: any): string {
  if (!ts) return 'TBD'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const now = new Date()
  const diff = (d.getTime() - now.getTime()) / 86400000
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  if (diff > 0 && diff < 1) return `Today · ${time}`
  if (diff >= 1 && diff < 2) return `Tomorrow · ${time}`
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) + ` · ${time}`
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const S = `
  .od-page { min-height: 100vh; background: #F5F4F1; }
  .od-topbar { background: white; border-bottom: 1px solid #E8E6E1; padding: 0 40px; height: 64px; display: flex; align-items: center; gap: 14px; position: sticky; top: 0; z-index: 40; }
  .topbar-back { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; color: #6B6B6B; text-decoration: none; transition: all 0.2s; border: 1.5px solid #E8E6E1; flex-shrink: 0; }
  .topbar-back:hover { border-color: #0F0F0F; color: #0F0F0F; }
  .topbar-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; flex: 1; }
  .topbar-id { font-family: 'DM Sans', sans-serif; font-size: 12px; color: #6B6B6B; background: #F5F4F1; border: 1px solid #E8E6E1; padding: 5px 12px; border-radius: 8px; display: flex; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s; }
  .topbar-id:hover { border-color: #FF5C1A; color: #FF5C1A; }
  .od-body { max-width: 860px; margin: 0 auto; padding: 28px 40px; display: grid; grid-template-columns: 1fr 300px; gap: 20px; align-items: start; }
  .status-banner { border-radius: 16px; padding: 18px 22px; display: flex; align-items: center; gap: 14px; margin-bottom: 20px; border: 1px solid transparent; }
  .status-banner-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .status-banner-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; margin-bottom: 3px; }
  .status-banner-desc { font-size: 13px; font-weight: 300; opacity: 0.8; }
  .od-card { background: white; border: 1px solid #E8E6E1; border-radius: 18px; overflow: hidden; margin-bottom: 16px; }
  .od-card-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; padding: 18px 22px 14px; border-bottom: 1px solid #E8E6E1; display: flex; align-items: center; gap: 8px; }
  .od-card-title-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .worker-row { display: flex; align-items: center; gap: 14px; padding: 18px 22px; }
  .worker-avatar { width: 54px; height: 54px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 19px; flex-shrink: 0; }
  .worker-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; }
  .worker-skill { display: inline-block; font-size: 11px; font-weight: 600; background: #FFF3EE; color: #FF5C1A; padding: 2px 9px; border-radius: 100px; margin: 3px 0; }
  .worker-meta { display: flex; align-items: center; gap: 10px; font-size: 12px; color: #6B6B6B; flex-wrap: wrap; }
  .worker-meta-item { display: flex; align-items: center; gap: 4px; }
  .worker-actions { display: flex; gap: 8px; margin-left: auto; flex-shrink: 0; }
  .waction-btn { display: flex; align-items: center; gap: 6px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; border-radius: 9px; padding: 8px 14px; cursor: pointer; text-decoration: none; transition: all 0.2s; border: none; }
  .waction-primary { background: #FF5C1A; color: white; }
  .waction-primary:hover { background: #FF7A40; }
  .waction-secondary { background: white; color: #0F0F0F; border: 1.5px solid #E8E6E1; }
  .waction-secondary:hover { border-color: #0F0F0F; }
  .job-detail-row { display: flex; align-items: flex-start; gap: 14px; padding: 14px 22px; border-bottom: 1px solid #F5F4F1; }
  .job-detail-row:last-child { border-bottom: none; }
  .jd-icon { width: 34px; height: 34px; border-radius: 9px; background: #F5F4F1; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #6B6B6B; }
  .jd-label { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; color: #AFAFAF; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 4px; }
  .jd-value { font-size: 14px; color: #0F0F0F; line-height: 1.65; }
  .map-placeholder { background: #F5F4F1; border-radius: 12px; height: 110px; margin: 0 22px 18px; display: flex; align-items: center; justify-content: center; gap: 8px; border: 1px solid #E8E6E1; cursor: pointer; transition: all 0.2s; text-decoration: none; color: #6B6B6B; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; }
  .map-placeholder:hover { border-color: #FF5C1A; color: #FF5C1A; background: #FFF3EE; }
  .timeline { padding: 18px 22px; display: flex; flex-direction: column; }
  .tl-item { display: flex; gap: 14px; align-items: flex-start; }
  .tl-track { display: flex; flex-direction: column; align-items: center; }
  .tl-dot { width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border: 2px solid #E8E6E1; background: white; }
  .tl-dot.done { background: #FF5C1A; border-color: #FF5C1A; color: white; }
  .tl-dot.pending { background: white; border-color: #E8E6E1; color: #AFAFAF; }
  .tl-line { width: 2px; flex: 1; min-height: 24px; background: #E8E6E1; margin: 3px 0; }
  .tl-line.done { background: #FF5C1A; }
  .tl-content { padding: 4px 0 24px; }
  .tl-item:last-child .tl-content { padding-bottom: 0; }
  .tl-label { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; margin-bottom: 2px; }
  .tl-label.pending { color: #AFAFAF; }
  .tl-time { font-size: 12px; color: #6B6B6B; }
  .od-sidebar { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 80px; }
  .price-card { background: white; border: 1px solid #E8E6E1; border-radius: 18px; overflow: hidden; }
  .price-card-head { padding: 18px 20px 14px; border-bottom: 1px solid #E8E6E1; }
  .price-total-label { font-size: 12px; color: #6B6B6B; margin-bottom: 4px; }
  .price-total-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 34px; color: #0F0F0F; letter-spacing: -1px; }
  .price-total-note { font-size: 12px; color: #6B6B6B; margin-top: 4px; }
  .price-breakdown { padding: 14px 20px; display: flex; flex-direction: column; gap: 10px; border-bottom: 1px solid #E8E6E1; }
  .pb-row { display: flex; justify-content: space-between; font-size: 13px; }
  .pb-label { color: #6B6B6B; }
  .pb-val { font-family: 'Syne', sans-serif; font-weight: 600; color: #0F0F0F; }
  .pb-row.total { font-size: 14px; border-top: 1px solid #E8E6E1; padding-top: 10px; margin-top: 2px; }
  .pb-row.total .pb-val { color: #FF5C1A; font-weight: 800; font-size: 15px; }
  .payment-status-row { padding: 14px 20px; display: flex; align-items: center; gap: 10px; }
  .payment-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .payment-status-text { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; }
  .payment-note { font-size: 12px; color: #6B6B6B; }
  .action-card { background: white; border: 1px solid #E8E6E1; border-radius: 18px; padding: 20px; display: flex; flex-direction: column; gap: 10px; }
  .full-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; border-radius: 12px; padding: 13px; cursor: pointer; text-decoration: none; transition: all 0.2s; border: none; }
  .full-btn-orange { background: #FF5C1A; color: white; }
  .full-btn-orange:hover { background: #FF7A40; transform: translateY(-1px); }
  .full-btn-dark { background: #0F0F0F; color: white; }
  .full-btn-dark:hover { background: #1A1A1A; }
  .full-btn-outline { background: transparent; color: #6B6B6B; border: 1.5px solid #E8E6E1; }
  .full-btn-outline:hover { background: #F5F4F1; color: #0F0F0F; border-color: #0F0F0F; }
  .full-btn-danger { background: transparent; color: #EF4444; border: 1.5px solid rgba(239,68,68,0.3); }
  .full-btn-danger:hover { background: #FEF2F2; border-color: #EF4444; }
  .trust-card { background: white; border: 1px solid #E8E6E1; border-radius: 14px; padding: 16px 18px; display: flex; align-items: flex-start; gap: 12px; }
  .trust-icon { width: 36px; height: 36px; border-radius: 10px; background: #F0FDF4; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .trust-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #0F0F0F; margin-bottom: 3px; }
  .trust-sub { font-size: 12px; color: #6B6B6B; line-height: 1.5; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); }
  .modal { background: white; border-radius: 22px; padding: 36px 32px; max-width: 400px; width: 100%; text-align: center; box-shadow: 0 24px 80px rgba(0,0,0,0.2); animation: popIn 0.3s cubic-bezier(0.175,0.885,0.32,1.275); }
  @keyframes popIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .modal-icon { width: 64px; height: 64px; border-radius: 50%; background: #FEF2F2; border: 2px solid rgba(239,68,68,0.2); display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; }
  .modal-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: #0F0F0F; margin-bottom: 8px; }
  .modal-sub { font-size: 14px; color: #6B6B6B; font-weight: 300; line-height: 1.7; margin-bottom: 24px; }
  .modal-btns { display: flex; gap: 10px; }
  .modal-keep { flex: 1; background: transparent; color: #6B6B6B; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; border: 1.5px solid #E8E6E1; border-radius: 11px; padding: 12px; cursor: pointer; }
  .modal-confirm { flex: 1; background: #EF4444; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; border: none; border-radius: 11px; padding: 12px; cursor: pointer; }
  .modal-confirm:hover { background: #DC2626; }
  .loading-screen { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; background: #F5F4F1; }
  .loading-spinner { width: 40px; height: 40px; border-radius: 50%; border: 3px solid #E8E6E1; border-top-color: #FF5C1A; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (max-width: 860px) {
    .od-body { grid-template-columns: 1fr; padding: 20px 16px; }
    .od-sidebar { position: static; }
    .od-topbar { padding: 0 16px; }
    .worker-actions { flex-direction: column; }
  }
`

export default function OrderDetailsPage() {
  const params   = useParams()
  const router   = useRouter()
  const orderId  = params?.id as string

  const [user, setUser]           = useState<any>(null)
  const [booking, setBooking]     = useState<BookingData | null>(null)
  const [loading, setLoading]     = useState(true)
  const [showCancel, setShowCancel] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [copied, setCopied]         = useState(false)

  // ── Auth ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { router.push('/login'); return }
      setUser(u)
    })
    return () => unsub()
  }, [router])

  // ── Fetch booking from Firestore ────────────────────────────────────────────
  useEffect(() => {
    if (!orderId) return
    const fetchBooking = async () => {
      try {
        const snap = await getDoc(doc(db, 'bookings', orderId))
        if (!snap.exists()) { toast.error('Order not found.'); router.push('/orders'); return }

        const d = snap.data() as any

        // Also try to pull latest worker details
        let workerRating = d.workerRating || 4.9
        let workerJobs   = d.workerJobs   || 0
        let workerResponseTime = d.workerResponseTime || '< 1 hour'
        if (d.workerId) {
          try {
            const wSnap = await getDoc(doc(db, 'workers', d.workerId))
            if (wSnap.exists()) {
              const w = wSnap.data() as any
              workerRating       = w.rating       || workerRating
              workerJobs         = w.jobs         || workerJobs
              workerResponseTime = w.responseTime || workerResponseTime
            }
          } catch {}
        }

        setBooking({
          id:                orderId,
          clientId:          d.clientId         || '',
          workerId:          d.workerId         || '',
          workerName:        d.workerName        || 'Worker',
          workerInitials:    d.workerInitials    || (d.workerName?.split(' ').map((n: string) => n[0]).join('') ?? 'W'),
          workerAvatarBg:    d.workerAvatarBg    || '#FFF3EE',
          workerAvatarColor: d.workerAvatarColor || '#FF5C1A',
          workerSkill:       d.skill             || d.workerSkill || 'Service',
          workerRating,
          workerJobs,
          workerResponseTime,
          description:       d.description       || '—',
          location:          d.location          || d.address || '—',
          scheduledDate:     formatScheduled(d.scheduledAt),
          scheduledTime:     d.timeSlot          || '—',
          price:             d.price             || 0,
          currency:          d.currency          || '$',
          ratePerHour:       d.ratePerHour       || d.price || 0,
          status:            d.status            || 'pending',
          paymentStatus:     d.paymentStatus     || 'pending',
          createdAt:         formatTs(d.createdAt),
          acceptedAt:        d.acceptedAt ? formatTs(d.acceptedAt) : undefined,
          rating:            d.rating,
        })
      } catch (err) {
        console.error('Booking fetch error:', err)
        toast.error('Could not load order details.')
      } finally {
        setLoading(false)
      }
    }
    fetchBooking()
  }, [orderId, router])

  // ── Cancel booking ──────────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!booking) return
    setCancelling(true)
    try {
      await updateDoc(doc(db, 'bookings', booking.id), {
        status:    'cancelled',
        updatedAt: serverTimestamp(),
      })
      setBooking(p => p ? { ...p, status: 'cancelled' } : p)
      toast.success('Booking cancelled.')
      setShowCancel(false)
    } catch (err) {
      console.error('Cancel error:', err)
      toast.error('Could not cancel. Please try again.')
    } finally {
      setCancelling(false)
    }
  }

  const copyId = () => {
    navigator.clipboard.writeText(`ORD-${orderId.slice(-8).toUpperCase()}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <style>{S}</style>
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#6B6B6B' }}>Loading order…</p>
        </div>
      </>
    )
  }

  if (!booking) return null

  const st = statusConfig[booking.status] || statusConfig.pending

  // Build timeline dynamically from real booking data
  const timeline = [
    { label: 'Booking Requested', time: booking.createdAt,     done: true,                               icon: <FileText size={14} />      },
    { label: 'Worker Accepted',   time: booking.acceptedAt || 'Awaiting response', done: !!booking.acceptedAt, icon: <CheckCircle size={14} /> },
    { label: 'Job In Progress',   time: booking.scheduledDate, done: booking.status === 'completed',      icon: <Clock size={14} />         },
    { label: 'Job Completed',     time: booking.status === 'completed' ? 'Done' : 'Awaiting', done: booking.status === 'completed', icon: <CheckCircle size={14} /> },
    { label: 'Payment Released',  time: booking.status === 'completed' ? 'Released' : 'Awaiting', done: false, icon: <Banknote size={14} /> },
  ]

  return (
    <>
      <style>{S}</style>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      {/* Cancel modal */}
      {showCancel && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-icon"><XCircle size={28} color="#EF4444" /></div>
            <h2 className="modal-title">Cancel this booking?</h2>
            <p className="modal-sub">
              Are you sure you want to cancel your booking with <strong>{booking.workerName}</strong>?
              This action cannot be undone.
            </p>
            <div className="modal-btns">
              <button className="modal-keep" onClick={() => setShowCancel(false)}>Keep Booking</button>
              <button className="modal-confirm" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="od-page">
        <div className="od-topbar">
          <Link href="/orders" className="topbar-back"><ChevronLeft size={18} /></Link>
          <p className="topbar-title">Order Details</p>
          <div className="topbar-id" onClick={copyId}>
            {copied ? <Check size={13} color="#22C55E" /> : <Copy size={13} />}
            ORD-{orderId.slice(-8).toUpperCase()}
          </div>
        </div>

        <div className="od-body">
          <div>
            {/* Status banner */}
            <div className="status-banner" style={{ background: st.bg, borderColor: st.color + '30', color: st.color }}>
              <div className="status-banner-icon" style={{ background: st.color + '20' }}>{st.icon}</div>
              <div>
                <p className="status-banner-title">Status: {st.label}</p>
                <p className="status-banner-desc">{st.desc}</p>
              </div>
            </div>

            {/* Worker card */}
            <div className="od-card">
              <p className="od-card-title">
                <div className="od-card-title-icon" style={{ background: '#FFF3EE' }}><Star size={14} color="#FF5C1A" /></div>
                Assigned Worker
              </p>
              <div className="worker-row">
                <div className="worker-avatar" style={{ background: booking.workerAvatarBg, color: booking.workerAvatarColor }}>
                  {booking.workerInitials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="worker-name">{booking.workerName}</p>
                  <span className="worker-skill">{booking.workerSkill}</span>
                  <div className="worker-meta">
                    <span className="worker-meta-item"><Star size={11} color="#F59E0B" fill="#F59E0B" />{booking.workerRating}</span>
                    <span className="worker-meta-item"><CheckCircle size={11} color="#16A34A" />{booking.workerJobs} jobs</span>
                    <span className="worker-meta-item"><Clock size={11} />Responds {booking.workerResponseTime}</span>
                  </div>
                </div>
                <div className="worker-actions">
                  <Link href={`/chat/${booking.workerId}`} className="waction-btn waction-primary"><MessageCircle size={14} /> Chat</Link>
                  <Link href={`/explore/${booking.workerId}`} className="waction-btn waction-secondary"><ChevronRight size={14} /> Profile</Link>
                </div>
              </div>
            </div>

            {/* Job details */}
            <div className="od-card">
              <p className="od-card-title">
                <div className="od-card-title-icon" style={{ background: '#F5F4F1' }}><FileText size={14} color="#6B6B6B" /></div>
                Job Information
              </p>
              {[
                { icon: <FileText size={15} />, label: 'Description', value: booking.description },
                { icon: <Calendar size={15} />, label: 'Scheduled',   value: booking.scheduledDate },
                { icon: <Clock size={15} />,    label: 'Time',        value: booking.scheduledTime },
                { icon: <MapPin size={15} />,   label: 'Location',    value: booking.location },
              ].map(row => (
                <div key={row.label} className="job-detail-row">
                  <div className="jd-icon">{row.icon}</div>
                  <div style={{ flex: 1 }}>
                    <p className="jd-label">{row.label}</p>
                    <p className="jd-value">{row.value}</p>
                  </div>
                </div>
              ))}
              {booking.location !== '—' && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(booking.location)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="map-placeholder"
                >
                  <Navigation size={16} /> Open in Maps
                </a>
              )}
            </div>

            {/* Timeline */}
            <div className="od-card">
              <p className="od-card-title">
                <div className="od-card-title-icon" style={{ background: '#FFF3EE' }}><Clock size={14} color="#FF5C1A" /></div>
                Order Timeline
              </p>
              <div className="timeline">
                {timeline.map((item, i) => (
                  <div key={item.label} className="tl-item">
                    <div className="tl-track">
                      <div className={`tl-dot ${item.done ? 'done' : 'pending'}`}>{item.icon}</div>
                      {i < timeline.length - 1 && <div className={`tl-line ${item.done ? 'done' : ''}`} />}
                    </div>
                    <div className="tl-content">
                      <p className={`tl-label ${!item.done ? 'pending' : ''}`}>{item.label}</p>
                      <p className="tl-time">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="od-sidebar">
            <div className="price-card">
              <div className="price-card-head">
                <p className="price-total-label">Total Amount</p>
                <p className="price-total-val">{booking.currency}{booking.price}</p>
                <p className="price-total-note">Estimated · Final price agreed on completion</p>
              </div>
              <div className="price-breakdown">
                <div className="pb-row"><span className="pb-label">Rate</span><span className="pb-val">{booking.currency}{booking.ratePerHour}/hr</span></div>
                <div className="pb-row total"><span className="pb-label" style={{ fontWeight: 700, color: '#0F0F0F' }}>Total</span><span className="pb-val">{booking.currency}{booking.price}</span></div>
              </div>
              <div className="payment-status-row">
                <div className="payment-dot" style={{ background: booking.status === 'completed' ? '#22C55E' : '#F59E0B' }} />
                <div>
                  <p className="payment-status-text" style={{ color: booking.status === 'completed' ? '#16A34A' : '#D97706' }}>
                    {booking.status === 'completed' ? 'Payment Released' : 'Payment Pending'}
                  </p>
                  <p className="payment-note">No charge until job is confirmed complete</p>
                </div>
              </div>
            </div>

            <div className="action-card">
              <Link href={`/chat/${booking.workerId}`} className="full-btn full-btn-orange">
                <MessageCircle size={16} /> Message Worker
              </Link>
              <Link href={`/booking/${booking.workerId}`} className="full-btn full-btn-dark">
                <RotateCcw size={15} /> Book Again
              </Link>
              <button className="full-btn full-btn-outline" onClick={() => window.print()}>
                <Download size={15} /> Download Receipt
              </button>
              {(booking.status === 'pending' || booking.status === 'accepted') && (
                <button className="full-btn full-btn-danger" onClick={() => setShowCancel(true)}>
                  <XCircle size={15} /> Cancel Booking
                </button>
              )}
            </div>

            <div className="trust-card">
              <div className="trust-icon"><ShieldCheck size={18} color="#16A34A" /></div>
              <div>
                <p className="trust-title">FixMate Guarantee</p>
                <p className="trust-sub">Your payment is protected. If the job isn't completed, you won't be charged.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}