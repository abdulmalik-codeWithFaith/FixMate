'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  ChevronLeft, Camera, MapPin, Phone, Mail, Star,
  CheckCircle, Edit3, Save, X, Calendar, Briefcase,
  Clock, Award, ShieldCheck, BookOpen, ChevronRight
} from 'lucide-react'

const ORDERS_SUMMARY = [
  { label: 'Total Jobs',      value: '16',  icon: <Briefcase size={18} color="#FF5C1A" />, bg: '#FFF3EE' },
  { label: 'Completed',       value: '14',  icon: <CheckCircle size={18} color="#16A34A" />, bg: '#F0FDF4' },
  { label: 'Avg Rating Given', value: '4.9', icon: <Star size={18} color="#F59E0B" />,        bg: '#FFF8EE' },
  { label: 'Member Since',    value: 'Jan 2024', icon: <Calendar size={18} color="#2563EB" />, bg: '#EEF6FF' },
]

const recentActivity = [
  { id: 'o3', label: 'Aisha Patel painted living room', date: 'Mar 10', status: 'completed', initials: 'AP', bg: '#F0FDF4', color: '#16A34A' },
  { id: 'o4', label: 'Kenji Tanaka built custom TV unit', date: 'Mar 5',  status: 'completed', initials: 'KT', bg: '#FFF8EE', color: '#D97706' },
  { id: 'o1', label: 'James Mitchell — consumer unit', date: 'Tomorrow', status: 'upcoming',  initials: 'JM', bg: '#FFF3EE', color: '#FF5C1A' },
]

const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
  completed: { bg: '#F0FDF4', color: '#16A34A', label: 'Completed' },
  upcoming:  { bg: '#FFF3EE', color: '#FF5C1A', label: 'Upcoming'  },
  pending:   { bg: '#FFF8EE', color: '#D97706', label: 'Pending'   },
}

