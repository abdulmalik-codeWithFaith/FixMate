'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search, MapPin, Star, Bell, ChevronRight,
  Wrench, Zap, Hammer, Wind, Paintbrush, Settings,
  Clock, CheckCircle, TrendingUp, Layers, Sparkles,
  LogOut, User, BookOpen
} from 'lucide-react'

const recentBookings = [
  { id: 'b1', worker: 'James Mitchell', skill: 'Electrician', date: 'Today, 2:00 PM',  status: 'upcoming',  price: '£90',    initials: 'JM', avatarBg: '#FFF3EE', avatarColor: '#FF5C1A' },
  { id: 'b2', worker: 'Carlos Rivera',  skill: 'Plumber',     date: 'Yesterday',        status: 'completed', price: '$120',   initials: 'CR', avatarBg: '#EEF6FF', avatarColor: '#2563EB' },
  { id: 'b3', worker: 'Aisha Patel',    skill: 'Painter',     date: 'Mar 10',           status: 'completed', price: 'AED 320',initials: 'AP', avatarBg: '#F0FDF4', avatarColor: '#16A34A' },
]

const recommended = [
  { id: 'james-mitchell', initials: 'JM', name: 'James Mitchell', skill: 'Electrician', location: 'London, UK',   rating: 4.9, price: '£45/hr',    jobs: 214, avatarBg: '#FFF3EE', avatarColor: '#FF5C1A', available: true  },
  { id: 'aisha-patel',    initials: 'AP', name: 'Aisha Patel',    skill: 'Painter',     location: 'Dubai, UAE',   rating: 5.0, price: 'AED 80/hr', jobs: 302, avatarBg: '#F0FDF4', avatarColor: '#16A34A', available: true  },
  { id: 'marco-rossi',    initials: 'MR', name: 'Marco Rossi',    skill: 'Carpenter',   location: 'Milan, Italy', rating: 4.7, price: '€65/hr',    jobs: 211, avatarBg: '#FFF8EE', avatarColor: '#D97706', available: true  },
  { id: 'priya-sharma',   initials: 'PS', name: 'Priya Sharma',   skill: 'Technician',  location: 'Mumbai, IN',   rating: 4.8, price: '$25/hr',    jobs: 267, avatarBg: '#F5F0FF', avatarColor: '#7C3AED', available: false },
]

const nearby = [
  { id: 'david-okonkwo', initials: 'DO', name: 'David Okonkwo', skill: 'Electrician', distance: '1.2 km', rating: 4.7, price: '$20/hr', avatarBg: '#FFF3EE', avatarColor: '#FF5C1A' },
  { id: 'lucas-mendes',  initials: 'LM', name: 'Lucas Mendes',  skill: 'Plumber',     distance: '2.4 km', rating: 4.5, price: '$35/hr', avatarBg: '#EEF6FF', avatarColor: '#2563EB' },
  { id: 'sophie-dupont', initials: 'SD', name: 'Sophie Dupont', skill: 'Tiling',      distance: '3.1 km', rating: 4.8, price: '€55/hr', avatarBg: '#FFF0F5', avatarColor: '#DB2777' },
]

const categories = [
  { icon: Wrench,     name: 'Plumbing'   },
  { icon: Zap,        name: 'Electrical' },
  { icon: Hammer,     name: 'Carpentry'  },
  { icon: Wind,       name: 'AC Repair'  },
  { icon: Paintbrush, name: 'Painting'   },
  { icon: Layers,     name: 'Tiling'     },
  { icon: Settings,   name: 'Technician' },
]

const statusStyle: Record<string, { bg: string; color: string; label: string; icon: React.ReactNode }> = {
  upcoming:  { bg: '#FFF3EE', color: '#FF5C1A', label: 'Upcoming',  icon: <Clock size={11} />        },
  completed: { bg: '#F0FDF4', color: '#16A34A', label: 'Completed', icon: <CheckCircle size={11} /> },
  pending:   { bg: '#FFF8EE', color: '#D97706', label: 'Pending',   icon: <Clock size={11} />        },
}

