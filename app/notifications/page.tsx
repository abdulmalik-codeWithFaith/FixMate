'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft, Bell, BellOff, Check, CheckCheck,
  Calendar, MessageCircle, Star, Wrench, AlertCircle,
  Clock, Filter, Trash2, Settings, ChevronRight
} from 'lucide-react'

type NotifType = 'booking' | 'message' | 'review' | 'system' | 'reminder'
type FilterTab = 'all' | 'unread' | 'booking' | 'message'

interface Notification {
  id: string
  type: NotifType
  title: string
  body: string
  time: string
  read: boolean
  actionUrl?: string
  avatar?: { initials: string; bg: string; color: string }
}

const INITIAL: Notification[] = [
  { id: 'n1',  type: 'booking',  title: 'Booking Accepted',          body: 'James Mitchell accepted your booking for tomorrow at 2:00 PM.',             time: '2 min ago',   read: false, actionUrl: '/orders/o1',             avatar: { initials: 'JM', bg: '#FFF3EE', color: '#FF5C1A' } },
  { id: 'n2',  type: 'message',  title: 'New message from James',    body: 'Perfect, I carry those in stock. See you tomorrow at 2pm!',                 time: '14 min ago',  read: false, actionUrl: '/chat/james-mitchell',   avatar: { initials: 'JM', bg: '#FFF3EE', color: '#FF5C1A' } },
  { id: 'n3',  type: 'reminder', title: 'Upcoming job tomorrow',     body: 'Consumer unit replacement with James Mitchell · 12 Baker St · 2:00 PM.',    time: '1 hr ago',    read: false, actionUrl: '/orders/o1' },
  { id: 'n4',  type: 'booking',  title: 'Booking Request Sent',      body: 'Your booking request has been sent to Carlos Rivera. Awaiting response.',   time: '3 hrs ago',   read: false, actionUrl: '/orders/o2',             avatar: { initials: 'CR', bg: '#EEF6FF', color: '#2563EB' } },
  { id: 'n5',  type: 'review',   title: 'Leave a review',            body: 'How was your experience with Aisha Patel? Share your feedback.',            time: '1 day ago',   read: true,  actionUrl: '/orders/o3',             avatar: { initials: 'AP', bg: '#F0FDF4', color: '#16A34A' } },
  { id: 'n6',  type: 'message',  title: 'New message from Carlos',   body: 'Hi! I\'ll be there at 10 AM sharp. Let me know if the address is correct.', time: '1 day ago',   read: true,  actionUrl: '/chat/carlos-rivera',    avatar: { initials: 'CR', bg: '#EEF6FF', color: '#2563EB' } },
  { id: 'n7',  type: 'system',   title: 'Account verified',          body: 'Your FixMate account has been verified. You can now book workers.',         time: '3 days ago',  read: true },
  { id: 'n8',  type: 'booking',  title: 'Job Completed',             body: 'Kenji Tanaka marked your carpentry job as completed. Check the results!',   time: '1 week ago',  read: true,  actionUrl: '/orders/o4',             avatar: { initials: 'KT', bg: '#FFF8EE', color: '#D97706' } },
  { id: 'n9',  type: 'review',   title: 'New review on your profile','body': 'You reviewed Aisha Patel 5 stars. Thank you for the feedback!',           time: '1 week ago',  read: true,  actionUrl: '/orders/o3' },
  { id: 'n10', type: 'system',   title: 'New workers in your area',  body: '12 new verified workers have joined FixMate near your location.',            time: '2 weeks ago', read: true,  actionUrl: '/explore' },
]

const typeConfig: Record<NotifType, { icon: React.ReactNode; bg: string; color: string }> = {
  booking:  { icon: <Calendar size={16} />,      bg: '#FFF3EE', color: '#FF5C1A' },
  message:  { icon: <MessageCircle size={16} />, bg: '#EEF6FF', color: '#2563EB' },
  review:   { icon: <Star size={16} />,           bg: '#FFF8EE', color: '#D97706' },
  system:   { icon: <Wrench size={16} />,         bg: '#F0FDF4', color: '#16A34A' },
  reminder: { icon: <Clock size={16} />,          bg: '#F5F0FF', color: '#7C3AED' },
}

