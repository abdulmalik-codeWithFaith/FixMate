'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { db, auth } from '@/lib/firebase'
import {
  doc, getDoc, updateDoc, serverTimestamp,
  collection, query, where, orderBy, limit, getDocs
} from 'firebase/firestore'
import { onAuthStateChanged, updateProfile } from 'firebase/auth'
import toast, { Toaster } from 'react-hot-toast'
import {
  ChevronLeft, Camera, MapPin, Phone, Mail, Star,
  CheckCircle, Edit3, Save, X, Calendar, Briefcase,
  Clock, Award, ShieldCheck, BookOpen, ChevronRight,
  Loader2, TrendingUp, Settings
} from 'lucide-react'

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface UserProfile {
  name: string
  email: string
  phone: string
  location: string
  bio: string
  memberSince: string
  avatarInitials: string
}

interface StatData {
  totalJobs: number
  completedJobs: number
  avgRating: number
  memberSince: string
}

interface RecentBooking {
  id: string
  label: string
  date: string
  status: 'completed' | 'upcoming' | 'pending' | 'cancelled'
  initials: string
  bg: string
  color: string
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
  completed: { bg: '#F0FDF4', color: '#16A34A', label: 'Completed' },
  accepted:  { bg: '#FFF3EE', color: '#FF5C1A', label: 'Upcoming'  },
  pending:   { bg: '#FFF8EE', color: '#D97706', label: 'Pending'   },
  cancelled: { bg: '#FEF2F2', color: '#EF4444', label: 'Cancelled' },
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'U'
}

