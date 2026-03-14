'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft, ChevronRight, Search, Calendar,
  MapPin, Clock, CheckCircle, XCircle, MessageCircle,
  Star, Filter, DollarSign, Briefcase, TrendingUp,
  AlertCircle, RotateCcw, Eye
} from 'lucide-react'

type Tab = 'all' | 'new' | 'active' | 'completed' | 'declined'

const allJobs = [
  { id: 'j1',  client: 'Sarah Adams',    initials: 'SA', avatarBg: '#EEF6FF', avatarColor: '#2563EB', desc: 'Consumer unit replacement and full house rewire safety check.',          location: '12 Baker St, London',   date: 'Tomorrow, 2:00 PM',   budget: '£90',   status: 'active',    rating: null  },
  { id: 'j2',  client: 'Tom Richards',   initials: 'TR', avatarBg: '#F0FDF4', avatarColor: '#16A34A', desc: 'Install 3 double sockets in garage and run dedicated circuit.',           location: '44 Regent Park, London',date: 'Mar 18, 10:00 AM',    budget: '£120',  status: 'new',       rating: null  },
  { id: 'j3',  client: 'Lisa Wang',      initials: 'LW', avatarBg: '#FFF8EE', avatarColor: '#D97706', desc: 'LED downlights installation in kitchen and living room. 12 units.',       location: '9 Marble Arch, London', date: 'Mar 20, 9:00 AM',     budget: '£150',  status: 'new',       rating: null  },
  { id: 'j4',  client: 'Emma Clarke',    initials: 'EC', avatarBg: '#FFF3EE', avatarColor: '#FF5C1A', desc: 'EV charger installation — 7kW wallbox, driveway run.',                   location: 'Fulham, London',        date: 'Today, 11:00 AM',     budget: '£180',  status: 'active',    rating: null  },
  { id: 'j5',  client: 'James P.',       initials: 'JP', avatarBg: '#EEF6FF', avatarColor: '#2563EB', desc: 'Full house rewire — 3-bed semi. Includes new consumer unit.',            location: 'Brixton, London',       date: 'Mar 10',              budget: '£420',  status: 'completed', rating: 5     },
  { id: 'j6',  client: 'Anya K.',        initials: 'AK', avatarBg: '#F0FDF4', avatarColor: '#16A34A', desc: 'Consumer unit upgrade from fuses to RCBO protection.',                   location: 'Hackney, London',       date: 'Mar 6',               budget: '£90',   status: 'completed', rating: 5     },
  { id: 'j7',  client: 'Mike D.',        initials: 'MD', avatarBg: '#F5F0FF', avatarColor: '#7C3AED', desc: 'CCTV system installation — 4 cameras, NVR and remote access setup.',     location: 'Canary Wharf, London',  date: 'Mar 1',               budget: '£200',  status: 'completed', rating: 4.5  },
  { id: 'j8',  client: 'Rachel B.',      initials: 'RB', avatarBg: '#FEF2F2', avatarColor: '#EF4444', desc: 'Outdoor security lighting installation — 5 PIR units.',                  location: 'Islington, London',     date: 'Feb 24',              budget: '£110',  status: 'completed', rating: 5     },
  { id: 'j9',  client: 'Oliver H.',      initials: 'OH', avatarBg: '#FFF8EE', avatarColor: '#D97706', desc: 'Replace bathroom extractor fan and fit new timer switch.',               location: 'Clapham, London',       date: 'Feb 20',              budget: '£65',   status: 'declined',  rating: null  },
  { id: 'j10', client: 'Sophie M.',      initials: 'SM', avatarBg: '#F5F0FF', avatarColor: '#7C3AED', desc: 'Smart home setup — Hue lights, smart plugs and hub configuration.',      location: 'Chelsea, London',       date: 'Feb 15',              budget: '£240',  status: 'completed', rating: 5     },
]

