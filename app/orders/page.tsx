'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/lib/firebase'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import {
  Clock, CheckCircle, XCircle, Star, ChevronRight,
  MessageCircle, RotateCcw, Calendar, MapPin,
  ChevronLeft, Wrench, Search, Loader2
} from 'lucide-react'

type Tab = 'all' | 'pending' | 'accepted' | 'completed' | 'cancelled'

const statusConfig: Record<string, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: 'Pending',   bg: '#FFF8EE', color: '#D97706', icon: <Clock size={11} />        },
  accepted:  { label: 'Accepted',  bg: '#FFF3EE', color: '#FF5C1A', icon: <CheckCircle size={11} /> },
  completed: { label: 'Completed', bg: '#F0FDF4', color: '#16A34A', icon: <CheckCircle size={11} /> },
  cancelled: { label: 'Cancelled', bg: '#FEF2F2', color: '#EF4444', icon: <XCircle size={11} />     },
}

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
  .tab-count { background: #F5F4F1; color: #6B6B6B; font-size: 11px; padding: 2px 7px; border-radius: 100px; transition: all 0.2s; }
  .orders-tab.active .tab-count { background: #FF5C1A; color: white; }
  .orders-body { max-width: 900px; margin: 0 auto; padding: 32px 40px; display: flex; flex-direction: column; gap: 16px; }
  .order-card { background: white; border: 1px solid #E8E6E1; border-radius: 18px; overflow: hidden; transition: all 0.2s; }
  .order-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07); }
  .order-main { padding: 22px 24px; display: flex; align-items: flex-start; gap: 16px; }
  .order-avatar { width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; flex-shrink: 0; }
  .order-info { flex: 1; min-width: 0; }
  .order-worker { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; margin-bottom: 6px; }
  .order-meta { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 10px; }
  .order-meta-item { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #6B6B6B; }
  .order-skill { font-size: 11px; font-weight: 600; background: #FFF3EE; color: #FF5C1A; padding: 2px 8px; border-radius: 100px; }
  .order-status { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 100px; font-family: 'Syne', sans-serif; }
  .order-desc { font-size: 13px; color: #6B6B6B; font-weight: 300; line-height: 1.6; }
  .order-right { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; flex-shrink: 0; }
  .order-price { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #0F0F0F; }
  .order-footer { border-top: 1px solid #E8E6E1; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; background: #FAFAF8; flex-wrap: wrap; gap: 10px; }
  .order-footer-left { display: flex; gap: 8px; flex-wrap: wrap; }
  .action-btn { display: inline-flex; align-items: center; gap: 6px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; border-radius: 9px; padding: 8px 16px; cursor: pointer; text-decoration: none; transition: all 0.2s; border: none; }
  .action-primary { background: #FF5C1A; color: white; }
  .action-primary:hover { background: #FF7A40; }
  .action-secondary { background: white; color: #0F0F0F; border: 1.5px solid #E8E6E1; }
  .action-secondary:hover { border-color: #0F0F0F; }
  .action-ghost { background: transparent; color: #6B6B6B; border: 1.5px solid #E8E6E1; }
  .action-ghost:hover { background: #F5F4F1; color: #0F0F0F; }
  .review-prompt { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #6B6B6B; }
  .review-stars { display: flex; gap: 3px; cursor: pointer; }
  .empty-state { text-align: center; padding: 80px 20px; }
  .empty-icon-wrap { width: 72px; height: 72px; border-radius: 20px; background: #F5F4F1; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
  .empty-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 20px; color: #0F0F0F; margin-bottom: 8px; }
  .empty-sub { font-size: 15px; color: #6B6B6B; margin-bottom: 24px; }
  .empty-btn { display: inline-flex; align-items: center; gap: 8px; background: #FF5C1A; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 15px; border: none; border-radius: 12px; padding: 13px 28px; text-decoration: none; transition: background 0.2s; }
  .empty-btn:hover { background: #FF7A40; }
  @media (max-width: 768px) { .orders-topbar { padding: 0 16px; } .orders-header { padding: 20px 16px 0; } .orders-body { padding: 20px 16px; } .order-main { flex-wrap: wrap; } .order-right { flex-direction: row; align-items: center; width: 100%; justify-content: space-between; } }
`

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [hoverStar, setHoverStar] = useState<Record<string, number>>({})
  const [ratings, setRatings] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'jobs'), 
      where('clientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Fallbacks for data mapping
        worker: doc.data().workerName || 'Worker',
        initials: (doc.data().workerName || 'W').split(' ').map((n:any) => n[0]).join(''),
        skill: doc.data().workerSkill || 'Service',
        date: doc.data().appointmentDate || 'TBD',
        location: doc.data().address || 'Remote',
        status: doc.data().status || 'pending',
        price: `${doc.data().currency || '$'}${doc.data().totalPrice || 0}`,
        desc: doc.data().description || '',
        avatarBg: doc.data().workerAvatarBg || '#FFF3EE',
        avatarColor: doc.data().workerAvatarColor || '#FF5C1A',
        workerId: doc.data().workerId
      }));
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all',       label: 'All'       },
    { key: 'pending',   label: 'Pending'   },
    { key: 'accepted',  label: 'Accepted'  },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ]

  const filtered = activeTab === 'all' ? orders : orders.filter(o => o.status === activeTab)
  const countFor = (tab: Tab) => tab === 'all' ? orders.length : orders.filter(o => o.status === tab).length

  if (authLoading || loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F4F1' }}>
        <Loader2 className="animate-spin" color="#FF5C1A" size={40} />
      </div>
    )
  }

  return (
    <>
      <style>{S}</style>
      <div className="orders-page">

        <div className="orders-topbar">
          <Link href="/dashboard" className="topbar-back"><ChevronLeft size={18} /></Link>
          <p className="topbar-title">My Orders</p>
          <Link href="/explore" className="topbar-explore"><Search size={13} /> Find Worker</Link>
        </div>

        <div className="orders-header">
          <div className="orders-header-inner">
            <h1 className="orders-title">My Orders</h1>
            <p className="orders-sub">Track all your bookings and job history</p>
            <div className="orders-tabs">
              {tabs.map(t => (
                <button key={t.key} className={`orders-tab${activeTab === t.key ? ' active' : ''}`} onClick={() => setActiveTab(t.key)}>
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
              <div className="empty-icon-wrap"><Wrench size={28} color="#AFAFAF" /></div>
              <p className="empty-title">No {activeTab} orders</p>
              <p className="empty-sub">You don&apos;t have any {activeTab} bookings yet.</p>
              <Link href="/explore" className="empty-btn">Find a Worker <ChevronRight size={16} /></Link>
            </div>
          ) : (
            filtered.map(order => {
              const st = statusConfig[order.status] || statusConfig.pending
              return (
                <div key={order.id} className="order-card">
                  <div className="order-main">
                    <div className="order-avatar" style={{ background: order.avatarBg, color: order.avatarColor }}>{order.initials}</div>
                    <div className="order-info">
                      <p className="order-worker">{order.worker}</p>
                      <div className="order-meta">
                        <span className="order-skill">{order.skill}</span>
                        <span className="order-meta-item"><Calendar size={11} />{order.date}</span>
                        <span className="order-meta-item"><MapPin size={11} />{order.location}</span>
                        <span className="order-status" style={{ background: st.bg, color: st.color }}>{st.icon}{st.label}</span>
                      </div>
                      <p className="order-desc">{order.desc}</p>
                    </div>
                    <div className="order-right">
                      <p className="order-price">{order.price}</p>
                    </div>
                  </div>

                  <div className="order-footer">
                    <div className="order-footer-left">
                      {order.status === 'pending' && (
                        <>
                          <Link href={`/chat/${order.workerId}`} className="action-btn action-secondary"><MessageCircle size={14} />Message</Link>
                          <button className="action-btn action-ghost">Cancel</button>
                        </>
                      )}
                      {order.status === 'accepted' && (
                        <>
                          <Link href={`/chat/${order.workerId}`} className="action-btn action-primary"><MessageCircle size={14} />Chat with Worker</Link>
                          <Link href={`/explore/${order.workerId}`} className="action-btn action-secondary">View Profile</Link>
                        </>
                      )}
                      {order.status === 'completed' && (
                        <>
                          <Link href={`/booking/${order.workerId}`} className="action-btn action-primary"><RotateCcw size={14} />Book Again</Link>
                          <Link href={`/chat/${order.workerId}`} className="action-btn action-secondary"><MessageCircle size={14} />Message</Link>
                        </>
                      )}
                      {order.status === 'cancelled' && (
                        <Link href="/explore" className="action-btn action-ghost">Find Similar Worker</Link>
                      )}
                    </div>

                    {order.status === 'completed' && !ratings[order.id] && (
                      <div className="review-prompt">
                        <span style={{ fontSize: 12, color: '#6B6B6B' }}>Rate this job:</span>
                        <div className="review-stars">
                          {[1,2,3,4,5].map(n => (
                            <Star
                              key={n}
                              size={18}
                              color="#F59E0B"
                              fill={(hoverStar[order.id] ?? 0) >= n ? '#F59E0B' : 'none'}
                              onMouseEnter={() => setHoverStar(p => ({ ...p, [order.id]: n }))}
                              onMouseLeave={() => setHoverStar(p => ({ ...p, [order.id]: 0 }))}
                              onClick={() => setRatings(p => ({ ...p, [order.id]: n }))}
                              style={{ cursor: 'pointer' }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {order.status === 'completed' && ratings[order.id] && (
                      <span style={{ fontSize: 12, color: '#16A34A', fontFamily: 'Syne, sans-serif', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle size={13} color="#16A34A" /> Thanks for rating!
                      </span>
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