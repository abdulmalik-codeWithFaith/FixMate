'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { db, auth } from '@/lib/firebase'
import {
  collection, query, where, onSnapshot,
  doc, updateDoc, deleteDoc, writeBatch,
  serverTimestamp, orderBy
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import {
  ChevronLeft, Bell, BellOff, Clock, CheckCheck,
  MessageCircle, Banknote, AlertCircle, Star,
  Trash2, Settings, Loader2
} from 'lucide-react'

// ─── TYPES ────────────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'unread' | 'jobs' | 'payments' | 'messages'
type NotifType = 'job' | 'message' | 'payment' | 'review' | 'system'

interface Notification {
  id: string
  type: NotifType
  title: string
  body: string
  time: string
  rawTs: any
  read: boolean
  actionUrl?: string
  userId: string
  avatar?: { initials: string; bg: string; color: string }
}

// ─── CONFIG ────────────────────────────────────────────────────────────────────

const typeConfig: Record<NotifType, { icon: React.ReactNode; bg: string; color: string }> = {
  job:     { icon: <AlertCircle size={16} />,   bg: '#FFF3EE', color: '#FF5C1A' },
  message: { icon: <MessageCircle size={16} />, bg: '#EEF6FF', color: '#2563EB' },
  payment: { icon: <Banknote size={16} />,       bg: '#F0FDF4', color: '#16A34A' },
  review:  { icon: <Star size={16} />,            bg: '#FFF8EE', color: '#D97706' },
  system:  { icon: <Bell size={16} />,            bg: '#F5F0FF', color: '#7C3AED' },
}

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: 'all',      label: 'All'      },
  { key: 'unread',   label: 'Unread'   },
  { key: 'jobs',     label: 'Jobs'     },
  { key: 'payments', label: 'Payments' },
  { key: 'messages', label: 'Messages' },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatRelativeTime(ts: any): string {
  if (!ts) return ''
  const d   = ts.toDate ? ts.toDate() : new Date(ts)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60)     return `${diff}s ago`
  if (diff < 3600)   return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400)  return `${Math.floor(diff / 3600)} hr ago`
  if (diff < 172800) return '1 day ago'
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function groupByDate(items: Notification[]): Record<string, Notification[]> {
  const groups: Record<string, Notification[]> = {}
  const order: string[] = ['Today', 'Yesterday', 'This Week', 'Earlier']
  items.forEach(n => {
    const t    = n.time
    const isToday     = t.includes('s ago') || t.includes('min') || t.includes('hr')
    const isYesterday = t === '1 day ago'
    const isThisWeek  = t.includes('days ago')
    const key = isToday ? 'Today' : isYesterday ? 'Yesterday' : isThisWeek ? 'This Week' : 'Earlier'
    if (!groups[key]) groups[key] = []
    groups[key].push(n)
  })
  // Return in chronological section order
  const result: Record<string, Notification[]> = {}
  order.forEach(k => { if (groups[k]) result[k] = groups[k] })
  return result
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const S = `
  .wn-page { min-height: 100vh; background: #F5F4F1; }
  .wn-topbar { background: white; border-bottom: 1px solid #E8E6E1; padding: 0 40px; height: 64px; display: flex; align-items: center; gap: 14px; position: sticky; top: 0; z-index: 40; }
  .tb-back { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; color: #6B6B6B; text-decoration: none; transition: all 0.2s; border: 1.5px solid #E8E6E1; flex-shrink: 0; }
  .tb-back:hover { border-color: #0F0F0F; color: #0F0F0F; }
  .tb-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; flex: 1; }
  .tb-action { display: flex; align-items: center; gap: 6px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #6B6B6B; background: none; border: 1.5px solid #E8E6E1; border-radius: 9px; padding: 7px 14px; cursor: pointer; transition: all 0.2s; }
  .tb-action:hover { border-color: #FF5C1A; color: #FF5C1A; }
  .tb-action:disabled { opacity: 0.5; cursor: not-allowed; }
  .tb-icon { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; border: 1.5px solid #E8E6E1; color: #6B6B6B; text-decoration: none; transition: all 0.2s; }
  .tb-icon:hover { border-color: #FF5C1A; color: #FF5C1A; }
  .wn-body { max-width: 680px; margin: 0 auto; padding: 28px 40px; }
  .wn-tabs { display: flex; gap: 8px; margin-bottom: 24px; overflow-x: auto; scrollbar-width: none; }
  .wn-tabs::-webkit-scrollbar { display: none; }
  .wn-tab { display: flex; align-items: center; gap: 6px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #6B6B6B; background: white; border: 1.5px solid #E8E6E1; border-radius: 100px; padding: 7px 16px; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
  .wn-tab:hover { border-color: #FF5C1A; color: #FF5C1A; }
  .wn-tab.active { background: #FF5C1A; border-color: #FF5C1A; color: white; }
  .tab-cnt { font-size: 11px; padding: 1px 6px; border-radius: 100px; }
  .wn-tab.active .tab-cnt { background: rgba(255,255,255,0.25); color: white; }
  .wn-tab:not(.active) .tab-cnt { background: #F5F4F1; color: #6B6B6B; }
  .notif-group { margin-bottom: 28px; }
  .notif-group-label { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; color: #AFAFAF; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; padding: 0 4px; }
  .notif-list { display: flex; flex-direction: column; gap: 2px; }
  .notif-item { display: flex; align-items: flex-start; gap: 14px; background: white; border: 1px solid #E8E6E1; border-radius: 14px; padding: 16px 18px; cursor: pointer; transition: all 0.2s; position: relative; color: inherit; }
  .notif-item:first-child { border-radius: 14px 14px 6px 6px; }
  .notif-item:last-child  { border-radius: 6px 6px 14px 14px; }
  .notif-item:only-child  { border-radius: 14px; }
  .notif-item.unread { background: #FFFBF9; border-color: rgba(255,92,26,0.15); }
  .notif-item:hover { border-color: #FF5C1A; box-shadow: 0 2px 12px rgba(0,0,0,0.06); z-index: 1; }
  .unread-dot { position: absolute; top: 18px; right: 16px; width: 8px; height: 8px; border-radius: 50%; background: #FF5C1A; }
  .notif-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .notif-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; flex-shrink: 0; }
  .notif-content { flex: 1; min-width: 0; padding-right: 16px; }
  .notif-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; margin-bottom: 3px; }
  .notif-body-text { font-size: 13px; color: #6B6B6B; line-height: 1.55; font-weight: 300; }
  .notif-time { font-size: 11px; color: #AFAFAF; margin-top: 6px; display: flex; align-items: center; gap: 4px; }
  .notif-actions { display: flex; gap: 8px; margin-top: 10px; }
  .na-btn { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; border-radius: 8px; padding: 6px 14px; cursor: pointer; text-decoration: none; transition: all 0.2s; border: none; display: inline-flex; align-items: center; }
  .na-primary { background: #FF5C1A; color: white; }
  .na-primary:hover { background: #FF7A40; }
  .na-secondary { background: transparent; color: #6B6B6B; border: 1.5px solid #E8E6E1; }
  .na-secondary:hover { border-color: #0F0F0F; color: #0F0F0F; }
  .del-btn { background: none; border: none; cursor: pointer; color: #AFAFAF; display: flex; padding: 4px; transition: color 0.2s; flex-shrink: 0; }
  .del-btn:hover { color: #EF4444; }
  .notif-empty { text-align: center; padding: 80px 20px; }
  .notif-empty-icon { width: 72px; height: 72px; border-radius: 20px; background: #F5F4F1; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
  .notif-empty-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 20px; color: #0F0F0F; margin-bottom: 8px; }
  .notif-empty-sub { font-size: 15px; color: #6B6B6B; }
  .skeleton { background: linear-gradient(90deg, #F5F4F1 25%, #E8E6E1 50%, #F5F4F1 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  .loading-screen { height: 100vh; display: flex; align-items: center; justify-content: center; background: #F5F4F1; }
  .loading-spinner { width: 40px; height: 40px; border-radius: 50%; border: 3px solid #E8E6E1; border-top-color: #FF5C1A; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (max-width: 768px) {
    .wn-topbar { padding: 0 16px; }
    .wn-body { padding: 20px 16px; }
  }
`

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function WorkerNotificationsPage() {
  const router = useRouter()

  const [authUser, setAuthUser]     = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [items, setItems]           = useState<Notification[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [activeTab, setActiveTab]   = useState<FilterTab>('all')
  const [markingAll, setMarkingAll] = useState(false)

  // ── Auth ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { router.push('/login'); return }
      setAuthUser(u); setAuthLoading(false)
    })
    return () => unsub()
  }, [router])

  // ── Real-time notifications listener ─────────────────────────────────────────
  useEffect(() => {
    if (!authUser) return

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', authUser.uid),
      orderBy('time', 'desc')
    )

    const unsub = onSnapshot(q, (snap) => {
      const mapped: Notification[] = snap.docs.map(d => {
        const n = d.data() as any
        return {
          id:         d.id,
          type:       (n.type as NotifType) || 'system',
          title:      n.title || 'Notification',
          body:       n.body  || '',
          time:       formatRelativeTime(n.time || n.createdAt),
          rawTs:      n.time  || n.createdAt,
          read:       n.read  ?? false,
          actionUrl:  n.actionUrl,
          userId:     n.userId,
          avatar:     n.avatar,
        }
      })
      setItems(mapped)
      setDataLoading(false)
    }, (err) => {
      console.error('Notifications listener:', err)
      setDataLoading(false)
    })

    return () => unsub()
  }, [authUser])

  // ── Mark one read ─────────────────────────────────────────────────────────────
  const markRead = async (id: string) => {
    const item = items.find(n => n.id === id)
    if (!item || item.read) return
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true })
    } catch (err) {
      console.error('Mark read error:', err)
    }
  }

  // ── Mark all read ─────────────────────────────────────────────────────────────
  const markAllRead = async () => {
    const unread = items.filter(n => !n.read)
    if (!unread.length) return
    setMarkingAll(true)
    try {
      const batch = writeBatch(db)
      unread.forEach(n => batch.update(doc(db, 'notifications', n.id), { read: true }))
      await batch.commit()
    } catch (err) {
      console.error('Mark all read error:', err)
    } finally {
      setMarkingAll(false)
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────────
  const deleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id))
    } catch (err) {
      console.error('Delete notification error:', err)
    }
  }

  if (authLoading) {
    return (
      <><style>{S}</style>
      <div className="loading-screen"><div className="loading-spinner" /></div></>
    )
  }

  // ── Filtering & grouping ──────────────────────────────────────────────────────
  const filtered = items.filter(n => {
    if (activeTab === 'unread')   return !n.read
    if (activeTab === 'jobs')     return n.type === 'job'
    if (activeTab === 'payments') return n.type === 'payment'
    if (activeTab === 'messages') return n.type === 'message'
    return true
  })

  const groups      = groupByDate(filtered)
  const unreadCount = items.filter(n => !n.read).length

  const countFor = (tab: FilterTab) => {
    if (tab === 'all')      return items.length
    if (tab === 'unread')   return unreadCount
    if (tab === 'jobs')     return items.filter(n => n.type === 'job').length
    if (tab === 'payments') return items.filter(n => n.type === 'payment').length
    return items.filter(n => n.type === 'message').length
  }

  const actionLabel = (type: NotifType) =>
    type === 'job' ? 'View Request' : type === 'message' ? 'Reply' : type === 'payment' ? 'View Earnings' : 'View'

  return (
    <>
      <style>{S}</style>
      <div className="wn-page">

        <div className="wn-topbar">
          <Link href="/worker/dashboard" className="tb-back"><ChevronLeft size={18} /></Link>
          <p className="tb-title">
            Notifications
            {unreadCount > 0 && (
              <span style={{ marginLeft: 8, background: '#FF5C1A', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 100, fontFamily: 'DM Sans, sans-serif' }}>
                {unreadCount}
              </span>
            )}
          </p>
          {unreadCount > 0 && (
            <button className="tb-action" onClick={markAllRead} disabled={markingAll}>
              {markingAll
                ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                : <CheckCheck size={14} />
              }
              Mark all read
            </button>
          )}
          <Link href="/worker/settings" className="tb-icon"><Settings size={16} /></Link>
        </div>

        <div className="wn-body">
          {/* TABS */}
          <div className="wn-tabs">
            {filterTabs.map(t => {
              const cnt = countFor(t.key)
              return (
                <button
                  key={t.key}
                  className={`wn-tab${activeTab === t.key ? ' active' : ''}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                  {cnt > 0 && <span className="tab-cnt">{cnt}</span>}
                </button>
              )
            })}
          </div>

          {/* CONTENT */}
          {dataLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ background: 'white', border: '1px solid #E8E6E1', borderRadius: 14, padding: '16px 18px', display: 'flex', gap: 14 }}>
                  <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="skeleton" style={{ height: 13, width: '50%' }} />
                    <div className="skeleton" style={{ height: 11, width: '80%' }} />
                    <div className="skeleton" style={{ height: 10, width: '25%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="notif-empty">
              <div className="notif-empty-icon"><BellOff size={28} color="#AFAFAF" /></div>
              <p className="notif-empty-title">
                {activeTab === 'all' ? 'No notifications yet' : `No ${activeTab} notifications`}
              </p>
              <p className="notif-empty-sub">You&apos;re all caught up!</p>
            </div>
          ) : (
            Object.entries(groups).map(([group, notifs]) => (
              <div key={group} className="notif-group">
                <p className="notif-group-label">{group}</p>
                <div className="notif-list">
                  {notifs.map(n => {
                    const cfg = typeConfig[n.type] || typeConfig.system
                    return (
                      <div
                        key={n.id}
                        className={`notif-item${!n.read ? ' unread' : ''}`}
                        onClick={() => markRead(n.id)}
                      >
                        {!n.read && <div className="unread-dot" />}

                        {n.avatar
                          ? <div className="notif-avatar" style={{ background: n.avatar.bg, color: n.avatar.color }}>{n.avatar.initials}</div>
                          : <div className="notif-icon" style={{ background: cfg.bg, color: cfg.color }}>{cfg.icon}</div>
                        }

                        <div className="notif-content">
                          <p className="notif-title">{n.title}</p>
                          <p className="notif-body-text">{n.body}</p>
                          <p className="notif-time"><Clock size={10} />{n.time}</p>
                          {!n.read && n.actionUrl && (
                            <div className="notif-actions">
                              <Link
                                href={n.actionUrl}
                                className="na-btn na-primary"
                                onClick={e => e.stopPropagation()}
                              >
                                {actionLabel(n.type)}
                              </Link>
                              <button
                                className="na-btn na-secondary"
                                onClick={e => { e.stopPropagation(); markRead(n.id) }}
                              >
                                Dismiss
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          className="del-btn"
                          onClick={e => { e.stopPropagation(); deleteItem(n.id) }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}