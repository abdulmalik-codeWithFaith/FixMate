'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Wrench, Star, Shield, Zap } from 'lucide-react'
import Image from 'next/image'
import Logo from "@/public/logo.svg"

import { auth, db } from '@/lib/firebase' // Added db import
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore' // Added Firestore methods
import toast, { Toaster } from 'react-hot-toast'

const S = `
  .auth-page { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; }
  .auth-left { background: #0F0F0F; position: relative; display: flex; flex-direction: column; justify-content: space-between; padding: 48px; overflow: hidden; }
  .auth-left-glow { position: absolute; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(255,92,26,0.18) 0%, transparent 70%); top: -100px; left: -100px; pointer-events: none; }
  .auth-left-glow2 { position: absolute; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(255,92,26,0.10) 0%, transparent 70%); bottom: -80px; right: -80px; pointer-events: none; }
  .auth-grid-lines { position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 60px 60px; }
  .auth-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; position: relative; z-index: 1; }
  .auth-logo-text { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; color: white; }
  .auth-logo-text span { color: #FF5C1A; }
  .auth-hero { position: relative; z-index: 1; }
  .auth-hero-label { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,92,26,0.15); border: 1px solid rgba(255,92,26,0.3); color: #FF5C1A; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; padding: 6px 12px; border-radius: 100px; margin-bottom: 24px; }
  .auth-hero-title { font-family: 'Syne', sans-serif; font-size: clamp(32px, 3.5vw, 48px); font-weight: 800; letter-spacing: -1.5px; color: white; line-height: 1.1; margin-bottom: 20px; }
  .auth-hero-title em { color: #FF5C1A; font-style: normal; }
  .auth-hero-sub { font-size: 16px; color: rgba(255,255,255,0.5); font-weight: 300; line-height: 1.75; max-width: 380px; margin-bottom: 40px; }
  .auth-features { display: flex; flex-direction: column; gap: 16px; margin-bottom: 48px; }
  .auth-feature { display: flex; align-items: flex-start; gap: 14px; padding: 16px; border-radius: 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); transition: background 0.2s; }
  .auth-feature:hover { background: rgba(255,255,255,0.07); }
  .feature-icon { width: 38px; height: 38px; border-radius: 10px; background: rgba(255,92,26,0.15); border: 1px solid rgba(255,92,26,0.25); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .feature-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: white; margin-bottom: 3px; }
  .feature-sub { font-size: 13px; color: rgba(255,255,255,0.45); font-weight: 300; }
  .auth-testi { position: relative; z-index: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; }
  .auth-testi-stars { display: flex; gap: 3px; margin-bottom: 12px; }
  .auth-testi-text { font-size: 14px; color: rgba(255,255,255,0.7); font-style: italic; font-weight: 300; line-height: 1.7; margin-bottom: 16px; }
  .auth-testi-author { display: flex; align-items: center; gap: 10px; }
  .auth-testi-avatar { width: 36px; height: 36px; border-radius: 50%; background: #FF5C1A; color: white; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; }
  .auth-testi-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: white; }
  .auth-testi-loc { font-size: 12px; color: rgba(255,255,255,0.4); }
  .auth-right { background: #FAFAF8; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 48px 64px; overflow-y: auto; }
  .auth-form-wrap { width: 100%; max-width: 400px; }
  .form-top { margin-bottom: 36px; }
  .form-title { font-family: 'Syne', sans-serif; font-size: 30px; font-weight: 800; letter-spacing: -1px; color: #0F0F0F; margin-bottom: 8px; }
  .form-sub { font-size: 15px; color: #6B6B6B; font-weight: 300; }
  .google-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; background: white; border: 1.5px solid #E8E6E1; border-radius: 12px; padding: 13px; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; color: #0F0F0F; cursor: pointer; transition: all 0.2s; margin-bottom: 24px; }
  .google-btn:hover:not(:disabled) { border-color: #0F0F0F; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
  .google-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .google-icon { width: 20px; height: 20px; }
  .divider { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
  .divider-line { flex: 1; height: 1px; background: #E8E6E1; }
  .divider-text { font-size: 12px; color: #AFAFAF; font-weight: 500; white-space: nowrap; }
  .field { margin-bottom: 18px; }
  .field-label { display: block; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #0F0F0F; margin-bottom: 7px; }
  .field-wrap { display: flex; align-items: center; gap: 10px; background: white; border: 1.5px solid #E8E6E1; border-radius: 12px; padding: 12px 16px; transition: border-color 0.2s; }
  .field-wrap:focus-within { border-color: #FF5C1A; box-shadow: 0 0 0 3px rgba(255,92,26,0.08); }
  .field-wrap input { flex: 1; border: none; outline: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 15px; color: #0F0F0F; }
  .field-wrap input::placeholder { color: #AFAFAF; }
  .field-icon { color: #AFAFAF; flex-shrink: 0; }
  .field-action { background: none; border: none; cursor: pointer; color: #AFAFAF; display: flex; padding: 0; }
  .field-action:hover { color: #6B6B6B; }
  .field-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 8px; }
  .remember-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; color: #6B6B6B; }
  .remember-box { width: 18px; height: 18px; border-radius: 5px; border: 1.5px solid #E8E6E1; background: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; cursor: pointer; }
  .remember-box.checked { background: #FF5C1A; border-color: #FF5C1A; }
  .forgot-link { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #FF5C1A; text-decoration: none; }
  .forgot-link:hover { text-decoration: underline; }
  .submit-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; background: #FF5C1A; color: white; font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 600; border: none; border-radius: 12px; padding: 14px; cursor: pointer; transition: all 0.2s; margin-bottom: 24px; }
  .submit-btn:hover:not(:disabled) { background: #FF7A40; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(255,92,26,0.25); }
  .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .form-footer { text-align: center; font-size: 14px; color: #6B6B6B; }
  .form-footer a { font-family: 'Syne', sans-serif; font-weight: 700; color: #FF5C1A; text-decoration: none; }
  .form-footer a:hover { text-decoration: underline; }
  .field-error { border-color: #EF4444 !important; }
  .error-msg { font-size: 12px; color: #EF4444; margin-top: 5px; }
  @media (max-width: 900px) {
    .auth-page { grid-template-columns: 1fr; }
    .auth-left { display: none; }
    .auth-right { padding: 40px 24px; min-height: 100vh; }
  }
`

