'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Star, MapPin, Clock, Briefcase, ChevronLeft, MessageCircle, Calendar, Shield, Award, ThumbsUp } from 'lucide-react'

// FIREBASE IMPORTS
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// ─── STYLES (STRICTLY PRESERVED) ──────────────────────────────────────────────
const S = `
  .profile-page { min-height: 100vh; background: #FAFAF8; padding-top: 20px; }
  .back-bar { background: white; border-bottom: 1px solid #E8E6E1; padding: 14px 40px; }
  .back-link { display: inline-flex; align-items: center; gap: 6px; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; color: #6B6B6B; text-decoration: none; transition: color 0.2s; }
  .back-link:hover { color: #0F0F0F; }
  .profile-hero { background: white; border-bottom: 1px solid #E8E6E1; padding: 40px 40px 0; }
  .profile-hero-inner { max-width: 1200px; margin: 0 auto; display: flex; gap: 32px; align-items: flex-start; padding-bottom: 32px; }
  .profile-avatar-wrap { position: relative; flex-shrink: 0; }
  .profile-avatar { width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 32px; }
  .profile-avail-badge { position: absolute; bottom: 4px; right: 4px; background: #22C55E; color: white; font-size: 10px; font-weight: 700; padding: 3px 7px; border-radius: 100px; border: 2px solid white; font-family: 'DM Sans', sans-serif; }
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
  .profile-body { max-width: 1200px; margin: 0 auto; padding: 40px 40px; }
  .about-bio { font-size: 15px; color: #3D3D3D; line-height: 1.85; font-weight: 300; white-space: pre-line; margin-bottom: 32px; }
  .skills-pills { display: flex; flex-wrap: wrap; gap: 8px; }
  .skill-pill { font-size: 13px; font-weight: 500; background: #FFF3EE; color: #FF5C1A; border: 1px solid rgba(255,92,26,0.2); padding: 6px 14px; border-radius: 100px; }
  .trust-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
  .trust-card { background: white; border: 1px solid #E8E6E1; border-radius: 14px; padding: 20px; display: flex; align-items: flex-start; gap: 14px; }
  .trust-icon { width: 40px; height: 40px; border-radius: 10px; background: #FFF3EE; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .trust-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; margin-bottom: 3px; }
  .trust-sub { font-size: 12px; color: #6B6B6B; }
  .rating-summary { display: flex; align-items: center; gap: 40px; background: white; border: 1px solid #E8E6E1; border-radius: 16px; padding: 28px; margin-bottom: 24px; flex-wrap: wrap; }
  .rating-big-num { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 56px; color: #0F0F0F; line-height: 1; }
  .rating-bar-track { flex: 1; height: 6px; background: #F5F4F1; border-radius: 3px; overflow: hidden; }
  .rating-bar-fill { height: 100%; background: #FF5C1A; border-radius: 3px; }
  .review-card { background: white; border: 1px solid #E8E6E1; border-radius: 14px; padding: 22px; margin-bottom: 16px;}
  .login-prompt-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .login-prompt-modal { background: white; border-radius: 24px; padding: 40px; max-width: 400px; width: 100%; text-align: center; box-shadow: 0 24px 80px rgba(0,0,0,0.2); }
  .login-prompt-btn { display: block; width: 100%; background: #FF5C1A; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 15px; border: none; border-radius: 12px; padding: 14px; margin-bottom: 10px; text-decoration: none; text-align: center; }

  @media (max-width: 900px) {
    .profile-hero-inner { flex-direction: column; }
    .profile-cta-wrap { width: 100%; flex-direction: row; }
    .cta-price { display: none; }
  }
`