const statusConfig: Record<string, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  new:       { label: 'New Request', bg: '#FFF3EE', color: '#FF5C1A', icon: <AlertCircle size={11} />  },
  active:    { label: 'Active',      bg: '#EEF6FF', color: '#2563EB', icon: <Clock size={11} />         },
  completed: { label: 'Completed',   bg: '#F0FDF4', color: '#16A34A', icon: <CheckCircle size={11} />  },
  declined:  { label: 'Declined',    bg: '#F5F4F1', color: '#6B6B6B', icon: <XCircle size={11} />      },
}

const tabs: { key: Tab; label: string }[] = [
  { key: 'all',       label: 'All Jobs'  },
  { key: 'new',       label: 'New'       },
  { key: 'active',    label: 'Active'    },
  { key: 'completed', label: 'Completed' },
  { key: 'declined',  label: 'Declined'  },
]

const S = `
  .wj-page { min-height: 100vh; background: #F5F4F1; }

  .wj-topbar {
    background: white; border-bottom: 1px solid #E8E6E1;
    padding: 0 40px; height: 64px;
    display: flex; align-items: center; gap: 14px;
    position: sticky; top: 0; z-index: 40;
  }
  .tb-back { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; color: #6B6B6B; text-decoration: none; transition: all 0.2s; border: 1.5px solid #E8E6E1; flex-shrink: 0; }
  .tb-back:hover { border-color: #0F0F0F; color: #0F0F0F; }
  .tb-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; flex: 1; }

  .wj-header { background: white; border-bottom: 1px solid #E8E6E1; padding: 24px 40px 0; }
  .wj-header-inner { max-width: 960px; margin: 0 auto; }
  .wj-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; letter-spacing: -1px; color: #0F0F0F; margin-bottom: 4px; }
  .wj-sub { font-size: 14px; color: #6B6B6B; font-weight: 300; margin-bottom: 20px; }

  /* SUMMARY STRIP */
  .summary-strip { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
  .summary-pill { display: flex; align-items: center; gap: 7px; background: #F5F4F1; border: 1px solid #E8E6E1; border-radius: 100px; padding: 8px 16px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #0F0F0F; }
  .summary-pill em { font-style: normal; color: #FF5C1A; }

  /* SEARCH + FILTER */
  .search-filter-row { display: flex; gap: 10px; margin-bottom: 20px; }
  .search-field { flex: 1; display: flex; align-items: center; gap: 10px; background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 12px; padding: 11px 16px; transition: border-color 0.2s; }
  .search-field:focus-within { border-color: #FF5C1A; background: white; }
  .search-field input { flex: 1; border: none; outline: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F; }
  .search-field input::placeholder { color: #AFAFAF; }
  .filter-btn { display: flex; align-items: center; gap: 7px; background: white; border: 1.5px solid #E8E6E1; border-radius: 12px; padding: 11px 18px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #6B6B6B; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
  .filter-btn:hover { border-color: #FF5C1A; color: #FF5C1A; }
  .filter-btn.active { background: #FF5C1A; border-color: #FF5C1A; color: white; }

  /* TABS */
  .wj-tabs { display: flex; overflow-x: auto; scrollbar-width: none; }
  .wj-tabs::-webkit-scrollbar { display: none; }
  .wj-tab { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; color: #6B6B6B; background: none; border: none; padding: 14px 20px; cursor: pointer; transition: color 0.2s; border-bottom: 2.5px solid transparent; margin-bottom: -1px; white-space: nowrap; display: flex; align-items: center; gap: 6px; }
  .wj-tab:hover { color: #0F0F0F; }
  .wj-tab.active { color: #FF5C1A; border-bottom-color: #FF5C1A; }
  .tab-cnt { background: #F5F4F1; color: #6B6B6B; font-size: 11px; padding: 2px 7px; border-radius: 100px; transition: all 0.2s; }
  .wj-tab.active .tab-cnt { background: #FF5C1A; color: white; }

  /* BODY */
  .wj-body { max-width: 960px; margin: 0 auto; padding: 28px 40px; display: flex; flex-direction: column; gap: 14px; }

  /* JOB CARD */
  .job-card { background: white; border: 1px solid #E8E6E1; border-radius: 18px; overflow: hidden; transition: all 0.2s; }
  .job-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07); }
  .job-card.new-card { border-left: 3px solid #FF5C1A; }
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
  .jf-orange  { background: #FF5C1A; color: white; }
  .jf-orange:hover  { background: #FF7A40; }
  .jf-dark    { background: #0F0F0F; color: white; }
  .jf-dark:hover    { background: #1A1A1A; }
  .jf-outline { background: transparent; color: #6B6B6B; border: 1.5px solid #E8E6E1; }
  .jf-outline:hover { background: #F5F4F1; color: #0F0F0F; border-color: #0F0F0F; }
  .jf-danger  { background: transparent; color: #EF4444; border: 1.5px solid rgba(239,68,68,0.25); }
  .jf-danger:hover  { background: #FEF2F2; border-color: #EF4444; }

  /* EMPTY */
  .wj-empty { text-align: center; padding: 80px 20px; background: white; border: 1px solid #E8E6E1; border-radius: 18px; }
  .wj-empty-icon { width: 72px; height: 72px; border-radius: 20px; background: #F5F4F1; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
  .wj-empty-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 20px; color: #0F0F0F; margin-bottom: 8px; }
  .wj-empty-sub { font-size: 15px; color: #6B6B6B; }

  @media (max-width: 768px) {
    .wj-topbar, .wj-header { padding-left: 16px; padding-right: 16px; }
    .wj-body { padding: 20px 16px; }
    .summary-strip { display: none; }
    .job-main { flex-wrap: wrap; }
    .job-right { flex-direction: row; width: 100%; justify-content: space-between; align-items: center; }
  }
`

