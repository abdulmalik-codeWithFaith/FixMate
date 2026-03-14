'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft, TrendingUp, DollarSign, Calendar,
  CheckCircle, Download, ChevronRight, ArrowUpRight,
  ArrowDownRight, Banknote, Clock, Star
} from 'lucide-react'

type Period = 'week' | 'month' | 'year'

const monthlyData = [
  { month: 'Aug', amount: 1200 },
  { month: 'Sep', amount: 1800 },
  { month: 'Oct', amount: 1400 },
  { month: 'Nov', amount: 2200 },
  { month: 'Dec', amount: 1600 },
  { month: 'Jan', amount: 2400 },
  { month: 'Feb', amount: 2100 },
  { month: 'Mar', amount: 2840 },
]

const transactions = [
  { id: 't1', client: 'Sarah Adams',  initials: 'SA', avatarBg: '#EEF6FF', avatarColor: '#2563EB', desc: 'Consumer unit replacement',   date: 'Mar 12, 2025', amount: 90,  status: 'paid',    hours: 2   },
  { id: 't2', client: 'Emma Clarke',  initials: 'EC', avatarBg: '#FFF3EE', avatarColor: '#FF5C1A', desc: 'EV charger installation',      date: 'Mar 10, 2025', amount: 180, status: 'pending', hours: 4   },
  { id: 't3', client: 'James P.',     initials: 'JP', avatarBg: '#EEF6FF', avatarColor: '#2563EB', desc: 'Full house rewire',            date: 'Mar 8, 2025',  amount: 420, status: 'paid',    hours: 9.5 },
  { id: 't4', client: 'Anya K.',      initials: 'AK', avatarBg: '#F0FDF4', avatarColor: '#16A34A', desc: 'Consumer unit upgrade',        date: 'Mar 5, 2025',  amount: 90,  status: 'paid',    hours: 2   },
  { id: 't5', client: 'Mike D.',      initials: 'MD', avatarBg: '#F5F0FF', avatarColor: '#7C3AED', desc: 'CCTV system installation',     date: 'Mar 1, 2025',  amount: 200, status: 'paid',    hours: 4.5 },
  { id: 't6', client: 'Rachel B.',    initials: 'RB', avatarBg: '#FEF2F2', avatarColor: '#EF4444', desc: 'Outdoor security lighting',    date: 'Feb 24, 2025', amount: 110, status: 'paid',    hours: 2.5 },
  { id: 't7', client: 'Sophie M.',    initials: 'SM', avatarBg: '#F5F0FF', avatarColor: '#7C3AED', desc: 'Smart home setup',             date: 'Feb 15, 2025', amount: 240, status: 'paid',    hours: 5   },
]

