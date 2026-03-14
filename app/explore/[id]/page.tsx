'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Star, MapPin, Clock, Briefcase, ChevronLeft, MessageCircle, Calendar, Shield, Award, ThumbsUp } from 'lucide-react'

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
// In real app this would come from Firebase via params.id

const worker = {
  id: 'james-mitchell',
  initials: 'JM',
  name: 'James Mitchell',
  skill: 'Electrician',
  location: 'London, UK',
  rating: 4.9,
  jobs: 214,
  exp: '9 years',
  price: 45,
  currency: '£',
  available: true,
  responseTime: '< 1 hour',
  bio: `I'm a fully qualified electrician with 9 years of hands-on experience across residential, commercial and industrial projects in London and surrounding areas.

I specialise in full rewiring, consumer unit upgrades, EV charger installation, solar panel integration, and fault finding. All work is carried out to Part P building regulations and I provide an Electrical Installation Certificate upon completion.

I take pride in tidy, efficient work with zero disruption to your home or business. Weekend and evening appointments available.`,
  skills: ['Rewiring', 'Consumer Units', 'EV Chargers', 'Solar Panels', 'Fault Finding', 'CCTV', 'Lighting Design', 'Emergency Callouts'],
  avatarBg: '#FFF3EE',
  avatarColor: '#FF5C1A',
  reviewCount: 214,
  repeatClients: 68,
  completionRate: 99,
}

const reviews = [
  { initials: 'SL', name: 'Sophie L.', date: 'March 2025',   rating: 5, avatarBg: '#EEF6FF', avatarColor: '#2563EB', text: 'James was brilliant. Arrived on time, explained everything clearly and the work was immaculate. Will 100% use again.' },
  { initials: 'DK', name: 'David K.',  date: 'February 2025', rating: 5, avatarBg: '#F0FDF4', avatarColor: '#16A34A', text: 'Fixed our consumer unit issue in no time. Very professional and reasonably priced. Highly recommend.' },
  { initials: 'MR', name: 'Maria R.',  date: 'January 2025',  rating: 5, avatarBg: '#FFF8EE', avatarColor: '#D97706', text: 'Had James install EV charger and new lighting. Flawless job, very clean worker and extremely knowledgeable.' },
  { initials: 'PB', name: 'Paul B.',   date: 'January 2025',  rating: 4, avatarBg: '#F5F0FF', avatarColor: '#7C3AED', text: 'Great work on rewiring our kitchen. Slightly delayed but communicated well and end result is perfect.' },
]

// ─── STYLES ──────────────────────────────────────────────────────────────────

