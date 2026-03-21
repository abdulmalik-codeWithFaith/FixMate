'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { db, auth } from '@/lib/firebase'
import {
  collection, query, where, onSnapshot,
  orderBy, doc, updateDoc, serverTimestamp, getDoc
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import toast, { Toaster } from 'react-hot-toast'
import {
  ChevronLeft, Search, Calendar, MapPin, Clock,
  CheckCircle, XCircle, MessageCircle, Star, Filter,
  DollarSign, Briefcase, AlertCircle, RotateCcw,
  Eye, Loader2, X
} from 'lucide-react'

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Tab = 'all' | 'new' | 'active' | 'completed' | 'declined'

interface Job {
  id: string
  clientId: string
  clientName: string
  clientInitials: string
  clientAvatarBg: string
  clientAvatarColor: string
  description: string
  skill: string
  location: string
  scheduledDate: string
  scheduledTs: any
  price: number
  currency: string
  status: 'pending' | 'accepted' | 'completed' | 'cancelled'
  rating?: number
  createdAt: any
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: 'New Request', bg: '#FFF3EE', color: '#FF5C1A', icon: <AlertCircle size={11} /> },
  accepted:  { label: 'Active',      bg: '#EEF6FF', color: '#2563EB', icon: <Clock size={11} />        },
  completed: { label: 'Completed',   bg: '#F0FDF4', color: '#16A34A', icon: <CheckCircle size={11} />  },
  cancelled: { label: 'Declined',    bg: '#F5F4F1', color: '#6B6B6B', icon: <XCircle size={11} />      },
}

// Map Firestore status → tab key
const statusToTab: Record<string, Tab> = {
  pending:   'new',
  accepted:  'active',
  completed: 'completed',
  cancelled: 'declined',
}

function formatDate(ts: any): string {
  if (!ts) return 'Scheduled'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const now = new Date()
  const diff = (d.getTime() - now.getTime()) / 86400000
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  if (diff > 0 && diff < 1)  return `Today · ${time}`
  if (diff >= 1 && diff < 2) return `Tomorrow · ${time}`
  if (diff < 0 && diff > -2) return `Yesterday · ${time}`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ` · ${time}`
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'C'
}

const palettes = [
  { bg: '#EEF6FF', color: '#2563EB' }, { bg: '#F0FDF4', color: '#16A34A' },
  { bg: '#FFF8EE', color: '#D97706' }, { bg: '#F5F0FF', color: '#7C3AED' },
  { bg: '#FFF3EE', color: '#FF5C1A' },
]

// ─── STYLES ───────────────────────────────────────────────────────────────────