const S = `
  .notif-page { min-height: 100vh; background: #F5F4F1; }

  .notif-topbar {
    background: white; border-bottom: 1px solid #E8E6E1;
    padding: 0 40px; height: 64px;
    display: flex; align-items: center; gap: 14px;
    position: sticky; top: 0; z-index: 40;
  }
  .topbar-back {
    display: flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; border-radius: 10px;
    color: #6B6B6B; text-decoration: none; transition: all 0.2s;
    border: 1.5px solid #E8E6E1; flex-shrink: 0;
  }
  .topbar-back:hover { border-color: #0F0F0F; color: #0F0F0F; }
  .topbar-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; flex: 1; }
  .topbar-action {
    display: flex; align-items: center; gap: 6px;
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
    color: #6B6B6B; background: none; border: 1.5px solid #E8E6E1;
    border-radius: 9px; padding: 7px 14px; cursor: pointer; transition: all 0.2s;
  }
  .topbar-action:hover { border-color: #FF5C1A; color: #FF5C1A; }

  .notif-body { max-width: 680px; margin: 0 auto; padding: 28px 40px; }

  /* TABS */
  .notif-tabs { display: flex; gap: 8px; margin-bottom: 24px; overflow-x: auto; scrollbar-width: none; }
  .notif-tabs::-webkit-scrollbar { display: none; }
  .notif-tab {
    display: flex; align-items: center; gap: 6px;
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
    color: #6B6B6B; background: white; border: 1.5px solid #E8E6E1;
    border-radius: 100px; padding: 7px 16px; cursor: pointer; transition: all 0.2s;
    white-space: nowrap;
  }
  .notif-tab:hover { border-color: #FF5C1A; color: #FF5C1A; }
  .notif-tab.active { background: #FF5C1A; border-color: #FF5C1A; color: white; }
  .notif-tab-count {
    background: rgba(255,255,255,0.25); color: white;
    font-size: 11px; padding: 1px 6px; border-radius: 100px;
  }
  .notif-tab:not(.active) .notif-tab-count { background: #F5F4F1; color: #6B6B6B; }

  /* GROUP */
  .notif-group { margin-bottom: 28px; }
  .notif-group-label {
    font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700;
    color: #AFAFAF; letter-spacing: 1px; text-transform: uppercase;
    margin-bottom: 10px; padding: 0 4px;
  }
  .notif-list { display: flex; flex-direction: column; gap: 2px; }

  /* ITEM */
  .notif-item {
    display: flex; align-items: flex-start; gap: 14px;
    background: white; border: 1px solid #E8E6E1;
    border-radius: 14px; padding: 16px 18px;
    cursor: pointer; transition: all 0.2s; position: relative;
    text-decoration: none; color: inherit;
  }
  .notif-item:first-child { border-radius: 14px 14px 6px 6px; }
  .notif-item:last-child  { border-radius: 6px 6px 14px 14px; }
  .notif-item:only-child  { border-radius: 14px; }
  .notif-item.unread { background: #FFFBF9; border-color: rgba(255,92,26,0.15); }
  .notif-item:hover { border-color: #FF5C1A; box-shadow: 0 2px 12px rgba(0,0,0,0.06); z-index: 1; }

  .notif-unread-dot {
    position: absolute; top: 18px; right: 16px;
    width: 8px; height: 8px; border-radius: 50%; background: #FF5C1A;
  }

  .notif-icon-wrap {
    width: 40px; height: 40px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .notif-avatar {
    width: 40px; height: 40px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; flex-shrink: 0;
  }
  .notif-content { flex: 1; min-width: 0; padding-right: 16px; }
  .notif-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; margin-bottom: 3px; }
  .notif-body-text { font-size: 13px; color: #6B6B6B; line-height: 1.55; font-weight: 300; }
  .notif-time { font-size: 11px; color: #AFAFAF; margin-top: 6px; display: flex; align-items: center; gap: 4px; }

  .notif-action-row { display: flex; gap: 8px; margin-top: 10px; }
  .notif-btn-primary {
    background: #FF5C1A; color: white;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 12px;
    border: none; border-radius: 8px; padding: 6px 14px;
    cursor: pointer; text-decoration: none; transition: background 0.2s;
  }
  .notif-btn-primary:hover { background: #FF7A40; }
  .notif-btn-secondary {
    background: transparent; color: #6B6B6B;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 12px;
    border: 1.5px solid #E8E6E1; border-radius: 8px; padding: 5px 14px;
    cursor: pointer; text-decoration: none; transition: all 0.2s;
  }
  .notif-btn-secondary:hover { border-color: #0F0F0F; color: #0F0F0F; }

  /* EMPTY */
  .notif-empty { text-align: center; padding: 80px 20px; }
  .notif-empty-icon {
    width: 72px; height: 72px; border-radius: 20px; background: #F5F4F1;
    display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;
  }
  .notif-empty-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 20px; color: #0F0F0F; margin-bottom: 8px; }
  .notif-empty-sub { font-size: 15px; color: #6B6B6B; }

  @media (max-width: 768px) {
    .notif-topbar { padding: 0 16px; }
    .notif-body { padding: 20px 16px; }
  }
`

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: 'all',     label: 'All'      },
  { key: 'unread',  label: 'Unread'   },
  { key: 'booking', label: 'Bookings' },
  { key: 'message', label: 'Messages' },
]

