'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { db, auth } from '@/lib/firebase'
import {
  collection, query, where, onSnapshot,
  orderBy, doc, updateDoc, serverTimestamp,
  getDoc, limit
} from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import toast, { Toaster } from 'react-hot-toast'
import {
  Bell, ChevronRight, MapPin, Star, Clock,
  CheckCircle, XCircle, Briefcase, MessageCircle,
  User, Settings, LogOut, BookOpen, ToggleLeft,
  ToggleRight, DollarSign, Calendar, AlertCircle,
  Loader2, LayoutDashboard, TrendingUp, Menu, X,
  Wallet, ChevronDown
} from 'lucide-react'

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface WorkerProfile {
  name: string; initials: string; email: string
  avatarBg: string; avatarColor: string; skill: string
  rating: number; jobs: number; available: boolean; currency: string
}

interface Booking {
  id: string; clientId: string; clientName: string
  clientInitials: string; clientAvatarBg: string; clientAvatarColor: string
  description: string; skill: string; location: string
  scheduledDate: string; scheduledTs: any
  price: number; currency: string
  status: 'pending' | 'accepted' | 'completed' | 'cancelled'
  rating?: number; createdAt: any
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatDate(ts: any): string {
  if (!ts) return 'Scheduled'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const now = new Date()
  const diff = (d.getTime() - now.getTime()) / 86400000
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  if (diff > 0 && diff < 1) return `Today · ${time}`
  if (diff >= 1 && diff < 2) return `Tomorrow · ${time}`
  if (diff < 0 && diff > -2) return `Yesterday · ${time}`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ` · ${time}`
}

function formatShortDate(ts: any): string {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'W'
}

const avatarPalettes = [
  { bg: '#EEF6FF', color: '#2563EB' }, { bg: '#F0FDF4', color: '#16A34A' },
  { bg: '#FFF8EE', color: '#D97706' }, { bg: '#F5F0FF', color: '#7C3AED' },
  { bg: '#FFF3EE', color: '#FF5C1A' },
]

// ─── NAV ITEMS ────────────────────────────────────────────────────────────────

const NAV = [
  { href: '/worker/dashboard',     label: 'Dashboard',    icon: LayoutDashboard, badge: 'requests' },
  { href: '/worker/jobs',          label: 'Jobs',         icon: Briefcase,       badge: 'active'   },
  { href: '/chat',                 label: 'Messages',     icon: MessageCircle,   badge: 'none'     },
  { href: '/worker/earnings',      label: 'Earnings',     icon: Wallet,          badge: 'none'     },
  { href: '/worker/profile',       label: 'Profile',      icon: User,            badge: 'none'     },
  { href: '/worker/notifications', label: 'Notifications',icon: Bell,            badge: 'notifs'   },
  { href: '/worker/settings',      label: 'Settings',     icon: Settings,        badge: 'none'     },
]

// ─── STYLES ───────────────────────────────────────────────────────────────────

const S = `
  * { box-sizing: border-box; }

  .wd-layout { display: flex; min-height: 100vh; background: #F5F4F1; }

  /* ── SIDEBAR ── */
  .wd-sidebar {
    width: 248px; background: #0F0F0F; display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; height: 100vh; z-index: 50;
    transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
  }
  .wd-sidebar.collapsed { transform: translateX(-100%); }

  .sidebar-logo { display: flex; align-items: center; gap: 10px; padding: 24px 20px 20px; text-decoration: none; }
  .sidebar-logo-icon { width: 30px; height: 30px; background: #FF5C1A; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .sidebar-logo-text { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: white; }
  .sidebar-logo-text span { color: #FF5C1A; }

  .sidebar-worker-card {
    margin: 0 12px 16px; padding: 14px 14px; border-radius: 14px;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
  }
  .sw-top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .sw-avatar { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; flex-shrink: 0; border: 2px solid rgba(255,92,26,0.4); }
  .sw-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sw-skill { font-size: 11px; color: rgba(255,255,255,0.45); }
  .sw-avail {
    width: 100%; display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 9px; padding: 7px 12px; cursor: pointer; transition: all 0.2s;
    font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; color: #6B6B6B;
    justify-content: center;
  }
  .sw-avail.on  { background: rgba(22,163,74,0.15); border-color: rgba(22,163,74,0.3); color: #22C55E; }
  .sw-avail.off { color: rgba(255,255,255,0.35); }
  .sw-avail:disabled { opacity: 0.6; cursor: not-allowed; }
  .avail-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

  .sidebar-nav { flex: 1; overflow-y: auto; padding: 0 12px; }
  .sidebar-nav::-webkit-scrollbar { display: none; }
  .sidebar-section-label {
    font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 600;
    color: rgba(255,255,255,0.25); letter-spacing: 1.2px; text-transform: uppercase;
    padding: 14px 8px 6px;
  }
  .nav-item {
    display: flex; align-items: center; gap: 11px;
    padding: 11px 12px; border-radius: 11px; margin-bottom: 2px;
    text-decoration: none; color: rgba(255,255,255,0.5);
    font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600;
    transition: all 0.18s; position: relative;
  }
  .nav-item:hover { background: rgba(255,255,255,0.06); color: white; }
  .nav-item.active { background: rgba(255,92,26,0.15); color: #FF5C1A; }
  .nav-item.active svg { color: #FF5C1A; }
  .nav-badge {
    margin-left: auto; min-width: 20px; height: 20px; border-radius: 10px;
    background: #FF5C1A; color: white;
    font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700;
    display: flex; align-items: center; justify-content: center; padding: 0 5px;
    flex-shrink: 0;
  }

  .sidebar-footer { padding: 12px; border-top: 1px solid rgba(255,255,255,0.06); }
  .sidebar-signout {
    display: flex; align-items: center; gap: 10px;
    width: 100%; padding: 11px 12px; border-radius: 11px;
    background: none; border: none; cursor: pointer;
    font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600;
    color: rgba(255,255,255,0.4); transition: all 0.18s;
  }
  .sidebar-signout:hover { background: rgba(239,68,68,0.12); color: #EF4444; }

  /* ── OVERLAY (mobile) ── */
  .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 49; backdrop-filter: blur(3px); }
  .sidebar-overlay.show { display: block; }

  /* ── MAIN ── */
  .wd-main { flex: 1; margin-left: 248px; display: flex; flex-direction: column; min-height: 100vh; }

  /* ── TOPBAR ── */
  .wd-topbar {
    background: white; border-bottom: 1px solid #E8E6E1;
    padding: 0 32px; height: 64px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    position: sticky; top: 0; z-index: 40;
  }
  .topbar-left { display: flex; align-items: center; gap: 14px; }
  .topbar-page-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 17px; color: #0F0F0F; }
  .topbar-page-sub { font-size: 12px; color: #6B6B6B; }
  .topbar-right { display: flex; align-items: center; gap: 10px; }
  .topbar-icon-btn { width: 38px; height: 38px; border-radius: 10px; background: #F5F4F1; border: 1px solid #E8E6E1; display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; transition: all 0.2s; color: #6B6B6B; text-decoration: none; }
  .topbar-icon-btn:hover { border-color: #FF5C1A; color: #FF5C1A; }
  .notif-badge { position: absolute; top: -4px; right: -4px; width: 16px; height: 16px; border-radius: 50%; background: #FF5C1A; border: 2px solid white; font-size: 9px; font-weight: 700; color: white; display: flex; align-items: center; justify-content: center; }
  .hamburger-btn { display: none; width: 38px; height: 38px; border-radius: 10px; background: #F5F4F1; border: 1px solid #E8E6E1; align-items: center; justify-content: center; cursor: pointer; color: #6B6B6B; }

  /* ── BODY ── */
  .wd-body { max-width: 1040px; margin: 0 auto; padding: 28px 32px; display: flex; flex-direction: column; gap: 24px; width: 100%; }

  /* EARNINGS HERO */
  .earnings-hero { background: #0F0F0F; border-radius: 20px; padding: 32px 40px; position: relative; overflow: hidden; display: grid; grid-template-columns: 1fr auto; gap: 36px; align-items: center; }
  .earnings-glow { position: absolute; top: -80px; right: -80px; width: 360px; height: 360px; border-radius: 50%; background: radial-gradient(circle, rgba(255,92,26,0.18) 0%, transparent 70%); pointer-events: none; }
  .earnings-label { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 600; color: rgba(255,92,26,0.8); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px; position: relative; }
  .earnings-amount { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(34px,4vw,48px); color: white; letter-spacing: -2px; margin-bottom: 6px; position: relative; }
  .earnings-amount em { color: #FF5C1A; font-style: normal; }
  .earnings-sub { font-size: 13px; color: rgba(255,255,255,0.4); font-weight: 300; position: relative; }
  .earnings-stats { display: flex; gap: 10px; flex-shrink: 0; }
  .e-stat { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 13px; padding: 16px 18px; text-align: center; min-width: 84px; }
  .e-stat-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: white; }
  .e-stat-val em { color: #FF5C1A; font-style: normal; }
  .e-stat-label { font-size: 10px; color: rgba(255,255,255,0.4); margin-top: 3px; }

  /* QUICK STATS */
  .quick-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
  .qs-card { background: white; border: 1px solid #E8E6E1; border-radius: 14px; padding: 18px; }
  .qs-icon { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
  .qs-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: #0F0F0F; }
  .qs-label { font-size: 12px; color: #6B6B6B; margin-top: 2px; }

  /* SECTION */
  .section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 17px; color: #0F0F0F; display: flex; align-items: center; gap: 10px; }
  .section-badge { font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 100px; font-family: 'Syne', sans-serif; }
  .section-link { display: flex; align-items: center; gap: 4px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #FF5C1A; text-decoration: none; transition: gap 0.2s; }
  .section-link:hover { gap: 7px; }

  /* REQUEST CARD */
  .request-card { background: white; border: 1px solid #E8E6E1; border-left: 3px solid #FF5C1A; border-radius: 16px; overflow: hidden; transition: all 0.2s; }
  .request-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07); }
  .request-main { padding: 18px 20px; display: flex; gap: 13px; align-items: flex-start; }
  .req-avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; flex-shrink: 0; }
  .req-info { flex: 1; min-width: 0; }
  .req-client { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; margin-bottom: 4px; }
  .req-desc { font-size: 13px; color: #6B6B6B; line-height: 1.6; font-weight: 300; margin-bottom: 9px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .req-meta { display: flex; flex-wrap: wrap; gap: 9px; }
  .req-meta-item { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #6B6B6B; }
  .req-budget { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #0F0F0F; flex-shrink: 0; }
  .req-new-badge { display: inline-flex; align-items: center; gap: 5px; background: #FFF3EE; border: 1px solid rgba(255,92,26,0.2); color: #FF5C1A; font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 100px; margin-bottom: 7px; }
  .request-footer { border-top: 1px solid #E8E6E1; padding: 12px 20px; display: flex; gap: 9px; background: #FAFAF8; }
  .accept-btn { display: flex; align-items: center; justify-content: center; gap: 6px; flex: 1; background: #FF5C1A; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 13px; border: none; border-radius: 9px; padding: 10px; cursor: pointer; transition: all 0.2s; }
  .accept-btn:hover:not(:disabled) { background: #FF7A40; }
  .accept-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .decline-btn { display: flex; align-items: center; justify-content: center; gap: 6px; background: transparent; color: #6B6B6B; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 13px; border: 1.5px solid #E8E6E1; border-radius: 9px; padding: 10px 16px; cursor: pointer; transition: all 0.2s; }
  .decline-btn:hover:not(:disabled) { border-color: #EF4444; color: #EF4444; background: #FEF2F2; }
  .decline-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .msg-btn { display: flex; align-items: center; justify-content: center; gap: 6px; background: transparent; color: #6B6B6B; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 13px; border: 1.5px solid #E8E6E1; border-radius: 9px; padding: 10px 14px; cursor: pointer; transition: all 0.2s; text-decoration: none; }
  .msg-btn:hover { border-color: #0F0F0F; color: #0F0F0F; }

  /* ACTIVE JOB */
  .active-job-card { background: white; border: 1.5px solid #FF5C1A; border-radius: 16px; overflow: hidden; margin-bottom: 12px; }
  .active-job-banner { background: linear-gradient(90deg, #FF5C1A, #FF7A40); padding: 9px 18px; display: flex; align-items: center; gap: 8px; }
  .active-job-banner-text { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px; color: white; }
  .active-job-body { padding: 16px 20px; display: flex; gap: 13px; align-items: center; }
  .aj-avatar { width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; flex-shrink: 0; }
  .aj-info { flex: 1; }
  .aj-desc { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; margin-bottom: 5px; }
  .aj-meta { display: flex; gap: 11px; flex-wrap: wrap; }
  .aj-meta-item { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #6B6B6B; }
  .aj-price { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #0F0F0F; }
  .active-job-footer { border-top: 1px solid #E8E6E1; padding: 12px 20px; display: flex; gap: 9px; background: #FFFBF9; }
  .complete-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px; background: #0F0F0F; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 13px; border: none; border-radius: 9px; padding: 11px; cursor: pointer; transition: background 0.2s; }
  .complete-btn:hover:not(:disabled) { background: #1A1A1A; }
  .complete-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  /* COMPLETED */
  .completed-list { display: flex; flex-direction: column; gap: 10px; }
  .completed-card { background: white; border: 1px solid #E8E6E1; border-radius: 13px; padding: 14px 18px; display: flex; align-items: center; gap: 13px; transition: all 0.2s; }
  .completed-card:hover { box-shadow: 0 3px 14px rgba(0,0,0,0.06); }
  .comp-avatar { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; flex-shrink: 0; }
  .comp-desc { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 13px; color: #0F0F0F; margin-bottom: 3px; }
  .comp-meta { display: flex; align-items: center; gap: 9px; }
  .comp-date { font-size: 11px; color: #6B6B6B; display: flex; align-items: center; gap: 3px; }
  .comp-rating { display: flex; align-items: center; gap: 3px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px; color: #0F0F0F; }
  .comp-price { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; margin-left: auto; flex-shrink: 0; }

  /* SKELETON */
  .skeleton { background: linear-gradient(90deg, #F5F4F1 25%, #E8E6E1 50%, #F5F4F1 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  /* LOADING */
  .loading-screen { height: 100vh; display: flex; align-items: center; justify-content: center; background: #F5F4F1; }
  .loading-spinner { width: 40px; height: 40px; border-radius: 50%; border: 3px solid #E8E6E1; border-top-color: #FF5C1A; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 1000px) {
    .wd-sidebar { transform: translateX(-100%); }
    .wd-sidebar.open { transform: translateX(0); }
    .wd-main { margin-left: 0; }
    .hamburger-btn { display: flex !important; }
    .earnings-hero { grid-template-columns: 1fr; padding: 24px; gap: 20px; }
    .earnings-stats { display: grid; grid-template-columns: repeat(3,1fr); }
    .quick-stats { grid-template-columns: repeat(2,1fr); }
  }
  @media (max-width: 600px) {
    .wd-topbar { padding: 0 16px; }
    .wd-body { padding: 18px 16px; }
    .quick-stats { grid-template-columns: 1fr 1fr; }
    .request-main { flex-wrap: wrap; }
  }
`

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function WorkerDashboard() {
  const router   = useRouter()
  const pathname = usePathname()

  const [authUser, setAuthUser]     = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [worker, setWorker]         = useState<WorkerProfile | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [pendingBookings, setPendingBookings]     = useState<Booking[]>([])
  const [activeBookings, setActiveBookings]       = useState<Booking[]>([])
  const [completedBookings, setCompletedBookings] = useState<Booking[]>([])
  const [dataLoading, setDataLoading]   = useState(true)
  const [available, setAvailable]       = useState(true)
  const [togglingAvail, setTogglingAvail] = useState(false)
  const [actioningId, setActioningId]   = useState<string | null>(null)
  const [unreadNotifs, setUnreadNotifs] = useState(0)

  // ── Auth ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { router.push('/login'); return }
      setAuthUser(u); setAuthLoading(false)
    })
    return () => unsub()
  }, [router])

  // ── Worker profile ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authUser) return
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, 'workers', authUser.uid))
        if (snap.exists()) {
          const d = snap.data() as any
          setWorker({
            name: d.name || authUser.displayName || 'Worker',
            initials: d.initials || getInitials(d.name || 'W'),
            email: d.email || authUser.email || '',
            avatarBg: d.avatarBg || '#FFF3EE', avatarColor: d.avatarColor || '#FF5C1A',
            skill: d.skill || 'Service', rating: d.rating || 5.0,
            jobs: d.jobs || 0, available: d.available ?? true, currency: d.currency || '£',
          })
          setAvailable(d.available ?? true)
        } else {
          const name = authUser.displayName || 'Worker'
          setWorker({ name, initials: getInitials(name), email: authUser.email || '',
            avatarBg: '#FFF3EE', avatarColor: '#FF5C1A', skill: 'Service',
            rating: 5.0, jobs: 0, available: true, currency: '£' })
        }
      } catch {}
    }
    fetch()
  }, [authUser])

  // ── Bookings realtime ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authUser) return

    const map = (d: any, id: string): Booking => {
      const p = avatarPalettes[Math.abs(id.charCodeAt(0)) % avatarPalettes.length]
      const clientName = d.clientName || 'Client'
      return {
        id, clientId: d.clientId || '', clientName,
        clientInitials: d.clientInitials || getInitials(clientName),
        clientAvatarBg: d.clientAvatarBg || p.bg,
        clientAvatarColor: d.clientAvatarColor || p.color,
        description: d.description || d.skill || 'Service',
        skill: d.skill || '', location: d.location || '',
        scheduledDate: formatDate(d.scheduledAt || d.createdAt),
        scheduledTs: d.scheduledAt, price: d.price || 0,
        currency: d.currency || '£', status: d.status || 'pending',
        rating: d.rating, createdAt: d.createdAt,
      }
    }

    const qP = query(collection(db,'bookings'), where('workerId','==',authUser.uid), where('status','==','pending'),    orderBy('createdAt','desc'))
    const qA = query(collection(db,'bookings'), where('workerId','==',authUser.uid), where('status','==','accepted'),   orderBy('createdAt','desc'))
    const qC = query(collection(db,'bookings'), where('workerId','==',authUser.uid), where('status','==','completed'),  orderBy('createdAt','desc'), limit(5))

    const u1 = onSnapshot(qP, s => { setPendingBookings(s.docs.map(d=>map(d.data(),d.id))); setDataLoading(false) }, ()=>setDataLoading(false))
    const u2 = onSnapshot(qA, s => setActiveBookings(s.docs.map(d=>map(d.data(),d.id))), ()=>{})
    const u3 = onSnapshot(qC, s => setCompletedBookings(s.docs.map(d=>map(d.data(),d.id))), ()=>{})

    return () => { u1(); u2(); u3() }
  }, [authUser])

  // ── Notifications count ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!authUser) return
    const q = query(collection(db,'notifications'), where('userId','==',authUser.uid), where('read','==',false))
    const unsub = onSnapshot(q, s => setUnreadNotifs(s.size), ()=>{})
    return () => unsub()
  }, [authUser])

  // ── Toggle availability ──────────────────────────────────────────────────────
  const toggleAvailability = async () => {
    if (!authUser || togglingAvail) return
    const next = !available; setAvailable(next); setTogglingAvail(true)
    try {
      await updateDoc(doc(db,'workers',authUser.uid), { available: next, updatedAt: serverTimestamp() })
      toast.success(next ? 'You are now available' : 'You are now offline')
    } catch { setAvailable(!next); toast.error('Could not update.') }
    finally { setTogglingAvail(false) }
  }

  // ── Accept / Decline / Complete ──────────────────────────────────────────────
  const handleAccept = async (id: string) => {
    setActioningId(id)
    try { await updateDoc(doc(db,'bookings',id), { status:'accepted', updatedAt: serverTimestamp() }); toast.success('Job accepted!') }
    catch { toast.error('Could not accept.') }
    finally { setActioningId(null) }
  }
  const handleDecline = async (id: string) => {
    setActioningId(id)
    try { await updateDoc(doc(db,'bookings',id), { status:'cancelled', updatedAt: serverTimestamp() }); toast.success('Declined.') }
    catch { toast.error('Could not decline.') }
    finally { setActioningId(null) }
  }
  const handleComplete = async (id: string) => {
    setActioningId(id)
    try {
      await updateDoc(doc(db,'bookings',id), { status:'completed', updatedAt: serverTimestamp() })
      const ws = await getDoc(doc(db,'workers',authUser.uid))
      if (ws.exists()) await updateDoc(doc(db,'workers',authUser.uid), { jobs: (ws.data().jobs||0)+1 })
      toast.success('Job completed!')
    } catch { toast.error('Could not complete.') }
    finally { setActioningId(null) }
  }

  const handleSignOut = async () => { await signOut(auth); router.push('/') }

  // ── Stats ────────────────────────────────────────────────────────────────────
  const now        = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEarnings = completedBookings
    .filter(b => { try { return (b.scheduledTs?.toDate?.() || new Date(b.scheduledTs)) >= monthStart } catch { return false } })
    .reduce((s, b) => s + b.price, 0)
  const totalEarnings = completedBookings.reduce((s, b) => s + b.price, 0)
  const ratings    = completedBookings.filter(b => b.rating).map(b => b.rating as number)
  const avgRating  = ratings.length ? Math.round(ratings.reduce((a,b)=>a+b,0)/ratings.length*10)/10 : worker?.rating||5.0
  const totalJobs  = pendingBookings.length + activeBookings.length + completedBookings.length
  const completion = totalJobs > 0 ? Math.round(completedBookings.length/totalJobs*100) : 100
  const currency   = worker?.currency || '£'

  const getBadge = (key: string) => {
    if (key === 'requests') return pendingBookings.length
    if (key === 'active')   return activeBookings.length
    if (key === 'notifs')   return unreadNotifs
    return 0
  }

  if (authLoading) return (
    <><style>{S}</style><div className="loading-screen"><div className="loading-spinner" /></div></>
  )

  const Sidebar = () => (
    <aside className={`wd-sidebar${sidebarOpen ? ' open' : ''}`}>
      {/* Logo */}
      <Link href="/" className="sidebar-logo" onClick={() => setSidebarOpen(false)}>
        <div className="sidebar-logo-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M13.78 15.3 19.78 21.3 21.89 19.14 15.89 13.14 13.78 15.3M17.5 10.1C17.11 10.1 16.69 10.05 16.36 9.96L4.97 21.25 2.86 19.14 8 14 6 12 7.07 10.93 9.15 13 10.09 12.06 8 10 9.07 8.93 11.15 11 12.09 10.06 10 8 11.07 6.93 13.15 9 14.3 7.85C14.1 7.31 14 6.71 14 6.1 14 3.32 16.24 1.1 19.02 1.1 19.72 1.1 20.34 1.27 20.95 1.52L18.31 4.16 19.95 5.79 22.59 3.15C22.84 3.75 23 4.37 23 5.07 23 7.85 20.78 10.07 18 10.07L17.5 10.1Z"/></svg>
        </div>
        <span className="sidebar-logo-text">Fix<span>Mate</span></span>
      </Link>

      {/* Worker card */}
      <div className="sidebar-worker-card">
        <div className="sw-top">
          <div className="sw-avatar" style={{ background: worker?.avatarBg||'#FFF3EE', color: worker?.avatarColor||'#FF5C1A' }}>
            {worker?.initials||'W'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="sw-name">{worker?.name||'Worker'}</p>
            <p className="sw-skill">{worker?.skill||'Professional'}</p>
          </div>
        </div>
        <button className={`sw-avail ${available ? 'on' : 'off'}`} onClick={toggleAvailability} disabled={togglingAvail}>
          {togglingAvail
            ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
            : <>
                <div className="avail-dot" style={{ background: available ? '#22C55E' : '#6B6B6B' }} />
                {available ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                {available ? 'Available' : 'Offline'}
              </>
          }
        </button>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <p className="sidebar-section-label">Menu</p>
        {NAV.map(item => {
          const Icon  = item.icon
          const badge = getBadge(item.badge)
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.href} href={item.href}
              className={`nav-item${isActive ? ' active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={17} />
              {item.label}
              {badge > 0 && <span className="nav-badge">{badge > 99 ? '99+' : badge}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 6 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: worker?.avatarBg||'#FFF3EE', color: worker?.avatarColor||'#FF5C1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13 }}>
            {worker?.initials||'W'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{worker?.name}</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{worker?.email}</p>
          </div>
        </div>
        <button className="sidebar-signout" onClick={handleSignOut}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  )

  return (
    <>
      <style>{S}</style>
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />

      <div className="wd-layout">
        <Sidebar />
        {sidebarOpen && <div className="sidebar-overlay show" onClick={() => setSidebarOpen(false)} />}

        <div className="wd-main">
          {/* ── TOPBAR ── */}
          <div className="wd-topbar">
            <div className="topbar-left">
              <button className="hamburger-btn" style={{ display: 'flex' }} onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
              <div>
                <p className="topbar-page-title">Dashboard</p>
                <p className="topbar-page-sub">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="topbar-right">
              <Link href="/worker/notifications" className="topbar-icon-btn">
                <Bell size={17} />
                {unreadNotifs > 0 && <div className="notif-badge">{unreadNotifs > 9 ? '9+' : unreadNotifs}</div>}
              </Link>
            </div>
          </div>

          {/* ── BODY ── */}
          <div className="wd-body">

            {/* Earnings hero */}
            <div className="earnings-hero">
              <div className="earnings-glow" />
              <div>
                <p className="earnings-label">This Month&apos;s Earnings</p>
                <p className="earnings-amount">{currency}<em>{monthEarnings.toLocaleString()}</em></p>
                <p className="earnings-sub">
                  {completedBookings.length} jobs completed · All time: {currency}{totalEarnings.toLocaleString()}
                </p>
              </div>
              <div className="earnings-stats">
                {[
                  { val: String(completedBookings.length), em: '',  label: 'Jobs Done'  },
                  { val: String(avgRating),                em: '★', label: 'Avg Rating' },
                  { val: String(completion),               em: '%', label: 'Completion' },
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
                { icon: <AlertCircle size={17} color="#FF5C1A" />, bg: '#FFF3EE', val: String(pendingBookings.length), label: 'New Requests' },
                { icon: <Clock size={17} color="#2563EB" />,       bg: '#EEF6FF', val: String(activeBookings.length),  label: 'Active Jobs'  },
                { icon: <DollarSign size={17} color="#16A34A" />,  bg: '#F0FDF4', val: `${currency}${totalEarnings.toLocaleString()}`, label: 'Total Earned' },
                { icon: <Star size={17} color="#F59E0B" />,        bg: '#FFF8EE', val: `${avgRating}★`,               label: 'Avg Rating'   },
              ].map(s => (
                <div key={s.label} className="qs-card">
                  <div className="qs-icon" style={{ background: s.bg }}>{s.icon}</div>
                  <div className="qs-val">{s.val}</div>
                  <div className="qs-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Active jobs */}
            {activeBookings.length > 0 && (
              <div>
                <div className="section-head">
                  <p className="section-title">
                    Active Job
                    <span className="section-badge" style={{ background: '#FFF3EE', color: '#FF5C1A' }}>{activeBookings.length}</span>
                  </p>
                </div>
                {activeBookings.map(job => (
                  <div key={job.id} className="active-job-card">
                    <div className="active-job-banner">
                      <Clock size={13} color="white" />
                      <p className="active-job-banner-text">In Progress · {job.scheduledDate}</p>
                    </div>
                    <div className="active-job-body">
                      <div className="aj-avatar" style={{ background: job.clientAvatarBg, color: job.clientAvatarColor }}>{job.clientInitials}</div>
                      <div className="aj-info">
                        <p className="aj-desc">{job.description}</p>
                        <div className="aj-meta">
                          <span className="aj-meta-item"><User size={11} />{job.clientName}</span>
                          {job.location && <span className="aj-meta-item"><MapPin size={11} />{job.location}</span>}
                        </div>
                      </div>
                      <p className="aj-price">{job.currency}{job.price}</p>
                    </div>
                    <div className="active-job-footer">
                      <button className="complete-btn" onClick={() => handleComplete(job.id)} disabled={actioningId === job.id}>
                        {actioningId===job.id ? <Loader2 size={14} style={{ animation:'spin 1s linear infinite' }} /> : <><CheckCircle size={15} /> Mark as Completed</>}
                      </button>
                      <Link href={`/chat/${job.clientId}`} className="msg-btn"><MessageCircle size={14} /> Chat</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* New requests */}
            <div>
              <div className="section-head">
                <p className="section-title">
                  New Requests
                  {pendingBookings.length > 0 && (
                    <span className="section-badge" style={{ background: '#FFF3EE', color: '#FF5C1A' }}>{pendingBookings.length}</span>
                  )}
                </p>
                <Link href="/worker/jobs" className="section-link">View all <ChevronRight size={13} /></Link>
              </div>

              {dataLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[1,2].map(i => (
                    <div key={i} style={{ background: 'white', border: '1px solid #E8E6E1', borderRadius: 16, padding: 20 }}>
                      <div style={{ display: 'flex', gap: 13 }}>
                        <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div className="skeleton" style={{ height: 13, width: '40%' }} />
                          <div className="skeleton" style={{ height: 11, width: '80%' }} />
                          <div className="skeleton" style={{ height: 11, width: '55%' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : pendingBookings.length === 0 ? (
                <div style={{ background: 'white', border: '1px solid #E8E6E1', borderRadius: 16, padding: '40px 24px', textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, background: '#F5F4F1', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <Briefcase size={24} color="#AFAFAF" />
                  </div>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#0F0F0F', marginBottom: 6 }}>No new requests</p>
                  <p style={{ fontSize: 13, color: '#6B6B6B', fontWeight: 300 }}>
                    {available ? 'New job requests will appear here.' : 'Turn on availability to receive requests.'}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {pendingBookings.map(job => (
                    <div key={job.id} className="request-card">
                      <div className="request-main">
                        <div className="req-avatar" style={{ background: job.clientAvatarBg, color: job.clientAvatarColor }}>{job.clientInitials}</div>
                        <div className="req-info">
                          <div className="req-new-badge"><AlertCircle size={9} /> New Request</div>
                          <p className="req-client">{job.clientName}</p>
                          <p className="req-desc">{job.description}</p>
                          <div className="req-meta">
                            {job.location && <span className="req-meta-item"><MapPin size={11} />{job.location}</span>}
                            <span className="req-meta-item"><Calendar size={11} />{job.scheduledDate}</span>
                          </div>
                        </div>
                        <p className="req-budget">{job.currency}{job.price}</p>
                      </div>
                      <div className="request-footer">
                        <button className="accept-btn" onClick={() => handleAccept(job.id)} disabled={actioningId===job.id}>
                          {actioningId===job.id ? <Loader2 size={14} style={{ animation:'spin 1s linear infinite' }} /> : <><CheckCircle size={14} /> Accept</>}
                        </button>
                        <Link href={`/chat/${job.clientId}`} className="msg-btn"><MessageCircle size={14} /> Chat</Link>
                        <button className="decline-btn" onClick={() => handleDecline(job.id)} disabled={actioningId===job.id}>
                          <XCircle size={14} /> Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed */}
            {completedBookings.length > 0 && (
              <div>
                <div className="section-head">
                  <p className="section-title">Recent Completed</p>
                  <Link href="/worker/jobs" className="section-link">View all <ChevronRight size={13} /></Link>
                </div>
                <div className="completed-list">
                  {completedBookings.map(job => (
                    <div key={job.id} className="completed-card">
                      <div className="comp-avatar" style={{ background: job.clientAvatarBg, color: job.clientAvatarColor }}>{job.clientInitials}</div>
                      <div style={{ flex: 1 }}>
                        <p className="comp-desc">{job.description}</p>
                        <div className="comp-meta">
                          <span className="comp-date"><Calendar size={10} />{formatShortDate(job.scheduledTs||job.createdAt)}</span>
                          {job.rating && <span className="comp-rating"><Star size={11} color="#F59E0B" fill="#F59E0B" />{job.rating}</span>}
                        </div>
                      </div>
                      <p className="comp-price">{job.currency}{job.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}