const S = `
  .we-page { min-height: 100vh; background: #F5F4F1; }

  .we-topbar {
    background: white; border-bottom: 1px solid #E8E6E1;
    padding: 0 40px; height: 64px;
    display: flex; align-items: center; gap: 14px;
    position: sticky; top: 0; z-index: 40;
  }
  .tb-back { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; color: #6B6B6B; text-decoration: none; transition: all 0.2s; border: 1.5px solid #E8E6E1; flex-shrink: 0; }
  .tb-back:hover { border-color: #0F0F0F; color: #0F0F0F; }
  .tb-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; flex: 1; }
  .tb-export { display: flex; align-items: center; gap: 6px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #6B6B6B; background: none; border: 1.5px solid #E8E6E1; border-radius: 9px; padding: 7px 14px; cursor: pointer; transition: all 0.2s; }
  .tb-export:hover { border-color: #FF5C1A; color: #FF5C1A; }

  .we-body { max-width: 960px; margin: 0 auto; padding: 28px 40px; display: flex; flex-direction: column; gap: 20px; }

  /* HERO */
  .earnings-hero { background: #0F0F0F; border-radius: 22px; padding: 40px 48px; position: relative; overflow: hidden; }
  .hero-glow { position: absolute; top: -80px; right: -80px; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(255,92,26,0.18) 0%, transparent 70%); pointer-events: none; }
  .hero-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; flex-wrap: wrap; gap: 20px; }
  .hero-label { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; color: rgba(255,92,26,0.8); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px; position: relative; }
  .hero-amount { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(40px,6vw,60px); color: white; letter-spacing: -2px; line-height: 1; position: relative; }
  .hero-amount em { color: #FF5C1A; font-style: normal; }
  .hero-trend { display: flex; align-items: center; gap: 6px; margin-top: 10px; font-size: 14px; color: rgba(255,255,255,0.5); position: relative; }
  .trend-up { color: #22C55E; display: flex; align-items: center; gap: 3px; font-family: 'Syne', sans-serif; font-weight: 700; }

  /* PERIOD SELECTOR */
  .period-selector { display: flex; background: rgba(255,255,255,0.08); border-radius: 12px; padding: 4px; position: relative; flex-shrink: 0; }
  .period-btn { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.5); background: none; border: none; padding: 8px 18px; border-radius: 9px; cursor: pointer; transition: all 0.2s; }
  .period-btn.active { background: #FF5C1A; color: white; }

  /* CHART */
  .chart-wrap { position: relative; }
  .chart-bars { display: flex; align-items: flex-end; gap: 8px; height: 80px; }
  .chart-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .chart-bar { width: 100%; border-radius: 6px 6px 0 0; transition: all 0.3s; cursor: pointer; min-width: 20px; }
  .chart-bar:hover { opacity: 0.85; }
  .chart-month { font-family: 'Syne', sans-serif; font-size: 10px; color: rgba(255,255,255,0.35); font-weight: 600; }

  /* STATS GRID */
  .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
  .stat-card { background: white; border: 1px solid #E8E6E1; border-radius: 16px; padding: 20px; }
  .stat-icon-wrap { width: 40px; height: 40px; border-radius: 11px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
  .stat-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 26px; color: #0F0F0F; letter-spacing: -1px; }
  .stat-label { font-size: 12px; color: #6B6B6B; margin-top: 3px; }
  .stat-change { display: flex; align-items: center; gap: 4px; font-size: 12px; font-family: 'Syne', sans-serif; font-weight: 600; margin-top: 6px; }

  /* PAYOUT CARD */
  .payout-card { background: white; border: 1px solid #E8E6E1; border-radius: 18px; padding: 24px; display: flex; align-items: center; gap: 20px; }
  .payout-icon { width: 56px; height: 56px; border-radius: 16px; background: #F0FDF4; border: 1px solid rgba(22,163,74,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .payout-label { font-size: 13px; color: #6B6B6B; margin-bottom: 4px; }
  .payout-amount { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: #0F0F0F; letter-spacing: -1px; }
  .payout-note { font-size: 12px; color: #6B6B6B; margin-top: 4px; }
  .payout-btn { display: flex; align-items: center; gap: 8px; background: #0F0F0F; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; border: none; border-radius: 12px; padding: 12px 22px; cursor: pointer; transition: background 0.2s; margin-left: auto; white-space: nowrap; flex-shrink: 0; }
  .payout-btn:hover { background: #1A1A1A; }

  /* SECTION */
  .section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; color: #0F0F0F; }
  .section-link { display: flex; align-items: center; gap: 4px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #FF5C1A; text-decoration: none; transition: gap 0.2s; }
  .section-link:hover { gap: 7px; }

  /* TRANSACTIONS */
  .transactions-card { background: white; border: 1px solid #E8E6E1; border-radius: 18px; overflow: hidden; }
  .tx-row { display: flex; align-items: center; gap: 14px; padding: 16px 22px; border-bottom: 1px solid #F5F4F1; transition: background 0.15s; text-decoration: none; color: inherit; }
  .tx-row:last-child { border-bottom: none; }
  .tx-row:hover { background: #FAFAF8; }
  .tx-avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; flex-shrink: 0; }
  .tx-info { flex: 1; min-width: 0; }
  .tx-desc { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; color: #0F0F0F; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tx-meta { display: flex; align-items: center; gap: 10px; font-size: 12px; color: #6B6B6B; }
  .tx-meta-item { display: flex; align-items: center; gap: 3px; }
  .tx-amount { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #0F0F0F; flex-shrink: 0; }
  .tx-status { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 100px; font-family: 'Syne', sans-serif; margin-left: 8px; flex-shrink: 0; }

  @media (max-width: 768px) {
    .we-topbar { padding: 0 16px; }
    .we-body { padding: 20px 16px; }
    .stats-grid { grid-template-columns: repeat(2,1fr); }
    .earnings-hero { padding: 28px 22px; }
    .payout-card { flex-wrap: wrap; }
    .payout-btn { width: 100%; justify-content: center; }
  }
`

