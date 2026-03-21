'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { db, auth } from '@/lib/firebase'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import toast, { Toaster } from 'react-hot-toast'
import {
  ChevronLeft, MapPin, Clock, Calendar, Star,
  MessageCircle, CheckCircle, XCircle, User,
  FileText, Navigation, Banknote, ShieldCheck,
  Copy, Check, Loader2, RotateCcw, Phone
} from 'lucide-react'

interface JobData {
  id: string
  clientId: string; clientName: string; clientInitials: string
  clientAvatarBg: string; clientAvatarColor: string
  clientEmail: string; clientPhone: string
  description: string; skill: string; location: string
  scheduledDate: string; scheduledTime: string; scheduledTs: any
  price: number; currency: string; ratePerHour: number
  status: 'pending' | 'accepted' | 'completed' | 'cancelled'
  paymentStatus: string; rating?: number
  createdAt: string; acceptedAt?: string; completedAt?: string
}

const statusConfig: Record<string, { label: string; bg: string; color: string; icon: React.ReactNode; desc: string }> = {
  pending:   { label: 'New Request', bg: '#FFF3EE', color: '#FF5C1A', icon: <Clock size={14} />,       desc: 'This job request is waiting for your response. Accept or decline below.' },
  accepted:  { label: 'In Progress', bg: '#EEF6FF', color: '#2563EB', icon: <Clock size={14} />,       desc: 'You have accepted this job. Mark it complete once the work is done.' },
  completed: { label: 'Completed',   bg: '#F0FDF4', color: '#16A34A', icon: <CheckCircle size={14} />, desc: 'This job has been completed successfully.' },
  cancelled: { label: 'Declined',    bg: '#F5F4F1', color: '#6B6B6B', icon: <XCircle size={14} />,     desc: 'This job was declined or cancelled.' },
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
  const diff = (d.getTime() - new Date().getTime()) / 86400000
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  if (diff > 0 && diff < 1) return `Today · ${time}`
  if (diff >= 1 && diff < 2) return `Tomorrow · ${time}`
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) + ` · ${time}`
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'C'
}

