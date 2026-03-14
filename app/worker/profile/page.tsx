'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  ChevronLeft, Camera, MapPin, Phone, Mail, Star,
  Edit3, Save, X, CheckCircle, Briefcase, Clock,
  Award, ShieldCheck, Plus, Trash2, Eye, EyeOff,
  TrendingUp, Users, DollarSign, ChevronRight
} from 'lucide-react'

const skillOptions = ['Electrician','Plumber','Carpenter','Painter','Tiler','AC Technician','Generator Technician','Welder','Mason','Glazier']

const S = `
  .wpm-page { min-height: 100vh; background: #F5F4F1; }

  .wpm-topbar {
    background: white; border-bottom: 1px solid #E8E6E1;
    padding: 0 40px; height: 64px;
    display: flex; align-items: center; gap: 14px;
    position: sticky; top: 0; z-index: 40;
  }
  .topbar-back { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; color: #6B6B6B; text-decoration: none; transition: all 0.2s; border: 1.5px solid #E8E6E1; flex-shrink: 0; }
  .topbar-back:hover { border-color: #0F0F0F; color: #0F0F0F; }
  .topbar-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; flex: 1; }
  .topbar-edit-btn { display: flex; align-items: center; gap: 6px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #6B6B6B; background: none; border: 1.5px solid #E8E6E1; border-radius: 9px; padding: 7px 14px; cursor: pointer; transition: all 0.2s; }
  .topbar-edit-btn:hover { border-color: #FF5C1A; color: #FF5C1A; }
  .topbar-edit-btn.saving { background: #FF5C1A; border-color: #FF5C1A; color: white; }
  .topbar-preview { display: flex; align-items: center; gap: 6px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #6B6B6B; background: none; border: 1.5px solid #E8E6E1; border-radius: 9px; padding: 7px 14px; cursor: pointer; transition: all 0.2s; text-decoration: none; }
  .topbar-preview:hover { border-color: #0F0F0F; color: #0F0F0F; }

  .wpm-body { max-width: 860px; margin: 0 auto; padding: 28px 40px; display: flex; flex-direction: column; gap: 20px; }

  /* HERO */
  .hero-card { background: white; border: 1px solid #E8E6E1; border-radius: 20px; overflow: hidden; }
  .hero-banner { height: 110px; background: linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 100%); position: relative; }
  .hero-banner-pattern { position: absolute; inset: 0; background-image: radial-gradient(rgba(255,92,26,0.12) 1px, transparent 1px); background-size: 20px 20px; }
  .hero-body { padding: 0 28px 28px; }
  .hero-avatar-row { display: flex; align-items: flex-end; justify-content: space-between; margin-top: -40px; margin-bottom: 16px; }
  .hero-avatar-wrap { position: relative; }
  .hero-avatar { width: 88px; height: 88px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 20px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 30px; }
  .cam-btn { position: absolute; bottom: 2px; right: 2px; width: 28px; height: 28px; border-radius: 50%; background: #FF5C1A; border: 2px solid white; display: flex; align-items: center; justify-content: center; cursor: pointer; }
  .hero-badges { display: flex; gap: 8px; flex-wrap: wrap; }
  .hero-badge-item { display: inline-flex; align-items: center; gap: 5px; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 100px; }
  .hero-name { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 26px; letter-spacing: -1px; color: #0F0F0F; margin-bottom: 6px; }
  .hero-skill-pill { display: inline-block; background: #FFF3EE; color: #FF5C1A; font-size: 13px; font-weight: 600; padding: 5px 14px; border-radius: 100px; margin-bottom: 10px; }
  .hero-meta { display: flex; flex-wrap: wrap; gap: 14px; }
  .hero-meta-item { display: flex; align-items: center; gap: 5px; font-size: 13px; color: #6B6B6B; }

  /* STATS */
  .stats-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
  .stat-card { background: white; border: 1px solid #E8E6E1; border-radius: 14px; padding: 18px; }
  .stat-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
  .stat-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; color: #0F0F0F; }
  .stat-label { font-size: 12px; color: #6B6B6B; margin-top: 3px; }

  /* SECTION CARD */
  .section-card { background: white; border: 1px solid #E8E6E1; border-radius: 18px; overflow: hidden; }
  .section-card-head { padding: 18px 22px 14px; border-bottom: 1px solid #E8E6E1; display: flex; align-items: center; justify-content: space-between; }
  .section-card-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; display: flex; align-items: center; gap: 8px; }
  .section-card-title-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }

  /* EDIT FIELDS */
  .edit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 20px 22px; }
  .edit-field { display: flex; flex-direction: column; gap: 6px; }
  .edit-field.full { grid-column: 1/-1; }
  .edit-label { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; color: #6B6B6B; text-transform: uppercase; letter-spacing: .5px; }
  .edit-input { background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 11px; padding: 11px 14px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F; outline: none; transition: border-color 0.2s; width: 100%; box-sizing: border-box; }
  .edit-input:focus { border-color: #FF5C1A; background: white; box-shadow: 0 0 0 3px rgba(255,92,26,0.08); }
  .edit-input::placeholder { color: #AFAFAF; }
  .edit-textarea { min-height: 100px; resize: vertical; font-family: 'DM Sans', sans-serif; }
  .edit-input-wrap { display: flex; align-items: center; gap: 10px; background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 11px; padding: 11px 14px; transition: border-color 0.2s; }
  .edit-input-wrap:focus-within { border-color: #FF5C1A; background: white; box-shadow: 0 0 0 3px rgba(255,92,26,0.08); }
  .edit-input-wrap input { flex: 1; border: none; outline: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F; }
  .edit-input-wrap input::placeholder { color: #AFAFAF; }
  .edit-input-icon { color: #AFAFAF; flex-shrink: 0; }

  /* SKILLS */
  .skills-area { padding: 18px 22px; }
  .skills-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
  .skill-pill { display: flex; align-items: center; gap: 6px; background: #FFF3EE; border: 1px solid rgba(255,92,26,0.2); color: #FF5C1A; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; padding: 6px 12px; border-radius: 100px; }
  .skill-pill-remove { background: none; border: none; cursor: pointer; color: rgba(255,92,26,0.5); display: flex; padding: 0; transition: color 0.15s; }
  .skill-pill-remove:hover { color: #EF4444; }
  .add-skill-row { display: flex; gap: 10px; }
  .add-skill-select { flex: 1; background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 11px; padding: 10px 14px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F; outline: none; transition: border-color 0.2s; }
  .add-skill-select:focus { border-color: #FF5C1A; background: white; }
  .add-skill-btn { background: #FF5C1A; color: white; border: none; border-radius: 11px; padding: 10px 18px; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background 0.2s; white-space: nowrap; }
  .add-skill-btn:hover { background: #FF7A40; }

  /* REVIEWS */
  .reviews-list { padding: 8px 22px 18px; display: flex; flex-direction: column; gap: 14px; }
  .review-item { background: #F5F4F1; border-radius: 14px; padding: 16px; }
  .review-top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .review-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; flex-shrink: 0; }
  .review-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; }
  .review-date { font-size: 12px; color: #6B6B6B; }
  .review-stars { display: flex; gap: 2px; margin-left: auto; }
  .review-text { font-size: 13px; color: #6B6B6B; line-height: 1.65; font-weight: 300; }

  /* AVAILABILITY */
  .avail-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 8px; padding: 16px 22px; }
  .day-btn { background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 10px; padding: 10px 6px; text-align: center; cursor: pointer; transition: all 0.2s; }
  .day-btn.on { background: #FF5C1A; border-color: #FF5C1A; }
  .day-label { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; color: #6B6B6B; }
  .day-btn.on .day-label { color: white; }

  /* TOAST */
  .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #0F0F0F; color: white; display: flex; align-items: center; gap: 10px; padding: 12px 20px; border-radius: 12px; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; box-shadow: 0 8px 32px rgba(0,0,0,0.2); z-index: 100; animation: slideUp 0.3s ease; }
  @keyframes slideUp { from { transform: translateX(-50%) translateY(20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }

  @media (max-width: 768px) {
    .wpm-topbar { padding: 0 16px; }
    .wpm-body { padding: 20px 16px; }
    .stats-row { grid-template-columns: repeat(2,1fr); }
    .edit-grid { grid-template-columns: 1fr; }
    .avail-grid { grid-template-columns: repeat(4,1fr); }
  }
`

