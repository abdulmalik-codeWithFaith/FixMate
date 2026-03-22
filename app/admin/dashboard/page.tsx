'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { db, auth } from '@/lib/firebase'
import {
  collection, query, where, orderBy, limit,
  onSnapshot, getDocs, doc, updateDoc,
  serverTimestamp, getCountFromServer
} from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import toast, { Toaster } from 'react-hot-toast'
import {
  LayoutDashboard, Users, Briefcase, MessageCircle,
  DollarSign, ShieldCheck, Bell, Settings, LogOut,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  XCircle, Clock, Star, MapPin, Search, Menu, X,
  ChevronRight, MoreHorizontal, RefreshCw, Eye,
  UserCheck, UserX, Loader2, Activity
} from 'lucide-react'

// ─── STYLES ───────────────────────────────────────────────────────────────────

const S = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .admin-layout {
    display: flex; min-height: 100vh;
    font-family: 'DM Sans', sans-serif;
    background: #F5F4F1;
  }

  /* ── SIDEBAR ─────────────────────────────────────────── */
  .admin-sidebar {
    width: 256px; flex-shrink: 0;
    background: #0F0F0F;
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0;
    z-index: 50; overflow-y: auto;
    transition: transform 0.3s;
  }
  .admin-sidebar.hidden { transform: translateX(-100%); }

  .sb-logo {
    display: flex; align-items: center; gap: 11px;
    padding: 26px 22px 20px; border-bottom: 1px solid rgba(255,255,255,0.07);
    text-decoration: none;
  }
  .sb-logo-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: #FF5C1A;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .sb-logo-text {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 17px; color: white; letter-spacing: -0.5px;
  }
  .sb-logo-text em { color: #FF5C1A; font-style: normal; }
  .sb-logo-badge {
    margin-left: auto; background: rgba(255,92,26,0.15);
    border: 1px solid rgba(255,92,26,0.3); color: #FF5C1A;
    font-family: 'Syne', sans-serif; font-size: 9px; font-weight: 700;
    letter-spacing: 1px; text-transform: uppercase;
    padding: 3px 7px; border-radius: 6px; white-space: nowrap;
  }

  .sb-section-label {
    font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700;
    letter-spacing: 1.5px; text-transform: uppercase;
    color: rgba(255,255,255,0.25);
    padding: 18px 22px 8px;
  }

  .sb-nav-item {
    display: flex; align-items: center; gap: 11px;
    padding: 11px 22px; margin: 1px 10px; border-radius: 10px;
    cursor: pointer; text-decoration: none; color: rgba(255,255,255,0.5);
    font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600;
    transition: all 0.15s; position: relative;
  }
  .sb-nav-item:hover { background: rgba(255,255,255,0.06); color: white; }
  .sb-nav-item.active {
    background: rgba(255,92,26,0.15); color: #FF5C1A;
    border: 1px solid rgba(255,92,26,0.2);
  }
  .sb-nav-item.active .sb-nav-icon { color: #FF5C1A; }
  .sb-nav-icon { flex-shrink: 0; }
  .sb-nav-badge {
    margin-left: auto;
    min-width: 20px; height: 20px; border-radius: 10px;
    background: #FF5C1A; color: white;
    font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700;
    display: flex; align-items: center; justify-content: center; padding: 0 5px;
  }
  .sb-nav-badge.gray { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.5); }

  .sb-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 10px 22px; }

  .sb-user {
    padding: 16px 22px; margin-top: auto;
    border-top: 1px solid rgba(255,255,255,0.07);
    display: flex; align-items: center; gap: 11px;
  }
  .sb-user-avatar {
    width: 36px; height: 36px; border-radius: 10px;
    background: #FF5C1A; display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 14px; color: white;
    flex-shrink: 0;
  }
  .sb-user-name {
    font-family: 'Syne', sans-serif; font-weight: 700;
    font-size: 13px; color: white;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .sb-user-role { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 1px; }
  .sb-logout {
    margin-left: auto; background: none; border: none;
    color: rgba(255,255,255,0.3); cursor: pointer;
    display: flex; padding: 4px; border-radius: 6px;
    transition: color 0.2s;
  }
  .sb-logout:hover { color: #EF4444; }

  /* ── MAIN CONTENT ────────────────────────────────────── */
  .admin-main {
    flex: 1; margin-left: 256px;
    display: flex; flex-direction: column; min-height: 100vh;
    transition: margin-left 0.3s;
  }
  .admin-main.full { margin-left: 0; }

  /* ── TOPBAR ──────────────────────────────────────────── */
  .admin-topbar {
    background: white; border-bottom: 1px solid #E8E6E1;
    padding: 0 32px; height: 64px;
    display: flex; align-items: center; gap: 16px;
    position: sticky; top: 0; z-index: 40;
  }
  .topbar-hamburger {
    display: none; background: none; border: none;
    cursor: pointer; color: #6B6B6B; padding: 6px;
    border-radius: 8px;
  }
  .topbar-hamburger:hover { background: #F5F4F1; }
  .topbar-title {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 18px; color: #0F0F0F; letter-spacing: -0.5px;
  }
  .topbar-subtitle { font-size: 13px; color: #6B6B6B; font-weight: 300; }
  .topbar-right { display: flex; align-items: center; gap: 10px; margin-left: auto; }
  .topbar-refresh {
    display: flex; align-items: center; gap: 6px;
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
    color: #6B6B6B; background: none; border: 1.5px solid #E8E6E1;
    border-radius: 9px; padding: 7px 14px; cursor: pointer; transition: all 0.2s;
  }
  .topbar-refresh:hover { border-color: #FF5C1A; color: #FF5C1A; }
  .topbar-icon-btn {
    width: 38px; height: 38px; border-radius: 10px;
    background: #F5F4F1; border: 1px solid #E8E6E1;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #6B6B6B; transition: all 0.2s; position: relative;
  }
  .topbar-icon-btn:hover { border-color: #FF5C1A; color: #FF5C1A; }
  .topbar-notif-dot {
    position: absolute; top: 7px; right: 7px;
    width: 8px; height: 8px; border-radius: 50%;
    background: #EF4444; border: 2px solid white;
  }

  /* ── BODY ────────────────────────────────────────────── */
  .admin-body { padding: 28px 32px; flex: 1; }

  /* ── STAT CARDS ──────────────────────────────────────── */
  .stat-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 16px; margin-bottom: 28px;
  }
  .stat-card {
    background: white; border: 1px solid #E8E6E1;
    border-radius: 16px; padding: 22px;
  }
  .stat-card-top {
    display: flex; align-items: center;
    justify-content: space-between; margin-bottom: 16px;
  }
  .stat-icon-wrap {
    width: 42px; height: 42px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
  }
  .stat-trend {
    display: flex; align-items: center; gap: 4px;
    font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700;
    padding: 4px 9px; border-radius: 100px;
  }
  .stat-trend.up { background: #F0FDF4; color: #16A34A; }
  .stat-trend.down { background: #FEF2F2; color: #EF4444; }
  .stat-val {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 30px; color: #0F0F0F; letter-spacing: -1px;
    margin-bottom: 4px;
  }
  .stat-label { font-size: 13px; color: #6B6B6B; font-weight: 300; }

  /* ── TWO-COL GRID ─────────────────────────────────────── */
  .dash-grid {
    display: grid; grid-template-columns: 1fr 360px;
    gap: 20px; margin-bottom: 20px;
  }
  .dash-grid-full { margin-bottom: 20px; }

  /* ── CARDS ───────────────────────────────────────────── */
  .dash-card {
    background: white; border: 1px solid #E8E6E1;
    border-radius: 16px; overflow: hidden;
  }
  .card-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 22px; border-bottom: 1px solid #E8E6E1;
  }
  .card-title {
    font-family: 'Syne', sans-serif; font-weight: 700;
    font-size: 15px; color: #0F0F0F;
  }
  .card-action {
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
    color: #FF5C1A; background: none; border: none; cursor: pointer;
    text-decoration: none; display: flex; align-items: center; gap: 4px;
    transition: gap 0.2s;
  }
  .card-action:hover { gap: 7px; }

  /* ── BOOKING ROWS ────────────────────────────────────── */
  .booking-row {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 22px; border-bottom: 1px solid #F5F4F1;
    transition: background 0.15s;
  }
  .booking-row:last-child { border-bottom: none; }
  .booking-row:hover { background: #FAFAF8; }
  .booking-avatar {
    width: 40px; height: 40px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px;
    flex-shrink: 0;
  }
  .booking-info { flex: 1; min-width: 0; }
  .booking-names {
    font-family: 'Syne', sans-serif; font-weight: 600;
    font-size: 14px; color: #0F0F0F; margin-bottom: 3px;
  }
  .booking-meta {
    font-size: 12px; color: #6B6B6B;
    display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  }
  .booking-status {
    display: inline-flex; align-items: center; gap: 4px;
    font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700;
    padding: 3px 9px; border-radius: 100px;
  }
  .booking-price {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 15px; color: #0F0F0F; flex-shrink: 0;
  }

  /* ── USER ROWS ───────────────────────────────────────── */
  .user-row {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 22px; border-bottom: 1px solid #F5F4F1;
    transition: background 0.15s;
  }
  .user-row:last-child { border-bottom: none; }
  .user-row:hover { background: #FAFAF8; }
  .user-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px;
    flex-shrink: 0;
  }
  .user-info { flex: 1; min-width: 0; }
  .user-name {
    font-family: 'Syne', sans-serif; font-weight: 600;
    font-size: 13px; color: #0F0F0F; margin-bottom: 2px;
  }
  .user-skill { font-size: 11px; color: #6B6B6B; }
  .user-rating {
    display: flex; align-items: center; gap: 3px;
    font-family: 'Syne', sans-serif; font-weight: 700;
    font-size: 12px; color: #0F0F0F; flex-shrink: 0;
  }
  .user-action-btn {
    background: none; border: 1.5px solid #E8E6E1;
    border-radius: 7px; padding: 5px 10px;
    font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600;
    color: #6B6B6B; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; gap: 5px; flex-shrink: 0;
  }
  .user-action-btn:hover { border-color: #FF5C1A; color: #FF5C1A; }
  .user-action-btn.danger:hover { border-color: #EF4444; color: #EF4444; }

  /* ── ALERT ROWS ──────────────────────────────────────── */
  .alert-row {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 14px 22px; border-bottom: 1px solid #F5F4F1;
  }
  .alert-row:last-child { border-bottom: none; }
  .alert-dot {
    width: 8px; height: 8px; border-radius: 50%;
    flex-shrink: 0; margin-top: 5px;
  }
  .alert-content { flex: 1; }
  .alert-title {
    font-family: 'Syne', sans-serif; font-weight: 600;
    font-size: 13px; color: #0F0F0F; margin-bottom: 3px;
  }
  .alert-sub { font-size: 12px; color: #6B6B6B; }
  .alert-time { font-size: 11px; color: #AFAFAF; margin-top: 3px; }

  /* ── ACTIVITY BAR ────────────────────────────────────── */
  .activity-bar-wrap { padding: 20px 22px; }
  .activity-bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
  .activity-bar-row:last-child { margin-bottom: 0; }
  .activity-bar-label {
    font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600;
    color: #6B6B6B; width: 70px; flex-shrink: 0;
  }
  .activity-bar-track {
    flex: 1; height: 8px; background: #F5F4F1;
    border-radius: 100px; overflow: hidden;
  }
  .activity-bar-fill {
    height: 100%; border-radius: 100px;
    transition: width 1s ease;
  }
  .activity-bar-val {
    font-family: 'Syne', sans-serif; font-weight: 700;
    font-size: 12px; color: #0F0F0F; width: 36px;
    text-align: right; flex-shrink: 0;
  }

  /* ── EMPTY STATE ─────────────────────────────────────── */
  .empty-state {
    padding: 40px 20px; text-align: center;
  }
  .empty-icon {
    width: 56px; height: 56px; border-radius: 16px;
    background: #F5F4F1; display: flex; align-items: center; justify-content: center;
    margin: 0 auto 14px;
  }
  .empty-text {
    font-family: 'Syne', sans-serif; font-weight: 600;
    font-size: 14px; color: #AFAFAF;
  }

  /* ── SKELETON ─────────────────────────────────────────── */
  .skeleton {
    background: linear-gradient(90deg, #F5F4F1 25%, #E8E6E1 50%, #F5F4F1 75%);
    background-size: 200% 100%; animation: shimmer 1.4s infinite;
    border-radius: 8px;
  }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  /* ── LOADING ─────────────────────────────────────────── */
  .loading-screen {
    height: 100vh; display: flex; align-items: center; justify-content: center;
    background: #F5F4F1;
  }
  .loading-spinner {
    width: 40px; height: 40px; border-radius: 50%;
    border: 3px solid #E8E6E1; border-top-color: #FF5C1A;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── OVERLAY (mobile) ────────────────────────────────── */
  .sidebar-overlay {
    display: none; position: fixed; inset: 0;
    background: rgba(0,0,0,0.5); z-index: 49;
  }
  .sidebar-overlay.show { display: block; }

  /* ── RESPONSIVE ──────────────────────────────────────── */
  @media (max-width: 1100px) {
    .stat-grid { grid-template-columns: repeat(2, 1fr); }
    .dash-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 900px) {
    .admin-sidebar { transform: translateX(-100%); }
    .admin-sidebar.open { transform: translateX(0); }
    .admin-main { margin-left: 0; }
    .topbar-hamburger { display: flex; }
    .admin-body { padding: 20px 16px; }
    .admin-topbar { padding: 0 16px; }
  }
  @media (max-width: 600px) {
    .stat-grid { grid-template-columns: 1fr 1fr; }
  }
`

// ─── STATUS CONFIG ─────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: 'Pending',   bg: '#FFF8EE', color: '#D97706', icon: <Clock size={10} />       },
  accepted:  { label: 'Active',    bg: '#EEF6FF', color: '#2563EB', icon: <Activity size={10} />    },
  completed: { label: 'Completed', bg: '#F0FDF4', color: '#16A34A', icon: <CheckCircle size={10} /> },
  cancelled: { label: 'Cancelled', bg: '#FEF2F2', color: '#EF4444', icon: <XCircle size={10} />     },
}

const palettes = [
  { bg: '#FFF3EE', color: '#FF5C1A' }, { bg: '#EEF6FF', color: '#2563EB' },
  { bg: '#F0FDF4', color: '#16A34A' }, { bg: '#FFF8EE', color: '#D97706' },
  { bg: '#F5F0FF', color: '#7C3AED' },
]

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?'
}
function formatTs(ts: any) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const diff = (Date.now() - d.getTime()) / 60000
  if (diff < 1)   return 'Just now'
  if (diff < 60)  return `${Math.round(diff)}m ago`
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ─── NAV ──────────────────────────────────────────────────────────────────────

const NAV = [
  { href: '/admin/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/admin/users',      label: 'Users',       icon: Users           },
  { href: '/admin/workers',    label: 'Workers',     icon: UserCheck       },
  { href: '/admin/bookings',   label: 'Bookings',    icon: Briefcase       },
  { href: '/admin/messages',   label: 'Messages',    icon: MessageCircle   },
  { href: '/admin/revenue',    label: 'Revenue',     icon: DollarSign      },
  { href: '/admin/settings',   label: 'Settings',    icon: Settings        },
]

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const router   = useRouter()
  const pathname = usePathname()

  const [authUser, setAuthUser]     = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Data states
  const [stats, setStats]           = useState({ workers: 0, clients: 0, bookings: 0, revenue: 0 })
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [recentWorkers, setRecentWorkers]   = useState<any[]>([])
  const [alerts, setAlerts]         = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [actioningId, setActioningId] = useState<string | null>(null)

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push('/admin/login'); return }
      // Verify admin role
      try {
        const { getDoc } = await import('firebase/firestore')
        const snap = await getDoc(doc(db, 'users', u.uid))
        if (!snap.exists() || snap.data().role !== 'admin') {
          await signOut(auth); router.push('/admin/login'); return
        }
      } catch { await signOut(auth); router.push('/admin/login'); return }
      setAuthUser(u)
      setAuthLoading(false)
    })
    return () => unsub()
  }, [router])

  // ── Fetch platform stats ────────────────────────────────────────────────────
  useEffect(() => {
    if (!authUser) return
    const fetchStats = async () => {
      try {
        const [wSnap, uSnap, bSnap] = await Promise.all([
          getCountFromServer(collection(db, 'workers')),
          getCountFromServer(query(collection(db, 'users'), where('role', '==', 'client'))),
          getCountFromServer(collection(db, 'bookings')),
        ])
        // Revenue: sum all completed bookings
        const revSnap = await getDocs(query(
          collection(db, 'bookings'), where('status', '==', 'completed')
        ))
        const revenue = revSnap.docs.reduce((s, d) => s + (d.data().price || 0), 0)
        setStats({
          workers:  wSnap.data().count,
          clients:  uSnap.data().count,
          bookings: bSnap.data().count,
          revenue,
        })
      } catch (err) { console.error('Stats error:', err) }
    }
    fetchStats()
  }, [authUser])

  // ── Real-time recent bookings ───────────────────────────────────────────────
  useEffect(() => {
    if (!authUser) return
    const q = query(
      collection(db, 'bookings'),
      orderBy('createdAt', 'desc'),
      limit(8)
    )
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => {
        const b = d.data() as any
        const p = palettes[Math.abs(d.id.charCodeAt(0)) % palettes.length]
        return {
          id:           d.id,
          clientName:   b.clientName   || 'Client',
          workerName:   b.workerName   || 'Worker',
          skill:        b.skill        || 'Service',
          status:       b.status       || 'pending',
          price:        b.price        || 0,
          currency:     b.currency     || '£',
          location:     b.location     || '',
          createdAt:    b.createdAt,
          avatarBg:     b.workerAvatarBg    || p.bg,
          avatarColor:  b.workerAvatarColor || p.color,
          initials:     b.workerInitials    || getInitials(b.workerName || 'W'),
        }
      })
      setRecentBookings(data)
      setDataLoading(false)
    })
    return () => unsub()
  }, [authUser])

  // ── Recent workers ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authUser) return
    const q = query(
      collection(db, 'workers'),
      orderBy('createdAt', 'desc'),
      limit(6)
    )
    const unsub = onSnapshot(q, (snap) => {
      setRecentWorkers(snap.docs.map(d => ({ id: d.id, ...d.data() as any })))
    })
    return () => unsub()
  }, [authUser])

  // ── Mock alerts (replace with real /notifications or /flags collection) ─────
  useEffect(() => {
    setAlerts([
      { id: '1', title: 'New worker registration', sub: 'James Okafor (Electrician) awaiting verification', time: '2m ago', color: '#2563EB' },
      { id: '2', title: 'Booking dispute raised', sub: 'Client reported incomplete job #AB2341', time: '18m ago', color: '#EF4444' },
      { id: '3', title: 'High-value booking', sub: 'Generator repair booked for £420', time: '1h ago', color: '#16A34A' },
      { id: '4', title: 'Worker suspended by system', sub: 'Rating dropped below threshold (2.1)', time: '3h ago', color: '#D97706' },
    ])
  }, [])

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleToggleWorker = async (workerId: string, currentStatus: boolean) => {
    setActioningId(workerId)
    try {
      await updateDoc(doc(db, 'workers', workerId), {
        available: !currentStatus,
        updatedAt: serverTimestamp(),
      })
      toast.success(currentStatus ? 'Worker suspended' : 'Worker reinstated')
    } catch { toast.error('Action failed') }
    finally { setActioningId(null) }
  }

  const handleSignOut = async () => {
    await signOut(auth); router.push('/admin/login')
  }

  if (authLoading) {
    return <><style>{S}</style><div className="loading-screen"><div className="loading-spinner" /></div></>
  }

  const adminInitials = getInitials(authUser?.displayName || authUser?.email || 'Admin')

  // Activity breakdown (based on booking statuses)
  const pendingCount   = recentBookings.filter(b => b.status === 'pending').length
  const activeCount    = recentBookings.filter(b => b.status === 'accepted').length
  const completedCount = recentBookings.filter(b => b.status === 'completed').length
  const total          = recentBookings.length || 1

  return (
    <>
      <style>{S}</style>
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />

      <div className="admin-layout">
        {/* ── SIDEBAR OVERLAY (mobile) ── */}
        <div
          className={`sidebar-overlay${sidebarOpen ? ' show' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* ── SIDEBAR ── */}
        <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
          <Link href="/admin/dashboard" className="sb-logo">
            <div className="sb-logo-icon">
              <ShieldCheck size={18} color="white" />
            </div>
            <span className="sb-logo-text">Fix<em>Mate</em></span>
            <span className="sb-logo-badge">Admin</span>
          </Link>

          <div className="sb-section-label">Main</div>
          {NAV.map(item => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sb-nav-item${active ? ' active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={17} className="sb-nav-icon" />
                {item.label}
                {item.label === 'Bookings' && stats.bookings > 0 && (
                  <span className="sb-nav-badge gray">{stats.bookings}</span>
                )}
                {item.label === 'Workers' && stats.workers > 0 && (
                  <span className="sb-nav-badge gray">{stats.workers}</span>
                )}
              </Link>
            )
          })}

          <div className="sb-divider" />
          <div className="sb-section-label">System</div>
          <div className="sb-nav-item" onClick={() => {}}>
            <Bell size={17} className="sb-nav-icon" />
            Alerts
            <span className="sb-nav-badge">{alerts.length}</span>
          </div>

          {/* User block */}
          <div className="sb-user">
            <div className="sb-user-avatar">{adminInitials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sb-user-name">
                {authUser?.displayName || authUser?.email?.split('@')[0] || 'Admin'}
              </div>
              <div className="sb-user-role">Super Administrator</div>
            </div>
            <button className="sb-logout" onClick={handleSignOut} title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="admin-main">
          {/* TOPBAR */}
          <div className="admin-topbar">
            <button className="topbar-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <div className="topbar-title">Admin Dashboard</div>
              <div className="topbar-subtitle">Platform overview — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
            </div>
            <div className="topbar-right">
              <button className="topbar-refresh" onClick={() => window.location.reload()}>
                <RefreshCw size={13} /> Refresh
              </button>
              <div className="topbar-icon-btn">
                <Bell size={17} />
                <div className="topbar-notif-dot" />
              </div>
              <div className="topbar-icon-btn">
                <Search size={17} />
              </div>
            </div>
          </div>

          <div className="admin-body">
            {/* ── STAT CARDS ── */}
            <div className="stat-grid">
              {[
                {
                  label: 'Total Workers',
                  value: stats.workers.toLocaleString(),
                  icon: <UserCheck size={20} color="#FF5C1A" />,
                  bg: '#FFF3EE', trend: '+12%', up: true,
                },
                {
                  label: 'Total Clients',
                  value: stats.clients.toLocaleString(),
                  icon: <Users size={20} color="#2563EB" />,
                  bg: '#EEF6FF', trend: '+8%', up: true,
                },
                {
                  label: 'Total Bookings',
                  value: stats.bookings.toLocaleString(),
                  icon: <Briefcase size={20} color="#16A34A" />,
                  bg: '#F0FDF4', trend: '+23%', up: true,
                },
                {
                  label: 'Platform Revenue',
                  value: `£${stats.revenue.toLocaleString()}`,
                  icon: <DollarSign size={20} color="#D97706" />,
                  bg: '#FFF8EE', trend: '-3%', up: false,
                },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div className="stat-card-top">
                    <div className="stat-icon-wrap" style={{ background: s.bg }}>{s.icon}</div>
                    <div className={`stat-trend ${s.up ? 'up' : 'down'}`}>
                      {s.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {s.trend}
                    </div>
                  </div>
                  <div className="stat-val">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* ── MAIN GRID ── */}
            <div className="dash-grid">
              {/* Recent Bookings */}
              <div className="dash-card">
                <div className="card-header">
                  <div className="card-title">Recent Bookings</div>
                  <Link href="/admin/bookings" className="card-action">
                    View all <ChevronRight size={14} />
                  </Link>
                </div>
                {dataLoading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 22px', borderBottom: '1px solid #F5F4F1' }}>
                      <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div className="skeleton" style={{ height: 13, width: '60%' }} />
                        <div className="skeleton" style={{ height: 11, width: '40%' }} />
                      </div>
                    </div>
                  ))
                ) : recentBookings.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon"><Briefcase size={22} color="#AFAFAF" /></div>
                    <div className="empty-text">No bookings yet</div>
                  </div>
                ) : recentBookings.map(b => {
                  const st = statusConfig[b.status] || statusConfig.pending
                  return (
                    <div key={b.id} className="booking-row">
                      <div className="booking-avatar" style={{ background: b.avatarBg, color: b.avatarColor }}>
                        {b.initials}
                      </div>
                      <div className="booking-info">
                        <div className="booking-names">{b.clientName} → {b.workerName}</div>
                        <div className="booking-meta">
                          <span className="booking-status" style={{ background: st.bg, color: st.color }}>
                            {st.icon} {st.label}
                          </span>
                          <span>{b.skill}</span>
                          {b.location && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={10} />{b.location}</span>}
                          <span style={{ color: '#AFAFAF' }}>{formatTs(b.createdAt)}</span>
                        </div>
                      </div>
                      <div className="booking-price">{b.currency}{b.price}</div>
                    </div>
                  )
                })}
              </div>

              {/* Right column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Booking Activity */}
                <div className="dash-card">
                  <div className="card-header">
                    <div className="card-title">Booking Activity</div>
                  </div>
                  <div className="activity-bar-wrap">
                    {[
                      { label: 'Pending',   val: pendingCount,   pct: Math.round(pendingCount / total * 100),   color: '#F59E0B' },
                      { label: 'Active',    val: activeCount,    pct: Math.round(activeCount / total * 100),    color: '#2563EB' },
                      { label: 'Done',      val: completedCount, pct: Math.round(completedCount / total * 100), color: '#16A34A' },
                    ].map(a => (
                      <div key={a.label} className="activity-bar-row">
                        <div className="activity-bar-label">{a.label}</div>
                        <div className="activity-bar-track">
                          <div className="activity-bar-fill" style={{ width: `${a.pct}%`, background: a.color }} />
                        </div>
                        <div className="activity-bar-val">{a.val}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alerts */}
                <div className="dash-card">
                  <div className="card-header">
                    <div className="card-title">Platform Alerts</div>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 700, background: '#FEF2F2', color: '#EF4444', padding: '3px 9px', borderRadius: 100 }}>
                      {alerts.length} new
                    </span>
                  </div>
                  {alerts.map(a => (
                    <div key={a.id} className="alert-row">
                      <div className="alert-dot" style={{ background: a.color }} />
                      <div className="alert-content">
                        <div className="alert-title">{a.title}</div>
                        <div className="alert-sub">{a.sub}</div>
                        <div className="alert-time">{a.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RECENT WORKERS ── */}
            <div className="dash-card dash-grid-full">
              <div className="card-header">
                <div className="card-title">Recent Workers</div>
                <Link href="/admin/workers" className="card-action">
                  Manage all <ChevronRight size={14} />
                </Link>
              </div>
              {recentWorkers.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><UserCheck size={22} color="#AFAFAF" /></div>
                  <div className="empty-text">No workers registered yet</div>
                </div>
              ) : recentWorkers.map((w, i) => {
                const p = palettes[i % palettes.length]
                const isActioning = actioningId === w.id
                return (
                  <div key={w.id} className="user-row">
                    <div className="user-avatar" style={{ background: w.avatarBg || p.bg, color: w.avatarColor || p.color }}>
                      {w.initials || getInitials(w.name || 'W')}
                    </div>
                    <div className="user-info">
                      <div className="user-name">{w.name || '—'}</div>
                      <div className="user-skill">{w.skill || 'General'} · {w.location || '—'}</div>
                    </div>
                    <div className="user-rating">
                      <Star size={12} color="#F59E0B" fill="#F59E0B" />
                      {(w.rating || 5).toFixed(1)}
                    </div>
                    <span style={{
                      fontFamily: 'Syne, sans-serif', fontSize: 11, fontWeight: 700,
                      padding: '3px 9px', borderRadius: 100,
                      background: w.available !== false ? '#F0FDF4' : '#F5F4F1',
                      color:      w.available !== false ? '#16A34A' : '#6B6B6B',
                      marginLeft: 8,
                    }}>
                      {w.available !== false ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      className={`user-action-btn${w.available !== false ? ' danger' : ''}`}
                      style={{ marginLeft: 8 }}
                      onClick={() => handleToggleWorker(w.id, w.available !== false)}
                      disabled={isActioning}
                    >
                      {isActioning
                        ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                        : w.available !== false
                          ? <><UserX size={12} /> Suspend</>
                          : <><UserCheck size={12} /> Reinstate</>
                      }
                    </button>
                    <button className="user-action-btn" style={{ marginLeft: 6 }}>
                      <Eye size={12} /> View
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}