const S = `
  .jd-page { min-height: 100vh; background: #F5F4F1; }
  .jd-topbar { background: white; border-bottom: 1px solid #E8E6E1; padding: 0 40px; height: 64px; display: flex; align-items: center; gap: 14px; position: sticky; top: 0; z-index: 40; }
  .jd-back { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; color: #6B6B6B; text-decoration: none; transition: all 0.2s; border: 1.5px solid #E8E6E1; flex-shrink: 0; }
  .jd-back:hover { border-color: #0F0F0F; color: #0F0F0F; }
  .jd-topbar-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; flex: 1; }
  .jd-copy-id { font-family: 'DM Sans', sans-serif; font-size: 12px; color: #6B6B6B; background: #F5F4F1; border: 1px solid #E8E6E1; padding: 5px 12px; border-radius: 8px; display: flex; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s; }
  .jd-copy-id:hover { border-color: #FF5C1A; color: #FF5C1A; }
  .jd-body { max-width: 860px; margin: 0 auto; padding: 28px 40px; display: grid; grid-template-columns: 1fr 300px; gap: 20px; align-items: start; }
  .status-banner { border-radius: 16px; padding: 18px 22px; display: flex; align-items: center; gap: 14px; margin-bottom: 20px; border: 1px solid transparent; }
  .status-banner-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .status-banner-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; margin-bottom: 3px; }
  .status-banner-desc { font-size: 13px; font-weight: 300; opacity: 0.8; }
  .jd-card { background: white; border: 1px solid #E8E6E1; border-radius: 18px; overflow: hidden; margin-bottom: 16px; }
  .jd-card-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; padding: 18px 22px 14px; border-bottom: 1px solid #E8E6E1; display: flex; align-items: center; gap: 8px; }
  .jd-card-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .client-row { display: flex; align-items: center; gap: 14px; padding: 18px 22px; }
  .client-avatar { width: 54px; height: 54px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 19px; flex-shrink: 0; }
  .client-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; }
  .client-meta { display: flex; align-items: center; gap: 10px; font-size: 12px; color: #6B6B6B; flex-wrap: wrap; margin-top: 3px; }
  .client-meta-item { display: flex; align-items: center; gap: 4px; }
  .client-actions { display: flex; gap: 8px; margin-left: auto; flex-shrink: 0; }
  .caction-btn { display: flex; align-items: center; gap: 6px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; border-radius: 9px; padding: 8px 14px; cursor: pointer; text-decoration: none; transition: all 0.2s; border: none; }
  .caction-primary { background: #FF5C1A; color: white; }
  .caction-primary:hover { background: #FF7A40; }
  .caction-secondary { background: white; color: #0F0F0F; border: 1.5px solid #E8E6E1; }
  .caction-secondary:hover { border-color: #0F0F0F; }
  .detail-row { display: flex; align-items: flex-start; gap: 14px; padding: 14px 22px; border-bottom: 1px solid #F5F4F1; }
  .detail-row:last-child { border-bottom: none; }
  .detail-icon { width: 34px; height: 34px; border-radius: 9px; background: #F5F4F1; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #6B6B6B; }
  .detail-label { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; color: #AFAFAF; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 4px; }
  .detail-value { font-size: 14px; color: #0F0F0F; line-height: 1.65; }
  .map-btn { background: #F5F4F1; border-radius: 12px; height: 110px; margin: 0 22px 18px; display: flex; align-items: center; justify-content: center; gap: 8px; border: 1px solid #E8E6E1; cursor: pointer; transition: all 0.2s; text-decoration: none; color: #6B6B6B; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; }
  .map-btn:hover { border-color: #FF5C1A; color: #FF5C1A; background: #FFF3EE; }
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
  .jd-sidebar { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 80px; }
  .price-card { background: white; border: 1px solid #E8E6E1; border-radius: 18px; overflow: hidden; }
  .price-head { padding: 18px 20px 14px; border-bottom: 1px solid #E8E6E1; }
  .price-label { font-size: 12px; color: #6B6B6B; margin-bottom: 4px; }
  .price-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 34px; color: #0F0F0F; letter-spacing: -1px; }
  .price-note { font-size: 12px; color: #6B6B6B; margin-top: 4px; }
  .price-breakdown { padding: 14px 20px; display: flex; flex-direction: column; gap: 10px; border-bottom: 1px solid #E8E6E1; }
  .pb-row { display: flex; justify-content: space-between; font-size: 13px; }
  .pb-label { color: #6B6B6B; }
  .pb-val { font-family: 'Syne', sans-serif; font-weight: 600; color: #0F0F0F; }
  .payment-row { padding: 14px 20px; display: flex; align-items: center; gap: 10px; }
  .payment-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .payment-status { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; }
  .payment-note { font-size: 12px; color: #6B6B6B; }
  .action-card { background: white; border: 1px solid #E8E6E1; border-radius: 18px; padding: 20px; display: flex; flex-direction: column; gap: 10px; }
  .full-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; border-radius: 12px; padding: 13px; cursor: pointer; text-decoration: none; transition: all 0.2s; border: none; }
  .full-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .full-btn-green   { background: #16A34A; color: white; }
  .full-btn-green:hover:not(:disabled)   { background: #15803D; transform: translateY(-1px); }
  .full-btn-orange  { background: #FF5C1A; color: white; }
  .full-btn-orange:hover:not(:disabled)  { background: #FF7A40; transform: translateY(-1px); }
  .full-btn-dark    { background: #0F0F0F; color: white; }
  .full-btn-dark:hover:not(:disabled)    { background: #1A1A1A; }
  .full-btn-outline { background: transparent; color: #6B6B6B; border: 1.5px solid #E8E6E1; }
  .full-btn-outline:hover { background: #F5F4F1; color: #0F0F0F; border-color: #0F0F0F; }
  .full-btn-danger  { background: transparent; color: #EF4444; border: 1.5px solid rgba(239,68,68,0.3); }
  .full-btn-danger:hover:not(:disabled)  { background: #FEF2F2; border-color: #EF4444; }
  .rating-display { display: flex; align-items: center; gap: 6px; padding: 14px 20px; border-top: 1px solid #E8E6E1; }
  .rating-stars { display: flex; gap: 2px; }
  .loading-screen { height: 100vh; display: flex; align-items: center; justify-content: center; background: #F5F4F1; }
  .loading-spinner { width: 40px; height: 40px; border-radius: 50%; border: 3px solid #E8E6E1; border-top-color: #FF5C1A; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); }
  .modal { background: white; border-radius: 22px; padding: 40px 36px; max-width: 400px; width: 100%; text-align: center; box-shadow: 0 24px 80px rgba(0,0,0,0.2); animation: popIn 0.3s cubic-bezier(0.175,0.885,0.32,1.275); }
  @keyframes popIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .modal-icon { width: 68px; height: 68px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; }
  .modal-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: #0F0F0F; margin-bottom: 10px; }
  .modal-sub { font-size: 14px; color: #6B6B6B; font-weight: 300; line-height: 1.7; margin-bottom: 24px; }
  .modal-btns { display: flex; gap: 10px; }
  .modal-cancel { flex: 1; background: transparent; color: #6B6B6B; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; border: 1.5px solid #E8E6E1; border-radius: 11px; padding: 12px; cursor: pointer; }
  .modal-confirm-green { flex: 1; background: #16A34A; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; border: none; border-radius: 11px; padding: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .modal-confirm-red   { flex: 1; background: #EF4444; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; border: none; border-radius: 11px; padding: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
  @media (max-width: 860px) {
    .jd-body { grid-template-columns: 1fr; padding: 20px 16px; }
    .jd-sidebar { position: static; }
    .jd-topbar { padding: 0 16px; }
    .client-actions { flex-direction: column; }
  }
`

