'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { db, auth } from '@/lib/firebase'
import { collection, query, where, getDocs, orderBy, getDoc, doc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import {
  ChevronLeft, TrendingUp, DollarSign, Calendar,
  CheckCircle, Download, ArrowUpRight, ArrowDownRight,
  Banknote, Clock, Star, Loader2
} from 'lucide-react'

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Period = 'week' | 'month' | 'year'

interface Transaction {
  id: string
  clientName: string
  clientInitials: string
  clientAvatarBg: string
  clientAvatarColor: string
  description: string
  date: string
  dateTs: any
  amount: number
  currency: string
  status: 'completed' | 'pending' | 'accepted'
  hours: number
}

interface ChartBar { label: string; amount: number }

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const palettes = [
  { bg: '#EEF6FF', color: '#2563EB' }, { bg: '#F0FDF4', color: '#16A34A' },
  { bg: '#FFF8EE', color: '#D97706' }, { bg: '#F5F0FF', color: '#7C3AED' },
  { bg: '#FFF3EE', color: '#FF5C1A' },
]

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'C'
}

function formatDate(ts: any): string {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getWeekStart(): Date {
  const d = new Date(); d.setHours(0,0,0,0)
  d.setDate(d.getDate() - d.getDay())
  return d
}

function getMonthStart(): Date {
  const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d
}

function getYearStart(): Date {
  const d = new Date(); d.setMonth(0,1); d.setHours(0,0,0,0); return d
}

function buildMonthlyChart(transactions: Transaction[]): ChartBar[] {
  const now = new Date()
  const bars: ChartBar[] = []
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = d.toLocaleString('en-US', { month: 'short' })
    const total = transactions
      .filter(t => {
        if (!t.dateTs) return false
        const td = t.dateTs.toDate ? t.dateTs.toDate() : new Date(t.dateTs)
        return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear() && t.status === 'completed'
      })
      .reduce((s, t) => s + t.amount, 0)
    bars.push({ label, amount: total })
  }
  return bars
}

