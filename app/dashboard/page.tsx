'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  Search, MapPin, Star, Bell, ChevronRight,
  Wrench, Zap, Hammer, Wind, Paintbrush, Settings,
  Clock, CheckCircle, TrendingUp, Layers, Sparkles,
  LogOut, User, BookOpen, LayoutDashboard, Calendar, 
  MessageSquare, ShieldCheck, Menu, X
} from 'lucide-react'
import Image from 'next/image'
import Logo from "@/public/logo.svg"

// Firebase
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

const recentBookings = [
  { id: 'b1', worker: 'James Mitchell', skill: 'Electrician', date: 'Today, 2:00 PM',  status: 'upcoming',  price: '£90',    initials: 'JM', avatarBg: '#FFF3EE', avatarColor: '#FF5C1A' },
  { id: 'b2', worker: 'Carlos Rivera',  skill: 'Plumber',     date: 'Yesterday',         status: 'completed', price: '$120',   initials: 'CR', avatarBg: '#EEF6FF', avatarColor: '#2563EB' },
]

const recommended = [
  { id: 'james-mitchell', initials: 'JM', name: 'James Mitchell', skill: 'Electrician', location: 'London, UK',    rating: 4.9, price: '£45/hr',    jobs: 214, avatarBg: '#FFF3EE', avatarColor: '#FF5C1A', available: true  },
  { id: 'aisha-patel',    initials: 'AP', name: 'Aisha Patel',    skill: 'Painter',     location: 'Dubai, UAE',    rating: 5.0, price: 'AED 80/hr', jobs: 302, avatarBg: '#F0FDF4', avatarColor: '#16A34A', available: true  },
]

const categories = [
  { icon: Wrench, name: 'Plumbing' },
  { icon: Zap, name: 'Electrical' },
  { icon: Hammer, name: 'Carpentry' },
  { icon: Wind, name: 'AC Repair' },
  { icon: Paintbrush, name: 'Painting' },
]

const statusStyle: Record<string, { bg: string; color: string; label: string; icon: React.ReactNode }> = {
  upcoming:  { bg: '#FFF3EE', color: '#FF5C1A', label: 'Upcoming',  icon: <Clock size={11} /> },
  completed: { bg: '#F0FDF4', color: '#16A34A', label: 'Completed', icon: <CheckCircle size={11} /> },
}

const S = `
  .dash-container { display: flex; min-height: 100vh; background: #F5F4F1; }
  
  /* SIDEBAR */
  .dash-sidebar {
    width: 260px; background: #0F0F0F; color: white;
    display: flex; flex-direction: column;
    position: fixed; top: 0; bottom: 0; left: 0; z-index: 50;
    transition: transform 0.3s ease;
  }
  .sidebar-header { padding: 32px 24px; }
  .sidebar-nav { flex: 1; padding: 0 16px; display: flex; flex-direction: column; gap: 4px; }
  .nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 16px; border-radius: 12px;
    color: rgba(255,255,255,0.6); text-decoration: none;
    font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600;
    transition: all 0.2s;
  }
  .nav-item:hover, .nav-item.active { background: rgba(255,92,26,0.1); color: #FF5C1A; }
  .sidebar-footer { padding: 24px; border-top: 1px solid rgba(255,255,255,0.05); }
  
  /* MAIN CONTENT */
  .dash-main { flex: 1; margin-left: 260px; display: flex; flex-direction: column; }
  
  .dash-topbar {
    background: white; border-bottom: 1px solid #E8E6E1;
    padding: 0 40px; height: 72px;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 40;
  }
  .mobile-menu-btn { display: none; background: none; border: none; cursor: pointer; }

  .dash-greeting { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; }
  .dash-greeting span { color: #FF5C1A; }

  .dash-topbar-right { display: flex; align-items: center; gap: 16px; }
  .dash-avatar {
    width: 40px; height: 40px; border-radius: 12px;
    background: #FFF3EE; color: #FF5C1A;
    font-family: 'Syne', sans-serif; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; border: 2px solid #FF5C1A;
  }

  .dash-body { max-width: 1100px; margin: 0 auto; padding: 32px 40px; width: 100%; display: flex; flex-direction: column; gap: 32px; }

  /* SEARCH HERO */
  .dash-search-hero { background: #0F0F0F; border-radius: 24px; padding: 40px; position: relative; overflow: hidden; }
  .dash-search-glow { position: absolute; top: -80px; right: -80px; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, rgba(255,92,26,0.2) 0%, transparent 70%); }
  .dash-search-title { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: white; margin-bottom: 20px; position: relative; }
  .dash-search-title em { color: #FF5C1A; font-style: normal; }
  .dash-search-row { display: flex; gap: 10px; position: relative; }
  .dash-search-field { flex: 1; display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 12px 18px; }
  .dash-search-field input { flex: 1; border: none; outline: none; background: transparent; color: white; font-size: 15px; }

  .stats-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .stat-card { background: white; border: 1px solid #E8E6E1; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; }
  .stat-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; color: #0F0F0F; }

  .booking-card { background: white; border: 1px solid #E8E6E1; border-radius: 16px; padding: 16px 20px; display: flex; align-items: center; gap: 16px; }
  .booking-avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; }

  @media (max-width: 1024px) {
    .dash-sidebar { transform: translateX(-100%); }
    .dash-sidebar.open { transform: translateX(0); }
    .dash-main { margin-left: 0; }
    .mobile-menu-btn { display: block; }
  }
  @media (max-width: 768px) {
    .dash-topbar { padding: 0 20px; }
    .dash-body { padding: 24px 20px; }
    .stats-strip { grid-template-columns: 1fr; }
  }
`

