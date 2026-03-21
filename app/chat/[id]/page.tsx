'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { db, auth } from '@/lib/firebase'
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, serverTimestamp, doc, getDoc, setDoc,
  getDocs, limit
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import toast, { Toaster } from 'react-hot-toast'
import {
  Send, ChevronLeft, Phone, MoreVertical, CheckCheck,
  Clock, Star, Calendar, Paperclip, ImageIcon, Smile,
  MapPin, Info, Loader2, Briefcase, User
} from 'lucide-react'

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string
  senderId: string
  text: string
  time: string
  status: 'sent' | 'delivered' | 'read'
  createdAt: any
}

// The "other" person in the chat — could be worker or client
interface OtherProfile {
  id: string
  name: string
  initials: string
  skill: string        // worker's trade | empty for clients
  location: string
  rating: number       // worker rating | 0 for clients
  jobs: number         // worker jobs count | 0 for clients
  exp: string
  avatarBg: string
  avatarColor: string
  online: boolean
  role: 'worker' | 'client'
}

interface ActiveBooking {
  id: string
  description: string
  location: string
  scheduledDate: string
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatMsgTime(ts: any): string {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function getChatId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join('_')
}

const quickReplies = ['Sounds good!', 'What time works?', 'Can you send a quote?', 'See you then!']

// ─── STYLES ───────────────────────────────────────────────────────────────────

const S = `
  * { box-sizing: border-box; }
  .chat-layout { height: 100vh; display: flex; flex-direction: column; background: #F5F4F1; }
  .chat-header { background: white; border-bottom: 1px solid #E8E6E1; padding: 0 20px; height: 64px; display: flex; align-items: center; gap: 12px; flex-shrink: 0; position: sticky; top: 0; z-index: 40; }
  .chat-back { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; color: #6B6B6B; text-decoration: none; transition: all 0.2s; border: 1.5px solid #E8E6E1; flex-shrink: 0; }
  .chat-back:hover { border-color: #0F0F0F; color: #0F0F0F; }
  .chat-avatar { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; flex-shrink: 0; position: relative; }
  .chat-online-dot { position: absolute; bottom: 1px; right: 1px; width: 11px; height: 11px; border-radius: 50%; background: #22C55E; border: 2px solid white; }
  .chat-header-info { flex: 1; min-width: 0; }
  .chat-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; }
  .chat-status { font-size: 12px; color: #22C55E; font-weight: 500; }
  .chat-status.offline { color: #AFAFAF; }
  .chat-header-actions { display: flex; align-items: center; gap: 6px; }
  .chat-action-btn { width: 36px; height: 36px; border-radius: 10px; background: #F5F4F1; border: 1px solid #E8E6E1; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #6B6B6B; transition: all 0.2s; }
  .chat-action-btn:hover { border-color: #FF5C1A; color: #FF5C1A; }

  .booking-banner { background: #FFF3EE; border-bottom: 1px solid rgba(255,92,26,0.15); padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-shrink: 0; flex-wrap: wrap; }
  .booking-banner-left { display: flex; align-items: center; gap: 10px; }
  .booking-banner-icon { width: 32px; height: 32px; background: #FF5C1A; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .booking-banner-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #FF5C1A; }
  .booking-banner-sub { font-size: 12px; color: rgba(255,92,26,0.7); }
  .booking-banner-btn { background: #FF5C1A; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 12px; border: none; border-radius: 8px; padding: 7px 14px; cursor: pointer; text-decoration: none; transition: background 0.2s; white-space: nowrap; }
  .booking-banner-btn:hover { background: #FF7A40; }

  .chat-body { display: flex; flex: 1; overflow: hidden; }
  .chat-messages { flex: 1; overflow-y: auto; padding: 24px 20px; display: flex; flex-direction: column; gap: 10px; }
  .chat-messages::-webkit-scrollbar { width: 4px; }
  .chat-messages::-webkit-scrollbar-thumb { background: #E8E6E1; border-radius: 2px; }

  .date-sep { display: flex; align-items: center; gap: 12px; margin: 8px 0; }
  .date-sep-line { flex: 1; height: 1px; background: #E8E6E1; }
  .date-sep-text { font-size: 11px; color: #AFAFAF; font-weight: 500; white-space: nowrap; }

  .msg-row { display: flex; gap: 8px; align-items: flex-end; }
  .msg-row.me { flex-direction: row-reverse; }
  .msg-mini-avatar { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 10px; flex-shrink: 0; }
  .bubble { max-width: 68%; padding: 11px 16px; border-radius: 18px; font-size: 14px; line-height: 1.65; word-break: break-word; }
  .bubble.them { background: white; color: #0F0F0F; border: 1px solid #E8E6E1; border-bottom-left-radius: 4px; }
  .bubble.me   { background: #0F0F0F; color: white; border-bottom-right-radius: 4px; }
  .bubble-meta { display: flex; align-items: center; gap: 4px; margin-top: 4px; justify-content: flex-end; }
  .bubble-time { font-size: 10px; color: rgba(255,255,255,0.5); }
  .bubble-time.them-time { color: #AFAFAF; }

  .quick-replies { display: flex; flex-wrap: wrap; gap: 8px; padding: 8px 20px 12px; justify-content: flex-end; background: #F5F4F1; }
  .quick-reply { background: white; border: 1.5px solid #E8E6E1; border-radius: 100px; padding: 7px 16px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #0F0F0F; cursor: pointer; transition: all 0.2s; }
  .quick-reply:hover { border-color: #FF5C1A; color: #FF5C1A; }

  .chat-input-area { background: white; border-top: 1px solid #E8E6E1; padding: 14px 20px; flex-shrink: 0; }
  .chat-input-inner { display: flex; align-items: flex-end; gap: 10px; }
  .chat-input-actions { display: flex; gap: 6px; }
  .chat-input-action { width: 36px; height: 36px; border-radius: 9px; background: #F5F4F1; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #6B6B6B; transition: all 0.2s; flex-shrink: 0; }
  .chat-input-action:hover { background: #FFF3EE; color: #FF5C1A; }
  .chat-input-field { flex: 1; display: flex; align-items: center; background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 20px; padding: 10px 16px; transition: border-color 0.2s; }
  .chat-input-field:focus-within { border-color: #FF5C1A; background: white; }
  .chat-input-field input { flex: 1; border: none; outline: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F; }
  .chat-input-field input::placeholder { color: #AFAFAF; }
  .chat-send-btn { width: 42px; height: 42px; border-radius: 50%; background: #FF5C1A; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
  .chat-send-btn:hover { background: #FF7A40; transform: scale(1.05); }
  .chat-send-btn:disabled { background: #E8E6E1; cursor: not-allowed; transform: none; }

  /* SIDEBAR */
  .chat-sidebar { width: 280px; background: white; border-left: 1px solid #E8E6E1; padding: 24px; overflow-y: auto; flex-shrink: 0; }
  .cs-avatar { width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 22px; margin: 0 auto 14px; }
  .cs-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 17px; color: #0F0F0F; text-align: center; margin-bottom: 4px; }
  .cs-role-pill { display: flex; justify-content: center; margin-bottom: 16px; }
  .cs-role-pill span { font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 100px; }
  .cs-stats { display: flex; justify-content: space-around; margin-bottom: 20px; }
  .cs-stat { text-align: center; }
  .cs-stat-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #0F0F0F; }
  .cs-stat-label { font-size: 11px; color: #6B6B6B; }
  .cs-divider { height: 1px; background: #E8E6E1; margin: 14px 0; }
  .cs-action { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: #FF5C1A; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; border: none; border-radius: 11px; padding: 12px; text-decoration: none; cursor: pointer; transition: background 0.2s; margin-bottom: 8px; }
  .cs-action:hover { background: #FF7A40; }
  .cs-action-sec { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: transparent; color: #0F0F0F; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; border: 1.5px solid #E8E6E1; border-radius: 11px; padding: 11px; text-decoration: none; cursor: pointer; transition: all 0.2s; }
  .cs-action-sec:hover { background: #F5F4F1; }
  .cs-info { font-size: 13px; color: #6B6B6B; line-height: 1.65; }
  .cs-info strong { font-family: 'Syne', sans-serif; font-size: 13px; color: #0F0F0F; display: block; margin-bottom: 4px; }

  /* ROLE BADGE in header */
  .role-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 100px; font-family: 'Syne', sans-serif; margin-left: 6px; vertical-align: middle; }

  .loading-screen { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; }
  .loading-spinner { width: 40px; height: 40px; border-radius: 50%; border: 3px solid #E8E6E1; border-top-color: #FF5C1A; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .chat-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: #AFAFAF; }
  .chat-empty p { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 600; }
  .chat-empty span { font-size: 13px; }

  @media (max-width: 1000px) { .chat-sidebar { display: none; } }
  @media (max-width: 600px) {
    .bubble { max-width: 84%; }
    .chat-input-actions { display: none; }
  }
`

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const params    = useParams()
  const router    = useRouter()
  const otherId   = params?.id as string   // could be workerId or clientId

