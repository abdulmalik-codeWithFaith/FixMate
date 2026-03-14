'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, ArrowRight, Star, Users, Briefcase, HeadphonesIcon } from 'lucide-react'

// ─── TYPES ───────────────────────────────────────────────────────────────────

type Role = 'client' | 'worker' | 'assistant'

interface FormData {
  name: string
  email: string
  phone: string
  location: string
  password: string
  confirmPassword: string
  role: Role
  // worker-only
  skillCategory: string
  experience: string
  bio: string
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const S = `
  .auth-page {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  /* ── LEFT PANEL ── */
  .auth-left {
    background: #0F0F0F;
    position: relative;
    display: flex; flex-direction: column;
    justify-content: space-between;
    padding: 48px; overflow: hidden;
  }
  .auth-left-glow {
    position: absolute; width: 500px; height: 500px; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,92,26,0.18) 0%, transparent 70%);
    top: -100px; left: -100px; pointer-events: none;
  }
  .auth-left-glow2 {
    position: absolute; width: 400px; height: 400px; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,92,26,0.10) 0%, transparent 70%);
    bottom: -80px; right: -80px; pointer-events: none;
  }
  .auth-grid-lines {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
  }
  .auth-logo {
    display: flex; align-items: center; gap: 10px;
    text-decoration: none; position: relative; z-index: 1;
  }
  .auth-logo-icon {
    width: 38px; height: 38px; background: #FF5C1A;
    border-radius: 11px; display: flex; align-items: center; justify-content: center;
  }
  .auth-logo-text { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; color: white; }
  .auth-logo-text span { color: #FF5C1A; }

  /* Left content */
  .auth-left-content { position: relative; z-index: 1; }
  .auth-hero-label {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(255,92,26,0.15); border: 1px solid rgba(255,92,26,0.3);
    color: #FF5C1A; font-family: 'Syne', sans-serif;
    font-size: 12px; font-weight: 600; letter-spacing: 1px;
    text-transform: uppercase; padding: 6px 12px; border-radius: 100px;
    margin-bottom: 24px;
  }
  .auth-hero-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(30px, 3vw, 44px); font-weight: 800;
    letter-spacing: -1.5px; color: white; line-height: 1.1; margin-bottom: 18px;
  }
  .auth-hero-title em { color: #FF5C1A; font-style: normal; }
  .auth-hero-sub {
    font-size: 15px; color: rgba(255,255,255,0.5);
    font-weight: 300; line-height: 1.75; max-width: 380px; margin-bottom: 36px;
  }

  /* Role cards */
  .role-cards { display: flex; flex-direction: column; gap: 12px; margin-bottom: 40px; }
  .role-info-card {
    display: flex; align-items: flex-start; gap: 14px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px; padding: 16px; transition: all 0.2s;
  }
  .role-info-card:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,92,26,0.3); }
  .role-info-icon {
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .role-info-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: white; margin-bottom: 3px; }
  .role-info-sub { font-size: 12px; color: rgba(255,255,255,0.45); font-weight: 300; line-height: 1.5; }

  /* Stats row */
  .left-stats {
    position: relative; z-index: 1;
    display: grid; grid-template-columns: repeat(3,1fr); gap: 12px;
  }
  .left-stat {
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px; padding: 16px; text-align: center;
  }
  .left-stat-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: white; }
  .left-stat-val em { color: #FF5C1A; font-style: normal; }
  .left-stat-label { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 3px; }

  /* ── RIGHT PANEL ── */
  .auth-right {
    background: #FAFAF8;
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    padding: 40px 64px; overflow-y: auto;
  }
  .auth-form-wrap { width: 100%; max-width: 420px; }

  .form-top { margin-bottom: 28px; }
  .form-title { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -1px; color: #0F0F0F; margin-bottom: 6px; }
  .form-sub { font-size: 14px; color: #6B6B6B; font-weight: 300; }

  /* Google */
  .google-btn {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
    background: white; border: 1.5px solid #E8E6E1;
    border-radius: 12px; padding: 12px;
    font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600;
    color: #0F0F0F; cursor: pointer; transition: all 0.2s; margin-bottom: 20px;
  }
  .google-btn:hover { border-color: #0F0F0F; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
  .google-icon { width: 20px; height: 20px; }

  .divider {
    display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
  }
  .divider-line { flex: 1; height: 1px; background: #E8E6E1; }
  .divider-text { font-size: 12px; color: #AFAFAF; font-weight: 500; white-space: nowrap; }

  /* ROLE SELECTOR */
  .role-selector { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-bottom: 20px; }
  .role-btn {
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    background: white; border: 1.5px solid #E8E6E1;
    border-radius: 12px; padding: 14px 8px;
    cursor: pointer; transition: all 0.2s; font-family: 'Syne', sans-serif;
  }
  .role-btn:hover { border-color: #FF5C1A; }
  .role-btn.selected { border-color: #FF5C1A; background: #FFF3EE; }
  .role-btn-icon {
    width: 36px; height: 36px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    background: #F5F4F1; transition: background 0.2s;
  }
  .role-btn.selected .role-btn-icon { background: #FF5C1A; }
  .role-btn-label { font-size: 12px; font-weight: 700; color: #6B6B6B; transition: color 0.2s; }
  .role-btn.selected .role-btn-label { color: #FF5C1A; }

  /* Fields */
  .field { margin-bottom: 14px; }
  .field-label {
    display: block; font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 600; color: #0F0F0F; margin-bottom: 6px;
  }
  .field-label span { color: #FF5C1A; }
  .field-wrap {
    display: flex; align-items: center; gap: 10px;
    background: white; border: 1.5px solid #E8E6E1;
    border-radius: 12px; padding: 11px 14px;
    transition: border-color 0.2s;
  }
  .field-wrap:focus-within { border-color: #FF5C1A; box-shadow: 0 0 0 3px rgba(255,92,26,0.08); }
  .field-wrap input, .field-wrap textarea, .field-wrap select {
    flex: 1; border: none; outline: none; background: transparent;
    font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F;
    resize: none;
  }
  .field-wrap input::placeholder,
  .field-wrap textarea::placeholder { color: #AFAFAF; }
  .field-wrap select { color: #0F0F0F; }
  .field-icon { color: #AFAFAF; flex-shrink: 0; }
  .field-action { background: none; border: none; cursor: pointer; color: #AFAFAF; display: flex; padding: 0; }
  .field-action:hover { color: #6B6B6B; }

  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  /* Worker extra fields */
  .worker-section {
    background: #FFF3EE; border: 1px solid rgba(255,92,26,0.2);
    border-radius: 14px; padding: 18px; margin-bottom: 14px;
  }
  .worker-section-label {
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px;
    color: #FF5C1A; margin-bottom: 14px; display: flex; align-items: center; gap: 6px;
  }

  .error-msg { font-size: 12px; color: #EF4444; margin-top: 4px; }
  .field-error { border-color: #EF4444 !important; }

  /* Password strength */
  .strength-bar { display: flex; gap: 4px; margin-top: 8px; }
  .strength-seg {
    flex: 1; height: 3px; border-radius: 2px; background: #E8E6E1;
    transition: background 0.3s;
  }
  .strength-label { font-size: 11px; color: #6B6B6B; margin-top: 4px; }

  /* Terms */
  .terms-row {
    display: flex; align-items: flex-start; gap: 10px;
    margin-bottom: 20px; margin-top: 4px;
  }
  .terms-box {
    width: 18px; height: 18px; border-radius: 5px;
    border: 1.5px solid #E8E6E1; background: white;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; cursor: pointer; margin-top: 1px; transition: all 0.2s;
  }
  .terms-box.checked { background: #FF5C1A; border-color: #FF5C1A; }
  .terms-text { font-size: 13px; color: #6B6B6B; line-height: 1.5; }
  .terms-text a { color: #FF5C1A; text-decoration: none; font-weight: 600; }
  .terms-text a:hover { text-decoration: underline; }

  .submit-btn {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
    background: #FF5C1A; color: white;
    font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 600;
    border: none; border-radius: 12px; padding: 14px;
    cursor: pointer; transition: all 0.2s; margin-bottom: 20px;
  }
  .submit-btn:hover { background: #FF7A40; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(255,92,26,0.25); }
  .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  .form-footer { text-align: center; font-size: 14px; color: #6B6B6B; }
  .form-footer a { font-family: 'Syne', sans-serif; font-weight: 700; color: #FF5C1A; text-decoration: none; }
  .form-footer a:hover { text-decoration: underline; }

  @media (max-width: 900px) {
    .auth-page { grid-template-columns: 1fr; }
    .auth-left { display: none; }
    .auth-right { padding: 40px 24px; min-height: 100vh; }
    .auth-form-wrap { max-width: 100%; }
    .two-col { grid-template-columns: 1fr; }
  }
`

// ─── COMPONENT ───────────────────────────────────────────────────────────────

const skillCategories = ['Plumber', 'Electrician', 'Carpenter', 'Painter', 'Tiler', 'AC Technician', 'Generator Technician', 'Other']
const experienceLevels = ['Less than 1 year', '1–3 years', '3–5 years', '5–10 years', '10+ years']

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 8)        score++
  if (/[A-Z]/.test(pw))     score++
  if (/[0-9]/.test(pw))     score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const map = [
    { score: 1, label: 'Weak',      color: '#EF4444' },
    { score: 2, label: 'Fair',      color: '#F59E0B' },
    { score: 3, label: 'Good',      color: '#3B82F6' },
    { score: 4, label: 'Strong',    color: '#22C55E' },
  ]
  return map[score - 1] ?? { score: 0, label: '', color: '' }
}

