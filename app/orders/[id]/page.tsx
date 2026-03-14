'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft, MapPin, Clock, Calendar, Star,
  MessageCircle, CheckCircle, XCircle, AlertCircle,
  Phone, Navigation, FileText, Download, RotateCcw,
  Banknote, ShieldCheck, ChevronRight, Copy, Check
} from 'lucide-react'

// In real app, fetch by params.id from Firebase
const order = {
  id: 'ORD-2024-001',
  worker: { id: 'james-mitchell', initials: 'JM', name: 'James Mitchell', skill: 'Electrician', rating: 4.9, jobs: 214, phone: '+44 7700 900456', responseTime: '< 1 hour', avatarBg: '#FFF3EE', avatarColor: '#FF5C1A' },
  status: 'accepted',
  description: 'Consumer unit replacement and full house rewire safety check. The existing unit is approximately 10 years old (Hager brand) and needs upgrading to a modern RCBO unit. Client has reported intermittent tripping.',
  location: '12 Baker Street, London, W1U 3BW',
  date: 'Tomorrow — Tuesday, March 15, 2025',
  time: '2:00 PM',
  price: 90,
  currency: '£',
  ratePerHour: 45,
  estHours: 2,
  createdAt: 'Mar 12, 2025 · 10:34 AM',
  acceptedAt: 'Mar 12, 2025 · 10:47 AM',
  paymentStatus: 'pending',
}

const timeline = [
  { label: 'Booking Requested',  time: 'Mar 12, 10:34 AM', done: true,  icon: <FileText size={14} /> },
  { label: 'Worker Accepted',    time: 'Mar 12, 10:47 AM', done: true,  icon: <CheckCircle size={14} /> },
  { label: 'Job In Progress',    time: 'Tomorrow, 2:00 PM', done: false, icon: <Clock size={14} /> },
  { label: 'Job Completed',      time: 'Awaiting',          done: false, icon: <CheckCircle size={14} /> },
  { label: 'Payment Released',   time: 'Awaiting',          done: false, icon: <Banknote size={14} /> },
]

const statusConfig: Record<string, { label: string; bg: string; color: string; icon: React.ReactNode; desc: string }> = {
  pending:   { label: 'Pending',   bg: '#FFF8EE', color: '#D97706', icon: <Clock size={14} />,        desc: 'Waiting for the worker to respond to your booking request.' },
  accepted:  { label: 'Accepted',  bg: '#FFF3EE', color: '#FF5C1A', icon: <CheckCircle size={14} />,  desc: 'Worker has accepted. Your job is confirmed for the scheduled time.' },
  ongoing:   { label: 'Ongoing',   bg: '#EEF6FF', color: '#2563EB', icon: <Clock size={14} />,        desc: 'The worker is currently working on your job.' },
  completed: { label: 'Completed', bg: '#F0FDF4', color: '#16A34A', icon: <CheckCircle size={14} />,  desc: 'Job has been completed successfully.' },
  cancelled: { label: 'Cancelled', bg: '#FEF2F2', color: '#EF4444', icon: <XCircle size={14} />,      desc: 'This booking was cancelled.' },
}

