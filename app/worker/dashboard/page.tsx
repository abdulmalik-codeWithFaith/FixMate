'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Bell, ChevronRight, MapPin, Star, Clock,
  CheckCircle, XCircle, Briefcase, TrendingUp,
  MessageCircle, Sparkles, User, Settings,
  LogOut, BookOpen, ToggleLeft, ToggleRight,
  DollarSign, Calendar, AlertCircle
} from 'lucide-react'

const jobRequests = [
  { id: 'j1', client: 'Sarah Adams',  initials: 'SA', avatarBg: '#EEF6FF', avatarColor: '#2563EB', skill: 'Electrician', desc: 'Consumer unit replacement — full rewire safety check. Hager unit, approx 10 years old.', location: '12 Baker St, London', date: 'Tomorrow, 2:00 PM', budget: '£90', status: 'new' },
  { id: 'j2', client: 'Tom Richards', initials: 'TR', avatarBg: '#F0FDF4', avatarColor: '#16A34A', skill: 'Electrician', desc: 'Install 3 double sockets in the garage and run a dedicated circuit from consumer unit.', location: '44 Regent Park, London', date: 'Mar 18, 10:00 AM', budget: '£120', status: 'new' },
  { id: 'j3', client: 'Lisa Wang',    initials: 'LW', avatarBg: '#FFF8EE', avatarColor: '#D97706', skill: 'Electrician', desc: 'LED downlights installation in kitchen and living room. 12 units total.', location: '9 Marble Arch, London', date: 'Mar 20, 9:00 AM', budget: '£150', status: 'new' },
]

const activeJobs = [
  { id: 'a1', client: 'Emma Clarke', initials: 'EC', avatarBg: '#FFF3EE', avatarColor: '#FF5C1A', desc: 'EV charger installation — driveway', location: 'Fulham, London', date: 'Today, 11:00 AM', price: '£180', status: 'ongoing' },
]

const completedJobs = [
  { id: 'c1', client: 'James P.',   initials: 'JP', avatarBg: '#EEF6FF', avatarColor: '#2563EB', desc: 'Full house rewire',          date: 'Mar 10', price: '£420', rating: 5   },
  { id: 'c2', client: 'Anya K.',    initials: 'AK', avatarBg: '#F0FDF4', avatarColor: '#16A34A', desc: 'Consumer unit upgrade',      date: 'Mar 6',  price: '£90',  rating: 5   },
  { id: 'c3', client: 'Mike D.',    initials: 'MD', avatarBg: '#F5F0FF', avatarColor: '#7C3AED', desc: 'CCTV system installation',   date: 'Mar 1',  price: '£200', rating: 4.5 },
]