export default function WorkerJobDetailsPage() {
  const params  = useParams()
  const router  = useRouter()
  const jobId   = params?.id as string

  const [authUser, setAuthUser]     = useState<any>(null)
  const [job, setJob]               = useState<JobData | null>(null)
  const [loading, setLoading]       = useState(true)
  const [actioning, setActioning]   = useState(false)
  const [copied, setCopied]         = useState(false)
  const [showAccept, setShowAccept]   = useState(false)
  const [showDecline, setShowDecline] = useState(false)
  const [showComplete, setShowComplete] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { router.push('/login'); return }
      setAuthUser(u)
    })
    return () => unsub()
  }, [router])

  useEffect(() => {
    if (!jobId) return
    const fetchJob = async () => {
      try {
        const snap = await getDoc(doc(db, 'bookings', jobId))
        if (!snap.exists()) { toast.error('Job not found.'); router.push('/worker/jobs'); return }
        const d = snap.data() as any
        let clientPhone = d.clientPhone || ''
        if (!clientPhone && d.clientId) {
          try {
            const uSnap = await getDoc(doc(db, 'users', d.clientId))
            if (uSnap.exists()) clientPhone = uSnap.data().phone || ''
          } catch {}
        }
        setJob({
          id: jobId,
          clientId:          d.clientId          || '',
          clientName:        d.clientName        || 'Client',
          clientInitials:    d.clientInitials    || getInitials(d.clientName || 'C'),
          clientAvatarBg:    d.clientAvatarBg    || '#EEF6FF',
          clientAvatarColor: d.clientAvatarColor || '#2563EB',
          clientEmail:       d.clientEmail       || '',
          clientPhone,
          description:       d.description       || '—',
          skill:             d.skill             || '',
          location:          d.location          || '—',
          scheduledDate:     formatScheduled(d.scheduledAt),
          scheduledTime:     d.timeSlot          || '—',
          scheduledTs:       d.scheduledAt,
          price:             d.price             || 0,
          currency:          d.currency          || '£',
          ratePerHour:       d.ratePerHour       || d.price || 0,
          status:            d.status            || 'pending',
          paymentStatus:     d.paymentStatus     || 'pending',
          rating:            d.rating,
          createdAt:         formatTs(d.createdAt),
          acceptedAt:        d.acceptedAt  ? formatTs(d.acceptedAt)  : undefined,
          completedAt:       d.completedAt ? formatTs(d.completedAt) : undefined,
        })
      } catch (err) {
        console.error('Job fetch error:', err)
        toast.error('Could not load job details.')
      } finally {
        setLoading(false)
      }
    }
    fetchJob()
  }, [jobId, router])

  const doAction = async (newStatus: 'accepted' | 'cancelled' | 'completed') => {
    if (!job) return
    setActioning(true)
    try {
      const update: any = { status: newStatus, updatedAt: serverTimestamp() }
      if (newStatus === 'accepted')  update.acceptedAt  = serverTimestamp()
      if (newStatus === 'completed') update.completedAt = serverTimestamp()
      await updateDoc(doc(db, 'bookings', job.id), update)
      if (newStatus === 'completed' && authUser) {
        const wSnap = await getDoc(doc(db, 'workers', authUser.uid))
        if (wSnap.exists()) await updateDoc(doc(db, 'workers', authUser.uid), { jobs: (wSnap.data().jobs || 0) + 1 })
      }
      setJob(prev => prev ? { ...prev, status: newStatus } : prev)
      toast.success(newStatus === 'accepted' ? 'Job accepted!' : newStatus === 'completed' ? 'Job completed!' : 'Job declined.')
      setShowAccept(false); setShowDecline(false); setShowComplete(false)
    } catch { toast.error('Action failed.') }
    finally { setActioning(false) }
  }

  const copyId = () => {
    navigator.clipboard.writeText(`JOB-${jobId.slice(-8).toUpperCase()}`)
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }

  if (loading) return <><style>{S}</style><div className="loading-screen"><div className="loading-spinner" /></div></>
  if (!job) return null

  const st = statusConfig[job.status] || statusConfig.pending
  const timeline = [
    { label: 'Job Requested',    time: job.createdAt,                                        done: true,                    icon: <FileText size={14} />    },
    { label: 'You Accepted',     time: job.acceptedAt  || 'Awaiting your response',           done: !!job.acceptedAt,        icon: <CheckCircle size={14} /> },
    { label: 'Scheduled',        time: job.scheduledDate,                                     done: job.status==='completed', icon: <Calendar size={14} />   },
    { label: 'Job Completed',    time: job.completedAt || 'Awaiting completion',               done: job.status==='completed', icon: <CheckCircle size={14} />},
    { label: 'Payment Released', time: job.status==='completed' ? 'Processing' : 'Awaiting', done: false,                   icon: <Banknote size={14} />    },
  ]

  return (
    <>
      <style>{S}</style>
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />

      {showAccept && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-icon" style={{ background: '#F0FDF4', border: '2px solid rgba(22,163,74,0.2)' }}>
              <CheckCircle size={28} color="#16A34A" />
            </div>
            <h2 className="modal-title">Accept this job?</h2>
            <p className="modal-sub">
              You&apos;re confirming the job for <strong>{job.clientName}</strong> on{' '}
              <strong>{job.scheduledDate}</strong> at <strong>{job.location}</strong>.
            </p>
            <div className="modal-btns">
              <button className="modal-cancel" onClick={() => setShowAccept(false)}>Cancel</button>
              <button className="modal-confirm-green" onClick={() => doAction('accepted')} disabled={actioning}>
                {actioning ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <><CheckCircle size={15} /> Accept Job</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDecline && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-icon" style={{ background: '#FEF2F2', border: '2px solid rgba(239,68,68,0.2)' }}>
              <XCircle size={28} color="#EF4444" />
            </div>
            <h2 className="modal-title">Decline this job?</h2>
            <p className="modal-sub">
              Are you sure you want to decline the request from <strong>{job.clientName}</strong>? The client will be notified.
            </p>
            <div className="modal-btns">
              <button className="modal-cancel" onClick={() => setShowDecline(false)}>Keep it</button>
              <button className="modal-confirm-red" onClick={() => doAction('cancelled')} disabled={actioning}>
                {actioning ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <><XCircle size={15} /> Decline</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {showComplete && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-icon" style={{ background: '#F0FDF4', border: '2px solid rgba(22,163,74,0.2)' }}>
              <CheckCircle size={28} color="#16A34A" />
            </div>
            <h2 className="modal-title">Mark as complete?</h2>
            <p className="modal-sub">
              Confirm the job for <strong>{job.clientName}</strong> is done.
              Payment of <strong>{job.currency}{job.price}</strong> will be released.
            </p>
            <div className="modal-btns">
              <button className="modal-cancel" onClick={() => setShowComplete(false)}>Not yet</button>
              <button className="modal-confirm-green" onClick={() => doAction('completed')} disabled={actioning}>
                {actioning ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <><CheckCircle size={15} /> Mark Complete</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="jd-page">
        <div className="jd-topbar">
          <Link href="/worker/jobs" className="jd-back"><ChevronLeft size={18} /></Link>
          <span className="jd-topbar-title">Job Details</span>
          <div className="jd-copy-id" onClick={copyId}>
            {copied ? <Check size={13} color="#22C55E" /> : <Copy size={13} />}
            JOB-{jobId.slice(-8).toUpperCase()}
          </div>
        </div>

        <div className="jd-body">
          <div>
            {/* Status banner */}
            <div className="status-banner" style={{ background: st.bg, borderColor: st.color + '30', color: st.color }}>
              <div className="status-banner-icon" style={{ background: st.color + '20' }}>{st.icon}</div>
              <div>
                <div className="status-banner-title">Status: {st.label}</div>
                <div className="status-banner-desc">{st.desc}</div>
              </div>
            </div>

            {/* Client card */}
            <div className="jd-card">
              <div className="jd-card-title">
                <div className="jd-card-icon" style={{ background: '#EEF6FF' }}><User size={14} color="#2563EB" /></div>
                Client
              </div>
              <div className="client-row">
                <div className="client-avatar" style={{ background: job.clientAvatarBg, color: job.clientAvatarColor }}>
                  {job.clientInitials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="client-name">{job.clientName}</div>
                  <div className="client-meta">
                    {job.clientEmail && <span className="client-meta-item">{job.clientEmail}</span>}
                    {job.clientPhone && <span className="client-meta-item"><Phone size={11} />{job.clientPhone}</span>}
                  </div>
                </div>
                <div className="client-actions">
                  <Link href={`/chat/${job.clientId}`} className="caction-btn caction-primary">
                    <MessageCircle size={14} /> Chat
                  </Link>
                  {job.clientPhone && (
                    <a href={`tel:${job.clientPhone}`} className="caction-btn caction-secondary">
                      <Phone size={14} /> Call
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Job info */}
            <div className="jd-card">
              <div className="jd-card-title">
                <div className="jd-card-icon" style={{ background: '#F5F4F1' }}><FileText size={14} color="#6B6B6B" /></div>
                Job Information
              </div>
              {[
                { icon: <FileText size={15} />, label: 'Description', value: job.description  },
                { icon: <Star size={15} />,     label: 'Skill',       value: job.skill        },
                { icon: <Calendar size={15} />, label: 'Scheduled',   value: job.scheduledDate},
                { icon: <Clock size={15} />,    label: 'Time',        value: job.scheduledTime},
                { icon: <MapPin size={15} />,   label: 'Location',    value: job.location     },
              ].filter(r => r.value && r.value !== '—').map(row => (
                <div key={row.label} className="detail-row">
                  <div className="detail-icon">{row.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div className="detail-label">{row.label}</div>
                    <div className="detail-value">{row.value}</div>
                  </div>
                </div>
              ))}
              {job.location && job.location !== '—' && (
                <a href={`https://maps.google.com/?q=${encodeURIComponent(job.location)}`}
                  target="_blank" rel="noopener noreferrer" className="map-btn">
                  <Navigation size={16} /> Open in Maps
                </a>
              )}
            </div>

            {/* Timeline */}
            <div className="jd-card">
              <div className="jd-card-title">
                <div className="jd-card-icon" style={{ background: '#FFF3EE' }}><Clock size={14} color="#FF5C1A" /></div>
                Job Timeline
              </div>
              <div className="timeline">
                {timeline.map((item, i) => (
                  <div key={item.label} className="tl-item">
                    <div className="tl-track">
                      <div className={`tl-dot ${item.done ? 'done' : 'pending'}`}>{item.icon}</div>
                      {i < timeline.length - 1 && <div className={`tl-line ${item.done ? 'done' : ''}`} />}
                    </div>
                    <div className="tl-content">
                      <div className={`tl-label ${!item.done ? 'pending' : ''}`}>{item.label}</div>
                      <div className="tl-time">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="jd-sidebar">
            <div className="price-card">
              <div className="price-head">
                <div className="price-label">Job Payment</div>
                <div className="price-val">{job.currency}{job.price}</div>
                <div className="price-note">Final amount after job completion</div>
              </div>
              <div className="price-breakdown">
                {job.ratePerHour > 0 && (
                  <div className="pb-row">
                    <span className="pb-label">Your rate</span>
                    <span className="pb-val">{job.currency}{job.ratePerHour}/hr</span>
                  </div>
                )}
                <div className="pb-row">
                  <span className="pb-label" style={{ fontWeight: 700, color: '#0F0F0F' }}>Total</span>
                  <span className="pb-val" style={{ color: '#FF5C1A', fontSize: 15, fontWeight: 800 }}>
                    {job.currency}{job.price}
                  </span>
                </div>
              </div>
              <div className="payment-row">
                <div className="payment-dot" style={{ background: job.status === 'completed' ? '#22C55E' : '#F59E0B' }} />
                <div>
                  <div className="payment-status" style={{ color: job.status === 'completed' ? '#16A34A' : '#D97706' }}>
                    {job.status === 'completed' ? 'Payment Processing' : 'Payment on Completion'}
                  </div>
                  <div className="payment-note">Released after job is marked complete</div>
                </div>
              </div>
              {job.rating && (
                <div className="rating-display">
                  <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, color: '#0F0F0F', marginRight: 4 }}>
                    Client Rating:
                  </span>
                  <div className="rating-stars">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} size={14} color="#F59E0B" fill={n <= job.rating! ? '#F59E0B' : 'none'} />
                    ))}
                  </div>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: '#0F0F0F', marginLeft: 4 }}>
                    {job.rating}
                  </span>
                </div>
              )}
            </div>

            <div className="action-card">
              {job.status === 'pending' && (
                <>
                  <button className="full-btn full-btn-green" onClick={() => setShowAccept(true)}>
                    <CheckCircle size={16} /> Accept Job
                  </button>
                  <Link href={`/chat/${job.clientId}`} className="full-btn full-btn-orange">
                    <MessageCircle size={16} /> Message Client
                  </Link>
                  <button className="full-btn full-btn-danger" onClick={() => setShowDecline(true)}>
                    <XCircle size={15} /> Decline
                  </button>
                </>
              )}
              {job.status === 'accepted' && (
                <>
                  <button className="full-btn full-btn-green" onClick={() => setShowComplete(true)}>
                    <CheckCircle size={16} /> Mark as Complete
                  </button>
                  <Link href={`/chat/${job.clientId}`} className="full-btn full-btn-dark">
                    <MessageCircle size={16} /> Chat with Client
                  </Link>
                  <button className="full-btn full-btn-danger" onClick={() => setShowDecline(true)}>
                    <XCircle size={15} /> Cancel Job
                  </button>
                </>
              )}
              {job.status === 'completed' && (
                <Link href={`/chat/${job.clientId}`} className="full-btn full-btn-orange">
                  <MessageCircle size={16} /> Message Client
                </Link>
              )}
              {job.status === 'cancelled' && (
                <button className="full-btn full-btn-outline" onClick={() => doAction('accepted')} disabled={actioning}>
                  {actioning ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <><RotateCcw size={15} /> Reconsider Job</>}
                </button>
              )}
            </div>

            <div style={{ background: 'white', border: '1px solid #E8E6E1', borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShieldCheck size={18} color="#16A34A" />
              </div>
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: '#0F0F0F', marginBottom: 3 }}>Payment Protected</div>
                <div style={{ fontSize: 12, color: '#6B6B6B', lineHeight: 1.5 }}>
                  Your payment of {job.currency}{job.price} is held securely and released once you mark the job complete.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}