const S = `
  .od-page { min-height: 100vh; background: #F5F4F1; }

  .od-topbar {
    background: white; border-bottom: 1px solid #E8E6E1;
    padding: 0 40px; height: 64px;
    display: flex; align-items: center; gap: 14px;
    position: sticky; top: 0; z-index: 40;
  }
  .topbar-back {
    display: flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; border-radius: 10px;
    color: #6B6B6B; text-decoration: none; transition: all 0.2s;
    border: 1.5px solid #E8E6E1; flex-shrink: 0;
  }
  .topbar-back:hover { border-color: #0F0F0F; color: #0F0F0F; }
  .topbar-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; flex: 1; }
  .topbar-id {
    font-family: 'DM Sans', sans-serif; font-size: 12px; color: #6B6B6B;
    background: #F5F4F1; border: 1px solid #E8E6E1;
    padding: 5px 12px; border-radius: 8px; display: flex; align-items: center; gap: 6px;
    cursor: pointer; transition: all 0.2s;
  }
  .topbar-id:hover { border-color: #FF5C1A; color: #FF5C1A; }

  .od-body { max-width: 860px; margin: 0 auto; padding: 28px 40px; display: grid; grid-template-columns: 1fr 300px; gap: 20px; align-items: start; }

  /* STATUS BANNER */
  .status-banner {
    border-radius: 16px; padding: 18px 22px;
    display: flex; align-items: center; gap: 14px;
    margin-bottom: 20px; border: 1px solid transparent;
  }
  .status-banner-icon {
    width: 42px; height: 42px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .status-banner-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; margin-bottom: 3px; }
  .status-banner-desc { font-size: 13px; font-weight: 300; opacity: 0.8; }

  /* CARDS */
  .od-card { background: white; border: 1px solid #E8E6E1; border-radius: 18px; overflow: hidden; margin-bottom: 16px; }
  .od-card-title {
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F;
    padding: 18px 22px 14px; border-bottom: 1px solid #E8E6E1;
    display: flex; align-items: center; gap: 8px;
  }
  .od-card-title-icon {
    width: 30px; height: 30px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }

  /* WORKER CARD */
  .worker-row { display: flex; align-items: center; gap: 14px; padding: 18px 22px; }
  .worker-avatar {
    width: 54px; height: 54px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 19px; flex-shrink: 0;
  }
  .worker-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; }
  .worker-skill { display: inline-block; font-size: 11px; font-weight: 600; background: #FFF3EE; color: #FF5C1A; padding: 2px 9px; border-radius: 100px; margin: 3px 0; }
  .worker-meta { display: flex; align-items: center; gap: 10px; font-size: 12px; color: #6B6B6B; flex-wrap: wrap; }
  .worker-meta-item { display: flex; align-items: center; gap: 4px; }
  .worker-actions { display: flex; gap: 8px; margin-left: auto; flex-shrink: 0; }
  .waction-btn {
    display: flex; align-items: center; gap: 6px;
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
    border-radius: 9px; padding: 8px 14px; cursor: pointer;
    text-decoration: none; transition: all 0.2s; border: none;
  }
  .waction-primary { background: #FF5C1A; color: white; }
  .waction-primary:hover { background: #FF7A40; }
  .waction-secondary { background: white; color: #0F0F0F; border: 1.5px solid #E8E6E1; }
  .waction-secondary:hover { border-color: #0F0F0F; }

  /* JOB DETAILS */
  .job-detail-row {
    display: flex; align-items: flex-start; gap: 14px;
    padding: 14px 22px; border-bottom: 1px solid #F5F4F1;
  }
  .job-detail-row:last-child { border-bottom: none; }
  .jd-icon { width: 34px; height: 34px; border-radius: 9px; background: #F5F4F1; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #6B6B6B; }
  .jd-label { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; color: #AFAFAF; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 4px; }
  .jd-value { font-size: 14px; color: #0F0F0F; line-height: 1.65; }
  .jd-value.mono { font-family: 'DM Sans', sans-serif; }

  /* MAP PLACEHOLDER */
  .map-placeholder {
    background: #F5F4F1; border-radius: 12px; height: 120px; margin: 0 22px 18px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    border: 1px solid #E8E6E1; cursor: pointer; transition: all 0.2s;
    text-decoration: none; color: #6B6B6B; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
  }
  .map-placeholder:hover { border-color: #FF5C1A; color: #FF5C1A; background: #FFF3EE; }

  /* TIMELINE */
  .timeline { padding: 18px 22px; display: flex; flex-direction: column; gap: 0; }
  .tl-item { display: flex; gap: 14px; align-items: flex-start; }
  .tl-track { display: flex; flex-direction: column; align-items: center; }
  .tl-dot {
    width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid #E8E6E1; background: white;
    transition: all 0.3s;
  }
  .tl-dot.done { background: #FF5C1A; border-color: #FF5C1A; color: white; }
  .tl-dot.pending { background: white; border-color: #E8E6E1; color: #AFAFAF; }
  .tl-line { width: 2px; flex: 1; min-height: 24px; background: #E8E6E1; margin: 3px 0; }
  .tl-line.done { background: #FF5C1A; }
  .tl-content { padding: 4px 0 24px; }
  .tl-label { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; margin-bottom: 2px; }
  .tl-label.pending { color: #AFAFAF; }
  .tl-time { font-size: 12px; color: #6B6B6B; }
  .tl-item:last-child .tl-content { padding-bottom: 0; }

  /* SIDEBAR */
  .od-sidebar { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 80px; }

  /* PRICE CARD */
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

  /* ACTION CARD */
  .action-card { background: white; border: 1px solid #E8E6E1; border-radius: 18px; padding: 20px; display: flex; flex-direction: column; gap: 10px; }
  .full-btn {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
    font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600;
    border-radius: 12px; padding: 13px; cursor: pointer;
    text-decoration: none; transition: all 0.2s; border: none;
  }
  .full-btn-orange { background: #FF5C1A; color: white; }
  .full-btn-orange:hover { background: #FF7A40; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,92,26,0.25); }
  .full-btn-dark { background: #0F0F0F; color: white; }
  .full-btn-dark:hover { background: #1A1A1A; }
  .full-btn-outline { background: transparent; color: #6B6B6B; border: 1.5px solid #E8E6E1; }
  .full-btn-outline:hover { background: #F5F4F1; color: #0F0F0F; border-color: #0F0F0F; }
  .full-btn-danger { background: transparent; color: #EF4444; border: 1.5px solid rgba(239,68,68,0.3); }
  .full-btn-danger:hover { background: #FEF2F2; border-color: #EF4444; }

  /* TRUST */
  .trust-card { background: white; border: 1px solid #E8E6E1; border-radius: 14px; padding: 16px 18px; display: flex; align-items: flex-start; gap: 12px; }
  .trust-icon { width: 36px; height: 36px; border-radius: 10px; background: #F0FDF4; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .trust-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #0F0F0F; margin-bottom: 3px; }
  .trust-sub { font-size: 12px; color: #6B6B6B; line-height: 1.5; }

  /* CANCEL MODAL */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .modal { background: white; border-radius: 22px; padding: 36px 32px; max-width: 400px; width: 100%; text-align: center; box-shadow: 0 24px 80px rgba(0,0,0,0.2); animation: popIn 0.35s cubic-bezier(0.175,0.885,0.32,1.275); }
  @keyframes popIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .modal-icon { width: 64px; height: 64px; border-radius: 50%; background: #FEF2F2; border: 2px solid rgba(239,68,68,0.2); display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; }
  .modal-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: #0F0F0F; margin-bottom: 8px; }
  .modal-sub { font-size: 14px; color: #6B6B6B; font-weight: 300; line-height: 1.7; margin-bottom: 24px; }
  .modal-btns { display: flex; gap: 10px; }
  .modal-cancel-btn { flex: 1; background: transparent; color: #6B6B6B; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; border: 1.5px solid #E8E6E1; border-radius: 11px; padding: 12px; cursor: pointer; transition: all 0.2s; }
  .modal-cancel-btn:hover { background: #F5F4F1; }
  .modal-confirm-btn { flex: 1; background: #EF4444; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; border: none; border-radius: 11px; padding: 12px; cursor: pointer; transition: background 0.2s; }
  .modal-confirm-btn:hover { background: #DC2626; }

  @media (max-width: 860px) {
    .od-body { grid-template-columns: 1fr; padding: 20px 16px; }
    .od-sidebar { position: static; }
    .od-topbar { padding: 0 16px; }
    .worker-actions { flex-direction: column; }
  }
`

