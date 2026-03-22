'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { db, auth } from '@/lib/firebase'
import {
  collection, query, where, orderBy, limit,
  onSnapshot, doc, updateDoc, serverTimestamp, getDocs
} from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import toast, { Toaster } from 'react-hot-toast'
import {
  LayoutDashboard, Users, Briefcase, MessageCircle,
  DollarSign, ShieldCheck, Bell, Settings, LogOut,
  Search, Menu, X, ChevronRight, ChevronLeft,
  UserCheck, UserX, Loader2, Download,
  MapPin, Calendar, Star, CheckCircle, XCircle,
  RefreshCw, Trash2, Eye, Wrench, ToggleLeft, ToggleRight,
  Award, TrendingUp, Clock
} from 'lucide-react'

// ─── SHARED SIDEBAR CSS (same as users page) ──────────────────────────────────
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
  .admin-main { flex: 1; margin-left: 256px; display: flex; flex-direction: column; min-height: 100vh; }

  /* TOPBAR */
  .admin-topbar { background: white; border-bottom: 1px solid #E8E6E1; padding: 0 32px; height: 64px; display: flex; align-items: center; gap: 14px; position: sticky; top: 0; z-index: 40; }
  .topbar-hamburger { display: none; background: none; border: none; cursor: pointer; color: #6B6B6B; padding: 6px; border-radius: 8px; }
  .topbar-hamburger:hover { background: #F5F4F1; }
  .topbar-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #0F0F0F; letter-spacing: -0.5px; }
  .topbar-sub { font-size: 13px; color: #6B6B6B; font-weight: 300; }
  .topbar-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
  .topbar-btn { display: flex; align-items: center; gap: 6px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #6B6B6B; background: none; border: 1.5px solid #E8E6E1; border-radius: 9px; padding: 7px 14px; cursor: pointer; transition: all 0.2s; }
  .topbar-btn:hover { border-color: #0F0F0F; color: #0F0F0F; }

  /* BODY */
  .admin-body { padding: 28px 32px; flex: 1; }

  /* STAT PILLS */
  .stat-pills { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
  .stat-pill { background: white; border: 1px solid #E8E6E1; border-radius: 12px; padding: 14px 20px; display: flex; align-items: center; gap: 12px; min-width: 140px; flex: 1; }
  .pill-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .pill-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: #0F0F0F; letter-spacing: -0.5px; }
  .pill-label { font-size: 12px; color: #6B6B6B; }

  /* FILTER BAR */
  .filter-bar { background: white; border: 1px solid #E8E6E1; border-radius: 14px; padding: 16px 20px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .filter-search { flex: 1; min-width: 220px; display: flex; align-items: center; gap: 10px; background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 10px; padding: 9px 14px; transition: border-color 0.2s; }
  .filter-search:focus-within { border-color: #FF5C1A; background: white; }
  .filter-search input { flex: 1; border: none; outline: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F; }
  .filter-search input::placeholder { color: #AFAFAF; }
  .filter-select-wrap { position: relative; }
  .filter-select { background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 10px; padding: 9px 32px 9px 14px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #0F0F0F; cursor: pointer; outline: none; transition: border-color 0.2s; appearance: none; }
  .filter-select:focus { border-color: #FF5C1A; }
  .filter-select-wrap::after { content: ''; position: absolute; right: 12px; top: 50%; transform: translateY(-50%); width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 5px solid #6B6B6B; pointer-events: none; }
  .filter-count { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #6B6B6B; white-space: nowrap; }

  /* WORKER CARD GRID */
  .workers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }

  /* WORKER CARD */
  .worker-card { background: white; border: 1px solid #E8E6E1; border-radius: 16px; overflow: hidden; transition: box-shadow 0.2s; }
  .worker-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
  .worker-card.suspended { opacity: 0.75; border-color: rgba(239,68,68,0.2); }

  .wc-header { padding: 20px 20px 16px; display: flex; align-items: flex-start; gap: 14px; }
  .wc-avatar { width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; flex-shrink: 0; }
  .wc-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; margin-bottom: 3px; }
  .wc-skill { display: inline-block; font-size: 11px; font-weight: 600; background: #FFF3EE; color: #FF5C1A; padding: 2px 9px; border-radius: 100px; margin-bottom: 4px; }
  .wc-status { display: inline-flex; align-items: center; gap: 5px; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 100px; margin-left: 4px; }

  .wc-stats { display: flex; gap: 14px; padding: 12px 20px; border-top: 1px solid #F5F4F1; border-bottom: 1px solid #F5F4F1; flex-wrap: wrap; }
  .wc-stat { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #6B6B6B; }
  .wc-stat strong { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #0F0F0F; }

  .wc-meta { padding: 12px 20px; display: flex; flex-direction: column; gap: 6px; border-bottom: 1px solid #F5F4F1; }
  .wc-meta-row { display: flex; align-items: center; gap: 7px; font-size: 12px; color: #6B6B6B; }

  .wc-actions { padding: 12px 20px; display: flex; gap: 8px; flex-wrap: wrap; }
  .wc-btn { display: flex; align-items: center; gap: 5px; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; border-radius: 8px; padding: 7px 12px; cursor: pointer; transition: all 0.2s; border: 1.5px solid #E8E6E1; background: none; color: #6B6B6B; }
  .wc-btn:hover { background: #F5F4F1; border-color: #0F0F0F; color: #0F0F0F; }
  .wc-btn.danger:hover { background: #FEF2F2; border-color: #EF4444; color: #EF4444; }
  .wc-btn.success { background: #FF5C1A; border-color: #FF5C1A; color: white; }
  .wc-btn.success:hover { background: #FF7A40; border-color: #FF7A40; }
  .wc-btn.warning { background: transparent; border-color: #D97706; color: #D97706; }
  .wc-btn.warning:hover { background: #FFF8EE; }
  .wc-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* LIST VIEW */
  .table-card { background: white; border: 1px solid #E8E6E1; border-radius: 16px; overflow: hidden; }
  .table-header { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 140px; gap: 12px; padding: 12px 22px; background: #F5F4F1; border-bottom: 1px solid #E8E6E1; }
  .th { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; color: #AFAFAF; text-transform: uppercase; letter-spacing: 0.8px; }
  .worker-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 140px; gap: 12px; align-items: center; padding: 14px 22px; border-bottom: 1px solid #F5F4F1; transition: background 0.15s; }
  .worker-row:last-child { border-bottom: none; }
  .worker-row:hover { background: #FAFAF8; }
  .worker-cell-main { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .worker-avatar-sm { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; flex-shrink: 0; }
  .worker-name-sm { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .worker-skill-sm { font-size: 11px; font-weight: 600; background: #FFF3EE; color: #FF5C1A; padding: 1px 7px; border-radius: 100px; display: inline-block; margin-top: 2px; }
  .worker-cell { font-size: 13px; color: #6B6B6B; display: flex; align-items: center; gap: 5px; }
  .status-badge { display: inline-flex; align-items: center; gap: 5px; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 100px; white-space: nowrap; }
  .action-btns { display: flex; align-items: center; gap: 6px; }
  .action-btn { display: flex; align-items: center; gap: 4px; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; border-radius: 7px; padding: 5px 10px; cursor: pointer; transition: all 0.2s; border: 1.5px solid #E8E6E1; background: none; color: #6B6B6B; white-space: nowrap; }
  .action-btn:hover { background: #F5F4F1; color: #0F0F0F; border-color: #0F0F0F; }
  .action-btn.danger:hover { background: #FEF2F2; color: #EF4444; border-color: #EF4444; }
  .action-btn.success:hover { background: #F0FDF4; color: #16A34A; border-color: #16A34A; }
  .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* VIEW TOGGLE */
  .view-toggle { display: flex; background: #F5F4F1; border: 1px solid #E8E6E1; border-radius: 9px; overflow: hidden; }
  .view-toggle-btn { padding: 7px 12px; background: none; border: none; cursor: pointer; color: #6B6B6B; transition: all 0.2s; display: flex; align-items: center; gap: 5px; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; }
  .view-toggle-btn.active { background: white; color: #0F0F0F; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

  /* PAGINATION */
  .pagination { display: flex; align-items: center; justify-content: space-between; padding: 16px 22px; border-top: 1px solid #E8E6E1; }
  .pagination-info { font-size: 13px; color: #6B6B6B; }
  .pagination-btns { display: flex; align-items: center; gap: 6px; }
  .page-btn { width: 34px; height: 34px; border-radius: 9px; border: 1.5px solid #E8E6E1; background: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #6B6B6B; transition: all 0.2s; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; }
  .page-btn:hover { border-color: #0F0F0F; color: #0F0F0F; }
  .page-btn.active { background: #0F0F0F; color: white; border-color: #0F0F0F; }
  .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* MODAL */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); }
  .modal { background: white; border-radius: 20px; padding: 32px; max-width: 440px; width: 100%; box-shadow: 0 24px 80px rgba(0,0,0,0.2); animation: popIn 0.25s cubic-bezier(0.175,0.885,0.32,1.275); }
  @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .modal-icon { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; }
  .modal-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: #0F0F0F; text-align: center; margin-bottom: 8px; }
  .modal-sub { font-size: 14px; color: #6B6B6B; text-align: center; font-weight: 300; line-height: 1.7; margin-bottom: 24px; }
  .modal-btns { display: flex; gap: 10px; }
  .modal-cancel { flex: 1; background: #F5F4F1; border: none; border-radius: 10px; padding: 12px; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; color: #6B6B6B; cursor: pointer; }
  .modal-confirm { flex: 1; border: none; border-radius: 10px; padding: 12px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }

  /* SKELETON */
  .skeleton { background: linear-gradient(90deg, #F5F4F1 25%, #E8E6E1 50%, #F5F4F1 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  /* LOADING */
  .loading-screen { height: 100vh; display: flex; align-items: center; justify-content: center; background: #F5F4F1; }
  .loading-spinner { width: 40px; height: 40px; border-radius: 50%; border: 3px solid #E8E6E1; border-top-color: #FF5C1A; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* RESPONSIVE */
  @media (max-width: 900px) {
    .admin-sidebar { transform: translateX(-100%); }
    .admin-main { margin-left: 0; }
    .topbar-hamburger { display: flex; }
    .admin-body { padding: 20px 16px; }
    .admin-topbar { padding: 0 16px; }
    .workers-grid { grid-template-columns: 1fr; }
    .table-header, .worker-row { grid-template-columns: 2fr 1fr 1fr 140px; }
    .th:nth-child(4), .worker-cell:nth-child(4),
    .th:nth-child(5), .worker-cell:nth-child(5) { display: none; }
  }
  @media (max-width: 600px) {
    .stat-pills { display: grid; grid-template-columns: 1fr 1fr; }
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

const palettes = [
  { bg: '#FFF3EE', color: '#FF5C1A' }, { bg: '#EEF6FF', color: '#2563EB' },
  { bg: '#F0FDF4', color: '#16A34A' }, { bg: '#FFF8EE', color: '#D97706' },
  { bg: '#F5F0FF', color: '#7C3AED' },
]

function getInitials(name: string) { return (name || '').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?' }
function formatDate(ts: any) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const PAGE_SIZE = 12

export default function AdminWorkersPage() {
  const router   = useRouter()
  const pathname = usePathname()

  const [authUser, setAuthUser]       = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [viewMode, setViewMode]       = useState<'grid' | 'list'>('grid')

  const [workers, setWorkers]         = useState<any[]>([])
  const [filtered, setFiltered]       = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [skillFilter, setSkillFilter] = useState('all')
  const [page, setPage]               = useState(0)
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [modal, setModal]             = useState<{ type: string; worker: any } | null>(null)
  const [modalLoading, setModalLoading] = useState(false)

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push('/admin/login'); return }
      try {
        const { getDoc } = await import('firebase/firestore')
        const snap = await getDoc(doc(db, 'users', u.uid))
        if (!snap.exists() || snap.data().role !== 'admin') {
          await signOut(auth); router.push('/admin/login'); return
        }
      } catch { await signOut(auth); router.push('/admin/login'); return }
      setAuthUser(u); setAuthLoading(false)
    })
    return () => unsub()
  }, [router])

  // ── Fetch workers ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authUser) return
    const q = query(collection(db, 'workers'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d, i) => {
        const w = d.data() as any
        const p = palettes[i % palettes.length]
        return {
          id:          d.id,
          name:        w.name        || 'Unknown',
          initials:    w.initials    || getInitials(w.name || 'W'),
          skill:       w.skill       || 'General',
          location:    w.location    || '—',
          rating:      w.rating      || 5.0,
          jobs:        w.jobs        || 0,
          exp:         w.exp         || '—',
          available:   w.available   !== false,
          suspended:   w.suspended   || false,
          email:       w.email       || '—',
          phone:       w.phone       || '—',
          createdAt:   w.createdAt,
          avatarBg:    w.avatarBg    || p.bg,
          avatarColor: w.avatarColor || p.color,
        }
      })
      setWorkers(data)
      setDataLoading(false)
    })
    return () => unsub()
  }, [authUser])

  // ── Filter ────────────────────────────────────────────────────────────────
  useEffect(() => {
    let f = workers
    if (search.trim()) {
      const s = search.toLowerCase()
      f = f.filter(w => w.name.toLowerCase().includes(s) || w.skill.toLowerCase().includes(s) || w.location.toLowerCase().includes(s))
    }
    if (statusFilter === 'active')    f = f.filter(w => w.available && !w.suspended)
    if (statusFilter === 'inactive')  f = f.filter(w => !w.available && !w.suspended)
    if (statusFilter === 'suspended') f = f.filter(w => w.suspended)
    if (skillFilter !== 'all')        f = f.filter(w => w.skill === skillFilter)
    setFiltered(f)
    setPage(0)
  }, [workers, search, statusFilter, skillFilter])

  const skills = [...new Set(workers.map(w => w.skill))].filter(Boolean).sort()
  const paginated  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleToggleAvailability = async (workerId: string, current: boolean) => {
    setActioningId(workerId)
    try {
      await updateDoc(doc(db, 'workers', workerId), { available: !current, updatedAt: serverTimestamp() })
      toast.success(!current ? 'Worker set as available' : 'Worker set as unavailable')
    } catch { toast.error('Action failed') }
    finally { setActioningId(null) }
  }

  const handleModalAction = async () => {
    if (!modal) return
    setModalLoading(true)
    try {
      if (modal.type === 'suspend') {
        await updateDoc(doc(db, 'workers', modal.worker.id), { suspended: true, available: false, suspendedAt: serverTimestamp() })
        toast.success('Worker suspended.')
      } else if (modal.type === 'reinstate') {
        await updateDoc(doc(db, 'workers', modal.worker.id), { suspended: false, available: true, suspendedAt: null })
        toast.success('Worker reinstated.')
      } else if (modal.type === 'delete') {
        await updateDoc(doc(db, 'workers', modal.worker.id), { deleted: true, deletedAt: serverTimestamp() })
        toast.success('Worker removed from platform.')
      }
      setModal(null)
    } catch { toast.error('Action failed. Try again.') }
    finally { setModalLoading(false) }
  }

  const handleSignOut = async () => { await signOut(auth); router.push('/admin/login') }

  if (authLoading) return <><style>{S}</style><div className="loading-screen"><div className="loading-spinner" /></div></>

  const adminInitials  = getInitials(authUser?.displayName || authUser?.email || 'A')
  const activeCount    = workers.filter(w => w.available && !w.suspended).length
  const inactiveCount  = workers.filter(w => !w.available && !w.suspended).length
  const suspendedCount = workers.filter(w => w.suspended).length
  const avgRating      = workers.length ? (workers.reduce((s, w) => s + w.rating, 0) / workers.length).toFixed(1) : '—'

  const statusOf = (w: any) => w.suspended ? 'suspended' : w.available ? 'active' : 'inactive'

  return (
    <>
      <style>{S}</style>
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />

      {/* MODAL */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-icon" style={{
              background: modal.type === 'delete' ? '#FEF2F2' : modal.type === 'suspend' ? '#FFF8EE' : '#F0FDF4'
            }}>
              {modal.type === 'delete'    && <Trash2 size={26} color="#EF4444" />}
              {modal.type === 'suspend'   && <UserX  size={26} color="#D97706" />}
              {modal.type === 'reinstate' && <UserCheck size={26} color="#16A34A" />}
            </div>
            <div className="modal-title">
              {modal.type === 'delete'    && 'Remove Worker?'}
              {modal.type === 'suspend'   && 'Suspend Worker?'}
              {modal.type === 'reinstate' && 'Reinstate Worker?'}
            </div>
            <div className="modal-sub">
              {modal.type === 'delete'    && <><strong>{modal.worker.name}</strong> will be removed from the platform. Their booking history is preserved.</>}
              {modal.type === 'suspend'   && <><strong>{modal.worker.name}</strong> will be suspended. They won't appear in searches or accept new bookings.</>}
              {modal.type === 'reinstate' && <>This will restore <strong>{modal.worker.name}</strong>'s profile and allow them to accept bookings again.</>}
            </div>
            <div className="modal-btns">
              <button className="modal-cancel" onClick={() => setModal(null)}>Cancel</button>
              <button
                className="modal-confirm"
                style={{ background: modal.type === 'delete' ? '#EF4444' : modal.type === 'suspend' ? '#D97706' : '#16A34A' }}
                onClick={handleModalAction}
                disabled={modalLoading}
              >
                {modalLoading
                  ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                  : modal.type === 'delete'    ? <><Trash2 size={14} /> Remove</>
                  : modal.type === 'suspend'   ? <><UserX size={14} /> Suspend</>
                  : <><UserCheck size={14} /> Reinstate</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

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
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className={`sb-nav-item${active ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <Icon size={17} className="sb-nav-icon" />
                {item.label}
                {item.label === 'Workers' && <span className="sb-nav-badge">{workers.length}</span>}
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
              <div className="topbar-title">Workers</div>
              <div className="topbar-sub">{workers.length} registered workers on the platform</div>
            </div>
            <div className="topbar-right">
              <div className="view-toggle">
                <button className={`view-toggle-btn${viewMode === 'grid' ? ' active' : ''}`} onClick={() => setViewMode('grid')}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="0" y="0" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="8" y="0" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="0" y="8" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="8" y="8" width="6" height="6" rx="1.5" fill="currentColor"/></svg>
                  Grid
                </button>
                <button className={`view-toggle-btn${viewMode === 'list' ? ' active' : ''}`} onClick={() => setViewMode('list')}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="0" y="1" width="14" height="2" rx="1" fill="currentColor"/><rect x="0" y="6" width="14" height="2" rx="1" fill="currentColor"/><rect x="0" y="11" width="14" height="2" rx="1" fill="currentColor"/></svg>
                  List
                </button>
              </div>
              <button className="topbar-btn" onClick={() => window.location.reload()}>
                <RefreshCw size={13} /> Refresh
              </button>
              <button className="topbar-btn">
                <Download size={13} /> Export
              </button>
            </div>
          </div>

          <div className="admin-body">
            {/* STAT PILLS */}
            <div className="stat-pills">
              {[
                { label: 'Total Workers',  val: workers.length,   bg: '#FFF3EE', icon: <UserCheck size={18} color="#FF5C1A" /> },
                { label: 'Active',         val: activeCount,      bg: '#F0FDF4', icon: <CheckCircle size={18} color="#16A34A" /> },
                { label: 'Inactive',       val: inactiveCount,    bg: '#F5F4F1', icon: <Clock size={18} color="#6B6B6B" /> },
                { label: 'Suspended',      val: suspendedCount,   bg: '#FEF2F2', icon: <UserX size={18} color="#EF4444" /> },
                { label: 'Avg Rating',     val: avgRating,        bg: '#FFF8EE', icon: <Star size={18} color="#F59E0B" fill="#F59E0B" /> },
              ].map(s => (
                <div key={s.label} className="stat-pill">
                  <div className="pill-icon" style={{ background: s.bg }}>{s.icon}</div>
                  <div>
                    <div className="pill-val">{s.val}</div>
                    <div className="pill-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* FILTER BAR */}
            <div className="filter-bar">
              <div className="filter-search">
                <Search size={16} color="#AFAFAF" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search by name, skill or location…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#AFAFAF', display: 'flex' }}><X size={14} /></button>}
              </div>
              <div className="filter-select-wrap">
                <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="filter-select-wrap">
                <select className="filter-select" value={skillFilter} onChange={e => setSkillFilter(e.target.value)}>
                  <option value="all">All Skills</option>
                  {skills.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="filter-count">{filtered.length} of {workers.length} workers</div>
            </div>

            {/* ── GRID VIEW ── */}
            {viewMode === 'grid' && (
              <>
                {dataLoading ? (
                  <div className="workers-grid">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} style={{ background: 'white', border: '1px solid #E8E6E1', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                          <div className="skeleton" style={{ width: 52, height: 52, borderRadius: '50%', flexShrink: 0 }} />
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div className="skeleton" style={{ height: 14, width: '65%' }} />
                            <div className="skeleton" style={{ height: 11, width: '40%' }} />
                          </div>
                        </div>
                        <div className="skeleton" style={{ height: 11 }} />
                        <div className="skeleton" style={{ height: 34, borderRadius: 8 }} />
                      </div>
                    ))}
                  </div>
                ) : paginated.length === 0 ? (
                  <div style={{ padding: '80px 20px', textAlign: 'center', background: 'white', border: '1px solid #E8E6E1', borderRadius: 16 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 18, background: '#F5F4F1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <UserCheck size={28} color="#AFAFAF" />
                    </div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 15, color: '#6B6B6B' }}>
                      No workers match your filters
                    </div>
                  </div>
                ) : (
                  <div className="workers-grid">
                    {paginated.map(w => {
                      const status = statusOf(w)
                      const isActioning = actioningId === w.id
                      return (
                        <div key={w.id} className={`worker-card${w.suspended ? ' suspended' : ''}`}>
                          <div className="wc-header">
                            <div className="wc-avatar" style={{ background: w.avatarBg, color: w.avatarColor }}>
                              {w.initials}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className="wc-name">{w.name}</div>
                              <div>
                                <span className="wc-skill">{w.skill}</span>
                                <span className="wc-status" style={{
                                  background: status === 'active' ? '#F0FDF4' : status === 'suspended' ? '#FEF2F2' : '#F5F4F1',
                                  color:      status === 'active' ? '#16A34A' : status === 'suspended' ? '#EF4444'  : '#6B6B6B',
                                }}>
                                  {status === 'active'    && <><CheckCircle size={9} /> Active</>}
                                  {status === 'inactive'  && <><Clock size={9} /> Inactive</>}
                                  {status === 'suspended' && <><XCircle size={9} /> Suspended</>}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="wc-stats">
                            <div className="wc-stat">
                              <Star size={13} color="#F59E0B" fill="#F59E0B" />
                              <strong>{w.rating.toFixed(1)}</strong>
                            </div>
                            <div className="wc-stat">
                              <Briefcase size={13} color="#AFAFAF" />
                              <strong>{w.jobs}</strong> jobs
                            </div>
                            <div className="wc-stat">
                              <Award size={13} color="#AFAFAF" />
                              {w.exp}
                            </div>
                          </div>

                          <div className="wc-meta">
                            <div className="wc-meta-row"><MapPin size={12} color="#AFAFAF" />{w.location}</div>
                            <div className="wc-meta-row"><Calendar size={12} color="#AFAFAF" />Joined {formatDate(w.createdAt)}</div>
                          </div>

                          <div className="wc-actions">
                            {!w.suspended ? (
                              <>
                                <button
                                  className={`wc-btn ${w.available ? 'warning' : 'success'}`}
                                  onClick={() => handleToggleAvailability(w.id, w.available)}
                                  disabled={isActioning}
                                >
                                  {isActioning
                                    ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                                    : w.available ? <><ToggleLeft size={13} /> Set Unavailable</> : <><ToggleRight size={13} /> Set Available</>
                                  }
                                </button>
                                <button className="wc-btn" onClick={() => setModal({ type: 'suspend', worker: w })}>
                                  <UserX size={12} /> Suspend
                                </button>
                              </>
                            ) : (
                              <button className="wc-btn success" onClick={() => setModal({ type: 'reinstate', worker: w })}>
                                <UserCheck size={12} /> Reinstate
                              </button>
                            )}
                            <button className="wc-btn danger" onClick={() => setModal({ type: 'delete', worker: w })}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Grid pagination */}
                {filtered.length > PAGE_SIZE && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
                    <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 0}><ChevronLeft size={15} /></button>
                    {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                      <button key={i} className={`page-btn${page === i ? ' active' : ''}`} onClick={() => setPage(i)}>{i + 1}</button>
                    ))}
                    <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}><ChevronRight size={15} /></button>
                  </div>
                )}
              </>
            )}

            {/* ── LIST VIEW ── */}
            {viewMode === 'list' && (
              <div className="table-card">
                <div className="table-header">
                  <div className="th">Worker</div>
                  <div className="th">Skill</div>
                  <div className="th">Rating</div>
                  <div className="th">Jobs</div>
                  <div className="th">Status</div>
                  <div className="th">Actions</div>
                </div>

                {dataLoading ? (
                  [...Array(6)].map((_, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 140px', gap: 12, padding: '14px 22px', borderBottom: '1px solid #F5F4F1', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                          <div className="skeleton" style={{ height: 13, width: '70%' }} />
                          <div className="skeleton" style={{ height: 11, width: '40%' }} />
                        </div>
                      </div>
                      {[...Array(4)].map((_, j) => <div key={j} className="skeleton" style={{ height: 12 }} />)}
                      <div className="skeleton" style={{ height: 30, borderRadius: 8 }} />
                    </div>
                  ))
                ) : paginated.length === 0 ? (
                  <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 15, color: '#6B6B6B' }}>No workers match your filters</div>
                  </div>
                ) : paginated.map(w => {
                  const status = statusOf(w)
                  const isActioning = actioningId === w.id
                  return (
                    <div key={w.id} className="worker-row">
                      <div className="worker-cell-main">
                        <div className="worker-avatar-sm" style={{ background: w.avatarBg, color: w.avatarColor }}>{w.initials}</div>
                        <div style={{ minWidth: 0 }}>
                          <div className="worker-name-sm">{w.name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                            <MapPin size={10} color="#AFAFAF" />
                            <span style={{ fontSize: 11, color: '#AFAFAF' }}>{w.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="worker-cell">
                        <span className="worker-skill-sm">{w.skill}</span>
                      </div>
                      <div className="worker-cell">
                        <Star size={12} color="#F59E0B" fill="#F59E0B" />
                        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: '#0F0F0F' }}>{w.rating.toFixed(1)}</span>
                      </div>
                      <div className="worker-cell">
                        <Briefcase size={12} color="#AFAFAF" />
                        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: '#0F0F0F' }}>{w.jobs}</span>
                      </div>
                      <div className="worker-cell">
                        <span className="status-badge" style={{
                          background: status === 'active' ? '#F0FDF4' : status === 'suspended' ? '#FEF2F2' : '#F5F4F1',
                          color:      status === 'active' ? '#16A34A' : status === 'suspended' ? '#EF4444'  : '#6B6B6B',
                        }}>
                          {status === 'active'    && <><CheckCircle size={9} /> Active</>}
                          {status === 'inactive'  && <><Clock size={9} /> Inactive</>}
                          {status === 'suspended' && <><XCircle size={9} /> Suspended</>}
                        </span>
                      </div>
                      <div className="action-btns">
                        <button
                          className="action-btn"
                          onClick={() => handleToggleAvailability(w.id, w.available)}
                          disabled={isActioning || w.suspended}
                          title={w.available ? 'Set unavailable' : 'Set available'}
                        >
                          {isActioning
                            ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                            : w.available ? <ToggleLeft size={12} /> : <ToggleRight size={12} />
                          }
                        </button>
                        {!w.suspended ? (
                          <button className="action-btn" onClick={() => setModal({ type: 'suspend', worker: w })} title="Suspend">
                            <UserX size={12} />
                          </button>
                        ) : (
                          <button className="action-btn success" onClick={() => setModal({ type: 'reinstate', worker: w })} title="Reinstate">
                            <UserCheck size={12} />
                          </button>
                        )}
                        <button className="action-btn danger" onClick={() => setModal({ type: 'delete', worker: w })} title="Remove">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  )
                })}

                {filtered.length > PAGE_SIZE && (
                  <div className="pagination">
                    <div className="pagination-info">Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}</div>
                    <div className="pagination-btns">
                      <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 0}><ChevronLeft size={15} /></button>
                      {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                        <button key={i} className={`page-btn${page === i ? ' active' : ''}`} onClick={() => setPage(i)}>{i + 1}</button>
                      ))}
                      <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}><ChevronRight size={15} /></button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}