const S = `
  .wd-page { min-height: 100vh; background: #F5F4F1; }

  /* TOPBAR */
  .wd-topbar {
    background: white; border-bottom: 1px solid #E8E6E1;
    padding: 0 40px; height: 64px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    position: sticky; top: 0; z-index: 40;
  }
  .wd-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
  .wd-logo-icon { width: 30px; height: 30px; background: #FF5C1A; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
  .wd-logo-text { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: #0F0F0F; }
  .wd-logo-text span { color: #FF5C1A; }
  .wd-topbar-center { display: flex; align-items: center; gap: 8px; }
  .wd-availability-toggle {
    display: flex; align-items: center; gap: 8px;
    background: #F5F4F1; border: 1.5px solid #E8E6E1;
    border-radius: 100px; padding: 6px 14px; cursor: pointer; transition: all 0.2s;
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
  }
  .wd-availability-toggle.available { background: #F0FDF4; border-color: rgba(22,163,74,0.3); color: #16A34A; }
  .wd-availability-toggle.unavailable { background: #F5F4F1; color: #6B6B6B; border-color: #E8E6E1; }
  .avail-dot { width: 8px; height: 8px; border-radius: 50%; }
  .wd-topbar-right { display: flex; align-items: center; gap: 10px; }
  .wd-icon-btn {
    width: 38px; height: 38px; border-radius: 10px;
    background: #F5F4F1; border: 1px solid #E8E6E1;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; position: relative; transition: all 0.2s; color: #6B6B6B;
    text-decoration: none;
  }
  .wd-icon-btn:hover { border-color: #FF5C1A; color: #FF5C1A; }
  .notif-badge { position: absolute; top: -4px; right: -4px; width: 16px; height: 16px; border-radius: 50%; background: #FF5C1A; border: 2px solid white; font-size: 9px; font-weight: 700; color: white; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; }
  .wd-avatar { width: 38px; height: 38px; border-radius: 10px; background: #FFF3EE; color: #FF5C1A; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 2px solid #FF5C1A; transition: all 0.2s; }
  .wd-avatar:hover { background: #FF5C1A; color: white; }

  .wd-body { max-width: 1200px; margin: 0 auto; padding: 28px 40px; display: flex; flex-direction: column; gap: 28px; }

  /* EARNINGS HERO */
  .earnings-hero {
    background: #0F0F0F; border-radius: 22px; padding: 36px 44px;
    position: relative; overflow: hidden;
    display: grid; grid-template-columns: 1fr auto; gap: 40px; align-items: center;
  }
  .earnings-glow { position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(255,92,26,0.18) 0%, transparent 70%); pointer-events: none; }
  .earnings-label { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; color: rgba(255,92,26,0.8); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px; position: relative; }
  .earnings-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(36px,5vw,52px); color: white; letter-spacing: -2px; margin-bottom: 6px; position: relative; }
  .earnings-val em { color: #FF5C1A; font-style: normal; }
  .earnings-sub { font-size: 14px; color: rgba(255,255,255,0.45); font-weight: 300; position: relative; }
  .earnings-stats { display: flex; gap: 12px; flex-shrink: 0; }
  .e-stat { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 18px 20px; text-align: center; min-width: 90px; }
  .e-stat-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: white; }
  .e-stat-val em { color: #FF5C1A; font-style: normal; }
  .e-stat-label { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 3px; }

  /* SECTION */
  .section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; color: #0F0F0F; }
  .section-count { font-size: 12px; font-weight: 700; padding: 3px 9px; border-radius: 100px; font-family: 'Syne', sans-serif; }
  .section-link { display: flex; align-items: center; gap: 4px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #FF5C1A; text-decoration: none; transition: gap 0.2s; }
  .section-link:hover { gap: 7px; }

  /* JOB REQUEST CARD */
  .request-card {
    background: white; border: 1px solid #E8E6E1; border-radius: 18px; overflow: hidden;
    transition: all 0.2s;
  }
  .request-card:hover { border-color: #FF5C1A; box-shadow: 0 4px 20px rgba(0,0,0,0.07); }
  .request-card.new-job { border-left: 3px solid #FF5C1A; }
  .request-main { padding: 20px 22px; display: flex; gap: 14px; align-items: flex-start; }
  .req-avatar { width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; flex-shrink: 0; }
  .req-info { flex: 1; min-width: 0; }
  .req-client { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; margin-bottom: 5px; }
  .req-desc { font-size: 13px; color: #6B6B6B; line-height: 1.6; font-weight: 300; margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .req-meta { display: flex; flex-wrap: wrap; gap: 10px; }
  .req-meta-item { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #6B6B6B; }
  .req-budget { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: #0F0F0F; flex-shrink: 0; }
  .req-new-badge { display: inline-flex; align-items: center; gap: 5px; background: #FFF3EE; border: 1px solid rgba(255,92,26,0.2); color: #FF5C1A; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 100px; margin-bottom: 8px; }
  .request-footer { border-top: 1px solid #E8E6E1; padding: 14px 22px; display: flex; gap: 10px; background: #FAFAF8; }
  .accept-btn { display: flex; align-items: center; justify-content: center; gap: 7px; flex: 1; background: #FF5C1A; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; border: none; border-radius: 10px; padding: 11px; cursor: pointer; transition: all 0.2s; }
  .accept-btn:hover { background: #FF7A40; }
  .decline-btn { display: flex; align-items: center; justify-content: center; gap: 7px; background: transparent; color: #6B6B6B; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; border: 1.5px solid #E8E6E1; border-radius: 10px; padding: 11px 20px; cursor: pointer; transition: all 0.2s; }
  .decline-btn:hover { border-color: #EF4444; color: #EF4444; background: #FEF2F2; }
  .msg-btn { display: flex; align-items: center; justify-content: center; gap: 6px; background: transparent; color: #6B6B6B; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; border: 1.5px solid #E8E6E1; border-radius: 10px; padding: 11px 16px; cursor: pointer; transition: all 0.2s; text-decoration: none; }
  .msg-btn:hover { border-color: #0F0F0F; color: #0F0F0F; }

  /* ACTIVE JOB */
  .active-job-card { background: white; border: 1.5px solid #FF5C1A; border-radius: 18px; overflow: hidden; }
  .active-job-banner { background: linear-gradient(90deg, #FF5C1A, #FF7A40); padding: 10px 20px; display: flex; align-items: center; gap: 8px; }
  .active-job-banner-text { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: white; }
  .active-job-body { padding: 18px 22px; display: flex; gap: 14px; align-items: center; }
  .aj-avatar { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 17px; flex-shrink: 0; }
  .aj-info { flex: 1; }
  .aj-desc { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; margin-bottom: 6px; }
  .aj-meta { display: flex; gap: 12px; flex-wrap: wrap; }
  .aj-meta-item { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #6B6B6B; }
  .aj-price { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: #0F0F0F; }
  .active-job-footer { border-top: 1px solid #E8E6E1; padding: 14px 22px; display: flex; gap: 10px; background: #FFFBF9; }
  .complete-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; background: #0F0F0F; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; border: none; border-radius: 10px; padding: 12px; cursor: pointer; transition: background 0.2s; }
  .complete-btn:hover { background: #1A1A1A; }

  /* COMPLETED */
  .completed-list { display: flex; flex-direction: column; gap: 12px; }
  .completed-card { background: white; border: 1px solid #E8E6E1; border-radius: 14px; padding: 16px 20px; display: flex; align-items: center; gap: 14px; transition: all 0.2s; }
  .completed-card:hover { border-color: #E8E6E1; box-shadow: 0 3px 14px rgba(0,0,0,0.06); }
  .comp-avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; flex-shrink: 0; }
  .comp-desc { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; color: #0F0F0F; margin-bottom: 4px; }
  .comp-meta { display: flex; align-items: center; gap: 10px; }
  .comp-date { font-size: 12px; color: #6B6B6B; display: flex; align-items: center; gap: 3px; }
  .comp-rating { display: flex; align-items: center; gap: 3px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #0F0F0F; }
  .comp-price { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; margin-left: auto; }

  /* QUICK STATS */
  .quick-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
  .qs-card { background: white; border: 1px solid #E8E6E1; border-radius: 14px; padding: 18px; }
  .qs-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
  .qs-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; color: #0F0F0F; }
  .qs-label { font-size: 12px; color: #6B6B6B; margin-top: 3px; }

  @media (max-width: 900px) {
    .wd-topbar { padding: 0 16px; }
    .wd-body { padding: 20px 16px; }
    .earnings-hero { grid-template-columns: 1fr; padding: 28px 24px; gap: 20px; }
    .earnings-stats { display: grid; grid-template-columns: repeat(3,1fr); }
    .quick-stats { grid-template-columns: repeat(2,1fr); }
    .wd-topbar-center { display: none; }
  }
  @media (max-width: 500px) {
    .quick-stats { grid-template-columns: 1fr 1fr; }
    .request-main { flex-wrap: wrap; }
  }
`