  const [user, setUser]                     = useState<any>(null)
  const [isWorker, setIsWorker]             = useState(false)   // is the current user a worker?
  const [other, setOther]                   = useState<OtherProfile | null>(null)
  const [messages, setMessages]             = useState<ChatMessage[]>([])
  const [activeBooking, setActiveBooking]   = useState<ActiveBooking | null>(null)
  const [input, setInput]                   = useState('')
  const [sending, setSending]               = useState(false)
  const [loading, setLoading]               = useState(true)
  const [chatId, setChatId]                 = useState('')
  const bottomRef                           = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── 1. Auth + detect if current user is a worker ──────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push('/login'); return }
      setUser(u)
      // Check if this user exists in workers collection
      try {
        const wSnap = await getDoc(doc(db, 'workers', u.uid))
        setIsWorker(wSnap.exists())
      } catch {
        setIsWorker(false)
      }
    })
    return () => unsub()
  }, [router])

  // ── 2. Fetch the OTHER person's profile ───────────────────────────────────
  // We try workers first — if not found, fall back to users (they're a client)
  useEffect(() => {
    if (!otherId) return
    const fetchOther = async () => {
      try {
        // Try workers collection first
        const wSnap = await getDoc(doc(db, 'workers', otherId))
        if (wSnap.exists()) {
          const d = wSnap.data() as any
          setOther({
            id:          otherId,
            name:        d.name         || 'Worker',
            initials:    d.initials     || d.name?.charAt(0) || 'W',
            skill:       d.skill        || 'Service',
            location:    d.location     || '',
            rating:      d.rating       || 5.0,
            jobs:        d.jobs         || 0,
            exp:         d.exp          || '—',
            avatarBg:    d.avatarBg     || '#FFF3EE',
            avatarColor: d.avatarColor  || '#FF5C1A',
            online:      d.available    ?? false,
            role:        'worker',
          })
          return
        }

        // Fall back to users (client profile)
        const uSnap = await getDoc(doc(db, 'users', otherId))
        if (uSnap.exists()) {
          const d = uSnap.data() as any
          const name = d.displayName || d.name || d.email?.split('@')[0] || 'Client'
          const inits = name.split(' ').slice(0,2).map((n: string) => n[0]).join('').toUpperCase()
          setOther({
            id:          otherId,
            name,
            initials:    inits,
            skill:       '',
            location:    d.location    || '',
            rating:      0,
            jobs:        0,
            exp:         '—',
            avatarBg:    d.avatarBg    || '#EEF6FF',
            avatarColor: d.avatarColor || '#2563EB',
            online:      false,
            role:        'client',
          })
        }
      } catch (err) {
        console.error('Other profile fetch error:', err)
      }
    }
    fetchOther()
  }, [otherId])

  // ── 3. Set up / ensure chat document ─────────────────────────────────────
  useEffect(() => {
    if (!user || !otherId) return
    const id = getChatId(user.uid, otherId)
    setChatId(id)
    const ensureChat = async () => {
      const chatRef = doc(db, 'chats', id)
      const snap    = await getDoc(chatRef)
      if (!snap.exists()) {
        await setDoc(chatRef, {
          participants: [user.uid, otherId],
          createdAt:    serverTimestamp(),
          updatedAt:    serverTimestamp(),
        })
      }
    }
    ensureChat()
  }, [user, otherId])

  // ── 4. Real-time messages ─────────────────────────────────────────────────
  useEffect(() => {
    if (!chatId) return
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => {
        const m = d.data() as any
        return {
          id:        d.id,
          senderId:  m.senderId  || '',
          text:      m.text      || '',
          time:      formatMsgTime(m.createdAt),
          status:    m.status    || 'sent',
          createdAt: m.createdAt,
        }
      }))
      setLoading(false)
    }, () => setLoading(false))
    return () => unsub()
  }, [chatId])

  // ── 5. Fetch active booking (works for both roles) ─────────────────────────
  // Queries where the current user is either client OR worker, and the other
  // person is on the other side of the booking
  useEffect(() => {
    if (!user || !otherId) return
    const fetchBooking = async () => {
      try {
        // Try as client (current user booked the other person)
        let snap = await getDocs(query(
          collection(db, 'bookings'),
          where('clientId', '==', user.uid),
          where('workerId', '==', otherId),
          where('status', 'in', ['pending', 'accepted']),
          orderBy('createdAt', 'desc'),
          limit(1)
        ))

        // If nothing found, try as worker (current user is the worker)
        if (snap.empty) {
          snap = await getDocs(query(
            collection(db, 'bookings'),
            where('workerId', '==', user.uid),
            where('clientId', '==', otherId),
            where('status', 'in', ['pending', 'accepted']),
            orderBy('createdAt', 'desc'),
            limit(1)
          ))
        }

        if (!snap.empty) {
          const b = snap.docs[0].data() as any
          const ts = b.scheduledAt?.toDate
            ? b.scheduledAt.toDate().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
              + ' · ' + b.scheduledAt.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            : b.dateString || 'Scheduled'
          setActiveBooking({
            id:           snap.docs[0].id,
            description:  b.description || b.skill || 'Service',
            location:     b.location    || '',
            scheduledDate: ts,
          })
        }
      } catch {}
    }
    fetchBooking()
  }, [user, otherId])

  // ── 6. Send message ───────────────────────────────────────────────────────
  const sendMessage = async (text?: string) => {
    const val = (text ?? input).trim()
    if (!val || !user || !chatId) return
    setInput('')
    setSending(true)
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        senderId:  user.uid,
        text:      val,
        status:    'sent',
        createdAt: serverTimestamp(),
      })
      await setDoc(doc(db, 'chats', chatId), {
        participants:    [user.uid, otherId],
        lastMessage:     val,
        lastSenderId:    user.uid,
        updatedAt:       serverTimestamp(),
      }, { merge: true })
    } catch {
      toast.error('Could not send message.')
    } finally {
      setSending(false)
    }
  }

  // ── Role-aware navigation ──────────────────────────────────────────────────
  // Back button: workers go to worker dashboard, clients go to chat list
  const backHref = isWorker ? '/worker/dashboard' : '/chat'

  // Booking detail link: workers see their job details, clients see order details
  const bookingHref = activeBooking
    ? isWorker
      ? `/worker/jobs/${activeBooking.id}`
      : `/orders/${activeBooking.id}`
    : '#'

  // Profile link: workers see client (no special page), clients see worker's explore page
  const profileHref = other?.role === 'worker'
    ? `/explore/${otherId}`
    : '#'  // no client public profile

  // Sidebar primary action
  const primaryActionHref  = isWorker ? `/worker/jobs` : `/booking/${otherId}`
  const primaryActionLabel = isWorker ? 'View All Jobs' : 'Book Again'

  if (loading || !other) {
    return (
      <><style>{S}</style>
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#6B6B6B' }}>Loading chat…</p>
      </div></>
    )
  }

  return (
    <>
      <style>{S}</style>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <div className="chat-layout">

        {/* ── HEADER ── */}
        <div className="chat-header">
          <Link href={backHref} className="chat-back"><ChevronLeft size={18} /></Link>

          <div className="chat-avatar" style={{ background: other.avatarBg, color: other.avatarColor }}>
            {other.initials}
            {other.online && <div className="chat-online-dot" />}
          </div>

          <div className="chat-header-info">
            <p className="chat-name">
              {other.name}
              {/* Role badge — subtle context for who you're talking to */}
              <span
                className="role-badge"
                style={other.role === 'worker'
                  ? { background: '#FFF3EE', color: '#FF5C1A' }
                  : { background: '#EEF6FF', color: '#2563EB' }}
              >
                {other.role === 'worker'
                  ? <><Briefcase size={9} /> {other.skill || 'Worker'}</>
                  : <><User size={9} /> Client</>
                }
              </span>
            </p>
            <p className={`chat-status${other.online ? '' : ' offline'}`}>
              {other.online ? 'Available now' : 'Last seen recently'}
            </p>
          </div>

          <div className="chat-header-actions">
            <div className="chat-action-btn"><Phone size={16} /></div>
            {other.role === 'worker' && (
              <Link href={profileHref} className="chat-action-btn"><Info size={16} /></Link>
            )}
            <div className="chat-action-btn"><MoreVertical size={16} /></div>
          </div>
        </div>

        {/* ── BOOKING BANNER ── */}
        {activeBooking && (
          <div className="booking-banner">
            <div className="booking-banner-left">
              <div className="booking-banner-icon"><Calendar size={16} color="white" /></div>
              <div>
                <p className="booking-banner-title">{activeBooking.scheduledDate}</p>
                <p className="booking-banner-sub">
                  {activeBooking.description}
                  {activeBooking.location ? ` · ${activeBooking.location}` : ''}
                </p>
              </div>
            </div>
            <Link href={bookingHref} className="booking-banner-btn">View Details</Link>
          </div>
        )}

        <div className="chat-body">
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* ── MESSAGES ── */}
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="chat-empty">
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: other.avatarBg, color: other.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20 }}>
                    {other.initials}
                  </div>
                  <p>Chat with {other.name.split(' ')[0]}</p>
                  <span>
                    {isWorker
                      ? 'Discuss job details and coordinate with your client.'
                      : 'Discuss job details and ask any questions.'}
                  </span>
                </div>
              ) : (
                <>
                  <div className="date-sep">
                    <div className="date-sep-line" />
                    <span className="date-sep-text">Today</span>
                    <div className="date-sep-line" />
                  </div>
                  {messages.map(msg => {
                    const isMe = msg.senderId === user?.uid
                    return (
                      <div key={msg.id} className={`msg-row ${isMe ? 'me' : 'them'}`}>
                        {!isMe && (
                          <div className="msg-mini-avatar" style={{ background: other.avatarBg, color: other.avatarColor }}>
                            {other.initials}
                          </div>
                        )}
                        <div>
                          <div className={`bubble ${isMe ? 'me' : 'them'}`}>{msg.text}</div>
                          <div className="bubble-meta">
                            <span className={`bubble-time${!isMe ? ' them-time' : ''}`}>{msg.time}</span>
                            {isMe && (
                              msg.status === 'read'
                                ? <CheckCheck size={13} color="#22C55E" />
                                : <Clock size={11} color="rgba(255,255,255,0.4)" />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
              <div ref={bottomRef} />
            </div>

            {/* ── QUICK REPLIES ── */}
            <div className="quick-replies">
              {(isWorker
                ? ['On my way!', 'Job done!', 'Can we reschedule?', 'Sounds good!']
                : quickReplies
              ).map(q => (
                <button key={q} className="quick-reply" onClick={() => sendMessage(q)}>{q}</button>
              ))}
            </div>

            {/* ── INPUT ── */}
            <div className="chat-input-area">
              <div className="chat-input-inner">
                <div className="chat-input-actions">
                  <button className="chat-input-action"><Paperclip size={17} /></button>
                  <button className="chat-input-action"><ImageIcon size={17} /></button>
                </div>
                <div className="chat-input-field">
                  <input
                    type="text"
                    placeholder="Type a message…"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
                    }}
                  />
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#AFAFAF', display: 'flex' }}>
                    <Smile size={18} />
                  </button>
                </div>
                <button
                  className="chat-send-btn"
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || sending}
                >
                  {sending
                    ? <Loader2 size={17} color="white" style={{ animation: 'spin 1s linear infinite' }} />
                    : <Send size={17} color="white" />
                  }
                </button>
              </div>
            </div>
          </div>

          {/* ── SIDEBAR ── */}
          <div className="chat-sidebar">
            <div className="cs-avatar" style={{ background: other.avatarBg, color: other.avatarColor }}>
              {other.initials}
            </div>
            <p className="cs-name">{other.name}</p>
            <div className="cs-role-pill">
              <span style={other.role === 'worker'
                ? { background: '#FFF3EE', color: '#FF5C1A' }
                : { background: '#EEF6FF', color: '#2563EB' }}
              >
                {other.role === 'worker' ? other.skill : 'Client'}
              </span>
            </div>

            {/* Stats — only meaningful for workers */}
            {other.role === 'worker' && (
              <div className="cs-stats">
                <div className="cs-stat">
                  <div className="cs-stat-val">{other.rating}</div>
                  <div className="cs-stat-label">Rating</div>
                </div>
                <div className="cs-stat">
                  <div className="cs-stat-val">{other.jobs}</div>
                  <div className="cs-stat-label">Jobs</div>
                </div>
                <div className="cs-stat">
                  <div className="cs-stat-val">{other.exp}</div>
                  <div className="cs-stat-label">Exp</div>
                </div>
              </div>
            )}

            <div className="cs-divider" />

            {/* Primary action */}
            <Link href={primaryActionHref} className="cs-action">
              {isWorker
                ? <><Briefcase size={15} /> {primaryActionLabel}</>
                : <><Calendar size={15} /> {primaryActionLabel}</>
              }
            </Link>

            {/* Secondary action — view profile (only if worker) */}
            {other.role === 'worker' && (
              <Link href={profileHref} className="cs-action-sec">
                <Star size={15} /> View Profile
              </Link>
            )}

            <div className="cs-divider" />

            {/* Active booking info */}
            {activeBooking ? (
              <div className="cs-info">
                <strong>Active Job</strong>
                {activeBooking.scheduledDate}<br />
                {activeBooking.description}
                {activeBooking.location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <MapPin size={12} color="#AFAFAF" /> {activeBooking.location}
                  </span>
                )}
                <Link href={bookingHref} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 10, fontSize: 12, fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#FF5C1A', textDecoration: 'none' }}>
                  View details
                </Link>
              </div>
            ) : (
              <div className="cs-info">
                <strong>No active booking</strong>
                {isWorker
                  ? `No open jobs with ${other.name.split(' ')[0]}.`
                  : `Book ${other.name.split(' ')[0]} to get started.`
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}