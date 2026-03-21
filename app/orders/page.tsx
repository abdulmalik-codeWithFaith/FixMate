'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { db, auth } from '@/lib/firebase'
import {
  collection, query, where, onSnapshot,
  orderBy, doc, updateDoc, serverTimestamp
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import toast, { Toaster } from 'react-hot-toast'
import {
  Clock, CheckCircle, XCircle, Star, ChevronRight,
  MessageCircle, RotateCcw, Calendar, MapPin,
  ChevronLeft, Wrench, Search, Loader2
} from 'lucide-react'

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Tab = 'all' | 'pending' | 'accepted' | 'completed' | 'cancelled'

interface Order {
  id: string
  workerId: string
  workerName: string
  workerInitials: string
  workerAvatarBg: string
  workerAvatarColor: string
  skill: string
  date: string
  location: string
  status: 'pending' | 'accepted' | 'completed' | 'cancelled'
  price: string
  currency: string
  description: string
  rating?: number
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: 'Pending',   bg: '#FFF8EE', color: '#D97706', icon: <Clock size={11} />        },
  accepted:  { label: 'Accepted',  bg: '#FFF3EE', color: '#FF5C1A', icon: <CheckCircle size={11} />  },
  completed: { label: 'Completed', bg: '#F0FDF4', color: '#16A34A', icon: <CheckCircle size={11} />  },
  cancelled: { label: 'Cancelled', bg: '#FEF2F2', color: '#EF4444', icon: <XCircle size={11} />      },
}