const S = `
  .profile-page { min-height: 100vh; background: #F5F4F1; }

  .profile-topbar {
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
  .topbar-edit-btn {
    display: flex; align-items: center; gap: 6px;
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
    color: #6B6B6B; background: none; border: 1.5px solid #E8E6E1;
    border-radius: 9px; padding: 7px 14px; cursor: pointer; transition: all 0.2s;
  }
  .topbar-edit-btn:hover { border-color: #FF5C1A; color: #FF5C1A; }
  .topbar-edit-btn.saving { background: #FF5C1A; border-color: #FF5C1A; color: white; }

  .profile-body { max-width: 760px; margin: 0 auto; padding: 28px 40px; display: flex; flex-direction: column; gap: 20px; }

  /* HERO CARD */
  .hero-card {
    background: white; border: 1px solid #E8E6E1; border-radius: 20px; overflow: hidden;
  }
  .hero-banner {
    height: 100px;
    background: linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 60%, #FF5C1A 200%);
    position: relative;
  }
  .hero-banner-pattern {
    position: absolute; inset: 0;
    background-image: radial-gradient(rgba(255,92,26,0.15) 1px, transparent 1px);
    background-size: 20px 20px;
  }

  .hero-body { padding: 0 28px 28px; }
  .hero-avatar-row { display: flex; align-items: flex-end; justify-content: space-between; margin-top: -36px; margin-bottom: 16px; }
  .hero-avatar-wrap { position: relative; }
  .hero-avatar {
    width: 80px; height: 80px; border-radius: 50%;
    border: 4px solid white; box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px;
  }
  .avatar-camera-btn {
    position: absolute; bottom: 2px; right: 2px;
    width: 26px; height: 26px; border-radius: 50%;
    background: #FF5C1A; border: 2px solid white;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.2s;
  }
  .avatar-camera-btn:hover { background: #FF7A40; }

  .verified-badge {
    display: inline-flex; align-items: center; gap: 5px;
    background: #F0FDF4; border: 1px solid rgba(34,197,94,0.2);
    color: #16A34A; font-family: 'Syne', sans-serif;
    font-size: 12px; font-weight: 600;
    padding: 5px 12px; border-radius: 100px;
  }

  .hero-name { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 26px; letter-spacing: -1px; color: #0F0F0F; margin-bottom: 6px; }
  .hero-meta { display: flex; flex-wrap: wrap; gap: 14px; }
  .hero-meta-item { display: flex; align-items: center; gap: 5px; font-size: 13px; color: #6B6B6B; }

  /* STATS STRIP */
  .stats-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
  .stat-card {
    background: white; border: 1px solid #E8E6E1; border-radius: 14px;
    padding: 16px; display: flex; flex-direction: column; gap: 10px;
  }
  .stat-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
  .stat-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: #0F0F0F; }
  .stat-label { font-size: 12px; color: #6B6B6B; }

  /* EDIT FORM */
  .edit-card { background: white; border: 1px solid #E8E6E1; border-radius: 18px; overflow: hidden; }
  .edit-card-title {
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px;
    color: #0F0F0F; padding: 20px 24px 16px;
    border-bottom: 1px solid #E8E6E1;
    display: flex; align-items: center; gap: 8px;
  }
  .edit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 20px 24px; }
  .edit-field { display: flex; flex-direction: column; gap: 6px; }
  .edit-field.full { grid-column: 1 / -1; }
  .edit-label { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; color: #6B6B6B; text-transform: uppercase; letter-spacing: .5px; }
  .edit-input {
    background: #F5F4F1; border: 1.5px solid #E8E6E1;
    border-radius: 11px; padding: 11px 14px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F;
    outline: none; transition: border-color 0.2s;
  }
  .edit-input:focus { border-color: #FF5C1A; background: white; box-shadow: 0 0 0 3px rgba(255,92,26,0.08); }
  .edit-input::placeholder { color: #AFAFAF; }
  .edit-textarea { min-height: 80px; resize: none; font-family: 'DM Sans', sans-serif; }
  .edit-input-wrap {
    display: flex; align-items: center; gap: 10px;
    background: #F5F4F1; border: 1.5px solid #E8E6E1;
    border-radius: 11px; padding: 11px 14px; transition: border-color 0.2s;
  }
  .edit-input-wrap:focus-within { border-color: #FF5C1A; background: white; box-shadow: 0 0 0 3px rgba(255,92,26,0.08); }
  .edit-input-wrap input {
    flex: 1; border: none; outline: none; background: transparent;
    font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F;
  }
  .edit-input-wrap input::placeholder { color: #AFAFAF; }
  .edit-input-icon { color: #AFAFAF; flex-shrink: 0; }

  /* ACTIVITY */
  .activity-card { background: white; border: 1px solid #E8E6E1; border-radius: 18px; overflow: hidden; }
  .activity-title {
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F;
    padding: 20px 24px 16px; border-bottom: 1px solid #E8E6E1;
    display: flex; align-items: center; justify-content: space-between;
  }
  .activity-view-all {
    display: flex; align-items: center; gap: 4px;
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
    color: #FF5C1A; text-decoration: none; transition: gap 0.2s;
  }
  .activity-view-all:hover { gap: 7px; }
  .activity-item {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 24px; border-bottom: 1px solid #F5F4F1;
    transition: background 0.15s; text-decoration: none; color: inherit;
  }
  .activity-item:last-child { border-bottom: none; }
  .activity-item:hover { background: #FAFAF8; }
  .activity-avatar {
    width: 42px; height: 42px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; flex-shrink: 0;
  }
  .activity-label { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; color: #0F0F0F; margin-bottom: 3px; }
  .activity-meta { display: flex; align-items: center; gap: 8px; }
  .activity-date { font-size: 12px; color: #6B6B6B; display: flex; align-items: center; gap: 3px; }
  .activity-status { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 100px; font-family: 'Syne', sans-serif; }

  /* QUICK LINKS */
  .quick-links { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .quick-link-card {
    background: white; border: 1px solid #E8E6E1; border-radius: 14px;
    padding: 18px 20px; display: flex; align-items: center; gap: 14px;
    text-decoration: none; color: inherit; transition: all 0.2s;
  }
  .quick-link-card:hover { border-color: #FF5C1A; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.07); }
  .ql-icon { width: 40px; height: 40px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .ql-label { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; }
  .ql-sub { font-size: 12px; color: #6B6B6B; margin-top: 2px; }

  @media (max-width: 768px) {
    .profile-topbar { padding: 0 16px; }
    .profile-body { padding: 20px 16px; }
    .stats-strip { grid-template-columns: repeat(2, 1fr); }
    .edit-grid { grid-template-columns: 1fr; }
    .quick-links { grid-template-columns: 1fr; }
  }
`