const S = `
  .dash-page { min-height: 100vh; background: #F5F4F1; }

  .dash-topbar {
    background: white; border-bottom: 1px solid #E8E6E1;
    padding: 0 40px; height: 64px;
    display: flex; align-items: center; justify-content: space-between; gap: 20px;
    position: sticky; top: 0; z-index: 40;
  }
  .dash-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
  .dash-logo-icon { width: 30px; height: 30px; background: #FF5C1A; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
  .dash-logo-text { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: #0F0F0F; }
  .dash-logo-text span { color: #FF5C1A; }

  .dash-greeting { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; }
  .dash-greeting span { color: #FF5C1A; }
  .dash-topbar-right { display: flex; align-items: center; gap: 10px; }

  .dash-ai-btn {
    display: flex; align-items: center; gap: 6px;
    background: #FFF3EE; border: 1.5px solid rgba(255,92,26,0.2);
    border-radius: 9px; padding: 7px 14px;
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
    color: #FF5C1A; text-decoration: none; transition: all 0.2s;
  }
  .dash-ai-btn:hover { background: #FF5C1A; color: white; }

  .dash-notif-btn {
    width: 38px; height: 38px; border-radius: 10px;
    background: #F5F4F1; border: 1px solid #E8E6E1;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; position: relative; transition: all 0.2s;
  }
  .dash-notif-btn:hover { border-color: #FF5C1A; }
  .notif-badge {
    position: absolute; top: -4px; right: -4px;
    width: 16px; height: 16px; border-radius: 50%;
    background: #FF5C1A; border: 2px solid white;
    font-size: 9px; font-weight: 700; color: white;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif;
  }

  /* User menu */
  .dash-user-wrap { position: relative; }
  .dash-avatar {
    width: 38px; height: 38px; border-radius: 10px;
    background: #FFF3EE; color: #FF5C1A;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; border: 2px solid #FF5C1A; transition: all 0.2s;
  }
  .dash-avatar:hover { background: #FF5C1A; color: white; }
  .user-dropdown {
    position: absolute; top: calc(100% + 8px); right: 0;
    background: white; border: 1px solid #E8E6E1; border-radius: 14px;
    padding: 8px; min-width: 200px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12); z-index: 100;
  }
  .dropdown-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 9px; cursor: pointer;
    font-size: 14px; color: #0F0F0F; text-decoration: none;
    transition: background 0.15s; font-family: 'DM Sans', sans-serif;
  }
  .dropdown-item:hover { background: #F5F4F1; }
  .dropdown-item.danger { color: #EF4444; }
  .dropdown-item.danger:hover { background: #FEF2F2; }
  .dropdown-divider { height: 1px; background: #E8E6E1; margin: 6px 0; }
  .dropdown-user-info { padding: 10px 14px 8px; }
  .dropdown-user-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; }
  .dropdown-user-email { font-size: 12px; color: #6B6B6B; }

  .dash-body { max-width: 1200px; margin: 0 auto; padding: 32px 40px; display: flex; flex-direction: column; gap: 32px; }

  /* SEARCH HERO */
  .dash-search-hero {
    background: #0F0F0F; border-radius: 24px; padding: 40px 48px;
    position: relative; overflow: hidden;
  }
  .dash-search-glow {
    position: absolute; top: -80px; right: -80px;
    width: 400px; height: 400px; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,92,26,0.2) 0%, transparent 70%);
    pointer-events: none;
  }
  .dash-search-label {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(255,92,26,0.15); border: 1px solid rgba(255,92,26,0.3);
    color: #FF5C1A; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600;
    letter-spacing: 1px; text-transform: uppercase; padding: 5px 12px; border-radius: 100px;
    margin-bottom: 16px; position: relative;
  }
  .dash-search-title {
    font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800;
    letter-spacing: -1px; color: white; margin-bottom: 6px; position: relative;
  }
  .dash-search-title em { color: #FF5C1A; font-style: normal; }
  .dash-search-sub { font-size: 14px; color: rgba(255,255,255,0.45); font-weight: 300; margin-bottom: 24px; position: relative; }
  .dash-search-row { display: flex; gap: 10px; position: relative; }
  .dash-search-field {
    flex: 1; display: flex; align-items: center; gap: 10px;
    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px; padding: 13px 18px; transition: border-color 0.2s;
  }
  .dash-search-field:focus-within { border-color: #FF5C1A; }
  .dash-search-field input {
    flex: 1; border: none; outline: none; background: transparent;
    font-family: 'DM Sans', sans-serif; font-size: 15px; color: white;
  }
  .dash-search-field input::placeholder { color: rgba(255,255,255,0.3); }
  .dash-search-btn {
    background: #FF5C1A; color: white;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px;
    border: none; border-radius: 12px; padding: 13px 24px;
    cursor: pointer; transition: background 0.2s; white-space: nowrap;
    text-decoration: none; display: inline-flex; align-items: center; gap: 6px;
  }
  .dash-search-btn:hover { background: #FF7A40; }

  /* CATEGORY PILLS */
  .category-row { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
  .category-row::-webkit-scrollbar { display: none; }
  .category-pill {
    display: flex; align-items: center; gap: 7px;
    background: white; border: 1.5px solid #E8E6E1; border-radius: 100px;
    padding: 8px 16px; white-space: nowrap;
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
    color: #6B6B6B; cursor: pointer; transition: all 0.2s; text-decoration: none;
  }
  .category-pill:hover { border-color: #FF5C1A; color: #FF5C1A; transform: translateY(-1px); }

  /* STATS */
  .stats-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .stat-card {
    background: white; border: 1px solid #E8E6E1; border-radius: 16px;
    padding: 20px 24px; display: flex; align-items: center; gap: 16px;
  }
  .stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .stat-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 26px; color: #0F0F0F; }
  .stat-label { font-size: 13px; color: #6B6B6B; margin-top: 2px; }

  /* SECTION */
  .section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
  .section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; color: #0F0F0F; }
  .section-link {
    display: flex; align-items: center; gap: 4px;
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
    color: #FF5C1A; text-decoration: none; transition: gap 0.2s;
  }
  .section-link:hover { gap: 7px; }

  /* BOOKINGS */
  .bookings-list { display: flex; flex-direction: column; gap: 12px; }
  .booking-card {
    background: white; border: 1px solid #E8E6E1; border-radius: 16px;
    padding: 18px 22px; display: flex; align-items: center; gap: 16px;
    transition: all 0.2s;
  }
  .booking-card:hover { border-color: #FF5C1A; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
  .booking-avatar {
    width: 48px; height: 48px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 17px; flex-shrink: 0;
  }
  .booking-info { flex: 1; min-width: 0; }
  .booking-worker { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; }
  .booking-meta { display: flex; align-items: center; gap: 12px; margin-top: 4px; flex-wrap: wrap; }
  .booking-skill { font-size: 12px; color: #6B6B6B; }
  .booking-date { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #6B6B6B; }
  .booking-status {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 100px;
    font-family: 'Syne', sans-serif;
  }
  .booking-price { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; }
  .booking-action {
    background: none; border: 1.5px solid #E8E6E1; border-radius: 9px;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 12px;
    color: #6B6B6B; padding: 7px 14px; cursor: pointer; transition: all 0.2s;
    text-decoration: none;
  }
  .booking-action:hover { border-color: #FF5C1A; color: #FF5C1A; }

  /* WORKERS GRID */
  .workers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; }
  .worker-card {
    background: white; border: 1px solid #E8E6E1; border-radius: 16px; padding: 20px;
    transition: all 0.25s; text-decoration: none; color: inherit; display: block;
  }
  .worker-card:hover { border-color: #FF5C1A; transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
  .wc-top { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
  .wc-avatar {
    width: 48px; height: 48px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 17px;
    flex-shrink: 0; position: relative;
  }
  .wc-dot { position: absolute; bottom: 0; right: 0; width: 11px; height: 11px; border-radius: 50%; border: 2px solid white; }
  .wc-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; }
  .wc-skill { display: inline-block; font-size: 10px; font-weight: 600; background: #FFF3EE; color: #FF5C1A; padding: 2px 8px; border-radius: 100px; margin: 3px 0; }
  .wc-loc { display: flex; align-items: center; gap: 3px; font-size: 11px; color: #6B6B6B; }
  .wc-rating { display: flex; align-items: center; gap: 3px; margin-left: auto; flex-shrink: 0; }
  .wc-rating-val { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #0F0F0F; }
  .wc-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; }
  .wc-price { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; }
  .wc-book {
    background: #FF5C1A; color: white;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 12px;
    border: none; border-radius: 8px; padding: 7px 14px;
    text-decoration: none; transition: background 0.2s;
  }
  .wc-book:hover { background: #FF7A40; }

  /* NEARBY */
  .nearby-list { display: flex; flex-direction: column; gap: 12px; }
  .nearby-card {
    background: white; border: 1px solid #E8E6E1; border-radius: 14px;
    padding: 16px 20px; display: flex; align-items: center; gap: 14px;
    transition: all 0.2s; text-decoration: none; color: inherit;
  }
  .nearby-card:hover { border-color: #FF5C1A; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
  .nearby-avatar {
    width: 44px; height: 44px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; flex-shrink: 0;
  }
  .nearby-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; }
  .nearby-meta { display: flex; align-items: center; gap: 10px; margin-top: 3px; flex-wrap: wrap; }
  .nearby-skill { font-size: 11px; background: #FFF3EE; color: #FF5C1A; padding: 2px 8px; border-radius: 100px; font-weight: 600; }
  .nearby-dist { display: flex; align-items: center; gap: 3px; font-size: 12px; color: #6B6B6B; }
  .nearby-right { margin-left: auto; display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
  .nearby-rating { display: flex; align-items: center; gap: 3px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #0F0F0F; }
  .nearby-price { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; }

  @media (max-width: 768px) {
    .dash-topbar { padding: 0 16px; }
    .dash-body { padding: 20px 16px; gap: 24px; }
    .dash-search-hero { padding: 28px 20px; }
    .stats-strip { grid-template-columns: 1fr 1fr; }
    .workers-grid { grid-template-columns: 1fr 1fr; }
    .booking-card { flex-wrap: wrap; }
    .dash-greeting { display: none; }
  }
  @media (max-width: 500px) {
    .stats-strip { grid-template-columns: 1fr; }
    .workers-grid { grid-template-columns: 1fr; }
  }
`

