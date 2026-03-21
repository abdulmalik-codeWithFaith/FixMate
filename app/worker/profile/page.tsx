'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { db, auth } from '@/lib/firebase'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { onAuthStateChanged, updateProfile } from 'firebase/auth'
import toast, { Toaster } from 'react-hot-toast'
import {
  ChevronLeft, Camera, MapPin, Phone, Mail, Star,
  Edit3, Save, X, CheckCircle, Briefcase, Clock,
  Award, ShieldCheck, Plus, Eye, TrendingUp,
  Users, DollarSign, ChevronRight, Loader2
} from 'lucide-react'

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface WorkerStats {
  totalJobs: number
  avgRating: number
  repeatRate: number
  monthEarnings: number
  currency: string
}

interface Review {
  id: string
  clientName: string
  clientInitials: string
  clientAvatarBg: string
  clientAvatarColor: string
  date: string
  rating: number
  text: string
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const skillOptions = ['Electrician','Plumber','Carpenter','Painter','Tiler','AC Technician','Generator Technician','Welder','Mason','Glazier','Rewiring','Consumer Units','EV Chargers','Solar Panels','Fault Finding','CCTV']
const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const avatarPalettes = [
  { bg: '#EEF6FF', color: '#2563EB' }, { bg: '#F0FDF4', color: '#16A34A' },
  { bg: '#FFF8EE', color: '#D97706' }, { bg: '#F5F0FF', color: '#7C3AED' },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'W'
}

function formatReviewDate(ts: any): string {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const S = `
  .wpm-page { min-height: 100vh; background: #F5F4F1; }
  .wpm-topbar { background: white; border-bottom: 1px solid #E8E6E1; padding: 0 40px; height: 64px; display: flex; align-items: center; gap: 14px; position: sticky; top: 0; z-index: 40; }
  .topbar-back { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; color: #6B6B6B; text-decoration: none; transition: all 0.2s; border: 1.5px solid #E8E6E1; flex-shrink: 0; }
  .topbar-back:hover { border-color: #0F0F0F; color: #0F0F0F; }
  .topbar-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; flex: 1; }
  .topbar-edit-btn { display: flex; align-items: center; gap: 6px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #6B6B6B; background: none; border: 1.5px solid #E8E6E1; border-radius: 9px; padding: 7px 14px; cursor: pointer; transition: all 0.2s; }
  .topbar-edit-btn:hover { border-color: #FF5C1A; color: #FF5C1A; }
  .topbar-edit-btn.saving { background: #FF5C1A; border-color: #FF5C1A; color: white; }
  .topbar-edit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .topbar-preview { display: flex; align-items: center; gap: 6px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #6B6B6B; background: none; border: 1.5px solid #E8E6E1; border-radius: 9px; padding: 7px 14px; cursor: pointer; transition: all 0.2s; text-decoration: none; }
  .topbar-preview:hover { border-color: #0F0F0F; color: #0F0F0F; }
  .wpm-body { max-width: 860px; margin: 0 auto; padding: 28px 40px; display: flex; flex-direction: column; gap: 20px; }
  .hero-card { background: white; border: 1px solid #E8E6E1; border-radius: 20px; overflow: hidden; }
  .hero-banner { height: 110px; background: linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 100%); position: relative; }
  .hero-banner-pattern { position: absolute; inset: 0; background-image: radial-gradient(rgba(255,92,26,0.12) 1px, transparent 1px); background-size: 20px 20px; }
  .hero-body { padding: 0 28px 28px; }
  .hero-avatar-row { display: flex; align-items: flex-end; justify-content: space-between; margin-top: -40px; margin-bottom: 16px; }
  .hero-avatar-wrap { position: relative; }
  .hero-avatar { width: 88px; height: 88px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 20px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 30px; }
  .cam-btn { position: absolute; bottom: 2px; right: 2px; width: 28px; height: 28px; border-radius: 50%; background: #FF5C1A; border: 2px solid white; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; }
  .cam-btn:hover { background: #FF7A40; }
  .hero-badges { display: flex; gap: 8px; flex-wrap: wrap; }
  .hero-badge { display: inline-flex; align-items: center; gap: 5px; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 100px; }
  .hero-name { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 26px; letter-spacing: -1px; color: #0F0F0F; margin-bottom: 6px; }
  .hero-skill-pill { display: inline-block; background: #FFF3EE; color: #FF5C1A; font-size: 13px; font-weight: 600; padding: 5px 14px; border-radius: 100px; margin-bottom: 10px; }
  .hero-meta { display: flex; flex-wrap: wrap; gap: 14px; }
  .hero-meta-item { display: flex; align-items: center; gap: 5px; font-size: 13px; color: #6B6B6B; }
  .stats-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
  .stat-card { background: white; border: 1px solid #E8E6E1; border-radius: 14px; padding: 18px; }
  .stat-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
  .stat-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; color: #0F0F0F; }
  .stat-label { font-size: 12px; color: #6B6B6B; margin-top: 3px; }
  .section-card { background: white; border: 1px solid #E8E6E1; border-radius: 18px; overflow: hidden; }
  .section-head { padding: 18px 22px 14px; border-bottom: 1px solid #E8E6E1; display: flex; align-items: center; justify-content: space-between; }
  .section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; display: flex; align-items: center; gap: 8px; }
  .section-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
  .edit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 20px 22px; }
  .edit-field { display: flex; flex-direction: column; gap: 6px; }
  .edit-field.full { grid-column: 1/-1; }
  .edit-label { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; color: #6B6B6B; text-transform: uppercase; letter-spacing: .5px; }
  .edit-input { background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 11px; padding: 11px 14px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F; outline: none; transition: border-color 0.2s; width: 100%; box-sizing: border-box; }
  .edit-input:focus { border-color: #FF5C1A; background: white; box-shadow: 0 0 0 3px rgba(255,92,26,0.08); }
  .edit-input::placeholder { color: #AFAFAF; }
  .edit-textarea { min-height: 100px; resize: vertical; font-family: 'DM Sans', sans-serif; }
  .edit-input-wrap { display: flex; align-items: center; gap: 10px; background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 11px; padding: 11px 14px; transition: border-color 0.2s; }
  .edit-input-wrap:focus-within { border-color: #FF5C1A; background: white; box-shadow: 0 0 0 3px rgba(255,92,26,0.08); }
  .edit-input-wrap input { flex: 1; border: none; outline: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F; }
  .edit-input-wrap input::placeholder { color: #AFAFAF; }
  .edit-input-icon { color: #AFAFAF; flex-shrink: 0; }
  .skills-area { padding: 18px 22px; }
  .skills-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
  .skill-pill { display: flex; align-items: center; gap: 6px; background: #FFF3EE; border: 1px solid rgba(255,92,26,0.2); color: #FF5C1A; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; padding: 6px 12px; border-radius: 100px; }
  .skill-remove { background: none; border: none; cursor: pointer; color: rgba(255,92,26,0.5); display: flex; padding: 0; transition: color 0.15s; }
  .skill-remove:hover { color: #EF4444; }
  .add-skill-row { display: flex; gap: 10px; }
  .add-skill-select { flex: 1; background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 11px; padding: 10px 14px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F; outline: none; }
  .add-skill-select:focus { border-color: #FF5C1A; }
  .add-skill-btn { background: #FF5C1A; color: white; border: none; border-radius: 11px; padding: 10px 18px; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background 0.2s; white-space: nowrap; }
  .add-skill-btn:hover:not(:disabled) { background: #FF7A40; }
  .add-skill-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .avail-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 8px; padding: 16px 22px; }
  .day-btn { background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 10px; padding: 10px 6px; text-align: center; transition: all 0.2s; }
  .day-btn.on { background: #FF5C1A; border-color: #FF5C1A; }
  .day-btn.clickable { cursor: pointer; }
  .day-btn.clickable:hover { opacity: 0.85; }
  .day-label { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; color: #6B6B6B; }
  .day-btn.on .day-label { color: white; }
  .reviews-list { padding: 8px 22px 18px; display: flex; flex-direction: column; gap: 14px; }
  .review-item { background: #F5F4F1; border-radius: 14px; padding: 16px; }
  .review-top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .review-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; flex-shrink: 0; }
  .review-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; }
  .review-date { font-size: 12px; color: #6B6B6B; }
  .review-stars { display: flex; gap: 2px; margin-left: auto; }
  .review-text { font-size: 13px; color: #6B6B6B; line-height: 1.65; font-weight: 300; }
  .skeleton { background: linear-gradient(90deg, #F5F4F1 25%, #E8E6E1 50%, #F5F4F1 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  .loading-screen { height: 100vh; display: flex; align-items: center; justify-content: center; background: #F5F4F1; }
  .loading-spinner { width: 40px; height: 40px; border-radius: 50%; border: 3px solid #E8E6E1; border-top-color: #FF5C1A; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (max-width: 768px) {
    .wpm-topbar { padding: 0 16px; }
    .wpm-body { padding: 20px 16px; }
    .stats-row { grid-template-columns: repeat(2,1fr); }
    .edit-grid { grid-template-columns: 1fr; }
    .avail-grid { grid-template-columns: repeat(4,1fr); }
  }
`

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function WorkerProfileManage() {
  const router  = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [authUser, setAuthUser]     = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [editing, setEditing]       = useState(false)
  const [saving, setSaving]         = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)

  // Form state — loaded from Firestore
  const [form, setForm] = useState({
    name: '', email: '', phone: '', location: '',
    bio: '', experience: '', hourlyRate: '',
    skill: '', avatarBg: '#FFF3EE', avatarColor: '#FF5C1A',
  })
  const [initials, setInitials]     = useState('W')

  // Skills & availability
  const [skills, setSkills]         = useState<string[]>([])
  const [newSkill, setNewSkill]     = useState('')
  const [workDays, setWorkDays]     = useState([true,true,true,true,true,false,false])

  // Stats from real bookings
  const [stats, setStats]           = useState<WorkerStats | null>(null)

  // Reviews from real bookings
  const [reviews, setReviews]       = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)

