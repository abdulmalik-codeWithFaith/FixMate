'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { db, auth } from '@/lib/firebase'
import {
  collection, query, orderBy, limit, onSnapshot,
  doc, updateDoc, serverTimestamp, where, getDocs
} from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import toast, { Toaster } from 'react-hot-toast'
import {
  LayoutDashboard, Users, Briefcase, MessageCircle,
  DollarSign, ShieldCheck, Settings, LogOut,
  Search, Menu, X, ChevronRight, ChevronLeft,
  Loader2, Download, MapPin, Calendar, Clock,
  CheckCircle, XCircle, AlertTriangle, RefreshCw,
  Eye, UserCheck, Filter, Star, Banknote,
  TrendingUp, Activity, MoreHorizontal
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

  .admin-body { padding: 28px 32px; flex: 1; }

  /* STAT PILLS */
  .stat-pills { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-bottom: 24px; }
  .stat-pill { background: white; border: 1px solid #E8E6E1; border-radius: 14px; padding: 18px; }
  .pill-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .pill-icon { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; }
  .pill-trend { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 100px; }
  .pill-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 26px; color: #0F0F0F; letter-spacing: -1px; margin-bottom: 3px; }
  .pill-label { font-size: 12px; color: #6B6B6B; }

  /* TABS */
  .tab-bar { background: white; border: 1px solid #E8E6E1; border-radius: 14px; padding: 6px; display: flex; gap: 4px; margin-bottom: 20px; width: fit-content; }
  .tab-btn { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #6B6B6B; background: none; border: none; padding: 8px 16px; border-radius: 10px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
  .tab-btn:hover { color: #0F0F0F; background: #F5F4F1; }
  .tab-btn.active { background: #0F0F0F; color: white; }
  .tab-count { font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 100px; background: rgba(255,255,255,0.15); }
  .tab-btn:not(.active) .tab-count { background: #F5F4F1; color: #6B6B6B; }

  /* FILTER BAR */
  .filter-bar { background: white; border: 1px solid #E8E6E1; border-radius: 14px; padding: 14px 18px; margin-bottom: 18px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .filter-search { flex: 1; min-width: 200px; display: flex; align-items: center; gap: 10px; background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 10px; padding: 9px 14px; transition: border-color 0.2s; }
  .filter-search:focus-within { border-color: #FF5C1A; background: white; }
  .filter-search input { flex: 1; border: none; outline: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F; }
  .filter-search input::placeholder { color: #AFAFAF; }
  .filter-select-wrap { position: relative; }
  .filter-select { background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 10px; padding: 9px 32px 9px 14px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #0F0F0F; cursor: pointer; outline: none; appearance: none; }
  .filter-select:focus { border-color: #FF5C1A; }
  .filter-select-wrap::after { content: ''; position: absolute; right: 11px; top: 50%; transform: translateY(-50%); border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 5px solid #6B6B6B; pointer-events: none; }
  .filter-info { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #6B6B6B; white-space: nowrap; }

  /* TABLE */
  .table-card { background: white; border: 1px solid #E8E6E1; border-radius: 16px; overflow: hidden; }
  .table-head { display: grid; grid-template-columns: 2.2fr 1.6fr 1fr 1fr 1fr 100px; gap: 12px; padding: 12px 22px; background: #F5F4F1; border-bottom: 1px solid #E8E6E1; }
  .th { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; color: #AFAFAF; text-transform: uppercase; letter-spacing: 0.8px; }

  /* BOOKING ROW */
  .bk-row { display: grid; grid-template-columns: 2.2fr 1.6fr 1fr 1fr 1fr 100px; gap: 12px; align-items: center; padding: 14px 22px; border-bottom: 1px solid #F5F4F1; transition: background 0.15s; cursor: pointer; }
  .bk-row:last-child { border-bottom: none; }
  .bk-row:hover { background: #FAFAF8; }

  .bk-parties { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .bk-avatar { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; flex-shrink: 0; }
  .bk-names { min-width: 0; }
  .bk-name-main { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #0F0F0F; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .bk-name-sub { font-size: 11px; color: #6B6B6B; display: flex; align-items: center; gap: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .bk-cell { font-size: 12px; color: #6B6B6B; display: flex; align-items: center; gap: 5px; }
  .bk-cell.bold { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; }

  .status-pill { display: inline-flex; align-items: center; gap: 5px; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 100px; white-space: nowrap; }

  .bk-actions { display: flex; align-items: center; gap: 6px; }
  .icon-btn { width: 32px; height: 32px; border-radius: 8px; border: 1.5px solid #E8E6E1; background: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #6B6B6B; transition: all 0.2s; }
  .icon-btn:hover { border-color: #FF5C1A; color: #FF5C1A; }
  .icon-btn.danger:hover { border-color: #EF4444; color: #EF4444; }
  .icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* DETAIL PANEL */
  .detail-panel { position: fixed; right: 0; top: 0; bottom: 0; width: 420px; background: white; border-left: 1px solid #E8E6E1; z-index: 100; display: flex; flex-direction: column; transform: translateX(100%); transition: transform 0.3s; }
  .detail-panel.open { transform: translateX(0); }
  .panel-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 99; }
  .panel-overlay.show { display: block; }
  .panel-topbar { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #E8E6E1; }
  .panel-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 16px; color: #0F0F0F; }
  .panel-close { background: none; border: 1.5px solid #E8E6E1; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #6B6B6B; transition: all 0.2s; }
  .panel-close:hover { border-color: #0F0F0F; color: #0F0F0F; }
  .panel-body { flex: 1; overflow-y: auto; padding: 24px; }
  .panel-section { margin-bottom: 24px; }
  .panel-section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px; color: #AFAFAF; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
  .panel-row { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 10px; }
  .panel-icon { width: 32px; height: 32px; border-radius: 8px; background: #F5F4F1; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #6B6B6B; }
  .panel-label { font-size: 11px; color: #AFAFAF; margin-bottom: 2px; }
  .panel-value { font-size: 14px; color: #0F0F0F; font-weight: 500; }
  .panel-avatars { display: flex; gap: 14px; margin-bottom: 16px; }
  .panel-party { display: flex; align-items: center; gap: 10px; flex: 1; background: #F5F4F1; border-radius: 12px; padding: 12px; }
  .panel-party-avatar { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; flex-shrink: 0; }
  .panel-party-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #0F0F0F; }
  .panel-party-role { font-size: 11px; color: #6B6B6B; }
  .panel-actions { padding: 20px 24px; border-top: 1px solid #E8E6E1; display: flex; flex-direction: column; gap: 8px; }
  .panel-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; border-radius: 11px; padding: 12px; cursor: pointer; transition: all 0.2s; border: none; }
  .panel-btn.danger { background: #FEF2F2; color: #EF4444; border: 1.5px solid rgba(239,68,68,0.2); }
  .panel-btn.danger:hover { background: #EF4444; color: white; }
  .panel-btn.success { background: #F0FDF4; color: #16A34A; border: 1.5px solid rgba(22,163,74,0.2); }
  .panel-btn.success:hover { background: #16A34A; color: white; }
  .panel-btn.secondary { background: #F5F4F1; color: #6B6B6B; border: 1.5px solid #E8E6E1; }
  .panel-btn.secondary:hover { background: #E8E6E1; color: #0F0F0F; }

  /* TIMELINE */
  .timeline { display: flex; flex-direction: column; }
  .tl-item { display: flex; gap: 12px; align-items: flex-start; }
  .tl-track { display: flex; flex-direction: column; align-items: center; }
  .tl-dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 2px solid #E8E6E1; background: white; }
  .tl-dot.done { background: #FF5C1A; border-color: #FF5C1A; color: white; }
  .tl-dot.muted { background: white; border-color: #E8E6E1; color: #AFAFAF; }
  .tl-line { width: 2px; flex: 1; min-height: 18px; background: #E8E6E1; margin: 2px 0; }
  .tl-line.done { background: #FF5C1A; }
  .tl-content { padding: 2px 0 18px; }
  .tl-item:last-child .tl-content { padding-bottom: 0; }
  .tl-label { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 13px; color: #0F0F0F; margin-bottom: 2px; }
  .tl-label.muted { color: #AFAFAF; }
  .tl-time { font-size: 11px; color: #6B6B6B; }

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

  @media (max-width: 1200px) {
    .stat-pills { grid-template-columns: repeat(3, 1fr); }
    .table-head, .bk-row { grid-template-columns: 2fr 1.4fr 1fr 1fr 90px; }
    .th:nth-child(4), .bk-cell:nth-child(4) { display: none; }
    .detail-panel { width: 360px; }
  }
  @media (max-width: 900px) {
    .admin-sidebar { transform: translateX(-100%); }
    .admin-main { margin-left: 0; }
    .topbar-hamburger { display: flex; }
    .admin-body { padding: 20px 16px; }
    .admin-topbar { padding: 0 16px; }
    .stat-pills { grid-template-columns: repeat(2, 1fr); }
    .table-head, .bk-row { grid-template-columns: 1.5fr 1fr 1fr 80px; }
    .th:nth-child(3), .bk-cell:nth-child(3),
    .th:nth-child(4), .bk-cell:nth-child(4) { display: none; }
    .detail-panel { width: 100%; }
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

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: 'Pending',   bg: '#FFF8EE', color: '#D97706', icon: <Clock size={10} /> },
  accepted:  { label: 'Active',    bg: '#EEF6FF', color: '#2563EB', icon: <Activity size={10} /> },
  completed: { label: 'Completed', bg: '#F0FDF4', color: '#16A34A', icon: <CheckCircle size={10} /> },
  cancelled: { label: 'Cancelled', bg: '#FEF2F2', color: '#EF4444', icon: <XCircle size={10} /> },
}

const PALETTES = [
  { bg: '#FFF3EE', color: '#FF5C1A' }, { bg: '#EEF6FF', color: '#2563EB' },
  { bg: '#F0FDF4', color: '#16A34A' }, { bg: '#FFF8EE', color: '#D97706' },
  { bg: '#F5F0FF', color: '#7C3AED' },
]

function getInitials(name: string) { return (name || '').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?' }
function formatTs(ts: any, opts?: Intl.DateTimeFormatOptions) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-US', opts || { month: 'short', day: 'numeric', year: 'numeric' })
}
function formatRelative(ts: any) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const diff = (Date.now() - d.getTime()) / 60000
  if (diff < 1)    return 'Just now'
  if (diff < 60)   return `${Math.round(diff)}m ago`
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`
  return formatTs(ts)
}

const PAGE_SIZE = 12
type TabKey = 'all' | 'pending' | 'accepted' | 'completed' | 'cancelled'

export default function AdminBookingsPage() {
  const router   = useRouter()
  const pathname = usePathname()

  const [authUser, setAuthUser]       = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [bookings, setBookings]       = useState<any[]>([])
  const [filtered, setFiltered]       = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [search, setSearch]           = useState('')
  const [activeTab, setActiveTab]     = useState<TabKey>('all')
  const [page, setPage]               = useState(0)
  const [selected, setSelected]       = useState<any>(null)
  const [panelOpen, setPanelOpen]     = useState(false)
  const [actioningId, setActioningId] = useState<string | null>(null)

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

  // Real-time bookings
  useEffect(() => {
    if (!authUser) return
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d, i) => {
        const b = d.data() as any
        const p = PALETTES[i % PALETTES.length]
        return {
          id:               d.id,
          clientName:       b.clientName       || 'Client',
          clientInitials:   b.clientInitials   || getInitials(b.clientName || 'C'),
          workerName:       b.workerName       || 'Worker',
          workerInitials:   b.workerInitials   || getInitials(b.workerName || 'W'),
          workerAvatarBg:   b.workerAvatarBg   || p.bg,
          workerAvatarColor: b.workerAvatarColor || p.color,
          skill:            b.skill            || 'Service',
          description:      b.description      || '—',
          location:         b.location         || '—',
          price:            b.price            || 0,
          currency:         b.currency         || '£',
          status:           b.status           || 'pending',
          rating:           b.rating,
          createdAt:        b.createdAt,
          scheduledAt:      b.scheduledAt,
          acceptedAt:       b.acceptedAt,
          completedAt:      b.completedAt,
          clientId:         b.clientId,
          workerId:         b.workerId,
        }
      })
      setBookings(data)
      setDataLoading(false)
    })
    return () => unsub()
  }, [authUser])

  // Filter
  useEffect(() => {
    let f = bookings
    if (activeTab !== 'all') f = f.filter(b => b.status === activeTab)
    if (search.trim()) {
      const s = search.toLowerCase()
      f = f.filter(b =>
        b.clientName.toLowerCase().includes(s) ||
        b.workerName.toLowerCase().includes(s) ||
        b.skill.toLowerCase().includes(s) ||
        b.location.toLowerCase().includes(s)
      )
    }
    setFiltered(f)
    setPage(0)
  }, [bookings, activeTab, search])

  const paginated  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  const countFor = (tab: TabKey) => tab === 'all' ? bookings.length : bookings.filter(b => b.status === tab).length
  const revenue  = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.price, 0)
  const avgVal   = bookings.length ? (bookings.reduce((s, b) => s + b.price, 0) / bookings.length).toFixed(0) : '0'

  // Actions
  const handleForceCancel = async (id: string) => {
    setActioningId(id)
    try {
      await updateDoc(doc(db, 'bookings', id), { status: 'cancelled', updatedAt: serverTimestamp() })
      toast.success('Booking cancelled.')
      if (selected?.id === id) setSelected((prev: any) => prev ? { ...prev, status: 'cancelled' } : null)
    } catch { toast.error('Action failed.') }
    finally { setActioningId(null) }
  }
  const handleForceComplete = async (id: string) => {
    setActioningId(id)
    try {
      await updateDoc(doc(db, 'bookings', id), { status: 'completed', completedAt: serverTimestamp(), updatedAt: serverTimestamp() })
      toast.success('Booking marked complete.')
      if (selected?.id === id) setSelected((prev: any) => prev ? { ...prev, status: 'completed' } : null)
    } catch { toast.error('Action failed.') }
    finally { setActioningId(null) }
  }

  const openPanel = (b: any) => { setSelected(b); setPanelOpen(true) }
  const handleSignOut = async () => { await signOut(auth); router.push('/admin/login') }

  if (authLoading) return <><style>{S}</style><div className="loading-screen"><div className="loading-spinner" /></div></>

  const adminInitials = getInitials(authUser?.displayName || authUser?.email || 'A')

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'all',       label: 'All'       },
    { key: 'pending',   label: 'Pending'   },
    { key: 'accepted',  label: 'Active'    },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <>
      <style>{S}</style>
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />

      {/* Detail Panel Overlay */}
      <div className={`panel-overlay${panelOpen ? ' show' : ''}`} onClick={() => setPanelOpen(false)} />

      {/* Detail Panel */}
      <div className={`detail-panel${panelOpen && selected ? ' open' : ''}`}>
        {selected && (
          <>
            <div className="panel-topbar">
              <div>
                <div className="panel-title">Booking Detail</div>
                <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>
                  #{selected.id.slice(-8).toUpperCase()}
                </div>
              </div>
              <button className="panel-close" onClick={() => setPanelOpen(false)}><X size={16} /></button>
            </div>

            <div className="panel-body">
              {/* Parties */}
              <div className="panel-section">
                <div className="panel-section-title">Parties</div>
                <div className="panel-avatars">
                  <div className="panel-party">
                    <div className="panel-party-avatar" style={{ background: '#EEF6FF', color: '#2563EB' }}>
                      {getInitials(selected.clientName)}
                    </div>
                    <div>
                      <div className="panel-party-name">{selected.clientName}</div>
                      <div className="panel-party-role">Client</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', color: '#AFAFAF', fontSize: 18 }}>→</div>
                  <div className="panel-party">
                    <div className="panel-party-avatar" style={{ background: selected.workerAvatarBg, color: selected.workerAvatarColor }}>
                      {selected.workerInitials}
                    </div>
                    <div>
                      <div className="panel-party-name">{selected.workerName}</div>
                      <div className="panel-party-role">Worker · {selected.skill}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="panel-section">
                <div className="panel-section-title">Status</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span className="status-pill" style={{ background: STATUS_CONFIG[selected.status]?.bg, color: STATUS_CONFIG[selected.status]?.color }}>
                    {STATUS_CONFIG[selected.status]?.icon} {STATUS_CONFIG[selected.status]?.label}
                  </span>
                  {selected.rating && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13 }}>
                      <Star size={13} color="#F59E0B" fill="#F59E0B" /> {selected.rating}
                    </span>
                  )}
                </div>
              </div>

              {/* Job Info */}
              <div className="panel-section">
                <div className="panel-section-title">Job Details</div>
                {[
                  { icon: <Briefcase size={14} />, label: 'Description', value: selected.description },
                  { icon: <MapPin size={14} />,    label: 'Location',    value: selected.location    },
                  { icon: <Banknote size={14} />,  label: 'Amount',      value: `${selected.currency}${selected.price}` },
                  { icon: <Calendar size={14} />,  label: 'Scheduled',   value: formatTs(selected.scheduledAt, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) },
                ].map(row => (
                  <div key={row.label} className="panel-row">
                    <div className="panel-icon">{row.icon}</div>
                    <div>
                      <div className="panel-label">{row.label}</div>
                      <div className="panel-value">{row.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Timeline */}
              <div className="panel-section">
                <div className="panel-section-title">Timeline</div>
                <div className="timeline">
                  {[
                    { label: 'Booking Created',   time: formatRelative(selected.createdAt),   done: true },
                    { label: 'Worker Accepted',   time: selected.acceptedAt  ? formatRelative(selected.acceptedAt)  : 'Awaiting', done: !!selected.acceptedAt  },
                    { label: 'Job Completed',     time: selected.completedAt ? formatRelative(selected.completedAt) : 'Awaiting', done: !!selected.completedAt },
                    { label: 'Payment Released',  time: selected.status === 'completed' ? 'Processing' : 'Pending', done: false },
                  ].map((item, i, arr) => (
                    <div key={item.label} className="tl-item">
                      <div className="tl-track">
                        <div className={`tl-dot ${item.done ? 'done' : 'muted'}`}>
                          {item.done ? <CheckCircle size={12} /> : <Clock size={12} />}
                        </div>
                        {i < arr.length - 1 && <div className={`tl-line${item.done ? ' done' : ''}`} />}
                      </div>
                      <div className="tl-content">
                        <div className={`tl-label${!item.done ? ' muted' : ''}`}>{item.label}</div>
                        <div className="tl-time">{item.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Panel Actions */}
            <div className="panel-actions">
              {(selected.status === 'pending' || selected.status === 'accepted') && (
                <>
                  {selected.status === 'accepted' && (
                    <button
                      className="panel-btn success"
                      onClick={() => handleForceComplete(selected.id)}
                      disabled={actioningId === selected.id}
                    >
                      {actioningId === selected.id
                        ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                        : <><CheckCircle size={15} /> Force Complete</>
                      }
                    </button>
                  )}
                  <button
                    className="panel-btn danger"
                    onClick={() => handleForceCancel(selected.id)}
                    disabled={actioningId === selected.id}
                  >
                    {actioningId === selected.id
                      ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                      : <><XCircle size={15} /> Force Cancel</>
                    }
                  </button>
                </>
              )}
              <button className="panel-btn secondary" onClick={() => setPanelOpen(false)}>Close</button>
            </div>
          </>
        )}
      </div>

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
                <Icon size={17} className="sb-nav-icon" />
                {item.label}
                {item.label === 'Bookings' && <span className="sb-nav-badge">{bookings.length}</span>}
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
              <div className="topbar-title">Bookings</div>
              <div className="topbar-sub">{bookings.length} total bookings on the platform</div>
            </div>
            <div className="topbar-right">
              <button className="topbar-btn" onClick={() => window.location.reload()}><RefreshCw size={13} /> Refresh</button>
              <button className="topbar-btn"><Download size={13} /> Export</button>
            </div>
          </div>

          <div className="admin-body">
            {/* STAT PILLS */}
            <div className="stat-pills">
              {[
                { label: 'Total',     val: bookings.length,                                        bg: '#F5F4F1', color: '#0F0F0F', icon: <Briefcase size={18} color="#6B6B6B" /> },
                { label: 'Pending',   val: countFor('pending'),                                    bg: '#FFF8EE', color: '#D97706', icon: <Clock size={18} color="#D97706" />     },
                { label: 'Active',    val: countFor('accepted'),                                   bg: '#EEF6FF', color: '#2563EB', icon: <Activity size={18} color="#2563EB" />  },
                { label: 'Completed', val: countFor('completed'),                                  bg: '#F0FDF4', color: '#16A34A', icon: <CheckCircle size={18} color="#16A34A" /> },
                { label: 'Revenue',   val: `£${revenue.toLocaleString()}`,                        bg: '#FFF3EE', color: '#FF5C1A', icon: <Banknote size={18} color="#FF5C1A" />  },
              ].map(s => (
                <div key={s.label} className="stat-pill">
                  <div className="pill-top">
                    <div className="pill-icon" style={{ background: s.bg }}>{s.icon}</div>
                  </div>
                  <div className="pill-val">{s.val}</div>
                  <div className="pill-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* TABS */}
            <div className="tab-bar">
              {TABS.map(t => (
                <button
                  key={t.key}
                  className={`tab-btn${activeTab === t.key ? ' active' : ''}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                  <span className="tab-count">{countFor(t.key)}</span>
                </button>
              ))}
            </div>

            {/* FILTER BAR */}
            <div className="filter-bar">
              <div className="filter-search">
                <Search size={16} color="#AFAFAF" style={{ flexShrink: 0 }} />
                <input placeholder="Search client, worker, skill, location…" value={search} onChange={e => setSearch(e.target.value)} />
                {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#AFAFAF', display: 'flex' }}><X size={14} /></button>}
              </div>
              <div className="filter-info">{filtered.length} of {bookings.length} bookings</div>
            </div>

            {/* TABLE */}
            <div className="table-card">
              <div className="table-head">
                <div className="th">Booking</div>
                <div className="th">Details</div>
                <div className="th">Status</div>
                <div className="th">Amount</div>
                <div className="th">Date</div>
                <div className="th">Actions</div>
              </div>

              {dataLoading ? (
                [...Array(6)].map((_, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '2.2fr 1.6fr 1fr 1fr 1fr 100px', gap: 12, padding: '14px 22px', borderBottom: '1px solid #F5F4F1', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div className="skeleton" style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0 }} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                        <div className="skeleton" style={{ height: 12, width: '70%' }} />
                        <div className="skeleton" style={{ height: 10, width: '50%' }} />
                      </div>
                    </div>
                    {[...Array(4)].map((_, j) => <div key={j} className="skeleton" style={{ height: 12 }} />)}
                    <div className="skeleton" style={{ height: 28, borderRadius: 8 }} />
                  </div>
                ))
              ) : paginated.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ width: 60, height: 60, background: '#F5F4F1', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <Briefcase size={26} color="#AFAFAF" />
                  </div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 15, color: '#6B6B6B' }}>No bookings found</div>
                </div>
              ) : paginated.map(b => {
                const st = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending
                return (
                  <div key={b.id} className="bk-row" onClick={() => openPanel(b)}>
                    <div className="bk-parties">
                      <div className="bk-avatar" style={{ background: b.workerAvatarBg, color: b.workerAvatarColor }}>
                        {b.workerInitials}
                      </div>
                      <div className="bk-names">
                        <div className="bk-name-main">{b.clientName} → {b.workerName}</div>
                        <div className="bk-name-sub"><Briefcase size={9} />{b.skill} · {b.location}</div>
                      </div>
                    </div>
                    <div className="bk-cell">{b.description.slice(0, 40)}{b.description.length > 40 ? '…' : ''}</div>
                    <div className="bk-cell">
                      <span className="status-pill" style={{ background: st.bg, color: st.color }}>
                        {st.icon} {st.label}
                      </span>
                    </div>
                    <div className="bk-cell bold">{b.currency}{b.price}</div>
                    <div className="bk-cell"><Calendar size={11} />{formatRelative(b.createdAt)}</div>
                    <div className="bk-actions" onClick={e => e.stopPropagation()}>
                      <button className="icon-btn" onClick={() => openPanel(b)} title="View detail"><Eye size={14} /></button>
                      {(b.status === 'pending' || b.status === 'accepted') && (
                        <button
                          className="icon-btn danger"
                          onClick={() => handleForceCancel(b.id)}
                          disabled={actioningId === b.id}
                          title="Force cancel"
                        >
                          {actioningId === b.id
                            ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                            : <XCircle size={14} />
                          }
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}

              {filtered.length > PAGE_SIZE && (
                <div className="pagination">
                  <div className="pagination-info">Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}</div>
                  <div className="pagination-btns">
                    <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 0}><ChevronLeft size={14} /></button>
                    {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                      <button key={i} className={`page-btn${page === i ? ' active' : ''}`} onClick={() => setPage(i)}>{i + 1}</button>
                    ))}
                    <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}><ChevronRight size={14} /></button>
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