export default function OrderDetailsPage() {
  const [showCancel, setShowCancel] = useState(false)
  const [copied, setCopied]         = useState(false)

  const st  = statusConfig[order.status]

  const copyId = () => {
    navigator.clipboard.writeText(order.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      <style>{S}</style>
      <div className="od-page">

        {showCancel && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-icon"><XCircle size={28} color="#EF4444" /></div>
              <h2 className="modal-title">Cancel this booking?</h2>
              <p className="modal-sub">Are you sure you want to cancel your booking with <strong>{order.worker.name}</strong>? This action cannot be undone.</p>
              <div className="modal-btns">
                <button className="modal-cancel-btn" onClick={() => setShowCancel(false)}>Keep Booking</button>
                <button className="modal-confirm-btn" onClick={() => setShowCancel(false)}>Yes, Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="od-topbar">
          <Link href="/orders" className="topbar-back"><ChevronLeft size={18} /></Link>
          <p className="topbar-title">Order Details</p>
          <div className="topbar-id" onClick={copyId}>
            {copied ? <Check size={13} color="#22C55E" /> : <Copy size={13} />}
            {order.id}
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
                <div className="od-card-title-icon" style={{ background: '#FFF3EE' }}>
                  <Star size={14} color="#FF5C1A" />
                </div>
                Assigned Worker
              </p>
              <div className="worker-row">
                <div className="worker-avatar" style={{ background: order.worker.avatarBg, color: order.worker.avatarColor }}>
                  {order.worker.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="worker-name">{order.worker.name}</p>
                  <span className="worker-skill">{order.worker.skill}</span>
                  <div className="worker-meta">
                    <span className="worker-meta-item"><Star size={11} color="#F59E0B" fill="#F59E0B" />{order.worker.rating}</span>
                    <span className="worker-meta-item"><CheckCircle size={11} color="#16A34A" />{order.worker.jobs} jobs</span>
                    <span className="worker-meta-item"><Clock size={11} />Responds {order.worker.responseTime}</span>
                  </div>
                </div>
                <div className="worker-actions">
                  <Link href={`/chat/${order.worker.id}`} className="waction-btn waction-primary">
                    <MessageCircle size={14} /> Chat
                  </Link>
                  <Link href={`/explore/${order.worker.id}`} className="waction-btn waction-secondary">
                    <ChevronRight size={14} /> Profile
                  </Link>
                </div>
              </div>
            </div>

            {/* Job details */}
            <div className="od-card">
              <p className="od-card-title">
                <div className="od-card-title-icon" style={{ background: '#F5F4F1' }}>
                  <FileText size={14} color="#6B6B6B" />
                </div>
                Job Information
              </p>
              <div className="job-detail-row">
                <div className="jd-icon"><FileText size={15} /></div>
                <div>
                  <p className="jd-label">Description</p>
                  <p className="jd-value">{order.description}</p>
                </div>
              </div>
              <div className="job-detail-row">
                <div className="jd-icon"><Calendar size={15} /></div>
                <div>
                  <p className="jd-label">Scheduled Date</p>
                  <p className="jd-value">{order.date}</p>
                </div>
              </div>
              <div className="job-detail-row">
                <div className="jd-icon"><Clock size={15} /></div>
                <div>
                  <p className="jd-label">Time</p>
                  <p className="jd-value">{order.time}</p>
                </div>
              </div>
              <div className="job-detail-row">
                <div className="jd-icon"><MapPin size={15} /></div>
                <div style={{ flex: 1 }}>
                  <p className="jd-label">Location</p>
                  <p className="jd-value">{order.location}</p>
                </div>
              </div>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(order.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="map-placeholder"
              >
                <Navigation size={16} /> Open in Maps
              </a>
            </div>

            {/* Timeline */}
            <div className="od-card">
              <p className="od-card-title">
                <div className="od-card-title-icon" style={{ background: '#FFF3EE' }}>
                  <Clock size={14} color="#FF5C1A" />
                </div>
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
            {/* Price card */}
            <div className="price-card">
              <div className="price-card-head">
                <p className="price-total-label">Total Amount</p>
                <p className="price-total-val">{order.currency}{order.price}</p>
                <p className="price-total-note">Estimated · Final price agreed on completion</p>
              </div>
              <div className="price-breakdown">
                <div className="pb-row">
                  <span className="pb-label">Rate</span>
                  <span className="pb-val">{order.currency}{order.ratePerHour}/hr</span>
                </div>
                <div className="pb-row">
                  <span className="pb-label">Est. duration</span>
                  <span className="pb-val">{order.estHours} hrs</span>
                </div>
                <div className="pb-row total">
                  <span className="pb-label" style={{ fontWeight: 700, color: '#0F0F0F' }}>Estimated Total</span>
                  <span className="pb-val">{order.currency}{order.price}</span>
                </div>
              </div>
              <div className="payment-status-row">
                <div className="payment-dot" style={{ background: '#F59E0B' }} />
                <div>
                  <p className="payment-status-text" style={{ color: '#D97706' }}>Payment Pending</p>
                  <p className="payment-note">No charge until job is confirmed complete</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="action-card">
              <Link href={`/chat/${order.worker.id}`} className="full-btn full-btn-orange">
                <MessageCircle size={16} /> Message Worker
              </Link>
              <Link href={`/booking/${order.worker.id}`} className="full-btn full-btn-dark">
                <RotateCcw size={15} /> Book Again
              </Link>
              <button className="full-btn full-btn-outline">
                <Download size={15} /> Download Receipt
              </button>
              {(order.status === 'pending' || order.status === 'accepted') && (
                <button className="full-btn full-btn-danger" onClick={() => setShowCancel(true)}>
                  <XCircle size={15} /> Cancel Booking
                </button>
              )}
            </div>

            {/* Trust badge */}
            <div className="trust-card">
              <div className="trust-icon"><ShieldCheck size={18} color="#16A34A" /></div>
              <div>
                <p className="trust-title">FixMate Guarantee</p>
                <p className="trust-sub">Your payment is protected. If the job isn&apos;t completed, you won&apos;t be charged.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}