function groupByDate(items: Notification[]) {
  const groups: Record<string, Notification[]> = {}
  items.forEach(n => {
    const key = n.time.includes('min') || n.time.includes('hr')
      ? 'Today'
      : n.time.includes('day')
      ? n.time.includes('1 day') ? 'Yesterday' : 'This Week'
      : 'Earlier'
    if (!groups[key]) groups[key] = []
    groups[key].push(n)
  })
  return groups
}

export default function NotificationsPage() {
  const [items, setItems]       = useState<Notification[]>(INITIAL)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  const unreadCount = items.filter(n => !n.read).length

  const markAllRead = () => setItems(p => p.map(n => ({ ...n, read: true })))
  const markRead    = (id: string) => setItems(p => p.map(n => n.id === id ? { ...n, read: true } : n))
  const deleteNotif = (id: string) => setItems(p => p.filter(n => n.id !== id))

  const filtered = items.filter(n => {
    if (activeTab === 'unread')  return !n.read
    if (activeTab === 'booking') return n.type === 'booking' || n.type === 'reminder'
    if (activeTab === 'message') return n.type === 'message'
    return true
  })

  const groups = groupByDate(filtered)

  return (
    <>
      <style>{S}</style>
      <div className="notif-page">

        <div className="notif-topbar">
          <Link href="/dashboard" className="topbar-back"><ChevronLeft size={18} /></Link>
          <p className="topbar-title">
            Notifications
            {unreadCount > 0 && (
              <span style={{ marginLeft: 8, background: '#FF5C1A', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 100, fontFamily: 'DM Sans, sans-serif' }}>
                {unreadCount}
              </span>
            )}
          </p>
          {unreadCount > 0 && (
            <button className="topbar-action" onClick={markAllRead}>
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
          <Link href="/settings" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, border: '1.5px solid #E8E6E1', color: '#6B6B6B', textDecoration: 'none', transition: 'all 0.2s', flexShrink: 0 }}>
            <Settings size={16} />
          </Link>
        </div>

        <div className="notif-body">

          {/* Tabs */}
          <div className="notif-tabs">
            {filterTabs.map(t => {
              const count = t.key === 'all'     ? items.length
                          : t.key === 'unread'  ? items.filter(n => !n.read).length
                          : t.key === 'booking' ? items.filter(n => n.type === 'booking' || n.type === 'reminder').length
                          : items.filter(n => n.type === 'message').length
              return (
                <button key={t.key} className={`notif-tab${activeTab === t.key ? ' active' : ''}`} onClick={() => setActiveTab(t.key)}>
                  {t.label}
                  {count > 0 && <span className="notif-tab-count">{count}</span>}
                </button>
              )
            })}
          </div>

          {/* Groups */}
          {filtered.length === 0 ? (
            <div className="notif-empty">
              <div className="notif-empty-icon"><BellOff size={28} color="#AFAFAF" /></div>
              <p className="notif-empty-title">No notifications</p>
              <p className="notif-empty-sub">You&apos;re all caught up!</p>
            </div>
          ) : (
            Object.entries(groups).map(([group, notifs]) => (
              <div key={group} className="notif-group">
                <p className="notif-group-label">{group}</p>
                <div className="notif-list">
                  {notifs.map(n => {
                    const cfg = typeConfig[n.type]
                    return (
                      <div
                        key={n.id}
                        className={`notif-item${!n.read ? ' unread' : ''}`}
                        onClick={() => markRead(n.id)}
                      >
                        {!n.read && <div className="notif-unread-dot" />}

                        {n.avatar
                          ? <div className="notif-avatar" style={{ background: n.avatar.bg, color: n.avatar.color }}>{n.avatar.initials}</div>
                          : <div className="notif-icon-wrap" style={{ background: cfg.bg, color: cfg.color }}>{cfg.icon}</div>
                        }

                        <div className="notif-content">
                          <p className="notif-title">{n.title}</p>
                          <p className="notif-body-text">{n.body}</p>
                          <p className="notif-time"><Clock size={10} />{n.time}</p>

                          {!n.read && n.actionUrl && (
                            <div className="notif-action-row">
                              <Link href={n.actionUrl} className="notif-btn-primary">
                                {n.type === 'message' ? 'Reply' : n.type === 'review' ? 'Rate Now' : 'View'}
                              </Link>
                              <button className="notif-btn-secondary" onClick={e => { e.stopPropagation(); markRead(n.id) }}>
                                Dismiss
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={e => { e.stopPropagation(); deleteNotif(n.id) }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#AFAFAF', padding: 4, display: 'flex', flexShrink: 0, transition: 'color 0.2s' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#AFAFAF')}
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