export default function WorkerProfilePage() {
  const router = useRouter()
  const params = useParams()
  const [worker, setWorker] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'about' | 'reviews'>('about')
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [loginAction, setLoginAction] = useState<'book' | 'chat'>('book')

  // Simulate login state
  const isLoggedIn = false

  // 1. FETCH REAL DATA FROM FIREBASE
  useEffect(() => {
    const getWorker = async () => {
      try {
        const docRef = doc(db, "workers", params.id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setWorker({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getWorker();
  }, [params.id]);

  if (loading) return <div style={{padding: 100, textAlign: 'center', fontFamily: 'Syne', fontWeight: 800}}>Loading Profile...</div>
  if (!worker) return <div style={{padding: 100, textAlign: 'center'}}>Worker not found.</div>

  const handleBook = () => {
    if (!isLoggedIn) { setLoginAction('book'); setShowLoginPrompt(true); return }
    router.push(`/booking/${worker.id}`)
  }

  const handleChat = () => {
    if (!isLoggedIn) { setLoginAction('chat'); setShowLoginPrompt(true); return }
    router.push(`/chat/${worker.id}`)
  }

  return (
    <>
      <style>{S}</style>
      <div className="profile-page">
        {showLoginPrompt && (
          <div className="login-prompt-overlay">
            <div className="login-prompt-modal">
              <div style={{fontSize: 40, marginBottom: 16}}>🔐</div>
              <h2 className="login-prompt-title">Sign in to {loginAction === 'book' ? 'Book' : 'Chat'}</h2>
              <p className="login-prompt-sub">Create a free account or log in to manage your bookings.</p>
              <Link href="/login" className="login-prompt-btn">Log In</Link>
              <Link href="/register" className="login-prompt-btn" style={{ background: '#0F0F0F' }}>Create Account</Link>
              <button className="login-prompt-cancel" style={{background:'none', border:'none', color:'#6B6B6B', marginTop: 10, cursor:'pointer'}} onClick={() => setShowLoginPrompt(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className="back-bar">
          <Link href="/explore" className="back-link"><ChevronLeft size={16} /> Back to Workers</Link>
        </div>

        <div className="profile-hero">
          <div className="profile-hero-inner">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar" style={{ background: worker.avatarBg || '#FF5C1A', color: worker.avatarColor || '#FFF' }}>
                {worker.initials || worker.name?.charAt(0)}
              </div>
              {worker.available && <span className="profile-avail-badge">Available</span>}
            </div>

            <div className="profile-info">
              <span className="profile-skill-badge">{worker.skill}</span>
              <h1 className="profile-name">{worker.name}</h1>
              <div className="profile-meta">
                <span className="profile-meta-item"><MapPin size={14} /> {worker.location}</span>
                <span className="profile-meta-item"><Briefcase size={14} /> {worker.exp || '5+ years'} experience</span>
                <span className="profile-rating-big"><Star size={18} fill="#F59E0B" color="#F59E0B" /> {worker.rating}</span>
              </div>

              <div className="profile-stats">
                <div className="pstat"><div className="pstat-val">{worker.jobs || 0}<em>+</em></div><div className="pstat-label">Jobs Done</div></div>
                <div className="pstat"><div className="pstat-val">{worker.repeatClients || 0}<em>%</em></div><div className="pstat-label">Repeat Clients</div></div>
              </div>
            </div>

            <div className="profile-cta-wrap">
              <div className="cta-price">
                <div className="cta-price-val">{worker.currency || '$'}{worker.price}<span style={{fontSize: 14, color: '#6B6B6B'}}>/hr</span></div>
                <div className="cta-price-label">Starting rate</div>
              </div>
              <button className="btn-book" onClick={handleBook}><Calendar size={17} /> Book Now</button>
              <button className="btn-chat" onClick={handleChat}><MessageCircle size={17} /> Send Message</button>
            </div>
          </div>

          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex' }}>
            <button className={`tab-btn${activeTab === 'about' ? ' active' : ''}`} onClick={() => setActiveTab('about')}>About</button>
            <button className={`tab-btn${activeTab === 'reviews' ? ' active' : ''}`} onClick={() => setActiveTab('reviews')}>Reviews ({worker.reviewCount || 0})</button>
          </div>
        </div>

        <div className="profile-body">
          {activeTab === 'about' && (
            <>
              <h2 style={{fontFamily:'Syne', marginBottom: 14}}>About {worker.name?.split(' ')[0]}</h2>
              <p className="about-bio">{worker.bio}</p>
              <div className="skills-wrap">
                <h2 style={{fontFamily:'Syne', marginBottom: 14}}>Skills</h2>
                <div className="skills-pills">
                  {worker.skills?.map((s: string) => <span key={s} className="skill-pill">{s}</span>) || <span className="skill-pill">{worker.skill}</span>}
                </div>
              </div>
              <div className="trust-grid" style={{marginTop: 40}}>
                 <div className="trust-card"><Shield size={20} color="#FF5C1A" /><div><p className="trust-title">Verified</p><p className="trust-sub">ID & Skills checked</p></div></div>
                 <div className="trust-card"><Award size={20} color="#FF5C1A" /><div><p className="trust-title">Top Rated</p><p className="trust-sub">Consistently 4.8+</p></div></div>
              </div>
            </>
          )}

          {activeTab === 'reviews' && (
             <div style={{textAlign:'center', padding: 40, color:'#6B6B6B'}}>
               <p>No reviews yet for this artisan.</p>
             </div>
          )}
        </div>
      </div>
    </>
  )
}