const S = `
  .profile-page { min-height: 100vh; background: #FAFAF8; padding-top: 68px; }

  /* BACK BAR */
  .back-bar {
    background: white; border-bottom: 1px solid #E8E6E1;
    padding: 14px 40px;
  }
  .back-link {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600;
    color: #6B6B6B; text-decoration: none; transition: color 0.2s;
  }
  .back-link:hover { color: #0F0F0F; }

  /* PROFILE HERO */
  .profile-hero {
    background: white; border-bottom: 1px solid #E8E6E1;
    padding: 40px 40px 0;
  }
  .profile-hero-inner {
    max-width: 1200px; margin: 0 auto;
    display: flex; gap: 32px; align-items: flex-start;
    padding-bottom: 32px;
  }
  .profile-avatar-wrap { position: relative; flex-shrink: 0; }
  .profile-avatar {
    width: 100px; height: 100px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 32px;
  }
  .profile-avail-badge {
    position: absolute; bottom: 4px; right: 4px;
    background: #22C55E; color: white;
    font-size: 10px; font-weight: 700;
    padding: 3px 7px; border-radius: 100px;
    border: 2px solid white;
    font-family: 'DM Sans', sans-serif;
  }
  .profile-info { flex: 1; min-width: 0; }
  .profile-skill-badge {
    display: inline-block; font-size: 12px; font-weight: 600;
    background: #FFF3EE; color: #FF5C1A;
    padding: 4px 12px; border-radius: 100px; margin-bottom: 10px;
  }
  .profile-name {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: clamp(24px, 4vw, 36px); letter-spacing: -1px;
    color: #0F0F0F; margin-bottom: 10px;
  }
  .profile-meta { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 16px; }
  .profile-meta-item {
    display: flex; align-items: center; gap: 6px;
    font-size: 14px; color: #6B6B6B;
  }
  .profile-rating-big {
    display: flex; align-items: center; gap: 6px;
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #0F0F0F;
  }
  .profile-stats { display: flex; gap: 24px; flex-wrap: wrap; }
  .pstat {
    background: #F5F4F1; border-radius: 12px; padding: 14px 20px;
    text-align: center; min-width: 80px;
  }
  .pstat-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: #0F0F0F; }
  .pstat-val em { color: #FF5C1A; font-style: normal; }
  .pstat-label { font-size: 12px; color: #6B6B6B; margin-top: 3px; }

  /* STICKY CTA */
  .profile-cta-wrap { flex-shrink: 0; display: flex; flex-direction: column; gap: 10px; min-width: 200px; }
  .cta-price {
    background: #F5F4F1; border-radius: 12px; padding: 14px 20px; text-align: center; margin-bottom: 4px;
  }
  .cta-price-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; color: #0F0F0F; }
  .cta-price-label { font-size: 12px; color: #6B6B6B; }
  .btn-book {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; background: #FF5C1A; color: white;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 15px;
    border: none; border-radius: 12px; padding: 14px;
    cursor: pointer; text-decoration: none; transition: background 0.2s;
  }
  .btn-book:hover { background: #FF7A40; }
  .btn-chat {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; background: transparent; color: #0F0F0F;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 15px;
    border: 1.5px solid #E8E6E1; border-radius: 12px; padding: 13px;
    cursor: pointer; text-decoration: none; transition: all 0.2s;
  }
  .btn-chat:hover { background: #F5F4F1; border-color: #0F0F0F; }

  /* TABS */
  .profile-tabs {
    background: white; border-bottom: 1px solid #E8E6E1;
    padding: 0 40px;
  }
  .profile-tabs-inner {
    max-width: 1200px; margin: 0 auto;
    display: flex; gap: 0;
  }
  .tab-btn {
    font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600;
    color: #6B6B6B; background: none; border: none;
    padding: 16px 20px; cursor: pointer; transition: color 0.2s;
    border-bottom: 2.5px solid transparent; margin-bottom: -1px;
  }
  .tab-btn:hover { color: #0F0F0F; }
  .tab-btn.active { color: #FF5C1A; border-bottom-color: #FF5C1A; }

  /* BODY */
  .profile-body { max-width: 1200px; margin: 0 auto; padding: 40px 40px; }

  /* ABOUT */
  .about-bio {
    font-size: 15px; color: #3D3D3D; line-height: 1.85; font-weight: 300;
    white-space: pre-line; margin-bottom: 32px;
  }
  .skills-wrap { margin-bottom: 32px; }
  .section-heading {
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px;
    color: #0F0F0F; margin-bottom: 14px;
  }
  .skills-pills { display: flex; flex-wrap: wrap; gap: 8px; }
  .skill-pill {
    font-size: 13px; font-weight: 500;
    background: #FFF3EE; color: #FF5C1A;
    border: 1px solid rgba(255,92,26,0.2);
    padding: 6px 14px; border-radius: 100px;
  }
  .trust-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
  .trust-card {
    background: white; border: 1px solid #E8E6E1;
    border-radius: 14px; padding: 20px;
    display: flex; align-items: flex-start; gap: 14px;
  }
  .trust-icon {
    width: 40px; height: 40px; border-radius: 10px; background: #FFF3EE;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .trust-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; margin-bottom: 3px; }
  .trust-sub { font-size: 12px; color: #6B6B6B; }

  /* REVIEWS */
  .rating-summary { display: flex; align-items: center; gap: 40px; background: white; border: 1px solid #E8E6E1; border-radius: 16px; padding: 28px; margin-bottom: 24px; flex-wrap: wrap; gap: 24px; }
  .rating-big { text-align: center; }
  .rating-big-num { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 56px; color: #0F0F0F; line-height: 1; }
  .rating-big-stars { display: flex; gap: 4px; justify-content: center; margin: 6px 0 4px; }
  .rating-big-count { font-size: 13px; color: #6B6B6B; }
  .rating-bars { flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 8px; }
  .rating-bar-row { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #6B6B6B; }
  .rating-bar-track { flex: 1; height: 6px; background: #F5F4F1; border-radius: 3px; overflow: hidden; }
  .rating-bar-fill { height: 100%; background: #FF5C1A; border-radius: 3px; }
  .reviews-list { display: flex; flex-direction: column; gap: 16px; }
  .review-card { background: white; border: 1px solid #E8E6E1; border-radius: 14px; padding: 22px; }
  .review-top { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
  .review-avatar {
    width: 40px; height: 40px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; flex-shrink: 0;
  }
  .review-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; }
  .review-date { font-size: 12px; color: #6B6B6B; }
  .review-stars { display: flex; gap: 2px; margin-left: auto; }
  .review-text { font-size: 14px; color: #3D3D3D; line-height: 1.7; font-weight: 300; }

  /* LOGIN PROMPT (for chat/book when not logged in) */
  .login-prompt-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
    z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px;
  }
  .login-prompt-modal {
    background: white; border-radius: 24px; padding: 40px;
    max-width: 400px; width: 100%; text-align: center;
    box-shadow: 0 24px 80px rgba(0,0,0,0.2);
  }
  .login-prompt-icon { font-size: 40px; margin-bottom: 16px; }
  .login-prompt-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: #0F0F0F; margin-bottom: 10px; }
  .login-prompt-sub { font-size: 15px; color: #6B6B6B; font-weight: 300; margin-bottom: 28px; }
  .login-prompt-btn {
    display: block; width: 100%; background: #FF5C1A; color: white;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 15px;
    border: none; border-radius: 12px; padding: 14px; margin-bottom: 10px;
    text-decoration: none; transition: background 0.2s; cursor: pointer;
  }
  .login-prompt-btn:hover { background: #FF7A40; }
  .login-prompt-cancel {
    background: none; border: none; color: #6B6B6B;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px;
    cursor: pointer; padding: 10px; width: 100%;
  }

  @media (max-width: 900px) {
    .back-bar { padding: 14px 20px; }
    .profile-hero { padding: 28px 20px 0; }
    .profile-hero-inner { flex-direction: column; }
    .profile-cta-wrap { width: 100%; flex-direction: row; }
    .cta-price { display: none; }
    .btn-book, .btn-chat { flex: 1; }
    .profile-tabs { padding: 0 20px; }
    .profile-body { padding: 28px 20px; }
    .rating-summary { flex-direction: column; }
  }
`

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function WorkerProfilePage() {
  const router = useRouter()
  const [activeTab, setActiveTab]       = useState<'about' | 'reviews'>('about')
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [loginAction, setLoginAction]   = useState<'book' | 'chat'>('book')

  // Simulate: not logged in
  const isLoggedIn = false

  const handleBook = () => {
    if (!isLoggedIn) { setLoginAction('book'); setShowLoginPrompt(true); return }
    router.push(`/booking/${worker.id}`)
  }

  const handleChat = () => {
    if (!isLoggedIn) { setLoginAction('chat'); setShowLoginPrompt(true); return }
    router.push(`/chat/${worker.id}`)
  }

  const ratingBars = [
    { stars: 5, pct: 88 },
    { stars: 4, pct: 8  },
    { stars: 3, pct: 3  },
    { stars: 2, pct: 1  },
    { stars: 1, pct: 0  },
  ]

  return (
    <>
      <style>{S}</style>
      <div className="profile-page">

        {/* Login prompt modal */}
        {showLoginPrompt && (
          <div className="login-prompt-overlay">
            <div className="login-prompt-modal">
              <div className="login-prompt-icon">🔐</div>
              <h2 className="login-prompt-title">Sign in to {loginAction === 'book' ? 'Book' : 'Chat'}</h2>
              <p className="login-prompt-sub">
                Create a free account or log in to {loginAction === 'book' ? 'book this worker' : 'send a message'}.
                It only takes a minute.
              </p>
              <Link href="/login" className="login-prompt-btn">Log In</Link>
              <Link href="/register" className="login-prompt-btn" style={{ background: '#0F0F0F', marginBottom: 10 }}>
                Create Account
              </Link>
              <button className="login-prompt-cancel" onClick={() => setShowLoginPrompt(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Back */}
        <div className="back-bar">
          <Link href="/explore" className="back-link">
            <ChevronLeft size={16} /> Back to Workers
          </Link>
        </div>

        {/* Hero */}
        <div className="profile-hero">
          <div className="profile-hero-inner">

            {/* Avatar */}
            <div className="profile-avatar-wrap">
              <div className="profile-avatar" style={{ background: worker.avatarBg, color: worker.avatarColor }}>
                {worker.initials}
              </div>
              {worker.available && <span className="profile-avail-badge">Available</span>}
            </div>

            {/* Info */}
            <div className="profile-info">
              <span className="profile-skill-badge">{worker.skill}</span>
              <h1 className="profile-name">{worker.name}</h1>

              <div className="profile-meta">
                <span className="profile-meta-item">
                  <MapPin size={14} color="#6B6B6B" /> {worker.location}
                </span>
                <span className="profile-meta-item">
                  <Briefcase size={14} color="#6B6B6B" /> {worker.exp} experience
                </span>
                <span className="profile-meta-item">
                  <Clock size={14} color="#6B6B6B" /> Responds {worker.responseTime}
                </span>
                <span className="profile-rating-big">
                  <Star size={18} color="#F59E0B" fill="#F59E0B" />
                  {worker.rating}
                  <span style={{ fontSize: 14, color: '#6B6B6B', fontWeight: 400 }}>({worker.reviewCount} reviews)</span>
                </span>
              </div>

              <div className="profile-stats">
                <div className="pstat">
                  <div className="pstat-val">{worker.jobs}<em>+</em></div>
                  <div className="pstat-label">Jobs Done</div>
                </div>
                <div className="pstat">
                  <div className="pstat-val">{worker.repeatClients}<em>%</em></div>
                  <div className="pstat-label">Repeat Clients</div>
                </div>
                <div className="pstat">
                  <div className="pstat-val">{worker.completionRate}<em>%</em></div>
                  <div className="pstat-label">Completion Rate</div>
                </div>
              </div>
            </div>

            {/* CTA Panel */}
            <div className="profile-cta-wrap">
              <div className="cta-price">
                <div className="cta-price-val">{worker.currency}{worker.price}<span style={{ fontSize: 14, fontWeight: 400, color: '#6B6B6B' }}>/hr</span></div>
                <div className="cta-price-label">Starting rate</div>
              </div>
              <button className="btn-book" onClick={handleBook}>
                <Calendar size={17} /> Book Now
              </button>
              <button className="btn-chat" onClick={handleChat}>
                <MessageCircle size={17} /> Send Message
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 0 }}>
              {(['about', 'reviews'] as const).map(tab => (
                <button
                  key={tab}
                  className={`tab-btn${activeTab === tab ? ' active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'about' ? 'About' : `Reviews (${worker.reviewCount})`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="profile-body">

          {/* ABOUT TAB */}
          {activeTab === 'about' && (
            <>
              <h2 className="section-heading">About {worker.name.split(' ')[0]}</h2>
              <p className="about-bio">{worker.bio}</p>

              <div className="skills-wrap">
                <h2 className="section-heading">Skills & Specialisms</h2>
                <div className="skills-pills">
                  {worker.skills.map(s => (
                    <span key={s} className="skill-pill">{s}</span>
                  ))}
                </div>
              </div>

              <h2 className="section-heading">Why Choose {worker.name.split(' ')[0]}?</h2>
              <div className="trust-grid">
                <div className="trust-card">
                  <div className="trust-icon"><Shield size={20} color="#FF5C1A" /></div>
                  <div>
                    <p className="trust-title">ID Verified</p>
                    <p className="trust-sub">Identity and qualifications checked by FixMate</p>
                  </div>
                </div>
                <div className="trust-card">
                  <div className="trust-icon"><Award size={20} color="#FF5C1A" /></div>
                  <div>
                    <p className="trust-title">Top Rated</p>
                    <p className="trust-sub">Consistently rated 4.9★ across 214 jobs</p>
                  </div>
                </div>
                <div className="trust-card">
                  <div className="trust-icon"><ThumbsUp size={20} color="#FF5C1A" /></div>
                  <div>
                    <p className="trust-title">68% Repeat Clients</p>
                    <p className="trust-sub">Most clients come back — a sign of real quality</p>
                  </div>
                </div>
                <div className="trust-card">
                  <div className="trust-icon"><Clock size={20} color="#FF5C1A" /></div>
                  <div>
                    <p className="trust-title">Fast Response</p>
                    <p className="trust-sub">Typically replies within 1 hour of booking</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* REVIEWS TAB */}
          {activeTab === 'reviews' && (
            <>
              <div className="rating-summary">
                <div className="rating-big">
                  <div className="rating-big-num">{worker.rating}</div>
                  <div className="rating-big-stars">
                    {[...Array(5)].map((_, i) => <Star key={i} size={18} color="#F59E0B" fill="#F59E0B" />)}
                  </div>
                  <div className="rating-big-count">{worker.reviewCount} reviews</div>
                </div>
                <div className="rating-bars">
                  {ratingBars.map(b => (
                    <div key={b.stars} className="rating-bar-row">
                      <span style={{ minWidth: 14, textAlign: 'right' }}>{b.stars}</span>
                      <Star size={12} color="#F59E0B" fill="#F59E0B" />
                      <div className="rating-bar-track">
                        <div className="rating-bar-fill" style={{ width: `${b.pct}%` }} />
                      </div>
                      <span style={{ minWidth: 28 }}>{b.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="reviews-list">
                {reviews.map(r => (
                  <div key={r.name} className="review-card">
                    <div className="review-top">
                      <div className="review-avatar" style={{ background: r.avatarBg, color: r.avatarColor }}>
                        {r.initials}
                      </div>
                      <div>
                        <p className="review-name">{r.name}</p>
                        <p className="review-date">{r.date}</p>
                      </div>
                      <div className="review-stars">
                        {[...Array(r.rating)].map((_, i) => <Star key={i} size={13} color="#F59E0B" fill="#F59E0B" />)}
                      </div>
                    </div>
                    <p className="review-text">{r.text}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}