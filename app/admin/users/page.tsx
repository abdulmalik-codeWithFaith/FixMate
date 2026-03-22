'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { db, auth } from '@/lib/firebase'
import {
  collection, query, where, orderBy, limit,
  onSnapshot, doc, updateDoc, deleteDoc,
  serverTimestamp, startAfter, getDocs,
  getCountFromServer, setDoc
} from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import toast, { Toaster } from 'react-hot-toast'
import {
  LayoutDashboard, Users, Briefcase, MessageCircle,
  DollarSign, ShieldCheck, Bell, Settings, LogOut,
  Search, Menu, X, ChevronRight, ChevronLeft,
  UserCheck, UserX, Loader2, Filter, Download,
  Mail, Phone, MapPin, Calendar, Eye, Trash2,
  MoreVertical, CheckCircle, XCircle, Clock,
  RefreshCw, SlidersHorizontal, ChevronDown,
  AlertTriangle
} from 'lucide-react'

// ─── SHARED SIDEBAR CSS ────────────────────────────────────────────────────────
const SIDEBAR_CSS = `
  .admin-sidebar {
    width: 256px; flex-shrink: 0; background: #0F0F0F;
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0;
    z-index: 50; overflow-y: auto; transition: transform 0.3s;
  }
  .admin-sidebar.sb-open { transform: translateX(0) !important; }
  .sb-logo {
    display: flex; align-items: center; gap: 11px;
    padding: 26px 22px 20px; border-bottom: 1px solid rgba(255,255,255,0.07);
    text-decoration: none;
  }
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
  .topbar-btn { display: flex; align-items: center; gap: 6px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #6B6B6B; background: none; border: 1.5px solid #E8E6E1; border-radius: 9px; padding: 7px 14px; cursor: pointer; transition: all 0.2s; text-decoration: none; }
  .topbar-btn:hover { border-color: #0F0F0F; color: #0F0F0F; }
  .topbar-btn.primary { background: #FF5C1A; color: white; border-color: #FF5C1A; }
  .topbar-btn.primary:hover { background: #FF7A40; border-color: #FF7A40; color: white; }

  /* BODY */
  .admin-body { padding: 28px 32px; flex: 1; }

  /* STAT PILLS */
  .stat-pills { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
  .stat-pill { background: white; border: 1px solid #E8E6E1; border-radius: 12px; padding: 14px 20px; display: flex; align-items: center; gap: 12px; min-width: 140px; }
  .pill-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .pill-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: #0F0F0F; letter-spacing: -0.5px; }
  .pill-label { font-size: 12px; color: #6B6B6B; }

  /* FILTERS */
  .filter-bar { background: white; border: 1px solid #E8E6E1; border-radius: 14px; padding: 16px 20px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .filter-search { flex: 1; min-width: 220px; display: flex; align-items: center; gap: 10px; background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 10px; padding: 9px 14px; transition: border-color 0.2s; }
  .filter-search:focus-within { border-color: #FF5C1A; background: white; }
  .filter-search input { flex: 1; border: none; outline: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F; }
  .filter-search input::placeholder { color: #AFAFAF; }
  .filter-select { background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 10px; padding: 9px 14px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #0F0F0F; cursor: pointer; outline: none; transition: border-color 0.2s; appearance: none; padding-right: 32px; position: relative; }
  .filter-select:focus { border-color: #FF5C1A; }
  .filter-select-wrap { position: relative; }
  .filter-select-wrap::after { content: ''; position: absolute; right: 12px; top: 50%; transform: translateY(-50%); width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 5px solid #6B6B6B; pointer-events: none; }
  .filter-count { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #6B6B6B; white-space: nowrap; }

  /* TABLE CARD */
  .table-card { background: white; border: 1px solid #E8E6E1; border-radius: 16px; overflow: hidden; }
  .table-header { display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 120px; gap: 12px; padding: 12px 22px; background: #F5F4F1; border-bottom: 1px solid #E8E6E1; }
  .th { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; color: #AFAFAF; text-transform: uppercase; letter-spacing: 0.8px; }

  /* USER ROW */
  .user-row { display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 120px; gap: 12px; align-items: center; padding: 14px 22px; border-bottom: 1px solid #F5F4F1; transition: background 0.15s; }
  .user-row:last-child { border-bottom: none; }
  .user-row:hover { background: #FAFAF8; }

  .user-cell-main { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .user-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; flex-shrink: 0; }
  .user-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .user-email { font-size: 12px; color: #6B6B6B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }

  .user-cell { font-size: 13px; color: #6B6B6B; display: flex; align-items: center; gap: 5px; }
  .user-cell.dark { color: #0F0F0F; font-weight: 500; }

  .status-badge { display: inline-flex; align-items: center; gap: 5px; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 100px; white-space: nowrap; }

  /* ACTION BUTTONS */
  .action-btns { display: flex; align-items: center; gap: 6px; }
  .action-btn { display: flex; align-items: center; gap: 4px; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; border-radius: 7px; padding: 5px 10px; cursor: pointer; transition: all 0.2s; border: 1.5px solid #E8E6E1; background: none; color: #6B6B6B; white-space: nowrap; }
  .action-btn:hover { background: #F5F4F1; color: #0F0F0F; border-color: #0F0F0F; }
  .action-btn.danger:hover { background: #FEF2F2; color: #EF4444; border-color: #EF4444; }
  .action-btn.success:hover { background: #F0FDF4; color: #16A34A; border-color: #16A34A; }
  .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

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

  /* RESPONSIVE */
  @media (max-width: 1100px) {
    .table-header, .user-row { grid-template-columns: 2fr 1fr 1fr 100px; }
    .th:nth-child(3), .user-cell:nth-child(3),
    .th:nth-child(5), .user-cell:nth-child(5) { display: none; }
  }
  @media (max-width: 900px) {
    .admin-sidebar { transform: translateX(-100%); }
    .admin-main { margin-left: 0; }
    .topbar-hamburger { display: flex; }
    .admin-body { padding: 20px 16px; }
    .admin-topbar { padding: 0 16px; }
    .table-header, .user-row { grid-template-columns: 1fr 1fr 100px; }
    .th:nth-child(2), .user-cell:nth-child(2),
    .th:nth-child(3), .user-cell:nth-child(3),
    .th:nth-child(5), .user-cell:nth-child(5) { display: none; }
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
  { bg: '#EEF6FF', color: '#2563EB' }, { bg: '#FFF3EE', color: '#FF5C1A' },
  { bg: '#F0FDF4', color: '#16A34A' }, { bg: '#FFF8EE', color: '#D97706' },
  { bg: '#F5F0FF', color: '#7C3AED' },
]

function getInitials(name: string) {
  return (name || '').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?'
}
function formatDate(ts: any) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const PAGE_SIZE = 10

export default function AdminUsersPage() {
  const router   = useRouter()
  const pathname = usePathname()

  const [authUser, setAuthUser]       = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [users, setUsers]           = useState<any[]>([])
  const [filtered, setFiltered]     = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage]             = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [actioningId, setActioningId] = useState<string | null>(null)

  // Modal
  const [modal, setModal] = useState<{ type: 'delete' | 'suspend' | 'activate'; user: any } | null>(null)
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
      setAuthUser(u)
      setAuthLoading(false)
    })
    return () => unsub()
  }, [router])

  // ── Fetch clients ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authUser) return
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'client'),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d, i) => {
        const u = d.data() as any
        const p = palettes[i % palettes.length]
        return {
          id:        d.id,
          name:      u.displayName || u.name || 'Unknown',
          email:     u.email       || '—',
          phone:     u.phone       || '—',
          location:  u.location    || '—',
          role:      u.role        || 'client',
          status:    u.suspended   ? 'suspended' : 'active',
          createdAt: u.createdAt,
          avatarBg:  p.bg,
          avatarColor: p.color,
        }
      })
      setUsers(data)
      setTotalCount(data.length)
      setDataLoading(false)
    })
    return () => unsub()
  }, [authUser])

  // ── Filter ────────────────────────────────────────────────────────────────
  useEffect(() => {
    let f = users
    if (search.trim()) {
      const s = search.toLowerCase()
      f = f.filter(u => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.location.toLowerCase().includes(s))
    }
    if (statusFilter !== 'all') f = f.filter(u => u.status === statusFilter)
    setFiltered(f)
    setPage(0)
  }, [users, search, statusFilter])

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleAction = async () => {
    if (!modal) return
    setModalLoading(true)
    try {
      if (modal.type === 'delete') {
        await updateDoc(doc(db, 'users', modal.user.id), {
          deleted: true, deletedAt: serverTimestamp()
        })
        toast.success('User removed from platform.')
      } else if (modal.type === 'suspend') {
        await updateDoc(doc(db, 'users', modal.user.id), {
          suspended: true, suspendedAt: serverTimestamp()
        })
        toast.success('User suspended.')
      } else if (modal.type === 'activate') {
        await updateDoc(doc(db, 'users', modal.user.id), {
          suspended: false, suspendedAt: null
        })
        toast.success('User account reactivated.')
      }
      setModal(null)
    } catch { toast.error('Action failed. Try again.') }
    finally { setModalLoading(false) }
  }

  const handleSignOut = async () => { await signOut(auth); router.push('/admin/login') }

  if (authLoading) return <><style>{S}</style><div className="loading-screen"><div className="loading-spinner" /></div></>

  const adminInitials = getInitials(authUser?.displayName || authUser?.email || 'A')
  const activeCount    = users.filter(u => u.status === 'active').length
  const suspendedCount = users.filter(u => u.status === 'suspended').length

  return (
    <>
      <style>{S}</style>
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />

      {/* CONFIRM MODAL */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-icon" style={{
              background: modal.type === 'delete' ? '#FEF2F2' : modal.type === 'suspend' ? '#FFF8EE' : '#F0FDF4'
            }}>
              {modal.type === 'delete'   && <Trash2 size={26} color="#EF4444" />}
              {modal.type === 'suspend'  && <UserX  size={26} color="#D97706" />}
              {modal.type === 'activate' && <UserCheck size={26} color="#16A34A" />}
            </div>
            <div className="modal-title">
              {modal.type === 'delete'   && 'Remove User?'}
              {modal.type === 'suspend'  && 'Suspend User?'}
              {modal.type === 'activate' && 'Reactivate User?'}
            </div>
            <div className="modal-sub">
              {modal.type === 'delete'   && <>This will soft-delete <strong>{modal.user.name}</strong>'s account. All their data is preserved in Firestore.</>}
              {modal.type === 'suspend'  && <>This will suspend <strong>{modal.user.name}</strong>. They will not be able to log in or create bookings.</>}
              {modal.type === 'activate' && <>This will restore <strong>{modal.user.name}</strong>'s access to the platform.</>}
            </div>
            <div className="modal-btns">
              <button className="modal-cancel" onClick={() => setModal(null)}>Cancel</button>
              <button
                className="modal-confirm"
                style={{ background: modal.type === 'delete' ? '#EF4444' : modal.type === 'suspend' ? '#D97706' : '#16A34A' }}
                onClick={handleAction}
                disabled={modalLoading}
              >
                {modalLoading
                  ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                  : modal.type === 'delete'   ? <><Trash2 size={14} /> Remove</>
                  : modal.type === 'suspend'  ? <><UserX size={14} /> Suspend</>
                  : <><UserCheck size={14} /> Reactivate</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-layout">
        {/* OVERLAY */}
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
                {item.label === 'Users' && <span className="sb-nav-badge">{users.length}</span>}
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
              <div className="topbar-title">Client Users</div>
              <div className="topbar-sub">{users.length} registered clients</div>
            </div>
            <div className="topbar-right">
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
                { label: 'Total Clients',  val: users.length,    bg: '#EEF6FF', color: '#2563EB', icon: <Users size={18} color="#2563EB" /> },
                { label: 'Active',         val: activeCount,     bg: '#F0FDF4', color: '#16A34A', icon: <CheckCircle size={18} color="#16A34A" /> },
                { label: 'Suspended',      val: suspendedCount,  bg: '#FEF2F2', color: '#EF4444', icon: <UserX size={18} color="#EF4444" /> },
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
                  placeholder="Search by name, email or location…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#AFAFAF', display: 'flex' }}><X size={14} /></button>}
              </div>
              <div className="filter-select-wrap">
                <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="filter-count">
                {filtered.length} of {users.length} users
              </div>
            </div>

            {/* TABLE */}
            <div className="table-card">
              <div className="table-header">
                <div className="th">User</div>
                <div className="th">Contact</div>
                <div className="th">Location</div>
                <div className="th">Status</div>
                <div className="th">Joined</div>
                <div className="th">Actions</div>
              </div>

              {dataLoading ? (
                [...Array(6)].map((_, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 120px', gap: 12, padding: '14px 22px', borderBottom: '1px solid #F5F4F1', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                        <div className="skeleton" style={{ height: 13, width: '70%' }} />
                        <div className="skeleton" style={{ height: 11, width: '55%' }} />
                      </div>
                    </div>
                    <div className="skeleton" style={{ height: 12 }} />
                    <div className="skeleton" style={{ height: 12 }} />
                    <div className="skeleton" style={{ height: 22, borderRadius: 100, width: 70 }} />
                    <div className="skeleton" style={{ height: 12 }} />
                    <div className="skeleton" style={{ height: 30, borderRadius: 8 }} />
                  </div>
                ))
              ) : paginated.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ width: 60, height: 60, borderRadius: 18, background: '#F5F4F1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Users size={26} color="#AFAFAF" />
                  </div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 15, color: '#6B6B6B' }}>
                    {search || statusFilter !== 'all' ? 'No users match your filters' : 'No client users yet'}
                  </div>
                </div>
              ) : paginated.map(u => (
                <div key={u.id} className="user-row">
                  <div className="user-cell-main">
                    <div className="user-avatar" style={{ background: u.avatarBg, color: u.avatarColor }}>
                      {getInitials(u.name)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div className="user-name">{u.name}</div>
                      <div className="user-email">{u.email}</div>
                    </div>
                  </div>
                  <div className="user-cell">
                    <Mail size={12} style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.phone !== '—' ? u.phone : u.email}</span>
                  </div>
                  <div className="user-cell">
                    <MapPin size={12} style={{ flexShrink: 0 }} />
                    {u.location}
                  </div>
                  <div className="user-cell">
                    <span className="status-badge" style={{
                      background: u.status === 'active' ? '#F0FDF4' : '#FEF2F2',
                      color:      u.status === 'active' ? '#16A34A' : '#EF4444',
                    }}>
                      {u.status === 'active' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      {u.status === 'active' ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                  <div className="user-cell">
                    <Calendar size={12} style={{ flexShrink: 0 }} />
                    {formatDate(u.createdAt)}
                  </div>
                  <div className="action-btns">
                    {u.status === 'active' ? (
                      <button className="action-btn danger" onClick={() => setModal({ type: 'suspend', user: u })}>
                        <UserX size={12} />
                      </button>
                    ) : (
                      <button className="action-btn success" onClick={() => setModal({ type: 'activate', user: u })}>
                        <UserCheck size={12} />
                      </button>
                    )}
                    <button className="action-btn danger" onClick={() => setModal({ type: 'delete', user: u })}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}

              {/* PAGINATION */}
              {filtered.length > PAGE_SIZE && (
                <div className="pagination">
                  <div className="pagination-info">
                    Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
                  </div>
                  <div className="pagination-btns">
                    <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
                      <ChevronLeft size={15} />
                    </button>
                    {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                      <button key={i} className={`page-btn${page === i ? ' active' : ''}`} onClick={() => setPage(i)}>
                        {i + 1}
                      </button>
                    ))}
                    <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
                      <ChevronRight size={15} />
                    </button>
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