const S = `
  .wj-page { min-height: 100vh; background: #F5F4F1; }
  .wj-topbar { background: white; border-bottom: 1px solid #E8E6E1; padding: 0 40px; height: 64px; display: flex; align-items: center; gap: 14px; position: sticky; top: 0; z-index: 40; }
  .tb-back { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; color: #6B6B6B; text-decoration: none; transition: all 0.2s; border: 1.5px solid #E8E6E1; flex-shrink: 0; }
  .tb-back:hover { border-color: #0F0F0F; color: #0F0F0F; }
  .tb-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; flex: 1; }
  .wj-header { background: white; border-bottom: 1px solid #E8E6E1; padding: 24px 40px 0; }
  .wj-header-inner { max-width: 960px; margin: 0 auto; }
  .wj-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; letter-spacing: -1px; color: #0F0F0F; margin-bottom: 4px; }
  .wj-sub { font-size: 14px; color: #6B6B6B; font-weight: 300; margin-bottom: 20px; }
  .summary-strip { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
  .summary-pill { display: flex; align-items: center; gap: 7px; background: #F5F4F1; border: 1px solid #E8E6E1; border-radius: 100px; padding: 7px 14px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #0F0F0F; }
  .summary-pill em { font-style: normal; color: #FF5C1A; }
  .search-filter-row { display: flex; gap: 10px; margin-bottom: 20px; }
  .search-field { flex: 1; display: flex; align-items: center; gap: 10px; background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 12px; padding: 11px 16px; transition: border-color 0.2s; }
  .search-field:focus-within { border-color: #FF5C1A; background: white; }
  .search-field input { flex: 1; border: none; outline: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F; }
  .search-field input::placeholder { color: #AFAFAF; }
  .search-clear { background: none; border: none; cursor: pointer; color: #AFAFAF; display: flex; padding: 0; }
  .search-clear:hover { color: #6B6B6B; }
  .wj-tabs { display: flex; overflow-x: auto; scrollbar-width: none; }
  .wj-tabs::-webkit-scrollbar { display: none; }
  .wj-tab { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; color: #6B6B6B; background: none; border: none; padding: 14px 20px; cursor: pointer; transition: color 0.2s; border-bottom: 2.5px solid transparent; margin-bottom: -1px; white-space: nowrap; display: flex; align-items: center; gap: 6px; }
  .wj-tab:hover { color: #0F0F0F; }
  .wj-tab.active { color: #FF5C1A; border-bottom-color: #FF5C1A; }
  .tab-cnt { background: #F5F4F1; color: #6B6B6B; font-size: 11px; padding: 2px 7px; border-radius: 100px; transition: all 0.2s; }
  .wj-tab.active .tab-cnt { background: #FF5C1A; color: white; }
  .wj-body { max-width: 960px; margin: 0 auto; padding: 28px 40px; display: flex; flex-direction: column; gap: 14px; }
  .job-card { background: white; border: 1px solid #E8E6E1; border-radius: 18px; overflow: hidden; transition: all 0.2s; }
  .job-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07); }
  .job-card.new-card   { border-left: 3px solid #FF5C1A; }
  .job-card.active-card { border-left: 3px solid #2563EB; }
  .job-main { padding: 20px 22px; display: flex; gap: 14px; align-items: flex-start; }
  .job-avatar { width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; flex-shrink: 0; }
  .job-info { flex: 1; min-width: 0; }
  .job-top-row { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap; }
  .job-client { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; }
  .job-status { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 100px; font-family: 'Syne', sans-serif; }
  .job-rating { display: flex; align-items: center; gap: 3px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #0F0F0F; margin-left: auto; }
  .job-desc { font-size: 13px; color: #6B6B6B; line-height: 1.6; font-weight: 300; margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .job-meta { display: flex; flex-wrap: wrap; gap: 12px; }
  .job-meta-item { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #6B6B6B; }
  .job-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }
  .job-budget { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: #0F0F0F; }
  .job-footer { border-top: 1px solid #E8E6E1; padding: 12px 22px; display: flex; gap: 8px; background: #FAFAF8; flex-wrap: wrap; }
  .jf-btn { display: inline-flex; align-items: center; gap: 6px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; border-radius: 9px; padding: 8px 16px; cursor: pointer; text-decoration: none; transition: all 0.2s; border: none; white-space: nowrap; }
  .jf-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .jf-orange  { background: #FF5C1A; color: white; }
  .jf-orange:hover:not(:disabled)  { background: #FF7A40; }
  .jf-dark    { background: #0F0F0F; color: white; }
  .jf-dark:hover:not(:disabled)    { background: #1A1A1A; }
  .jf-outline { background: transparent; color: #6B6B6B; border: 1.5px solid #E8E6E1; }
  .jf-outline:hover { background: #F5F4F1; color: #0F0F0F; border-color: #0F0F0F; }
  .jf-danger  { background: transparent; color: #EF4444; border: 1.5px solid rgba(239,68,68,0.25); }
  .jf-danger:hover:not(:disabled)  { background: #FEF2F2; border-color: #EF4444; }
  .wj-empty { text-align: center; padding: 80px 20px; background: white; border: 1px solid #E8E6E1; border-radius: 18px; }
  .wj-empty-icon { width: 72px; height: 72px; border-radius: 20px; background: #F5F4F1; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
  .wj-empty-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 20px; color: #0F0F0F; margin-bottom: 8px; }
  .wj-empty-sub { font-size: 15px; color: #6B6B6B; }
  .skeleton { background: linear-gradient(90deg, #F5F4F1 25%, #E8E6E1 50%, #F5F4F1 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  .loading-screen { height: 100vh; display: flex; align-items: center; justify-content: center; background: #F5F4F1; }
  .loading-spinner { width: 40px; height: 40px; border-radius: 50%; border: 3px solid #E8E6E1; border-top-color: #FF5C1A; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (max-width: 768px) {
    .wj-topbar, .wj-header { padding-left: 16px; padding-right: 16px; }
    .wj-body { padding: 20px 16px; }
    .summary-strip { display: none; }
    .job-main { flex-wrap: wrap; }
    .job-right { flex-direction: row; width: 100%; justify-content: space-between; align-items: center; }
  }
`

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function WorkerJobsPage() {
  const router = useRouter()

  const [authUser, setAuthUser]     = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [jobs, setJobs]             = useState<Job[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [activeTab, setActiveTab]   = useState<Tab>('all')
  const [search, setSearch]         = useState('')

  // ── 1. Auth ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { router.push('/login'); return }
      setAuthUser(u); setAuthLoading(false)
    })
    return () => unsub()
  }, [router])

  // ── 2. Real-time all bookings for this worker ────────────────────────────────
  useEffect(() => {
    if (!authUser) return

    const q = query(
      collection(db, 'bookings'),
      where('workerId', '==', authUser.uid),
      orderBy('createdAt', 'desc')
    )

    const unsub = onSnapshot(q, (snap) => {
      const mapped: Job[] = snap.docs.map(d => {
        const b = d.data() as any
        const p = palettes[Math.abs(d.id.charCodeAt(0)) % palettes.length]
        const clientName = b.clientName || 'Client'
        return {
          id:               d.id,
          clientId:         b.clientId         || '',
          clientName,
          clientInitials:   b.clientInitials   || getInitials(clientName),
          clientAvatarBg:   b.clientAvatarBg   || p.bg,
          clientAvatarColor: b.clientAvatarColor || p.color,
          description:      b.description      || b.skill || 'Service',
          skill:            b.skill            || '',
          location:         b.location         || '',
          scheduledDate:    formatDate(b.scheduledAt || b.createdAt),
          scheduledTs:      b.scheduledAt,
          price:            b.price            || 0,
          currency:         b.currency         || '£',
          status:           b.status           || 'pending',
          rating:           b.rating,
          createdAt:        b.createdAt,
        }
      })
      setJobs(mapped)
      setDataLoading(false)
    }, (err) => {
      console.error('Jobs listener error:', err)
      setDataLoading(false)
      toast.error('Could not load jobs.')
    })

    return () => unsub()
  }, [authUser])

  // ── 3. Accept ────────────────────────────────────────────────────────────────
  const handleAccept = async (jobId: string) => {
    setActioningId(jobId)
    try {
      await updateDoc(doc(db, 'bookings', jobId), {
        status: 'accepted', updatedAt: serverTimestamp(),
      })
      toast.success('Job accepted!')
    } catch {
      toast.error('Could not accept job.')
    } finally {
      setActioningId(null)
    }
  }

  // ── 4. Decline ───────────────────────────────────────────────────────────────
  const handleDecline = async (jobId: string) => {
    setActioningId(jobId)
    try {
      await updateDoc(doc(db, 'bookings', jobId), {
        status: 'cancelled', updatedAt: serverTimestamp(),
      })
      toast.success('Job declined.')
    } catch {
      toast.error('Could not decline.')
    } finally {
      setActioningId(null)
    }
  }

  // ── 5. Complete ──────────────────────────────────────────────────────────────
  const handleComplete = async (jobId: string) => {
    setActioningId(jobId)
    try {
      await updateDoc(doc(db, 'bookings', jobId), {
        status: 'completed', updatedAt: serverTimestamp(),
      })
      // Increment worker jobs count
      const workerSnap = await getDoc(doc(db, 'workers', authUser.uid))
      if (workerSnap.exists()) {
        await updateDoc(doc(db, 'workers', authUser.uid), {
          jobs: (workerSnap.data().jobs || 0) + 1,
        })
      }
      toast.success('Job marked as completed!')
    } catch {
      toast.error('Could not complete job.')
    } finally {
      setActioningId(null)
    }
  }

  // ── 6. Reconsider (cancelled → pending) ─────────────────────────────────────
  const handleReconsider = async (jobId: string) => {
    setActioningId(jobId)
    try {
      await updateDoc(doc(db, 'bookings', jobId), {
        status: 'pending', updatedAt: serverTimestamp(),
      })
      toast.success('Job moved back to requests.')
    } catch {
      toast.error('Could not update.')
    } finally {
      setActioningId(null)
    }
  }

  // ── Filtering & counts ───────────────────────────────────────────────────────
  const filtered = jobs.filter(j => {
    const tabStatus = activeTab === 'new'       ? 'pending'
                    : activeTab === 'active'    ? 'accepted'
                    : activeTab === 'declined'  ? 'cancelled'
                    : activeTab === 'completed' ? 'completed'
                    : null
    const matchTab    = !tabStatus || j.status === tabStatus
    const matchSearch = !search
      || j.clientName.toLowerCase().includes(search.toLowerCase())
      || j.description.toLowerCase().includes(search.toLowerCase())
      || j.location.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const countFor = (tab: Tab): number => {
    if (tab === 'all')       return jobs.length
    if (tab === 'new')       return jobs.filter(j => j.status === 'pending').length
    if (tab === 'active')    return jobs.filter(j => j.status === 'accepted').length
    if (tab === 'completed') return jobs.filter(j => j.status === 'completed').length
    if (tab === 'declined')  return jobs.filter(j => j.status === 'cancelled').length
    return 0
  }

  const totalEarned     = jobs.filter(j => j.status === 'completed').reduce((s, j) => s + j.price, 0)
  const completedCount  = jobs.filter(j => j.status === 'completed').length
  const activeCount     = jobs.filter(j => j.status === 'accepted').length
  const newCount        = jobs.filter(j => j.status === 'pending').length
  const currency        = jobs[0]?.currency || '£'

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all',       label: 'All Jobs'  },
    { key: 'new',       label: 'New'       },
    { key: 'active',    label: 'Active'    },
    { key: 'completed', label: 'Completed' },
    { key: 'declined',  label: 'Declined'  },
  ]

  if (authLoading) {
    return (
      <>
        <style>{S}</style>
        <div className="loading-screen"><div className="loading-spinner" /></div>
      </>
    )
  }

  return (
    <>
      <style>{S}</style>
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />

      <div className="wj-page">

        {/* TOPBAR */}
        <div className="wj-topbar">
          <Link href="/worker/dashboard" className="tb-back"><ChevronLeft size={18} /></Link>
          <p className="tb-title">Job History</p>
        </div>

        {/* HEADER */}
        <div className="wj-header">
          <div className="wj-header-inner">
            <h1 className="wj-title">All Jobs</h1>
            <p className="wj-sub">Manage requests, active work and completed jobs</p>

            {/* Summary strip */}
            <div className="summary-strip">
              <div className="summary-pill"><AlertCircle size={13} color="#FF5C1A" /><em>{newCount}</em> new</div>
              <div className="summary-pill"><Clock size={13} color="#2563EB" /><em>{activeCount}</em> active</div>
              <div className="summary-pill"><CheckCircle size={13} color="#16A34A" /><em>{completedCount}</em> completed</div>
              <div className="summary-pill"><DollarSign size={13} color="#D97706" />{currency}<em>{totalEarned.toLocaleString()}</em> earned</div>
            </div>

            {/* Search */}
            <div className="search-filter-row">
              <div className="search-field">
                <Search size={16} color="#AFAFAF" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search by client name, description or location…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button className="search-clear" onClick={() => setSearch('')}><X size={15} /></button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="wj-tabs">
              {tabs.map(t => (
                <button
                  key={t.key}
                  className={`wj-tab${activeTab === t.key ? ' active' : ''}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                  <span className="tab-cnt">{countFor(t.key)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="wj-body">
          {dataLoading ? (
            // Skeleton loaders
            [...Array(3)].map((_, i) => (
              <div key={i} style={{ background: 'white', border: '1px solid #E8E6E1', borderRadius: 18, padding: 22 }}>
                <div style={{ display: 'flex', gap: 14 }}>
                  <div className="skeleton" style={{ width: 46, height: 46, borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
                    <div className="skeleton" style={{ height: 14, width: '35%' }} />
                    <div className="skeleton" style={{ height: 12, width: '75%' }} />
                    <div className="skeleton" style={{ height: 12, width: '55%' }} />
                  </div>
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="wj-empty">
              <div className="wj-empty-icon"><Briefcase size={28} color="#AFAFAF" /></div>
              <p className="wj-empty-title">
                {search ? 'No results found' : `No ${activeTab === 'all' ? '' : activeTab} jobs`}
              </p>
              <p className="wj-empty-sub">
                {search ? 'Try a different search term.' : `No ${activeTab === 'all' ? '' : activeTab} jobs yet.`}
              </p>
            </div>
          ) : (
            filtered.map(job => {
              const st = statusConfig[job.status] || statusConfig.pending
              const isActioning = actioningId === job.id

              return (
                <div
                  key={job.id}
                  className={`job-card${job.status === 'pending' ? ' new-card' : job.status === 'accepted' ? ' active-card' : ''}`}
                >
                  <div className="job-main">
                    <div className="job-avatar" style={{ background: job.clientAvatarBg, color: job.clientAvatarColor }}>
                      {job.clientInitials}
                    </div>
                    <div className="job-info">
                      <div className="job-top-row">
                        <p className="job-client">{job.clientName}</p>
                        <span className="job-status" style={{ background: st.bg, color: st.color }}>
                          {st.icon} {st.label}
                        </span>
                        {job.rating && (
                          <div className="job-rating" style={{ marginLeft: 'auto' }}>
                            <Star size={13} color="#F59E0B" fill="#F59E0B" /> {job.rating}
                          </div>
                        )}
                      </div>
                      <p className="job-desc">{job.description}</p>
                      <div className="job-meta">
                        {job.location && (
                          <span className="job-meta-item"><MapPin size={11} />{job.location}</span>
                        )}
                        <span className="job-meta-item"><Calendar size={11} />{job.scheduledDate}</span>
                      </div>
                    </div>
                    <div className="job-right">
                      <p className="job-budget">{job.currency}{job.price}</p>
                    </div>
                  </div>

                  <div className="job-footer">
                    {/* New request actions */}
                    {job.status === 'pending' && (
                      <>
                        <button
                          className="jf-btn jf-orange"
                          onClick={() => handleAccept(job.id)}
                          disabled={isActioning}
                        >
                          {isActioning
                            ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                            : <><CheckCircle size={14} /> Accept</>
                          }
                        </button>
                        <Link href={`/chat/${job.clientId}`} className="jf-btn jf-outline">
                          <MessageCircle size={14} /> Chat
                        </Link>
                        <button
                          className="jf-btn jf-danger"
                          onClick={() => handleDecline(job.id)}
                          disabled={isActioning}
                        >
                          <XCircle size={14} /> Decline
                        </button>
                      </>
                    )}

                    {/* Active job actions */}
                    {job.status === 'accepted' && (
                      <>
                        <button
                          className="jf-btn jf-dark"
                          onClick={() => handleComplete(job.id)}
                          disabled={isActioning}
                        >
                          {isActioning
                            ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                            : <><CheckCircle size={14} /> Mark Complete</>
                          }
                        </button>
                        <Link href={`/chat/${job.clientId}`} className="jf-btn jf-outline">
                          <MessageCircle size={14} /> Chat
                        </Link>
                        <Link href={`/worker/jobs/${job.id}`} className="jf-btn jf-outline">
                          <Eye size={14} /> View Details
                        </Link>
                      </>
                    )}

                    {/* Completed actions */}
                    {job.status === 'completed' && (
                      <>
                        <Link href={`/worker/jobs/${job.id}`} className="jf-btn jf-outline">
                          <Eye size={14} /> View Details
                        </Link>
                        <Link href={`/chat/${job.clientId}`} className="jf-btn jf-outline">
                          <MessageCircle size={14} /> Message
                        </Link>
                      </>
                    )}

                    {/* Declined / cancelled actions */}
                    {job.status === 'cancelled' && (
                      <button
                        className="jf-btn jf-outline"
                        onClick={() => handleReconsider(job.id)}
                        disabled={isActioning}
                      >
                        {isActioning
                          ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                          : <><RotateCcw size={14} /> Reconsider</>
                        }
                      </button>
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