export default function WorkerDashboard() {
  const [available, setAvailable]         = useState(true)
  const [requests, setRequests]           = useState(jobRequests)
  const [showUserMenu, setShowUserMenu]   = useState(false)

  const handleAccept  = (id: string) => setRequests(p => p.filter(j => j.id !== id))
  const handleDecline = (id: string) => setRequests(p => p.filter(j => j.id !== id))

  return (
    <>
      <style>{S}</style>
      <div className="wd-page">

        <div className="wd-topbar">
          <Link href="/" className="wd-logo">
            <div className="wd-logo-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M13.78 15.3 19.78 21.3 21.89 19.14 15.89 13.14 13.78 15.3M17.5 10.1C17.11 10.1 16.69 10.05 16.36 9.96L4.97 21.25 2.86 19.14 8 14 6 12 7.07 10.93 9.15 13 10.09 12.06 8 10 9.07 8.93 11.15 11 12.09 10.06 10 8 11.07 6.93 13.15 9 14.3 7.85C14.1 7.31 14 6.71 14 6.1 14 3.32 16.24 1.1 19.02 1.1 19.72 1.1 20.34 1.27 20.95 1.52L18.31 4.16 19.95 5.79 22.59 3.15C22.84 3.75 23 4.37 23 5.07 23 7.85 20.78 10.07 18 10.07L17.5 10.1Z"/></svg>
            </div>
            <span className="wd-logo-text">Fix<span>Mate</span></span>
          </Link>

          <div className="wd-topbar-center">
            <button
              className={`wd-availability-toggle ${available ? 'available' : 'unavailable'}`}
              onClick={() => setAvailable(!available)}
            >
              {available
                ? <><ToggleRight size={16} /><div className="avail-dot" style={{ background: '#22C55E' }} />Available for jobs</>
                : <><ToggleLeft size={16} /><div className="avail-dot" style={{ background: '#AFAFAF' }} />Not available</>
              }
            </button>
          </div>

          <div className="wd-topbar-right">
            <Link href="/worker/notifications" className="wd-icon-btn">
              <Bell size={17} />
              <div className="notif-badge">5</div>
            </Link>
            <div className="wd-avatar" onClick={() => setShowUserMenu(!showUserMenu)}>JM</div>
            {showUserMenu && (
              <div style={{ position: 'absolute', top: 68, right: 40, background: 'white', border: '1px solid #E8E6E1', borderRadius: 14, padding: 8, minWidth: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 100 }}>
                <div style={{ padding: '10px 14px 8px' }}>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: '#0F0F0F' }}>James Mitchell</p>
                  <p style={{ fontSize: 12, color: '#6B6B6B' }}>james@email.com</p>
                </div>
                <div style={{ height: 1, background: '#E8E6E1', margin: '6px 0' }} />
                {[
                  { icon: <User size={15} color="#6B6B6B" />,     label: 'My Profile',   href: '/worker/profile'   },
                  { icon: <BookOpen size={15} color="#6B6B6B" />,  label: 'Job History',  href: '/worker/jobs'      },
                  { icon: <Settings size={15} color="#6B6B6B" />,  label: 'Settings',     href: '/worker/settings'  },
                ].map(item => (
                  <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 9, fontSize: 14, color: '#0F0F0F', textDecoration: 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F5F4F1')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => setShowUserMenu(false)}>
                    {item.icon} {item.label}
                  </Link>
                ))}
                <div style={{ height: 1, background: '#E8E6E1', margin: '6px 0' }} />
                <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 9, fontSize: 14, color: '#EF4444', textDecoration: 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => setShowUserMenu(false)}>
                  <LogOut size={15} color="#EF4444" /> Sign Out
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="wd-body">

          {/* Earnings hero */}
          <div className="earnings-hero">
            <div className="earnings-glow" />
            <div>
              <p className="earnings-label">This Month&apos;s Earnings</p>
              <p className="earnings-val">£2,<em>840</em></p>
              <p className="earnings-sub">14 jobs completed · +18% vs last month</p>
            </div>
            <div className="earnings-stats">
              {[
                { val: '14',  em: '',  label: 'Jobs Done'    },
                { val: '4.9', em: '★', label: 'Avg Rating'   },
                { val: '99',  em: '%', label: 'Completion'   },
              ].map(s => (
                <div key={s.label} className="e-stat">
                  <div className="e-stat-val">{s.val}<em>{s.em}</em></div>
                  <div className="e-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="quick-stats">
            {[
              { icon: <AlertCircle size={18} color="#FF5C1A" />, bg: '#FFF3EE', val: requests.length.toString(), label: 'New Requests'    },
              { icon: <Clock size={18} color="#2563EB" />,       bg: '#EEF6FF', val: activeJobs.length.toString(), label: 'Active Jobs'   },
              { icon: <DollarSign size={18} color="#16A34A" />,  bg: '#F0FDF4', val: '£840',                      label: 'This Week'     },
              { icon: <TrendingUp size={18} color="#7C3AED" />,  bg: '#F5F0FF', val: '68%',                       label: 'Repeat Clients'},
            ].map(s => (
              <div key={s.label} className="qs-card">
                <div className="qs-icon" style={{ background: s.bg }}>{s.icon}</div>
                <div className="qs-val">{s.val}</div>
                <div className="qs-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Active job */}
          {activeJobs.length > 0 && (
            <div>
              <div className="section-head">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <p className="section-title">Active Job</p>
                  <span className="section-count" style={{ background: '#FFF3EE', color: '#FF5C1A' }}>{activeJobs.length}</span>
                </div>
              </div>
              {activeJobs.map(job => (
                <div key={job.id} className="active-job-card">
                  <div className="active-job-banner">
                    <Clock size={14} color="white" />
                    <p className="active-job-banner-text">In Progress · {job.date}</p>
                  </div>
                  <div className="active-job-body">
                    <div className="aj-avatar" style={{ background: job.avatarBg, color: job.avatarColor }}>{job.initials}</div>
                    <div className="aj-info">
                      <p className="aj-desc">{job.desc}</p>
                      <div className="aj-meta">
                        <span className="aj-meta-item"><User size={11} />{job.client}</span>
                        <span className="aj-meta-item"><MapPin size={11} />{job.location}</span>
                      </div>
                    </div>
                    <p className="aj-price">{job.price}</p>
                  </div>
                  <div className="active-job-footer">
                    <button className="complete-btn">
                      <CheckCircle size={16} /> Mark as Completed
                    </button>
                    <Link href={`/chat/${job.id}`} className="msg-btn">
                      <MessageCircle size={15} /> Chat
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Job Requests */}
          <div>
            <div className="section-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <p className="section-title">New Job Requests</p>
                {requests.length > 0 && (
                  <span className="section-count" style={{ background: '#FFF3EE', color: '#FF5C1A' }}>{requests.length}</span>
                )}
              </div>
              <Link href="/worker/jobs" className="section-link">View all <ChevronRight size={14} /></Link>
            </div>

            {requests.length === 0 ? (
              <div style={{ background: 'white', border: '1px solid #E8E6E1', borderRadius: 18, padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, background: '#F5F4F1', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Briefcase size={26} color="#AFAFAF" />
                </div>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#0F0F0F', marginBottom: 8 }}>No new requests</p>
                <p style={{ fontSize: 14, color: '#6B6B6B', fontWeight: 300 }}>New job requests will appear here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {requests.map(job => (
                  <div key={job.id} className="request-card new-job">
                    <div className="request-main">
                      <div className="req-avatar" style={{ background: job.avatarBg, color: job.avatarColor }}>{job.initials}</div>
                      <div className="req-info">
                        <div className="req-new-badge"><AlertCircle size={10} /> New Request</div>
                        <p className="req-client">{job.client}</p>
                        <p className="req-desc">{job.desc}</p>
                        <div className="req-meta">
                          <span className="req-meta-item"><MapPin size={11} />{job.location}</span>
                          <span className="req-meta-item"><Calendar size={11} />{job.date}</span>
                        </div>
                      </div>
                      <p className="req-budget">{job.budget}</p>
                    </div>
                    <div className="request-footer">
                      <button className="accept-btn" onClick={() => handleAccept(job.id)}>
                        <CheckCircle size={15} /> Accept Job
                      </button>
                      <Link href={`/chat/${job.id}`} className="msg-btn"><MessageCircle size={15} /> Chat</Link>
                      <button className="decline-btn" onClick={() => handleDecline(job.id)}>
                        <XCircle size={15} /> Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Jobs */}
          <div>
            <div className="section-head">
              <p className="section-title">Recent Completed Jobs</p>
              <Link href="/worker/jobs" className="section-link">View all <ChevronRight size={14} /></Link>
            </div>
            <div className="completed-list">
              {completedJobs.map(job => (
                <div key={job.id} className="completed-card">
                  <div className="comp-avatar" style={{ background: job.avatarBg, color: job.avatarColor }}>{job.initials}</div>
                  <div style={{ flex: 1 }}>
                    <p className="comp-desc">{job.desc}</p>
                    <div className="comp-meta">
                      <span className="comp-date"><Calendar size={10} />{job.date}</span>
                      <span className="comp-rating"><Star size={12} color="#F59E0B" fill="#F59E0B" />{job.rating}</span>
                    </div>
                  </div>
                  <p className="comp-price">{job.price}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}