export default function ClientDashboard() {
  const [search, setSearch]     = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <>
      <style>{S}</style>
      <div className="dash-page">

        {/* Topbar */}
        <div className="dash-topbar">
          <Link href="/" className="dash-logo">
            <div className="dash-logo-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M13.78 15.3 19.78 21.3 21.89 19.14 15.89 13.14 13.78 15.3M17.5 10.1C17.11 10.1 16.69 10.05 16.36 9.96L4.97 21.25 2.86 19.14 8 14 6 12 7.07 10.93 9.15 13 10.09 12.06 8 10 9.07 8.93 11.15 11 12.09 10.06 10 8 11.07 6.93 13.15 9 14.3 7.85C14.1 7.31 14 6.71 14 6.1 14 3.32 16.24 1.1 19.02 1.1 19.72 1.1 20.34 1.27 20.95 1.52L18.31 4.16 19.95 5.79 22.59 3.15C22.84 3.75 23 4.37 23 5.07 23 7.85 20.78 10.07 18 10.07L17.5 10.1Z"/>
              </svg>
            </div>
            <span className="dash-logo-text">Fix<span>Mate</span></span>
          </Link>

          <p className="dash-greeting">Good morning, <span>Sarah</span></p>

          <div className="dash-topbar-right">
            <Link href="/assistant" className="dash-ai-btn">
              <Sparkles size={14} /> AI Assistant
            </Link>
            <div className="dash-notif-btn">
              <Bell size={17} color="#6B6B6B" />
              <div className="notif-badge">3</div>
            </div>
            <div className="dash-user-wrap">
              <div className="dash-avatar" onClick={() => setShowDropdown(!showDropdown)}>SA</div>
              {showDropdown && (
                <div className="user-dropdown">
                  <div className="dropdown-user-info">
                    <p className="dropdown-user-name">Sarah Adams</p>
                    <p className="dropdown-user-email">sarah@email.com</p>
                  </div>
                  <div className="dropdown-divider" />
                  <Link href="/profile"   className="dropdown-item" onClick={() => setShowDropdown(false)}><User size={15} color="#6B6B6B" /> My Profile</Link>
                  <Link href="/orders"    className="dropdown-item" onClick={() => setShowDropdown(false)}><BookOpen size={15} color="#6B6B6B" /> My Orders</Link>
                  <Link href="/settings"  className="dropdown-item" onClick={() => setShowDropdown(false)}><Settings size={15} color="#6B6B6B" /> Settings</Link>
                  <div className="dropdown-divider" />
                  <Link href="/login"     className="dropdown-item danger" onClick={() => setShowDropdown(false)}><LogOut size={15} /> Sign Out</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="dash-body">

          {/* Search hero */}
          <div className="dash-search-hero">
            <div className="dash-search-glow" />
            <div className="dash-search-label"><Search size={11} /> Find a Worker</div>
            <h2 className="dash-search-title">What do you need <em>fixed</em> today?</h2>
            <p className="dash-search-sub">Search from 50,000+ verified workers worldwide</p>
            <div className="dash-search-row">
              <div className="dash-search-field">
                <Search size={17} color="rgba(255,255,255,0.4)" />
                <input
                  type="text"
                  placeholder="e.g. leaking pipe, broken socket…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <Link href={`/explore${search ? `?q=${encodeURIComponent(search)}` : ''}`} className="dash-search-btn">
                <Search size={15} /> Find Worker
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div className="category-row">
            {categories.map(({ icon: Icon, name }) => (
              <Link key={name} href={`/explore?skill=${encodeURIComponent(name)}`} className="category-pill">
                <Icon size={14} /> {name}
              </Link>
            ))}
          </div>

          {/* Stats */}
          <div className="stats-strip">
            {[
              { icon: <Clock size={20} color="#FF5C1A" />,       bg: '#FFF3EE', val: '2',   label: 'Active Bookings'   },
              { icon: <CheckCircle size={20} color="#16A34A" />, bg: '#F0FDF4', val: '14',  label: 'Completed Jobs'    },
              { icon: <TrendingUp size={20} color="#2563EB" />,  bg: '#EEF6FF', val: '4.9', label: 'Avg Worker Rating' },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                <div>
                  <div className="stat-val">{s.val}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Bookings */}
          <div>
            <div className="section-head">
              <p className="section-title">Recent Bookings</p>
              <Link href="/orders" className="section-link">View all <ChevronRight size={14} /></Link>
            </div>
            <div className="bookings-list">
              {recentBookings.map(b => {
                const st = statusStyle[b.status]
                return (
                  <div key={b.id} className="booking-card">
                    <div className="booking-avatar" style={{ background: b.avatarBg, color: b.avatarColor }}>{b.initials}</div>
                    <div className="booking-info">
                      <p className="booking-worker">{b.worker}</p>
                      <div className="booking-meta">
                        <span className="booking-skill">{b.skill}</span>
                        <span className="booking-date"><Clock size={11} />{b.date}</span>
                        <span className="booking-status" style={{ background: st.bg, color: st.color }}>{st.icon}{st.label}</span>
                      </div>
                    </div>
                    <span className="booking-price">{b.price}</span>
                    <Link href={`/orders/${b.id}`} className="booking-action">Details</Link>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recommended Workers */}
          <div>
            <div className="section-head">
              <p className="section-title">Recommended for You</p>
              <Link href="/explore" className="section-link">See all <ChevronRight size={14} /></Link>
            </div>
            <div className="workers-grid">
              {recommended.map(w => (
                <Link key={w.id} href={`/explore/${w.id}`} className="worker-card">
                  <div className="wc-top">
                    <div className="wc-avatar" style={{ background: w.avatarBg, color: w.avatarColor }}>
                      {w.initials}
                      <span className="wc-dot" style={{ background: w.available ? '#22C55E' : '#D1D5DB' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="wc-name">{w.name}</p>
                      <span className="wc-skill">{w.skill}</span>
                      <div className="wc-loc"><MapPin size={10} />{w.location}</div>
                    </div>
                    <div className="wc-rating">
                      <Star size={12} color="#F59E0B" fill="#F59E0B" />
                      <span className="wc-rating-val">{w.rating}</span>
                    </div>
                  </div>
                  <div className="wc-footer">
                    <span className="wc-price">{w.price}</span>
                    <span className="wc-book">Book Now</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Nearby Workers */}
          <div>
            <div className="section-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <p className="section-title">Workers Near You</p>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, background: '#FFF3EE', color: '#FF5C1A', borderRadius: 100, padding: '3px 10px', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
                  <MapPin size={11} /> Using your location
                </span>
              </div>
              <Link href="/explore" className="section-link">See all <ChevronRight size={14} /></Link>
            </div>
            <div className="nearby-list">
              {nearby.map(w => (
                <Link key={w.id} href={`/explore/${w.id}`} className="nearby-card">
                  <div className="nearby-avatar" style={{ background: w.avatarBg, color: w.avatarColor }}>{w.initials}</div>
                  <div>
                    <p className="nearby-name">{w.name}</p>
                    <div className="nearby-meta">
                      <span className="nearby-skill">{w.skill}</span>
                      <span className="nearby-dist"><MapPin size={10} />{w.distance} away</span>
                    </div>
                  </div>
                  <div className="nearby-right">
                    <span className="nearby-rating"><Star size={12} color="#F59E0B" fill="#F59E0B" />{w.rating}</span>
                    <span className="nearby-price">{w.price}</span>
                    <ChevronRight size={16} color="#AFAFAF" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}