'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { db, auth } from '@/lib/firebase'
import {
  collection, query, where, onSnapshot,
  orderBy, doc, getDoc
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { Search, CheckCheck, Clock, MessageCircle, Plus, X } from 'lucide-react'

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface ChatContact {
  chatId: string
  otherId: string
  otherName: string
  otherInitials: string
  otherAvatarBg: string
  otherAvatarColor: string
  otherSkill: string
  otherOnline: boolean
  lastMessage: string
  lastMessageTime: string
  lastMessageTs: any
  unread: number
  isMe: boolean
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatTime(ts: any): string {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7)  return d.toLocaleDateString('en-US', { weekday: 'short' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const S = `
  * { box-sizing: border-box; }
  .cl-page { min-height: 100vh; background: #FAFAF8; display: flex; flex-direction: column; }

  /* TOPBAR */
  .cl-topbar {
    background: white; border-bottom: 1px solid #E8E6E1;
    padding: 0 24px; height: 64px;
    display: flex; align-items: center; justify-content: space-between; gap: 14px;
    position: sticky; top: 0; z-index: 40;
  }
  .cl-topbar-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: #0F0F0F; }
  .cl-topbar-right { display: flex; align-items: center; gap: 8px; }
  .cl-icon-btn {
    width: 38px; height: 38px; border-radius: 10px;
    background: #F5F4F1; border: 1px solid #E8E6E1;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #6B6B6B; transition: all 0.2s;
    text-decoration: none;
  }
  .cl-icon-btn:hover { border-color: #FF5C1A; color: #FF5C1A; background: #FFF3EE; }

  /* SEARCH */
  .cl-search-wrap { padding: 14px 16px; background: white; border-bottom: 1px solid #E8E6E1; }
  .cl-search {
    display: flex; align-items: center; gap: 10px;
    background: #F5F4F1; border: 1.5px solid #E8E6E1;
    border-radius: 14px; padding: 11px 16px; transition: border-color 0.2s;
  }
  .cl-search:focus-within { border-color: #FF5C1A; background: white; }
  .cl-search input {
    flex: 1; border: none; outline: none; background: transparent;
    font-family: 'DM Sans', sans-serif; font-size: 15px; color: #0F0F0F;
  }
  .cl-search input::placeholder { color: #AFAFAF; }
  .cl-search-clear { background: none; border: none; cursor: pointer; color: #AFAFAF; display: flex; padding: 0; }
  .cl-search-clear:hover { color: #6B6B6B; }

  /* CONTACT LIST */
  .cl-list { flex: 1; overflow-y: auto; }
  .cl-section-label {
    font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700;
    color: #AFAFAF; letter-spacing: 1.5px; text-transform: uppercase;
    padding: 14px 20px 6px;
  }

  /* CONTACT ROW */
  .cl-row {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 20px; border-bottom: 1px solid #F5F4F1;
    cursor: pointer; transition: background 0.15s; text-decoration: none; color: inherit;
    position: relative;
  }
  .cl-row:hover { background: #FAFAF8; }
  .cl-row.unread-row { background: #FFFBF9; }
  .cl-row.unread-row:hover { background: #FFF8F5; }

  /* AVATAR */
  .cl-avatar {
    width: 52px; height: 52px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px;
    position: relative;
  }
  .cl-online-dot {
    position: absolute; bottom: 2px; right: 2px;
    width: 12px; height: 12px; border-radius: 50%;
    background: #22C55E; border: 2.5px solid white;
  }

  /* INFO */
  .cl-info { flex: 1; min-width: 0; }
  .cl-name-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; gap: 8px; }
  .cl-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cl-name.unread-name { color: #0F0F0F; }
  .cl-time { font-size: 12px; color: #AFAFAF; flex-shrink: 0; font-family: 'DM Sans', sans-serif; }
  .cl-time.unread-time { color: #FF5C1A; font-weight: 600; }
  .cl-preview-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .cl-preview { font-size: 13px; color: #6B6B6B; font-weight: 300; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; display: flex; align-items: center; gap: 5px; }
  .cl-preview.unread-preview { color: #0F0F0F; font-weight: 500; }
  .cl-unread-badge {
    min-width: 20px; height: 20px; border-radius: 10px;
    background: #FF5C1A; color: white;
    font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700;
    display: flex; align-items: center; justify-content: center; padding: 0 5px;
    flex-shrink: 0;
  }
  .cl-skill-tag {
    display: inline-block; font-size: 10px; font-weight: 600;
    background: #FFF3EE; color: #FF5C1A;
    padding: 2px 7px; border-radius: 100px;
    flex-shrink: 0;
  }

  /* SKELETON */
  .skeleton { background: linear-gradient(90deg, #F5F4F1 25%, #E8E6E1 50%, #F5F4F1 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  .sk-row { display: flex; align-items: center; gap: 14px; padding: 14px 20px; border-bottom: 1px solid #F5F4F1; }
  .sk-avatar { width: 52px; height: 52px; border-radius: 50%; flex-shrink: 0; }
  .sk-lines { flex: 1; display: flex; flex-direction: column; gap: 8px; }

  /* EMPTY */
  .cl-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 60px 24px; text-align: center; }
  .cl-empty-icon { width: 72px; height: 72px; border-radius: 20px; background: #F5F4F1; display: flex; align-items: center; justify-content: center; }
  .cl-empty-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 20px; color: #0F0F0F; }
  .cl-empty-sub { font-size: 14px; color: #6B6B6B; font-weight: 300; line-height: 1.7; max-width: 280px; }
  .cl-empty-btn { display: inline-flex; align-items: center; gap: 8px; background: #FF5C1A; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; border: none; border-radius: 12px; padding: 12px 24px; text-decoration: none; transition: background 0.2s; cursor: pointer; }
  .cl-empty-btn:hover { background: #FF7A40; }

  /* FAB — new chat button */
  .cl-fab {
    position: fixed; bottom: 28px; right: 24px;
    width: 56px; height: 56px; border-radius: 50%;
    background: #FF5C1A; color: white; border: none;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s; z-index: 40;
    box-shadow: 0 6px 24px rgba(255,92,26,0.4);
    text-decoration: none;
  }
  .cl-fab:hover { background: #FF7A40; transform: scale(1.08); }

  /* LOADING */
  .cl-loading { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; }
  .cl-spinner { width: 36px; height: 36px; border-radius: 50%; border: 3px solid #E8E6E1; border-top-color: #FF5C1A; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 600px) {
    .cl-topbar { padding: 0 16px; }
    .cl-search-wrap { padding: 12px 16px; }
    .cl-row { padding: 12px 16px; }
    .cl-section-label { padding: 12px 16px 4px; }
  }
`

export default function ChatListPage() {
  const router = useRouter()

  const [user, setUser]         = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [chats, setChats]       = useState<ChatContact[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')

  // ── 1. Auth ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { router.push('/login'); return }
      setUser(u)
      setAuthLoading(false)
    })
    return () => unsub()
  }, [router])

  // ── 2. Real-time chat list ────────────────────────────────────────────────
  // Fetches all chats where the current user is a participant,
  // then enriches each with the other person's worker/user profile data
  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    )

    const unsub = onSnapshot(q, async (snap) => {
      const enriched: ChatContact[] = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data() as any
          const participants: string[] = data.participants || []

          // The "other" person is whoever is NOT the current user
          const otherId = participants.find(p => p !== user.uid) || ''

          // Try to fetch their profile — check workers first, then users
          let otherName        = 'Unknown'
          let otherInitials    = 'UK'
          let otherAvatarBg    = '#F5F4F1'
          let otherAvatarColor = '#6B6B6B'
          let otherSkill       = ''
          let otherOnline      = false

          if (otherId) {
            try {
              // Try workers collection first (most contacts will be workers)
              const workerSnap = await getDoc(doc(db, 'workers', otherId))
              if (workerSnap.exists()) {
                const w = workerSnap.data() as any
                otherName        = w.name        || 'Worker'
                otherInitials    = w.initials    || w.name?.charAt(0) || 'W'
                otherAvatarBg    = w.avatarBg    || '#FFF3EE'
                otherAvatarColor = w.avatarColor || '#FF5C1A'
                otherSkill       = w.skill       || ''
                otherOnline      = w.available   || false
              } else {
                // Fall back to users collection (client talking to another client)
                const userSnap = await getDoc(doc(db, 'users', otherId))
                if (userSnap.exists()) {
                  const u = userSnap.data() as any
                  otherName     = u.displayName || u.name || u.email?.split('@')[0] || 'User'
                  otherInitials = otherName.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
                  otherAvatarBg    = '#EEF6FF'
                  otherAvatarColor = '#2563EB'
                }
              }
            } catch {
              // Profile fetch failed — use fallback values above
            }
          }

          return {
            chatId:           d.id,
            otherId,
            otherName,
            otherInitials,
            otherAvatarBg,
            otherAvatarColor,
            otherSkill,
            otherOnline,
            lastMessage:     data.lastMessage     || 'Tap to open conversation',
            lastMessageTime: formatTime(data.updatedAt || data.lastMessageTime),
            lastMessageTs:   data.updatedAt,
            unread:          data.unreadCount?.[user.uid] || 0,
            isMe:            data.lastSenderId === user.uid,
          } as ChatContact
        })
      )

      setChats(enriched)
      setLoading(false)
    }, (err) => {
      console.error('Chat list error:', err)
      setLoading(false)
    })

    return () => unsub()
  }, [user])

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = search.trim()
    ? chats.filter(c =>
        c.otherName.toLowerCase().includes(search.toLowerCase()) ||
        c.otherSkill.toLowerCase().includes(search.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(search.toLowerCase())
      )
    : chats

  const pinned   = filtered.filter(c => c.unread > 0)
  const rest     = filtered.filter(c => c.unread === 0)

  // ── Loading ───────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <>
        <style>{S}</style>
        <div className="cl-loading">
          <div className="cl-spinner" />
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#6B6B6B' }}>Loading…</p>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{S}</style>
      <div className="cl-page">

        {/* TOPBAR */}
        <div className="cl-topbar">
          <p className="cl-topbar-title">Messages</p>
          <div className="cl-topbar-right">
            <Link href="/explore" className="cl-icon-btn" title="Find a worker to chat">
              <Plus size={18} />
            </Link>
          </div>
        </div>

        {/* SEARCH */}
        <div className="cl-search-wrap">
          <div className="cl-search">
            <Search size={17} color="#AFAFAF" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search conversations…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="cl-search-clear" onClick={() => setSearch('')}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* LIST */}
        <div className="cl-list">
          {loading ? (
            // Skeleton loaders while fetching
            [...Array(6)].map((_, i) => (
              <div key={i} className="sk-row">
                <div className="skeleton sk-avatar" />
                <div className="sk-lines">
                  <div className="skeleton" style={{ height: 14, width: `${50 + (i % 3) * 15}%` }} />
                  <div className="skeleton" style={{ height: 12, width: `${60 + (i % 2) * 20}%` }} />
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            // Empty state
            <div className="cl-empty">
              <div className="cl-empty-icon">
                <MessageCircle size={30} color="#AFAFAF" />
              </div>
              <p className="cl-empty-title">
                {search ? 'No results' : 'No conversations yet'}
              </p>
              <p className="cl-empty-sub">
                {search
                  ? `No conversations matching "${search}"`
                  : 'Book a worker to start chatting. Your conversations will appear here.'
                }
              </p>
              {!search && (
                <Link href="/explore" className="cl-empty-btn">
                  Find a Worker
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Unread section */}
              {pinned.length > 0 && (
                <>
                  <p className="cl-section-label">Unread</p>
                  {pinned.map(c => (
                    <ChatRow key={c.chatId} contact={c} userId={user?.uid} />
                  ))}
                </>
              )}

              {/* All / Recent */}
              {rest.length > 0 && (
                <>
                  {pinned.length > 0 && (
                    <p className="cl-section-label">Recent</p>
                  )}
                  {rest.map(c => (
                    <ChatRow key={c.chatId} contact={c} userId={user?.uid} />
                  ))}
                </>
              )}
            </>
          )}
        </div>

        {/* FAB — new chat */}
        <Link href="/explore" className="cl-fab" title="Start a new conversation">
          <Plus size={24} />
        </Link>

      </div>
    </>
  )
}

// ─── CHAT ROW COMPONENT ───────────────────────────────────────────────────────

function ChatRow({ contact: c, userId }: { contact: ChatContact; userId: string }) {
  const hasUnread = c.unread > 0
  return (
    <Link href={`/chat/${c.otherId}`} className={`cl-row${hasUnread ? ' unread-row' : ''}`}>

      {/* Avatar */}
      <div className="cl-avatar" style={{ background: c.otherAvatarBg, color: c.otherAvatarColor }}>
        {c.otherInitials}
        {c.otherOnline && <div className="cl-online-dot" />}
      </div>

      {/* Info */}
      <div className="cl-info">
        <div className="cl-name-row">
          <span className={`cl-name${hasUnread ? ' unread-name' : ''}`}>{c.otherName}</span>
          <span className={`cl-time${hasUnread ? ' unread-time' : ''}`}>{c.lastMessageTime}</span>
        </div>
        <div className="cl-preview-row">
          <span className={`cl-preview${hasUnread ? ' unread-preview' : ''}`}>
            {/* Show tick for sent messages */}
            {c.isMe && !hasUnread && (
              <CheckCheck size={13} color="#22C55E" style={{ flexShrink: 0 }} />
            )}
            {c.isMe && hasUnread && (
              <Clock size={12} color="#AFAFAF" style={{ flexShrink: 0 }} />
            )}
            {c.lastMessage}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {c.otherSkill && <span className="cl-skill-tag">{c.otherSkill}</span>}
            {hasUnread && (
              <span className="cl-unread-badge">{c.unread > 99 ? '99+' : c.unread}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}