const reviewsData = [
  { initials: 'SA', name: 'Sarah Adams', date: 'Mar 12, 2025', rating: 5, text: 'James was brilliant. Arrived on time, explained everything clearly and the work was immaculate.', avatarBg: '#EEF6FF', avatarColor: '#2563EB' },
  { initials: 'DK', name: 'David Kim',   date: 'Feb 28, 2025', rating: 5, text: 'Fixed our consumer unit issue in no time. Very professional and reasonably priced.', avatarBg: '#F0FDF4', avatarColor: '#16A34A' },
  { initials: 'MR', name: 'Maria R.',    date: 'Feb 10, 2025', rating: 5, text: 'Had James install EV charger and new lighting. Flawless job, clean and extremely knowledgeable.', avatarBg: '#FFF8EE', avatarColor: '#D97706' },
]

const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

export default function WorkerProfileManage() {
  const [editing, setEditing]       = useState(false)
  const [toast, setToast]           = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const fileRef                     = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name:        'James Mitchell',
    email:       'james@email.com',
    phone:       '+44 7700 900456',
    location:    'London, UK',
    bio:         '9 years installing and repairing wiring, consumer units, and solar systems. Fast, clean work with full compliance certification. Available weekends.',
    experience:  '9 years',
    hourlyRate:  '45',
  })

  const [skills, setSkills]         = useState(['Rewiring', 'Consumer Units', 'EV Chargers', 'Solar Panels', 'Fault Finding', 'CCTV'])
  const [newSkill, setNewSkill]     = useState('')
  const [workDays, setWorkDays]     = useState([true,true,true,true,true,false,false])

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }))

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills(p => [...p, newSkill])
      setNewSkill('')
    }
  }

  const removeSkill = (s: string) => setSkills(p => p.filter(x => x !== s))
  const toggleDay   = (i: number) => setWorkDays(p => { const n = [...p]; n[i] = !n[i]; return n })

  const handleSave = () => {
    setEditing(false)
    setToast(true)
    setTimeout(() => setToast(false), 2500)
  }

  return (
    <>
      <style>{S}</style>
      <div className="wpm-page">

        {toast && (
          <div className="toast">
            <CheckCircle size={16} color="#22C55E" /> Profile updated successfully
          </div>
        )}

        <div className="wpm-topbar">
          <Link href="/worker/dashboard" className="topbar-back"><ChevronLeft size={18} /></Link>
          <p className="topbar-title">My Profile</p>
          <Link href={`/explore/${encodeURIComponent(form.name.toLowerCase().replace(' ', '-'))}`} className="topbar-preview">
            {previewMode ? <><EyeOff size={14} /> Edit View</> : <><Eye size={14} /> Preview</>}
          </Link>
          <button
            className={`topbar-edit-btn${editing ? ' saving' : ''}`}
            onClick={() => editing ? handleSave() : setEditing(true)}
          >
            {editing ? <><Save size={14} /> Save Changes</> : <><Edit3 size={14} /> Edit Profile</>}
          </button>
          {editing && (
            <button onClick={() => setEditing(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, border: '1.5px solid #E8E6E1', background: 'none', cursor: 'pointer', color: '#6B6B6B', transition: 'all 0.2s', flexShrink: 0 }}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="wpm-body">

          {/* Hero */}
          <div className="hero-card">
            <div className="hero-banner"><div className="hero-banner-pattern" /></div>
            <div className="hero-body">
              <div className="hero-avatar-row">
                <div className="hero-avatar-wrap">
                  <div className="hero-avatar" style={{ background: '#FFF3EE', color: '#FF5C1A' }}>JM</div>
                  {editing && (
                    <>
                      <div className="cam-btn" onClick={() => fileRef.current?.click()}>
                        <Camera size={13} color="white" />
                      </div>
                      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} />
                    </>
                  )}
                </div>
                <div className="hero-badges">
                  <span className="hero-badge-item" style={{ background: '#F0FDF4', color: '#16A34A', border: '1px solid rgba(22,163,74,0.2)' }}>
                    <ShieldCheck size={13} /> ID Verified
                  </span>
                  <span className="hero-badge-item" style={{ background: '#FFF3EE', color: '#FF5C1A', border: '1px solid rgba(255,92,26,0.2)' }}>
                    <Award size={13} /> Top Rated
                  </span>
                </div>
              </div>
              <h1 className="hero-name">{form.name}</h1>
              <div className="hero-skill-pill">Electrician · {form.experience} experience</div>
              <div className="hero-meta">
                <span className="hero-meta-item"><MapPin size={13} color="#AFAFAF" />{form.location}</span>
                <span className="hero-meta-item"><Mail size={13} color="#AFAFAF" />{form.email}</span>
                <span className="hero-meta-item"><Phone size={13} color="#AFAFAF" />{form.phone}</span>
                <span className="hero-meta-item"><DollarSign size={13} color="#AFAFAF" />£{form.hourlyRate}/hr</span>
              </div>
              {form.bio && (
                <p style={{ fontSize: 14, color: '#6B6B6B', fontWeight: 300, lineHeight: 1.7, marginTop: 14, maxWidth: 560 }}>{form.bio}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="stats-row">
            {[
              { icon: <Briefcase size={18} color="#FF5C1A" />,   bg: '#FFF3EE', val: '214',  label: 'Total Jobs'       },
              { icon: <Star size={18} color="#F59E0B" />,         bg: '#FFF8EE', val: '4.9',  label: 'Avg Rating'       },
              { icon: <Users size={18} color="#2563EB" />,        bg: '#EEF6FF', val: '68%',  label: 'Repeat Clients'   },
              { icon: <TrendingUp size={18} color="#16A34A" />,   bg: '#F0FDF4', val: '£2.8K',label: 'This Month'       },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                <div className="stat-val">{s.val}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Edit form */}
          {editing && (
            <div className="section-card">
              <div className="section-card-head">
                <p className="section-card-title">
                  <div className="section-card-title-icon" style={{ background: '#FFF3EE' }}><Edit3 size={14} color="#FF5C1A" /></div>
                  Edit Profile Information
                </p>
              </div>
              <div className="edit-grid">
                <div className="edit-field">
                  <label className="edit-label">Full Name</label>
                  <input className="edit-input" value={form.name} onChange={set('name')} />
                </div>
                <div className="edit-field">
                  <label className="edit-label">Hourly Rate (£)</label>
                  <div className="edit-input-wrap">
                    <DollarSign size={15} className="edit-input-icon" />
                    <input type="number" value={form.hourlyRate} onChange={set('hourlyRate')} placeholder="45" />
                  </div>
                </div>
                <div className="edit-field">
                  <label className="edit-label">Email</label>
                  <div className="edit-input-wrap">
                    <Mail size={15} className="edit-input-icon" />
                    <input type="email" value={form.email} onChange={set('email')} />
                  </div>
                </div>
                <div className="edit-field">
                  <label className="edit-label">Phone</label>
                  <div className="edit-input-wrap">
                    <Phone size={15} className="edit-input-icon" />
                    <input type="tel" value={form.phone} onChange={set('phone')} />
                  </div>
                </div>
                <div className="edit-field">
                  <label className="edit-label">Location</label>
                  <div className="edit-input-wrap">
                    <MapPin size={15} className="edit-input-icon" />
                    <input value={form.location} onChange={set('location')} placeholder="City, Country" />
                  </div>
                </div>
                <div className="edit-field">
                  <label className="edit-label">Years of Experience</label>
                  <div className="edit-input-wrap">
                    <Clock size={15} className="edit-input-icon" />
                    <input value={form.experience} onChange={set('experience')} placeholder="e.g. 9 years" />
                  </div>
                </div>
                <div className="edit-field full">
                  <label className="edit-label">Bio / Description</label>
                  <textarea className="edit-input edit-textarea" value={form.bio} onChange={set('bio')} placeholder="Describe your skills and what clients can expect…" />
                </div>
              </div>
            </div>
          )}

          {/* Skills */}
          <div className="section-card">
            <div className="section-card-head">
              <p className="section-card-title">
                <div className="section-card-title-icon" style={{ background: '#FFF3EE' }}><Award size={14} color="#FF5C1A" /></div>
                Skills &amp; Specialisms
              </p>
            </div>
            <div className="skills-area">
              <div className="skills-pills">
                {skills.map(s => (
                  <div key={s} className="skill-pill">
                    {s}
                    {editing && (
                      <button className="skill-pill-remove" onClick={() => removeSkill(s)}><X size={12} /></button>
                    )}
                  </div>
                ))}
              </div>
              {editing && (
                <div className="add-skill-row">
                  <select className="add-skill-select" value={newSkill} onChange={e => setNewSkill(e.target.value)}>
                    <option value="">Select skill to add…</option>
                    {skillOptions.filter(s => !skills.includes(s)).map(s => <option key={s}>{s}</option>)}
                  </select>
                  <button className="add-skill-btn" onClick={addSkill} disabled={!newSkill}>
                    <Plus size={15} /> Add Skill
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Availability */}
          <div className="section-card">
            <div className="section-card-head">
              <p className="section-card-title">
                <div className="section-card-title-icon" style={{ background: '#F0FDF4' }}><Clock size={14} color="#16A34A" /></div>
                Work Schedule
              </p>
              {!editing && (
                <span style={{ fontSize: 13, color: '#6B6B6B' }}>
                  {workDays.filter(Boolean).length} days/week
                </span>
              )}
            </div>
            <div className="avail-grid">
              {days.map((d, i) => (
                <div
                  key={d}
                  className={`day-btn ${workDays[i] ? 'on' : ''}`}
                  onClick={() => editing && toggleDay(i)}
                  style={{ cursor: editing ? 'pointer' : 'default' }}
                >
                  <p className="day-label">{d}</p>
                  <div style={{ marginTop: 4, display: 'flex', justifyContent: 'center' }}>
                    {workDays[i]
                      ? <CheckCircle size={13} color={editing ? 'white' : '#FF5C1A'} />
                      : <X size={13} color="#AFAFAF" />
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="section-card">
            <div className="section-card-head">
              <p className="section-card-title">
                <div className="section-card-title-icon" style={{ background: '#FFF8EE' }}><Star size={14} color="#D97706" /></div>
                Client Reviews
                <span style={{ fontSize: 13, fontWeight: 400, color: '#6B6B6B', fontFamily: 'DM Sans, sans-serif' }}> · 4.9 avg</span>
              </p>
              <Link href="/worker/reviews" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#FF5C1A', textDecoration: 'none' }}>
                View all <ChevronRight size={14} />
              </Link>
            </div>
            <div className="reviews-list">
              {reviewsData.map(r => (
                <div key={r.name} className="review-item">
                  <div className="review-top">
                    <div className="review-avatar" style={{ background: r.avatarBg, color: r.avatarColor }}>{r.initials}</div>
                    <div>
                      <p className="review-name">{r.name}</p>
                      <p className="review-date">{r.date}</p>
                    </div>
                    <div className="review-stars">
                      {[...Array(r.rating)].map((_,i) => <Star key={i} size={13} color="#F59E0B" fill="#F59E0B" />)}
                    </div>
                  </div>
                  <p className="review-text">{r.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}