export default function LoginPage() {
  const router = useRouter()

  const [loading, setLoading]           = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember]         = useState(false)
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [errors, setErrors]             = useState<{ email?: string; password?: string }>({})

  const handlePostLogin = async (uid: string, displayName?: string | null) => {
    try {
      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(db, 'users', uid))
      const userData = userDoc.data()
      const role = userData?.role || 'client' // Default to client if not found

      const redirect = sessionStorage.getItem('authRedirect')
      sessionStorage.removeItem('authRedirect')

      toast.success(`Welcome back${displayName ? `, ${displayName}` : ''}!`)

      setTimeout(() => {
        if (redirect) {
          router.push(redirect)
        } else {
          // Role-based redirection logic
          if (role === 'worker') {
            router.push('/worker/dashboard')
          } else {
            router.push('/dashboard')
          }
        }
      }, 600)
    } catch (error) {
      console.error("Error fetching user role:", error)
      router.push('/dashboard') // Fallback
    }
  }

  const validate = () => {
    const e: { email?: string; password?: string } = {}
    if (!email)                               e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email))   e.email    = 'Enter a valid email'
    if (!password)                            e.password = 'Password is required'
    else if (password.length < 6)           e.password = 'Must be at least 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      await handlePostLogin(result.user.uid, result.user.displayName)
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error('Google sign-in failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      await handlePostLogin(result.user.uid, result.user.displayName)
    } catch (err: any) {
      const code = err.code || ''
      let msg = 'Incorrect email or password. Please try again.'
      if (code === 'auth/user-not-found')      msg = 'No account found with this email.'
      if (code === 'auth/wrong-password')       msg = 'Incorrect password.'
      if (code === 'auth/invalid-credential')   msg = 'Incorrect email or password. Please try again.'
      if (code === 'auth/too-many-requests')    msg = 'Too many attempts. Please wait a moment.'
      if (code === 'auth/user-disabled')         msg = 'This account has been disabled. Contact support.'
      if (code === 'auth/invalid-email')         msg = 'Please enter a valid email address.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{S}</style>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <div className="auth-page">

        <div className="auth-left">
          <div className="auth-left-glow" />
          <div className="auth-left-glow2" />
          <div className="auth-grid-lines" />

          <Link href="/" className="auth-logo">
            <Image src={Logo} alt="FixMate logo" width={50} height={50} />
            <span className="auth-logo-text">Fix<span>Mate</span></span>
          </Link>

          <div className="auth-hero">
            <div className="auth-hero-label">
              <span style={{ width: 6, height: 6, background: '#FF5C1A', borderRadius: '50%', display: 'inline-block' }} />
              Trusted Worldwide
            </div>
            <h2 className="auth-hero-title">
              Welcome back<br />to <em>FixMate</em>
            </h2>
            <p className="auth-hero-sub">
              Your go-to platform for finding verified, skilled workers — from plumbers to electricians — anywhere in the world.
            </p>

            <div className="auth-features">
              {[
                { icon: <Zap size={18} color="#FF5C1A" />,    title: 'Book in Minutes',     sub: 'Find and book a verified worker in under 5 minutes'     },
                { icon: <Shield size={18} color="#FF5C1A" />, title: 'Verified & Safe',        sub: 'Every worker is ID-checked and background verified'      },
                { icon: <Star size={18} color="#FF5C1A" />,   title: 'Rated by Real Clients',  sub: 'Transparent reviews from real customers like you'        },
                { icon: <Wrench size={18} color="#FF5C1A" />, title: '60+ Service Categories', sub: 'From plumbing to carpentry — we have every skill covered' },
              ].map(f => (
                <div key={f.title} className="auth-feature">
                  <div className="feature-icon">{f.icon}</div>
                  <div>
                    <p className="feature-title">{f.title}</p>
                    <p className="feature-sub">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="auth-testi">
            <div className="auth-testi-stars">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} color="#F59E0B" fill="#F59E0B" />)}
            </div>
            <p className="auth-testi-text">
              &ldquo;FixMate found me a brilliant electrician within minutes. The platform is so easy to use and the worker was top notch.&rdquo;
            </p>
            <div className="auth-testi-author">
              <div className="auth-testi-avatar">SL</div>
              <div>
                <p className="auth-testi-name">Sophie Laurent</p>
                <p className="auth-testi-loc">Paris, France</p>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-wrap">

            <div className="form-top">
              <h1 className="form-title">Sign in</h1>
              <p className="form-sub">Enter your credentials to access your account</p>
            </div>

            {/* Google */}
            <button className="google-btn" onClick={handleGoogleLogin} disabled={loading}>
              <svg className="google-icon" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {loading ? 'Processing…' : 'Continue with Google'}
            </button>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">or sign in with email</span>
              <div className="divider-line" />
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="field">
                <label className="field-label">Email address</label>
                <div className={`field-wrap${errors.email ? ' field-error' : ''}`}>
                  <Mail size={17} className="field-icon" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    disabled={loading}
                    onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })) }}
                  />
                </div>
                {errors.email && <p className="error-msg">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="field">
                <label className="field-label">Password</label>
                <div className={`field-wrap${errors.password ? ' field-error' : ''}`}>
                  <Lock size={17} className="field-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    disabled={loading}
                    onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })) }}
                  />
                  <button type="button" className="field-action" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.password && <p className="error-msg">{errors.password}</p>}
              </div>

              {/* Remember / Forgot */}
              <div className="field-row">
                <label className="remember-label">
                  <div
                    className={`remember-box${remember ? ' checked' : ''}`}
                    onClick={() => setRemember(!remember)}
                  >
                    {remember && <span style={{ color: 'white', fontSize: 11 }}>✓</span>}
                  </div>
                  Remember me
                </label>
                <Link href="/forgot-password" className="forgot-link">Forgot password?</Link>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'} <ArrowRight size={17} />
              </button>
            </form>

            <p className="form-footer">
              Don&apos;t have an account?{' '}
              <Link href="/register">Create one free →</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}