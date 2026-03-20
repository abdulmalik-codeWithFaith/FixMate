'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import {
  ChevronLeft, MapPin, Star, Calendar, Clock,
  FileText, CheckCircle, AlertCircle, Navigation, Lock, Loader2
} from 'lucide-react'

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
  .book-topbar { background: white; border-bottom: 1px solid #E8E6E1; padding: 0 40px; height: 64px; display: flex; align-items: center; gap: 16px; position: sticky; top: 0; z-index: 40; }
  .back-link { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; color: #6B6B6B; text-decoration: none; border: 1.5px solid #E8E6E1; flex-shrink: 0; }
  .book-page-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; }
  .book-body { max-width: 960px; margin: 0 auto; padding: 32px 40px; display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
  .book-card { background: white; border: 1px solid #E8E6E1; border-radius: 20px; overflow: hidden; }
  .book-section { padding: 28px; border-bottom: 1px solid #E8E6E1; }
  .book-section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; }
  .book-section-num { width: 26px; height: 26px; border-radius: 50%; background: #FF5C1A; color: white; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px; display: flex; align-items: center; justify-content: center; }
  .field { margin-bottom: 16px; }
  .field-label { display: block; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #0F0F0F; margin-bottom: 6px; }
  .field-label span { color: #FF5C1A; }
  .field-input { width: 100%; background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 12px; padding: 12px 16px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F; outline: none; box-sizing: border-box; }
  .field-input:focus { border-color: #FF5C1A; background: white; box-shadow: 0 0 0 3px rgba(255,92,26,0.08); }
  .field-textarea { min-height: 100px; resize: vertical; }
  .field-icon-wrap { position: relative; }
  .field-icon-inner { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #AFAFAF; pointer-events: none; }
  .field-error { border-color: #EF4444 !important; }
  .error-msg { font-size: 12px; color: #EF4444; margin-top: 4px; }
  .time-slots { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
  .time-slot { background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 9px; padding: 9px 4px; text-align: center; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; color: #6B6B6B; cursor: pointer; transition: all 0.2s; }
  .time-slot.selected { background: #FF5C1A; border-color: #FF5C1A; color: white; }
  .price-wrap { position: relative; }
  .price-prefix { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-family: 'Syne', sans-serif; font-weight: 700; color: #0F0F0F; font-size: 15px; pointer-events: none; }
  .price-wrap input { padding-left: 30px; }
  .book-sidebar { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 80px; }
  .worker-summary { background: white; border: 1px solid #E8E6E1; border-radius: 20px; padding: 24px; }
  .ws-top { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid #E8E6E1; }
  .ws-avatar { width: 54px; height: 54px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 19px; flex-shrink: 0; }
  .ws-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; }
  .ws-skill { display: inline-block; font-size: 11px; font-weight: 600; background: #FFF3EE; color: #FF5C1A; padding: 3px 9px; border-radius: 100px; margin: 3px 0; }
  .ws-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
  .ws-row-label { color: #6B6B6B; display: flex; align-items: center; gap: 6px; }
  .ws-price-big { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 26px; color: #FF5C1A; }
  .submit-card { background: white; border: 1px solid #E8E6E1; border-radius: 20px; padding: 24px; }
  .submit-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; background: #FF5C1A; color: white; font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 600; border: none; border-radius: 12px; padding: 15px; cursor: pointer; transition: all 0.2s; }
  .success-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); }
  .success-modal { background: white; border-radius: 24px; padding: 48px 40px; max-width: 420px; width: 100%; text-align: center; }
  @media (max-width: 860px) { .book-body { grid-template-columns: 1fr; padding: 20px 16px; } .book-sidebar { position: static; } }
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

  const totalEst = proposedPrice ? Number(proposedPrice) : worker.price;

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F4F1' }}>
        <Loader2 className="animate-spin" color="#FF5C1A" size={40} />
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <style>{S}</style>
        <div className="book-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="book-card" style={{ padding: 40, maxWidth: 400, textAlign: 'center' }}>
            <div style={{ background: '#FFF3EE', width: 64, height: 64, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Lock size={32} color="#FF5C1A" />
            </div>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, marginBottom: 10 }}>Login Required</h2>
            <p style={{ color: '#6B6B6B', fontSize: 14, marginBottom: 32 }}>Please sign in to book <strong>{worker.name}</strong>.</p>
            <Link href="/login" className="submit-btn" style={{textDecoration:'none'}}>Login to Continue</Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{S}</style>
      <div className="book-page">
        {submitted && (
          <div className="success-overlay">
            <div className="success-modal">
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#F0FDF4', border: '3px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle size={40} color="#22C55E" />
              </div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 24, marginBottom: 10 }}>Booking Sent!</h2>
              <p style={{ color: '#6B6B6B', lineHeight: 1.7, marginBottom: 28 }}>Your request for <strong>{worker.skill}</strong> services has been sent.</p>
              <Link href="/orders" className="submit-btn" style={{textDecoration:'none'}}>View My Orders</Link>
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
                  placeholder="Describe what needs to be done..."
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
              <p className="book-section-title"><span className="book-section-num">2</span>Location</p>
              <div className="field">
                <label className="field-label">Service Address <span>*</span></label>
                <div className="field-icon-wrap">
                  <Navigation size={15} className="field-icon-inner" />
                  <input type="text" className={`field-input${errors.location ? ' field-error' : ''}`} style={{ paddingLeft: 42 }} placeholder="Job address" value={location}
                    onChange={e => { setLocation(e.target.value); setErrors(p => ({ ...p, location: '' })) }}
                  />
                </div>
                {errors.location && <p className="error-msg">{errors.location}</p>}
              </div>
            </div>

            <div className="book-section">
              <p className="book-section-title"><span className="book-section-num">3</span>Schedule</p>
              <div className="field">
                <label className="field-label">Preferred date <span>*</span></label>
                <div className="field-icon-wrap">
                  <Calendar size={15} className="field-icon-inner" />
                  <input type="date" className={`field-input${errors.date ? ' field-error' : ''}`} style={{ paddingLeft: 42 }} value={date}
                    onChange={e => { setDate(e.target.value); setErrors(p => ({ ...p, date: '' })) }}
                  />
                </div>
              </div>
              <div className="field">
                <label className="field-label">Arrival time <span>*</span></label>
                <div className="time-slots">
                  {timeSlots.map(t => (
                    <div key={t} className={`time-slot${selectedTime === t ? ' selected' : ''}`} onClick={() => { setSelectedTime(t); setErrors(p => ({ ...p, time: '' })) }}>{t}</div>
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
              <div style={{ height: 1, background: '#E8E6E1', margin: '14px 0' }} />
              <div><p className="ws-price-big">{worker.currency}{totalEst}</p><p style={{fontSize: 12, color: '#6B6B6B'}}>Estimated Total</p></div>
            </div>

            <div className="submit-card">
              <button className="submit-btn" onClick={() => { if (validate()) setSubmitted(true) }}>
                <FileText size={17} /> Send Booking Request
              </button>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, color: '#6B6B6B', marginTop: 12 }}>
                <AlertCircle size={13} color="#AFAFAF" /> No payment yet
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}