export default function WorkerJobsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [search, setSearch]       = useState('')
  const [jobs, setJobs]           = useState(allJobs)

  const accept  = (id: string) => setJobs(p => p.map(j => j.id === id ? { ...j, status: 'active' } : j))
  const decline = (id: string) => setJobs(p => p.map(j => j.id === id ? { ...j, status: 'declined' } : j))
  const complete= (id: string) => setJobs(p => p.map(j => j.id === id ? { ...j, status: 'completed', rating: 5 } : j))

  const filtered = jobs.filter(j => {
    const matchTab = activeTab === 'all' || j.status === activeTab
    const matchSearch = !search || j.client.toLowerCase().includes(search.toLowerCase()) || j.desc.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const countFor = (tab: Tab) => tab === 'all' ? jobs.length : jobs.filter(j => j.status === tab).length

  const totalEarned  = jobs.filter(j => j.status === 'completed').reduce((s, j) => s + parseInt(j.budget.replace(/[^0-9]/g, '')), 0)
  const completedCount = jobs.filter(j => j.status === 'completed').length
  const activeCount    = jobs.filter(j => j.status === 'active').length
  const newCount       = jobs.filter(j => j.status === 'new').length

  return (
    <>
      <style>{S}</style>
      <div className="wj-page">

        <div className="wj-topbar">
          <Link href="/worker/dashboard" className="tb-back"><ChevronLeft size={18} /></Link>
          <p className="tb-title">Job History</p>
        </div>

        <div className="wj-header">
          <div className="wj-header-inner">
            <h1 className="wj-title">All Jobs</h1>
            <p className="wj-sub">Manage requests, active work and completed jobs</p>

            <div className="summary-strip">
              <div className="summary-pill"><AlertCircle size={14} color="#FF5C1A" /><em>{newCount}</em> new requests</div>
              <div className="summary-pill"><Clock size={14} color="#2563EB" /><em>{activeCount}</em> active</div>
              <div className="summary-pill"><CheckCircle size={14} color="#16A34A" /><em>{completedCount}</em> completed</div>
              <div className="summary-pill"><DollarSign size={14} color="#D97706" />£<em>{totalEarned.toLocaleString()}</em> earned</div>
            </div>

            <div className="search-filter-row">
              <div className="search-field">
                <Search size={16} color="#AFAFAF" />
                <input type="text" placeholder="Search by client or job description…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <button className="filter-btn"><Filter size={15} /> Filter</button>
            </div>

            <div className="wj-tabs">
              {tabs.map(t => (
                <button key={t.key} className={`wj-tab${activeTab === t.key ? ' active' : ''}`} onClick={() => setActiveTab(t.key)}>
                  {t.label}
                  <span className="tab-cnt">{countFor(t.key)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="wj-body">
          {filtered.length === 0 ? (
            <div className="wj-empty">
              <div className="wj-empty-icon"><Briefcase size={28} color="#AFAFAF" /></div>
              <p className="wj-empty-title">No jobs found</p>
              <p className="wj-empty-sub">{search ? 'Try a different search term.' : `No ${activeTab} jobs yet.`}</p>
            </div>
          ) : (
            filtered.map(job => {
              const st = statusConfig[job.status]
              return (
                <div key={job.id} className={`job-card${job.status === 'new' ? ' new-card' : job.status === 'active' ? ' active-card' : ''}`}>
                  <div className="job-main">
                    <div className="job-avatar" style={{ background: job.avatarBg, color: job.avatarColor }}>{job.initials}</div>
                    <div className="job-info">
                      <div className="job-top-row">
                        <p className="job-client">{job.client}</p>
                        <span className="job-status" style={{ background: st.bg, color: st.color }}>{st.icon}{st.label}</span>
                        {job.rating && (
                          <div className="job-rating" style={{ marginLeft: 'auto' }}>
                            <Star size={13} color="#F59E0B" fill="#F59E0B" />{job.rating}
                          </div>
                        )}
                      </div>
                      <p className="job-desc">{job.desc}</p>
                      <div className="job-meta">
                        <span className="job-meta-item"><MapPin size={11} />{job.location}</span>
                        <span className="job-meta-item"><Calendar size={11} />{job.date}</span>
                      </div>
                    </div>
                    <div className="job-right">
                      <p className="job-budget">{job.budget}</p>
                    </div>
                  </div>

                  <div className="job-footer">
                    {job.status === 'new' && (
                      <>
                        <button className="jf-btn jf-orange" onClick={() => accept(job.id)}><CheckCircle size={14} />Accept</button>
                        <Link href={`/chat/${job.id}`} className="jf-btn jf-outline"><MessageCircle size={14} />Chat</Link>
                        <button className="jf-btn jf-danger" onClick={() => decline(job.id)}><XCircle size={14} />Decline</button>
                      </>
                    )}
                    {job.status === 'active' && (
                      <>
                        <button className="jf-btn jf-dark" onClick={() => complete(job.id)}><CheckCircle size={14} />Mark Complete</button>
                        <Link href={`/chat/${job.id}`} className="jf-btn jf-outline"><MessageCircle size={14} />Chat</Link>
                        <Link href={`/orders/${job.id}`} className="jf-btn jf-outline"><Eye size={14} />View Details</Link>
                      </>
                    )}
                    {job.status === 'completed' && (
                      <>
                        <Link href={`/orders/${job.id}`} className="jf-btn jf-outline"><Eye size={14} />View Details</Link>
                        <Link href={`/chat/${job.id}`} className="jf-btn jf-outline"><MessageCircle size={14} />Message</Link>
                        <Link href={`/booking/${job.id}`} className="jf-btn jf-outline"><RotateCcw size={14} />Similar Job</Link>
                      </>
                    )}
                    {job.status === 'declined' && (
                      <button className="jf-btn jf-outline" onClick={() => accept(job.id)}><RotateCcw size={14} />Reconsider</button>
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