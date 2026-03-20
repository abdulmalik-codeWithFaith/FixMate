'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  Search, MapPin, Star, Bell, ChevronRight,
  Wrench, Zap, Hammer, Wind, Paintbrush, Settings,
  Clock, CheckCircle, TrendingUp, Layers, Sparkles,
  LogOut, User, BookOpen, LayoutDashboard, Calendar,
  MessageSquare, ShieldCheck, Menu, X, AlertCircle,
  Loader, RefreshCw
} from 'lucide-react'
import Image from 'next/image'
import Logo from '@/public/logo.svg'

// Firebase
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import {
  collection, query, where, orderBy,
  limit, getDocs, doc, getDoc, onSnapshot,
  Timestamp
} from 'firebase/firestore'

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Booking {
  id: string
  workerId: string
  workerName: string
  workerInitials: string
  workerAvatarBg: string
  workerAvatarColor: string
  skill: string
  date: string
  rawDate: Timestamp | null
  status: 'pending' | 'accepted' | 'completed' | 'cancelled'
  price: string
  location: string
}

interface Worker {
  id: string
  name: string
  initials: string
  skill: string
  location: string
  rating: number
  price: number
  currency: string
  jobs: number
  avatarBg: string
  avatarColor: string
  available: boolean
  bio: string
}

