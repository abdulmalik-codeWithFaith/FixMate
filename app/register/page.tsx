'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, ArrowRight, Briefcase } from 'lucide-react'
import Image from 'next/image'
import Logo from "@/public/logo.svg"

// Firebase Imports
import { auth, db } from '@/lib/firebase' 
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
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

// ─── STYLES (RETAINED EXACTLY) ────────────────────────────────────────────────
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
  .role-info-card { display: flex; align-items: flex-start; gap: 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; transition: all 0.2s; }
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
  .divider { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
  .divider-line { flex: 1; height: 1px; background: #E8E6E1; }
  .divider-text { font-size: 12px; color: #AFAFAF; font-weight: 500; white-space: nowrap; }
  .role-selector { display: grid; grid-template-columns: repeat(2,1fr); gap: 8px; margin-bottom: 20px; }
  .role-btn { display: flex; flex-direction: column; align-items: center; gap: 6px; background: white; border: 1.5px solid #E8E6E1; border-radius: 12px; padding: 14px 8px; cursor: pointer; transition: all 0.2s; font-family: 'Syne', sans-serif; }
  .role-btn.selected { border-color: #FF5C1A; background: #FFF3EE; }
  .role-btn-icon { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; background: #F5F4F1; transition: background 0.2s; }
  .role-btn.selected .role-btn-icon { background: #FF5C1A; color: white !important; }
  .role-btn-label { font-size: 12px; font-weight: 700; color: #6B6B6B; }
  .role-btn.selected .role-btn-label { color: #FF5C1A; }
  .field { margin-bottom: 14px; }
  .field-label { display: block; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #0F0F0F; margin-bottom: 6px; }
  .field-label span { color: #FF5C1A; }
  .field-wrap { display: flex; align-items: center; gap: 10px; background: white; border: 1.5px solid #E8E6E1; border-radius: 12px; padding: 11px 14px; }
  .field-wrap:focus-within { border-color: #FF5C1A; }
  .field-wrap input, .field-wrap textarea, .field-wrap select { flex: 1; border: none; outline: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F; }
  .field-icon { color: #AFAFAF; flex-shrink: 0; }
  .field-action { background: none; border: none; cursor: pointer; color: #AFAFAF; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .worker-section { background: #FFF3EE; border: 1px solid rgba(255,92,26,0.2); border-radius: 14px; padding: 18px; margin-bottom: 14px; }
  .worker-section-label { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #FF5C1A; margin-bottom: 14px; display: flex; align-items: center; gap: 6px; }
  .error-msg { font-size: 12px; color: #EF4444; margin-top: 4px; }
  .field-error { border-color: #EF4444 !important; }
  .terms-row { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 20px; }
  .terms-box { width: 18px; height: 18px; border-radius: 5px; border: 1.5px solid #E8E6E1; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .terms-box.checked { background: #FF5C1A; border-color: #FF5C1A; }
  .submit-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; background: #FF5C1A; color: white; font-family: 'Syne', sans-serif; font-weight: 600; border: none; border-radius: 12px; padding: 14px; cursor: pointer; }
  .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .form-footer { text-align: center; font-size: 14px; color: #6B6B6B; margin-top: 20px; }
  .form-footer a { font-family: 'Syne', sans-serif; font-weight: 700; color: #FF5C1A; text-decoration: none; }
  @media (max-width: 900px) { .auth-page { grid-template-columns: 1fr; } .auth-left { display: none; } }
`

const skillCategories = ['Plumber', 'Electrician', 'Carpenter', 'Painter', 'Tiler', 'AC Technician', 'Generator Technician', 'Other']
const experienceLevels = ['Less than 1 year', '1–3 years', '3–5 years', '5–10 years', '10+ years']

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({
    name: '', email: '', phone: '', location: '',
    password: '', confirmPassword: '', role: 'client',
    skillCategory: '', experience: '', bio: '',
  })
  
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'terms', string>>>({})

  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(p => ({ ...p, [key]: e.target.value }))
    setErrors(p => ({ ...p, [key]: '' }))
  }

  const validate = () => {
    const e: Partial<Record<keyof FormData | 'terms', string>> = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.email) e.email = 'Email is required'
    if (!form.phone) e.phone = 'Phone number is required'
    if (!form.location.trim()) e.location = 'Location is required'
    if (form.password.length < 6) e.password = 'Min 6 characters'
    if (form.confirmPassword !== form.password) e.confirmPassword = 'Mismatch'
    if (form.role === 'worker') {
      if (!form.skillCategory) e.skillCategory = 'Required'
      if (!form.bio.trim()) e.bio = 'Required'
    }
    if (!agreed) e.terms = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // UPDATED GOOGLE LOGIN WITH PREREQUISITE CHECK
  const handleGoogleLogin = async () => {
    if (!agreed) {
        toast.error("Please agree to the Terms and Privacy Policy first")
        return
    }

    setLoading(true)
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // Check if profile exists; if not, create it with the selected role
      const docRef = doc(db, "profiles", user.uid)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          uid: user.uid,
          full_name: user.displayName,
          email: user.email,
          role: form.role, // Saves the role chosen in your UI
          createdAt: new Date().toISOString()
        })
      }

      toast.success(`Welcome ${user.displayName}`)
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Please correct the errors')
      return
    }

    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password)
      const user = userCredential.user

      await setDoc(doc(db, "profiles", user.uid), {
        uid: user.uid,
        full_name: form.name,
        email: form.email,
        phone: form.phone,
        location: form.location,
        role: form.role,
        ...(form.role === 'worker' && {
          skill_category: form.skillCategory,
          experience: form.experience,
          bio: form.bio,
        }),
        createdAt: new Date().toISOString()
      })

      toast.success('Account created successfully!')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{S}</style>
      <Toaster position="top-right" />
      <div className="auth-page">
        <div className="auth-left">
          <div className="auth-left-glow" /><div className="auth-left-glow2" /><div className="auth-grid-lines" />
          <Link href="/" className="auth-logo">
            <Image src={Logo} alt='logo' width={50} />
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
            {[{v:'50K', l:'Workers'}, {v:'150', l:'Cities'}, {v:'4.8', l:'Rating'}].map(s=>(
              <div key={s.l} className="left-stat">
                <div className="left-stat-val">{s.v}<em>+</em></div>
                <div className="left-stat-label">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-wrap">
            <div className="form-top">
              <h1 className="form-title">Create account</h1>
              <p className="form-sub">Join thousands of people using FixMate worldwide</p>
            </div>

            {/* ROLE SELECTOR (MOVED UP FOR BETTER FLOW) */}
            <div className="role-selector">
                {(['client', 'worker'] as Role[]).map(r => (
                  <button key={r} type="button" className={`role-btn${form.role === r ? ' selected' : ''}`} onClick={() => setForm(p => ({ ...p, role: r }))}>
                    <div className="role-btn-icon"><User size={18} color={form.role === r ? 'white' : '#6B6B6B'} /></div>
                    <span className="role-btn-label">{r.toUpperCase()}</span>
                  </button>
                ))}
            </div>

            {/* TERMS CHECKBOX (MOVED UP TO BE VISIBLE FOR GOOGLE LOGIN) */}
            <div className="terms-row" style={{marginBottom: '15px'}}>
                <div className={`terms-box${agreed ? ' checked' : ''}`} onClick={() => setAgreed(!agreed)}>
                  {agreed && <span style={{ color: 'white', fontSize: 11 }}>✓</span>}
                </div>
                <p style={{fontSize: '12px', color: '#0F0F0F'}}>I agree to the <b>Terms & Privacy Policy</b></p>
            </div>

            <button className="google-btn" onClick={handleGoogleLogin} type="button" disabled={loading}>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt="google" />
              Continue with Google
            </button>

            <div className="divider"><div className="divider-line" /><span className="divider-text">or register with email</span><div className="divider-line" /></div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label className="field-label">Full name <span>*</span></label>
                <div className={`field-wrap ${errors.name ? 'field-error' : ''}`}>
                  <User size={16} className="field-icon" /><input type="text" placeholder="John Smith" value={form.name} onChange={set('name')} />
                </div>
              </div>

              <div className="two-col">
                <div className="field">
                  <label className="field-label">Email <span>*</span></label>
                  <div className={`field-wrap ${errors.email ? 'field-error' : ''}`}>
                    <Mail size={16} className="field-icon" /><input type="email" placeholder="you@mail.com" value={form.email} onChange={set('email')} />
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">Phone <span>*</span></label>
                  <div className={`field-wrap ${errors.phone ? 'field-error' : ''}`}>
                    <Phone size={16} className="field-icon" /><input type="tel" placeholder="+1..." value={form.phone} onChange={set('phone')} />
                  </div>
                </div>
              </div>

              <div className="field">
                <label className="field-label">Location <span>*</span></label>
                <div className={`field-wrap ${errors.location ? 'field-error' : ''}`}>
                  <MapPin size={16} className="field-icon" /><input type="text" placeholder="City, State" value={form.location} onChange={set('location')} />
                </div>
              </div>

              <div className="two-col">
                <div className="field">
                  <label className="field-label">Password <span>*</span></label>
                  <div className="field-wrap">
                    <Lock size={16} className="field-icon" />
                    <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')} />
                    <button type="button" className="field-action" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={15}/> : <Eye size={15}/>}</button>
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">Confirm <span>*</span></label>
                  <div className="field-wrap">
                    <Lock size={16} className="field-icon" />
                    <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')} />
                  </div>
                </div>
              </div>

              {form.role === 'worker' && (
                <div className="worker-section">
                  <p className="worker-section-label"><Briefcase size={14} /> Worker Details</p>
                  <div className="two-col">
                    <div className="field">
                      <select value={form.skillCategory} onChange={set('skillCategory')}>
                        <option value="">Select skill...</option>
                        {skillCategories.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <select value={form.experience} onChange={set('experience')}>
                        <option value="">Experience...</option>
                        {experienceLevels.map(e => <option key={e}>{e}</option>)}
                      </select>
                    </div>
                  </div>
                  <textarea className="field-wrap" rows={2} placeholder="Brief bio..." value={form.bio} onChange={set('bio')} style={{width: '100%', border: '1.5px solid #E8E6E1'}} />
                </div>
              )}

              <button type="submit" className="submit-btn" style={{marginTop: '20px'}} disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={17} />
              </button>
            </form>
            <p className="form-footer">Already have an account? <Link href="/login">Sign in →</Link></p>
          </div>
        </div>
      </div>
    </>
  )
}