  // ── 1. Auth ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { router.push('/login'); return }
      setAuthUser(u); setAuthLoading(false)
    })
    return () => unsub()
  }, [router])

  // ── 2. Load profile from /workers/{uid} ────────────────────────────────────
  useEffect(() => {
    if (!authUser) return
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'workers', authUser.uid))
        if (snap.exists()) {
          const d = snap.data() as any
          const name = d.name || authUser.displayName || 'Worker'
          setForm({
            name, email: d.email || authUser.email || '',
            phone:      d.phone      || '',
            location:   d.location   || '',
            bio:        d.bio        || '',
            experience: d.exp        || '',
            hourlyRate: d.price ? String(d.price) : '',
            skill:      d.skill      || '',
            avatarBg:   d.avatarBg   || '#FFF3EE',
            avatarColor: d.avatarColor || '#FF5C1A',
          })
          setInitials(d.initials || getInitials(name))
          setSkills(d.skills || (d.skill ? [d.skill] : []))
          if (d.workDays) setWorkDays(d.workDays)
        } else {
          // New worker — pre-fill from auth
          const name = authUser.displayName || 'Worker'
          setForm(p => ({ ...p, name, email: authUser.email || '' }))
          setInitials(getInitials(name))
        }
      } catch (err) {
        console.error('Profile load error:', err)
        toast.error('Could not load profile.')
      } finally {
        setProfileLoading(false)
      }
    }
    load()
  }, [authUser])

  // ── 3. Compute stats from real bookings ────────────────────────────────────
  useEffect(() => {
    if (!authUser) return
    const fetchStats = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'bookings'), where('workerId', '==', authUser.uid))
        )
        const all = snap.docs.map(d => d.data() as any)
        const completed  = all.filter(b => b.status === 'completed')
        const now        = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const thisMonth  = completed.filter(b => {
          try { return (b.scheduledAt?.toDate?.() || new Date()) >= monthStart } catch { return false }
        })
        const ratings    = completed.filter(b => b.rating).map(b => b.rating as number)
        const avgRating  = ratings.length ? Math.round(ratings.reduce((a,b)=>a+b,0)/ratings.length*10)/10 : 5.0
        const clientIds  = completed.map(b => b.clientId)
        const uniqueClients = new Set(clientIds).size
        const repeats    = clientIds.length > 0 ? Math.round((clientIds.length - uniqueClients) / clientIds.length * 100) : 0
        const currency   = all[0]?.currency || '£'

        setStats({
          totalJobs:     completed.length,
          avgRating,
          repeatRate:    repeats,
          monthEarnings: thisMonth.reduce((s,b) => s + (b.price||0), 0),
          currency,
        })
      } catch {}
    }
    fetchStats()
  }, [authUser])

  // ── 4. Fetch reviews from completed bookings that have ratings ──────────────
  useEffect(() => {
    if (!authUser) return
    const fetchReviews = async () => {
      try {
        const snap = await getDocs(
          query(
            collection(db, 'bookings'),
            where('workerId', '==', authUser.uid),
            where('status', '==', 'completed'),
            orderBy('createdAt', 'desc'),
            limit(5)
          )
        )
        const all = snap.docs
          .map(d => ({ id: d.id, ...d.data() as any }))
          .filter(b => b.rating)

        const mapped: Review[] = all.map((b, i) => {
          const p = avatarPalettes[i % avatarPalettes.length]
          const name = b.clientName || 'Client'
          return {
            id:               b.id,
            clientName:       name,
            clientInitials:   b.clientInitials || getInitials(name),
            clientAvatarBg:   b.clientAvatarBg    || p.bg,
            clientAvatarColor: b.clientAvatarColor || p.color,
            date:             formatReviewDate(b.createdAt),
            rating:           b.rating,
            text:             b.reviewText || `Great ${b.skill || 'service'} — professional and on time.`,
          }
        })
        setReviews(mapped)
      } catch {} finally {
        setReviewsLoading(false)
      }
    }
    fetchReviews()
  }, [authUser])

  // ── 5. Save profile ────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!authUser) return
    setSaving(true)
    try {
      const inits = getInitials(form.name)
      setInitials(inits)

      await setDoc(doc(db, 'workers', authUser.uid), {
        name:        form.name.trim(),
        initials:    inits,
        email:       form.email.trim(),
        phone:       form.phone.trim(),
        location:    form.location.trim(),
        bio:         form.bio.trim(),
        exp:         form.experience.trim(),
        price:       Number(form.hourlyRate) || 0,
        skill:       form.skill.trim() || skills[0] || '',
        skills,
        workDays,
        avatarBg:    form.avatarBg,
        avatarColor: form.avatarColor,
        updatedAt:   serverTimestamp(),
      }, { merge: true })

      await updateProfile(authUser, { displayName: form.name.trim() })

      setEditing(false)
      toast.success('Profile updated!')
    } catch (err) {
      console.error('Save error:', err)
      toast.error('Could not save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }))

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills(p => [...p, newSkill]); setNewSkill('')
    }
  }
  const removeSkill = (s: string) => setSkills(p => p.filter(x => x !== s))
  const toggleDay   = (i: number) => setWorkDays(p => { const n = [...p]; n[i] = !n[i]; return n })

  if (authLoading || profileLoading) {
    return (
      <><style>{S}</style>
      <div className="loading-screen"><div className="loading-spinner" /></div></>
    )
  }

  const currency = stats?.currency || '£'

  return (
    <>
      <style>{S}</style>
      <Toaster position="bottom-center" toastOptions={{ duration: 2500 }} />

      <div className="wpm-page">
        <div className="wpm-topbar">
          <Link href="/worker/dashboard" className="topbar-back"><ChevronLeft size={18} /></Link>
          <p className="topbar-title">My Profile</p>
          <Link href={`/explore/${authUser?.uid}`} className="topbar-preview">
            <Eye size={14} /> Preview
          </Link>
          <button
            className={`topbar-edit-btn${editing ? ' saving' : ''}`}
            onClick={() => editing ? handleSave() : setEditing(true)}
            disabled={saving}
          >
            {saving
              ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
              : editing
                ? <><Save size={14} /> Save Changes</>
                : <><Edit3 size={14} /> Edit Profile</>
            }
          </button>
          {editing && !saving && (
            <button onClick={() => setEditing(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, border: '1.5px solid #E8E6E1', background: 'none', cursor: 'pointer', color: '#6B6B6B', flexShrink: 0 }}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="wpm-body">

          {/* HERO */}
          <div className="hero-card">
            <div className="hero-banner"><div className="hero-banner-pattern" /></div>
            <div className="hero-body">
              <div className="hero-avatar-row">
                <div className="hero-avatar-wrap">
                  <div className="hero-avatar" style={{ background: form.avatarBg, color: form.avatarColor }}>
                    {initials}
                  </div>
                  {editing && (
                    <>
                      <div className="cam-btn" onClick={() => fileRef.current?.click()}>
                        <Camera size={13} color="white" />
                      </div>
                      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} />
                    </>
                  )}
                </div>
                <div className="hero-badges">
                  <span className="hero-badge" style={{ background: '#F0FDF4', color: '#16A34A', border: '1px solid rgba(22,163,74,0.2)' }}>
                    <ShieldCheck size={13} /> ID Verified
                  </span>
                  {(stats?.avgRating || 0) >= 4.5 && (
                    <span className="hero-badge" style={{ background: '#FFF3EE', color: '#FF5C1A', border: '1px solid rgba(255,92,26,0.2)' }}>
                      <Award size={13} /> Top Rated
                    </span>
                  )}
                </div>
              </div>
              <h1 className="hero-name">{form.name || 'Your Name'}</h1>
              <div className="hero-skill-pill">
                {form.skill || skills[0] || 'Professional'}
                {form.experience && ` · ${form.experience} experience`}
              </div>
              <div className="hero-meta">
                {form.location  && <span className="hero-meta-item"><MapPin size={13} color="#AFAFAF" />{form.location}</span>}
                {form.email     && <span className="hero-meta-item"><Mail size={13} color="#AFAFAF" />{form.email}</span>}
                {form.phone     && <span className="hero-meta-item"><Phone size={13} color="#AFAFAF" />{form.phone}</span>}
                {form.hourlyRate && <span className="hero-meta-item"><DollarSign size={13} color="#AFAFAF" />{currency}{form.hourlyRate}/hr</span>}
              </div>
              {form.bio && (
                <p style={{ fontSize: 14, color: '#6B6B6B', fontWeight: 300, lineHeight: 1.7, marginTop: 14, maxWidth: 560 }}>{form.bio}</p>
              )}
            </div>
          </div>

          {/* STATS */}
          <div className="stats-row">
            {[
              { icon: <Briefcase size={18} color="#FF5C1A" />,   bg: '#FFF3EE', val: stats ? String(stats.totalJobs)           : '—', label: 'Total Jobs'    },
              { icon: <Star size={18} color="#F59E0B" />,         bg: '#FFF8EE', val: stats ? String(stats.avgRating) + '★'     : '—', label: 'Avg Rating'   },
              { icon: <Users size={18} color="#2563EB" />,        bg: '#EEF6FF', val: stats ? String(stats.repeatRate) + '%'    : '—', label: 'Repeat Clients'},
              { icon: <TrendingUp size={18} color="#16A34A" />,   bg: '#F0FDF4', val: stats ? `${currency}${stats.monthEarnings.toLocaleString()}` : '—', label: 'This Month' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                <div className="stat-val">{s.val}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* EDIT FORM */}
          {editing && (
            <div className="section-card">
              <div className="section-head">
                <p className="section-title">
                  <div className="section-icon" style={{ background: '#FFF3EE' }}><Edit3 size={14} color="#FF5C1A" /></div>
                  Edit Profile Information
                </p>
              </div>
              <div className="edit-grid">
                <div className="edit-field">
                  <label className="edit-label">Full Name</label>
                  <input className="edit-input" value={form.name} onChange={set('name')} placeholder="Your name" />
                </div>
                <div className="edit-field">
                  <label className="edit-label">Hourly Rate ({currency})</label>
                  <div className="edit-input-wrap">
                    <DollarSign size={15} className="edit-input-icon" />
                    <input type="number" min="0" value={form.hourlyRate} onChange={set('hourlyRate')} placeholder="45" />
                  </div>
                </div>
                <div className="edit-field">
                  <label className="edit-label">Primary Skill</label>
                  <input className="edit-input" value={form.skill} onChange={set('skill')} placeholder="e.g. Electrician" />
                </div>
                <div className="edit-field">
                  <label className="edit-label">Years of Experience</label>
                  <div className="edit-input-wrap">
                    <Clock size={15} className="edit-input-icon" />
                    <input value={form.experience} onChange={set('experience')} placeholder="e.g. 9 years" />
                  </div>
                </div>
                <div className="edit-field">
                  <label className="edit-label">Email</label>
                  <div className="edit-input-wrap">
                    <Mail size={15} className="edit-input-icon" />
                    <input type="email" value={form.email} onChange={set('email')} />
                  </div>
                </div>
                <div className="edit-field">
                  <label className="edit-label">Phone</label>
                  <div className="edit-input-wrap">
                    <Phone size={15} className="edit-input-icon" />
                    <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+1 234 567 8900" />
                  </div>
                </div>
                <div className="edit-field">
                  <label className="edit-label">Location</label>
                  <div className="edit-input-wrap">
                    <MapPin size={15} className="edit-input-icon" />
                    <input value={form.location} onChange={set('location')} placeholder="City, Country" />
                  </div>
                </div>
                <div className="edit-field full">
                  <label className="edit-label">Bio / Description</label>
                  <textarea className="edit-input edit-textarea" value={form.bio} onChange={set('bio')} placeholder="Describe your skills and what clients can expect…" />
                </div>
              </div>
            </div>
          )}

          {/* SKILLS */}
          <div className="section-card">
            <div className="section-head">
              <p className="section-title">
                <div className="section-icon" style={{ background: '#FFF3EE' }}><Award size={14} color="#FF5C1A" /></div>
                Skills &amp; Specialisms
              </p>
            </div>
            <div className="skills-area">
              <div className="skills-pills">
                {skills.length === 0
                  ? <p style={{ fontSize: 13, color: '#AFAFAF', fontStyle: 'italic' }}>No skills added yet.</p>
                  : skills.map(s => (
                    <div key={s} className="skill-pill">
                      {s}
                      {editing && (
                        <button className="skill-remove" onClick={() => removeSkill(s)}><X size={12} /></button>
                      )}
                    </div>
                  ))
                }
              </div>
              {editing && (
                <div className="add-skill-row">
                  <select className="add-skill-select" value={newSkill} onChange={e => setNewSkill(e.target.value)}>
                    <option value="">Select skill to add…</option>
                    {skillOptions.filter(s => !skills.includes(s)).map(s => <option key={s}>{s}</option>)}
                  </select>
                  <button className="add-skill-btn" onClick={addSkill} disabled={!newSkill}>
                    <Plus size={15} /> Add
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* AVAILABILITY */}
          <div className="section-card">
            <div className="section-head">
              <p className="section-title">
                <div className="section-icon" style={{ background: '#F0FDF4' }}><Clock size={14} color="#16A34A" /></div>
                Work Schedule
              </p>
              <span style={{ fontSize: 13, color: '#6B6B6B' }}>{workDays.filter(Boolean).length} days/week</span>
            </div>
            <div className="avail-grid">
              {days.map((d, i) => (
                <div
                  key={d}
                  className={`day-btn${workDays[i] ? ' on' : ''}${editing ? ' clickable' : ''}`}
                  onClick={() => editing && toggleDay(i)}
                >
                  <p className="day-label">{d}</p>
                  <div style={{ marginTop: 4, display: 'flex', justifyContent: 'center' }}>
                    {workDays[i]
                      ? <CheckCircle size={13} color={editing ? 'white' : '#FF5C1A'} />
                      : <X size={13} color="#AFAFAF" />
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* REVIEWS */}
          <div className="section-card">
            <div className="section-head">
              <p className="section-title">
                <div className="section-icon" style={{ background: '#FFF8EE' }}><Star size={14} color="#D97706" /></div>
                Client Reviews
                {stats?.avgRating ? (
                  <span style={{ fontSize: 13, fontWeight: 400, color: '#6B6B6B', fontFamily: 'DM Sans, sans-serif' }}>
                    · {stats.avgRating} avg
                  </span>
                ) : null}
              </p>
              <Link href="/worker/jobs" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#FF5C1A', textDecoration: 'none' }}>
                View all <ChevronRight size={14} />
              </Link>
            </div>
            {reviewsLoading ? (
              <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1,2].map(i => (
                  <div key={i} style={{ background: '#F5F4F1', borderRadius: 14, padding: 16 }}>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                      <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div className="skeleton" style={{ height: 13, width: '40%' }} />
                        <div className="skeleton" style={{ height: 11, width: '25%' }} />
                      </div>
                    </div>
                    <div className="skeleton" style={{ height: 11, width: '90%' }} />
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div style={{ padding: '32px 22px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 600, color: '#0F0F0F', marginBottom: 6 }}>No reviews yet</p>
                <p style={{ fontSize: 13, color: '#6B6B6B', fontWeight: 300 }}>Reviews appear here once clients rate completed jobs.</p>
              </div>
            ) : (
              <div className="reviews-list">
                {reviews.map(r => (
                  <div key={r.id} className="review-item">
                    <div className="review-top">
                      <div className="review-avatar" style={{ background: r.clientAvatarBg, color: r.clientAvatarColor }}>
                        {r.clientInitials}
                      </div>
                      <div>
                        <p className="review-name">{r.clientName}</p>
                        <p className="review-date">{r.date}</p>
                      </div>
                      <div className="review-stars">
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} size={13} color="#F59E0B" fill={n <= r.rating ? '#F59E0B' : 'none'} />
                        ))}
                      </div>
                    </div>
                    <p className="review-text">{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}