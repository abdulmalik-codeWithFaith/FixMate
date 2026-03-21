'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, ArrowRight, Briefcase } from 'lucide-react'
import Image from 'next/image'
import Logo from "@/public/logo.svg"

// Firebase Imports
import { auth, db } from '@/lib/firebase'
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import toast, { Toaster } from 'react-hot-toast'

type Role = 'client' | 'worker'

interface FormData {
  name: string
  email: string
  phone: string
  location: string
  password: string
  confirmPassword: string
  role: Role
  skillCategory: string
  experience: string
  bio: string
}

const S = `
  .auth-page { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; }
  .auth-left { background: #0F0F0F; position: relative; display: flex; flex-direction: column; justify-content: space-between; padding: 48px; overflow: hidden; }
  .auth-left-glow { position: absolute; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(255,92,26,0.18) 0%, transparent 70%); top: -100px; left: -100px; pointer-events: none; }
  .auth-left-glow2 { position: absolute; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(255,92,26,0.10) 0%, transparent 70%); bottom: -80px; right: -80px; pointer-events: none; }
  .auth-grid-lines { position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 60px 60px; }
  .auth-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; position: relative; z-index: 1; }
  .auth-logo-text { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; color: white; }
  .auth-logo-text span { color: #FF5C1A; }
  .auth-left-content { position: relative; z-index: 1; }
  .auth-hero-label { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,92,26,0.15); border: 1px solid rgba(255,92,26,0.3); color: #FF5C1A; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; padding: 6px 12px; border-radius: 100px; margin-bottom: 24px; }
  .auth-hero-title { font-family: 'Syne', sans-serif; font-size: clamp(30px, 3vw, 44px); font-weight: 800; letter-spacing: -1.5px; color: white; line-height: 1.1; margin-bottom: 18px; }
  .auth-hero-title em { color: #FF5C1A; font-style: normal; }
  .auth-hero-sub { font-size: 15px; color: rgba(255,255,255,0.5); font-weight: 300; line-height: 1.75; max-width: 380px; margin-bottom: 36px; }
  .role-cards { display: flex; flex-direction: column; gap: 12px; margin-bottom: 40px; }
  .role-info-card { display: flex; align-items: flex-start; gap: 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; }
  .role-info-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .role-info-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: white; margin-bottom: 3px; }
  .role-info-sub { font-size: 12px; color: rgba(255,255,255,0.45); font-weight: 300; line-height: 1.5; }
  .left-stats { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
  .left-stat { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; text-align: center; }
  .left-stat-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: white; }
  .left-stat-val em { color: #FF5C1A; font-style: normal; }
  .left-stat-label { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 3px; }
  .auth-right { background: #FAFAF8; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 40px 64px; overflow-y: auto; }
  .auth-form-wrap { width: 100%; max-width: 420px; }
  .form-top { margin-bottom: 28px; }
  .form-title { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -1px; color: #0F0F0F; margin-bottom: 6px; }
  .form-sub { font-size: 14px; color: #6B6B6B; font-weight: 300; }
  .google-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; background: white; border: 1.5px solid #E8E6E1; border-radius: 12px; padding: 12px; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; color: #0F0F0F; cursor: pointer; transition: all 0.2s; margin-bottom: 20px; }
  .google-btn:hover:not(:disabled) { border-color: #0F0F0F; }
  .google-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .divider { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
  .divider-line { flex: 1; height: 1px; background: #E8E6E1; }
  .divider-text { font-size: 12px; color: #AFAFAF; font-weight: 500; white-space: nowrap; }
  .role-selector { display: grid; grid-template-columns: repeat(2,1fr); gap: 8px; margin-bottom: 20px; }
  .role-btn { display: flex; flex-direction: column; align-items: center; gap: 6px; background: white; border: 1.5px solid #E8E6E1; border-radius: 12px; padding: 14px 8px; cursor: pointer; transition: all 0.2s; font-family: 'Syne', sans-serif; }
  .role-btn.selected { border-color: #FF5C1A; background: #FFF3EE; }
  .role-btn-icon { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; background: #F5F4F1; transition: background 0.2s; }
  .role-btn.selected .role-btn-icon { background: #FF5C1A; }
  .role-btn-label { font-size: 12px; font-weight: 700; color: #6B6B6B; }
  .role-btn.selected .role-btn-label { color: #FF5C1A; }
  .field { margin-bottom: 14px; }
  .field-label { display: block; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #0F0F0F; margin-bottom: 6px; }
  .field-label span { color: #FF5C1A; }
  .field-wrap { display: flex; align-items: center; gap: 10px; background: white; border: 1.5px solid #E8E6E1; border-radius: 12px; padding: 11px 14px; transition: border-color 0.2s; }
  .field-wrap:focus-within { border-color: #FF5C1A; box-shadow: 0 0 0 3px rgba(255,92,26,0.08); }
  .field-wrap input, .field-wrap textarea, .field-wrap select { flex: 1; border: none; outline: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F; }
  .field-wrap input::placeholder, .field-wrap textarea::placeholder { color: #AFAFAF; }
  .field-icon { color: #AFAFAF; flex-shrink: 0; }
  .field-action { background: none; border: none; cursor: pointer; color: #AFAFAF; display: flex; padding: 0; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .worker-section { background: #FFF3EE; border: 1px solid rgba(255,92,26,0.2); border-radius: 14px; padding: 18px; margin-bottom: 14px; }
  .worker-section-label { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #FF5C1A; margin-bottom: 14px; display: flex; align-items: center; gap: 6px; }
  .error-msg { font-size: 12px; color: #EF4444; margin-top: 4px; }
  .field-error { border-color: #EF4444 !important; box-shadow: none !important; }
  .terms-row { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 20px; }
  .terms-box { width: 18px; height: 18px; border-radius: 5px; border: 1.5px solid #E8E6E1; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; }
  .terms-box.checked { background: #FF5C1A; border-color: #FF5C1A; }
  .submit-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; background: #FF5C1A; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 15px; border: none; border-radius: 12px; padding: 14px; cursor: pointer; transition: all 0.2s; }
  .submit-btn:hover:not(:disabled) { background: #FF7A40; }
  .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .form-footer { text-align: center; font-size: 14px; color: #6B6B6B; margin-top: 20px; }
  .form-footer a { font-family: 'Syne', sans-serif; font-weight: 700; color: #FF5C1A; text-decoration: none; }
  @media (max-width: 900px) { .auth-page { grid-template-columns: 1fr; } .auth-left { display: none; } .auth-right { padding: 40px 24px; } }
`

