'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { db, auth } from '@/lib/firebase'
import {
  collection, query, where, orderBy, onSnapshot,
  doc, getDocs
} from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import toast, { Toaster } from 'react-hot-toast'
import {
  LayoutDashboard, Users, Briefcase, MessageCircle,
  DollarSign, ShieldCheck, Settings, LogOut,
  Menu, X, TrendingUp, TrendingDown, RefreshCw,
  Download, Calendar, Banknote, ArrowUpRight,
  ArrowDownRight, CheckCircle, Clock, UserCheck,
  ChevronLeft, ChevronRight, Star
} from 'lucide-react'

const SIDEBAR_CSS = `
  .admin-sidebar { width: 256px; flex-shrink: 0; background: #0F0F0F; display: flex; flex-direction: column; position: fixed; top: 0; left: 0; bottom: 0; z-index: 50; overflow-y: auto; transition: transform 0.3s; }
  .admin-sidebar.sb-open { transform: translateX(0) !important; }
  .sb-logo { display: flex; align-items: center; gap: 11px; padding: 26px 22px 20px; border-bottom: 1px solid rgba(255,255,255,0.07); text-decoration: none; }
  .sb-logo-icon { width: 36px; height: 36px; border-radius: 10px; background: #FF5C1A; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .sb-logo-text { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 17px; color: white; letter-spacing: -0.5px; }
  .sb-logo-text em { color: #FF5C1A; font-style: normal; }
  .sb-logo-badge { margin-left: auto; background: rgba(255,92,26,0.15); border: 1px solid rgba(255,92,26,0.3); color: #FF5C1A; font-family: 'Syne', sans-serif; font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 3px 7px; border-radius: 6px; white-space: nowrap; }
  .sb-section-label { font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.25); padding: 18px 22px 8px; }
  .sb-nav-item { display: flex; align-items: center; gap: 11px; padding: 11px 22px; margin: 1px 10px; border-radius: 10px; cursor: pointer; text-decoration: none; color: rgba(255,255,255,0.5); font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; transition: all 0.15s; }
  .sb-nav-item:hover { background: rgba(255,255,255,0.06); color: white; }
  .sb-nav-item.active { background: rgba(255,92,26,0.15); color: #FF5C1A; border: 1px solid rgba(255,92,26,0.2); }
  .sb-nav-icon { flex-shrink: 0; }
  .sb-nav-badge { margin-left: auto; min-width: 20px; height: 20px; border-radius: 10px; background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.5); font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 5px; }
  .sb-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 10px 22px; }
  .sb-user { padding: 16px 22px; margin-top: auto; border-top: 1px solid rgba(255,255,255,0.07); display: flex; align-items: center; gap: 11px; }
  .sb-user-avatar { width: 36px; height: 36px; border-radius: 10px; background: #FF5C1A; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 14px; color: white; flex-shrink: 0; }
  .sb-user-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sb-user-role { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 1px; }
  .sb-logout { margin-left: auto; background: none; border: none; color: rgba(255,255,255,0.3); cursor: pointer; display: flex; padding: 4px; border-radius: 6px; transition: color 0.2s; }
  .sb-logout:hover { color: #EF4444; }
  .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 49; }
  .sidebar-overlay.show { display: block; }
`

