'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Star, MapPin, Briefcase, ChevronLeft, MessageCircle, Calendar, Shield, Award, ThumbsUp } from 'lucide-react'

// FIREBASE IMPORTS
import { db, auth } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

const S = `
  .profile-page { min-height: 100vh; background: #FAFAF8; padding-top: 20px; }
  .back-bar { background: white; border-bottom: 1px solid #E8E6E1; padding: 14px 40px; }
  .back-link { display: inline-flex; align-items: center; gap: 6px; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; color: #6B6B6B; text-decoration: none; transition: color 0.2s; cursor: pointer; }
  .back-link:hover { color: #0F0F0F; }
  .profile-hero { background: white; border-bottom: 1px solid #E8E6E1; padding: 40px 40px 0; }
  .profile-hero-inner { max-width: 1200px; margin: 0 auto; display: flex; gap: 32px; align-items: flex-start; padding-bottom: 32px; }
  .profile-avatar-wrap { position: relative; flex-shrink: 0; }
  .profile-avatar { width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 32px; }
  .profile-avail-badge { position: absolute; bottom: 4px; right: 4px; background: #22C55E; color: white; font-size: 10px; font-weight: 700; padding: 3px 7px; border-radius: 100px; border: 2px solid white; }
  .profile-info { flex: 1; min-width: 0; }
  .profile-skill-badge { display: inline-block; font-size: 12px; font-weight: 600; background: #FFF3EE; color: #FF5C1A; padding: 4px 12px; border-radius: 100px; margin-bottom: 10px; }
  .profile-name { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(24px, 4vw, 36px); letter-spacing: -1px; color: #0F0F0F; margin-bottom: 10px; }
  .profile-meta { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 16px; }
  .profile-meta-item { display: flex; align-items: center; gap: 6px; font-size: 14px; color: #6B6B6B; }
  .profile-rating-big { display: flex; align-items: center; gap: 6px; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #0F0F0F; }
  .profile-stats { display: flex; gap: 24px; flex-wrap: wrap; }
  .pstat { background: #F5F4F1; border-radius: 12px; padding: 14px 20px; text-align: center; min-width: 80px; }
  .pstat-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: #0F0F0F; }
  .pstat-val em { color: #FF5C1A; font-style: normal; }
  .pstat-label { font-size: 12px; color: #6B6B6B; margin-top: 3px; }
  .profile-cta-wrap { flex-shrink: 0; display: flex; flex-direction: column; gap: 10px; min-width: 200px; }
  .cta-price { background: #F5F4F1; border-radius: 12px; padding: 14px 20px; text-align: center; margin-bottom: 4px; }
  .cta-price-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; color: #0F0F0F; }
  .cta-price-label { font-size: 12px; color: #6B6B6B; }
  .btn-book { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: #FF5C1A; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 15px; border: none; border-radius: 12px; padding: 14px; cursor: pointer; text-decoration: none; transition: background 0.2s; }
  .btn-book:hover { background: #FF7A40; }
  .btn-chat { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: transparent; color: #0F0F0F; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 15px; border: 1.5px solid #E8E6E1; border-radius: 12px; padding: 13px; cursor: pointer; text-decoration: none; transition: all 0.2s; }
  .btn-chat:hover { background: #F5F4F1; border-color: #0F0F0F; }
  .tab-btn { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; color: #6B6B6B; background: none; border: none; padding: 16px 20px; cursor: pointer; transition: color 0.2s; border-bottom: 2.5px solid transparent; margin-bottom: -1px; }
  .tab-btn.active { color: #FF5C1A; border-bottom-color: #FF5C1A; }
  .profile-body { max-width: 1200px; margin: 0 auto; padding: 40px; }
  .about-bio { font-size: 15px; color: #3D3D3D; line-height: 1.85; font-weight: 300; white-space: pre-line; margin-bottom: 32px; }
  .skills-pills { display: flex; flex-wrap: wrap; gap: 8px; }
  .skill-pill { font-size: 13px; font-weight: 500; background: #FFF3EE; color: #FF5C1A; border: 1px solid rgba(255,92,26,0.2); padding: 6px 14px; border-radius: 100px; }
  .trust-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; margin-top: 32px; }
  .trust-card { background: white; border: 1px solid #E8E6E1; border-radius: 14px; padding: 20px; display: flex; align-items: flex-start; gap: 14px; }
  .trust-icon { width: 40px; height: 40px; border-radius: 10px; background: #FFF3EE; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .trust-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; margin-bottom: 3px; }
  .trust-sub { font-size: 12px; color: #6B6B6B; }

  /* LOGIN PROMPT MODAL */
  .prompt-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.55);
    z-index: 300;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    backdrop-filter: blur(4px);
  }
  .prompt-modal {
    background: white; border-radius: 24px;
    padding: 44px 40px; max-width: 420px; width: 100%;
    text-align: center;
    box-shadow: 0 24px 80px rgba(0,0,0,0.2);
    animation: popIn 0.35s cubic-bezier(0.175,0.885,0.32,1.275);
  }
  @keyframes popIn {
    from { transform: scale(0.85); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
  }
  .prompt-icon {
    width: 72px; height: 72px; border-radius: 50%;
    background: #FFF3EE; border: 2px solid rgba(255,92,26,0.2);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 20px;
  }
  .prompt-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: #0F0F0F; margin-bottom: 10px; }
  .prompt-sub { font-size: 14px; color: #6B6B6B; line-height: 1.65; font-weight: 300; margin-bottom: 28px; }
  .prompt-btn-primary {
    display: block; width: 100%;
    background: #FF5C1A; color: white;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 15px;
    border: none; border-radius: 12px; padding: 14px;
    margin-bottom: 10px; text-decoration: none; text-align: center;
    cursor: pointer; transition: background 0.2s;
  }
  .prompt-btn-primary:hover { background: #FF7A40; }
  .prompt-btn-secondary {
    display: block; width: 100%;
    background: #0F0F0F; color: white;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 15px;
    border: none; border-radius: 12px; padding: 14px;
    margin-bottom: 12px; text-decoration: none; text-align: center;
    cursor: pointer; transition: background 0.2s;
  }
  .prompt-btn-secondary:hover { background: #1A1A1A; }
  .prompt-cancel {
    background: none; border: none; color: #6B6B6B;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px;
    cursor: pointer; padding: 8px; width: 100%;
    transition: color 0.2s;
  }
  .prompt-cancel:hover { color: #0F0F0F; }

  /* LOADING */
  .loading-screen {
    height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 16px;
    background: #FAFAF8;
  }
  .loading-spinner {
    width: 40px; height: 40px; border-radius: 50%;
    border: 3px solid #E8E6E1;
    border-top-color: #FF5C1A;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-text { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #6B6B6B; }

  @media (max-width: 900px) {
    .profile-hero-inner { flex-direction: column; }
    .profile-cta-wrap { width: 100%; flex-direction: row; }
    .cta-price { display: none; }
    .back-bar { padding: 14px 20px; }
    .profile-hero { padding: 28px 20px 0; }
    .profile-body { padding: 28px 20px; }
  }
`