export default function ClientDashboard() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
      } else {
        router.push('/login')
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne' }}>Loading...</div>

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Search, label: 'Find Workers', href: '/explore' },
    { icon: Calendar, label: 'My Bookings', href: '/orders' },
    { icon: MessageSquare, label: 'Messages', href: '/messages' },
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: ShieldCheck, label: 'Verification', href: '/verify' },
  ]

  return (
    <>
      <style>{S}</style>
      <div className="dash-container">
        
        {/* SIDEBAR */}
        <aside className={`dash-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <Link href="/" className="dash-logo" style={{ color: 'white' }}>
              <Image src={Logo} alt='logo' width={40}/>
              <span className="dash-logo-text" style={{ color: 'white' }}>Fix<span style={{color:'#FF5C1A'}}>Mate</span></span>
            </Link>
          </div>
          
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`nav-item ${pathname === item.href ? 'active' : ''}`}
              >
                <item.icon size={18} /> {item.label}
              </Link>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button onClick={handleLogout} className="nav-item" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}>
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="dash-main">
          <header className="dash-topbar">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? <X /> : <Menu />}
            </button>

            <p className="dash-greeting">Welcome back, <span>{user?.displayName?.split(' ')[0] || 'User'}</span></p>

            <div className="dash-topbar-right">
              <Link href="/assistant" className="dash-ai-btn" style={{ textDecoration: 'none', color: '#FF5C1A', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <Sparkles size={16} /> AI
              </Link>
              <div className="dash-avatar">
                {user?.displayName ? user.displayName.split(' ').map((n:any) => n[0]).join('') : 'U'}
              </div>
            </div>
          </header>

          <div className="dash-body">
            {/* Search hero */}
            <div className="dash-search-hero">
              <div className="dash-search-glow" />
              <h2 className="dash-search-title">Need something <em>repaired</em>?</h2>
              <div className="dash-search-row">
                <div className="dash-search-field">
                  <Search size={18} color="rgba(255,255,255,0.4)" />
                  <input
                    type="text"
                    placeholder="Search plumbers, electricians..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <button className="dash-search-btn" style={{ background: '#FF5C1A', border: 'none', color: 'white', padding: '0 24px', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>
                  Search
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="stats-strip">
              {[
                { icon: <Clock size={20} color="#FF5C1A" />, bg: '#FFF3EE', val: '2', label: 'Active Jobs' },
                { icon: <CheckCircle size={20} color="#16A34A" />, bg: '#F0FDF4', val: '14', label: 'Completed' },
                { icon: <TrendingUp size={20} color="#2563EB" />, bg: '#EEF6FF', val: '4.9', label: 'Rating' },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-icon" style={{ background: s.bg, width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                  <div>
                    <div className="stat-val">{s.val}</div>
                    <div className="stat-label" style={{ fontSize: 13, color: '#6B6B6B' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Bookings */}
            <div>
              <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <p className="section-title" style={{ fontWeight: 700, fontFamily: 'Syne' }}>Recent Bookings</p>
                <Link href="/orders" style={{ color: '#FF5C1A', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>View all</Link>
              </div>
              <div className="bookings-list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recentBookings.map(b => {
                  const st = statusStyle[b.status]
                  return (
                    <div key={b.id} className="booking-card">
                      <div className="booking-avatar" style={{ background: b.avatarBg, color: b.avatarColor }}>{b.initials}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, fontSize: 15 }}>{b.worker}</p>
                        <p style={{ fontSize: 12, color: '#6B6B6B' }}>{b.skill} • {b.date}</p>
                      </div>
                      <span style={{ background: st.bg, color: st.color, padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700 }}>{st.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}