export default function RegisterPage() {
  const [form, setForm] = useState<FormData>({
    name: '', email: '', phone: '', location: '',
    password: '', confirmPassword: '',
    role: 'client',
    skillCategory: '', experience: '', bio: '',
  })
  const [showPassword, setShowPassword]  = useState(false)
  const [showConfirm, setShowConfirm]    = useState(false)
  const [agreed, setAgreed]              = useState(false)
  const [errors, setErrors]              = useState<Partial<Record<keyof FormData | 'terms', string>>>({})

  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(p => ({ ...p, [key]: e.target.value }))
    setErrors(p => ({ ...p, [key]: '' }))
  }

  const pwStrength = getPasswordStrength(form.password)

  const validate = () => {
    const e: Partial<Record<keyof FormData | 'terms', string>> = {}
    if (!form.name.trim())                        e.name            = 'Full name is required'
    if (!form.email)                              e.email           = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email))   e.email           = 'Enter a valid email'
    if (!form.phone)                              e.phone           = 'Phone number is required'
    if (!form.location.trim())                    e.location        = 'Location is required'
    if (!form.password)                           e.password        = 'Password is required'
    else if (form.password.length < 6)            e.password        = 'Must be at least 6 characters'
    if (form.confirmPassword !== form.password)   e.confirmPassword = 'Passwords do not match'
    if (form.role === 'worker') {
      if (!form.skillCategory)                    e.skillCategory   = 'Please select a skill'
      if (!form.experience)                       e.experience      = 'Please select experience level'
      if (!form.bio.trim())                       e.bio             = 'Please write a short bio'
    }
    if (!agreed)                                  e.terms           = 'You must agree to the terms'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      // TODO: Firebase createUserWithEmailAndPassword
      console.log('Register', form)
    }
  }

  const roles: { key: Role; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'client',    label: 'Client',    icon: <User size={18} />,            color: '#2563EB' },
    { key: 'worker',    label: 'Worker',    icon: <Briefcase size={18} />,       color: '#FF5C1A' },
    { key: 'assistant', label: 'Assistant', icon: <HeadphonesIcon size={18} />,  color: '#16A34A' },
  ]

  return (
    <>
      <style>{S}</style>
      <div className="auth-page mt-10">

        <div className="auth-left">
          <div className="auth-left-glow" />
          <div className="auth-left-glow2" />
          <div className="auth-grid-lines" />

          <Link href="/" className="auth-logo">
            <div className="auth-logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M13.78 15.3 19.78 21.3 21.89 19.14 15.89 13.14 13.78 15.3M17.5 10.1C17.11 10.1 16.69 10.05 16.36 9.96L4.97 21.25 2.86 19.14 8 14 6 12 7.07 10.93 9.15 13 10.09 12.06 8 10 9.07 8.93 11.15 11 12.09 10.06 10 8 11.07 6.93 13.15 9 14.3 7.85C14.1 7.31 14 6.71 14 6.1 14 3.32 16.24 1.1 19.02 1.1 19.72 1.1 20.34 1.27 20.95 1.52L18.31 4.16 19.95 5.79 22.59 3.15C22.84 3.75 23 4.37 23 5.07 23 7.85 20.78 10.07 18 10.07L17.5 10.1Z"/>
              </svg>
            </div>
            <span className="auth-logo-text">Fix<span>Mate</span></span>
          </Link>

          <div className="auth-left-content">
            <div className="auth-hero-label">
              <span style={{ width: 6, height: 6, background: '#FF5C1A', borderRadius: '50%', display: 'inline-block' }} />
              Join FixMate Today
            </div>
            <h2 className="auth-hero-title">
              Choose your<br /><em>role</em> and get<br />started
            </h2>
            <p className="auth-hero-sub">
              Whether you need work done or you're ready to offer your skills — FixMate has a place for you.
            </p>

            <div className="role-cards">
              {[
                { icon: <User size={18} color="#2563EB" />,           bg: 'rgba(37,99,235,0.15)',   border: 'rgba(37,99,235,0.25)',   title: 'Client',    sub: 'Post jobs, find verified workers and book services near you in minutes.' },
                { icon: <Briefcase size={18} color="#FF5C1A" />,      bg: 'rgba(255,92,26,0.15)',   border: 'rgba(255,92,26,0.25)',   title: 'Worker / Artisan', sub: 'Showcase your skills, receive bookings and grow your client base globally.' },
                { icon: <HeadphonesIcon size={18} color="#16A34A" />, bg: 'rgba(22,163,74,0.15)',   border: 'rgba(22,163,74,0.25)',   title: 'Assistant', sub: 'Support clients and workers — manage bookings, disputes and platform operations.' },
              ].map(r => (
                <div key={r.title} className="role-info-card">
                  <div className="role-info-icon" style={{ background: r.bg, border: `1px solid ${r.border}` }}>
                    {r.icon}
                  </div>
                  <div>
                    <p className="role-info-title">{r.title}</p>
                    <p className="role-info-sub">{r.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="left-stats">
            {[
              { val: '50K+', label: 'Workers' },
              { val: '150+', label: 'Countries' },
              { val: '4.8★', label: 'Avg Rating' },
            ].map(s => (
              <div key={s.label} className="left-stat">
                <div className="left-stat-val">
                  {s.val.replace('+','').replace('★','')}
                  <em>{s.val.includes('+') ? '+' : '★'}</em>
                </div>
                <div className="left-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="auth-right">
          <div className="auth-form-wrap">
            <div className="form-top">
              <h1 className="form-title">Create account</h1>
              <p className="form-sub">Join thousands of people using FixMate worldwide</p>
            </div>

            {/* Google */}
            <button className="google-btn">
              <svg className="google-icon" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">or register with email</span>
              <div className="divider-line" />
            </div>

            <form onSubmit={handleSubmit} noValidate>

              {/* Role selector */}
              <div style={{ marginBottom: 18 }}>
                <label className="field-label">I am a <span>*</span></label>
                <div className="role-selector">
                  {roles.map(r => (
                    <button
                      key={r.key}
                      type="button"
                      className={`role-btn${form.role === r.key ? ' selected' : ''}`}
                      onClick={() => { setForm(p => ({ ...p, role: r.key })); setErrors({}) }}
                    >
                      <div className="role-btn-icon" style={form.role === r.key ? { background: r.color } : {}}>
                        <span style={{ color: form.role === r.key ? 'white' : '#6B6B6B' }}>{r.icon}</span>
                      </div>
                      <span className="role-btn-label">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

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
                    <input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
                  </div>
                  {errors.email && <p className="error-msg">{errors.email}</p>}
                </div>
                <div className="field">
                  <label className="field-label">Phone <span>*</span></label>
                  <div className={`field-wrap${errors.phone ? ' field-error' : ''}`}>
                    <Phone size={16} className="field-icon" />
                    <input type="tel" placeholder="+1 555 000 0000" value={form.phone} onChange={set('phone')} />
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
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={set('password')}
                    />
                    <button type="button" className="field-action" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {form.password && (
                    <>
                      <div className="strength-bar">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="strength-seg"
                            style={{ background: i <= pwStrength.score ? pwStrength.color : '#E8E6E1' }} />
                        ))}
                      </div>
                      <p className="strength-label" style={{ color: pwStrength.color }}>{pwStrength.label}</p>
                    </>
                  )}
                  {errors.password && <p className="error-msg">{errors.password}</p>}
                </div>
                <div className="field">
                  <label className="field-label">Confirm <span>*</span></label>
                  <div className={`field-wrap${errors.confirmPassword ? ' field-error' : ''}`}>
                    <Lock size={16} className="field-icon" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.confirmPassword}
                      onChange={set('confirmPassword')}
                    />
                    <button type="button" className="field-action" onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="error-msg">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Worker extra fields */}
              {form.role === 'worker' && (
                <div className="worker-section">
                  <p className="worker-section-label">
                    <Briefcase size={14} /> Worker Details
                  </p>

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
                      <label className="field-label">Experience <span>*</span></label>
                      <div className={`field-wrap${errors.experience ? ' field-error' : ''}`}>
                        <select value={form.experience} onChange={set('experience')}>
                          <option value="">Select…</option>
                          {experienceLevels.map(e => <option key={e}>{e}</option>)}
                        </select>
                      </div>
                      {errors.experience && <p className="error-msg">{errors.experience}</p>}
                    </div>
                  </div>

                  <div className="field" style={{ marginBottom: 0 }}>
                    <label className="field-label">Short Bio <span>*</span></label>
                    <div className={`field-wrap${errors.bio ? ' field-error' : ''}`} style={{ alignItems: 'flex-start' }}>
                      <textarea
                        rows={3}
                        placeholder="Describe your skills and experience in a few sentences…"
                        value={form.bio}
                        onChange={set('bio')}
                        style={{ paddingTop: 2 }}
                      />
                    </div>
                    {errors.bio && <p className="error-msg">{errors.bio}</p>}
                  </div>
                </div>
              )}

              {/* Terms */}
              <div className="terms-row">
                <div className={`terms-box${agreed ? ' checked' : ''}`} onClick={() => { setAgreed(!agreed); setErrors(p => ({ ...p, terms: '' })) }}>
                  {agreed && <span style={{ color: 'white', fontSize: 11 }}>✓</span>}
                </div>
                <p className="terms-text">
                  I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
                  {errors.terms && <span style={{ display: 'block', color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.terms}</span>}
                </p>
              </div>

              <button type="submit" className="submit-btn" disabled={!agreed}>
                Create Account <ArrowRight size={17} />
              </button>
            </form>

            <p className="form-footer">
              Already have an account?{' '}
              <Link href="/login">Sign in →</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}