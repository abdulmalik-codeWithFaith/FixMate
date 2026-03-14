'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft, Bell, BellOff, Clock, CheckCheck,
  MessageCircle, Banknote, AlertCircle, Calendar,
  Star, Trash2, Settings, Check, ChevronRight
} from 'lucide-react'

type FilterTab = 'all' | 'unread' | 'jobs' | 'payments' | 'messages'
type NotifType = 'job' | 'message' | 'payment' | 'review' | 'system'

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
  { id: 'n1',  type: 'job',     title: 'New Job Request',          body: 'Sarah Adams wants a consumer unit replacement tomorrow at 2:00 PM. Budget: £90.',              time: '5 min ago',   read: false, actionUrl: '/worker/jobs',            avatar: { initials: 'SA', bg: '#EEF6FF', color: '#2563EB' } },
  { id: 'n2',  type: 'job',     title: 'New Job Request',          body: 'Tom Richards needs 3 double sockets installed in his garage. Budget: £120.',                   time: '22 min ago',  read: false, actionUrl: '/worker/jobs',            avatar: { initials: 'TR', bg: '#F0FDF4', color: '#16A34A' } },
  { id: 'n3',  type: 'message', title: 'Message from Sarah Adams', body: 'It\'s a Hager unit. About 10 years old.',                                                      time: '1 hr ago',    read: false, actionUrl: '/chat/j1',                avatar: { initials: 'SA', bg: '#EEF6FF', color: '#2563EB' } },
  { id: 'n4',  type: 'payment', title: 'Payment Received',         body: '£420 from James P. for full house rewire has been released to your account.',                  time: '3 hrs ago',   read: false, actionUrl: '/worker/earnings' },
  { id: 'n5',  type: 'job',     title: 'Upcoming Job Reminder',    body: 'You have a job with Emma Clarke today at 11:00 AM — EV charger installation, Fulham.',         time: '5 hrs ago',   read: true,  actionUrl: '/worker/jobs' },
  { id: 'n6',  type: 'review',  title: 'New 5-Star Review',        body: 'James P. left you a 5-star review: "Brilliant work, fast and tidy. Highly recommend!"',       time: '1 day ago',   read: true,  actionUrl: '/worker/profile',         avatar: { initials: 'JP', bg: '#EEF6FF', color: '#2563EB' } },
  { id: 'n7',  type: 'payment', title: 'Payout Processed',         body: '£1,640 has been sent to your Barclays account ending in 4521. Should arrive by Friday.',      time: '2 days ago',  read: true,  actionUrl: '/worker/earnings' },
  { id: 'n8',  type: 'message', title: 'Message from Anya K.',     body: 'Could you come slightly earlier, around 9:30 AM instead of 10?',                              time: '2 days ago',  read: true,  actionUrl: '/chat/j6',                avatar: { initials: 'AK', bg: '#F0FDF4', color: '#16A34A' } },
  { id: 'n9',  type: 'system',  title: 'Profile Tip',              body: 'Adding a profile photo increases booking rate by 40%. Update yours today.',                   time: '3 days ago',  read: true,  actionUrl: '/worker/profile' },
  { id: 'n10', type: 'review',  title: 'New 5-Star Review',        body: 'Sophie M. gave you 5 stars: "Smart home installation was perfect. Very knowledgeable."',      time: '1 week ago',  read: true,  actionUrl: '/worker/profile',         avatar: { initials: 'SM', bg: '#F5F0FF', color: '#7C3AED' } },
]

const typeConfig: Record<NotifType, { icon: React.ReactNode; bg: string; color: string }> = {
  job:     { icon: <AlertCircle size={16} />, bg: '#FFF3EE', color: '#FF5C1A' },
  message: { icon: <MessageCircle size={16} />, bg: '#EEF6FF', color: '#2563EB' },
  payment: { icon: <Banknote size={16} />,     bg: '#F0FDF4', color: '#16A34A' },
  review:  { icon: <Star size={16} />,          bg: '#FFF8EE', color: '#D97706' },
  system:  { icon: <Bell size={16} />,          bg: '#F5F0FF', color: '#7C3AED' },
}

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: 'all',      label: 'All'      },
  { key: 'unread',   label: 'Unread'   },
  { key: 'jobs',     label: 'Jobs'     },
  { key: 'payments', label: 'Payments' },
  { key: 'messages', label: 'Messages' },
]

function groupByDate(items: Notification[]) {
  const groups: Record<string, Notification[]> = {}
  items.forEach(n => {
    const k = n.time.includes('min') || n.time.includes('hr') ? 'Today'
      : n.time.includes('1 day') ? 'Yesterday'
      : n.time.includes('day') ? 'This Week'
      : 'Earlier'
    if (!groups[k]) groups[k] = []
    groups[k].push(n)
  })
  return groups
}

