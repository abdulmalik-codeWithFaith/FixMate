'use client'

import { useState, createContext, useContext, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase' // Ensure this path is correct
import {
  ChevronLeft, MapPin, Star, Calendar, Clock,
  FileText, CheckCircle, AlertCircle, Navigation, Lock, Loader2
} from 'lucide-react'

// --- AUTH CONTEXT LOGIC (Fixed TS Errors) ---
const AuthContext = createContext<{ user: User | null; loading: boolean }>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// --- DESIGN CONSTANTS ---
const worker = {
  id: 'james-mitchell', initials: 'JM', name: 'James Mitchell',
  skill: 'Electrician', location: 'London, UK', rating: 4.9,
  price: 45, currency: '£', jobs: 214,
  avatarBg: '#FFF3EE', avatarColor: '#FF5C1A',
  responseTime: '< 1 hour',
}

const timeSlots = ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM']

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
    color: #6B6B6B; text-decoration: none; transition: all 0.2s;
    border: 1.5px solid #E8E6E1; flex-shrink: 0;
  }
  .back-link:hover { border-color: #0F0F0F; color: #0F0F0F; }
  .book-page-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; }
  .book-body { max-width: 960px; margin: 0 auto; padding: 32px 40px; display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
  .book-card { background: white; border: 1px solid #E8E6E1; border-radius: 20px; overflow: hidden; }
  .book-section { padding: 28px; border-bottom: 1px solid #E8E6E1; }
  .book-section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; }
  .book-section-num { width: 26px; height: 26px; border-radius: 50%; background: #FF5C1A; color: white; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px; display: flex; align-items: center; justify-content: center; }
  .field { margin-bottom: 16px; }
  .field-label { display: block; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #0F0F0F; margin-bottom: 6px; }
  .field-label span { color: #FF5C1A; }
  .field-input { width: 100%; background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 12px; padding: 12px 16px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
  .field-input:focus { border-color: #FF5C1A; background: white; box-shadow: 0 0 0 3px rgba(255,92,26,0.08); }
  .field-textarea { min-height: 100px; resize: vertical; }
  .field-icon-wrap { position: relative; }
  .field-icon-inner { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #AFAFAF; pointer-events: none; }
  .field-error { border-color: #EF4444 !important; }
  .error-msg { font-size: 12px; color: #EF4444; margin-top: 4px; }
  .time-slots { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
  .time-slot { background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 9px; padding: 9px 4px; text-align: center; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; color: #6B6B6B; cursor: pointer; transition: all 0.2s; }
  .time-slot:hover { border-color: #FF5C1A; color: #FF5C1A; background: #FFF3EE; }
  .time-slot.selected { background: #FF5C1A; border-color: #FF5C1A; color: white; }
  .price-wrap { position: relative; }
  .price-prefix { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-family: 'Syne', sans-serif; font-weight: 700; color: #0F0F0F; font-size: 15px; pointer-events: none; }
  .price-wrap input { padding-left: 30px; }
  .price-note { font-size: 12px; color: #6B6B6B; margin-top: 6px; }
  .book-sidebar { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 80px; }
  .worker-summary { background: white; border: 1px solid #E8E6E1; border-radius: 20px; padding: 24px; }
  .ws-top { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid #E8E6E1; }
  .ws-avatar { width: 54px; height: 54px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 19px; flex-shrink: 0; }
  .ws-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; }
  .ws-skill { display: inline-block; font-size: 11px; font-weight: 600; background: #FFF3EE; color: #FF5C1A; padding: 3px 9px; border-radius: 100px; margin: 3px 0; }
  .ws-meta { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #6B6B6B; }
  .ws-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
  .ws-row-label { color: #6B6B6B; display: flex; align-items: center; gap: 6px; }
  .ws-row-val { font-family: 'Syne', sans-serif; font-weight: 700; color: #0F0F0F; font-size: 14px; }
  .ws-price-big { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 26px; color: #FF5C1A; }
  .ws-price-note { font-size: 12px; color: #6B6B6B; }
  .ws-divider { height: 1px; background: #E8E6E1; margin: 14px 0; }
  .order-summary { background: white; border: 1px solid #E8E6E1; border-radius: 20px; padding: 24px; }
  .os-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; margin-bottom: 14px; }
  .os-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 10px; color: #6B6B6B; }
  .os-row span:last-child { color: #0F0F0F; font-weight: 600; font-family: 'Syne', sans-serif; }
  .os-row.total { font-size: 15px; color: #0F0F0F; border-top: 1px solid #E8E6E1; padding-top: 12px; margin-top: 4px; }
  .os-row.total span:last-child { color: #FF5C1A; font-size: 17px; font-weight: 800; }
  .os-note { font-size: 11px; color: #AFAFAF; margin-top: 10px; line-height: 1.5; }
  .submit-card { background: white; border: 1px solid #E8E6E1; border-radius: 20px; padding: 24px; }
  .submit-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; background: #FF5C1A; color: white; font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 600; border: none; border-radius: 12px; padding: 15px; cursor: pointer; transition: all 0.2s; margin-bottom: 12px; }
  .submit-btn:hover { background: #FF7A40; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(255,92,26,0.25); }
  .submit-trust { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 12px; color: #6B6B6B; }
  .success-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .success-modal { background: white; border-radius: 24px; padding: 48px 40px; max-width: 420px; width: 100%; text-align: center; box-shadow: 0 24px 80px rgba(0,0,0,0.2); animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
  @keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .success-icon { width: 80px; height: 80px; border-radius: 50%; background: #F0FDF4; border: 3px solid #22C55E; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
  .success-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; color: #0F0F0F; margin-bottom: 10px; }
  .success-sub { font-size: 15px; color: #6B6B6B; font-weight: 300; line-height: 1.7; margin-bottom: 28px; }
  .success-btn { display: block; width: 100%; background: #FF5C1A; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 15px; border: none; border-radius: 12px; padding: 14px; margin-bottom: 10px; text-decoration: none; cursor: pointer; transition: background 0.2s; text-align: center; }
  .success-btn-sec { display: block; width: 100%; background: transparent; color: #6B6B6B; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; border: 1.5px solid #E8E6E1; border-radius: 12px; padding: 12px; text-decoration: none; cursor: pointer; transition: all 0.2s; text-align: center; }
  @media (max-width: 860px) { .book-body { grid-template-columns: 1fr; padding: 20px 16px; } .book-sidebar { position: static; } .book-topbar { padding: 0 16px; } }
`

export default function BookingPage() {
  const { user, loading } = useAuth();
  const [description, setDescription]   = useState('')
  const [proposedPrice, setProposedPrice] = useState('')
  const [location, setLocation]         = useState('')
  const [date, setDate]                 = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [errors, setErrors]             = useState<Record<string, string>>({})
  const [submitted, setSubmitted]       = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!description.trim()) e.description = 'Please describe the job'
    if (!location.trim())    e.location    = 'Job location is required'
    if (!date)               e.date        = 'Please select a date'
    if (!selectedTime)       e.time        = 'Please select a time slot'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const estHours = proposedPrice && worker.price ? Math.ceil(Number(proposedPrice) / worker.price) : 1
  const totalEst = worker.price * estHours

  // 1. LOADING STATE
  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F4F1' }}>
        <Loader2 className="animate-spin" color="#FF5C1A" size={40} />
      </div>
    )
  }

  // 2. LOGGED OUT STATE
  if (!user) {
    return (
      <>
        <style>{S}</style>
        <div className="book-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="book-card" style={{ padding: 40, maxWidth: 400, textAlign: 'center' }}>
            <div style={{ background: '#FFF3EE', width: 64, height: 64, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Lock size={32} color="#FF5C1A" />
            </div>
            <h2 className="success-title" style={{ fontSize: 20 }}>Login Required</h2>
            <p className="os-note" style={{ marginBottom: 32, fontSize: 14 }}>You need an account to book verified workers like {worker.name.split(' ')[0]}.</p>
            <Link href="/login" className="success-btn">Login to Continue</Link>
            <Link href="/register" className="success-btn-sec" style={{ border: 'none' }}>Create an account</Link>
          </div>
        </div>
      </>
    )
  }

  // 3. MAIN BOOKING FORM
  return (
    <>
      <style>{S}</style>
      <div className="book-page">

        {submitted && (
          <div className="success-overlay">
            <div className="success-modal">
              <div className="success-icon"><CheckCircle size={40} color="#22C55E" /></div>
              <h2 className="success-title">Booking Sent!</h2>
              <p className="success-sub">
                Your request has been sent to <strong>{worker.name}</strong>.
                They typically respond within {worker.responseTime}.
              </p>
              <Link href="/orders" className="success-btn">View My Orders</Link>
              <Link href={`/chat/${worker.id}`} className="success-btn-sec">Message {worker.name.split(' ')[0]}</Link>
            </div>
          </div>
        )}

        <div className="book-topbar">
          <Link href={`/explore/${worker.id}`} className="back-link"><ChevronLeft size={18} /></Link>
          <p className="book-page-title">Book {worker.name}</p>
        </div>

        <div className="book-body">
          <div className="book-card">
            <div className="book-section">
              <p className="book-section-title"><span className="book-section-num">1</span>Job Details</p>
              <div className="field">
                <label className="field-label">Job description <span>*</span></label>
                <textarea
                  className={`field-input field-textarea${errors.description ? ' field-error' : ''}`}
                  placeholder="Describe what you need done..."
                  value={description}
                  onChange={e => { setDescription(e.target.value); setErrors(p => ({ ...p, description: '' })) }}
                />
                {errors.description && <p className="error-msg">{errors.description}</p>}
              </div>
              <div className="field">
                <label className="field-label">Proposed budget (optional)</label>
                <div className="price-wrap">
                  <span className="price-prefix">{worker.currency}</span>
                  <input type="number" className="field-input" placeholder="0.00" value={proposedPrice} onChange={e => setProposedPrice(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="book-section">
              <p className="book-section-title"><span className="book-section-num">2</span>Job Location</p>
              <div className="field">
                <label className="field-label">Address <span>*</span></label>
                <div className="field-icon-wrap">
                  <Navigation size={15} className="field-icon-inner" />
                  <input
                    type="text"
                    className={`field-input${errors.location ? ' field-error' : ''}`}
                    style={{ paddingLeft: 42 }}
                    placeholder="Enter full job address"
                    value={location}
                    onChange={e => { setLocation(e.target.value); setErrors(p => ({ ...p, location: '' })) }}
                  />
                </div>
                {errors.location && <p className="error-msg">{errors.location}</p>}
              </div>
            </div>

            <div className="book-section">
              <p className="book-section-title"><span className="book-section-num">3</span>Date &amp; Time</p>
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
              </div>
              <div className="field">
                <label className="field-label">Preferred time <span>*</span></label>
                <div className="time-slots">
                  {timeSlots.map(t => (
                    <div key={t} className={`time-slot${selectedTime === t ? ' selected' : ''}`}
                      onClick={() => { setSelectedTime(t); setErrors(p => ({ ...p, time: '' })) }}>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="book-sidebar">
            <div className="worker-summary">
              <div className="ws-top">
                <div className="ws-avatar" style={{ background: worker.avatarBg, color: worker.avatarColor }}>{worker.initials}</div>
                <div>
                  <p className="ws-name">{worker.name}</p>
                  <span className="ws-skill">{worker.skill}</span>
                  <div className="ws-meta"><Star size={12} color="#F59E0B" fill="#F59E0B" />{worker.rating} · {worker.jobs} jobs</div>
                </div>
              </div>
              <div className="ws-row"><span className="ws-row-label"><MapPin size={14} />Location</span><span className="ws-row-val">{worker.location}</span></div>
              <div className="ws-divider" />
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div><p className="ws-price-big">{worker.currency}{worker.price}</p><p className="ws-price-note">per hour</p></div>
                <div style={{ textAlign: 'right' }}><p style={{ fontSize: 12, color: '#6B6B6B' }}>Est. total</p><p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#0F0F0F' }}>{worker.currency}{totalEst}</p></div>
              </div>
            </div>

            <div className="submit-card">
              <button className="submit-btn" onClick={() => { if (validate()) setSubmitted(true) }}>
                <FileText size={17} /> Send Booking Request
              </button>
              <div className="submit-trust"><AlertCircle size={13} color="#AFAFAF" />No payment charged yet</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}