export default function WorkerProfilePage() {
  const router  = useRouter()
  const params  = useParams()
  const workerId = params.id as string

  const [worker, setWorker]               = useState<any>(null)
  const [loading, setLoading]             = useState(true)
  const [authLoading, setAuthLoading]     = useState(true)   // ← wait for Firebase auth to resolve
  const [isLoggedIn, setIsLoggedIn]       = useState(false)
  const [activeTab, setActiveTab]         = useState<'about' | 'reviews'>('about')
  const [showPrompt, setShowPrompt]       = useState(false)
  const [pendingAction, setPendingAction] = useState<'book' | 'chat' | null>(null)

  // ── 1. RESOLVE AUTH STATE ──────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user)
      setAuthLoading(false)   // auth is now known
    })
    return () => unsub()
  }, [])

  // ── 2. FETCH WORKER FROM FIRESTORE ─────────────────────────────────────────
  useEffect(() => {
    if (!workerId) return
    const fetchWorker = async () => {
      try {
        const snap = await getDoc(doc(db, 'workers', workerId))
        if (snap.exists()) {
          setWorker({ id: snap.id, ...snap.data() })
        }
      } catch (err) {
        console.error('Error fetching worker:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchWorker()
  }, [workerId])

  // ── 3. HANDLE BOOK / CHAT CLICK ────────────────────────────────────────────
  // Key fix: if not logged in → save the intended action, show prompt.
  // If logged in → navigate directly without showing prompt at all.
  const handleAction = (action: 'book' | 'chat') => {
    if (!isLoggedIn) {
      setPendingAction(action)   // remember where to go after login
      setShowPrompt(true)
      return
    }
    // Already logged in — go straight there
    navigateToAction(action)
  }

  const navigateToAction = (action: 'book' | 'chat') => {
    if (action === 'book') router.push(`/booking/${workerId}`)
    if (action === 'chat') router.push(`/chat/${workerId}`)
  }

  // Called when user taps "Log In" inside the modal.
  // We store the intended destination in sessionStorage so the login page
  // can redirect back after a successful sign-in.
  const goToLogin = () => {
    if (pendingAction) {
      const redirect = pendingAction === 'book'
        ? `/booking/${workerId}`
        : `/chat/${workerId}`
      // Store redirect so login page can use router.push(redirect) after auth
      sessionStorage.setItem('authRedirect', redirect)
    }
    router.push('/login')
  }

  const goToRegister = () => {
    if (pendingAction) {
      const redirect = pendingAction === 'book'
        ? `/booking/${workerId}`
        : `/chat/${workerId}`
      sessionStorage.setItem('authRedirect', redirect)
    }
    router.push('/register')
  }

  // ── RENDER STATES ──────────────────────────────────────────────────────────
  if (loading || authLoading) {
    return (
      <div className="loading-screen">
        <style>{S}</style>
        <div className="loading-spinner" />
        <p className="loading-text">Loading profile…</p>
      </div>
    )
  }

  if (!worker) {
    return (
      <div className="loading-screen">
        <style>{S}</style>
        <p className="loading-text">Worker not found.</p>
        <Link href="/explore" style={{ color: '#FF5C1A', fontFamily: 'Syne', fontWeight: 700, textDecoration: 'none' }}>
          ← Back to Workers
        </Link>
      </div>
    )
  }

  return (
    <>
      <style>{S}</style>
      <div className="profile-page">

        {/* ── LOGIN PROMPT MODAL ── */}
        {showPrompt && (
          <div className="prompt-overlay" onClick={() => setShowPrompt(false)}>
            <div className="prompt-modal" onClick={e => e.stopPropagation()}>
              <div className="prompt-icon">
                {pendingAction === 'book'
                  ? <Calendar size={30} color="#FF5C1A" />
                  : <MessageCircle size={30} color="#FF5C1A" />
                }
              </div>
              <h2 className="prompt-title">
                {pendingAction === 'book' ? 'Sign in to Book' : 'Sign in to Chat'}
              </h2>
              <p className="prompt-sub">
                {pendingAction === 'book'
                  ? `Create a free account or log in to book ${worker.name?.split(' ')[0]} for the job. It only takes a minute.`
                  : `Create a free account or log in to send ${worker.name?.split(' ')[0]} a message and discuss your job.`
                }
              </p>
              {/* Log In → saves redirect → goes to /login */}
              <button className="prompt-btn-primary" onClick={goToLogin}>
                Log In
              </button>
              {/* Create Account → saves redirect → goes to /register */}
              <button className="prompt-btn-secondary" onClick={goToRegister}>
                Create Free Account
              </button>
              <button className="prompt-cancel" onClick={() => setShowPrompt(false)}>
                Maybe Later
              </button>
            </div>
          </div>
        )}

        {/* ── BACK ── */}
        <div className="back-bar">
          <span className="back-link" onClick={() => router.back()}>
            <ChevronLeft size={16} /> Back to Workers
          </span>
        </div>

        {/* ── HERO ── */}
        <div className="profile-hero">
          <div className="profile-hero-inner">

            {/* Avatar */}
            <div className="profile-avatar-wrap">
              <div className="profile-avatar" style={{ background: worker.avatarBg || '#FFF3EE', color: worker.avatarColor || '#FF5C1A' }}>
                {worker.initials || worker.name?.charAt(0)}
              </div>
              {worker.available && <span className="profile-avail-badge">Available</span>}
            </div>

            {/* Info */}
            <div className="profile-info">
              <span className="profile-skill-badge">{worker.skill}</span>
              <h1 className="profile-name">{worker.name}</h1>
              <div className="profile-meta">
                <span className="profile-meta-item"><MapPin size={14} color="#6B6B6B" /> {worker.location}</span>
                <span className="profile-meta-item"><Briefcase size={14} color="#6B6B6B" /> {worker.exp || '5+ years'} experience</span>
                <span className="profile-rating-big">
                  <Star size={18} fill="#F59E0B" color="#F59E0B" />
                  {worker.rating}
                  <span style={{ fontSize: 14, color: '#6B6B6B', fontWeight: 400 }}>
                    ({worker.reviewCount || 0} reviews)
                  </span>
                </span>
              </div>
              <div className="profile-stats">
                <div className="pstat">
                  <div className="pstat-val">{worker.jobs || 0}<em>+</em></div>
                  <div className="pstat-label">Jobs Done</div>
                </div>
                <div className="pstat">
                  <div className="pstat-val">{worker.repeatClients || 0}<em>%</em></div>
                  <div className="pstat-label">Repeat Clients</div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="profile-cta-wrap">
              <div className="cta-price">
                <div className="cta-price-val">
                  {worker.currency || '$'}{worker.price}
                  <span style={{ fontSize: 14, color: '#6B6B6B', fontWeight: 400 }}>/hr</span>
                </div>
                <div className="cta-price-label">Starting rate</div>
              </div>
              {/* Both buttons call handleAction — no conditional rendering needed */}
              <button className="btn-book" onClick={() => handleAction('book')}>
                <Calendar size={17} /> Book Now
              </button>
              <button className="btn-chat" onClick={() => handleAction('chat')}>
                <MessageCircle size={17} /> Send Message
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex' }}>
            {(['about', 'reviews'] as const).map(tab => (
              <button
                key={tab}
                className={`tab-btn${activeTab === tab ? ' active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'about' ? 'About' : `Reviews (${worker.reviewCount || 0})`}
              </button>
            ))}
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="profile-body">

          {activeTab === 'about' && (
            <>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, color: '#0F0F0F', marginBottom: 14 }}>
                About {worker.name?.split(' ')[0]}
              </h2>
              <p className="about-bio">
                {worker.bio || "This worker hasn't added a bio yet."}
              </p>

              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, color: '#0F0F0F', marginBottom: 14 }}>
                Skills &amp; Specialisms
              </h2>
              <div className="skills-pills">
                {worker.skills?.length
                  ? worker.skills.map((s: string) => <span key={s} className="skill-pill">{s}</span>)
                  : <span className="skill-pill">{worker.skill}</span>
                }
              </div>

              <div className="trust-grid">
                <div className="trust-card">
                  <div className="trust-icon"><Shield size={20} color="#FF5C1A" /></div>
                  <div>
                    <p className="trust-title">ID Verified</p>
                    <p className="trust-sub">Identity checked by FixMate</p>
                  </div>
                </div>
                <div className="trust-card">
                  <div className="trust-icon"><Award size={20} color="#FF5C1A" /></div>
                  <div>
                    <p className="trust-title">Top Rated</p>
                    <p className="trust-sub">Consistently rated 4.8+</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'reviews' && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6B6B6B' }}>
              <ThumbsUp size={32} style={{ opacity: 0.25, marginBottom: 14 }} />
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 16 }}>
                No reviews yet
              </p>
              <p style={{ fontSize: 14, marginTop: 6 }}>Be the first to book and leave a review.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}