const S = `
  .wn-page { min-height: 100vh; background: #F5F4F1; }
  .wn-topbar { background: white; border-bottom: 1px solid #E8E6E1; padding: 0 40px; height: 64px; display: flex; align-items: center; gap: 14px; position: sticky; top: 0; z-index: 40; }
  .tb-back { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; color: #6B6B6B; text-decoration: none; transition: all 0.2s; border: 1.5px solid #E8E6E1; flex-shrink: 0; }
  .tb-back:hover { border-color: #0F0F0F; color: #0F0F0F; }
  .tb-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; flex: 1; }
  .tb-action { display: flex; align-items: center; gap: 6px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #6B6B6B; background: none; border: 1.5px solid #E8E6E1; border-radius: 9px; padding: 7px 14px; cursor: pointer; transition: all 0.2s; }
  .tb-action:hover { border-color: #FF5C1A; color: #FF5C1A; }
  .tb-icon { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; border: 1.5px solid #E8E6E1; color: #6B6B6B; text-decoration: none; transition: all 0.2s; }
  .tb-icon:hover { border-color: #FF5C1A; color: #FF5C1A; }

  .wn-body { max-width: 680px; margin: 0 auto; padding: 28px 40px; }

  /* TABS */
  .wn-tabs { display: flex; gap: 8px; margin-bottom: 24px; overflow-x: auto; scrollbar-width: none; }
  .wn-tabs::-webkit-scrollbar { display: none; }
  .wn-tab { display: flex; align-items: center; gap: 6px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #6B6B6B; background: white; border: 1.5px solid #E8E6E1; border-radius: 100px; padding: 7px 16px; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
  .wn-tab:hover { border-color: #FF5C1A; color: #FF5C1A; }
  .wn-tab.active { background: #FF5C1A; border-color: #FF5C1A; color: white; }
  .tab-cnt { font-size: 11px; padding: 1px 6px; border-radius: 100px; background: rgba(255,255,255,0.25); color: white; }
  .wn-tab:not(.active) .tab-cnt { background: #F5F4F1; color: #6B6B6B; }

  /* GROUP */
  .notif-group { margin-bottom: 28px; }
  .notif-group-label { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; color: #AFAFAF; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; padding: 0 4px; }
  .notif-list { display: flex; flex-direction: column; gap: 2px; }

  /* ITEM */
  .notif-item { display: flex; align-items: flex-start; gap: 14px; background: white; border: 1px solid #E8E6E1; border-radius: 14px; padding: 16px 18px; cursor: pointer; transition: all 0.2s; position: relative; text-decoration: none; color: inherit; }
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
  .na-btn { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; border-radius: 8px; padding: 6px 14px; cursor: pointer; text-decoration: none; transition: all 0.2s; border: none; }
  .na-primary { background: #FF5C1A; color: white; }
  .na-primary:hover { background: #FF7A40; }
  .na-secondary { background: transparent; color: #6B6B6B; border: 1.5px solid #E8E6E1; }
  .na-secondary:hover { border-color: #0F0F0F; color: #0F0F0F; }
  .del-btn { background: none; border: none; cursor: pointer; color: #AFAFAF; display: flex; padding: 4px; transition: color 0.2s; flex-shrink: 0; }
  .del-btn:hover { color: #EF4444; }

  /* EMPTY */
  .notif-empty { text-align: center; padding: 80px 20px; }
  .notif-empty-icon { width: 72px; height: 72px; border-radius: 20px; background: #F5F4F1; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
  .notif-empty-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 20px; color: #0F0F0F; margin-bottom: 8px; }
  .notif-empty-sub { font-size: 15px; color: #6B6B6B; }

  @media (max-width: 768px) {
    .wn-topbar { padding: 0 16px; }
    .wn-body { padding: 20px 16px; }
  }
`

export default function WorkerNotificationsPage() {
  const [items, setItems]         = useState<Notification[]>(INITIAL)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  const unreadCount = items.filter(n => !n.read).length
  const markAllRead = () => setItems(p => p.map(n => ({ ...n, read: true })))
  const markRead    = (id: string) => setItems(p => p.map(n => n.id === id ? { ...n, read: true } : n))
  const deleteItem  = (id: string) => setItems(p => p.filter(n => n.id !== id))

  const filtered = items.filter(n => {
    if (activeTab === 'unread')   return !n.read
    if (activeTab === 'jobs')     return n.type === 'job'
    if (activeTab === 'payments') return n.type === 'payment'
    if (activeTab === 'messages') return n.type === 'message'
    return true
  })

  const groups = groupByDate(filtered)

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
            <button className="tb-action" onClick={markAllRead}>
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
          <Link href="/worker/settings" className="tb-icon"><Settings size={16} /></Link>
        </div>

        <div className="wn-body">

          <div className="wn-tabs">
            {filterTabs.map(t => {
              const count = t.key === 'all'      ? items.length
                          : t.key === 'unread'   ? items.filter(n => !n.read).length
                          : t.key === 'jobs'     ? items.filter(n => n.type === 'job').length
                          : t.key === 'payments' ? items.filter(n => n.type === 'payment').length
                          : items.filter(n => n.type === 'message').length
              return (
                <button key={t.key} className={`wn-tab${activeTab === t.key ? ' active' : ''}`} onClick={() => setActiveTab(t.key)}>
                  {t.label}
                  {count > 0 && <span className="tab-cnt">{count}</span>}
                </button>
              )
            })}
          </div>

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
                      <div key={n.id} className={`notif-item${!n.read ? ' unread' : ''}`} onClick={() => markRead(n.id)}>
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
                              <Link href={n.actionUrl} className="na-btn na-primary">
                                {n.type === 'job' ? 'View Request' : n.type === 'message' ? 'Reply' : n.type === 'payment' ? 'View Earnings' : 'View'}
                              </Link>
                              <button className="na-btn na-secondary" onClick={e => { e.stopPropagation(); markRead(n.id) }}>Dismiss</button>
                            </div>
                          )}
                        </div>
                        <button className="del-btn" onClick={e => { e.stopPropagation(); deleteItem(n.id) }}>
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