function formatDate(ts: any): string {
  if (!ts) return 'TBD'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const now = new Date()
  const diff = (d.getTime() - now.getTime()) / 86400000
  if (diff > 0 && diff < 1) return `Today ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
  if (diff >= 1 && diff < 2) return `Tomorrow ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
  if (diff < 0 && diff > -1) return `Yesterday ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const S = `
  .orders-page { min-height: 100vh; background: #F5F4F1; }
  .orders-topbar { background: white; border-bottom: 1px solid #E8E6E1; padding: 0 40px; height: 64px; display: flex; align-items: center; gap: 16px; position: sticky; top: 0; z-index: 40; }
  .topbar-back { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; color: #6B6B6B; text-decoration: none; transition: all 0.2s; border: 1.5px solid #E8E6E1; flex-shrink: 0; }
  .topbar-back:hover { border-color: #0F0F0F; color: #0F0F0F; }
  .topbar-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; flex: 1; }
  .topbar-explore { display: flex; align-items: center; gap: 6px; background: #FF5C1A; color: white; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; border: none; border-radius: 9px; padding: 8px 16px; text-decoration: none; transition: background 0.2s; }
  .topbar-explore:hover { background: #FF7A40; }
  .orders-header { background: white; border-bottom: 1px solid #E8E6E1; padding: 24px 40px 0; }
  .orders-header-inner { max-width: 900px; margin: 0 auto; }
  .orders-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; letter-spacing: -1px; color: #0F0F0F; margin-bottom: 4px; }
  .orders-sub { font-size: 14px; color: #6B6B6B; font-weight: 300; margin-bottom: 24px; }
  .orders-tabs { display: flex; overflow-x: auto; scrollbar-width: none; }
  .orders-tabs::-webkit-scrollbar { display: none; }
  .orders-tab { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; color: #6B6B6B; background: none; border: none; padding: 14px 20px; cursor: pointer; transition: color 0.2s; border-bottom: 2.5px solid transparent; margin-bottom: -1px; white-space: nowrap; display: flex; align-items: center; gap: 6px; }
  .orders-tab:hover { color: #0F0F0F; }
  .orders-tab.active { color: #FF5C1A; border-bottom-color: #FF5C1A; }
  .tab-count { background: #F5F4F1; color: #6B6B6B; font-size: 11px; padding: 2px 7px; border-radius: 100px; }
  .orders-tab.active .tab-count { background: #FF5C1A; color: white; }
  .orders-body { max-width: 900px; margin: 0 auto; padding: 28px 40px; display: flex; flex-direction: column; gap: 14px; }
  .order-card { background: white; border: 1px solid #E8E6E1; border-radius: 18px; overflow: hidden; transition: all 0.2s; }
  .order-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07); }
  .order-main { padding: 20px 22px; display: flex; align-items: flex-start; gap: 14px; }
  .order-avatar { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 17px; flex-shrink: 0; }
  .order-info { flex: 1; min-width: 0; }
  .order-worker { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; margin-bottom: 6px; }
  .order-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; align-items: center; }
  .order-meta-item { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #6B6B6B; }
  .order-skill { font-size: 11px; font-weight: 600; background: #FFF3EE; color: #FF5C1A; padding: 2px 8px; border-radius: 100px; }
  .order-status { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 100px; font-family: 'Syne', sans-serif; }
  .order-desc { font-size: 13px; color: #6B6B6B; font-weight: 300; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .order-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }
  .order-price { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #0F0F0F; }
  .view-details { font-size: 12px; color: #FF5C1A; text-decoration: none; font-family: 'Syne', sans-serif; font-weight: 600; display: flex; align-items: center; gap: 3px; white-space: nowrap; }
  .view-details:hover { text-decoration: underline; }
  .order-footer { border-top: 1px solid #E8E6E1; padding: 12px 22px; display: flex; align-items: center; justify-content: space-between; background: #FAFAF8; flex-wrap: wrap; gap: 10px; }
  .order-footer-left { display: flex; gap: 8px; flex-wrap: wrap; }
  .action-btn { display: inline-flex; align-items: center; gap: 6px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; border-radius: 9px; padding: 8px 14px; cursor: pointer; text-decoration: none; transition: all 0.2s; border: none; }
  .action-primary { background: #FF5C1A; color: white; }
  .action-primary:hover { background: #FF7A40; }
  .action-secondary { background: white; color: #0F0F0F; border: 1.5px solid #E8E6E1; }
  .action-secondary:hover { border-color: #0F0F0F; }
  .action-ghost { background: transparent; color: #6B6B6B; border: 1.5px solid #E8E6E1; }
  .action-ghost:hover { background: #F5F4F1; color: #0F0F0F; }
  .action-danger { background: transparent; color: #EF4444; border: 1.5px solid rgba(239,68,68,0.25); }
  .action-danger:hover { background: #FEF2F2; border-color: #EF4444; }
  .review-prompt { display: flex; align-items: center; gap: 8px; }
  .review-label { font-size: 12px; color: #6B6B6B; white-space: nowrap; }
  .review-stars { display: flex; gap: 3px; cursor: pointer; }
  .review-done { font-size: 12px; color: #16A34A; font-family: 'Syne', sans-serif; font-weight: 600; display: flex; align-items: center; gap: 4px; }
  .skeleton { background: linear-gradient(90deg, #F5F4F1 25%, #E8E6E1 50%, #F5F4F1 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  .empty-state { text-align: center; padding: 72px 20px; background: white; border: 1px solid #E8E6E1; border-radius: 18px; }
  .empty-icon-wrap { width: 68px; height: 68px; border-radius: 20px; background: #F5F4F1; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; }
  .empty-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 20px; color: #0F0F0F; margin-bottom: 8px; }
  .empty-sub { font-size: 14px; color: #6B6B6B; margin-bottom: 24px; font-weight: 300; }
  .empty-btn { display: inline-flex; align-items: center; gap: 8px; background: #FF5C1A; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; border: none; border-radius: 12px; padding: 12px 24px; text-decoration: none; transition: background 0.2s; }
  .empty-btn:hover { background: #FF7A40; }
  .loading-screen { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; }
  .loading-spinner { width: 40px; height: 40px; border-radius: 50%; border: 3px solid #E8E6E1; border-top-color: #FF5C1A; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* CANCEL MODAL */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); }
  .modal { background: white; border-radius: 22px; padding: 36px 32px; max-width: 400px; width: 100%; text-align: center; box-shadow: 0 24px 80px rgba(0,0,0,0.2); animation: popIn 0.3s cubic-bezier(0.175,0.885,0.32,1.275); }
  @keyframes popIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .modal-icon { width: 64px; height: 64px; border-radius: 50%; background: #FEF2F2; border: 2px solid rgba(239,68,68,0.2); display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; }
  .modal-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: #0F0F0F; margin-bottom: 8px; }
  .modal-sub { font-size: 14px; color: #6B6B6B; font-weight: 300; line-height: 1.7; margin-bottom: 24px; }
  .modal-btns { display: flex; gap: 10px; }
  .modal-keep { flex: 1; background: transparent; color: #6B6B6B; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; border: 1.5px solid #E8E6E1; border-radius: 11px; padding: 12px; cursor: pointer; transition: all 0.2s; }
  .modal-keep:hover { background: #F5F4F1; }
  .modal-confirm { flex: 1; background: #EF4444; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; border: none; border-radius: 11px; padding: 12px; cursor: pointer; transition: background 0.2s; }
  .modal-confirm:hover { background: #DC2626; }

  @media (max-width: 768px) {
    .orders-topbar { padding: 0 16px; }
    .orders-header { padding: 18px 16px 0; }
    .orders-body { padding: 18px 16px; }
    .order-main { flex-wrap: wrap; }
    .order-right { flex-direction: row; align-items: center; width: 100%; justify-content: space-between; }
  }
`

export default function OrdersPage() {
  const router = useRouter()

  const [user, setUser]           = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [orders, setOrders]       = useState<Order[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [hoverStar, setHoverStar] = useState<Record<string, number>>({})
  const [ratings, setRatings]     = useState<Record<string, number>>({})
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null)
  const [cancelling, setCancelling]     = useState(false)

  // ── 1. Auth ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { router.push('/login'); return }
      setUser(u)
      setAuthLoading(false)
    })
    return () => unsub()
  }, [router])

  // ── 2. Real-time bookings from Firestore ───────────────────────────────────
  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'bookings'),
      where('clientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    const unsub = onSnapshot(q, (snap) => {
      const data: Order[] = snap.docs.map(d => {
        const b = d.data() as any
        return {
          id:               d.id,
          workerId:         b.workerId         || '',
          workerName:       b.workerName        || 'Worker',
          workerInitials:   b.workerInitials    || (b.workerName?.split(' ').map((n: string) => n[0]).join('') ?? 'W'),
          workerAvatarBg:   b.workerAvatarBg    || '#FFF3EE',
          workerAvatarColor: b.workerAvatarColor || '#FF5C1A',
          skill:            b.skill             || b.workerSkill || 'Service',
          date:             formatDate(b.scheduledAt || b.createdAt),
          location:         b.location          || b.address || '—',
          status:           b.status            || 'pending',
          price:            `${b.currency || '$'}${b.price || 0}`,
          currency:         b.currency          || '$',
          description:      b.description       || '',
          rating:           b.rating,
        }
      })
      setOrders(data)
      setDataLoading(false)
    }, (err) => {
      console.error('Orders listener error:', err)
      setDataLoading(false)
      toast.error('Could not load orders.')
    })

    return () => unsub()
  }, [user])

  // ── 3. Cancel booking ──────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!cancelTarget) return
    setCancelling(true)
    try {
      await updateDoc(doc(db, 'bookings', cancelTarget.id), {
        status:    'cancelled',
        updatedAt: serverTimestamp(),
      })
      toast.success('Booking cancelled.')
      setCancelTarget(null)
    } catch (err) {
      console.error('Cancel error:', err)
      toast.error('Could not cancel. Please try again.')
    } finally {
      setCancelling(false)
    }
  }

  // ── 4. Submit rating ───────────────────────────────────────────────────────
  const handleRating = async (orderId: string, rating: number) => {
    setRatings(p => ({ ...p, [orderId]: rating }))
    try {
      await updateDoc(doc(db, 'bookings', orderId), {
        rating,
        updatedAt: serverTimestamp(),
      })
      toast.success('Rating saved — thank you!')
    } catch (err) {
      console.error('Rating error:', err)
      toast.error('Could not save rating.')
    }
  }

  // ── Filtered & counted ─────────────────────────────────────────────────────
  const tabs: { key: Tab; label: string }[] = [
    { key: 'all',       label: 'All'       },
    { key: 'pending',   label: 'Pending'   },
    { key: 'accepted',  label: 'Accepted'  },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ]
  const filtered = activeTab === 'all' ? orders : orders.filter(o => o.status === activeTab)
  const countFor = (tab: Tab) => tab === 'all' ? orders.length : orders.filter(o => o.status === tab).length

  // ── Loading ────────────────────────────────────────────────────────────────
  if (authLoading || dataLoading) {
    return (
      <>
        <style>{S}</style>
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#6B6B6B' }}>Loading orders…</p>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{S}</style>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      {/* Cancel modal */}
      {cancelTarget && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-icon"><XCircle size={28} color="#EF4444" /></div>
            <h2 className="modal-title">Cancel this booking?</h2>
            <p className="modal-sub">
              Are you sure you want to cancel your booking with <strong>{cancelTarget.workerName}</strong>?
              This action cannot be undone.
            </p>
            <div className="modal-btns">
              <button className="modal-keep" onClick={() => setCancelTarget(null)}>Keep Booking</button>
              <button className="modal-confirm" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="orders-page">
        <div className="orders-topbar">
          <Link href="/dashboard" className="topbar-back"><ChevronLeft size={18} /></Link>
          <p className="topbar-title">My Orders</p>
          <Link href="/explore" className="topbar-explore"><Search size={13} /> Find Worker</Link>
        </div>

        <div className="orders-header">
          <div className="orders-header-inner">
            <h1 className="orders-title">My Orders</h1>
            <p className="orders-sub">Track all your bookings · {orders.length} total</p>
            <div className="orders-tabs">
              {tabs.map(t => (
                <button
                  key={t.key}
                  className={`orders-tab${activeTab === t.key ? ' active' : ''}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                  <span className="tab-count">{countFor(t.key)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="orders-body">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-wrap"><Wrench size={26} color="#AFAFAF" /></div>
              <p className="empty-title">No {activeTab === 'all' ? '' : activeTab} orders</p>
              <p className="empty-sub">
                {activeTab === 'all'
                  ? "You haven't made any bookings yet."
                  : `No ${activeTab} bookings at the moment.`}
              </p>
              <Link href="/explore" className="empty-btn">Find a Worker <ChevronRight size={15} /></Link>
            </div>
          ) : (
            filtered.map(order => {
              const st = statusConfig[order.status] || statusConfig.pending
              const rated = ratings[order.id] || order.rating
              return (
                <div key={order.id} className="order-card">
                  <div className="order-main">
                    <div className="order-avatar" style={{ background: order.workerAvatarBg, color: order.workerAvatarColor }}>
                      {order.workerInitials}
                    </div>
                    <div className="order-info">
                      <p className="order-worker">{order.workerName}</p>
                      <div className="order-meta">
                        <span className="order-skill">{order.skill}</span>
                        <span className="order-meta-item"><Calendar size={11} />{order.date}</span>
                        {order.location !== '—' && (
                          <span className="order-meta-item"><MapPin size={11} />{order.location}</span>
                        )}
                        <span className="order-status" style={{ background: st.bg, color: st.color }}>
                          {st.icon} {st.label}
                        </span>
                      </div>
                      {order.description && <p className="order-desc">{order.description}</p>}
                    </div>
                    <div className="order-right">
                      <p className="order-price">{order.price}</p>
                      <Link href={`/orders/${order.id}`} className="view-details">
                        Details <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>

                  <div className="order-footer">
                    <div className="order-footer-left">
                      {order.status === 'pending' && (
                        <>
                          <Link href={`/chat/${order.workerId}`} className="action-btn action-secondary">
                            <MessageCircle size={14} /> Message
                          </Link>
                          <button
                            className="action-btn action-danger"
                            onClick={() => setCancelTarget(order)}
                          >
                            <XCircle size={14} /> Cancel
                          </button>
                        </>
                      )}
                      {order.status === 'accepted' && (
                        <>
                          <Link href={`/chat/${order.workerId}`} className="action-btn action-primary">
                            <MessageCircle size={14} /> Chat with Worker
                          </Link>
                          <Link href={`/explore/${order.workerId}`} className="action-btn action-secondary">
                            View Profile
                          </Link>
                          <button
                            className="action-btn action-danger"
                            onClick={() => setCancelTarget(order)}
                          >
                            <XCircle size={14} /> Cancel
                          </button>
                        </>
                      )}
                      {order.status === 'completed' && (
                        <>
                          <Link href={`/booking/${order.workerId}`} className="action-btn action-primary">
                            <RotateCcw size={14} /> Book Again
                          </Link>
                          <Link href={`/chat/${order.workerId}`} className="action-btn action-secondary">
                            <MessageCircle size={14} /> Message
                          </Link>
                        </>
                      )}
                      {order.status === 'cancelled' && (
                        <Link href="/explore" className="action-btn action-ghost">
                          Find Similar Worker
                        </Link>
                      )}
                    </div>

                    {/* Star rating for completed, unrated orders */}
                    {order.status === 'completed' && !rated && (
                      <div className="review-prompt">
                        <span className="review-label">Rate this job:</span>
                        <div className="review-stars">
                          {[1, 2, 3, 4, 5].map(n => (
                            <Star
                              key={n}
                              size={18}
                              color="#F59E0B"
                              fill={(hoverStar[order.id] ?? 0) >= n ? '#F59E0B' : 'none'}
                              onMouseEnter={() => setHoverStar(p => ({ ...p, [order.id]: n }))}
                              onMouseLeave={() => setHoverStar(p => ({ ...p, [order.id]: 0 }))}
                              onClick={() => handleRating(order.id, n)}
                              style={{ cursor: 'pointer' }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {order.status === 'completed' && rated && (
                      <div className="review-done">
                        <CheckCircle size={13} color="#16A34A" />
                        Rated {rated} {Array(rated).fill('★').join('')}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}