export default function ProfilePage() {
  const [editing, setEditing] = useState(false)
  const [saved, setSaved]     = useState(false)
  const fileRef               = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name:     'Sarah Adams',
    email:    'sarah.adams@email.com',
    phone:    '+44 7700 900123',
    location: 'London, UK',
    bio:      'Home owner based in London. Love getting things fixed quickly and professionally.',
  })

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }))

  const handleSave = () => {
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <>
      <style>{S}</style>
      <div className="profile-page">

        {saved && (
          <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#0F0F0F', color: 'white', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 12, fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 600, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 100, animation: 'slideUp 0.3s ease' }}>
            <CheckCircle size={16} color="#22C55E" /> Profile saved successfully
          </div>
        )}
        <style>{`@keyframes slideUp { from { transform: translateX(-50%) translateY(20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }`}</style>

        <div className="profile-topbar">
          <Link href="/dashboard" className="topbar-back"><ChevronLeft size={18} /></Link>
          <p className="topbar-title">My Profile</p>
          <button
            className={`topbar-edit-btn${editing ? ' saving' : ''}`}
            onClick={() => editing ? handleSave() : setEditing(true)}
          >
            {editing ? <><Save size={14} /> Save</> : <><Edit3 size={14} /> Edit Profile</>}
          </button>
          {editing && (
            <button
              onClick={() => setEditing(false)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, border: '1.5px solid #E8E6E1', background: 'none', cursor: 'pointer', color: '#6B6B6B', transition: 'all 0.2s', flexShrink: 0 }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="profile-body">

          {/* Hero card */}
          <div className="hero-card">
            <div className="hero-banner"><div className="hero-banner-pattern" /></div>
            <div className="hero-body">
              <div className="hero-avatar-row">
                <div className="hero-avatar-wrap">
                  <div className="hero-avatar" style={{ background: '#FFF3EE', color: '#FF5C1A' }}>SA</div>
                  {editing && (
                    <>
                      <div className="avatar-camera-btn" onClick={() => fileRef.current?.click()}>
                        <Camera size={12} color="white" />
                      </div>
                      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} />
                    </>
                  )}
                </div>
                <div className="verified-badge"><ShieldCheck size={13} /> Verified Client</div>
              </div>

              <h1 className="hero-name">{form.name}</h1>
              <div className="hero-meta">
                <span className="hero-meta-item"><MapPin size={13} color="#AFAFAF" />{form.location}</span>
                <span className="hero-meta-item"><Mail size={13} color="#AFAFAF" />{form.email}</span>
                <span className="hero-meta-item"><Phone size={13} color="#AFAFAF" />{form.phone}</span>
                <span className="hero-meta-item"><Clock size={13} color="#AFAFAF" />Member since Jan 2024</span>
              </div>

              {form.bio && (
                <p style={{ fontSize: 14, color: '#6B6B6B', fontWeight: 300, lineHeight: 1.7, marginTop: 14, maxWidth: 500 }}>{form.bio}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="stats-strip">
            {ORDERS_SUMMARY.map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                <div>
                  <div className="stat-val">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Edit form */}
          {editing && (
            <div className="edit-card">
              <p className="edit-card-title"><Edit3 size={16} color="#FF5C1A" /> Edit Information</p>
              <div className="edit-grid">
                <div className="edit-field">
                  <label className="edit-label">Full Name</label>
                  <input className="edit-input" value={form.name} onChange={set('name')} />
                </div>
                <div className="edit-field">
                  <label className="edit-label">Location</label>
                  <div className="edit-input-wrap">
                    <MapPin size={15} className="edit-input-icon" />
                    <input value={form.location} onChange={set('location')} placeholder="City, Country" />
                  </div>
                </div>
                <div className="edit-field">
                  <label className="edit-label">Email Address</label>
                  <div className="edit-input-wrap">
                    <Mail size={15} className="edit-input-icon" />
                    <input type="email" value={form.email} onChange={set('email')} />
                  </div>
                </div>
                <div className="edit-field">
                  <label className="edit-label">Phone Number</label>
                  <div className="edit-input-wrap">
                    <Phone size={15} className="edit-input-icon" />
                    <input type="tel" value={form.phone} onChange={set('phone')} />
                  </div>
                </div>
                <div className="edit-field full">
                  <label className="edit-label">Bio</label>
                  <textarea className="edit-input edit-textarea" value={form.bio} onChange={set('bio')} placeholder="Tell workers a bit about yourself…" />
                </div>
              </div>
            </div>
          )}

          {/* Recent activity */}
          <div className="activity-card">
            <div className="activity-title">
              Recent Activity
              <Link href="/orders" className="activity-view-all">View all <ChevronRight size={14} /></Link>
            </div>
            {recentActivity.map(a => {
              const st = statusStyle[a.status]
              return (
                <Link key={a.id} href={`/orders/${a.id}`} className="activity-item">
                  <div className="activity-avatar" style={{ background: a.bg, color: a.color }}>{a.initials}</div>
                  <div style={{ flex: 1 }}>
                    <p className="activity-label">{a.label}</p>
                    <div className="activity-meta">
                      <span className="activity-date"><Calendar size={10} />{a.date}</span>
                      <span className="activity-status" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#AFAFAF" />
                </Link>
              )
            })}
          </div>

          {/* Quick links */}
          <div className="quick-links">
            {[
              { href: '/orders',   icon: <BookOpen size={18} color="#FF5C1A" />,    bg: '#FFF3EE', label: 'My Orders',    sub: '16 total bookings'   },
              { href: '/settings', icon: <Award size={18} color="#2563EB" />,        bg: '#EEF6FF', label: 'Settings',     sub: 'Account preferences' },
              { href: '/explore',  icon: <Star size={18} color="#D97706" />,         bg: '#FFF8EE', label: 'Find Workers',  sub: 'Browse 50K+ artisans' },
              { href: '/assistant',icon: <ShieldCheck size={18} color="#16A34A" />,  bg: '#F0FDF4', label: 'AI Assistant',  sub: 'Get instant help'    },
            ].map(q => (
              <Link key={q.href} href={q.href} className="quick-link-card">
                <div className="ql-icon" style={{ background: q.bg }}>{q.icon}</div>
                <div>
                  <p className="ql-label">{q.label}</p>
                  <p className="ql-sub">{q.sub}</p>
                </div>
                <ChevronRight size={15} color="#AFAFAF" style={{ marginLeft: 'auto', flexShrink: 0 }} />
              </Link>
            ))}
          </div>

        </div>
      </div>
    </>
  )
}