'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { db, auth } from '@/lib/firebase'
import {
  collection, query, where, orderBy, onSnapshot,
  doc, getDoc, limit, getDocs
} from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import toast, { Toaster } from 'react-hot-toast'
import {
  LayoutDashboard, Users, Briefcase, MessageCircle,
  DollarSign, ShieldCheck, Settings, LogOut,
  Search, Menu, X, Send, CheckCheck, Clock,
  RefreshCw, UserCheck, Loader2, MessageSquare,
  AlertTriangle, Eye, ArrowLeft
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
  .admin-main { flex: 1; margin-left: 256px; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

  .admin-topbar { background: white; border-bottom: 1px solid #E8E6E1; padding: 0 32px; height: 64px; display: flex; align-items: center; gap: 14px; flex-shrink: 0; }
  .topbar-hamburger { display: none; background: none; border: none; cursor: pointer; color: #6B6B6B; padding: 6px; border-radius: 8px; }
  .topbar-hamburger:hover { background: #F5F4F1; }
  .topbar-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #0F0F0F; letter-spacing: -0.5px; }
  .topbar-sub { font-size: 13px; color: #6B6B6B; font-weight: 300; }
  .topbar-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
  .topbar-btn { display: flex; align-items: center; gap: 6px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #6B6B6B; background: none; border: 1.5px solid #E8E6E1; border-radius: 9px; padding: 7px 14px; cursor: pointer; transition: all 0.2s; }
  .topbar-btn:hover { border-color: #0F0F0F; color: #0F0F0F; }

  /* MESSAGES LAYOUT */
  .msg-layout { flex: 1; display: grid; grid-template-columns: 340px 1fr; overflow: hidden; }

  /* CONVERSATION LIST */
  .conv-list { background: white; border-right: 1px solid #E8E6E1; display: flex; flex-direction: column; overflow: hidden; }
  .conv-list-header { padding: 18px 20px; border-bottom: 1px solid #E8E6E1; flex-shrink: 0; }
  .conv-list-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 16px; color: #0F0F0F; margin-bottom: 12px; }
  .conv-search { display: flex; align-items: center; gap: 9px; background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 10px; padding: 9px 14px; transition: border-color 0.2s; }
  .conv-search:focus-within { border-color: #FF5C1A; background: white; }
  .conv-search input { flex: 1; border: none; outline: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F; }
  .conv-search input::placeholder { color: #AFAFAF; }
  .conv-scroll { flex: 1; overflow-y: auto; }
  .conv-scroll::-webkit-scrollbar { width: 3px; }
  .conv-scroll::-webkit-scrollbar-thumb { background: #E8E6E1; border-radius: 2px; }

  /* CONVERSATION ITEM */
  .conv-item { display: flex; align-items: center; gap: 12px; padding: 14px 20px; border-bottom: 1px solid #F5F4F1; cursor: pointer; transition: background 0.15s; }
  .conv-item:hover { background: #FAFAF8; }
  .conv-item.active { background: #FFF3EE; border-left: 3px solid #FF5C1A; }
  .conv-avatar-stack { position: relative; width: 46px; height: 46px; flex-shrink: 0; }
  .conv-av { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px; border: 2px solid white; position: absolute; }
  .conv-av.top { top: 0; left: 0; }
  .conv-av.btm { bottom: 0; right: 0; }
  .conv-info { flex: 1; min-width: 0; }
  .conv-names { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #0F0F0F; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px; }
  .conv-preview { font-size: 12px; color: #6B6B6B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .conv-preview.unread { color: #0F0F0F; font-weight: 600; }
  .conv-right { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; flex-shrink: 0; }
  .conv-time { font-size: 11px; color: #AFAFAF; }
  .conv-badge { min-width: 18px; height: 18px; background: #FF5C1A; color: white; border-radius: 9px; font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 4px; }

  /* CHAT PANEL */
  .chat-panel { background: #F5F4F1; display: flex; flex-direction: column; overflow: hidden; }

  /* CHAT HEADER */
  .chat-header { background: white; border-bottom: 1px solid #E8E6E1; padding: 0 24px; height: 64px; display: flex; align-items: center; gap: 14px; flex-shrink: 0; }
  .chat-header-back { display: none; background: none; border: 1.5px solid #E8E6E1; border-radius: 8px; width: 32px; height: 32px; cursor: pointer; color: #6B6B6B; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .chat-header-back:hover { border-color: #0F0F0F; color: #0F0F0F; }
  .chat-header-avatars { display: flex; }
  .chat-header-av { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; border: 2px solid white; }
  .chat-header-av:nth-child(2) { margin-left: -10px; }
  .chat-header-names { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; }
  .chat-header-sub { font-size: 12px; color: #6B6B6B; margin-top: 2px; }
  .chat-header-badge { margin-left: auto; display: flex; align-items: center; gap: 6px; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; background: #FFF8EE; color: #D97706; border: 1px solid rgba(217,119,6,0.2); padding: 5px 11px; border-radius: 100px; }

  /* MESSAGES AREA */
  .chat-messages { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 10px; }
  .chat-messages::-webkit-scrollbar { width: 4px; }
  .chat-messages::-webkit-scrollbar-thumb { background: #E8E6E1; border-radius: 2px; }

  .date-sep { display: flex; align-items: center; gap: 12px; margin: 8px 0; }
  .date-sep-line { flex: 1; height: 1px; background: #E8E6E1; }
  .date-sep-text { font-size: 11px; color: #AFAFAF; font-weight: 500; white-space: nowrap; background: #F5F4F1; padding: 2px 10px; border-radius: 100px; }

  .msg-row { display: flex; gap: 8px; align-items: flex-end; }
  .msg-row.right { flex-direction: row-reverse; }
  .msg-av-sm { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 10px; flex-shrink: 0; }
  .bubble { max-width: 65%; padding: 10px 15px; border-radius: 18px; font-size: 14px; line-height: 1.6; word-break: break-word; }
  .bubble.left { background: white; color: #0F0F0F; border: 1px solid #E8E6E1; border-bottom-left-radius: 4px; }
  .bubble.right { background: #0F0F0F; color: white; border-bottom-right-radius: 4px; }
  .bubble-meta { display: flex; align-items: center; gap: 4px; margin-top: 4px; }
  .bubble-time { font-size: 10px; color: #AFAFAF; }
  .bubble-time.r { color: rgba(255,255,255,0.45); }
  .bubble-sender { font-size: 10px; color: #AFAFAF; margin-bottom: 4px; font-family: 'Syne', sans-serif; font-weight: 600; }

  /* ADMIN INFO BAR */
  .admin-info-bar { background: #FFF8EE; border-top: 1px solid rgba(217,119,6,0.15); padding: 12px 24px; display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .admin-info-text { font-size: 12px; color: #92400E; }
  .admin-info-text strong { font-family: 'Syne', sans-serif; font-weight: 700; }

  /* EMPTY STATE */
  .chat-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; }
  .empty-icon-wrap { width: 72px; height: 72px; border-radius: 20px; background: white; border: 1px solid #E8E6E1; display: flex; align-items: center; justify-content: center; }
  .empty-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; }
  .empty-sub { font-size: 14px; color: #6B6B6B; font-weight: 300; }

  /* SKELETON */
  .skeleton { background: linear-gradient(90deg, #F5F4F1 25%, #E8E6E1 50%, #F5F4F1 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  .loading-screen { height: 100vh; display: flex; align-items: center; justify-content: center; background: #F5F4F1; }
  .loading-spinner { width: 40px; height: 40px; border-radius: 50%; border: 3px solid #E8E6E1; border-top-color: #FF5C1A; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 900px) {
    .admin-sidebar { transform: translateX(-100%); }
    .admin-main { margin-left: 0; height: 100dvh; }
    .topbar-hamburger { display: flex; }
    .admin-topbar { padding: 0 16px; }
    .msg-layout { grid-template-columns: 1fr; }
    .chat-panel { display: none; }
    .chat-panel.mobile-open { display: flex; position: fixed; inset: 0; z-index: 60; }
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

function getInitials(name: string) { return (name || '').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?' }
function formatTime(ts: any) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const diff = (Date.now() - d.getTime()) / 60000
  if (diff < 1)    return 'now'
  if (diff < 60)   return `${Math.round(diff)}m`
  if (diff < 1440) return `${Math.round(diff / 60)}h`
  if (diff < 10080) return d.toLocaleDateString('en-US', { weekday: 'short' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
function formatMsgTime(ts: any) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export default function AdminMessagesPage() {
  const router   = useRouter()
  const pathname = usePathname()

  const [authUser, setAuthUser]         = useState<any>(null)
  const [authLoading, setAuthLoading]   = useState(true)
  const [sidebarOpen, setSidebarOpen]   = useState(false)

  const [chats, setChats]               = useState<any[]>([])
  const [chatsLoading, setChatsLoading] = useState(true)
  const [search, setSearch]             = useState('')
  const [activeChat, setActiveChat]     = useState<any>(null)
  const [messages, setMessages]         = useState<any[]>([])
  const [msgsLoading, setMsgsLoading]   = useState(false)
  const [mobileOpen, setMobileOpen]     = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

  // Fetch all chat threads
  useEffect(() => {
    if (!authUser) return
    const q = query(collection(db, 'chats'), orderBy('updatedAt', 'desc'))
    const unsub = onSnapshot(q, async (snap) => {
      const enriched = await Promise.all(snap.docs.map(async (d, i) => {
        const data = d.data() as any
        const participants: string[] = data.participants || []

        // Enrich both participants
        const profiles = await Promise.all(participants.map(async (uid, j) => {
          const p = PALETTES[(i + j) % PALETTES.length]
          try {
            const wSnap = await getDoc(doc(db, 'workers', uid))
            if (wSnap.exists()) {
              const w = wSnap.data() as any
              return { uid, name: w.name || 'Worker', initials: w.initials || getInitials(w.name || 'W'), role: 'Worker', avatarBg: w.avatarBg || p.bg, avatarColor: w.avatarColor || p.color }
            }
            const uSnap = await getDoc(doc(db, 'users', uid))
            if (uSnap.exists()) {
              const u = uSnap.data() as any
              const name = u.displayName || u.name || 'User'
              return { uid, name, initials: getInitials(name), role: 'Client', avatarBg: '#EEF6FF', avatarColor: '#2563EB' }
            }
          } catch {}
          return { uid, name: 'Unknown', initials: '?', role: 'User', avatarBg: '#F5F4F1', avatarColor: '#6B6B6B' }
        }))

        return {
          id:          d.id,
          participants,
          profiles,
          lastMessage: data.lastMessage || 'No messages yet',
          updatedAt:   data.updatedAt,
          unread:      0,
        }
      }))
      setChats(enriched)
      setChatsLoading(false)
    })
    return () => unsub()
  }, [authUser])

  // Load messages for selected chat
  useEffect(() => {
    if (!activeChat) return
    setMsgsLoading(true)
    const q = query(
      collection(db, 'chats', activeChat.id, 'messages'),
      orderBy('createdAt', 'asc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() as any })))
      setMsgsLoading(false)
    })
    return () => unsub()
  }, [activeChat])

  const filteredChats = search.trim()
    ? chats.filter(c => c.profiles.some((p: any) => p.name.toLowerCase().includes(search.toLowerCase())))
    : chats

  const handleSignOut = async () => { await signOut(auth); router.push('/admin/login') }

  const openChat = (chat: any) => {
    setActiveChat(chat)
    setMobileOpen(true)
  }

  if (authLoading) return <><style>{S}</style><div className="loading-screen"><div className="loading-spinner" /></div></>

  const adminInitials = getInitials(authUser?.displayName || authUser?.email || 'A')

  // Group messages by date
  const groupedMessages: { date: string; msgs: any[] }[] = []
  messages.forEach(msg => {
    const d = msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date()
    const dateStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    const last = groupedMessages[groupedMessages.length - 1]
    if (!last || last.date !== dateStr) groupedMessages.push({ date: dateStr, msgs: [msg] })
    else last.msgs.push(msg)
  })

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
                <Icon size={17} className="sb-nav-icon" />
                {item.label}
                {item.label === 'Messages' && chats.length > 0 && <span className="sb-nav-badge">{chats.length}</span>}
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
              <div className="topbar-title">Messages</div>
              <div className="topbar-sub">{chats.length} conversation threads on the platform</div>
            </div>
            <div className="topbar-right">
              <button className="topbar-btn" onClick={() => window.location.reload()}><RefreshCw size={13} /> Refresh</button>
            </div>
          </div>

          <div className="msg-layout">
            {/* ── CONVERSATION LIST ── */}
            <div className="conv-list">
              <div className="conv-list-header">
                <div className="conv-list-title">All Threads</div>
                <div className="conv-search">
                  <Search size={15} color="#AFAFAF" style={{ flexShrink: 0 }} />
                  <input
                    placeholder="Search by participant name…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#AFAFAF', display: 'flex' }}><X size={14} /></button>}
                </div>
              </div>

              <div className="conv-scroll">
                {chatsLoading ? (
                  [...Array(6)].map((_, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 20px', borderBottom: '1px solid #F5F4F1', alignItems: 'center' }}>
                      <div style={{ position: 'relative', width: 46, height: 46, flexShrink: 0 }}>
                        <div className="skeleton" style={{ width: 34, height: 34, borderRadius: '50%', position: 'absolute', top: 0, left: 0 }} />
                        <div className="skeleton" style={{ width: 34, height: 34, borderRadius: '50%', position: 'absolute', bottom: 0, right: 0 }} />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div className="skeleton" style={{ height: 13, width: '65%' }} />
                        <div className="skeleton" style={{ height: 11, width: '80%' }} />
                      </div>
                    </div>
                  ))
                ) : filteredChats.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <MessageSquare size={30} color="#AFAFAF" style={{ margin: '0 auto 12px', display: 'block' }} />
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 14, color: '#6B6B6B' }}>
                      {search ? 'No threads found' : 'No conversations yet'}
                    </div>
                  </div>
                ) : filteredChats.map((chat, i) => {
                  const p0 = chat.profiles[0]
                  const p1 = chat.profiles[1]
                  const isActive = activeChat?.id === chat.id
                  return (
                    <div
                      key={chat.id}
                      className={`conv-item${isActive ? ' active' : ''}`}
                      onClick={() => openChat(chat)}
                    >
                      <div className="conv-avatar-stack">
                        {p0 && <div className="conv-av top" style={{ background: p0.avatarBg, color: p0.avatarColor }}>{p0.initials}</div>}
                        {p1 && <div className="conv-av btm" style={{ background: p1.avatarBg, color: p1.avatarColor }}>{p1.initials}</div>}
                      </div>
                      <div className="conv-info">
                        <div className="conv-names">
                          {chat.profiles.map((p: any) => p.name).join(' & ')}
                        </div>
                        <div className="conv-preview">
                          {chat.lastMessage}
                        </div>
                      </div>
                      <div className="conv-right">
                        <div className="conv-time">{formatTime(chat.updatedAt)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── CHAT PANEL ── */}
            <div className={`chat-panel${mobileOpen ? ' mobile-open' : ''}`}>
              {!activeChat ? (
                <div className="chat-empty">
                  <div className="empty-icon-wrap">
                    <Eye size={28} color="#AFAFAF" />
                  </div>
                  <div className="empty-title">Select a conversation</div>
                  <div className="empty-sub">Choose a thread from the list to view messages</div>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="chat-header">
                    <button className="chat-header-back" onClick={() => { setMobileOpen(false); setActiveChat(null) }}>
                      <ArrowLeft size={16} />
                    </button>
                    <div className="chat-header-avatars">
                      {activeChat.profiles.slice(0, 2).map((p: any, i: number) => (
                        <div key={p.uid} className="chat-header-av" style={{ background: p.avatarBg, color: p.avatarColor }}>
                          {p.initials}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="chat-header-names">
                        {activeChat.profiles.map((p: any) => p.name).join(' & ')}
                      </div>
                      <div className="chat-header-sub">
                        {activeChat.profiles.map((p: any) => p.role).join(' · ')} · {messages.length} messages
                      </div>
                    </div>
                    <div className="chat-header-badge">
                      <AlertTriangle size={11} /> Read-only view
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="chat-messages">
                    {msgsLoading ? (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                        <div className="loading-spinner" style={{ width: 32, height: 32 }} />
                      </div>
                    ) : messages.length === 0 ? (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <MessageSquare size={32} color="#AFAFAF" />
                        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 14, color: '#6B6B6B' }}>No messages in this thread</div>
                      </div>
                    ) : (
                      groupedMessages.map(group => (
                        <div key={group.date}>
                          <div className="date-sep">
                            <div className="date-sep-line" />
                            <span className="date-sep-text">{group.date}</span>
                            <div className="date-sep-line" />
                          </div>
                          {group.msgs.map(msg => {
                            // Determine sender profile
                            const sender = activeChat.profiles.find((p: any) => p.uid === msg.senderId) || activeChat.profiles[0]
                            const isFirst = activeChat.profiles[0]?.uid === msg.senderId
                            return (
                              <div key={msg.id} className={`msg-row${isFirst ? '' : ' right'}`}>
                                {isFirst && (
                                  <div className="msg-av-sm" style={{ background: sender?.avatarBg, color: sender?.avatarColor }}>
                                    {sender?.initials}
                                  </div>
                                )}
                                <div>
                                  {isFirst && (
                                    <div className="bubble-sender">{sender?.name} · {sender?.role}</div>
                                  )}
                                  <div className={`bubble ${isFirst ? 'left' : 'right'}`}>{msg.text}</div>
                                  <div className="bubble-meta">
                                    <span className={`bubble-time${isFirst ? '' : ' r'}`}>{formatMsgTime(msg.createdAt)}</span>
                                  </div>
                                </div>
                                {!isFirst && (
                                  <div className="msg-av-sm" style={{ background: sender?.avatarBg, color: sender?.avatarColor }}>
                                    {sender?.initials}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ))
                    )}
                    <div ref={bottomRef} />
                  </div>

                  {/* Admin read-only notice */}
                  <div className="admin-info-bar">
                    <AlertTriangle size={14} color="#D97706" style={{ flexShrink: 0 }} />
                    <div className="admin-info-text">
                      <strong>Admin view only.</strong> You are monitoring this conversation. Sending messages is not enabled in the admin panel.
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}