interface Stats {
  activeJobs: number
  completedJobs: number
  avgRating: number
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const statusStyle: Record<string, { bg: string; color: string; label: string; icon: React.ReactNode }> = {
  pending:   { bg: '#FFF8EE', color: '#D97706', label: 'Pending',   icon: <Clock size={11} />        },
  accepted:  { bg: '#FFF3EE', color: '#FF5C1A', label: 'Accepted',  icon: <CheckCircle size={11} />  },
  completed: { bg: '#F0FDF4', color: '#16A34A', label: 'Completed', icon: <CheckCircle size={11} />  },
  cancelled: { bg: '#FEF2F2', color: '#EF4444', label: 'Cancelled', icon: <X size={11} />            },
}

const categories = [
  { icon: Wrench,     name: 'Plumbing'   },
  { icon: Zap,        name: 'Electrical' },
  { icon: Hammer,     name: 'Carpentry'  },
  { icon: Wind,       name: 'AC Repair'  },
  { icon: Paintbrush, name: 'Painting'   },
  { icon: Layers,     name: 'Tiling'     },
  { icon: Settings,   name: 'Technician' },
]

function formatBookingDate(ts: Timestamp | null, fallback: string): string {
  if (!ts) return fallback
  const d = ts.toDate()
  const now = new Date()
  const diff = (now.getTime() - d.getTime()) / 86400000
  if (diff < 1 && d.getDate() === now.getDate()) return `Today, ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
  if (diff < 2) return `Yesterday, ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const S = `
  * { box-sizing: border-box; }
  .dash-container { display: flex; min-height: 100vh; background: #F5F4F1; }

  /* SIDEBAR */
  .dash-sidebar {
    width: 260px; background: #0F0F0F; color: white;
    display: flex; flex-direction: column;
    position: fixed; top: 0; bottom: 0; left: 0; z-index: 50;
    transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
    overflow-y: auto;
  }
  .sidebar-header { padding: 28px 24px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .sidebar-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .sidebar-logo-text { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; color: white; }
  .sidebar-logo-text span { color: #FF5C1A; }

  .sidebar-section-label {
    font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700;
    color: rgba(255,255,255,0.25); letter-spacing: 1.5px; text-transform: uppercase;
    padding: 16px 24px 6px;
  }
  .sidebar-nav { flex: 1; padding: 8px 12px; display: flex; flex-direction: column; gap: 2px; }
  .nav-item {
    display: flex; align-items: center; gap: 12px; padding: 11px 14px;
    border-radius: 11px; color: rgba(255,255,255,0.55);
    text-decoration: none; font-family: 'Syne', sans-serif;
    font-size: 14px; font-weight: 600; transition: all 0.2s;
    border: none; background: none; cursor: pointer; width: 100%;
  }
  .nav-item:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.9); }
  .nav-item.active { background: rgba(255,92,26,0.12); color: #FF5C1A; }
  .nav-item .nav-badge {
    margin-left: auto; background: #FF5C1A; color: white;
    font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 100px;
  }

  .sidebar-footer { padding: 16px 12px; border-top: 1px solid rgba(255,255,255,0.06); }
  .sidebar-user {
    display: flex; align-items: center; gap: 12px; padding: 12px 14px;
    border-radius: 11px; background: rgba(255,255,255,0.04); margin-bottom: 8px;
  }
  .sidebar-user-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: #FF5C1A; color: white;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .sidebar-user-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: white; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .sidebar-user-role { font-size: 11px; color: rgba(255,255,255,0.4); }

  /* MOBILE OVERLAY */
  .sidebar-overlay {
    display: none; position: fixed; inset: 0;
    background: rgba(0,0,0,0.5); z-index: 49; backdrop-filter: blur(2px);
  }

  /* MAIN */
  .dash-main { flex: 1; margin-left: 260px; display: flex; flex-direction: column; min-width: 0; }

  /* TOPBAR */
  .dash-topbar {
    background: white; border-bottom: 1px solid #E8E6E1;
    padding: 0 40px; height: 68px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    position: sticky; top: 0; z-index: 40;
  }
  .mobile-menu-btn {
    display: none; background: none; border: none; cursor: pointer;
    color: #6B6B6B; padding: 4px; flex-shrink: 0;
  }
  .dash-greeting { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; }
  .dash-greeting span { color: #FF5C1A; }
  .topbar-right { display: flex; align-items: center; gap: 10px; }
  .topbar-ai-btn {
    display: flex; align-items: center; gap: 6px;
    background: #FFF3EE; border: 1.5px solid rgba(255,92,26,0.2);
    border-radius: 9px; padding: 7px 14px;
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
    color: #FF5C1A; text-decoration: none; transition: all 0.2s;
  }
  .topbar-ai-btn:hover { background: #FF5C1A; color: white; }
  .topbar-notif {
    width: 38px; height: 38px; border-radius: 10px;
    background: #F5F4F1; border: 1px solid #E8E6E1;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; position: relative; transition: all 0.2s; text-decoration: none; color: #6B6B6B;
  }
  .topbar-notif:hover { border-color: #FF5C1A; color: #FF5C1A; }
  .notif-dot {
    position: absolute; top: -3px; right: -3px; width: 14px; height: 14px;
    border-radius: 50%; background: #FF5C1A; border: 2px solid white;
    font-size: 8px; font-weight: 700; color: white;
    display: flex; align-items: center; justify-content: center;
  }
  .topbar-avatar {
    width: 38px; height: 38px; border-radius: 10px;
    background: #FFF3EE; color: #FF5C1A;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; border: 2px solid #FF5C1A; flex-shrink: 0;
  }

  /* BODY */
  .dash-body { max-width: 1100px; margin: 0 auto; padding: 32px 40px; width: 100%; display: flex; flex-direction: column; gap: 28px; }

  /* SEARCH HERO */
  .dash-search-hero { background: #0F0F0F; border-radius: 22px; padding: 36px 40px; position: relative; overflow: hidden; }
  .dash-search-glow { position: absolute; top: -80px; right: -80px; width: 350px; height: 350px; border-radius: 50%; background: radial-gradient(circle, rgba(255,92,26,0.2) 0%, transparent 70%); pointer-events: none; }
  .dash-search-title { font-family: 'Syne', sans-serif; font-size: clamp(20px,3vw,26px); font-weight: 800; color: white; margin-bottom: 18px; position: relative; letter-spacing: -0.5px; }
  .dash-search-title em { color: #FF5C1A; font-style: normal; }
  .dash-search-row { display: flex; gap: 10px; position: relative; }
  .dash-search-field {
    flex: 1; display: flex; align-items: center; gap: 10px;
    background: rgba(255,255,255,0.09); border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px; padding: 12px 18px; transition: border-color 0.2s;
  }
  .dash-search-field:focus-within { border-color: #FF5C1A; }
  .dash-search-field input { flex: 1; border: none; outline: none; background: transparent; color: white; font-family: 'DM Sans', sans-serif; font-size: 15px; }
  .dash-search-field input::placeholder { color: rgba(255,255,255,0.3); }
  .dash-search-btn {
    background: #FF5C1A; border: none; color: white; padding: 12px 24px;
    border-radius: 12px; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px;
    cursor: pointer; transition: background 0.2s; white-space: nowrap; flex-shrink: 0;
  }
  .dash-search-btn:hover { background: #FF7A40; }

  /* CATEGORIES */
  .cat-row { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
  .cat-row::-webkit-scrollbar { display: none; }
  .cat-pill {
    display: flex; align-items: center; gap: 7px;
    background: white; border: 1.5px solid #E8E6E1; border-radius: 100px;
    padding: 8px 16px; white-space: nowrap;
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
    color: #6B6B6B; text-decoration: none; transition: all 0.2s; flex-shrink: 0;
  }
  .cat-pill:hover { border-color: #FF5C1A; color: #FF5C1A; transform: translateY(-1px); }

  /* STATS */
  .stats-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .stat-card { background: white; border: 1px solid #E8E6E1; border-radius: 16px; padding: 18px 22px; display: flex; align-items: center; gap: 16px; }
  .stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .stat-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 26px; color: #0F0F0F; }
  .stat-label { font-size: 12px; color: #6B6B6B; margin-top: 2px; }

  /* SECTION */
  .section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; color: #0F0F0F; }
  .section-link { display: flex; align-items: center; gap: 4px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #FF5C1A; text-decoration: none; transition: gap 0.2s; }
  .section-link:hover { gap: 7px; }

  /* BOOKINGS */
  .bookings-list { display: flex; flex-direction: column; gap: 10px; }
  .booking-card {
    background: white; border: 1px solid #E8E6E1; border-radius: 16px;
    padding: 16px 20px; display: flex; align-items: center; gap: 14px;
    transition: all 0.2s; text-decoration: none; color: inherit;
  }
  .booking-card:hover { border-color: #FF5C1A; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
  .booking-avatar {
    width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center;
    justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; flex-shrink: 0;
  }
  .booking-info { flex: 1; min-width: 0; }
  .booking-worker { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; }
  .booking-meta { font-size: 12px; color: #6B6B6B; margin-top: 3px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .booking-status { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 100px; font-family: 'Syne', sans-serif; }
  .booking-price { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; flex-shrink: 0; }

  /* WORKER CARDS */
  .workers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
  .worker-card {
    background: white; border: 1px solid #E8E6E1; border-radius: 16px; padding: 18px;
    transition: all 0.25s; text-decoration: none; color: inherit; display: block;
  }
  .worker-card:hover { border-color: #FF5C1A; transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
  .wc-top { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
  .wc-avatar { width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; flex-shrink: 0; position: relative; }
  .wc-dot { position: absolute; bottom: 0; right: 0; width: 11px; height: 11px; border-radius: 50%; border: 2px solid white; }
  .wc-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; }
  .wc-skill { display: inline-block; font-size: 10px; font-weight: 600; background: #FFF3EE; color: #FF5C1A; padding: 2px 8px; border-radius: 100px; margin: 3px 0; }
  .wc-loc { display: flex; align-items: center; gap: 3px; font-size: 11px; color: #6B6B6B; }
  .wc-rating { display: flex; align-items: center; gap: 3px; margin-left: auto; flex-shrink: 0; }
  .wc-rating-val { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #0F0F0F; }
  .wc-footer { display: flex; align-items: center; justify-content: space-between; }
  .wc-price { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; }
  .wc-book { background: #FF5C1A; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 12px; border: none; border-radius: 8px; padding: 7px 14px; text-decoration: none; transition: background 0.2s; }
  .wc-book:hover { background: #FF7A40; }

  /* SKELETON */
  .skeleton { background: linear-gradient(90deg, #F5F4F1 25%, #E8E6E1 50%, #F5F4F1 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  /* EMPTY STATE */
  .empty-state { text-align: center; padding: 48px 20px; background: white; border: 1px solid #E8E6E1; border-radius: 16px; }
  .empty-icon { width: 60px; height: 60px; background: #F5F4F1; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
  .empty-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 17px; color: #0F0F0F; margin-bottom: 6px; }
  .empty-sub { font-size: 14px; color: #6B6B6B; margin-bottom: 20px; }
  .empty-btn { display: inline-flex; align-items: center; gap: 8px; background: #FF5C1A; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; border: none; border-radius: 10px; padding: 10px 22px; text-decoration: none; transition: background 0.2s; }
  .empty-btn:hover { background: #FF7A40; }

  /* LOADING */
  .dash-loading { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; background: #F5F4F1; }
  .dash-spinner { width: 40px; height: 40px; border-radius: 50%; border: 3px solid #E8E6E1; border-top-color: #FF5C1A; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* RESPONSIVE */
  @media (max-width: 1024px) {
    .dash-sidebar { transform: translateX(-100%); }
    .dash-sidebar.open { transform: translateX(0); }
    .sidebar-overlay { display: block; }
    .dash-main { margin-left: 0; }
    .mobile-menu-btn { display: block; }
    .dash-greeting { display: none; }
  }
  @media (max-width: 768px) {
    .dash-topbar { padding: 0 16px; height: 60px; }
    .dash-body { padding: 20px 16px; gap: 20px; }
    .stats-strip { grid-template-columns: 1fr 1fr; }
    .workers-grid { grid-template-columns: 1fr 1fr; }
    .dash-search-hero { padding: 24px 20px; }
  }
  @media (max-width: 480px) {
    .stats-strip { grid-template-columns: 1fr; }
    .workers-grid { grid-template-columns: 1fr; }
  }
`

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function ClientDashboard() {
  const router   = useRouter()
  const pathname = usePathname()

  // Auth
  const [user, setUser]             = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Data
  const [bookings, setBookings]         = useState<Booking[]>([])
  const [recommended, setRecommended]   = useState<Worker[]>([])
  const [stats, setStats]               = useState<Stats>({ activeJobs: 0, completedJobs: 0, avgRating: 0 })
  const [unreadNotifs, setUnreadNotifs] = useState(0)

  // UI
  const [search, setSearch]             = useState('')
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [workersLoading, setWorkersLoading]   = useState(true)

  // ── 1. TRACK AUTH ──────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
      } else {
        router.push('/login')
      }
      setAuthLoading(false)
    })
    return () => unsub()
  }, [router])

  // ── 2. FETCH BOOKINGS (REAL-TIME) ──────────────────────────────────────────
  // Listens for live updates — status changes in Firestore instantly reflect here
  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'bookings'),
      where('clientId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    )

    const unsub = onSnapshot(q, async (snap) => {
      const raw = snap.docs.map(d => ({ id: d.id, ...d.data() } as any))

      // For each booking, fetch the worker's name/avatar if not stored inline
      const enriched: Booking[] = await Promise.all(
        raw.map(async (b: any) => {
          let workerName    = b.workerName    || 'Unknown Worker'
          let workerInitials = b.workerInitials || 'WK'
          let workerAvatarBg    = b.workerAvatarBg    || '#FFF3EE'
          let workerAvatarColor = b.workerAvatarColor || '#FF5C1A'

          // If worker details not stored on booking, fetch from workers collection
          if (!b.workerName && b.workerId) {
            try {
              const wSnap = await getDoc(doc(db, 'workers', b.workerId))
              if (wSnap.exists()) {
                const wd = wSnap.data() as any
                workerName         = wd.name        || workerName
                workerInitials     = wd.initials    || workerInitials
                workerAvatarBg     = wd.avatarBg    || workerAvatarBg
                workerAvatarColor  = wd.avatarColor || workerAvatarColor
              }
            } catch {}
          }

          return {
            id:               b.id,
            workerId:         b.workerId || '',
            workerName,
            workerInitials,
            workerAvatarBg,
            workerAvatarColor,
            skill:    b.skill    || b.workerSkill || '—',
            date:     formatBookingDate(b.scheduledAt || b.createdAt || null, b.date || ''),
            rawDate:  b.scheduledAt || b.createdAt || null,
            status:   b.status   || 'pending',
            price:    b.price    ? `${b.currency || '$'}${b.price}` : '—',
            location: b.location || '',
          } as Booking
        })
      )

      setBookings(enriched)

      // ── Compute stats from bookings ────────────────────────────────────────
      const active    = enriched.filter(b => b.status === 'accepted' || b.status === 'pending').length
      const completed = enriched.filter(b => b.status === 'completed').length

      // Fetch average rating from completed bookings that have a rating field
      const ratingSnap = await getDocs(
        query(
          collection(db, 'bookings'),
          where('clientId', '==', user.uid),
          where('status', '==', 'completed'),
          where('rating', '>=', 1)
        )
      )
      const ratings = ratingSnap.docs.map(d => (d.data() as any).rating).filter(Boolean)
      const avg = ratings.length > 0
        ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
        : 0

      setStats({ activeJobs: active, completedJobs: completed, avgRating: Math.round(avg * 10) / 10 })
      setBookingsLoading(false)
    }, (err) => {
      console.error('Bookings listener error:', err)
      setBookingsLoading(false)
    })

    return () => unsub()
  }, [user])

  // ── 3. FETCH UNREAD NOTIFICATIONS COUNT ────────────────────────────────────
  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('read', '==', false)
    )
    const unsub = onSnapshot(q, (snap) => setUnreadNotifs(snap.size))
    return () => unsub()
  }, [user])

  // ── 4. FETCH RECOMMENDED WORKERS ──────────────────────────────────────────
  // Top-rated workers, limited to 4
  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDocs(
          query(
            collection(db, 'workers'),
            where('available', '==', true),
            orderBy('rating', 'desc'),
            limit(4)
          )
        )
        const data: Worker[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as Worker))
        setRecommended(data)
      } catch (err) {
        console.error('Workers fetch error:', err)
      } finally {
        setWorkersLoading(false)
      }
    }
    fetch()
  }, [])

  // ── LOGOUT ─────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await signOut(auth)
    router.push('/')
  }

  // ── SEARCH ─────────────────────────────────────────────────────────────────
  const handleSearch = () => {
    if (search.trim()) {
      router.push(`/explore?q=${encodeURIComponent(search.trim())}`)
    } else {
      router.push('/explore')
    }
  }

  // ── LOADING SCREEN ─────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <>
        <style>{S}</style>
        <div className="dash-loading">
          <div className="dash-spinner" />
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#6B6B6B' }}>Loading your dashboard…</p>
        </div>
      </>
    )
  }

  // ── NAV ITEMS ──────────────────────────────────────────────────────────────
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard',    href: '/dashboard'       },
    { icon: Search,          label: 'Find Workers', href: '/explore'         },
    { icon: Calendar,        label: 'My Orders',    href: '/orders', badge: stats.activeJobs > 0 ? stats.activeJobs : null },
    { icon: MessageSquare,   label: 'Messages',     href: '/chat'            },
    { icon: User,            label: 'Profile',      href: '/profile'         },
    { icon: Settings,        label: 'Settings',     href: '/settings'        },
  ]

  const initials = user?.displayName
    ? user.displayName.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U'

  const firstName = user?.displayName?.split(' ')[0] || 'there'

  return (
    <>
      <style>{S}</style>
      <div className="dash-container">

        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
            style={{ display: 'block' }}
          />
        )}

        {/* ── SIDEBAR ── */}
        <aside className={`dash-sidebar${isSidebarOpen ? ' open' : ''}`}>
          <div className="sidebar-header">
            <Link href="/" className="sidebar-logo">
              <Image src={Logo} alt="FixMate logo" width={36} height={36} />
              <span className="sidebar-logo-text">Fix<span>Mate</span></span>
            </Link>
          </div>

          <p className="sidebar-section-label">Menu</p>
          <nav className="sidebar-nav">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item${pathname === item.href ? ' active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={17} />
                {item.label}
                {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
              </Link>
            ))}
          </nav>

          <div className="sidebar-footer">
            {/* User info */}
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">{initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="sidebar-user-name">{user?.displayName || user?.email}</p>
                <p className="sidebar-user-role">Client</p>
              </div>
            </div>
            <button className="nav-item" onClick={handleLogout}>
              <LogOut size={17} /> Sign Out
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="dash-main">

          {/* Topbar */}
          <header className="dash-topbar">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <p className="dash-greeting">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},&nbsp;
              <span>{firstName}</span>
            </p>

            <div className="topbar-right">
              <Link href="/assistant" className="topbar-ai-btn">
                <Sparkles size={14} /> AI Assistant
              </Link>
              <Link href="/notifications" className="topbar-notif">
                <Bell size={17} />
                {unreadNotifs > 0 && (
                  <span className="notif-dot">{unreadNotifs > 9 ? '9+' : unreadNotifs}</span>
                )}
              </Link>
              <Link href="/profile">
                <div className="topbar-avatar">{initials}</div>
              </Link>
            </div>
          </header>

          {/* Body */}
          <div className="dash-body">

            {/* Search hero */}
            <div className="dash-search-hero">
              <div className="dash-search-glow" />
              <h2 className="dash-search-title">
                What do you need <em>fixed</em> today?
              </h2>
              <div className="dash-search-row">
                <div className="dash-search-field">
                  <Search size={17} color="rgba(255,255,255,0.4)" />
                  <input
                    type="text"
                    placeholder="e.g. leaking pipe, broken socket…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <button className="dash-search-btn" onClick={handleSearch}>
                  Find Worker
                </button>
              </div>
            </div>

            {/* Category pills */}
            <div className="cat-row">
              {categories.map(({ icon: Icon, name }) => (
                <Link
                  key={name}
                  href={`/explore?skill=${encodeURIComponent(name)}`}
                  className="cat-pill"
                >
                  <Icon size={14} /> {name}
                </Link>
              ))}
            </div>

            {/* Stats */}
            <div className="stats-strip">
              {[
                { icon: <Clock size={20} color="#FF5C1A" />,       bg: '#FFF3EE', val: bookingsLoading ? '—' : String(stats.activeJobs),   label: 'Active Jobs'    },
                { icon: <CheckCircle size={20} color="#16A34A" />, bg: '#F0FDF4', val: bookingsLoading ? '—' : String(stats.completedJobs), label: 'Completed Jobs' },
                { icon: <TrendingUp size={20} color="#2563EB" />,  bg: '#EEF6FF', val: bookingsLoading ? '—' : stats.avgRating > 0 ? String(stats.avgRating) + '★' : 'N/A', label: 'Avg Rating' },
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
                <Link href="/orders" className="section-link">
                  View all <ChevronRight size={14} />
                </Link>
              </div>

              {bookingsLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[1, 2].map(i => (
                    <div key={i} style={{ background: 'white', border: '1px solid #E8E6E1', borderRadius: 16, padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'center' }}>
                      <div className="skeleton" style={{ width: 46, height: 46, borderRadius: '50%', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 8 }} />
                        <div className="skeleton" style={{ height: 12, width: '40%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : bookings.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><BookOpen size={24} color="#AFAFAF" /></div>
                  <p className="empty-title">No bookings yet</p>
                  <p className="empty-sub">Find a skilled worker and make your first booking.</p>
                  <Link href="/explore" className="empty-btn">
                    <Search size={15} /> Find a Worker
                  </Link>
                </div>
              ) : (
                <div className="bookings-list">
                  {bookings.slice(0, 5).map(b => {
                    const st = statusStyle[b.status] || statusStyle.pending
                    return (
                      <Link key={b.id} href={`/orders/${b.id}`} className="booking-card">
                        <div className="booking-avatar" style={{ background: b.workerAvatarBg, color: b.workerAvatarColor }}>
                          {b.workerInitials}
                        </div>
                        <div className="booking-info">
                          <p className="booking-worker">{b.workerName}</p>
                          <div className="booking-meta">
                            <span>{b.skill}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Clock size={10} /> {b.date}
                            </span>
                            {b.location && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <MapPin size={10} /> {b.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="booking-status" style={{ background: st.bg, color: st.color }}>
                          {st.icon} {st.label}
                        </span>
                        <span className="booking-price">{b.price}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Recommended Workers */}
            <div>
              <div className="section-head">
                <p className="section-title">Top Workers Near You</p>
                <Link href="/explore" className="section-link">
                  See all <ChevronRight size={14} />
                </Link>
              </div>

              {workersLoading ? (
                <div className="workers-grid">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ background: 'white', border: '1px solid #E8E6E1', borderRadius: 16, padding: 18 }}>
                      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                        <div className="skeleton" style={{ width: 46, height: 46, borderRadius: '50%', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 8 }} />
                          <div className="skeleton" style={{ height: 12, width: '50%' }} />
                        </div>
                      </div>
                      <div className="skeleton" style={{ height: 12, marginBottom: 14 }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div className="skeleton" style={{ height: 14, width: '30%' }} />
                        <div className="skeleton" style={{ height: 30, width: '35%', borderRadius: 8 }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recommended.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><Search size={24} color="#AFAFAF" /></div>
                  <p className="empty-title">No workers available</p>
                  <p className="empty-sub">Check back soon or browse all workers.</p>
                  <Link href="/explore" className="empty-btn">Browse Workers</Link>
                </div>
              ) : (
                <div className="workers-grid">
                  {recommended.map(w => (
                    <Link key={w.id} href={`/explore/${w.id}`} className="worker-card">
                      <div className="wc-top">
                        <div className="wc-avatar" style={{ background: w.avatarBg || '#FFF3EE', color: w.avatarColor || '#FF5C1A' }}>
                          {w.initials || w.name?.charAt(0) || '?'}
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
                        <span className="wc-price">{w.currency || '$'}{w.price}/hr</span>
                        <span className="wc-book">Book Now</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </>
  )
}