export default function WorkerEarningsPage() {
  const [period, setPeriod] = useState<Period>('month')

  const maxAmount  = Math.max(...monthlyData.map(d => d.amount))
  const thisMonth  = monthlyData[monthlyData.length - 1].amount
  const lastMonth  = monthlyData[monthlyData.length - 2].amount
  const changesPct = Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
  const totalPaid  = transactions.filter(t => t.status === 'paid').reduce((s, t) => s + t.amount, 0)
  const pendingAmt = transactions.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0)

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

          {/* Hero */}
          <div className="earnings-hero">
            <div className="hero-glow" />
            <div className="hero-top">
              <div>
                <p className="hero-label">
                  {period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'This Year'}
                </p>
                <p className="hero-amount">
                  £{period === 'week' ? '840' : period === 'month' ? '2,840' : '24,200'}
                </p>
                <div className="hero-trend">
                  <span className="trend-up">
                    <ArrowUpRight size={14} /> +{changesPct}%
                  </span>
                  vs last {period}
                </div>
              </div>
              <div className="period-selector">
                {(['week','month','year'] as Period[]).map(p => (
                  <button key={p} className={`period-btn${period === p ? ' active' : ''}`} onClick={() => setPeriod(p)}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Mini bar chart */}
            <div className="chart-wrap">
              <div className="chart-bars">
                {monthlyData.map((d, i) => (
                  <div key={d.month} className="chart-bar-wrap">
                    <div
                      className="chart-bar"
                      style={{
                        height: `${(d.amount / maxAmount) * 100}%`,
                        background: i === monthlyData.length - 1 ? '#FF5C1A' : 'rgba(255,255,255,0.12)',
                      }}
                      title={`£${d.amount}`}
                    />
                    <span className="chart-month">{d.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            {[
              { icon: <CheckCircle size={18} color="#16A34A" />, bg: '#F0FDF4', val: '14',    label: 'Jobs Completed', change: '+3', up: true  },
              { icon: <Clock size={18} color="#2563EB" />,        bg: '#EEF6FF', val: '62h',   label: 'Hours Worked',  change: '+8h', up: true  },
              { icon: <Star size={18} color="#F59E0B" />,          bg: '#FFF8EE', val: '4.9',   label: 'Avg Rating',    change: '+0.1', up: true },
              { icon: <DollarSign size={18} color="#FF5C1A" />,   bg: '#FFF3EE', val: '£45',   label: 'Avg Job Value', change: '+£5', up: true  },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon-wrap" style={{ background: s.bg }}>{s.icon}</div>
                <p className="stat-val">{s.val}</p>
                <p className="stat-label">{s.label}</p>
                <div className="stat-change" style={{ color: s.up ? '#16A34A' : '#EF4444' }}>
                  {s.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {s.change} this month
                </div>
              </div>
            ))}
          </div>

          {/* Payout */}
          <div className="payout-card">
            <div className="payout-icon"><Banknote size={26} color="#16A34A" /></div>
            <div>
              <p className="payout-label">Available for Payout</p>
              <p className="payout-amount">£{totalPaid - 180}</p>
              <p className="payout-note">
                {pendingAmt > 0 && `£${pendingAmt} pending · `}Payouts processed every Friday
              </p>
            </div>
            <button className="payout-btn">
              <Banknote size={16} /> Request Payout
            </button>
          </div>

          {/* Transactions */}
          <div>
            <div className="section-head">
              <p className="section-title">Transaction History</p>
              <button className="section-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, color: '#FF5C1A', display: 'flex', alignItems: 'center', gap: 4 }}>
                Download <Download size={14} />
              </button>
            </div>
            <div className="transactions-card">
              {transactions.map(tx => (
                <Link key={tx.id} href={`/orders/${tx.id}`} className="tx-row">
                  <div className="tx-avatar" style={{ background: tx.avatarBg, color: tx.avatarColor }}>{tx.initials}</div>
                  <div className="tx-info">
                    <p className="tx-desc">{tx.desc}</p>
                    <div className="tx-meta">
                      <span className="tx-meta-item"><Calendar size={10} />{tx.date}</span>
                      <span className="tx-meta-item"><Clock size={10} />{tx.hours}h</span>
                      <span className="tx-meta-item">{tx.client}</span>
                    </div>
                  </div>
                  <p className="tx-amount">£{tx.amount}</p>
                  <span
                    className="tx-status"
                    style={tx.status === 'paid'
                      ? { background: '#F0FDF4', color: '#16A34A' }
                      : { background: '#FFF8EE', color: '#D97706' }}
                  >
                    {tx.status === 'paid' ? <CheckCircle size={10} /> : <Clock size={10} />}
                    {tx.status === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}