function buildWeeklyChart(transactions: Transaction[]): ChartBar[] {
  const bars: ChartBar[] = []
  const dayLabels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now); d.setDate(now.getDate() - i); d.setHours(0,0,0,0)
    const total = transactions
      .filter(t => {
        if (!t.dateTs) return false
        const td = t.dateTs.toDate ? t.dateTs.toDate() : new Date(t.dateTs)
        td.setHours(0,0,0,0)
        return td.getTime() === d.getTime() && t.status === 'completed'
      })
      .reduce((s, t) => s + t.amount, 0)
    bars.push({ label: dayLabels[d.getDay()], amount: total })
  }
  return bars
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const S = `
  .we-page { min-height: 100vh; background: #F5F4F1; }
  .we-topbar { background: white; border-bottom: 1px solid #E8E6E1; padding: 0 40px; height: 64px; display: flex; align-items: center; gap: 14px; position: sticky; top: 0; z-index: 40; }
  .tb-back { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; color: #6B6B6B; text-decoration: none; transition: all 0.2s; border: 1.5px solid #E8E6E1; flex-shrink: 0; }
  .tb-back:hover { border-color: #0F0F0F; color: #0F0F0F; }
  .tb-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; flex: 1; }
  .tb-export { display: flex; align-items: center; gap: 6px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #6B6B6B; background: none; border: 1.5px solid #E8E6E1; border-radius: 9px; padding: 7px 14px; cursor: pointer; transition: all 0.2s; }
  .tb-export:hover { border-color: #FF5C1A; color: #FF5C1A; }
  .we-body { max-width: 960px; margin: 0 auto; padding: 28px 40px; display: flex; flex-direction: column; gap: 20px; }
  .earnings-hero { background: #0F0F0F; border-radius: 22px; padding: 40px 48px; position: relative; overflow: hidden; }
  .hero-glow { position: absolute; top: -80px; right: -80px; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(255,92,26,0.18) 0%, transparent 70%); pointer-events: none; }
  .hero-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; flex-wrap: wrap; gap: 20px; }
  .hero-label { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; color: rgba(255,92,26,0.8); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px; position: relative; }
  .hero-amount { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(40px,6vw,60px); color: white; letter-spacing: -2px; line-height: 1; position: relative; }
  .hero-amount em { color: #FF5C1A; font-style: normal; }
  .hero-trend { display: flex; align-items: center; gap: 6px; margin-top: 10px; font-size: 14px; color: rgba(255,255,255,0.5); position: relative; }
  .trend-up   { color: #22C55E; display: flex; align-items: center; gap: 3px; font-family: 'Syne', sans-serif; font-weight: 700; }
  .trend-down { color: #EF4444; display: flex; align-items: center; gap: 3px; font-family: 'Syne', sans-serif; font-weight: 700; }
  .period-selector { display: flex; background: rgba(255,255,255,0.08); border-radius: 12px; padding: 4px; flex-shrink: 0; }
  .period-btn { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.5); background: none; border: none; padding: 8px 18px; border-radius: 9px; cursor: pointer; transition: all 0.2s; }
  .period-btn.active { background: #FF5C1A; color: white; }
  .chart-bars { display: flex; align-items: flex-end; gap: 8px; height: 80px; }
  .chart-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .chart-bar { width: 100%; border-radius: 6px 6px 0 0; transition: all 0.3s; cursor: pointer; min-width: 8px; }
  .chart-bar:hover { opacity: 0.8; }
  .chart-label { font-family: 'Syne', sans-serif; font-size: 10px; color: rgba(255,255,255,0.35); font-weight: 600; }
  .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
  .stat-card { background: white; border: 1px solid #E8E6E1; border-radius: 16px; padding: 20px; }
  .stat-icon-wrap { width: 40px; height: 40px; border-radius: 11px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
  .stat-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 26px; color: #0F0F0F; letter-spacing: -1px; }
  .stat-label { font-size: 12px; color: #6B6B6B; margin-top: 3px; }
  .stat-sub { font-size: 12px; color: #6B6B6B; margin-top: 6px; }
  .payout-card { background: white; border: 1px solid #E8E6E1; border-radius: 18px; padding: 24px; display: flex; align-items: center; gap: 20px; }
  .payout-icon { width: 56px; height: 56px; border-radius: 16px; background: #F0FDF4; border: 1px solid rgba(22,163,74,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .payout-label { font-size: 13px; color: #6B6B6B; margin-bottom: 4px; }
  .payout-amount { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: #0F0F0F; letter-spacing: -1px; }
  .payout-note { font-size: 12px; color: #6B6B6B; margin-top: 4px; }
  .payout-btn { display: flex; align-items: center; gap: 8px; background: #0F0F0F; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; border: none; border-radius: 12px; padding: 12px 22px; cursor: pointer; transition: background 0.2s; margin-left: auto; white-space: nowrap; flex-shrink: 0; }
  .payout-btn:hover { background: #1A1A1A; }
  .section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; color: #0F0F0F; }
  .transactions-card { background: white; border: 1px solid #E8E6E1; border-radius: 18px; overflow: hidden; }
  .tx-row { display: flex; align-items: center; gap: 14px; padding: 16px 22px; border-bottom: 1px solid #F5F4F1; transition: background 0.15s; text-decoration: none; color: inherit; }
  .tx-row:last-child { border-bottom: none; }
  .tx-row:hover { background: #FAFAF8; }
  .tx-avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; flex-shrink: 0; }
  .tx-info { flex: 1; min-width: 0; }
  .tx-desc { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; color: #0F0F0F; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tx-meta { display: flex; align-items: center; gap: 10px; font-size: 12px; color: #6B6B6B; flex-wrap: wrap; }
  .tx-meta-item { display: flex; align-items: center; gap: 3px; }
  .tx-amount { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #0F0F0F; flex-shrink: 0; }
  .tx-status { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 100px; font-family: 'Syne', sans-serif; margin-left: 8px; flex-shrink: 0; }
  .skeleton { background: linear-gradient(90deg, #F5F4F1 25%, #E8E6E1 50%, #F5F4F1 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  .loading-screen { height: 100vh; display: flex; align-items: center; justify-content: center; background: #F5F4F1; }
  .loading-spinner { width: 40px; height: 40px; border-radius: 50%; border: 3px solid #E8E6E1; border-top-color: #FF5C1A; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (max-width: 768px) {
    .we-topbar { padding: 0 16px; }
    .we-body { padding: 20px 16px; }
    .stats-grid { grid-template-columns: repeat(2,1fr); }
    .earnings-hero { padding: 28px 22px; }
    .payout-card { flex-wrap: wrap; }
    .payout-btn { width: 100%; justify-content: center; }
  }
`

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function WorkerEarningsPage() {
  const router = useRouter()

  const [authUser, setAuthUser]     = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [dataLoading, setDataLoading]   = useState(true)
  const [workerCurrency, setWorkerCurrency] = useState('£')
  const [period, setPeriod]         = useState<Period>('month')

  // ── Auth ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { router.push('/login'); return }
      setAuthUser(u); setAuthLoading(false)
    })
    return () => unsub()
  }, [router])

  // ── Load worker currency & all bookings ───────────────────────────────────────
  useEffect(() => {
    if (!authUser) return
    const load = async () => {
      try {
        // Get currency from worker doc
        const wSnap = await getDoc(doc(db, 'workers', authUser.uid))
        if (wSnap.exists()) setWorkerCurrency(wSnap.data().currency || '£')

        // Fetch all bookings for this worker
        const snap = await getDocs(
          query(
            collection(db, 'bookings'),
            where('workerId', '==', authUser.uid),
            orderBy('createdAt', 'desc')
          )
        )
        const mapped: Transaction[] = snap.docs.map((d, i) => {
          const b = d.data() as any
          const p = palettes[i % palettes.length]
          const name = b.clientName || 'Client'
          return {
            id:               d.id,
            clientName:       name,
            clientInitials:   b.clientInitials   || getInitials(name),
            clientAvatarBg:   b.clientAvatarBg   || p.bg,
            clientAvatarColor: b.clientAvatarColor || p.color,
            description:      b.description      || b.skill || 'Service',
            date:             formatDate(b.scheduledAt || b.createdAt),
            dateTs:           b.scheduledAt || b.createdAt,
            amount:           b.price             || 0,
            currency:         b.currency          || '£',
            status:           b.status            || 'pending',
            hours:            b.estimatedHours    || Math.max(1, Math.ceil((b.price || 0) / 45)),
          }
        })
        setTransactions(mapped)
      } catch (err) {
        console.error('Earnings load error:', err)
      } finally {
        setDataLoading(false)
      }
    }
    load()
  }, [authUser])

  if (authLoading) {
    return (
      <><style>{S}</style>
      <div className="loading-screen"><div className="loading-spinner" /></div></>
    )
  }

  const cur = workerCurrency

  // ── Computed stats ──────────────────────────────────────────────────────────
  const completed  = transactions.filter(t => t.status === 'completed')
  const pending    = transactions.filter(t => t.status === 'accepted')

  const now        = new Date()
  const weekStart  = getWeekStart()
  const monthStart = getMonthStart()
  const yearStart  = getYearStart()

  const inPeriod = (tx: Transaction) => {
    if (!tx.dateTs) return false
    const d = tx.dateTs.toDate ? tx.dateTs.toDate() : new Date(tx.dateTs)
    if (period === 'week')  return d >= weekStart
    if (period === 'month') return d >= monthStart
    return d >= yearStart
  }

  const prevPeriodStart = (): Date => {
    if (period === 'week')  { const d = new Date(weekStart);  d.setDate(d.getDate() - 7); return d }
    if (period === 'month') { const d = new Date(monthStart); d.setMonth(d.getMonth() - 1); return d }
    const d = new Date(yearStart); d.setFullYear(d.getFullYear() - 1); return d
  }

  const inPrevPeriod = (tx: Transaction) => {
    if (!tx.dateTs) return false
    const d   = tx.dateTs.toDate ? tx.dateTs.toDate() : new Date(tx.dateTs)
    const ps  = prevPeriodStart()
    if (period === 'week')  return d >= ps && d < weekStart
    if (period === 'month') return d >= ps && d < monthStart
    return d >= ps && d < yearStart
  }

  const periodCompleted    = completed.filter(inPeriod)
  const prevPeriodCompleted = completed.filter(inPrevPeriod)
  const periodEarnings     = periodCompleted.reduce((s, t) => s + t.amount, 0)
  const prevEarnings       = prevPeriodCompleted.reduce((s, t) => s + t.amount, 0)
  const changePct          = prevEarnings > 0
    ? Math.round(((periodEarnings - prevEarnings) / prevEarnings) * 100) : 0
  const isUp               = changePct >= 0

  const totalJobs     = completed.length
  const totalHours    = completed.reduce((s, t) => s + t.hours, 0)
  const ratings       = completed.filter(t => (t as any).rating).map(t => (t as any).rating as number)
  const avgRating     = ratings.length ? Math.round(ratings.reduce((a,b) => a+b, 0) / ratings.length * 10) / 10 : 0
  const avgJobValue   = totalJobs > 0 ? Math.round(completed.reduce((s,t) => s+t.amount, 0) / totalJobs) : 0
  const pendingAmt    = pending.reduce((s, t) => s + t.amount, 0)
  const payoutAvail   = Math.max(0, periodEarnings - pendingAmt)

  // Chart data
  const chartData = period === 'week' ? buildWeeklyChart(transactions) : buildMonthlyChart(transactions)
  const chartMax  = Math.max(...chartData.map(d => d.amount), 1)

  const periodLabel = period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'This Year'

  return (
    <>
      <style>{S}</style>
      <div className="we-page">

        <div className="we-topbar">
          <Link href="/worker/dashboard" className="tb-back"><ChevronLeft size={18} /></Link>
          <p className="tb-title">Earnings</p>
          <button className="tb-export"><Download size={14} /> Export</button>
        </div>

        <div className="we-body">

          {/* HERO */}
          <div className="earnings-hero">
            <div className="hero-glow" />
            <div className="hero-top">
              <div>
                <p className="hero-label">{periodLabel}</p>
                {dataLoading
                  ? <div className="skeleton" style={{ width: 180, height: 60, borderRadius: 12, background: 'rgba(255,255,255,0.08)' }} />
                  : <p className="hero-amount">{cur}<em>{periodEarnings.toLocaleString()}</em></p>
                }
                {!dataLoading && (
                  <div className="hero-trend">
                    {prevEarnings > 0 ? (
                      <span className={isUp ? 'trend-up' : 'trend-down'}>
                        {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {isUp ? '+' : ''}{changePct}%
                      </span>
                    ) : null}
                    vs last {period}
                  </div>
                )}
              </div>
              <div className="period-selector">
                {(['week','month','year'] as Period[]).map(p => (
                  <button key={p} className={`period-btn${period === p ? ' active' : ''}`} onClick={() => setPeriod(p)}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="chart-bars">
              {chartData.map((d, i) => (
                <div key={d.label} className="chart-bar-wrap">
                  <div
                    className="chart-bar"
                    style={{
                      height: `${Math.max(4, (d.amount / chartMax) * 100)}%`,
                      background: i === chartData.length - 1 ? '#FF5C1A' : 'rgba(255,255,255,0.12)',
                    }}
                    title={`${cur}${d.amount}`}
                  />
                  <span className="chart-label">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* STATS */}
          <div className="stats-grid">
            {[
              { icon: <CheckCircle size={18} color="#16A34A" />, bg: '#F0FDF4', val: dataLoading ? '—' : String(totalJobs),                           label: 'Jobs Completed', sub: `${periodCompleted.length} this ${period}` },
              { icon: <Clock size={18} color="#2563EB" />,        bg: '#EEF6FF', val: dataLoading ? '—' : `${Math.round(totalHours)}h`,                label: 'Hours Worked',   sub: `all time`              },
              { icon: <Star size={18} color="#F59E0B" />,          bg: '#FFF8EE', val: dataLoading ? '—' : avgRating > 0 ? String(avgRating) : 'N/A', label: 'Avg Rating',     sub: `${ratings.length} reviews` },
              { icon: <DollarSign size={18} color="#FF5C1A" />,   bg: '#FFF3EE', val: dataLoading ? '—' : `${cur}${avgJobValue}`,                     label: 'Avg Job Value',  sub: `all time`              },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon-wrap" style={{ background: s.bg }}>{s.icon}</div>
                <p className="stat-val">{s.val}</p>
                <p className="stat-label">{s.label}</p>
                <p className="stat-sub">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* PAYOUT */}
          <div className="payout-card">
            <div className="payout-icon"><Banknote size={26} color="#16A34A" /></div>
            <div>
              <p className="payout-label">Available for Payout</p>
              <p className="payout-amount">{cur}{dataLoading ? '—' : payoutAvail.toLocaleString()}</p>
              <p className="payout-note">
                {pendingAmt > 0 && `${cur}${pendingAmt} pending · `}Payouts processed every Friday
              </p>
            </div>
            <button className="payout-btn">
              <Banknote size={16} /> Request Payout
            </button>
          </div>

          {/* TRANSACTIONS */}
          <div>
            <div className="section-head">
              <p className="section-title">Transaction History</p>
            </div>
            {dataLoading ? (
              <div className="transactions-card">
                {[1,2,3].map(i => (
                  <div key={i} style={{ display: 'flex', gap: 14, padding: '16px 22px', borderBottom: '1px solid #F5F4F1', alignItems: 'center' }}>
                    <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div className="skeleton" style={{ height: 13, width: '55%' }} />
                      <div className="skeleton" style={{ height: 11, width: '40%' }} />
                    </div>
                    <div className="skeleton" style={{ height: 18, width: 50, borderRadius: 6 }} />
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div style={{ background: 'white', border: '1px solid #E8E6E1', borderRadius: 18, padding: '48px 24px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#0F0F0F', marginBottom: 6 }}>No transactions yet</p>
                <p style={{ fontSize: 13, color: '#6B6B6B', fontWeight: 300 }}>Completed jobs will appear here.</p>
              </div>
            ) : (
              <div className="transactions-card">
                {transactions.map(tx => (
                  <Link key={tx.id} href={`/worker/jobs/${tx.id}`} className="tx-row">
                    <div className="tx-avatar" style={{ background: tx.clientAvatarBg, color: tx.clientAvatarColor }}>
                      {tx.clientInitials}
                    </div>
                    <div className="tx-info">
                      <p className="tx-desc">{tx.description}</p>
                      <div className="tx-meta">
                        <span className="tx-meta-item"><Calendar size={10} />{tx.date}</span>
                        <span className="tx-meta-item"><Clock size={10} />{tx.hours}h</span>
                        <span className="tx-meta-item">{tx.clientName}</span>
                      </div>
                    </div>
                    <p className="tx-amount">{tx.currency}{tx.amount}</p>
                    <span
                      className="tx-status"
                      style={tx.status === 'completed'
                        ? { background: '#F0FDF4', color: '#16A34A' }
                        : tx.status === 'accepted'
                          ? { background: '#EEF6FF', color: '#2563EB' }
                          : { background: '#FFF8EE', color: '#D97706' }}
                    >
                      {tx.status === 'completed'
                        ? <><CheckCircle size={10} /> Paid</>
                        : tx.status === 'accepted'
                          ? <><Clock size={10} /> Active</>
                          : <><Clock size={10} /> Pending</>
                      }
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}