function formatMemberSince(ts: any): string {
  if (!ts) return 'Recently'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function formatBookingDate(ts: any, fallback: string): string {
  if (!ts) return fallback
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const now = new Date()
  const diff = (d.getTime() - now.getTime()) / 86400000
  if (diff > 0 && diff < 1) return 'Today'
  if (diff >= 1 && diff < 2) return 'Tomorrow'
  if (diff < 0 && diff > -1) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const S = `
  .profile-page { min-height: 100vh; background: #F5F4F1; }
  .profile-topbar { background: white; border-bottom: 1px solid #E8E6E1; padding: 0 40px; height: 64px; display: flex; align-items: center; gap: 14px; position: sticky; top: 0; z-index: 40; }
  .topbar-back { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; color: #6B6B6B; text-decoration: none; transition: all 0.2s; border: 1.5px solid #E8E6E1; flex-shrink: 0; }
  .topbar-back:hover { border-color: #0F0F0F; color: #0F0F0F; }
  .topbar-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; flex: 1; }
  .topbar-edit-btn { display: flex; align-items: center; gap: 6px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #6B6B6B; background: none; border: 1.5px solid #E8E6E1; border-radius: 9px; padding: 7px 14px; cursor: pointer; transition: all 0.2s; }
  .topbar-edit-btn:hover { border-color: #FF5C1A; color: #FF5C1A; }
  .topbar-edit-btn.saving { background: #FF5C1A; border-color: #FF5C1A; color: white; }
  .topbar-edit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .profile-body { max-width: 760px; margin: 0 auto; padding: 28px 40px; display: flex; flex-direction: column; gap: 20px; }

  /* HERO */
  .hero-card { background: white; border: 1px solid #E8E6E1; border-radius: 20px; overflow: hidden; }
  .hero-banner { height: 100px; background: linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 60%, #FF5C1A 200%); position: relative; }
  .hero-banner-pattern { position: absolute; inset: 0; background-image: radial-gradient(rgba(255,92,26,0.15) 1px, transparent 1px); background-size: 20px 20px; }
  .hero-body { padding: 0 28px 28px; }
  .hero-avatar-row { display: flex; align-items: flex-end; justify-content: space-between; margin-top: -36px; margin-bottom: 16px; }
  .hero-avatar-wrap { position: relative; }
  .hero-avatar { width: 80px; height: 80px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 16px rgba(0,0,0,0.12); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; }
  .avatar-camera-btn { position: absolute; bottom: 2px; right: 2px; width: 26px; height: 26px; border-radius: 50%; background: #FF5C1A; border: 2px solid white; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; }
  .avatar-camera-btn:hover { background: #FF7A40; }
  .verified-badge { display: inline-flex; align-items: center; gap: 5px; background: #F0FDF4; border: 1px solid rgba(34,197,94,0.2); color: #16A34A; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 100px; }
  .hero-name { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 26px; letter-spacing: -1px; color: #0F0F0F; margin-bottom: 6px; }
  .hero-meta { display: flex; flex-wrap: wrap; gap: 14px; }
  .hero-meta-item { display: flex; align-items: center; gap: 5px; font-size: 13px; color: #6B6B6B; }

  /* STATS */
  .stats-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
  .stat-card { background: white; border: 1px solid #E8E6E1; border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
  .stat-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
  .stat-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: #0F0F0F; }
  .stat-label { font-size: 12px; color: #6B6B6B; }

  /* EDIT FORM */
  .edit-card { background: white; border: 1px solid #E8E6E1; border-radius: 18px; overflow: hidden; }
  .edit-card-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; padding: 20px 24px 16px; border-bottom: 1px solid #E8E6E1; display: flex; align-items: center; gap: 8px; }
  .edit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 20px 24px; }
  .edit-field { display: flex; flex-direction: column; gap: 6px; }
  .edit-field.full { grid-column: 1 / -1; }
  .edit-label { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; color: #6B6B6B; text-transform: uppercase; letter-spacing: .5px; }
  .edit-input { background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 11px; padding: 11px 14px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F; outline: none; transition: border-color 0.2s; width: 100%; box-sizing: border-box; }
  .edit-input:focus { border-color: #FF5C1A; background: white; box-shadow: 0 0 0 3px rgba(255,92,26,0.08); }
  .edit-input::placeholder { color: #AFAFAF; }
  .edit-textarea { min-height: 80px; resize: none; font-family: 'DM Sans', sans-serif; }
  .edit-input-wrap { display: flex; align-items: center; gap: 10px; background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 11px; padding: 11px 14px; transition: border-color 0.2s; }
  .edit-input-wrap:focus-within { border-color: #FF5C1A; background: white; box-shadow: 0 0 0 3px rgba(255,92,26,0.08); }
  .edit-input-wrap input { flex: 1; border: none; outline: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F; }
  .edit-input-wrap input::placeholder { color: #AFAFAF; }
  .edit-input-icon { color: #AFAFAF; flex-shrink: 0; }

  /* ACTIVITY */
  .activity-card { background: white; border: 1px solid #E8E6E1; border-radius: 18px; overflow: hidden; }
  .activity-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; padding: 20px 24px 16px; border-bottom: 1px solid #E8E6E1; display: flex; align-items: center; justify-content: space-between; }
  .activity-view-all { display: flex; align-items: center; gap: 4px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #FF5C1A; text-decoration: none; transition: gap 0.2s; }
  .activity-view-all:hover { gap: 7px; }
  .activity-item { display: flex; align-items: center; gap: 14px; padding: 14px 24px; border-bottom: 1px solid #F5F4F1; transition: background 0.15s; text-decoration: none; color: inherit; }
  .activity-item:last-child { border-bottom: none; }
  .activity-item:hover { background: #FAFAF8; }
  .activity-avatar { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; flex-shrink: 0; }
  .activity-label { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; color: #0F0F0F; margin-bottom: 3px; }
  .activity-meta { display: flex; align-items: center; gap: 8px; }
  .activity-date { font-size: 12px; color: #6B6B6B; display: flex; align-items: center; gap: 3px; }
  .activity-status { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 100px; font-family: 'Syne', sans-serif; }

  /* QUICK LINKS */
  .quick-links { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .quick-link-card { background: white; border: 1px solid #E8E6E1; border-radius: 14px; padding: 18px 20px; display: flex; align-items: center; gap: 14px; text-decoration: none; color: inherit; transition: all 0.2s; }
  .quick-link-card:hover { border-color: #FF5C1A; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.07); }
  .ql-icon { width: 40px; height: 40px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .ql-label { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; }
  .ql-sub { font-size: 12px; color: #6B6B6B; margin-top: 2px; }

  /* SKELETON */
  .skeleton { background: linear-gradient(90deg, #F5F4F1 25%, #E8E6E1 50%, #F5F4F1 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  /* LOADING */
  .loading-screen { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; background: #F5F4F1; }
  .loading-spinner { width: 40px; height: 40px; border-radius: 50%; border: 3px solid #E8E6E1; border-top-color: #FF5C1A; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* TOAST */
  @keyframes slideUp { from { transform: translateX(-50%) translateY(20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }

  @media (max-width: 768px) {
    .profile-topbar { padding: 0 16px; }
    .profile-body { padding: 20px 16px; }
    .stats-strip { grid-template-columns: repeat(2, 1fr); }
    .edit-grid { grid-template-columns: 1fr; }
    .quick-links { grid-template-columns: 1fr; }
  }
`

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router  = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [authUser, setAuthUser]   = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [editing, setEditing]     = useState(false)
  const [saving, setSaving]       = useState(false)

  const [profile, setProfile]     = useState<UserProfile | null>(null)
  const [stats, setStats]         = useState<StatData | null>(null)
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])

  const [form, setForm] = useState({
    name: '', email: '', phone: '', location: '', bio: '',
  })

  const avatarColors = [
    { bg: '#FFF3EE', color: '#FF5C1A' },
    { bg: '#EEF6FF', color: '#2563EB' },
    { bg: '#F0FDF4', color: '#16A34A' },
  ]
  const avatarPalette = avatarColors[0]

  // ── 1. Auth ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { router.push('/login'); return }
      setAuthUser(u)
      setAuthLoading(false)
    })
    return () => unsub()
  }, [router])

  // ── 2. Fetch user profile from Firestore ──────────────────────────────────
  useEffect(() => {
    if (!authUser) return

    const fetchProfile = async () => {
      try {
        // Try /users/{uid} first, fall back to auth displayName/email
        const snap = await getDoc(doc(db, 'users', authUser.uid))

        let data: any = {}
        if (snap.exists()) {
          data = snap.data()
        }

        const name     = data.displayName || data.name || authUser.displayName || 'User'
        const email    = data.email       || authUser.email || ''
        const phone    = data.phone       || data.phoneNumber || ''
        const location = data.location    || ''
        const bio      = data.bio         || ''

        const p: UserProfile = {
          name, email, phone, location, bio,
          memberSince:    formatMemberSince(data.createdAt || null),
          avatarInitials: getInitials(name),
        }
        setProfile(p)
        setForm({ name, email, phone, location, bio })
      } catch (err) {
        console.error('Profile fetch error:', err)
        // Fallback to Firebase Auth data
        const name = authUser.displayName || authUser.email?.split('@')[0] || 'User'
        setProfile({
          name, email: authUser.email || '', phone: '', location: '', bio: '',
          memberSince: 'Recently', avatarInitials: getInitials(name),
        })
        setForm({ name, email: authUser.email || '', phone: '', location: '', bio: '' })
      }
    }

    fetchProfile()
  }, [authUser])

  // ── 3. Fetch stats from bookings ──────────────────────────────────────────
  useEffect(() => {
    if (!authUser) return

    const fetchStats = async () => {
      try {
        const snap = await getDocs(
          query(
            collection(db, 'bookings'),
            where('clientId', '==', authUser.uid)
          )
        )

        const all       = snap.docs.map(d => d.data() as any)
        const total     = all.length
        const completed = all.filter(b => b.status === 'completed').length
        const ratings   = all.filter(b => b.rating).map(b => b.rating as number)
        const avgRating = ratings.length
          ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
          : 0

        // Member since from Firestore user doc or auth
        const userSnap = await getDoc(doc(db, 'users', authUser.uid))
        const userData = userSnap.exists() ? userSnap.data() as any : {}
        const memberSince = formatMemberSince(
          userData.createdAt || authUser.metadata?.creationTime
            ? new Date(authUser.metadata.creationTime)
            : null
        )

        setStats({ totalJobs: total, completedJobs: completed, avgRating, memberSince })
      } catch (err) {
        console.error('Stats fetch error:', err)
        setStats({ totalJobs: 0, completedJobs: 0, avgRating: 0, memberSince: 'Recently' })
      }
    }

    fetchStats()
  }, [authUser])

  // ── 4. Fetch recent bookings ──────────────────────────────────────────────
  useEffect(() => {
    if (!authUser) return

    const fetchBookings = async () => {
      try {
        const snap = await getDocs(
          query(
            collection(db, 'bookings'),
            where('clientId', '==', authUser.uid),
            orderBy('createdAt', 'desc'),
            limit(4)
          )
        )

        const avatarPalettes = [
          { bg: '#FFF3EE', color: '#FF5C1A' },
          { bg: '#F0FDF4', color: '#16A34A' },
          { bg: '#FFF8EE', color: '#D97706' },
          { bg: '#EEF6FF', color: '#2563EB' },
          { bg: '#F5F0FF', color: '#7C3AED' },
        ]

        const recent: RecentBooking[] = snap.docs.map((d, i) => {
          const b = d.data() as any
          const workerName = b.workerName || 'Worker'
          const skill      = b.skill || b.workerSkill || 'Service'
          const palette    = avatarPalettes[i % avatarPalettes.length]
          const initials   = b.workerInitials || getInitials(workerName)

          return {
            id:       d.id,
            label:    `${workerName} — ${skill}`,
            date:     formatBookingDate(b.scheduledAt || b.createdAt, b.dateString || 'Scheduled'),
            status:   b.status || 'pending',
            initials: b.workerAvatarBg ? b.workerInitials || initials : initials,
            bg:       b.workerAvatarBg    || palette.bg,
            color:    b.workerAvatarColor || palette.color,
          }
        })

        setRecentBookings(recent)
      } catch (err) {
        console.error('Bookings fetch error:', err)
        setRecentBookings([])
      }
    }

    fetchBookings()
  }, [authUser])

  // ── 5. Save profile ───────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!authUser) return
    setSaving(true)
    try {
      // Update Firestore /users/{uid}
      await updateDoc(doc(db, 'users', authUser.uid), {
        displayName: form.name.trim(),
        name:        form.name.trim(),
        email:       form.email.trim(),
        phone:       form.phone.trim(),
        location:    form.location.trim(),
        bio:         form.bio.trim(),
        updatedAt:   serverTimestamp(),
      })

      // Also update Firebase Auth displayName
      await updateProfile(authUser, { displayName: form.name.trim() })

      // Update local profile state
      setProfile(p => p ? {
        ...p,
        name:           form.name.trim(),
        email:          form.email.trim(),
        phone:          form.phone.trim(),
        location:       form.location.trim(),
        bio:            form.bio.trim(),
        avatarInitials: getInitials(form.name.trim()),
      } : p)

      setEditing(false)
      toast.success('Profile saved successfully!')
    } catch (err: any) {
      console.error('Save error:', err)
      // If doc doesn't exist, try creating it
      try {
        const { setDoc } = await import('firebase/firestore')
        await setDoc(doc(db, 'users', authUser.uid), {
          displayName: form.name.trim(),
          name:        form.name.trim(),
          email:       form.email.trim(),
          phone:       form.phone.trim(),
          location:    form.location.trim(),
          bio:         form.bio.trim(),
          role:        'client',
          createdAt:   serverTimestamp(),
          updatedAt:   serverTimestamp(),
        })
        await updateProfile(authUser, { displayName: form.name.trim() })
        setEditing(false)
        toast.success('Profile saved!')
      } catch (err2) {
        toast.error('Could not save profile. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }))

  // ── Loading ───────────────────────────────────────────────────────────────
  if (authLoading || !profile) {
    return (
      <>
        <style>{S}</style>
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#6B6B6B' }}>Loading profile…</p>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{S}</style>
      <Toaster position="bottom-center" toastOptions={{ duration: 2500 }} />

      <div className="profile-page">
        <div className="profile-topbar">
          <Link href="/dashboard" className="topbar-back"><ChevronLeft size={18} /></Link>
          <p className="topbar-title">My Profile</p>
          <button
            className={`topbar-edit-btn${editing ? ' saving' : ''}`}
            onClick={() => editing ? handleSave() : setEditing(true)}
            disabled={saving}
          >
            {saving
              ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
              : editing
                ? <><Save size={14} /> Save</>
                : <><Edit3 size={14} /> Edit Profile</>
            }
          </button>
          {editing && !saving && (
            <button
              onClick={() => { setEditing(false); setForm({ name: profile.name, email: profile.email, phone: profile.phone, location: profile.location, bio: profile.bio }) }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, border: '1.5px solid #E8E6E1', background: 'none', cursor: 'pointer', color: '#6B6B6B', flexShrink: 0 }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="profile-body">

          {/* Hero */}
          <div className="hero-card">
            <div className="hero-banner"><div className="hero-banner-pattern" /></div>
            <div className="hero-body">
              <div className="hero-avatar-row">
                <div className="hero-avatar-wrap">
                  <div className="hero-avatar" style={{ background: avatarPalette.bg, color: avatarPalette.color }}>
                    {profile.avatarInitials}
                  </div>
                  {editing && (
                    <>
                      <div className="avatar-camera-btn" onClick={() => fileRef.current?.click()}>
                        <Camera size={12} color="white" />
                      </div>
                      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} />
                    </>
                  )}
                </div>
                <div className="verified-badge"><ShieldCheck size={13} /> Verified Client</div>
              </div>

              <h1 className="hero-name">{profile.name}</h1>
              <div className="hero-meta">
                {profile.location && (
                  <span className="hero-meta-item"><MapPin size={13} color="#AFAFAF" />{profile.location}</span>
                )}
                {profile.email && (
                  <span className="hero-meta-item"><Mail size={13} color="#AFAFAF" />{profile.email}</span>
                )}
                {profile.phone && (
                  <span className="hero-meta-item"><Phone size={13} color="#AFAFAF" />{profile.phone}</span>
                )}
                <span className="hero-meta-item">
                  <Clock size={13} color="#AFAFAF" />Member since {stats?.memberSince || profile.memberSince}
                </span>
              </div>
              {profile.bio && (
                <p style={{ fontSize: 14, color: '#6B6B6B', fontWeight: 300, lineHeight: 1.7, marginTop: 14, maxWidth: 500 }}>
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="stats-strip">
            {[
              {
                label: 'Total Jobs', bg: '#FFF3EE',
                icon: <Briefcase size={18} color="#FF5C1A" />,
                value: stats ? String(stats.totalJobs) : '—',
              },
              {
                label: 'Completed', bg: '#F0FDF4',
                icon: <CheckCircle size={18} color="#16A34A" />,
                value: stats ? String(stats.completedJobs) : '—',
              },
              {
                label: 'Avg Rating', bg: '#FFF8EE',
                icon: <Star size={18} color="#F59E0B" />,
                value: stats?.avgRating ? String(stats.avgRating) + '★' : 'N/A',
              },
              {
                label: 'Member Since', bg: '#EEF6FF',
                icon: <Calendar size={18} color="#2563EB" />,
                value: stats?.memberSince || '—',
              },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                <div>
                  <div className="stat-val" style={{ fontSize: s.label === 'Member Since' ? 15 : 22 }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Edit form */}
          {editing && (
            <div className="edit-card">
              <p className="edit-card-title"><Edit3 size={16} color="#FF5C1A" /> Edit Information</p>
              <div className="edit-grid">
                <div className="edit-field">
                  <label className="edit-label">Full Name</label>
                  <input className="edit-input" value={form.name} onChange={set('name')} placeholder="Your full name" />
                </div>
                <div className="edit-field">
                  <label className="edit-label">Location</label>
                  <div className="edit-input-wrap">
                    <MapPin size={15} className="edit-input-icon" />
                    <input value={form.location} onChange={set('location')} placeholder="City, Country" />
                  </div>
                </div>
                <div className="edit-field">
                  <label className="edit-label">Email Address</label>
                  <div className="edit-input-wrap">
                    <Mail size={15} className="edit-input-icon" />
                    <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
                  </div>
                </div>
                <div className="edit-field">
                  <label className="edit-label">Phone Number</label>
                  <div className="edit-input-wrap">
                    <Phone size={15} className="edit-input-icon" />
                    <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+1 234 567 8900" />
                  </div>
                </div>
                <div className="edit-field full">
                  <label className="edit-label">Bio</label>
                  <textarea
                    className="edit-input edit-textarea"
                    value={form.bio}
                    onChange={set('bio')}
                    placeholder="Tell workers a bit about yourself…"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="activity-card">
            <div className="activity-title">
              Recent Activity
              <Link href="/orders" className="activity-view-all">View all <ChevronRight size={14} /></Link>
            </div>
            {recentBookings.length === 0 ? (
              <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 15, color: '#0F0F0F', marginBottom: 6 }}>No bookings yet</p>
                <p style={{ fontSize: 13, color: '#6B6B6B', fontWeight: 300 }}>Your recent bookings will appear here.</p>
                <Link href="/explore" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14, background: '#FF5C1A', color: 'white', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 13, borderRadius: 9, padding: '8px 18px', textDecoration: 'none' }}>
                  Find a Worker
                </Link>
              </div>
            ) : (
              recentBookings.map(a => {
                const st = statusStyle[a.status] || statusStyle.pending
                return (
                  <Link key={a.id} href={`/orders/${a.id}`} className="activity-item">
                    <div className="activity-avatar" style={{ background: a.bg, color: a.color }}>{a.initials}</div>
                    <div style={{ flex: 1 }}>
                      <p className="activity-label">{a.label}</p>
                      <div className="activity-meta">
                        <span className="activity-date"><Calendar size={10} />{a.date}</span>
                        <span className="activity-status" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                      </div>
                    </div>
                    <ChevronRight size={16} color="#AFAFAF" />
                  </Link>
                )
              })
            )}
          </div>

          {/* Quick links */}
          <div className="quick-links">
            {[
              { href: '/orders',    icon: <BookOpen size={18} color="#FF5C1A" />,    bg: '#FFF3EE', label: 'My Orders',    sub: `${stats?.totalJobs ?? 0} total bookings`   },
              { href: '/settings',  icon: <Settings size={18} color="#2563EB" />,     bg: '#EEF6FF', label: 'Settings',     sub: 'Account preferences' },
              { href: '/explore',   icon: <Star size={18} color="#D97706" />,          bg: '#FFF8EE', label: 'Find Workers',  sub: 'Browse 50K+ artisans' },
              { href: '/assistant', icon: <ShieldCheck size={18} color="#16A34A" />,  bg: '#F0FDF4', label: 'AI Assistant',  sub: 'Get instant help'    },
            ].map(q => (
              <Link key={q.href} href={q.href} className="quick-link-card">
                <div className="ql-icon" style={{ background: q.bg }}>{q.icon}</div>
                <div>
                  <p className="ql-label">{q.label}</p>
                  <p className="ql-sub">{q.sub}</p>
                </div>
                <ChevronRight size={15} color="#AFAFAF" style={{ marginLeft: 'auto', flexShrink: 0 }} />
              </Link>
            ))}
          </div>

        </div>
      </div>
    </>
  )
}