const skillCategories = ['Plumber','Electrician','Carpenter','Painter','Tiler','AC Technician','Generator Technician','Other']
const experienceLevels = ['Less than 1 year','1–3 years','3–5 years','5–10 years','10+ years']

// ─── HELPER: write the correct Firestore docs for each role ──────────────────
// CLIENT  → /users/{uid}
// WORKER  → /users/{uid}  (shared auth info)  +  /workers/{uid}  (public profile)
async function createUserDocs(uid: string, data: {
  name: string; email: string; phone: string; location: string; role: Role;
  skillCategory?: string; experience?: string; bio?: string;
}) {
  const now = serverTimestamp()
  const initials = data.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

  // Always write to /users/{uid}
  await setDoc(doc(db, 'users', uid), {
    uid,
    displayName:  data.name,
    name:         data.name,
    email:        data.email,
    phone:        data.phone,
    location:     data.location,
    role:         data.role,
    createdAt:    now,
    updatedAt:    now,
  })

  // If worker, ALSO write to /workers/{uid} (public-facing profile)
  if (data.role === 'worker') {
    const avatarPalettes = [
      { bg: '#FFF3EE', color: '#FF5C1A' },
      { bg: '#EEF6FF', color: '#2563EB' },
      { bg: '#F0FDF4', color: '#16A34A' },
      { bg: '#FFF8EE', color: '#D97706' },
    ]
    const palette = avatarPalettes[Math.floor(Math.random() * avatarPalettes.length)]

    await setDoc(doc(db, 'workers', uid), {
      uid,
      name:         data.name,
      initials,
      email:        data.email,
      phone:        data.phone,
      location:     data.location,
      skill:        data.skillCategory || 'General',
      exp:          data.experience    || '',
      bio:          data.bio           || '',
      rating:       5.0,
      jobs:         0,
      available:    true,
      avatarBg:     palette.bg,
      avatarColor:  palette.color,
      createdAt:    now,
      updatedAt:    now,
    })
  }
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({
    name: '', email: '', phone: '', location: '',
    password: '', confirmPassword: '', role: 'client',
    skillCategory: '', experience: '', bio: '',
  })
  const [loading, setLoading]       = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [agreed, setAgreed]         = useState(false)
  const [errors, setErrors]         = useState<Partial<Record<keyof FormData | 'terms', string>>>({})

  const set = (key: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm(p => ({ ...p, [key]: e.target.value }))
      setErrors(p => ({ ...p, [key]: '' }))
    }

  const validate = () => {
    const e: Partial<Record<keyof FormData | 'terms', string>> = {}
    if (!form.name.trim())                   e.name            = 'Full name is required'
    if (!form.email)                         e.email           = 'Email is required'
    if (!form.phone)                         e.phone           = 'Phone number is required'
    if (!form.location.trim())               e.location        = 'Location is required'
    if (form.password.length < 6)            e.password        = 'Min 6 characters'
    if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match'
    if (form.role === 'worker') {
      if (!form.skillCategory)               e.skillCategory   = 'Skill category is required'
      if (!form.bio.trim())                  e.bio             = 'Bio is required'
    }
    if (!agreed)                             e.terms           = 'Please agree to the terms'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── GOOGLE SIGN UP ─────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    if (!agreed) { toast.error('Please agree to the Terms and Privacy Policy first'); return }
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      const result   = await signInWithPopup(auth, provider)
      const user     = result.user

      // Check if already registered — don't overwrite existing profile
      const existing = await getDoc(doc(db, 'users', user.uid))
      if (!existing.exists()) {
        await createUserDocs(user.uid, {
          name:          user.displayName || '',
          email:         user.email       || '',
          phone:         '',
          location:      '',
          role:          form.role,
          skillCategory: form.role === 'worker' ? form.skillCategory : undefined,
          experience:    form.role === 'worker' ? form.experience    : undefined,
          bio:           form.role === 'worker' ? form.bio           : undefined,
        })
      }

      toast.success(`Welcome, ${user.displayName}!`)
      // Redirect workers to their dashboard, clients to main dashboard
      const redirect = sessionStorage.getItem('authRedirect')
      sessionStorage.removeItem('authRedirect')
      router.push(redirect || (form.role === 'worker' ? '/worker/dashboard' : '/dashboard'))
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error('Google sign-up failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── EMAIL REGISTRATION ─────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) { toast.error('Please fix the errors below'); return }

    setLoading(true)
    try {
      // 1. Create Firebase Auth account
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password)
      const user = cred.user

      // 2. Set displayName in Firebase Auth
      await updateProfile(user, { displayName: form.name.trim() })

      // 3. Write Firestore docs (users + workers if applicable)
      await createUserDocs(user.uid, {
        name:          form.name.trim(),
        email:         form.email.trim(),
        phone:         form.phone.trim(),
        location:      form.location.trim(),
        role:          form.role,
        skillCategory: form.role === 'worker' ? form.skillCategory : undefined,
        experience:    form.role === 'worker' ? form.experience    : undefined,
        bio:           form.role === 'worker' ? form.bio.trim()    : undefined,
      })

      toast.success('Account created successfully!')
      const redirect = sessionStorage.getItem('authRedirect')
      sessionStorage.removeItem('authRedirect')
      router.push(redirect || (form.role === 'worker' ? '/worker/dashboard' : '/dashboard'))
    } catch (err: any) {
      const code = err.code || ''
      if (code === 'auth/email-already-in-use') {
        toast.error('An account with this email already exists.')
        setErrors(p => ({ ...p, email: 'Email already in use' }))
      } else if (code === 'auth/invalid-email') {
        toast.error('Please enter a valid email address.')
        setErrors(p => ({ ...p, email: 'Invalid email address' }))
      } else if (code === 'auth/weak-password') {
        toast.error('Password is too weak. Use at least 6 characters.')
        setErrors(p => ({ ...p, password: 'Password too weak' }))
      } else {
        toast.error(err.message || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{S}</style>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />

      <div className="auth-page">
        {/* ── LEFT PANEL ── */}
        <div className="auth-left">
          <div className="auth-left-glow" /><div className="auth-left-glow2" /><div className="auth-grid-lines" />
          <Link href="/" className="auth-logo">
            <Image src={Logo} alt="FixMate logo" width={50} height={50} />
            <span className="auth-logo-text">Fix<span>Mate</span></span>
          </Link>
          <div className="auth-left-content">
            <div className="auth-hero-label">Join FixMate Today</div>
            <h2 className="auth-hero-title">Choose your<br /><em>role</em> and get<br />started</h2>
            <p className="auth-hero-sub">Whether you need work done or you're ready to offer your skills — FixMate has a place for you.</p>
            <div className="role-cards">
              <div className="role-info-card">
                <div className="role-info-icon" style={{ background: 'rgba(37,99,235,0.15)' }}><User size={18} color="#2563EB" /></div>
                <div><p className="role-info-title">Client</p><p className="role-info-sub">Post jobs and find verified workers near you.</p></div>
              </div>
              <div className="role-info-card">
                <div className="role-info-icon" style={{ background: 'rgba(255,92,26,0.15)' }}><Briefcase size={18} color="#FF5C1A" /></div>
                <div><p className="role-info-title">Worker / Artisan</p><p className="role-info-sub">Showcase your skills and grow your business.</p></div>
              </div>
            </div>
          </div>
          <div className="left-stats">
            {[{v:'50K',l:'Workers'},{v:'150',l:'Cities'},{v:'4.8',l:'Rating'}].map(s => (
              <div key={s.l} className="left-stat">
                <div className="left-stat-val">{s.v}<em>+</em></div>
                <div className="left-stat-label">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="auth-right">
          <div className="auth-form-wrap">
            <div className="form-top">
              <h1 className="form-title">Create account</h1>
              <p className="form-sub">Join thousands of people using FixMate worldwide</p>
            </div>

            {/* Role selector */}
            <div className="role-selector">
              {(['client', 'worker'] as Role[]).map(r => (
                <button key={r} type="button"
                  className={`role-btn${form.role === r ? ' selected' : ''}`}
                  onClick={() => setForm(p => ({ ...p, role: r }))}
                >
                  <div className="role-btn-icon">
                    {r === 'client'
                      ? <User size={18} color={form.role === r ? 'white' : '#6B6B6B'} />
                      : <Briefcase size={18} color={form.role === r ? 'white' : '#6B6B6B'} />
                    }
                  </div>
                  <span className="role-btn-label">{r.charAt(0).toUpperCase() + r.slice(1)}</span>
                </button>
              ))}
            </div>

            {/* Terms — shown early so Google sign-up works */}
            <div className="terms-row">
              <div className={`terms-box${agreed ? ' checked' : ''}`} onClick={() => setAgreed(!agreed)}>
                {agreed && <span style={{ color: 'white', fontSize: 11 }}>✓</span>}
              </div>
              <p style={{ fontSize: 13, color: errors.terms ? '#EF4444' : '#0F0F0F', lineHeight: 1.5 }}>
                I agree to the{' '}
                <Link href="/terms" style={{ color: '#FF5C1A', fontWeight: 600 }}>Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" style={{ color: '#FF5C1A', fontWeight: 600 }}>Privacy Policy</Link>
              </p>
            </div>

            {/* Google */}
            <button className="google-btn" type="button" onClick={handleGoogleLogin} disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {loading ? 'Processing…' : 'Continue with Google'}
            </button>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">or register with email</span>
              <div className="divider-line" />
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* Name */}
              <div className="field">
                <label className="field-label">Full name <span>*</span></label>
                <div className={`field-wrap${errors.name ? ' field-error' : ''}`}>
                  <User size={16} className="field-icon" />
                  <input type="text" placeholder="John Smith" value={form.name} onChange={set('name')} />
                </div>
                {errors.name && <p className="error-msg">{errors.name}</p>}
              </div>

              {/* Email + Phone */}
              <div className="two-col">
                <div className="field">
                  <label className="field-label">Email <span>*</span></label>
                  <div className={`field-wrap${errors.email ? ' field-error' : ''}`}>
                    <Mail size={16} className="field-icon" />
                    <input type="email" placeholder="you@mail.com" value={form.email} onChange={set('email')} />
                  </div>
                  {errors.email && <p className="error-msg">{errors.email}</p>}
                </div>
                <div className="field">
                  <label className="field-label">Phone <span>*</span></label>
                  <div className={`field-wrap${errors.phone ? ' field-error' : ''}`}>
                    <Phone size={16} className="field-icon" />
                    <input type="tel" placeholder="+1 234 567 8900" value={form.phone} onChange={set('phone')} />
                  </div>
                  {errors.phone && <p className="error-msg">{errors.phone}</p>}
                </div>
              </div>

              {/* Location */}
              <div className="field">
                <label className="field-label">Location <span>*</span></label>
                <div className={`field-wrap${errors.location ? ' field-error' : ''}`}>
                  <MapPin size={16} className="field-icon" />
                  <input type="text" placeholder="City, Country" value={form.location} onChange={set('location')} />
                </div>
                {errors.location && <p className="error-msg">{errors.location}</p>}
              </div>

              {/* Password */}
              <div className="two-col">
                <div className="field">
                  <label className="field-label">Password <span>*</span></label>
                  <div className={`field-wrap${errors.password ? ' field-error' : ''}`}>
                    <Lock size={16} className="field-icon" />
                    <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={set('password')} />
                    <button type="button" className="field-action" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && <p className="error-msg">{errors.password}</p>}
                </div>
                <div className="field">
                  <label className="field-label">Confirm <span>*</span></label>
                  <div className={`field-wrap${errors.confirmPassword ? ' field-error' : ''}`}>
                    <Lock size={16} className="field-icon" />
                    <input type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={form.confirmPassword} onChange={set('confirmPassword')} />
                    <button type="button" className="field-action" onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="error-msg">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Worker-only fields */}
              {form.role === 'worker' && (
                <div className="worker-section">
                  <p className="worker-section-label"><Briefcase size={14} /> Worker Details</p>
                  <div className="two-col">
                    <div className="field">
                      <label className="field-label">Skill Category <span>*</span></label>
                      <div className={`field-wrap${errors.skillCategory ? ' field-error' : ''}`}>
                        <select value={form.skillCategory} onChange={set('skillCategory')}>
                          <option value="">Select skill…</option>
                          {skillCategories.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      {errors.skillCategory && <p className="error-msg">{errors.skillCategory}</p>}
                    </div>
                    <div className="field">
                      <label className="field-label">Experience</label>
                      <div className="field-wrap">
                        <select value={form.experience} onChange={set('experience')}>
                          <option value="">Select…</option>
                          {experienceLevels.map(e => <option key={e}>{e}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="field">
                    <label className="field-label">Bio <span>*</span></label>
                    <div className={`field-wrap${errors.bio ? ' field-error' : ''}`}>
                      <textarea rows={2} placeholder="Describe your skills and experience…" value={form.bio} onChange={set('bio')} style={{ resize: 'none', width: '100%' }} />
                    </div>
                    {errors.bio && <p className="error-msg">{errors.bio}</p>}
                  </div>
                </div>
              )}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Creating Account…' : 'Create Account'} <ArrowRight size={17} />
              </button>
            </form>

            <p className="form-footer">
              Already have an account? <Link href="/login">Sign in →</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}