const S = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  ${SIDEBAR_CSS}

  .admin-layout { display: flex; min-height: 100vh; font-family: 'DM Sans', sans-serif; background: #F5F4F1; }
  .admin-main { flex: 1; margin-left: 256px; display: flex; flex-direction: column; }

  .admin-topbar { background: white; border-bottom: 1px solid #E8E6E1; padding: 0 32px; height: 64px; display: flex; align-items: center; gap: 14px; position: sticky; top: 0; z-index: 40; }
  .topbar-hamburger { display: none; background: none; border: none; cursor: pointer; color: #6B6B6B; padding: 6px; border-radius: 8px; }
  .topbar-hamburger:hover { background: #F5F4F1; }
  .topbar-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #0F0F0F; letter-spacing: -0.5px; }
  .topbar-sub { font-size: 13px; color: #6B6B6B; font-weight: 300; }
  .topbar-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
  .topbar-btn { display: flex; align-items: center; gap: 6px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #6B6B6B; background: none; border: 1.5px solid #E8E6E1; border-radius: 9px; padding: 7px 14px; cursor: pointer; transition: all 0.2s; }
  .topbar-btn:hover { border-color: #0F0F0F; color: #0F0F0F; }

  /* PERIOD TABS */
  .period-tabs { display: flex; background: white; border: 1px solid #E8E6E1; border-radius: 12px; padding: 5px; width: fit-content; gap: 3px; }
  .period-tab { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #6B6B6B; background: none; border: none; padding: 7px 18px; border-radius: 9px; cursor: pointer; transition: all 0.15s; }
  .period-tab:hover { color: #0F0F0F; background: #F5F4F1; }
  .period-tab.active { background: #0F0F0F; color: white; }

  .admin-body { padding: 28px 32px; }

  /* TOP ROW */
  .rev-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 14px; }

  /* HERO CARD */
  .hero-revenue { background: #0F0F0F; border-radius: 20px; padding: 32px; margin-bottom: 24px; position: relative; overflow: hidden; }
  .hero-grid { position: absolute; inset: 0; pointer-events: none; background-image: radial-gradient(rgba(255,92,26,0.12) 1px, transparent 1px); background-size: 28px 28px; }
  .hero-glow { position: absolute; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(255,92,26,0.12) 0%, transparent 70%); top: -120px; right: -100px; pointer-events: none; }
  .hero-inner { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr auto; gap: 32px; align-items: center; }
  .hero-label { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; }
  .hero-amount { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(36px, 5vw, 56px); color: white; letter-spacing: -2px; margin-bottom: 10px; }
  .hero-amount em { color: #FF5C1A; font-style: normal; }
  .hero-trend { display: inline-flex; align-items: center; gap: 6px; background: rgba(22,163,74,0.15); border: 1px solid rgba(22,163,74,0.25); color: #4ADE80; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; padding: 5px 12px; border-radius: 100px; }
  .hero-metrics { display: flex; flex-direction: column; gap: 14px; }
  .hero-metric { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px 20px; text-align: right; min-width: 140px; }
  .hero-metric-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: white; letter-spacing: -0.5px; }
  .hero-metric-label { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 3px; }

  /* STAT GRID */
  .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .stat-card { background: white; border: 1px solid #E8E6E1; border-radius: 14px; padding: 20px; }
  .stat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .stat-icon { width: 40px; height: 40px; border-radius: 11px; display: flex; align-items: center; justify-content: center; }
  .stat-trend { display: flex; align-items: center; gap: 4px; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 100px; }
  .stat-trend.up { background: #F0FDF4; color: #16A34A; }
  .stat-trend.dn { background: #FEF2F2; color: #EF4444; }
  .stat-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 26px; color: #0F0F0F; letter-spacing: -1px; margin-bottom: 4px; }
  .stat-label { font-size: 12px; color: #6B6B6B; }

  /* CHART + TABLE GRID */
  .main-grid { display: grid; grid-template-columns: 1fr 360px; gap: 20px; margin-bottom: 20px; }

  /* BAR CHART CARD */
  .chart-card { background: white; border: 1px solid #E8E6E1; border-radius: 16px; overflow: hidden; }
  .card-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; border-bottom: 1px solid #E8E6E1; }
  .card-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; }
  .card-sub { font-size: 12px; color: #6B6B6B; margin-top: 2px; }
  .chart-area { padding: 24px; }
  .bars-wrap { display: flex; align-items: flex-end; gap: 8px; height: 160px; }
  .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; justify-content: flex-end; }
  .bar-fill { width: 100%; border-radius: 6px 6px 0 0; transition: height 0.6s ease; min-height: 4px; position: relative; cursor: pointer; }
  .bar-fill:hover { opacity: 0.85; }
  .bar-fill::after { content: attr(data-val); position: absolute; top: -22px; left: 50%; transform: translateX(-50%); font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700; color: #0F0F0F; white-space: nowrap; opacity: 0; transition: opacity 0.2s; pointer-events: none; }
  .bar-fill:hover::after { opacity: 1; }
  .bar-label { font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 600; color: #AFAFAF; white-space: nowrap; }

  /* BREAKDOWN CARD */
  .breakdown-card { background: white; border: 1px solid #E8E6E1; border-radius: 16px; overflow: hidden; }
  .breakdown-row { display: flex; align-items: center; gap: 14px; padding: 14px 22px; border-bottom: 1px solid #F5F4F1; }
  .breakdown-row:last-child { border-bottom: none; }
  .breakdown-icon { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .breakdown-info { flex: 1; }
  .breakdown-label { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; color: #0F0F0F; margin-bottom: 2px; }
  .breakdown-sub { font-size: 12px; color: #6B6B6B; }
  .breakdown-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 16px; color: #0F0F0F; }
  .breakdown-pct { font-size: 11px; color: #6B6B6B; margin-top: 2px; text-align: right; }

  /* TRANSACTIONS TABLE */
  .tx-card { background: white; border: 1px solid #E8E6E1; border-radius: 16px; overflow: hidden; }
  .tx-header { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 12px; padding: 12px 22px; background: #F5F4F1; border-bottom: 1px solid #E8E6E1; }
  .th { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; color: #AFAFAF; text-transform: uppercase; letter-spacing: 0.8px; }
  .tx-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 12px; align-items: center; padding: 14px 22px; border-bottom: 1px solid #F5F4F1; transition: background 0.15s; }
  .tx-row:last-child { border-bottom: none; }
  .tx-row:hover { background: #FAFAF8; }
  .tx-parties { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .tx-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px; flex-shrink: 0; }
  .tx-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #0F0F0F; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tx-skill { font-size: 11px; color: #6B6B6B; }
  .tx-cell { font-size: 13px; color: #6B6B6B; display: flex; align-items: center; gap: 5px; }
  .tx-cell.money { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 15px; color: #0F0F0F; }
  .tx-cell.commission { color: #FF5C1A; font-family: 'Syne', sans-serif; font-weight: 700; }
  .status-pill { display: inline-flex; align-items: center; gap: 5px; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 100px; }

  /* PAGINATION */
  .pagination { display: flex; align-items: center; justify-content: space-between; padding: 14px 22px; border-top: 1px solid #E8E6E1; }
  .pagination-info { font-size: 13px; color: #6B6B6B; }
  .pagination-btns { display: flex; gap: 6px; }
  .page-btn { width: 32px; height: 32px; border-radius: 8px; border: 1.5px solid #E8E6E1; background: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #6B6B6B; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; transition: all 0.2s; }
  .page-btn:hover { border-color: #0F0F0F; color: #0F0F0F; }
  .page-btn.active { background: #0F0F0F; color: white; border-color: #0F0F0F; }
  .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .skeleton { background: linear-gradient(90deg, #F5F4F1 25%, #E8E6E1 50%, #F5F4F1 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  .loading-screen { height: 100vh; display: flex; align-items: center; justify-content: center; background: #F5F4F1; }
  .loading-spinner { width: 40px; height: 40px; border-radius: 50%; border: 3px solid #E8E6E1; border-top-color: #FF5C1A; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 1200px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } .main-grid { grid-template-columns: 1fr; } }
  @media (max-width: 900px) {
    .admin-sidebar { transform: translateX(-100%); }
    .admin-main { margin-left: 0; }
    .topbar-hamburger { display: flex; }
    .admin-body { padding: 20px 16px; }
    .admin-topbar { padding: 0 16px; }
    .hero-inner { grid-template-columns: 1fr; }
    .hero-metrics { flex-direction: row; }
    .tx-header, .tx-row { grid-template-columns: 1.5fr 1fr 1fr 1fr; }
    .th:nth-child(5), .tx-cell:nth-child(5) { display: none; }
  }
  @media (max-width: 600px) {
    .stat-grid { grid-template-columns: 1fr 1fr; }
    .hero-metrics { flex-direction: column; }
  }
`

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users',     label: 'Users',     icon: Users           },
  { href: '/admin/workers',   label: 'Workers',   icon: UserCheck       },
  { href: '/admin/bookings',  label: 'Bookings',  icon: Briefcase       },
  { href: '/admin/messages',  label: 'Messages',  icon: MessageCircle   },
  { href: '/admin/revenue',   label: 'Revenue',   icon: DollarSign      },
  { href: '/admin/settings',  label: 'Settings',  icon: Settings        },
]

const PALETTES = [
  { bg: '#FFF3EE', color: '#FF5C1A' }, { bg: '#EEF6FF', color: '#2563EB' },
  { bg: '#F0FDF4', color: '#16A34A' }, { bg: '#FFF8EE', color: '#D97706' },
  { bg: '#F5F0FF', color: '#7C3AED' },
]

const COMMISSION_RATE = 0.10 // 10% platform cut

function getInitials(n: string) { return (n || '').split(' ').slice(0, 2).map(c => c[0]).join('').toUpperCase() || '?' }
function formatTs(ts: any) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function formatRelative(ts: any) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const diff = (Date.now() - d.getTime()) / 60000
  if (diff < 60) return `${Math.round(diff)}m ago`
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`
  return formatTs(ts)
}

type Period = '7d' | '30d' | '90d' | '1y' | 'all'
const PAGE_SIZE = 10

export default function AdminRevenuePage() {
  const router   = useRouter()
  const pathname = usePathname()

  const [authUser, setAuthUser]       = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [period, setPeriod]           = useState<Period>('30d')

  const [bookings, setBookings]       = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [txPage, setTxPage]           = useState(0)

  // Auth guard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push('/admin/login'); return }
      try {
        const { getDoc } = await import('firebase/firestore')
        const snap = await getDoc(doc(db, 'users', u.uid))
        if (!snap.exists() || snap.data().role !== 'admin') { await signOut(auth); router.push('/admin/login'); return }
      } catch { await signOut(auth); router.push('/admin/login'); return }
      setAuthUser(u); setAuthLoading(false)
    })
    return () => unsub()
  }, [router])

  // Fetch all completed bookings (revenue source)
  useEffect(() => {
    if (!authUser) return
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d, i) => {
        const b = d.data() as any
        const p = PALETTES[i % PALETTES.length]
        return {
          id:             d.id,
          clientName:     b.clientName     || 'Client',
          workerName:     b.workerName     || 'Worker',
          workerInitials: b.workerInitials || getInitials(b.workerName || 'W'),
          skill:          b.skill          || 'Service',
          status:         b.status         || 'pending',
          price:          Number(b.price)  || 0,
          currency:       b.currency       || '£',
          createdAt:      b.createdAt,
          completedAt:    b.completedAt,
          rating:         b.rating,
          avatarBg:       b.workerAvatarBg    || p.bg,
          avatarColor:    b.workerAvatarColor || p.color,
        }
      })
      setBookings(data)
      setDataLoading(false)
    })
    return () => unsub()
  }, [authUser])

  // Period filter
  const now = Date.now()
  const periodMs: Record<Period, number> = {
    '7d':  7  * 86400000,
    '30d': 30 * 86400000,
    '90d': 90 * 86400000,
    '1y':  365 * 86400000,
    'all': Infinity,
  }
  const inPeriod = (ts: any) => {
    if (!ts) return false
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return (now - d.getTime()) <= periodMs[period]
  }

  const completed  = bookings.filter(b => b.status === 'completed' && inPeriod(b.completedAt || b.createdAt))
  const allRevenue = completed.reduce((s, b) => s + b.price, 0)
  const commission = allRevenue * COMMISSION_RATE
  const workerPay  = allRevenue - commission
  const avgOrder   = completed.length ? allRevenue / completed.length : 0

  // All bookings in period for transaction table
  const periodBookings = bookings.filter(b => inPeriod(b.createdAt))
  const txPaginated    = periodBookings.slice(txPage * PAGE_SIZE, (txPage + 1) * PAGE_SIZE)
  const txTotalPages   = Math.ceil(periodBookings.length / PAGE_SIZE)

  // Bar chart — last 8 months or weeks
  const buildBars = () => {
    const bars: { label: string; val: number; peak: boolean }[] = []
    const count = period === '7d' ? 7 : period === '30d' ? 6 : period === '90d' ? 6 : 8

    for (let i = count - 1; i >= 0; i--) {
      const unit = period === '7d' ? 86400000 : period === '30d' ? 7 * 86400000 : 30 * 86400000
      const start = now - (i + 1) * unit
      const end   = now - i * unit
      const sum   = completed.filter(b => {
        const d = (b.completedAt || b.createdAt)?.toDate ? (b.completedAt || b.createdAt).toDate() : new Date()
        return d.getTime() >= start && d.getTime() < end
      }).reduce((s, b) => s + b.price, 0)

      const label = period === '7d'
        ? new Date(end).toLocaleDateString('en-US', { weekday: 'short' })
        : period === '30d'
          ? `Wk${count - i}`
          : new Date(end).toLocaleDateString('en-US', { month: 'short' })

      bars.push({ label, val: sum, peak: false })
    }

    const max = Math.max(...bars.map(b => b.val), 1)
    return bars.map(b => ({ ...b, pct: Math.round((b.val / max) * 100), peak: b.val === max }))
  }

  const bars = buildBars()

  // Skill revenue breakdown
  const skillRevenue: Record<string, number> = {}
  completed.forEach(b => { skillRevenue[b.skill] = (skillRevenue[b.skill] || 0) + b.price })
  const topSkills = Object.entries(skillRevenue)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([skill, val]) => ({ skill, val, pct: allRevenue ? Math.round(val / allRevenue * 100) : 0 }))

  const handleSignOut = async () => { await signOut(auth); router.push('/admin/login') }

  if (authLoading) return <><style>{S}</style><div className="loading-screen"><div className="loading-spinner" /></div></>

  const adminInitials = getInitials(authUser?.displayName || authUser?.email || 'A')

  return (
    <>
      <style>{S}</style>
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />

      <div className="admin-layout">
        <div className={`sidebar-overlay${sidebarOpen ? ' show' : ''}`} onClick={() => setSidebarOpen(false)} />

        {/* SIDEBAR */}
        <aside className={`admin-sidebar${sidebarOpen ? ' sb-open' : ''}`}>
          <Link href="/admin/dashboard" className="sb-logo">
            <div className="sb-logo-icon"><ShieldCheck size={18} color="white" /></div>
            <span className="sb-logo-text">Fix<em>Mate</em></span>
            <span className="sb-logo-badge">Admin</span>
          </Link>
          <div className="sb-section-label">Main</div>
          {NAV.map(item => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className={`sb-nav-item${pathname === item.href ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <Icon size={17} className="sb-nav-icon" />{item.label}
              </Link>
            )
          })}
          <div className="sb-user">
            <div className="sb-user-avatar">{adminInitials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sb-user-name">{authUser?.displayName || authUser?.email?.split('@')[0]}</div>
              <div className="sb-user-role">Administrator</div>
            </div>
            <button className="sb-logout" onClick={handleSignOut}><LogOut size={16} /></button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="admin-main">
          <div className="admin-topbar">
            <button className="topbar-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <div className="topbar-title">Revenue</div>
              <div className="topbar-sub">Platform financials and transaction history</div>
            </div>
            <div className="topbar-right">
              <button className="topbar-btn" onClick={() => window.location.reload()}><RefreshCw size={13} /> Refresh</button>
              <button className="topbar-btn"><Download size={13} /> Export</button>
            </div>
          </div>

          <div className="admin-body">
            {/* Period selector */}
            <div className="rev-top">
              <div className="period-tabs">
                {(['7d','30d','90d','1y','all'] as Period[]).map(p => (
                  <button key={p} className={`period-tab${period === p ? ' active' : ''}`} onClick={() => { setPeriod(p); setTxPage(0) }}>
                    {p === 'all' ? 'All time' : p === '1y' ? '1 Year' : p === '90d' ? '90 Days' : p === '30d' ? '30 Days' : '7 Days'}
                  </button>
                ))}
              </div>
            </div>

            {/* HERO CARD */}
            <div className="hero-revenue">
              <div className="hero-grid" />
              <div className="hero-glow" />
              <div className="hero-inner">
                <div>
                  <div className="hero-label">Total Platform Revenue</div>
                  <div className="hero-amount">£<em>{allRevenue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</em></div>
                  <div className="hero-trend">
                    <TrendingUp size={14} /> {completed.length} completed bookings
                  </div>
                </div>
                <div className="hero-metrics">
                  <div className="hero-metric">
                    <div className="hero-metric-val">£{commission.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                    <div className="hero-metric-label">Platform Commission (10%)</div>
                  </div>
                  <div className="hero-metric">
                    <div className="hero-metric-val">£{avgOrder.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                    <div className="hero-metric-label">Avg Booking Value</div>
                  </div>
                </div>
              </div>
            </div>

            {/* STAT CARDS */}
            <div className="stat-grid">
              {[
                { label: 'Gross Revenue',   val: `£${allRevenue.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: <Banknote size={19} color="#FF5C1A" />, bg: '#FFF3EE', trend: '+18%', up: true },
                { label: 'Net Commission',  val: `£${commission.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: <DollarSign size={19} color="#16A34A" />, bg: '#F0FDF4', trend: '+18%', up: true },
                { label: 'Worker Payouts',  val: `£${workerPay.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: <UserCheck size={19} color="#2563EB" />, bg: '#EEF6FF', trend: '+15%', up: true },
                { label: 'Total Transactions', val: periodBookings.length.toString(), icon: <CheckCircle size={19} color="#D97706" />, bg: '#FFF8EE', trend: '+22%', up: true },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                    <div className={`stat-trend ${s.up ? 'up' : 'dn'}`}>
                      {s.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />} {s.trend}
                    </div>
                  </div>
                  <div className="stat-val">{s.val}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* CHART + BREAKDOWN */}
            <div className="main-grid">
              {/* Bar Chart */}
              <div className="chart-card">
                <div className="card-header">
                  <div>
                    <div className="card-title">Revenue Over Time</div>
                    <div className="card-sub">Gross booking value by period</div>
                  </div>
                </div>
                <div className="chart-area">
                  {dataLoading ? (
                    <div style={{ height: 160, display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="skeleton" style={{ flex: 1, height: `${30 + Math.random() * 100}px`, borderRadius: '6px 6px 0 0' }} />
                      ))}
                    </div>
                  ) : (
                    <div className="bars-wrap">
                      {bars.map((b, i) => (
                        <div key={i} className="bar-col">
                          <div
                            className="bar-fill"
                            data-val={`£${b.val}`}
                            style={{
                              height: `${b.pct}%`,
                              background: b.peak ? '#FF5C1A' : '#E8E6E1',
                              minHeight: 4,
                            }}
                          />
                          <div className="bar-label">{b.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!dataLoading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B6B6B' }}>
                        <div style={{ width: 12, height: 12, borderRadius: 3, background: '#FF5C1A' }} /> Peak period
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B6B6B' }}>
                        <div style={{ width: 12, height: 12, borderRadius: 3, background: '#E8E6E1' }} /> Other periods
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Revenue Breakdown by Skill */}
              <div className="breakdown-card">
                <div className="card-header">
                  <div className="card-title">Revenue by Skill</div>
                </div>
                {dataLoading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 22px', borderBottom: '1px solid #F5F4F1', alignItems: 'center' }}>
                      <div className="skeleton" style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0 }} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                        <div className="skeleton" style={{ height: 13, width: '60%' }} />
                        <div className="skeleton" style={{ height: 11, width: '40%' }} />
                      </div>
                      <div className="skeleton" style={{ width: 60, height: 18 }} />
                    </div>
                  ))
                ) : topSkills.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#AFAFAF', fontSize: 14 }}>
                    No completed bookings yet
                  </div>
                ) : topSkills.map((s, i) => {
                  const colors = ['#FF5C1A', '#2563EB', '#16A34A', '#D97706', '#7C3AED']
                  const bgs    = ['#FFF3EE', '#EEF6FF', '#F0FDF4', '#FFF8EE', '#F5F0FF']
                  return (
                    <div key={s.skill} className="breakdown-row">
                      <div className="breakdown-icon" style={{ background: bgs[i] }}>
                        <Briefcase size={17} color={colors[i]} />
                      </div>
                      <div className="breakdown-info">
                        <div className="breakdown-label">{s.skill}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <div style={{ flex: 1, height: 4, background: '#F5F4F1', borderRadius: 100, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${s.pct}%`, background: colors[i], borderRadius: 100 }} />
                          </div>
                          <span style={{ fontSize: 11, color: '#6B6B6B', flexShrink: 0 }}>{s.pct}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="breakdown-val">£{s.val.toLocaleString()}</div>
                        <div className="breakdown-pct">{s.pct}% of total</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* TRANSACTIONS TABLE */}
            <div className="tx-card">
              <div className="card-header">
                <div>
                  <div className="card-title">Transaction History</div>
                  <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>{periodBookings.length} bookings in selected period</div>
                </div>
              </div>
              <div className="tx-header">
                <div className="th">Booking</div>
                <div className="th">Amount</div>
                <div className="th">Commission</div>
                <div className="th">Status</div>
                <div className="th">Date</div>
              </div>
              {dataLoading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 12, padding: '14px 22px', borderBottom: '1px solid #F5F4F1', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                        <div className="skeleton" style={{ height: 12, width: '65%' }} />
                        <div className="skeleton" style={{ height: 10, width: '45%' }} />
                      </div>
                    </div>
                    {[...Array(3)].map((_, j) => <div key={j} className="skeleton" style={{ height: 12 }} />)}
                    <div className="skeleton" style={{ height: 12 }} />
                  </div>
                ))
              ) : txPaginated.length === 0 ? (
                <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, background: '#F5F4F1', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <DollarSign size={24} color="#AFAFAF" />
                  </div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 14, color: '#6B6B6B' }}>No transactions in this period</div>
                </div>
              ) : txPaginated.map(b => {
                const commission = b.price * COMMISSION_RATE
                const statusConf: Record<string, { bg: string; color: string; label: string }> = {
                  pending:   { bg: '#FFF8EE', color: '#D97706', label: 'Pending'   },
                  accepted:  { bg: '#EEF6FF', color: '#2563EB', label: 'Active'    },
                  completed: { bg: '#F0FDF4', color: '#16A34A', label: 'Completed' },
                  cancelled: { bg: '#FEF2F2', color: '#EF4444', label: 'Cancelled' },
                }
                const sc = statusConf[b.status] || statusConf.pending
                return (
                  <div key={b.id} className="tx-row">
                    <div className="tx-parties">
                      <div className="tx-avatar" style={{ background: b.avatarBg, color: b.avatarColor }}>
                        {b.workerInitials}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div className="tx-name">{b.clientName} → {b.workerName}</div>
                        <div className="tx-skill">{b.skill}{b.rating ? ` · ★${b.rating}` : ''}</div>
                      </div>
                    </div>
                    <div className="tx-cell money">{b.currency}{b.price}</div>
                    <div className="tx-cell commission">
                      {b.status === 'completed' ? `${b.currency}${commission.toFixed(0)}` : '—'}
                    </div>
                    <div className="tx-cell">
                      <span className="status-pill" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                    </div>
                    <div className="tx-cell"><Calendar size={11} />{formatRelative(b.createdAt)}</div>
                  </div>
                )
              })}

              {periodBookings.length > PAGE_SIZE && (
                <div className="pagination">
                  <div className="pagination-info">Showing {txPage * PAGE_SIZE + 1}–{Math.min((txPage + 1) * PAGE_SIZE, periodBookings.length)} of {periodBookings.length}</div>
                  <div className="pagination-btns">
                    <button className="page-btn" onClick={() => setTxPage(p => p - 1)} disabled={txPage === 0}><ChevronLeft size={14} /></button>
                    {[...Array(Math.min(txTotalPages, 5))].map((_, i) => (
                      <button key={i} className={`page-btn${txPage === i ? ' active' : ''}`} onClick={() => setTxPage(i)}>{i + 1}</button>
                    ))}
                    <button className="page-btn" onClick={() => setTxPage(p => p + 1)} disabled={txPage >= txTotalPages - 1}><ChevronRight size={14} /></button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}